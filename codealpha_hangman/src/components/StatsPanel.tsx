import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Play, CheckCircle } from 'lucide-react';
import { GameStats } from '../types';

interface StatsPanelProps {
  stats: GameStats;
  aiStats: GameStats;
  activeMode: 'player' | 'ai';
  onResetStats: (mode: 'player' | 'ai') => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, aiStats, activeMode, onResetStats }) => {
  const [selectedTab, setSelectedTab] = useState<'player' | 'ai'>(activeMode);

  useEffect(() => {
    setSelectedTab(activeMode);
  }, [activeMode]);

  const currentStats = selectedTab === 'player' ? stats : aiStats;
  const winRate = currentStats.gamesPlayed > 0 ? Math.round((currentStats.gamesWon / currentStats.gamesPlayed) * 100) : 0;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-none p-6 border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
      {/* Tabs Header */}
      <div className="flex border-b-4 border-black dark:border-white mb-5">
        <button
          onClick={() => setSelectedTab('player')}
          className={`flex-1 py-2 text-xs md:text-sm font-black uppercase tracking-wider border-r-2 border-black dark:border-white transition-all ${
            selectedTab === 'player'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-white text-black dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
        >
          Player Stats
        </button>
        <button
          onClick={() => setSelectedTab('ai')}
          className={`flex-1 py-2 text-xs md:text-sm font-black uppercase tracking-wider transition-all ${
            selectedTab === 'ai'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-white text-black dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
        >
          AI Guesses Stats
        </button>
      </div>

      <div className="flex justify-between items-center mb-5 pb-3">
        <h3 className="font-display text-sm font-black text-neutral-500 dark:text-neutral-400 flex items-center gap-2 uppercase tracking-tight">
          <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
          {selectedTab === 'player' ? 'PLAYER SUCCESS' : 'AI GUESSING METRICS'}
        </h3>
        <button
          id="btn-reset-stats"
          onClick={() => onResetStats(selectedTab)}
          className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-red-500 hover:underline transition-colors font-black uppercase tracking-wider"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Games Played */}
        <div className="bg-[#f8f8f8] dark:bg-neutral-800 p-4 border-2 border-black dark:border-white rounded-none">
          <div className="flex items-center gap-2 text-black dark:text-neutral-300 text-[10px] font-black uppercase tracking-wider mb-1">
            <Play className="w-3.5 h-3.5 text-black dark:text-white fill-black dark:fill-white" />
            Played
          </div>
          <div className="text-3xl font-black font-display text-black dark:text-white">
            {currentStats.gamesPlayed}
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-black text-white dark:bg-white dark:text-black p-4 border-2 border-black dark:border-white rounded-none">
          <div className="flex items-center gap-2 text-neutral-300 dark:text-neutral-700 text-[10px] font-black uppercase tracking-wider mb-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Win Rate
          </div>
          <div className="text-3xl font-black font-display">
            {winRate}%
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-[#f8f8f8] dark:bg-neutral-800 p-4 border-2 border-black dark:border-white rounded-none">
          <div className="flex items-center gap-2 text-black dark:text-neutral-300 text-[10px] font-black uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            Streak
          </div>
          <div className="text-3xl font-black font-display text-black dark:text-white">
            {currentStats.currentStreak}
          </div>
        </div>

        {/* Max Streak */}
        <div className="bg-[#f8f8f8] dark:bg-neutral-800 p-4 border-2 border-black dark:border-white rounded-none">
          <div className="flex items-center gap-2 text-black dark:text-neutral-300 text-[10px] font-black uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Max Streak
          </div>
          <div className="text-3xl font-black font-display text-black dark:text-white">
            {currentStats.maxStreak}
          </div>
        </div>
      </div>
    </div>
  );
};

