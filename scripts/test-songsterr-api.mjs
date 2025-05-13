// Test script for Songsterr API integration
// Run with: node scripts/test-songsterr-api.js

import { getCleanSongsterrTabLinkViaSearch, getBestSongsterrTabUrl } from '../src/lib/services/songsterrApi.js';
import * as cheerio from 'cheerio';

// Known song mappings (copied from our service)
const SONGSTERR_ID_MAPPINGS = {
  'guns n roses:sweet child o mine': { id: '23', type: 'numeric' },
  'led zeppelin:stairway to heaven': { id: '27', type: 'numeric' },
  'metallica:enter sandman': { id: '19', type: 'numeric' },
  'ac/dc:back in black': { id: '1024', type: 'numeric' },
  'eagles:hotel california': { id: '741930', type: 'numeric' },
  'pink floyd:comfortably numb': { id: '271', type: 'numeric' },
  'radiohead:creep': { id: '97', type: 'numeric' },
  'the animals:house of the rising sun': { id: '449957', type: 'numeric' },
  'loathe:screaming': { id: '484434', type: 'numeric' },
  'ozzy osbourne:crazy train': { id: '61178', type: 'numeric' },
  'nirvana:smells like teen spirit': { id: '269', type: 'numeric' },
  'oasis:wonderwall': { id: '2', type: 'numeric' },
};

// Clean text for URL
function cleanTextForUrl(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Get a Songsterr ID for a given song
function getSongsterrIdForSong(artist, title) {
  if (!artist || !title) return null;
  
  // Normalize the input
  const key = `${artist.toLowerCase().trim()}:${title.toLowerCase().trim()}`;
  
  // Check for exact match
  if (SONGSTERR_ID_MAPPINGS[key]) {
    return SONGSTERR_ID_MAPPINGS[key];
  }
  
  // Try partial matching
  for (const [mappingKey, info] of Object.entries(SONGSTERR_ID_MAPPINGS)) {
    const [mappingArtist, mappingTitle] = mappingKey.split(':');
    
    // Check if artist and title are contained in our mappings
    if ((artist.toLowerCase().includes(mappingArtist) || 
         mappingArtist.includes(artist.toLowerCase())) &&
        (title.toLowerCase().includes(mappingTitle) || 
         mappingTitle.includes(title.toLowerCase()))) {
      return info;
    }
  }
  
  return null;
}

// Generate a browser URL for Songsterr tab
function getSongsterrBrowserUrl(artist, title, songId = null) {
  // If we have a direct ID that looks like a slug (already includes '-tab')
  if (songId && typeof songId === 'string' && songId.includes('-tab')) {
    return `https://www.songsterr.com/a/wsa/${songId}`;
  }
  
  // Look up known ID if we don't have one
  const songInfo = songId ? { id: songId, type: 'numeric' } : getSongsterrIdForSong(artist, title);
  
  if (songInfo && songInfo.id) {
    const cleanArtist = cleanTextForUrl(artist);
    const cleanTitle = cleanTextForUrl(title);
    
    if (songInfo.type === 'numeric') {
      return `https://www.songsterr.com/a/wsa/${cleanArtist}-${cleanTitle}-tab-s${songInfo.id}`;
    } else {
      return `https://www.songsterr.com/a/wsa/${songInfo.id}`;
    }
  }
  
  // If we don't have an ID, use the search URL
  return `https://www.songsterr.com/a/wa/bestMatchForQueryString?s=${encodeURIComponent(title)}&a=${encodeURIComponent(artist)}`;
}

// Generate a URL for embedding Songsterr tab
function getSongsterrEmbedUrl(artist, title, songId = null) {
  // We use the exact same URL for embedding as for browser - direct embedding works best
  return getSongsterrBrowserUrl(artist, title, songId);
}

// Search for tabs by artist and title
function searchSongsterrTabs(artist, title) {
  return `https://www.songsterr.com/a/wa/bestMatchForQueryString?s=${encodeURIComponent(title)}&a=${encodeURIComponent(artist)}`;
}

// Test cases
const testSongs = [
  // Direct ID test cases
  { artist: 'Led Zeppelin', title: 'Stairway to Heaven', songId: '27' },
  { artist: 'Loathe', title: 'Screaming', songId: 'loathe-screaming-tab' },
  { artist: 'Guns N Roses', title: 'Sweet Child O Mine', songId: '23' },
  
  // Known songs without ID
  { artist: 'Metallica', title: 'Enter Sandman' },
  { artist: 'Pink Floyd', title: 'Comfortably Numb' },
  
  // Unknown songs
  { artist: 'King Gizzard', title: 'Crumbling Castle' },
  { artist: 'Meshuggah', title: 'Bleed' },
];

async function runTests() {
  console.log('Testing Songsterr API Integration');
  console.log('================================\n');
  
  for (const [index, song] of testSongs.entries()) {
    console.log(`TEST CASE ${index + 1}: ${song.artist} - ${song.title} ${song.songId ? `(ID: ${song.songId})` : ''}`);
    console.log('-'.repeat(80));
    
    // Test ID lookup
    const songInfo = getSongsterrIdForSong(song.artist, song.title);
    console.log('1. ID Lookup:', songInfo ? `Found ID: ${songInfo.id} (${songInfo.type})` : 'No ID found');
    
    // Test URL generation
    const browserUrl = getSongsterrBrowserUrl(song.artist, song.title, song.songId);
    console.log('2. Browser URL:', browserUrl);
    
    const embedUrl = getSongsterrEmbedUrl(song.artist, song.title, song.songId);
    console.log('3. Embed URL:', embedUrl);
    
    // Test search functionality
    const searchUrl = searchSongsterrTabs(song.artist, song.title);
    console.log('4. Search URL:', searchUrl);

    // Test new fallback search
    const fallbackUrl = await getCleanSongsterrTabLinkViaSearch(song.title, song.artist);
    console.log('5. DuckDuckGo Fallback URL:', fallbackUrl ? fallbackUrl : 'No tab found via search');

    console.log('\n');
  }

  // --- Custom test for Loathe - Gored ---
  const testArtist = 'Loathe';
  const testTitle = 'Gored';
  console.log('Custom Test: Loathe - Gored');
  const bestUrl = await getBestSongsterrTabUrl(testArtist, testTitle);
  console.log('[Test] getBestSongsterrTabUrl("Loathe", "Gored"):', bestUrl);
  if (bestUrl === 'https://www.songsterr.com/a/wsa/loathe-gored-tab-s465363') {
    console.log('✅ Correct Songsterr link found!');
  } else {
    console.log('❌ Incorrect Songsterr link. Got:', bestUrl);
  }
}

// Run the tests
runTests(); 