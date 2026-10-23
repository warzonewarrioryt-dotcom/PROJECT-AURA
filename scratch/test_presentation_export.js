"use strict";

const path = require("path");
const fs = require("fs");

async function testExport() {
  console.log("Testing Presentation Generation & Export...");
  const presentationRoutes = require("../backend/routes/presentation");

  const mockSlides = [
    {
      number: 1,
      title: "Renewable Energy & Sustainable Microgrids",
      bullets: [
        "Distributed photovoltaic arrays and wind generation topologies",
        "Battery energy storage systems (BESS) and bidirectional inverters",
        "Real-time load balancing and islanding protection protocols"
      ],
      notes: "Introduce the core motivations for decentralized microgrids."
    },
    {
      number: 2,
      title: "Grid Modernization & Power Quality Architecture",
      bullets: [
        "Harmonic distortion mitigation via active power filters",
        "Zero-sequence current isolation and neutral grounding schemes",
        "SCADA telemetry and automated fault ride-through (FRT) compliance"
      ],
      notes: "Discuss operational stability during transient grid events."
    }
  ];

  const res = await fetch("http://localhost:3000/api/presentation/export/pptx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: "Renewable Energy Systems",
      slides: mockSlides,
      theme: "cyber-dark"
    })
  });

  if (!res.ok) {
    throw new Error(`PPTX export failed with status: ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log(`PPTX exported successfully! Size: ${buffer.length} bytes (starts with PK zip magic: ${buffer.slice(0, 2).toString()})`);

  // Test PDF export
  const pdfRes = await fetch("http://localhost:3000/api/presentation/export/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: "Renewable Energy Systems",
      slides: mockSlides,
      theme: "cyber-dark"
    })
  });

  if (!pdfRes.ok) {
    throw new Error(`PDF export failed with status: ${pdfRes.status}`);
  }

  const pdfArrayBuffer = await pdfRes.arrayBuffer();
  const pdfBuffer = Buffer.from(pdfArrayBuffer);
  console.log(`PDF exported successfully! Size: ${pdfBuffer.length} bytes (starts with %PDF: ${pdfBuffer.slice(0, 4).toString()})`);
}

testExport().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
