import { NextResponse } from 'next/server';

/**
 * API endpoint for searching tabs by artist and title
 * @param {Request} request - The HTTP request object
 * @returns {NextResponse} - JSON response with tab search results
 */
export async function GET(request) {
  try {
    // Get search query from URL params
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    // Search for tabs (for now using mock data, will be replaced with real API calls)
    // In a real implementation, you would query Ultimate Guitar or other sources
    const tabs = await searchTabs(query, limit);
    
    return NextResponse.json({ tabs });
  } catch (error) {
    console.error('Tab search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search for tabs' },
      { status: 500 }
    );
  }
}

/**
 * Search for tabs across various sources
 * Note: This is a mock implementation. In production, you would call real APIs.
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of tab results
 */
async function searchTabs(query, limit = 10) {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Sample data for demo purposes
  const allTabs = [
    { 
      id: 'tab_1',
      title: 'Sweet Child O\' Mine',
      artist: 'Guns N\' Roses',
      rating: 4.8,
      difficulty: 'Intermediate',
      type: 'Guitar Tab',
      source: 'Ultimate Guitar',
      url: 'https://tabs.ultimate-guitar.com/g/guns_n_roses/sweet_child_o_mine_tab.htm',
    },
    { 
      id: 'tab_2',
      title: 'Stairway to Heaven',
      artist: 'Led Zeppelin',
      rating: 4.9,
      difficulty: 'Intermediate',
      type: 'Guitar Tab',
      source: 'Ultimate Guitar',
      url: 'https://tabs.ultimate-guitar.com/l/led_zeppelin/stairway_to_heaven_tab.htm',
    },
    { 
      id: 'tab_3',
      title: 'Smells Like Teen Spirit',
      artist: 'Nirvana',
      rating: 4.7,
      difficulty: 'Beginner',
      type: 'Guitar Tab',
      source: 'Ultimate Guitar',
      url: 'https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_tab.htm',
    },
    { 
      id: 'tab_4',
      title: 'Nothing Else Matters',
      artist: 'Metallica',
      rating: 4.9,
      difficulty: 'Intermediate',
      type: 'Guitar Tab',
      source: 'Ultimate Guitar',
      url: 'https://tabs.ultimate-guitar.com/m/metallica/nothing_else_matters_tab.htm',
    },
    { 
      id: 'tab_5',
      title: 'Wonderwall',
      artist: 'Oasis',
      rating: 4.5,
      difficulty: 'Beginner',
      type: 'Guitar Tab',
      source: 'Ultimate Guitar',
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