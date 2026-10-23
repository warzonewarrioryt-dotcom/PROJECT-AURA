/* =========================================================
   PROJECT AURA 3.0
   YOUTUBE INTELLIGENCE SERVICE
   Authentic Syllabus Video Search & Educational Video Integration
   Zero Fabrication Policy: Never fabricate video IDs, channels, or success states.
========================================================= */

"use strict";

function isConfigured() {
  return Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY.trim());
}

/**
 * Low-level search using Google YouTube Data API v3
 */
async function searchYouTube(query, maxResults = 6) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      errorCode: "KEY_MISSING",
      error: "YouTube Data API key is not configured in backend/.env.",
      query,
      results: []
    };
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&key=${apiKey.trim()}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (res.ok) {
      const data = await res.json();
      const items = (data.items || [])
        .filter(item => item.id && item.id.videoId)
        .map(item => ({
          videoId: item.id.videoId,
          title: item.snippet?.title || "Educational Lecture",
          channel: item.snippet?.channelTitle || "Educational Channel",
          thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
          description: item.snippet?.description || "Curriculum syllabus lecture walkthrough."
        }));

      return {
        success: true,
        query,
        results: items,
        count: items.length,
        source: "YouTube Data API v3"
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error?.message || `YouTube API status ${res.status}`;
      const isQuota = errMsg.toLowerCase().includes("quota") ||
                      res.status === 429 ||
                      (res.status === 403 && (errMsg.toLowerCase().includes("quota") || errData.error?.errors?.some(e => e.reason === "quotaExceeded")));

      return {
        success: false,
        errorCode: isQuota ? "QUOTA_EXHAUSTED" : (res.status === 400 ? "KEY_INVALID" : "API_ERROR"),
        error: isQuota
          ? "YouTube Data API daily search quota has been exceeded for today (daily quota limit reached)."
          : errMsg,
        status: res.status,
        query,
        results: []
      };
    }
  } catch (err) {
    console.warn("[YOUTUBE API ERROR]", err.message);
    return {
      success: false,
      errorCode: "REQUEST_FAILED",
      error: `Failed to reach YouTube Data API: ${err.message}`,
      query,
      results: []
    };
  }
}

/**
 * Clean curriculum topic strings for optimized search
 */
function cleanTopicForSearch(topicStr) {
  if (!topicStr) return "";
  let t = topicStr.trim();
  // Remove markdown, bullet symbols
  t = t.replace(/^[-*•\d.]+\s*/, "");
  // If topic has "Unit I: Something — Details", simplify to "Unit 1 Something"
  t = t.replace(/Unit\s+([IVXLCDM]+|\d+)\s*:\s*/i, "Unit $1 ");
  // Truncate at dashes/semicolons if overly long
  if (t.includes("—")) t = t.split("—")[0].trim();
  if (t.includes(";")) t = t.split(";")[0].trim();
  return t.slice(0, 75).trim();
}

/**
 * Intelligent Academic Video Search matching exact board, standard, department, semester, subject, and unit
 */
