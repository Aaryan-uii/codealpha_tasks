import React from 'react';
import { BotMood } from '../types';
import { motion } from 'motion/react';

interface BotAvatarProps {
  mood: BotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pulse?: boolean;
}

export const BotAvatar: React.FC<BotAvatarProps> = ({
  mood = 'idle',
  size = 'md',
  pulse = false,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  }[size];

  const eyeBg = mood === 'confused' ? 'bg-amber-400' : mood === 'happy' ? 'bg-emerald-400' : 'bg-cyan-300';

  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${sizeClasses}`}>
      {/* Outer Glow Ring */}
      <motion.div
        animate={
          pulse || mood === 'thinking'
            ? { scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }
            : { scale: 1, opacity: 0.2 }
        }
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        className={`absolute inset-0 rounded-2xl ${
          mood === 'confused'
            ? 'bg-amber-500'
            : mood === 'happy'
            ? 'bg-emerald-500'
            : 'bg-indigo-500'
        } blur-md`}
      />

      {/* Robot Face Container */}
      <motion.div
        animate={
          mood === 'happy'
            ? { y: [0, -3, 0] }
            : mood === 'waving'
            ? { rotate: [0, 8, -8, 4, 0] }
            : mood === 'confused'
            ? { rotate: [0, -5, 5, 0] }
            : { y: 0 }
        }
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="relative w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-indigo-500/40 rounded-2xl shadow-md flex flex-col items-center justify-center overflow-hidden p-1 text-white"
      >
        {/* Top Antenna Dot */}
        <div className="absolute top-1 flex items-center justify-center space-x-1">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className={`w-1.5 h-1.5 rounded-full ${
              mood === 'confused'
                ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                : mood === 'happy'
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : 'bg-indigo-400 shadow-[0_0_8px_#818cf8]'
            }`}
          />
        </div>

        {/* Eyes Row */}
        <div className="flex items-center space-x-2 mt-1">
          {/* Left Eye */}
          <motion.div
            animate={
              mood === 'confused'
                ? { scaleY: 0.5, rotate: -15 }
                : mood === 'happy'
                ? { scaleY: [1, 0.2, 1] }
                : { scaleY: 1 }
            }
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className={`w-2.5 h-2.5 rounded-full ${eyeBg} shadow-sm flex items-center justify-center`}
          >
            {mood === 'happy' && <div className="w-1 h-0.5 bg-slate-900 rounded-full" />}
          </motion.div>

          {/* Right Eye */}
          <motion.div
            animate={
              mood === 'confused'
                ? { scaleY: 1.2, rotate: 15 }
                : mood === 'happy'
                ? { scaleY: [1, 0.2, 1] }
                : { scaleY: 1 }
            }
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className={`w-2.5 h-2.5 rounded-full ${eyeBg} shadow-sm flex items-center justify-center`}
          >
            {mood === 'happy' && <div className="w-1 h-0.5 bg-slate-900 rounded-full" />}
          </motion.div>
        </div>

        {/* Mouth Expression */}
        <div className="mt-1 flex items-center justify-center">
          {mood === 'happy' || mood === 'waving' ? (
            <div className="w-3.5 h-1.5 border-b-2 border-emerald-300 rounded-full" />
          ) : mood === 'confused' ? (
            <div className="w-3 h-1 border-t-2 border-amber-300 rounded-full" />
          ) : mood === 'thinking' ? (
            <div className="w-2 h-2 border border-cyan-300 rounded-full animate-ping" />
          ) : (
            <div className="w-3 h-0.5 bg-cyan-200/80 rounded-full" />
          )}
        </div>
      </motion.div>
    </div>
  );
};
