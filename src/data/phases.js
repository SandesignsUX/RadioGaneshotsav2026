/**
 * Ganeshotsav 2026 Festival Phases
 */
export const FESTIVAL_PHASES = [
  {
    id: 'aagman',
    name: 'Aagman',
    nameHindi: 'आगमन',
    subtitle: 'Welcoming Lord Ganesha',
    subtitleHindi: 'बाप्पाचे आगमन व स्वागत',
    description: 'Feel the electric excitement of Bappa arriving home and in pandals with loud Dhol Tasha beats.',
    activeRangeText: 'Till 15 Sept 2026, 12:00 AM',
    startDate: new Date('2026-08-01T00:00:00+05:30'),
    endDate: new Date('2026-09-15T00:00:00+05:30'),
    bgImage: '/Aagman Background.png',
    emoji: '🌺',
    badge: 'Aagman Special',
    tagline: 'मोरया रे बाप्पा मोरया रे'
  },
  {
    id: 'utsav',
    name: 'Utsav',
    nameHindi: 'उत्सव',
    subtitle: 'Daily Festivities & Pandal Darshan',
    subtitleHindi: 'महापूजा, नित्य आरती व भजन',
    description: 'The golden days of celebration, daily Maha Aarti, fragrant marigold flowers, and divine darshan.',
    activeRangeText: '14 Sept – 25 Sept 2026',
    startDate: new Date('2026-09-14T00:00:00+05:30'),
    endDate: new Date('2026-09-25T23:59:59+05:30'),
    bgImage: '/Aagman Background.png',
    emoji: '🪔',
    badge: 'Pandal Darshan',
    tagline: 'सुखकर्ता दुखहर्ता वार्ता विघ्नाची'
  },
  {
    id: 'visarjan',
    name: 'Visarjan',
    nameHindi: 'विसर्जन',
    subtitle: 'The Grand Farewell Procession',
    subtitleHindi: 'भव्य विसर्जन मिरवणूक व निरोप',
    description: 'Bittersweet joy at Girgaon Chowpatty and ocean shores. Dancing with gulal to bring Bappa back next year.',
    activeRangeText: '15 Sept – 25 Sept 2026',
    startDate: new Date('2026-09-15T00:00:00+05:30'),
    endDate: new Date('2026-09-25T23:59:59+05:30'),
    bgImage: '/Aagman Background.png',
    emoji: '🌊',
    badge: 'Mirvanook',
    tagline: 'पुढच्या वर्षी लवकर या!'
  }
]

/**
 * Checks if a phase is currently active according to Indian Standard Time (IST)
 */
export function isPhaseActive(phase, testDate = null) {
  const now = testDate || new Date()
  if (phase.id === 'aagman') {
    return now <= phase.endDate
  }
  return now >= phase.startDate && now <= phase.endDate
}

/**
 * Returns default initial phase based on current time
 */
export function getDefaultPhase(testDate = null) {
  const now = testDate || new Date()
  if (now <= FESTIVAL_PHASES[0].endDate) {
    return FESTIVAL_PHASES[0] // Aagman
  }
  if (now >= FESTIVAL_PHASES[1].startDate && now <= FESTIVAL_PHASES[1].endDate) {
    return FESTIVAL_PHASES[1] // Utsav
  }
  if (now >= FESTIVAL_PHASES[2].startDate && now <= FESTIVAL_PHASES[2].endDate) {
    return FESTIVAL_PHASES[2] // Visarjan
  }
  return FESTIVAL_PHASES[0]
}
