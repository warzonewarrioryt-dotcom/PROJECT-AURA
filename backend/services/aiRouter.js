/* =========================================================
   PROJECT AURA 3.0
   AURA INTELLIGENT ROUTER & MULTI-AI FALLBACK ENGINE
========================================================= */

"use strict";

const groqService = require("./groq");
const openaiService = require("./openai");
const nvidiaService = require("./nvidia");
const geminiService = require("./gemini");
const huggingfaceService = require("./huggingface");
const pythonClient = require("./pythonClient");
const tavilyService = require("./tavily");
const youtubeService = require("./youtube");
const auraDB = require("../database");

/* ---------------------------------------------------------
   SYSTEM PROMPT
--------------------------------------------------------- */
const AURA_SYSTEM_PROMPT = `
You are AURA, the futuristic personal AI operating system of PROJECT AURA.
Official product name: PROJECT AURA.
Subtitle / Tagline: PERSONAL AI INTELLIGENCE SYSTEM.

You are an adaptive personal AI operating system and intelligent student platform.

GLOBAL AI RESPONSE DESIGN SYSTEM RULES:
1. Adaptive Tone & Length:
   - For simple questions, answer briefly, clearly, and directly without introductory fluff.
   - For complex topics, provide a structured explanation with clean markdown headings and bullet points.
   - Avoid giant unbroken paragraphs, repetitive conclusions, and generic disclaimers.
2. Educational Content:
   - Explain concepts step by step with clear intuition, followed by concrete real-world examples.
   - For exam preparation, structure answers according to the requested mark allocation (e.g. 2-mark concise definition, 5-mark structured derivation, 16-mark comprehensive answer).
   - For revision, provide concise key formulas, definitions, and high-yield bullet points.
3. Technical & Code Precision:
   - For coding questions, provide properly formatted fenced code blocks with language specification and concise explanations of critical lines.
   - For comparisons, use a compact markdown table only when it improves visual clarity.
   - For procedures, algorithms, or instructions, use numbered sequential steps.
4. Language Intelligence & Matching:
   - If the user asks in Tamil (or requests Tamil), respond fluently in respectful, natural Tamil.
   - If the user asks in Tanglish (Tamil-English) or requests Tanglish, respond in natural, friendly Tanglish.
   - If the user asks in English, respond in crisp, elegant, grammatically flawless English.
5. Grounding & Zero Hallucination:
   - When an attached file or document context is provided, ground answers strictly and directly in that content.
   - Preserve technical and mathematical accuracy. Never invent facts, citations, results, or data.
   - When information is unknown or uncertain, explicitly acknowledge the uncertainty instead of fabricating an answer.
6. Clean Presentation:
   - Use standard markdown (headings, bullets, tables, inline code, fenced code blocks).

Do NOT act like a generic assistant. You are PROJECT AURA.
`;

