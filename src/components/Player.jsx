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
import PhaseSelector from './PhaseSelector'
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
  currentPhase,
  onSelectPhase,
  onMinimize,
  onOpenDrawer,
  onSelectTrack
}) {
  const [isDholMenuOpen, setIsDholMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const dholMenuRef = useRef(null)
  const searchWrapperRef = useRef(null)
  const searchInputRef = useRef(null)

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
    pauseDhol,
    stopDhol,
    toggleDhol,
    setDholVolume
  } = dholAudio || {}

  // Filter songs based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase().trim()
    return tracks
      .map((track, index) => ({ track, index }))
      .filter(({ track }) => {
        const titleMatch = track.title?.toLowerCase().includes(q)
        const hindiMatch = track.titleHindi?.toLowerCase().includes(q)
        const artistMatch = track.artist?.toLowerCase().includes(q)
        return titleMatch || hindiMatch || artistMatch
      })
  }, [tracks, searchQuery])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setIsSearchOpen(false)
      }
      if (dholMenuRef.current && !dholMenuRef.current.contains(e.target)) {
        setIsDholMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleProgressClick = (e) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seek(ratio * duration)
  }

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (setDholVolume) {
      setDholVolume(val)
    }
  }

  // Inside dropdown: clicking an item plays it; clicking the same item again pauses it
  const handleSelectDhol = (instrument) => {
    if (isDholPlaying && activeDhol?.id === instrument.id) {
      if (pauseDhol) pauseDhol()
      else stopDhol()
    } else {
      if (isPlaying) {
        pauseSong()
      }
      playDhol(instrument)
    }
  }

  // Outside panel: dedicated button that only plays or pauses the beats
  const handleToggleDholFromPanel = (e) => {
    e.stopPropagation()
    if (isDholPlaying) {
      if (pauseDhol) pauseDhol()
      else stopDhol()
    } else {
      if (isPlaying) {
        pauseSong()
      }
      playDhol(activeDhol || DHOL_INSTRUMENTS[0])
    }
  }

  const handlePlaySong = () => {
    if (isDholPlaying) {
      stopDhol()
    }
    playSong()
    setIsDholMenuOpen(false)
  }

  const handleMainPlayToggle = () => {
    if (isDholPlaying) {
      stopDhol()
      playSong()
      return
    }
    togglePlay()
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
      {/* Category Toggle Buttons shifted above the Player Controls */}
      {currentPhase && onSelectPhase && (
        <div className="player-categories-wrapper">
          <PhaseSelector
            currentPhase={currentPhase}
            onSelectPhase={onSelectPhase}
          />
        </div>
      )}

      {/* Main Dock Row: Search on Left (Outside player-glass) + player-glass in Center + Dhol Tasha on Right (Outside player-glass) */}
      <div className="player-dock-row">
        {/* Outside Left: Circle-Shaped Search Button & Upward Popover */}
        <div className="player-search-wrapper" ref={searchWrapperRef}>
          <button
            className={`search-trigger-btn ${isSearchOpen || searchQuery ? 'active' : ''}`}
            onClick={() => setIsSearchOpen(prev => !prev)}
            title="Search songs (गाणे शोधा)"
            aria-label="Search devotional songs"
          >
            <Search size={18} />
          </button>

          {/* Upwards Opening Search Popover */}
          {isSearchOpen && (
            <div className="search-popover-menu">
              <div className="search-popover-header">
                <span className="search-popover-title">🔍 Search Songs · गाणे शोधा</span>
                <button
                  className="search-popover-close"
                  onClick={() => setIsSearchOpen(false)}
                  aria-label="Close search"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="search-input-box">
                <Search size={14} className="search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  placeholder="Search songs... / गाणे शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  aria-label="Search devotional songs"
                />
                {searchQuery && (
                  <button
                    className="search-clear-btn"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {searchResults.length > 0 ? (
                <div className="search-results-list">
                  <div className="search-results-header">
                    <span>{searchResults.length} {searchResults.length === 1 ? 'Song found' : 'Songs found'}</span>
                  </div>
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
              ) : searchQuery.trim() ? (
                <div className="search-no-results">
                  <span>No songs found for "{searchQuery}"</span>
                </div>
              ) : (
                <div className="search-empty-hint">
                  <span>Type song name, artist, or album...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Main Player Glass Dock */}
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

        {/* Outside Right: Dhol Tasha Panel & Upward Menu */}
        <div className="dhol-dropdown-wrapper" ref={dholMenuRef}>
          <div className={`dhol-panel ${isDholPlaying ? 'active-dhol' : ''}`}>
            {/* Left section: Emoji + Label (clicking toggles menu open/close) */}
            <button
              className="dhol-panel-label-btn"
              onClick={() => setIsDholMenuOpen(prev => !prev)}
              title="Choose Dhol Tasha beat (पुणेरी, नाशिक, कावडी, हलगी)"
              aria-label="Choose Dhol Tasha beat"
            >
              <span className="dhol-trigger-emoji">{activeDhol ? activeDhol.emoji : '🥁'}</span>
              <span className="dhol-trigger-text">
                {activeDhol ? activeDhol.nameHindi : 'ढोल ताशा'}
              </span>
            </button>

            {/* Dedicated Button: ONLY plays or pauses the beats, located beside text label */}
            <button
              className={`dhol-panel-play-btn ${isDholPlaying ? 'playing' : ''}`}
              onClick={handleToggleDholFromPanel}
              title={isDholPlaying ? 'Pause beats (ठेका थांबवा)' : 'Play beats (ठेका सुरू करा)'}
              aria-label={isDholPlaying ? 'Pause Dhol Beats' : 'Play Dhol Beats'}
            >
              {isDholPlaying ? (
                <Pause size={13} fill="currentColor" />
              ) : (
                <Play size={13} fill="currentColor" className="dhol-play-icon-offset" />
              )}
            </button>

            {/* Chevron toggle button to open/close menu */}
            <button
              className="dhol-panel-chevron-btn"
              onClick={() => setIsDholMenuOpen(prev => !prev)}
              title={isDholMenuOpen ? 'Close Dhol menu' : 'Open Dhol menu'}
              aria-label="Toggle Dhol Menu"
            >
              {isDholPlaying && <span className="dhol-loop-dot" title="Dhol loop active" />}
              <ChevronUp size={14} className={`dhol-chevron ${isDholMenuOpen ? 'open' : ''}`} />
            </button>
          </div>

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
                  const isSelected = activeDhol?.id === inst.id
                  const isThisPlaying = isDholPlaying && isSelected
                  return (
                    <button
                      key={inst.id}
                      className={`dhol-option-card ${isSelected ? 'selected-dhol' : ''} ${isThisPlaying ? 'playing-card' : ''}`}
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
                        {isThisPlaying ? (
                          <span className="dhol-playing-pill">
                            चालू आहे ⏸️
                          </span>
                        ) : isSelected ? (
                          <span className="dhol-paused-pill">
                            थांबवले ▶️
                          </span>
                        ) : (
                          <span className="dhol-bpm-pill">निवडा ▶</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {isDholPlaying ? (
                <p className="dhol-menu-tip">
                  💡 टीप: लूप थांबवण्यासाठी पर्यायावर पुन्हा दाबा किंवा बाहेरिल <strong>⏸</strong> बटण वापरा.
                </p>
              ) : activeDhol ? (
                <p className="dhol-menu-tip">
                  💡 टीप: निवडलेला ठेका सुरू करण्यासाठी पर्यायावर दाबा किंवा बाहेरिल <strong>▶</strong> बटण वापरा.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
