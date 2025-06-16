// Centralized Music Theory Library
// Extracted from fretboard/index.jsx and related files

// 1. All 12 unique musical notes (pitch classes)
export const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 2. Guitar tunings
export const tunings = {
  Standard: ['E', 'B', 'G', 'D', 'A', 'E'],
  DropD: ['E', 'B', 'G', 'D', 'A', 'D'],
  DADGAD: ['D', 'A', 'G', 'D', 'A', 'D'],
  OpenG: ['D', 'B', 'G', 'D', 'G', 'D'],
  OpenD: ['D', 'A', 'F#', 'D', 'A', 'D'],
};

// 3. Chord types
export const chordTypes = [
  { label: 'Major', type: 'M' },
  { label: 'Minor', type: 'm' },
  { label: 'Dominant 7th', type: '7' },
  { label: 'Major 7th', type: 'maj7' },
  { label: 'Minor 7th', type: 'm7' },
  { label: 'Diminished', type: 'dim' },
  { label: 'Augmented', type: 'aug' },
  { label: 'Sus2', type: 'sus2' },
  { label: 'Sus4', type: 'sus4' },
  { label: 'Add9', type: 'add9' },
  { label: '6th', type: '6' },
  { label: 'm6', type: 'm6' },
  { label: '9th', type: '9' },
];

// 4. Scale types
export const scaleTypes = [
  { label: 'Major Scale', type: 'major' },
  { label: 'Natural Minor', type: 'minor' },
  { label: 'Harmonic Minor', type: 'harmonic minor' },
  { label: 'Melodic Minor', type: 'melodic minor' },
  { label: 'Minor Pentatonic', type: 'minor pentatonic' },
  { label: 'Major Pentatonic', type: 'major pentatonic' },
  { label: 'Blues Scale', type: 'blues' },
  { label: 'Dorian', type: 'dorian' },
  { label: 'Phrygian', type: 'phrygian' },
  { label: 'Lydian', type: 'lydian' },
  { label: 'Mixolydian', type: 'mixolydian' },
  { label: 'Locrian', type: 'locrian' },
];

// 5. Chord patterns and voicing generation (extracted and adapted from fretboard/index.jsx)

// Chord voicing patterns for common open and barre chords
const chordPatterns = {
  'C-M': [
    { name: 'Open', frets: ['x', 3, 2, 0, 1, 0], fingers: ['x', 3, 2, 0, 1, 0] },
    { name: 'Barre', frets: [3, 3, 5, 5, 5, 3], fingers: [1, 1, 3, 4, 2, 1] },
  ],
  'A-M': [
    { name: 'Open', frets: ['x', 0, 2, 2, 2, 0], fingers: ['x', 0, 2, 3, 4, 0] },
    { name: 'Barre', frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1] },
  ],
  'G-M': [
    { name: 'Open', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
    { name: 'Barre', frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1] },
  ],
  'E-M': [
    { name: 'Open', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
    { name: 'Barre', frets: [7, 7, 9, 9, 9, 7], fingers: [1, 1, 3, 4, 2, 1] },
  ],
  'D-M': [
    { name: 'Open', frets: ['x', 'x', 0, 2, 3, 2], fingers: ['x', 'x', 0, 1, 3, 2] },
    { name: 'Barre', frets: [10, 12, 12, 11, 10, 10], fingers: [1, 3, 4, 2, 1, 1] },
  ],
  'F-M': [
    { name: 'Barre', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1] },
  ],
  'A-m': [
    { name: 'Open', frets: ['x', 0, 2, 2, 1, 0], fingers: ['x', 0, 2, 3, 1, 0] },
    { name: 'Barre', frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1] },
  ],
  'E-m': [
    { name: 'Open', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    { name: 'Barre', frets: [7, 7, 9, 7, 8, 7], fingers: [1, 1, 3, 1, 2, 1] },
  ],
  'D-m': [
    { name: 'Open', frets: ['x', 'x', 0, 2, 3, 1], fingers: ['x', 'x', 0, 2, 3, 1] },
    { name: 'Barre', frets: [10, 12, 12, 10, 10, 10], fingers: [1, 3, 4, 1, 1, 1] },
  ],
  'C-m': [
    { name: 'Barre', frets: ['x', 3, 5, 5, 4, 3], fingers: ['x', 1, 3, 4, 2, 1] },
  ],
  'G-m': [
    { name: 'Barre', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1] },
  ],
  'F-m': [
    { name: 'Barre', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1] },
  ],
  // Add more as needed...
};