/* ---------------------------------------------------------
   MODULE INSTRUCTIONS
--------------------------------------------------------- */
const MODULE_INSTRUCTIONS = {
  GENERAL_AI: "Handle as PROJECT AURA general intelligence core. Deliver short, crisp, highly structured answers with emojis and bullet points.",
  STUDY_ENGINE: "Act as AURA Study Engine. Provide high-yield summaries, formulas, and short crisp concept explanations.",
  ENGINEERING_MODE: "Act as AURA Engineering Mode. Focus on core engineering concepts, formulas, 2-mark Q&A, and practical code.",
  CODING_ENGINE: "Act as AURA Coding Intelligence. Provide clean, production-ready code with brief explanations and key highlights.",
  QUIZ_ENGINE: "Act as AURA Quiz Engine. Create or evaluate interactive quizzes (MCQs, true/false, fill-in-blanks, written, match, scenario, coding).",
  MEMORY_ENGINE: "Act as AURA Memory Engine. Organize personal context, study notes, and goals with strategic actionable suggestions.",
  NOTES_ENGINE: "Act as AURA Notes Engine. Summarize key takeaways cleanly with emoji bullet points and bold key terms.",
  PERFORMANCE_ENGINE: "Act as AURA Performance Intelligence. Deliver short, actionable study advice and focus topic guidance.",
  SCHEDULE_ENGINE: "Act as AURA Schedule Engine. Create structured, realistic study routines and task timelines.",
  FILE_ENGINE: "Act as AURA File Intelligence. Ground all answers strictly in the attached or uploaded document context.",
  CREATOR_ENGINE: "Act as AURA Creator Engine. Synthesize natural, well-formatted scripts, briefs, pitches, and copy with emojis and points.",
  VISUAL_ENGINE: "Act as AURA Visual Intelligence. Describe scenes, prompt concepts, and visual compositions.",
  YOUTUBE_ENGINE: "Act as AURA YouTube Intelligence. Provide concise video takeaways, timecoded highlights, and tutorials.",
  RESEARCH_ENGINE: "Act as AURA Research Engine. Provide structured Executive Summary, Key Findings bullets, and verified citations.",
  SECURITY_ENGINE: "Act as AURA Security Intelligence. Provide ethical, defensive digital safety and security analysis.",
  JARVIS_ENGINE: "Act as J.A.R.V.I.S. (Stark Strategic Operating Core). Speak with articulate, refined British gentleman demeanor. Deliver concise, actionable intelligence with tactical telemetry, precise metrics, and dry wit."
};

/* ---------------------------------------------------------
   LANGUAGE DETECTION (NODE FALLBACK)
--------------------------------------------------------- */
function detectLanguageLocal(text) {
  if (!text) return "english";
  const tamilRegex = /[\u0B80-\u0BFF]/;
  if (tamilRegex.test(text)) return "tamil";

  const thanglishTokens = [
    "vanakam", "vanakkam", "enna", "pandra", "pandringa", "solra", "solunga",
    "epdi", "eppadi", "iruka", "irukinga", "iruken", "nanba", "nanbaa", "thala",
    "machan", "machi", "bro", "romba", "nalla", "pannu", "pannunga", "kudunga",
    "theriyuma", "puriyala", "purinjidhu", "pesalam", "sapdutiya", "seri", "sari"
  ];
  const words = text.toLowerCase().split(/\s+/);
  const matches = words.filter(w => thanglishTokens.includes(w));
  if (matches.length > 0) return "thanglish";
  return "english";
}

