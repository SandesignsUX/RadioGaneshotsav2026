import { useState } from 'react'
import {
  X,
  ListMusic,
  Radio,
  Info,
  Share2,
  Play,
  Check,
  ExternalLink,
  Music2,
  Sparkles
} from 'lucide-react'
import { getAllPlaylists, YOUTUBE_PLAYLIST_URL } from '../data/playlists'
import { FESTIVAL_PHASES } from '../data/phases'
import './Drawer.css'

export default function Drawer({
  isOpen,
  onClose,
  ytPlayer,
  activePlaylist,
  currentPhase,
  onSelectPlaylist,
  onSelectTrack
}) {
  const [activeTab, setActiveTab] = useState('queue')
  const [copied, setCopied] = useState(false)

  const allPlaylists = getAllPlaylists()
  const { isPlaying, trackIndex, currentTrack, tracks } = ytPlayer

  const handleCopyLink = () => {
    const url = window.location.origin
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🌺 गणपती बाप्पा मोरया! Listen to non-stop Ganeshotsav songs & Dhol Tasha live on Ganeshotsav Radio 2026:\n${window.location.origin}`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`drawer-container ${isOpen ? 'open' : ''}`}>
        {/* Drawer Top Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h2 className="drawer-title">Ganeshotsav Radio</h2>
            <span className="drawer-subtitle">
              {currentPhase?.emoji} {currentPhase?.name} · Songs & Queue
            </span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="drawer-nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <ListMusic size={16} />
            <span>Song Queue</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'playlists' ? 'active' : ''}`}
            onClick={() => setActiveTab('playlists')}
          >
            <Radio size={16} />
            <span>Playlists</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Info size={16} />
            <span>About</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => setActiveTab('share')}
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </nav>

        {/* Drawer Body Content */}
        <div className="drawer-content">
          {/* TAB 1: Song Queue */}
          {activeTab === 'queue' && (
            <div className="tab-pane queue-pane">
              <div className="queue-header-banner">
                <div className="queue-meta">
                  <span className="queue-badge">
                    <Sparkles size={12} /> YouTube Playlist
                  </span>
                  <h3 className="queue-playlist-title">
                    {activePlaylist?.emoji} {activePlaylist?.nameHindi || activePlaylist?.name}
                  </h3>
                  <p className="queue-playlist-desc">
                    {tracks.length} devotional songs queued
                  </p>
                </div>
                <a
                  href={activePlaylist?.url || YOUTUBE_PLAYLIST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="yt-source-link"
                  title="Open YouTube Playlist"
                >
                  <span>YouTube</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="track-list">
                {tracks.map((track, idx) => {
                  const isCurrent = idx === trackIndex
                  return (
                    <div
                      key={track.id || track.youtubeId || idx}
                      className={`track-item ${isCurrent ? 'active' : ''}`}
                      onClick={() => onSelectTrack(idx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') onSelectTrack(idx)
                      }}
                    >
                      <div className="track-item-left">
                        <div className="track-index">
                          {isCurrent ? (
                            <div className={`drawer-eq ${isPlaying ? 'playing' : ''}`}>
                              <span /><span /><span />
                            </div>
                          ) : (
                            <span className="index-num">{idx + 1}</span>
                          )}
                          <Play size={14} className="hover-play-icon" />
                        </div>

                        <div className="track-text">
                          <h4 className="track-item-title">
                            {track.titleHindi || track.title}
                          </h4>
                          <span className="track-item-sub">
                            {track.title !== track.titleHindi && track.title}
                          </span>
                          <span className="track-item-artist">
                            {track.artist}
                          </span>
                        </div>
                      </div>

                      <div className="track-item-right">
                        {isCurrent && isPlaying && (
                          <div className="track-playing-indicator">
                            <span /><span /><span />
                          </div>
                        )}
                        <span className="track-duration">{track.durationHint}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Playlists */}
          {activeTab === 'playlists' && (
            <div className="tab-pane playlists-pane">
              <p className="pane-intro">
                All 4 official festival playlists are streaming live 24x7:
              </p>
              <div className="playlists-grid">
                {allPlaylists.map((pl) => {
                  const isSelected = activePlaylist?.id === pl.id
                  return (
                    <div
                      key={pl.id}
                      className={`playlist-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => onSelectPlaylist(pl)}
                    >
                      <div className="playlist-card-top">
                        <span className="playlist-emoji">{pl.emoji}</span>
                        <span className="playlist-time">{pl.timeRange}</span>
                      </div>
                      <h4 className="playlist-card-title">{pl.nameHindi}</h4>
                      <p className="playlist-card-sub">{pl.name} · {pl.subtitleHindi || pl.subtitle}</p>
                      <p className="playlist-card-desc">{pl.description}</p>
                      <div className="playlist-card-footer">
                        <span className="tracks-count">
                          <Music2 size={13} /> {pl.tracks.length} Songs
                        </span>
                        <div className="playlist-footer-actions">
                          <span className={`now-active-pill ${isSelected ? 'active' : ''}`}>
                            {isSelected ? 'Playing Live 🔴' : 'Play Playlist ▶'}
                          </span>
                          <a
                            href={pl.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="playlist-yt-link"
                            onClick={(e) => e.stopPropagation()}
                            title={`Open ${pl.name} on YouTube`}
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 3: About */}
          {activeTab === 'about' && (
            <div className="tab-pane about-pane">
              <div className="about-hero">
                <div className="about-om">ॐ</div>
                <h3>Ganeshotsav Radio 2026</h3>
                <p className="about-tagline">
                  संपूर्ण गणेशोत्सव २०२६ · Non-stop live stream & Dhol Tasha
                </p>
              </div>

              {/* Music Categories */}
              <div className="about-section">
                <h4>🎶 4 Music Categories</h4>
                <div className="about-phases-list">
                  {FESTIVAL_PHASES.map((p) => (
                    <div key={p.id} className="about-phase-item">
                      <div className="about-phase-header">
                        <span className="about-phase-emoji">{p.emoji}</span>
                        <strong className="about-phase-name">{p.name}</strong>
                      </div>
                      <p className="about-phase-desc">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dhol Tasha Instruments */}
              <div className="about-section">
                <h4>🥁 Live Dhol Tasha & Folk Instruments</h4>
                <p>
                  Switch instantly to authentic Maharashtrian percussion:
                </p>
                <ul className="about-dhol-list">
                  <li><strong>Puneri Dhol Tasha</strong> – महानाद व जलद ताशा ठेका</li>
                  <li><strong>Nashik Dhol</strong> – ताशेरी जुगलबंदी व डान्स ठेका</li>
                  <li><strong>Kaavdi</strong> – झांज निनाद व ताशा साथ</li>
                  <li><strong>Halgi</strong> – संबळ व हलगीचा कडकडाट</li>
                </ul>
              </div>

              {/* YouTube Playlist Source */}
              <div className="about-section">
                <h4>🌺 Verified YouTube Playlist</h4>
                <p>
                  Featuring 13 iconic Marathi devotional songs directly streamed from the official YouTube playlist.
                </p>
                <a
                  href={YOUTUBE_PLAYLIST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-link-btn"
                >
                  <ExternalLink size={15} />
                  <span>View Playlist on YouTube</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: Share */}
          {activeTab === 'share' && (
            <div className="tab-pane share-pane">
              <div className="share-icon-wrap">
                <Share2 size={32} />
              </div>
              <h3>Share Ganeshotsav 2026</h3>
              <p>Bring the festive energy of Bappa's celebration to your family and friends.</p>

              <div className="share-actions">
                <button
                  className="share-btn whatsapp-btn"
                  onClick={handleWhatsAppShare}
                >
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  className={`share-btn copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={18} />
                      <span>Copy Radio Link</span>
                    </>
                  )}
                </button>
              </div>

              <div className="share-preview-box">
                <span className="preview-label">Now Playing</span>
                <p className="preview-track">
                  {currentTrack?.titleHindi || currentTrack?.title || 'Ganpati Bhajans'}
                </p>
                <span className="preview-artist">{currentTrack?.artist}</span>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <p>Ganeshotsav Radio 2026</p>
          <span className="credit">गणपती बाप्पा मोरया, पुढच्या वर्षी लवकर या!</span>
        </div>
      </aside>
    </>
  )
}
