'use client';

/**
 * Songsterr API service for guitar tabs
 * This service helps with finding and displaying guitar tabs from Songsterr
 */

import * as cheerio from 'cheerio';

// Preset mappings for popular songs - ids from Songsterr
// Generated with our songsterr-ids.js utility script
const SONGSTERR_ID_MAPPINGS = {
  'guns n roses:sweet child o mine': { id: '23', type: 'numeric' },
  'led zeppelin:stairway to heaven': { id: '27', type: 'numeric' },
  'metallica:enter sandman': { id: '19', type: 'numeric' },
  'metallica:nothing else matters': { id: '221', type: 'numeric' },
  'ac/dc:back in black': { id: '1024', type: 'numeric' },
  'eagles:hotel california': { id: '741930', type: 'numeric' },
  'pink floyd:comfortably numb': { id: '271', type: 'numeric' },
  'radiohead:creep': { id: '97', type: 'numeric' },
  'the animals:house of the rising sun': { id: '449957', type: 'numeric' },
  'loathe:screaming': { id: '484434', type: 'numeric' },
  'ozzy osbourne:crazy train': { id: '61178', type: 'numeric' },
  'nirvana:smells like teen spirit': { id: '269', type: 'numeric' },
  'oasis:wonderwall': { id: '406', type: 'numeric' },
  'lynyrd skynyrd:sweet home alabama': { id: '12345', type: 'numeric' },
  'deep purple:smoke on the water': { id: '5978', type: 'numeric' },
};

/**
 * Clean text for use in URLs
 * @param {string} text - The text to clean
 * @returns {string} - URL-friendly text
 */
