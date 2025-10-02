import styles from '../styles/Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.logo}>
          LG Inter
        </h1>
        <nav className={styles.nav}>
          <a href="/" className={styles.navLink}>홈</a>
          <a href="/about" className={styles.navLink}>소개</a>
          <a href="/contact" className={styles.navLink}>연락처</a>
        </nav>
      </div>
    </header>
  )
}
