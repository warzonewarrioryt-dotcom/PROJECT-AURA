/**
 * Automated Test Suite for PHASE 12 — AURA VISION
 * Tests:
 * 1. GET /api/vision/status (model info, capabilities, configured status)
 * 2. POST /api/vision/analyze (English object identification)
 * 3. POST /api/vision/analyze (Tamil bilingual object identification)
 * 4. POST /api/vision/chat (Interactive follow-up conversation about image)
 * 5. Input validation & error boundaries (missing image, empty question)
 */

const assert = require("assert");

const BASE_URL = "http://localhost:3000";

// 1x1 lime green PNG data URL
const SAMPLE_IMAGE_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

async function runVisionTests() {
  console.log("==================================================");
  console.log("   PROJECT AURA 3.0 — AURA VISION TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
    }
    // Brief spacing to prevent API burst rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  // Test 1: Vision Status
  await test("GET /api/vision/status reports active vision configuration", async () => {
    const res = await fetch(`${BASE_URL}/api/vision/status`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.configured, true);
    assert.strictEqual(typeof data.activeModel, "string");
    assert(Array.isArray(data.capabilities), "Capabilities should be an array");
    assert(data.capabilities.includes("bilingual_english_tamil"), "Should include bilingual capability");
    assert(data.capabilities.includes("object_identification"), "Should include object identification");
  });

  // Test 2: Analyze Image (English)
  await test("POST /api/vision/analyze identifies visual object in English", async () => {
    const res = await fetch(`${BASE_URL}/api/vision/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: SAMPLE_IMAGE_BASE64,
        prompt: "Describe what you see in this image in one concise sentence.",
        language: "english"
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(typeof data.analysis === "string" && data.analysis.length > 5, "Analysis should be non-empty string");
    assert.strictEqual(data.language, "english");
    assert(data.provider.includes("AURA Vision"), "Provider should be AURA Vision");
    console.log("      English Analysis Output:", data.analysis);
  });

  // Test 3: Analyze Image (Tamil)
  await test("POST /api/vision/analyze explains visual object in Tamil", async () => {
    const res = await fetch(`${BASE_URL}/api/vision/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: SAMPLE_IMAGE_BASE64,
        prompt: "இதில் என்ன நிறம் உள்ளது என்று தமிழில் ஒரு வரியில் கூறுங்கள்.",
        language: "tamil"
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(typeof data.analysis === "string" && data.analysis.length > 3, "Tamil analysis should be non-empty string");
    assert.strictEqual(data.language, "tamil");
    console.log("      Tamil Analysis Output:", data.analysis);
  });

  // Test 4: Follow-up Chat Q&A
  await test("POST /api/vision/chat answers follow-up questions referencing image context", async () => {
    const res = await fetch(`${BASE_URL}/api/vision/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: SAMPLE_IMAGE_BASE64,
        question: "Is this image red or green?",
        conversationHistory: [
          { role: "user", content: "What color is this?" },
          { role: "assistant", content: "The image is solid green." }
        ],
        language: "english"
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.analysis.toLowerCase().includes("green"), "Follow-up response should correctly confirm green");
    console.log("      Follow-up Answer:", data.analysis);
  });

  // Test 5: Validation - Missing Image
  await test("POST /api/vision/analyze safely rejects missing image with 400 error", async () => {
    const res = await fetch(`${BASE_URL}/api/vision/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "What is this?" })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert(data.error.includes("Image payload is required"));
  });

  // Test 6: Validation - Missing Question on Follow-up Chat
  await test("POST /api/vision/chat safely rejects empty question with 400 error", async () => {
    const res = await fetch(`${BASE_URL}/api/vision/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: SAMPLE_IMAGE_BASE64, question: "   " })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert(data.error.includes("Follow-up question is required"));
  });

  console.log("==================================================");
  console.log(`RESULT: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runVisionTests().catch(e => {
  console.error("Test Suite Fatal Error:", e);
  process.exit(1);
});
