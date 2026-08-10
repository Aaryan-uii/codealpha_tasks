# PyBot 🐍 — Interactive Python Rule-Based & AI Chatbot Playground

PyBot is an interactive, visual educational web application designed to help beginners and developers learn fundamental programming concepts—such as `if-elif-else` conditional logic, rule priority pipelines, functions, loops, and string matching—by configuring and chatting with an intelligent rule-based bot backed by Gemini AI.

---

## ✨ Features

- 💬 **Interactive Chat Sandbox**: Chat with PyBot in English, Hindi, or Hinglish (*"namaste 🙏"*, *"kaise ho"*, *"kya kar rahe ho"*).
- 🔀 **Rule Priority Pipeline (`if-elif-else`)**: Visually create, reorder, edit, enable/disable, and test sequential matching rules.
- 🌳 **Live Visual Decision Tree**: Watch input pass through every rule condition in real-time with step-by-step trace highlights.
- 💻 **Python Code Generator**: Inspect and copy raw, executable Python code (`main.py`) matching your rule pipeline.
- 🤖 **Hybrid AI Fallback**: Powered by Gemini 3.6 Flash on the server side when no custom rule matches the user's message.
- 🎨 **UI Customization**: Choose between 5 chat bubble color themes (Indigo, Professional Blue, Vibrant Green, Sunset Rose, Warm Amber) and Light/Dark modes.
- 📥 **Export Chat History**: Export your chat session history to a structured `.json` file anytime.

---

## 📁 Directory & File Structure

```text
├── server.ts                  # Express backend with Vite middleware & Gemini API handler
├── index.html                 # Main HTML entry point
├── package.json               # Dependencies and run scripts
├── metadata.json              # Applet metadata and permissions
├── src/
│   ├── main.tsx               # React application entry point
│   ├── App.tsx                # Main container component and layout state
│   ├── types.ts               # Shared TypeScript interfaces & types
│   ├── index.css              # Global styles with Tailwind CSS
│   ├── components/
│   │   ├── Header.tsx         # Top navigation, mode tabs, theme picker & export buttons
│   │   ├── ChatWindow.tsx     # Chat bubble interface, emoji picker & trace triggers
│   │   ├── RuleEditor.tsx     # Visual if-elif-else rule priority editor & sandbox tester
│   │   ├── VisualFlowchart.tsx# Interactive flow diagram of the rule evaluation pipeline
│   │   ├── CodeInspector.tsx  # Generated Python code view & line-by-line concept breakdown
│   │   ├── TraceModal.tsx     # Modal displaying step-by-step execution details
│   │   └── BotAvatar.tsx      # Animated bot icon with expressions
│   ├── utils/
│   │   ├── chatbotEngine.ts   # Core rule matching algorithm & Python code generator
│   │   └── audio.ts           # Sound effect synthesis utilities
│   └── data/
│       └── defaultRules.ts    # Initial preset rule configuration
```

---

## 🧠 Core Educational Concepts

### 1. Sequential Evaluation (`if-elif-else`)
Rules are evaluated sequentially from top to bottom:
- **`if`**: Evaluates the first rule in the pipeline.
- **`elif`**: Evaluates subsequent rules in order if preceding rules evaluated to `False`.
- **`else`**: The default fallback executed when no prior conditions match.

### 2. Short-Circuiting
As soon as a rule condition evaluates to `True`, PyBot returns that response immediately and skips all remaining rules.

### 3. Match Modes
- **Contains**: Matches if any configured keyword is present inside the user's message.
- **Exact Equals**: Matches only if the message matches a keyword exactly.
- **Starts With**: Matches if the user's message begins with any keyword.

---

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Start Production Server**:
   ```bash
   npm start
   ```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express, Vite
- **AI Integration**: `@google/genai` (Gemini 3.6 Flash)
