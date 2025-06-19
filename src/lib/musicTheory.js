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
  // Major
  'C-M': [
    { name: 'Open', frets: ['x', 3, 2, 0, 1, 0], fingers: ['x', 3, 2, 0, 1, 0] },
    { name: 'Barre (A shape)', frets: ['x', 3, 5, 5, 5, 3], fingers: ['x', 1, 3, 4, 2, 1] },
    { name: 'Barre (E shape)', frets: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1] },
    { name: 'Triad (strings 2-4)', frets: ['x', 'x', 5, 5, 5, 'x'], fingers: ['x', 'x', 1, 2, 3, 'x'] },
    { name: '1st Inversion', frets: ['x', 3, 5, 5, 5, 'x'], fingers: ['x', 1, 3, 4, 2, 'x'] },
  ],
  'G-M': [
    { name: 'Open', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
    { name: 'Open Variant', frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4] },
    { name: 'Barre (E shape)', frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1] },
  ],
  'A-M': [
    { name: 'Open', frets: ['x', 0, 2, 2, 2, 0], fingers: ['x', 0, 1, 2, 3, 0] },
    { name: 'Barre (E shape)', frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1] },
    { name: 'Open Variant', frets: ['x', 0, 7, 6, 5, 5], fingers: ['x', 0, 4, 3, 1, 2] },
  ],
  'E-M': [
    { name: 'Open', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
    { name: 'Barre (E shape)', frets: [0, 7, 9, 9, 9, 7], fingers: [0, 1, 3, 4, 2, 1] },
  ],
  'D-M': [
    { name: 'Open', frets: ['x', 'x', 0, 2, 3, 2], fingers: ['x', 'x', 0, 1, 3, 2] },
    { name: 'Open Variant', frets: ['x', 'x', 12, 11, 10, 10], fingers: ['x', 'x', 4, 3, 1, 2] },
    { name: 'Barre (A shape)', frets: ['x', 5, 7, 7, 7, 5], fingers: ['x', 1, 3, 4, 2, 1] },
  ],
  'F-M': [
    { name: 'Barre (E shape)', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1] },
    { name: 'Barre (A shape)', frets: ['x', 8, 10, 10, 10, 8], fingers: ['x', 1, 3, 4, 2, 1] },
  ],
  'B-M': [
    { name: 'Barre (A shape)', frets: ['x', 2, 4, 4, 4, 2], fingers: ['x', 1, 3, 4, 2, 1] },
    { name: 'Barre (E shape)', frets: [7, 9, 9, 8, 7, 7], fingers: [1, 3, 4, 2, 1, 1] },
  ],
  // Minor
  'C-m': [
    { name: 'Barre (A shape)', frets: ['x', 3, 5, 5, 4, 3], fingers: ['x', 1, 3, 4, 2, 1] },
    { name: 'Barre (E shape)', frets: [8, 10, 10, 8, 8, 8], fingers: [1, 3, 4, 1, 1, 1] },
    { name: 'Triad (strings 2-4)', frets: ['x', 'x', 5, 5, 4, 'x'], fingers: ['x', 'x', 2, 3, 1, 'x'] },
    { name: '1st Inversion', frets: ['x', 3, 5, 5, 4, 'x'], fingers: ['x', 1, 3, 4, 2, 'x'] },
  ],
  'G-m': [
    { name: 'Barre (E shape)', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1] },
    { name: 'Barre (A shape)', frets: ['x', 10, 12, 12, 11, 10], fingers: ['x', 1, 3, 4, 2, 1] },
  ],
  'A-m': [
    { name: 'Open', frets: ['x', 0, 2, 2, 1, 0], fingers: ['x', 0, 2, 3, 1, 0] },
    { name: 'Barre (E shape)', frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1] },
  ],
  'E-m': [
    { name: 'Open', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    { name: 'Barre (E shape)', frets: [7, 7, 9, 7, 8, 7], fingers: [1, 1, 3, 1, 2, 1] },
  ],
  'D-m': [
    { name: 'Open', frets: ['x', 'x', 0, 2, 3, 1], fingers: ['x', 'x', 0, 2, 3, 1] },
    { name: 'Barre (A shape)', frets: ['x', 5, 7, 7, 6, 5], fingers: ['x', 1, 3, 4, 2, 1] },
    { name: 'Barre (E shape)', frets: [10, 12, 12, 10, 10, 10], fingers: [1, 3, 4, 1, 1, 1] },
  ],
  'F-m': [
    { name: 'Barre (E shape)', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1] },
    { name: 'Barre (A shape)', frets: ['x', 8, 10, 10, 9, 8], fingers: ['x', 1, 3, 4, 2, 1] },
  ],
  'B-m': [
    { name: 'Barre (A shape)', frets: ['x', 2, 4, 4, 3, 2], fingers: ['x', 1, 3, 4, 2, 1] },
    { name: 'Barre (E shape)', frets: [7, 9, 9, 7, 7, 7], fingers: [1, 3, 4, 1, 1, 1] },
  ],
  // Dominant 7th
  'C-7': [
    { name: 'Open', frets: ['x', 3, 2, 3, 1, 0], fingers: ['x', 3, 2, 4, 1, 0] },
    { name: 'Barre (A shape)', frets: ['x', 3, 5, 3, 5, 3], fingers: ['x', 1, 3, 1, 4, 1] },
    { name: 'Barre (E shape)', frets: [8, 10, 8, 9, 8, 8], fingers: [1, 3, 1, 2, 1, 1] },
    { name: 'Triad (strings 2-4)', frets: ['x', 'x', 8, 9, 8, 'x'], fingers: ['x', 'x', 1, 3, 2, 'x'] },
  ],
  'G-7': [
    { name: 'Open', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
    { name: 'Barre (E shape)', frets: [3, 5, 3, 4, 3, 3], fingers: [1, 3, 1, 2, 1, 1] },
  ],
  'A-7': [
    { name: 'Open', frets: ['x', 0, 2, 0, 2, 0], fingers: ['x', 0, 2, 0, 1, 0] },
    { name: 'Barre (E shape)', frets: [5, 7, 5, 6, 5, 5], fingers: [1, 3, 1, 2, 1, 1] },
  ],
  'E-7': [
    { name: 'Open', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
    { name: 'Barre (E shape)', frets: [7, 7, 9, 7, 8, 7], fingers: [1, 1, 3, 1, 2, 1] },
  ],
  'D-7': [
    { name: 'Open', frets: ['x', 'x', 0, 2, 1, 2], fingers: ['x', 'x', 0, 2, 1, 3] },
    { name: 'Barre (A shape)', frets: ['x', 5, 7, 5, 7, 5], fingers: ['x', 1, 3, 1, 4, 1] },
  ],
  'F-7': [
    { name: 'Barre (E shape)', frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1] },
  ],
  'B-7': [
    { name: 'Barre (A shape)', frets: ['x', 2, 4, 2, 4, 2], fingers: ['x', 1, 3, 1, 4, 1] },
  ],
  // Major 7th
  'C-maj7': [
    { name: 'Open', frets: ['x', 3, 2, 0, 0, 0], fingers: ['x', 3, 2, 0, 0, 0] },
    { name: 'Barre (A shape)', frets: ['x', 3, 5, 4, 5, 3], fingers: ['x', 1, 3, 2, 4, 1] },
    { name: 'Barre (E shape)', frets: [8, 10, 9, 9, 8, 8], fingers: [1, 3, 2, 4, 1, 1] },
    { name: 'Triad (strings 2-4)', frets: ['x', 'x', 9, 9, 8, 'x'], fingers: ['x', 'x', 2, 3, 1, 'x'] },
  ],
  // Minor 7th
  'C-m7': [
    { name: 'Barre (A shape)', frets: ['x', 3, 1, 3, 1, 3], fingers: ['x', 2, 1, 3, 1, 4] },
    { name: 'Barre (E shape)', frets: [8, 10, 8, 8, 8, 8], fingers: [1, 3, 1, 1, 1, 1] },
    { name: 'Triad (strings 2-4)', frets: ['x', 'x', 8, 8, 8, 'x'], fingers: ['x', 'x', 1, 1, 1, 'x'] },
  ],
  // Diminished
  'C-dim': [
    { name: 'Open', frets: ['x', 3, 1, 2, 1, 'x'], fingers: ['x', 3, 1, 2, 1, 'x'] },
    { name: 'Barre', frets: [8, 9, 7, 8, 7, 7], fingers: [2, 3, 1, 4, 1, 1] },
    { name: 'Triad (strings 2-4)', frets: ['x', 'x', 8, 9, 8, 'x'], fingers: ['x', 'x', 1, 3, 2, 'x'] },
  ],
  // Augmented
  'C-aug': [
    { name: 'Open', frets: ['x', 3, 2, 1, 1, 0], fingers: ['x', 3, 2, 1, 1, 0] },
    { name: 'Barre', frets: [8, 7, 6, 5, 5, 4], fingers: [4, 3, 2, 1, 1, 1] },
    { name: 'Triad (strings 2-4)', frets: ['x', 'x', 5, 5, 5, 'x'], fingers: ['x', 'x', 1, 2, 3, 'x'] },
  ],
  // Sus2
  'C-sus2': [
    { name: 'Open', frets: ['x', 3, 0, 0, 1, 3], fingers: ['x', 3, 0, 0, 1, 4] },
    { name: 'Barre', frets: [8, 10, 10, 10, 8, 8], fingers: [1, 3, 4, 2, 1, 1] },
    { name: 'Triad (strings 2-4)', frets: ['x', 'x', 7, 5, 5, 'x'], fingers: ['x', 'x', 3, 1, 2, 'x'] },
  ],
  // Sus4
  'C-sus4': [
    { name: 'Open', frets: ['x', 3, 3, 0, 1, 1], fingers: ['x', 3, 4, 0, 1, 1] },
    { name: 'Barre', frets: [8, 11, 10, 10, 8, 8], fingers: [1, 4, 3, 2, 1, 1] },
    { name: 'Triad (strings 2-4)', frets: ['x', 'x', 10, 10, 8, 'x'], fingers: ['x', 'x', 3, 4, 1, 'x'] },
  ],
  // Add9
  'C-add9': [
    { name: 'Open', frets: ['x', 3, 2, 0, 3, 0], fingers: ['x', 3, 2, 0, 4, 0] },
    { name: 'Barre', frets: [8, 10, 7, 9, 8, 8], fingers: [1, 3, 1, 4, 2, 1] },
    { name: 'Triad (strings 2-4)', frets: ['x', 'x', 7, 5, 5, 'x'], fingers: ['x', 'x', 3, 1, 2, 'x'] },
  ],
  // 6th
  'C-6': [
    { name: 'Open', frets: ['x', 3, 2, 2, 1, 0], fingers: ['x', 3, 2, 1, 1, 0] },
    { name: 'Barre', frets: [8, 10, 10, 9, 10, 8], fingers: [1, 3, 4, 2, 4, 1] },
    { name: 'Triad (strings 2-4)', frets: ['x', 'x', 5, 5, 5, 'x'], fingers: ['x', 'x', 1, 2, 3, 'x'] },
  ],
  // Minor 6th
  'C-m6': [
    { name: 'Barre', frets: ['x', 3, 1, 2, 1, 3], fingers: ['x', 2, 1, 3, 1, 4] },
    { name: 'Barre (E shape)', frets: [8, 10, 7, 8, 8, 8], fingers: [1, 3, 1, 2, 1, 1] },
    { name: 'Triad (strings 2-4)', frets: ['x', 'x', 8, 7, 8, 'x'], fingers: ['x', 'x', 2, 1, 3, 'x'] },
  ],
  // 9th
  'C-9': [
    { name: 'Barre', frets: [8, 10, 8, 9, 8, 10], fingers: [1, 3, 1, 2, 1, 4] },
    { name: 'Barre (A shape)', frets: ['x', 3, 5, 3, 5, 5], fingers: ['x', 1, 3, 1, 4, 4] },
    { name: 'Triad (strings 2-4)', frets: ['x', 'x', 8, 7, 8, 'x'], fingers: ['x', 'x', 2, 1, 3, 'x'] },
  ],
  'D-9': [
    { name: 'Open', frets: ['x', 'x', 0, 2, 1, 0], fingers: ['x', 'x', 0, 2, 1, 0] },
    { name: 'Barre (A shape)', frets: ['x', 5, 7, 5, 6, 5], fingers: ['x', 1, 3, 1, 2, 1] },
  ],
  'E-9': [
    { name: 'Open', frets: [0, 2, 0, 1, 0, 2], fingers: [0, 2, 0, 1, 0, 3] },
    { name: 'Barre (E shape)', frets: [7, 9, 7, 8, 7, 9], fingers: [1, 3, 1, 2, 1, 4] },
  ],
  'G-9': [
    { name: 'Open', frets: [3, 2, 0, 2, 0, 1], fingers: [3, 2, 0, 4, 0, 1] },
    { name: 'Barre (E shape)', frets: [3, 5, 3, 4, 3, 5], fingers: [1, 3, 1, 2, 1, 4] },
  ],
};

