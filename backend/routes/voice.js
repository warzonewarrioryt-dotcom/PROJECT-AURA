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
    const { text, voiceId, gender = "female" } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: "Text is required." });
    }

    // Default high-quality male and female voice IDs for ElevenLabs
    const FEMALE_VOICE = "21m00Tcm4TlvDq8ikWAM"; // Rachel
    const MALE_VOICE = "ErXwobaYiN019PkySvjV";   // Antoni

    const targetVoiceId = voiceId || (gender === "male" ? MALE_VOICE : FEMALE_VOICE);
    const result = await elevenlabsService.textToSpeech(text, targetVoiceId);
    res.json({
      ...result,
      gender: gender === "male" ? "male" : "female"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
