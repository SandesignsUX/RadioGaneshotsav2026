import { useState, useEffect, useCallback } from 'react'
import { useYouTubePlayer } from './hooks/useYouTubePlayer'
import { useTimePlaylist } from './hooks/useTimePlaylist'
import { useDholAudio } from './hooks/useDholAudio'
import { getDefaultPhase } from './data/phases'
import EntryGate from './components/EntryGate'
import Experience from './components/Experience'
import './App.css'

function App() {
  const [hasEntered, setHasEntered] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(() => getDefaultPhase())

  const { currentPlaylist } = useTimePlaylist()
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)

  const activePlaylist = selectedPlaylist || currentPlaylist

  const ytPlayer = useYouTubePlayer()
  const dholAudio = useDholAudio()

  const { togglePlay, start, playTrackAtIndex, play: playSong } = ytPlayer
  const { isDholPlaying, stopDhol } = dholAudio

  // Check for ?song=ID deep-link on load
  const songFromUrl = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('song')
    : null

  // Spacebar toggle after entry: if dhol loop is active, stop dhol and resume song; else toggle song
  useEffect(() => {
    if (!hasEntered) return
    const handleKey = (e) => {
      if (e.code === 'Space' && (e.target === document.body || e.target.tagName === 'BODY')) {
        e.preventDefault()
        if (isDholPlaying) {
          stopDhol()
          playSong()
        } else {
          togglePlay()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [hasEntered, isDholPlaying, togglePlay, stopDhol, playSong])

  const handleEnter = () => {
    setHasEntered(true)

    const playlistToPlay = activePlaylist || currentPlaylist
    const tracks = playlistToPlay.tracks || []
    let startIndex = 0

    if (songFromUrl) {
      const found = tracks.findIndex(t => t.youtubeId === songFromUrl)
      if (found !== -1) startIndex = found
    }

    // Start playback with the songs
    start(tracks, startIndex)
  }

  const handleSelectPlaylist = useCallback((playlist) => {
    setSelectedPlaylist(playlist)
    if (playlist.tracks && playlist.tracks.length > 0) {
      if (isDholPlaying) {
        stopDhol()
      }
      start(playlist.tracks, 0)
    }
  }, [start, isDholPlaying, stopDhol])

  const handleSelectTrack = useCallback((index) => {
    if (isDholPlaying) {
      stopDhol()
    }
    playTrackAtIndex(index)
  }, [playTrackAtIndex, isDholPlaying, stopDhol])

  const handleSelectPhase = useCallback((phase) => {
    setCurrentPhase(phase)
  }, [])

  return (
    <div className="app-container">
      {/* YouTube IFrame API target — always in the DOM */}
      <div
        ref={ytPlayer.containerRef}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: 200,
          height: 200,
          opacity: 0.01,
          pointerEvents: 'none',
          zIndex: -10
        }}
      />

      {!hasEntered
        ? (
          <EntryGate
            onEnter={handleEnter}
          />
        )
        : (
          <Experience
            ytPlayer={ytPlayer}
            dholAudio={dholAudio}
            activePlaylist={activePlaylist || currentPlaylist}
            currentPhase={currentPhase}
            onSelectPhase={handleSelectPhase}
            isMinimized={isMinimized}
            onMinimize={() => setIsMinimized(true)}
            onExpand={() => setIsMinimized(false)}
            onSelectPlaylist={handleSelectPlaylist}
            onSelectTrack={handleSelectTrack}
          />
        )
      }
    </div>
  )
}

export default App
