import { ChatRule } from '../types';

export const INITIAL_RULES: ChatRule[] = [
  {
    id: 'rule-hello',
    keywords: ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'ram ram', 'greetings', 'good morning', 'good afternoon', '🙏'],
    response: 'Namaste! 🙏',
    matchMode: 'contains',
    enabled: true,
    category: 'Greetings / Namaste',
  },
  {
    id: 'rule-how-are-you',
    keywords: ['how are you', 'kaise ho', 'kese ho', 'kaise ho aap', 'kya haal hai', 'kya hal h', 'kaisa h', 'kese ho aap', 'how is it going', '😊'],
    response: "Main bilkul badhiya hoon! 😊 I am doing great, thanks for asking! Aap batao, kaise ho?",
    matchMode: 'contains',
    enabled: true,
    category: 'Small Talk / Kaise ho',
  },
  {
    id: 'rule-kya-kr-rhe',
    keywords: ['kya kr rhe', 'kya kar rahe ho', 'kya kr rahe ho', 'kya chal raha hai', 'kya kar rahe', 'what are you doing', 'kya ho raha hai', '😎'],
    response: 'Bas aapke sawaalon ke jawaab dene ke liye tayaar hoon! 😎 (Evaluating if-elif conditions in real-time!)',
    matchMode: 'contains',
    enabled: true,
    category: 'Activity / Kya kr rhe',
  },
  {
    id: 'rule-bye',
    keywords: ['bye', 'goodbye', 'alvida', 'chalta hu', 'chalta hoon', 'fir milenge', 'phir milenge', 'see you', 'exit', '👋'],
    response: 'Alvida! 👋 Goodbye! Apna khyal rakhna, phir milenge!',
    matchMode: 'contains',
    enabled: true,
    category: 'Farewell / Alvida',
  },
  {
    id: 'rule-identity',
    keywords: ['who are you', 'kon ho tum', 'tum kaun ho', 'naam kya hai', 'aap kaun ho', 'aap kon ho', 'what is your name', '🤖'],
    response: 'Main PyBot hoon 🤖 — ek rule-based chatbot jo Hindi-English (Hinglish) aur English dono samajhta hai!',
    matchMode: 'contains',
    enabled: true,
    category: 'Identity / Kon ho tum',
  },
  {
    id: 'rule-help',
    keywords: ['help', 'madad', 'kya kar sakte ho', 'options', 'commands', '💡'],
    response: "Aap mujhse Hinglish ya English me baat kar sakte hain! 💡 Try typing 'namaste 🙏', 'kaise ho', 'kya kr rhe', or 'who are you'!",
    matchMode: 'contains',
    enabled: true,
    category: 'Assistance / Madad',
  },
];

export const FALLBACK_RESPONSES = [
  "Mujhe abhi yeh samajh nahi aaya! Try asking 'kaise ho', 'kya kr rhe', or 'namaste'!",
  "I couldn't match your input in English or Hinglish rules. Try saying 'kaise ho' or 'hello'!",
  "My rule engine checked all 'if' and 'elif' conditions, but found no match! (Fallback triggered)",
];

