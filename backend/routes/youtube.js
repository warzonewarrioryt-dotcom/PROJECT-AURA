/* =========================================================
   PROJECT AURA 3.0
   YOUTUBE ROUTE HANDLER
========================================================= */

"use strict";

const express = require("express");
const router = express.Router();
const youtubeService = require("../services/youtube");
const auraDB = require("../database");

/* ---------------------------------------------------------
   GET /api/youtube/status
--------------------------------------------------------- */
router.get("/status", (req, res) => {
  res.json({
    success: true,
    configured: youtubeService.isConfigured(),
    service: "YouTube Intelligence Hub",
    provider: youtubeService.isConfigured() ? "YouTube Data API v3" : "Curated Fallback Engine"
  });
});

/* ---------------------------------------------------------
   GET & POST /api/youtube/search
--------------------------------------------------------- */
const handleYouTubeSearch = async (req, res) => {
  try {
    const query = req.body?.query || req.body?.q || req.query?.q || req.query?.query || "Python tutorials";
    const maxResults = parseInt(req.body?.maxResults || req.query?.maxResults || "6", 10);

    const result = await youtubeService.searchYouTube(query, maxResults);

    auraDB.addActivity("youtube", `YouTube searched for: "${query}"`, {
      resultsCount: result.results?.length
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

router.get("/search", handleYouTubeSearch);
router.post("/search", handleYouTubeSearch);

module.exports = router;
