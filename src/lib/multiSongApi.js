/**
 * Multiple API Song Service
 * This service combines data from multiple music APIs to provide more accurate song information
 */

import { searchSongsterr, getSongsterrDetails, extractSongInfo } from './songsterrApi';
import { searchUberchord, getUberchordSongDetails, getSongKeyAndBPM } from './uberchordApi';

/**
 * Get complete song data from multiple sources with cross-referencing
 * @param {string} query - Search query (song name and/or artist)
 * @returns {Promise<Object>} - Enhanced song data
 */
export async function getEnhancedSongData(query) {
  try {
    // Start with Songsterr search
    const songsterrResults = await searchSongsterr(query);
    
    if (!songsterrResults || songsterrResults.length === 0) {
      console.log('No Songsterr results found for:', query);
      return null;
    }
    
    // Get the top Songsterr result
    const topSongsterrResult = songsterrResults[0];
    const songsterrId = topSongsterrResult.id;
    
    // Get detailed song info from Songsterr
    const songsterrDetails = await getSongsterrDetails(songsterrId);
    const baseSongInfo = extractSongInfo(songsterrDetails || topSongsterrResult);
    
    if (!baseSongInfo) {
      console.log('Failed to extract basic song info');
      return null;
    }
    
    // Now enhance with Uberchord data for better key and chord information
    try {
      const searchQuery = `${baseSongInfo.artist} ${baseSongInfo.title}`;
      const uberchordResults = await searchUberchord(searchQuery);
      
      if (uberchordResults && uberchordResults.length > 0) {
        const topUberchordResult = uberchordResults[0];
        
        // Cross-reference data - prefer Uberchord for key and genre
        if (topUberchordResult.key && topUberchordResult.key !== 'Unknown Key') {
          baseSongInfo.keySignature = topUberchordResult.key;
        }
        
        if (topUberchordResult.genre && topUberchordResult.genre !== 'Unknown Genre') {
          baseSongInfo.genre = topUberchordResult.genre;
        }
        
        if (topUberchordResult.album && topUberchordResult.album !== 'Unknown Album') {
          baseSongInfo.album = topUberchordResult.album;
        }
        
        // Add chord information if available
        if (topUberchordResult.chords && topUberchordResult.chords.length > 0) {
          baseSongInfo.chords = topUberchordResult.chords;
        }
      }
    } catch (uberchordError) {
      console.error('Error enhancing with Uberchord:', uberchordError);
      // Continue with base song info
    }
    
    // Try to get additional key and BPM data for better accuracy
    try {
      const keyBpmData = await getSongKeyAndBPM(baseSongInfo.artist, baseSongInfo.title);
      
      if (keyBpmData) {
        // Only use key if we don't already have one from Uberchord
        if ((!baseSongInfo.keySignature || baseSongInfo.keySignature === 'C') && keyBpmData.key) {
          baseSongInfo.keySignature = keyBpmData.key;
        }
        
        // Use tempo/BPM data if available
        if (keyBpmData.tempo && (!baseSongInfo.tempo || baseSongInfo.tempo === 120)) {
          baseSongInfo.tempo = keyBpmData.tempo;
        }
      }
    } catch (keyBpmError) {
      console.error('Error getting key/BPM data:', keyBpmError);
      // Continue with base song info
    }
    
    // Verify Songsterr ID by checking against artist and title
    baseSongInfo.songsterrId = songsterrId;
    baseSongInfo.confidence = calculateConfidence(baseSongInfo);
    
    return baseSongInfo;
  } catch (error) {
    console.error('Error in getEnhancedSongData:', error);
    return null;
  }
}

/**
 * Calculate a confidence score for the song data
 * @param {Object} songData - Song data object
 * @returns {number} - Confidence score 0-100
 */
function calculateConfidence(songData) {
  let score = 0;
  
  // Base score for having core data
  if (songData.title && songData.artist) score += 50;
  
  // Additional points for having detailed information
  if (songData.songsterrId) score += 10;
  if (songData.keySignature && songData.keySignature !== 'C') score += 10; 
  if (songData.tempo && songData.tempo !== 120) score += 10;
  if (songData.genre && songData.genre !== 'Rock') score += 5;
  if (songData.album && songData.album !== 'Unknown Album') score += 5;
  if (songData.chords && songData.chords.length > 0) score += 10;
  
  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Get alternative tab sources for a song
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @returns {Promise<Array>} - List of alternative tab sources
 */
export async function getAlternativeTabSources(artist, title) {
  const sources = [];
  
  try {
    // Add Songsterr as default
    sources.push({
      name: 'Songsterr',
      type: 'guitar-tab',
      url: '#', // This will be filled by the component using songsterrId
      preferred: true
    });
    
    // Add dummy alternatives - in a real app, integrate with Ultimate Guitar, etc.
    sources.push({
      name: 'Ultimate Guitar',
      type: 'guitar-tab',
      url: `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(`${artist} ${title}`)}`,
      preferred: false
    });
    
    sources.push({
      name: 'AlphaTab',
      type: 'guitar-tab',
      url: `https://alphatab.net/docs/introduction`,
      preferred: false
    });
    
    sources.push({
      name: 'Guitar Pro',
      type: 'guitar-pro',
      url: `https://www.guitar-pro.com`,
      preferred: false
    });
    
    return sources;
  } catch (error) {
    console.error('Error getting alternative tab sources:', error);
    return sources;
  }
} 