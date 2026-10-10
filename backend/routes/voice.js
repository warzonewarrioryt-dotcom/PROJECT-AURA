/* =========================================================
   PROJECT AURA 3.0
   VOICE ROUTE HANDLER
========================================================= */

"use strict";

const express = require("express");
const router = express.Router();
const elevenlabsService = require("../services/elevenlabs");

/* ---------------------------------------------------------
   POST /api/voice/speak
--------------------------------------------------------- */
router.post("/speak", async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: "Text is required." });
    }

    const result = await elevenlabsService.textToSpeech(text, voiceId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
