import React, { useState, useEffect } from 'react';
import { ChatMessage, ChatRule, TraceStep, ChatbotStats, ColorScheme } from './types';
import { INITIAL_RULES } from './data/defaultRules';
import { processChatInput } from './utils/chatbotEngine';
import { isSoundEnabled, setSoundEnabled, playSound } from './utils/audio';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { RuleEditor } from './components/RuleEditor';
import { CodeInspector } from './components/CodeInspector';
import { VisualFlowchart } from './components/VisualFlowchart';
import { TraceModal } from './components/TraceModal';

const LOCAL_STORAGE_RULES_KEY = 'chatbot_rules_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'split' | 'rules' | 'code'>('chat');
  const [soundMuted, setSoundMuted] = useState(!isSoundEnabled());
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Color scheme state
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    try {
      const saved = localStorage.getItem('chatbot_color_scheme');
      if (saved && ['indigo', 'blue', 'emerald', 'rose', 'amber'].includes(saved)) {
        return saved as ColorScheme;
      }
    } catch (e) {
      console.error('Failed to parse color scheme setting', e);
    }
    return 'indigo';
  });

  useEffect(() => {
    try {
      localStorage.setItem('chatbot_color_scheme', colorScheme);
    } catch (e) {
      console.error('Failed to save color scheme setting', e);
    }
  }, [colorScheme]);

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('chatbot_dark_mode');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved dark mode setting', e);
    }
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem('chatbot_dark_mode', JSON.stringify(darkMode));
    } catch (e) {
      console.error('Failed to save dark mode setting', e);
    }
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    playSound('click');
    setDarkMode((prev) => !prev);
  };

  // Load rules from localStorage or default
  const [rules, setRules] = useState<ChatRule[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RULES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved rules', e);
    }
    return INITIAL_RULES;
  });

  // Analytics stats
  const [stats, setStats] = useState<ChatbotStats>({
    totalMessagesSent: 1,
    successfulMatches: 1,
    fallbackCount: 0,
  });

  // Save rules when changed
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_RULES_KEY, JSON.stringify(rules));
    } catch (e) {
      console.error('Failed to save rules to localStorage', e);
    }
  }, [rules]);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'Namaste! 🙏',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ruleLabel: 'IF [Rule 1: Greetings / Namaste]',
      botMood: 'happy',
      executionSteps: [
        {
          stepNumber: 1,
          conditionType: 'IF',
          conditionText: 'Initialization Welcome Message',
          evaluatedInput: 'System Init',
          isMatch: true,
          explanation: 'Default greeting message displayed on startup.',
        },
      ],
    },
  ]);

  // Modal trace state
  const [activeTrace, setActiveTrace] = useState<{
    steps: TraceStep[];
    messageText: string;
    ruleLabel?: string;
  } | null>(null);

  // Latest message trace for Flowchart & Code Inspector tabs
  const [latestTrace, setLatestTrace] = useState<{
    steps: TraceStep[];
    messageText: string;
    ruleLabel?: string;
  }>({
    steps: [
      {
        stepNumber: 1,
        conditionType: 'IF',
        conditionText: 'IF input contains ("hello" OR "hi" OR "hey")',
        evaluatedInput: 'hello',
        isMatch: true,
        explanation: 'Matched keyword "hello". Returned greeting reply.',
      },
    ],
    messageText: 'hello',
    ruleLabel: 'IF [Rule 1: Greetings]',
  });

  const handleToggleSound = () => {
    const nextState = !soundMuted;
    setSoundMuted(nextState);
    setSoundEnabled(!nextState);
    if (!nextState) {
      playSound('click');
    }
  };

  const handleSendMessage = async (userText: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsEvaluating(true);

    const result = processChatInput(userText, rules);

    // If a rule matches, use the rule's response directly
    if (result.matchedRule) {
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          sender: 'bot',
          text: result.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          matchedRuleId: result.matchedRule?.id || null,
          ruleLabel: result.ruleLabel,
          executionSteps: result.traceSteps,
          botMood: result.botMood,
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsEvaluating(false);
        playSound('match');

        setLatestTrace({
          steps: result.traceSteps,
          messageText: userText,
          ruleLabel: result.ruleLabel,
        });

        setStats((prev) => ({
          totalMessagesSent: prev.totalMessagesSent + 1,
          successfulMatches: prev.successfulMatches + 1,
          fallbackCount: prev.fallbackCount,
        }));
      }, 350);
      return;
    }

    // Otherwise (ELSE branch for general questions), call Gemini AI API!
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-6),
        }),
      });

      const data = await response.json();
      const aiReply = data.reply || result.response;

      const aiTraceSteps: TraceStep[] = [
        ...result.traceSteps.slice(0, -1),
        {
          stepNumber: result.traceSteps.length,
          conditionType: 'ELSE',
          conditionText: 'ELSE (Gemini AI Smart Assistant)',
          evaluatedInput: userText,
          isMatch: true,
          explanation: 'No predefined IF/ELIF rule matched. Querying Gemini AI Assistant to answer normal user question.',
        },
      ];

      const botMessage: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedRuleId: null,
        ruleLabel: 'ELSE [Gemini AI Assistant]',
        executionSteps: aiTraceSteps,
        botMood: 'happy',
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsEvaluating(false);
      playSound('match');

      setLatestTrace({
        steps: aiTraceSteps,
        messageText: userText,
        ruleLabel: 'ELSE [Gemini AI Assistant]',
      });

      setStats((prev) => ({
        totalMessagesSent: prev.totalMessagesSent + 1,
        successfulMatches: prev.successfulMatches + 1,
        fallbackCount: prev.fallbackCount,
      }));
    } catch (err) {
      console.error('Failed to get AI response:', err);
      // Fallback to default rule response if network/server issue
      const botMessage: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedRuleId: null,
        ruleLabel: result.ruleLabel,
        executionSteps: result.traceSteps,
        botMood: result.botMood,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsEvaluating(false);
      playSound('fallback');

      setLatestTrace({
        steps: result.traceSteps,
        messageText: userText,
        ruleLabel: result.ruleLabel,
      });

      setStats((prev) => ({
        totalMessagesSent: prev.totalMessagesSent + 1,
        successfulMatches: prev.successfulMatches,
        fallbackCount: prev.fallbackCount + 1,
      }));
    }
  };

  const handleResetRules = () => {
    setRules(INITIAL_RULES);
    localStorage.removeItem(LOCAL_STORAGE_RULES_KEY);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleExportChat = () => {
    playSound('click');
    if (messages.length === 0) return;

    const exportData = {
      app: 'PyBot Chatbot',
      exportedAt: new Date().toISOString(),
      totalMessages: messages.length,
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp,
        ruleLabel: m.ruleLabel || null,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat_history_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Rule Editing Callbacks
  const handleAddRule = (newRule: Omit<ChatRule, 'id'>) => {
    const ruleWithId: ChatRule = {
      ...newRule,
      id: `rule-${Date.now()}`,
    };
    setRules((prev) => [...prev, ruleWithId]);
  };

  const handleUpdateRule = (id: string, updated: Partial<ChatRule>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const handleMoveRule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === rules.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newRules = [...rules];
    const [moved] = newRules.splice(index, 1);
    newRules.splice(targetIndex, 0, moved);
    setRules(newRules);
  };

  const activeRuleCount = rules.filter((r) => r.enabled).length;

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col transition-colors duration-200 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-800'}`}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRuleCount={activeRuleCount}
        totalRuleCount={rules.length}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        colorScheme={colorScheme}
        onSelectColorScheme={setColorScheme}
        onResetRules={handleResetRules}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
        hasMessages={messages.length > 0}
        stats={{
          total: stats.totalMessagesSent,
          matched: stats.successfulMatches,
          fallback: stats.fallbackCount,
        }}
      />

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'chat' && (
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            onSelectTrace={(steps, messageText, ruleLabel) =>
              setActiveTrace({ steps, messageText, ruleLabel })
            }
            isEvaluating={isEvaluating}
            colorScheme={colorScheme}
          />
        )}

        {activeTab === 'split' && (
          <div className="max-w-7xl mx-auto p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-5rem)]">
            <div className="h-full overflow-hidden flex flex-col">
              <ChatWindow
                messages={messages}
                onSendMessage={handleSendMessage}
                onSelectTrace={(steps, messageText, ruleLabel) =>
                  setActiveTrace({ steps, messageText, ruleLabel })
                }
                isEvaluating={isEvaluating}
                colorScheme={colorScheme}
              />
            </div>
            <div className="h-full overflow-y-auto">
              <VisualFlowchart
                rules={rules}
                lastTraceSteps={latestTrace.steps}
                lastMessageText={latestTrace.messageText}
                onSelectRule={() => setActiveTab('rules')}
              />
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <RuleEditor
            rules={rules}
            onAddRule={handleAddRule}
            onUpdateRule={handleUpdateRule}
            onDeleteRule={handleDeleteRule}
            onToggleRule={handleToggleRule}
            onMoveRule={handleMoveRule}
            onResetRules={handleResetRules}
          />
        )}

        {activeTab === 'code' && (
          <CodeInspector
            rules={rules}
            lastTraceSteps={latestTrace.steps}
            lastMessageText={latestTrace.messageText}
            lastRuleLabel={latestTrace.ruleLabel}
          />
        )}
      </main>

      <TraceModal
        isOpen={Boolean(activeTrace)}
        onClose={() => setActiveTrace(null)}
        steps={activeTrace?.steps || []}
        messageText={activeTrace?.messageText || ''}
        ruleLabel={activeTrace?.ruleLabel}
      />
    </div>
  );
}
