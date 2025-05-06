// Song model schema
class Song {
  constructor(id, title, artist, album, duration, difficulty, genre, key, bpm, songsterrId = null) {
    this.id = id;
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.duration = duration; // in seconds
    this.difficulty = difficulty; // 1-5 scale
    this.genre = genre;
    this.key = key;
    this.bpm = bpm;
    this.songsterrId = songsterrId; // ID used for Songsterr tab embedding
    this.progress = "Not Started"; // Not Started, Learning, Comfortable
    this.dateAdded = new Date().toISOString();
    this.lastPracticed = null;
  }
}

export default Song; 