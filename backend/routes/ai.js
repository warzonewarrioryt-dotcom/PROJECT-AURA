/* =========================================================
   PROJECT AURA 3.0
   AI ROUTE HANDLER
========================================================= */

"use strict";

const express = require("express");
const router = express.Router();

const aiRouterService = require("../services/aiRouter");
const groqService = require("../services/groq");
const openaiService = require("../services/openai");
const nvidiaService = require("../services/nvidia");
const geminiService = require("../services/gemini");
const huggingfaceService = require("../services/huggingface");
const tavilyService = require("../services/tavily");
const youtubeService = require("../services/youtube");
const elevenlabsService = require("../services/elevenlabs");
const pythonClient = require("../services/pythonClient");
const auraDB = require("../database");

/* ---------------------------------------------------------
   GET /api/health
--------------------------------------------------------- */
router.get("/health", async (req, res) => {
  const pythonOnline = await pythonClient.checkPythonHealth();
  const providersConfigured = {
    groq: groqService.isConfigured(),
    openai: openaiService.isConfigured(),
    nvidia: nvidiaService.isConfigured(),
    gemini: geminiService.isConfigured(),
    huggingface: huggingfaceService.isConfigured(),
    tavily: tavilyService.isConfigured(),
    youtube: youtubeService.isConfigured(),
    elevenlabs: elevenlabsService.isConfigured()
  };

  res.json({
    success: true,
    system: "PROJECT AURA 3.0",
    status: "healthy",
    backend: "online",
    pythonEngine: pythonOnline ? "online" : "standby",
    providers: providersConfigured,
    timestamp: new Date().toISOString()
  });
});

/* ---------------------------------------------------------
   GET /api/providers
   Reports only boolean flags — NEVER credentials
--------------------------------------------------------- */
router.get("/providers", async (req, res) => {
  const pythonOnline = await pythonClient.checkPythonHealth();

  let geminiStatus = "unavailable";
  if (geminiService.isConfigured()) {
    geminiStatus = "configured";
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=1`, {
        signal: AbortSignal.timeout(4000)
      });
      if (testRes.ok) {
        geminiStatus = "available";
      } else {
        geminiStatus = "failed";
      }
    } catch (_) {
      geminiStatus = "failed";
    }
  }

  res.json({
    success: true,
    groq: groqService.isConfigured(),
    openai: openaiService.isConfigured(),
    nvidia: nvidiaService.isConfigured(),
    gemini: geminiService.isConfigured(),
    geminiStatus,
    huggingface: huggingfaceService.isConfigured(),
    tavily: tavilyService.isConfigured(),
    youtube: youtubeService.isConfigured(),
    elevenlabs: elevenlabsService.isConfigured(),
    pythonEngine: pythonOnline
  });
});

/* ---------------------------------------------------------
   POST /api/command
   Central command dispatcher
--------------------------------------------------------- */
router.post("/command", async (req, res) => {
  try {
    const { command, conversationHistory } = req.body;
    if (!command || !command.trim()) {
      return res.status(400).json({
        success: false,
        error: "Command is required."
      });
    }

    const result = await aiRouterService.processCommand(command, { conversationHistory });

    // Track analytics
    auraDB.addActivity("command", `Command executed: ${command.slice(0, 40)}...`, {
      route: result.route?.module,
      provider: result.provider
    });

    res.json(result);
  } catch (err) {
    console.error("[COMMAND ROUTE ERROR]", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to process command."
    });
  }
});

module.exports = router;