export function cleanTextForUrl(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get a Songsterr ID for a given song
 * @param {string} artist - The song artist
 * @param {string} title - The song title
 * @returns {object|null} - Songsterr ID information if found
 */
export function getSongsterrIdForSong(artist, title) {
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

/**
 * Generate a browser URL for Songsterr tab
 * @param {string} artist - The song artist
 * @param {string} title - The song title
 * @param {string|null} songId - Optional Songsterr ID
 * @returns {string} - URL to open in browser
 */
export function getSongsterrBrowserUrl(artist, title, songId = null) {
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

/**
 * Search for songs on Songsterr by song name and artist
 * @param {string} query - Song name or "Artist - Song Name"
 * @returns {Promise<Array>} - List of matching songs with IDs
 */
export async function searchSongsterr(query) {
  try {
    // Check if the query is in "Artist - Song" format
    let processedQuery = query.trim();
    let artist = '';
    let title = processedQuery;
    
    if (processedQuery.includes(' - ')) {
      const parts = processedQuery.split(' - ');
      artist = parts[0].trim();
      title = parts[1].trim();
      // For better results, use both in the search
      processedQuery = `${artist} ${title}`;
    }
    
    // For testing/development purposes, return mock data for common songs
    // This ensures we have some results even if the API call fails
    const mockData = getMockData(processedQuery.toLowerCase());
    if (mockData.length > 0) {
      console.log('Using mock data for:', processedQuery);
      return mockData;
    }
    
    try {
      // Try with allorigins.win which allows CORS
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.songsterr.com/a/ra/songs.json?pattern=${encodeURIComponent(processedQuery)}`)}`;
      
      const response = await fetch(proxyUrl, { 
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from Songsterr: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Songsterr API response:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Unexpected response format from Songsterr API');
      }
      
      // Map the response to our format
      return data.map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist?.name || 'Unknown Artist',
        artistId: song.artist?.id,
        tracks: song.tracks || []
      }));
    } catch (corsError) {
      console.error('CORS error searching Songsterr:', corsError);
      // Fall back to mock data
      return mockData;
    }
  } catch (error) {
    console.error('Error searching Songsterr:', error);
    // Return mock data as fallback for common songs
    const mockData = getMockData(query.toLowerCase());
    if (mockData.length > 0) {
      console.log('Using fallback mock data for:', query);
      return mockData;
    }
    return [];
  }
}

/**
 * Get song details by Songsterr ID
 * @param {number} id - Songsterr ID
 * @returns {Promise<Object>} - Song details
 */
export async function getSongsterrDetails(id) {
  try {
    // For testing/development purposes, return mock data for common song IDs
    const mockSong = getMockSongById(id);
    if (mockSong) {
      console.log('Using mock song details for ID:', id);
      return mockSong;
    }
    
    try {
      // Try with allorigins.win which allows CORS
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.songsterr.com/a/ra/song.json?id=${id}`)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch song details');
      }
      
      return await response.json();
    } catch (corsError) {
      console.error('CORS error fetching song details:', corsError);
      // Fall back to mock data
      return mockSong;
    }
  } catch (error) {
    console.error('Error fetching song details:', error);
    // Return mock data as fallback
    return getMockSongById(id);
  }
}

/**
 * Extract song information from Songsterr data
 * @param {Object} songData - Songsterr song data
 * @returns {Object} - Formatted song info
 */
export function extractSongInfo(songData) {
  if (!songData) return null;
  
  // Make a best guess at some properties
  const hasSoloGuitar = songData.tracks?.some(track => 
    track.instrument === 'guitar' && track.name?.toLowerCase().includes('solo'));
  
  const bpm = songData.bpm || 120;
  
  // Estimate difficulty (1-5) based on presence of solos, fast tempo, etc.
  let difficulty = 3; // Default medium difficulty
  if (hasSoloGuitar) difficulty = 5;
  else if (bpm > 160) difficulty = 4;
  else if (bpm < 90) difficulty = 2;
  
  return {
    title: songData.title || 'Unknown Title',
    artist: songData.artist?.name || 'Unknown Artist',
    songsterrId: songData.id,
    tempo: bpm,
    difficulty,
    // These are placeholder values since Songsterr API doesn't provide them
    genre: 'Rock', // Default genre
    keySignature: 'C', // Default key
    album: songData.album || 'Unknown Album'
  };
}

/**
 * Search for tabs by artist and title
 * Uses the bestMatchForQueryString endpoint for reliable results
 * @param {string} artist - The artist name
 * @param {string} title - The song title
 * @returns {string} - The search URL
 */
export function searchSongsterrTabs(artist, title) {
  return `https://www.songsterr.com/a/wa/bestMatchForQueryString?s=${encodeURIComponent(title)}&a=${encodeURIComponent(artist)}`;
}

/**
 * Perform a DuckDuckGo search to find the direct Songsterr tab URL for a song and artist.
 * Falls back to scraping search results if no mapping or Songsterr search result is found.
 * @param {string} songTitle - The song title
 * @param {string} artist - The artist name (optional)
 * @returns {Promise<string|null>} - The direct Songsterr tab URL, or null if not found
 */
export async function getCleanSongsterrTabLinkViaSearch(songTitle, artist = '') {
  const query = `site:songsterr.com ${songTitle}${artist ? ` ${artist}` : ''}`;
  const encodedQuery = encodeURIComponent(query);
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
  const headers = { 'User-Agent': 'Mozilla/5.0' };

  try {
    const response = await fetch(searchUrl, { headers });
    const html = await response.text();
    const $ = cheerio.load(html);

    let foundUrl = null;
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('songsterr.com') && href.includes('uddg=')) {
        const urlObj = new URL(href, 'https://html.duckduckgo.com');
        const uddg = urlObj.searchParams.get('uddg');
        if (uddg) {
          foundUrl = decodeURIComponent(uddg);
          return false; // break out of .each
        }
      } else if (href && href.includes('songsterr.com') && href.includes('tab')) {
        foundUrl = href;
        return false;
      }
    });
    return foundUrl;
  } catch (err) {
    console.error('Error fetching Songsterr tab link via search:', err);
    return null;
  }
}

