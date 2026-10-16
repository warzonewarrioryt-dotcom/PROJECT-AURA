/* =========================================================
   PROJECT AURA 3.0
   MASTER BACKEND API GATEWAY
========================================================= */

"use strict";

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load Environment Configuration
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Import Core Database & Services
const auraDB = require("./database");
const knowledgeEngine = require("./knowledgeEngine");
const aiRouterService = require("./services/aiRouter");
const imageGenService = require("./services/imageGen");
const groqService = require("./services/groq");
const openaiService = require("./services/openai");

// Import Modular Routes
const aiRoutes = require("./routes/ai");
const memoryRoutes = require("./routes/memory");
const youtubeRoutes = require("./routes/youtube");
const researchRoutes = require("./routes/research");
const filesRoutes = require("./routes/files");
const quizRoutes = require("./routes/quiz");
const analyticsRoutes = require("./routes/analytics");
const voiceRoutes = require("./routes/voice");
const studentRoutes = require("./routes/student");
const authRoutes = require("./routes/auth");
const presentationRoutes = require("./routes/presentation");

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(cors({
  origin: true,
  credentials: true
}));

// Cross-Origin-Opener-Policy for Google OAuth popup postMessage
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Root & Dashboard routes: bypass authentication gate and serve dashboard.html directly
app.get(["/", "/dashboard", "/dashboard.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dashboard.html"));
});

// Explicit redirect for index.html to dashboard.html
app.get("/index.html", (req, res) => {
  res.redirect("/dashboard.html");
});

// Serve frontend static files if accessed directly via backend
app.use(express.static(path.join(__dirname, ".."), { index: false }));

// Serve generated images from creations directory
app.use("/creations", express.static(path.join(__dirname, "uploads/creations")));

// Serve uploaded vault files directly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================================================
   MOUNT MODULAR ROUTES
========================================================= */

app.use("/api", aiRoutes);
app.use("/api/memory", memoryRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/vault", filesRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/presentation", presentationRoutes);

// Public Google Auth Config Route
app.get('/api/auth/google-client-id', (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID || '' });
});

// Favicon fallback route
app.get("/favicon.ico", (req, res) => res.status(204).end());

/* =========================================================
   ROOT & SYSTEM STATUS (API HEALTH ENDPOINTS)
========================================================= */

app.get(["/api/status", "/api/health"], (req, res) => {
  res.json({
    success: true,
    system: "PROJECT AURA 3.0",
    service: "AURA API GATEWAY & COMMAND CORE",
    status: "ONLINE",
    timestamp: new Date().toISOString()
  });
});

/* =========================================================
   LEGACY & CORE FRONTEND COMPATIBILITY ROUTES
   Guarantees 100% preservation of the locked frontend UI
========================================================= */

