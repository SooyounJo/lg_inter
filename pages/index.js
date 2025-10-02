import Head from 'next/head'
import ChatBot from '../components/ChatBot'
import styles from '../styles/Chat.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>LG Inter 챗봇</title>
        <meta name="description" content="LG Inter 프로젝트 챗봇" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <ChatBot />
    </div>
  )
}
