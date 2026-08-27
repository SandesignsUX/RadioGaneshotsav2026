import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Minus,
  Volume2,
  ListMusic,
  ChevronUp,
  RotateCcw
} from 'lucide-react'
import { DHOL_INSTRUMENTS } from '../data/dholInstruments'
import './Player.css'

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function Player({
  ytPlayer,
  dholAudio,
  onMinimize,
  onOpenDrawer
}) {
  const [isDholMenuOpen, setIsDholMenuOpen] = useState(false)
  const dholMenuRef = useRef(null)

  const {
    isPlaying,
    isBuffering,
    currentTrack,
    currentTime,
    duration,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    pause: pauseSong,
    play: playSong
  } = ytPlayer

  const {
    activeDhol,
    isDholPlaying,
    playDhol,
    stopDhol,
    setDholVolume
  } = dholAudio || {}

  // Close Dhol dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dholMenuRef.current && !dholMenuRef.current.contains(e.target)) {
        setIsDholMenuOpen(false)
      }
    }
    if (isDholMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDholMenuOpen])

  const progress = duration ? (currentTime / duration) * 100 : 0

  const handleProgressClick = (e) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    seek(ratio * duration)
  }

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (setDholVolume) setDholVolume(val)
  }

  // When user selects a Dhol option:
  // Pause the current song, and start continuous loop of chosen dhol option
  const handleSelectDhol = (instrument) => {
    if (isDholPlaying && activeDhol?.id === instrument.id) {
      // Toggle off and resume song
      stopDhol()
      playSong()
    } else {
      pauseSong()
      playDhol(instrument)
    }
    setIsDholMenuOpen(false)
  }

  // To get out of the loop: play the paused song
  const handlePlaySong = () => {
    if (isDholPlaying) {
      stopDhol()
    }
    playSong()
  }

  const handleMainPlayToggle = () => {
    if (isDholPlaying) {
      // Stop dhol loop and resume the paused song
      stopDhol()
      playSong()
    } else {
      togglePlay()
    }
  }

  const handlePrev = () => {
    if (isDholPlaying) {
      stopDhol()
    }
    prev()
  }

  const handleNext = () => {
    if (isDholPlaying) {
      stopDhol()
    }
    next()
  }

  return (
    <div className="player-container">
      <div className="player-glass">

        {/* Left — Song Track Info & Equalizer */}
        <div className="player-info">
          <div className={`equalizer ${isPlaying ? 'playing' : ''}`}>
            <span /><span /><span /><span />
          </div>

          <div className="track-details">
            {currentTrack ? (
              <>
                <h3 className="track-title" title={currentTrack.titleHindi || currentTrack.title}>
                  {isBuffering ? 'Loading…' : (currentTrack.titleHindi || currentTrack.title)}
                </h3>
                <p className="track-artist" title={currentTrack.artist}>
                  {currentTrack.artist}
                </p>
              </>
            ) : (
              <h3 className="track-title">Ganeshotsav Radio 2026</h3>
            )}
          </div>
        </div>

        {/* Center — Controls + Dhol Dropdown */}
        <div className="player-controls-section">

          {/* Left of Controls: Dhol Tasha Upwards Dropdown */}
          <div className="dhol-dropdown-wrapper" ref={dholMenuRef}>
            <button
              className={`dhol-trigger-btn ${isDholPlaying ? 'active-dhol' : ''}`}
              onClick={() => setIsDholMenuOpen(prev => !prev)}
              title="Continuous Dhol Tasha Loop (पुणेरी, नाशिक, कावडी, हलगी)"
              aria-label="Dhol Tasha Instrumental Dropdown"
            >
              <span className="dhol-trigger-emoji">{isDholPlaying ? activeDhol?.emoji : '🥁'}</span>
              <span className="dhol-trigger-text">
                {isDholPlaying ? `${activeDhol?.nameHindi}` : 'ढोल ताशा'}
              </span>
              {isDholPlaying && <span className="dhol-loop-dot" title="Dhol loop active" />}
              <ChevronUp size={14} className={`dhol-chevron ${isDholMenuOpen ? 'open' : ''}`} />
            </button>

            {/* Upwards Opening Menu */}
            {isDholMenuOpen && (
              <div className="dhol-upward-menu">
                <div className="dhol-menu-header">
                  <div className="dhol-menu-title-group">
                    <span className="dhol-menu-title">🥁 ढोल ताशा व वाद्य लूप</span>
                    <span className="dhol-menu-subtitle">Continuous Maharashtrian Percussion Loop</span>
                  </div>
                  {isDholPlaying && (
                    <button className="dhol-stop-btn" onClick={handlePlaySong} title="Resume Paused Song">
                      <RotateCcw size={13} />
                      <span>गाणे सुरू करा</span>
                    </button>
                  )}
                </div>

                <div className="dhol-options-list">
                  {DHOL_INSTRUMENTS.map((inst) => {
                    const isSelected = isDholPlaying && activeDhol?.id === inst.id
                    return (
                      <button
                        key={inst.id}
                        className={`dhol-option-card ${isSelected ? 'selected-dhol' : ''}`}
                        onClick={() => handleSelectDhol(inst)}
                      >
                        <div className="dhol-card-left">
                          <span className="dhol-card-emoji">{inst.emoji}</span>
                          <div className="dhol-card-text">
                            <div className="dhol-card-name-row">
                              <span className="dhol-card-name">{inst.nameHindi}</span>
                              <span className="dhol-card-eng">({inst.name})</span>
                            </div>
                            <span className="dhol-card-tagline">{inst.tagline}</span>
                          </div>
                        </div>

                        <div className="dhol-card-right">
                          {isSelected ? (
                            <span className="dhol-playing-pill">लूप चालू आहे 🔄</span>
                          ) : (
                            <span className="dhol-bpm-pill">निवडा</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {isDholPlaying && (
                  <p className="dhol-menu-tip">
                    💡 टीप: लूप थांबवण्यासाठी खालील <strong>Play (▶)</strong> बटण दाबा.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Core Audio Controls for the Song */}
          <div className="player-controls">
            <button
              className="control-btn"
              onClick={handlePrev}
              title="Previous song"
              aria-label="Previous song"
            >
              <SkipBack size={20} />
            </button>

            <button
              className={`play-btn ${isBuffering ? 'loading' : ''}`}
              onClick={handleMainPlayToggle}
              title={isPlaying ? 'Pause song' : isDholPlaying ? 'Stop Dhol & Play song' : 'Play song'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isBuffering
                ? <div className="spinner" />
                : isPlaying
                  ? <Pause size={24} fill="currentColor" />
                  : <Play size={24} fill="currentColor" className="play-icon-offset" />
              }
            </button>

            <button
              className="control-btn"
              onClick={handleNext}
              title="Next song"
              aria-label="Next song"
            >
              <SkipForward size={20} />
            </button>
          </div>
        </div>

        {/* Right — Volume + Time + Queue + Minimize */}
        <div className="player-utils">
          <div className="volume-control">
            <Volume2 size={16} className="util-icon" />
            <input
              type="range"
              className="volume-range"
              min="0"
              max="1"
              step="0.05"
              defaultValue="0.8"
              onChange={handleVolume}
              aria-label="Volume slider"
            />
          </div>

          <span className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {onOpenDrawer && (
            <button
              className="util-action-btn"
              onClick={onOpenDrawer}
              title="View Song Queue & Playlists"
              aria-label="View Song Queue"
            >
              <ListMusic size={16} />
            </button>
          )}

          <button
            className="minimize-btn"
            onClick={onMinimize}
            title="Minimize player"
            aria-label="Minimize player"
          >
            <Minus size={16} />
          </button>
        </div>
      </div>

      {/* Clickable song progress bar */}
      <div
        className="progress-container"
        onClick={handleProgressClick}
        title="Seek position"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
