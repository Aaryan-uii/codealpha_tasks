export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface Category {
  id: string;
  name: string;
  description: string;
  words: string[];
}

export type ViewMode = 'modern' | 'retro' | 'console';

export type GameMode = 'player' | 'ai';