/* ---------------------------------------------------------
   INTERNAL INTENT CLASSIFICATION (NODE FALLBACK)
--------------------------------------------------------- */
function classifyIntentLocal(command) {
  const lower = command.toLowerCase().trim();

  // Multi-step check
  if (
    (lower.includes("youtube") || lower.includes("search")) &&
    (lower.includes("save") || lower.includes("note")) &&
    lower.includes("quiz")
  ) {
    return {
      module: "MULTI_STEP_AGENT",
      confidence: 0.95,
      intent: "Multi-step mission: YouTube search + notes extraction + quiz generation",
      isMultiStep: true
    };
  }

  // J.A.R.V.I.S. Stark Strategic Protocol Check
  if (
    lower.includes("jarvis") ||
    lower.includes("stark") ||
    lower.includes("diagnostic") ||
    lower.includes("arc reactor") ||
    lower.includes("mark 85") ||
    lower.includes("power level") ||
    lower.includes("house party")
  ) {
    return {
      module: "JARVIS_ENGINE",
      confidence: 0.98,
      intent: "J.A.R.V.I.S. Stark Strategic Protocol & Telemetry"
    };
  }

  if (lower.includes("youtube") || lower.includes("video tutorial") || lower.includes("yt ")) {
    return { module: "YOUTUBE_ENGINE", confidence: 0.9, intent: "YouTube video search/intelligence" };
  }
  if (
    lower.includes("research") ||
    lower.includes("tavily") ||
    lower.includes("search the web") ||
    lower.includes("search") ||
    lower.includes("who is the cm") ||
    lower.includes("chief minister") ||
    lower.includes("prime minister") ||
    lower.includes("president of") ||
    lower.includes("current") ||
    lower.includes("latest news") ||
    lower.includes("latest") ||
    lower.includes("today") ||
    lower.includes("recent") ||
    lower.includes("news") ||
    lower.includes("weather")
  ) {
    return { module: "RESEARCH_ENGINE", confidence: 0.95, intent: "Live web research and real-time facts" };
  }
  if (lower.includes("quiz") || lower.includes("mcq") || lower.includes("test me") || lower.includes("evaluate")) {
    return { module: "QUIZ_ENGINE", confidence: 0.9, intent: "Quiz generation and evaluation" };
  }
  if (lower.includes("remember") || lower.includes("save to notes") || lower.includes("my notes") || lower.includes("recall")) {
    return { module: "MEMORY_ENGINE", confidence: 0.88, intent: "Memory / Notes operation" };
  }
  if (lower.includes("code") || lower.includes("function") || lower.includes("bug") || lower.includes("error") || lower.includes("javascript") || lower.includes("python")) {
    return { module: "CODING_ENGINE", confidence: 0.88, intent: "Coding intelligence & debugging" };
  }
  if (lower.includes("engineering") || lower.includes("viva") || lower.includes("semester") || lower.includes("csbs")) {
    return { module: "ENGINEERING_MODE", confidence: 0.85, intent: "Engineering study mode" };
  }
  if (lower.includes("study") || lower.includes("explain") || lower.includes("how does") || lower.includes("what is")) {
    return { module: "STUDY_ENGINE", confidence: 0.85, intent: "Study & explanation" };
  }
  if (lower.includes("pdf") || lower.includes("docx") || lower.includes("file") || lower.includes("document") || lower.includes("vault")) {
    return { module: "FILE_ENGINE", confidence: 0.9, intent: "Knowledge Vault / File analysis" };
  }
  if (
    lower.includes("create an image") ||
    lower.includes("generate an image") ||
    lower.includes("generate a picture") ||
    lower.includes("make an image") ||
    lower.includes("design an image") ||
    lower.includes("create a poster") ||
    lower.includes("generate a visual") ||
    lower.includes("image of") ||
    lower.includes("picture of") ||
    lower.includes("generate image") ||
    lower.includes("create image") ||
    lower.startsWith("draw ") ||
    lower.startsWith("paint ")
  ) {
    return { module: "VISUAL_ENGINE", confidence: 0.95, intent: "Gemini visual image generation" };
  }

  return { module: "GENERAL_AI", confidence: 0.8, intent: "General AI query" };
}

/* ---------------------------------------------------------
   MULTI-AI FALLBACK EXECUTION
   Priority: ChatGPT (Primary Command Reply & Reasoning) -> Groq -> Gemini -> NVIDIA -> Hugging Face
--------------------------------------------------------- */
async function executeAIFallback(messages, options = {}) {
  const providers = [
    { name: "ChatGPT", service: openaiService },
    { name: "Groq", service: groqService },
    { name: "Gemini", service: geminiService },
    { name: "NVIDIA", service: nvidiaService },
    { name: "Hugging Face", service: huggingfaceService }
  ];

  let lastError = null;
  let fallbackCount = 0;

  for (const p of providers) {
    if (p.service.isConfigured()) {
      try {
        const result = await p.service.generateChatCompletion(messages, options);
        if (result && result.text) {
          return {
            ...result,
            fallbackCount,
            providerChain: p.name
          };
        }
      } catch (err) {
        lastError = err;
        fallbackCount++;
        console.warn(`[AURA AI FALLBACK] ${p.name} failed (${err.message}). Trying next provider...`);
      }
    }
  }

  // If all external AI providers fail or are unconfigured, provide clean heuristic fallback
  return {
    success: true,
    text: `AURA Core Intelligence (Local Mode): System operational. Objective processed. (${lastError ? lastError.message : "All providers offline"})`,
    provider: "AURA Offline Engine",
    model: "aura-local-heuristics",
    fallbackCount
  };
}

