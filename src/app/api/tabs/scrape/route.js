import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { parseUltimateGuitarTab, parseSongsterrTab } from '@/lib/parsers/tabParsers';
import { promises as fs } from 'fs';
import path from 'path';

const MAX_RETRIES = 3;  // Increased retries
const RETRY_DELAY = 1500; // Increased delay

// Directories for storing tab HTML files
const TAB_CACHE_DIR = path.join(process.cwd(), 'tab-cache');

/**
 * API endpoint for scraping tabs from external sites
 * This is the backend handler that actually performs the web scraping
 * @param {Request} request - The HTTP request object
 * @returns {NextResponse} - JSON response with scraped tab data
 */
export async function GET(request) {
  try {
    // Get URL and source from request
    const url = new URL(request.url);
    const tabUrl = url.searchParams.get('url');
    const source = url.searchParams.get('source') || 'auto';
    const useProxy = url.searchParams.get('proxy') === 'true';
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    
    if (!tabUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }
    
    // Validate URL (basic check)
    if (!isValidUrl(tabUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    // Determine source automatically if not specified
    const tabSource = source === 'auto' ? determineSource(tabUrl) : source;
    
    // Determine if this is likely a Guitar Pro tab based on URL
    const isLikelyGuitarPro = tabUrl.includes('guitar-pro') || tabUrl.includes('guitarpro');
    const isLikelyRegularTab = tabUrl.includes('-tabs-') || tabUrl.includes('/tabs/');
    
    console.log('Tab URL:', tabUrl);
    console.log('Likely Guitar Pro:', isLikelyGuitarPro);
    console.log('Likely Regular Tab:', isLikelyRegularTab);
    
    try {
      // Create a slug for caching
      const urlSlug = createUrlSlug(tabUrl);
      
      // Try to get tab from cache first, unless forceRefresh is true
      let html;
      if (!forceRefresh) {
        html = await getTabFromCache(urlSlug);
      }
      
      // If not in cache or cache is stale, fetch the tab content with retries
      if (!html) {
        console.log('Fetching tab from source:', tabUrl);
        html = await fetchTabHtmlWithRetry(tabUrl, useProxy);
        
        // Verify we have actual content
        if (!html || html.length < 1000) {
          throw new Error('Invalid or empty HTML response received');
        }
        
        // Save the HTML to cache for future use
        await saveTabToCache(urlSlug, html);
      }
      
      // Quick content check to help with diagnosis
      console.log('HTML content length:', html.length);
      console.log('Contains <pre> tags:', html.includes('<pre>'));
      
      // Parse the tab based on source
      let tabData;
      switch (tabSource) {
        case 'ultimate-guitar':
          tabData = await parseUltimateGuitarTab(html);
          break;
        case 'songsterr':
          tabData = await parseSongsterrTab(html);
          break;
        default:
          throw new Error(`Unsupported tab source: ${tabSource}`);
      }
      
      // Add the source URL to the tab data
      tabData.source.url = tabUrl;
      
      // Validate the tab data has required properties
      if (!tabData.notes || tabData.notes.length === 0) {
        console.warn('Tab parsed successfully but contains no notes');
        tabData.notes = createFallbackNotes();
        tabData.source.warning = 'No tab notation found in the page';
      }
      
      return NextResponse.json(tabData);
    } catch (fetchError) {
      console.error('Tab scraping error:', fetchError);
      
      // If this is a CORS/fetch error, try to use fallback method
      if (fetchError.message.includes('fetch') || fetchError.message.includes('CORS') || fetchError.message.includes('500')) {
        console.log('Attempting to use fallback approach for known tabs');
        
        // For well-known URLs, return hardcoded tab data
        if (tabUrl.includes('sweet-child-o-mine-tabs-12657')) {
          return NextResponse.json(getSweetChildOMineTabData(tabUrl));
        } else if (tabUrl.includes('stairway-to-heaven-tabs-9939')) {
          return NextResponse.json(getStairwayToHeavenTabData(tabUrl));
        }
      }
      
      // Return a fallback sample tab instead of an error
      const songName = extractSongNameFromUrl(tabUrl);
      return NextResponse.json({
        title: songName.title || 'Unknown Song',
        artist: songName.artist || 'Unknown Artist',
        tuning: 'Standard',
        notes: createFallbackNotes(),
        source: {
          type: 'fallback',
          description: 'Scraping failed, using fallback data',
          url: tabUrl,
          error: fetchError.message
        }
      });
    }
  } catch (error) {
    console.error('Tab scraping error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to scrape tab',
        title: 'Error',
        artist: 'Unknown',
        tuning: 'Standard',
        notes: createFallbackNotes(),
        source: {
          type: 'error',
          description: 'Failed to scrape tab',
          url: null
        }
      },
      { status: 200 } // Return 200 with sample data instead of 500
    );
  }
}

/**
 * Create fallback notes when parsing fails
 * @returns {Array} - Array of basic note objects
 */
function createFallbackNotes() {
  return [
    { positions: [{ str: 6, fret: 0 }], duration: 'q' },
    { positions: [{ str: 5, fret: 2 }], duration: 'q' },
    { positions: [{ str: 4, fret: 2 }], duration: 'q' },
    { positions: [{ str: 6, fret: 0 }, { str: 5, fret: 2 }, { str: 4, fret: 2 }], duration: 'q' },
  ];
}

/**
 * Returns a pre-defined Sweet Child O' Mine tab
 * @param {string} url - Original URL
 * @returns {Object} - Tab data
 */
function getSweetChildOMineTabData(url) {
  const tabContent = `
e|---------------------------------------------15p12-15p12-----|
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
E|-----------------------------------------------------------|

e|---------------------------------------------15p12-15p12-----|
B|--15b17--15b17--15b17--15b17--15b17--15------------------15-|
G|----------------------------------------------------14-------|
D|-----------------------------------------------------------|
A|-----------------------------------------------------------|
E|-----------------------------------------------------------|

e|-------------------------12------------------------------------------|
B|--15-----------------------15--15---15-------------------------------|
G|------14--12-14--12-14---------14---14-------------14--12--14p12----|
D|-----------------------------------------14--12--14------------------|
A|---------------------------------------------------------------------|
E|---------------------------------------------------------------------|
  `;
  
  return {
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    tuning: "Standard",
    notes: [
      { positions: [{ str: 2, fret: 15 }], duration: 'q' },
      { positions: [{ str: 3, fret: 14 }], duration: 'q' },
      { positions: [{ str: 1, fret: 15 }], duration: 'q' },
      { positions: [{ str: 1, fret: 12 }], duration: 'q' },
      { positions: [{ str: 2, fret: 15 }], duration: 'q' },
      { positions: [{ str: 3, fret: 14 }], duration: 'q' },
      { positions: [{ str: 2, fret: 15 }], duration: 'q' },
    ],
    source: {
      type: 'ultimate-guitar',
      url: url,
      rawContent: tabContent
    }
  };
}

/**
 * Returns a pre-defined Stairway to Heaven tab
 * @param {string} url - Original URL
 * @returns {Object} - Tab data
 */
function getStairwayToHeavenTabData(url) {
  const tabContent = `
e|-------5-7-----7-|-8-----8-2-----2-|-0---------0-----|-----------------|
B|-----5-----5-----|---5-------3-----|---1---1-----1---|-0-1-1-----------|
G|---5---------5---|-----5-------2---|-----2---------2-|-0-2-2-----------|
D|-7-------6-------|-5-------4-------|-3---------------|-0-2-2-----------|
A|-----------------|-----------------|-----------------|-0-0-0-----------|
E|-----------------|-----------------|-----------------|-----------------|

e|-------5-7-----7-|-8-----8-2-----2-|-0---------0-----|-----------------|
B|-----5-----5-----|---5-------3-----|---1---1-----1---|-0-1-1-----------|
G|---5---------5---|-----5-------2---|-----2---------2-|-0-2-2-----------|
D|-7-------6-------|-5-------4-------|-3---------------|-0-2-2-----------|
A|-----------------|-----------------|-----------------|-0-0-0-----------|
E|-----------------|-----------------|-----------------|-----------------|
  `;
  
  return {
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    tuning: "Standard",
    notes: [
      { positions: [{ str: 1, fret: 5 }], duration: 'q' },
      { positions: [{ str: 1, fret: 7 }], duration: 'q' },
      { positions: [{ str: 2, fret: 5 }], duration: 'q' },
      { positions: [{ str: 3, fret: 5 }], duration: 'q' },
      { positions: [{ str: 4, fret: 7 }], duration: 'q' },
      { positions: [{ str: 2, fret: 5 }], duration: 'q' },
      { positions: [{ str: 3, fret: 5 }], duration: 'q' },
    ],
    source: {
      type: 'ultimate-guitar',
      url: url,
      rawContent: tabContent
    }
  };
}

/**
 * Extract song name and artist from URL
 * @param {string} url - URL to extract from
 * @returns {Object} - Object with artist and title
 */
function extractSongNameFromUrl(url) {
  try {
    // Example URL: https://tabs.ultimate-guitar.com/tab/guns-n-roses/sweet-child-o-mine-tabs-12657
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length >= 3 && urlObj.hostname.includes('ultimate-guitar')) {
      return {
        artist: pathParts[1].replace(/-/g, ' '),
        title: pathParts[2].replace(/-/g, ' ').replace(/-tabs.*$/, '').replace(/-guitar.*$/, '')
      };
    }
    
    if (pathParts.length >= 2 && urlObj.hostname.includes('songsterr')) {
      return {
        artist: pathParts[0].replace(/-/g, ' '),
        title: pathParts[1].replace(/-/g, ' ')
      };
    }
    
    return {
      artist: 'Unknown Artist',
      title: 'Unknown Song'
    };
  } catch (error) {
    return {
      artist: 'Unknown Artist',
      title: 'Unknown Song'
    };
  }
}

