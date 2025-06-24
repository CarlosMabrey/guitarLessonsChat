/**
 * Unified color mapping for musical intervals
 * Used across fretboard visualization and chord/scale displays
 */
import * as Tonal from 'tonal';

// Map of interval names to tailwind color classes
export const intervalColorMap = {
  // Root note (Red)
  '1P': { bg: 'from-red-600/80 to-rose-500/80', border: 'border-red-400/30', text: 'text-white' },  

  // Thirds - Major = bright green, Minor = slightly darker green
  '3M': { bg: 'from-green-600/80 to-emerald-500/80', border: 'border-green-400/30', text: 'text-white' },
  '3m': { bg: 'from-green-600/80 to-emerald-500/80', border: 'border-green-400/30', text: 'text-white' },
  
  // Fifth (Blue) - Made brighter
  '5P': { bg: 'from-blue-600/80 to-cyan-500', border: 'border-blue-400/30', text: 'text-white' },
    
  // Sevenths - Major and Minor now using yellow to match the 4th chord note (using direct bg instead of gradient)
  '7M': { bg: 'bg-yellow-500/80', border: 'border-yellow-400/30', text: 'text-white' },
  '7m': { bg: 'bg-yellow-500/80', border: 'border-yellow-400/30', text: 'text-white' },
  
  // Ninths - Bright purple (distinct from all other intervals)
  '9M': { bg: 'from-indigo-600/80 to-violet-500/80', border: 'border-indigo-400/30', text: 'text-white' },
  '9m': { bg: 'from-indigo-600/80 to-violet-500/80', border: 'border-fuchsia-400/30', text: 'text-white' },
  
  // Elevenths - Perfect = teal, Augmented = bright cyan
  '11P': { bg: 'from-teal-600/80 to-cyan-500/80', border: 'border-teal-400/30', text: 'text-white' },
  '11A': { bg: 'from-cyan-600/80 to-sky-500/80', border: 'border-cyan-400/30', text: 'text-white' },
  
  // Thirteenths - Major = indigo, Minor = vivid purple
  '13M': { bg: 'from-indigo-600/80 to-blue-500/80', border: 'border-indigo-400/30', text: 'text-white' },
  '13m': { bg: 'from-purple-600/80 to-indigo-500/80', border: 'border-purple-400/30', text: 'text-white' },
  
  // Seconds - Major = yellow, Minor = amber
  '2M': { bg: 'from-yellow-600/80 to-lime-500/80', border: 'border-yellow-400/30', text: 'text-white' },
  '2m': { bg: 'from-amber-600/80 to-orange-500/80', border: 'border-amber-400/30', text: 'text-white' },
  
  // Fourths - Perfect = pink, Augmented = magenta
  '4P': { bg: 'from-pink-600/80 to-rose-500/80', border: 'border-pink-400/30', text: 'text-white' },
  '4A': { bg: 'from-fuchsia-600/80 to-pink-500/80', border: 'border-fuchsia-400/30', text: 'text-white' },
  
  // Sixths - Major = light blue, Minor = turquoise
  '6M': { bg: 'from-sky-600/80 to-blue-500/80', border: 'border-sky-400/30', text: 'text-white' },
  '6m': { bg: 'from-cyan-600/80 to-teal-500/80', border: 'border-cyan-400/30', text: 'text-white' },
  
  // Diminished fifth (tritone) - Bright pink
  '5d': { bg: 'from-rose-600/80 to-pink-500/80', border: 'border-rose-400/30', text: 'text-white' },
  
  // Augmented fifth - Vivid sky blue
  '5A': { bg: 'from-sky-600/80 to-indigo-500/80', border: 'border-sky-400/30', text: 'text-white' },
  
  // Default for unmatched intervals - Much brighter blue-green
  'default': { bg: 'from-blue-500/80 to-teal-400/80', border: 'border-blue-400/30', text: 'text-white' }
};

