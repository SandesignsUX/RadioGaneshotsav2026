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
import { FESTIVAL_CATEGORIES } from '../data/phases'
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
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const dholMenuRef = useRef(null)
  const dholTriggerRef = useRef(null)
  const categoryMenuRef = useRef(null)
  const categoryTriggerRef = useRef(null)
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
      if (
        dholMenuRef.current &&
        !dholMenuRef.current.contains(e.target) &&
        !dholTriggerRef.current?.contains(e.target)
      ) {
        setIsDholMenuOpen(false)
      }
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(e.target) &&
        !categoryTriggerRef.current?.contains(e.target)
      ) {
        setIsCategoryMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleDholMenu = () => {
    setIsDholMenuOpen(prev => {
      if (!prev) {
        setIsCategoryMenuOpen(false)
        setIsSearchOpen(false)
      }
      return !prev
    })
  }

  const handleToggleCategoryMenu = () => {
    setIsCategoryMenuOpen(prev => {
      if (!prev) {
        setIsDholMenuOpen(false)
        setIsSearchOpen(false)
      }
      return !prev
    })
  }

  const handleToggleSearch = () => {
    setIsSearchOpen(prev => {
      if (!prev) {
        setIsDholMenuOpen(false)
        setIsCategoryMenuOpen(false)
      }
      return !prev
    })
  }

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
      {/* Upwards Opening Dhol Menu - Rendered at container level to prevent clipping by scrollable category bar */}
      {isDholMenuOpen && (
        <div className="dhol-upward-menu" ref={dholMenuRef}>
          <div className="dhol-menu-header">
            <div className="dhol-menu-title-group">
              <span className="dhol-menu-title">🥁 Live Dhol Tasha Beats</span>
              <span className="dhol-menu-subtitle">Continuous Maharashtrian Percussion Loop</span>
            </div>
            {isDholPlaying && (
              <button className="dhol-stop-btn" onClick={handlePlaySong} title="Resume Paused Song">
                <RotateCcw size={13} />
                <span>Resume Song</span>
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
                      <span className="dhol-card-name">{inst.name}</span>
                      <span className="dhol-card-tagline">{inst.tagline}</span>
                    </div>
                  </div>

                  <div className="dhol-card-right">
                    {isThisPlaying ? (
                      <span className="dhol-playing-pill">
                        Playing ⏸️
                      </span>
                    ) : isSelected ? (
                      <span className="dhol-paused-pill">
                        Paused ▶️
                      </span>
                    ) : (
                      <span className="dhol-bpm-pill">Select ▶</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {isDholPlaying ? (
            <p className="dhol-menu-tip">
              💡 Tip: Tap beat again to pause, or use the <strong>⏸</strong> button on the panel.
            </p>
          ) : activeDhol ? (
            <p className="dhol-menu-tip">
              💡 Tip: Tap beat to play, or use the <strong>▶</strong> button on the panel.
            </p>
          ) : null}
        </div>
      )}

      {/* Upwards Opening Category Dropdown Menu (Mobile) */}
      {isCategoryMenuOpen && (
        <div className="category-upward-menu" ref={categoryMenuRef}>
          <div className="category-menu-header">
            <div className="category-menu-title-group">
              <span className="category-menu-title">🎵 Music Categories</span>
              <span className="category-menu-subtitle">Switch Devotional Playlist</span>
            </div>
            <button
              className="category-close-btn"
              onClick={() => setIsCategoryMenuOpen(false)}
              aria-label="Close categories menu"
            >
              <X size={14} />
            </button>
          </div>

          <div className="category-options-list">
            {FESTIVAL_CATEGORIES.map((cat) => {
              const isSelected = currentPhase?.id === cat.id
              return (
                <button
                  key={cat.id}
                  className={`category-option-card ${isSelected ? 'selected-category' : ''}`}
                  onClick={() => {
                    onSelectPhase(cat)
                    setIsCategoryMenuOpen(false)
                  }}
                >
                  <div className="category-card-left">
                    <span className="category-card-emoji">{cat.emoji}</span>
                    <div className="category-card-text">
                      <span className="category-card-name">{cat.name}</span>
                      <span className="category-card-desc">{cat.subtitle}</span>
                    </div>
                  </div>

                  <div className="category-card-right">
                    {isSelected ? (
                      <span className="category-active-pill">Active ✓</span>
                    ) : (
                      <span className="category-select-pill">Select ▶</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <p className="category-menu-tip">
            💡 Tip: Tap any category to load its devotional songs and playlist.
          </p>
        </div>
      )}

      {/* Category Toggle Bar with Dhol Tasha Button on the Left */}
      <div className="player-categories-wrapper">
        {/* Dhol Tasha Panel (Dedicated Play/Pause Button + Trigger) on Left */}
        <div className="dhol-dropdown-wrapper" ref={dholTriggerRef}>
          <div className={`dhol-panel ${isDholPlaying ? 'active-dhol' : ''}`}>
            {/* Left section: Emoji + Label (clicking toggles menu open/close) */}
            <button
              className="dhol-panel-label-btn"
              onClick={handleToggleDholMenu}
              title="Choose Dhol Tasha beat"
              aria-label="Choose Dhol Tasha beat"
            >
              <span className="dhol-trigger-emoji">{activeDhol ? activeDhol.emoji : '🥁'}</span>
              <span className="dhol-trigger-text">
                {activeDhol ? activeDhol.name : 'Dhol Tasha'}
              </span>
            </button>

            {/* Dedicated Button: ONLY plays or pauses the beats, located beside text label */}
            <button
              className={`dhol-panel-play-btn ${isDholPlaying ? 'playing' : ''}`}
              onClick={handleToggleDholFromPanel}
              title={isDholPlaying ? 'Pause Dhol beats' : 'Play Dhol beats'}
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
              onClick={handleToggleDholMenu}
              title={isDholMenuOpen ? 'Close Dhol menu' : 'Open Dhol menu'}
              aria-label="Toggle Dhol Menu"
            >
              {isDholPlaying && <span className="dhol-loop-dot" title="Dhol loop active" />}
              <ChevronUp size={14} className={`dhol-chevron ${isDholMenuOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>

        {/* Categories Toggle Bar / Mobile Upward Dropdown */}
        {currentPhase && onSelectPhase && (
          <PhaseSelector
            currentPhase={currentPhase}
            onSelectPhase={(cat) => {
              onSelectPhase(cat)
              setIsCategoryMenuOpen(false)
            }}
            isCategoryMenuOpen={isCategoryMenuOpen}
            onToggleCategoryMenu={handleToggleCategoryMenu}
            categoryTriggerRef={categoryTriggerRef}
          />
        )}
      </div>

      {/* Main Dock Row: Search on Left (Outside player-glass) + player-glass in Center */}
      <div className="player-dock-row">
        {/* Outside Left: Circle-Shaped Search Button & Upward Popover */}
        <div className="player-search-wrapper" ref={searchWrapperRef}>
          <button
            className={`search-trigger-btn ${isSearchOpen || searchQuery ? 'active' : ''}`}
            onClick={handleToggleSearch}
            title="Search songs"
            aria-label="Search devotional songs"
          >
            <Search size={18} />
          </button>

          {/* Upwards Opening Search Popover */}
          {isSearchOpen && (
            <div className="search-popover-menu">
              <div className="search-popover-header">
                <span className="search-popover-title">🔍 Search Songs</span>
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
                  placeholder="Search songs by title or artist..."
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
                          <span className="search-item-title">{track.title}</span>
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
                  <h3 className="track-title" title={currentTrack.title}>
                    {isBuffering ? 'Loading…' : currentTrack.title}
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
    </div>
  )
}
