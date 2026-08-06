import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Keyboard,
  RotateCcw,
  Sparkles,
  Github,
  Award,
  Terminal,
  Cpu,
  Bookmark,
  Plus,
  Play,
  Sun,
  Moon,
  Skull,
  Bot,
  User,
  Trophy,
  Eye,
  EyeOff,
  Code
} from 'lucide-react';
import { CATEGORIES, HANGMAN_ASCII_STAGES } from './data';
import { GameStats, GameStatus, Category, ViewMode, GameMode } from './types';
import { SVGHangman } from './components/SVGHangman';
import { StatsPanel } from './components/StatsPanel';
import { sounds } from './soundEffects';
import { DICTIONARY } from './dictionary';

// === ADVANCED DICTIONARY-BASED AI SOLVER ENGINE ===
interface AiStrategyResult {
  guess: string | null;
  wordGuess: string | null;
  matchesCount: number;
  candidatesSample: string[];
}

const COMMON_NAMES = [
  'suman', 'arvind', 'amit', 'sumit', 'vijay', 'ajay', 'sanjay', 'rohit', 'mohit', 'ramesh', 
  'suresh', 'mahesh', 'rajesh', 'sandeep', 'pradeep', 'dilip', 'rahul', 'mukul', 'atul', 
  'vikas', 'akash', 'manas', 'shiva', 'deva', 'kiran', 'rohan', 'milan', 'ankit', 'deepak', 
  'sunil', 'anil', 'vivek', 'gaurav', 'saurav', 'sachin', 'kapil', 'manoj', 'neeraj', 'nitin', 
  'pankaj', 'praveen', 'rajeev', 'satish', 'tarun', 'umesh', 'vinay', 'vipul', 'vishal', 'yash',
  'priya', 'neha', 'pooja', 'aarti', 'anjali', 'divya', 'ekta', 'jyoti', 'meera', 'nisha', 
  'preeti', 'ritu', 'reena', 'rupa', 'seema', 'shweta', 'sneha', 'swati', 'tanvi', 'vandana',
  'john', 'mary', 'david', 'james', 'sarah', 'robert', 'michael', 'william', 'thomas', 'daniel', 
  'paul', 'mark', 'kevin', 'brian', 'george', 'edward', 'steven', 'ronald', 'kenneth', 'joseph', 
  'richard', 'charles', 'christopher', 'matthew', 'anthony', 'donald', 'andrew', 'joshua', 
  'timothy', 'jason', 'jeffrey', 'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'stephen', 
  'jonathan', 'larry', 'justin', 'scott', 'brandon', 'frank', 'benjamin', 'gregory', 'samuel', 
  'raymond', 'patrick', 'alexander', 'jack', 'dennis', 'jerry', 'tyler', 'aaron', 'jose', 
  'henry', 'adam', 'douglas', 'nathan', 'peter', 'zachary', 'kyle', 'walter', 'harold', 'carl', 
  'jeremy', 'keith', 'roger', 'gerald', 'ethan', 'arthur', 'terry', 'christian', 'lawrence', 
  'sean', 'austin', 'shirley', 'deborah', 'barbara', 'susan', 'margaret', 'dorothy', 'lisa', 
  'nancy', 'karen', 'betty', 'helen', 'sandra', 'donna', 'carol', 'ruth', 'sharon', 'michelle', 
  'laura', 'kimberly', 'jessica', 'cynthia', 'angela', 'melissa', 'brenda', 'amy', 'anna', 
  'rebecca', 'virginia', 'kathleen', 'pamela', 'martha', 'debora', 'amanda', 'stephanie', 
  'carolyn', 'christine', 'marie', 'janet', 'catherine', 'frances', 'ann', 'joyce', 'diane', 
  'alice', 'julie', 'heather', 'teresa', 'doris', 'gloria', 'evelyn', 'jean', 'cheryl', 
  'mildred', 'katherine', 'joan', 'ashley'
];

function isProperNounOrName(word: string): boolean {
  const w = word.toLowerCase();
  if (COMMON_NAMES.includes(w)) {
    return true;
  }
  // Detect standard proper nouns or name-like suffix/prefix patterns
  const namePatterns = [
    /[a-z]+(and|an|ind|it|ay|esh|ep|sh|ul|as|va|el|on|ry|ia|ie|er|is|th|us|en|ey|ld|rt|ck|rd|ph|ne|ca|da|na|sa|ra|ta|va)$/i
  ];
  for (const pat of namePatterns) {
    if (pat.test(w)) return true;
  }
  return false;
}

function getLetterFrequencyByLength(length: number): string[] {
  if (length === 2) {
    // English 2-letter word frequency: O, A, I, E, T, N, S, H, R, D, M, Y, U, G, B, P, W, C, L, F, V, K, X, Z, J, Q
    return 'oaietnshrdmyugbpwclfvkyxzjq'.split('');
  }
  if (length === 3) {
    // English 3-letter word frequency: A, E, O, I, T, N, S, R, D, L, C, H, U, M, G, Y, P, B, W, F, V, K, X, J, Z, Q
    return 'aeointsrdlchumgypbwfvkxjzq'.split('');
  }
  return 'etaoinshrdlcumwfgypbvkjxqz'.split('');
}

function getAiStrategyDetails(
  wordLen: number,
  revealedPattern: (string | null)[],
  wrongLetters: string[],
  guessedLetters: string[],
  allCategories: Category[],
  dynamicCandidates?: string[],
  rejectedWordGuesses?: string[],
  difficulty: 'easy' | 'medium' | 'hard' = 'hard'
): AiStrategyResult {
  // Build the complete word list: merge DICTIONARY, categories, custom names, and dynamic candidates
  const allWordsSet = new Set<string>();
  for (const w of DICTIONARY) {
    allWordsSet.add(w.toLowerCase());
  }
  for (const cat of allCategories) {
    for (const w of cat.words) {
      allWordsSet.add(w.toLowerCase());
    }
  }
  // Inject common proper names of matching length
  for (const name of COMMON_NAMES) {
    if (name.length === wordLen) {
      allWordsSet.add(name.toLowerCase());
    }
  }
  if (dynamicCandidates) {
    for (const cand of dynamicCandidates) {
      allWordsSet.add(cand.toLowerCase());
    }
  }
  const completeWordList = Array.from(allWordsSet);

  const correctLetters = revealedPattern.filter((l): l is string => l !== null).map(l => l.toLowerCase());

  // Step 1: Filter to same-length candidates that match correctly guessed layout and exclude wrong guesses
  let matchingCandidates = completeWordList.filter((cand) => {
    if (cand.length !== wordLen) return false;

    // Must not be in the rejected word guesses list
    if (rejectedWordGuesses && rejectedWordGuesses.includes(cand.toLowerCase())) return false;

    // Must not contain any known wrong letters
    for (const wl of wrongLetters) {
      if (cand.toLowerCase().includes(wl.toLowerCase())) return false;
    }

    // Must match revealed slots and not have revealed letters in hidden slots
    for (let i = 0; i < wordLen; i++) {
      const actualChar = revealedPattern[i];
      if (actualChar !== null) {
        if (cand[i].toLowerCase() !== actualChar.toLowerCase()) return false;
      } else {
        // Since it's hidden, the candidate must NOT have any of the already revealed correct letters at this index
        if (correctLetters.includes(cand[i].toLowerCase())) return false;
      }
    }
    return true;
  });

  // Randomly ignore some candidate matches in lower difficulties to make the AI less 'perfect'
  if (matchingCandidates.length > 0) {
    if (difficulty === 'easy') {
      const originalCount = matchingCandidates.length;
      const filtered = matchingCandidates.filter(() => Math.random() < 0.35);
      if (filtered.length > 0) {
        matchingCandidates = filtered;
      } else {
        // Keep exactly one random candidate with 50% probability, otherwise let it fallback completely
        if (Math.random() < 0.5) {
          matchingCandidates = [matchingCandidates[Math.floor(Math.random() * originalCount)]];
        } else {
          matchingCandidates = [];
        }
      }
    } else if (difficulty === 'medium') {
      const originalCount = matchingCandidates.length;
      const filtered = matchingCandidates.filter(() => Math.random() < 0.65);
      if (filtered.length > 0) {
        matchingCandidates = filtered;
      } else {
        matchingCandidates = [matchingCandidates[Math.floor(Math.random() * originalCount)]];
      }
    }
  }

  // Sort matching candidates so recognized proper nouns / common names are prioritized at the front
  matchingCandidates.sort((a, b) => {
    const aIsName = isProperNounOrName(a);
    const bIsName = isProperNounOrName(b);
    if (aIsName && !bIsName) return -1;
    if (!aIsName && bIsName) return 1;
    return 0;
  });

  // Calculate positional frequencies across ALL dictionary words of this length to understand English structural rules.
  // This helps guide predictions (e.g. vowels in the middle, typical prefixes/suffixes) even if matching candidate list is small.
  const positionalDictCount: Record<number, Record<string, number>> = {};
  for (let i = 0; i < wordLen; i++) {
    positionalDictCount[i] = {};
  }
  let sameLengthCount = 0;
  for (const w of completeWordList) {
    if (w.length === wordLen) {
      sameLengthCount++;
      for (let i = 0; i < wordLen; i++) {
        const char = w[i].toLowerCase();
        positionalDictCount[i][char] = (positionalDictCount[i][char] || 0) + 1;
      }
    }
  }

  // Step 2: Determine next best letter to guess using candidate count weighted by positional frequencies
  const LETTER_FREQUENCY = getLetterFrequencyByLength(wordLen);
  let bestGuess = '';

  if (matchingCandidates.length > 0) {
    // Count frequencies of UNGUESSED letters in the matching candidate words
    const counts: Record<string, number> = {};
    const positionalScores: Record<string, number> = {};

    for (const cand of matchingCandidates) {
      const isName = isProperNounOrName(cand);
      const weight = isName ? 2.5 : 1.0; // Give names a significant weight boost to prioritize their letters!

      const uniqueChars = new Set(cand.toLowerCase().split(''));
      for (const char of uniqueChars) {
        if (!guessedLetters.includes(char)) {
          counts[char] = (counts[char] || 0) + weight;

          // Compute positional contribution weight
          let posWeight = 0;
          for (let i = 0; i < wordLen; i++) {
            if (revealedPattern[i] === null && cand[i].toLowerCase() === char) {
              const dictFreq = sameLengthCount > 0 
                ? (positionalDictCount[i][char] || 0) / sameLengthCount 
                : 0;
              // Base weight is 1 (existence), boosted by structural probability of this letter in this slot
              posWeight += (1 + dictFreq) * weight;
            }
          }
          positionalScores[char] = (positionalScores[char] || 0) + posWeight;
        }
      }
    }

    const candidateLetters = Object.keys(counts);
    if (candidateLetters.length > 0) {
      candidateLetters.sort((a, b) => {
        const countA = counts[a] || 0;
        const countB = counts[b] || 0;
        // Primary sort: maximize candidate word matches to stay alive
        if (Math.abs(countB - countA) > 0.0001) {
          return countB - countA;
        }

        // Secondary sort: use positional score weight as tie-breaker
        const scoreA = positionalScores[a] || 0;
        const scoreB = positionalScores[b] || 0;
        if (Math.abs(scoreB - scoreA) > 0.0001) {
          return scoreB - scoreA;
        }

        // Tertiary sort: default English letter frequency
        return LETTER_FREQUENCY.indexOf(a) - LETTER_FREQUENCY.indexOf(b);
      });
      bestGuess = candidateLetters[0];
    }
  }

  // Step 3: Fallback using positional probabilities at currently unrevealed slots
  if (!bestGuess) {
    const fallbackScores: Record<string, number> = {};
    let hasUnrevealedSlots = false;

    for (let i = 0; i < wordLen; i++) {
      if (revealedPattern[i] === null) {
        hasUnrevealedSlots = true;
        const slotFreqs = positionalDictCount[i] || {};
        for (const [char, count] of Object.entries(slotFreqs)) {
          if (!guessedLetters.includes(char) && !wrongLetters.includes(char)) {
            fallbackScores[char] = (fallbackScores[char] || 0) + count;
          }
        }
      }
    }

    if (hasUnrevealedSlots) {
      const fallbackLetters = Object.keys(fallbackScores);
      if (fallbackLetters.length > 0) {
        fallbackLetters.sort((a, b) => {
          const scoreA = fallbackScores[a] || 0;
          const scoreB = fallbackScores[b] || 0;
          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }
          return LETTER_FREQUENCY.indexOf(a) - LETTER_FREQUENCY.indexOf(b);
        });
        bestGuess = fallbackLetters[0];
      }
    }
  }

  // Step 4: Ultimate fallback to general frequency
  if (!bestGuess) {
    for (const letter of LETTER_FREQUENCY) {
      if (!guessedLetters.includes(letter) && !wrongLetters.includes(letter)) {
        bestGuess = letter;
        break;
      }
    }
  }

  let wordGuess: string | null = null;
  if (matchingCandidates.length === 1) {
    const singleCand = matchingCandidates[0];
    const hasUnguessed = singleCand.split('').some((char) => !guessedLetters.includes(char));
    if (hasUnguessed) {
      wordGuess = singleCand;
    }
  } else if (matchingCandidates.length > 1 && matchingCandidates.length <= 3) {
    // If we have a very narrow list of candidates and exactly one of them is a highly recognized proper name,
    // be bold and propose it as a direct word guess!
    const names = matchingCandidates.filter(c => isProperNounOrName(c));
    if (names.length === 1) {
      const nameGuess = names[0];
      const hasUnguessed = nameGuess.split('').some((char) => !guessedLetters.includes(char));
      if (hasUnguessed) {
        wordGuess = nameGuess;
      }
    }
  }

  return {
    guess: bestGuess || null,
    wordGuess,
    matchesCount: matchingCandidates.length,
    candidatesSample: matchingCandidates.slice(0, 5),
  };
}

