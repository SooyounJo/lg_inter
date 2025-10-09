import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import Test from '../components/test'

export default function Home() {
  const [chatEnabled, setChatEnabled] = useState(false)
  // stage는 현재 사용하지 않으므로 제거
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
      }
    }
    const onMouseUp = () => {
      startYRef.current = null
    }
    const onWheel = (e) => {
      if (e.deltaY < -40) return
      if (e.deltaY > 60) {
        setChatEnabled(true)
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
    return () => {
      body.classList.remove('chat-enabled')
    }
  }, [chatEnabled])

  return (
    <>
      <Head>
        <title>퓨론 (Furon) - LG 공감형 지능</title>
        <meta name="description" content="LG와 한국예술종합학교가 협력하여 개발한 공감형 지능 스마트홈 가이드" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <main style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Test chatEnabled={chatEnabled} />
      </main>
    </>
  )
}
