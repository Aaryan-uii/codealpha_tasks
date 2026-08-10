export type MatchingMode = 'contains' | 'equals' | 'startsWith' | 'endsWith';

export type BotMood = 'idle' | 'thinking' | 'happy' | 'confused' | 'waving';

export type ColorScheme = 'indigo' | 'blue' | 'emerald' | 'rose' | 'amber';

export interface ChatRule {
  id: string;
  keywords: string[];
  response: string;
  matchMode: MatchingMode;
  enabled: boolean;
  category?: string;
  iconName?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  matchedRuleId?: string | null;
  ruleLabel?: string;
  executionSteps?: TraceStep[];
  botMood?: BotMood;
}

export interface TraceStep {
  stepNumber: number;
  conditionType: 'IF' | 'ELIF' | 'ELSE';
  conditionText: string;
  evaluatedInput: string;
  isMatch: boolean;
  explanation: string;
}

export interface ChatbotStats {
  totalMessagesSent: number;
  successfulMatches: number;
  fallbackCount: number;
}

