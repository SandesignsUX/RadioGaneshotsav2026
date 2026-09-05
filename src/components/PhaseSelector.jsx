import { ChevronUp } from 'lucide-react'
import { FESTIVAL_CATEGORIES } from '../data/phases'
import './PhaseSelector.css'

export default function PhaseSelector({
  currentPhase,
  onSelectPhase,
  isCategoryMenuOpen,
  onToggleCategoryMenu,
  categoryTriggerRef
}) {
  return (
    <div className="phase-selector-container">
      {/* Desktop View: Horizontal Toggle Bar */}
      <div className="phase-tabs-glass desktop-phase-tabs" role="tablist" aria-label="Ganeshotsav Music Categories">
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

      {/* Mobile View: Upward Opening Dropdown Trigger Button */}
      <div className="mobile-category-panel-wrapper" ref={categoryTriggerRef}>
        <button
          className={`category-dropdown-panel ${isCategoryMenuOpen ? 'active' : ''}`}
          onClick={onToggleCategoryMenu}
          title="Choose song category"
          aria-label="Choose song category"
          aria-expanded={isCategoryMenuOpen}
        >
          <span className="category-trigger-emoji">{currentPhase?.emoji || '🎧'}</span>
          <span className="category-trigger-text">{currentPhase?.name || 'Category'}</span>
          <ChevronUp size={14} className={`category-chevron ${isCategoryMenuOpen ? 'open' : ''}`} />
        </button>
      </div>
    </div>
  )
}
