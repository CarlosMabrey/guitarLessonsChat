/**
 * Video Resource Cache
 * 
 * This module manages a cache of learning resource videos for songs to reduce API calls.
 * It stores video data locally and persists it to localStorage.
 */

'use client';

import { findSongVideos, findSongLessons } from './services/youtubeApi';
import { API_CONFIG } from './config';

// Cache key in localStorage
const CACHE_KEY = 'guitar-app-video-resources-cache';

// Default expiration time: 7 days in milliseconds
const DEFAULT_CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

// In-memory cache
let videoCache = null;

/**
 * Initialize the cache from localStorage
 */
function initCache() {
  if (typeof window === 'undefined') return {};
  
  if (videoCache !== null) return videoCache;
  
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    videoCache = cachedData ? JSON.parse(cachedData) : {};
    
    // Clean expired entries
    const now = Date.now();
    Object.keys(videoCache).forEach(key => {
      if (videoCache[key].expiration && videoCache[key].expiration < now) {
        delete videoCache[key];
      }
    });
    
    // Save cleaned cache
    saveCache();
    
    return videoCache;
  } catch (error) {
    console.error('Error initializing video cache:', error);
    videoCache = {};
    return videoCache;
  }
}

/**
 * Save the cache to localStorage
 */
function saveCache() {
  if (typeof window === 'undefined' || !videoCache) return;
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(videoCache));
  } catch (error) {
    console.error('Error saving video cache:', error);
  }
}

/**
 * Get video resources for a song, using cache if available
 * @param {string} songId - The song ID
 * @param {string} artist - The artist name
 * @param {string} title - The song title
 * @param {boolean} forceRefresh - Whether to force a refresh from the API
 * @returns {Promise<Array>} - Array of video resources
 */
export async function getSongVideoResources(songId, artist, title, forceRefresh = false) {
  // Initialize cache if needed
  const cache = initCache();
  
  // Check if we have a valid cached entry
  const cacheKey = `video-${songId}`;
  const now = Date.now();
  
  if (!forceRefresh && cache[cacheKey] && cache[cacheKey].expiration > now) {
    console.log('Using cached video resources for:', title);
    return cache[cacheKey].videos;
  }
  
  // Fetch from API if no cache or forced refresh
  console.log('Fetching video resources for:', title);
  try {
    let videos = [];
    
    if (API_CONFIG.USE_REAL_APIS.YOUTUBE) {
      // Use the real YouTube API
      const [lessons, tutorialVideos] = await Promise.all([
        findSongLessons(artist, title),
        findSongVideos(artist, title)
      ]);
      
      // Transform API results to our format
      videos = [
        ...formatVideos(lessons, 'tutorial'),
        ...formatVideos(tutorialVideos, 'tab')
      ];
      
      // Filter to get the best quality videos (prioritize official content, tutorials)
      videos = filterVideosByQuality(videos, title, artist);
    } else {
      // Use mock data as a fallback
      videos = getMockVideos(artist, title);
    }
    
    // Cache the result
    cache[cacheKey] = {
      videos,
      timestamp: now,
      expiration: now + DEFAULT_CACHE_EXPIRATION
    };
    
    videoCache = cache;
    saveCache();
    
    return videos;
  } catch (error) {
    console.error('Error fetching video resources:', error);
    
    // If cache exists but is expired, use it as fallback
    if (cache[cacheKey]) {
      console.log('Using expired cache as fallback');
      return cache[cacheKey].videos;
    }
    
    // Last resort: return mock data
    const mockVideos = getMockVideos(artist, title);
    return mockVideos;
  }
}

/**
 * Format video data from API to our internal format
 * @param {Array} videos - Videos from API
 * @param {string} defaultType - Default video type if not specified
 * @returns {Array} - Formatted videos
 */
