/**
 * Spotify API Client
 * 
 * A service for interacting with the Spotify Web API.
 * Requires a Spotify Developer account and API credentials.
 * 
 * Setup:
 * 1. Create a Spotify Developer account: https://developer.spotify.com/
 * 2. Create an app in the Spotify Developer Dashboard
 * 3. Get your Client ID and Client Secret
 * 4. Add these to your .env.local file:
 *    SPOTIFY_CLIENT_ID=your_client_id
 *    SPOTIFY_CLIENT_SECRET=your_client_secret
 */

import { API_CONFIG, DEBUG } from '../config';

// Token storage
let accessToken = null;
let tokenExpiresAt = null;

/**
 * Get a Spotify API access token using Client Credentials flow
 * @returns {Promise<string>} - Access token
 */
async function getAccessToken() {
  // Check if we have a valid token already
  if (accessToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return accessToken;
  }
  
  try {
    // Get Spotify credentials from config
    const clientId = API_CONFIG.KEYS.SPOTIFY_CLIENT_ID;
    const clientSecret = API_CONFIG.KEYS.SPOTIFY_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('Spotify API credentials not found in environment variables');
      return null;
    }
    
    // Request a new token
    const response = await fetch(API_CONFIG.ENDPOINTS.SPOTIFY.TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get Spotify access token: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Store the token and its expiration
    accessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in * 1000 * 0.9); // Set expiry slightly earlier to be safe
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    return null;
  }
}

/**
 * Search for tracks on Spotify
 * @param {string} query - Search query
 * @param {number} [limit=5] - Number of results to return
 * @returns {Promise<Array>} - Array of track results
 */
export async function searchSpotifyTracks(query, limit = 5) {
  try {
    if (DEBUG.LOG_API_CALLS) {
      console.log(`[Spotify API] Searching for: "${query}" (limit: ${limit})`);
    }
    
    const token = await getAccessToken();
    
    if (!token) {
      console.error('No Spotify access token available');
      return [];
    }
    
    const url = new URL(API_CONFIG.ENDPOINTS.SPOTIFY.SEARCH);
    url.searchParams.append('q', query);
    url.searchParams.append('type', 'track');
    url.searchParams.append('limit', limit);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.tracks.items.map(item => ({
      id: item.id,
      name: item.name,
      artist: item.artists[0].name,
      album: item.album.name,
      albumImageUrl: item.album.images[0]?.url || null,
      popularity: item.popularity,
      previewUrl: item.preview_url
    }));
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return [];
  }
}

/**
 * Get detailed track information by ID
 * @param {string} trackId - Spotify track ID
 * @returns {Promise<Object|null>} - Track details or null if not found
 */
export async function getSpotifyTrack(trackId) {
  try {
    if (DEBUG.LOG_API_CALLS) {
      console.log(`[Spotify API] Getting track: ${trackId}`);
    }
    
    const token = await getAccessToken();
    
    if (!token) {
      console.error('No Spotify access token available');
      return null;
    }
    
    const url = `${API_CONFIG.ENDPOINTS.SPOTIFY.TRACK}/${trackId}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get Spotify track: ${response.status} ${response.statusText}`);
    }
    
    const track = await response.json();
    
    return {
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      artistId: track.artists[0].id,
      album: track.album.name,
      albumId: track.album.id,
      albumImageUrl: track.album.images[0]?.url || null,
      releaseDate: track.album.release_date,
      duration: track.duration_ms,
      popularity: track.popularity,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify
    };
  } catch (error) {
    console.error('Error getting Spotify track:', error);
    return null;
  }
}

/**
 * Find the best matching track for artist and title
 * @param {string} artist - Artist name
 * @param {string} title - Track title
 * @returns {Promise<Object|null>} - Best matching track or null if not found
 */
export async function findBestSpotifyTrack(artist, title) {
  try {
    if (DEBUG.LOG_API_CALLS) {
      console.log(`[Spotify API] Finding best match for: ${artist} - ${title}`);
    }
    
    // Create a combined query with artist and title
    const query = `artist:${artist} track:${title}`;
    const results = await searchSpotifyTracks(query, 10);
    
    if (!results || results.length === 0) {
      // If no results with the specific query, try a more general search
      const fallbackResults = await searchSpotifyTracks(`${artist} ${title}`, 10);
      if (!fallbackResults || fallbackResults.length === 0) {
        return null;
      }
      
      // Find the best match from fallback results
      return findBestMatch(fallbackResults, artist, title);
    }
    
    // Find the best match from the results
    return findBestMatch(results, artist, title);
  } catch (error) {
    console.error('Error finding best Spotify track:', error);
    return null;
  }
}

