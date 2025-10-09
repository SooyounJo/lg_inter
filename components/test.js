export default function Test({ chatEnabled }) {
  return (
    <>
      {/* 배경은 고정된 뷰포트 전체 기준으로 유지 */}
      <div className={`background ${chatEnabled ? 'chat-enabled' : ''}`}></div>
      
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
    </>
  )
}
