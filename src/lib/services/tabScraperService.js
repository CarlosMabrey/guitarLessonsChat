/**
 * Tab Scraper Service
 * Handles scraping tab content from Ultimate Guitar
 */
'use client';

import { parse } from 'node-html-parser';
import { search_ug_link } from './tabSearchService';
import { createCacheKey, getTabCache, setTabCache } from './tabCacheService';
import { getTabUrl } from '../../../app/services/tabUrlMappings';

// Cache expiration time (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Extract and save tab content from Ultimate Guitar
 * @param {string} url - The URL of the tab page
 * @returns {Promise<Object>} - The extracted tab data
 */
export async function extract_tab_content(url) {
  console.log(`[TabScraper] Extracting tab from URL: ${url}`);
  
  try {
    // Call our scraper API endpoint
    const response = await fetch('/api/tabs/scrape-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(20000) // 20 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Tab scraper API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.tabContent || data.tabContent.length < 100) {
      throw new Error('Invalid or empty tab content received');
    }
    
    // Extract tab metadata from the HTML
    const metadata = extractTabMetadata(data.html);
    
    return {
      content: data.tabContent,
      title: metadata.title,
      artist: metadata.artist,
      tuning: metadata.tuning,
      url: url
    };
  } catch (error) {
    console.error('[TabScraper] Tab extraction error:', error);
    throw error;
  }
}

/**
 * Extract tab metadata from HTML
 * @param {string} html - HTML content
 * @returns {Object} - Extracted metadata
 */
function extractTabMetadata(html) {
  try {
    const root = parse(html);
    
    let title = 'Unknown Song';
    let artist = 'Unknown Artist';
    let tuning = 'Standard';
    
    // Try to extract title
    const titleElements = [
      root.querySelector('.t_song h1'),
      root.querySelector('.song-name'),
      root.querySelector('h1')
    ];
    
    for (const element of titleElements) {
      if (element) {
        title = element.textContent.trim();
        break;
      }
    }
    
    // Try to extract artist
    const artistElements = [
      root.querySelector('.t_autor a'),
      root.querySelector('.artist-name'),
      root.querySelector('.t_autor')
    ];
    
    for (const element of artistElements) {
      if (element) {
        artist = element.textContent.trim();
        break;
      }
    }
    
    // Try to extract tuning
    const tuningElements = [
      root.querySelector('.tuning'),
      root.querySelector('.js-tuning')
    ];
    
    for (const element of tuningElements) {
      if (element) {
        const tuningText = element.textContent.trim();
        if (tuningText) {
          tuning = tuningText.replace('Tuning:', '').trim() || 'Standard';
          break;
        }
      }
    }
    
    return { title, artist, tuning };
  } catch (error) {
    console.error('[TabScraper] Metadata extraction error:', error);
    return {
      title: 'Unknown Song',
      artist: 'Unknown Artist',
      tuning: 'Standard'
    };
  }
}

/**
 * Find and scrape a tab for a song
 * @param {string} songTitle - Song title
 * @param {string} artistName - Artist name
 * @returns {Promise<Object|null>} - Tab data or null if not found
 */
export async function find_and_scrape_tab(songTitle, artistName) {
  console.log(`[TabScraper] Finding tab for: ${artistName} - ${songTitle}`);
  
  const cacheKey = createCacheKey(artistName, songTitle);
  const cachedTab = getTabCache(cacheKey);
  
  // Check if we have a valid non-expired cache
  if (cachedTab && cachedTab.timestamp) {
    const ageInMs = Date.now() - cachedTab.timestamp;
    if (ageInMs < CACHE_EXPIRATION) {
      console.log(`[TabScraper] Using cached tab for ${songTitle}`);
      return cachedTab;
    }
  }
  
  try {
    // Special handling for well-known songs
    const directUrl = getDirectUrlForSong(songTitle, artistName);
    
    let tabUrl;
    if (directUrl) {
      tabUrl = directUrl;
      console.log(`[TabScraper] Using direct URL for ${songTitle}: ${tabUrl}`);
    } else {
      // Find the tab URL through search
      tabUrl = await search_ug_link(songTitle, artistName);
      console.log(`[TabScraper] Search returned URL: ${tabUrl}`);
    }
    
    if (!tabUrl) {
      console.log(`[TabScraper] No tab URL found for ${songTitle}, using default tab`);
      return getDefaultTabForSong(songTitle, artistName);
    }
    
    // Extract the tab content
    const tabData = await extract_tab_content(tabUrl);
    
    // Format the tab data
    const formattedTabData = {
      title: tabData.title || songTitle,
      artist: tabData.artist || artistName,
      tuning: tabData.tuning || 'Standard',
      rawContent: tabData.content,
      url: tabUrl,
      timestamp: Date.now()
    };
    
    // Cache the result
    setTabCache(cacheKey, formattedTabData);
    
    return formattedTabData;
  } catch (error) {
    console.error(`[TabScraper] Error finding/scraping tab:`, error);
    return getDefaultTabForSong(songTitle, artistName);
  }
}

