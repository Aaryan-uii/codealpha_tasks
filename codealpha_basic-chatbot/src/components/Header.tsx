import React, { useState } from 'react';
import { MessageSquare, Sliders, Code2, Bot, RotateCcw, Volume2, VolumeX, GitBranch, Sun, Moon, Download, Palette, Check } from 'lucide-react';
import { playSound } from '../utils/audio';
import { ColorScheme } from '../types';

interface HeaderProps {
  activeTab: 'chat' | 'split' | 'rules' | 'code';
  setActiveTab: (tab: 'chat' | 'split' | 'rules' | 'code') => void;
  activeRuleCount: number;
  totalRuleCount: number;
  soundMuted: boolean;
  onToggleSound: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  colorScheme: ColorScheme;
  onSelectColorScheme: (scheme: ColorScheme) => void;
  onResetRules: () => void;
  onClearChat: () => void;
  onExportChat: () => void;
  hasMessages?: boolean;
  stats?: {
    total: number;
    matched: number;
    fallback: number;
  };
}

const THEME_OPTIONS: Array<{ id: ColorScheme; label: string; bgClass: string }> = [
  { id: 'indigo', label: 'Indigo Classic', bgClass: 'bg-indigo-600' },
  { id: 'blue', label: 'Professional Blue', bgClass: 'bg-blue-600' },
  { id: 'emerald', label: 'Vibrant Green', bgClass: 'bg-emerald-600' },
  { id: 'rose', label: 'Sunset Rose', bgClass: 'bg-rose-600' },
  { id: 'amber', label: 'Warm Amber', bgClass: 'bg-amber-600' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeRuleCount,
  totalRuleCount,
  soundMuted,
  onToggleSound,
  darkMode,
  onToggleDarkMode,
  colorScheme,
  onSelectColorScheme,
  onResetRules,
  onClearChat,
  onExportChat,
  hasMessages = true,
  stats,
}) => {
  const [showThemePicker, setShowThemePicker] = useState(false);

  const matchRate =
    stats && stats.total > 0
      ? Math.round((stats.matched / stats.total) * 100)
      : 100;

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-xl shadow-xs flex items-center justify-center">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">Basic Chatbot</h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Hinglish + English Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
                Supports: "kaise ho", "kya kr rhe", "namaste", "bye" & custom if-elif rules
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                playSound('click');
                setActiveTab('chat');
              }}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                setActiveTab('split');
              }}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'split'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Split View: Chat + Live Decision Tree"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Flowchart View</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                setActiveTab('rules');
              }}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'rules'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Rules ({activeRuleCount})</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                setActiveTab('code');
              }}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Python Code</span>
              <span className="md:hidden">Code</span>
            </button>
          </div>

          {/* Actions & Audio/Dark Toggle */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {stats && stats.total > 0 && (
              <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-400 dark:text-slate-400 font-medium">Match Rate:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{matchRate}%</span>
              </div>
            )}

            {/* Color Scheme Picker */}
            <div className="relative">
              <button
                onClick={() => {
                  playSound('click');
                  setShowThemePicker((prev) => !prev);
                }}
                title="Change Chat Bubble Theme"
                className="p-2 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 flex items-center space-x-1"
              >
                <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </button>

              {showThemePicker && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 px-2.5 py-1">
                    Bubble Color Scheme
                  </div>
                  {THEME_OPTIONS.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        playSound('click');
                        onSelectColorScheme(theme.id);
                        setShowThemePicker(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                        colorScheme === theme.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-3.5 h-3.5 rounded-full ${theme.bgClass} shadow-xs inline-block`} />
                        <span>{theme.label}</span>
                      </div>
                      {colorScheme === theme.id && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onToggleDarkMode}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={onToggleSound}
              title={soundMuted ? 'Enable Sound FX' : 'Mute Sound FX'}
              className="p-2 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </button>

            <button
              onClick={onExportChat}
              disabled={!hasMessages}
              title={hasMessages ? "Export chat history to JSON file" : "No chat history to export"}
              className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 rounded-xl transition-colors border border-indigo-200 dark:border-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={onResetRules}
              title="Reset rules to initial task state"
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={onClearChat}
              title="Clear message history"
              className="text-xs px-2 sm:px-2.5 py-1.5 font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
