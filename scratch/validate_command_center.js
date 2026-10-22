const fs = require('fs');

const html = fs.readFileSync('dashboard.html', 'utf8');

// Check required IDs
const requiredIds = [
  'view-command-center', 'ccHero', 'widgetAcademicHub', 'widgetKnowledgeVault',
  'widgetDeckStudio', 'widgetVoiceAssistant', 'ccChatStream', 'ccInputZone',
  'messageInput', 'sendBtn', 'vaultAttachBtn', 'composerFileInput',
  'heroGreeting', 'ccHeroLatency', 'topbarLatency', 'globalVoiceAssistantBtn',
  'userAuthBtn', 'themeToggleBtn'
];

let missing = [];
for (const id of requiredIds) {
  if (!html.includes('id="' + id + '"')) {
    missing.push(id);
  }
}
console.log('Missing IDs:', missing.length === 0 ? 'None (All present!)' : missing);

// Check for unwanted text strings in view-command-center
const ccStartIndex = html.indexOf('id="view-command-center"');
const ccEndIndex = html.indexOf('id="view-creation-lab"');
const ccSection = html.slice(ccStartIndex, ccEndIndex);

const unwanted = [
  'COMMAND INTERFACE MATRIX',
  'Cybernetic Neural Command Center',
  'HOLO-NODE',
  '100% ONLINE',
  'AUDIO CORE: ARMED',
  'VECTOR RAG',
  'Quantum Latency',
  'Quantum latency',
  'IMAGE GROUNDING',
  'ACOUSTIC WAVE',
  'VOICE ROUTING',
  'AUTO EN/TA'
];

let foundUnwanted = [];
for (const phrase of unwanted) {
  if (ccSection.includes(phrase)) {
    foundUnwanted.push(phrase);
  }
}
console.log('Found unwanted phrases in Command Center:', foundUnwanted.length === 0 ? 'None (Clean!)' : foundUnwanted);

// Check for literal text "svg"
const svgLiteralMatches = ccSection.match(/>\s*svg\s*</i);
console.log('Literal "svg" text nodes:', svgLiteralMatches ? svgLiteralMatches : 'None found!');

// Check required 4 card titles, descriptions, buttons
const expectedContent = [
  'Academic Hub',
  'Your learning space for CBSE, SSLC and college.',
  'Open Academic Hub',
  'Knowledge Vault',
  'Search and explore your uploaded documents.',
  'Open Knowledge Vault',
  'Deck Studio',
  'Create presentations and export PPTX or PDF.',
  'Create Presentation',
  'J.A.R.V.I.S. Voice Assistant',
  'Talk to AURA in Tamil or English.',
  'Start Voice Assistant',
  'Your AI Workspace',
  'Everything you need to learn, create and explore.'
];

let missingContent = [];
for (const item of expectedContent) {
  if (!ccSection.includes(item)) {
    missingContent.push(item);
  }
}
console.log('Missing required content:', missingContent.length === 0 ? 'None (All exact text matches verified!)' : missingContent);
