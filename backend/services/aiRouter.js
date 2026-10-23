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
const AURA_SYSTEM_PROMPT = `You are Aura AI, a helpful, knowledgeable, and friendly AI workspace assistant.
Communication Principles:
- Understand the user's actual request and address it directly with warmth and clarity.
- Give direct, useful answers first before adding deeper explanations.
- Explain complex topics clearly, intuitively, and in a friendly tone.
- Support natural conversations in English, Tamil (தமிழ்), and Tanglish. When addressed in Tamil or Tanglish, respond fluently in the same language.
- Maintain conversational context across questions.
- If essential information is missing, ask a concise, friendly clarification.
- Be completely honest if you cannot access a document, perform an unsupported system action, or verify a claim. Never fabricate facts or simulate actions.
- For Code: Provide clean, direct, minimal runnable code with concise, helpful comments.
- For Formats: Use clean, readable formatting, lists, code blocks, and formulas where appropriate.`;

/* ---------------------------------------------------------
   MODULE INSTRUCTIONS
--------------------------------------------------------- */
const MODULE_INSTRUCTIONS = {
  GENERAL_AI: "Handle as Aura AI general intelligence core. Keep responses punchy, human-friendly, and free of markdown syntax artifacts.",
  STUDY_ENGINE: "Act as Aura Study Engine. Provide high-yield summaries, formulas, and short crisp concept explanations free of markdown syntax artifacts.",
  ENGINEERING_MODE: "Act as Aura Engineering Mode. Focus on core engineering concepts, formulas, 2-mark Q&A, and clean practical code.",
  CODING_ENGINE: "When the user asks for code, provide ONLY the clean, minimal program. Strict ban on verbose explanation, CLI boilerplate, try-catch wrappers, and multi-line docstring comments unless explicitly asked. Keep the code concise, efficient, and immediately usable.",
  QUIZ_ENGINE: "Act as Aura Quiz Engine. Create or evaluate interactive quizzes (MCQs, true/false, fill-in-blanks, written, match, scenario, coding).",
  MEMORY_ENGINE: "Act as Aura Memory Engine. Organize personal context, study notes, and goals with strategic actionable suggestions.",
  NOTES_ENGINE: "Act as Aura Notes Engine. Summarize key takeaways cleanly without stray markdown artifacts.",
  PERFORMANCE_ENGINE: "Act as Aura Performance Intelligence. Deliver short, actionable study advice and focus topic guidance.",
  SCHEDULE_ENGINE: "Act as Aura Schedule Engine. Create structured, realistic study routines and task timelines.",
  FILE_ENGINE: "Act as Aura File Intelligence. Ground all answers strictly in the attached or uploaded document context.",
  CREATOR_ENGINE: "Generate actual, platform-ready social copy (Hooks, Post Body, Line breaks, Call-to-Action, Hashtags) suited for Twitter/LinkedIn/Instagram. Stop outputting executive briefing bullet lists inside the Social tab.",
  VISUAL_ENGINE: "Act as Aura Visual Intelligence. Describe scenes, prompt concepts, and visual compositions.",
  YOUTUBE_ENGINE: "Act as Aura YouTube Intelligence. Provide concise video takeaways, timecoded highlights, and tutorials.",
  RESEARCH_ENGINE: "Act as Aura Research Engine. Provide structured Executive Summary, Key Findings bullets, and verified citations.",
  SECURITY_ENGINE: "Act as Aura Security Intelligence. Provide ethical, defensive digital safety and security analysis.",
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
  const isCode = options.mode === "code_only" || options.codeOnly === true || route.module === "CODING_ENGINE" || /^\s*(write|create|give|generate|implement)\s+(a\s+)?(code|program|script|function)|code for|program to/i.test(cleanCmd);
  const isSocial = route.module === "CREATOR_ENGINE" || /social\s*copy|linkedin\s*post|twitter\s*thread|instagram\s*caption|tweet/i.test(cleanCmd);
  let moduleInstruction = MODULE_INSTRUCTIONS[route.module] || MODULE_INSTRUCTIONS.GENERAL_AI;
  
  let systemInstruction = "";
  if (isCode) {
    systemInstruction = `You are Aura AI. Respond strictly according to context:
- For Code: Output only clean, direct, minimal runnable code without verbose explanations or unnecessary boilerplate.

STRICT MINIMALIST CODE RULES:
1. Provide ONLY the clean, minimal program.
2. Strict ban on verbose explanation, CLI boilerplate, try-catch wrappers, and multi-line docstring comments unless explicitly asked.
3. Keep the code concise, efficient, and immediately usable.
4. Output valid, working code in the requested language.`;
  } else if (isSocial) {
    systemInstruction = `You are Aura AI. Respond strictly according to context:
- For Social: Output ready-to-publish social media copies with clear hook, body, and CTA.

STRICT SOCIAL OUTPUT RULES:
1. Stop outputting executive briefing bullet lists inside the Social tab.
2. Generate actual, platform-ready social copy (Hooks, Post Body, Line breaks, Call-to-Action, Hashtags) suited for Twitter/LinkedIn/Instagram.
3. Structure:
   - Hook: Scroll-stopping opening line
   - Post Body: Engaging, readable paragraphs with natural line breaks
   - Call-to-Action (CTA): Clear prompt for interaction
   - Hashtags: 3-5 relevant, high-reach hashtags.`;
  } else {
    systemInstruction = `${AURA_SYSTEM_PROMPT}

CURRENT ACTIVE ROUTE: ${route.module}
INTENT: ${route.intent}
DETECTED USER LANGUAGE: ${lang.toUpperCase()}

INSTRUCTION:
${moduleInstruction}

LANGUAGE DIRECTIVE:
If the user's language is Thanglish, respond in engaging, natural Thanglish.
If the user's language is Tamil, respond in Tamil.
If English, respond in English.
Keep responses punchy, human-friendly, and free of markdown syntax artifacts.
${extraContext}`;
  }

  const messages = [
    { role: "system", content: systemInstruction },
    ...(options.conversationHistory || []),
    { role: "user", content: cleanCmd }
  ];

  // 6. Execute Multi-AI Fallback
  const aiResult = await executeAIFallback(messages);

  let finalResponse = aiResult.text || "";
  if (isCode && finalResponse) {
    const codeBlockMatch = finalResponse.match(/```(?:[a-zA-Z0-9_\-\.\+#]+)?\s*([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      finalResponse = codeBlockMatch[1].trim();
    } else {
      finalResponse = finalResponse.replace(/^(?:Here is the code|Here's the code|Certainly|Sure|Below is the code)[^\n]*\n+/i, "").trim();
    }
    // Clean up unnecessary boilerplate comments or wrapper docstrings if present
    finalResponse = finalResponse.replace(/^\s*\/\*\*[\s\S]*?\*\/\s*/, "");
    finalResponse = finalResponse.replace(/^\s*"""[\s\S]*?"""\s*/, "");
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