/**
 * Get color classes for a specific interval
 * @param {string} interval - The musical interval (e.g. '1P', '3M', '5P')
 * @param {boolean} gradient - Whether to use gradient colors (default: true)
 * @returns {object} Object with bg, border, and text color classes
 */
export const getIntervalColors = (interval, gradient = true) => {
  const colors = intervalColorMap[interval] || intervalColorMap['default'];
  
  // For non-gradient display, remove the "from-" part
  if (!gradient && colors.bg.includes('from-')) {
    const mainColor = colors.bg.split(' ')[0];
    return {
      ...colors,
      bg: mainColor.replace('from-', '')
    };
  }
  
  return colors;
};

/**
 * Get gradient color class for chord note index
 * Maps chord notes consistently to colors by creating 
 * a derived "fake" interval for coloring purposes
 * 
 * @param {string} note - The note name
 * @param {number} index - The index of the note in the chord
 * @param {string} rootNote - The root note of the chord
 * @param {string} chordType - The type of chord (e.g., 'maj7', '9', 'm7b5')
 * @returns {string} Tailwind background color class
 */
export const getChordNoteColorClass = (note, index, rootNote, chordType) => {
  // If we have a valid note and root note, try to calculate real intervals
  if (note && rootNote) {
    try {
      // Normalize both notes to pitch class for comparison
      const notePc = Tonal.Note.pitchClass(note);
      const rootPc = Tonal.Note.pitchClass(rootNote);
      
      if (notePc && rootPc) {
        // Calculate semitones between notes to determine interval
        const rootMidi = Tonal.Note.midi(rootPc + '4');
        const noteMidi = Tonal.Note.midi(notePc + '4');
        
        if (rootMidi !== null && noteMidi !== null) {
          let semitones = (noteMidi - rootMidi + 12) % 12;
          
          // Map semitones to interval names
          const semitoneToInterval = {
            0: '1P',  // Unison/Root
            1: '2m',  // Minor 2nd
            2: '2M',  // Major 2nd
            3: '3m',  // Minor 3rd
            4: '3M',  // Major 3rd
            5: '4P',  // Perfect 4th
            6: '5d',  // Diminished 5th / Tritone
            7: '5P',  // Perfect 5th
            8: '6m',  // Minor 6th
            9: '6M',  // Major 6th
            10: '7m', // Minor 7th
            11: '7M'  // Major 7th
          };
          
          const interval = semitoneToInterval[semitones];
          if (interval) {
            const colors = getIntervalColors(interval, true);
            return `bg-gradient-to-br ${colors.bg} ${colors.text} border ${colors.border}`;
          }
        }
      }
    } catch (e) {
      console.error('Error calculating interval color:', e);
    }
  }
  
  // If we have chord notes, try to determine intervals based on actual notes
  if (rootNote && note) {
    try {
      const chord = Tonal.Chord.get(chordType, rootNote);
      if (chord) {
        const intervals = chord.intervals;
        if (intervals && intervals.length > index) {
          const interval = intervals[index];
          const colors = getIntervalColors(interval, true);
          if (colors) {
            return `bg-gradient-to-br ${colors.bg} ${colors.text} border ${colors.border}`;
          }
        }
      }
    } catch (e) {
      console.error('Error getting chord intervals:', e);
    }
  }

  // Fallback to index-based coloring if chord intervals aren't available
  const indexToInterval = {
    0: '1P',   // Root note (C)
    1: '3M',   // Major 3rd (E)
    2: '5P',   // Perfect 5th (G)
    3: '7m',   // Minor 7th (Bb)
    4: '9M',   // Major 9th (D)
    5: '11P',  // Perfect 11th (F)
    6: '13M'   // Major 13th (A)
  };
  
  const interval = indexToInterval[index] || 'default';
  const colors = getIntervalColors(interval, true);
  
  // Return full gradient class
  return `bg-gradient-to-br ${colors.bg} ${colors.text} border ${colors.border}`;
};
