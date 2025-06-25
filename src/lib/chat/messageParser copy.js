/**
 * Parses chat messages to extract music notation and other special content
 */

/**
 * Parses a simple chord notation (e.g., "C", "Am7", "F#maj7")
 * @param {string} chordStr - The chord string to parse
 * @returns {Object|null} Parsed chord object or null if invalid
 */
const parseSimpleChord = (chordStr) => {
  if (!chordStr || typeof chordStr !== 'string') return null;
  
  try {
    // Trim and clean the chord string
    let chord = chordStr.trim();
    
    // Common chord aliases and normalizations
    const aliases = {
      'maj': '', 'maj7': 'M7', 'maj9': 'M9', 'maj11': 'M11', 'maj13': 'M13',
      'min': 'm', 'min7': 'm7', 'min9': 'm9', 'min11': 'm11', 'min13': 'm13',
      'dim': '°', 'dim7': '°7', 'hdim7': 'ø7', 'm7b5': 'ø7',
      'aug': '+', 'aug7': '7#5', 'maj7#5': 'M7#5', 'maj9#11': 'M9#11',
      'sus': 'sus4', 'sus2': 'sus2', 'sus4': 'sus4',
      'add9': 'add9', 'add11': 'add11', '6/9': '6/9',
      '7b9': '7b9', '7#9': '7#9', '7b5': '7b5', '7#5': '7#5',
      '9': '9', '11': '11', '13': '13'
    };
    
    // Replace common aliases
    Object.entries(aliases).forEach(([alias, normalized]) => {
      if (chord.endsWith(alias)) {
        chord = chord.slice(0, -alias.length) + normalized;
      }
    });
    
    // Parse the chord components
    const chordRegex = /^([A-Ga-g][#b]?)([^\/]*)(?:\/([A-Ga-g][#b]?))?/;
    const match = chord.match(chordRegex);
    
    if (!match) return null;
    
    let [, root, quality, bass] = match;
    
    // Normalize root note (uppercase first letter, lowercase 'b' for flats)
    root = root.charAt(0).toUpperCase() + root.slice(1).toLowerCase();
    
    // Default to major if no quality specified
    if (!quality) quality = 'maj';
    
    // Handle common chord qualities
    const qualityMap = {
      '': 'maj', 'm': 'm', 'M': 'maj', '7': '7', 'm7': 'm7', 'maj7': 'maj7',
      '°': 'dim', '°7': 'dim7', 'ø7': 'm7b5', '+': 'aug', '7#5': '7#5',
      'sus4': 'sus4', 'sus2': 'sus2', '9': '9', 'm9': 'm9', 'maj9': 'maj9',
      '11': '11', 'm11': 'm11', '13': '13', 'm13': 'm13', '6': '6', 'm6': 'm6',
      '6/9': '6/9', 'add9': 'add9', 'add11': 'add11', '7b9': '7b9', '7#9': '7#9'
    };
    
    // Normalize the quality
    const normalizedQuality = qualityMap[quality] || quality;
    
    // Create the display name using our formatter
    let displayName = formatChordName(root + (normalizedQuality === 'maj' ? '' : normalizedQuality) + (bass ? `/${bass}` : ''));
    
    return {
      type: 'chord',
      root,
      quality: normalizedQuality,
      bass: bass || null,
      fullName: chordStr.trim(),
      displayName,
      // Add metadata for the ChordDiagram component
      voicingObject: {
        chordName: displayName,
        frets: [], // Will be populated by the ChordDiagram component
        fingers: [],
        position: 1,
        baseFret: 1,
        barres: []
      }
    };
  } catch (e) {
    console.error('Error parsing chord:', chordStr, e);
    return null;
  }
};

/**
 * Parses a chord block with detailed voicing information
 */
const parseChordBlock = (content) => {
  try {
    const data = JSON.parse(content);
    return {
      ...data,
      type: 'chord',
      isDetailed: true
    };
  } catch (e) {
    console.error('Failed to parse chord block:', e);
    return null;
  }
};

/**
 * Parses a tab block
 */
const parseTabBlock = (content) => {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return null;
  
  // Basic validation - check if it looks like tablature
  const isLikelyTab = lines.every(line => 
    /^[A-Za-z]\|[-0-9hpsl/\\()]+\|?$/.test(line.trim())
  );
  
  if (!isLikelyTab) return null;
  
  return {
    type: 'tab',
    content: lines,
    stringCount: lines.length
  };
};

/**
 * Parses a fretboard block
 */
const parseFretboardBlock = (content) => {
  try {
    const data = JSON.parse(content);
    // Basic validation
    if (!data.tuning || !Array.isArray(data.notes)) {
      throw new Error('Invalid fretboard data');
    }
    return {
      ...data,
      type: 'fretboard'
    };
  } catch (e) {
    console.error('Failed to parse fretboard block:', e);
    return null;
  }
};

/**
 * Parses inline chord notations in text (e.g., "Play [C] then [G]")
 * @param {string} text - The text to parse for chord notations
 * @returns {Array} Array of content parts with type and content
 */
const parseInlineChords = (text) => {
  if (!text || typeof text !== 'string') {
    return [{ type: 'text', content: '' }];
  }
  
  // Enhanced regex to match chord patterns like [C], [Am7], [G7/B], etc.
  // Supports:
  // - Standard chords: [C], [Am], [G7], [Bbmaj7], [F#m7b5], [D7#9], [Gsus4]
  // - Slash chords: [C/E], [Am7/G], etc.
  // - Various chord qualities: maj, min, dim, aug, sus, add, etc.
  // - Extensions: 6, 7, 9, 11, 13, etc.
  // - Altered extensions: b5, #5, b9, #9, etc.
  const chordRegex = /\[([A-Ga-g][#b]?(?:m(?:aj|in)?[0-9]*(?:[#b]?[0-9]*)?|dim|aug|sus[24]?|add[0-9]+|\/[A-Ga-g][#b]?|\d+[#b]?[0-9]*)*)\]/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;
  let hasChords = false;

  while ((match = chordRegex.exec(text)) !== null) {
    // Add text before the chord if there is any
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }

    // Parse the chord
    const chord = parseSimpleChord(match[1]);
    if (chord) {
      hasChords = true;
      parts.push({
        type: 'chord',
        content: chord,
        raw: match[0]
      });
    } else {
      // If chord parsing fails, include the raw text
      parts.push({
        type: 'text',
        content: match[0]
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text after the last chord
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }

  // If no chords were found, return the original text as a single part
  if (!hasChords) {
    return [{
      type: 'text',
      content: text
    }];
  }

  return parts;
};

/**
 * Parses a message to extract chord notations and other music elements
 * @param {string} content - The message content to parse
 * @returns {Object} Parsed message content with text and blocks
 */
export const parseMessageContent = (content) => {
  if (typeof content !== 'string' || !content.trim()) {
    return { text: content || '', blocks: [] };
  }

  // Initialize result variables
  const resultBlocks = [];
  let processedText = content;
  
  // Parse chord blocks (```chord ... ```)
  const chordBlockRegex = /```chord\n([\s\S]*?)\n```/g;
  const chordBlockMatches = [];
  let chordMatch;
  
  // Find all chord blocks and their positions
  while ((chordMatch = chordBlockRegex.exec(content)) !== null) {
    chordBlockMatches.push({
      match: chordMatch[0],
      content: chordMatch[1],
      index: chordMatch.index
    });
  }
  
  // Process chord blocks
  if (chordBlockMatches.length > 0) {
    let lastIndex = 0;
    
    chordBlockMatches.forEach(({ match, content: chordContent, index }) => {
      // Add text before the chord block
      if (index > lastIndex) {
        const textBefore = content.slice(lastIndex, index);
        if (textBefore.trim()) {
          resultBlocks.push({
            type: 'text',
            content: textBefore
          });
        }
      }
      
      // Parse the chord block content
      const chords = chordContent.trim().split(/\s+/).filter(Boolean);
      
      // Add each chord as a separate block
      chords.forEach(chord => {
        const parsedChord = parseSimpleChord(chord);
        if (parsedChord) {
          resultBlocks.push({
            type: 'chord',
            content: parsedChord
          });
        }
      });
      
      // Update the last index
      lastIndex = index + match.length;
    });
    
    // Add any remaining text after the last chord block
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      if (remainingText.trim()) {
        resultBlocks.push({
          type: 'text',
          content: remainingText
        });
      }
    }
    
    // Clean up the text by removing chord blocks for the plain text version
    processedText = processedText.replace(/```chord\n[\s\S]*?\n```/g, '').trim();
  }
  
  // If no chord blocks were found, process the entire content as text with inline chords
  if (chordBlockMatches.length === 0) {
    const inlineChords = parseInlineChords(content);
    if (inlineChords.length > 0) {
      resultBlocks.push(...inlineChords);
    } else if (content.trim()) {
      resultBlocks.push({
        type: 'text',
        content: content
      });
    }
  }
  
  // Process tab blocks if any
  const tabMatches = [...processedText.matchAll(/```tab\n([\s\S]*?)\n```/g)];
  if (tabMatches.length > 0) {
    tabMatches.forEach(([fullMatch, tabContent]) => {
      const tabData = parseTabBlock(tabContent);
      if (tabData) {
        resultBlocks.push(tabData);
      }
      // Remove tab block from processed text
      processedText = processedText.replace(fullMatch, '').trim();
    });
  }
  
  // Process fretboard blocks if any
  const fretboardMatches = [...processedText.matchAll(/```fretboard\n([\s\S]*?)\n```/g)];
  if (fretboardMatches.length > 0) {
    fretboardMatches.forEach(([fullMatch, fretboardContent]) => {
      const fretboardData = parseFretboardBlock(fretboardContent);
      if (fretboardData) {
        resultBlocks.push(fretboardData);
      }
      // Remove fretboard block from processed text
      processedText = processedText.replace(fullMatch, '').trim();
    });
  }
  
  // Process any remaining text that wasn't part of any blocks
  if (processedText.trim()) {
    // Check for inline chords in the remaining text
    const inlineChords = parseInlineChords(processedText);
    if (inlineChords.length > 0) {
      resultBlocks.push(...inlineChords);
    } else {
      resultBlocks.push({
        type: 'text',
        content: processedText
      });
    }
  }
  
  // Filter out any empty text blocks
  const finalBlocks = resultBlocks.filter(block => 
    block.type !== 'text' || (block.content && block.content.trim() !== '')
  );
  
  // Create a clean text version without any block markers
  const cleanText = finalBlocks.map(block => {
    if (block.type === 'text') return block.content;
    if (block.type === 'chord') return block.content?.displayName || '';
    if (block.type === 'tab') return '[Tab]';
    if (block.type === 'fretboard') return '[Fretboard]';
    return '';
  }).join(' ').replace(/\s+/g, ' ').trim();
  
  return {
    text: cleanText,
    blocks: finalBlocks.filter(Boolean) // Remove any null/undefined blocks
  };
};

/**
 * Renders parsed content to React elements
 */
export const renderParsedContent = (parsed, components = {}) => {
  const {
    TextComponent = ({ children }) => <div className="text-content">{children}</div>,
    TabComponent = ({ content }) => (
      <div className="tab-content">
        <pre>{content.join('\n')}</pre>
      </div>
    ),
    ChordComponent = ({ chord }) => (
      <div className="chord-content">
        <strong>{chord.fullName}</strong>
      </div>
    ),
    FretboardComponent = ({ tuning, notes }) => (
      <div className="fretboard-content">
        <div>Tuning: {tuning.join(' ')}</div>
        <div>Notes: {notes.map(n => n.note).join(', ')}</div>
      </div>
    )
  } = components;
  
  return parsed.blocks.map((block, index) => {
    switch (block.type) {
      case 'text':
        return <TextComponent key={`text-${index}`}>{block.content}</TextComponent>;
        
      case 'tab':
        return <TabComponent key={`tab-${index}`} {...block} />;
        
      case 'chord':
        return <ChordComponent key={`chord-${index}`} chord={block} />;
        
      case 'fretboard':
        return <FretboardComponent key={`fretboard-${index}`} {...block} />;
        
      default:
        return null;
    }
  });
};
