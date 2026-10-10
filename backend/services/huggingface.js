/* =========================================================
   PROJECT AURA 3.0
   HUGGING FACE SERVICE
========================================================= */

"use strict";

function isConfigured() {
  return Boolean(process.env.HF_TOKEN && process.env.HF_TOKEN.trim());
}

async function generateChatCompletion(messages, options = {}) {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error("HF_TOKEN is not configured.");
  }

  const model = options.model || process.env.HF_MODEL || "meta-llama/Llama-3.2-3B-Instruct";
  const url = `https://api-inference.huggingface.co/models/${model}`;

  // Build prompt from messages
  const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n") + "\nASSISTANT: ";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 1024, return_full_text: false }
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HuggingFace API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  let text = "";
  if (Array.isArray(data) && data[0]?.generated_text) {
    text = data[0].generated_text;
  } else if (data?.generated_text) {
    text = data.generated_text;
  }

  return {
    success: true,
    text: text.trim(),
    model,
    provider: "Hugging Face"
  };
}

module.exports = {
  isConfigured,
  generateChatCompletion
};