/**
 * Get direct URL for common songs if available
 * This function provides a mapping of popular songs to their specific tab URLs
 * @param {string} title - Song title
 * @param {string} artist - Artist name
 * @returns {string|null} - Direct URL if available, null otherwise
 */
function getDirectUrlForSong(title, artist) {
  // First try our new URL mappings system
  const mappedUrl = getTabUrl(`${title} ${artist}`);
  if (mappedUrl) {
    console.log(`[TabScraper] Found URL in tabUrlMappings: ${mappedUrl}`);
    return mappedUrl;
  }
  
  // Standardize inputs to lowercase for matching
  const standardTitle = title.toLowerCase().trim();
  const standardArtist = artist.toLowerCase().trim();
  
  // Direct mappings for popular songs
  const directMappings = {
    // Guns N' Roses
    'sweet child of mine': {
      artist: 'guns n roses',
      url: 'https://tabs.ultimate-guitar.com/tab/guns-n-roses/sweet-child-o-mine-tabs-12657'
    },
    'sweet child o mine': {
      artist: 'guns n roses',
      url: 'https://tabs.ultimate-guitar.com/tab/guns-n-roses/sweet-child-o-mine-tabs-12657'
    },
    // Led Zeppelin
    'stairway to heaven': {
      artist: 'led zeppelin',
      url: 'https://tabs.ultimate-guitar.com/tab/led-zeppelin/stairway-to-heaven-tabs-9939'
    },
    // Metallica
    'nothing else matters': {
      artist: 'metallica',
      url: 'https://tabs.ultimate-guitar.com/tab/metallica/nothing-else-matters-tabs-9725'
    },
    'enter sandman': {
      artist: 'metallica',
      url: 'https://tabs.ultimate-guitar.com/tab/metallica/enter-sandman-tabs-114076'
    },
    // AC/DC
    'highway to hell': {
      artist: 'ac dc',
      url: 'https://tabs.ultimate-guitar.com/tab/ac-dc/highway-to-hell-tabs-7512'
    },
    'back in black': {
      artist: 'ac dc',
      url: 'https://tabs.ultimate-guitar.com/tab/ac-dc/back-in-black-tabs-7533'
    },
    // Nirvana
    'smells like teen spirit': {
      artist: 'nirvana',
      url: 'https://tabs.ultimate-guitar.com/tab/nirvana/smells-like-teen-spirit-tabs-202'
    },
    'come as you are': {
      artist: 'nirvana',
      url: 'https://tabs.ultimate-guitar.com/tab/nirvana/come-as-you-are-tabs-89780'
    },
    // Pink Floyd
    'wish you were here': {
      artist: 'pink floyd',
      url: 'https://tabs.ultimate-guitar.com/tab/pink-floyd/wish-you-were-here-tabs-1037090'
    },
    'comfortably numb': {
      artist: 'pink floyd',
      url: 'https://tabs.ultimate-guitar.com/tab/pink-floyd/comfortably-numb-tabs-29488'
    },
    // Deep Purple
    'smoke on the water': {
      artist: 'deep purple',
      url: 'https://tabs.ultimate-guitar.com/tab/deep-purple/smoke-on-the-water-tabs-8669'
    },
    // Eagles
    'hotel california': {
      artist: 'eagles',
      url: 'https://tabs.ultimate-guitar.com/tab/eagles/hotel-california-tabs-46492'
    },
    // The Beatles
    'blackbird': {
      artist: 'beatles',
      url: 'https://tabs.ultimate-guitar.com/tab/the-beatles/blackbird-tabs-1090557'
    },
    'let it be': {
      artist: 'beatles',
      url: 'https://tabs.ultimate-guitar.com/tab/the-beatles/let-it-be-tabs-17446'
    },
    // Van Morrison
    'brown eyed girl': {
      artist: 'van morrison',
      // Update to use the older format URL that works via redirection
      url: 'https://tabs.ultimate-guitar.com/v/van_morrison/brown_eyed_girl_tab.htm'
    },
    // Oasis
    'wonderwall': {
      artist: 'oasis',
      url: 'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-tabs-4128'
    },
    // Green Day
    'good riddance': {
      artist: 'green day',
      url: 'https://tabs.ultimate-guitar.com/tab/green-day/good-riddance-time-of-your-life-tabs-159830'
    },
    'time of your life': {
      artist: 'green day',
      url: 'https://tabs.ultimate-guitar.com/tab/green-day/good-riddance-time-of-your-life-tabs-159830'
    },
    // Bob Marley
    'redemption song': {
      artist: 'bob marley',
      url: 'https://tabs.ultimate-guitar.com/tab/bob-marley/redemption-song-tabs-12955'
    },
    // Johnny Cash
    'hurt': {
      artist: 'johnny cash',
      url: 'https://tabs.ultimate-guitar.com/tab/johnny-cash/hurt-tabs-75449'
    },
    // Jeff Buckley/Leonard Cohen
    'hallelujah': {
      artist: 'jeff buckley',
      url: 'https://tabs.ultimate-guitar.com/tab/jeff-buckley/hallelujah-tabs-15879'
    }
  };
  
  // Check if we have a direct mapping for this song
  const songMapping = directMappings[standardTitle];
  
  if (songMapping) {
    // If we have an artist match or no artist specified
    if (!standardArtist || songMapping.artist.includes(standardArtist) || standardArtist.includes(songMapping.artist)) {
      return songMapping.url;
    }
  }
  
  // Add special handling for variations and partial matches
  
  // For "Sweet Child O' Mine" and its variations
  if ((standardTitle.includes('sweet child') || standardTitle.includes('sweet')) && 
      (standardArtist.includes('guns') || standardArtist.includes('rose'))) {
    return directMappings['sweet child o mine'].url;
  }
  
  // For "Brown Eyed Girl" and variations
  if ((standardTitle.includes('brown') && standardTitle.includes('girl')) || 
      (standardTitle.includes('eyed') && standardArtist.includes('morrison'))) {
    return directMappings['brown eyed girl'].url;
  }
  
  // No direct mapping found
  return null;
}

