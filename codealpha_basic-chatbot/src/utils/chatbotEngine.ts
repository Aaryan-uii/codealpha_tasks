import { ChatRule, TraceStep, BotMood } from '../types';
import { FALLBACK_RESPONSES } from '../data/defaultRules';

export interface EvaluationResult {
  response: string;
  matchedRule: ChatRule | null;
  ruleLabel: string;
  traceSteps: TraceStep[];
  botMood: BotMood;
}

/**
 * Checks if normalized input matches a keyword based on matching mode
 */
function checkMatch(input: string, keyword: string, mode: string): boolean {
  const normInput = input.trim().toLowerCase();
  const normKeyword = keyword.trim().toLowerCase();

  switch (mode) {
    case 'equals':
      return normInput === normKeyword;
    case 'startsWith':
      return normInput.startsWith(normKeyword);
    case 'endsWith':
      return normInput.endsWith(normKeyword);
    case 'contains':
    default:
      return normInput.includes(normKeyword);
  }
}

/**
 * Simulates if-elif-else logic loop for input processing
 */
export function processChatInput(userInput: string, rules: ChatRule[]): EvaluationResult {
  const normalizedInput = userInput.trim().toLowerCase();
  const enabledRules = rules.filter((r) => r.enabled);
  const traceSteps: TraceStep[] = [];

  let matchedRule: ChatRule | null = null;
  let response = '';
  let ruleLabel = 'ELSE (Fallback)';

  // Loop through active rules sequentially (if -> elif -> elif ...)
  for (let i = 0; i < enabledRules.length; i++) {
    const rule = enabledRules[i];
    const conditionType: 'IF' | 'ELIF' = i === 0 ? 'IF' : 'ELIF';

    // Check if any keyword in the rule matches
    const matchingKeywords = rule.keywords.filter((kw) =>
      checkMatch(normalizedInput, kw, rule.matchMode)
    );

    const isMatch = matchingKeywords.length > 0;
    const keywordsFormatted = rule.keywords.map((k) => `"${k}"`).join(' OR ');

    const stepText = `${conditionType} input ${rule.matchMode} (${keywordsFormatted})`;

    traceSteps.push({
      stepNumber: i + 1,
      conditionType,
      conditionText: stepText,
      evaluatedInput: userInput,
      isMatch,
      explanation: isMatch
        ? `Matched keyword(s): ${matchingKeywords.map((k) => `"${k}"`).join(', ')}. Returned response.`
        : `No match found in rule "${rule.category || 'Rule ' + (i + 1)}". Proceeding to next statement...`,
    });

    if (isMatch) {
      matchedRule = rule;
      response = rule.response;
      ruleLabel = `${conditionType} [Rule ${i + 1}: ${rule.category || 'Rule'}]`;
      break; // Exit loop on first match (short-circuit logic)
    }
  }

  // If no rule matched, execute the ELSE branch
  if (!matchedRule) {
    const randomFallback =
      FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    response = randomFallback;

    traceSteps.push({
      stepNumber: traceSteps.length + 1,
      conditionType: 'ELSE',
      conditionText: 'ELSE (Default Fallback)',
      evaluatedInput: userInput,
      isMatch: true,
      explanation: 'No "IF" or "ELIF" condition matched the input. Executing default fallback statement.',
    });
  }

  // Determine bot mood for UI animations
  let botMood: BotMood = 'confused';
  if (matchedRule) {
    const cat = (matchedRule.category || '').toLowerCase();
    const keywordsStr = matchedRule.keywords.join(' ').toLowerCase();
    if (cat.includes('farewell') || keywordsStr.includes('bye')) {
      botMood = 'waving';
    } else if (cat.includes('greeting') || keywordsStr.includes('hello') || keywordsStr.includes('hi')) {
      botMood = 'happy';
    } else {
      botMood = 'happy';
    }
  }

  return {
    response,
    matchedRule,
    ruleLabel,
    traceSteps,
    botMood,
  };
}

/**
 * Generates clean Python code string based on active rules
 */
export function generatePythonCode(rules: ChatRule[]): string {
  const enabledRules = rules.filter((r) => r.enabled);
  if (enabledRules.length === 0) {
    return `# Basic Rule-Based Chatbot in Python
def get_bot_reply(user_input):
    user_input = user_input.lower().strip()
    return "I don't have any active rules configured!"
`;
  }

  let pythonCode = `# Basic Rule-Based Chatbot in Python
# Key Concepts: functions, if-elif-else, loops, input/output

def get_bot_reply(user_input):
    # Normalize input
    text = user_input.lower().strip()
    
`;

  enabledRules.forEach((rule, idx) => {
    const keywordListStr = rule.keywords.map((k) => `"${k.toLowerCase()}"`).join(', ');
    const conditionType = idx === 0 ? 'if' : 'elif';

    if (rule.matchMode === 'contains') {
      pythonCode += `    # Check ${rule.category || 'Rule ' + (idx + 1)}\n`;
      pythonCode += `    ${conditionType} any(kw in text for kw in [${keywordListStr}]):\n`;
      pythonCode += `        return "${rule.response.replace(/"/g, '\\"')}"\n\n`;
    } else if (rule.matchMode === 'equals') {
      pythonCode += `    # Check ${rule.category || 'Rule ' + (idx + 1)}\n`;
      pythonCode += `    ${conditionType} text in [${keywordListStr}]:\n`;
      pythonCode += `        return "${rule.response.replace(/"/g, '\\"')}"\n\n`;
    } else if (rule.matchMode === 'startsWith') {
      pythonCode += `    # Check ${rule.category || 'Rule ' + (idx + 1)}\n`;
      pythonCode += `    ${conditionType} any(text.startswith(kw) for kw in [${keywordListStr}]):\n`;
      pythonCode += `        return "${rule.response.replace(/"/g, '\\"')}"\n\n`;
    } else {
      pythonCode += `    # Check ${rule.category || 'Rule ' + (idx + 1)}\n`;
      pythonCode += `    ${conditionType} any(text.endswith(kw) for kw in [${keywordListStr}]):\n`;
      pythonCode += `        return "${rule.response.replace(/"/g, '\\"')}"\n\n`;
    }
  });

  pythonCode += `    # Default fallback when no rule matches\n`;
  pythonCode += `    else:\n`;
  pythonCode += `        return "I'm sorry, I don't understand that yet. Try asking 'hello' or 'how are you'!"\n\n`;

  pythonCode += `# Main interactive loop (Input / Output)
def main():
    print("Chatbot initialized! Type 'bye' to exit.")
    while True:
        user_msg = input("You: ")
        reply = get_bot_reply(user_msg)
        print(f"Bot: {reply}")
        if any(kw in user_msg.lower() for kw in ["bye", "exit"]):
            break

if __name__ == "__main__":
    main()
`;

  return pythonCode;
}
