const fs = require('fs');

// Simple DOM sanity check
const html = fs.readFileSync('dashboard.html', 'utf8');
const js = fs.readFileSync('app.js', 'utf8');

// Look for getElementById calls in app.js and verify which ones are in dashboard.html
const regex = /getElementById\(["']([^"']+)["']\)/g;
let match;
const queriedIds = new Set();
while ((match = regex.exec(js)) !== null) {
  queriedIds.add(match[1]);
}

const missingFromHtml = [];
for (const id of queriedIds) {
  if (!html.includes('id="' + id + '"')) {
    missingFromHtml.push(id);
  }
}

console.log('Total queried IDs in app.js:', queriedIds.size);
console.log('Missing IDs that might be queried:', missingFromHtml);
