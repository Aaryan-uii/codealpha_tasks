import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, TraceStep, BotMood, ColorScheme } from '../types';
import { BotAvatar } from './BotAvatar';
import { playSound } from '../utils/audio';
import { Send, User, Sparkles, ChevronRight, CheckCircle2, XCircle, Code, CornerDownLeft, Play, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSelectTrace: (steps: TraceStep[], messageText: string, ruleLabel?: string) => void;
  isEvaluating?: boolean;
  colorScheme?: ColorScheme;
}

const EMOJI_PALETTE = [
  '🙏', '👋', '😊', '😂', '👍', '❤️', '🎉', '😎', '🤖', '🔥', 
  '✨', '🙌', '🤝', '🤔', '💯', '😃', '😍', '🤩', '🌸', '💡', '💬', '🇮🇳'
];

const USER_BUBBLE_BG: Record<ColorScheme, string> = {
  indigo: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white',
  blue: 'bg-gradient-to-r from-blue-600 to-cyan-700 text-white',
  emerald: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
  rose: 'bg-gradient-to-r from-rose-600 to-pink-700 text-white',
  amber: 'bg-gradient-to-r from-amber-600 to-orange-700 text-white',
};

const USER_AVATAR_BG: Record<ColorScheme, string> = {
  indigo: 'bg-indigo-600',
  blue: 'bg-blue-600',
  emerald: 'bg-emerald-600',
  rose: 'bg-rose-600',
  amber: 'bg-amber-600',
};

const SEND_BTN_BG: Record<ColorScheme, string> = {
  indigo: 'bg-indigo-600 hover:bg-indigo-700',
  blue: 'bg-blue-600 hover:bg-blue-700',
  emerald: 'bg-emerald-600 hover:bg-emerald-700',
  rose: 'bg-rose-600 hover:bg-rose-700',
  amber: 'bg-amber-600 hover:bg-amber-700',
};

const FOCUS_RING_BORDER: Record<ColorScheme, string> = {
  indigo: 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50',
  blue: 'focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50',
  emerald: 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/50',
  rose: 'focus:border-rose-500 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/50',
  amber: 'focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/50',
};

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  onSelectTrace,
  isEvaluating = false,
  colorScheme = 'indigo',
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Latest bot mood based on last bot message
  const lastBotMsg = [...messages].reverse().find((m) => m.sender === 'bot');
  const currentMood: BotMood = isEvaluating
    ? 'thinking'
    : lastBotMsg?.botMood || 'idle';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isEvaluating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    playSound('send');
    onSendMessage(inputText);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleInsertEmoji = (emoji: string) => {
    playSound('click');
    setInputText((prev) => prev + emoji);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto p-2 sm:p-4">
      {/* Bot Hero Status Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3 sm:p-4 rounded-2xl border border-indigo-900/50 shadow-md mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <BotAvatar mood={currentMood} size="md" pulse={isEvaluating} />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm sm:text-base text-white tracking-tight">
                PyBot v1.0
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Rule Engine Active
              </span>
            </div>
            <p className="text-xs text-slate-300 hidden sm:block">
              {isEvaluating
                ? 'Evaluating input through sequential if-elif conditions...'
                : currentMood === 'confused'
                ? 'Fallback executed (ELSE condition triggered)'
                : currentMood === 'happy' || currentMood === 'waving'
                ? 'Matched rule condition successfully!'
                : 'Ready for input statement'}
            </p>
          </div>
        </div>

        {/* Quick Mode Indicator */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-slate-300 text-[11px]">loop: while True</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 space-y-4 shadow-inner">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
            <BotAvatar mood="happy" size="lg" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-3 mb-1">
              PyBot Rule-Based Assistant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
              Type any message like <code className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1 rounded">"kaise ho"</code>, <code className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1 rounded">"kya kr rhe"</code>, <code className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1 rounded">"namaste"</code>, or <code className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1 rounded">"hello"</code> to evaluate the conditional pipeline.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-2.5 sm:gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              {msg.sender === 'user' ? (
                <div className={`w-8 h-8 rounded-2xl ${USER_AVATAR_BG[colorScheme]} text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs`}>
                  <User className="w-4 h-4" />
                </div>
              ) : (
                <BotAvatar mood={msg.botMood || 'idle'} size="sm" />
              )}

              {/* Message Content Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] space-y-1.5 ${
                  msg.sender === 'user' ? 'items-end text-right' : 'items-start text-left'
                }`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? `${USER_BUBBLE_BG[colorScheme]} rounded-tr-none font-medium`
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Bot Rule Tag and Logic Trace button */}
                {msg.sender === 'bot' && (
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-semibold rounded-lg border ${
                        msg.ruleLabel?.startsWith('ELSE')
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {msg.ruleLabel?.startsWith('ELSE') ? (
                        <XCircle className="w-3 h-3 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      )}
                      <span>{msg.ruleLabel}</span>
                    </span>

                    {msg.executionSteps && msg.executionSteps.length > 0 && (
                      <button
                        onClick={() =>
                          onSelectTrace(msg.executionSteps!, msg.text, msg.ruleLabel)
                        }
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold flex items-center space-x-0.5 transition-colors bg-indigo-50/80 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900"
                      >
                        <span>View Logic Trace</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}

                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{msg.timestamp}</span>
                  </div>
                )}

                {msg.sender === 'user' && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right">{msg.timestamp}</div>
                )}
              </div>
            </motion.div>
          ))
        )}

        {/* Live Typing Evaluator */}
        {isEvaluating && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 p-3 bg-indigo-50/80 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl max-w-xs text-indigo-900 dark:text-indigo-200"
          >
            <BotAvatar mood="thinking" size="sm" pulse />
            <div className="text-xs font-medium">
              Evaluating if-elif rules...
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Emoji Palette Bar */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span>Select Emoji to Send:</span>
              </span>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
              >
                Close ✕
              </button>
            </div>
            <div className="grid grid-cols-11 sm:grid-cols-11 gap-1.5 max-h-32 overflow-y-auto">
              {EMOJI_PALETTE.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertEmoji(emoji)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:scale-110 text-base flex items-center justify-center transition-all active:scale-95 shadow-2xs"
                  title={`Insert ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Form with Emoji Picker toggle */}
      <form onSubmit={handleSubmit} className="mt-2 relative flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='Type e.g. "namaste 🙏", "kaise ho", "kya kr rhe", "hello"...'
            className={`w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 ${FOCUS_RING_BORDER[colorScheme]} rounded-2xl pl-4 pr-11 py-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all shadow-2xs font-medium`}
          />
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setShowEmojiPicker(!showEmojiPicker);
            }}
            className={`absolute right-3 p-1.5 rounded-xl transition-all ${
              showEmojiPicker
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Emoji Picker"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`${SEND_BTN_BG[colorScheme]} disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 flex-shrink-0`}
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
