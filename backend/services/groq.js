/* =========================================================
   PROJECT AURA 3.0
   GROQ AI SERVICE
========================================================= */

"use strict";

const OpenAI = require("openai");

let client = null;

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });
  }
  return client;
}

function isConfigured() {
  return Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());
}

async function generateChatCompletion(messages, options = {}) {
  const groq = getClient();
  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const model = options.model || process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
  const temperature = options.temperature !== undefined ? options.temperature : 0.7;
  const max_tokens = options.max_tokens || 800;

  try {
    const res = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens
    });

    const choice = res.choices && res.choices[0];
    const text = (choice && choice.message && choice.message.content) || "";
    return {
      success: true,
      text: text.trim(),
      model: res.model || model,
      provider: "Groq",
      usage: res.usage || {}
    };
  } catch (err) {
    // If the configured model has access issues, attempt automatic fallback to other available models
    if (err.status === 404 && model !== "openai/gpt-oss-120b") {
      try {
        const fallbackRes = await groq.chat.completions.create({
          model: "openai/gpt-oss-120b",
          messages,
          temperature,
          max_tokens
        });
        const text = fallbackRes.choices?.[0]?.message?.content || "";
        return {
          success: true,
          text: text.trim(),
          model: "openai/gpt-oss-120b",
          provider: "Groq (Fallback Model)",
          usage: fallbackRes.usage || {}
        };
      } catch (_) {}
    }
    throw err;
  }
}

module.exports = {
  isConfigured,
  generateChatCompletion
};
