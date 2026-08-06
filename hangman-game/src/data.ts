import { Category } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'codealpha',
    name: 'Standard Words',
    description: 'A set of predefined standard words.',
    words: ['python', 'hangman', 'programming', 'developer', 'internship']
  },
  {
    id: 'webdev',
    name: 'Web Technologies',
    description: 'Modern tools and technologies used in web development.',
    words: ['react', 'typescript', 'tailwind', 'javascript', 'html', 'css', 'vite', 'node', 'express', 'database', 'frontend', 'backend']
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    description: 'Fundamental computer science concepts and structures.',
    words: ['algorithm', 'recursion', 'compiler', 'variable', 'function', 'class', 'object', 'database', 'array', 'pointer', 'stack', 'queue']
  }
];

export const HANGMAN_ASCII_STAGES = [
  // 0 wrong
  `   -----
   |   |
       |
       |
       |
       |
=========`,
  // 1 wrong
  `   -----
   |   |
   O   |
       |
       |
       |
=========`,
  // 2 wrong
  `   -----
   |   |
   O   |
   |   |
       |
       |
=========`,
  // 3 wrong
  `   -----
   |   |
   O   |
  /|   |
       |
       |
=========`,
  // 4 wrong
  `   -----
   |   |
   O   |
  /|\\  |
       |
       |
=========`,
  // 5 wrong
  `   -----
   |   |
   O   |
  /|\\  |
  /    |
       |
=========`,
  // 6 wrong — DEAD
  `   -----
   |   |
   O   |
  /|\\  |
  / \\  |
       |
=========`
];
