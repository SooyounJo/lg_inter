const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

// API 키 로깅 (디버깅용)
console.log('GEMINI_API_KEY status:', process.env.GEMINI_API_KEY ? 'exists' : 'missing');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing in .env.local");
  module.exports.gemini = null;
} else {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    console.log('Gemini model initialized successfully');
    module.exports.gemini = model;
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
    module.exports.gemini = null;
  }
}

