import React from 'react';
import { ChatRule, TraceStep } from '../types';
import { CheckCircle2, XCircle, ArrowDown, Play, Filter, GitBranch, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface VisualFlowchartProps {
  rules: ChatRule[];
  lastTraceSteps?: TraceStep[];
  lastMessageText?: string;
  onSelectRule?: (ruleId: string) => void;
}

export const VisualFlowchart: React.FC<VisualFlowchartProps> = ({
  rules,
  lastTraceSteps = [],
  lastMessageText,
  onSelectRule,
}) => {
  const enabledRules = rules.filter((r) => r.enabled);

  // Map steps by rule index
  const stepMap = new Map<number, TraceStep>();
  lastTraceSteps.forEach((s) => stepMap.set(s.stepNumber, s));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-6">
      {/* Flowchart Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Rule Decision Tree</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualizing how <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">if-elif-else</span> evaluates inputs in order
            </p>
          </div>
        </div>

        {lastMessageText ? (
          <div className="text-xs bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-slate-500 dark:text-slate-400">Evaluated:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">"{lastMessageText}"</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">Send a chat message to trace execution</div>
        )}
      </div>

      {/* Decision Tree Nodes */}
      <div className="flex flex-col items-center space-y-3 relative max-w-xl mx-auto py-2">
        {/* Step 1: User Input Node */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm text-center border border-slate-800 flex flex-col items-center justify-center"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">INPUT STATEMENT</span>
          <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
            user_input = "{lastMessageText || 'hello'}"
          </span>
          <span className="text-[10px] text-slate-400 mt-1">
            Normalized: <code className="text-slate-200">user_input.strip().lower()</code>
          </span>
        </motion.div>

        {/* Connecting Arrow */}
        <div className="flex flex-col items-center text-slate-300 my-1">
          <div className="w-0.5 h-4 bg-slate-300" />
          <ArrowDown className="w-4 h-4 text-slate-400 -mt-1" />
        </div>

        {/* Rule Condition Branches */}
        {enabledRules.map((rule, idx) => {
          const stepNum = idx + 1;
          const traceStep = stepMap.get(stepNum);
          const isMatch = traceStep?.isMatch ?? false;
          const isEvaluated = Boolean(traceStep);
          const conditionType = idx === 0 ? 'IF' : 'ELIF';

          return (
            <React.Fragment key={rule.id}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => onSelectRule && onSelectRule(rule.id)}
                className={`w-full p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  isEvaluated && isMatch
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-400/20 shadow-emerald-100'
                    : isEvaluated
                    ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                        conditionType === 'IF'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 dark:bg-slate-700 text-white'
                      }`}
                    >
                      {conditionType}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {rule.category || `Rule ${stepNum}`}
                    </span>
                  </div>

                  {isEvaluated && (
                    <span
                      className={`flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        isMatch
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{isMatch ? 'MATCH (TRUE)' : 'FALSE'}</span>
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700 mb-2">
                  contains([
                  {rule.keywords.map((k) => `"${k}"`).join(', ')}
                  ])
                </div>

                {isMatch && (
                  <div className="mt-2 text-xs font-medium bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <span>Return Output: "{rule.response}"</span>
                    <span className="text-[10px] uppercase font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                      Short-Circuit Return
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Connecting Arrow */}
              {idx < enabledRules.length - 1 && !isMatch && (
                <div className="flex flex-col items-center text-slate-300 my-1">
                  <div className="w-0.5 h-4 bg-slate-300" />
                  <ArrowDown className="w-4 h-4 text-slate-400 -mt-1" />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Connecting Arrow to ELSE */}
        {(!lastTraceSteps.some((s) => s.isMatch && s.conditionType !== 'ELSE') ||
          enabledRules.length === 0) && (
          <div className="flex flex-col items-center text-slate-300 my-1">
            <div className="w-0.5 h-4 bg-slate-300" />
            <ArrowDown className="w-4 h-4 text-slate-400 -mt-1" />
          </div>
        )}

        {/* Step Final: ELSE Condition */}
        <div
          className={`w-full p-4 rounded-2xl border transition-all shadow-2xs ${
            stepMap.get(enabledRules.length + 1)?.conditionType === 'ELSE'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-600 text-white">
              ELSE
            </span>
            <span className="text-xs font-semibold text-amber-800">Default Catch-All</span>
          </div>
          <p className="text-xs text-amber-900 mt-1">
            If no previous <code className="font-bold">if</code> or <code className="font-bold">elif</code> condition evaluates to true, return fallback statement.
          </p>
        </div>
      </div>
    </div>
  );
};