/**
 * Create a default tab for a song when scraping fails
 * @param {string} songTitle - Song title
 * @param {string} artistName - Artist name
 * @returns {Object} - Default tab data
 */
function getDefaultTabForSong(songTitle, artistName) {
  // Normalize inputs for comparison
  const normalizedTitle = songTitle.toLowerCase().replace(/[^\w\s]/g, '');
  const normalizedArtist = artistName.toLowerCase().replace(/[^\w\s]/g, '');
  const songKey = `${normalizedTitle}-${normalizedArtist}`;
  
  // Default tabs for popular songs
  const defaultTabs = {
    'sweet child o mine-guns n roses': {
      title: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      tuning: "Standard",
      rawContent: `e|---------------------------------------------15p12-15p12-----|
B|--15b17--15b17--15b17--15b17--15b17--15------------------15-|
G|----------------------------------------------------14-------|
D|-----------------------------------------------------------|
A|-----------------------------------------------------------|
E|-----------------------------------------------------------|

e|---------------------------------------------15p12-15p12-----|
B|--15b17--15b17--15b17--15b17--15b17--15------------------15-|
G|----------------------------------------------------14-------|
D|-----------------------------------------------------------|
A|-----------------------------------------------------------|
E|-----------------------------------------------------------|`,
      url: "https://tabs.ultimate-guitar.com/tab/guns-n-roses/sweet-child-o-mine-tabs-12657"
    },
    'stairway to heaven-led zeppelin': {
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      tuning: "Standard",
      rawContent: `e|-------5-7-----7-8-----8-2-----2-0-----------|
B|-----5-----5-------5-------3-------3-----|
G|---5---------5-------5-------2-------2---|
D|-7-------6-------5-------4-------0-------|
A|---------------------------------3-------|
E|------------------------------------------|

e|-------5-7-----7-8-----8-2-----2-0-----------|
B|-----5-----5-------5-------3-------3-----|
G|---5---------5-------5-------2-------2---|
D|-7-------6-------5-------4-------0-------|
A|---------------------------------3-------|
E|------------------------------------------|`,
      url: "https://tabs.ultimate-guitar.com/tab/led-zeppelin/stairway-to-heaven-tabs-9939"
    },
    'smells like teen spirit-nirvana': {
      title: "Smells Like Teen Spirit",
      artist: "Nirvana",
      tuning: "Standard",
      rawContent: `e|---------------------------------------------------------------------|
B|---------------------------------------------------------------------|
G|---------------------------------------------------------------------|
D|---------------------------------------------------------------------|
A|--9--9--9--9--7--7--7--7--4--4--4--4--2--2--2--2----------------------|
E|--7--7--7--7--5--5--5--5--2--2--2--2--0--0--0--0----------------------|

e|---------------------------------------------------------------------|
B|---------------------------------------------------------------------|
G|---------------------------------------------------------------------|
D|---------------------------------------------------------------------|
A|--9--9--9--9--7--7--7--7--4--4--4--4--2--2--2--2----------------------|
E|--7--7--7--7--5--5--5--5--2--2--2--2--0--0--0--0----------------------|`,
      url: "https://tabs.ultimate-guitar.com/tab/nirvana/smells-like-teen-spirit-tabs-202"
    },
    'nothing else matters-metallica': {
      title: "Nothing Else Matters",
      artist: "Metallica",
      tuning: "Standard",
      rawContent: `e|--0-------0-------0-------0-------0-------0-------0--------------------|
B|------1-------1-------1-------1-------1-------1----------------------------|
G|--------2-------2-------2-------2-------2-------2--------------------------|
D|----------2-------2-------2-------2-------2-------2------------------------|
A|------------0-------0-------0-------0-------0-------0----------------------|
E|------------------------------------------------------------------------------|

e|--0-------0-------0-------0-------0-------0-------0--------------------|
B|------1-------1-------1-------1-------1-------1----------------------------|
G|--------2-------2-------2-------2-------2-------2--------------------------|
D|----------2-------2-------2-------2-------2-------2------------------------|
A|------------0-------0-------0-------0-------0-------0----------------------|
E|------------------------------------------------------------------------------|`,
      url: "https://tabs.ultimate-guitar.com/tab/metallica/nothing-else-matters-tabs-9725"
    },
    'smoke on the water-deep purple': {
      title: "Smoke on the Water",
      artist: "Deep Purple",
      tuning: "Standard",
      rawContent: `e|-----------------------------------------------------------|
B|-----------------------------------------------------------|
G|------0-----3-----5-----0-----3--6--5--------------------|
D|----0---0-3---3-5---5-0---0-3---6---5-------------------|
A|--0-------3-----5-----0-----3-------5-------------------|
E|-----------------------------------------------------------|`,
      url: "https://tabs.ultimate-guitar.com/tab/deep-purple/smoke-on-the-water-tabs-8669"
    },
    'hotel california-eagles': {
      title: "Hotel California",
      artist: "Eagles",
      tuning: "Standard",
      rawContent: `e|-------5-7-----7-|-8-----8-2-----2-|-0-------0---------|-----------------|
B|-----5-----5-----|---5-------3-----|---1---1-----1---|-0---------------|
G|---5---------5---|-----5-------2---|-----2---------2-|-0---------------|
D|-7-------6-------|-5-------4-------|-3---------------|-----------------|
A|-----------------|-----------------|-----------------|-----------------|
E|-----------------|-----------------|-----------------|-----------------|`,
      url: "https://tabs.ultimate-guitar.com/tab/eagles/hotel-california-tabs-46492"
    },
    'wonderwall-oasis': {
      title: "Wonderwall",
      artist: "Oasis",
      tuning: "Standard",
      rawContent: `e|-------0---------0---------0---------0----------|
B|-------3---------3---------3---------3----------|
G|-------2---------2---------0---------0----------|
D|-------0---------0---------0---------0----------|
A|--2-----------------0-----------------0---------|
E|--3-----------------2-----------------3---------|`,
      url: "https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-tabs-4128"
    }
  };
  
  // Check if we have a default tab for this song
  for (const [defaultKey, tab] of Object.entries(defaultTabs)) {
    if (songKey.includes(defaultKey) || defaultKey.includes(songKey)) {
      return {
        ...tab,
        timestamp: Date.now()
      };
    }
  }
  
  // General fallback tab
  return {
    title: songTitle,
    artist: artistName,
    tuning: "Standard",
    rawContent: `e|---------------------------------------|
B|---------------------------------------|
G|---------------------------------------|
D|---------------------------------------|
A|---------------------------------------|
E|---------------------------------------|

No tab found for ${songTitle} by ${artistName}.
Try using the direct URL import feature instead.`,
    url: null,
    timestamp: Date.now()
  };
} 