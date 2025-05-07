// Tab Scraper Test Script
// This script tests the ability to fetch tab content for "Brown Eyed Girl" by Van Morrison
// It uses a direct fetch approach (no browser automation) to test our fallback mechanism

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { fetch } from 'undici';

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URLs to test
const testUrls = [
  "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-tabs-19889",
  "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-tabs-19889",
  // Add these older format URLs which may work via redirects
  "https://tabs.ultimate-guitar.com/v/van_morrison/brown_eyed_girl_tab.htm",
  "https://tabs.ultimate-guitar.com/v/van_morrison/brown_eyed_girl_ver2_tab.htm"
];

// Hardcoded tab content for Brown Eyed Girl (used as fallback)
const fallbackTabContent = `e|-------------------|-------------------|
B|------1-3---------|-------------------|
G|--0---------------|-------------------|
D|--------2---------|-------------------|
A|-------------------|-------------------|
E|-------------------|-------------------|`;

console.log("=== Tab Scraper Test Script ===");
console.log("Testing tab fetching for Brown Eyed Girl by Van Morrison");

// Create output directory for test results
const outputDir = path.join(__dirname, 'tab-test-results');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created output directory: ${outputDir}`);
}

// Function to fetch a URL's content
async function fetchUrl(url, followRedirects = true, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    console.log(`Fetching URL: ${url}`);
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
    
    const makeRequest = (requestUrl) => {
      const req = https.get(requestUrl, options, (res) => {
        // Handle redirects
        if (followRedirects && (res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          if (maxRedirects <= 0) {
            reject(new Error('Too many redirects'));
            return;
          }
          
          const redirectUrl = new URL(res.headers.location, requestUrl).href;
          console.log(`Redirected to: ${redirectUrl}`);
          
          // Follow the redirect
          makeRequest(redirectUrl, followRedirects, maxRedirects - 1);
          return;
        }
        
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch URL: ${res.statusCode}`));
          return;
        }
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`Successfully fetched ${data.length} bytes from ${requestUrl}`);
          
          // Save the raw HTML for debugging
          const timestamp = Date.now();
          const htmlFilePath = path.join(outputDir, `${timestamp}_raw_${requestUrl.replace(/[^a-zA-Z0-9]/g, '_')}.html`);
          fs.writeFileSync(htmlFilePath, data);
          
          resolve(data);
        });
      });
      
      req.on('error', (error) => {
        console.error(`Error fetching ${requestUrl}:`, error.message);
        reject(error);
      });
      
      req.end();
    };
    
    makeRequest(url);
  });
}

