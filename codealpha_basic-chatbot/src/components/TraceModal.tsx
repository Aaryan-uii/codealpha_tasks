import React from 'react';
import { TraceStep } from '../types';
import { X, CheckCircle2, XCircle, Code, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TraceStep[];
  messageText: string;
  ruleLabel?: string;
}

export const TraceModal: React.FC<TraceModalProps> = ({
  isOpen,
  onClose,
  steps,
  messageText,
  ruleLabel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-4"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Play className="w-4 h-4 fill-indigo-600 dark:fill-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rule Logic Execution Trace</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Input: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">"{messageText}"</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps List */}
          <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
            {steps.map((step) => (
              <div
                key={step.stepNumber}
                className={`p-3 rounded-xl border text-xs ${
                  step.isMatch
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
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
                <p className="text-[11px] text-slate-600 pl-1">{step.explanation}</p>
              </div>
            ))}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-600">
              Result: <span className="text-indigo-600">{ruleLabel}</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
