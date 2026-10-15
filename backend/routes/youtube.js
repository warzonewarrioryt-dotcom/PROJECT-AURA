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
    const subject = req.body?.subject || req.query?.subject || "";
    const topic = req.body?.topic || req.query?.topic || "";
    const standard = req.body?.standard || req.query?.standard || "";
    const board = req.body?.board || req.query?.board || "";
    const language = req.body?.language || req.query?.language || "Tamil";
    const maxResults = parseInt(req.body?.maxResults || req.query?.maxResults || "6", 10);
    const query = req.body?.query || req.body?.q || req.query?.q || req.query?.query;

    let result;
    if (subject || topic) {
      result = await youtubeService.searchAcademicVideos({
        standard,
        board,
        subject,
        topic,
        language,
        maxResults
      });
    } else {
      result = await youtubeService.searchYouTube(query || "Python tutorials", maxResults);
    }

    auraDB.addActivity("youtube", `YouTube search: "${topic || subject || query || 'Academic Query'}"`, {
      resultsCount: result.results?.length || 0,
      language: language
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
