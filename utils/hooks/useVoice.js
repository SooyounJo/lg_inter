import { useRef, useEffect } from 'react'

// 음성 인식 훅
export const useVoiceRecognition = (onResult, onError) => {
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)

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
          onResult(finalTranscript)
          isListeningRef.current = false
        } else if (interimTranscript) {
          onResult(interimTranscript)
        }
      }

      recognitionRef.current.onerror = (error) => {
        console.error('음성 인식 오류:', error)
        isListeningRef.current = false
        onError && onError(error)
      }

      recognitionRef.current.onend = () => {
        isListeningRef.current = false
      }
    }
  }, [onResult, onError])

  // 음성 인식 시작
  const startListening = () => {
    if (!recognitionRef.current) {
      onError && onError(new Error('이 브라우저는 음성 인식을 지원하지 않습니다.'))
      return false
    }

    if (!isListeningRef.current) {
      try {
        recognitionRef.current.start()
        isListeningRef.current = true
        return true
      } catch (error) {
        console.error('음성 인식 시작 오류:', error)
        onError && onError(error)
        return false
      }
    }
    return false
  }

  // 음성 인식 중지
  const stopListening = () => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop()
      isListeningRef.current = false
    }
  }

  // 음성 인식 토글
  const toggleListening = () => {
    if (isListeningRef.current) {
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
    isListening: isListeningRef.current
  }
}