export default function App() {
  // === STYLES & PERSISTENCE ===
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hangman-theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('hangman-stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 };
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('hangman-view-mode');
    return (saved as ViewMode) || 'modern';
  });

  const [isMuted, setIsMuted] = useState(() => sounds.getMutedState());


  // === GAME STATES ===
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0]);
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [customWordInput, setCustomWordInput] = useState('');
  const [showCustomWord, setShowCustomWord] = useState(true);
  const [showAiWord, setShowAiWord] = useState(true);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const maxWrong = 6;

  // === GAME MODE CONFIGS ===
  const [gameMode, setGameMode] = useState<GameMode>(() => {
    const saved = localStorage.getItem('hangman-game-mode');
    return (saved as GameMode) || 'player';
  });

  const [aiStats, setAiStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('hangman-ai-stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 };
  });

  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>(() => {
    const saved = localStorage.getItem('hangman-ai-difficulty');
    return (saved as 'easy' | 'medium' | 'hard') || 'hard';
  });

  const [aiWordEntered, setAiWordEntered] = useState(false);
  const [aiSecretInput, setAiSecretInput] = useState('');
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [aiEvaluationMode, setAiEvaluationMode] = useState<'auto' | 'interactive'>('auto');
  const [pendingAiProposal, setPendingAiProposal] = useState<{
    type: 'letter' | 'word';
    value: string;
    matchesCount: number;
    candidatesSample: string[];
  } | null>(null);

  // Mind-Read mode states (where player thinks of a word and AI guesses interactively)
  const [isMindReadMode, setIsMindReadMode] = useState(false);
  const [mindReadLength, setMindReadLength] = useState<number>(6);
  const [mindReadGenre, setMindReadGenre] = useState<string>('any');
  const [mindReadPattern, setMindReadPattern] = useState<(string | null)[]>([]);
  const [mindReadWrongLetters, setMindReadWrongLetters] = useState<string[]>([]);
  const [pendingSlotSelectionLetter, setPendingSlotSelectionLetter] = useState<string | null>(null);
  const [draftSlots, setDraftSlots] = useState<boolean[]>([]);
  const [userFinalRevealedWord, setUserFinalRevealedWord] = useState<string>('');
  const [rejectedWordGuesses, setRejectedWordGuesses] = useState<string[]>([]);

  const isInteractivePatternMode = isMindReadMode || (gameMode === 'ai' && aiEvaluationMode === 'interactive');

  const currentRevealedPattern = useMemo(() => {
    if (isInteractivePatternMode) {
      return mindReadPattern;
    }
    if (!word) return [];
    return word.split('').map(char => guessedLetters.includes(char) ? char : null);
  }, [isInteractivePatternMode, mindReadPattern, word, guessedLetters]);

  const currentWrongLetters = useMemo(() => {
    if (isInteractivePatternMode) {
      return mindReadWrongLetters;
    }
    if (!word) return [];
    const lowerWord = word.toLowerCase();
    return guessedLetters.filter(char => !lowerWord.includes(char.toLowerCase()));
  }, [isInteractivePatternMode, mindReadWrongLetters, word, guessedLetters]);

  const [dynamicAiCandidates, setDynamicAiCandidates] = useState<string[]>([]);
  const [isFetchingAiCandidates, setIsFetchingAiCandidates] = useState(false);

  // Keep a cache of already queried game state combinations to prevent rate limits & 429 quota errors.
  const queriedStatesRef = useRef<Set<string>>(new Set());

  // Automatically reset the queried states cache when a new game starts (when guessedLetters is empty)
  useEffect(() => {
    if (guessedLetters.length === 0) {
      queriedStatesRef.current.clear();
    }
  }, [guessedLetters]);

  // Compute how many candidates match the current board layout locally
  const localMatchingCandidatesCount = useMemo(() => {
    if (gameMode !== 'ai' || !aiWordEntered || gameStatus !== 'playing' || !word) {
      return 0;
    }
    const wordLen = isMindReadMode ? mindReadLength : word.length;
    
    // Union of static DICTIONARY, category words, common names, and currently cached dynamic candidates
    const allSet = new Set<string>();
    for (const w of DICTIONARY) allSet.add(w.toLowerCase());
    for (const c of CATEGORIES) {
      for (const w of c.words) allSet.add(w.toLowerCase());
    }
    for (const name of COMMON_NAMES) {
      if (name.length === wordLen) allSet.add(name.toLowerCase());
    }
    for (const cand of dynamicAiCandidates) {
      allSet.add(cand.toLowerCase());
    }

    const correctLetters = currentRevealedPattern.filter((l): l is string => l !== null).map(l => l.toLowerCase());

    const list = Array.from(allSet).filter((cand) => {
      if (cand.length !== wordLen) return false;
      if (rejectedWordGuesses.includes(cand.toLowerCase())) return false;

      // Filter by wrong letters
      for (const wl of currentWrongLetters) {
        if (cand.toLowerCase().includes(wl.toLowerCase())) return false;
      }

      // Must match revealed slots and not have revealed letters in hidden slots
      for (let i = 0; i < wordLen; i++) {
        const actualChar = currentRevealedPattern[i];
        if (actualChar !== null) {
          if (cand[i].toLowerCase() !== actualChar.toLowerCase()) return false;
        } else {
          if (correctLetters.includes(cand[i].toLowerCase())) return false;
        }
      }
      return true;
    });

    return list.length;
  }, [
    gameMode,
    aiWordEntered,
    gameStatus,
    word,
    isMindReadMode,
    mindReadLength,
    dynamicAiCandidates,
    currentRevealedPattern,
    currentWrongLetters,
    rejectedWordGuesses
  ]);

  // Automatically fetch potential candidates from Gemini API when playing in AI mode to predict custom names & words
  useEffect(() => {
    if (gameMode !== 'ai' || !aiWordEntered || gameStatus !== 'playing' || !word) {
      setDynamicAiCandidates([]);
      return;
    }

    const length = isMindReadMode ? mindReadLength : word.length;
    const genre = isMindReadMode ? mindReadGenre : 'any';

    // Serialize current state to check if we've already asked Gemini for this exact scenario
    const patternStr = currentRevealedPattern.map(c => c ? c.toLowerCase() : '_').join('');
    const wrongStr = [...currentWrongLetters].sort().join('');
    const stateKey = `${length}|${genre}|${patternStr}|${wrongStr}`;

    // 1. If we already fetched for this exact pattern/wrong letter set, don't repeat the API call!
    if (queriedStatesRef.current.has(stateKey)) {
      return;
    }

    // 2. If we already completed our initial broad query (queriedStatesRef.size > 0) AND we still have
    // plenty of candidate matches locally (matches > 3), do NOT hit the Gemini API to avoid quota exhaustion (429)!
    if (queriedStatesRef.current.size > 0 && localMatchingCandidatesCount > 3) {
      return;
    }

    // Mark as queried immediately to prevent duplicate parallel fetches
    queriedStatesRef.current.add(stateKey);

    let active = true;
    const delayDebounceId = setTimeout(() => {
      const fetchCandidates = async () => {
        setIsFetchingAiCandidates(true);
        try {
          const res = await fetch("/api/ai-candidates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              length,
              revealed: currentRevealedPattern,
              wrongLetters: currentWrongLetters,
              guessedLetters,
              genre,
            }),
          });
          const data = await res.json();
          if (active && data && Array.isArray(data.candidates)) {
            setDynamicAiCandidates(prev => {
              const combined = new Set<string>();
              if (word && !word.includes('_')) {
                combined.add(word.toLowerCase());
              }
              prev.forEach(w => combined.add(w.toLowerCase()));
              data.candidates.forEach((w: string) => combined.add(w.toLowerCase()));
              return Array.from(combined);
            });
          }
        } catch (err) {
          console.error("Error fetching dynamic candidates:", err);
        } finally {
          if (active) {
            setIsFetchingAiCandidates(false);
          }
        }
      };

      fetchCandidates();
    }, 400); // Slight delay to bundle rapid changes

    return () => {
      active = false;
      clearTimeout(delayDebounceId);
    };
  }, [
    word,
    gameMode,
    aiWordEntered,
    gameStatus,
    isMindReadMode,
    mindReadLength,
    mindReadGenre,
    currentRevealedPattern,
    currentWrongLetters,
    guessedLetters,
    localMatchingCandidatesCount
  ]);

  // === TRIGGER NOTIFICATION ===
  const triggerNotification = useCallback((message: string, type: 'success' | 'warning' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 3000);
  }, []);

  // === SAVE PERSISTENT DATA ===
  useEffect(() => {
    localStorage.setItem('hangman-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hangman-stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('hangman-view-mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('hangman-game-mode', gameMode);
  }, [gameMode]);

  useEffect(() => {
    localStorage.setItem('hangman-ai-stats', JSON.stringify(aiStats));
  }, [aiStats]);

  useEffect(() => {
    localStorage.setItem('hangman-ai-difficulty', aiDifficulty);
  }, [aiDifficulty]);

  // === INITIALIZE WORD ===
  const startMindReadGame = useCallback((length: number, genre: string) => {
    setIsAutoplay(false);
    setPendingAiProposal(null);
    setPendingSlotSelectionLetter(null);
    setDraftSlots([]);
    setUserFinalRevealedWord('');
    setRejectedWordGuesses([]);
    
    setIsMindReadMode(true);
    setMindReadLength(length);
    setMindReadGenre(genre);
    setMindReadPattern(Array(length).fill(null));
    setMindReadWrongLetters([]);
    
    setWord('_'.repeat(length)); // Placeholder of matching length
    setAiWordEntered(true);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus('playing');
    setAiEvaluationMode('interactive'); // Locked to interactive referee
    
    const genreText = genre === 'any' ? 'any category' : `the "${genre}" genre`;
    setAiLogs([
      `⚡ Mind-Read session initialized.`,
      `🧠 Secret word of ${length} letters chosen in your mind (${genreText}).`,
      `🧑‍⚖️ Interactive referee is active. The AI will propose letters/words, and you will confirm them.`
    ]);
    
    triggerNotification(`Started Mind-Read game! AI is thinking...`, 'success');
  }, [triggerNotification]);

  const startNewGame = useCallback((currentCategory = selectedCategory, customWord?: string) => {
    setIsAutoplay(false);
    setPendingAiProposal(null);
    setIsMindReadMode(false);
    setPendingSlotSelectionLetter(null);
    setDraftSlots([]);
    setUserFinalRevealedWord('');
    setRejectedWordGuesses([]);

    if (gameMode === 'ai') {
      if (customWord) {
        const cleaned = customWord.toLowerCase().trim();
        setWord(cleaned);
        setMindReadPattern(Array(cleaned.length).fill(null));
        setMindReadWrongLetters([]);
        setAiWordEntered(true);
        setIsCustomMode(true);
      } else {
        setWord('');
        setMindReadPattern([]);
        setMindReadWrongLetters([]);
        setAiWordEntered(false);
        setIsCustomMode(false);
      }
      setGuessedLetters([]);
      setWrongGuesses(0);
      setGameStatus('playing');
      setAiLogs([]);
    } else {
      let chosenWord = '';
      if (customWord) {
        chosenWord = customWord.toLowerCase().trim();
        setIsCustomMode(true);
      } else {
        const wordsList = currentCategory.words;
        chosenWord = wordsList[Math.floor(Math.random() * wordsList.length)];
        setIsCustomMode(false);
      }

      setWord(chosenWord);
      setGuessedLetters([]);
      setWrongGuesses(0);
      setGameStatus('playing');
    }
  }, [selectedCategory, gameMode]);

  // Run on startup or mode change
  useEffect(() => {
    startNewGame(selectedCategory);
  }, [startNewGame, gameMode]);

  const playSound = useCallback((soundFunc: () => void) => {
    if (viewMode !== 'console') {
      soundFunc();
    }
  }, [viewMode]);

  // === MUTING STATE ===
  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    triggerNotification(muted ? 'Sound muted' : 'Sound unmuted', 'info');
  };

  // === STATS UPDATERS ===
  const handleWin = useCallback(() => {
    playSound(() => sounds.playVictory());
    setGameStatus('won');
    if (gameMode === 'player') {
      setStats((prev) => {
        const newPlayed = prev.gamesPlayed + 1;
        const newWon = prev.gamesWon + 1;
        const newStreak = prev.currentStreak + 1;
        const newMax = Math.max(prev.maxStreak, newStreak);
        return {
          gamesPlayed: newPlayed,
          gamesWon: newWon,
          currentStreak: newStreak,
          maxStreak: newMax,
        };
      });
    } else {
      setAiStats((prev) => {
        const newPlayed = prev.gamesPlayed + 1;
        const newWon = prev.gamesWon + 1;
        const newStreak = prev.currentStreak + 1;
        const newMax = Math.max(prev.maxStreak, newStreak);
        return {
          gamesPlayed: newPlayed,
          gamesWon: newWon,
          currentStreak: newStreak,
          maxStreak: newMax,
        };
      });
    }
  }, [gameMode]);

  const handleLoss = useCallback(() => {
    playSound(() => sounds.playDefeat());
    setGameStatus('lost');
    if (gameMode === 'player') {
      setStats((prev) => {
        return {
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          currentStreak: 0,
        };
      });
    } else {
      setAiStats((prev) => {
        return {
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          currentStreak: 0,
        };
      });
    }
  }, [gameMode]);

  // === AI STRATEGY & GUESS LOGIC ===
  const makeAiGuess = useCallback(() => {
    if (gameStatus !== 'playing' || !aiWordEntered) return;
    if (pendingAiProposal) return;

    const wordLen = isMindReadMode ? mindReadLength : word.length;
    const revealedPattern = isInteractivePatternMode
      ? mindReadPattern
      : word.split('').map(char => guessedLetters.includes(char) ? char : null);
    const wrongLetters = isInteractivePatternMode
      ? mindReadWrongLetters
      : guessedLetters.filter(char => !word.includes(char));

    const { guess, wordGuess, matchesCount, candidatesSample } = getAiStrategyDetails(
      wordLen,
      revealedPattern,
      wrongLetters,
      guessedLetters,
      CATEGORIES,
      dynamicAiCandidates,
      rejectedWordGuesses,
      aiDifficulty
    );

    if (wordGuess) {
      if (aiEvaluationMode === 'interactive') {
        setPendingAiProposal({
          type: 'word',
          value: wordGuess,
          matchesCount,
          candidatesSample,
        });
        setAiLogs((prev) => [
          `📡 AI is proposing WORD guess: "${wordGuess.toUpperCase()}". Awaiting referee confirmation...`,
          ...prev,
        ]);
        setIsAutoplay(false);
      } else {
        const isCorrectWord = wordGuess.toLowerCase() === word.toLowerCase();
        if (isCorrectWord) {
          sounds.playCorrect();
          setGuessedLetters(word.split(''));
          setAiLogs((prev) => [
            `🎉 AI guessed the WORD: "${wordGuess.toUpperCase()}"! ✅ CORRECT!`,
            ...prev,
          ]);
          handleWin();
        } else {
          sounds.playWrong();
          const nextWrong = wrongGuesses + 1;
          setWrongGuesses(nextWrong);
          setRejectedWordGuesses((prev) => [...prev, wordGuess.toLowerCase()]);
          setAiLogs((prev) => [
            `❌ AI guessed the WORD: "${wordGuess.toUpperCase()}" — Incorrect. (${maxWrong - nextWrong} chances left)`,
            ...prev,
          ]);
          if (nextWrong >= maxWrong) {
            handleLoss();
          }
        }
      }
    } else {
      if (!guess) {
        triggerNotification('AI ran out of letters to guess!', 'warning');
        return;
      }

      if (aiEvaluationMode === 'interactive') {
        setPendingAiProposal({
          type: 'letter',
          value: guess,
          matchesCount,
          candidatesSample,
        });
        setAiLogs((prev) => [
          `📡 AI is proposing LETTER guess: '${guess.toUpperCase()}'. Awaiting referee confirmation...`,
          ...prev,
        ]);
        setIsAutoplay(false);
      } else {
        const nextGuesses = [...guessedLetters, guess];
        setGuessedLetters(nextGuesses);

        const isCorrect = word.includes(guess);
        if (isCorrect) {
          sounds.playCorrect();
          const positions: number[] = [];
          word.split('').forEach((char, idx) => {
            if (char === guess) positions.push(idx + 1);
          });
          const sampleStr = candidatesSample.length > 0 ? ` (candidates left: ${matchesCount}, e.g. ${candidatesSample.map(w => w.toUpperCase()).join(', ')})` : '';
          const logMsg = `🤖 AI guessed: '${guess.toUpperCase()}' — ✅ YES! Position(s): [${positions.join(', ')}]${sampleStr}`;
          setAiLogs((prev) => [logMsg, ...prev]);

          const allRevealed = word.split('').every((l) => nextGuesses.includes(l));
          if (allRevealed) {
            handleWin();
          }
        } else {
          sounds.playWrong();
          const nextWrong = wrongGuesses + 1;
          setWrongGuesses(nextWrong);
          const sampleStr = candidatesSample.length > 0 ? ` (candidates left: ${matchesCount}, e.g. ${candidatesSample.map(w => w.toUpperCase()).join(', ')})` : '';
          const logMsg = `🤖 AI guessed: '${guess.toUpperCase()}' — ❌ NO! (${maxWrong - nextWrong} chances left)${sampleStr}`;
          setAiLogs((prev) => [logMsg, ...prev]);

          if (nextWrong >= maxWrong) {
            handleLoss();
          }
        }
      }
    }
  }, [gameStatus, aiWordEntered, guessedLetters, word, wrongGuesses, handleWin, handleLoss, triggerNotification, aiEvaluationMode, pendingAiProposal, dynamicAiCandidates, isMindReadMode, mindReadLength, mindReadPattern, mindReadWrongLetters, rejectedWordGuesses, aiDifficulty]);

  const handleRefereeVerdict = useCallback((isCorrect: boolean) => {
    if (!pendingAiProposal || gameStatus !== 'playing') return;

    const { type, value, matchesCount, candidatesSample } = pendingAiProposal;

    if (type === 'word') {
      setPendingAiProposal(null);
      if (isCorrect) {
        sounds.playCorrect();
        const cleanWord = value.toLowerCase();
        
        // If Custom Secret Word mode, log if they accepted a different word
        if (!isMindReadMode && cleanWord !== word.toLowerCase()) {
          setAiLogs((prev) => [
            `🔄 Word divergence: You accepted "${value.toUpperCase()}" as CORRECT, changing your secret word from "${word.toUpperCase()}" to "${value.toUpperCase()}".`,
            ...prev
          ]);
        }
        
        setWord(cleanWord);
        setGuessedLetters(cleanWord.split(''));
        setMindReadPattern(cleanWord.split(''));
        setUserFinalRevealedWord(cleanWord);
        setAiLogs((prev) => [
          `🎉 Referee confirmed WORD guess "${value.toUpperCase()}" is ✅ CORRECT! AI wins!`,
          ...prev,
        ]);
        handleWin();
      } else {
        sounds.playWrong();
        const nextWrong = wrongGuesses + 1;
        setWrongGuesses(nextWrong);
        setRejectedWordGuesses((prev) => [...prev, value.toLowerCase()]);
        setAiLogs((prev) => [
          `❌ Referee confirmed WORD guess "${value.toUpperCase()}" is INCORRECT! (${maxWrong - nextWrong} chances left)`,
          ...prev,
        ]);
        if (nextWrong >= maxWrong) {
          handleLoss();
        }
      }
    } else {
      // letter guess
      if (isCorrect) {
        // Open slot selector, do NOT clear pendingAiProposal yet (keep it locked)
        setPendingSlotSelectionLetter(value);
        
        // If in Custom Secret Word mode, pre-select slots matching the letter in the word
        if (!isMindReadMode && word) {
          const matchingSlots = word.split('').map((char) => char === value.toLowerCase());
          setDraftSlots(matchingSlots);
        } else {
          setDraftSlots(Array(mindReadLength).fill(false));
        }
      } else {
        // Letter is incorrect
        setPendingAiProposal(null);
        sounds.playWrong();
        const nextWrong = wrongGuesses + 1;
        setWrongGuesses(nextWrong);
        
        const letter = value.toLowerCase();
        
        // Log if they marked a letter as incorrect that is actually in their word
        if (!isMindReadMode && word.toLowerCase().includes(letter)) {
          setAiLogs((prev) => [
            `⚠️ Divergence: You marked letter '${letter.toUpperCase()}' as INCORRECT, even though it exists in your secret word '${word.toUpperCase()}'. AI will respect your referee input!`,
            ...prev
          ]);
        }

        setMindReadWrongLetters((prev) => [...prev, letter]);
        setGuessedLetters((prev) => [...prev, letter]);

        const sampleStr = candidatesSample.length > 0 ? ` (candidates left: ${matchesCount}, e.g. ${candidatesSample.map(w => w.toUpperCase()).join(', ')})` : '';
        setAiLogs((prev) => [
          `🤖 Referee confirmed LETTER '${value.toUpperCase()}' is ❌ INCORRECT! (${maxWrong - nextWrong} chances left)${sampleStr}`,
          ...prev,
        ]);

        if (nextWrong >= maxWrong) {
          handleLoss();
        }
      }
    }
  }, [pendingAiProposal, gameStatus, guessedLetters, word, wrongGuesses, handleWin, handleLoss, isMindReadMode, mindReadLength, rejectedWordGuesses]);

  const confirmSlotSelection = useCallback(() => {
    if (!pendingSlotSelectionLetter || !pendingAiProposal) return;
    
    const letter = pendingSlotSelectionLetter.toLowerCase();
    const { matchesCount, candidatesSample } = pendingAiProposal;
    
    // Find all selected indices
    const selectedIndices: number[] = [];
    draftSlots.forEach((isSelected, idx) => {
      if (isSelected) selectedIndices.push(idx);
    });
    
    if (selectedIndices.length === 0) {
      triggerNotification("You must select at least one slot if the letter is correct!", "warning");
      return;
    }
    
    sounds.playCorrect();
    
    // Update mindReadPattern
    const nextPattern = [...mindReadPattern];
    selectedIndices.forEach((idx) => {
      nextPattern[idx] = letter;
    });
    setMindReadPattern(nextPattern);
    
    // Update guessedLetters
    const nextGuesses = [...guessedLetters, letter];
    setGuessedLetters(nextGuesses);
    
    // Clear slot selection state
    setPendingSlotSelectionLetter(null);
    setDraftSlots([]);
    setPendingAiProposal(null); // Clear the AI proposal now
    
    const positionsHuman = selectedIndices.map(idx => idx + 1);
    const sampleStr = candidatesSample.length > 0 ? ` (candidates left: ${matchesCount}, e.g. ${candidatesSample.map(w => w.toUpperCase()).join(', ')})` : '';
    setAiLogs((prev) => [
      `🤖 Referee confirmed LETTER '${letter.toUpperCase()}' is ✅ CORRECT at Position(s): [${positionsHuman.join(', ')}]!${sampleStr}`,
      ...prev
    ]);
    
    // Check if the pattern is fully complete (all slots filled)
    const isFullyComplete = nextPattern.every((l) => l !== null);
    if (isFullyComplete) {
      const finalWord = nextPattern.join('');
      setWord(finalWord);
      setUserFinalRevealedWord(finalWord);
      handleWin();
    }
  }, [pendingSlotSelectionLetter, pendingAiProposal, draftSlots, mindReadPattern, guessedLetters, handleWin, triggerNotification]);

  // Autoplay hook for AI mode
  useEffect(() => {
    if (gameMode !== 'ai' || !aiWordEntered || gameStatus !== 'playing' || !isAutoplay || pendingAiProposal) {
      return;
    }

    const timer = setTimeout(() => {
      makeAiGuess();
    }, 1200);

    return () => clearTimeout(timer);
  }, [gameMode, aiWordEntered, gameStatus, isAutoplay, makeAiGuess, pendingAiProposal]);

  const handleRandomWordForAi = () => {
    const wordsList = selectedCategory.words;
    const chosen = wordsList[Math.floor(Math.random() * wordsList.length)];
    startNewGame(selectedCategory, chosen);
    triggerNotification(`A secret word from "${selectedCategory.name}" has been selected for the AI!`, 'success');
  };

  // === GAME INPUT HANDLER ===
  const makeGuess = useCallback((letter: string) => {
    if (gameStatus !== 'playing') return;

    const char = letter.toLowerCase();

    // Already guessed check
    if (guessedLetters.includes(char)) {
      playSound(() => sounds.playClick());
      triggerNotification(`You already guessed "${char.toUpperCase()}"!`, 'warning');
      return;
    }

    // Add guess
    const nextGuesses = [...guessedLetters, char];
    setGuessedLetters(nextGuesses);

    if (word.includes(char)) {
      playSound(() => sounds.playCorrect());
      // Check Win Condition
      const allRevealed = word.split('').every((l) => nextGuesses.includes(l));
      if (allRevealed) {
        handleWin();
      }
    } else {
      playSound(() => sounds.playWrong());
      const nextWrong = wrongGuesses + 1;
      setWrongGuesses(nextWrong);
      if (nextWrong >= maxWrong) {
        handleLoss();
      }
    }
  }, [gameStatus, guessedLetters, word, wrongGuesses, handleWin, handleLoss, triggerNotification]);

  // === KEYBOARD EVENT LISTENERS ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameMode !== 'player') return; // Only accept player keyboard inputs in player mode
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const char = e.key.toLowerCase();
      if (/^[a-z]$/.test(char)) {
        // Only trigger if no modal or input is focused
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
          return;
        }
        makeGuess(char);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [makeGuess, gameMode]);

  // === RESET ALL STATISTICS ===
  const handleResetStats = (mode: 'player' | 'ai') => {
    if (mode === 'player') {
      setStats({ gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 });
      triggerNotification('Player statistics have been reset.', 'info');
    } else {
      setAiStats({ gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 });
      triggerNotification('AI statistics have been reset.', 'info');
    }
  };

  // === CATEGORY CHANGER ===
  const changeCategory = (cat: Category) => {
    setSelectedCategory(cat);
    startNewGame(cat);
    triggerNotification(`Switched to "${cat.name}" category`, 'info');
  };

  // === CUSTOM WORD CREATION ===
  const handleCustomWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customWordInput.replace(/[^a-zA-Z]/g, '').trim();
    if (cleaned.length < 3) {
      triggerNotification('Custom word must contain at least 3 letters!', 'warning');
      return;
    }
    setCustomWordInput('');
    startNewGame(selectedCategory, cleaned);
    triggerNotification('Playing custom word challenge! Invite a friend to guess.', 'success');
  };

  const getConsoleOutput = () => {
    const lines: string[] = [];
    lines.push(">>> python hangman_game.py");
    lines.push("Loading standard words...");
    lines.push("words_list = ['python', 'hangman', 'programming', 'developer', 'internship']");
    lines.push(`Randomly selected a secret word of ${word.length} letters.`);
    lines.push("");
    
    let currentWrong = 0;
    let currentGuesses: string[] = [];
    
    // Show the initial state
    lines.push("========================================");
    lines.push(`Word: ${word.split('').map(() => '_').join(' ')}`);
    lines.push(`Chances left: 6`);
    lines.push(`Guessed letters: []`);
    lines.push("========================================");
    
    // Process step-by-step
    guessedLetters.forEach((char) => {
      lines.push(`\nInput guess: ${char.toUpperCase()}`);
      currentGuesses.push(char);
      if (word.includes(char)) {
        lines.push(`Correct! '${char.toUpperCase()}' is in the word.`);
      } else {
        currentWrong++;
        lines.push(`Incorrect! '${char.toUpperCase()}' is not in the word.`);
      }
      
      const displayed = word.split('').map(l => currentGuesses.includes(l) ? l.toUpperCase() : '_').join(' ');
      lines.push("========================================");
      lines.push(`Word: ${displayed}`);
      lines.push(`Chances left: ${6 - currentWrong}`);
      lines.push(`Guessed letters: [${currentGuesses.map(g => g.toUpperCase()).join(', ')}]`);
      lines.push("========================================");
    });
    
    if (currentWrong >= 6) {
      lines.push("\nGAME OVER! You ran out of guesses.");
      lines.push(`The word was: ${word.toUpperCase()}`);
    } else if (word && word.split('').every(l => currentGuesses.includes(l))) {
      lines.push("\nCONGRATULATIONS! You guessed the word!");
      lines.push("Thank you for playing!");
    } else {
      lines.push("\nEnter next letter guess below:");
    }
    
    return lines;
  };

  // === DISPLAY PREPARATION ===
  const displayWordString = word
    .split('')
    .map((l) => (guessedLetters.includes(l) ? l.toUpperCase() : '_'))
    .join(' ');

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-[#fcfcfc] dark:bg-neutral-950 text-black dark:text-white transition-colors duration-300 font-sans pb-12 flex flex-col border-4 md:border-[12px] border-black dark:border-white">
        
        {/* === TOP BAR NAVIGATION === */}
        <header className="border-b-4 border-black dark:border-white bg-white dark:bg-neutral-900 sticky top-0 z-40 px-6 md:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-1 text-neutral-500 dark:text-neutral-400">
              Interactive Hangman Game
            </p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-5xl md:text-8xl font-black leading-none tracking-tighter uppercase font-display">
                HANGMAN
              </h1>
              <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono px-1.5 py-0.5 font-bold border border-black dark:border-white">
                v2.0
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto md:text-right">


            {/* Config controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Game Mode Toggle */}
              <div className="bg-neutral-100 dark:bg-neutral-900 p-1 flex border-2 border-black dark:border-white">
                <button
                  id="btn-mode-player"
                  onClick={() => setGameMode('player')}
                  className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    gameMode === 'player'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                  title="Player Guessing Mode"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Player</span>
                </button>
                <button
                  id="btn-mode-ai"
                  onClick={() => setGameMode('ai')}
                  className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    gameMode === 'ai'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                  title="AI Guessing Mode"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Guesses</span>
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="bg-neutral-100 dark:bg-neutral-900 p-1 flex border-2 border-black dark:border-white">
                <button
                  id="btn-mode-modern"
                  onClick={() => setViewMode('modern')}
                  className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                    viewMode === 'modern'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                  title="Sleek Vector Art Mode"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Modern</span>
                </button>
                <button
                  id="btn-mode-retro"
                  onClick={() => setViewMode('retro')}
                  className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                    viewMode === 'retro'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                  title="Retro Console ASCII Mode"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Retro</span>
                </button>
                <button
                  id="btn-mode-console"
                  onClick={() => {
                    setViewMode('console');
                    // Automatically switch to Standard Words (first category) when switching to console mode
                    const codealphaCat = CATEGORIES.find(c => c.id === 'codealpha');
                    if (codealphaCat) {
                      setSelectedCategory(codealphaCat);
                      startNewGame(codealphaCat);
                    }
                  }}
                  className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                    viewMode === 'console'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                  title="Simplified Command-Line Console Mode (No graphics or audio)"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Console</span>
                </button>
              </div>

              {/* Mute toggle */}
              <button
                id="btn-toggle-mute"
                onClick={toggleMute}
                className="p-2.5 bg-white hover:bg-black hover:text-white dark:bg-neutral-900 dark:hover:bg-white dark:hover:text-black border-2 border-black dark:border-white text-black dark:text-white transition-all duration-150"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Theme Toggle */}
              <button
                id="btn-toggle-theme"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2.5 bg-white hover:bg-black hover:text-white dark:bg-neutral-900 dark:hover:bg-white dark:hover:text-black border-2 border-black dark:border-white text-black dark:text-white transition-all duration-150"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* === MAIN CONTENT BODY === */}
        <main className="max-w-7xl w-full mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
          
          {/* === NOTIFICATION FLOATER === */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-24 right-4 md:right-8 z-50 px-4 py-3 border-4 border-black dark:border-white bg-yellow-300 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[11px] font-black uppercase tracking-wider flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-black animate-ping" />
                <span>{notification.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* === LEFT AREA: CATEGORIES, GAME BOARD & INPUT === */}
          <div className="lg:col-span-7 flex flex-col gap-8 w-full">
            
            {/* Category Selector Card */}
            <div className="bg-[#f8f8f8] dark:bg-neutral-900 border-4 border-black dark:border-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <div className="flex items-center justify-between mb-4 border-b-2 border-black dark:border-white pb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-black dark:text-white" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">
                    WORD CATEGORY
                  </span>
                </div>
                {isCustomMode && (
                  <span className="bg-yellow-300 text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-black animate-pulse">
                    Custom Word Mode
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    id={`btn-cat-${cat.id}`}
                    onClick={() => changeCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                      selectedCategory.id === cat.id && !isCustomMode
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : 'bg-white text-black dark:bg-neutral-800 dark:text-neutral-300 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 font-mono font-bold uppercase leading-relaxed">
                {!isCustomMode ? selectedCategory.description : "You are currently decrypting a custom challenge word entered below."}
              </p>
            </div>

            {gameMode === 'ai' && !aiWordEntered ? (
              /* === AI MODE SETUP CARD === */
              <div className="bg-white dark:bg-neutral-900 border-4 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-black dark:border-white pb-3">
                  <Bot className="w-5 h-5 text-black dark:text-white" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">
                    AI DECRYPTION ENGINE SETUP
                  </span>
                </div>

                {/* Setup Mode Tabs */}
                <div className="flex border-b-4 border-black dark:border-white mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMindReadMode(false);
                    }}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider border-r-4 border-black dark:border-white transition-all ${
                      !isMindReadMode
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    🔒 Custom Secret Word
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMindReadMode(true);
                    }}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all ${
                      isMindReadMode
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    🧠 Mind-Read Mode
                  </button>
                </div>

                {/* AI Difficulty Selector */}
                <div className="mb-6 pb-5 border-b-2 border-black dark:border-neutral-800">
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                    AI Solving Difficulty:
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 border-2 border-black dark:border-white">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setAiDifficulty(diff)}
                        className={`py-2 text-[11px] font-black uppercase tracking-wider transition-all border-2 cursor-pointer ${
                          aiDifficulty === diff
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                            : 'bg-white text-black dark:bg-neutral-800 dark:text-white border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {diff === 'easy' && '🟢 Easy'}
                        {diff === 'medium' && '🟡 Medium'}
                        {diff === 'hard' && '🔴 Hard'}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 mt-2 font-bold uppercase leading-relaxed">
                    {aiDifficulty === 'easy' && "Easy: AI ignores some word matches, making less optimal guesses and mistakes."}
                    {aiDifficulty === 'medium' && "Medium: AI has slightly imperfect word decryption. Balanced gameplay."}
                    {aiDifficulty === 'hard' && "Hard (Default): AI works as a perfect engine with full candidate elimination."}
                  </p>
                </div>

                {isMindReadMode ? (
                  /* --- MIND-READ SETUP --- */
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="font-display font-black text-xl mb-2 uppercase tracking-tight">
                        🧠 Think of a word and let the AI read your mind!
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 font-mono font-bold uppercase leading-relaxed">
                        In Mind-Read Mode, you don't type your secret word at the start. Instead, just specify its length and genre. The AI will make guesses, and you act as the referee to confirm them!
                      </p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-400 dark:border-emerald-500/30 p-3 flex items-center gap-3">
                      <div className="bg-emerald-500 text-black px-2 py-1 font-bold text-xs font-mono select-none">
                        🔒 ZERO-KNOWLEDGE
                      </div>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-mono leading-tight flex-1">
                        Your secret word remains 100% hidden in your own mind! The AI has absolutely no way of accessing it, making this a true offline-safe privacy challenge.
                      </p>
                    </div>

                    {/* Word Length Selector */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                        Secret Word Length: <span className="text-sm font-black text-black dark:text-white font-mono ml-1">{mindReadLength} Letters</span>
                      </label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <input
                          type="range"
                          min="2"
                          max="15"
                          value={mindReadLength}
                          onChange={(e) => setMindReadLength(parseInt(e.target.value, 10))}
                          className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                        />
                        <div className="flex gap-1.5 justify-center">
                          {[4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setMindReadLength(num)}
                              className={`w-8 h-8 flex items-center justify-center border-2 border-black dark:border-white font-mono text-xs font-bold transition-all ${
                                mindReadLength === num
                                  ? 'bg-black text-white dark:bg-white dark:text-black'
                                  : 'bg-white text-black dark:bg-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Genre Input & Quick Selector */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                        Word Genre / Category Hint:
                      </label>
                      <input
                        type="text"
                        value={mindReadGenre === 'any' ? '' : mindReadGenre}
                        onChange={(e) => setMindReadGenre(e.target.value || 'any')}
                        placeholder="e.g. Science, Food, Gaming, Animal, Country, Movie..."
                        className="w-full bg-white dark:bg-neutral-900 border-4 border-black dark:border-white px-4 py-3 text-sm font-mono focus:outline-none text-black dark:text-white font-bold uppercase tracking-wider"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {['any', 'animals', 'food', 'gaming', 'science', 'movies', 'technology', 'countries'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setMindReadGenre(g)}
                            className={`px-3 py-1 text-[10px] font-black uppercase border-2 border-black dark:border-white tracking-wider transition-all ${
                              mindReadGenre === g
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-white text-black dark:bg-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            }`}
                          >
                            {g === 'any' ? 'Any Category' : g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => startMindReadGame(mindReadLength, mindReadGenre)}
                      className="bg-yellow-300 border-4 border-black text-black font-black uppercase px-6 py-4 text-xs tracking-wider hover:translate-x-[1px] hover:translate-y-[1px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer text-center w-full"
                    >
                      START MIND-READ SESSION 🧠
                    </button>
                  </div>
                ) : (
                  /* --- TRADITIONAL SETUP --- */
                  <>
                    <h3 className="font-display font-black text-xl mb-3 uppercase tracking-tight">
                      🤫 Enter a secret word for the AI to guess
                    </h3>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-400 dark:border-emerald-500/30 p-3 mb-6 flex items-center gap-3">
                      <div className="bg-emerald-500 text-black px-2 py-1 font-bold text-xs font-mono select-none">
                        🔒 ZERO-KNOWLEDGE
                      </div>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-mono leading-tight flex-1">
                        The secret word stays strictly in your browser! The backend Gemini solver is only fed the word length pattern (e.g., <span className="font-bold underline">_ _ _ _</span>) and incorrect guesses, keeping your word fully hidden and encrypted from the AI.
                      </p>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const cleaned = aiSecretInput.replace(/[^a-zA-Z]/g, '').trim().toLowerCase();
                      if (cleaned.length < 2) {
                        triggerNotification('Secret word must contain at least 2 letters!', 'warning');
                        return;
                      }
                      setWord(cleaned);
                      setMindReadPattern(Array(cleaned.length).fill(null));
                      setMindReadWrongLetters([]);
                      setAiWordEntered(true);
                      setGuessedLetters([]);
                      setWrongGuesses(0);
                      setGameStatus('playing');
                      setAiLogs([`⚡ System initialized. Secret word of ${cleaned.length} letters accepted.`]);
                      setAiSecretInput('');
                      triggerNotification('Secret word locked! Let the AI try to guess.', 'success');
                    }} className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <input
                            id="input-ai-word"
                            type={showAiWord ? "text" : "password"}
                            value={aiSecretInput}
                            onChange={(e) => setAiSecretInput(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                            placeholder="Enter secret word (min 2 letters)..."
                            className={`w-full bg-white dark:bg-neutral-900 border-4 border-black dark:border-white pl-4 pr-12 py-3 text-sm font-mono focus:outline-none text-black dark:text-white font-black tracking-widest ${showAiWord ? 'uppercase' : ''}`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowAiWord(!showAiWord)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors flex items-center justify-center p-1"
                            title={showAiWord ? "Hide word" : "Show word"}
                          >
                            {showAiWord ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <button
                          type="submit"
                          className="bg-yellow-300 border-4 border-black text-black font-black uppercase px-6 py-3 text-xs tracking-wider hover:translate-x-[1px] hover:translate-y-[1px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
                        >
                          LOCK WORD
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start">
                        <span className="text-xs text-neutral-400 font-mono font-bold uppercase">Or auto-select a secret word:</span>
                        <button
                          type="button"
                          onClick={handleRandomWordForAi}
                          className="bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white text-xs font-black uppercase px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
                        >
                          🎲 Category Secret Word
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            ) : (
              <>
                {viewMode === 'console' ? (
                  /* === SIMULATED PYTHON CONSOLE TERMINAL === */
                  <div className="bg-neutral-950 text-emerald-400 p-6 border-4 border-black font-mono text-xs md:text-sm rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative select-text flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                        <span className="text-[10px] text-neutral-500 uppercase font-black tracking-widest pl-2 font-sans">Python 3.10 Terminal</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 uppercase font-bold bg-neutral-900 px-2 py-0.5 border border-neutral-800">
                        simplified_hangman.py
                      </div>
                    </div>

                    {/* Scrollable terminal buffer output */}
                    <div className="flex flex-col gap-1 leading-relaxed overflow-y-auto max-h-[380px] min-h-[250px] bg-black/40 p-4 border border-neutral-900 rounded-sm font-mono whitespace-pre-wrap select-text">
                      {getConsoleOutput().map((line, idx) => {
                        let colorClass = 'text-neutral-300';
                        if (line.startsWith('>>>')) {
                          colorClass = 'text-amber-400 font-bold';
                        } else if (line.startsWith('Incorrect') || line.startsWith('GAME OVER')) {
                          colorClass = 'text-rose-400';
                        } else if (line.startsWith('Correct') || line.startsWith('CONGRATULATIONS')) {
                          colorClass = 'text-emerald-400';
                        } else if (line.startsWith('===')) {
                          colorClass = 'text-neutral-600';
                        }
                        return (
                          <div key={idx} className={colorClass}>
                            {line}
                          </div>
                        );
                      })}
                    </div>

                    {/* Prompt input field or controls */}
                    {gameStatus === 'playing' ? (
                      <div className="flex flex-col sm:flex-row items-center gap-3 bg-neutral-900 p-4 border border-neutral-800">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="text-amber-400 font-bold select-none">&gt;&gt;&gt;</span>
                          <span className="text-neutral-400 uppercase text-xs font-bold tracking-wider font-sans">Enter your guess:</span>
                        </div>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const input = form.elements.namedItem('consoleInput') as HTMLInputElement;
                          const letter = input.value.trim().toLowerCase();
                          if (/^[a-z]$/.test(letter)) {
                            makeGuess(letter);
                            input.value = '';
                          } else {
                            triggerNotification('Please enter exactly one valid letter (A-Z)!', 'warning');
                          }
                        }} className="flex gap-2 w-full sm:flex-1">
                          <input
                            name="consoleInput"
                            type="text"
                            maxLength={1}
                            autoFocus
                            autoComplete="off"
                            placeholder="[A-Z]"
                            className="flex-1 bg-black text-emerald-400 border border-neutral-800 px-3 py-2 uppercase font-mono text-center focus:outline-none focus:border-emerald-500 tracking-widest text-base font-black"
                          />
                          <button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase px-5 py-2 text-xs tracking-wider border border-black transition-all cursor-pointer font-mono"
                          >
                            EXECUTE
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-5 bg-neutral-900 border border-neutral-800 gap-3">
                        <p className="text-xs text-neutral-400 uppercase font-black tracking-widest font-sans">
                          {gameStatus === 'won' ? '🎉 YOU WIN! PLAY AGAIN?' : '💀 GAME OVER! REBOOT SCRIPT?'}
                        </p>
                        <button
                          onClick={() => startNewGame()}
                          className="bg-amber-400 text-black font-black uppercase px-6 py-2.5 text-xs tracking-wider border border-black hover:bg-amber-300 transition-all cursor-pointer font-mono"
                        >
                          RESTART GAME (python hangman_game.py)
                        </button>
                      </div>
                    )}

                    {/* Helper info targeting Python/Standard scope */}
                    <div className="border-t border-neutral-900 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-neutral-500 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-sans">Scope: Standard words • 6 incorrect guesses max • Pure text CLI</span>
                      </div>
                      <button
                        onClick={() => {
                          const codealphaCat = CATEGORIES.find(c => c.id === 'codealpha');
                          if (codealphaCat) {
                            changeCategory(codealphaCat);
                          }
                        }}
                        className="text-[9px] hover:text-emerald-400 underline uppercase tracking-widest text-left cursor-pointer font-sans"
                      >
                        Load Standard Words List
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* === HANGMAN GAMEPLAY VISUAL CARD === */}
                    <div className="bg-white dark:bg-neutral-900 border-4 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col md:flex-row gap-6 items-center">
                  
                  {/* The Hangman Art block */}
                  <div className="w-full md:w-2/5 flex flex-col items-center">
                    {viewMode === 'modern' ? (
                      <SVGHangman wrongGuesses={wrongGuesses} />
                    ) : (
                      <div className="w-full bg-black text-green-400 p-5 border-4 border-black dark:border-white font-mono text-xs leading-none flex items-center justify-center overflow-x-auto min-h-64 shadow-inner">
                        <pre className="text-left font-bold leading-tight">
                          {HANGMAN_ASCII_STAGES[wrongGuesses]}
                        </pre>
                      </div>
                    )}
                    
                    {/* Guess statistics banner */}
                    <div className="mt-4 flex gap-4 text-[10px] font-mono font-black uppercase tracking-wider text-black dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-black dark:bg-white border border-black dark:border-white" />
                        <span>Wrong: {wrongGuesses}/{maxWrong}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-red-500 border border-black dark:border-white animate-pulse" />
                        <span>Chances: {maxWrong - wrongGuesses}</span>
                      </div>
                    </div>
                  </div>

                  {/* Secret Word Display & Interaction */}
                  <div className="w-full md:w-3/5 flex flex-col items-center md:items-start text-center md:text-left justify-between h-full py-2 min-h-[220px]">
                    
                    <div className="w-full">
                      <div className="text-xs font-black tracking-[0.25em] text-neutral-400 dark:text-neutral-500 uppercase mb-4">
                        TARGET WORD ({word.length} letters)
                      </div>
                      
                      {/* Word spaces */}
                      <div className="py-4 overflow-x-auto max-w-full flex justify-center md:justify-start gap-2">
                        {isInteractivePatternMode ? (
                          mindReadPattern.map((char, index) => {
                            const isRevealed = char !== null;
                            return (
                              <span
                                key={index}
                                className={`text-4xl md:text-6xl font-black font-display uppercase border-b-8 ${
                                  isRevealed ? 'border-black dark:border-white text-black dark:text-white' : 'border-neutral-300 dark:border-neutral-700 text-transparent'
                                } pb-2 px-1 inline-block min-w-[2.5rem] text-center`}
                              >
                                {isRevealed ? char.toUpperCase() : '_'}
                              </span>
                            );
                          })
                        ) : (
                          word.split('').map((char, index) => {
                            const isRevealed = guessedLetters.includes(char);
                            return (
                              <span
                                key={index}
                                className={`text-4xl md:text-6xl font-black font-display uppercase border-b-8 ${
                                  isRevealed ? 'border-black dark:border-white text-black dark:text-white' : 'border-neutral-300 dark:border-neutral-700 text-transparent'
                                } pb-2 px-1 inline-block min-w-[2.5rem] text-center`}
                              >
                                {isRevealed ? char.toUpperCase() : '_'}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Guessed Letters list */}
                    <div className="w-full border-t-2 border-black dark:border-white pt-4 mt-4">
                      <div className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                        {gameMode === 'ai' ? "AI Guessed Letters:" : "Guessed Letters:"}
                      </div>
                      <div className="flex flex-wrap gap-1.5 justify-center md:justify-start min-h-[28px]">
                        {guessedLetters.length === 0 ? (
                          <span className="text-xs font-mono font-bold uppercase text-neutral-400 dark:text-neutral-600">None yet</span>
                        ) : (
                          Array.from(new Set(guessedLetters)).sort().map((l: string) => {
                            const inWord = isInteractivePatternMode
                              ? mindReadPattern.includes(l)
                              : word.includes(l);
                            return (
                              <span
                                key={l}
                                className={`text-xs font-black font-mono px-2 py-0.5 border-2 ${
                                  inWord
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-500'
                                    : 'bg-red-100 text-red-800 border-red-500'
                                }`}
                              >
                                {l.toUpperCase()}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Restart / Reset panel */}
                    <div className="w-full flex gap-3 pt-5">
                      {gameMode === 'ai' ? (
                        <button
                          id="btn-ai-setup-reset"
                          onClick={() => setAiWordEntered(false)}
                          className="flex-1 bg-yellow-300 border-4 border-black text-black font-black uppercase py-3 px-5 text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Set New Secret Word
                        </button>
                      ) : (
                        <button
                          id="btn-restart-game"
                          onClick={() => startNewGame()}
                          className="flex-1 bg-yellow-300 border-4 border-black text-black font-black uppercase py-3 px-5 text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                        >
                          <RotateCcw className="w-4 h-4" />
                          New Word (Random)
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {gameMode === 'player' ? (
                  /* === PLAYER INTERACTIVE KEYBOARD GRID === */
                  <div className="bg-[#f8f8f8] dark:bg-neutral-900 border-4 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Keyboard className="w-4 h-4" />
                        Interactive Keyboard
                      </span>
                      <span className="text-[10px] font-mono font-black uppercase text-neutral-400 dark:text-neutral-500 hidden sm:inline">
                        PHYSICAL KEYBOARD INPUT SUPPORTED (A-Z)
                      </span>
                    </div>

                    <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                      {alphabet.map((letter) => {
                        const isGuessed = guessedLetters.includes(letter);
                        const isCorrect = isGuessed && word.includes(letter);
                        const isWrong = isGuessed && !word.includes(letter);

                        let btnClass = 'bg-white dark:bg-neutral-800 text-black dark:text-white border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black';
                        if (isCorrect) {
                          btnClass = 'bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white font-black';
                        } else if (isWrong) {
                          btnClass = 'bg-gray-200 text-gray-400 border-neutral-300 dark:bg-neutral-800/80 dark:text-neutral-600 dark:border-neutral-800/80 line-through cursor-not-allowed opacity-40';
                        }

                        return (
                          <button
                            key={letter}
                            id={`btn-letter-${letter}`}
                            onClick={() => makeGuess(letter)}
                            disabled={isWrong || gameStatus !== 'playing'}
                            className={`h-11 sm:h-12 rounded-none text-sm font-black uppercase transition-all flex items-center justify-center select-none ${btnClass}`}
                          >
                            {letter}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* === AI DECRYPTION SYSTEM TERMINAL CONSOLE === */
                  <div className="bg-[#f8f8f8] dark:bg-neutral-900 border-4 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b-2 border-black dark:border-white pb-4">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-display">
                          <Bot className="w-4 h-4 text-black dark:text-white" />
                          AI Decryption Control Unit
                        </span>
                        <p className="text-[9px] text-neutral-400 font-mono mt-0.5 font-bold uppercase">ALGORITHM: NEURAL PATTERN DICTIONARY MATCHING (SOLVER PRO)</p>
                      </div>

                      {/* Autoplay Switch & Interactive step guessing buttons */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsAutoplay(!isAutoplay)}
                          disabled={gameStatus !== 'playing'}
                          className={`px-3 py-1.5 text-xs font-black uppercase border-2 tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                            isAutoplay
                              ? 'bg-emerald-500 text-white border-black animate-pulse'
                              : 'bg-white text-black dark:bg-neutral-800 dark:text-neutral-300 border-black dark:border-white hover:bg-black hover:text-white'
                          }`}
                        >
                          {isAutoplay ? "⚡ Stop Autoplay" : "▶ Autoplay AI"}
                        </button>

                        <button
                          onClick={makeAiGuess}
                          disabled={isAutoplay || gameStatus !== 'playing' || pendingAiProposal !== null}
                          className="bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white text-xs font-black uppercase px-4 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                        >
                          <span>Step Guess</span>
                          <span>🤖</span>
                        </button>
                      </div>
                    </div>

                    {/* Evaluation Mode Choice */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-100 dark:bg-neutral-950 p-3 border-2 border-black dark:border-white">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Decryption Mode:</span>
                        <span className="text-xs font-black font-mono text-black dark:text-white uppercase">
                          {aiEvaluationMode === 'auto' ? "🤖 AUTO-EVALUATE SECRET WORD" : "🧑‍⚖️ INTERACTIVE REFEREE (YOU CONFIRM GUESSES)"}
                        </span>
                      </div>
                      <div className="flex gap-1.5 bg-neutral-200 dark:bg-neutral-800 p-1 border border-black dark:border-white">
                        <button
                          onClick={() => {
                            setAiEvaluationMode('auto');
                            setPendingAiProposal(null);
                          }}
                          className={`px-2.5 py-1 text-[9px] font-black uppercase transition-all cursor-pointer ${
                            aiEvaluationMode === 'auto'
                              ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                              : 'text-neutral-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          Auto
                        </button>
                        <button
                          onClick={() => {
                            setAiEvaluationMode('interactive');
                          }}
                          className={`px-2.5 py-1 text-[9px] font-black uppercase transition-all cursor-pointer ${
                            aiEvaluationMode === 'interactive'
                              ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                              : 'text-neutral-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          Referee
                        </button>
                      </div>
                    </div>
                    
                    {/* Security and Privacy Reassurance Badge */}
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-400 dark:border-emerald-500/30 p-3 flex items-center gap-3">
                      <div className="bg-emerald-500 text-black px-2 py-1 font-bold text-xs select-none">
                        🔒 SECURE
                      </div>
                      <div className="flex-1 text-[10px] leading-tight text-emerald-800 dark:text-emerald-400 font-mono">
                        <span className="font-bold uppercase block mb-0.5">Word is 100% Hidden from AI</span>
                        The secret word is kept strictly in local browser memory. The backend Gemini model only receives the abstract length pattern (e.g., <span className="underline font-bold">{"_ ".repeat(word.length).trim()}</span>) and incorrect guesses, proving zero-knowledge gameplay.
                      </div>
                    </div>

                    {/* Pending Referee Proposal Panel */}
                    {pendingAiProposal && gameStatus === 'playing' && (
                      <div className="w-full">
                        {isInteractivePatternMode && pendingSlotSelectionLetter ? (
                          /* Slot Placement Selector */
                          <div className="bg-emerald-50 dark:bg-emerald-950/20 border-4 border-emerald-400 dark:border-emerald-500 p-4 flex flex-col items-center text-center gap-3 shadow-md">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                              <Bot className="w-5 h-5 animate-bounce text-black dark:text-white" />
                              <span className="text-xs font-black uppercase tracking-widest font-mono">SPECIFY LETTER POSITIONS</span>
                            </div>

                            <p className="text-xs sm:text-sm font-bold text-black dark:text-white leading-relaxed">
                              Select the slot(s) where the letter{' '}
                              <span className="text-lg font-black bg-emerald-300 dark:bg-emerald-800 px-2.5 py-0.5 border-2 border-black dark:border-white uppercase font-mono inline-block mx-1 text-black dark:text-white">
                                {pendingSlotSelectionLetter.toUpperCase()}
                              </span>{' '}
                              appears in your secret word:
                            </p>

                            <div className="flex flex-wrap gap-2 justify-center py-2">
                              {Array(isMindReadMode ? mindReadLength : word.length).fill(null).map((_, idx) => {
                                const currentFilledChar = mindReadPattern[idx];
                                const isFilled = currentFilledChar !== null;
                                const isDraftSelected = draftSlots[idx];

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    disabled={isFilled}
                                    onClick={() => {
                                      setDraftSlots(prev => {
                                        const next = [...prev];
                                        next[idx] = !next[idx];
                                        return next;
                                      });
                                    }}
                                    className={`w-11 h-14 flex flex-col items-center justify-between p-1 border-2 font-mono font-bold transition-all ${
                                      isFilled
                                        ? 'bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed dark:bg-neutral-800 dark:border-neutral-700'
                                        : isDraftSelected
                                          ? 'bg-emerald-500 text-white border-black scale-105 shadow-md dark:border-white'
                                          : 'bg-white text-black border-black dark:bg-neutral-900 dark:text-white dark:border-white hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                    }`}
                                  >
                                    <span className="text-[9px] text-neutral-400 font-bold select-none">{idx + 1}</span>
                                    <span className="text-base font-black uppercase">
                                      {isFilled ? currentFilledChar.toUpperCase() : isDraftSelected ? pendingSlotSelectionLetter.toUpperCase() : '_'}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={confirmSlotSelection}
                              className="bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white text-xs font-black uppercase px-6 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
                            >
                              Confirm Letter Placements ✅
                            </button>
                          </div>
                        ) : (
                          /* Normal YES / NO referee prompt */
                          <div className="bg-yellow-50 dark:bg-yellow-950/20 border-4 border-yellow-400 dark:border-yellow-500 p-4 flex flex-col items-center text-center gap-3 animate-pulse shadow-md">
                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                              <Bot className="w-5 h-5 animate-bounce" />
                              <span className="text-xs font-black uppercase tracking-widest font-mono">AI GUESS PROPOSAL</span>
                            </div>

                            <p className="text-xs sm:text-sm font-bold text-black dark:text-white leading-relaxed">
                              Is the {pendingAiProposal.type === 'word' ? 'secret word' : 'letter'}{' '}
                              <span className="text-lg font-black bg-yellow-300 dark:bg-yellow-800 px-2.5 py-0.5 border-2 border-black dark:border-white uppercase font-mono inline-block mx-1 text-black dark:text-white">
                                {pendingAiProposal.value.toUpperCase()}
                              </span>{' '}
                              correct?
                            </p>

                            <div className="flex gap-4 w-full max-w-xs mt-1">
                              <button
                                onClick={() => handleRefereeVerdict(true)}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-black font-black uppercase py-2 px-4 text-xs tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                              >
                                ✅ YES, Correct!
                              </button>
                              <button
                                onClick={() => handleRefereeVerdict(false)}
                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white border-2 border-black font-black uppercase py-2 px-4 text-xs tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                              >
                                ❌ NO, Wrong!
                              </button>
                            </div>
                            <p className="text-[9px] text-neutral-400 font-mono uppercase">
                              Confirming will update the game board, statistics, and log console.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CRT Retro Screen Terminal */}
                    <div className="bg-black text-green-400 p-5 border-4 border-black font-mono text-xs leading-relaxed flex flex-col gap-2 min-h-[180px] max-h-[250px] overflow-y-auto shadow-inner relative select-text">
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                        <span className="text-[9px] text-green-500 font-mono font-bold tracking-widest uppercase">ONLINE</span>
                      </div>

                      {aiLogs.length === 0 ? (
                        <div className="text-neutral-500 italic animate-pulse">Initializing quantum registers... Waiting for next command.</div>
                      ) : (
                        aiLogs.map((log, i) => {
                          const isSuccess = log.includes('✅');
                          const isFail = log.includes('❌');
                          const colorClass = isSuccess ? 'text-emerald-400' : isFail ? 'text-rose-400' : 'text-amber-400';
                          return (
                            <div key={i} className={`flex items-start gap-1 ${i === 0 ? 'font-bold' : 'opacity-85'}`}>
                              <span className="text-neutral-500 select-none">&gt;</span>
                              <span className={colorClass}>{log}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
              </>
            )}
          </div>

          {/* === RIGHT AREA: CHALLENGE MODE & HISTORIC STATS === */}
          <div className="lg:col-span-5 flex flex-col gap-8 w-full">
            
            {/* Custom Word / Challenge mode card (Only enabled for Player Mode to avoid setup collisions) */}
            {gameMode === 'player' && (
              <div className="bg-white dark:bg-neutral-900 border-4 border-black dark:border-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <h3 className="font-display font-black text-sm uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-black dark:text-white" />
                  Custom Word Challenge
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 leading-relaxed font-mono uppercase font-bold">
                  Type a secret word below to play. The screen will reload so a friend can guess it.
                </p>
                
                <form onSubmit={handleCustomWordSubmit} className="flex gap-2 items-stretch">
                  <div className="relative flex-1">
                    <input
                      id="input-custom-word"
                      type={showCustomWord ? "text" : "password"}
                      value={customWordInput}
                      onChange={(e) => setCustomWordInput(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                      placeholder="Secret word..."
                      className={`w-full bg-white dark:bg-neutral-900 border-2 border-black dark:border-white pl-3 pr-10 py-2 text-xs font-mono focus:outline-none text-black dark:text-white font-black tracking-widest ${showCustomWord ? 'uppercase' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomWord(!showCustomWord)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors flex items-center justify-center p-1"
                      title={showCustomWord ? "Hide word" : "Show word"}
                    >
                      {showCustomWord ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    id="btn-submit-custom-word"
                    className="bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white font-black px-4 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                  >
                    <Play className="w-3 h-3" />
                    Set
                  </button>
                </form>
              </div>
            )}

            {/* Stats tracking panel */}
            <StatsPanel stats={stats} aiStats={aiStats} activeMode={gameMode} onResetStats={handleResetStats} />
            
            {/* Realtime System Hint Log Footer */}
            <div className="p-5 border-4 border-black bg-yellow-300 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[11px] font-black leading-tight uppercase font-mono">
                {gameStatus === 'playing' ? (
                  `SYSTEM LOG: Guessed ${guessedLetters.length} letters. ${maxWrong - wrongGuesses} mistakes remaining. Keep focused.`
                ) : gameStatus === 'won' ? (
                  gameMode === 'ai'
                    ? `SYSTEM LOG: Success! AI Decrypter successfully decoded the target word '${word.toUpperCase()}'.`
                    : `SYSTEM LOG: Success! The target word was correctly decrypted. Current streak is ${stats.currentStreak}!`
                ) : (
                  gameMode === 'ai'
                    ? `SYSTEM LOG: AI Decrypter failed. Target word '${word.toUpperCase()}' was secure!`
                    : `SYSTEM LOG: Decrypter failed. Target word was '${word.toUpperCase()}'. Attempt backup restart.`
                )}
              </p>
            </div>

          </div>
        </main>

        {/* === MODAL OVERLAYS (GAME STATUS OVERLAYS) === */}
        <AnimatePresence>
          {gameStatus !== 'playing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xs flex items-center justify-center p-4"
              id="game-over-overlay"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-neutral-900 border-[6px] border-black dark:border-white p-8 max-w-sm w-full text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
              >
                {gameStatus === 'won' ? (
                  <>
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-none border-4 border-black flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 animate-bounce text-black" />
                    </div>
                    <h2 className="font-display font-black text-3xl text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-tight">
                      {gameMode === 'ai' ? '🤖 AI WINS!' : '🎉 YOU WIN!'}
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 font-mono font-black uppercase tracking-wider px-2 leading-relaxed">
                      {gameMode === 'ai' ? 'I guessed your word! Better luck next time! 😄' : 'Excellent guessing!'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-red-100 text-red-800 rounded-none border-4 border-black flex items-center justify-center mx-auto mb-4">
                      {gameMode === 'ai' ? (
                        <Trophy className="w-8 h-8 text-black fill-yellow-300" />
                      ) : (
                        <Skull className="w-8 h-8 animate-pulse text-black" />
                      )}
                    </div>
                    <h2 className="font-display font-black text-3xl text-red-500 mb-1 uppercase tracking-tight">
                      {gameMode === 'ai' ? '🏆 YOU WIN!' : '💀 GAME OVER'}
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 font-mono font-black uppercase tracking-wider px-2 leading-relaxed">
                      {gameMode === 'ai' ? "AI couldn't guess your word! The AI has been defeated! 🏆" : 'No chances remaining'}
                    </p>
                  </>
                )}

                {isMindReadMode && !userFinalRevealedWord ? (
                  <div className="bg-[#f8f8f8] dark:bg-neutral-950 p-4 border-2 border-black dark:border-white mb-6">
                    <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-black mb-2 leading-relaxed">
                      🧠 AI couldn't read your mind! Type the word you thought of:
                    </div>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const inputElement = e.currentTarget.elements.namedItem('revealed-word-input') as HTMLInputElement;
                      const inputVal = inputElement.value.trim().toLowerCase().replace(/[^a-zA-Z]/g, '');
                      if (inputVal.length === mindReadLength) {
                        setUserFinalRevealedWord(inputVal);
                        setWord(inputVal);
                        triggerNotification('Secret word revealed!', 'success');
                      } else {
                        triggerNotification(`The word must be exactly ${mindReadLength} letters!`, 'warning');
                      }
                    }} className="flex gap-2">
                      <input
                        name="revealed-word-input"
                        type="text"
                        placeholder={`${mindReadLength} letters...`}
                        className="flex-1 bg-white dark:bg-neutral-900 border-2 border-black dark:border-white px-3 py-1.5 text-xs font-mono uppercase tracking-widest font-black focus:outline-none"
                        maxLength={mindReadLength}
                        required
                      />
                      <button
                        type="submit"
                        className="bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white text-[10px] font-black uppercase px-3 py-1.5 hover:bg-neutral-800 transition-all"
                      >
                        REVEAL
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-[#f8f8f8] dark:bg-neutral-950 p-4 border-2 border-black dark:border-white mb-6">
                    <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-black mb-1">
                      The secret word was:
                    </div>
                    <div className="text-2xl font-mono font-black tracking-widest text-black dark:text-white uppercase">
                      {isMindReadMode ? userFinalRevealedWord : word}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    id="btn-modal-restart"
                    onClick={() => startNewGame()}
                    className="w-full bg-yellow-300 border-4 border-black text-black font-black py-3 px-4 text-sm uppercase cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    Play Again
                  </button>
                  <button
                    id="btn-modal-close"
                    onClick={() => {
                      // Allow browsing the final board state
                      setGameStatus('playing');
                      setWrongGuesses(gameStatus === 'won' ? 0 : 6); // visual safe state
                    }}
                    className="w-full text-xs text-neutral-500 hover:text-black dark:hover:text-white hover:underline transition-colors font-black font-mono uppercase tracking-wider py-1"
                  >
                    Browse Board State
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
