/* =========================================================
   PROJECT AURA 3.0 — AURA VISION SERVICE
   Real-Time Visual AI, Object Recognition & Image Understanding
   Primary Engine: Google Gemini Vision (gemini-3.1-flash-lite / gemini-3.5-flash-lite)
   Secondary Engine: NVIDIA NIM Llama 3.2 Vision
   Tertiary Engine: OpenAI Vision
   Bilingual English & Tamil (தமிழ்) Support
========================================================= */

"use strict";

const OpenAI = require("openai");

const GEMINI_VISION_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.8-flash",
  "gemini-3.7-flash"
];

// NVIDIA NIM Client for Llama 3.2 Vision
let nvidiaClient = null;
function getNvidiaClient() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;
  if (!nvidiaClient) {
    nvidiaClient = new OpenAI({
      apiKey,
      baseURL: "https://integrate.api.nvidia.com/v1",
      timeout: 8000,
      maxRetries: 0
    });
  }
  return nvidiaClient;
}

// Groq Client for High-Speed Multilingual Tamil Translation/Refinement
let groqClient = null;
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
      timeout: 8000,
      maxRetries: 0
    });
  }
  return groqClient;
}

// OpenAI Client
let openAiClient = null;
function getOpenAiClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!openAiClient) {
    openAiClient = new OpenAI({
      apiKey,
      timeout: 8000,
      maxRetries: 0
    });
  }
  return openAiClient;
}

const VISION_SYSTEM_PROMPT = `You are AURA Vision, the friendly, intelligent visual AI assistant of PROJECT AURA.
Your mission is to examine user-approved camera captures or uploaded images and explain what you see with scientific accuracy, clarity, and warmth.

CORE INSTRUCTIONS:
1. Identified Object: State what the object or diagram is clearly, including its category and your confidence.
2. Likely Purpose & Application: Explain what it is used for in science, engineering, technology, education, or everyday life.
3. How It Works: Explain its operating principle or core mechanism in an intuitive, engaging manner.
4. Key Visible Details: Point out notable components, ports, buttons, markings, model numbers, or visible text (OCR).
5. Diagrams & Schematics: If an electrical circuit, mathematical equation, or academic diagram is shown, explain the key principles step-by-step.
6. Uncertainty & Honesty: If the image is blurry, partially cropped, or multiple objects share similar features, explicitly state your uncertainty instead of guessing. Never invent non-existent specifications.
7. Language Requirement: Support natural English and Tamil (தமிழ்). When prompted in Tamil, or when the user selected Tamil, provide a fluent, culturally respectful explanation in Tamil.

OUTPUT STRUCTURE:
Format your analysis cleanly with Markdown headings:
### 1. 🔍 Identified Object
[Name and brief definition with confidence rating]

### 2. 🎯 Likely Purpose & Use
[Primary utility and real-world applications]

### 3. ⚙️ How It Works / Operating Principle
[Mechanism or scientific principle]

### 4. 📝 Visible Details & Markings
[Observable parts, buttons, ports, labels, or OCR text]

### 5. 💡 Comprehensive Explanation
[Deep-dive educational explanation in the requested language]

### 6. ⚠️ Observations & Uncertainty
[Any caveats, lighting limits, or alternative possibilities]`;

/**
 * Extract base64 and mime-type from any image input
 */
function extractBase64AndMime(imageInput) {
  if (!imageInput || typeof imageInput !== "string") {
    throw new Error("Invalid image input: base64 string or data URL required.");
  }
  const trimmed = imageInput.trim();

  let mimeType = "image/jpeg";
  let base64Data = trimmed;

  const dataUrlMatch = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
  if (dataUrlMatch) {
    mimeType = dataUrlMatch[1];
    base64Data = dataUrlMatch[2];
  } else {
    if (trimmed.startsWith("iVBORw0KGgo")) {
      mimeType = "image/png";
    } else if (trimmed.startsWith("R0lGOD")) {
      mimeType = "image/gif";
    } else if (trimmed.startsWith("UklGR")) {
      mimeType = "image/webp";
    }
  }

  const dataUrl = `data:${mimeType};base64,${base64Data}`;
  return { mimeType, base64Data, dataUrl };
}

/**
 * Format base64 image data URL safely
 */
function normalizeImageDataUrl(imageInput) {
  const { dataUrl } = extractBase64AndMime(imageInput);
  return dataUrl;
}

