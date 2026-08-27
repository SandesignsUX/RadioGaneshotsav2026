import { FESTIVAL_PHASES, isPhaseActive } from '../data/phases'
import './PhaseSelector.css'

export default function PhaseSelector({ currentPhase, onSelectPhase }) {
  return (
    <div className="phase-selector-container">
      <div className="phase-tabs-glass">
        {FESTIVAL_PHASES.map((phase) => {
          const isSelected = currentPhase.id === phase.id
          const isActiveNow = isPhaseActive(phase)

          return (
            <button
              key={phase.id}
              className={`phase-tab ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectPhase(phase)}
              title={`${phase.name} (${phase.nameHindi}) · ${phase.activeRangeText}`}
              aria-label={`${phase.name} Phase - ${phase.activeRangeText}`}
            >
              <div className="phase-tab-content">
                <span className="phase-tab-emoji">{phase.emoji}</span>
                <div className="phase-tab-text">
                  <span className="phase-tab-hindi">{phase.nameHindi}</span>
                  <span className="phase-tab-english">{phase.name}</span>
                </div>
                {isActiveNow && (
                  <span className="phase-live-indicator" title="Currently Live Schedule">
                    <span className="phase-live-pulse" />
                  </span>
                )}
              </div>

              <span className="phase-tab-dates">{phase.activeRangeText}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
