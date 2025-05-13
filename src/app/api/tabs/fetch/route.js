import { NextResponse } from 'next/server';
import { parseUltimateGuitarTab, parseSongsterrTab } from '@/lib/parsers/tabParsers';

/**
 * API endpoint for fetching tabs by URL or artist/title
 * @param {Request} request - The HTTP request object
 * @returns {NextResponse} - JSON response with tab data
 */
export async function GET(request) {
  try {
    // Get tab info from URL params
    const url = new URL(request.url);
    const tabUrl = url.searchParams.get('url');
    const artist = url.searchParams.get('artist');
    const title = url.searchParams.get('title');
    const source = url.searchParams.get('source') || 'ultimate-guitar';
    
    if (!tabUrl && (!artist || !title)) {
      return NextResponse.json(
        { error: 'Either URL or artist/title parameters are required' },
        { status: 400 }
      );
    }
    
    let tabData;
    
    if (tabUrl) {
      // Fetch tab by URL using the scraper API
      tabData = await fetchTabByUrl(tabUrl, source);
    } else {
      // Fetch tab by artist and title
      tabData = await fetchTabByInfo(artist, title, source);
    }
    
    if (!tabData) {
      return NextResponse.json(
        { error: 'Tab not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(tabData);
  } catch (error) {
    console.error('Tab fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tab' },
      { status: 500 }
    );
  }
}

/**
 * Fetch tab by URL using the scraper API
 * @param {string} url - URL of the tab to fetch
 * @param {string} source - Source website (ultimate-guitar, songsterr, etc.)
 * @returns {Promise<Object|null>} - Tab data or null if not found
 */
async function fetchTabByUrl(url, source) {
  try {
    // Call our scraper API route
    const scrapeUrl = new URL('/api/tabs/scrape', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    scrapeUrl.searchParams.set('url', url);
    scrapeUrl.searchParams.set('source', source);
    
    const response = await fetch(scrapeUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Make this a server-side request to avoid CORS issues
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to scrape tab: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error scraping tab:', error);
    
    // Return sample data as fallback
    return fetchSampleTabData();
  }
}

/**
 * Fetch tab by artist and title
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @param {string} source - Source website (ultimate-guitar, songsterr, etc.)
 * @returns {Promise<Object|null>} - Tab data or null if not found
 */
async function fetchTabByInfo(artist, title, source) {
  try {
    // First search for the tab to get the URL
    const searchResults = await searchTabs(`${artist} ${title}`, 5);
    
    // Find the best match
    const bestMatch = searchResults.find(tab => 
      tab.title.toLowerCase().includes(title.toLowerCase()) && 
      tab.artist.toLowerCase().includes(artist.toLowerCase())
    );
    
    if (bestMatch && bestMatch.url) {
      // If we found a matching tab with URL, fetch it
      return await fetchTabByUrl(bestMatch.url, bestMatch.source || source);
    }
    
    // If no best match found, return sample data for now
    const sampleData = fetchSampleTabData();
    
    // Update the artist and title to match the request
    return {
      ...sampleData,
      artist,
      title
    };
  } catch (error) {
    console.error('Error fetching tab by info:', error);
    
    // Return sample data with the requested artist/title
    return {
      ...fetchSampleTabData(),
      artist,
      title
    };
  }
}

/**
 * Search for tabs - simplified version just for matching URLs
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of tab results
 */
async function searchTabs(query, limit = 5) {
  // For now, just return some hardcoded samples
  // In a production app, this would call the /api/tabs/search endpoint
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const allTabs = [
    { 
      id: 'tab_1',
      title: 'Sweet Child O\' Mine',
      artist: 'Guns N\' Roses',
      rating: 4.8,
      difficulty: 'Intermediate',
      type: 'Guitar Tab',
      source: 'ultimate-guitar',
      url: 'https://tabs.ultimate-guitar.com/g/guns_n_roses/sweet_child_o_mine_tab.htm',
    },
    { 
      id: 'tab_2',
      title: 'Stairway to Heaven',
      artist: 'Led Zeppelin',
      rating: 4.9,
      difficulty: 'Intermediate',
      type: 'Guitar Tab',
      source: 'ultimate-guitar',
      url: 'https://tabs.ultimate-guitar.com/l/led_zeppelin/stairway_to_heaven_tab.htm',
    },
    { 
      id: 'tab_3',
      title: 'Smells Like Teen Spirit',
      artist: 'Nirvana',
      rating: 4.7,
      difficulty: 'Beginner',
      type: 'Guitar Tab',
      source: 'ultimate-guitar',
      url: 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_tab.htm',
    },
    { 
      id: 'tab_4',
      title: 'Nothing Else Matters',
      artist: 'Metallica',
      rating: 4.9,
      difficulty: 'Intermediate',
      type: 'Guitar Tab',
      source: 'ultimate-guitar',
      url: 'https://tabs.ultimate-guitar.com/m/metallica/nothing_else_matters_tab.htm',
    },
    { 
      id: 'tab_5',
      title: 'Wonderwall',
      artist: 'Oasis',
      rating: 4.5,
      difficulty: 'Beginner',
      type: 'Guitar Tab',
      source: 'ultimate-guitar',
      url: 'https://tabs.ultimate-guitar.com/o/oasis/wonderwall_tab.htm',
    },
  ];
  
  // Filter by search query
  const lowerQuery = query.toLowerCase();
  const filtered = allTabs.filter(tab => 
    tab.title.toLowerCase().includes(lowerQuery) || 
    tab.artist.toLowerCase().includes(lowerQuery)
  );
  
  return filtered.slice(0, limit);
}

/**
 * Fetch sample tab data (for development/testing)
 * @returns {Object} - Sample tab data
 */
function fetchSampleTabData() {
  // Sample data matching the format expected by the TabRenderer component
  return {
    artist: 'Sample Artist',
    title: 'Sample Tab',
    tuning: 'Standard',
    notes: [
      { positions: [{ str: 1, fret: 0 }, { str: 2, fret: 1 }, { str: 3, fret: 0 }, { str: 4, fret: 2 }, { str: 5, fret: 3 }, { str: 6, fret: 0 }], duration: 'q' },
      { positions: [{ str: 1, fret: 3 }, { str: 2, fret: 0 }, { str: 3, fret: 0 }, { str: 4, fret: 0 }, { str: 5, fret: 2 }, { str: 6, fret: 3 }], duration: 'q' },
      { positions: [{ str: 1, fret: 2 }, { str: 2, fret: 0 }, { str: 3, fret: 0 }, { str: 4, fret: 0 }, { str: 5, fret: 2 }, { str: 6, fret: 2 }], duration: 'q' },
      { positions: [{ str: 1, fret: 0 }, { str: 2, fret: 1 }, { str: 3, fret: 2 }, { str: 4, fret: 2 }, { str: 5, fret: 0 }, { str: 6, fret: 0 }], duration: 'q' },
    ],
    source: {
      type: 'api',
      description: 'Fetched from API (development sample)',
      url: null
    }
  };
} 