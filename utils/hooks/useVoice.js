import { useState, useRef, useEffect } from 'react'

// 하이브리드 음성 인식 훅 (모바일: Web Speech API, 데스크톱: Google Cloud)
export const useVoiceRecognition = (onResult, onError) => {
  const [isListening, setIsListening] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Web Speech API (모바일용)
  const recognitionRef = useRef(null)
  
  // MediaRecorder (데스크톱 Google Cloud용)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
      
      // 모바일이면 Web Speech API 초기화
      if (mobile && typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'ko-KR'

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          if (transcript) {
            onResult(transcript)
          }
          setIsListening(false)
        }

        recognitionRef.current.onerror = (error) => {
          console.error('음성 인식 오류:', error)
          setIsListening(false)
          onError && onError(error)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
    
    checkMobile()
  }, [onResult, onError])

  // 음성 인식 시작 (모바일: Web Speech API)
  const startListeningMobile = () => {
    if (!recognitionRef.current) {
      onError && onError(new Error('이 브라우저는 음성 인식을 지원하지 않습니다.'))
      return false
    }

    try {
      recognitionRef.current.start()
      setIsListening(true)
      return true
    } catch (error) {
      console.error('음성 인식 시작 오류:', error)
      onError && onError(error)
      return false
    }
  }

  // 음성 인식 시작 (데스크톱: Google Cloud)
  const startListeningDesktop = async () => {
    try {
      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true
      })
      
      streamRef.current = stream
      audioChunksRef.current = []

      // MediaRecorder 설정
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm'
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        // 오디오 블롭 생성
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        
        // Base64로 변환
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = async () => {
          const base64Audio = reader.result

          try {
            console.log('🎤 Speech API 호출 시작')
            
            // API로 전송
            const response = await fetch('/api/speech-to-text', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ audio: base64Audio })
            })

            console.log('🎤 Speech API 응답:', response.status)
            
            const data = await response.json()
            console.log('🎤 Speech API 데이터:', data)

            if (response.ok && data.transcript) {
              console.log('✅ 음성 인식 성공:', data.transcript)
              onResult(data.transcript)
            } else {
              console.error('❌ 음성 인식 실패:', data.error || data.message)
              onError && onError(new Error(data.error || data.message || '음성 인식 실패'))
            }
          } catch (error) {
            console.error('❌ Speech-to-Text API 오류:', error)
            onError && onError(error)
          }
        }

        // 스트림 정리
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      // 녹음 시작
      mediaRecorderRef.current.start()
      setIsListening(true)
      return true

    } catch (error) {
      console.error('마이크 접근 오류:', error)
      onError && onError(error)
      setIsListening(false)
      return false
    }
  }

  // 음성 인식 시작 - Web Speech API 우선 사용
  const startListening = () => {
    // 브라우저가 Web Speech API를 지원하면 사용
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      if (!recognitionRef.current) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'ko-KR'

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          if (transcript) {
            onResult(transcript)
          }
          setIsListening(false)
        }

        recognitionRef.current.onerror = (error) => {
          console.error('음성 인식 오류:', error)
          setIsListening(false)
          onError && onError(error)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
      
      try {
        recognitionRef.current.start()
        setIsListening(true)
        return true
      } catch (error) {
        console.error('음성 인식 시작 오류:', error)
        onError && onError(error)
        return false
      }
    } else {
      // Web Speech API 미지원 시 Google Cloud 사용
      return startListeningDesktop()
    }
  }

  // 음성 인식 중지
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        setIsListening(false)
      } catch (error) {
        console.error('음성 인식 중지 오류:', error)
      }
    } else if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }
  }

  // 음성 인식 토글
  const toggleListening = () => {
    if (isListening) {
      stopListening()
      return false
    } else {
      return startListening()
    }
  }

  return {
    startListening,
    stopListening,
    toggleListening,
    isListening
  }
}
