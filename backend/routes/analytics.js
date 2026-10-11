/* =========================================================
   PROJECT AURA 3.0
   STUDENT PERFORMANCE & ANALYTICS ROUTE HANDLER
========================================================= */

"use strict";

const express = require("express");
const router = express.Router();
const auraDB = require("../database");
const aiRouterService = require("../services/aiRouter");

/* ---------------------------------------------------------
   GET /api/analytics
--------------------------------------------------------- */
router.get("/", (req, res) => {
  const activities = auraDB.getActivities(200);
  const conversations = auraDB.getConversations();
  const files = auraDB.getFiles();
  const memories = auraDB.getMemories();

  let commandsProcessed = 0;
  let errors = 0;
  const engineUsage = {
    GENERAL_AI: 0,
    STUDY_ENGINE: 0,
    ENGINEERING_MODE: 0,
    CODING_ENGINE: 0,
    QUIZ_ENGINE: 0,
    MEMORY_ENGINE: 0,
    FILE_ENGINE: 0,
    YOUTUBE_ENGINE: 0,
    RESEARCH_ENGINE: 0,
    MULTI_STEP_AGENT: 0
  };

  activities.forEach(act => {
    if (act.type === "command") commandsProcessed++;
    if (act.type === "error") errors++;
    if (act.metadata?.route && engineUsage[act.metadata.route] !== undefined) {
      engineUsage[act.metadata.route]++;
    }
  });

  const lastCommand = activities.find(a => a.type === "command");

  res.json({
    success: true,
    telemetry: {
      commandsProcessed: Math.max(commandsProcessed, activities.length),
      errors,
      fallbackCount: 0,
      totalConversations: conversations.length,
      indexedFiles: files.length,
      memoryItems: memories.length,
      engineUsage,
      lastCommand: lastCommand ? lastCommand.message : "None",
      recentActivities: activities.slice(0, 15)
    }
  });
});

