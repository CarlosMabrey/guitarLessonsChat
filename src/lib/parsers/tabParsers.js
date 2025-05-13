/**
 * Tab Parsers
 * Contains parsers for different tab websites
 */

import * as cheerio from 'cheerio';

/**
 * Parse Ultimate Guitar tabs into a standardized format
 * @param {string} html - HTML content from Ultimate Guitar tab page
 * @returns {Object} - Standardized tab data
 */
export async function parseUltimateGuitarTab(html) {
  if (!html) throw new Error('No HTML content provided');
  
  try {
    // Enhanced debugging
    console.log('🎸 Parsing UG HTML with length:', html.length);
    
    // Save a debug copy of the HTML to help diagnose issues
    try {
      const fs = require('fs');
      const path = require('path');
      const debugDir = path.join(process.cwd(), 'tab-cache', 'debug');
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }
      const timestamp = Date.now();
      const filename = path.join(debugDir, `${timestamp}_${html.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_')}.html`);
      fs.writeFileSync(filename, html);
      console.log(`🔍 Saved debug HTML to: ${filename}`);
    } catch (fsError) {
      console.log('Could not save debug HTML:', fsError.message);
    }
    
    const $ = cheerio.load(html, {
      decodeEntities: true,
      xmlMode: false,
      _useHtmlParser2: true
    });
    
    // IMPROVED: Multiple strategies to find tab content
    
    // Strategy 1: Find pre tags
    let tabText = '';
    const preElements = $('pre');
    console.log(`🔍 Found ${preElements.length} <pre> elements on the page`);
    
    if (preElements.length) {
      preElements.each((i, el) => {
        const content = $(el).text();
        tabText += content + '\n\n';
      });
    }
    
    // Strategy 2: Look for tab content in the JS data
    if (!tabText.trim() || tabText.length < 100) {
      console.log('🔍 Searching for tab data in script tags...');
      
      // Try to find app data with tab content
      const scripts = $('script').toArray();
      for (const script of scripts) {
        const content = $(script).html() || '';
        
        // Look for direct JS data objects
        if (content.includes('content:')) {
          // Try to extract the tab content using regex
          const contentMatch = content.match(/content:\s*(['"`])([\s\S]*?)\1/);
          if (contentMatch && contentMatch[2]) {
            tabText = contentMatch[2].replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\'/g, "'");
            console.log('🎉 Found tab content in script data!');
            break;
          }
        }
        
        // Try to find the data object in UGAPP
        if (content.includes('window.UGAPP') && content.includes('tab_view')) {
          try {
            // Look for JSON objects in the script
            const jsonMatches = content.match(/\{[\s\S]*tab_view[\s\S]*\}/g);
            if (jsonMatches) {
              for (const match of jsonMatches) {
                try {
                  // Clean up the JSON string
                  const cleanJson = match
                    .replace(/\\'/g, "'")
                    .replace(/\\"/g, '"')
                    .replace(/'/g, '"')
                    .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
                  
                  const data = JSON.parse(cleanJson);
                  if (data && data.data && data.data.tab_view && data.data.tab_view.wiki_tab) {
                    tabText = data.data.tab_view.wiki_tab.content;
                    console.log('🎉 Successfully extracted tab content from app data!');
                    break;
                  }
                } catch (jsonError) {
                  // Just continue to the next match
                }
              }
            }
          } catch (e) {
            console.log('Error parsing UGAPP data:', e.message);
          }
        }
      }
    }
    
    // Strategy 3: Look for content in special Ultimate Guitar containers
    if (!tabText.trim() || tabText.length < 100) {
      console.log('🔍 Searching for tab content in special containers...');
      
      // Common tab content containers
      const containers = [
        '.js-tab-content',
        '.tab-content',
        '.tab_content',
        '.js-store',
        '.ugm-tab',
        '[data-content=tab]',
        '#cont'
      ];
      
      for (const selector of containers) {
        const container = $(selector);
        if (container.length) {
          console.log(`🔍 Found container with selector: ${selector}`);
          
          // Try to find pre tags within the container
          const containerPreElements = container.find('pre');
          if (containerPreElements.length) {
            containerPreElements.each((i, el) => {
              tabText += $(el).text() + '\n\n';
            });
            console.log('🎉 Found tab content in container pre tags!');
            break;
          } else {
            // If no pre tags, use the container text directly
            const containerText = container.text();
            if (containerText && containerText.includes('|-') && containerText.includes('-|')) {
              tabText = containerText;
              console.log('🎉 Found tab content in container text!');
              break;
            }
          }
        }
      }
    }
    
    // Strategy 4: As a last resort, search the entire body
    if (!tabText.trim() || tabText.length < 100) {
      console.log('🔍 Searching entire body for tab-like content...');
      
      const bodyText = $('body').text();
      
      // Look for tab patterns in the body text
      const tabPatterns = [
        /[eEBGDAa][\s\-]*[|:][-0-9hpbsxX\/\\~\^\+\*\(\)\[\]]+[|:]/g,
        /[eEBGDAa][\s\-]*\|[-0-9hpbsxX\/\\~\^\+\*\(\)\[\]\s]+\|/g,
        /[eEBGDAa][\s\-]*:[-0-9hpbsxX\/\\~\^\+\*\(\)\[\]\s]+:/g,
        /[eEBGDAa][:]?[\s\-]*\|[-0-9hpbsxX\/\\~\^\+\*\(\)\[\]\s]+/g,
        /\|[-0-9hpbsxX\/\\~\^\+\*\(\)\[\]\s]+\|/g
      ];
      
      for (const pattern of tabPatterns) {
        const matches = bodyText.match(pattern);
        if (matches && matches.length > 0) {
          console.log(`🎉 Found ${matches.length} tab notation matches with pattern!`);
          tabText += matches.join('\n') + '\n';
          break;
        }
      }
    }
    
    // Extract song info
    const title = $('.t_song h1').text().trim() || 
                 $('.song-name').text().trim() || 
                 $('h1').first().text().trim() ||
                 $('title').text().replace('@ Ultimate-Guitar.Com', '').trim() || 
                 'Unknown Song';
                 
    const artist = $('.t_autor a').text().trim() || 
                  $('.artist-name').text().trim() || 
                  $('.t_autor').text().trim() ||
                  'Unknown Artist';
    
    // Extract tuning information
    const tuningText = $('.tuning').text().trim() || 
                      $('.js-tuning').text().trim() || 
                      '';
                      
    const tuning = tuningText.replace('Tuning:', '').trim() || 'Standard';
    
    console.log(`📊 Parsing result for "${title}" by "${artist}"`);
    
    // Final check for valid tab content
    if (!tabText || tabText.length < 100) {
      console.error('❌ Could not extract valid tab content');
      throw new Error('Could not extract valid tab content from the HTML');
    }
    
    console.log(`📊 Tab length: ${tabText.length} characters`);
    console.log(`📊 Tab preview: ${tabText.substring(0, 100).replace(/\n/g, ' ')}`);
    
    // Parse the tab into note objects if needed
    let parsedNotes = [];
    try {
      parsedNotes = parseTabNotation(tabText);
      console.log(`📊 Parsed ${parsedNotes.length} notes from the tab`);
    } catch (parseError) {
      console.error('❌ Error parsing tab into notes:', parseError.message);
      // Continue without parsed notes, we'll still have the raw tab text
    }
    
    return {
      title,
      artist,
      tuning,
      notes: parsedNotes.length > 0 ? parsedNotes : createEnhancedPlaceholderNotes(),
      measures: estimateMeasures(tabText),
      source: {
        type: 'ultimate-guitar',
        url: null,
        rawContent: tabText,
        rawHtml: html.substring(0, 1000) // Store a prefix of the HTML for debugging
      }
    };
  } catch (error) {
    console.error('❌ UG Parser error:', error.message);
    throw new Error(`Ultimate Guitar parser failed: ${error.message}`);
  }
}

/**
 * Estimate the number of measures in a tab
 * @param {string} tabText - Raw tab text
 * @returns {number} - Estimated number of measures
 */
function estimateMeasures(tabText) {
  // Count the number of measure separators (|) on a typical line
  const lines = tabText.split('\n');
  
  // Find a line that looks like a tab string (has e|, B|, G|, etc.)
  const tabLine = lines.find(line => /^[eEBGADa]\|/.test(line.trim()));
  if (tabLine) {
    // Count the vertical bars
    const barCount = (tabLine.match(/\|/g) || []).length;
    // Subtract 1 because the first | is the start of the tab
    return Math.max(1, barCount - 1);
  }
  
  // If we can't find a clear tab line, make a rough estimate based on length
  return Math.max(4, Math.floor(tabText.length / 200));
}

/**
 * Parse Songsterr tabs into a standardized format
 * @param {string} html - HTML content from Songsterr tab page
 * @returns {Object} - Standardized tab data
 */
export async function parseSongsterrTab(html) {
  if (!html) throw new Error('No HTML content provided');
  
  try {
    const $ = cheerio.load(html);
    
    // Extract song info
    const title = $('h1.title').text().trim();
    const artist = $('h2.artist').text().trim();
    
    // Extract tuning information from meta data
    const tuningInfo = $('meta[name="tuning"]').attr('content');
    const tuning = tuningInfo || 'Standard';
    
    // Extract tab content - Songsterr uses React so content is in a script tag
    // This is a simplification - real implementation would be more complex
    const scriptTags = $('script').toArray();
    let tabData = null;
    
    for (const script of scriptTags) {
      const content = $(script).html();
      if (content && content.includes('SONG_INFO')) {
        // Extract tab data from script content
        // Note: This is a simplified approach, real parsing would need a more robust method
        tabData = content;
        break;
      }
    }
    
    // Parse tab notation from script data (simplified)
    const notes = parseSongsterrNotation(tabData);
    
    return {
      title,
      artist,
      tuning,
      notes,
      source: {
        type: 'songsterr',
        url: null, // Will be set by the calling function
        rawData: tabData
      }
    };
  } catch (error) {
    console.error('Error parsing Songsterr tab:', error);
    throw new Error(`Failed to parse tab: ${error.message}`);
  }
}

/**
 * Parse Guitar Pro tabs from .gp/.gpx files
 * Note: This would require a backend service and a Guitar Pro parser library
 * @param {Buffer} fileBuffer - Binary buffer of the Guitar Pro file
 * @returns {Object} - Standardized tab data
 */
export async function parseGuitarProTab(fileBuffer) {
  // This function would require a server-side implementation
  // and a Guitar Pro parsing library like alphaTab
  throw new Error('Guitar Pro parsing not implemented in this version');
}

/**
 * Parse standard tab notation text to notes array format
 * @param {string} tabText - Raw tab text (e.g. "e|---3---|")
 * @returns {Array} - Array of note objects
 */
function parseTabNotation(tabText) {
  if (!tabText) return [];
  
  // Log sample of tab text for debugging
  console.log('Tab text sample:', tabText.slice(0, 200) + '...');
  
  // Check if this is chord chart notation and handle differently
  if (tabText.includes('Chord Diagrams') || (tabText.match(/[A-G][#b]?m?7?/g)?.length > 10 && 
      !tabText.match(/[eEBGDAa][\s\-]*[|:]/))) {
    console.log('Detected chord chart format');
    return parseChordNotation(tabText);
  }
  
  // Remove common non-tab lines and headers
  tabText = cleanTabText(tabText);
  
  const lines = tabText.split('\n');
  const strings = {}; // Will hold each string's data
  
  // Extract string data - group consecutive tablature lines
  let currentStringGroup = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Check if this line matches a guitar string pattern
    // Expanded regex to handle more formats: e|, E|, e:|, E:|, e-|, etc.
    // This regex is more permissive to handle various tab formats
    const stringMatch = line.match(/^\s*([eEBGDAa])[\-\s]*[|:](.+)/);
    
    if (stringMatch) {
      currentStringGroup.push({ 
        string: stringMatch[1], 
        content: stringMatch[2].replace(/[|:]$/, '') // Remove trailing |:
      });
      
      // If we've collected all 6 strings or reached the end of a tab section
      // process the group
      const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
      if (currentStringGroup.length === 6 || !nextLine.match(/^\s*([eEBGDAa])[\-\s]*[|:]/)) {
        processStringGroup(currentStringGroup, strings);
        currentStringGroup = [];
      }
    } else if (currentStringGroup.length > 0) {
      // If we've started a group but this line doesn't match the pattern,
      // process what we have so far
      processStringGroup(currentStringGroup, strings);
      currentStringGroup = [];
      
      // Check if this might be a continuation line without string indicator
      // This handles cases where the string indicator is omitted in tab lines
      if (line.includes('|') && line.includes('-')) {
        // This could be a tab line without a string indicator
        // Try to add it to the appropriate string based on position
        if (Object.keys(strings).length > 0) {
          // Determine which string this line belongs to based on context
          const lastStringNum = Math.max(...Object.keys(strings).map(Number));
          if (lastStringNum > 0 && lastStringNum < 6) {
            // Add to the next string
            const nextStringNum = lastStringNum + 1;
            if (!strings[nextStringNum]) {
              strings[nextStringNum] = [];
            }
            strings[nextStringNum].push(line);
          }
        }
      }
    } else if (line.includes('|') && line.includes('-') && (!line.includes('Chord') && !line.includes('Capo'))) {
      // This could be a tab line without a string indicator in an unlabeled section
      // Try to determine which string this is by position in potential group
      
      // Look ahead to see if this is part of a group of 6 lines
      let potentialTabGroup = [line];
      for (let j = 1; j < 6 && i + j < lines.length; j++) {
        const nextLine = lines[i + j].trim();
        if (nextLine && nextLine.includes('|') && nextLine.includes('-')) {
          potentialTabGroup.push(nextLine);
        } else {
          break;
        }
      }
      
      // If we have multiple lines that look like tab, assign string names
      if (potentialTabGroup.length >= 3) {
        // This is likely a group of tab lines without string indicators
        const stringNames = ['e', 'B', 'G', 'D', 'A', 'E'];
        for (let j = 0; j < potentialTabGroup.length; j++) {
          const stringIndex = Math.min(j, stringNames.length - 1);
          const stringName = stringNames[stringIndex];
          const mappedString = { 
            string: stringName, 
            content: potentialTabGroup[j].replace(/^\s*\|/, '').replace(/\|$/, '')
          };
          currentStringGroup.push(mappedString);
        }
        
        // Skip ahead in the main loop
        i += potentialTabGroup.length - 1;
        
        // Process this group
        processStringGroup(currentStringGroup, strings);
        currentStringGroup = [];
      }
    }
  }
  
  // Process any remaining strings
  if (currentStringGroup.length > 0) {
    processStringGroup(currentStringGroup, strings);
  }
  
  // Generate notes from the extracted string data
  const result = generateNotes(strings);
  
  if (result.length === 0) {
    console.warn('No notes were parsed from the tab text');
    return createPlaceholderNotes();
  }
  
  return result;
}

/**
 * Clean tab text by removing headers, footers, and non-tab content
 * @param {string} tabText - Raw tab text
 * @returns {string} - Cleaned tab text
 */
function cleanTabText(tabText) {
  // Split into lines for cleaning
  let lines = tabText.split('\n');
  
  // Remove common headers and footers
  const linesToKeep = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and common non-tab lines
    if (!line) continue;
    if (line.startsWith('Tabbed by') || 
        line.startsWith('Submitted by') ||
        line.startsWith('http') ||
        line.match(/^\s*\[\d+\/\d+\]\s*$/) || // Progress indicators [1/4] etc.
        line.includes('Ultimate Guitar') ||
        line.includes('copyright') || 
        (line.length < 5 && !line.match(/[eEBGDAa][|:]/))) {
      continue;
    }
    
    linesToKeep.push(lines[i]);
  }
  
  return linesToKeep.join('\n');
}

/**
 * Parse chord notation to notes
 * @param {string} chordText - Chord chart text
 * @returns {Array} - Array of note objects
 */
function parseChordNotation(chordText) {
  // Extract chord names from the text
  const chordRegex = /([A-G][#b]?(?:m|sus|maj|min|aug|dim)?(?:7|9|11|13)?)/g;
  const matches = chordText.match(chordRegex);
  
  if (!matches || matches.length === 0) {
    return createPlaceholderNotes();
  }
  
  // Create a simple progression from the chords
  const chords = [...new Set(matches.slice(0, 8))]; // Deduplicate and limit to 8 chords
  
  // Map common chords to fret positions (simplified)
  const chordMap = {
    'C': [{ positions: [{ str: 5, fret: 3 }, { str: 4, fret: 2 }, { str: 3, fret: 0 }, { str: 2, fret: 1 }, { str: 1, fret: 0 }], duration: 'q' }],
    'G': [{ positions: [{ str: 6, fret: 3 }, { str: 5, fret: 2 }, { str: 4, fret: 0 }, { str: 3, fret: 0 }, { str: 2, fret: 0 }, { str: 1, fret: 3 }], duration: 'q' }],
    'D': [{ positions: [{ str: 4, fret: 0 }, { str: 3, fret: 2 }, { str: 2, fret: 3 }, { str: 1, fret: 2 }], duration: 'q' }],
    'A': [{ positions: [{ str: 5, fret: 0 }, { str: 4, fret: 2 }, { str: 3, fret: 2 }, { str: 2, fret: 2 }, { str: 1, fret: 0 }], duration: 'q' }],
    'E': [{ positions: [{ str: 6, fret: 0 }, { str: 5, fret: 2 }, { str: 4, fret: 2 }, { str: 3, fret: 1 }, { str: 2, fret: 0 }, { str: 1, fret: 0 }], duration: 'q' }],
    'Am': [{ positions: [{ str: 5, fret: 0 }, { str: 4, fret: 2 }, { str: 3, fret: 2 }, { str: 2, fret: 1 }, { str: 1, fret: 0 }], duration: 'q' }],
    'Em': [{ positions: [{ str: 6, fret: 0 }, { str: 5, fret: 2 }, { str: 4, fret: 2 }, { str: 3, fret: 0 }, { str: 2, fret: 0 }, { str: 1, fret: 0 }], duration: 'q' }],
    'Dm': [{ positions: [{ str: 4, fret: 0 }, { str: 3, fret: 2 }, { str: 2, fret: 3 }, { str: 1, fret: 1 }], duration: 'q' }],
  };
  
  // Generate note pattern from chords
  const result = [];
  for (const chord of chords) {
    // Find the basic chord (C, G, D, etc.) by removing suffixes
    const basicChord = chord.match(/^([A-G][#b]?)/)[1];
    const isMinor = chord.includes('m');
    
    // Try to find the chord in our map
    let chordNotes = null;
    if (chordMap[chord]) {
      chordNotes = chordMap[chord];
    } else if (chordMap[basicChord + (isMinor ? 'm' : '')]) {
      chordNotes = chordMap[basicChord + (isMinor ? 'm' : '')];
    } else if (chordMap[basicChord]) {
      chordNotes = chordMap[basicChord];
    }
    
    // If chord is found, add it to the result
    if (chordNotes) {
      result.push(...chordNotes);
    } else {
      // Fallback for unknown chords
      result.push({ positions: [{ str: 6, fret: 0 }], duration: 'q' });
    }
  }
  
  return result.length > 0 ? result : createPlaceholderNotes();
}

/**
 * Process a group of guitar strings from tablature
 * @param {Array} stringGroup - Array of string objects {string, content}
 * @param {Object} strings - Object to store processed string data
 */
function processStringGroup(stringGroup, strings) {
  for (const item of stringGroup) {
    // Map string name to string number (1-6)
    const stringNumber = { 
      e: 1, E: 1, // High E (1st string)
      B: 2,       // B string
      G: 3,       // G string
      D: 4,       // D string
      A: 5, a: 5, // A string
      E: 6, e: 6  // Low E (6th string) - some tabs use lowercase e for both
    }[item.string];
    
    // Use string identifier to determine if it's high E or low E
    const isHighE = item.string === 'e';
    const stringNum = item.string === 'E' || item.string === 'e' 
      ? (isHighE ? 1 : 6) 
      : stringNumber;
    
    // Initialize array for this string if not exists
    if (!strings[stringNum]) {
      strings[stringNum] = [];
    }
    
    // Add content to this string's data
    strings[stringNum].push(item.content);
  }
}

/**
 * Generate note objects from processed string data
 * @param {Object} strings - Object containing processed string data
 * @returns {Array} - Array of note objects
 */
function generateNotes(strings) {
  const result = [];
  
  if (Object.keys(strings).length === 0) {
    console.warn('No string data found in tab text');
    return [];
  }
  
  // Merge multiple lines for each string into a single string
  const mergedStrings = {};
  for (const [stringNum, lines] of Object.entries(strings)) {
    mergedStrings[stringNum] = lines.join('');
  }
  
  // Get max length of all strings
  const maxLength = Math.max(...Object.values(mergedStrings).map(s => s.length));
  
  // Process each column (time position)
  for (let i = 0; i < maxLength; i++) {
    const positions = [];
    
    // Check each string
    for (let str = 1; str <= 6; str++) {
      if (!mergedStrings[str]) continue;
      
      const character = mergedStrings[str][i];
      // If it's a number, add it as a position
      if (character && /[0-9]/.test(character)) {
        // Handle multi-digit frets (look ahead)
        let fretString = character;
        let j = i + 1;
        while (j < mergedStrings[str].length && /[0-9]/.test(mergedStrings[str][j])) {
          fretString += mergedStrings[str][j];
          j++;
        }
        
        positions.push({ str, fret: parseInt(fretString, 10) });
      }
    }
    
    // If we found any positions, add them as a note
    if (positions.length > 0) {
      result.push({ positions, duration: 'q' }); // Default to quarter notes
    }
  }
  
  return result;
}

/**
 * Create placeholder notes when parsing fails
 * @returns {Array} - Array of basic note objects
 */
function createPlaceholderNotes() {
  return [
    { positions: [{ str: 6, fret: 0 }], duration: 'q' },
    { positions: [{ str: 5, fret: 2 }], duration: 'q' },
    { positions: [{ str: 4, fret: 2 }], duration: 'q' },
    { positions: [{ str: 6, fret: 0 }, { str: 5, fret: 2 }, { str: 4, fret: 2 }], duration: 'q' },
  ];
}

/**
 * Parse Songsterr notation (simplified version)
 * @param {string} scriptData - Script data containing notation
 * @returns {Array} - Array of note objects
 */
function parseSongsterrNotation(scriptData) {
  // This is a placeholder - real implementation would need to parse
  // Songsterr's data format from the script content
  
  // Return a basic empty pattern for now
  return createPlaceholderNotes();
}

/**
 * Create enhanced placeholder notes when parsing fails - more realistic guitar pattern
 * @returns {Array} - Array of basic note objects
 */
function createEnhancedPlaceholderNotes() {
  // A simple G-C-D progression
  return [
    // G chord
    { positions: [{ str: 6, fret: 3 }, { str: 5, fret: 2 }, { str: 4, fret: 0 }, { str: 3, fret: 0 }, { str: 2, fret: 0 }, { str: 1, fret: 3 }], duration: 'q' },
    // C chord
    { positions: [{ str: 5, fret: 3 }, { str: 4, fret: 2 }, { str: 3, fret: 0 }, { str: 2, fret: 1 }, { str: 1, fret: 0 }], duration: 'q' },
    // D chord
    { positions: [{ str: 4, fret: 0 }, { str: 3, fret: 2 }, { str: 2, fret: 3 }, { str: 1, fret: 2 }], duration: 'q' },
    // G chord again
    { positions: [{ str: 6, fret: 3 }, { str: 5, fret: 2 }, { str: 4, fret: 0 }, { str: 3, fret: 0 }, { str: 2, fret: 0 }, { str: 1, fret: 3 }], duration: 'q' },
  ];
} 