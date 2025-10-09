import { useState, useEffect } from 'react';

export default function TypewriterText({ text, onComplete }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHighlight, setShowHighlight] = useState(false);

  useEffect(() => {
    if (!text) return;

    if (currentIndex < text.length) {
      // 알고리즘 설명일 경우 더 빠른 타이핑 속도 적용
      const isAlgorithm = text.includes('EMOTIONAL ANALYSIS ALGORITHM');
      const delay = isAlgorithm ? 
        (text[currentIndex] === '\n' ? 30 : 10) : // 알고리즘 설명은 매우 빠르게
        (text[currentIndex] === '\n' ? 300 : // 일반 텍스트는 기존 속도
         text[currentIndex] === '.' ? 200 :
         text[currentIndex] === '-' ? 100 :
         50);

      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      // 타이핑이 완료되면 하이라이트 효과 시작
      if (text.includes('SMART HOME DEVICE SETTINGS')) {
        setTimeout(() => {
          setShowHighlight(true);
        }, 500);
      }
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, onComplete]);

  // 텍스트가 변경되면 초기화
  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  // 스마트홈 디바이스 설정 부분을 찾아서 하이라이트 처리
  const renderText = () => {
    if (!displayText.includes('DEVICE SETTINGS')) {
      return displayText;
    }

    const parts = displayText.split('DEVICE SETTINGS');
    const settings = [
      'AIR COMFORT',
      'AIR PURIFY',
      'WARM LIGHT',
      'HEALING BGM',
      'REFRESH MODE'
    ];

    return (
      <>
        {parts[0]}
        DEVICE SETTINGS
        <div className={`device-settings ${showHighlight ? 'highlight' : ''}`}>
          {settings.map((setting, index) => (
            <div key={index} className="device-box" style={{ '--index': index }}>
              {setting}
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="typewriter-text">
      {renderText()}
      <style jsx>{`
        .typewriter-text {
          font-family: 'LG Smart', sans-serif;
          font-weight: 700;
          font-size: 24px;
          line-height: 1.6;
          white-space: pre-wrap;
          color: #ffffff;
          text-align: left;
          max-width: 80vw;
          margin: 0;
        }
        .device-settings {
          margin-top: 2em;
          display: flex;
          flex-direction: column;
          gap: 1em;
          align-items: flex-start;
          padding-left: 1em;
        }
        .device-box {
          display: block;
          color: #ffffff;
          padding: 0.6em 1.2em;
          opacity: 0;
          transform: translateY(20px);
          animation: boxFadeIn 0.4s ease-out forwards;
          animation-delay: calc(var(--index) * 0.15s);
          white-space: nowrap;
          font-size: 1em;
          font-weight: 500;
          letter-spacing: 0.05em;
          background: #FF00FF;
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.4);
          border-radius: 4px;
          backdrop-filter: blur(5px);
          width: auto;
          text-align: center;
        }
        @keyframes boxFadeIn {
          0% { 
            opacity: 0;
            transform: translateY(20px);
          }
          100% { 
            opacity: 0.9;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
