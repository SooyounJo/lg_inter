import { useState, useEffect } from 'react'
import { useVoiceRecognition } from '../utils/hooks/useVoice'

export default function Test({ chatEnabled }) {
  const [voiceText, setVoiceText] = useState('')
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [sphereState, setSphereState] = useState('normal') // 'normal', 'clear', 'blurry-up'

  const handleVoiceResult = (transcript) => {
    setVoiceText(transcript)
    setIsVoiceActive(false)
    
    // 구 애니메이션 시퀀스 시작
    setSphereState('clear')
    
    // 1초 후 다시 블러 처리하며 상단으로 이동
    setTimeout(() => {
      setSphereState('blurry-up')
    }, 1000)
  }

  const handleVoiceError = (error) => {
    console.error('음성 인식 오류:', error)
    setIsVoiceActive(false)
  }

  const { toggleListening, isListening } = useVoiceRecognition(
    handleVoiceResult,
    handleVoiceError
  )

  const handleButtonClick = () => {
    if (!isListening) {
      setIsVoiceActive(true)
      const success = toggleListening()
      if (!success) {
        setIsVoiceActive(false)
      }
    } else {
      toggleListening()
      setIsVoiceActive(false)
    }
  }

  // 화면 전환이 완료된 후 버튼 애니메이션 지연 계산
  const getButtonAnimationDelay = () => {
    if (!chatEnabled) return '3s'
    
    // 백그라운드 전환(1s) + 구 등장(1.5s) = 2.5s 후에 버튼 나타남
    return '2.5s'
  }

  return (
    <>
      {/* 첫 번째 그라데이션 - 연장된 부분까지 포함 */}
      <div className={`background ${chatEnabled ? 'chat-enabled' : ''}`}></div>
      
      {/* 두 번째 그라데이션 - 제자리에서 오퍼시티만 조절 */}
      <div className={`background-secondary ${chatEnabled ? 'chat-enabled' : ''}`}></div>
      
      {/* 연한 핑크색 구 - 하단 기준 화면 6분의 1 지점까지 올라옴 */}
      <div className={`pink-sphere ${chatEnabled ? 'chat-enabled' : ''} ${sphereState}`}></div>
      
      {/* 메인 컨텐츠 */}
      <div className={`main ${chatEnabled ? 'chat-enabled' : ''}`}>
        {/* 인트로 섹션 */}
        <section className={`intro-overlay ${chatEnabled ? 'slide-up' : ''}`}>
        <div className="intro-content">
          <h1 className="intro-title">안녕하세요!</h1>
          <p className="intro-desc">오늘 하루,<br/>어떤 기분으로 보내셨나요?<br/>짧은 말로 표현해 주세요.</p>
        </div>
        <div className="swipe-zone" />
        {!chatEnabled && (
          <div className="swipe-hint">
            <div className="swipe-dots">
              <div className="swipe-dot" />
              <div className="swipe-dot delay1" />
              <div className="swipe-dot delay2" />
            </div>
            <div className="swipe-hint-text">아래에서 위로 스와이프</div>
          </div>
        )}
      </section>

      {/* 스와이프 후 핑크 블롭 제거 */}
      </div>
      
      {/* 음성 인식된 텍스트 표시 */}
      {chatEnabled && voiceText && (
        <div className="voice-text-display">
          {voiceText}
        </div>
      )}
      
      {/* 대화 버튼 - 2번째 화면 완료 후 나타남 */}
      <button 
        className={`conversation-button ${chatEnabled ? 'chat-enabled' : ''} ${isListening ? 'listening' : ''}`}
        style={{ animationDelay: getButtonAnimationDelay() }}
        onClick={handleButtonClick}
      >
        <div className="conversation-icon">
          <div className="conversation-line side"></div>
          <div className="conversation-line center"></div>
          <div className="conversation-line side"></div>
        </div>
      </button>
    </>
  )
}