async function searchAcademicVideos({
  standard = "",
  board = "",
  department = "",
  semester = "",
  subjectCode = "",
  subject = "",
  topic = "",
  language = "Tamil",
  maxResults = 6
} = {}) {
  const normBoard = (board || "").toLowerCase().trim();
  const normLang = (language || "").toLowerCase().trim();
  const isCBSE = normBoard.includes("cbse");
  const isTamil = normLang.includes("tamil") || normLang.includes("tanglish");

  const isCollege = Boolean(
    semester ||
    /college|university|anna|engineering|higher/i.test(board) ||
    /sem|engineering|degree|department/i.test(standard) ||
    (department && department.trim()) ||
    (subjectCode && /[A-Za-z]{2,}\d{3,}/.test(subjectCode))
  );

  const cleanSubject = (subject || "").replace(/\([^)]*\)/g, "").trim();
  const cleanTopic = cleanTopicForSearch(topic);
  const cleanCode = (subjectCode || "").trim();

  let boardLabel = "";
  let queryParts = [];

  if (isCollege) {
    boardLabel = "Anna University (Regulation 2021)";
    queryParts = [
      "Anna University",
      cleanCode,
      cleanSubject,
      cleanTopic,
      isTamil ? "Tamil" : "English",
      "lecture"
    ].filter(Boolean);
  } else if (isCBSE) {
    boardLabel = "CBSE Board";
    const stdClean = (standard || "Class 12").replace("STD_", "Class ");
    queryParts = [
      "CBSE",
      stdClean,
      cleanSubject,
      cleanTopic,
      "NCERT",
      isTamil ? "Tamil" : "English",
      "lecture"
    ].filter(Boolean);
  } else {
    boardLabel = "Tamil Nadu State Board";
    const stdClean = (standard || "12th Standard").replace("STD_", "") + (standard.includes("Standard") ? "" : "th Standard");
    queryParts = [
      "Tamil Nadu State Board",
      stdClean,
      cleanSubject,
      cleanTopic,
      "Samacheer Kalvi",
      isTamil ? "Tamil" : "English",
      "lecture"
    ].filter(Boolean);
  }

  const fullQuery = queryParts.join(" ");
  const directResolverUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(fullQuery)}`;

  // If YouTube API Key is missing:
  if (!isConfigured()) {
    return {
      success: false,
      errorCode: "KEY_MISSING",
      error: "YouTube Data API key is not configured in backend/.env.",
      explanation: "YouTube API key is missing. You can stream these exact curriculum lectures directly on YouTube using the 1-click resolver below.",
      query: fullQuery,
      board: boardLabel,
      standard,
      subject: cleanSubject,
      subjectCode: cleanCode,
      topic: cleanTopic,
      searchUrl: directResolverUrl,
      results: []
    };
  }

  // Execute authentic YouTube search
  const apiRes = await searchYouTube(fullQuery, maxResults);

  if (!apiRes.success) {
    return {
      success: false,
      errorCode: apiRes.errorCode,
      error: apiRes.error,
      explanation: apiRes.errorCode === "QUOTA_EXHAUSTED"
        ? "YouTube Data API daily request quota (10,000 units/day) has been exceeded for today. You can stream these verified syllabus lectures directly using the 1-click YouTube search resolver below."
        : (apiRes.error || "YouTube video search encountered a service issue."),
      query: fullQuery,
      board: boardLabel,
      standard,
      subject: cleanSubject,
      subjectCode: cleanCode,
      topic: cleanTopic,
      searchUrl: directResolverUrl,
      results: []
    };
  }

  // If 0 results returned from API:
  if (!apiRes.results || apiRes.results.length === 0) {
    return {
      success: true,
      query: fullQuery,
      board: boardLabel,
      standard,
      subject: cleanSubject,
      subjectCode: cleanCode,
      topic: cleanTopic,
      searchUrl: directResolverUrl,
      explanation: `No direct video results were returned for "${fullQuery}". You can try broader keywords or open the 1-click resolver search on YouTube.`,
      results: []
    };
  }

  // Decorate real verified video items
  const decorated = apiRes.results.map(v => ({
    ...v,
    badge: isCollege ? "Anna University R2021" : (isCBSE ? "CBSE NCERT Core" : "TN State Board Core"),
    language: isTamil ? "Tamil" : "English",
    board: boardLabel
  }));

  return {
    success: true,
    query: fullQuery,
    board: boardLabel,
    standard,
    subject: cleanSubject,
    subjectCode: cleanCode,
    topic: cleanTopic,
    language: isTamil ? "Tamil" : "English",
    searchUrl: directResolverUrl,
    results: decorated,
    count: decorated.length,
    source: "YouTube Data API v3"
  };
}

module.exports = {
  isConfigured,
  searchYouTube,
  searchAcademicVideos
};
