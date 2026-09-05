/**
 * Ganeshotsav 2026 Categories (Categorized by Song Type & Language)
 */
export const FESTIVAL_CATEGORIES = [
  {
    id: 'dj',
    name: 'Ganeshotsav DJ Songs',
    subtitle: 'High-Energy DJ Remixes & Procession Beats',
    description: 'Electrifying DJ beats, high-energy festival dance mixes, and thunderous procession bass.',
    bgImage: `${import.meta.env.BASE_URL}Aagman Background.png`,
    emoji: '🎧',
    badge: 'DJ Remixes'
  },
  {
    id: 'marathi',
    name: 'Marathi Songs',
    subtitle: 'Iconic Marathi Devotional & Utsav Songs',
    description: 'Soulful and energetic Marathi devotional tracks, Dhol Tasha anthems, and timeless Bappa geet.',
    bgImage: `${import.meta.env.BASE_URL}Aagman Background.png`,
    emoji: '🚩',
    badge: 'Marathi Special'
  },
  {
    id: 'hindi',
    name: 'Hindi Songs',
    subtitle: 'Devotional Hindi Bhajans & Celebrations',
    description: 'Melodious Hindi Ganeshotsav bhajans, popular festival anthems, and divine offerings.',
    bgImage: `${import.meta.env.BASE_URL}Aagman Background.png`,
    emoji: '🪷',
    badge: 'Hindi Bhajans'
  },
  {
    id: 'aarti',
    name: 'Ganpati Aarti',
    subtitle: 'Traditional Aartis & Stutis',
    description: 'Divine morning and evening Aartis, Sukh Karta Dukh Harta, Shej Aarti, and sacred chants.',
    bgImage: `${import.meta.env.BASE_URL}Aagman Background.png`,
    emoji: '🪔',
    badge: 'Maha Aarti'
  }
]

// Backward-compatibility alias for any component importing FESTIVAL_PHASES
export const FESTIVAL_PHASES = FESTIVAL_CATEGORIES

/**
 * Returns default initial category
 */
export function getDefaultPhase() {
  return FESTIVAL_CATEGORIES[0]
}

/**
 * Kept for interface compatibility
 */
export function isPhaseActive() {
  return false
}
