/**
 * Tab Notation Parser
 * This module parses raw tab notation into structured note objects
 * for rendering with VexFlow or other visualization libraries
 */

/**
 * Parse raw tab notation text into structured notes
 * @param {string} tabText - Raw tab notation text
 * @returns {Array} - Array of note objects for rendering
 */
export function parseTabNotation(tabText) {
  if (!tabText) return [];
  
  try {
    // Clean and normalize the tab text
    const cleanedText = cleanTabText(tabText);
    
    // Extract string groups from the tab
    const stringGroups = extractStringGroups(cleanedText);
    
    if (stringGroups.length === 0) {
      console.warn('No valid tab string groups found');
      return [];
    }
    
    // Process each string group into a set of notes
    const allNotes = [];
    
    for (let i = 0; i < stringGroups.length; i++) {
      const notes = processStringGroup(stringGroups[i]);
      if (notes.length > 0) {
        allNotes.push(...notes);
      }
    }
    
    // Deduplicate and sort notes
    return consolidateNotes(allNotes);
  } catch (error) {
    console.error('Error parsing tab notation:', error);
    return [];
  }
}

/**
 * Clean and normalize tab text
 * @param {string} tabText - Raw tab text
 * @returns {string} - Cleaned tab text
 */
function cleanTabText(tabText) {
  return tabText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

/**
 * Extract string groups from tab text
 * A string group is a set of lines that represent a complete tablature staff
 * @param {string} tabText - Tab text
 * @returns {Array} - Array of string groups
 */
function extractStringGroups(tabText) {
  const lines = tabText.split('\n');
  const groups = [];
  let currentGroup = [];
  
  // Common string labels and patterns
  const stringLabels = ['e', 'B', 'G', 'D', 'A', 'E', 'b', 'g', 'd', 'a'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (line.length === 0) {
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
        currentGroup = [];
      }
      continue;
    }
    
    // Check if this is a tab line using more flexible pattern matching
    const isTabLine = (
      // Standard notation with letter at start
      stringLabels.some(label => line.startsWith(label)) && 
      // Contains a vertical bar or dashes
      (line.includes('|') || line.includes('-')) &&
      // At least 10 chars long (reasonable tab line length)
      line.length >= 10 &&
      // Doesn't have too many letters (probably text, not tab)
      (line.match(/[a-zA-Z]/g) || []).length < 5
    );
    
    if (isTabLine) {
      currentGroup.push(line);
      
      // If we have 6 strings (standard guitar) or 4 strings (bass), this is a complete group
      // Allow for other string counts as well (7-string, 5-string bass, etc.)
      if (currentGroup.length === 6 || currentGroup.length === 4 || 
          currentGroup.length === 7 || currentGroup.length === 5) {
        groups.push([...currentGroup]);
        currentGroup = [];
      }
    } else if (currentGroup.length > 0 && currentGroup.length < 3) {
      // If we have fewer than 3 strings, probably not a valid group
      // so clear it out
      currentGroup = [];
    } else if (currentGroup.length >= 3) {
      // If we have at least 3 strings, treat as a partial group
      groups.push([...currentGroup]);
      currentGroup = [];
    }
  }
  
  // Add any remaining group with at least 3 strings
  if (currentGroup.length >= 3) {
    groups.push(currentGroup);
  }
  
  return groups;
}

/**
 * Process a string group into note objects
 * @param {Array} stringGroup - Array of strings representing a tab staff
 * @returns {Array} - Array of note objects
 */
