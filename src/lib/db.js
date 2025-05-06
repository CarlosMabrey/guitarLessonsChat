// Local database implementation using localStorage

// Base keys for storage
const KEYS = {
  SONGS: 'guitarCoach_songs',
  PRACTICE_SESSIONS: 'guitarCoach_practice',
  ACHIEVEMENTS: 'guitarCoach_achievements',
  USER_PREFERENCES: 'guitarCoach_preferences',
  CHAT_HISTORY: 'guitarCoach_chat',
  CHORD_DATA: 'guitarCoach_chords',
  SONG_ANALYSIS: 'guitarCoach_song_analysis'
};

// Initialize default data if not present
export const initializeDatabase = () => {
  if (typeof window === 'undefined') return;
  
  // Initialize empty arrays if they don't exist
  if (!localStorage.getItem(KEYS.SONGS)) {
    localStorage.setItem(KEYS.SONGS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(KEYS.PRACTICE_SESSIONS)) {
    localStorage.setItem(KEYS.PRACTICE_SESSIONS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(KEYS.ACHIEVEMENTS)) {
    localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(KEYS.USER_PREFERENCES)) {
    localStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify({
      theme: 'dark',
      metronomeVolume: 50,
      defaultPracticeTime: 20, // minutes
    }));
  }
  
  if (!localStorage.getItem(KEYS.CHAT_HISTORY)) {
    localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify({}));
  }
  
  if (!localStorage.getItem(KEYS.CHORD_DATA)) {
    localStorage.setItem(KEYS.CHORD_DATA, JSON.stringify({}));
  }
  
  if (!localStorage.getItem(KEYS.SONG_ANALYSIS)) {
    localStorage.setItem(KEYS.SONG_ANALYSIS, JSON.stringify({}));
  }
};

// Song operations
export const getAllSongs = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const songs = localStorage.getItem(KEYS.SONGS);
    return songs ? JSON.parse(songs) : [];
  } catch (error) {
    console.error('Error retrieving songs:', error);
    return [];
  }
};

// Alias for dashboard compatibility
export const getSongs = getAllSongs;

export const getSongById = (id) => {
  const songs = getAllSongs();
  return songs.find(song => song.id === id) || null;
};

export const addSong = (song) => {
  if (typeof window === 'undefined') return false;
  
  try {
    const songs = getAllSongs();
    // Add songsterrId if provided
    const newSong = {
      ...song,
      // Ensure we have the required fields
      id: song.id || `song-${Date.now()}`,
      dateAdded: song.dateAdded || new Date().toISOString(),
      status: song.status || 'Not Started',
      progress: 0,
      songsterrId: song.songsterrId || null
    };
    
    songs.push(newSong);
    localStorage.setItem(KEYS.SONGS, JSON.stringify(songs));
    return true;
  } catch (error) {
    console.error('Error adding song:', error);
    return false;
  }
};

export const saveSongAnalysis = (song, analysis) => {
  if (typeof window === 'undefined') return false;
  
  try {
    // First, add the song to the library
    const success = addSong(song);
    
    if (!success) {
      console.error('Failed to add song');
      return false;
    }
    
    // Then save the analysis data
    const allAnalysis = localStorage.getItem(KEYS.SONG_ANALYSIS);
    const analysisData = allAnalysis ? JSON.parse(allAnalysis) : {};
    
    // Add the song analysis
    analysisData[song.id] = analysis;
    
    // Also add chords to the chord library
    if (analysis.chords && analysis.chords.length > 0) {
      const allChords = localStorage.getItem(KEYS.CHORD_DATA);
      const chordData = allChords ? JSON.parse(allChords) : {};
      chordData[song.id] = analysis.chords;
      localStorage.setItem(KEYS.CHORD_DATA, JSON.stringify(chordData));
    }
    
    // Save analysis back to localStorage
    localStorage.setItem(KEYS.SONG_ANALYSIS, JSON.stringify(analysisData));
    return true;
  } catch (error) {
    console.error('Error saving song analysis:', error);
    return false;
  }
};

export const updateSong = (updatedSong) => {
  if (typeof window === 'undefined') return false;
  
  try {
    const songs = getAllSongs();
    const index = songs.findIndex(song => song.id === updatedSong.id);
    
    if (index === -1) return false;
    
    songs[index] = {
      ...songs[index],
      ...updatedSong,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(KEYS.SONGS, JSON.stringify(songs));
    return true;
  } catch (error) {
    console.error('Error updating song:', error);
    return false;
  }
};

export const removeSong = (id) => {
  if (typeof window === 'undefined') return false;
  
  try {
    const songs = getAllSongs();
    const filteredSongs = songs.filter(song => song.id !== id);
    
    if (filteredSongs.length === songs.length) return false;
    
    localStorage.setItem(KEYS.SONGS, JSON.stringify(filteredSongs));
    
    // Also remove any associated practice sessions
    const sessions = getAllPracticeSessions();
    const filteredSessions = sessions.filter(session => session.songId !== id);
    localStorage.setItem(KEYS.PRACTICE_SESSIONS, JSON.stringify(filteredSessions));
    
    return true;
  } catch (error) {
    console.error('Error removing song:', error);
    return false;
  }
};

// Practice Session operations
export const getAllPracticeSessions = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const sessions = localStorage.getItem(KEYS.PRACTICE_SESSIONS);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error retrieving practice sessions:', error);
    return [];
  }
};