/* ---------------------------------------------------------
   GET /api/analytics/performance
   Returns detailed mock test results, marks, percentages,
   and weak topic diagnostics
--------------------------------------------------------- */
router.get("/performance", (req, res) => {
  try {
    // Helper for realistic grading scale (under 25 marks on a 50-mark test is explicitly FOCUS NEEDED)
    function computeRealisticGrade(earned, total = 50) {
      if (!total || total <= 0) total = 50;
      if (earned < (total * 0.5)) return "FOCUS NEEDED";
      const pct = Math.round((earned / total) * 100);
      if (pct >= 94) return "O (Outstanding)";
      if (pct >= 85) return "A+ (Excellent)";
      if (pct >= 75) return "A (Very Good)";
      if (pct >= 62) return "B+ (Good)";
      return "B (Pass / Average)";
    }

    const activities = auraDB.getActivities(300);
    const mockResults = activities
      .filter(a => a.type === "mock_graded" || a.type === "quiz_result")
      .map(a => {
        const earned = a.metadata?.earnedMarks ?? a.metadata?.score ?? 0;
        const total = a.metadata?.totalMarks ?? a.metadata?.total ?? 50;
        const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
        const realisticGrade = computeRealisticGrade(earned, total);
        const subjName = a.metadata?.subject || a.metadata?.topic || "Semester Assessment";
        return {
          id: a.id,
          subject: subjName,
          group: a.metadata?.group || a.metadata?.branch || "Engineering",
          semester: a.metadata?.semester || 1,
          earnedMarks: earned,
          totalMarks: total,
          percentage: pct,
          grade: realisticGrade,
          focusTopics: (a.metadata?.focusTopics && a.metadata.focusTopics.length > 0) ? a.metadata.focusTopics : [
            {
              topic: subjName + " — Foundational Concepts & Derivations",
              importance: "High Priority to score above 25/50 marks",
              guidance: "Master governing laws, 2-mark definitions, and standard diagrams.",
              pdfUrl: `/api/quiz/engineering/notes?subject=${encodeURIComponent(subjName)}&format=pdf`,
              browserSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(subjName + " exam notes pdf solved answers")}`
            }
          ],
          timestamp: a.timestamp
        };
      });

    // If no real tests taken yet, provide realistic baseline examples so student sees UI immediately
    const records = mockResults.length > 0 ? mockResults : [
      {
        id: "mock_demo_1",
        subject: "12th Physics — Electromagnetic Induction & AC",
        group: "12th Standard Board Exam",
        semester: 2,
        earnedMarks: 21,
        totalMarks: 50,
        percentage: 42,
        grade: "FOCUS NEEDED",
        focusTopics: [
          {
            topic: "LCR Series Circuit Resonance & Q-Factor Derivation",
            importance: "Guaranteed 5-mark Board Question",
            guidance: "Review phasor diagram and derive expression for resonant frequency and quality factor.",
            pdfUrl: "/api/quiz/engineering/notes?subject=Electromagnetic%20Induction&format=pdf",
            browserSearchUrl: "https://www.google.com/search?q=LCR+Series+Circuit+Resonance+Derivation+Class+12+PDF"
          },
          {
            topic: "Faraday's Laws & Lenz's Law Energy Conservation",
            importance: "Frequent 2-mark & 3-mark Question",
            guidance: "Formulate magnetic flux change equations and justify how Lenz's law obeys conservation of energy.",
            pdfUrl: "/api/quiz/engineering/notes?subject=Faraday%20Lenz%20Law&format=pdf",
            browserSearchUrl: "https://www.google.com/search?q=Faradays+Lenz+Law+Class+12+Notes+PDF"
          }
        ],
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: "mock_demo_2",
        subject: "Data Structures & Algorithms",
        group: "College Engineering (CSE)",
        semester: 3,
        earnedMarks: 39,
        totalMarks: 50,
        percentage: 78,
        grade: "A (Very Good)",
        focusTopics: [
          {
            topic: "Graph Shortest Path (Dijkstra vs Bellman-Ford)",
            importance: "High Probability 13-mark Exam Question",
            guidance: "Review edge relaxation proofs, greedy choice property, and negative cycle detection.",
            pdfUrl: "/api/quiz/engineering/notes?subject=Data%20Structures%20Algorithms&format=pdf",
            browserSearchUrl: "https://www.google.com/search?q=Dijkstra+Bellman+Ford+algorithm+notes+pdf"
          }
        ],
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ];

    const totalPct = records.reduce((acc, r) => acc + (r.percentage || 0), 0);
    const avgPercentage = Math.round(totalPct / Math.max(1, records.length));

    // Identify weak subjects (< 80%)
    const weakItems = records.filter(r => r.percentage < 80);
    const strongItems = records.filter(r => r.percentage >= 80);

    res.json({
      success: true,
      records,
      stats: {
        totalTestsTaken: records.length,
        averagePercentage: avgPercentage,
        highestScore: Math.max(...records.map(r => r.percentage)),
        strongSubjectsCount: strongItems.length,
        needsFocusCount: weakItems.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------------------------------------
   POST /api/analytics/mock
   Record mock exam submission
--------------------------------------------------------- */
router.post("/mock", (req, res) => {
  try {
    const { subject, group, semester, earnedMarks, totalMarks, percentage, grade, focusTopics, examinerReport } = req.body;
    auraDB.addActivity("mock_graded", `Semester Mock Exam: ${subject} (${earnedMarks}/${totalMarks} - ${percentage}%) [${grade || "A"}]`, {
      subject,
      group: group || "Engineering",
      semester: semester || 1,
      earnedMarks,
      totalMarks,
      percentage,
      grade,
      focusTopics: focusTopics || examinerReport?.focusTopics || [],
      examinerReport,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: "Mock exam recorded in student performance matrix." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------------------------------------
   POST /api/analytics/guide
   AI Performance Guide: Advises students on what subject/topic
   to focus on and gives short & crisp instructions.
--------------------------------------------------------- */
router.post("/guide", async (req, res) => {
  try {
    const { records = [] } = req.body;
    const recordsSummary = records.map(r => `${r.subject} (${r.percentage}%, Grade: ${r.grade})`).join(", ");

    const prompt = `You are AURA AI Academic Performance Mentor.
Student examination records:
${recordsSummary || "General Semester Prep"}

Provide a high-impact, short, and crisp study directive for the student.
Guide them on:
1. Primary subject and main topics requiring immediate focus
2. Short, crisp step-by-step instructions on how to study and master those topics
3. High-yield exam hack

Format strictly as JSON:
{
  "focusSubject": "Subject needing most attention",
  "priorityTopics": ["Key Topic 1", "Key Topic 2", "Key Topic 3"],
  "studyInstructions": [
    "Short crisp action step 1 with emoji",
    "Short crisp action step 2 with emoji",
    "Short crisp action step 3 with emoji"
  ],
  "examHack": "One punchy exam strategy tip",
  "motivationalQuote": "Short inspiring quote"
}`;

    const aiRes = await aiRouterService.executeAIFallback([
      { role: "system", content: "You are an AI Academic Mentor. Return ONLY valid JSON." },
      { role: "user", content: prompt }
    ]);

    let guide = null;
    try {
      const match = aiRes.text.match(/\{[\s\S]*\}/);
      if (match) guide = JSON.parse(match[0]);
    } catch (_) {}

    if (!guide) {
      guide = {
        focusSubject: records[0]?.subject || "Core Engineering Subject",
        priorityTopics: ["Unit III Derivations", "High-Weightage Formulas", "Previous Year 16-Mark PYQs"],
        studyInstructions: [
          "🎯 Focus on repeated PYQs first — 70% of university papers repeat core derivation templates.",
          "⚡ Write out diagrams and flowcharts twice by hand to secure easy presentation marks.",
          "⏱️ Practice 45-minute timed sessions for analytical problem solving."
        ],
        examHack: "In 16-mark university questions, structure your answer into Definition, Circuit/Architecture Diagram, Working Principle, and Applications.",
        motivationalQuote: "Precision in preparation creates certainty in results."
      };
    }

    res.json({ success: true, guide, provider: aiRes.provider });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