/**
 * Check if at least one vision service is configured
 */
function isConfigured() {
  return Boolean(
    (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) ||
    (process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY.trim()) ||
    (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim())
  );
}

/**
 * Analyze an image with AURA Vision using genuinely configured models
 */
async function analyzeImage({ image, prompt, language = "english", conversationHistory = [] }) {
  if (!isConfigured()) {
    return {
      success: false,
      error: "Missing API configuration: AURA Vision requires GEMINI_API_KEY, NVIDIA_API_KEY, or OPENAI_API_KEY configured in backend/.env.",
      errorCode: "MISSING_API_CONFIG",
      configured: false
    };
  }

  const { mimeType, base64Data, dataUrl } = extractBase64AndMime(image);
  const isTamil = language === "tamil" || /[\u0B80-\u0BFF]/.test(prompt || "");

  let defaultPrompt = isTamil
    ? "இந்த படத்தில் உள்ள பொருளை அடையாளம் கண்டு, அதன் பயன்பாடு, அது எவ்வாறு செயல்படுகிறது மற்றும் அதில் காணப்படும் முக்கிய விவரங்களை தெளிவாக தமிழில் விளக்குங்கள்."
    : "Identify this object, explain its primary purpose, how it works, and describe notable visible components, text, or details.";

  const effectivePrompt = (prompt && prompt.trim()) ? prompt.trim() : defaultPrompt;
  let lastError = null;

  // 1. Primary Engine: Google Gemini Vision
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    for (const model of GEMINI_VISION_MODELS) {
      try {
        const contents = [];

        // Add previous conversation turns for visual context
        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          for (const msg of conversationHistory) {
            if (msg.role && msg.content) {
              contents.push({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: String(msg.content) }]
              });
            }
          }
        }

        // Current user turn with image payload
        contents.push({
          role: "user",
          parts: [
            { text: isTamil ? `${effectivePrompt}\n\nமுக்கிய குறிப்பு: உங்கள் முழு விளக்கத்தையும் சரளமாகவும் துல்லியமாகவும் தமிழில் வழங்கவும்.` : effectivePrompt },
            { inlineData: { mimeType, data: base64Data } }
          ]
        });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: VISION_SYSTEM_PROMPT }] },
            contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1200
            }
          }),
          signal: AbortSignal.timeout(12000)
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (text.trim()) {
            return {
              success: true,
              analysis: text.trim(),
              provider: `AURA Vision (Google Gemini ${model})`,
              model: model,
              language: isTamil ? "tamil" : "english",
              timestamp: new Date().toISOString()
            };
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = new Error(errData.error?.message || `Gemini status ${res.status}`);
        }
      } catch (geminiErr) {
        lastError = geminiErr;
        console.warn(`[AURA VISION NOTE] Gemini Vision (${model}) attempt failed:`, geminiErr.message);
      }
    }
  }

  // 2. Secondary Engine: NVIDIA NIM Vision
  const nv = getNvidiaClient();
  if (nv) {
    const nvModels = ["meta/llama-3.2-11b-vision-instruct", "meta/llama-3.2-90b-vision-instruct"];
    for (const nvModel of nvModels) {
      try {
        const messages = [{ role: "system", content: VISION_SYSTEM_PROMPT }];

        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          for (const msg of conversationHistory) {
            if (msg.role && msg.content) {
              messages.push({
                role: msg.role === "assistant" ? "assistant" : "user",
                content: typeof msg.content === "string" ? msg.content : String(msg.content)
              });
            }
          }
        }

        messages.push({
          role: "user",
          content: [
            { type: "text", text: effectivePrompt },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        });

        const res = await nv.chat.completions.create({
          model: nvModel,
          messages,
          max_tokens: 1024,
          temperature: 0.2
        });

        let text = (res.choices?.[0]?.message?.content || "").trim();
        if (text) {
          if (isTamil && !/[\u0B80-\u0BFF]/.test(text) && process.env.GROQ_API_KEY) {
            try {
              const groq = getGroqClient();
              if (groq) {
                const tr = await groq.chat.completions.create({
                  model: "qwen/qwen3.8-27b",
                  messages: [
                    { role: "system", content: "Translate and explain this visual analysis clearly and fluently in Tamil (தமிழ்). Keep the tone helpful and friendly." },
                    { role: "user", content: text }
                  ],
                  max_tokens: 700,
                  temperature: 0.2
                });
                const ta = tr.choices?.[0]?.message?.content;
                if (ta && ta.trim()) text = ta.trim();
              }
            } catch (_) {}
          }

          return {
            success: true,
            analysis: text,
            provider: `AURA Vision (NVIDIA ${nvModel})`,
            model: nvModel,
            language: isTamil ? "tamil" : "english",
            timestamp: new Date().toISOString()
          };
        }
      } catch (nvErr) {
        lastError = nvErr;
        console.warn(`[AURA VISION NOTE] NVIDIA NIM (${nvModel}) attempt failed:`, nvErr.message);
      }
    }
  }

  // 3. Tertiary Engine: OpenAI Vision
  const oai = getOpenAiClient();
  if (oai) {
    const oaiModels = ["gpt-4o-mini", "gpt-4o"];
    for (const oModel of oaiModels) {
      try {
        const messages = [{ role: "system", content: VISION_SYSTEM_PROMPT }];

        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          for (const msg of conversationHistory) {
            if (msg.role && msg.content) {
              messages.push({
                role: msg.role === "assistant" ? "assistant" : "user",
                content: typeof msg.content === "string" ? msg.content : String(msg.content)
              });
            }
          }
        }

        messages.push({
          role: "user",
          content: [
            { type: "text", text: effectivePrompt },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        });

        const res = await oai.chat.completions.create({
          model: oModel,
          messages,
          max_tokens: 1024,
          temperature: 0.2
        });

        const text = res.choices?.[0]?.message?.content || "";
        if (text.trim()) {
          return {
            success: true,
            analysis: text.trim(),
            provider: `AURA Vision (OpenAI ${oModel})`,
            model: oModel,
            language: isTamil ? "tamil" : "english",
            timestamp: new Date().toISOString()
          };
        }
      } catch (oaiErr) {
        lastError = oaiErr;
        console.warn(`[AURA VISION NOTE] OpenAI (${oModel}) attempt failed:`, oaiErr.message);
      }
    }
  }

  // Never simulate hardcoded success when models fail. Report authentic request failure.
  return {
    success: false,
    error: `Vision AI recognition request failed: ${lastError ? lastError.message : "All configured vision providers were unreachable"}. Please check your network connection and API configuration.`,
    errorCode: "REQUEST_FAILED",
    lastProviderError: lastError ? lastError.message : null
  };
}