// POST /ask & /api/ask (Unified conversational AI with multi-provider fallback)
const handleAsk = async (req, res) => {
  try {
    const prompt = req.body.prompt || req.body.message || req.body.command;
    const conversationId = req.body.conversationId;
    const attachment = req.body.attachment;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: "Prompt or message is required." });
    }

    const convId = conversationId || auraDB.createConversation("New Conversation").id;

    // Record user message
    auraDB.addMessage(convId, "user", prompt);
    auraDB.addActivity("message", `User dispatched prompt: "${prompt.slice(0, 30)}..."`, { conversationId: convId });

    // Check knowledge grounding if relevant
    let groundedContext = "";
    const docSearch = knowledgeEngine.buildKnowledgeContext(prompt, 3);
    if (docSearch.found) {
      groundedContext = `\nDOCUMENT CONTEXT:\n${docSearch.context}\n`;
    }

    // Process attachment if provided
    let attachmentContext = "";
    if (attachment) {
      const attName = attachment.name || "Attachment";
      const attContent = attachment.content || attachment.text || attachment.data || "";
      attachmentContext = `\n\n[USER ATTACHED FILE: ${attName}]\nContent/Extract:\n${attContent.slice(0, 4000)}\n[END ATTACHED FILE - ANALYZE THIS CONTENT AND ANSWER USER QUERY PRECISELY]\n\n`;
    }

    const fullPrompt = attachmentContext ? `${attachmentContext}${prompt}` : prompt;
    const mode = req.body.mode || (req.body.codeOnly ? "code_only" : undefined);

    // Process via AI router
    const commandResult = await aiRouterService.processCommand(fullPrompt, {
      mode,
      conversationHistory: []
    });

    const reply = commandResult.response || "AURA stood by. Ready for next directive.";

    // Record assistant message
    auraDB.addMessage(convId, "assistant", reply, {
      provider: commandResult.provider,
      route: commandResult.route?.module
    });

    res.json({
      success: true,
      answer: reply,
      response: reply,
      conversationId: convId,
      provider: commandResult.provider,
      route: commandResult.route,
      isMultiStep: commandResult.isMultiStep || false,
      steps: commandResult.steps || [],
      youtubeResults: commandResult.youtubeResults || [],
      quiz: commandResult.quiz || null
    });
  } catch (err) {
    console.error("[ASK ERROR]", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
app.post("/ask", handleAsk);
app.post("/api/ask", handleAsk);

// POST /generate-image & /api/generate-image
const handleImageGeneration = async (req, res) => {
  try {
    const { prompt, width, height, style, aspectRatio, enhance, engine } = req.body;
    const result = await imageGenService.generateImage(prompt, { width, height, style, aspectRatio, enhance, engine });

    auraDB.addActivity("creation", `Synthesized visual asset for: "${prompt.slice(0, 30)}..." [${result.model}]`);
    res.json(result);
  } catch (err) {
    console.error("[IMAGE_GEN ERROR]", err.message);
    res.status(500).json({ success: false, error: err.message || "Image generation is temporarily unavailable." });
  }
};
app.post("/generate-image", handleImageGeneration);
app.post("/api/generate-image", handleImageGeneration);

// POST /route & /api/route (Intent classification route)
const handleRoute = async (req, res) => {
  try {
    const { command } = req.body;
    const classification = aiRouterService.classifyIntentLocal(command || "");
    res.json({ success: true, route: classification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
app.post("/route", handleRoute);
app.post("/api/route", handleRoute);


// CONVERSATIONS APIs
app.get("/api/conversations", (req, res) => {
  res.json({ success: true, conversations: auraDB.getConversations() });
});

app.post("/api/conversations", (req, res) => {
  const conv = auraDB.createConversation(req.body.title || "New Conversation");
  res.json({ success: true, conversation: conv });
});

app.get("/api/conversations/:id", (req, res) => {
  const conv = auraDB.getConversation(req.params.id);
  const messages = auraDB.getMessages(req.params.id);
  if (!conv) return res.status(404).json({ success: false, error: "Conversation not found" });
  res.json({ success: true, conversation: conv, messages });
});

app.post("/api/conversations/:id/messages", (req, res) => {
  const { role, content, metadata } = req.body;
  const msg = auraDB.addMessage(req.params.id, role || "user", content, metadata || {});
  res.json({ success: true, message: msg });
});

// ACTIVITY APIs
app.get("/api/activity", (req, res) => {
  res.json({ success: true, activities: auraDB.getActivities() });
});

app.post("/api/activity", (req, res) => {
  const { type, message, metadata } = req.body;
  const act = auraDB.addActivity(type, message, metadata);
  res.json({ success: true, activity: act });
});

// INTERESTS APIs
app.get("/api/interests", (req, res) => {
  res.json({ success: true, interests: auraDB.getInterests() });
});

app.post("/api/interests", (req, res) => {
  const { topic, confidence } = req.body;
  auraDB.updateInterest(topic, confidence);
  res.json({ success: true, interests: auraDB.getInterests() });
});

// KNOWLEDGE STATS & SEARCH APIs
app.get("/api/knowledge/stats", (req, res) => {
  res.json({ success: true, stats: knowledgeEngine.getKnowledgeStats() });
});

app.post("/api/knowledge/search", (req, res) => {
  const results = knowledgeEngine.searchKnowledge(req.body.query || "", 5);
  res.json({ success: true, results });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error("[SERVER ERROR]", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, error: err.message || "Internal server error." });
});

/* =========================================================
   BOOTSTRAP SERVER
========================================================= */

app.listen(PORT, () => {
  console.log("");
  console.log("========================================");
  console.log("            PROJECT AURA 3.0");
  console.log("   FUTURISTIC AI COMMAND OPERATING SYSTEM");
  console.log("========================================");
  console.log(`Port: http://localhost:${PORT}`);
  console.log(`Groq AI: ${groqService.isConfigured() ? "CONFIGURED" : "OFFLINE"}`);
  console.log(`OpenAI: ${openaiService.isConfigured() ? "CONFIGURED" : "OFFLINE"}`);
  console.log(`Status: ONLINE`);
  console.log("========================================");
  console.log("");
});

module.exports = app;