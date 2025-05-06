// Song Service for managing song data

/**
 * Get all songs from local storage
 * @returns {Array} Array of song objects
 */
export const getAllSongs = () => {
  if (typeof window === 'undefined') return [];
  
  const songs = localStorage.getItem('guitarLessonsApp_songs');
  return songs ? JSON.parse(songs) : [];
};

/**
 * Get a single song by ID
 * @param {string} id Song ID
 * @returns {Object|null} Song object or null if not found
 */
export const getSongById = (id) => {
  const songs = getAllSongs();
  return songs.find(song => song.id === id) || null;
};

/**
 * Add a new song to storage
 * @param {Object} song Song object to add
 */
export const addSong = (song) => {
  const songs = getAllSongs();
  songs.push(song);
  localStorage.setItem('guitarLessonsApp_songs', JSON.stringify(songs));
};

/**
 * Update an existing song
 * @param {string} id Song ID
 * @param {Object} updatedData Updated song data
 * @returns {boolean} Success status
 */
export const updateSong = (id, updatedData) => {
  const songs = getAllSongs();
  const index = songs.findIndex(song => song.id === id);
  
  if (index === -1) return false;
  
  songs[index] = { ...songs[index], ...updatedData };
  localStorage.setItem('guitarLessonsApp_songs', JSON.stringify(songs));
  return true;
};

/**
 * Delete a song by ID
 * @param {string} id Song ID
 * @returns {boolean} Success status
 */
export const deleteSong = (id) => {
  const songs = getAllSongs();
  const filteredSongs = songs.filter(song => song.id !== id);
  
  if (filteredSongs.length === songs.length) return false;
  
  localStorage.setItem('guitarLessonsApp_songs', JSON.stringify(filteredSongs));
  return true;
};

/**
 * Update a song's progress status
 * @param {string} id Song ID
 * @param {string} progress Progress status (Not Started, Learning, Comfortable)
 * @returns {boolean} Success status
 */
export const updateSongProgress = (id, progress) => {
  return updateSong(id, { 
    progress, 
    lastPracticed: new Date().toISOString() 
  });
}; 