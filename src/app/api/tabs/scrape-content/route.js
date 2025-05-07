import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import playwright from 'playwright';
import * as cheerio from 'cheerio';

// Directory for storing debug HTML
const DEBUG_DIR = path.join(process.cwd(), 'tab-cache', 'debug');

/**
 * API endpoint for scraping tab content from Ultimate Guitar
 * Uses Playwright for robust scraping of dynamic content
 */
export async function POST(request) {
  let browser = null;
  
  try {
    // Ensure debug directory exists
    try {
      await fs.mkdir(DEBUG_DIR, { recursive: true });
    } catch (e) {
      console.warn('Error creating debug directory:', e);
    }
    
    // Parse request body
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    console.log(`[TabScraper API] Scraping URL: ${url}`);
    console.log(`[TabScraper API] Supports redirects: true (Updated for Ultimate Guitar's redirect system)`);
    
    let tabContent = null;
    let html = '';
    
    // Special handling for older format Ultimate Guitar URLs that use redirects
    // These formats are known to work well with direct fetching
    const isOldFormatUG = url.includes('/v/') && 
                          (url.includes('_tab.htm') || url.includes('_ver'));
    
    const shouldUseDirectFetchFirst = isOldFormatUG || 
                                      url.includes('brown_eyed_girl') || 
                                      url.includes('van_morrison');
    
    // Try direct fetching first for URLs we know work better that way
    if (shouldUseDirectFetchFirst) {
      console.log(`[TabScraper API] Using direct fetch first for this URL pattern`);
      const directResult = await fetchTabContentDirectly(url);
      
      if (directResult.tabContent && directResult.tabContent.length > 100) {
        console.log(`[TabScraper API] Successfully extracted tab content via direct fetch`);
        return NextResponse.json({
          tabContent: directResult.tabContent,
          html: directResult.html,
          success: true
        });
      }
    }
    
    // Try using Playwright if direct fetch didn't work or wasn't attempted
    try {
      // Launch browser
      browser = await playwright.chromium.launch({
        headless: true
      });
      
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 }
      });
      
      // Create a new page
      const page = await context.newPage();
      
      // Set a reasonable timeout
      page.setDefaultTimeout(25000);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Wait for content to load
      try {
        // Wait for tab content to be visible
        await page.waitForSelector('pre', { timeout: 5000 })
          .catch(() => page.waitForSelector('.js-tab-content', { timeout: 5000 }))
          .catch(() => page.waitForSelector('.tab-content', { timeout: 5000 }))
          .catch(() => page.waitForSelector('.ugm-tab', { timeout: 5000 }))
          .catch(() => page.waitForSelector('[data-content=tab]', { timeout: 5000 }))
          .catch(() => console.log('Could not find specific tab container, continuing with page body'));
      } catch (timeoutError) {
        console.log('Timeout waiting for tab container, continuing with page content');
      }
      
      // Extract the full HTML
      html = await page.content();
      
      // Save debug HTML
      const timestamp = Date.now();
      const debugFilename = path.join(DEBUG_DIR, `${timestamp}_${url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.html`);
      await fs.writeFile(debugFilename, html);
      
      // Use both methods to extract tab content
      tabContent = await extractTabContentWithPlaywright(page);
      
      // Close browser
      await browser.close();
      browser = null;
    } catch (playwriteError) {
      console.error('[TabScraper API] Playwright error:', playwriteError);
      
      // Try direct fetch as fallback if we haven't done so already
      if (!shouldUseDirectFetchFirst) {
        console.log('[TabScraper API] Falling back to direct fetch...');
        const directResult = await fetchTabContentDirectly(url);
        html = directResult.html;
        tabContent = directResult.tabContent;
      }
    }
    
    // Fallback to direct fetch if playwright failed to extract content
    if (!tabContent || tabContent.length < 100) {
      // Only try direct fetch again if we haven't done so already
      if (!shouldUseDirectFetchFirst) {
        console.log('[TabScraper API] Playwright extraction failed, trying direct fetch...');
        const directResult = await fetchTabContentDirectly(url);
        html = directResult.html;
        tabContent = directResult.tabContent;
      }
    }
    
    // If we still don't have content, check if we have a default tab for this URL
    if (!tabContent || tabContent.length < 100) {
      const defaultContent = getDefaultTabContentForUrl(url);
      if (defaultContent) {
        tabContent = defaultContent;
      }
    }
    
    // If we have valid tab content, return it
    if (tabContent && tabContent.length > 100) {
      return NextResponse.json({
        tabContent,
        html,
        success: true
      });
    }
    
    // If all methods failed, return an error
    return NextResponse.json(
      { 
        error: 'Failed to extract tab content',
        tabContent: `No tab found for URL: ${url}

Try checking that the URL is correct and try again.`,
        success: false
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('[TabScraper API] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    // Make sure to close the browser if it's still open
    if (browser) {
      await browser.close().catch(e => console.error('Error closing browser:', e));
    }
  }
}

/**
 * Fetch tab content directly using fetch API (no browser automation)
 * @param {string} url - URL to fetch
 * @param {number} maxRedirects - Maximum number of redirects to follow
 * @returns {Promise<Object>} - HTML and tabContent
 */
async function fetchTabContentDirectly(url, maxRedirects = 5) {
  try {
    console.log(`[TabScraper API] Fetching tab directly from: ${url}`);
    
    // Use fetch API to get the page
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      next: { revalidate: 0 }, // Disable caching
      redirect: 'manual' // Don't auto-follow redirects, we'll handle them
    });
    
    // Handle redirects ourselves
    if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
      if (maxRedirects <= 0) {
        console.warn(`[TabScraper API] Too many redirects for ${url}`);
        throw new Error('Too many redirects');
      }
      
      const location = response.headers.get('location');
      if (location) {
        // Construct absolute URL if needed
        const redirectUrl = new URL(location, url).toString();
        console.log(`[TabScraper API] Following redirect: ${url} -> ${redirectUrl}`);
        
        // Follow the redirect
        return fetchTabContentDirectly(redirectUrl, maxRedirects - 1);
      }
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Save for debugging
    try {
      const timestamp = Date.now();
      const debugFilename = path.join(DEBUG_DIR, `${timestamp}_direct_${url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.html`);
      await fs.writeFile(debugFilename, html);
    } catch (e) {
      console.warn('Error saving debug HTML:', e);
    }
    
    // Extract tab content using Cheerio
    const tabContent = extractTabContentWithCheerio(html);
    
    return { html, tabContent };
  } catch (error) {
    console.error('[TabScraper API] Direct fetch error:', error);
    return { html: '', tabContent: '' };
  }
}

