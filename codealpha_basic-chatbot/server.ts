import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Chat response
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "GEMINI_API_KEY is not configured.",
          reply: "I am running in offline mode as GEMINI_API_KEY is not set."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemPrompt = `You are PyBot, a smart, friendly AI assistant. You can understand and reply in English, Hindi, and Hinglish (Hindi written in Roman/English alphabet, e.g. "kaise ho", "kya kar rahe ho", "bharat ki rajdhani kya hai", etc.).
Answer normal user questions accurately, politely, and naturally. Keep answers clear, well-structured, and helpful. Use relevant emojis to keep the conversation friendly!`;

      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item.sender === "user" && item.text) {
            contents.push({ role: "user", parts: [{ text: item.text }] });
          } else if (item.sender === "bot" && item.text) {
            contents.push({ role: "model", parts: [{ text: item.text }] });
          }
        }
      }

      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      const reply = response.text || "Namaste! 🙏 Mujhe iska jawab samajh nahi aaya, kripya dobara puchiye.";
      return res.json({ reply });
    } catch (error: any) {
      console.error("Gemini API error in /api/chat:", error);
      return res.status(500).json({
        error: error?.message || "Failed to process question",
        reply: "Namaste! 🙏 Abhi AI server me error hai, kripya thodi der baad dobara koshish karein."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
