import { geminiClient } from '../../components/api/gemini'

// Next.js API 라우트 - Gemini API 프록시
export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Gemini 클라이언트를 통해 응답 생성
    const response = await geminiClient.generateResponse(message)

    return res.status(200).json({ 
      response,
      source: 'gemini'
    })

  } catch (error) {
    console.error('API 오류:', error)
    return res.status(500).json({ 
      error: error.message || '서버 오류가 발생했습니다.'
    })
  }
}