function processStringGroup(stringGroup) {
  const notes = [];
  
  // Determine the number of positions (columns) in this string group
  const lengths = stringGroup.map(str => str.length);
  const maxLength = Math.max(...lengths);
  
  // Maps to track multi-digit fret numbers and techniques
  const digitStartPositions = new Map();
  
  // First pass: identify all digit positions
  for (let stringIdx = 0; stringIdx < stringGroup.length; stringIdx++) {
    const stringLine = stringGroup[stringIdx];
    
    for (let col = 0; col < stringLine.length; col++) {
      const char = stringLine[col];
      
      // If it's a digit, mark it
      if (/[0-9]/.test(char)) {
        digitStartPositions.set(`${stringIdx},${col}`, true);
      }
    }
  }
  
  // Second pass: process digits into notes
  for (let col = 0; col < maxLength; col++) {
    const positions = [];
    
    // Check each string for a note at this position
    for (let stringIdx = 0; stringIdx < stringGroup.length; stringIdx++) {
      const stringLine = stringGroup[stringIdx];
      
      if (col < stringLine.length) {
        const char = stringLine[col];
        
        // If it's a digit and it's the start of a number
        if (/[0-9]/.test(char) && digitStartPositions.has(`${stringIdx},${col}`)) {
          // Check for multi-digit fret numbers
          let fret = parseInt(char, 10);
          let endPos = col;
          
          // Look ahead for more digits
          for (let j = col + 1; j < stringLine.length && /[0-9]/.test(stringLine[j]); j++) {
            fret = fret * 10 + parseInt(stringLine[j], 10);
            endPos = j;
            
            // Remove the continuation digits from starting positions
            digitStartPositions.delete(`${stringIdx},${j}`);
          }
          
          // Add the position (string number is 1-indexed in VexFlow)
          const stringNum = stringGroup.length - stringIdx;
          
          // Check for technique annotations
          let technique = null;
          if (endPos + 1 < stringLine.length) {
            const nextChar = stringLine[endPos + 1];
            if (/[hpb\/\\~^]/i.test(nextChar)) {
              technique = nextChar;
            }
          }
          
          positions.push({ 
            str: stringNum, 
            fret: fret,
            technique: technique
          });
        }
      }
    }
    
    // If we found any positions, create a note
    if (positions.length > 0) {
      notes.push({
        positions,
        duration: 'q' // Default to quarter note for now
      });
    }
  }
  
  return notes;
}

/**
 * Consolidate notes by combining notes at the same position
 * and sorting by time order
 * @param {Array} notes - Array of note objects
 * @returns {Array} - Consolidated and sorted note array
 */
function consolidateNotes(notes) {
  // Remove duplicates (notes that have exactly the same positions)
  const uniqueNotes = [];
  const seen = new Set();
  
  for (const note of notes) {
    // Create a key from the positions
    const key = note.positions
      .map(pos => `${pos.str},${pos.fret}`)
      .sort()
      .join('|');
    
    if (!seen.has(key)) {
      seen.add(key);
      uniqueNotes.push(note);
    }
  }
  
  // Take up to 32 notes to show a reasonable amount
  // In a real implementation, we'd determine proper time ordering
  return uniqueNotes.slice(0, 32);
}

/**
 * Estimate the difficulty of a tab based on its content
 * @param {string} tabText - Raw tab text
 * @returns {string} - Difficulty level ('easy', 'medium', 'hard')
 */
export function estimateTabDifficulty(tabText) {
  if (!tabText) return 'easy';
  
  // Check for complex techniques
  const hasComplexTechniques = /[bp^h\/\\~]/i.test(tabText);
  const hasPowerChords = /[0-9]{1,2}\/[0-9]{1,2}/i.test(tabText);
  const hasHighFrets = /1[0-9]|2[0-4]/i.test(tabText);
  
  if (hasComplexTechniques && hasHighFrets) {
    return 'hard';
  } else if (hasPowerChords || hasHighFrets) {
    return 'medium';
  }
  
  return 'easy';
}

/**
 * Count the number of measures in a tab
 * @param {string} tabText - Raw tab text
 * @returns {number} - Estimated number of measures
 */
export function countMeasures(tabText) {
  if (!tabText) return 1;
  
  // Find a line that looks like a tab string
  const lines = tabText.split('\n');
  const tabLine = lines.find(line => /^[eEBGADa][|:]/.test(line.trim()));
  
  if (tabLine) {
    // Count the vertical bars
    const barCount = (tabLine.match(/\|/g) || []).length;
    return Math.max(1, barCount - 1);
  }
  
  return 1;
} 