// Generate all chord voicings for all roots and types
function generateChordVoicings() {
  const voicings = {};
  const roots = allNotes;
  const types = ['M', 'm']; // Extend as needed
  for (const root of roots) {
    for (const type of types) {
      const key = `${root}-${type}`;
      // Use patterns for CAGED system and common open/barre shapes
      if (chordPatterns[key]) {
        voicings[key] = chordPatterns[key];
      } else {
        // For other chords, try to shift open/barre shapes up the neck
        // (This is a simplification; real implementation may be more complex)
        if (type === 'M' && chordPatterns['C-M']) {
          // Shift C major shape up
          const cShape = chordPatterns['C-M'][0];
          const rootIndex = allNotes.indexOf(root);
          const cIndex = allNotes.indexOf('C');
          const shift = (rootIndex - cIndex + 12) % 12;
          const shifted = {
            name: 'Movable (C shape)',
            frets: cShape.frets.map(f => (typeof f === 'number' ? f + shift : f)),
            fingers: cShape.fingers,
          };
          voicings[key] = [shifted];
        } else if (type === 'm' && chordPatterns['A-m']) {
          // Shift Am shape up
          const aShape = chordPatterns['A-m'][0];
          const rootIndex = allNotes.indexOf(root);
          const aIndex = allNotes.indexOf('A');
          const shift = (rootIndex - aIndex + 12) % 12;
          const shifted = {
            name: 'Movable (Am shape)',
            frets: aShape.frets.map(f => (typeof f === 'number' ? f + shift : f)),
            fingers: aShape.fingers,
          };
          voicings[key] = [shifted];
        }
      }
    }
  }
  // Manual overrides for special cases (e.g., F, B, etc.)
  voicings['F-M'] = chordPatterns['F-M'];
  voicings['F-m'] = chordPatterns['F-m'];
  voicings['B-M'] = [
    { name: 'Barre', frets: ['x', 2, 4, 4, 4, 2], fingers: ['x', 1, 3, 4, 2, 1] },
  ];
  voicings['B-m'] = [
    { name: 'Barre', frets: ['x', 2, 4, 4, 3, 2], fingers: ['x', 1, 3, 4, 2, 1] },
  ];
  return voicings;
}

// 6. Chord voicings (generated)
export const chordVoicings = generateChordVoicings();

// 7. Voicing adaptation to tuning
export function adaptVoicingsToTuning(voicings, origTuning, targetTuning) {
  if (!voicings || voicings.length === 0) return [];
  if (origTuning === targetTuning) return voicings;
  const origTuningArray = tunings[origTuning];
  const targetTuningArray = tunings[targetTuning];
  return voicings.map(voicing => {
    const newVoicing = { ...voicing };
    newVoicing.name = `${newVoicing.name} (adapted)`;
    const newFrets = [...voicing.frets];
    for (let i = 0; i < 6; i++) {
      const fret = voicing.frets[i];
      if (fret === 'x') continue;
      if (fret === 0 || fret === '0') {
        newFrets[i] = 0;
        continue;
      }
      const origNote = getFretNote(origTuningArray[5 - i], parseInt(fret, 10));
      const targetOpenNote = targetTuningArray[5 - i];
      const targetNoteIndex = allNotes.indexOf(origNote);
      const targetOpenIndex = allNotes.indexOf(targetOpenNote);
      let newFret = (targetNoteIndex - targetOpenIndex + 12) % 12;
      if (newFret > 12 && parseInt(fret, 10) <= 12) {
        newFret = newFret - 12;
      } else if (newFret === 0 && parseInt(fret, 10) > 0) {
        newFret = 12;
      }
      newFrets[i] = newFret.toString();
    }
    return {
      ...newVoicing,
      frets: newFrets,
      fingers: voicing.fingers ? [...voicing.fingers] : newFrets.map(_ => '')
    };
  });
}

// Helper to get the note at a specific fret
function getFretNote(openNote, fret) {
  const index = allNotes.indexOf(openNote);
  return allNotes[(index + fret) % 12];
}

// 8. Normalization helpers
export function normalizeChordName(inputName) {
  // Normalize input (case-insensitive, remove whitespace, handle common aliases)
  let name = inputName.trim().replace(/\s+/g, '').toUpperCase();
  // Map common aliases to canonical forms
  name = name.replace(/MAJOR|MAJ/, '-M')
             .replace(/MINOR|MIN/, '-m')
             .replace(/MIN7|M7/, '-m7')
             .replace(/MAJ7/, '-maj7')
             .replace(/DOMINANT7|DOM7|DOM/, '-7')
             .replace(/7TH/, '-7')
             .replace(/SUS2/, '-sus2')
             .replace(/SUS4/, '-sus4')
             .replace(/ADD9/, '-add9')
             .replace(/6TH/, '-6')
             .replace(/M6/, '-m6')
             .replace(/9TH/, '-9');
  // If only root and type, e.g. 'C-M', 'A-m', etc.
  if (/^[A-G]#?-([A-Za-z0-9]+)$/.test(name)) return name;
  // If just root, assume major
  if (/^[A-G]#?$/.test(name)) return name + '-M';
  // Try to extract root and type
  const match = name.match(/^([A-G]#?)(.*)$/);
  if (match) {
    let root = match[1];
    let type = match[2];
    if (!type) type = 'M';
    return `${root}-${type}`;
  }
  return name;
}

export function normalizeScaleName(inputName) {
  // Normalize input (case-insensitive, remove whitespace, handle common aliases)
  let name = inputName.trim().toLowerCase();
  // Map descriptive names to canonical types
  const map = {
    'major': 'major',
    'major scale': 'major',
    'minor': 'minor',
    'natural minor': 'minor',
    'harmonic minor': 'harmonic minor',
    'melodic minor': 'melodic minor',
    'minor pentatonic': 'minor pentatonic',
    'major pentatonic': 'major pentatonic',
    'blues': 'blues',
    'blues scale': 'blues',
    'dorian': 'dorian',
    'phrygian': 'phrygian',
    'lydian': 'lydian',
    'mixolydian': 'mixolydian',
    'locrian': 'locrian',
  };
  return map[name] || name;
} 