function generateChordVoicings() {
  const voicings = {};
  const types = ['M','m','7','maj7','m7','dim','aug','sus2','sus4','add9','6','m6','9'];

  for (const root of allNotes) {
    for (const type of types) {
      const key = `${root}-${type}`;
      if (chordPatterns[key]) {
        voicings[key] = chordPatterns[key];
      } else {
        // Determine base shape (choose most suitable from C, A, E roots)
        // Generalizing to use a more appropriate base shape for movable chords
        let refShape = null;
        let baseRoot = '';
        if (type === 'M' || type === '7' || type === '9') {
          // Prioritize E shape, then A shape for major/dominant chords
          if (chordPatterns['E-M'] && chordPatterns['E-M'][0]) {
            refShape = chordPatterns['E-M'][0];
            baseRoot = 'E';
          } else if (chordPatterns['A-M'] && chordPatterns['A-M'][0]) {
            refShape = chordPatterns['A-M'][0];
            baseRoot = 'A';
          }
        } else if (type === 'm' || type === 'm7' || type === 'm6') {
          // Prioritize E minor shape, then A minor shape for minor chords
          if (chordPatterns['E-m'] && chordPatterns['E-m'][0]) {
            refShape = chordPatterns['E-m'][0];
            baseRoot = 'E';
          } else if (chordPatterns['A-m'] && chordPatterns['A-m'][0]) {
            refShape = chordPatterns['A-m'][0];
            baseRoot = 'A';
          }
        }
        // Fallback for other chord types if no specific pattern found
        if (!refShape) {
          const shapeKey = (type.startsWith('m') || type === 'sus2' || type === 'add9') 
                            ? 'A-m' : 'C-M';
          refShape = chordPatterns[shapeKey]?.[0];
          baseRoot = shapeKey.split('-')[0];
        }

        if (refShape && baseRoot) {
          const shift = (allNotes.indexOf(root) - allNotes.indexOf(baseRoot) + 12) % 12;
          voicings[key] = [{
            name: `Movable ${type} (${baseRoot} shape)`,
            frets: refShape.frets.map(f => typeof f === 'number' ? f + shift : f),
            fingers: refShape.fingers,
          }];
        }
      }
    }
  }

  // Manual overrides for tricky roots
  // These should ideally be integrated into chordPatterns directly or handled by a more robust generation logic
  // Leaving for now as they were explicitly present.
  if (chordPatterns['F-M']) voicings['F-M'] = chordPatterns['F-M'];
  if (chordPatterns['F-m']) voicings['F-m'] = chordPatterns['F-m'];
  if (chordPatterns['B-M']) voicings['B-M'] = chordPatterns['B-M'];
  if (chordPatterns['B-m']) voicings['B-m'] = chordPatterns['B-m'];

  return voicings;
}

// 6. Chord voicings (generated)
export const chordVoicings = generateChordVoicings();

// Note: adaptVoicingsToTuning has been moved to tuningUtils.js to avoid circular dependencies

// Helper to get the note at a specific fret
export function getFretNote(openNote, fret) {
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