/**
 * AAGMAN RADIO — Playlist Data
 * Sourced from YouTube Playlist: https://youtube.com/playlist?list=PLpjbqr-x3QIoGAw8ch_-LGv0womYBL8sU
 */

export const YOUTUBE_PLAYLIST_ID = 'PLpjbqr-x3QIoGAw8ch_-LGv0womYBL8sU'
export const YOUTUBE_PLAYLIST_URL = 'https://youtube.com/playlist?list=PLpjbqr-x3QIoGAw8ch_-LGv0womYBL8sU'

/**
 * All 13 verified tracks from the Ganeshotsav YouTube playlist
 */
export const GANESHOTSAV_TRACKS = [
  {
    id: 'ya-re-ya-ventilator',
    title: 'Ya Re Ya',
    titleHindi: 'या रे या',
    artist: 'Rohan Rohan, Priyanka Chopra · Ventilator',
    youtubeId: 'HzGE_WaSqE4',
    durationHint: '3:15',
    category: 'dhol'
  },
  {
    id: 'sur-niragas-ho',
    title: 'Sur Niragas Ho',
    titleHindi: 'सूर निरागस हो',
    artist: 'Shankar Mahadevan & Anandi Joshi · Katyar Kaljat Ghusli',
    youtubeId: 'IUzRhOJScuc',
    durationHint: '4:28',
    category: 'prabhat'
  },
  {
    id: 'aagman-title',
    title: 'Aagman (आगमन)',
    titleHindi: 'आगमन - Official Music Video',
    artist: 'Rohit Uddhav Landge · Pranay-Pranit',
    youtubeId: 'jLnU_SIA-cU',
    durationHint: '4:10',
    category: 'dhol'
  },
  {
    id: 'aarambh',
    title: 'Aarambh',
    titleHindi: 'आरंभ',
    artist: 'Ashish Kulkarni & Anuja Deshpande · Pritam Patil',
    youtubeId: 'YiiV0XWCtFw',
    durationHint: '3:45',
    category: 'prabhat'
  },
  {
    id: 'morya-re-bedardi',
    title: 'Morya Re',
    titleHindi: 'मोरया रे',
    artist: 'Jasraj Joshi · Bedardi',
    youtubeId: '0CKQqI-uhNM',
    durationHint: '3:50',
    category: 'visarjan'
  },
  {
    id: 'naad-ninaadala',
    title: 'Naad Ninaadala',
    titleHindi: 'नाद निनादला',
    artist: 'Anand Shinde · Sandeep Salve (Rocky)',
    youtubeId: 'RLzNkYtDLr4',
    durationHint: '4:02',
    category: 'dhol'
  },
  {
    id: 'ya-re-ya-lyrical',
    title: 'Ya Re Ya (Lyrical)',
    titleHindi: 'या रे या (लिरिकल)',
    artist: 'Rohan Pradhan · Ventilator',
    youtubeId: 'qOv--cPq7h0',
    durationHint: '3:15',
    category: 'visarjan'
  },
  {
    id: 'naad-ninaadala-lyrical',
    title: 'Naad Ninaadala (Lyrical)',
    titleHindi: 'नाद निनादला (लिरिकल)',
    artist: 'Anand Shinde · Rocky',
    youtubeId: 'ZcsFySugfY4',
    durationHint: '4:02',
    category: 'dhol'
  },
  {
    id: 'sur-niragas-lyrical',
    title: 'Sur Niragas Ho (Lyrical)',
    titleHindi: 'सूर निरागस हो (लिरिकल)',
    artist: 'Shankar Mahadevan & Anandi Joshi',
    youtubeId: 'Z_AItatDSbg',
    durationHint: '4:28',
    category: 'prabhat'
  },
  {
    id: 'ya-re-ya-special',
    title: 'Ya Re Ya - Ganpati Song',
    titleHindi: 'या रे या - गणपती विशेष',
    artist: 'Rohan Pradhan · Zee Music',
    youtubeId: 'Yi_elkhw4vI',
    durationHint: '3:15',
    category: 'dhol'
  },
  {
    id: 'ganpati-aagman-jukebox',
    title: 'Ganpati Aagman - Maza Bappa Aala',
    titleHindi: 'माझा बाप्पा आला (जुगलबंदी / ज्यूकबॉक्स)',
    artist: 'Ya Re Ya, Sur Niragas Ho · Zee Music Marathi',
    youtubeId: 'WCbsPbVuTKY',
    durationHint: '12:40',
    category: 'aarti'
  },
  {
    id: 'aala-re-bappa-morya-album',
    title: 'Aala Re Bappa Morya (Full Album)',
    titleHindi: 'आला रे बाप्पा मोरया (संपूर्ण अल्बम)',
    artist: 'Ganesh Chaturthi Special Songs Collection',
    youtubeId: 'XilHAMJ9Vpk',
    durationHint: '22:15',
    category: 'aarti'
  },
  {
    id: 'ganpati-aarti-kachi-dhol',
    title: 'Ganpati Aarti (Kachi Dhol Version)',
    titleHindi: 'गणपती आरती (कच्ची ढोल व्हर्जन)',
    artist: 'Santosh Juvekar, Dinesh Arjuna · Vaajav Re',
    youtubeId: 'h9XcOrPtBls',
    durationHint: '3:30',
    category: 'aarti'
  }
]

export const MAIN_PLAYLIST = {
  id: 'main',
  name: 'Ganeshotsav 2026',
  nameHindi: 'गणेशोत्सव २०२६',
  subtitle: 'Official Festival Playlist',
  subtitleHindi: 'संपूर्ण गणेशोत्सव प्लेलिस्ट',
  emoji: '🌺',
  description: 'All official songs pulled from the Ganeshotsav 2026 YouTube playlist.',
  timeRange: 'Live 24x7 Festival Radio',
  tracks: GANESHOTSAV_TRACKS
}

export const PLAYLISTS = {
  main: MAIN_PLAYLIST
}

/**
 * Returns the main single playlist containing all songs.
 */
export function getCurrentPlaylist() {
  return MAIN_PLAYLIST
}

export function getAllPlaylists() {
  return [MAIN_PLAYLIST]
}

export function getPlaylistById() {
  return MAIN_PLAYLIST
}

