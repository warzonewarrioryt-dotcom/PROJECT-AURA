const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const OpenAI = require('openai');

// 1x1 transparent png base64
const samplePngBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

async function testGroqVision() {
  console.log('Testing Groq Vision...');
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return console.log('Groq: No API Key');
  const client = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1', timeout: 15000 });

  // Test vision models on Groq
  const models = ['llama-3.2-11b-vision-preview', 'llama-3.2-90b-vision-preview'];
  for (const model of models) {
    try {
      console.log(`Trying Groq model: ${model}...`);
      const res = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe what you see in this image in one brief sentence.' },
              { type: 'image_url', image_url: { url: samplePngBase64 } }
            ]
          }
        ],
        max_tokens: 100
      });
      console.log(`[GROQ SUCCESS] Model ${model} responded:`, res.choices[0]?.message?.content);
      return { success: true, model };
    } catch (err) {
      console.log(`[GROQ FAIL] Model ${model}:`, err.message);
    }
  }
}

async function testNvidiaVision() {
  console.log('\nTesting NVIDIA NIM Vision...');
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return console.log('NVIDIA: No API Key');
  const client = new OpenAI({ apiKey, baseURL: 'https://integrate.api.nvidia.com/v1', timeout: 15000 });

  const models = ['meta/llama-3.2-11b-vision-instruct', 'nvidia/neva-22b'];
  for (const model of models) {
    try {
      console.log(`Trying NVIDIA model: ${model}...`);
      const res = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe what you see in one brief sentence.' },
              { type: 'image_url', image_url: { url: samplePngBase64 } }
            ]
          }
        ],
        max_tokens: 100
      });
      console.log(`[NVIDIA SUCCESS] Model ${model} responded:`, res.choices[0]?.message?.content);
      return { success: true, model };
    } catch (err) {
      console.log(`[NVIDIA FAIL] Model ${model}:`, err.message);
    }
  }
}

async function testOpenAiVision() {
  console.log('\nTesting OpenAI Vision...');
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return console.log('OpenAI: No API Key');
  const client = new OpenAI({ apiKey, timeout: 10000 });
  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe what you see.' },
            { type: 'image_url', image_url: { url: samplePngBase64 } }
          ]
        }
      ],
      max_tokens: 100
    });
    console.log('[OPENAI SUCCESS]:', res.choices[0]?.message?.content);
  } catch (err) {
    console.log('[OPENAI FAIL]:', err.message);
  }
}

async function run() {
  await testGroqVision();
  await testNvidiaVision();
  await testOpenAiVision();
}

run();
