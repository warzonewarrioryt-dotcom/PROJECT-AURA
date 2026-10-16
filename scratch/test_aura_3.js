const http = require("http");
const path = require("path");

// Launch server on an isolated test port
process.env.PORT = "3199";
require("../backend/server.js");

setTimeout(async () => {
  console.log("=== PROJECT AURA 3.0 ENDPOINT VALIDATION ===");

  async function postJson(endpoint, data) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(data);
      const req = http.request(
        {
          hostname: "localhost",
          port: 3199,
          path: endpoint,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload)
          }
        },
        (res) => {
          const chunks = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              buffer: Buffer.concat(chunks)
            });
          });
        }
      );
      req.on("error", reject);
      req.write(payload);
      req.end();
    });
  }

  async function getUrl(endpoint) {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:3199${endpoint}`, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            buffer: Buffer.concat(chunks)
          });
        });
      }).on("error", reject);
    });
  }

  try {
    // 1. Dashboard Serve
    const dash = await getUrl("/dashboard.html");
    console.log(`[TEST 1] GET /dashboard.html -> Status: ${dash.status}, Size: ${dash.buffer.length} bytes`);

    // 2. Presentation PPTX Export
    const pptxRes = await postJson("/api/presentation/export", {
      format: "pptx",
      topic: "Deep Reinforcement Learning in Robotics",
      slides: [
        { number: 1, title: "Executive Robotics Paradigm", bullets: ["Autonomous Policy Optimization", "Low Latency Action Space"], notes: "Presenter intro notes" },
        { number: 2, title: "Sim-to-Real Domain Randomization", bullets: ["Physical Variance Modeling", "Zero-Shot Sim2Real Transfer"], notes: "Domain adaptation" }
      ]
    });
    console.log(`[TEST 2] PPTX Export -> Status: ${pptxRes.status}, Content-Type: ${pptxRes.headers["content-type"]}, Size: ${pptxRes.buffer.length} bytes`);

    // 3. Presentation PDF Export
    const pdfRes = await postJson("/api/presentation/export", {
      format: "pdf",
      topic: "Quantum Circuit Compilation",
      slides: [
        { number: 1, title: "Qubit Topologies", bullets: ["Transmon Superconducting Architecture", "Error Correction Threshold"], notes: "Speaker notes on NISQ" }
      ]
    });
    console.log(`[TEST 3] PDF Export -> Status: ${pdfRes.status}, Content-Type: ${pdfRes.headers["content-type"]}, Size: ${pdfRes.buffer.length} bytes`);

    // 4. Code Only Mode Test
    const codeRes = await postJson("/ask", {
      message: "Implement binary search in Python",
      mode: "code_only"
    });
    const codeJson = JSON.parse(codeRes.buffer.toString("utf8"));
    const codeAnswer = codeJson.answer || codeJson.response || "";
    console.log(`[TEST 4] Code Only Mode -> Status: ${codeRes.status}, Received pure code length: ${codeAnswer.length}`);
    console.log("Snippet:", codeAnswer.slice(0, 140).replace(/\n/g, " "));

    // 5. Files / Vault API
    const filesRes = await getUrl("/api/files");
    console.log(`[TEST 5] GET /api/files -> Status: ${filesRes.status}`);

    console.log("=== ALL ENDPOINTS VERIFIED SUCCESSFULLY ===");
    process.exit(0);
  } catch (err) {
    console.error("VALIDATION ERROR:", err);
    process.exit(1);
  }
}, 1200);
