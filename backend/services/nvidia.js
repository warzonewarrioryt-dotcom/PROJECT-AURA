/* =========================================================
   PROJECT AURA 3.0
   NVIDIA NIM SERVICE
========================================================= */

"use strict";

const OpenAI = require("openai");

let client = null;

function getClient() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: "https://integrate.api.nvidia.com/v1"
    });
  }
  return client;
}

function isConfigured() {
  return Boolean(process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY.trim());
}

async function generateChatCompletion(messages, options = {}) {
  const nvidia = getClient();
  if (!nvidia) {
    throw new Error("NVIDIA_API_KEY is not configured.");
  }

  const model = options.model || process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct";
  const temperature = options.temperature !== undefined ? options.temperature : 0.7;
  const max_tokens = options.max_tokens || 2048;

  const res = await nvidia.chat.completions.create({
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
    provider: "NVIDIA NIM",
    usage: res.usage || {}
  };
}

module.exports = {
  isConfigured,
  generateChatCompletion
};
