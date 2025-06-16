// Mock user data
export const userData = {
  id: 'user-1',
  name: 'Guitar Learner',
  email: 'learner@example.com',
  skillLevel: 'intermediate',
  joinDate: '2023-06-15',
  completedSongs: 12,
  inProgressSongs: 3,
};

// Mock song data
export const songs = [
  {
    id: 'song-1',
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    genre: 'Rock',
    difficulty: 'Intermediate',
    duration: 482, // in seconds
    progress: 400,
    status: 'Learning',
    coverUrl: 'https://via.placeholder.com/300?text=Led+Zeppelin+IV',
    videoUrl: 'https://www.youtube.com/watch?v=QkF3oxziUI4',
    keySignature: 'A minor',
    tempo: 82,
    timeSignature: '4/4',
    dateAdded: '2023-08-12',
    chords: ['Am', 'G', 'D', 'F', 'C'],
    scales: ['A Minor Pentatonic', 'A Natural Minor (Aeolian)'],
  },
  {
    id: 'song-2',
    title: 'Thunderstruck',
    artist: 'AC/DC',
    album: 'The Razors Edge',
    genre: 'Rock',
    difficulty: 'Intermediate',
    duration: 292,
    progress: 292,
    status: 'Comfortable',
    coverUrl: 'https://via.placeholder.com/300?text=The+Razors+Edge',
    videoUrl: 'https://www.youtube.com/watch?v=v2AC41dglnM',
    keySignature: 'B major',
    tempo: 134,
    timeSignature: '4/4',
    dateAdded: '2023-07-28',
    chords: ['B', 'E', 'A', 'D', 'F#'],
    scales: ['B Major', 'B Minor Pentatonic'],
  },
  {
    id: 'song-3',
    title: 'Neon',
    artist: 'John Mayer',
    album: 'Continuum',
    genre: 'Pop',
    difficulty: 'Advanced',
    duration: 269,
    progress: 120,
    status: 'Learning',
    coverUrl: 'https://via.placeholder.com/300?text=Continuum',
    videoUrl: 'https://www.youtube.com/watch?v=_DfQC5qHhbo',
    keySignature: 'E major',
    tempo: 128,
    timeSignature: '4/4',
    dateAdded: '2023-09-05',
    chords: ['E', 'A', 'B', 'C#m', 'G#m'],
    scales: ['E Major', 'E Minor Pentatonic'],
  },
  {
    id: 'song-4',
    title: 'Wish You Were Here',
    artist: 'Pink Floyd',
    album: 'Wish You Were Here',
    genre: 'Rock',
    difficulty: 'Beginner',
    duration: 334,
    progress: 334,
    status: 'Comfortable',
    coverUrl: 'https://via.placeholder.com/300?text=Wish+You+Were+Here',
    videoUrl: 'https://www.youtube.com/watch?v=IXdNnw99-Ic',
    keySignature: 'G major',
    tempo: 66,
    timeSignature: '4/4',
    dateAdded: '2023-06-18',
    chords: ['G', 'C', 'D', 'A', 'Em'],
    scales: ['G Major', 'G Major Pentatonic'],
  },
  {
    id: 'song-5',
    title: 'Nothing Else Matters',
    artist: 'Metallica',
    album: 'Metallica (Black Album)',
    genre: 'Metal',
    difficulty: 'Intermediate',
    duration: 386,
    progress: 0,
    status: 'Not Started',
    coverUrl: 'https://via.placeholder.com/300?text=Metallica',
    videoUrl: 'https://www.youtube.com/watch?v=tAGnKpE4NCI',
    keySignature: 'E minor',
    tempo: 69,
    timeSignature: '6/8',
    dateAdded: '2023-10-01',
    chords: ['Em', 'D', 'C', 'G', 'B7'],
    scales: ['E Minor', 'E Minor Pentatonic'],
  },
];

// Mock practice data for charts
export const practiceData = {
  daily: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Practice Minutes',
        data: [30, 45, 20, 60, 15, 90, 45],
        borderColor: '#3e63dd',
        backgroundColor: 'rgba(62, 99, 221, 0.2)',
        fill: true,
      }
    ]
  },
  weekly: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Practice Minutes',
        data: [240, 300, 180, 420],
        borderColor: '#3e63dd',
        backgroundColor: 'rgba(62, 99, 221, 0.2)',
        fill: true,
      }
    ]
  },
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Practice Minutes',
        data: [1200, 1350, 900, 1600, 1100, 1450],
        borderColor: '#3e63dd',
        backgroundColor: 'rgba(62, 99, 221, 0.2)',
        fill: true,
      }
    ]
  }
};

// Mock progression stats
export const progressStats = {
  songsMastered: 16,
  songsInProgress: 40,
  songsAdded: 56,
  totalHoursPracticed: 128,
  averageSessionLength: 35, // minutes
  streakDays: 12,
  longestStreak: 21
};

// Mock recent practice sessions
export const recentPractice = [
  {
    id: 'session-1',
    songId: 'song-1',
    date: '2023-10-15T18:30:00',
    duration: 45, // minutes
    sections: ['Intro', 'Verse 1', 'Chorus'],
    notes: 'Struggled with the fingerpicking pattern in the intro'
  },
  {
    id: 'session-2',
    songId: 'song-3',
    date: '2023-10-14T20:15:00',
    duration: 30,
    sections: ['Verse', 'Chorus'],
    notes: 'Getting better with the right-hand technique'
  },
  {
    id: 'session-3',
    songId: 'song-2',
    date: '2023-10-14T10:00:00',
    duration: 20,
    sections: ['Intro', 'Solo'],
    notes: 'Speed improving to 80% of target tempo'
  }
]; 