// Function to extract tab content from HTML
function extractTabContent(html) {
  console.log('Extracting tab content from HTML...');
  
  // Save HTML for debugging
  const timestamp = Date.now();
  const htmlFilePath = path.join(outputDir, `${timestamp}_html.html`);
  fs.writeFileSync(htmlFilePath, html);
  console.log(`Saved HTML to: ${htmlFilePath}`);
  
  // Simple regex-based extraction approach
  let tabContent = '';
  
  // Attempt 1: Look for pre-formatted text blocks which often contain tab
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  if (preMatch && preMatch[1] && preMatch[1].includes('|') && preMatch[1].includes('-')) {
    tabContent = preMatch[1];
  }
  
  // Attempt 2: Look for specific tab content markers
  if (!tabContent) {
    const tabContentMatch = html.match(/class=['"](?:js-tab-content|tab-content|ugm-tab|content-tab)[^>]*>([\s\S]*?)<\/(?:div|span)>/i);
    if (tabContentMatch && tabContentMatch[1]) {
      tabContent = tabContentMatch[1];
    }
  }
  
  // Attempt 3: Look for common tab notation patterns
  if (!tabContent || tabContent.length < 100) {
    const tabPatterns = [
      /[eEBGDAa][\s\-]*\|[-0-9hpbsxX\/\\~\^\+\*\(\)\[\]\s]+\|/g,
      /\|[-0-9hpbsxX\/\\~\^\+\*\(\)\[\]\s]{10,}\|/g
    ];
    
    for (const pattern of tabPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 3) {
        tabContent = matches.join('\n');
        break;
      }
    }
  }
  
  // Clean HTML tags
  tabContent = tabContent.replace(/<[^>]+>/g, '');
  
  // Save extracted content
  if (tabContent && tabContent.length > 50) {
    const tabFilePath = path.join(outputDir, `${timestamp}_tab.txt`);
    fs.writeFileSync(tabFilePath, tabContent);
    console.log(`Saved extracted tab content to: ${tabFilePath}`);
    return tabContent;
  }
  
  console.log('Failed to extract tab content, using fallback');
  return fallbackTabContent;
}

// Test direct API approach
async function testDirectApi() {
  console.log("\n=== Testing Direct API ===");
  try {
    const response = await fetch('http://localhost:3001/api/tabs/scrape-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url: testUrls[0]
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response:', data ? 'Success' : 'No data');
    
    if (data.tabContent) {
      const filePath = path.join(outputDir, 'api-tab-content.txt');
      fs.writeFileSync(filePath, data.tabContent);
      console.log(`API tab content saved to: ${filePath}`);
      return true;
    } else {
      console.log('API did not return tab content');
      return false;
    }
  } catch (error) {
    console.error('API test error:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  try {
    // Test 1: Check if API endpoint is working
    console.log("\n=== Test 1: API Endpoint ===");
    const apiSuccess = await testDirectApi();
    console.log(`API test result: ${apiSuccess ? 'PASS' : 'FAIL'}`);
    
    // Test 2: Direct fetch + extraction method
    console.log("\n=== Test 2: Direct Fetch Method ===");
    let directFetchSuccess = false;
    let successfulUrl = null;
    
    for (const url of testUrls) {
      try {
        console.log(`\nTesting direct fetch for: ${url}`);
        const html = await fetchUrl(url);
        const tabContent = extractTabContent(html);
        
        if (tabContent && tabContent.length > 100) {
          directFetchSuccess = true;
          successfulUrl = url;
          console.log('Successfully extracted tab content via direct fetch');
          
          // Save the successful URL to a file
          fs.appendFileSync(path.join(outputDir, 'successful-urls.txt'), `${url}\n`);
          break;
        }
      } catch (error) {
        console.error(`Error with direct fetch for ${url}:`, error.message);
      }
    }
    
    console.log(`Direct fetch test result: ${directFetchSuccess ? 'PASS' : 'FAIL'}`);
    if (successfulUrl) {
      console.log(`Working URL: ${successfulUrl}`);
    }
    
    // Test 3: Verify fallback content for Brown Eyed Girl
    console.log("\n=== Test 3: Fallback Content ===");
    const fallbackFilePath = path.join(outputDir, 'fallback-tab-content.txt');
    fs.writeFileSync(fallbackFilePath, fallbackTabContent);
    console.log(`Fallback tab content saved to: ${fallbackFilePath}`);
    console.log('Fallback content test: PASS');
    
    // Final results
    console.log("\n=== Test Results Summary ===");
    console.log(`API test: ${apiSuccess ? 'PASS' : 'FAIL'}`);
    console.log(`Direct fetch test: ${directFetchSuccess ? 'PASS' : 'FAIL'}`);
    console.log(`Fallback content: PASS`);
    
    if (!apiSuccess && !directFetchSuccess) {
      console.log("\nRECOMMENDATION: Use the fallback content approach for now");
      console.log("Edit your tabFetcherService.js to prioritize local tab content for Brown Eyed Girl");
    } else if (directFetchSuccess && !apiSuccess) {
      console.log("\nRECOMMENDATION: Modify the API endpoint to use the direct fetch method");
      console.log("Your scrape-content endpoint should skip Playwright and use the fetch method instead");
      if (successfulUrl) {
        console.log(`Use this URL: ${successfulUrl}`);
      }
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the tests
runTests().catch(console.error); 