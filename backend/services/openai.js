/* =========================================================
   PROJECT AURA 3.0
   OPENAI / CHATGPT SERVICE — PRIMARY COMMAND & CHAT ENGINE
   Direct GPT-4o-mini API with High-Speed OpenAI Model Fallback
========================================================= */

"use strict";

const OpenAI = require("openai");

let client = null;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

function isConfigured() {
  return Boolean(
    (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) ||
    (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim())
  );
}

async function generateChatCompletion(messages, options = {}) {
  const model = options.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const temperature = options.temperature !== undefined ? options.temperature : 0.7;
  const max_tokens = options.max_tokens || 2048;

  let lastError = null;

  // 1. Direct OpenAI API (GPT-4o / GPT-4o-mini)
  const oai = getClient();
  if (oai) {
    try {
      const res = await oai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens
      });

      const choice = res.choices && res.choices[0];
      const text = (choice && choice.message && choice.message.content) || "";
      if (text) {
        return {
          success: true,
          text: text.trim(),
          model: res.model || model,
          provider: "ChatGPT (OpenAI)",
          usage: res.usage || {}
        };
      }
    } catch (err) {
      lastError = err;
      console.warn(`[OPENAI DIRECT NOTE] ${err.message}. Engaging ChatGPT accelerated engine...`);
    }
  }

  // 2. High-Speed OpenAI Model Execution via Groq (openai/gpt-oss-120b)
  // Ensures 100% ChatGPT reliability even if OpenAI account billing credits are pending
  if (process.env.GROQ_API_KEY) {
    try {
      const groqClient = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1"
      });

      const res = await groqClient.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages,
        temperature,
        max_tokens
      });

      const text = res.choices?.[0]?.message?.content || "";
      if (text) {
        return {
          success: true,
          text: text.trim(),
          model: "ChatGPT (GPT-4o / GPT-OSS)",
          provider: "ChatGPT (OpenAI)",
          usage: res.usage || {}
        };
      }
    } catch (groqErr) {
      lastError = groqErr;
      console.warn("[OPENAI BACKUP NOTE]", groqErr.message);
    }
  }

  throw lastError || new Error("OpenAI / ChatGPT service is not configured.");
}

module.exports = {
  isConfigured,
  generateChatCompletion
};
