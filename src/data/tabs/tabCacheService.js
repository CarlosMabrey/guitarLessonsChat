/**
 * Tab Cache Service
 * Provides client-side caching for tab data using localStorage
 */

// Cache expiration time in milliseconds (default: 24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Prefix for localStorage keys to avoid conflicts
const STORAGE_PREFIX = 'tab_cache_';

/**
 * Get the storage key for a given cache key
 * @param {string} key - Cache key (typically artist-title)
 * @returns {string} - Storage key
 */
function getStorageKey(key) {
  // Create a URL-friendly key by replacing non-alphanumeric characters with underscores
  const safeKey = key.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${STORAGE_PREFIX}${safeKey}`;
}

/**
 * Set tab data in cache
 * @param {string} key - Cache key (typically artist-title)
 * @param {Object} data - Tab data to cache
 */
export function setTabCache(key, data) {
  try {
    if (typeof window === 'undefined') {
      // Skip caching during server-side rendering
      return;
    }
    
    const cacheItem = {
      data,
      timestamp: Date.now()
    };
    
    const storageKey = getStorageKey(key);
    localStorage.setItem(storageKey, JSON.stringify(cacheItem));
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
    if (typeof window === 'undefined') {
      // Return null during server-side rendering
      return null;
    }
    
    const storageKey = getStorageKey(key);
    const cachedData = localStorage.getItem(storageKey);
    
    if (!cachedData) {
      return null;
    }
    
    const cacheItem = JSON.parse(cachedData);
    const { data, timestamp } = cacheItem;
    const isExpired = Date.now() - timestamp > CACHE_EXPIRATION;
    
    if (isExpired) {
      // Clear expired cache
      localStorage.removeItem(storageKey);
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
    if (typeof window === 'undefined') {
      return;
    }
    
    // Remove all items with our prefix
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
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
    if (typeof window === 'undefined') {
      return [];
    }
    
    const tabs = [];
    
    // Iterate through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Only process our cache keys
      if (key.startsWith(STORAGE_PREFIX)) {
        try {
          const cacheItem = JSON.parse(localStorage.getItem(key));
          
          if (cacheItem && cacheItem.data) {
            // Extract the original key by removing the prefix
            const originalKey = key.substring(STORAGE_PREFIX.length);
            tabs.push({
              key: originalKey,
              ...cacheItem.data
            });
          }
        } catch (error) {
          console.warn(`Error reading cache item ${key}:`, error);
        }
      }
    }
    
    return tabs;
  } catch (error) {
    console.warn('Failed to get cached tabs:', error);
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
  return `${artist ? artist.toLowerCase().trim() : 'unknown'}_${title ? title.toLowerCase().trim() : 'unknown'}`
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}
