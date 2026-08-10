import React, { useState } from 'react';
import { ChatRule, TraceStep } from '../types';
import { generatePythonCode } from '../utils/chatbotEngine';
import { playSound } from '../utils/audio';
import { Copy, Check, Terminal, Play, CheckCircle2, XCircle, Download, Code2 } from 'lucide-react';

interface CodeInspectorProps {
  rules: ChatRule[];
  lastTraceSteps?: TraceStep[];
  lastMessageText?: string;
  lastRuleLabel?: string;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({
  rules,
  lastTraceSteps,
  lastMessageText,
  lastRuleLabel,
}) => {
  const [copied, setCopied] = useState(false);
  const [codeLang, setCodeLang] = useState<'python' | 'ts'>('python');

  const pythonCode = generatePythonCode(rules);

  const tsCode = `// TypeScript / JavaScript Rule Engine Implementation
// Key Concepts: functions, if-elif logic, loops, input/output

export function getBotReply(userInput: string, rules: ChatRule[]): string {
  // Normalize user input
  const text = userInput.trim().toLowerCase();

  // Evaluate enabled rules sequentially
  for (const rule of rules.filter(r => r.enabled)) {
    const isMatch = rule.keywords.some(keyword => {
      const kw = keyword.toLowerCase();
      if (rule.matchMode === 'equals') return text === kw;
      if (rule.matchMode === 'startsWith') return text.startsWith(kw);
      if (rule.matchMode === 'endsWith') return text.endsWith(kw);
      return text.includes(kw); // default 'contains'
    });

    if (isMatch) {
      return rule.response; // Short-circuit exit
    }
  }

  // Fallback (ELSE condition)
  return "I'm sorry, I don't understand that yet. Try asking 'hello' or 'how are you'!";
}
`;

  const handleCopy = () => {
    playSound('click');
    const textToCopy = codeLang === 'python' ? pythonCode : tsCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPy = () => {
    playSound('click');
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'chatbot.py');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-6">
      {/* Educational Concept Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Concept 1</div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">if-elif-else</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Branching conditions evaluated in strict order.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Concept 2</div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">Functions</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1"><code className="font-mono text-indigo-600 dark:text-indigo-400">def get_bot_reply()</code> modular logic.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Concept 3</div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">Loops</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1"><code className="font-mono text-indigo-600 dark:text-indigo-400">while True</code> interactive CLI loop.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Concept 4</div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">Input / Output</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1"><code className="font-mono text-indigo-600 dark:text-indigo-400">input()</code> and <code className="font-mono text-indigo-600 dark:text-indigo-400">print()</code> strings.</p>
        </div>
      </div>

      {/* Logic Execution Trace for Latest Message */}
      {lastTraceSteps && lastTraceSteps.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                <span>Trace Output for Latest Message</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Input: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200 font-bold">"{lastMessageText}"</span>
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {lastRuleLabel}
            </span>
          </div>

          <div className="space-y-2.5">
            {lastTraceSteps.map((step) => (
              <div
                key={step.stepNumber}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  step.isMatch
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        step.conditionType === 'IF'
                          ? 'bg-indigo-600 text-white'
                          : step.conditionType === 'ELIF'
                          ? 'bg-slate-700 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      Step {step.stepNumber}: {step.conditionType}
                    </span>
                    <span className="font-mono text-[11px] truncate max-w-xs">{step.conditionText}</span>
                  </div>
                  {step.isMatch ? (
                    <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>TRUE</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-slate-400 font-medium">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>FALSE</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] opacity-90 pl-1">{step.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Editor Preview */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        {/* Code Header */}
        <div className="bg-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => {
                  playSound('click');
                  setCodeLang('python');
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  codeLang === 'python'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Python Code (.py)
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  setCodeLang('ts');
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  codeLang === 'ts'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                TypeScript Code
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {codeLang === 'python' && (
              <button
                onClick={handleDownloadPy}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-2xs"
                title="Download runnable python script"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors border border-slate-600"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Body */}
        <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed selection:bg-indigo-500 selection:text-white">
          <code>{codeLang === 'python' ? pythonCode : tsCode}</code>
        </pre>
      </div>
    </div>
  );
};
