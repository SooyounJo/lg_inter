import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Chat.module.css'

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "안녕하세요! 저는 LG Inter 챗봇입니다. 무엇을 도와드릴까요?", isBot: true, timestamp: new Date() }
  ])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // 음성 인식 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'ko-KR'

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
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

    // 간단한 응답 시스템 (API 대신 기본 응답)
    setTimeout(() => {
      const botResponse = getBotResponse(inputText)
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsProcessing(false)
    }, 1000)
  }

  // 기본 봇 응답 시스템(이거 곧 연결해야함)
  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase()
    
    if (input.includes('안녕') || input.includes('hello')) {
      return '안녕하세요! 반갑습니다! 😊'
    } else if (input.includes('날씨')) {
      return '죄송합니다. 현재는 날씨 정보를 제공할 수 없습니다. API를 연결하면 실시간 날씨를 알려드릴 수 있어요!'
    } else if (input.includes('시간') || input.includes('몇시')) {
      return `현재 시간은 ${new Date().toLocaleTimeString('ko-KR')}입니다.`
    } else if (input.includes('도움') || input.includes('help')) {
      return '저는 다음과 같은 기능을 제공합니다:\n• 인사말\n• 시간 확인\n• 간단한 대화\n\n더 많은 기능은 API 연결 후 사용 가능합니다!'
    } else if (input.includes('lg') || input.includes('엘지')) {
      return 'LG Inter 프로젝트에 오신 것을 환영합니다! 저는 이 프로젝트의 챗봇입니다.'
    } else {
      return `"${userInput}"에 대해 더 자세히 알고 싶습니다. API를 연결하면 더 정확한 답변을 드릴 수 있어요!`
    }
  }

  // 엔터키로 메시지 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>LG Inter 챗봇</title>
        <meta name="description" content="LG Inter 프로젝트 챗봇 테스트" />
      </Head>

      <div className={styles.chatContainer}>
        <div className={styles.header}>
          <h1>LG Inter 챗봇</h1>
          <p>음성 인식과 텍스트 입력을 지원합니다</p>
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
              placeholder="메시지를 입력하세요..."
              className={styles.textInput}
              rows={1}
            />
            <button
              onClick={toggleListening}
              className={`${styles.voiceButton} ${isListening ? styles.listening : ''}`}
              title={isListening ? '음성 인식 중지' : '음성 인식 시작'}
            >
              🎤
            </button>
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isProcessing}
              className={styles.sendButton}
            >
              📤
            </button>
          </div>
          <div className={styles.inputHint}>
            음성 인식을 사용하려면 마이크 권한이 필요합니다
          </div>
        </div>
      </div>
    </div>
  )
}
