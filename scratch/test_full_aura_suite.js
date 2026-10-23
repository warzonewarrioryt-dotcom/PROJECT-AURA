"use strict";

const fs = require("fs");
const path = require("path");

async function runSuite() {
  console.log("==========================================");
  console.log("   PROJECT AURA 3.0 SYSTEM VERIFICATION   ");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Health check
  console.log("[TEST 1] Backend Health & Status Endpoints");
  try {
    const res = await fetch("http://localhost:3000/api/health");
    const data = await res.json();
    assert(res.ok && data.success, "GET /api/health returns success");
    assert(data.status === "healthy", "System status is healthy");
  } catch (e) {
    assert(false, `Health check error: ${e.message}`);
  }

  // 2. YouTube Search - Tamil Nadu State Board
  console.log("\n[TEST 2] YouTube Search: Tamil Nadu State Board");
  try {
    const res = await fetch("http://localhost:3000/api/youtube/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        board: "Tamil Nadu State Board",
        standard: "12th Standard",
        subject: "Physics",
        topic: "Electrostatics & Gauss Law",
        language: "Tamil",
        maxResults: 4
      })
    });
    const data = await res.json();
    assert(res.ok && data.success, "POST /api/youtube/search returns success");
    assert(Array.isArray(data.results) && data.results.length > 0, "Returns educational lecture results");
    const first = data.results[0];
    const hasValidIdOrResolver = Boolean(
      (first.videoId && /^[a-zA-Z0-9_-]{11}$/.test(first.videoId)) ||
      (first.url && first.url.includes("youtube.com"))
    );
    assert(hasValidIdOrResolver, `First lecture has valid ID or YouTube link (${first.videoId || first.url})`);
  } catch (e) {
    assert(false, `YouTube TN State search error: ${e.message}`);
  }

  // 3. YouTube Search - CBSE Board
  console.log("\n[TEST 3] YouTube Search: CBSE Board (NCERT)");
  try {
    const res = await fetch("http://localhost:3000/api/youtube/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        board: "CBSE",
        standard: "Class 12",
        subject: "Chemistry",
        topic: "Chemical Kinetics",
        language: "English",
        maxResults: 4
      })
    });
    const data = await res.json();
    assert(res.ok && data.success, "POST /api/youtube/search for CBSE returns success");
    assert(data.results && data.results.length > 0, "Returns CBSE lecture results");
    assert(data.board === "CBSE", "Correctly identified as CBSE");
  } catch (e) {
    assert(false, `YouTube CBSE search error: ${e.message}`);
  }

  // 4. Topic Knowledge Vault File Upload & Persistence
  console.log("\n[TEST 4] Knowledge Vault: Upload, Indexing & Persistence");
  try {
    const testContent = "PROJECT AURA 3.0 PHYSICS NOTES: Coulomb's Law states F = (1 / 4πε0) * (q1 * q2 / r^2). Gauss law states electric flux equals total enclosed charge divided by epsilon naught.";
    const boundary = "----WebKitFormBoundaryAuraTest" + Date.now();
    let body = "";
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="12th_Physics_Electrostatics_Aura_Test.txt"\r\n`;
    body += `Content-Type: text/plain\r\n\r\n`;
    body += testContent;
    body += `\r\n--${boundary}--\r\n`;

    const uploadRes = await fetch("http://localhost:3000/api/vault/upload", {
      method: "POST",
      headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
      body: Buffer.from(body)
    });

    const uploadData = await uploadRes.json();
    assert(uploadRes.ok && uploadData.success, "POST /api/vault/upload accepts file and indexes into DB");
    assert(uploadData.file && uploadData.file.id, `File assigned unique persistent ID (${uploadData.file?.id})`);

    // Verify persistence via GET /api/vault/files
    const listRes = await fetch("http://localhost:3000/api/vault/files");
    const listData = await listRes.json();
    assert(listRes.ok && listData.success, "GET /api/vault/files returns indexed document catalog");
    const found = listData.files.find(f => f.originalName === "12th_Physics_Electrostatics_Aura_Test.txt" || f.id === uploadData.file.id);
    assert(Boolean(found), "Uploaded file is permanently persisted in database");
  } catch (e) {
    assert(false, `Vault upload error: ${e.message}`);
  }

  // 5. Presentation Generation & Export
  console.log("\n[TEST 5] Presentation Studio: Generation & Export Pipeline");
  try {
    const presRes = await fetch("http://localhost:3000/api/presentation/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Renewable Energy & Smart Microgrids",
        slideCount: 4,
        audience: "Academic & Technical"
      })
    });
    const presData = await presRes.json();
    assert(presRes.ok && presData.success, "POST /api/presentation/generate synthesized structured deck");
    assert(Array.isArray(presData.slides) && presData.slides.length >= 2, `Generated ${presData.slides?.length} slides`);

    // Export PPTX
    const pptxRes = await fetch("http://localhost:3000/api/presentation/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Renewable Energy",
        slides: presData.slides,
        format: "pptx"
      })
    });
    assert(pptxRes.ok, "POST /api/presentation/export returns 200 OK for PPTX");

    // Export PDF
    const pdfRes = await fetch("http://localhost:3000/api/presentation/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Renewable Energy",
        slides: presData.slides,
        format: "pdf"
      })
    });
    assert(pdfRes.ok, "POST /api/presentation/export returns 200 OK for PDF");
  } catch (e) {
    assert(false, `Presentation pipeline error: ${e.message}`);
  }

  // 6. AI Command & Context
  console.log("\n[TEST 6] AI Command Dispatcher & Bilingual Understanding");
  try {
    const cmdRes = await fetch("http://localhost:3000/api/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: "What is Coulomb's Law in simple terms?"
      })
    });
    const cmdData = await cmdRes.json();
    assert(cmdRes.ok && cmdData.success, "POST /api/command returns intelligent grounded answer");
    assert(cmdData.response && cmdData.response.length > 20, "Response is complete and descriptive");
  } catch (e) {
    assert(false, `Command error: ${e.message}`);
  }

  console.log("\n==========================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  if (failed > 0) process.exit(1);
}

runSuite().catch(err => {
  console.error("Suite execution error:", err);
  process.exit(1);
});