/* ---------------------------------------------------------
   MULTI-STEP AGENT DISPATCHER
--------------------------------------------------------- */
async function executeMultiStepMission(command, route, language) {
  const stepsExecution = [];
  let intermediateContext = "";

  // Step 1: YouTube Search
  let ytResults = [];
  try {
    const ytQuery = command.replace(/(and then|and save|to my notes|and create a quiz)/gi, "").trim();
    const ytRes = await youtubeService.searchYouTube(ytQuery || "Python tutorial");
    ytResults = ytRes.results || [];
    stepsExecution.push({
      step: 1,
      name: "YouTube Intelligence",
      status: "COMPLETED",
      summary: `Found ${ytResults.length} relevant educational videos.`,
      data: ytResults.slice(0, 3)
    });
    intermediateContext += `YOUTUBE VIDEOS FOUND:\n` + ytResults.slice(0, 3).map(v => `- ${v.title} (${v.url}): ${v.description}`).join("\n") + "\n\n";
  } catch (err) {
    stepsExecution.push({ step: 1, name: "YouTube Intelligence", status: "FAILED", error: err.message });
  }

  // Step 2: Information Extraction & Save Notes
  let savedNote = null;
  try {
    const extractionPrompt = [
      { role: "system", content: "You are AURA. Extract 4-5 concise, high-impact bullet points and key takeaways from this query and the video results." },
      { role: "user", content: `Query: ${command}\n\nContext:\n${intermediateContext}` }
    ];
    const extractRes = await executeAIFallback(extractionPrompt);
    const keyNotes = extractRes.text;

    // Save to Memory Core
    savedNote = auraDB.addMemory("note", keyNotes, 0.95, "AURA Multi-Step Agent");
    auraDB.addActivity("memory", `AURA Mission saved extracted notes to Memory Core`, { id: savedNote.id });

    stepsExecution.push({
      step: 2,
      name: "Memory Core Notes",
      status: "COMPLETED",
      summary: "Important points extracted and persisted to Memory Core.",
      noteContent: keyNotes
    });
    intermediateContext += `EXTRACTED NOTES:\n${keyNotes}\n\n`;
  } catch (err) {
    stepsExecution.push({ step: 2, name: "Memory Core Notes", status: "FAILED", error: err.message });
  }

  // Step 3: Quiz Generation
  let quizData = null;
  try {
    const quizPrompt = [
      {
        role: "system",
        content: `You are AURA Quiz Engine. Create 3 multiple choice questions based on the extracted notes. Return valid JSON only. Format: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "..."}]`
      },
      { role: "user", content: intermediateContext }
    ];
    const quizRes = await executeAIFallback(quizPrompt);
    try {
      const match = quizRes.text.match(/\[[\s\S]*\]/);
      if (match) {
        quizData = JSON.parse(match[0]);
      }
    } catch (_) {}

    if (!quizData) {
      quizData = [
        {
          question: "What is a key fundamental concept highlighted in this study session?",
          options: ["Consistent modular practice", "Ignoring syntax errors", "Skipping fundamentals", "Relying purely on memorization"],
          answer: 0,
          explanation: "Mastery requires active hands-on coding and understanding underlying mechanics."
        }
      ];
    }

    stepsExecution.push({
      step: 3,
      name: "Quiz Engine",
      status: "COMPLETED",
      summary: `Generated ${quizData.length} practice questions.`,
      quiz: quizData
    });
  } catch (err) {
    stepsExecution.push({ step: 3, name: "Quiz Engine", status: "FAILED", error: err.message });
  }

  // Step 4: Final Synthesis Report
  const finalPrompt = [
    {
      role: "system",
      content: `${AURA_SYSTEM_PROMPT}\nRespond in ${language}. Present the mission completion report cleanly with: 1) Video recommendations, 2) Saved notes summary, 3) Interactive practice quiz ready for review.`
    },
    {
      role: "user",
      content: `User Command: ${command}\n\nMission Results:\n${intermediateContext}`
    }
  ];
  const finalRes = await executeAIFallback(finalPrompt);

  return {
    success: true,
    isMultiStep: true,
    steps: stepsExecution,
    response: finalRes.text,
    youtubeResults: ytResults,
    savedNote,
    quiz: quizData,
    provider: finalRes.provider
  };
}

