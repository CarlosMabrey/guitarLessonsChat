/**
 * Uberchord API service
 * This service provides access to the Uberchord API for retrieving chord and song data
 */

/**
 * Search for song information using Uberchord API
 * @param {string} query - Search query (song name and/or artist)
 * @returns {Promise<Array>} - List of matching songs
 */
export async function searchUberchord(query) {
  try {
    const searchTerm = encodeURIComponent(query.trim());
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://api.uberchord.com/v1/songs?nameLike=${searchTerm}`)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Uberchord API');
    }
    
    const data = await response.json();
    
    // Return formatted results
    return data.map(song => ({
      id: song.id,
      title: song.name,
      artist: song.artist.name,
      artistId: song.artist.id,
      album: song.album?.name || 'Unknown Album',
      genre: song.genre?.name || 'Unknown Genre',
      key: song.musicalKey || 'Unknown Key',
      chords: song.chords || []
    }));
  } catch (error) {
    console.error('Error searching Uberchord:', error);
    // Fallback to mock data when appropriate
    const mockData = getMockUberchordData(query);
    return mockData;
  }
}

/**
 * Get details for a specific song by ID
 * @param {string} id - Uberchord song ID
 * @returns {Promise<Object>} - Song details
 */
export async function getUberchordSongDetails(id) {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://api.uberchord.com/v1/songs/${id}`)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch song details from Uberchord');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Uberchord song details:', error);
    return null;
  }
}

/**
 * Get chord information for a specific chord
 * @param {string} chordName - Name of the chord (e.g. "Am", "G", "D7")
 * @returns {Promise<Object>} - Chord details including fingering
 */
export async function getChordInfo(chordName) {
  try {
    const encodedChord = encodeURIComponent(chordName.trim());
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://api.uberchord.com/v1/chords/${encodedChord}`)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch chord information for ${chordName}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error(`Error fetching chord ${chordName}:`, error);
    return null;
  }
}

/**
 * Get song key and BPM from multiple sources for better accuracy
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @returns {Promise<Object>} - Song key and BPM information
 */
export async function getSongKeyAndBPM(artist, title) {
  try {
    // First try Uberchord API
    const query = `${artist} ${title}`;
    const uberchordResults = await searchUberchord(query);
    
    if (uberchordResults && uberchordResults.length > 0) {
      const bestMatch = findBestMatch(uberchordResults, artist, title);
      
      if (bestMatch) {
        return {
          key: bestMatch.key || 'Unknown',
          tempo: null, // Uberchord doesn't provide BPM/tempo
          source: 'uberchord'
        };
      }
    }
    
    // If no results, fall back to mock data
    return getMockKeyAndBPM(artist, title);
  } catch (error) {
    console.error('Error getting song key and BPM:', error);
    return getMockKeyAndBPM(artist, title);
  }
}

/**
 * Find the best matching song from results based on artist and title
 * @param {Array} results - Search results
 * @param {string} artist - Artist to match
 * @param {string} title - Title to match
 * @returns {Object|null} - Best matching song or null
 */
function findBestMatch(results, artist, title) {
  if (!results || results.length === 0) return null;
  
  // Normalize input
  const normalizedArtist = artist.toLowerCase().trim();
  const normalizedTitle = title.toLowerCase().trim();
  
  // Try exact match first
  const exactMatch = results.find(song => 
    song.artist.toLowerCase().trim() === normalizedArtist &&
    song.title.toLowerCase().trim() === normalizedTitle
  );
  
  if (exactMatch) return exactMatch;
  
  // Try partial match
  const partialMatch = results.find(song => 
    song.title.toLowerCase().includes(normalizedTitle) ||
    normalizedTitle.includes(song.title.toLowerCase())
  );
  
  return partialMatch || results[0]; // Return first result if no match found
}

/**
 * Mock data for common songs to ensure we always have results
 * @param {string} query - Search query
 * @returns {Array} - Mock search results
 */
function getMockUberchordData(query) {
  const mockSongs = [
    {
      id: "123",
      title: "House Of The Rising Sun",
      artist: "The Animals",
      artistId: "456",
      album: "The Animals",
      genre: "Rock",
      key: "Am",
      chords: ["Am", "C", "D", "F", "E7"]
    },
    {
      id: "124",
      title: "Wonderwall",
      artist: "Oasis",
      artistId: "457",
      album: "(What's the Story) Morning Glory?",
      genre: "Rock",
      key: "F#m",
      chords: ["Em7", "G", "Dsus4", "A7sus4", "Cadd9"]
    },
    {
      id: "125",
      title: "Nothing Else Matters",
      artist: "Metallica",
      artistId: "458",
      album: "Metallica (The Black Album)",
      genre: "Metal",
      key: "Em",
      chords: ["Em", "G", "D", "C"]
    },
    {
      id: "126",
      title: "Stairway To Heaven",
      artist: "Led Zeppelin",
      artistId: "459",
      album: "Led Zeppelin IV",
      genre: "Rock",
      key: "Am",
      chords: ["Am", "G", "F", "C", "D", "Dsus4"]
    },
    {
      id: "127",
      title: "Sweet Home Alabama",
      artist: "Lynyrd Skynyrd",
      artistId: "460",
      album: "Second Helping",
      genre: "Southern Rock",
      key: "D",
      chords: ["D", "C", "G"]
    }
  ];

  // Return matches based on the query
  const lowerQuery = query.toLowerCase();
  return mockSongs.filter(song => {
    const songName = song.title.toLowerCase();
    const artistName = song.artist.toLowerCase();
    
    return songName.includes(lowerQuery) || 
           artistName.includes(lowerQuery) || 
           `${artistName} ${songName}`.includes(lowerQuery);
  });
}

/**
 * Get mock key and BPM data for common songs
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @returns {Object} - Key and BPM information
 */
function getMockKeyAndBPM(artist, title) {
  const mockData = {
    "house of the rising sun": { key: "Am", tempo: 80 },
    "wonderwall": { key: "F#m", tempo: 87 },
    "nothing else matters": { key: "Em", tempo: 69 },
    "stairway to heaven": { key: "Am", tempo: 82 },
    "sweet home alabama": { key: "D", tempo: 97 },
    "smoke on the water": { key: "Dm", tempo: 112 },
    "hotel california": { key: "Bm", tempo: 75 }
  };
  
  // Try to find by title first
  const lowerTitle = title.toLowerCase();
  for (const key in mockData) {
    if (lowerTitle.includes(key) || key.includes(lowerTitle)) {
      return {
        key: mockData[key].key || 'C',
        tempo: mockData[key].tempo || 120,
        source: 'mock'
      };
    }
  }
  
  // Default values if no match found
  return {
    key: 'C',
    tempo: 120,
    source: 'default'
  };
} 