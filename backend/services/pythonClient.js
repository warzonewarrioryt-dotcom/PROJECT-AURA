/* =========================================================
   PROJECT AURA 3.0
   PYTHON AI ENGINE CLIENT BRIDGE
========================================================= */

"use strict";

/**
 * Dynamically resolves the internal URL of the Python AI Engine service.
 * In Vercel Services, the internal URL is injected into process.env.PYTHON_ENGINE_URL
 * via the caller-side service binding at runtime.
 */
function getPythonEngineUrl(endpointPath = "") {
  const base = process.env.PYTHON_ENGINE_URL || "http://127.0.0.1:5050";
  return new URL(endpointPath.replace(/^\//, ""), base.endsWith("/") ? base : `${base}/`).toString();
}

async function checkPythonHealth() {
  try {
    const url = getPythonEngineUrl("health");
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "ONLINE";
  } catch (_) {
    return false;
  }
}

async function classifyIntentPython(text) {
  try {
    const url = getPythonEngineUrl("intent");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(3000)
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
    const url = getPythonEngineUrl("nlp");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(3000)
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
    const url = getPythonEngineUrl("rag/similarity");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, chunks, topK }),
      signal: AbortSignal.timeout(4000)
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
    const url = getPythonEngineUrl("analytics");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizResults }),
      signal: AbortSignal.timeout(3000)
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
  analyzeAnalyticsPython,
  getPythonEngineUrl
};
