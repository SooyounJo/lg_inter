import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>LG Inter Project</title>
        <meta name="description" content="Next.js와 React 프로젝트" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          LG Inter 프로젝트에 오신 것을 환영합니다!
        </h1>

        <p className={styles.description}>
          Next.js와 React로 구축된 프로젝트입니다.
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>시작하기 &rarr;</h2>
            <p>Next.js의 페이지 라우팅 시스템을 확인해보세요.</p>
          </div>

          <div className={styles.card}>
            <h2>컴포넌트 &rarr;</h2>
            <p>재사용 가능한 React 컴포넌트를 만들어보세요.</p>
          </div>

          <div className={styles.card}>
            <h2>스타일링 &rarr;</h2>
            <p>CSS 모듈을 사용한 스타일링을 경험해보세요.</p>
          </div>

          <div className={styles.card}>
            <h2>배포 &rarr;</h2>
            <p>Vercel을 통해 쉽게 배포할 수 있습니다.</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          LG Inter Project - Next.js & React
        </p>
      </footer>
    </div>
  )
}
