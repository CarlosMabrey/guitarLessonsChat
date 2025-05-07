/**
 * Song Link Service
 * 
 * Automated fetching of Spotify, YouTube, and Songsterr IDs/links for songs.
 * This service provides a unified interface to automatically enrich song data.
 */

import { searchSongsterr, getSongsterrDetails } from './songsterrApi';
import { findBestSpotifyTrack, getMockSpotifyTrack } from './services/spotifyApi';
import { findSongLessons, findSongVideos, getMockYoutubeVideos } from './services/youtubeApi';
import { API_CONFIG, DEBUG } from './config';

/**
 * Main function to automatically fetch all resources for a song
 * @param {string} artist - The song artist
 * @param {string} title - The song title
 * @returns {Promise<Object>} - Object containing songsterrId, spotifyId, and youtubeVideos
 */
export async function fetchAllSongLinks(artist, title) {
  try {
    if (DEBUG.LOG_API_CALLS) {
      console.log(`[Song Link Service] Fetching all links for: ${artist} - ${title}`);
    }
    
    // Run all fetches in parallel for better performance
    const [songsterrData, spotifyData, youtubeData] = await Promise.all([
      fetchSongsterrId(artist, title),
      fetchSpotifyId(artist, title),
      fetchYoutubeVideos(artist, title)
    ]);

    return {
      songsterrId: songsterrData?.id || null,
      spotifyId: spotifyData?.id || null,
      youtubeVideos: youtubeData?.videos || []
    };
  } catch (error) {
    console.error('Error fetching song links:', error);
    return {
      songsterrId: null,
      spotifyId: null,
      youtubeVideos: []
    };
  }
}

/**
 * Fetch Songsterr ID for a song
 * @param {string} artist - The song artist
 * @param {string} title - The song title
 * @returns {Promise<Object>} - Object containing id and additional metadata
 */
