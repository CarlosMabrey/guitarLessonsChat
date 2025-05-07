/**
 * Tab Search Service
 * Uses DuckDuckGo search to find guitar tabs on Ultimate Guitar
 */

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