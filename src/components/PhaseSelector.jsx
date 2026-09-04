import { FESTIVAL_CATEGORIES } from '../data/phases'
import './PhaseSelector.css'

export default function PhaseSelector({ currentPhase, onSelectPhase }) {
  return (
    <div className="phase-selector-container">
      <div className="phase-tabs-glass" role="tablist" aria-label="Ganeshotsav Music Categories">
        {FESTIVAL_CATEGORIES.map((category) => {
          const isSelected = currentPhase?.id === category.id

          return (
            <button
              key={category.id}
              role="tab"
              aria-selected={isSelected}
              className={`phase-tab ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectPhase(category)}
              title={category.name}
              aria-label={category.name}
            >
              <span className="phase-tab-emoji">{category.emoji}</span>
              <span className="phase-tab-title">{category.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
