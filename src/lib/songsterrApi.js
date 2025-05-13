/**
 * This file is provided for backward compatibility.
 * All functionality is now implemented in src/lib/services/songsterrApi.js
 * Please update your imports to use that file directly.
 */

import {
  searchSongsterr,
  getSongsterrDetails,
  extractSongInfo,
  getCompleteSongData,
  getBestSongsterrTabUrl,
  cleanTextForUrl,
  getSongsterrIdForSong,
  searchSongsterrTabs,
  getCleanSongsterrTabLinkViaSearch,
} from './services/songsterrApi';

// Re-export all functions from the main implementation
export {
  searchSongsterr,
  getSongsterrDetails,
  extractSongInfo,
  getCompleteSongData,
  getBestSongsterrTabUrl,
  cleanTextForUrl,
  getSongsterrIdForSong,
  searchSongsterrTabs,
  getCleanSongsterrTabLinkViaSearch,
};

// Export a warning about this file being deprecated
console.warn(
  '[DEPRECATED] src/lib/songsterrApi.js is deprecated. Please update your imports to use src/lib/services/songsterrApi.js'
);