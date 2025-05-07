// Find a working tab URL for Brown Eyed Girl
// This script tries multiple possible URLs to find one that returns a 200 status code

import https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=== URL Finder for Brown Eyed Girl ===");

// Try common URL variations
const urlsToTry = [
  // Standard tab IDs - try a range
  "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-tabs-19889",
  "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-tabs-19890",
  "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-tabs-19888",
  "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-tabs-1734402",
  "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-tabs-1097178", 
  "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-tabs-29889",
  
  // Chords variations
  "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-chords-759834",
  "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-chords-8572",
  "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-chords-1508083",
  
  // Different URL formats
  "https://tabs.ultimate-guitar.com/v/van_morrison/brown_eyed_girl_tab.htm",
  "https://tabs.ultimate-guitar.com/v/van_morrison/brown_eyed_girl_ver2_tab.htm",
  "https://tabs.ultimate-guitar.com/v/van_morrison/brown_eyed_girl_ver3_tab.htm"
];

// Test URLs to see if they return a 200 status
async function testUrl(url, followRedirects = true, maxRedirects = 5) {
  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    };
    
    console.log(`Testing URL: ${url}`);
    
    const req = https.get(url, options, (res) => {
      console.log(`  Status: ${res.statusCode}`);
      
      // Follow redirects if needed
      if (followRedirects && (res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        if (maxRedirects <= 0) {
          console.log(`  Too many redirects, stopping`);
          resolve({
            url,
            status: 'too many redirects',
            originalStatus: res.statusCode
          });
          return;
        }
        
        const redirectUrl = new URL(res.headers.location, url).href;
        console.log(`  Redirected to: ${redirectUrl}`);
        
        // Recursively follow the redirect
        testUrl(redirectUrl, true, maxRedirects - 1)
          .then(redirectResult => {
            // Save the original URL and the final destination
            resolve({
              originalUrl: url,
              finalUrl: redirectResult.finalUrl || redirectResult.url,
              status: redirectResult.status,
              originalStatus: res.statusCode
            });
          });
        return;
      }
      
      // Collect response body for successful responses
      let body = '';
      if (res.statusCode === 200) {
        res.on('data', chunk => {
          body += chunk.toString();
        });
      }
      
      res.on('end', () => {
        // If this URL works, save it to a file
        if (res.statusCode === 200) {
          const resultsDir = path.join(__dirname, 'tab-test-results');
          if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
          }
          
          const workingUrlsFile = path.join(resultsDir, 'working-urls.txt');
          fs.appendFileSync(workingUrlsFile, `${url}\n`);
          
          // Save a sample of the content to verify it's a tab
          const bodyPreview = body.slice(0, 1000);
          const hasTabContent = bodyPreview.includes('|--') || bodyPreview.includes('|-0');
          fs.appendFileSync(workingUrlsFile, `  Content has tab notation: ${hasTabContent}\n\n`);
          
          console.log(`  SUCCESS! Saved to working-urls.txt`);
          console.log(`  Content has tab notation: ${hasTabContent}`);
        }
        
        resolve({
          url,
          finalUrl: url,
          status: res.statusCode,
          hasTabContent: body.includes('|--') || body.includes('|-0')
        });
      });
    });
    
    req.on('error', (error) => {
      console.error(`  Error: ${error.message}`);
      resolve({
        url,
        status: 'error',
        error: error.message
      });
    });
    
    req.end();
  });
}

// Test all URLs and report results
async function findWorkingUrls() {
  const results = [];
  
  for (const url of urlsToTry) {
    try {
      const result = await testUrl(url);
      results.push(result);
      // Add a small delay between requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`Error testing ${url}:`, error);
    }
  }
  
  // Summarize results
  console.log("\n=== Results Summary ===");
  
  const workingUrls = results.filter(r => r.status === 200);
  const redirectUrls = results.filter(r => r.originalStatus === 301 || r.originalStatus === 302);
  
  console.log(`Total URLs tested: ${results.length}`);
  console.log(`Direct working URLs (200): ${workingUrls.length}`);
  console.log(`Redirecting URLs (301/302): ${redirectUrls.length}`);
  
  if (workingUrls.length > 0 || redirectUrls.length > 0) {
    console.log("\nWorking URLs:");
    workingUrls.forEach(r => console.log(`- ${r.url}${r.hasTabContent ? ' (has tab notation)' : ''}`));
    
    console.log("\nRedirect URLs that led to working pages:");
    redirectUrls.forEach(r => {
      if (r.status === 200) {
        console.log(`- ${r.originalUrl} → ${r.finalUrl}${r.hasTabContent ? ' (has tab notation)' : ''}`);
      }
    });
    
    // Get best URL to use
    const bestUrl = workingUrls.find(r => r.hasTabContent) || 
                   (redirectUrls.find(r => r.status === 200 && r.hasTabContent) || {}).finalUrl || 
                    workingUrls[0]?.url || 
                   (redirectUrls.find(r => r.status === 200) || {}).finalUrl;
    
    if (bestUrl) {
      console.log("\nNEXT STEPS:");
      console.log("1. Update the 'brown eyed girl' entry in your tabScraperService.js file with this URL:");
      console.log(`   ${bestUrl}`);
      console.log("2. Add this URL to the hardcoded tab content in your scrape-content/route.js file");
    }
  } else {
    console.log("\nNo working URLs found. Use the fallback tab content approach instead.");
  }
}

// Run the URL finder
findWorkingUrls().catch(console.error); 