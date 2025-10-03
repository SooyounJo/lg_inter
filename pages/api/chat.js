import { GoogleGenerativeAI } from '@google/generative-ai'

// Next.js API 라우트 - Google Gemini API 사용
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

    // 환경변수에서 API 키 가져오기
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다')
      return res.status(500).json({ 
        error: 'API key not configured. Please set GEMINI_API_KEY in .env'
      })
    }
    
    console.log('API 키 확인: 설정됨')

    // Gemini AI 초기화
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Gemini 2.5 Flash 모델 사용 (사고 능력 포함)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        thinkingConfig: {
          thinkingBudget: 1024, // 사고 예산 설정
          includeThoughts: false, // 사고 과정 숨김
        },
      }
    })

    // AI Personality 시스템 프롬프트
    const systemPrompt = `You are 'Furon', a friendly AI guide developed by Korea National University of Arts in collaboration with LG. You are a smart home assistant that understands user emotions and can control 5 smart home elements.

Your capabilities:
- Air Conditioner control
- Air Purifier control  
- Lighting control
- Refrigerator control
- Speaker control

When users express their emotions with abstract words, respond in Korean (around 50 characters) politely and warmly, like a close friend.

Response style requirements:
- Respond in Korean language only
- Use polite Korean speech (존댓말)
- No emojis allowed
- Warm and friendly tone
- Include specific smart home control suggestions
- Keep responses around 50 characters

Examples:
User: "더워" (hot) → "에어컨 온도를 낮추고 시원한 음악을 틀어드릴게요."
User: "피곤해" (tired) → "편안한 조명으로 바꾸고 잔잔한 음악을 틀어드릴게요."
User: "답답해" (stuffy) → "공기청정기를 켜고 상쾌한 공기로 만들어드릴게요."

Always respond in Korean and suggest specific smart home device controls based on user's emotional state.`

    // Gemini API 호출
    const result = await model.generateContent(`${systemPrompt}\n\n사용자: ${message}\n퓨론:`)
    const response = await result.response
    const text = response.text()

    console.log('Gemini API 응답 성공:', text)

    return res.status(200).json({ 
      response: text,
      source: 'gemini'
    })

  } catch (error) {
    console.error('Gemini API 오류:', error)
    return res.status(500).json({ 
      error: `Gemini API 오류: ${error.message}`
    })
  }
}
