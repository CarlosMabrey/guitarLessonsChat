'use client';

import * as cheerio from 'cheerio';
import { getTabCache, setTabCache, createCacheKey } from './tabCacheService';
import { find_and_scrape_tab } from './tabScraperService';
import { parseTabNotation, countMeasures, estimateTabDifficulty } from '@/lib/parsers/tabNotationParser';

/**
 * Tab Fetcher Service
 * Provides methods to fetch guitar tabs from various sources like Ultimate Guitar
 */

// Cache expiration time (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Fallback sample tab data for development/demo purposes
const SAMPLE_TABS = {
  'Sweet Child O Mine': {
    artist: 'Guns N\' Roses',
    title: 'Sweet Child O\' Mine',
    tuning: 'Standard',
    notes: [
      { positions: [{ str: 1, fret: 0 }, { str: 2, fret: 1 }, { str: 3, fret: 0 }, { str: 4, fret: 2 }, { str: 5, fret: 3 }, { str: 6, fret: 0 }], duration: 'q' },
      { positions: [{ str: 1, fret: 3 }, { str: 2, fret: 0 }, { str: 3, fret: 0 }, { str: 4, fret: 0 }, { str: 5, fret: 2 }, { str: 6, fret: 3 }], duration: 'q' },
      { positions: [{ str: 1, fret: 2 }, { str: 2, fret: 0 }, { str: 3, fret: 0 }, { str: 4, fret: 0 }, { str: 5, fret: 2 }, { str: 6, fret: 2 }], duration: 'q' },
      { positions: [{ str: 1, fret: 0 }, { str: 2, fret: 1 }, { str: 3, fret: 2 }, { str: 4, fret: 2 }, { str: 5, fret: 0 }, { str: 6, fret: 0 }], duration: 'q' },
    ],
  },
  'Stairway to Heaven': {
    artist: 'Led Zeppelin',
    title: 'Stairway to Heaven',
    tuning: 'Standard',
    notes: [
      { positions: [{ str: 1, fret: 7 }, { str: 2, fret: 8 }], duration: 'q' },
      { positions: [{ str: 1, fret: 5 }, { str: 2, fret: 5 }], duration: 'q' },
      { positions: [{ str: 1, fret: 5 }, { str: 2, fret: 7 }], duration: 'q' },
      { positions: [{ str: 1, fret: 5 }, { str: 2, fret: 8 }, { str: 3, fret: 7 }], duration: 'q' },
    ],
  },
  'Smells Like Teen Spirit': {
    artist: 'Nirvana',
    title: 'Smells Like Teen Spirit',
    tuning: 'Standard',
    notes: [
      { positions: [{ str: 6, fret: 0 }], duration: 'q' },
      { positions: [{ str: 5, fret: 2 }], duration: 'q' },
      { positions: [{ str: 4, fret: 2 }], duration: 'q' },
      { positions: [{ str: 6, fret: 0 }, { str: 5, fret: 2 }, { str: 4, fret: 2 }], duration: 'q' },
    ],
  },
  'Gored': {
    artist: 'Loathe',
    title: 'Gored',
    tuning: 'Drop B',
    notes: [
      { positions: [{ str: 6, fret: 0 }], duration: '8' },
      { positions: [{ str: 6, fret: 1 }], duration: '8' },
      { positions: [{ str: 6, fret: 0 }], duration: '8' },
      { positions: [{ str: 6, fret: 3 }], duration: '8' },
      { positions: [{ str: 5, fret: 0 }], duration: '8' },
      { positions: [{ str: 5, fret: 1 }], duration: '8' },
      { positions: [{ str: 5, fret: 0 }], duration: '8' },
      { positions: [{ str: 5, fret: 3 }], duration: '8' },
    ],
  },
  'Brown Eyed Girl': {
    artist: 'Van Morrison',
    title: 'Brown Eyed Girl',
    tuning: 'Standard',
    notes: [
      // Main riff
      { positions: [{ str: 4, fret: 2 }], duration: '8' },
      { positions: [{ str: 3, fret: 0 }], duration: '8' },
      { positions: [{ str: 2, fret: 1 }], duration: '8' },
      { positions: [{ str: 2, fret: 3 }], duration: '8' },
      
      // G chord
      { positions: [{ str: 6, fret: 3 }, { str: 5, fret: 2 }, { str: 4, fret: 0 }, { str: 3, fret: 0 }, { str: 2, fret: 0 }, { str: 1, fret: 3 }], duration: 'q' },
      
      // C chord
      { positions: [{ str: 5, fret: 3 }, { str: 4, fret: 2 }, { str: 3, fret: 0 }, { str: 2, fret: 1 }, { str: 1, fret: 0 }], duration: 'q' },
      
      // G chord
      { positions: [{ str: 6, fret: 3 }, { str: 5, fret: 2 }, { str: 4, fret: 0 }, { str: 3, fret: 0 }, { str: 2, fret: 0 }, { str: 1, fret: 3 }], duration: 'q' },
      
      // D chord
      { positions: [{ str: 4, fret: 0 }, { str: 3, fret: 2 }, { str: 2, fret: 3 }, { str: 1, fret: 2 }], duration: 'q' },
    ],
    source: {
      type: 'sample',
      description: 'Classic Van Morrison song with distinctive intro riff.',
      rawContent: `e|-------------------|-------------------|
B|------1-3---------|-------------------|
G|--0---------------|-------------------|
D|--------2---------|-------------------|
A|-------------------|-------------------|
E|-------------------|-------------------|

G            C              G               D
Hey where did we go,      days when the rains came  
G            C                 G           D
Down in the hollow,      playin' a new game`
    }
  }
};

