import { songs, userData, chords, scales, progressStats as initialProgressStats, recentPractice as initialRecentPractice } from '@/data/mockData';

// Use these keys for local storage
const STORAGE_KEYS = {
  SONGS: 'guitar-app-songs',
  USER: 'guitar-app-user',
  PROGRESS: 'guitar-app-progress',
  PRACTICE_SESSIONS: 'guitar-app-practice-sessions',
  CHORDS: 'guitar-app-chords',
  SCALES: 'guitar-app-scales',
  CHAT_HISTORY: 'guitar-app-chat-history',
};

// Helper to check if we're in a browser environment (to avoid issues with server components)
const isBrowser = typeof window !== 'undefined';

/**
 * Initialize the database with mock data if it doesn't exist
 */
export function initializeDb() {
  if (!isBrowser) return;

  // Check if DB is already initialized
  const isInitialized = localStorage.getItem(STORAGE_KEYS.USER);
  
  if (!isInitialized) {
    // Initialize with mock data
    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(initialProgressStats));
    localStorage.setItem(STORAGE_KEYS.PRACTICE_SESSIONS, JSON.stringify(initialRecentPractice));
    localStorage.setItem(STORAGE_KEYS.CHORDS, JSON.stringify(chords));
    localStorage.setItem(STORAGE_KEYS.SCALES, JSON.stringify(scales));
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify({}));
  }
}

/**
 * Get user data
 */
export function getUser() {
  if (!isBrowser) return userData;
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : userData;
  } catch (error) {
    console.error('Error getting user data:', error);
    return userData;
  }
}

/**
 * Update user data
 */
export function updateUser(updatedUser) {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  } catch (error) {
    console.error('Error updating user data:', error);
  }
}

/**
 * Get all songs
 */
export function getSongs() {
  if (!isBrowser) return songs;
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SONGS);
    return data ? JSON.parse(data) : songs;
  } catch (error) {
    console.error('Error getting songs:', error);
    return songs;
  }
}

/**
 * Get a single song by ID
 */
export function getSongById(id) {
  const allSongs = getSongs();
  return allSongs.find(song => song.id === id);
}

/**
 * Add a new song
 */
export function addSong(newSong) {
  if (!isBrowser) return;
  
  try {
    const currentSongs = getSongs();
    const updatedSongs = [...currentSongs, newSong];
    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(updatedSongs));
    return newSong;
  } catch (error) {
    console.error('Error adding song:', error);
  }
}

/**
 * Update a song
 */
export function updateSong(updatedSong) {
  if (!isBrowser) return;
  
  try {
    const currentSongs = getSongs();
    const updatedSongs = currentSongs.map(song => 
      song.id === updatedSong.id ? updatedSong : song
    );
    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(updatedSongs));
    return updatedSong;
  } catch (error) {
    console.error('Error updating song:', error);
  }
}

/**
 * Remove a song
 */
export function removeSong(songId) {
  if (!isBrowser) return;
  
  try {
    const currentSongs = getSongs();
    const updatedSongs = currentSongs.filter(song => song.id !== songId);
    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(updatedSongs));
  } catch (error) {
    console.error('Error removing song:', error);
  }
}

/**
 * Get progress stats
 */
export function getProgressStats() {
  if (!isBrowser) return initialProgressStats;
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return data ? JSON.parse(data) : initialProgressStats;
  } catch (error) {
    console.error('Error getting progress stats:', error);
    return initialProgressStats;
  }
}

/**
 * Update progress stats
 */
export function updateProgressStats(updatedStats) {
  if (!isBrowser) return;
  
  try {
    const currentStats = getProgressStats();
    const newStats = { ...currentStats, ...updatedStats };
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(newStats));
    return newStats;
  } catch (error) {
    console.error('Error updating progress stats:', error);
  }
}

/**
 * Get practice sessions
 */
export function getPracticeSessions() {
  if (!isBrowser) return initialRecentPractice;
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRACTICE_SESSIONS);
    return data ? JSON.parse(data) : initialRecentPractice;
  } catch (error) {
    console.error('Error getting practice sessions:', error);
    return initialRecentPractice;
  }
}

/**
 * Add a practice session
 */
