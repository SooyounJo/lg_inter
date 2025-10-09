import Head from 'next/head'
// 임시로 빈 배경만 표시합니다.

import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [chatEnabled, setChatEnabled] = useState(false)
  const [stage, setStage] = useState(0) // 0: 기본, 1: 이미지1, 2: 이미지2
  const startYRef = useRef(null)
  const movedRef = useRef(false)

  useEffect(() => {
    const el = document.documentElement
    const onTouchStart = (e) => {
      movedRef.current = false
      startYRef.current = e.touches?.[0]?.clientY ?? 0
    }
    const onTouchMove = (e) => {
      movedRef.current = true
      const currentY = e.touches?.[0]?.clientY ?? 0
      const delta = (startYRef.current ?? currentY) - currentY
      if (delta > 50) {
        setChatEnabled(true)
        setStage((s) => Math.min(2, s + 1))
      }
    }
    // Mouse drag support for desktop dev
    const onMouseDown = (e) => {
      movedRef.current = false
      startYRef.current = e.clientY
    }
    const onMouseMove = (e) => {
      if (startYRef.current == null) return
      movedRef.current = true
      const currentY = e.clientY
      const delta = (startYRef.current ?? currentY) - currentY
      if (delta > 50) {
        setChatEnabled(true)
        setStage((s) => Math.min(2, s + 1))
      }
    }
    const onMouseUp = () => {
      startYRef.current = null
    }
    const onWheel = (e) => {
      if (e.deltaY < -40) return
      if (e.deltaY > 60) {
        setChatEnabled(true)
        setStage((s) => Math.min(2, s + 1))
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: true })
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseup', onMouseUp)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  // body 클래스 토글로 밝기/이동/그라디언트 단계 상태를 전역 적용
  useEffect(() => {
    if (typeof document === 'undefined') return
    const body = document.body
    if (chatEnabled) body.classList.add('chat-enabled')
    else body.classList.remove('chat-enabled')
    body.classList.toggle('gradient-stage1', stage >= 1)
    body.classList.toggle('gradient-stage2', stage >= 2)
    return () => {
      body.classList.remove('chat-enabled')
      body.classList.remove('gradient-stage1')
      body.classList.remove('gradient-stage2')
    }
  }, [chatEnabled, stage])

  return (
    <>
      <Head>
        <title>퓨론 (Furon) - LG 공감형 지능</title>
        <meta name="description" content="LG와 한국예술종합학교가 협력하여 개발한 공감형 지능 스마트홈 가이드" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <main style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div className="bloom-layer" />
        <div className="aurora-layer" />
        <section className="intro-overlay">
          <h1 className="intro-title">안녕하세요!</h1>
          <p className="intro-desc">오늘 하루,<br/>어떤 기분으로 보내셨나요?<br/>짧은 말로 표현해 주세요.</p>
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

        {chatEnabled && (
          <div className="pink-blob-wrap">
            <div className="pink-blob" />
          </div>
        )}
      </main>
    </>
  )
}
