/**
 * Music Discovery API
 * This service provides unified access to multiple music APIs and intelligent web search
 * for an enhanced "one-click" song discovery experience.
 */

import { searchSongsterr, getSongsterrDetails, extractSongInfo } from './songsterrApi';
import { searchUberchord, getUberchordSongDetails, getSongKeyAndBPM } from './uberchordApi';

// Web search capability for more accurate song information
async function webSearchSongInfo(query) {
  try {
    // In a real implementation, this would use a proper web search API
    // For now, we'll simulate results with common music information sites
    const searchResults = [
      {
        title: `${query} - Ultimate Guitar`,
        url: `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(query)}`,
        content: `Find accurate tabs for ${query}. Ultimate Guitar has over 1 million tabs and chords for guitar, bass, ukulele and more.`
      },
      {
        title: `${query} - MusicNotes.com`,
        url: `https://www.musicnotes.com/search/${encodeURIComponent(query)}`,
        content: `Sheet music for ${query}. Get accurate information about key, BPM, and chords.`
      },
      {
        title: `${query} - Chordify`,
        url: `https://chordify.net/search/${encodeURIComponent(query)}`, 
        content: `Chords for ${query}. Automatically generated chord sheets for any song.`
      }
    ];

    // Extract potential song data from search results
    // In a real app, this would actually scrape or use APIs from music info sites
    return {
      title: query.split(' - ')[1] || query,
      artist: query.split(' - ')[0] || 'Unknown Artist',
      possibleKeys: ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm'],
      possibleGenres: ['Rock', 'Pop', 'Jazz', 'Blues', 'Country', 'Metal'],
      searchResults
    };
  } catch (error) {
    console.error('Web search error:', error);
    return null;
  }
}

/**
 * Analyze song name to extract artist and title
 */
function analyzeSongQuery(query) {
  // Check if query is in "Artist - Title" format
  if (query.includes(' - ')) {
    const [artist, title] = query.split(' - ').map(part => part.trim());
    return { artist, title, fullQuery: query };
  }
  
  // Try to guess if there's an artist name before a song
  // Common patterns: "Artist Name Song Title", "ArtistName - SongTitle"
  const words = query.split(' ');
  if (words.length > 2) {
    // This is a very simple heuristic - in a real app, we'd use ML models
    // to better identify artist/song boundaries when not explicitly marked
    const potentialSplitPoints = [];
    
    // Look for words that might indicate a boundary
    words.forEach((word, index) => {
      if (index === 0 || index === words.length - 1) return;
      
      // Words that might indicate end of artist name
      const boundaryWords = ['by', 'from', 'featuring', 'ft.', 'ft', 'feat.', 'feat'];
      if (boundaryWords.includes(word.toLowerCase())) {
        potentialSplitPoints.push(index);
      }
    });
    
    if (potentialSplitPoints.length > 0) {
      // Use the first boundary word as the split point
      const splitIndex = potentialSplitPoints[0];
      const artist = words.slice(0, splitIndex).join(' ');
      const title = words.slice(splitIndex + 1).join(' ');
      return { artist, title, fullQuery: query };
    }
  }
  
  // If we can't determine, treat the whole thing as the song title
  return { 
    artist: 'Unknown Artist', 
    title: query,
    fullQuery: query
  };
}

/**
 * One-click song discovery with multi-source intelligence
 * @param {string} query - User's search term (can be partial song name, artist + song, etc.)
 * @returns {Promise<Object>} - Complete song data with confidence score
 */
