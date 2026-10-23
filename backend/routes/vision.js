/* =========================================================
   PROJECT AURA 3.0 — AURA VISION ROUTE HANDLER
   REST API for Real-Time Object Recognition, Visual Q&A, and Follow-Up Chat
========================================================= */

"use strict";

const express = require("express");
const router = express.Router();
const visionService = require("../services/vision");
const auraDB = require("../database");

/* ---------------------------------------------------------
   GET /api/vision/status
   Public status of AURA Vision engine
--------------------------------------------------------- */
router.get("/status", (req, res) => {
  const isReady = visionService.isConfigured();
  res.json({
    success: true,
    system: "AURA Vision",
    configured: isReady,
    activeModel: "Google Gemini Vision (gemini-3.1-flash-lite)",
    capabilities: [
      "real_time_camera_capture",
      "file_upload_fallback",
      "object_identification",
      "text_reading_ocr",
      "scientific_component_analysis",
      "bilingual_english_tamil",
      "follow_up_conversations"
    ],
    timestamp: new Date().toISOString()
  });
});

/* ---------------------------------------------------------
   POST /api/vision/analyze
   Process camera frame or uploaded image
--------------------------------------------------------- */
router.post("/analyze", async (req, res) => {
  try {
    const { image, prompt, language, conversationHistory } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "Image payload is required (base64 string or data URL)."
      });
    }

    // Protect against unreasonably huge inputs (> 25MB)
    if (typeof image === "string" && image.length > 25 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        error: "Image size exceeds 25MB limit. Please provide a compressed frame."
      });
    }

    const result = await visionService.analyzeImage({
      image,
      prompt,
      language: language || "english",
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : []
    });

    if (!result.success) {
      const statusCode = result.errorCode === "MISSING_API_CONFIG" ? 503 : 502;
      return res.status(statusCode).json(result);
    }

    // Track analytics activity
    try {
      auraDB.addActivity("vision", `AURA Vision analyzed image frame: ${(prompt || "Object Identification").slice(0, 35)}...`, {
        provider: result.provider,
        model: result.model,
        language: result.language
      });
    } catch (_) {
      // Non-blocking telemetry
    }

    res.json(result);
  } catch (err) {
    console.error("[VISION ROUTE ERROR]", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to analyze image."
    });
  }
});

/* ---------------------------------------------------------
   POST /api/vision/chat
   Interactive follow-up questions about a captured image
--------------------------------------------------------- */
router.post("/chat", async (req, res) => {
  try {
    const { image, question, conversationHistory, language } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: "Follow-up question is required."
      });
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "Image context is required for visual follow-up chat."
      });
    }

    const result = await visionService.followUpChat({
      image,
      question,
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
      language: language || "english"
    });

    if (!result.success) {
      const statusCode = result.errorCode === "MISSING_API_CONFIG" ? 503 : 502;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("[VISION CHAT ROUTE ERROR]", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to process visual follow-up question."
    });
  }
});

module.exports = router;
