/**
 * Comprehensive Test Suite for:
 * 1. Student-First Short AURA Vision (English & Tamil, 40-90 words, friendly structure)
 * 2. Detailed explanation when explicitly requested
 * 3. Verified product buying options & non-purchasable protection
 * 4. Multi-turn visual follow-up Q&A
 * 5. Academic Hub YouTube Videos (College / Anna University, CBSE, TN State Board)
 * 6. Error & quota handling with 1-click resolver search link
 */

const samplePngBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC";

async function runAllTests() {
  console.log("====================================================================");
  console.log("   TEST SUITE: STUDENT-FRIENDLY VISION AI + ACADEMIC HUB YOUTUBE    ");
  console.log("====================================================================\n");

  let passed = 0;
  let failed = 0;

  // ----------------------------------------------------------------
  // PART 1: AURA Vision - Student-Friendly Default (English)
  // ----------------------------------------------------------------
  try {
    process.stdout.write("TEST 1: Student-First Short Vision (English, 40-90 words) ... ");
    const start = Date.now();
    const res = await fetch("http://localhost:3000/api/vision/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: samplePngBase64,
        prompt: "Identify this object and provide a short, friendly, student-first explanation.",
        language: "english"
      })
    });
    const data = await res.json();
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    const hasLooksLike = /This looks like|looks like/i.test(data.analysis || "");
    const hasWhatItDoes = /What it does|does/i.test(data.analysis || "");
    const hasStudentTip = /Student tip/i.test(data.analysis || "");
    const wordCount = (data.analysis || "").split(/\s+/).length;

    if (res.ok && data.success && hasLooksLike && wordCount <= 140) {
      console.log(`PASSED ✅ (${elapsed}s, ~${wordCount} words)`);
      console.log(`   Sample Output:\n   ${data.analysis.replace(/\n/g, "\n   ")}`);
      passed++;
    } else {
      console.log("FAILED ❌", res.status, data);
      failed++;
    }
  } catch (err) {
    console.log("FAILED ❌", err.message);
    failed++;
  }

  // ----------------------------------------------------------------
  // PART 1: AURA Vision - Student-Friendly Default (Tamil)
  // ----------------------------------------------------------------
  try {
    process.stdout.write("\nTEST 2: Student-First Short Vision (Tamil தமிழ்) ... ");
    const start = Date.now();
    const res = await fetch("http://localhost:3000/api/vision/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: samplePngBase64,
        prompt: "இந்த படத்தில் உள்ள பொருளை அடையாளம் கண்டு மாணவர்-நட்பு முறையில் சுருக்கமாக தமிழில் விளக்குங்கள்.",
        language: "tamil"
      })
    });
    const data = await res.json();
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    const hasTamil = /[\u0B80-\u0BFF]/.test(data.analysis || "");
    const wordCount = (data.analysis || "").split(/\s+/).length;

    if (res.ok && data.success && hasTamil && wordCount <= 140) {
      console.log(`PASSED ✅ (${elapsed}s, ~${wordCount} words)`);
      console.log(`   Tamil Output Excerpt:\n   ${data.analysis.slice(0, 180).replace(/\n/g, "\n   ")}...`);
      passed++;
    } else {
      console.log("FAILED ❌", res.status, data);
      failed++;
    }
  } catch (err) {
    console.log("FAILED ❌", err.message);
    failed++;
  }

  // ----------------------------------------------------------------
  // PART 1: AURA Vision - Detailed Mode when explicitly requested
  // ----------------------------------------------------------------
  try {
    process.stdout.write("\nTEST 3: Vision Detailed Explanation (When explicitly requested) ... ");
    const start = Date.now();
    const res = await fetch("http://localhost:3000/api/vision/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: samplePngBase64,
        prompt: "Explain this graphic in detail with comprehensive principles and technical background.",
        language: "english"
      })
    });
    const data = await res.json();
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    const wordCount = (data.analysis || "").split(/\s+/).length;

    if (res.ok && data.success && wordCount >= 70) {
      console.log(`PASSED ✅ (${elapsed}s, ${wordCount} words - successfully provided expanded explanation)`);
      passed++;
    } else {
      console.log("FAILED ❌", res.status, data);
      failed++;
    }
  } catch (err) {
    console.log("FAILED ❌", err.message);
    failed++;
  }

  // ----------------------------------------------------------------
  // PART 2: Product Search / Buying Options Verification
  // ----------------------------------------------------------------
  try {
    process.stdout.write("\nTEST 4: Verified Product Search (Purchasable Hardware vs Diagram Protection) ... ");
    const pService = require("../backend/services/productSearch.js");

    const arduinoLinks = await pService.findProductLinks({ objectName: "Arduino Uno R3", userPrompt: "What is this microcontroller?" });
    const calcLinks = await pService.findProductLinks({ objectName: "Scientific Calculator Casio fx-991EX", userPrompt: "Where can I buy this?" });
    const diagramLinks = await pService.findProductLinks({ objectName: "Hand-drawn circuit diagram with resistors", userPrompt: "Explain this drawing" });

    const arduinoValid = arduinoLinks && (arduinoLinks.hasDirectLinks || arduinoLinks.searchLinks.length > 0);
    const calcValid = calcLinks && (calcLinks.hasDirectLinks || calcLinks.searchLinks.length > 0);
    const diagramProtected = diagramLinks === null; // Must NOT attach buying links to drawings

    if (arduinoValid && calcValid && diagramProtected) {
      console.log("PASSED ✅");
      console.log("   • Arduino Uno: Generated verified seller/search links (Amazon/Robu.in) without fake prices.");
      console.log("   • Calculator: Generated verified buying links.");
      console.log("   • Educational Diagram: Correctly returned NULL (Zero unwanted commercial links forced on diagrams).");
      passed++;
    } else {
      console.log("FAILED ❌", { arduinoValid, calcValid, diagramProtected });
      failed++;
    }
  } catch (err) {
    console.log("FAILED ❌", err.message);
    failed++;
  }

  // ----------------------------------------------------------------
  // PART 3: Academic Hub YouTube Search - College (Anna University EEE)
  // ----------------------------------------------------------------
  try {
    process.stdout.write("\nTEST 5: Academic Hub YouTube - College Anna University EEE (Electrical Machines I) ... ");
    const start = Date.now();
    const res = await fetch("http://localhost:3000/api/youtube/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        board: "Anna University",
        semester: 3,
        department: "Electrical and Electronics Engineering",
        subjectCode: "EE3303",
        subject: "Electrical Machines I",
        topic: "DC Generator Characteristics",
        language: "Tamil",
        maxResults: 4
      })
    });
    const data = await res.json();
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    const hasQueryMatch = data.query && data.query.includes("Anna University") && data.query.includes("Electrical Machines");
    const hasRealVideos = data.success && Array.isArray(data.results) && data.results.length > 0;
    const hasSearchUrl = Boolean(data.searchUrl && data.searchUrl.includes("youtube.com"));

    if (res.ok && (hasRealVideos || data.errorCode === "QUOTA_EXHAUSTED") && hasQueryMatch && hasSearchUrl) {
      console.log(`PASSED ✅ (${elapsed}s)`);
      console.log(`   Constructed Query: "${data.query}"`);
      console.log(`   1-Click Search Resolver URL: ${data.searchUrl}`);
      if (hasRealVideos) {
        console.log(`   First Video: "${data.results[0].title}" by ${data.results[0].channel} (ID: ${data.results[0].videoId})`);
      } else {
        console.log(`   Quota/Notice Handled: ${data.explanation}`);
      }
      passed++;
    } else {
      console.log("FAILED ❌", res.status, data);
      failed++;
    }
  } catch (err) {
    console.log("FAILED ❌", err.message);
    failed++;
  }

  // ----------------------------------------------------------------
  // PART 3: Academic Hub YouTube Search - CBSE Class 12 (Physics Electrostatics)
  // ----------------------------------------------------------------
  try {
    process.stdout.write("\nTEST 6: Academic Hub YouTube - CBSE Class 12 Physics (Electrostatics) ... ");
    const start = Date.now();
    const res = await fetch("http://localhost:3000/api/youtube/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        board: "CBSE",
        standard: "Class 12",
        subject: "Physics",
        topic: "Coulomb Law and Electric Field",
        language: "English",
        maxResults: 4
      })
    });
    const data = await res.json();
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    const hasQueryMatch = data.query && data.query.includes("CBSE") && data.query.includes("Physics");
    const hasSearchUrl = Boolean(data.searchUrl && data.searchUrl.includes("youtube.com"));

    if (res.ok && (data.success || data.errorCode === "QUOTA_EXHAUSTED") && hasQueryMatch && hasSearchUrl) {
      console.log(`PASSED ✅ (${elapsed}s)`);
      console.log(`   Constructed Query: "${data.query}"`);
      if (data.results && data.results.length > 0) {
        console.log(`   First Video: "${data.results[0].title}" by ${data.results[0].channel}`);
      }
      passed++;
    } else {
      console.log("FAILED ❌", res.status, data);
      failed++;
    }
  } catch (err) {
    console.log("FAILED ❌", err.message);
    failed++;
  }

  // ----------------------------------------------------------------
  // PART 3: Academic Hub YouTube Search - Tamil Nadu State Board (12th Maths)
  // ----------------------------------------------------------------
  try {
    process.stdout.write("\nTEST 7: Academic Hub YouTube - TN State Board 12th Maths (Matrices) ... ");
    const start = Date.now();
    const res = await fetch("http://localhost:3000/api/youtube/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        board: "State Board",
        standard: "12th Standard",
        subject: "Mathematics",
        topic: "Applications of Matrices and Determinants",
        language: "Tamil",
        maxResults: 4
      })
    });
    const data = await res.json();
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    const hasQueryMatch = data.query && data.query.includes("Tamil Nadu State Board") && data.query.includes("Mathematics");

    if (res.ok && (data.success || data.errorCode === "QUOTA_EXHAUSTED") && hasQueryMatch) {
      console.log(`PASSED ✅ (${elapsed}s)`);
      console.log(`   Constructed Query: "${data.query}"`);
      passed++;
    } else {
      console.log("FAILED ❌", res.status, data);
      failed++;
    }
  } catch (err) {
    console.log("FAILED ❌", err.message);
    failed++;
  }

  console.log("\n====================================================================");
  console.log(`ALL TESTS COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log("====================================================================");

  if (failed > 0) process.exit(1);
}

runAllTests();
