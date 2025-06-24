/**
 * Tab Cache Service
 * Provides local storage caching for tab data to minimize API requests
 */

// Cache expiration time in milliseconds (default: 24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Set tab data in cache
 * @param {string} key - Cache key (typically artist-title)
 * @param {Object} data - Tab data to cache
 */
export function setTabCache(key, data) {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`tab_cache_${key}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn('Failed to cache tab data:', error);
  }
}

/**
 * Get tab data from cache
 * @param {string} key - Cache key (typically artist-title)
 * @returns {Object|null} - Cached tab data or null if not in cache or expired
 */
export function getTabCache(key) {
  try {
    const cacheItem = localStorage.getItem(`tab_cache_${key}`);
    
    if (!cacheItem) return null;
    
    const { data, timestamp } = JSON.parse(cacheItem);
    const isExpired = Date.now() - timestamp > CACHE_EXPIRATION;
    
    if (isExpired) {
      // Clear expired cache
      localStorage.removeItem(`tab_cache_${key}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Failed to retrieve tab data from cache:', error);
    return null;
  }
}

/**
 * Clear all tab cache data
 */
export function clearTabCache() {
  try {
    // Remove only tab cache items
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('tab_cache_')) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn('Failed to clear tab cache:', error);
  }
}

/**
 * Get all cached tab items
 * @returns {Array} - Array of cached tab items
 */
export function getAllCachedTabs() {
  try {
    const result = [];
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      if (key.startsWith('tab_cache_')) {
        const cacheItem = localStorage.getItem(key);
        const { data, timestamp } = JSON.parse(cacheItem);
        const isExpired = Date.now() - timestamp > CACHE_EXPIRATION;
        
        if (!isExpired) {
          result.push({
            key: key.replace('tab_cache_', ''),
            data,
            cachedAt: new Date(timestamp)
          });
        }
      }
    }
    
    return result;
  } catch (error) {
    console.warn('Failed to retrieve cached tabs:', error);
    return [];
  }
}

/**
 * Create a cache key from artist and title
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @returns {string} - Cache key
 */
export function createCacheKey(artist, title) {
  return `${artist.toLowerCase().trim()}-${title.toLowerCase().trim()}`.replace(/\s+/g, '_');
} 