export function addPracticeSession(session) {
  if (!isBrowser) return;
  
  try {
    const currentSessions = getPracticeSessions();
    
    // Create a new session with a unique ID and current date if not provided
    const newSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      ...session
    };
    
    const updatedSessions = [newSession, ...currentSessions];
    localStorage.setItem(STORAGE_KEYS.PRACTICE_SESSIONS, JSON.stringify(updatedSessions));
    
    // Update progress stats when adding a practice session
    const currentStats = getProgressStats();
    
    // Only update streak if the session is from today
    const today = new Date().toDateString();
    const sessionDate = new Date(newSession.date).toDateString();
    
    if (today === sessionDate) {
      const streakDays = currentStats.streakDays + 1;
      const longestStreak = Math.max(streakDays, currentStats.longestStreak || 0);
      
      updateProgressStats({
        streakDays,
        longestStreak,
        totalHoursPracticed: currentStats.totalHoursPracticed + (newSession.duration / 60)
      });
    }
    
    return newSession;
  } catch (error) {
    console.error('Error adding practice session:', error);
  }
}

/**
 * Get chords for a song
 */
export function getChords(songId) {
  if (!isBrowser) return chords[songId] || [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHORDS);
    const allChords = data ? JSON.parse(data) : chords;
    return allChords[songId] || [];
  } catch (error) {
    console.error('Error getting chords:', error);
    return chords[songId] || [];
  }
}

/**
 * Get scales for a song
 */
export function getScales(songId) {
  if (!isBrowser) return scales[songId] || [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCALES);
    const allScales = data ? JSON.parse(data) : scales;
    return allScales[songId] || [];
  } catch (error) {
    console.error('Error getting scales:', error);
    return scales[songId] || [];
  }
}

/**
 * Get chat history for a song
 */
export function getChatHistory(songId) {
  if (!isBrowser) return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    const allHistory = data ? JSON.parse(data) : {};
    return allHistory[songId] || [];
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
}

/**
 * Save chat message to history
 */
export function saveChatMessage(songId, message) {
  if (!isBrowser) return;
  
  try {
    const allHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    const chatHistory = allHistory ? JSON.parse(allHistory) : {};
    
    // Get current song chat history or initialize empty array
    const songHistory = chatHistory[songId] || [];
    
    // Add the new message
    const updatedSongHistory = [...songHistory, {
      ...message,
      timestamp: new Date().toISOString()
    }];
    
    // Update the chat history
    chatHistory[songId] = updatedSongHistory;
    
    // Save to local storage
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chatHistory));
    
    return message;
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
}

/**
 * Clear chat history for a song
 */
export function clearChatHistory(songId) {
  if (!isBrowser) return;
  
  try {
    const allHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    const chatHistory = allHistory ? JSON.parse(allHistory) : {};
    
    // Clear the history for the specific song
    chatHistory[songId] = [];
    
    // Save to local storage
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chatHistory));
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
}

/**
 * Save chord data for a song
 */
export function saveChords(songId, chordData) {
  if (!isBrowser) return;
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHORDS);
    const allChords = data ? JSON.parse(data) : {};
    
    // Update chords for the specific song
    allChords[songId] = chordData;
    
    // Save to local storage
    localStorage.setItem(STORAGE_KEYS.CHORDS, JSON.stringify(allChords));
    
    return chordData;
  } catch (error) {
    console.error('Error saving chord data:', error);
  }
}

/**
 * Save scale data for a song
 */
export function saveScales(songId, scaleData) {
  if (!isBrowser) return;
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCALES);
    const allScales = data ? JSON.parse(data) : {};
    
    // Update scales for the specific song
    allScales[songId] = scaleData;
    
    // Save to local storage
    localStorage.setItem(STORAGE_KEYS.SCALES, JSON.stringify(allScales));
    
    return scaleData;
  } catch (error) {
    console.error('Error saving scale data:', error);
  }
}

/**
 * Save song analysis data (adds a song and its related data)
 */
export function saveSongAnalysis(songData, analysisData) {
  if (!isBrowser) return;
  
  try {
    // Add the song
    const newSong = addSong(songData);
    
    if (newSong && analysisData) {
      const songId = songData.id;
      
      // Save chords
      if (analysisData.chords && analysisData.chords.length > 0) {
        saveChords(songId, analysisData.chords);
      }
      
      // Save scales
      if (analysisData.scales && analysisData.scales.length > 0) {
        saveScales(songId, analysisData.scales);
      }
    }
    
    return songData;
  } catch (error) {
    console.error('Error saving song analysis:', error);
  }
}

// Initialize the database when this module is imported
if (isBrowser) {
  initializeDb();
} 