/**
 * Get tab data for a song using API
 * @param {string} artist - Song artist
 * @param {string} title - Song title
 * @returns {Promise<Object>} - Tab data object or null if not found
 */
export async function getTabForSong(artist, title) {
  console.log(`[TabFetcher] Searching for tabs: ${artist} - ${title}`);
  
  // Check cache first
  const cacheKey = createCacheKey(artist, title);
  const cachedData = getTabCache(cacheKey);
  
  if (cachedData) {
    console.log(`[TabFetcher] Found tab in cache: ${title}`);
    
    // Convert tab data if needed
    if (cachedData.rawContent && !cachedData.notes) {
      return convertTabToNoteFormat(cachedData);
    }
    
    return cachedData;
  }
  
  try {
    // Check for hardcoded sample first - this is the most reliable method
    const sampleTab = getHardcodedTabForSong(title, artist);
    if (sampleTab) {
      console.log(`[TabFetcher] Found hardcoded tab for: ${title}`);
      
      // Cache the result
      setTabCache(cacheKey, sampleTab);
      
      return sampleTab;
    }
    
    // Try to scrape the tab using our new scraper
    console.log(`[TabFetcher] Trying to scrape tab for: ${artist} - ${title}`);
    const scrapedTab = await find_and_scrape_tab(title, artist);
    
    if (scrapedTab && scrapedTab.rawContent) {
      console.log(`[TabFetcher] Successfully scraped tab for: ${title}`);
      
      // Convert to the format expected by the renderer
      const formattedTab = convertTabToNoteFormat(scrapedTab);
      
      // Cache the result
      setTabCache(cacheKey, formattedTab);
      
      return formattedTab;
    }
    
    // If scraping fails, try the API
    console.log(`[TabFetcher] Scraping failed, trying API for: ${artist} - ${title}`);
    
    // Fetch from API
    const params = new URLSearchParams({
      artist,
      title,
      source: 'ultimate-guitar' // default source
    });
    
    const response = await fetch(`/api/tabs/fetch?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add error handling and timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    setTabCache(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error(`[TabFetcher] API error:`, error);
    
    // Fall back to sample data in case of API failure
    console.log(`[TabFetcher] Falling back to sample data`);
    const sampleTab = getHardcodedTabForSong(title, artist);
    
    if (sampleTab) {
      console.log(`[TabFetcher] Found tab in samples for: ${title}`);
      return sampleTab;
    }
    
    // Generate a basic tab if we don't have a sample
    console.log(`[TabFetcher] Generating basic tab for: ${title}`);
    return generateBasicTab(artist, title);
  }
}

/**
 * Check if we have a hardcoded tab for this song
 * @param {string} title - Song title
 * @param {string} artist - Artist name
 * @returns {Object|null} - Tab data or null if not found
 */
function getHardcodedTabForSong(title, artist) {
  // Normalize inputs for better matching
  const normalizedTitle = title.toLowerCase().trim();
  const normalizedArtist = artist.toLowerCase().trim();
  
  // First check for exact matches
  for (const [sampleKey, sampleData] of Object.entries(SAMPLE_TABS)) {
    if (sampleData.title.toLowerCase() === normalizedTitle && 
        sampleData.artist.toLowerCase().includes(normalizedArtist)) {
      return {
        ...sampleData,
        source: {
          type: 'sample',
          description: 'Pre-defined sample data',
          url: null
        }
      };
    }
  }
  
  // Then check for partial matches
  for (const [sampleKey, sampleData] of Object.entries(SAMPLE_TABS)) {
    if (normalizedTitle.includes(sampleKey.toLowerCase()) || 
        sampleKey.toLowerCase().includes(normalizedTitle)) {
      // Check artist match if available
      if (!normalizedArtist || 
          sampleData.artist.toLowerCase().includes(normalizedArtist) || 
          normalizedArtist.includes(sampleData.artist.toLowerCase())) {
        return {
          ...sampleData,
          source: {
            type: 'sample',
            description: 'Pre-defined sample data (partial match)',
            url: null
          }
        };
      }
    }
  }
  
  // Special cases for common songs with variations in naming
  if ((normalizedTitle.includes('sweet child') || normalizedTitle.includes('sweet')) && 
      (normalizedArtist.includes('guns') || normalizedArtist.includes('rose'))) {
    return {
      ...SAMPLE_TABS['Sweet Child O Mine'],
      source: {
        type: 'sample',
        description: 'Pre-defined sample data (special case match)',
          url: null
        }
      };
    }
    
  if ((normalizedTitle.includes('brown') && normalizedTitle.includes('girl')) || 
      (normalizedTitle.includes('eyed') && normalizedArtist.includes('morrison'))) {
    return {
      ...SAMPLE_TABS['Brown Eyed Girl'],
      source: {
        type: 'sample',
        description: 'Pre-defined sample data (special case match)',
        url: null
      }
    };
  }
  
  return null;
}

/**
 * Generate a basic tab with minimal content
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @returns {Object} - Basic tab data
 */
function generateBasicTab(artist, title) {
    return {
      artist,
      title,
      tuning: 'Standard',
      notes: [
        { positions: [{ str: 6, fret: 0 }], duration: 'q' },
        { positions: [{ str: 5, fret: 2 }], duration: 'q' },
        { positions: [{ str: 4, fret: 2 }], duration: 'q' },
        { positions: [{ str: 6, fret: 0 }, { str: 5, fret: 2 }, { str: 4, fret: 2 }], duration: 'q' },
      ],
      source: {
        type: 'generated',
        description: 'Auto-generated basic tab pattern',
        url: null
    }
  };
}

/**
 * Convert raw tab content to note format for rendering
 * @param {Object} tabData - Tab data with raw content
 * @returns {Object} - Tab data in note format
 */
function convertTabToNoteFormat(tabData) {
  const rawContent = tabData.rawContent;
  
  if (!rawContent) {
    console.warn('[TabFetcher] No raw content to convert');
    return tabData;
  }
  
  try {
    // Parse tab notation into notes
    const parsedNotes = parseTabNotation(rawContent);
    
    // If parsing succeeded, use the parsed notes
    if (parsedNotes && parsedNotes.length > 0) {
      console.log(`[TabFetcher] Successfully parsed ${parsedNotes.length} notes from tab`);
      
      return {
        title: tabData.title,
        artist: tabData.artist,
        tuning: tabData.tuning || 'Standard',
        notes: parsedNotes,
        measures: countMeasures(rawContent),
        source: {
          type: 'scraped',
          description: 'Parsed from Ultimate Guitar tab',
          url: tabData.url || null,
          rawContent: rawContent
        }
      };
    }
    
    // Otherwise, fall back to our difficulty-based approach
    console.log('[TabFetcher] Tab parsing failed, using difficulty-based fallback');
    const difficulty = estimateTabDifficulty(rawContent);
    
    let fallbackNotes = [];
    
    if (difficulty === 'easy') {
      fallbackNotes = [
        { positions: [{ str: 6, fret: 0 }], duration: 'q' },
        { positions: [{ str: 5, fret: 2 }], duration: 'q' },
        { positions: [{ str: 4, fret: 2 }], duration: 'q' },
        { positions: [{ str: 6, fret: 0 }, { str: 5, fret: 2 }, { str: 4, fret: 2 }], duration: 'q' },
      ];
    } else if (difficulty === 'medium') {
      fallbackNotes = [
        { positions: [{ str: 1, fret: 0 }, { str: 2, fret: 1 }, { str: 3, fret: 0 }, { str: 4, fret: 2 }, { str: 5, fret: 3 }, { str: 6, fret: 0 }], duration: 'q' },
        { positions: [{ str: 1, fret: 3 }, { str: 2, fret: 0 }, { str: 3, fret: 0 }, { str: 4, fret: 0 }, { str: 5, fret: 2 }, { str: 6, fret: 3 }], duration: 'q' },
        { positions: [{ str: 1, fret: 2 }, { str: 2, fret: 0 }, { str: 3, fret: 0 }, { str: 4, fret: 0 }, { str: 5, fret: 2 }, { str: 6, fret: 2 }], duration: 'q' },
        { positions: [{ str: 1, fret: 0 }, { str: 2, fret: 1 }, { str: 3, fret: 2 }, { str: 4, fret: 2 }, { str: 5, fret: 0 }, { str: 6, fret: 0 }], duration: 'q' },
      ];
    } else {
      // Hard
      fallbackNotes = [
        { positions: [{ str: 1, fret: 7 }, { str: 2, fret: 8 }], duration: '8' },
        { positions: [{ str: 1, fret: 5 }, { str: 2, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 5 }, { str: 2, fret: 7 }], duration: '8' },
        { positions: [{ str: 1, fret: 5 }, { str: 2, fret: 8 }, { str: 3, fret: 7 }], duration: '8' },
        { positions: [{ str: 1, fret: 7 }, { str: 2, fret: 8 }], duration: '8' },
        { positions: [{ str: 1, fret: 5 }, { str: 2, fret: 5 }], duration: '8' },
        { positions: [{ str: 1, fret: 5 }, { str: 2, fret: 7 }], duration: '8' },
        { positions: [{ str: 1, fret: 5 }, { str: 2, fret: 8 }, { str: 3, fret: 7 }], duration: '8' },
      ];
    }
    
    return {
      title: tabData.title,
      artist: tabData.artist,
      tuning: tabData.tuning || 'Standard',
      notes: fallbackNotes,
      measures: countMeasures(rawContent),
      source: {
        type: 'scraped',
        description: 'Fallback rendering based on tab difficulty',
        url: tabData.url || null,
        rawContent: rawContent
      }
    };
  } catch (e) {
    console.error('[TabFetcher] Error converting tab notation:', e);
    
    // Return the original data with a basic set of notes
    return {
      ...tabData,
      notes: [
        { positions: [{ str: 6, fret: 0 }], duration: 'q' },
        { positions: [{ str: 5, fret: 2 }], duration: 'q' },
        { positions: [{ str: 4, fret: 2 }], duration: 'q' },
        { positions: [{ str: 6, fret: 0 }, { str: 5, fret: 2 }, { str: 4, fret: 2 }], duration: 'q' },
      ],
      source: {
        ...tabData.source,
        description: 'Basic fallback rendering (conversion error)',
        rawContent: rawContent
      }
    };
  }
}

/**
 * Search for tabs using the API
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of tab results
 */
export async function searchUltimateGuitarTabs(query) {
  console.log(`[TabFetcher] Searching tabs for: ${query}`);
  
  try {
    // Build the API request URL
    const params = new URLSearchParams({
      q: query,
      limit: 20 // Request up to 20 results
    });
    
    const response = await fetch(`/api/tabs/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add error handling and timeout
      signal: AbortSignal.timeout(8000) // 8 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tabs || [];
  } catch (error) {
    console.error(`[TabFetcher] Search API error:`, error);
    
    // Fall back to sample data in case of API failure
    return Object.values(SAMPLE_TABS).filter(
      tab => tab.title.toLowerCase().includes(query.toLowerCase()) || 
             tab.artist.toLowerCase().includes(query.toLowerCase())
    );
  }
}

/**
 * Get a list of supported songs with tabs
 * @returns {Promise<Array>} - List of songs with available tabs
 */
export async function getAvailableTabs() {
  try {
    // Try to fetch from API
    const response = await fetch('/api/tabs/search?q=&limit=50', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add error handling and timeout
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tabs || [];
  } catch (error) {
    console.error(`[TabFetcher] Available tabs API error:`, error);
    
    // Fall back to sample data if API fails
    return Object.values(SAMPLE_TABS).map(tab => ({
      artist: tab.artist,
      title: tab.title,
      source: 'Sample Data',
      sourceUrl: tab.sourceUrl || null
    }));
  }
}

/**
 * Fetch tab by direct URL
 * @param {string} url - URL of the tab to fetch
 * @returns {Promise<Object|null>} - Tab data or null if not found
 */
export async function fetchTabByUrl(url) {
  console.log(`[TabFetcher] Fetching tab from URL: ${url}`);
  
  try {
    // Clean and normalize the URL
    url = normalizeUltimateGuitarUrl(url);
    
    // First check if this URL matches any of our hardcoded direct URLs
    const extractedInfo = extractSongInfoFromUrl(url);
    if (extractedInfo.artist && extractedInfo.title) {
      // Check if this matches a known song in our tabScraperService direct URL mappings
      const directTab = await findDirectTabMapping(extractedInfo.artist, extractedInfo.title);
      if (directTab) {
        console.log(`[TabFetcher] Found matching direct tab data for: ${extractedInfo.artist} - ${extractedInfo.title}`);
        return directTab;
      }
    }
    
    // Now attempt to use our scraper service directly
    if (url.includes('ultimate-guitar.com') || url.includes('songsterr.com')) {
      console.log(`[TabFetcher] Using direct scraper for URL: ${url}`);
      try {
        // Extract artist and title from URL if possible
        const urlSegments = url.split('/');
        const lastSegment = urlSegments[urlSegments.length - 1];
        const segments = lastSegment.split('-');
        
        let inferredArtist = '';
        let inferredTitle = '';
        
        // Try to extract artist and title info from URL
        if (segments.length > 2) {
          const artistEndIndex = segments.findIndex(s => s === 'tab' || s === 'tabs');
          if (artistEndIndex > 0) {
            inferredArtist = segments.slice(0, artistEndIndex).join(' ');
            inferredTitle = segments.slice(artistEndIndex + 1).join(' ').replace('.htm', '');
          }
        }
        
        // Extract tab content via our scraper service
        const response = await fetch('/api/tabs/scrape-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
          signal: AbortSignal.timeout(20000)
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.tabContent && data.tabContent.length > 100) {
            console.log(`[TabFetcher] Successfully scraped content from URL: ${url}`);
            
            // Extract metadata from HTML if available
            const metadata = extractMetadataFromHtml(data.html);
            
            // Use the best available information for the tab
            const artist = metadata.artist || extractedInfo.artist || inferredArtist || 'Unknown Artist';
            const title = metadata.title || extractedInfo.title || inferredTitle || 'Unknown Song';
            
            // Parse the raw content into notes
            const parsedNotes = parseTabNotation(data.tabContent);
            
            return {
              title: title,
              artist: artist,
              tuning: metadata.tuning || 'Standard',
              notes: parsedNotes.length > 0 ? parsedNotes : generateGenericNotes(),
              source: {
                type: 'scraped',
                description: 'Scraped from tab website',
                url: url,
                rawContent: data.tabContent
              }
            };
          }
        } else {
          // If scraping failed but we have extracted info, try to find a default tab
          if (extractedInfo.artist && extractedInfo.title) {
            console.log(`[TabFetcher] Scraping failed, trying to find default tab for: ${extractedInfo.artist} - ${extractedInfo.title}`);
            // Try to find tab using the artist and title
            return await getFallbackTabForSong(extractedInfo.artist, extractedInfo.title, url);
          }
        }
      } catch (scrapingError) {
        console.warn(`[TabFetcher] Direct scraping failed: ${scrapingError.message}`);
        
        // If we have extracted info, try to find a default tab
        if (extractedInfo.artist && extractedInfo.title) {
          console.log(`[TabFetcher] Trying to find default tab for: ${extractedInfo.artist} - ${extractedInfo.title}`);
          // Try to find tab using the artist and title
          return await getFallbackTabForSong(extractedInfo.artist, extractedInfo.title, url);
        }
        
        // Fall through to the API approach
      }
    }
    
    // Fall back to the API endpoint
    console.log(`[TabFetcher] Using API for URL: ${url}`);
    
    // Build the API request URL
    const params = new URLSearchParams({ url });
    
    const response = await fetch(`/api/tabs/fetch?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add error handling and timeout
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[TabFetcher] URL fetch error:`, error);
    
    // Try one more time with extracted info
    try {
      const extractedInfo = extractSongInfoFromUrl(url);
      if (extractedInfo.artist && extractedInfo.title) {
        return await getFallbackTabForSong(extractedInfo.artist, extractedInfo.title, url);
      }
    } catch (e) {
      // Ignore and continue to generic fallback
    }
    
    // Return a basic fallback tab
    return {
      artist: 'Unknown Artist',
      title: 'Unknown Song',
      tuning: 'Standard',
      notes: generateGenericNotes(),
      source: {
        type: 'error',
        description: 'Error fetching from URL: ' + error.message,
        url: url
      }
    };
  }
}

/**
 * Find a tab using direct mappings or from the tab scraper service
 * @param {string} artist - Artist name
 * @param {string} title - Song title 
 * @returns {Promise<Object|null>} - Tab data or null
 */
async function findDirectTabMapping(artist, title) {
  try {
    // Try to find the tab using our scraper service
    const scrapedTab = await find_and_scrape_tab(title, artist);
    
    if (scrapedTab && scrapedTab.rawContent) {
      console.log(`[TabFetcher] Found direct tab mapping for: ${artist} - ${title}`);
      
      // Convert to the format expected by the renderer
      return convertTabToNoteFormat(scrapedTab);
    }
    
    return null;
  } catch (error) {
    console.error('[TabFetcher] Error finding direct tab mapping:', error);
    return null;
  }
}

/**
 * Normalize Ultimate Guitar URLs to the canonical form
 * @param {string} url - The URL to normalize
 * @returns {string} - Normalized URL
 */
function normalizeUltimateGuitarUrl(url) {
  try {
    // Convert mobile URLs to desktop
    if (url.includes('m.ultimate-guitar.com')) {
      url = url.replace('m.ultimate-guitar.com', 'tabs.ultimate-guitar.com');
    }
    
    // Remove any query parameters
    const urlObj = new URL(url);
    if (urlObj.search) {
      urlObj.search = '';
      url = urlObj.toString();
    }
    
    return url;
  } catch (e) {
    // Return the original URL if parsing fails
    return url;
  }
}

/**
 * Extract artist and song title from URL
 * @param {string} url - The tab URL
 * @returns {Object} - Extracted artist and title
 */
function extractSongInfoFromUrl(url) {
  const extracted = { artist: '', title: '' };
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Ultimate Guitar URL pattern: /tab/artist-name/song-title-tabs-12345
    if (urlObj.hostname.includes('ultimate-guitar') && pathParts.length >= 3 && pathParts[0] === 'tab') {
      extracted.artist = pathParts[1].replace(/-/g, ' ');
      
      // The song title might have suffixes like -tabs-12345 or -chords-1234
      const songWithSuffix = pathParts[2];
      const match = songWithSuffix.match(/^(.+?)-(tabs|chords|bass|ukulele|guitar|drum|power)-\d+/);
      
      if (match) {
        extracted.title = match[1].replace(/-/g, ' ');
      } else {
        // If the pattern doesn't match, just use everything before the last dash
        const lastDashIndex = songWithSuffix.lastIndexOf('-');
        if (lastDashIndex > 0) {
          extracted.title = songWithSuffix.substring(0, lastDashIndex).replace(/-/g, ' ');
        }
      }
    }
    
    // Songsterr URL pattern: /a/wsa/artist-song-tab-s123t1
    else if (urlObj.hostname.includes('songsterr.com')) {
      // Songsterr URLs are more complex, but we can try to extract info
      const urlPath = urlObj.pathname;
      const match = urlPath.match(/\/a\/wsa\/([^\/]+)-tab-s\d+/);
      
      if (match && match[1]) {
        const parts = match[1].split('-');
        
        if (parts.length >= 2) {
          // Try to separate artist from song title based on common words
          const commonWords = ['by', 'from', 'feat', 'featuring'];
          let splitIndex = -1;
          
          for (let i = 0; i < parts.length; i++) {
            if (commonWords.includes(parts[i].toLowerCase())) {
              splitIndex = i;
              break;
            }
          }
          
          if (splitIndex > 0) {
            extracted.artist = parts.slice(splitIndex + 1).join(' ');
            extracted.title = parts.slice(0, splitIndex).join(' ');
          } else {
            // If we can't determine, use half for artist, half for title
            const middle = Math.floor(parts.length / 2);
            extracted.artist = parts.slice(0, middle).join(' ');
            extracted.title = parts.slice(middle).join(' ');
          }
        }
      }
    }
  } catch (error) {
    console.error('[TabFetcher] Error extracting info from URL:', error);
  }
  
  return extracted;
}

