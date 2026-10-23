/* =========================================================
   PROJECT AURA 3.0 — PRODUCT & COMPONENT SEARCH SERVICE
   Verified Shopping Intelligence for AURA Vision & Study Tools
   Focus: Reputable Indian Sellers (Amazon India, Robu.in, ElectronicsComp, etc.)
   Zero Fabrication Policy: Never fabricate products, prices, or URLs.
========================================================= */

"use strict";

const tavilyService = require("./tavily");

// Non-purchasable object categories that must NEVER have buying options forced
const NON_PURCHASABLE_PATTERNS = [
  /\b(person|human|man|woman|child|boy|girl|people|face|portrait|selfie)\b/i,
  /\b(gesture|hand|finger|palm|fist|thumbs up|peace sign)\b/i,
  /\b(diagram|schematic|graph|chart|equation|handwritten|notes|drawing|sketch|formula|derivation)\b/i,
  /\b(sky|cloud|tree|mountain|ocean|river|flower|leaf|grass|dog|cat|bird|animal)\b/i,
  /\b(wall|floor|ceiling|window|door|road|street|building|room)\b/i
];

// Identifiable purchasable electronics and study components
const PURCHASABLE_PATTERNS = [
  /\b(arduino|raspberry pi|microcontroller|esp32|esp8266|stm32|pic)\b/i,
  /\b(multimeter|oscilloscope|soldering|breadboard|voltmeter|ammeter)\b/i,
  /\b(resistor|capacitor|inductor|diode|transistor|mosfet|relay|potentiometer)\b/i,
  /\b(sensor|ultrasonic|ldr|thermistor|accelerometer|gyroscope|ir sensor)\b/i,
  /\b(motor|servo|stepper|dc motor|pump|actuator|generator)\b/i,
  /\b(calculator|scientific calculator|compass|protractor|vernier caliper)\b/i,
  /\b(ic\s*\d+|7404|7408|7432|555 timer|op-amp|lm741|lm358|l298n)\b/i,
  /\b(wire|jumper cable|battery|power supply|adapter|transformer)\b/i
];

function isPurchasableItem(objectName, userPrompt = "") {
  const combined = `${objectName} ${userPrompt}`.toLowerCase();

  // Explicit user purchase intent overrides
  const hasBuyIntent = /\b(buy|purchase|price|cost|where to get|shop|order|vendor|store)\b/i.test(userPrompt);
  if (hasBuyIntent) {
    // Still protect people and abstract drawings
    if (NON_PURCHASABLE_PATTERNS.slice(0, 2).some(p => p.test(objectName))) {
      return false;
    }
    return true;
  }

  // Reject non-purchasable objects
  if (NON_PURCHASABLE_PATTERNS.some(p => p.test(objectName))) {
    return false;
  }

  // Check if it matches known purchasable hardware / student tools
  return PURCHASABLE_PATTERNS.some(p => p.test(objectName));
}

/**
 * Find verified product buying links from real search providers
 */
async function findProductLinks({ objectName, brandModel = "", userPrompt = "", isTamil = false }) {
  if (!objectName || !isPurchasableItem(objectName, userPrompt)) {
    return null;
  }

  const cleanName = objectName.replace(/[🔍💡📚🛒*#_]/g, "").trim();
  const searchQuery = [brandModel || cleanName, "buy online India"].filter(Boolean).join(" ");
  const safeQuery = encodeURIComponent(brandModel || cleanName);

  const fallbackAmazonUrl = `https://www.amazon.in/s?k=${safeQuery}`;
  const isElectronics = PURCHASABLE_PATTERNS.some(p => p.test(cleanName));
  const fallbackRobuUrl = isElectronics ? `https://robu.in/?s=${safeQuery}` : null;

  let verifiedLinks = [];

  // Try real Tavily Web Search
  if (tavilyService.isConfigured()) {
    try {
      const searchRes = await tavilyService.searchWeb(`${searchQuery} Amazon Robu ElectronicsComp`, {
        maxResults: 6,
        depth: "basic"
      });

      if (searchRes && searchRes.success && Array.isArray(searchRes.results)) {
        for (const item of searchRes.results) {
          const url = item.url || "";
          let sellerName = "";

          if (url.includes("amazon.in") || url.includes("amazon.com")) sellerName = "Amazon";
          else if (url.includes("robu.in")) sellerName = "Robu.in";
          else if (url.includes("electronicscomp.com")) sellerName = "ElectronicsComp";
          else if (url.includes("flipkart.com")) sellerName = "Flipkart";
          else if (url.includes("element14.com")) sellerName = "element14";
          else if (url.includes("arduino.cc")) sellerName = "Arduino Store";

          if (sellerName) {
            // Check for explicit verified price in snippet
            let verifiedPrice = null;
            const priceMatch = (item.content || "").match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)/i);
            if (priceMatch) {
              verifiedPrice = `₹${priceMatch[1]}`;
            }

            verifiedLinks.push({
              title: item.title ? item.title.slice(0, 70) : cleanName,
              seller: sellerName,
              url: url,
              price: verifiedPrice,
              isExact: Boolean(brandModel && item.title && item.title.toLowerCase().includes(brandModel.toLowerCase()))
            });

            if (verifiedLinks.length >= 2) break;
          }
        }
      }
    } catch (err) {
      console.warn("[PRODUCT SEARCH NOTE]", err.message);
    }
  }

  // If verified direct links were found
  if (verifiedLinks.length > 0) {
    return {
      available: true,
      hasDirectLinks: true,
      items: verifiedLinks,
      notice: verifiedLinks.some(l => l.isExact)
        ? (isTamil ? "சரிபார்க்கப்பட்ட விற்பனையாளர் இணைப்புகள்:" : "Verified seller options:")
        : (isTamil ? "இணக்கமான / ஒத்த தயாரிப்பு இணைப்புகள்:" : "Similar / compatible options:")
    };
  }

  // Graceful verified fallback: useful direct search link without fabricated prices
  const searchLinks = [
    { seller: "Amazon India", url: fallbackAmazonUrl }
  ];
  if (fallbackRobuUrl) {
    searchLinks.push({ seller: "Robu.in (Electronics)", url: fallbackRobuUrl });
  }

  return {
    available: false,
    hasDirectLinks: false,
    message: isTamil
      ? "நேரடி தயாரிப்பு இணைப்புகள் தற்போது கிடைக்கவில்லை. தேடல் இணைப்புகள்:"
      : "Live buying links are unavailable right now. Search directly:",
    searchLinks
  };
}

module.exports = {
  isPurchasableItem,
  findProductLinks
};
