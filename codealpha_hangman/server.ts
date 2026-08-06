import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for retrying Gemini calls on rate limits (429) or spikes (503)
async function generateContentWithRetry(ai: any, params: any, retries = 3, delay = 600) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      const errStr = String(err?.message || err);
      const isRateLimit = err?.status === 429 || errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota");
      const isUnavailable = err?.status === 503 || errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("overloaded");
      if ((isRateLimit || isUnavailable) && i < retries - 1) {
        console.warn(`[Gemini Retry] Attempt ${i + 1}/${retries} failed due to rate-limit/spike. Waiting ${delay}ms before retrying...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
  throw new Error("Failed to generate content after retries");
}

// API route to dynamically guess words/names matching a Hangman state using Gemini
app.post("/api/ai-candidates", async (req, res) => {
  try {
    const { length, revealed, wrongLetters, guessedLetters, genre } = req.body;

    if (!length || !Array.isArray(revealed)) {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment variables. Falling back to empty candidates.");
      return res.json({ candidates: [] });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Format revealed slots into a user-friendly pattern string (e.g. ["p", "u", null, null, null] -> "p u _ _ _")
    const pattern = revealed.map((char: string | null) => char ? char.toLowerCase() : '_').join(' ');
    const correctLetters = revealed.filter((char: string | null) => char !== null).map((c: string) => c.toLowerCase());
    const uniqueCorrect = Array.from(new Set(correctLetters));

    const genreNote = genre && genre !== "any" 
      ? `THE USER HAS SPECIFIED THE SECRET WORD BELONGS TO OR IS STRONGLY RELATED TO THE GENRE/CATEGORY: "${genre}". 
Please focus heavily on words, names, brands, places, terms, or famous personalities in or associated with this category "${genre}".`
      : `Provide a diverse list of common names (especially Indian and Western names), famous personalities/athletes, places, brands, and vocabulary.`;

    const prompt = `You are an expert Hangman game solver assistant.
The secret word has length ${length}.
It matches the pattern: "${pattern}" where '_' represents unknown letters, and lowercase letters represent correctly guessed, revealed letters.
The user has guessed these incorrect letters so far: [${wrongLetters ? wrongLetters.map((l: string) => l.toLowerCase()).join(', ') : ''}].
All letters guessed so far (both correct and incorrect): [${guessedLetters ? guessedLetters.map((l: string) => l.toLowerCase()).join(', ') : ''}].

Generate a list of up to 120 plausible real-world words, proper nouns, and names matching this exact pattern.

${genreNote}

CRITICAL CONSTRAINTS for each candidate word:
1. It must have exactly ${length} letters.
2. It must match the pattern "${pattern}" exactly:
   - For every revealed letter in the pattern, the candidate must have that exact letter at the same index.
   - For every '_' (unknown slot) in the pattern, the candidate must NOT contain any of the already revealed correct letters [${uniqueCorrect.join(', ')}] at that position (because once a letter is guessed, all instances of it are revealed in Hangman).
3. It must NOT contain any of the wrong letters: [${wrongLetters ? wrongLetters.map((l: string) => l.toLowerCase()).join(', ') : ''}].

All candidates must be in lowercase. Provide a diverse and rich list so the solver is highly precise.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidates: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["candidates"]
        }
      }
    });

    if (response.text) {
      try {
        const parsed = JSON.parse(response.text.trim());
        if (parsed && Array.isArray(parsed.candidates)) {
          // Normalize and filter candidates to be syntactically valid and match exact length
          const candidates = parsed.candidates
            .map((c: string) => c.trim().toLowerCase())
            .filter((c: string) => c.length === length && /^[a-z]+$/.test(c));
          
          console.log(`[API] Gemini returned ${candidates.length} valid candidates for pattern: "${pattern}"`);
          return res.json({ candidates });
        }
      } catch (err) {
        console.error("Failed to parse Gemini JSON output:", err);
      }
    }

    res.json({ candidates: [] });
  } catch (error) {
    console.error("Error generating AI candidates:", error);
    res.json({ candidates: [] });
  }
});

// Vite middleware integration for full-stack build system
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
