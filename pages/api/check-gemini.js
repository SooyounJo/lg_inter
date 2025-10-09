const { gemini } = require("../../geminiClient.cjs");

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const configured = gemini !== null && gemini !== undefined;
  
  return res.status(200).json({ 
    configured,
    message: configured ? 'Gemini API is configured' : 'GEMINI_API_KEY is missing'
  });
}

