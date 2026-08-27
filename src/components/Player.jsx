import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Minus,
  Volume2,
  ListMusic,
  ChevronUp,
  RotateCcw,
  Search,
  X
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
  onOpenDrawer,
  onSelectTrack
}) {
  const [isDholMenuOpen, setIsDholMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const dholMenuRef = useRef(null)
  const searchWrapperRef = useRef(null)

  const {
    isPlaying,
    isBuffering,
    trackIndex,
    tracks = [],
    currentTrack,
    currentTime,
    duration,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    playTrackAtIndex,
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

  // Filter songs based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase().trim()
    return tracks
      .map((track, index) => ({ track, index }))
      .filter(({ track }) => {
        const title = (track.title || '').toLowerCase()
        const titleHindi = (track.titleHindi || '').toLowerCase()
        const artist = (track.artist || '').toLowerCase()
        return title.includes(q) || titleHindi.includes(q) || artist.includes(q)
      })
  }, [searchQuery, tracks])

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dholMenuRef.current && !dholMenuRef.current.contains(e.target)) {
        setIsDholMenuOpen(false)
      }
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const handleSelectSearchResult = (index) => {
    if (isDholPlaying) {
      stopDhol()
    }
    if (onSelectTrack) {
      onSelectTrack(index)
    } else if (playTrackAtIndex) {
      playTrackAtIndex(index)
    }
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="player-container">
      {/* Top Accessory Bar: 25% Search Bar + Dhol Tasha Options Beside It */}
      <div className="player-accessory-bar">
        {/* 25% Width Search Bar */}
        <div className="player-search-wrapper" ref={searchWrapperRef}>
          <div className="player-search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search songs... / गाणे शोधा..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsSearchOpen(true)
              }}
              onFocus={() => setIsSearchOpen(true)}
              aria-label="Search devotional songs"
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => {
                  setSearchQuery('')
                  setIsSearchOpen(false)
                }}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Instant Search Results Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              <div className="search-results-header">
                <span>{searchResults.length} {searchResults.length === 1 ? 'Song found' : 'Songs found'}</span>
              </div>
              <div className="search-results-list">
                {searchResults.map(({ track, index }) => (
                  <button
                    key={track.id || track.youtubeId}
                    className={`search-result-item ${index === trackIndex ? 'active' : ''}`}
                    onClick={() => handleSelectSearchResult(index)}
                  >
                    <div className="search-item-left">
                      <Play size={12} className="search-play-icon" />
                      <div className="search-item-text">
                        <span className="search-item-title">{track.titleHindi || track.title}</span>
                        <span className="search-item-artist">{track.artist}</span>
                      </div>
                    </div>
                    {track.durationHint && (
                      <span className="search-item-duration">{track.durationHint}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dhol Tasha Options Beside the Search Bar */}
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
      </div>

      {/* Main Player Glass Dock */}
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

        {/* Center — Controls (Previous, Play/Pause, Next) */}
        <div className="player-controls-section">
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

        {/* Small Progress Bar Spanned Across the Player */}
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
    </div>
  )
}

