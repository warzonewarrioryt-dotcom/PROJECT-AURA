/* =========================================================
   PROJECT AURA 3.0
   GOOGLE GEMINI SERVICE — PRIMARY AI INTELLIGENCE & SEARCH
   Gemini 3.7 Flash · Gemini Flash Lite · Multi-Model Fallback
========================================================= */

"use strict";

const MODELS_PRIORITY = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.7-flash"
];

function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
}

async function generateChatCompletion(messages, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  // Extract system messages for Gemini's dedicated systemInstruction field
  let systemText = "";
  const filteredMessages = [];

  for (const m of messages) {
    if (m.role === "system") {
      systemText += (systemText ? "\n\n" : "") + m.content;
    } else {
      filteredMessages.push(m);
    }
  }

  // Ensure alternating user/model turns
  const contents = [];
  let lastRole = null;

  for (const m of filteredMessages) {
    const role = m.role === "assistant" ? "model" : "user";
    if (role === lastRole && contents.length > 0) {
      contents[contents.length - 1].parts.push({ text: m.content });
    } else {
      contents.push({
        role,
        parts: [{ text: m.content }]
      });
      lastRole = role;
    }
  }

  if (contents.length === 0) {
    contents.push({ role: "user", parts: [{ text: "Hello AURA" }] });
  } else if (contents[0].role === "model") {
    contents.unshift({ role: "user", parts: [{ text: "Proceed" }] });
  }

  const payload = { contents };
  if (systemText) {
    payload.systemInstruction = {
      parts: [{ text: systemText }]
    };
  }

  // Priority list with deduplication
  const modelsToTry = [
    options.model || MODELS_PRIORITY[0],
    ...MODELS_PRIORITY.slice(1)
  ];
  const uniqueModels = [...new Set(modelsToTry)];

  let lastError = null;

  for (const model of uniqueModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (text) {
          return {
            success: true,
            text: text.trim(),
            model: `Google Gemini (${model})`,
            provider: "Google Gemini",
            usage: data.usageMetadata || {}
          };
        }
      }

      const errorJson = await res.json().catch(() => ({}));
      const errorMsg = errorJson.error?.message || `HTTP ${res.status}`;
      lastError = new Error(`Gemini (${model}): ${errorMsg}`);
      console.warn(`[GEMINI RETRY] Model ${model} encountered: ${errorMsg}. Trying next model...`);
    } catch (fetchErr) {
      lastError = fetchErr;
    }
  }

  throw lastError || new Error("Gemini generation failed across all available models.");
}

module.exports = {
  isConfigured,
  generateChatCompletion
};
