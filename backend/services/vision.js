/* =========================================================
   PROJECT AURA 3.0 — AURA VISION SERVICE
   Real-Time Visual AI, Object Recognition & Image Understanding
   Multi-Model Fallback: NVIDIA Llama 3.2 Vision -> OpenAI GPT-4o-mini -> Gemini -> Local Offline Fallback
   Bilingual English & Tamil (தமிழ்) Support
========================================================= */

"use strict";

const OpenAI = require("openai");

// NVIDIA NIM Client for Llama 3.2 Vision
let nvidiaClient = null;
function getNvidiaClient() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;
  if (!nvidiaClient) {
    nvidiaClient = new OpenAI({
      apiKey,
      baseURL: "https://integrate.api.nvidia.com/v1",
      timeout: 10000,
      maxRetries: 0
    });
  }
  return nvidiaClient;
}

// Groq Client for High-Speed Multilingual Tamil Refinement
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
      timeout: 10000,
      maxRetries: 0
    });
  }
  return openAiClient;
}

const VISION_SYSTEM_PROMPT = `You are AURA Vision, the friendly, intelligent visual AI assistant of PROJECT AURA.
Your mission is to look at user-approved images or live camera frames and explain what you see with clarity, warmth, and scientific precision.

CORE PRINCIPLES:
1. Object Name: Identify what the object most likely is based on clear visible evidence.
2. Purpose & Use: Explain what it is used for in everyday life, science, engineering, or education.
3. How It Works: Explain its operating principle in a simple, friendly, intuitive manner.
4. Key Visible Details: Describe notable visible components, ports, buttons, labels, model numbers, or visible text (OCR).
5. Educational Diagrams & Components: If an electrical component, scientific tool, formula, or diagram is presented, explain its core concept clearly.
6. Confidence & Honesty: If the image is blurry, partially obscured, or multiple objects look similar, explain your uncertainty honestly instead of guessing. Never invent unverified brand names or specifications.
7. Language Support: Support natural English and Tamil (தமிழ்). When prompted in Tamil or when requested, provide the explanation warmly and fluently in Tamil.
8. Friendly Tone: Maintain an encouraging, helpful persona without robotic boilerplate.`;

/**
 * Format base64 image data URL safely
 */
function normalizeImageDataUrl(imageInput) {
  if (!imageInput || typeof imageInput !== "string") {
    throw new Error("Invalid image input: base64 string or data URL required.");
  }
  const trimmed = imageInput.trim();
  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }
  if (trimmed.startsWith("/9j/")) {
    return `data:image/jpeg;base64,${trimmed}`;
  }
  if (trimmed.startsWith("iVBORw0KGgo")) {
    return `data:image/png;base64,${trimmed}`;
  }
  if (trimmed.startsWith("R0lGOD")) {
    return `data:image/gif;base64,${trimmed}`;
  }
  if (trimmed.startsWith("UklGR")) {
    return `data:image/webp;base64,${trimmed}`;
  }
  return `data:image/jpeg;base64,${trimmed}`;
}

/**
 * Check if vision service is configured
 */
function isConfigured() {
  return Boolean(
    (process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY.trim()) ||
    (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) ||
    (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim())
  );
}

/**
 * Analyze an image with AURA Vision
 */
