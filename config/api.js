// API 설정 파일
export const API_CONFIG = {
  // Google Studio AI API 설정
  googleAI: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-1.5-flash'
  }
}

// API 키 유효성 검사
export const validateApiKey = (apiKey) => {
  return apiKey && apiKey.trim().length > 0
}

// Google AI API 엔드포인트 생성
export const getGoogleAIEndpoint = () => {
  return `${API_CONFIG.googleAI.baseURL}/models/${API_CONFIG.googleAI.model}:generateContent`
}