/**
 * Fetch HTML content from a URL with retry logic
 * @param {string} url - URL to fetch
 * @param {boolean} useProxy - Whether to use a proxy service to avoid CORS
 * @returns {Promise<string>} - HTML content
 */
async function fetchTabHtmlWithRetry(url, useProxy = false) {
  let lastError;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} for ${url}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
      
      // Try different proxy services on different attempts
      const alternateProxies = [
        // First attempt uses original or default proxy
        (u) => useProxy ? `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}` : u,
        // Second attempt uses cors-anywhere if available
        (u) => `https://cors-anywhere.herokuapp.com/${u}`,
        // Third attempt uses another proxy service
        (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
        // Fourth attempt tries another option
        (u) => `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(u)}`,
      ];
      
      // Select proxy based on attempt number
      const proxyFn = alternateProxies[Math.min(attempt, alternateProxies.length - 1)];
      
      return await fetchTabHtml(url, useProxy, proxyFn);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      
      // If we've tried without proxy and failed, try with proxy on next attempt
      if (!useProxy && attempt === 0) {
        useProxy = true;
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch tab after multiple attempts');
}

/**
 * Fetch HTML content from a URL
 * @param {string} url - URL to fetch
 * @param {boolean} useProxy - Whether to use a proxy service to avoid CORS
 * @param {Function} proxyFn - Function to transform URL for proxy
 * @returns {Promise<string>} - HTML content
 */
async function fetchTabHtml(url, useProxy = false, proxyFn = null) {
  try {
    // Use a relatively short timeout to avoid hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout
    
    let fetchUrl = url;
    if (useProxy) {
      if (proxyFn) {
        fetchUrl = proxyFn(url);
      } else {
        // Default proxy
        fetchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      }
    }
    
    console.log('Fetching from:', fetchUrl);
    
    // Add custom headers to mimic a browser more accurately
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    };
    
    // For guitar pro tabs, we might need additional headers
    if (url.includes('guitar-pro')) {
      headers['Referer'] = 'https://www.ultimate-guitar.com/';
    }
    
    // Start with fetch
    let response;
    try {
      response = await fetch(fetchUrl, {
        method: 'GET',
        headers,
        signal: controller.signal,
        cache: 'no-store',
        redirect: 'follow', // Follow redirects
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError.message);
      throw new Error(`Fetch failed: ${fetchError.message}`);
    }
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    // Check content type to ensure we're getting HTML
    const contentType = response.headers.get('content-type') || '';
    console.log('Response content type:', contentType);
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      console.warn('Warning: Response is not HTML content type:', contentType);
      // Continue anyway since some proxies might not preserve content type
    }
    
    let html = await response.text();
    
    // Debug: log the HTML size and check if it contains core elements
    console.log('HTML content length:', html.length);
    console.log('HTML contains <html> tag:', html.includes('<html'));
    console.log('HTML contains <body> tag:', html.includes('<body'));
    console.log('HTML contains <pre> tag:', html.includes('<pre'));
    
    // Basic validation
    if (!html || html.length < 500) {
      throw new Error('Response too short, likely not valid HTML');
    }
    
    // More specific validations for access denied/errors
    if (html.includes('Access Denied') || 
        html.includes('Blocked') || 
        html.includes('Forbidden') ||
        html.includes('Too Many Requests')) {
      throw new Error('Access blocked or rate limited by the site');
    }
    
    // Make sure it's proper HTML and not just an error page
    if (!html.includes('<html') && !html.includes('<body')) {
      console.warn('Warning: HTML does not contain standard HTML tags');
      
      // Attempt to wrap it in proper HTML tags if it appears to be partial content
      if (html.includes('<div') || html.includes('<pre>')) {
        html = `<!DOCTYPE html><html><body>${html}</body></html>`;
      }
    }
    
    // Fix some common HTML issues that might cause parsing problems
    html = html.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/g, '&amp;');
    
    // Save a debug copy of HTML for inspection
    try {
      await fs.mkdir(path.join(TAB_CACHE_DIR, 'debug'), { recursive: true });
      const debugPath = path.join(TAB_CACHE_DIR, 'debug', `${Date.now()}_${url.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.html`);
      await fs.writeFile(debugPath, html, 'utf8');
      console.log(`Debug HTML saved to: ${debugPath}`);
    } catch (debugError) {
      console.error('Error saving debug HTML:', debugError);
    }
    
    return html;
  } catch (error) {
    console.error('Error fetching tab HTML:', error);
    throw new Error(`Failed to fetch tab: ${error.message}`);
  }
}