/**
 * Get a fallback tab for a song using search or default tabs
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @param {string} originalUrl - Original URL for reference
 * @returns {Promise<Object>} - Tab data
 */
async function getFallbackTabForSong(artist, title, originalUrl) {
  try {
    // Try to find the tab using our scraper service
    const scrapedTab = await find_and_scrape_tab(title, artist);
    
    if (scrapedTab && scrapedTab.rawContent) {
      console.log(`[TabFetcher] Found fallback tab for: ${artist} - ${title}`);
      
      // Convert to the format expected by the renderer
      return convertTabToNoteFormat(scrapedTab);
    }
    
    // If scraping fails, generate a basic tab
    console.log(`[TabFetcher] Using generic fallback for: ${artist} - ${title}`);
    return {
      artist: artist,
      title: title,
      tuning: 'Standard',
      notes: generateGenericNotes(),
      source: {
        type: 'fallback',
        description: 'Generated fallback tab (URL import failed)',
        url: originalUrl
      }
    };
  } catch (error) {
    console.error('[TabFetcher] Error getting fallback tab:', error);
    
    // Return a very basic tab
    return {
      artist: artist || 'Unknown Artist',
      title: title || 'Unknown Song',
      tuning: 'Standard',
      notes: generateGenericNotes(),
      source: {
        type: 'error',
        description: 'Failed to find any tab for this song',
        url: originalUrl
      }
    };
  }
}

