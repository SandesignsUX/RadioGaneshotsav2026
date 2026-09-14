const https = require('https');
const fs = require('fs');
const path = require('path');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrapePlaylist(playlistId, categoryPrefix, categoryName) {
  const url = `https://www.youtube.com/playlist?list=${playlistId}`;
  console.log(`Fetching ${url}...`);
  const html = await get(url);
  const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
  if (!match) {
    throw new Error(`Could not find ytInitialData for ${playlistId}`);
  }
  const data = JSON.parse(match[1]);
  
  let contents;
  try {
    const tabs = data.contents.twoColumnBrowseResultsRenderer.tabs;
    contents = tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
  } catch (e) {
    throw new Error(`Could not parse playlist contents for ${playlistId}`);
  }

  const tracks = contents.map((c, index) => {
    const v = c.playlistVideoRenderer;
    if (!v || !v.videoId) return null;
    return {
      id: `${categoryPrefix}-${index + 1}-${v.videoId}`,
      title: v.title.runs ? v.title.runs[0].text : 'Unknown',
      titleHindi: v.title.runs ? v.title.runs[0].text : 'Unknown',
      artist: (v.shortBylineText && v.shortBylineText.runs) ? v.shortBylineText.runs[0].text : 'Unknown',
      youtubeId: v.videoId,
      durationHint: v.lengthText ? v.lengthText.simpleText : '0:00',
      category: categoryName
    };
  }).filter(Boolean);
  
  console.log(`Found ${tracks.length} tracks for ${playlistId}.`);
  return tracks;
}

