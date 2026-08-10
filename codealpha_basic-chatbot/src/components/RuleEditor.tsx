import React, { useState } from 'react';
import { ChatRule, MatchingMode } from '../types';
import { processChatInput } from '../utils/chatbotEngine';
import { playSound } from '../utils/audio';
import { Plus, Trash2, Edit2, X, RotateCcw, Power, ArrowUp, ArrowDown, Sparkles, CheckCircle2, XCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RuleEditorProps {
  rules: ChatRule[];
  onAddRule: (rule: Omit<ChatRule, 'id'>) => void;
  onUpdateRule: (id: string, updated: Partial<ChatRule>) => void;
  onDeleteRule: (id: string) => void;
  onToggleRule: (id: string) => void;
  onMoveRule: (index: number, direction: 'up' | 'down') => void;
  onResetRules: () => void;
}

export const RuleEditor: React.FC<RuleEditorProps> = ({
  rules,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onToggleRule,
  onMoveRule,
  onResetRules,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Sandbox Tester Input
  const [testInput, setTestInput] = useState('hello how are you?');

  // Form state for creating new rule
  const [newCategory, setNewCategory] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [newMatchMode, setNewMatchMode] = useState<MatchingMode>('contains');

  // Edit form state
  const [editCategory, setEditCategory] = useState('');
  const [editKeywords, setEditKeywords] = useState('');
  const [editResponse, setEditResponse] = useState('');
  const [editMatchMode, setEditMatchMode] = useState<MatchingMode>('contains');

  // Evaluate test input live against rules
  const testResult = processChatInput(testInput, rules);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywords.trim() || !newResponse.trim()) return;

    playSound('click');
    const keywordsArray = newKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    onAddRule({
      category: newCategory.trim() || 'Custom Rule',
      keywords: keywordsArray,
      response: newResponse.trim(),
      matchMode: newMatchMode,
      enabled: true,
    });

    setNewCategory('');
    setNewKeywords('');
    setNewResponse('');
    setNewMatchMode('contains');
    setIsAdding(false);
  };

  const startEdit = (rule: ChatRule) => {
    playSound('click');
    setEditingId(rule.id);
    setEditCategory(rule.category || '');
    setEditKeywords(rule.keywords.join(', '));
    setEditResponse(rule.response);
    setEditMatchMode(rule.matchMode);
  };

  const handleEditSave = (id: string) => {
    playSound('click');
    const keywordsArray = editKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    onUpdateRule(id, {
      category: editCategory.trim() || 'Custom Rule',
      keywords: keywordsArray,
      response: editResponse.trim(),
      matchMode: editMatchMode,
    });

    setEditingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-6">
      {/* Top Banner & Info */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Rule Priority Pipeline</h2>
            <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              Sequential if-elif-else
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            The chatbot tests rules in sequence from top to bottom. The first matching rule returns a reply!
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              playSound('reset');
              onResetRules();
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={() => {
              playSound('click');
              setIsAdding(!isAdding);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center space-x-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Rule</span>
          </button>
        </div>
      </div>

      {/* Live Sandbox Tester */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl border border-indigo-900/50 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Live Rule Test Sandbox</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Evaluating {rules.filter((r) => r.enabled).length} active rule(s)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Type test string to preview matching rule..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="w-full sm:w-auto px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-xs flex items-center space-x-2">
            <span className="text-slate-400">Matched:</span>
            <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
              testResult.ruleLabel.startsWith('ELSE')
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {testResult.ruleLabel}
            </span>
          </div>
        </div>

        <div className="text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300 flex items-center justify-between">
          <span className="font-mono text-emerald-400">"{testResult.response}"</span>
          <span className="text-[10px] text-slate-500 uppercase font-bold">Output Reply</span>
        </div>
      </div>

      {/* Add Rule Drawer Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateSubmit}
            className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-4 shadow-2xs overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Create New Rule</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rule Category / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Greetings, Jokes, FAQs"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Matching Mode
                </label>
                <select
                  value={newMatchMode}
                  onChange={(e) => setNewMatchMode(e.target.value as MatchingMode)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="contains">Contains Keyword (flexible)</option>
                  <option value="equals">Exact Match Only</option>
                  <option value="startsWith">Starts With Keyword</option>
                  <option value="endsWith">Ends With Keyword</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trigger Keywords (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. hello, hi, hey, good morning"
                value={newKeywords}
                onChange={(e) => setNewKeywords(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bot Response
              </label>
              <textarea
                placeholder="Type the message reply..."
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                required
                rows={2}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-2xs"
              >
                Save Rule
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Rules Priority List */}
      <div className="space-y-3">
        {rules.map((rule, index) => {
          const conditionType = index === 0 ? 'IF' : 'ELIF';
          const isEditing = editingId === rule.id;
          const isMatchedInTest = testResult.matchedRule?.id === rule.id;

          return (
            <motion.div
              key={rule.id}
              layout
              className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all shadow-2xs ${
                isMatchedInTest
                  ? 'border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-400/20 shadow-emerald-50'
                  : rule.enabled
                  ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-900/50'
              }`}
            >
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Condition Type Tag & Info */}
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex flex-col items-center space-y-1">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                        conditionType === 'IF'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 dark:bg-slate-800 text-white'
                      }`}
                    >
                      {conditionType}
                    </span>
                    <div className="flex flex-col space-y-0.5">
                      <button
                        disabled={index === 0}
                        onClick={() => {
                          playSound('click');
                          onMoveRule(index, 'up');
                        }}
                        className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-20 text-[10px]"
                        title="Move Rule Up (Higher Priority)"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={index === rules.length - 1}
                        onClick={() => {
                          playSound('click');
                          onMoveRule(index, 'down');
                        }}
                        className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-20 text-[10px]"
                        title="Move Rule Down (Lower Priority)"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          placeholder="Category"
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-2.5 py-1 text-xs"
                        />
                        <select
                          value={editMatchMode}
                          onChange={(e) => setEditMatchMode(e.target.value as MatchingMode)}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-2.5 py-1 text-xs"
                        >
                          <option value="contains">Contains</option>
                          <option value="equals">Exact Equals</option>
                          <option value="startsWith">Starts With</option>
                          <option value="endsWith">Ends With</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        value={editKeywords}
                        onChange={(e) => setEditKeywords(e.target.value)}
                        placeholder="Keywords (comma separated)"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-2.5 py-1 text-xs"
                      />

                      <textarea
                        value={editResponse}
                        onChange={(e) => setEditResponse(e.target.value)}
                        rows={2}
                        placeholder="Response"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-2.5 py-1 text-xs"
                      />

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditSave(rule.id)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                          {rule.category || 'Rule ' + (index + 1)}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                          mode: {rule.matchMode}
                        </span>
                        {isMatchedInTest && (
                          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Matches Sandbox Input</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Keywords:</span>
                        {rule.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800"
                          >
                            "{kw}"
                          </span>
                        ))}
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <span className="font-semibold text-slate-400 dark:text-slate-500 text-[10px] uppercase block">
                          Response:
                        </span>
                        <span>"{rule.response}"</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                {!isEditing && (
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        playSound('click');
                        onToggleRule(rule.id);
                      }}
                      className={`p-2 rounded-xl border transition-all ${
                        rule.enabled
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                      title={rule.enabled ? 'Disable Rule' : 'Enable Rule'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEdit(rule)}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Edit Rule"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        playSound('click');
                        onDeleteRule(rule.id);
                      }}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* ELSE Fallback Rule (static visually) */}
        <div
          className={`rounded-2xl border p-4 shadow-2xs flex items-center space-x-3 ${
            testResult.ruleLabel.startsWith('ELSE')
              ? 'bg-amber-100/90 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/20'
              : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50'
          }`}
        >
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
            ELSE
          </span>
          <div className="text-xs text-amber-900 dark:text-amber-200 flex-1">
            <span className="font-bold">Default Fallback:</span> Triggered if no IF or ELIF condition above matches the user's input.
          </div>
        </div>
      </div>
    </div>
  );
};
