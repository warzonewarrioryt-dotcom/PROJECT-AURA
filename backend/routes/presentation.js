/* =========================================================
   PROJECT AURA 3.0
   PRESENTATION GENERATION & EXPORT ROUTE HANDLER
   Generates valid PPTX and PDF presentations with slide previews,
   rich themes, notes, and direct downloadable file buffers.
========================================================= */

"use strict";

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const PptxGenJS = require("pptxgenjs");
const PDFDocument = require("pdfkit");
const aiRouterService = require("../services/aiRouter");

// Temporary presentations directory
const presDir = path.join(__dirname, "..", "uploads", "presentations");
if (!fs.existsSync(presDir)) {
  fs.mkdirSync(presDir, { recursive: true });
}

/**
 * Parses raw text or structured outline into slide objects
 */
function parsePresentationOutline(rawText, topic, slideCount = 5) {
  const slides = [];
  const chunks = rawText.split(/(?:Slide\s*\d+|SLIDE\s*\d+|##\s*Slide\s*\d+)/i).filter(c => c.trim().length > 10);

  if (chunks.length > 0) {
    chunks.forEach((chunk, idx) => {
      const lines = chunk.trim().split("\n").map(l => l.trim()).filter(Boolean);
      const titleLine = lines[0] ? lines[0].replace(/^[#*:\-\s]+/, "").replace(/\*\*+/g, "") : `Slide ${idx + 1}`;
      const bullets = [];
      let notes = "";

      lines.slice(1).forEach(l => {
        if (/speaker notes|notes:|script:/i.test(l)) {
          notes += l.replace(/.*(?:notes:|script:)/i, "").trim() + " ";
        } else {
          const clean = l.replace(/^[-*•►✧]\s+/, "").replace(/\*\*+/g, "");
          if (clean && clean.length > 3) bullets.push(clean);
        }
      });

      slides.push({
        number: idx + 1,
        title: titleLine || `Key Focus Area ${idx + 1}`,
        bullets: bullets.slice(0, 5),
        notes: notes.trim() || `Discuss the key aspects and strategic impacts of ${titleLine}.`
      });
    });
  }

  // Fallback default structure if parsing failed or was sparse
  if (slides.length < 2) {
    slides.length = 0;
    slides.push(
      { number: 1, title: `${topic}: Executive Vision`, bullets: ["Strategic Context & Mission Imperatives", "Core Objectives & Technology Pillars", "Target Outcomes & Timeline"], notes: "Welcome the stakeholders and set the strategic context." },
      { number: 2, title: "Current Landscape & Latency Analysis", bullets: ["Identified Friction Points & Gaps", "Scalability Constraints in Legacy Workflows", "The Need for Autonomous AI Architecture"], notes: "Outline the key problems that necessitate a modern approach." },
      { number: 3, title: "Solution Blueprint & Core Pillars", bullets: ["Modular Intelligence Pipelines", "Deterministic Execution & Fallback Redundancy", "Real-Time Grounding & Telemetry"], notes: "Walk through the architectural blueprint." },
      { number: 4, title: "Operational Execution & Milestones", bullets: ["Phase 1: Foundation Deployment", "Phase 2: Platform Integration & Automated QA", "Phase 3: Production Rollout & Telemetry"], notes: "Detail actionable roadmap and resource allocations." },
      { number: 5, title: "Strategic Impact & Key Takeaways", bullets: ["Measurable 40%+ Efficiency Gains", "Unified Operational Command", "Next Actions & Stakeholder Sign-Off"], notes: "Conclude with concrete measurable outcomes." }
    );
  }

  return slides.slice(0, Math.max(2, Math.min(slideCount, 12)));
}

/**
 * POST /api/presentation/generate
 * Generates presentation structure and speech script using AI
 */
router.post("/generate", async (req, res) => {
  try {
    const { topic, slideCount = 5, audience = "Executive" } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, error: "Presentation topic is required." });
    }

    const effectiveTopic = topic.trim();
    const count = parseInt(slideCount, 10) || 5;

    const prompt = `Generate a master-level ${count}-slide executive presentation deck AND speaker script for: "${effectiveTopic}".
Audience: ${audience}

Structure your response strictly as:
PART 1: SLIDE BLUEPRINT
For each slide (1 to ${count}), use this format:
Slide [number]: [Slide Title]
- [High impact bullet point 1]
- [High impact bullet point 2]
- [High impact bullet point 3]
Notes: [1-2 sentences of executive speaker notes]

PART 2: COMPLETE PRESENTATION SPEECH SCRIPT
Provide a polished, confident 2-3 minute speech delivery text matching the slides.`;

    const aiRes = await aiRouterService.executeAIFallback([
      { role: "system", content: "You are an Executive Presentation Architect and Presentation Engine. Return clear structured slide blueprints." },
      { role: "user", content: prompt }
    ]);

    const rawResponse = aiRes.text || "";
    const parsedSlides = parsePresentationOutline(rawResponse, effectiveTopic, count);

    // Extract speech script
    let speechScript = "";
    const scriptMatch = rawResponse.match(/PART 2: COMPLETE PRESENTATION SPEECH SCRIPT([\s\S]*)/i);
    if (scriptMatch && scriptMatch[1]) {
      speechScript = scriptMatch[1].trim();
    } else {
      speechScript = parsedSlides.map(s => `Slide ${s.number} (${s.title}): ${s.notes}`).join("\n\n");
    }

    res.json({
      success: true,
      topic: effectiveTopic,
      slideCount: parsedSlides.length,
      slides: parsedSlides,
      speechScript,
      rawOutput: rawResponse,
      provider: aiRes.provider
    });
  } catch (err) {
    console.error("[PRESENTATION GENERATE ERROR]", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Generates a valid PPTX buffer
 */
async function buildPptxBuffer(slides, topic, themeKey = "cyber-dark", uploadedImage = null) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.title = topic || "Project Aura Presentation";

  const isLight = themeKey === "minimal-light";
  const isGold = themeKey === "champagne-gold";

  // Palette settings
  const bgHex = isLight ? "F8F9FA" : (isGold ? "0D0E12" : "090A0F");
  const cardBgHex = isLight ? "FFFFFF" : (isGold ? "151720" : "121620");
  const titleColor = isLight ? "1A1D20" : (isGold ? "E5C158" : "F8FAFC");
  const textColor = isLight ? "334155" : (isGold ? "D1D5DB" : "94A3B8");
  const accentColor = isGold ? "D4AF37" : (isLight ? "0284C7" : "38BDF8");
  const borderColor = isLight ? "E2E8F0" : (isGold ? "2E2818" : "1E293B");

  // Cover Slide
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: bgHex };
  coverSlide.addText("PROJECT AURA 3.0 · EXECUTIVE AI PRESENTATION", {
    x: 0.8, y: 1.5, w: 8.5, h: 0.4,
    fontSize: 11, bold: true, color: accentColor, fontFace: "Calibri"
  });
  coverSlide.addText(topic, {
    x: 0.8, y: 2.1, w: 8.5, h: 1.6,
    fontSize: 32, bold: true, color: titleColor, fontFace: "Calibri"
  });
  coverSlide.addText("Generated by Project Aura Autonomous AI Presentation Engine", {
    x: 0.8, y: 4.2, w: 8.5, h: 0.4,
    fontSize: 12, italic: true, color: textColor, fontFace: "Calibri"
  });

  // Slide Body
  slides.forEach(s => {
    const slide = pptx.addSlide();
    slide.background = { color: bgHex };

    // Card Container
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 0.6, w: 8.8, h: 5.6,
      fill: { color: cardBgHex },
      line: { color: borderColor, width: 1 },
      rectRadius: 0.12
    });

    // Slide Tag
    slide.addText(`SLIDE ${String(s.number).padStart(2, "0")} · EXECUTIVE BRIEF`, {
      x: 0.9, y: 0.85, w: 3.5, h: 0.3,
      fontSize: 10, bold: true, color: accentColor, fontFace: "Calibri"
    });

    // Slide Title
    slide.addText(s.title, {
      x: 0.9, y: 1.25, w: 8.2, h: 0.7,
      fontSize: 22, bold: true, color: titleColor, fontFace: "Calibri"
    });

    const hasImg = Boolean(s.exactImage || uploadedImage);

    // Bullets
    if (s.bullets && s.bullets.length > 0) {
      const bulletItems = s.bullets.map(b => ({
        text: b,
        options: {
          bullet: true,
          fontSize: hasImg ? 12 : 14,
          color: textColor,
          fontFace: "Calibri",
          lineSpacing: hasImg ? 20 : 26
        }
      }));
      slide.addText(bulletItems, {
        x: 0.9, y: 2.1, w: hasImg ? 4.4 : 8.2, h: 3.6
      });
    }

    // Embed Image if provided
    const imgData = s.exactImage || uploadedImage;
    if (imgData && typeof imgData === "string" && imgData.startsWith("data:image")) {
      try {
        slide.addImage({
          data: imgData,
          x: 5.5, y: 2.0, w: 3.6, h: 3.6,
          sizing: { type: "contain" }
        });
      } catch (e) {
        console.warn("[PPTX EMBED IMAGE WARNING]", e.message);
      }
    }

    if (s.notes) {
      slide.addNotes(s.notes);
    }
  });

  return await pptx.write({ outputType: "nodebuffer" });
}

/**
 * Generates a valid PDF buffer (16:9 Landscape)
 */
function buildPdfBuffer(slides, topic, themeKey = "cyber-dark") {
  return new Promise((resolve, reject) => {
    try {
      // 16:9 widescreen landscape: 960 x 540 points
      const doc = new PDFDocument({
        size: [960, 540],
        margins: { top: 40, bottom: 40, left: 50, right: 50 },
        info: {
          Title: topic || "Project Aura Presentation",
          Author: "PROJECT AURA 3.0"
        }
      });

      const chunks = [];
      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", err => reject(err));

      const isLight = themeKey === "minimal-light";
      const isGold = themeKey === "champagne-gold";

      const bgHex = isLight ? "#F8F9FA" : (isGold ? "#0D0E12" : "#090A0F");
      const cardBgHex = isLight ? "#FFFFFF" : (isGold ? "#151720" : "#121620");
      const titleColor = isLight ? "#1A1D20" : (isGold ? "#E5C158" : "#F8FAFC");
      const textColor = isLight ? "#334155" : (isGold ? "#D1D5DB" : "#94A3B8");
      const accentColor = isGold ? "#D4AF37" : (isLight ? "#0284C7" : "#38BDF8");
      const borderColor = isLight ? "#E2E8F0" : (isGold ? "#2E2818" : "#1E293B");

      // Slide 1: Cover Slide
      doc.rect(0, 0, 960, 540).fill(bgHex);
      doc.rect(40, 40, 880, 460).fillAndStroke(cardBgHex, borderColor);

      doc.fillColor(accentColor).fontSize(12).font("Helvetica-Bold")
        .text("PROJECT AURA 3.0 · EXECUTIVE AI PRESENTATION", 70, 160);

      doc.fillColor(titleColor).fontSize(34).font("Helvetica-Bold")
        .text(topic, 70, 200, { width: 800, lineGap: 6 });

      doc.fillColor(textColor).fontSize(13).font("Helvetica-Oblique")
        .text("Synthesized by Project Aura Autonomous Presentation Engine", 70, 360);

      // Slide Pages
      slides.forEach((s) => {
        doc.addPage({ size: [960, 540], margins: { top: 40, bottom: 40, left: 50, right: 50 } });
        doc.rect(0, 0, 960, 540).fill(bgHex);
        doc.rect(40, 40, 880, 460).fillAndStroke(cardBgHex, borderColor);

        // Header Tag
        doc.fillColor(accentColor).fontSize(11).font("Helvetica-Bold")
          .text(`SLIDE ${String(s.number).padStart(2, "0")} · STRATEGIC BRIEF`, 70, 75);

        // Slide Title
        doc.fillColor(titleColor).fontSize(24).font("Helvetica-Bold")
          .text(s.title, 70, 105, { width: 800 });

        // Divider
        doc.strokeColor(borderColor).lineWidth(1).moveTo(70, 145).lineTo(890, 145).stroke();

        // Bullets
        let bulletY = 170;
        if (s.bullets && s.bullets.length > 0) {
          s.bullets.forEach((b) => {
            doc.fillColor(accentColor).fontSize(14).font("Helvetica-Bold")
              .text("• ", 70, bulletY);
            doc.fillColor(textColor).fontSize(14).font("Helvetica")
              .text(b, 90, bulletY, { width: 780, lineGap: 4 });
            bulletY += 40;
          });
        }

        // Speaker Note Footer
        if (s.notes) {
          doc.fillColor(accentColor).fontSize(10).font("Helvetica-Bold")
            .text("SPEAKER NOTES:", 70, 430);
          doc.fillColor(textColor).fontSize(10).font("Helvetica-Oblique")
            .text(s.notes, 175, 430, { width: 700 });
        }
      });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * POST /api/presentation/export, /export/pptx, /export/pdf
 * Downloads the presentation as valid PPTX or PDF file
 */
router.post(["/export", "/export/pptx", "/export/pdf"], async (req, res) => {
  try {
    const isPdfRoute = req.path.includes("pdf");
    const { slides = [], topic = "Project Aura Presentation", format = isPdfRoute ? "pdf" : "pptx", themeKey = "cyber-dark", image = null } = req.body;

    if (!Array.isArray(slides) || slides.length === 0) {
      return res.status(400).json({ success: false, error: "Slides array is required to export presentation." });
    }

    const cleanTopic = (topic || "project-aura-presentation").trim();
    const safeBaseName = cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "project-aura-presentation";

    if (format.toLowerCase() === "pdf") {
      const pdfBuffer = await buildPdfBuffer(slides, cleanTopic, themeKey);
      const filename = `${safeBaseName}.pdf`;

      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdfBuffer.length);
      return res.send(pdfBuffer);
    }

    // Default to PPTX
    const pptxBuffer = await buildPptxBuffer(slides, cleanTopic, themeKey, image);
    const filename = `${safeBaseName}.pptx`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Length", pptxBuffer.length);
    return res.send(pptxBuffer);
  } catch (err) {
    console.error("[PRESENTATION EXPORT ERROR]", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
