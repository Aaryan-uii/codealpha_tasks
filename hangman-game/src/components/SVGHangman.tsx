import React from 'react';
import { motion } from 'motion/react';

interface SVGHangmanProps {
  wrongGuesses: number;
}

export const SVGHangman: React.FC<SVGHangmanProps> = ({ wrongGuesses }) => {
  // SVG part styles: soft-toned clean lines with animations
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="w-full h-64 md:h-80 flex items-center justify-center p-2 bg-[#f8f8f8] dark:bg-neutral-900 rounded-none border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-300">
      <svg
        viewBox="0 0 200 240"
        className="w-full h-full max-w-[200px]"
        id="svg-hangman-canvas"
      >
        {/* === THE GALLOWS === */}
        {/* Base stand */}
        <motion.line
          x1="20" y1="220" x2="140" y2="220"
          stroke="currentColor" strokeWidth="6" strokeLinecap="square"
          className="text-black dark:text-white"
          initial="hidden" animate="visible" variants={lineVariants}
        />
        {/* Vertical post */}
        <motion.line
          x1="50" y1="220" x2="50" y2="30"
          stroke="currentColor" strokeWidth="6" strokeLinecap="square"
          className="text-black dark:text-white"
          initial="hidden" animate="visible" variants={lineVariants}
          transition={{ delay: 0.1 }}
        />
        {/* Top beam */}
        <motion.line
          x1="47" y1="30" x2="130" y2="30"
          stroke="currentColor" strokeWidth="6" strokeLinecap="square"
          className="text-black dark:text-white"
          initial="hidden" animate="visible" variants={lineVariants}
          transition={{ delay: 0.2 }}
        />
        {/* Support angle beam */}
        <motion.line
          x1="50" y1="70" x2="90" y2="30"
          stroke="currentColor" strokeWidth="4" strokeLinecap="square"
          className="text-black dark:text-white"
          initial="hidden" animate="visible" variants={lineVariants}
          transition={{ delay: 0.3 }}
        />
        {/* Rope hook / rope */}
        <motion.line
          x1="130" y1="27" x2="130" y2="65"
          stroke="currentColor" strokeWidth="4" strokeLinecap="square"
          className="text-black dark:text-white"
          initial="hidden" animate="visible" variants={lineVariants}
          transition={{ delay: 0.4 }}
        />

        {/* === THE MAN === */}
        {/* 1. Head */}
        {wrongGuesses >= 1 && (
          <motion.circle
            cx="130" cy="80" r="15"
            stroke="currentColor" strokeWidth="4" fill="none"
            className="text-black dark:text-white"
            initial="hidden" animate="visible" variants={circleVariants}
          />
        )}

        {/* 2. Torso (Body) */}
        {wrongGuesses >= 2 && (
          <motion.line
            x1="130" y1="95" x2="130" y2="150"
            stroke="currentColor" strokeWidth="4" strokeLinecap="square"
            className="text-black dark:text-white"
            initial="hidden" animate="visible" variants={lineVariants}
          />
        )}

        {/* 3. Left Arm */}
        {wrongGuesses >= 3 && (
          <motion.line
            x1="130" y1="110" x2="105" y2="130"
            stroke="currentColor" strokeWidth="4" strokeLinecap="square"
            className="text-black dark:text-white"
            initial="hidden" animate="visible" variants={lineVariants}
          />
        )}

        {/* 4. Right Arm */}
        {wrongGuesses >= 4 && (
          <motion.line
            x1="130" y1="110" x2="155" y2="130"
            stroke="currentColor" strokeWidth="4" strokeLinecap="square"
            className="text-black dark:text-white"
            initial="hidden" animate="visible" variants={lineVariants}
          />
        )}

        {/* 5. Left Leg */}
        {wrongGuesses >= 5 && (
          <motion.line
            x1="130" y1="150" x2="110" y2="195"
            stroke="currentColor" strokeWidth="4" strokeLinecap="square"
            className="text-black dark:text-white"
            initial="hidden" animate="visible" variants={lineVariants}
          />
        )}

        {/* 6. Right Leg (Complete / Dead) */}
        {wrongGuesses >= 6 && (
          <motion.line
            x1="130" y1="150" x2="150" y2="195"
            stroke="currentColor" strokeWidth="4" strokeLinecap="square"
            className="text-black dark:text-white"
            initial="hidden" animate="visible" variants={lineVariants}
          />
        )}

        {/* Dead eyes indicators on final stage */}
        {wrongGuesses >= 6 && (
          <>
            {/* Left Eye X */}
            <motion.line
              x1="124" y1="76" x2="128" y2="80"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className="text-red-500"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            />
            <motion.line
              x1="128" y1="76" x2="124" y2="80"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className="text-red-500"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            />
            {/* Right Eye X */}
            <motion.line
              x1="132" y1="76" x2="136" y2="80"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className="text-red-500"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            />
            <motion.line
              x1="136" y1="76" x2="132" y2="80"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className="text-red-500"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            />
          </>
        )}
      </svg>
    </div>
  );
};
