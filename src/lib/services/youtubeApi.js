/**
 * YouTube API Client
 * 
 * A service for interacting with the YouTube Data API v3.
 * Requires a Google Developer account and API key.
 * 
 * Setup:
 * 1. Create a Google Cloud project: https://console.cloud.google.com/
 * 2. Enable the YouTube Data API v3
 * 3. Create an API key
 * 4. Add the API key to your .env.local file:
 *    YOUTUBE_API_KEY=your_api_key
 */

import { API_CONFIG, DEBUG } from '../config';

/**
 * Search for videos on YouTube
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @param {number} [options.maxResults=10] - Maximum number of results to return
 * @param {string} [options.type='video'] - Type of resource (video, channel, playlist)
 * @param {string} [options.relevanceLanguage='en'] - Language for search results
 * @returns {Promise<Array>} - Array of video results
 */
export async function searchYouTube(query, options = {}) {
  try {
    if (DEBUG.LOG_API_CALLS) {
      console.log(`[YouTube API] Searching for: "${query}"`);
    }
    
    const apiKey = API_CONFIG.KEYS.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.error('YouTube API key not found in environment variables');
      return [];
    }
    
    const {
      maxResults = 10,
      type = 'video',
      relevanceLanguage = 'en'
    } = options;
    
    const url = new URL(API_CONFIG.ENDPOINTS.YOUTUBE.SEARCH);
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', query);
    url.searchParams.append('maxResults', maxResults);
    url.searchParams.append('type', type);
    url.searchParams.append('relevanceLanguage', relevanceLanguage);
    url.searchParams.append('key', apiKey);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: {
        default: item.snippet.thumbnails.default.url,
        medium: item.snippet.thumbnails.medium.url,
        high: item.snippet.thumbnails.high.url
      }
    }));
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return [];
  }
}

/**
 * Get detailed video information by ID
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object|null>} - Video details or null if not found
 */
export async function getVideoDetails(videoId) {
  try {
    if (DEBUG.LOG_API_CALLS) {
      console.log(`[YouTube API] Getting video details for: ${videoId}`);
    }
    
    const apiKey = API_CONFIG.KEYS.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.error('YouTube API key not found in environment variables');
      return null;
    }
    
    const url = new URL(API_CONFIG.ENDPOINTS.YOUTUBE.VIDEOS);
    url.searchParams.append('part', 'snippet,contentDetails,statistics');
    url.searchParams.append('id', videoId);
    url.searchParams.append('key', apiKey);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }
    
    const item = data.items[0];
    
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      thumbnails: {
        default: item.snippet.thumbnails.default.url,
        medium: item.snippet.thumbnails.medium.url,
        high: item.snippet.thumbnails.high.url
      },
      duration: item.contentDetails.duration,
      viewCount: item.statistics.viewCount,
      likeCount: item.statistics.likeCount,
      commentCount: item.statistics.commentCount
    };
  } catch (error) {
    console.error('Error getting YouTube video details:', error);
    return null;
  }
}

/**
 * Find guitar lesson videos for a song
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @returns {Promise<Array>} - Array of relevant videos
 */
export async function findSongLessons(artist, title) {
  try {
    if (DEBUG.LOG_API_CALLS) {
      console.log(`[YouTube API] Finding lesson videos for: ${artist} - ${title}`);
    }
    
    const queries = [
      `${artist} ${title} guitar lesson`,
      `${artist} ${title} guitar tutorial`,
      `how to play ${title} by ${artist} guitar`
    ];
    
    // Run all searches in parallel
    const searchPromises = queries.map(query => 
      searchYouTube(query, { maxResults: 5, type: 'video' })
    );
    
    const searchResults = await Promise.all(searchPromises);
    
    // Flatten results and remove duplicates
    const allVideos = searchResults.flat();
    const uniqueVideos = removeDuplicateVideos(allVideos);
    
    // Categorize videos
    return categorizeVideos(uniqueVideos, artist, title);
  } catch (error) {
    console.error('Error finding song lessons:', error);
    return [];
  }
}

/**
 * Find official music videos and covers for a song
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @returns {Promise<Array>} - Array of relevant videos
 */
export async function findSongVideos(artist, title) {
  try {
    if (DEBUG.LOG_API_CALLS) {
      console.log(`[YouTube API] Finding music videos for: ${artist} - ${title}`);
    }
    
    const queries = [
      `${artist} ${title} official music video`,
      `${artist} ${title} live`,
      `${artist} ${title} guitar cover`
    ];
    
    // Run all searches in parallel
    const searchPromises = queries.map(query => 
      searchYouTube(query, { maxResults: 5, type: 'video' })
    );
    
    const searchResults = await Promise.all(searchPromises);
    
    // Flatten results and remove duplicates
    const allVideos = searchResults.flat();
    const uniqueVideos = removeDuplicateVideos(allVideos);
    
    // Categorize videos
    return categorizeVideos(uniqueVideos, artist, title);
  } catch (error) {
    console.error('Error finding song videos:', error);
    return [];
  }
}

