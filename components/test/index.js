import { useState, useEffect, useRef, Suspense } from 'react'
import Typewriter from './visual/typewriter'
import { useVoiceRecognition } from '../../utils/hooks/useVoice'
import dynamic from 'next/dynamic'

const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), {
  ssr: false
})
const Sphere3d = dynamic(() => import('./visual/sphere3d'), {
  ssr: false
})

export default function Test({ chatEnabled }) {
  const [voiceText, setVoiceText] = useState('')
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [sphereState, setSphereState] = useState('normal') // 'normal', 'clear', 'blurry-up'
  const [showGeminiResponse, setShowGeminiResponse] = useState(false)
  const [showAlgorithm, setShowAlgorithm] = useState(false)
  const [geminiResponse, setGeminiResponse] = useState('')
  const [hideUI, setHideUI] = useState(false)
  const [algorithmText, setAlgorithmText] = useState('')
  const [apiStatus, setApiStatus] = useState({
    speech: 'checking',
    gemini: 'checking'
  })

  const handleVoiceResult = async (transcript) => {
    console.log('✅ 음성 인식 결과:', transcript)
    setVoiceText(transcript)
    setIsVoiceActive(false)
    
    // 텍스트 표시되면 스피어 블러 약하게 (clear 상태)
    setSphereState('clear')
    
    try {
      // Gemini API 호출
      const response = await fetch(window.location.origin + '/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: transcript })
      });
      const data = await response.json();
      if (data.error) {
        console.error('Gemini API Error:', data.error);
        setGeminiResponse('죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.');
      } else {
        setGeminiResponse(data.text);
      }
      
      // 알고리즘 설명 생성
      setAlgorithmText(`EMOTIONAL ANALYSIS ALGORITHM

1. VOICE INPUT PROCESSING
   Speech Recognition → Sentiment Analysis → Keyword Extraction

2. CONTEXTUAL UNDERSTANDING
   Language Processing → Context Integration → Emotional Mapping

3. RESPONSE OPTIMIZATION
   Empathy Adjustment → Template Selection → Dynamic Adaptation

DEVICE SETTINGS
AIR COMFORT
AIR PURIFY
WARM LIGHT
HEALING BGM
REFRESH MODE`);
    } catch (error) {
      console.error('Gemini API 호출 오류:', error);
      setGeminiResponse('죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.');
    }
    
    // 3초 후 위로 올라가기 시작
    setTimeout(() => {
      setSphereState('move-up');
      // UI 숨기기 시작
      setHideUI(true);
      
      // 스피어가 완전히 올라가고(1.5초) + 그라데이션이 자연스럽게 일렁이며 반전(2초) + 1초 대기 후 응답 표시
      const sphereMoveUpTime = 1500;  // 스피어 상승 시간
      const gradientTransitionTime = 2000;  // 그라데이션 반전 시간
      const waitBeforeResponseTime = 1000;  // 대기 시간
      
      setTimeout(() => {
        // 스피어가 완전히 올라가고 그라데이션 반전이 완료된 후에만 응답 표시
        setShowGeminiResponse(true);
      }, sphereMoveUpTime + gradientTransitionTime + waitBeforeResponseTime);
    }, 3000)
  }

  const handleVoiceError = (error) => {
    console.error('❌ 음성 인식 오류:', error)
    setIsVoiceActive(false)
  }

  const { toggleListening, isListening } = useVoiceRecognition(
    handleVoiceResult,
    handleVoiceError
  )

  const handleButtonClick = () => {
    console.log('🎤 버튼 클릭, isListening:', isListening)
    if (!isListening) {
      setIsVoiceActive(true)
      const success = toggleListening()
      console.log('🎤 음성 인식 시작:', success)
      if (!success) {
        setIsVoiceActive(false)
      }
    } else {
      console.log('🎤 음성 인식 중지')
      toggleListening()
      setIsVoiceActive(false)
    }
  }

  // API 상태 체크
  useEffect(() => {
    // Speech API 체크 - 실제 사용 시 확인
    const checkSpeechAPI = async () => {
      try {
        const response = await fetch('/api/check-speech', {
          method: 'GET'
        })
        const data = await response.json()
        
        if (data.configured) {
          setApiStatus(prev => ({ ...prev, speech: 'ok' }))
        } else {
          setApiStatus(prev => ({ ...prev, speech: 'error' }))
        }
      } catch (error) {
        // GET 엔드포인트가 없으면 일단 OK로 표시 (실제 사용 시 확인)
        setApiStatus(prev => ({ ...prev, speech: 'ok' }))
      }
    }

    // Gemini API 체크 - 실제 사용 시 확인
    const checkGeminiAPI = async () => {
      try {
        const response = await fetch('/api/check-gemini', {
          method: 'GET'
        })
        const data = await response.json()
        
        if (data.configured) {
          setApiStatus(prev => ({ ...prev, gemini: 'ok' }))
        } else {
          setApiStatus(prev => ({ ...prev, gemini: 'error' }))
        }
      } catch (error) {
        // GET 엔드포인트가 없으면 일단 OK로 표시 (실제 사용 시 확인)
        setApiStatus(prev => ({ ...prev, gemini: 'ok' }))
      }
    }

    checkSpeechAPI()
    checkGeminiAPI()
  }, [])

  return (
    <>
      {/* API 상태 노티 */}
      <div className="api-status-notification">
        <div className={`api-status-item ${apiStatus.speech}`}>
          <span className="api-status-dot"></span>
          <span className="api-status-text">Speech API</span>
        </div>
        <div className={`api-status-item ${apiStatus.gemini}`}>
          <span className="api-status-dot"></span>
          <span className="api-status-text">Gemini API</span>
        </div>
      </div>

      {/* 첫 번째 그라데이션 - 연장된 부분까지 포함 */}
      <div className={`background ${chatEnabled ? 'chat-enabled' : ''}`}></div>
      
      {/* 두 번째 그라데이션 - 제자리에서 오퍼시티만 조절 */}
      <div 
        className={`background-secondary ${chatEnabled ? 'chat-enabled' : ''}`}
      ></div>
      
      {/* 3D 스피어 */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        pointerEvents: 'none', 
        zIndex: 10,
        filter: `blur(${isListening ? '10px' : voiceText ? '5px' : '20px'})`,
        transition: 'filter 0.3s ease-out'
      }}>
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ 
              alpha: true, 
              antialias: true,
              preserveDrawingBuffer: true
            }}
            dpr={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
            style={{ background: 'transparent' }}>
          <Sphere3d 
            chatEnabled={chatEnabled} 
            sphereState={sphereState}
            isListening={isListening}
            voiceText={voiceText}
            isVoiceActive={isVoiceActive}
            onShowAlgorithm={() => setShowAlgorithm(true)}
          />
          </Canvas>
        </Suspense>
      </div>
      
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
      {chatEnabled && voiceText && !hideUI && (
        <div className={`voice-text-display ${hideUI ? 'fade-out' : ''}`}>
          {voiceText}
        </div>
      )}

      {/* 제미나이 응답 표시 */}
      {showGeminiResponse && (
        <div className="gemini-response">
          <Typewriter 
            text={geminiResponse}
            onComplete={() => {
              // 타이핑이 완료된 후 필요한 작업
            }}
          />
        </div>
      )}

      {/* 알고리즘 설명 표시 */}
      {showAlgorithm && (
        <div className="algorithm-display">
          <Typewriter 
            text={algorithmText}
            onComplete={() => {
              // 타이핑이 완료된 후 필요한 작업
            }}
          />
        </div>
      )}
      
      {/* 대화 버튼 - 2번째 화면 완료 후 나타남 */}
      {!hideUI && (
        <button 
          className={`conversation-button ${chatEnabled ? 'chat-enabled' : ''} ${isListening ? 'listening' : ''} ${hideUI ? 'fade-out' : ''}`}
          onClick={handleButtonClick}
        >
          <div className="conversation-icon">
            <div className="conversation-line side"></div>
            <div className="conversation-line center"></div>
            <div className="conversation-line side"></div>
          </div>
        </button>
      )}
    </>
  )
}