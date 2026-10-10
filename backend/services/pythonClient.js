/* =========================================================
   PROJECT AURA 3.0
   PYTHON AI ENGINE CLIENT BRIDGE
========================================================= */

"use strict";

const PYTHON_URL = process.env.PYTHON_ENGINE_URL || "http://127.0.0.1:5050";

async function checkPythonHealth() {
  try {
    const res = await fetch(`${PYTHON_URL}/health`, { signal: AbortSignal.timeout(300) });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "ONLINE";
  } catch (_) {
    return false;
  }
}

async function classifyIntentPython(text) {
  try {
    const res = await fetch(`${PYTHON_URL}/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(300)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    // Fallback to internal classification if Python is offline
  }
  return null;
}

async function analyzeNlpPython(text) {
  try {
    const res = await fetch(`${PYTHON_URL}/nlp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(300)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (_) {}
  return null;
}

async function scoreSimilarityPython(query, chunks, topK = 5) {
  try {
    const res = await fetch(`${PYTHON_URL}/rag/similarity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, chunks, topK }),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const json = await res.json();
      return json;
    }
  } catch (_) {}
  return null;
}

async function analyzeAnalyticsPython(quizResults) {
  try {
    const res = await fetch(`${PYTHON_URL}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizResults }),
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (_) {}
  return null;
}

module.exports = {
  checkPythonHealth,
  classifyIntentPython,
  analyzeNlpPython,
  scoreSimilarityPython,
  analyzeAnalyticsPython
};