async function analyzeImage({ image, prompt, language = "english", conversationHistory = [] }) {
  const imageUrl = normalizeImageDataUrl(image);
  const isTamil = language === "tamil" || /[\u0B80-\u0BFF]/.test(prompt || "");

  let defaultPrompt = isTamil
    ? "இந்த படத்தில் உள்ள பொருளை அடையாளம் கண்டு, அதன் பயன்பாடு, அது எவ்வாறு செயல்படுகிறது மற்றும் அதில் காணப்படும் முக்கிய விவரங்களை தெளிவாக தமிழில் விளக்குங்கள்."
    : "Identify this object, explain its primary purpose, how it works, and describe notable visible components, text, or details.";

  const effectivePrompt = (prompt && prompt.trim()) ? prompt.trim() : defaultPrompt;

  let lastError = null;

  // 1. Primary Engine: NVIDIA NIM Llama 3.2 Vision (11B)
  const nv = getNvidiaClient();
  if (nv) {
    try {
      const messages = [
        { role: "system", content: VISION_SYSTEM_PROMPT }
      ];

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
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      });

      const res = await nv.chat.completions.create({
        model: "meta/llama-3.2-11b-vision-instruct",
        messages,
        max_tokens: 1024,
        temperature: 0.2
      });

      let text = (res.choices?.[0]?.message?.content || "").trim();
      if (text) {
        // If user requested Tamil and model responded in English, translate into fluent Tamil via Groq Qwen
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
                max_tokens: 600,
                temperature: 0.2
              });
              const ta = tr.choices?.[0]?.message?.content;
              if (ta && ta.trim()) {
                text = ta.trim();
              }
            }
          } catch (_) {}
        }

        return {
          success: true,
          analysis: text,
          provider: "AURA Vision (NVIDIA Llama 3.2)",
          model: "meta/llama-3.2-11b-vision-instruct",
          language: isTamil ? "tamil" : "english",
          timestamp: new Date().toISOString()
        };
      }
    } catch (nvErr) {
      lastError = nvErr;
      console.warn("[AURA VISION NOTE] NVIDIA NIM Vision attempt:", nvErr.message);
    }
  }

  // 2. Secondary Engine: OpenAI GPT-4o-mini Vision (if available/credits present)
  const oai = getOpenAiClient();
  if (oai) {
    try {
      const messages = [
        { role: "system", content: VISION_SYSTEM_PROMPT }
      ];

      if (Array.isArray(conversationHistory)) {
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
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      });

      const res = await oai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1024,
        temperature: 0.2
      });

      const text = res.choices?.[0]?.message?.content || "";
      if (text.trim()) {
        return {
          success: true,
          analysis: text.trim(),
          provider: "AURA Vision (OpenAI GPT-4o-mini)",
          model: "gpt-4o-mini",
          language: isTamil ? "tamil" : "english",
          timestamp: new Date().toISOString()
        };
      }
    } catch (oaiErr) {
      lastError = oaiErr;
      console.warn("[AURA VISION NOTE] OpenAI Vision attempt:", oaiErr.message);
    }
  }

  // 3. Tertiary Engine: Google Gemini Flash Vision (if key configured)
  if (process.env.GEMINI_API_KEY) {
    try {
      const mimeMatch = imageUrl.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const base64Data = imageUrl.replace(/^data:[^;]+;base64,/, "");

      const payload = {
        systemInstruction: { parts: [{ text: VISION_SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [
              { text: effectivePrompt },
              { inlineData: { mimeType, data: base64Data } }
            ]
          }
        ]
      };

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000)
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (text.trim()) {
          return {
            success: true,
            analysis: text.trim(),
            provider: "AURA Vision (Google Gemini)",
            model: "gemini-1.5-flash",
            language: isTamil ? "tamil" : "english",
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (geminiErr) {
      lastError = geminiErr;
      console.warn("[AURA VISION NOTE] Gemini Vision attempt:", geminiErr.message);
    }
  }

  // 4. Safe Local Offline Fallback
  // Ensure the application NEVER crashes even if external cloud APIs are temporarily unreachable
  const approxSizeKb = Math.round(imageUrl.length * 0.75 / 1024);
  const fallbackText = isTamil
    ? `**AURA விஷன் (ஆஃப்லைன் பயன்முறை)**\n\nபடம் வெற்றிகரமாக பதிவு செய்யப்பட்டது (அளவு: தோராயமாக ${approxSizeKb} KB).\n\nகிளவுட் விஷன் நெட்வொர்க் சேவை தற்காலிகமாக இணைக்கப்படவில்லை (${lastError ? lastError.message : "சேவை காத்திருப்பில் உள்ளது"}).\n\n- படத் தரம்: பெறப்பட்டது\n- அடுத்த நடவடிக்கை: மீண்டும் கேமராவை பயன்படுத்தி 'Capture' செய்யவும் அல்லது நிலையான இணைய இணைப்பை சரிபார்க்கவும்.`
    : `**AURA Vision (Local Offline Mode)**\n\nFrame captured successfully (approx. ${approxSizeKb} KB).\n\nCloud vision model returned: ${lastError ? lastError.message : "Service standby"}.\n\n- Frame Quality: Received\n- Suggested Action: Retake image in brighter lighting or check network connection.`;

  return {
    success: true,
    analysis: fallbackText,
    provider: "AURA Vision (Local Engine)",
    model: "aura-vision-local",
    language: isTamil ? "tamil" : "english",
    timestamp: new Date().toISOString(),
    isOfflineFallback: true
  };
}

/**
 * Interactive follow-up Q&A about an already captured image
 */
async function followUpChat({ image, question, conversationHistory = [], language = "english" }) {
  if (!question || !question.trim()) {
    throw new Error("Question prompt is required for follow-up chat.");
  }

  // 1. Try multimodal vision analysis first
  try {
    const res = await analyzeImage({
      image,
      prompt: question,
      language,
      conversationHistory
    });

    if (res && res.success && !res.isOfflineFallback) {
      return res;
    }
  } catch (_) {}

  // 2. High-speed conversational reasoning via Groq if image model was offline
  if (process.env.GROQ_API_KEY && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    try {
      const groq = getGroqClient();
      if (groq) {
        const messages = [
          {
            role: "system",
            content: `You are AURA Vision assistant answering follow-up questions about an object that the user photographed and discussed earlier. Base your answer directly on the established visual context. Answer in ${language === "tamil" ? "Tamil (தமிழ்)" : "English"}.`
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
          model: "openai/gpt-oss-120b",
          messages,
          max_tokens: 500,
          temperature: 0.2
        });

        const ans = groqRes.choices?.[0]?.message?.content;
        if (ans && ans.trim()) {
          return {
            success: true,
            analysis: ans.trim(),
            provider: "AURA Vision (Neural Context Engine)",
            model: "openai/gpt-oss-120b",
            language,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (groqErr) {
      console.warn("[AURA VISION CHAT NOTE] Groq reasoning note:", groqErr.message);
    }
  }

  // 3. Fallback
  return analyzeImage({
    image,
    prompt: question,
    language,
    conversationHistory
  });
}

module.exports = {
  isConfigured,
  analyzeImage,
  followUpChat,
  normalizeImageDataUrl
};
