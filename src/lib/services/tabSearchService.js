/**
 * Tab Search Service
 * Uses DuckDuckGo search to find guitar tabs on Ultimate Guitar and provides
 * tab search capabilities within the application's tab library
 */

import { getTabForSong } from './tabFetcherService';

// Sample tab data for development
const sampleTabs = [
  { songId: '654321', title: 'Stairway to Heaven', artist: 'Led Zeppelin', difficulty: 'Intermediate', style: 'Rock' },
  { songId: '123456', title: 'Wonderwall', artist: 'Oasis', difficulty: 'Beginner', style: 'Pop' },
  { songId: '789012', title: 'Sweet Child O\'Mine', artist: 'Guns N\' Roses', difficulty: 'Advanced', style: 'Rock' },
  { songId: '345678', title: 'Hotel California', artist: 'Eagles', difficulty: 'Intermediate', style: 'Rock' },
  { songId: '901234', title: 'Nothing Else Matters', artist: 'Metallica', difficulty: 'Advanced', style: 'Metal' },
  { songId: '567890', title: 'Wish You Were Here', artist: 'Pink Floyd', difficulty: 'Intermediate', style: 'Rock' },
  { songId: '234567', title: 'Blackbird', artist: 'The Beatles', difficulty: 'Intermediate', style: 'Folk' },
  { songId: '890123', title: 'Tears in Heaven', artist: 'Eric Clapton', difficulty: 'Intermediate', style: 'Blues' },
  { songId: '456789', title: 'Smells Like Teen Spirit', artist: 'Nirvana', difficulty: 'Beginner', style: 'Rock' },
  { songId: '987654', title: 'Autumn Leaves', artist: 'Joseph Kosma', difficulty: 'Advanced', style: 'Jazz' }
];

/**
 * Search for tabs in the application's tab library
 * @param {string} query - Search query (artist or song)
 * @param {object} options - Search options including filters
 * @returns {Promise<Array>} - Array of matching tab objects
 */
export async function searchTabs(query = '', options = {}) {
  console.log(`[TabSearch] Searching tabs with query: "${query}"`, options);
  
  try {
    // In a real app, this would be an API call to the backend
    // For now, we'll use the sample data and filter it
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let results = [...sampleTabs];
    
    // Apply search query if provided
    if (query && query.trim() !== '') {
      const normalizedQuery = query.toLowerCase();
      results = results.filter(tab => 
        tab.title.toLowerCase().includes(normalizedQuery) ||
        tab.artist.toLowerCase().includes(normalizedQuery)
      );
    }
    
    // Apply difficulty filter
    if (options.difficulty && options.difficulty !== 'all') {
      results = results.filter(tab => 
        tab.difficulty.toLowerCase() === options.difficulty.toLowerCase()
      );
    }
    
    // Apply style filter
    if (options.style && options.style !== 'all') {
      results = results.filter(tab => 
        tab.style.toLowerCase() === options.style.toLowerCase()
      );
    }
    
    // Apply limit if specified
    if (options.limit && Number.isInteger(options.limit)) {
      results = results.slice(0, options.limit);
    }
    
    console.log(`[TabSearch] Found ${results.length} matching tabs`);
    return results;
  } catch (error) {
    console.error('[TabSearch] Error searching tabs:', error);
    throw error;
  }
}

/**
 * Fetch a specific tab by ID
 * @param {string} tabId - The tab ID to fetch
 * @returns {Promise<object|null>} - Tab data object or null if not found
 */
export async function getTabById(tabId) {
  // First, try to parse the tabId if it's in the format "artist-title-id"
  const parts = tabId.split('-');
  let songId = tabId;
  let artist = '';
  let title = '';
  
  // If the tabId includes at least 3 parts, assume it's in the format we expect
  if (parts.length >= 3) {
    songId = parts[parts.length - 1]; // Last part is the ID
    artist = parts[0].replace(/-/g, ' '); // First part is artist
    title = parts.slice(1, parts.length - 1).join(' ').replace(/-/g, ' '); // Middle parts are title
  }
  
  // For development, check if this matches any sample tab
  const sampleMatch = sampleTabs.find(tab => tab.songId === songId);
  
  if (sampleMatch) {
    return sampleMatch;
  }
  
  try {
    // Try to fetch tab data using the tabFetcherService
    if (artist && title) {
      const tabData = await getTabForSong(artist, title);
      if (tabData) {
        return {
          songId,
          artist,
          title,
          ...tabData
        };
      }
    }
    
    // If we get here, no tab was found
    return null;
  } catch (error) {
    console.error(`[TabSearch] Error getting tab by ID ${tabId}:`, error);
    return null;
  }
}

/**
 * Search for Ultimate Guitar tabs using DuckDuckGo
 * @param {string} songTitle - The song title to search for
 * @param {string} artistName - The artist name
 * @returns {Promise<string|null>} - URL of the best matching tab or null if not found
 */
export async function search_ug_link(songTitle, artistName = "") {
  const query = `"${songTitle}${artistName ? ` - ${artistName}` : ""}" site:ultimate-guitar.com`;
  console.log(`[TabSearch] Searching for: ${query}`);
  
  try {
    // Call our API route that handles DuckDuckGo search
    const response = await fetch(`/api/search/duckduckgo?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Look for tabs results from the search
    for (const result of data.results || []) {
      // Filter for actual tab pages, not chords or other content
      if (result.url && (
          result.url.includes('tabs-') || 
          result.url.includes('/tab/') || 
          result.url.includes('/tabs/')
        ) &&
        !result.url.includes('chords') &&
        !result.url.includes('forum') &&
        !result.url.includes('video')
      ) {
        console.log(`[TabSearch] Found UG tab: ${result.url}`);
        return result.url;
      }
    }
    
    console.log('[TabSearch] No suitable tabs found in search results');
    return null;
  } catch (error) {
    console.error('[TabSearch] DuckDuckGo search error:', error);
    return null;
  }
}

/**
 * Search for a YouTube video for the song
 * @param {string} songTitle - The song title to search for
 * @param {string} artistName - The artist name
 * @returns {Promise<string|null>} - URL of the YouTube video or null if not found
 */
export async function search_youtube_link(songTitle, artistName = "") {
  const query = `"${songTitle}${artistName ? ` - ${artistName}` : ""}" official video site:youtube.com`;
  console.log(`[TabSearch] Searching YouTube: ${query}`);
  
  try {
    // Call our API route that handles DuckDuckGo search
    const response = await fetch(`/api/search/duckduckgo?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Look for YouTube video in search results
    for (const result of data.results || []) {
      if (result.url && result.url.includes('youtube.com/watch')) {
        console.log(`[TabSearch] Found YouTube video: ${result.url}`);
        return result.url;
      }
    }
    
    console.log('[TabSearch] No YouTube videos found in search results');
    return null;
  } catch (error) {
    console.error('[TabSearch] YouTube search error:', error);
    return null;
  }
} 