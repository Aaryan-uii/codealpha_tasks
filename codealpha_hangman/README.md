# 🔤 Interactive Hangman Game & AI Solver

A feature-packed, dual-interface **Hangman Game** featuring a modern **React + Tailwind CSS** web application with a Neo-Brutalist aesthetic, an **AI Decryption Engine**, and a standalone **Python CLI Command-Line Application**.

---

## 🚀 Quick Overview

This repository contains two ways to experience the game:
1. **Full-Stack Web Application (React + Vite + Express)**:
   - **Interactive Visual GUI**: Neo-Brutalist design with custom ASCII stage graphics, category selector, keyboard, retro audio cues, and live statistics.
   - **AI Decryption / Mind-Read Mode**: Mind-Read mode where you think of a word in your head, and the AI algorithmically decodes it with adjustable difficulty levels (*Easy*, *Medium*, *Hard*).
   - **Terminal Console Mode**: Retro CLI emulation right inside your web browser!
2. **Standalone Python CLI Script (`python/hangman.py`)**:
   - A lightweight command-line implementation in Python that runs in any standard terminal environment.

---

## 📁 Repository Directory Structure

```text
.
├── python/                  # Python standalone CLI application
│   └── hangman.py           # Command-line Python Hangman game script
│
├── src/                     # React frontend source code
│   ├── components/          # Reusable UI components (StatsPanel, SVGHangman, etc.)
│   ├── App.tsx              # Main application & AI decryption engine
│   ├── data.ts              # Word categories & ASCII hangman stages
│   ├── dictionary.ts        # Comprehensive word dictionary
│   ├── soundEffects.ts      # Web Audio API audio synthesizer
│   ├── types.ts             # TypeScript type definitions
│   └── main.tsx             # React entry point
│
├── server.ts                # Express backend server & Gemini API proxy
├── package.json             # Node.js dependencies & scripts
├── vite.config.ts           # Vite configuration
└── README.md                # Project documentation
```

---

## 🐍 1. How to Run the Python Console Version

You can run the standalone Python version directly from your command line terminal.

### Prerequisites
- **Python 3.x** installed on your system.

### Steps to Run
```bash
# Run directly with Python 3
python3 python/hangman.py

# Or navigate into the python directory
cd python
python3 hangman.py
```

### Python Gameplay Instructions
1. Select a word category from the menu (Standard Words, Web Technologies, or Computer Science).
2. Enter single letter guesses or full word guesses.
3. You have **6 incorrect chances** before game over.

---

## 🌐 2. How to Run the Web Application

The web interface is built using **React 19**, **Vite**, **Tailwind CSS**, and **Express**.

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **bun** package manager

### Steps to Run
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000` to view the live app!

---

## 🎮 Web Application Key Features

- 🎨 **Neo-Brutalist Visual Mode**: Bold typography, high-contrast borders, custom vector graphics, and smooth animations.
- 🤖 **AI Mind-Read & Decryption Engine**:
  - Think of a secret word and act as the referee while the AI attempts to decode it step-by-step.
  - **AI Difficulty Modes**:
    - **🟢 Easy**: AI makes occasional missteps and ignores some candidate matches for casual play.
    - **🟡 Medium**: Balanced decryption logic.
    - **🔴 Hard**: Perfect candidate elimination solver.
- 🕹️ **Dual Player Modes**:
  - **Player Guesses**: Classic game where you guess the hidden word.
  - **AI Guesses**: Watch or test the AI as it solves your target word.
- 📊 **Statistics & Streak Tracking**: Keeps track of games played, win rate, current streak, and max streak with local persistence.
- 🔊 **Retro Web Audio Synth**: Synthesized sound effects generated on-the-fly via Web Audio API.

---

## 🛠️ Tech Stack & Dependencies

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide React
- **Backend / Server**: Express, Node.js, `tsx`, `esbuild`
- **Scripting**: Python 3
