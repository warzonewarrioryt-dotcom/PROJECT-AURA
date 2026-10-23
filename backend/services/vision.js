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

const productSearch = require("./productSearch");

const VISION_SYSTEM_PROMPT = `You are AURA Vision, the friendly, intelligent, student-first study assistant of PROJECT AURA.
Your mission is to help students learn with short, clear, warm, and encouraging explanations.

DEFAULT STUDENT-FIRST ANSWER STYLE (Strictly keep between 40 to 90 words):
When a student shows an object, component, or device, respond strictly in this clean, friendly format:

🔍 **This looks like:** [object name]

💡 **What it does:** [one or two simple, easy-to-understand sentences explaining its main purpose]

📚 **Student tip:** [one useful fact, formula, real-world example, or practical tip for students]

Finish with one short, friendly follow-up suggestion, such as:
"Want me to explain how it works?" or "Want to know how its buttons work?"

TAMIL STUDENT-FIRST FORMAT (இயற்கையான தமிழில் 40 முதல் 80 வார்த்தைகளில் சுருக்கமாக):
🔍 **இது ஒரு:** [பொருளின் பெயர்] போலத் தெரிகிறது.

💡 **இது என்ன செய்யும்:** [ஒன்று அல்லது இரண்டு எளிய வாக்கியங்களில் அதன் பயன்பாடு]

📚 **Student tip:** [மாணவர்களுக்கான ஒரு பயனுள்ள தகவல் அல்லது குறிப்பு]

Finish with:
"இதன் இயக்கம் அல்லது பாகங்கள் பற்றி விரிவாகப் பார்க்கலாமா?"

SPECIAL RULES:
1. Brevity & Word Count: Default responses MUST be concise (around 40–90 words). Avoid lengthy introductions, repeated conclusions, excessive headings, and unnecessary emojis.
2. Detailed Explanations: Use a longer, comprehensive explanation ONLY when the student explicitly asks "explain in detail", "detailed", "விரிவாக", or "deep dive".
3. Engineering & Electrical Components: Explain the component's purpose in simple terms and give a relevant practical example (e.g. in robotics, home appliances, or power grids).
4. Educational Diagrams: Focus on the main concept and important labels.
5. Text-Reading (OCR): When asked to read text, transcribe the visible text first, then briefly explain it.
6. Uncertainty & Truthfulness: Distinguish visible evidence from inference. State uncertainty honestly if blurry or partially cropped. Never invent non-existent specifications or make unsupported claims about a person's identity, political affiliation, brand, or model.
7. Clean Output: Format cleanly for the student UI. Avoid complex nested markdown.`;

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
 * Enrich visual analysis with verified product buying/learning links if applicable
 */
async function enrichWithProductLinks(text, { prompt, isTamil }) {
  if (!text || typeof text !== "string") return text;
  if (text.includes("🛒") || text.toLowerCase().includes("buy or learn more")) {
    return text;
  }

  // Extract object name from the first lines
  let objectName = "";
  const objMatch = text.match(/(?:This looks like|இது ஒரு)[:\s*]+([^\n\r.]+)/i);
  if (objMatch && objMatch[1]) {
    objectName = objMatch[1].replace(/[*_]/g, "").trim();
  }

  if (!objectName) {
    const firstLine = text.split("\n")[0] || "";
    objectName = firstLine.replace(/[*#_🔍💡📚]/g, "").trim();
  }

  if (!objectName || !productSearch.isPurchasableItem(objectName, prompt)) {
    return text;
  }

  try {
    const pData = await productSearch.findProductLinks({
      objectName,
      userPrompt: prompt,
      isTamil
    });

    if (pData) {
      let productSection = "\n\n🛒 **" + (isTamil ? "வாங்க அல்லது மேலும் அறிய:" : "Buy or learn more:") + "**\n";
      if (pData.hasDirectLinks && Array.isArray(pData.items) && pData.items.length > 0) {
        pData.items.forEach(item => {
          const priceStr = item.price ? ` (${item.price})` : "";
          productSection += `• [${item.title} — ${item.seller}](${item.url})${priceStr}\n`;
        });
      } else if (pData.searchLinks && pData.searchLinks.length > 0) {
        const linkStr = pData.searchLinks.map(s => `[${s.seller}](${s.url})`).join(" | ");
        productSection += `${pData.message} ${linkStr}\n`;
      }

      // Insert before the last follow-up question
      const lines = text.trim().split("\n");
      const lastLine = lines[lines.length - 1];
      if (lastLine.includes("?") || lastLine.includes("பார்க்கலாமா") || lastLine.includes("Want me")) {
        lines.splice(lines.length - 1, 0, productSection.trim());
        return lines.join("\n\n");
      } else {
        return text.trim() + productSection;
      }
    }
  } catch (err) {
    console.warn("[VISION PRODUCT ENRICH NOTE]", err.message);
  }

  return text;
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
    ? "இந்த படத்தில் உள்ள பொருளை அடையாளம் கண்டு மாணவர்-நட்பு முறையில் சுருக்கமாக தமிழில் விளக்குங்கள்."
    : "Identify this object and provide a short, friendly, student-first explanation.";

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
            { text: isTamil ? `${effectivePrompt}\n\nமுக்கிய குறிப்பு: மாணவர்களுக்கான சுருக்கமான (40-80 வார்த்தைகள்) தெளிவான தமிழ் பதிலைத் தரவும்.` : effectivePrompt },
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
              maxOutputTokens: 600
            }
          }),
          signal: AbortSignal.timeout(12000)
        });

        if (res.ok) {
          const data = await res.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (text.trim()) {
            const enrichedAnalysis = await enrichWithProductLinks(text.trim(), { prompt: effectivePrompt, isTamil });
            return {
              success: true,
              analysis: enrichedAnalysis,
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

          const enrichedNvText = await enrichWithProductLinks(text, { prompt: effectivePrompt, isTamil });
          return {
            success: true,
            analysis: enrichedNvText,
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
          const enrichedOaiText = await enrichWithProductLinks(text.trim(), { prompt: effectivePrompt, isTamil });
          return {
            success: true,
            analysis: enrichedOaiText,
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
