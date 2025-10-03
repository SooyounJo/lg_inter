import { useState, useRef, useEffect } from 'react'
import styles from '../styles/Chat.module.css'
import { FURON_PERSONALITY } from './AIPersonality'
import { API_CONFIG, validateApiKey, getGoogleAIEndpoint } from '../config/api'

export default function FuronAI() {
  const [messages, setMessages] = useState([
    { id: 1, text: FURON_PERSONALITY.greeting, isBot: true, timestamp: new Date() }
  ])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiKey, setApiKey] = useState(API_CONFIG.googleAI.apiKey || '')
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // 음성 인식 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true  // 중간 결과 허용
      recognitionRef.current.lang = 'ko-KR'

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setInputText(finalTranscript)
          setIsListening(false)
        } else if (interimTranscript) {
          setInputText(interimTranscript)
        }
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        // 1초 후 자동으로 메시지 전송
        setTimeout(() => {
          if (inputText.trim()) {
            sendMessage()
          }
        }, 1000)
      }
    }
  }, [inputText])

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 음성 인식 시작/중지
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // 메시지 전송
  const sendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsProcessing(true)

    // API 호출 함수
    try {
      const response = await callFuronAPI(inputText)
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "죄송합니다. 일시적인 오류가 발생했습니다.",
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  // 자기소개 관련 질문 처리
  const isSelfIntroductionQuery = (message) => {
    const lowerMessage = message.toLowerCase()
    const selfIntroKeywords = [
      '누구', '뭐야', '소개', '이름', '뭐하는', '무엇', '역할', 
      '누군', '정체', '퓨론', 'furion', 'furion', '당신'
    ]
    return selfIntroKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  // 자기소개 응답 생성
  const generateSelfIntroduction = () => {
    return `안녕하세요! 저는 퓨론이에요. 한국예술종합학교와 LG가 함께 만든 공감형 지능 스마트홈 가이드입니다. 사용자님의 감정을 이해하고 에어컨, 공기청정기, 조명, 냉장고, 스피커를 제어해서 더 편안한 환경을 만들어드려요.`
  }

  // Google Studio API 호출 함수
  const callFuronAPI = async (message) => {
    if (!validateApiKey(apiKey)) {
      return FURON_PERSONALITY.errorMessages.noApiKey
    }

    // 자기소개 질문이면 알고리즘으로 응답
    if (isSelfIntroductionQuery(message)) {
      return generateSelfIntroduction()
    }

    try {
      const response = await fetch(`${getGoogleAIEndpoint()}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${FURON_PERSONALITY.getSystemPrompt()}

사용자 메시지: "${message}"

퓨론으로서 응답해주세요.`
            }]
          }]
        })
      })

      const data = await response.json()
      
      // API 응답 디버깅
      console.log('API 응답:', data)
      
      if (!response.ok) {
        console.error('API 오류 응답:', data)
        if (data.error) {
          return `API 오류: ${data.error.message || '알 수 없는 오류입니다.'}`
        }
        return `HTTP 오류 ${response.status}: ${response.statusText}`
      }
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text
      } else {
        console.error('예상치 못한 응답 구조:', data)
        return FURON_PERSONALITY.errorMessages.apiError
      }
    } catch (error) {
      console.error('API 호출 오류:', error)
      return FURON_PERSONALITY.errorMessages.connectionError
    }
  }

  // 엔터키로 메시지 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // API 키 설정 토글
  const [showApiKey, setShowApiKey] = useState(false)

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <h1>{FURON_PERSONALITY.name}</h1>
        <p>{FURON_PERSONALITY.description}</p>
        <button 
          className={styles.apiKeyButton}
          onClick={() => setShowApiKey(!showApiKey)}
        >
          API 설정
        </button>
      </div>

      {showApiKey && (
        <div className={styles.apiKeySection}>
          <input
            type="password"
            placeholder="Google Studio API 키를 입력하세요"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className={styles.apiKeyInput}
          />
          <button 
            onClick={() => setShowApiKey(false)}
            className={styles.closeButton}
          >
            닫기
          </button>
        </div>
      )}

      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${message.isBot ? styles.botMessage : styles.userMessage}`}
          >
            <div className={styles.messageContent}>
              <div className={styles.messageText}>{message.text}</div>
              <div className={styles.messageTime}>
                {message.timestamp.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className={`${styles.message} ${styles.botMessage}`}>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={FURON_PERSONALITY.placeholder}
            className={styles.textInput}
            rows={1}
          />
          <button
            onClick={toggleListening}
            className={`${styles.voiceButton} ${isListening ? styles.listening : ''}`}
            title={isListening ? '음성 인식 중지' : '음성 인식 시작'}
          >
            음성
          </button>
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isProcessing}
            className={styles.sendButton}
          >
            전송
          </button>
        </div>
        <div className={styles.inputHint}>
          음성 인식을 사용하려면 마이크 권한이 필요합니다
        </div>
      </div>
    </div>
  )
}
