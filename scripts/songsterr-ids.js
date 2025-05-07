// Script to help manage Songsterr IDs for the guitar lesson app
// Run with: node scripts/songsterr-ids.js

const fs = require('fs');
const path = require('path');
const https = require('https');

// Mock songs for testing - replace with actual DB read in production
const songs = [
  { id: 'song1', title: 'Sweet Child O Mine', artist: 'Guns N Roses' },
  { id: 'song2', title: 'Stairway to Heaven', artist: 'Led Zeppelin' },
  { id: 'song3', title: 'Enter Sandman', artist: 'Metallica' },
  { id: 'song4', title: 'Back in Black', artist: 'AC/DC' },
  { id: 'song5', title: 'Hotel California', artist: 'Eagles' },
  { id: 'song6', title: 'Comfortably Numb', artist: 'Pink Floyd' },
  { id: 'song7', title: 'Creep', artist: 'Radiohead' },
  { id: 'song8', title: 'House of the Rising Sun', artist: 'The Animals' },
  { id: 'song9', title: 'Screaming', artist: 'Loathe' },
  { id: 'song10', title: 'Crazy Train', artist: 'Ozzy Osbourne' },
  { id: 'song11', title: 'Smells Like Teen Spirit', artist: 'Nirvana' },
  { id: 'song12', title: 'Wonderwall', artist: 'Oasis' }
];

// Function to make a simple HTTPS request with a timeout
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Return the redirect URL
        resolve({
          redirectUrl: res.headers.location,
          statusCode: res.statusCode
        });
      } else {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            data,
            statusCode: res.statusCode
          });
        });
      }
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    // Set a timeout
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

// Function to extract Songsterr ID from URL
function extractSongsterrId(url) {
  // Check for numeric IDs
  const numericMatch = url.match(/\-tab\-s(\d+)$/);
  if (numericMatch) {
    return {
      id: numericMatch[1],
      type: 'numeric',
      url: url
    };
  }
  
  // Check for slug-based URLs
  const slugMatch = url.match(/\/wsa\/(.*?-tab)$/);
  if (slugMatch) {
    return {
      id: slugMatch[1],
      type: 'slug',
      url: url
    };
  }
  
  return {
    id: null,
    type: 'unknown',
    url: url
  };
}

// Function to find Songsterr ID for a song
async function findSongsterrId(artist, title) {
  try {
    console.log(`Searching for: ${artist} - ${title}`);
    
    // Build the query URL (using Songsterr's bestMatch endpoint)
    const bestMatchUrl = `https://www.songsterr.com/a/wa/bestMatchForQueryString?s=${encodeURIComponent(title)}&a=${encodeURIComponent(artist)}`;
    
    // Make the request
    const result = await makeRequest(bestMatchUrl);
    
    // If we got a redirect, that's the song URL
    if (result.redirectUrl) {
      console.log(`Found match: ${result.redirectUrl}`);
      return extractSongsterrId(result.redirectUrl);
    }
    
    console.log(`No direct match found for ${artist} - ${title}`);
    return {
      id: null,
      type: 'not_found',
      url: null
    };
    
  } catch (error) {
    console.error(`Error finding Songsterr ID for ${artist} - ${title}:`, error.message);
    return {
      id: null,
      type: 'error',
      url: null,
      error: error.message
    };
  }
}

// Main function
async function main() {
  console.log('Songsterr ID Finder Utility');
  console.log('==========================');
  
  const results = [];
  
  // Process each song
  for (const song of songs) {
    // Add a delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = await findSongsterrId(song.artist, song.title);
    
    results.push({
      songId: song.id,
      artist: song.artist,
      title: song.title,
      songsterrId: result.id,
      idType: result.type,
      url: result.url,
      error: result.error
    });
    
    // Print progress
    console.log(`${song.artist} - ${song.title}: ${result.id || 'NOT FOUND'} (${result.type})`);
    console.log('-'.repeat(50));
  }
  
  // Generate JSON output
  const jsonOutput = JSON.stringify(results, null, 2);
  
  // Save to file
  fs.writeFileSync(path.join(__dirname, 'songsterr-results.json'), jsonOutput);
  
  console.log('\nResults saved to songsterr-results.json');
  
  // Generate ready-to-use code snippet
  console.log('\nCode snippet for song mappings:');
  console.log('const SONGSTERR_ID_MAPPINGS = {');
  
  for (const result of results) {
    if (result.songsterrId) {
      const key = `${result.artist.toLowerCase()}:${result.title.toLowerCase()}`;
      console.log(`  '${key}': { id: '${result.songsterrId}', type: '${result.idType}' },`);
    }
  }
  
  console.log('};');
}

// Run the script
main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
}); 