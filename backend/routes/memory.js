/* =========================================================
   PROJECT AURA 3.0
   MEMORY & STRATEGIC INSIGHTS ROUTE HANDLER
========================================================= */

"use strict";

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const auraDB = require("../database");
const aiRouterService = require("../services/aiRouter");

const MEMORY_FILE = path.join(__dirname, "..", "data", "memory.json");

function loadNotesFile() {
  try {
    if (!fs.existsSync(MEMORY_FILE)) {
      fs.writeFileSync(MEMORY_FILE, JSON.stringify({ notes: [] }, null, 2), "utf8");
      return [];
    }
    const data = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
    return data.notes || [];
  } catch (_) {
    return [];
  }
}

function saveNotesFile(notes) {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify({ notes }, null, 2), "utf8");
  } catch (err) {
    console.error("[MEMORY FILE WRITE ERROR]", err.message);
  }
}

/* ---------------------------------------------------------
   GET /api/memory
--------------------------------------------------------- */
router.get("/", (req, res) => {
  const memories = auraDB.getMemories();
  const fileNotes = loadNotesFile();
  res.json({
    success: true,
    memories: fileNotes.length > 0 ? fileNotes : memories,
    notes: fileNotes,
    total: Math.max(memories.length, fileNotes.length)
  });
});

/* ---------------------------------------------------------
   GET /api/memory/notes
--------------------------------------------------------- */
router.get("/notes", (req, res) => {
  const fileNotes = loadNotesFile();
  res.json({
    success: true,
    notes: fileNotes
  });
});

/* ---------------------------------------------------------
   POST /api/memory and POST /api/memory/notes
   Stores memory AND analyzes it with AI for better ideas & strategic suggestions!
--------------------------------------------------------- */
const handleSaveMemory = async (req, res) => {
  try {
    const { title, content, category, tags = [] } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: "Content is required." });
    }

    const cleanTitle = (title && title.trim()) || "Directive Note";
    const cleanContent = content.trim();

    // AI Analysis to generate Better Ideas & Strategic Suggestions
    let aiInsight = "";
    let aiTags = [...tags];
    try {
      const insightPrompt = `You are AURA Memory Intelligence.
The user stored this directive / memory in the system:
Title: "${cleanTitle}"
Category: "${category || "note"}"
Content: "${cleanContent}"

Analyze this memory and provide:
1. 💡 Better Idea & Strategic Suggestion: A 2-sentence actionable, smart insight or strategic optimization.
2. 3 Relevant Hashtags.

Format as JSON:
{
  "insight": "💡 High-impact advice or strategic enhancement idea...",
  "tags": ["#tag1", "#tag2", "#tag3"]
}`;

      const aiRes = await aiRouterService.executeAIFallback([
        { role: "system", content: "You are an AI Strategic Advisor. Return valid JSON only." },
        { role: "user", content: insightPrompt }
      ]);

      const match = aiRes.text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        aiInsight = parsed.insight || "";
        if (parsed.tags && Array.isArray(parsed.tags)) {
          aiTags = Array.from(new Set([...aiTags, ...parsed.tags]));
        }
      }
    } catch (_) {
      aiInsight = "💡 Priority logged into neural matrix. Suggested next step: establish tracking milestones.";
    }

    const note = {
      id: "mem_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      title: cleanTitle,
      content: cleanContent,
      category: category || "note",
      tags: aiTags,
      aiInsight: aiInsight || "💡 Context committed to active memory. Ready for cross-session recall.",
      createdAt: new Date().toISOString()
    };

    const notes = loadNotesFile();
    notes.unshift(note);
    saveNotesFile(notes);

    // Also persist in core DB
    auraDB.addMemory(note.category, `${note.title}: ${note.content}`, 0.95, "User Memory Cortex");
    auraDB.addActivity("memory", `Committed memory: "${note.title}" with AI Strategic Insight.`);

    res.json({
      success: true,
      note,
      memory: note
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

router.post("/", handleSaveMemory);
router.post("/notes", handleSaveMemory);

/* ---------------------------------------------------------
   DELETE /api/memory/:id and DELETE /api/memory/notes/:id
--------------------------------------------------------- */
const handleDeleteMemory = (req, res) => {
  const id = req.params.id;
  const notes = loadNotesFile();
  const filtered = notes.filter(n => n.id !== id);
  saveNotesFile(filtered);

  auraDB.addActivity("memory", `Removed memory entry: ${id}`);
  res.json({
    success: true,
    message: `Memory ${id} removed.`
  });
};

router.delete("/:id", handleDeleteMemory);
router.delete("/notes/:id", handleDeleteMemory);

module.exports = router;