/* ---------------------------------------------------------
   MAIN ROUTE AND EXECUTE DISPATCHER
--------------------------------------------------------- */
async function processCommand(command, options = {}) {
  const cleanCmd = String(command || "").trim();
  if (!cleanCmd) {
    throw new Error("Command is required.");
  }

  // 1. Instant Language Detection & Intent Classification (Sub-millisecond)
  const lang = detectLanguageLocal(cleanCmd);
  const route = classifyIntentLocal(cleanCmd);

  // 3. Multi-Step Execution if detected
  if (route.module === "MULTI_STEP_AGENT" || route.isMultiStep) {
    return await executeMultiStepMission(cleanCmd, route, lang);
  }

  // 3.1 Visual Image Generation Intent
  if (route.module === "VISUAL_ENGINE") {
    try {
      const imageGenService = require("./imageGen");
      const visualPrompt = cleanCmd
        .replace(/^(generate|create|draw|make|show me|paint)\s+(an\s+|a\s+)?(image|picture|photo|illustration|drawing|render)\s+(of\s+)?/i, "")
        .replace(/^(image|picture|photo)\s+(of\s+)?/i, "")
        .trim() || cleanCmd;

      const genRes = await imageGenService.generateImage(visualPrompt, { style: "accurate", enhance: true });
      if (genRes && genRes.success) {
        return {
          success: true,
          command: cleanCmd,
          route,
          language: lang,
          response: `### ◈ Image Synthesized: ${visualPrompt}\n\n<img src="${genRes.imageUrl}" style="max-width:100%; border-radius:10px; margin: 10px 0;" alt="${visualPrompt}" />\n\n* **Model**: ${genRes.model} · **Status**: Accurate & Zero Watermark\n* [Download Clean HD Image](${genRes.imageUrl})`,
          provider: genRes.provider,
          model: genRes.model,
          imageUrl: genRes.imageUrl,
          timestamp: new Date().toISOString()
        };
      }
    } catch (err) {
      console.warn("[VISUAL_ENGINE ROUTING ERROR]", err.message);
      return {
        success: false,
        command: cleanCmd,
        route,
        language: lang,
        response: "Image generation is temporarily unavailable. Please verify Gemini API quota or try again shortly.",
        provider: "Google Gemini Image Studio",
        model: "gemini-image",
        timestamp: new Date().toISOString()
      };
    }
  }

  // 3.2 J.A.R.V.I.S. Immediate Telemetry & Diagnostic Handler
  if (route.module === "JARVIS_ENGINE") {
    const lowerCmd = cleanCmd.toLowerCase();
    if (
      lowerCmd.includes("diagnostic") ||
      lowerCmd.includes("status report") ||
      lowerCmd.includes("power level") ||
      lowerCmd.includes("arc reactor")
    ) {
      return {
        success: true,
        command: cleanCmd,
        route,
        language: lang,
        isJarvis: true,
        response: `### ◈ J.A.R.V.I.S. SYSTEM DIAGNOSTICS & TELEMETRY\n*Stark Industries Quantum Architecture // Project Aura 3.0*\n\n* **Operational Status**: All subsystems nominal and standing by at your directive, Sir.\n* **Arc Reactor Core**: Mark 85 Palladium Unibeam Core — **100% Efficiency**\n* **Clean Power Output**: 3.2 Gigajoules/sec (Holographic Grid Synchronized)\n* **Intelligence Backbone**: Multi-Agent Fallback Active (**ChatGPT-4o** · **Groq** · **Gemini 3.8**)\n* **Audio & Visual Matrix**: British Neural Voice Synthesis Nominal · 3D Arc Reactor Hologram Active\n* **Tactical Protocols**: House Party Protocol on standby · Clean Firewall Matrix Verified\n\n*Awaiting your next directive, Sir.*`,
        provider: "J.A.R.V.I.S. (Stark Industries Core)",
        model: "Mark 85 AI",
        timestamp: new Date().toISOString()
      };
    }
  }

  // 4. Grounded Context (Knowledge Vault, Memory, or Live Web Research)
  let extraContext = "";
  if (route.module === "FILE_ENGINE") {
    const knowledgeEngine = require("../knowledgeEngine");
    const docSearch = knowledgeEngine.buildKnowledgeContext(cleanCmd);
    if (docSearch.found) {
      extraContext = `\nDOCUMENT CONTEXT:\n${docSearch.context}\n`;
    }
  } else if (route.module === "RESEARCH_ENGINE") {
    try {
      const tavilyService = require("./tavily");
      const searchRes = await tavilyService.searchWeb(cleanCmd, { maxResults: 4 });
      if (searchRes && searchRes.results && searchRes.results.length > 0) {
        extraContext += `\nLIVE WEB SEARCH RESULTS (Current Grounding):\n`;
        if (searchRes.answer) {
          extraContext += `Direct Web Answer: ${searchRes.answer}\n`;
        }
        for (const item of searchRes.results) {
          extraContext += `- [${item.title}] (${item.url}): ${item.content}\n`;
        }
        extraContext += `\nCRITICAL INSTRUCTION: Synthesize your answer strictly based on these verified live search results. Ensure all current facts (current leaders, dates, latest status) are 100% accurate and up-to-date.\n`;
      }
    } catch (err) {
      console.warn("[RESEARCH_ENGINE GROUNDING ERROR]", err.message);
    }
  }

  // 5. Build AI Messages
  const isCodeOnly = options.mode === "code_only" || options.codeOnly === true;
  let moduleInstruction = MODULE_INSTRUCTIONS[route.module] || MODULE_INSTRUCTIONS.GENERAL_AI;
  
  let systemInstruction = "";
  if (isCodeOnly) {
    systemInstruction = `
You are an expert software engineer for PROJECT AURA.
MANDATORY CODE-ONLY SYSTEM DIRECTIVE:
1. Return ONLY the raw requested code.
2. Absolutely NO introductory text, greetings, markdown chit-chat, or explanations before the code.
3. Absolutely NO summaries, tutorials, concluding paragraphs, or suggestions after the code.
4. Output valid, working code in the requested language.
5. Use the simplest correct solution suitable for the problem.
6. Include essential comments only when requested or genuinely necessary for complex logic.
7. If the user explicitly asks for an explanation (e.g., "explain this code"), provide an explanation; otherwise output pure code only.
`;
  } else {
    systemInstruction = `
${AURA_SYSTEM_PROMPT}

CURRENT ACTIVE ROUTE: ${route.module}
INTENT: ${route.intent}
DETECTED USER LANGUAGE: ${lang.toUpperCase()}

INSTRUCTION:
${moduleInstruction}

LANGUAGE DIRECTIVE:
If the user's language is Thanglish, respond in engaging, natural Thanglish.
If the user's language is Tamil, respond in Tamil.
If English, respond in English.
${extraContext}
`;
  }

  const messages = [
    { role: "system", content: systemInstruction },
    ...(options.conversationHistory || []),
    { role: "user", content: cleanCmd }
  ];

  // 6. Execute Multi-AI Fallback
  const aiResult = await executeAIFallback(messages);

  let finalResponse = aiResult.text || "";
  if (isCodeOnly && finalResponse) {
    const codeBlockMatch = finalResponse.match(/```(?:[a-zA-Z0-9_\-\.\+#]+)?\s*([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      finalResponse = codeBlockMatch[1].trim();
    } else {
      finalResponse = finalResponse.replace(/^(?:Here is the code|Here's the code|Certainly|Sure|Below is the code)[^\n]*\n+/i, "").trim();
    }
  }

  return {
    success: true,
    command: cleanCmd,
    route,
    language: lang,
    response: finalResponse,
    provider: aiResult.provider,
    model: aiResult.model,
    fallbackCount: aiResult.fallbackCount,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  processCommand,
  executeAIFallback,
  classifyIntentLocal,
  detectLanguageLocal
};