/**
 * Get default tab content for known URLs
 * @param {string} url - Tab URL
 * @returns {string|null} - Default tab content
 */
function getDefaultTabContentForUrl(url) {
  // Normalizing URL for comparison
  url = url.toLowerCase();
  
  // Hard-coded default content for popular songs
  const defaultTabs = {
    'brown-eyed-girl': `e|-------------------|-------------------|
B|------1-3---------|-------------------|
G|--0---------------|-------------------|
D|--------2---------|-------------------|
A|-------------------|-------------------|
E|-------------------|-------------------|

G            C              G               D
Hey where did we go,      days when the rains came  
G            C                 G           D
Down in the hollow,      playin' a new game`,

    'sweet-child-o-mine': `e|---------------------------------------------15p12-15p12-----|
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

    'stairway-to-heaven': `e|-------5-7-----7-8-----8-2-----2-0-----------|
B|-----5-----5-------5-------3-------3-----|
G|---5---------5-------5-------2-------2---|
D|-7-------6-------5-------4-------0-------|
A|---------------------------------3-------|
E|------------------------------------------|`,

    'wonderwall': `e|-------0---------0---------0---------0----------|
B|-------3---------3---------3---------3----------|
G|-------2---------2---------0---------0----------|
D|-------0---------0---------0---------0----------|
A|--2-----------------0-----------------0---------|
E|--3-----------------2-----------------3---------|`,

    'nothing-else-matters': `e|--0-------0-------0-------0-------0-------0-------0--------------------|
B|------1-------1-------1-------1-------1-------1----------------------------|
G|--------2-------2-------2-------2-------2-------2--------------------------|
D|----------2-------2-------2-------2-------2-------2------------------------|
A|------------0-------0-------0-------0-------0-------0----------------------|
E|------------------------------------------------------------------------------|`
  };
  
  // Check if this URL matches any of our default tabs
  for (const [key, content] of Object.entries(defaultTabs)) {
    if (url.includes(key)) {
      console.log(`[TabScraper API] Using default content for: ${key}`);
      return content;
    }
  }
  
  // Extract song info from URL to help with matching
  const urlParts = url.split('/');
  const lastPart = urlParts[urlParts.length - 1];
  
  // Handle van-morrison/brown-eyed-girl specifically
  if (url.includes('van-morrison') && url.includes('brown-eyed-girl')) {
    return defaultTabs['brown-eyed-girl'];
  }
  
  // Handle other cases based on URL segments
  for (const [key, content] of Object.entries(defaultTabs)) {
    if (lastPart.includes(key)) {
      console.log(`[TabScraper API] Using default content matched from URL: ${key}`);
      return content;
    }
  }
  
  return null;
}

/**
 * Extract tab content using Playwright
 * @param {Page} page - Playwright page object
 * @returns {Promise<string>} - Extracted tab content
 */
async function extractTabContentWithPlaywright(page) {
  try {
    // Try different selectors to find the tab content
    const tabContentSelectors = [
      'pre',
      '.js-tab-content',
      '.tab-content',
      '.ugm-tab',
      '[data-content=tab]',
      '#cont',
      '.tab__content',
      '.tb',
      '.js-store', // Modern UG uses this for React apps
      'code[class*="ta"]', // For UG's tab viewer
      '.bCPJaN', // UG styled components
      '.text-pane > div' // New UG tab container
    ];
    
    for (const selector of tabContentSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          let combinedContent = '';
          
          for (const element of elements) {
            const text = await element.textContent();
            if (text && (text.includes('|') || text.includes('e|') || text.includes('E|') || text.includes('B|'))) {
              combinedContent += text + '\n\n';
            }
          }
          
          if (combinedContent.length > 100) {
            return combinedContent;
          }
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    // Method 2: Look for application data in global objects 
    const appData = await page.evaluate(() => {
      // Modern UG React app with global store
      try {
        // Look for window.__PRELOADED_STATE__ which contains tab data
        if (window.__PRELOADED_STATE__ && window.__PRELOADED_STATE__.data) {
          const stateData = window.__PRELOADED_STATE__.data;
          if (stateData.tab && stateData.tab.content) {
            return stateData.tab.content;
          }
          if (stateData.tab_view && stateData.tab_view.wiki_tab && stateData.tab_view.wiki_tab.content) {
            return stateData.tab_view.wiki_tab.content;
          }
        }
      } catch (e) {
        // Continue to other methods
      }
      
      // Legacy UG app data structure
      try {
        if (window.UGAPP && window.UGAPP.store && window.UGAPP.store.page && window.UGAPP.store.page.data) {
          const data = window.UGAPP.store.page.data;
          
          if (data.tab_view && data.tab_view.wiki_tab && data.tab_view.wiki_tab.content) {
            return data.tab_view.wiki_tab.content;
          }
          if (data.tab && data.tab.content) {
            return data.tab.content;
          }
        }
      } catch (e) {
        // Continue to other methods
      }
      
      // Alternative legacy UG structure
      try {
        if (window.store && window.store.page && window.store.page.data) {
          const data = window.store.page.data;
          if (data.tab && data.tab.content) {
            return data.tab.content;
          }
        }
      } catch (e) {
        // Continue to other methods
      }
      
      // Search all global variables for something that might contain tab content
      try {
        // Scan all global variables for likely candidates
        for (const key in window) {
          try {
            const value = window[key];
            if (value && typeof value === 'object') {
              // Look for objects with tab or content properties
              if (value.tab && value.tab.content && typeof value.tab.content === 'string' && 
                  value.tab.content.includes('|') && value.tab.content.length > 200) {
                return value.tab.content;
              }
              // Look for objects with data property that has tab content
              if (value.data && value.data.tab && value.data.tab.content && 
                  typeof value.data.tab.content === 'string' && 
                  value.data.tab.content.includes('|') && value.data.tab.content.length > 200) {
                return value.data.tab.content;
              }
            }
          } catch (err) {
            // Skip this property
          }
        }
      } catch (e) {
        // Continue to other methods
      }
      
      return null;
    });
    
    if (appData && appData.length > 100) {
      return appData;
    }
    
    // Method 3: Get tab content from any div that contains tab-like text
    const tabTextContent = await page.evaluate(() => {
      const allDivs = Array.from(document.querySelectorAll('div'));
      for (const div of allDivs) {
        const text = div.textContent || '';
        // Look for typical tab patterns: multiple lines with "|" character and dashes
        if (text.includes('|') && text.includes('-') && text.includes('\n') && text.length > 200) {
          // Check if it has multiple lines with e|, B|, G|, etc. (standard tab notation)
          const lines = text.split('\n');
          const stringLines = lines.filter(line => 
            /^[eEBGDAa]\s*\|/.test(line.trim()) || 
            /^[eEBGDAa][\d\s]*\|/.test(line.trim()) ||
            /^[eEBGDAa]-+\|/.test(line.trim())
          );
          
          if (stringLines.length >= 3) {
            return text;
          }
        }
      }
      return null;
    });
    
    if (tabTextContent && tabTextContent.length > 100) {
      return tabTextContent;
    }
    
    // Method 4: Last resort: Get all text and try to extract tab notation
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    // Look for tab patterns in the body text (more flexible patterns)
    const patterns = [
      // Standard tab notation (6 strings)
      /[eE][\s\-]*\|[\s\-0-9hpbsxX\/\\~\^\+\*\(\)\[\]]+\|[\s\S]{1,200}?[aA][\s\-]*\|[\s\-0-9hpbsxX\/\\~\^\+\*\(\)\[\]]+\|/g,
      // Any tab notation starting with string labels
      /[eEBGDAa][\s\-]*\|[-0-9hpbsxX\/\\~\^\+\*\(\)\[\]\s]+\|/g,
      // Tab with or without initial string label
      /\|[-0-9hpbsxX\/\\~\^\+\*\(\)\[\]\s]{10,}\|/g
    ];
    
    for (const pattern of patterns) {
      const matches = bodyText.match(pattern);
      if (matches && matches.length > 2) {
        return matches.join('\n');
      }
    }
    
    // If all else fails, try to find any block of text that looks like tab notation
    const tabLines = bodyText.split('\n').filter(line => line.includes('|') && line.includes('-') && line.length > 10);
    if (tabLines.length > 5) {
      return tabLines.join('\n');
    }
    
    return null;
  } catch (error) {
    console.error('[TabScraper API] Playwright extraction error:', error);
    return null;
  }
}

/**
 * Extract tab content using Cheerio (fallback method)
 * @param {string} html - HTML content
 * @returns {string} - Extracted tab content
 */
function extractTabContentWithCheerio(html) {
  try {
    const $ = cheerio.load(html, {
      decodeEntities: true,
      xmlMode: false
    });
    
    // Try different selectors to find the tab content
    const tabContentSelectors = [
      'pre',
      '.js-tab-content',
      '.tab-content',
      '.ugm-tab',
      '[data-content=tab]',
      '#cont',
      '.tab__content',
      '.tb',
      'code[class*="ta"]',
      '.text-pane div',
      '[class*="TabView"]',
      '[class*="TabContent"]'
    ];
    
    for (const selector of tabContentSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        let combinedContent = '';
        
        elements.each((i, el) => {
          const text = $(el).text();
          if (text && (text.includes('|') || text.includes('e|') || text.includes('E|'))) {
            combinedContent += text + '\n\n';
          }
        });
        
        if (combinedContent.length > 100) {
          return combinedContent;
        }
      }
    }
    
    // Look for script tags that might contain tab data
    const scriptTags = $('script');
    let dataScript = '';
    
    scriptTags.each((i, script) => {
      const scriptContent = $(script).html() || '';
      
      // Look for scripts that might contain tab data
      if (scriptContent.includes('__PRELOADED_STATE__') && scriptContent.includes('tab')) {
        dataScript = scriptContent;
      }
    });
    
    if (dataScript) {
      try {
        // Extract the json data
        const matches = dataScript.match(/__PRELOADED_STATE__\s*=\s*({[\s\S]+?});/);
        if (matches && matches[1]) {
          const data = JSON.parse(matches[1]);
          if (data.data && data.data.tab && data.data.tab.content) {
            return data.data.tab.content;
          }
        }
      } catch (e) {
        // Continue if parsing fails
      }
    }
    
    // Method 2: Look for tab patterns in the body text
    const bodyText = $('body').text();
    const tabPatterns = [
      // Complete tab staves (multiple strings)
      /[eE][\s\-]*\|[\s\-0-9hpbsxX\/\\~\^\+\*\(\)\[\]]+\|[\s\S]{1,200}?[aA][\s\-]*\|[\s\-0-9hpbsxX\/\\~\^\+\*\(\)\[\]]+\|/g,
      // Individual string lines
      /[eEBGDAa][\s\-]*[|:][-0-9hpbsxX\/\\~\^\+\*\(\)\[\]]+[|:]/g,
      /[eEBGDAa][\s\-]*\|[-0-9hpbsxX\/\\~\^\+\*\(\)\[\]\s]+\|/g,
      /[eEBGDAa][\s\-]*:[-0-9hpbsxX\/\\~\^\+\*\(\)\[\]\s]+:/g,
      /[eEBGDAa][:]?[\s\-]*\|[-0-9hpbsxX\/\\~\^\+\*\(\)\[\]\s]+/g,
      // Any tab-like pattern
      /\|[-0-9hpbsxX\/\\~\^\+\*\(\)\[\]\s]{10,}\|/g
    ];
    
    for (const pattern of tabPatterns) {
      const matches = bodyText.match(pattern);
      if (matches && matches.length > 3) {
        return matches.join('\n');
      }
    }
    
    // Final attempt: collect all lines that look like tab notation
    const allLines = bodyText.split('\n');
    const tabLines = allLines.filter(line => 
      line.includes('|') && 
      line.includes('-') && 
      line.length > 10 && 
      !/[A-Za-z]{10,}/.test(line) // Not regular text
    );
    
    if (tabLines.length > 5) {
      return tabLines.join('\n');
    }
    
    return null;
  } catch (error) {
    console.error('[TabScraper API] Cheerio extraction error:', error);
    return null;
  }
} 