/**
 * Get the best available Songsterr tab URL for a song, trying mapping, Songsterr search, and DuckDuckGo fallback.
 * @param {string} artist - The song artist
 * @param {string} title - The song title
 * @param {string|null} songId - Optional Songsterr ID
 * @returns {Promise<string|null>} - The best Songsterr tab URL, or null if not found
 */
export async function getBestSongsterrTabUrl(artist, title, songId = null) {
  console.log(`[getBestSongsterrTabUrl] Finding tab for: ${artist} - ${title}, ID: ${songId || 'none'}`);
  
  if (!artist || !title) {
    console.warn('[getBestSongsterrTabUrl] Missing artist or title');
    return `https://www.songsterr.com/a/wa/search?pattern=${encodeURIComponent(title || '')}`;
  }

  // 1. Try static mapping or direct ID
  const browserUrl = getSongsterrBrowserUrl(artist, title, songId);
  console.log(`[getBestSongsterrTabUrl] Browser URL: ${browserUrl}`);
  
  // If the URL is not a search URL, it's a direct tab link
  if (!browserUrl.includes('/bestMatchForQueryString')) {
    console.log(`[getBestSongsterrTabUrl] Using direct URL: ${browserUrl}`);
    return browserUrl;
  }

  // 2. Try Songsterr's own search endpoint (bestMatchForQueryString)
  // Follow the redirect to get the final tab URL
  try {
    console.log(`[getBestSongsterrTabUrl] Trying Songsterr search...`);
    const response = await fetch(browserUrl, { method: 'GET', redirect: 'manual' });
    
    // If the response is a redirect, get the Location header
    if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
      const location = response.headers.get('location');
      // If the location is a direct Songsterr tab URL, return it
      if (location && location.includes('/a/wsa/')) {
        // Songsterr returns relative URLs, so prepend the domain if needed
        const finalUrl = location.startsWith('http') ? location : `https://www.songsterr.com${location}`;
        console.log(`[getBestSongsterrTabUrl] Found via redirect: ${finalUrl}`);
        return finalUrl;
      }
    }
  } catch (err) {
    console.error('[getBestSongsterrTabUrl] Error following redirect:', err);
  }

  // 3. Fallback: DuckDuckGo search for the best tab link
  console.log(`[getBestSongsterrTabUrl] Trying DuckDuckGo search...`);
  const fallbackUrl = await getCleanSongsterrTabLinkViaSearch(title, artist);
  if (fallbackUrl) {
    console.log(`[getBestSongsterrTabUrl] Found via search: ${fallbackUrl}`);
    return fallbackUrl;
  }

  // If all else fails, return the Songsterr search page
  console.log(`[getBestSongsterrTabUrl] Using fallback search URL: ${browserUrl}`);
  return browserUrl;
}

/**
 * Full search and extract flow to get complete song data
 * @param {string} query - Search query
 * @returns {Promise<Object>} - Complete song data
 */
export async function getCompleteSongData(query) {
  try {
    // Handle direct ID input
    if (/^\d+$/.test(query)) {
      const songDetails = await getSongsterrDetails(Number(query));
      return extractSongInfo(songDetails);
    }
    
    // Search for songs
    const searchResults = await searchSongsterr(query);
    
    if (!searchResults || searchResults.length === 0) {
      // Try with a simplified query (remove special characters)
      const simplifiedQuery = query.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
      if (simplifiedQuery !== query) {
        const simplifiedResults = await searchSongsterr(simplifiedQuery);
        if (simplifiedResults && simplifiedResults.length > 0) {
          const topResult = simplifiedResults[0];
          const songDetails = await getSongsterrDetails(topResult.id);
          return extractSongInfo(songDetails || topResult);
        }
      }
      return null;
    }
    
    // Get the top result
    const topResult = searchResults[0];
    
    // Get detailed song info
    const songDetails = await getSongsterrDetails(topResult.id);
    
    // Return formatted data
    return extractSongInfo(songDetails || topResult);
  } catch (error) {
    console.error('Error in complete song flow:', error);
    return null;
  }
}

