import { GoogleGenerativeAI } from '@google/generative-ai'

// Gemini API 클라이언트
export class GeminiClient {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY
    this.genAI = null
    this.model = null
    
    if (this.apiKey) {
      this.initialize()
    }
  }

  initialize() {
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey)
      
      // Gemini 2.5 Flash 모델 사용 (사고 능력 포함)
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          thinkingConfig: {
            thinkingBudget: 1024, // 사고 예산 설정
            includeThoughts: false, // 사고 과정 숨김
          },
        }
      })
    } catch (error) {
      console.error('Gemini 초기화 오류:', error)
    }
  }

  // AI Personality 시스템 프롬프트
  getSystemPrompt() {
    return `You are 'Furon', a friendly AI guide developed by Korea National University of Arts in collaboration with LG. You are a smart home assistant that understands user emotions and can control 5 smart home elements.

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
  }

  // 메시지 생성
  async generateResponse(message) {
    if (!this.model) {
      throw new Error('Gemini API가 초기화되지 않았습니다. API 키를 확인해주세요.')
    }

    try {
      const systemPrompt = this.getSystemPrompt()
      const prompt = `${systemPrompt}\n\n사용자: ${message}\n퓨론:`
      
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log('Gemini API 응답 성공:', text)
      return text

    } catch (error) {
      console.error('Gemini API 오류:', error)
      throw new Error(`Gemini API 오류: ${error.message}`)
    }
  }

  // API 키 상태 확인
  isConfigured() {
    return !!this.apiKey && !!this.model
  }
}

// 싱글톤 인스턴스
export const geminiClient = new GeminiClient()