/**
 * Helper function to find the best match from a list of tracks
 * @param {Array} tracks - List of tracks
 * @param {string} artist - Artist to match
 * @param {string} title - Title to match
 * @returns {Object|null} - Best matching track or null
 */
function findBestMatch(tracks, artist, title) {
  if (!tracks || tracks.length === 0) return null;
  
  // Normalize input for better matching
  const normalizeText = text => text.toLowerCase().trim();
  const artistNorm = normalizeText(artist);
  const titleNorm = normalizeText(title);
  
  // Score each track by how well it matches
  const scoredTracks = tracks.map(track => {
    const trackArtistNorm = normalizeText(track.artist);
    const trackTitleNorm = normalizeText(track.name);
    
    let score = 0;
    
    // Exact matches get high scores
    if (trackArtistNorm === artistNorm) score += 50;
    if (trackTitleNorm === titleNorm) score += 50;
    
    // Partial matches get lower scores
    if (trackArtistNorm.includes(artistNorm) || artistNorm.includes(trackArtistNorm)) score += 25;
    if (trackTitleNorm.includes(titleNorm) || titleNorm.includes(trackTitleNorm)) score += 25;
    
    // Consider track popularity as a tiebreaker
    score += (track.popularity || 0) / 10;
    
    return { ...track, score };
  });
  
  // Sort by score (highest first) and return the best match
  scoredTracks.sort((a, b) => b.score - a.score);
  return scoredTracks[0];
}

/**
 * Fall back to mock data for development and testing
 * @param {string} artist - Artist name
 * @param {string} title - Track title
 * @returns {Object|null} - Mock track data or null
 */
export function getMockSpotifyTrack(artist, title) {
  // Normalize artist and title for comparison
  const normalizeText = text => text.toLowerCase().trim();
  const artistNorm = normalizeText(artist);
  const titleNorm = normalizeText(title);
  
  // Known song mappings for development
  const songMappings = [
    { artist: 'guns n roses', title: 'sweet child o mine', id: '7o2CTH4ctstm8TNelqjb51', popularity: 85 },
    { artist: 'led zeppelin', title: 'stairway to heaven', id: '5CQ30WqJwcep0pYcV4AMNc', popularity: 83 },
    { artist: 'metallica', title: 'enter sandman', id: '5sICkBXVmaCQk5aISGR3x1', popularity: 84 },
    { artist: 'acdc', title: 'back in black', id: '08mG3Y1vljYA6bvDt4Wqkj', popularity: 82 },
    { artist: 'eagles', title: 'hotel california', id: '40riOy7x9W7GXjyGp4pjAv', popularity: 87 },
    { artist: 'pink floyd', title: 'comfortably numb', id: '6KMOaS7vGsVQUn5TDjicWp', popularity: 85 },
    { artist: 'queen', title: 'bohemian rhapsody', id: '7tFiyTwD0nx5a1eklYtX2J', popularity: 90 },
    { artist: 'nirvana', title: 'smells like teen spirit', id: '5ghIJDpPoe3CfHMGu71E6T', popularity: 88 },
    { artist: 'rolling stones', title: 'satisfaction', id: '2PzU4IB8Dr6mxV3lHuaG34', popularity: 80 },
    { artist: 'jimi hendrix', title: 'purple haze', id: '0wJoRiX5K5BxlqZTolB2LD', popularity: 79 },
    { artist: 'the beatles', title: 'here comes the sun', id: '6dGnYIeXmHdcikdzNNDMm2', popularity: 85 }
  ];
  
  // Try to find an exact match first
  for (const mapping of songMappings) {
    if (mapping.artist === artistNorm && mapping.title === titleNorm) {
      return {
        id: mapping.id, 
        name: title,
        artist: artist,
        album: 'Greatest Hits',
        albumImageUrl: `https://placehold.co/300x300/333/white?text=${encodeURIComponent(artist)}`,
        popularity: mapping.popularity,
        previewUrl: null,
        spotifyUrl: `https://open.spotify.com/track/${mapping.id}`
      };
    }
  }
  
  // Try to find a partial match
  for (const mapping of songMappings) {
    if (mapping.artist.includes(artistNorm) || artistNorm.includes(mapping.artist)) {
      if (mapping.title.includes(titleNorm) || titleNorm.includes(mapping.title)) {
        return {
          id: mapping.id,
          name: title,
          artist: artist,
          album: 'Greatest Hits',
          albumImageUrl: `https://placehold.co/300x300/333/white?text=${encodeURIComponent(artist)}`,
          popularity: mapping.popularity,
          previewUrl: null,
          spotifyUrl: `https://open.spotify.com/track/${mapping.id}`
        };
      }
    }
  }
  
  // No match found
  return null;
} 