/**
 * Generate generic fallback notes
 * @returns {Array} - Array of generic notes
 */
function generateGenericNotes() {
  return [
    { positions: [{ str: 1, fret: 0 }], duration: 'q' },
    { positions: [{ str: 2, fret: 3 }], duration: 'q' },
    { positions: [{ str: 3, fret: 2 }], duration: 'q' },
    { positions: [{ str: 1, fret: 0 }, { str: 2, fret: 3 }, { str: 3, fret: 2 }], duration: 'q' },
  ];
}

/**
 * Extract metadata from HTML content
 * @param {string} html - HTML content
 * @returns {Object} - Extracted metadata
 */
function extractMetadataFromHtml(html) {
  try {
    if (!html) return { title: '', artist: '', tuning: '' };
    
    // Use regex patterns to extract information
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(' tab with lyrics by ', ' - ') : '';
    
    // Extract artist and song title
    let artist = '';
    let songTitle = '';
    
    if (title) {
      const parts = title.split(' - ');
      if (parts.length >= 2) {
        artist = parts[0].trim();
        songTitle = parts[1].trim().replace(' tab | Songsterr', '').replace(' | Ultimate Guitar', '');
      }
    }
    
    // Look for tuning info
    const tuningMatch = html.match(/Tuning:\s*<[^>]+>([^<]+)/i) || 
                        html.match(/tuning[^:]*:\s*([^<\n]+)/i);
    const tuning = tuningMatch ? tuningMatch[1].trim() : 'Standard';
    
    return {
      title: songTitle || '',
      artist: artist || '',
      tuning: tuning
    };
  } catch (error) {
    console.error('[TabFetcher] Metadata extraction error:', error);
    return { title: '', artist: '', tuning: '' };
  }
} 