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
export const PLAYLISTS = [
  {
    id: 'marathi',
    name: 'Marathi Bhakti',
    tagline: 'Devotional Abhangs & Phatkas',
    emoji: '🌸',
    color: 'from-orange-500 to-rose-600',
    tracks: MARATHI_TRACKS
  },
  {
    id: 'hindi',
    name: 'Hindi Bhajans',
    tagline: 'Soulful Ganpati Vandanas',
    emoji: '🌺',
    color: 'from-rose-500 to-pink-600',
    tracks: HINDI_TRACKS
  },
  {
    id: 'aarti',
    name: 'Aarti Sangrah',
    tagline: 'Traditional Evening Aartis',
    emoji: '🪔',
    color: 'from-amber-500 to-orange-500',
    tracks: AARTI_TRACKS
  },
  {
    id: 'dj',
    name: 'Visarjan DJ',
    tagline: 'High Energy Miravnuk Beats',
    emoji: '🎧',
    color: 'from-fuchsia-600 to-purple-600',
    tracks: DJ_TRACKS
  }
]

export const getPlaylistById = (id) => PLAYLISTS.find((p) => p.id === id)
export const getAllTracks = () => PLAYLISTS.flatMap((p) => p.tracks)
`;

  const outPath = path.join(__dirname, '../src/data/playlists.js');
  fs.writeFileSync(outPath, fileContent, 'utf-8');
  console.log('Successfully updated src/data/playlists.js');
}

main().catch(console.error);
