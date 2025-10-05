import { useState, useRef, useEffect } from 'react'
import styles from '../styles/1005css.module.css'
import { FURON_PERSONALITY } from '../utils/constant/prompt'
import { useVoiceRecognition } from '../utils/hooks/useVoice'

export default function UI() {
  const [messages, setMessages] = useState([
    { id: 1, text: FURON_PERSONALITY.greeting, isBot: true, timestamp: new Date() }
  ])
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiStatus, setApiStatus] = useState('🤖 Gemini API 연결 중...')
  const [isClient, setIsClient] = useState(false)
  const messagesEndRef = useRef(null)
  
  // 음성 인식 훅 사용
  const { toggleListening, isListening } = useVoiceRecognition(
    (transcript) => {
      setInputText(transcript)
      // 1초 후 자동으로 메시지 전송
      setTimeout(() => {
        if (transcript.trim()) {
          sendMessage()
        }
      }, 1000)
    },
    (error) => {
      console.error('음성 인식 오류:', error)
      alert(error.message)
    }
  )


  // 클라이언트 사이드 확인
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])


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
    const currentInput = inputText.trim().toLowerCase()
    setInputText('')
    setIsProcessing(true)

    // 첫 질문에 대한 알고리즘 응답
    const firstQuestionResponses = {
      '안녕': '안녕하세요! 저는 퓨론이에요. 오늘 기분은 어떠신가요?',
      '안녕하세요': '안녕하세요! 저는 퓨론이에요. 오늘 기분은 어떠신가요?',
      '하이': '안녕하세요! 저는 퓨론이에요. 오늘 기분은 어떠신가요?',
      'hello': '안녕하세요! 저는 퓨론이에요. 오늘 기분은 어떠신가요?',
      '누구': '저는 퓨론이에요! LG와 한국예술종합학교가 함께 만든 공감형 지능이에요.',
      '누구세요': '저는 퓨론이에요! LG와 한국예술종합학교가 함께 만든 공감형 지능이에요.',
      '소개': '안녕하세요! 저는 퓨론이에요. 스마트홈을 도와드리는 공감형 AI예요.',
      '소개해': '안녕하세요! 저는 퓨론이에요. 스마트홈을 도와드리는 공감형 AI예요.',
      '기능': '저는 에어컨, 공기청정기, 조명, 냉장고, 스피커를 조절할 수 있어요!',
      '뭐할수있어': '저는 에어컨, 공기청정기, 조명, 냉장고, 스피커를 조절할 수 있어요!',
      '도움': '어떤 기분이신지 말씀해주시면 맞춤 도움을 드릴게요!',
      '도와줘': '어떤 기분이신지 말씀해주시면 맞춤 도움을 드릴게요!'
    }

    // 첫 질문 체크 (사용자 메시지가 2개 이하일 때)
    if (messages.length <= 2) {
      const response = firstQuestionResponses[currentInput] || 
                      firstQuestionResponses[Object.keys(firstQuestionResponses).find(key => currentInput.includes(key))]
      
      if (response) {
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            text: response,
            isBot: true,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, botMessage])
          setIsProcessing(false)
        }, 800)
        return
      }
    }

    // API 호출 함수
    try {
      const response = await callFuronAPI(currentInput)
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
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        <div className={styles.header}>
          <h1>{FURON_PERSONALITY.name}</h1>
          <p>{FURON_PERSONALITY.description}</p>
        </div>

        <div className={styles.messages}>
          {/* Background GIF Animation inside chat */}
          <img 
            src="/aichatanimation-unscreen.gif"
            alt=""
            className={styles.backgroundVideo}
          />
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

      <div className={styles.input}>
        <div className={styles.wrapper}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={FURON_PERSONALITY.placeholder}
            className={styles.textarea}
            rows={1}
          />
          <button
            onClick={toggleListening}
            className={`${styles.voice} ${isListening ? styles.listening : ''}`}
            title={isListening ? '음성 인식 중지' : '음성 인식 시작'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isProcessing}
            className={styles.send}
            title="전송"
          >
            ➤
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