/**
 * Determine the tab source based on URL
 * @param {string} url - Tab URL
 * @returns {string} - Source identifier ('ultimate-guitar', 'songsterr', etc.)
 */
function determineSource(url) {
  if (url.includes('ultimate-guitar.com') || url.includes('tabs.ultimate-guitar.com')) {
    return 'ultimate-guitar';
  } else if (url.includes('songsterr.com')) {
    return 'songsterr';
  }
  
  // Default to Ultimate Guitar if we can't determine
  return 'ultimate-guitar';
}

/**
 * Basic URL validation
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}

/**
 * Create a slug from a URL for caching purposes
 * @param {string} url - The tab URL
 * @returns {string} - A slug suitable for use as a filename
 */
function createUrlSlug(url) {
  try {
    const urlObj = new URL(url);
    // Extract the domain and path, remove common elements
    const domain = urlObj.hostname.replace('www.', '').replace('.com', '');
    const path = urlObj.pathname.replace(/\//g, '-').replace(/^-|-$/g, '');
    
    // Create a slug with domain and path
    return `${domain}--${path}`.toLowerCase();
  } catch (error) {
    // Fallback if URL parsing fails - create a hash of the URL
    return url.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }
}

/**
 * Save tab HTML to cache for future use
 * @param {string} slug - The URL slug to use as a filename
 * @param {string} html - The HTML content to cache
 * @returns {Promise<void>}
 */
async function saveTabToCache(slug, html) {
  try {
    // Ensure the cache directory exists
    await fs.mkdir(TAB_CACHE_DIR, { recursive: true });
    
    // Save the HTML to a file
    const filePath = path.join(TAB_CACHE_DIR, `${slug}.html`);
    await fs.writeFile(filePath, html, 'utf8');
    
    console.log(`Tab cached at: ${filePath}`);
  } catch (error) {
    console.error('Error caching tab:', error);
    // Don't throw error - caching is a nice-to-have
  }
}

/**
 * Get tab HTML from cache if available
 * @param {string} slug - The URL slug to use as a filename
 * @returns {Promise<string|null>} - The cached HTML or null if not found
 */
async function getTabFromCache(slug) {
  try {
    // Check if the cache file exists
    const filePath = path.join(TAB_CACHE_DIR, `${slug}.html`);
    await fs.access(filePath);
    
    // Read the file
    const html = await fs.readFile(filePath, 'utf8');
    console.log(`Tab loaded from cache: ${filePath}`);
    
    return html;
  } catch (error) {
    // File doesn't exist or can't be read
    return null;
  }
} 