export async function fetchSongsterrId(artist, title) {
  try {
    if (DEBUG.LOG_API_CALLS) {
      console.log(`[Song Link Service] Fetching Songsterr ID for: ${artist} - ${title}`);
    }
    
    // Reuse existing songsterr API functionality
    const query = `${artist} ${title}`;
    const searchResults = await searchSongsterr(query);
    
    if (!searchResults || searchResults.length === 0) {
      return null;
    }
    
    // Find best match by comparing artist and title
    const bestMatch = findBestMatch(searchResults, artist, title);
    
    if (bestMatch) {
      // Get more details if available
      try {
        const details = await getSongsterrDetails(bestMatch.id);
        return {
          id: bestMatch.id,
          title: details?.title || bestMatch.title,
          artist: details?.artist?.name || bestMatch.artist?.name,
          metadata: details
        };
      } catch (err) {
        // Return just the basic data if details fetch fails
        return {
          id: bestMatch.id,
          title: bestMatch.title,
          artist: bestMatch.artist?.name
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Songsterr ID:', error);
    return null;
  }
}

/**
 * Fetch Spotify ID for a song
 * @param {string} artist - The song artist
 * @param {string} title - The song title
 * @returns {Promise<Object>} - Object containing id and additional metadata
 */
export async function fetchSpotifyId(artist, title) {
  try {
    if (DEBUG.LOG_API_CALLS) {
      console.log(`[Song Link Service] Fetching Spotify ID for: ${artist} - ${title}`);
    }
    
    // Check if we should use the real Spotify API
    if (API_CONFIG.USE_REAL_APIS.SPOTIFY) {
      console.log('Using real Spotify API for:', artist, title);
      
      // Use the real Spotify API implementation
      const trackData = await findBestSpotifyTrack(artist, title);
      
      if (trackData) {
        return {
          id: trackData.id,
          name: trackData.name,
          artist: trackData.artist,
          album: trackData.album,
          popularity: trackData.popularity,
          albumImageUrl: trackData.albumImageUrl
        };
      }
      
      // Fall back to mock data if no results
      console.log('No Spotify results found, using mock data');
    }
    
    // Use mock implementation
    const mockSpotifyData = getMockSpotifyTrack(artist, title);
    
    // Simulate API delay only when using mock data
    if (!API_CONFIG.USE_REAL_APIS.SPOTIFY) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return mockSpotifyData;
  } catch (error) {
    console.error('Error fetching Spotify ID:', error);
    // Fall back to mock implementation in case of error
    return getMockSpotifyTrack(artist, title);
  }
}

/**
 * Fetch YouTube videos (tutorials, covers, etc.) for a song
 * @param {string} artist - The song artist
 * @param {string} title - The song title
 * @returns {Promise<Object>} - Object containing videos array and metadata
 */
export async function fetchYoutubeVideos(artist, title) {
  try {
    if (DEBUG.LOG_API_CALLS) {
      console.log(`[Song Link Service] Fetching YouTube videos for: ${artist} - ${title}`);
    }
    
    // Check if we should use the real YouTube API
    if (API_CONFIG.USE_REAL_APIS.YOUTUBE) {
      console.log('Using real YouTube API for:', artist, title);
      
      // Fetch both lessons and regular videos
      const [lessons, videos] = await Promise.all([
        findSongLessons(artist, title),
        findSongVideos(artist, title)
      ]);
      
      // Combine and prioritize lessons and videos
      const combinedVideos = [...lessons, ...videos];
      
      // If we found real videos, return them
      if (combinedVideos.length > 0) {
        return {
          query: `${artist} ${title}`,
          videos: combinedVideos.map(video => ({
            id: video.id,
            title: video.title,
            type: video.type,
            channelTitle: video.channelTitle,
            thumbnail: video.thumbnail
          }))
        };
      }
      
      // Fall back to mock data if no results
      console.log('No YouTube results found, using mock data');
    }
    
    // Use mock implementation
    const mockYoutubeData = getMockYoutubeVideos(artist, title);
    
    // Simulate API delay only when using mock data
    if (!API_CONFIG.USE_REAL_APIS.YOUTUBE) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return {
      query: `${artist} ${title}`,
      videos: mockYoutubeData.map(video => ({
        id: video.id,
        title: video.title,
        type: video.type,
        channelTitle: video.channelTitle,
        thumbnail: video.thumbnail
      }))
    };
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    // Fall back to mock implementation in case of error
    const mockYoutubeData = getMockYoutubeVideos(artist, title);
    return { 
      query: `${artist} ${title}`,
      videos: mockYoutubeData.map(video => ({
        id: video.id,
        title: video.title,
        type: video.type,
        channelTitle: video.channelTitle,
        thumbnail: video.thumbnail
      }))
    };
  }
}

/**
 * Helper function to find the best match from search results
 * @param {Array} results - Array of search results
 * @param {string} artist - Artist to match
 * @param {string} title - Title to match
 * @returns {Object|null} - Best matching result or null
 */
function findBestMatch(results, artist, title) {
  if (!results || results.length === 0) return null;
  
  // Normalize inputs for comparison
  const normalizeText = text => text.toLowerCase().trim();
  const artistNorm = normalizeText(artist);
  const titleNorm = normalizeText(title);
  
  // Initial scoring - exact matches get highest priority
  const scoredResults = results.map(result => {
    const resultArtist = normalizeText(result.artist?.name || '');
    const resultTitle = normalizeText(result.title || '');
    
    let score = 0;
    
    // Exact matches get high scores
    if (resultArtist === artistNorm) score += 50;
    if (resultTitle === titleNorm) score += 50;
    
    // Partial matches get lower scores
    if (resultArtist.includes(artistNorm) || artistNorm.includes(resultArtist)) score += 25;
    if (resultTitle.includes(titleNorm) || titleNorm.includes(resultTitle)) score += 25;
    
    // Word-level matching
    const artistWords = artistNorm.split(' ');
    const titleWords = titleNorm.split(' ');
    
    artistWords.forEach(word => {
      if (word.length > 2 && resultArtist.includes(word)) score += 5;
    });
    
    titleWords.forEach(word => {
      if (word.length > 2 && resultTitle.includes(word)) score += 5;
    });
    
    return { ...result, score };
  });
  
  // Sort by score (descending)
  scoredResults.sort((a, b) => b.score - a.score);
  
  // Return the highest scoring result (only if it has a minimum score)
  return scoredResults[0]?.score >= 30 ? scoredResults[0] : results[0];
} 