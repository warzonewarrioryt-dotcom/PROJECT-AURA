/* =========================================================
   PROJECT AURA 3.0
   RESEARCH ROUTE HANDLER (TAVILY)
========================================================= */

"use strict";

const express = require("express");
const router = express.Router();
const tavilyService = require("../services/tavily");
const aiRouterService = require("../services/aiRouter");
const auraDB = require("../database");

/* ---------------------------------------------------------
   POST /api/research
--------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const { query, depth, maxResults } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, error: "Query is required." });
    }

    const searchRes = await tavilyService.searchWeb(query, { depth, maxResults });

    // Generate AI synthesized executive research summary
    let summary = searchRes.answer;
    if (!summary || summary.length < 50) {
      const context = (searchRes.results || []).map(r => `Title: ${r.title}\nSource: ${r.url}\nContent: ${r.content}`).join("\n\n");
      const summaryPrompt = [
        { role: "system", content: "You are AURA Research Engine. Provide a comprehensive, structured executive summary based on the provided web findings." },
        { role: "user", content: `Topic: ${query}\n\nWeb Data:\n${context}` }
      ];
      const aiSummary = await aiRouterService.executeAIFallback(summaryPrompt);
      summary = aiSummary.text;
    }

    auraDB.addActivity("research", `Web research conducted: "${query.slice(0, 35)}..."`, {
      resultsCount: searchRes.results?.length
    });

    res.json({
      success: true,
      query,
      summary,
      results: searchRes.results,
      source: searchRes.source
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