// Alias for dashboard compatibility
export const getPracticeSessions = getAllPracticeSessions;

export const getPracticeSessionsBySongId = (songId) => {
  const sessions = getAllPracticeSessions();
  return sessions.filter(session => session.songId === songId);
};

export const addPracticeSession = (session) => {
  if (typeof window === 'undefined') return false;
  
  try {
    const sessions = getAllPracticeSessions();
    const newSession = {
      ...session,
      id: session.id || `practice-${Date.now()}`,
      date: session.date || new Date().toISOString()
    };
    
    sessions.push(newSession);
    localStorage.setItem(KEYS.PRACTICE_SESSIONS, JSON.stringify(sessions));
    return newSession;
  } catch (error) {
    console.error('Error adding practice session:', error);
    return false;
  }
};

// Chat operations
export const getChatHistory = (songId) => {
  if (typeof window === 'undefined') return [];
  
  try {
    const allChats = localStorage.getItem(KEYS.CHAT_HISTORY);
    const chatData = allChats ? JSON.parse(allChats) : {};
    return chatData[songId] || [];
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return [];
  }
};

export const saveChatMessage = (songId, message) => {
  if (typeof window === 'undefined') return false;
  
  try {
    const allChats = localStorage.getItem(KEYS.CHAT_HISTORY);
    const chatData = allChats ? JSON.parse(allChats) : {};
    
    // Initialize chat for this song if it doesn't exist
    if (!chatData[songId]) {
      chatData[songId] = [];
    }
    
    // Add the message
    chatData[songId].push(message);
    
    // Save back to localStorage
    localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(chatData));
    return true;
  } catch (error) {
    console.error('Error saving chat message:', error);
    return false;
  }
};

export const clearChatHistory = (songId) => {
  if (typeof window === 'undefined') return false;
  
  try {
    const allChats = localStorage.getItem(KEYS.CHAT_HISTORY);
    const chatData = allChats ? JSON.parse(allChats) : {};
    
    // Remove chat for this song
    if (chatData[songId]) {
      delete chatData[songId];
    }
    
    // Save back to localStorage
    localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(chatData));
    return true;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return false;
  }
};

// Chord operations
export const getChords = (songId) => {
  if (typeof window === 'undefined') return [];
  
  try {
    const allChords = localStorage.getItem(KEYS.CHORD_DATA);
    const chordData = allChords ? JSON.parse(allChords) : {};
    
    // Return chords for this song, or default to common chords if none exist
    return chordData[songId] || [
      { 
        name: 'G', 
        positions: [3, 2, 0, 0, 0, 3],
        fingerings: [2, 1, 0, 0, 0, 3],
        baseFret: 1,
        barres: []
      },
      { 
        name: 'C', 
        positions: [-1, 3, 2, 0, 1, 0],
        fingerings: [0, 3, 2, 0, 1, 0],
        baseFret: 1,
        barres: []
      },
      { 
        name: 'D', 
        positions: [-1, -1, 0, 2, 3, 2],
        fingerings: [0, 0, 0, 1, 3, 2],
        baseFret: 1,
        barres: []
      },
      { 
        name: 'Em', 
        positions: [0, 2, 2, 0, 0, 0],
        fingerings: [0, 2, 3, 0, 0, 0],
        baseFret: 1,
        barres: []
      }
    ];
  } catch (error) {
    console.error('Error retrieving chord data:', error);
    return [];
  }
};

// Progress statistics for dashboard
export const getProgressStats = () => {
  if (typeof window === 'undefined') {
    return {
      songsAdded: 0,
      songsInProgress: 0,
      songsMastered: 0,
      totalHoursPracticed: 0,
      streakDays: 0
    };
  }
  
  try {
    const songs = getAllSongs();
    const sessions = getAllPracticeSessions();
    
    // Count songs by status
    const songsAdded = songs.length;
    const songsInProgress = songs.filter(song => song.status === 'Learning').length;
    const songsMastered = songs.filter(song => song.status === 'Comfortable').length;
    
    // Calculate total practice time in hours
    const totalMinutesPracticed = sessions.reduce((total, session) => {
      return total + (session.duration / 60);
    }, 0);
    const totalHoursPracticed = (totalMinutesPracticed / 60).toFixed(1);
    
    // Calculate streak (placeholder logic - would need more sophisticated implementation)
    // For now, returning a random value between 1-14 for demo purposes
    const streakDays = Math.floor(Math.random() * 14) + 1;
    
    return {
      songsAdded,
      songsInProgress,
      songsMastered,
      totalHoursPracticed,
      streakDays
    };
  } catch (error) {
    console.error('Error calculating progress stats:', error);
    return {
      songsAdded: 0,
      songsInProgress: 0,
      songsMastered: 0,
      totalHoursPracticed: 0,
      streakDays: 0
    };
  }
};

// Initialize database when module is imported
if (typeof window !== 'undefined') {
  initializeDatabase();
} 