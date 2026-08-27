import { useState } from 'react'
import { ListMusic, Sparkles } from 'lucide-react'
import Player from './Player'
import MiniPlayer from './MiniPlayer'
import Drawer from './Drawer'
import PhaseSelector from './PhaseSelector'
import { useListenerCount, useISTClock } from '../hooks/useTimePlaylist'
import './Experience.css'

export default function Experience({
  ytPlayer,
  dholAudio,
  activePlaylist,
  currentPhase,
  onSelectPhase,
  isMinimized,
  onMinimize,
  onExpand,
  onSelectPlaylist,
  onSelectTrack
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const listenerCount = useListenerCount()
  const istTime = useISTClock()

  return (
    <div className="experience-container">
      {/* Background Artwork */}
      <div className="artwork-layer">
        <img
          src="/Aagman Background.png"
          alt="Ganeshotsav 2026 Celebration"
          className="experience-bg"
        />
      </div>

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Foreground decorative floating particles */}
      <div className="foreground-layer" />

      {/* Top UI layer */}
      <div className="overlay-layer">
        <header className="top-ui">

          {/* Top Left: Branding + status */}
          <div className="top-left-ui">
            <div className="brand-badge">
              <div className="brand-top">
                <span className="brand-om">ॐ</span>
                <h1>GANESHOTSAV RADIO</h1>
                <span className="brand-year">2026</span>
              </div>
              <p className="brand-sub">गणेशोत्सव २०२६ · Live Devotional Stream</p>
            </div>

            <div className="status-bar">
              <div className="status-clock">
                <span className="clock-dot" />
                <span>{istTime} · IST</span>
              </div>
              <div className="status-listeners">
                <span className="listeners-dot" />
                <span>{listenerCount.toLocaleString('en-IN')} celebrating</span>
              </div>
            </div>

            {activePlaylist && (
              <div
                className="now-rotation clickable"
                onClick={() => setIsDrawerOpen(true)}
                title="Click to view full playlist & queue"
              >
                <span className="rotation-label">Now on air</span>
                <span className="rotation-name">
                  {activePlaylist.emoji} {activePlaylist.nameHindi || activePlaylist.name}
                </span>
              </div>
            )}
          </div>

          {/* Top Center: 3 Festival Phase Tabs (Aagman · Utsav · Visarjan) */}
          <div className="top-center-ui">
            <PhaseSelector
              currentPhase={currentPhase}
              onSelectPhase={onSelectPhase}
            />
          </div>

          {/* Top Right: Explore & Playlist Button */}
          <div className="top-right-ui">
            <button
              className="explore-btn"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Explore Playlists and Songs"
            >
              <ListMusic size={18} />
              <span>Songs & Queue</span>
              <span className="explore-badge">
                <Sparkles size={12} /> 13
              </span>
            </button>
          </div>
        </header>
      </div>

      {/* Player or MiniPlayer */}
      {isMinimized
        ? (
          <MiniPlayer
            ytPlayer={ytPlayer}
            dholAudio={dholAudio}
            onExpand={onExpand}
          />
        )
        : (
          <Player
            ytPlayer={ytPlayer}
            dholAudio={dholAudio}
            onMinimize={onMinimize}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        )
      }

      {/* Side Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        ytPlayer={ytPlayer}
        activePlaylist={activePlaylist}
        currentPhase={currentPhase}
        onSelectPlaylist={(pl) => {
          onSelectPlaylist(pl)
        }}
        onSelectTrack={(idx) => {
          onSelectTrack(idx)
        }}
      />
    </div>
  )
}