export async function discoverSong(query) {
  try {
    const queryInfo = analyzeSongQuery(query.trim());
    let songData = null;
    let confidence = 0;
    
    // Try Songsterr API first
    try {
      const songsterrResults = await searchSongsterr(queryInfo.fullQuery);
      
      if (songsterrResults && songsterrResults.length > 0) {
        const topResult = songsterrResults[0];
        const songDetails = await getSongsterrDetails(topResult.id);
        songData = extractSongInfo(songDetails || topResult);
        
        if (songData) {
          confidence += 40; // Base confidence for finding a match
          
          // Try to enhance with Uberchord
          try {
            const searchQuery = `${songData.artist} ${songData.title}`;
            const uberchordResults = await searchUberchord(searchQuery);
            
            if (uberchordResults && uberchordResults.length > 0) {
              const topUberchordResult = uberchordResults[0];
              
              // Cross-reference data
              if (topUberchordResult.key && topUberchordResult.key !== 'Unknown Key') {
                songData.keySignature = topUberchordResult.key;
                confidence += 10;
              }
              
              if (topUberchordResult.genre && topUberchordResult.genre !== 'Unknown Genre') {
                songData.genre = topUberchordResult.genre;
                confidence += 5;
              }
              
              if (topUberchordResult.album && topUberchordResult.album !== 'Unknown Album') {
                songData.album = topUberchordResult.album;
                confidence += 5;
              }
              
              // Add chord information if available
              if (topUberchordResult.chords && topUberchordResult.chords.length > 0) {
                songData.chords = topUberchordResult.chords;
                confidence += 10;
              }
            }
          } catch (error) {
            console.error('Uberchord enhancement error:', error);
          }
        }
      }
    } catch (songsterrError) {
      console.error('Songsterr discovery error:', songsterrError);
    }
    
    // If we don't have data or confidence is low, try web search as a fallback
    if (!songData || confidence < 50) {
      try {
        const webSearchData = await webSearchSongInfo(queryInfo.fullQuery);
        
        if (webSearchData) {
          // If we don't have any song data yet, use the web search data
          if (!songData) {
            songData = {
              title: webSearchData.title,
              artist: webSearchData.artist,
              songsterrId: null, // No Songsterr ID from web search
              tempo: 120, // Default
              difficulty: 3, // Default medium difficulty
              genre: webSearchData.possibleGenres[0], // Take first suggested genre
              keySignature: webSearchData.possibleKeys[0], // Take first suggested key
              album: 'Unknown Album',
              relatedLinks: webSearchData.searchResults.map(result => ({
                title: result.title,
                url: result.url
              }))
            };
            confidence = 30; // Lower base confidence for web search
          } else {
            // Enhance existing data with web search results
            songData.relatedLinks = webSearchData.searchResults.map(result => ({
              title: result.title,
              url: result.url
            }));
            confidence += 5; // Small boost for having related links
          }
        }
      } catch (webSearchError) {
        console.error('Web search fallback error:', webSearchError);
      }
    }
    
    // If we still don't have data, create a placeholder with the query info
    if (!songData) {
      songData = {
        title: queryInfo.title,
        artist: queryInfo.artist,
        songsterrId: null,
        tempo: 120,
        difficulty: 3,
        genre: 'Rock', // Default
        keySignature: 'C', // Default
        album: 'Unknown Album',
        generatedFromQuery: true // Flag that this was generated from query
      };
      confidence = 20; // Very low confidence for generated data
    }
    
    // Calculate final confidence (capped at 100)
    songData.confidence = Math.min(confidence, 100);
    
    // Add useful flags
    songData.hasAccurateInfo = confidence > 60;
    songData.requiresReview = confidence < 50;
    
    return songData;
  } catch (error) {
    console.error('Song discovery error:', error);
    // Return basic info derived from query as fallback
    const queryInfo = analyzeSongQuery(query);
    return {
      title: queryInfo.title,
      artist: queryInfo.artist,
      confidence: 10,
      hasAccurateInfo: false,
      requiresReview: true,
      generatedFromQuery: true,
      error: error.message
    };
  }
}

/**
 * Get learning resources for a song
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @returns {Promise<Object>} - Learning resources for the song
 */
export async function getSongLearningResources(artist, title) {
  try {
    const query = `${artist} ${title}`;
    const resources = {
      tutorials: [],
      chordSheets: [],
      tabs: [],
      videoLessons: [],
      tabVideos: [] // New category specifically for tab videos
    };
    
    // In a real implementation, we would:
    // 1. Search YouTube for tutorial videos
    // 2. Search for chord/tab PDFs or images
    // 3. Find lesson sites with specific tutorials
    
    // Simulate results for now
    resources.tutorials = [
      {
        title: `How to play ${title} by ${artist} - Beginner Tutorial`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title} guitar tutorial beginner`)}`,
        source: 'YouTube',
        level: 'Beginner'
      },
      {
        title: `${title} by ${artist} - Advanced Breakdown`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title} guitar advanced breakdown`)}`,
        source: 'YouTube',
        level: 'Advanced'
      }
    ];
    
    resources.chordSheets = [
      {
        title: `${title} - Chord Chart`,
        url: `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(query)}`,
        source: 'Ultimate Guitar'
      }
    ];
    
    resources.tabs = [
      {
        title: `${title} - Guitar Tab`,
        url: `https://www.songsterr.com/a/wa/search?pattern=${encodeURIComponent(query)}`,
        source: 'Songsterr'
      }
    ];
    
    resources.videoLessons = [
      {
        title: `Learn ${title} by ${artist}`,
        url: `https://www.martymusic.com/search?q=${encodeURIComponent(query)}`,
        source: 'MartyMusic'
      }
    ];
    
    // Add specific tab videos
    resources.tabVideos = [
      {
        title: `${title} - Guitar Tab Playthrough`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title} guitar tab playthrough`)}`,
        source: 'YouTube',
        type: 'playthrough'
      },
      {
        title: `${title} - Scrolling Tab Tutorial`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title} scrolling guitar tab`)}`,
        source: 'YouTube',
        type: 'scrolling'
      }
    ];
    
    return resources;
  } catch (error) {
    console.error('Error getting learning resources:', error);
    return {
      tutorials: [],
      chordSheets: [],
      tabs: [],
      videoLessons: [],
      tabVideos: []
    };
  }
} 