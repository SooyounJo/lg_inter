import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <div className="mobile-wrapper">
      <div className="mobile-frame">
        <Component {...pageProps} />
      </div>
    </div>
  )
}