function formatVideos(videos, defaultType = 'tab') {
  return videos.map((video, index) => {
    const videoType = video.type || defaultType;
    return {
      id: `video-${videoType}-${index}`,
      videoId: video.id,
      title: video.title,
      type: videoType,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnail: video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`,
      source: 'YouTube',
      level: videoType === 'tutorial' ? (index % 2 === 0 ? 'Beginner' : 'Advanced') : undefined
    };
  });
}

/**
 * Filter and prioritize videos to get the best quality learning resources
 * Limits to 5 videos maximum and ensures a mix of types
 * @param {Array} videos - All videos
 * @param {string} title - Song title for keyword matching
 * @param {string} artist - Artist name for keyword matching
 * @returns {Array} - Filtered list of videos
 */
function filterVideosByQuality(videos, title, artist) {
  if (!videos || videos.length === 0) return [];
  
  // Quality score calculation based on title keywords and type
  const scoredVideos = videos.map(video => {
    let score = 0;
    
    // Prioritize videos with "tutorial", "lesson", "how to play" in title
    const lowerTitle = video.title.toLowerCase();
    if (lowerTitle.includes('tutorial')) score += 5;
    if (lowerTitle.includes('lesson')) score += 4;
    if (lowerTitle.includes('how to play')) score += 4;
    if (lowerTitle.includes('guitar')) score += 3;
    if (lowerTitle.includes('tab')) score += 3;
    if (lowerTitle.includes('cover')) score += 2;
    
    // Match on song title and artist
    if (lowerTitle.includes(title.toLowerCase())) score += 2;
    if (lowerTitle.includes(artist.toLowerCase())) score += 2;
    
    // Prioritize tutorial type videos
    if (video.type === 'tutorial') score += 3;
    
    return { ...video, score };
  });
  
  // Sort by score (descending)
  scoredVideos.sort((a, b) => b.score - a.score);
  
  // Get top 5 videos
  return scoredVideos.slice(0, 5);
}

/**
 * Generate mock video data for a song
 * @param {string} artist - The artist name
 * @param {string} title - The song title
 * @returns {Array} - Mock video resources
 */
function getMockVideos(artist, title) {
  const createThumbnailUrl = (videoId) => `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  
  // Custom mocks for popular songs
  if (title.includes("Sweet Child")) {
    return [
      {
        id: 'video1',
        videoId: '1w7OgIMMRc4',
        title: `${title} - Guitar Tab Playthrough`,
        type: 'tab',
        url: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        thumbnail: createThumbnailUrl('1w7OgIMMRc4'),
        source: 'YouTube'
      },
      {
        id: 'video2',
        videoId: 'qrO4YZeyl0I',
        title: `${title} - Guitar Lesson with Tabs`,
        type: 'tutorial',
        url: 'https://www.youtube.com/watch?v=qrO4YZeyl0I',
        thumbnail: createThumbnailUrl('qrO4YZeyl0I'),
        source: 'YouTube',
        level: 'Beginner'
      }
    ];
  } else if (title.includes("Stairway")) {
    return [
      {
        id: 'video1',
        videoId: 'X25_8Yk_BqY',
        title: `${title} - Guitar Solo Lesson`,
        type: 'tutorial',
        url: 'https://www.youtube.com/watch?v=X25_8Yk_BqY',
        thumbnail: createThumbnailUrl('X25_8Yk_BqY'),
        source: 'YouTube',
        level: 'Advanced'
      },
      {
        id: 'video2',
        videoId: 'X25_8Yk_BqY',
        title: `${title} - Guitar Tab Playthrough`,
        type: 'tab',
        url: 'https://www.youtube.com/watch?v=X25_8Yk_BqY',
        thumbnail: createThumbnailUrl('X25_8Yk_BqY'),
        source: 'YouTube'
      }
    ];
  } else if (title.includes("House Of The Rising")) {
    return [
      {
        id: 'video1',
        videoId: 'y8bMS5VTU88',
        title: `${title} - Guitar Tab Playthrough`,
        type: 'tab',
        url: 'https://www.youtube.com/watch?v=y8bMS5VTU88',
        thumbnail: createThumbnailUrl('y8bMS5VTU88'),
        source: 'YouTube'
      },
      {
        id: 'video2',
        videoId: 'sI7k8uZqJ4Y',
        title: `How to play ${title} - Beginner Tutorial`,
        type: 'tutorial',
        url: 'https://www.youtube.com/watch?v=sI7k8uZqJ4Y',
        thumbnail: createThumbnailUrl('sI7k8uZqJ4Y'),
        source: 'YouTube',
        level: 'Beginner'
      }
    ];
  }
  
  // Generic mock videos
  return [
    {
      id: 'video1',
      videoId: 'dQw4w9WgXcQ', // Just a placeholder ID
      title: `${title} by ${artist} - Guitar Tutorial`,
      type: 'tutorial',
      url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
      thumbnail: createThumbnailUrl('dQw4w9WgXcQ'),
      source: 'YouTube',
      level: 'Beginner'
    },
    {
      id: 'video2',
      videoId: 'xvFZjo5PgG0', // Another placeholder
      title: `${title} - Guitar Tab Playthrough`,
      type: 'tab',
      url: `https://www.youtube.com/watch?v=xvFZjo5PgG0`,
      thumbnail: createThumbnailUrl('xvFZjo5PgG0'),
      source: 'YouTube'
    }
  ];
} 