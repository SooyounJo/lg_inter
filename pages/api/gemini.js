const { gemini } = require("../../geminiClient.cjs");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Gemini client is initialized
  if (!gemini) {
    return res.status(500).json({ 
      error: 'Gemini API is not configured',
      message: 'Please set GEMINI_API_KEY in .env.local'
    });
  }

  try {
    const { prompt: userPrompt, message } = req.body;
    const inputText = userPrompt || message;

    if (!inputText) {
      return res.status(400).json({ error: 'Prompt or message is required' });
    }

    const { FURON_PERSONALITY } = require('../../utils/constant/prompt');
    const systemPrompt = FURON_PERSONALITY.getSystemPrompt();
    const result = await gemini.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `${systemPrompt}\n\nUser: ${inputText}`
        }]
      }]
    });
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: `Gemini API Error: ${error.message}` });
  }
}


