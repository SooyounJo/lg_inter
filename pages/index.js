import Head from 'next/head'
import UI from '../components/ui'

export default function Home() {
  return (
    <>
      <Head>
        <title>퓨론 (Furon) - LG 공감형 지능</title>
        <meta name="description" content="LG와 한국예술종합학교가 협력하여 개발한 공감형 지능 스마트홈 가이드" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <UI />
    </>
  )
}
