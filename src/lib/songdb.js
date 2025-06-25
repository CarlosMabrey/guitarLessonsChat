// Local database implementation for Songs using localStorage

const SONGS_KEY = 'guitarCoach_songs';

export const initializeSongs = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(SONGS_KEY)) {
    localStorage.setItem(SONGS_KEY, JSON.stringify([]));
  }
};

export const getAllSongs = () => {
  if (typeof window === 'undefined') return [];
  try {
    const songs = localStorage.getItem(SONGS_KEY);
    return songs ? JSON.parse(songs) : [];
  } catch (error) {
    console.error('Error retrieving songs:', error);
    return [];
  }
};

export const getSongById = (id) => {
  const songs = getAllSongs();
  return songs.find(song => song.id === id) || null;
};

export const addSong = (song) => {
  if (typeof window === 'undefined') return false;
  try {
    const songs = getAllSongs();
    const newSong = {
      ...song,
      id: song.id || `song-${Date.now()}`,
      dateAdded: song.dateAdded || new Date().toISOString(),
      status: song.status || 'Not Started',
      progress: 0,
      songsterrId: song.songsterrId || null,
      spotifyId: song.spotifyId || null,
      youtubeVideos: song.youtubeVideos || []
    };
    songs.push(newSong);
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
    return true;
  } catch (error) {
    console.error('Error adding song:', error);
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
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
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
    localStorage.setItem(SONGS_KEY, JSON.stringify(filteredSongs));
    return true;
  } catch (error) {
    console.error('Error removing song:', error);
    return false;
  }
};

// Initialize songs on module import
if (typeof window !== 'undefined') {
  initializeSongs();
}
