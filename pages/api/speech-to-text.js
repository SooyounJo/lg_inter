import speech from '@google-cloud/speech'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get API key from environment or request
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY || req.body.apiKey

    if (!apiKey) {
      return res.status(400).json({ 
        error: 'Google Cloud API key is required',
        message: 'Please set GOOGLE_CLOUD_API_KEY in .env.local'
      })
    }

    // Initialize Google Cloud Speech client
    const client = new speech.SpeechClient({
      apiKey: apiKey,
    })

    const { audio } = req.body

    if (!audio) {
      return res.status(400).json({ error: 'Audio data is required' })
    }

    // Remove data URL prefix if present
    const audioData = audio.replace(/^data:audio\/\w+;base64,/, '')

    // Configure speech recognition request
    const request = {
      audio: {
        content: audioData,
      },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'ko-KR',
        alternativeLanguageCodes: ['en-US'],
        enableAutomaticPunctuation: true,
        model: 'latest_long',
      },
    }

    // Perform speech recognition
    const [response] = await client.recognize(request)
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n')

    console.log('Speech-to-Text 성공:', transcription)

    return res.status(200).json({ 
      transcript: transcription,
      confidence: response.results[0]?.alternatives[0]?.confidence || 0
    })

  } catch (error) {
    console.error('Speech-to-Text 오류:', error)
    return res.status(500).json({ 
      error: 'Speech recognition failed',
      details: error.message 
    })
  }
}
