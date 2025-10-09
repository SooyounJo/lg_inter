export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_SPEECH_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
  const configured = apiKey !== undefined && apiKey !== null && apiKey !== '';
  
  return res.status(200).json({ 
    configured,
    message: configured ? 'Speech API is configured' : 'GOOGLE_SPEECH_API_KEY is missing'
  });
}