/**
 * Helper function to remove duplicate videos from results
 * @param {Array} videos - Array of videos
 * @returns {Array} - Array with duplicates removed
 */
function removeDuplicateVideos(videos) {
  const uniqueIds = new Set();
  return videos.filter(video => {
    if (uniqueIds.has(video.id)) {
      return false;
    }
    uniqueIds.add(video.id);
    return true;
  });
}

/**
 * Helper function to categorize videos by type
 * @param {Array} videos - Array of videos
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @returns {Array} - Array of videos with type information
 */
function categorizeVideos(videos, artist, title) {
  return videos.map(video => {
    const videoTitle = video.title.toLowerCase();
    const videoDesc = video.description?.toLowerCase() || '';
    
    let type = 'other';
    
    if (videoTitle.includes('official') && (videoTitle.includes('video') || videoTitle.includes('mv'))) {
      type = 'official';
    } else if (videoTitle.includes('cover')) {
      type = 'cover';
    } else if (videoTitle.includes('lesson') || videoTitle.includes('tutorial') || videoTitle.includes('how to play')) {
      type = 'tutorial';
    } else if (videoTitle.includes('backing track')) {
      type = 'backing-track';
    } else if (videoTitle.includes('live')) {
      type = 'live';
    } else if (videoDesc.includes('lesson') || videoDesc.includes('tutorial')) {
      type = 'tutorial';
    }
    
    return {
      ...video,
      type,
      // Add thumbnail URL in format expected by the app
      thumbnail: video.thumbnails.medium
    };
  });
}

/**
 * Fall back to mock data for development and testing
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @returns {Array} - Mock video data
 */
export function getMockYoutubeVideos(artist, title) {
  if (DEBUG.LOG_API_CALLS) {
    console.log(`[YouTube API] Using mock data for: ${artist} - ${title}`);
  }
  
  // Common video patterns for guitar lessons/tutorials
  const query = `${artist} ${title}`.toLowerCase();
  
  // Generate a predictable but semi-random ID based on the query
  const generateId = (prefix, seed) => {
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      hash = ((hash << 5) - hash) + query.charCodeAt(i);
      hash = hash & hash;
    }
    return prefix + Math.abs(hash % 1000000 + seed).toString(16).padStart(6, '0');
  };
  
  // Create mock videos with various types
  return [
    {
      id: generateId('xY', 1),
      title: `${title} by ${artist} - Guitar Tutorial (Easy Lesson)`,
      type: 'tutorial',
      channelTitle: 'GuitarZero to Hero',
      publishedAt: '2021-01-15T14:30:00Z',
      thumbnail: `https://img.youtube.com/vi/${generateId('xY', 1)}/mqdefault.jpg`,
      viewCount: 156000,
      likeCount: 8200
    },
    {
      id: generateId('xY', 2),
      title: `How to Play "${title}" by ${artist} - Guitar Lesson`,
      type: 'tutorial',
      channelTitle: 'Guitar Lessons 365',
      publishedAt: '2019-08-22T10:15:00Z',
      thumbnail: `https://img.youtube.com/vi/${generateId('xY', 2)}/mqdefault.jpg`,
      viewCount: 320000,
      likeCount: 15400
    },
    {
      id: generateId('xY', 3),
      title: `${title} - ${artist} (Guitar Cover with Tab)`,
      type: 'cover',
      channelTitle: 'GuitarCoverMaster',
      publishedAt: '2020-03-11T18:45:00Z',
      thumbnail: `https://img.youtube.com/vi/${generateId('xY', 3)}/mqdefault.jpg`,
      viewCount: 89000,
      likeCount: 4500
    },
    {
      id: generateId('xY', 4),
      title: `${artist} - ${title} (Official Music Video)`,
      type: 'official',
      channelTitle: `${artist}VEVO`,
      publishedAt: '2010-06-18T09:00:00Z',
      thumbnail: `https://img.youtube.com/vi/${generateId('xY', 4)}/mqdefault.jpg`,
      viewCount: 1200000,
      likeCount: 85000
    },
    {
      id: generateId('xY', 5),
      title: `${title} by ${artist} - Acoustic Guitar Lesson`,
      type: 'tutorial',
      channelTitle: 'Acoustic Life',
      publishedAt: '2018-11-30T16:22:00Z',
      thumbnail: `https://img.youtube.com/vi/${generateId('xY', 5)}/mqdefault.jpg`,
      viewCount: 76000,
      likeCount: 3800
    },
    {
      id: generateId('xY', 6),
      title: `${title} Guitar Backing Track (In Style of ${artist})`,
      type: 'backing-track',
      channelTitle: 'Jam Tracks',
      publishedAt: '2020-09-05T12:11:00Z',
      thumbnail: `https://img.youtube.com/vi/${generateId('xY', 6)}/mqdefault.jpg`,
      viewCount: 45000,
      likeCount: 2100
    }
  ];
} 