/**
 * Interactive follow-up Q&A about an already captured image
 */
async function followUpChat({ image, question, conversationHistory = [], language = "english" }) {
  if (!question || !question.trim()) {
    throw new Error("Question prompt is required for follow-up chat.");
  }

  // 1. Try multimodal vision analysis with conversation thread first
  const res = await analyzeImage({
    image,
    prompt: question,
    language,
    conversationHistory
  });

  if (res && res.success) {
    return res;
  }

  // 2. High-speed conversational reasoning via Groq if vision call encountered a temporary glitch
  if (process.env.GROQ_API_KEY && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    try {
      const groq = getGroqClient();
      if (groq) {
        const messages = [
          {
            role: "system",
            content: `You are AURA Vision assistant answering a follow-up question about an image previously examined and discussed with the user. Base your answer directly on the established visual context. Answer fluently in ${language === "tamil" ? "Tamil (தமிழ்)" : "English"}.`
          }
        ];

        for (const m of conversationHistory) {
          if (m.role && m.content) {
            messages.push({
              role: m.role === "assistant" ? "assistant" : "user",
              content: typeof m.content === "string" ? m.content : String(m.content)
            });
          }
        }

        messages.push({ role: "user", content: question });

        const groqRes = await groq.chat.completions.create({
          model: "qwen/qwen3.8-27b",
          messages,
          max_tokens: 600,
          temperature: 0.2
        });

        const ans = groqRes.choices?.[0]?.message?.content;
        if (ans && ans.trim()) {
          return {
            success: true,
            analysis: ans.trim(),
            provider: "AURA Vision (Groq Multilingual Q&A)",
            model: "qwen/qwen3.8-27b",
            language,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (groqErr) {
      console.warn("[AURA VISION CHAT NOTE] Groq reasoning note:", groqErr.message);
    }
  }

  return res;
}

module.exports = {
  isConfigured,
  analyzeImage,
  followUpChat,
  normalizeImageDataUrl,
  extractBase64AndMime
};