async function main() {
  const playlists = [
    { id: 'PLHOaGL9Zf6Uc', prefix: 'marathi', category: 'marathi', exportName: 'MARATHI_TRACKS' },
    { id: 'PLI-H9A09ltQg', prefix: 'hindi', category: 'hindi', exportName: 'HINDI_TRACKS' },
    { id: 'PLa3rWZ7JaKVo', prefix: 'aarti', category: 'aarti', exportName: 'AARTI_TRACKS' },
    { id: 'PLAKktpXJbBAQ', prefix: 'dj', category: 'dj', exportName: 'DJ_TRACKS' }
  ];

  let fileContent = `/**
 * GANESHOTSAV RADIO 2026 — Sourced YouTube Playlists
 * Sourced directly from YouTube Playlists:
 * - Marathi Songs: https://www.youtube.com/playlist?list=PLHOaGL9Zf6Uc
 * - Hindi Songs: https://www.youtube.com/playlist?list=PLI-H9A09ltQg
 * - Ganpati Aarti: https://www.youtube.com/playlist?list=PLa3rWZ7JaKVo
 * - Ganeshotsav DJ Songs: https://www.youtube.com/playlist?list=PLAKktpXJbBAQ
 */

export const MARATHI_PLAYLIST_ID = 'PLHOaGL9Zf6Uc'
export const MARATHI_PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLHOaGL9Zf6Uc'

export const HINDI_PLAYLIST_ID = 'PLI-H9A09ltQg'
export const HINDI_PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLI-H9A09ltQg'

export const AARTI_PLAYLIST_ID = 'PLa3rWZ7JaKVo'
export const AARTI_PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLa3rWZ7JaKVo'

export const DJ_PLAYLIST_ID = 'PLAKktpXJbBAQ'
export const DJ_PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLAKktpXJbBAQ'

`;

  const allPlaylistsData = {};

  for (const pl of playlists) {
    const tracks = await scrapePlaylist(pl.id, pl.prefix, pl.category);
    allPlaylistsData[pl.category] = tracks;
    fileContent += `export const ${pl.exportName} = ${JSON.stringify(tracks, null, 2)}\n\n`;
  }

  fileContent += `
export const MARATHI_PLAYLIST = {
  id: 'marathi',
  name: 'Marathi Bhakti',
  nameHindi: 'मराठी भक्ती गीते',
  subtitle: 'Classic Devotional Abhangs & Phatkas',
  subtitleHindi: 'पारंपरिक अभंग व फटके',
  emoji: '🌸',
  description: 'Soulful Marathi Ganpati devotional songs, authentic abhangs, and classic phatkas.',
  timeRange: '29 Songs · Marathi Devotional',
  youtubePlaylistId: MARATHI_PLAYLIST_ID,
  url: MARATHI_PLAYLIST_URL,
  tracks: MARATHI_TRACKS
}

export const HINDI_PLAYLIST = {
  id: 'hindi',
  name: 'Hindi Bhajans',
  nameHindi: 'हिंदी भजने',
  subtitle: 'Soulful Bollywood & Hindi Vandanas',
  subtitleHindi: 'बॉलिवूड आणि हिंदी वंदना',
  emoji: '🌺',
  description: 'Devotional Bollywood hits and soothing Hindi bhajans for Ganeshotsav.',
  timeRange: '16 Songs · Hindi Devotional',
  youtubePlaylistId: HINDI_PLAYLIST_ID,
  url: HINDI_PLAYLIST_URL,
  tracks: HINDI_TRACKS
}

export const AARTI_PLAYLIST = {
  id: 'aarti',
  name: 'Ganpati Aarti',
  nameHindi: 'गणपती आरती',
  subtitle: 'Traditional Aartis & Stutis',
  subtitleHindi: 'सुखकर्ता दुःखहर्ता व महा आरती संग्रह',
  emoji: '🪔',
  description: 'Divine morning and evening Aartis, Sukh Karta Dukh Harta, Shej Aarti, and sacred chants.',
  timeRange: '8 Songs · Traditional Aarti',
  youtubePlaylistId: AARTI_PLAYLIST_ID,
  url: AARTI_PLAYLIST_URL,
  tracks: AARTI_TRACKS
}

export const DJ_PLAYLIST = {
  id: 'dj',
  name: 'Ganeshotsav DJ Songs',
  nameHindi: 'गणेशोत्सव डीजे गाणी',
  subtitle: 'High-Energy DJ Remixes & Procession Beats',
  subtitleHindi: 'धमाल डीजे रिमिक्स व मिरवणूक ठेका',
  emoji: '🎧',
  description: 'Electrifying DJ beats, high-energy festival dance mixes, and thunderous procession bass.',
  timeRange: '19 Songs · Festival DJ Remixes',
  youtubePlaylistId: DJ_PLAYLIST_ID,
  url: DJ_PLAYLIST_URL,
  tracks: DJ_TRACKS
}

export const PLAYLISTS = {
  marathi: MARATHI_PLAYLIST,
  hindi: HINDI_PLAYLIST,
  aarti: AARTI_PLAYLIST,
  dj: DJ_PLAYLIST
}

export const GANESHOTSAV_TRACKS = MARATHI_TRACKS
export const YOUTUBE_PLAYLIST_ID = MARATHI_PLAYLIST_ID
export const YOUTUBE_PLAYLIST_URL = MARATHI_PLAYLIST_URL
export const MAIN_PLAYLIST = MARATHI_PLAYLIST

export function getAllPlaylists() {
  return [DJ_PLAYLIST, MARATHI_PLAYLIST, HINDI_PLAYLIST, AARTI_PLAYLIST]
}

export function getPlaylistById(id) {
  if (!id) return MARATHI_PLAYLIST
  const key = id.toLowerCase()
  return PLAYLISTS[key] || MARATHI_PLAYLIST
}

export function getCurrentPlaylist(categoryKey = 'marathi') {
  return getPlaylistById(categoryKey)
}
`;

  const outPath = path.join(__dirname, '../src/data/playlists.js');
  fs.writeFileSync(outPath, fileContent, 'utf-8');
  console.log('Successfully updated src/data/playlists.js');
}

main().catch(console.error);
