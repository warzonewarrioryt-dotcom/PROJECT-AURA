/* =========================================================
   PROJECT AURA 3.0
   ELEVENLABS VOICE SERVICE
========================================================= */

"use strict";

function isConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY.trim());
}

async function textToSpeech(text, voiceId = "21m00Tcm4TlvDq8ikWAM") {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      fallbackBrowser: true,
      text,
      message: "ELEVENLABS_API_KEY not configured. Use browser speech synthesis."
    };
  }

  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      throw new Error(`ElevenLabs error: ${res.statusText}`);
    }

    const buffer = await res.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString("base64");

    return {
      success: true,
      audioBase64: base64Audio,
      mimeType: "audio/mpeg"
    };
  } catch (err) {
    console.warn("[ELEVENLABS ERROR]", err.message);
    return {
      success: false,
      fallbackBrowser: true,
      text,
      error: err.message
    };
  }
}

module.exports = {
  isConfigured,
  textToSpeech
};
