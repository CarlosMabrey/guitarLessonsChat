// Test URL Redirects for Ultimate Guitar
// This script tests older URL formats that work through redirects

import https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=== Testing Redirects for Brown Eyed Girl Tab URLs ===");

// Create output directory
const outputDir = path.join(__dirname, 'redirect-test-results');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// URLs to test - focus on older formats that might redirect
const urlsToTest = [
  "https://tabs.ultimate-guitar.com/v/van_morrison/brown_eyed_girl_tab.htm",
  "https://tabs.ultimate-guitar.com/v/van_morrison/brown_eyed_girl_ver2_tab.htm",
  "https://tabs.ultimate-guitar.com/v/van_morrison/brown_eyed_girl_ver3_tab.htm",
  "https://www.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-tabs-19889", 
  "https://www.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-chords-8572"
];

// Function to follow redirects manually
async function testRedirects(url, maxRedirects = 10) {
  console.log(`\nTesting: ${url}`);
  let currentUrl = url;
  let redirectCount = 0;
  let finalContent = '';
  
  // Create a log file for this URL
  const logFile = path.join(outputDir, `${url.replace(/[^a-zA-Z0-9]/g, '_')}.log`);
  fs.writeFileSync(logFile, `Testing: ${url}\n\n`);
  
  while (redirectCount < maxRedirects) {
    try {
      // Make the request
      const result = await new Promise((resolve, reject) => {
        const options = {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          }
        };
        
        console.log(`Request: ${currentUrl}`);
        fs.appendFileSync(logFile, `Request: ${currentUrl}\n`);
        
        const req = https.get(currentUrl, options, (res) => {
          console.log(`Status: ${res.statusCode}`);
          fs.appendFileSync(logFile, `Status: ${res.statusCode}\n`);
          
          // Log all headers for debugging
          fs.appendFileSync(logFile, `Headers: ${JSON.stringify(res.headers, null, 2)}\n\n`);
          
          let body = '';
          res.on('data', chunk => {
            body += chunk.toString();
          });
          
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body,
              url: currentUrl
            });
          });
        });
        
        req.on('error', (error) => {
          console.error(`Error: ${error.message}`);
          fs.appendFileSync(logFile, `Error: ${error.message}\n`);
          reject(error);
        });
        
        req.end();
      });
      
      // Check if this was a redirect
      if (result.statusCode === 301 || result.statusCode === 302 || result.statusCode === 307 || result.statusCode === 308) {
        if (!result.headers.location) {
          console.log('Redirect without location header!');
          break;
        }
        
        redirectCount++;
        const nextUrl = new URL(result.headers.location, currentUrl).href;
        console.log(`Redirected to: ${nextUrl}`);
        fs.appendFileSync(logFile, `Redirected to: ${nextUrl}\n\n`);
        currentUrl = nextUrl;
        continue;
      } 
      
      // If we got a 200 OK, we're done
      if (result.statusCode === 200) {
        console.log('Success! Final URL:', currentUrl);
        fs.appendFileSync(logFile, `Success! Final URL: ${currentUrl}\n\n`);
        
        // Save the body for analysis
        finalContent = result.body;
        const hasTabNotation = finalContent.includes('|--') || finalContent.includes('|-0');
        console.log(`Content size: ${finalContent.length} bytes`);
        console.log(`Contains tab notation: ${hasTabNotation}`);
        fs.appendFileSync(logFile, `Content size: ${finalContent.length} bytes\n`);
        fs.appendFileSync(logFile, `Contains tab notation: ${hasTabNotation}\n`);
        
        // Save the full HTML
        const htmlFile = path.join(outputDir, `${currentUrl.replace(/[^a-zA-Z0-9]/g, '_')}.html`);
        fs.writeFileSync(htmlFile, finalContent);
        
        // Check if the page likely has tab content
        if (hasTabNotation) {
          // Try extracting the tab content
          const tabMatch = finalContent.match(/[eEBGDAa][\s\-]*\|[-0-9hpbsxX\/\\~\^\+\*\(\)\[\]\s]+\|/g);
          if (tabMatch && tabMatch.length > 3) {
            const tabContent = tabMatch.join('\n');
            const tabFile = path.join(outputDir, `${currentUrl.replace(/[^a-zA-Z0-9]/g, '_')}.tab`);
            fs.writeFileSync(tabFile, tabContent);
            console.log('Tab content extracted and saved!');
            fs.appendFileSync(logFile, 'Tab content extracted and saved!\n');
          }
        }
        
        break;
      }
      
      // For any other status code, we're done but without success
      console.log(`Non-successful status: ${result.statusCode}`);
      fs.appendFileSync(logFile, `Non-successful status: ${result.statusCode}\n`);
      break;
    } catch (error) {
      console.error('Error:', error.message);
      fs.appendFileSync(logFile, `Error: ${error.message}\n`);
      break;
    }
  }
  
  if (redirectCount >= maxRedirects) {
    console.log('Too many redirects!');
    fs.appendFileSync(logFile, 'Too many redirects!\n');
  }
  
  // Return success status and final URL
  return {
    success: finalContent.length > 0,
    finalUrl: currentUrl,
    hasTabNotation: finalContent.includes('|--') || finalContent.includes('|-0')
  };
}

// Run the tests
async function runTests() {
  const results = [];
  
  for (const url of urlsToTest) {
    try {
      const result = await testRedirects(url);
      results.push({
        originalUrl: url,
        ...result
      });
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.error(`Test failed for ${url}:`, error);
    }
  }
  
  // Print summary
  console.log('\n=== Results Summary ===');
  results.forEach(result => {
    console.log(`${result.originalUrl} -> ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (result.success) {
      console.log(`  Final URL: ${result.finalUrl}`);
      console.log(`  Has tab notation: ${result.hasTabNotation}`);
    }
    console.log('');
  });
  
  // Create summary file
  const summaryFile = path.join(outputDir, 'summary.txt');
  fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2));
  console.log(`Summary saved to: ${summaryFile}`);
  
  // Print the working URLs for easy reference
  const workingUrls = results.filter(r => r.success && r.hasTabNotation);
  if (workingUrls.length > 0) {
    console.log('\n=== Working URLs for Brown Eyed Girl ===');
    workingUrls.forEach(r => console.log(r.finalUrl));
    
    if (workingUrls.length > 0) {
      console.log('\nRecommendation:');
      console.log('Update your tab fetcher to use this URL:');
      console.log(workingUrls[0].finalUrl);
    }
  } else {
    console.log('\nNo working URLs found with tab notation.');
  }
}

runTests().catch(console.error); 