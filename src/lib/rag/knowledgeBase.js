// Knowledge base content for RAG
// This will be used to provide context to the AI about the site's content

const knowledgeBase = [
  {
    id: 'fretboard-basics',
    title: 'Fretboard Basics',
    content: `The fretboard is the front part of the guitar's neck, featuring frets that divide the neck into fixed segments. Each fret represents a semitone. The standard tuning for a 6-string guitar from low to high is E-A-D-G-B-e. Understanding the fretboard layout is crucial for navigating scales, chords, and melodies.`,
    tags: ['fretboard', 'basics', 'tuning']
  },
  {
    id: 'scales-intro',
    title: 'Introduction to Scales',
    content: `Scales are sequences of notes played in ascending or descending order. The major scale is the foundation of Western music, following the pattern: whole, whole, half, whole, whole, whole, half steps. For example, the C major scale is C-D-E-F-G-A-B. Practice scales to improve finger dexterity and understand music theory.`,
    tags: ['scales', 'music theory', 'practice']
  },
  {
    id: 'chords-101',
    title: 'Basic Guitar Chords',
    content: `Chords are three or more notes played simultaneously. Open chords like C, G, D, A, and E are essential for beginners. Barre chords, such as F and Bm, use one finger to press down multiple strings. Practice transitioning between chords smoothly and ensure each note rings clearly.`,
    tags: ['chords', 'beginner', 'technique']
  },
  {
    id: 'practice-routine',
    title: 'Effective Practice Routine',
    content: `A good practice session should include: 1) Warm-up exercises (5-10 min), 2) Scales and technique (10-15 min), 3) Chord practice (10-15 min), 4) Song practice (15-20 min), and 5) Free play/improvisation (5-10 min). Focus on quality over quantity and use a metronome to track progress.`,
    tags: ['practice', 'routine', 'tips']
  },
  {
    id: 'music-theory-basics',
    title: 'Music Theory Fundamentals',
    content: `Music theory concepts include: 1) Notes (A-G), 2) Intervals (distance between notes), 3) Scales (patterns of notes), 4) Chords (harmonized notes), and 5) Rhythm (timing and duration). Understanding these concepts helps in improvisation, composition, and communication with other musicians.`,
    tags: ['music theory', 'fundamentals', 'education']
  },
  {
    id: 'tablature-guide',
    title: 'Reading Guitar Tablature',
    content: `Guitar tablature (tab) is a form of musical notation showing where to place fingers on the fretboard. Each line represents a string (thickest at bottom), and numbers indicate which fret to press. '0' means open string. Tabs are read left to right, with numbers stacked vertically played simultaneously as chords.`,
    tags: ['tabs', 'notation', 'reading music']
  },
  {
    id: 'fingerstyle-techniques',
    title: 'Fingerstyle Guitar Techniques',
    content: `Fingerstyle involves plucking strings directly with fingertips, fingernails, or picks. Common techniques include: 1) Travis picking (alternating bass with melody), 2) Arpeggios (playing chord notes in sequence), and 3) Hybrid picking (pick + fingers). Start slowly, focusing on clean notes and consistent timing.`,
    tags: ['fingerstyle', 'technique', 'advanced']
  },
  {
    id: 'gear-maintenance',
    title: 'Guitar Care and Maintenance',
    content: `Keep your guitar in good condition by: 1) Wiping strings after playing, 2) Storing in proper humidity (45-55%), 3) Changing strings regularly, 4) Cleaning the fretboard, and 5) Getting professional setup annually. Proper maintenance improves playability and extends instrument life.`,
    tags: ['maintenance', 'gear', 'tips']
  }
];

export default knowledgeBase;
