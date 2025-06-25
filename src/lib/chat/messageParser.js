/**
 * Parses chat messages to extract music notation and other special content
 */

/**
 * Parses a simple chord notation (e.g., "C", "Am7", "F#maj7")
 */
const parseSimpleChord = (chordStr) => {
  // This is a simplified parser - in a real app, you'd want something more robust
  const match = chordStr.match(/^([A-Ga-g][#b]?)([^\/]*)(?:\/([A-Ga-g][#b]?))?/);
  if (!match) return null;
  
  const [, root, quality, bass] = match;
  return {
    root: root.toUpperCase(),
    quality: quality || '',
    bass: bass || null,
    fullName: chordStr,
    type: 'chord'
  };
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
  
  // More permissive validation - check if it looks like tablature
  // Look for common patterns in guitar tabs
  const tabPatterns = [
    /^[A-Za-z]\|[-0-9hpsl\/\\b()\s]+\|?$/, // Standard tab format with letter + pipe
    /^[eEBbGgDdAaEe][-|][-0-9hpsl\/\\b()\s]+\|?$/, // Guitar string notation
    /^[eEBbGgDdAaEe]\|[-0-9hpsl\/\\b()\s]+\|?$/ // Common guitar tab format
  ];
  
  // Check if any lines match any of the tab patterns
  const isLikelyTab = lines.some(line => {
    const trimmedLine = line.trim();
    return tabPatterns.some(pattern => pattern.test(trimmedLine));
  });
  
  // Additional check: if we have 4-6 lines with pipe characters, it's likely a guitar tab
  const linesWithPipes = lines.filter(line => line.includes('|')).length;
  const isTabByStructure = (linesWithPipes >= 4 && linesWithPipes <= 7);
  
  if (!isLikelyTab && !isTabByStructure) return null;
  
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
 * Main message parser function
 */
export const parseMessageContent = (content) => {
  if (typeof content !== 'string') {
    return { text: '', blocks: [] };
  }

  // Parse tab blocks (```tab ... ```)
  const tabMatches = [...content.matchAll(/```tab\n([\s\S]*?)\n```/g)];
  // Parse chord blocks (```chord ... ```)
  const chordBlockMatches = [...content.matchAll(/```chord\n([\s\S]*?)\n```/g)];
  // Parse fretboard blocks (```fretboard ... ```)
  const fretboardMatches = [...content.matchAll(/```fretboard\n([\s\S]*?)\n```/g)];
  // Parse inline chord notations ([C], [Am7], etc.)
  const inlineChordMatches = [...content.matchAll(/\[([A-Ga-g][#b]?[^\s\]]*)\]/g)];

  // Process all matches
  const blocks = [];
  let lastIndex = 0;

  // Helper to add text blocks
  const addTextBlock = (start, end) => {
    if (start >= end) return;
    const text = content.slice(start, end).trim();
    if (!text) return;

    // Split by lines for further parsing
    const lines = text.split(/\r?\n/).map(l => l.trimEnd());
    let section = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Header (## or ###)
      const headerMatch = line.match(/^(#{2,6})\s+(.*)$/);
      if (headerMatch) {
        if (section) {
          blocks.push(section);
          section = null;
        }
        blocks.push({ type: 'header', level: headerMatch[1].length, content: headerMatch[2] });
        continue;
      }
      // Horizontal rule
      if (/^---+$/.test(line)) {
        if (section) {
          blocks.push(section);
          section = null;
        }
        blocks.push({ type: 'hr' });
        continue;
      }
      // Tip/callout (starts with emoji and space)
      if (/^([\u2600-\u26FF\u2700-\u27BF\u1F300-\u1F6FF\u1F900-\u1F9FF\u1FA70-\u1FAFF\u1F680-\u1F6FF])\s+/.test(line)) {
        if (section) {
          blocks.push(section);
          section = null;
        }
        blocks.push({ type: 'tip', content: line });
        continue;
      }
      // Section start (e.g., How to Play, Playing Tips, Summary)
      const sectionHeader = line.match(/^(How to Play|Playing Tips|Summary)[:\s]*$/i);
      if (sectionHeader) {
        if (section) {
          blocks.push(section);
        }
        section = { type: 'section', title: sectionHeader[1], lines: [] };
        continue;
      }
      // If inside a section, collect lines
      if (section) {
        section.lines.push(line);
      } else {
        // Otherwise, treat as plain text
        blocks.push({ type: 'text', content: line });
      }
    }
    if (section) {
      blocks.push(section);
    }
  };

  // Process all matches in order
  const allMatches = [
    ...tabMatches.map(m => ({ type: 'tab', match: m })),
    ...chordBlockMatches.map(m => ({ type: 'chordBlock', match: m })),
    ...fretboardMatches.map(m => ({ type: 'fretboard', match: m })),
    ...inlineChordMatches.map(m => ({ type: 'inlineChord', match: m }))
  ].sort((a, b) => a.match.index - b.match.index);

  for (const { type, match } of allMatches) {
    const [fullMatch, content] = match;
    const matchStart = match.index;
    const matchEnd = matchStart + fullMatch.length;
    // Add text before this match
    addTextBlock(lastIndex, matchStart);
    // Process the match
    switch (type) {
      case 'tab': {
        const tabData = parseTabBlock(content);
        if (tabData) blocks.push(tabData);
        break;
      }
      case 'chordBlock': {
        const chordData = parseChordBlock(content);
        if (chordData) blocks.push(chordData);
        break;
      }
      case 'fretboard': {
        const fretboardData = parseFretboardBlock(content);
        if (fretboardData) blocks.push(fretboardData);
        break;
      }
      case 'inlineChord': {
        const chordData = parseSimpleChord(content);
        if (chordData) {
          blocks.push({
            ...chordData,
            isInline: true,
            originalText: fullMatch
          });
        }
        break;
      }
    }
    lastIndex = matchEnd;
  }
  // Add any remaining text
  addTextBlock(lastIndex, content.length);

  return {
    text: content,
    blocks: blocks.filter(Boolean)
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