/**
 * Mock data for common songs to ensure we always have results
 * @param {string} query - Search query
 * @returns {Array} - Mock search results
 */
function getMockData(query) {
  const mockSongs = [
    {
      id: 39,
      title: "House Of The Rising Sun",
      artist: { name: "The Animals", id: 4 },
      tracks: [{ instrument: "guitar" }]
    },
    {
      id: 406,
      title: "Wonderwall",
      artist: { name: "Oasis", id: 37 },
      tracks: [{ instrument: "guitar" }]
    },
    {
      id: 221,
      title: "Nothing Else Matters",
      artist: { name: "Metallica", id: 15 },
      tracks: [{ instrument: "guitar" }]
    },
    {
      id: 393,
      title: "Stairway To Heaven",
      artist: { name: "Led Zeppelin", id: 7 },
      tracks: [{ instrument: "guitar" }]
    },
    {
      id: 12345,
      title: "Sweet Home Alabama",
      artist: { name: "Lynyrd Skynyrd", id: 26 },
      tracks: [{ instrument: "guitar" }]
    },
    {
      id: 5978,
      title: "Smoke On The Water",
      artist: { name: "Deep Purple", id: 130 },
      tracks: [{ instrument: "guitar" }]
    },
    {
      id: 1234,
      title: "Hotel California",
      artist: { name: "Eagles", id: 18 },
      tracks: [{ instrument: "guitar" }]
    }
  ];

  // Return matches based on the query
  return mockSongs.filter(song => {
    const songName = song.title.toLowerCase();
    const artistName = song.artist.name.toLowerCase();
    
    return songName.includes(query) || 
           artistName.includes(query) || 
           `${artistName} ${songName}`.includes(query);
  });
}

/**
 * Get mock song details by ID
 * @param {number} id - Song ID
 * @returns {Object|null} - Mock song details
 */
function getMockSongById(id) {
  const mockSongs = {
    39: {
      id: 39,
      title: "House Of The Rising Sun",
      artist: { name: "The Animals", id: 4 },
      bpm: 80,
      tracks: [{ instrument: "guitar", name: "Guitar" }],
      album: "The Animals"
    },
    406: {
      id: 406,
      title: "Wonderwall",
      artist: { name: "Oasis", id: 37 },
      bpm: 87,
      tracks: [{ instrument: "guitar", name: "Guitar" }],
      album: "(What's the Story) Morning Glory?"
    },
    221: {
      id: 221,
      title: "Nothing Else Matters",
      artist: { name: "Metallica", id: 15 },
      bpm: 69,
      tracks: [{ instrument: "guitar", name: "Guitar" }],
      album: "Metallica (The Black Album)"
    },
    393: {
      id: 393,
      title: "Stairway To Heaven",
      artist: { name: "Led Zeppelin", id: 7 },
      bpm: 82,
      tracks: [{ instrument: "guitar", name: "Guitar" }, { instrument: "guitar", name: "Solo Guitar" }],
      album: "Led Zeppelin IV"
    },
    12345: {
      id: 12345,
      title: "Sweet Home Alabama",
      artist: { name: "Lynyrd Skynyrd", id: 26 },
      bpm: 97,
      tracks: [{ instrument: "guitar", name: "Guitar" }],
      album: "Second Helping"
    },
    5978: {
      id: 5978,
      title: "Smoke On The Water",
      artist: { name: "Deep Purple", id: 130 },
      bpm: 112,
      tracks: [{ instrument: "guitar", name: "Guitar" }],
      album: "Machine Head"
    },
    1234: {
      id: 1234,
      title: "Hotel California",
      artist: { name: "Eagles", id: 18 },
      bpm: 75,
      tracks: [{ instrument: "guitar", name: "Guitar" }],
      album: "Hotel California"
    }
  };
  
  return mockSongs[id] || null;
}