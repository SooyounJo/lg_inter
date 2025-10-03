import { useState, useRef, useEffect } from 'react'
import styles from '../styles/Chat.module.css'
import { FURON_PERSONALITY } from './AIPersonality'

export default function FuronAI() {
  const [messages, setMessages] = useState([
    { id: 1, text: FURON_PERSONALITY.greeting, isBot: true, timestamp: new Date() }
  ])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiStatus, setApiStatus] = useState('🤖 Gemini API 연결 중...')
  const [isClient, setIsClient] = useState(false)
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

  // 클라이언트 사이드 확인
  useEffect(() => {
    setIsClient(true)
  }, [])

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


  // AI API 호출 (모든 응답을 AI가 처리)
  const callFuronAPI = async (message) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          context: FURON_PERSONALITY.getSystemPrompt()
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('AI API 오류:', data)
        return FURON_PERSONALITY.errorMessages.apiError
      }
      
      if (data.response) {
        return data.response
      } else {
        return FURON_PERSONALITY.errorMessages.apiError
      }
    } catch (error) {
      console.error('AI API 호출 오류:', error)
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

  // AI API 상태 체크
  useEffect(() => {
    // AI API 상태 확인
    fetch('/api/chat', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'test'
      })
    })
      .then(response => {
        if (response.ok) {
          setApiStatus('✅ Gemini API 연결됨')
        } else {
          setApiStatus('⚠️ Gemini API 설정 필요')
        }
      })
      .catch(() => {
        setApiStatus('⚠️ Gemini API 설정 필요')
      })
  }, [])

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <h1>{FURON_PERSONALITY.name}</h1>
        <p>{FURON_PERSONALITY.description}</p>
        <div className={styles.apiKeyControls}>
          <span className={styles.apiKeyStatus}>{apiStatus}</span>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${message.isBot ? styles.botMessage : styles.userMessage}`}
          >
            <div className={styles.messageContent}>
              <div className={styles.messageText}>{message.text}</div>
              <div className={styles.messageTime}>
                {isClient ? message.timestamp.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : '--:--'}
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
