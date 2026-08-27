import { Play, Pause, ChevronUp } from 'lucide-react'
import './MiniPlayer.css'

export default function MiniPlayer({ ytPlayer, dholAudio, onExpand }) {
  const { isPlaying, isBuffering, currentTrack, togglePlay, play: playSong } = ytPlayer
  const { isDholPlaying, stopDhol } = dholAudio || {}

  const handleToggle = () => {
    if (isDholPlaying) {
      stopDhol()
      playSong()
    } else {
      togglePlay()
    }
  }

  return (
    <div className="mini-player">
      <div className="mini-eq">
        <div className={`equalizer ${isPlaying ? 'playing' : ''}`}>
          <span /><span /><span />
        </div>
      </div>

      <div className="mini-track">
        <span className="mini-title">
          {currentTrack?.titleHindi || currentTrack?.title || 'Ganeshotsav Radio'}
        </span>
        <span className="mini-artist">{currentTrack?.artist || '2026'}</span>
      </div>

      <div className="mini-controls">
        <button className="mini-play-btn" onClick={handleToggle} aria-label="Toggle Play">
          {isBuffering
            ? <div className="mini-spinner" />
            : isPlaying
              ? <Pause size={18} fill="currentColor" />
              : <Play size={18} fill="currentColor" />
          }
        </button>
        <button className="mini-expand-btn" onClick={onExpand} title="Expand player" aria-label="Expand Player">
          <ChevronUp size={18} />
        </button>
      </div>
    </div>
  )
}
