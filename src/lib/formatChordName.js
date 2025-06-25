/**
 * Formats a chord name for consistent display
 * @param {string} chordName - The chord name to format
 * @returns {string} Formatted chord name
 */
export const formatChordName = (chordName) => {
  if (!chordName) return '';
  
  // Common chord name mappings for consistent display
  const chordMappings = {
    'maj': '', 'maj7': 'M7', 'maj9': 'M9', 'maj11': 'M11', 'maj13': 'M13',
    'min': 'm', 'min7': 'm7', 'min9': 'm9', 'min11': 'm11', 'min13': 'm13',
    'dim': '°', 'dim7': '°7', 'hdim7': 'ø7', 'm7b5': 'ø7',
    'aug': '+', 'aug7': '7#5', 'maj7#5': 'M7#5', 'maj9#11': 'M9#11',
    'sus': 'sus4', 'sus2': 'sus2', 'sus4': 'sus4',
    'add9': 'add9', 'add11': 'add11', '6/9': '6/9',
    '7b9': '7b9', '7#9': '7#9', '7b5': '7b5', '7#5': '7#5',
    '9': '9', '11': '11', '13': '13', '6': '6'
  };
  
  // Handle chord names with bass notes (e.g., C/E)
  const [baseChord, bassNote] = chordName.split('/');
  
  // Process the base chord
  let formatted = baseChord;
  
  // Apply formatting for common chord types
  Object.entries(chordMappings).forEach(([search, replace]) => {
    if (formatted.endsWith(search)) {
      formatted = formatted.slice(0, -search.length) + replace;
    }
  });
  
  // Add bass note back if it exists
  if (bassNote) {
    formatted += `/${bassNote}`;
  }
  
  return formatted;
};

/**
 * Checks if a string is a valid chord name
 * @param {string} str - The string to check
 * @returns {boolean} True if the string is a valid chord name
 */
export const isChordName = (str) => {
  if (!str || typeof str !== 'string') return false;
  
  // Basic chord name pattern
  const chordPattern = /^[A-Ga-g][#b]?(?:m(?:aj|in)?[0-9]*(?:[#b]?[0-9]*)?|dim|aug|sus[24]?|add[0-9]+|\d+[#b]?[0-9]*)*(?:\/[A-Ga-g][#b]?)?$/;
  return chordPattern.test(str.trim());
};
