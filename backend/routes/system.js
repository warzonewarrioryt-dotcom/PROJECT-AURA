/* =========================================================
   PROJECT AURA 3.0
   WINDOWS SYSTEM CONTROL & COMPANION ROUTE
   Strictly bound to localhost, protected allowlist dispatch
========================================================= */

"use strict";

const express = require("express");
const router = express.Router();
const windowsCompanion = require("../services/windowsCompanion");
const groqService = require("../services/groq");

/**
 * Security Middleware: Restrict access to localhost only
 */
function localhostOnly(req, res, next) {
  const remoteIp = req.socket.remoteAddress || req.ip || "";
  const isLocal =
    remoteIp === "127.0.0.1" ||
    remoteIp === "::1" ||
    remoteIp === "::ffff:127.0.0.1" ||
    remoteIp.includes("127.0.0.1") ||
    req.hostname === "localhost" ||
    req.hostname === "127.0.0.1";

  if (!isLocal) {
    return res.status(403).json({
      success: false,
      error: "Access denied. Windows System Companion is restricted to localhost connections only."
    });
  }
  next();
}

router.use(localhostOnly);

/**
 * GET /api/system/capabilities
 */
router.get(["/capabilities", "/status"], async (req, res) => {
  try {
    const caps = await windowsCompanion.getCapabilities();
    res.json(caps);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/system/interpret
 * Natural Language Command Understanding for English, Tamil & Tanglish
 */
router.post("/interpret", async (req, res) => {
  try {
    const { transcript, language = "auto" } = req.body;
    const raw = (transcript || "").trim();

    if (!raw) {
      return res.status(400).json({ success: false, error: "Transcript is required." });
    }

    const lower = raw.toLowerCase().replace(/[.,?!;:_]/g, " ").replace(/\s+/g, " ").trim();
    const isTa = /[\u0B80-\u0BFF]/.test(raw) || /(?:pannu|pannattuma|thira|moodu|niruthu|vekku|thedu|kandupidi|kaattu|soller|machan|thambi|aam|illai|vendaam)/i.test(lower);

    // Rule 1: Cancellation & Emergency Stop
    if (/^(?:cancel|stop|abort|don't do that|dont do that|vendaam|niruthu|cancel pannu)$/i.test(lower) ||
        lower.includes("cancel pannu") || lower.includes("dont do that") || lower.includes("don't do that") || lower.includes("niruthu")) {
      return res.json({
        success: true,
        action: "cancel",
        requiresConfirmation: false,
        spokenReply: isTa ? "செயல்பாடு ரத்து செய்யப்பட்டது." : "Operation cancelled."
      });
    }

    // Rule 2: Capabilities / Help
    if (lower.includes("what can you control") || lower.includes("what can you do") ||
        lower.includes("enna lam control") || lower.includes("control panna mudiyum") ||
        lower.includes("என்ன கட்டுப்படுத்த")) {
      return res.json({
        success: true,
        action: "capabilities",
        requiresConfirmation: false,
        spokenReply: isTa
          ? "நான் விண்டோஸ் கேமரா, கூகிள் குரோம், நோட்பேட், கால்குலேட்டர், டவுன்லோட்ஸ், வால்யூம், ஸ்கிரீன்ஷாட், வைஃபை மற்றும் புளூடூத் ஆகியவற்றை கட்டுப்படுத்த முடியும்."
          : "I can open Camera, Chrome, Notepad, Calculator, Downloads folder, adjust volume, take screenshots, inspect Bluetooth, Wi-Fi, and manage system power."
      });
    }

    // Rule 3: Camera
    if (lower.includes("camera") || lower.includes("கேமரா") || lower.includes("webcam")) {
      return res.json({
        success: true,
        action: "launch_app",
        args: { app: "camera" },
        requiresConfirmation: false,
        spokenReply: isTa ? "கேமரா திறக்கப்படுகிறது." : "Opening camera."
      });
    }

    // Rule 4: Chrome & Web Search
    if (lower.includes("chrome") || lower.includes("குரோம்")) {
      // Check if user specifically asked to search inside Chrome
      const searchMatch = lower.match(/(?:search|thedu|theaduka|kandupidi)\s+(?:for\s+)?(.+)/i) ||
                          lower.match(/(.+)\s+(?:search pannu|thedu)/i);
      if (searchMatch) {
        let topic = searchMatch[1].replace(/chrome|open panni|open pannu|youtube/gi, "").trim();
        const isYoutube = lower.includes("youtube") || lower.includes("யூடியூப்");
        return res.json({
          success: true,
          action: "search_web",
          args: { query: topic || "search", engine: isYoutube ? "youtube" : "google" },
          requiresConfirmation: false,
          spokenReply: isTa ? `குரோமில் ${topic} தேடப்படுகிறது.` : `Searching for ${topic} in Chrome.`
        });
      }

      return res.json({
        success: true,
        action: "launch_app",
        args: { app: "chrome" },
        requiresConfirmation: false,
        spokenReply: isTa ? "கூகிள் குரோம் திறக்கப்படுகிறது." : "Opening Google Chrome."
      });
    }

    // Rule 5: Notepad
    if (lower.includes("notepad") || lower.includes("நோட்பேட்") || lower.includes("text editor")) {
      return res.json({
        success: true,
        action: "launch_app",
        args: { app: "notepad" },
        requiresConfirmation: false,
        spokenReply: isTa ? "நோட்பேட் திறக்கப்படுகிறது." : "Opening Notepad."
      });
    }

    // Rule 6: Calculator
    if (lower.includes("calculator") || lower.includes("கால்குலேட்டர்") || lower.includes("calc")) {
      return res.json({
        success: true,
        action: "launch_app",
        args: { app: "calculator" },
        requiresConfirmation: false,
        spokenReply: isTa ? "கால்குலேட்டர் திறக்கப்படுகிறது." : "Opening Calculator."
      });
    }

    // Rule 7: Downloads or File Explorer
    if (lower.includes("download") || lower.includes("பதிவிறக்கம்")) {
      return res.json({
        success: true,
        action: "launch_app",
        args: { app: "downloads" },
        requiresConfirmation: false,
        spokenReply: isTa ? "பதிவிறக்கங்கள் கோப்புறை திறக்கப்படுகிறது." : "Opening Downloads folder."
      });
    }
    if (lower.includes("file explorer") || lower.includes("explorer") || lower.includes("files folder") || lower.includes("my computer") || lower.includes("கோப்புறை")) {
      return res.json({
        success: true,
        action: "launch_app",
        args: { app: "explorer" },
        requiresConfirmation: false,
        spokenReply: isTa ? "ஃபைல் எக்ஸ்ப்ளோரர் திறக்கப்படுகிறது." : "Opening File Explorer."
      });
    }

    // Rule 8: Bluetooth
    if (lower.includes("bluetooth") || lower.includes("ப்ளூடூத்") || lower.includes("புளூடூத்")) {
      const isOff = lower.includes("off") || lower.includes("disable") || lower.includes("moodu");
      return res.json({
        success: true,
        action: "control_bluetooth",
        args: { action: isOff ? "off" : "on" },
        requiresConfirmation: false,
        spokenReply: isTa
          ? "புளூடூத் நிலை சரிபார்க்கப்பட்டு, விண்டோஸ் அமைப்புகள் திறக்கப்படுகிறது."
          : "Checking Bluetooth status and opening Windows Bluetooth Settings."
      });
    }

    // Rule 9: Wi-Fi
    if (lower.includes("wi-fi") || lower.includes("wifi") || lower.includes("வைஃபை")) {
      const isOff = lower.includes("off") || lower.includes("disable") || lower.includes("moodu") || lower.includes("turn off");
      return res.json({
        success: true,
        action: "control_wifi",
        args: { enable: !isOff },
        requiresConfirmation: isOff, // Turning Wi-Fi off requires confirmation
        confirmationPrompt: isTa
          ? "வைஃபை அணைக்கப்படும். உறுதி செய்யவா?"
          : "Wi-Fi connection will be disabled. Are you sure?",
        spokenReply: isTa
          ? (isOff ? "வைஃபை அணைக்கப்படும். உறுதி செய்யவா?" : "வைஃபை இயக்கப்படுகிறது.")
          : (isOff ? "Disabling Wi-Fi. Please confirm." : "Enabling Wi-Fi adapter.")
      });
    }

    // Rule 10: Volume Control
    const volMatch = lower.match(/(?:volume|வால்யூம்|சத்தம்)\s*(?:to\s*)?(\d{1,3})\s*(?:percent|%|சதவீதம்)?/i) ||
                     lower.match(/(\d{1,3})\s*(?:percent|%|சதவீதம்)?\s*(?:volume|வால்யூம்)/i);
    if (volMatch) {
      const targetVol = parseInt(volMatch[1], 10);
      return res.json({
        success: true,
        action: "set_volume",
        args: { percent: targetVol },
        requiresConfirmation: false,
        spokenReply: isTa ? `வால்யூம் ${targetVol} சதவீதமாக அமைக்கப்படுகிறது.` : `Setting volume to ${targetVol} percent.`
      });
    }

    // Rule 11: Screenshot
    if (lower.includes("screenshot") || lower.includes("screen shot") || lower.includes("திரைப்படம்") || lower.includes("ஸ்கிரீன்ஷாட்")) {
      return res.json({
        success: true,
        action: "take_screenshot",
        requiresConfirmation: false,
        spokenReply: isTa ? "ஸ்கிரீன்ஷாட் கருவி இயக்கப்படுகிறது. பகுதியை தேர்வு செய்யவும்." : "Activating Windows Snipping Tool. Select the area to capture."
      });
    }

    // Rule 12: Open Website (e.g. "open youtube.com", "open github")
    const siteMatch = lower.match(/(?:open|go to)\s+(https?:\/\/[^\s]+|[a-z0-9\-]+\.[a-z]{2,}(?:\/[^\s]*)?)/i);
    if (siteMatch) {
      const site = siteMatch[1];
      return res.json({
        success: true,
        action: "open_website",
        args: { url: site },
        requiresConfirmation: false,
        spokenReply: isTa ? `${site} திறக்கப்படுகிறது.` : `Opening ${site}.`
      });
    }

    // Rule 13: Search Topic
    const generalSearchMatch = lower.match(/^(?:search for|search|thedu|kandupidi)\s+(.+)/i);
    if (generalSearchMatch) {
      const topic = generalSearchMatch[1].trim();
      const isYoutube = lower.includes("youtube") || lower.includes("யூடியூப்");
      return res.json({
        success: true,
        action: "search_web",
        args: { query: topic, engine: isYoutube ? "youtube" : "google" },
        requiresConfirmation: false,
        spokenReply: isTa ? `"${topic}" தேடப்படுகிறது.` : `Searching for "${topic}".`
      });
    }

    // Rule 14: Shutdown
    if (lower.includes("shutdown") || lower.includes("shut down") || lower.includes("turn off computer") ||
        lower.includes("ஷட்டவுன்") || lower.includes("கம்ப்யூட்டரை அணை")) {
      return res.json({
        success: true,
        action: "schedule_shutdown",
        requiresConfirmation: true,
        confirmationPrompt: isTa
          ? "கம்ப்யூட்டர் shutdown ஆகும். உறுதி செய்ய 'Confirm' என்று சொல்லுங்கள்."
          : "Are you sure you want to shut down your computer? Say 'confirm' or click Confirm.",
        spokenReply: isTa
          ? "கம்ப்யூட்டர் shutdown ஆகும். உறுதி செய்யவா?"
          : "Computer shutdown requested. Please confirm."
      });
    }

    // Rule 15: Restart
    if (lower.includes("restart") || lower.includes("ரீஸ்டார்ட்") || lower.includes("மறுதொடக்கம்")) {
      return res.json({
        success: true,
        action: "schedule_restart",
        requiresConfirmation: true,
        confirmationPrompt: isTa
          ? "கம்ப்யூட்டர் restart ஆகும். உறுதி செய்ய 'Confirm' என்று சொல்லுங்கள்."
          : "Are you sure you want to restart your computer? Say 'confirm' or click Confirm.",
        spokenReply: isTa
          ? "கம்ப்யூட்டர் restart ஆகும். உறுதி செய்யவா?"
          : "Computer restart requested. Please confirm."
      });
    }

    // Fallback: Not an OS action -> treat as conversational query
    res.json({
      success: true,
      action: "conversational_query",
      prompt: raw,
      isTamil: isTa
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/system/execute
 * Executes validated action strictly from allowlist
 */
router.post("/execute", async (req, res) => {
  try {
    const { action, args = {}, confirmed = false } = req.body;

    if (!action) {
      return res.status(400).json({ success: false, error: "Action is required." });
    }

    switch (action) {
      case "launch_app": {
        const result = await windowsCompanion.launchApp(args.app);
        return res.json(result);
      }

      case "control_bluetooth": {
        const result = await windowsCompanion.controlBluetooth(args.action);
        return res.json(result);
      }

      case "get_bluetooth_status": {
        const result = await windowsCompanion.getBluetoothStatus();
        return res.json(result);
      }

      case "control_wifi": {
        const result = await windowsCompanion.controlWifi(args.enable !== false);
        return res.json(result);
      }

      case "get_wifi_status": {
        const result = await windowsCompanion.getWifiStatus();
        return res.json(result);
      }

      case "set_volume": {
        const result = await windowsCompanion.setVolume(args.percent);
        return res.json(result);
      }

      case "take_screenshot": {
        const result = await windowsCompanion.takeScreenshot();
        return res.json(result);
      }

      case "open_website": {
        const result = await windowsCompanion.openWebsite(args.url);
        return res.json(result);
      }

      case "search_web": {
        const result = await windowsCompanion.searchWeb(args.query, args.engine);
        return res.json(result);
      }

      case "schedule_shutdown": {
        const result = await windowsCompanion.scheduleShutdown(confirmed === true);
        return res.json(result);
      }

      case "schedule_restart": {
        const result = await windowsCompanion.scheduleRestart(confirmed === true);
        return res.json(result);
      }

      case "cancel":
      case "abort_shutdown": {
        const result = await windowsCompanion.abortShutdown();
        return res.json(result);
      }

      case "capabilities": {
        const result = await windowsCompanion.getCapabilities();
        return res.json(result);
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Action '${action}' is not supported by Windows System Companion.`
        });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
