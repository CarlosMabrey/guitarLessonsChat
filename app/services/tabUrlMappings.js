/**
 * Tab URL Mappings
 * 
 * This file contains direct URL mappings for popular songs to ensure
 * we can always find tab content even when search/scraping fails.
 * 
 * The URLs are verified to work with our tab scraper or direct fetch methods.
 */

const tabUrlMappings = {
  // Brown Eyed Girl by Van Morrison
  "brown eyed girl": [
    // These older format URLs work through 301 redirects to valid content
    "https://tabs.ultimate-guitar.com/v/van_morrison/brown_eyed_girl_tab.htm", // Redirects to tabs-97120
    "https://tabs.ultimate-guitar.com/v/van_morrison/brown_eyed_girl_ver2_tab.htm", // Redirects to tabs-179799
    "https://tabs.ultimate-guitar.com/v/van_morrison/brown_eyed_girl_ver3_tab.htm", // Redirects to tabs-547505
    
    // Direct URLs from the redirects (if you want to skip the redirect)
    "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-tabs-97120",
    "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-tabs-179799",
    "https://tabs.ultimate-guitar.com/tab/van-morrison/brown-eyed-girl-tabs-547505"
  ],
  
  // Sweet Child O' Mine by Guns N' Roses
  "sweet child o mine": [
    "https://tabs.ultimate-guitar.com/g/guns_n_roses/sweet_child_o_mine_tab.htm",
    "https://tabs.ultimate-guitar.com/g/guns_n_roses/sweet_child_o_mine_ver4_tab.htm"
  ],
  
  // Wonderwall by Oasis
  "wonderwall": [
    "https://tabs.ultimate-guitar.com/o/oasis/wonderwall_tab.htm",
    "https://tabs.ultimate-guitar.com/o/oasis/wonderwall_ver7_tab.htm"
  ],
  
  // Stairway to Heaven by Led Zeppelin
  "stairway to heaven": [
    "https://tabs.ultimate-guitar.com/l/led_zeppelin/stairway_to_heaven_tab.htm",
    "https://tabs.ultimate-guitar.com/l/led_zeppelin/stairway_to_heaven_ver5_tab.htm"
  ],
  
  // Hotel California by Eagles
  "hotel california": [
    "https://tabs.ultimate-guitar.com/e/eagles/hotel_california_tab.htm",
    "https://tabs.ultimate-guitar.com/e/eagles/hotel_california_ver7_tab.htm"
  ]
};

/**
 * Get URL for a specific song
 * @param {string} songName - The song name to look up
 * @returns {string|null} - The URL for the song, or null if not found
 */
export function getTabUrl(songName) {
  const normalizedSong = songName.trim().toLowerCase();
  
  // Exact match
  if (tabUrlMappings[normalizedSong]) {
    return tabUrlMappings[normalizedSong][0]; // Return the first/primary URL
  }
  
  // Partial match
  for (const song in tabUrlMappings) {
    if (normalizedSong.includes(song) || song.includes(normalizedSong)) {
      return tabUrlMappings[song][0];
    }
  }
  
  return null;
}

/**
 * Get all URLs for a specific song
 * @param {string} songName - The song name to look up
 * @returns {string[]} - Array of URLs for the song, or empty array if not found
 */
export function getAllTabUrls(songName) {
  const normalizedSong = songName.trim().toLowerCase();
  
  // Exact match
  if (tabUrlMappings[normalizedSong]) {
    return tabUrlMappings[normalizedSong];
  }
  
  // Partial match
  for (const song in tabUrlMappings) {
    if (normalizedSong.includes(song) || song.includes(normalizedSong)) {
      return tabUrlMappings[song];
    }
  }
  
  return [];
}

export default tabUrlMappings; 