import { useListenerCount, useISTClock } from '../hooks/useTimePlaylist'
import './EntryGate.css'

export default function EntryGate({ onEnter }) {
  const listenerCount = useListenerCount()
  const istTime = useISTClock()

  return (
    <div className="entry-gate">
      {/* Full-screen artwork background */}
      <img
        src="/Aagman Background.png"
        alt="Ganeshotsav 2026 Celebration"
        className="entry-bg"
      />

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Dark gradient for legibility */}
      <div className="entry-vignette" />

      {/* Top status bar */}
      <div className="entry-topbar">
        <div className="entry-clock">
          <span className="clock-dot" />
          <span>{istTime} · IST</span>
        </div>
        <div className="entry-listeners">
          <span className="listeners-dot" />
          <span>{listenerCount.toLocaleString('en-IN')} celebrating</span>
        </div>
      </div>

      {/* Central CTA card */}
      <div className="entry-card">
        <div className="entry-om">ॐ</div>

        <div className="entry-brand">
          <h1 className="entry-title">GANESHOTSAV RADIO 2026</h1>
          <p className="entry-subtitle">गणेशोत्सव रेडिओ २०२६</p>
        </div>

        <div className="entry-now-playing">
          <span className="entry-now-label">Now playing on air</span>
          <div className="entry-playlist-name">
            <span className="entry-playlist-emoji">🌺</span>
            <span className="entry-playlist-hindi">Ganeshotsav Vibes</span>
          </div>
          <p className="entry-playlist-desc">
            Non-stop Ganpati devotional classics, iconic Aartis, and celebratory tracks.
          </p>
          <p className="entry-time-range">Live 24x7 Festival Radio</p>
        </div>

        <button className="entry-btn" onClick={onEnter} aria-label="Enter Ganeshotsav 2026">
          <span className="entry-btn-main">Enter Ganeshotsav 2026</span>
          <span className="entry-btn-sub">· बाप्पाच्या उत्सवात सहभागी व्हा ·</span>
        </button>

        <p className="entry-hint">Spacebar toggles play/pause · Select Dhol Tasha beat anytime</p>
      </div>
    </div>
  )
}


