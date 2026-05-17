import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import rateLimit from "express-rate-limit";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Trust the first proxy to ensure IP based rate limiting works on Cloud Run / Render
  app.set("trust proxy", 1);

  app.use(express.json({ limit: '10mb' }));

  let aiInstance: GoogleGenAI | null = null;
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please set it in the settings menu.");
    }
    if (!aiInstance) {
      aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
  };

  // API routes protection (Simple check for app-originated requests)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many AI requests from this IP, please try again after 15 minutes." },
  });

  app.use("/api/gemini", apiLimiter, (req, res, next) => {
    const isAppRequest = req.get('x-app-applet-request') === 'true';
    const hasOrigin = !!req.get('origin');
    const hasReferer = !!req.get('referer');
    
    if (!isAppRequest && !hasOrigin && !hasReferer) {
      return res.status(403).json({ error: "Forbidden: Direct API access is restricted." });
    }
    
    next();
  });

  app.post("/api/gemini/generate-content", async (req, res) => {
    try {
      const { model, contents, config } = req.body;
      
      // Input Validation
      const allowedModels = ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];
      if (!allowedModels.includes(model)) {
        return res.status(400).json({ error: "Invalid model requested." });
      }
      
      const ai = getAI();
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate content" });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { model, message, context, config } = req.body;
      
      // Input Validation
      const allowedModels = ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];
      if (!allowedModels.includes(model)) {
        return res.status(400).json({ error: "Invalid model requested." });
      }
      if (typeof message !== 'string' || message.length > 5000) {
        return res.status(400).json({ error: "Message is invalid or too long." });
      }

      const ai = getAI();
      const chat = ai.chats.create({
        model,
        config,
      });
      const response = await chat.sendMessage({ message: `${context}\n\nUser says: ${message}` });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to chat" });
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
    // In production, serve static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
