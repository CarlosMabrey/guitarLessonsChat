import React, { useMemo, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import NoteCell from '@/components/fretboard/NoteCell';
import { getFretNote, fretMarkers } from '@/hooks/useFretboardState';
import { useContainerSize } from '@/hooks/useContainerSize';
import * as Tonal from '@tonaljs/tonal';

/**
 * Main fretboard grid component that displays strings and frets
 */
// const [startX, setStartX] = useState(0);
const FretboardGrid = ({
  strings,
  frets,
  highlightedNotes = [],
  intervalMap = {},
  selectedNotes = [],
  onNoteClick,
  showOnlyRelevantNotes = true,
  singleVoicingMode = false,
  currentVoicing = null,
  className = ''
}) => {
  
  // Completely remove fret 0 - we only want frets 1 and up
  const displayFrets = useMemo(() => {
    return frets.filter(fret => fret !== 0);
  }, [frets]);
  
  // Check if a note should be highlighted based on the current voicing in single voicing mode
  const isNoteInVoicing = useMemo(() => {
    if (!singleVoicingMode || !currentVoicing) return () => false;
    
    const voicingNotes = {};
    currentVoicing.frets.forEach((fret, stringIndex) => {
      if (fret === 'x' || stringIndex >= strings.length) return;
      
      const note = getFretNote(strings[stringIndex], parseInt(fret, 10));
      voicingNotes[note] = true;
    });
    
    return (note) => !!voicingNotes[normalizeNote(note)];
  }, [currentVoicing, singleVoicingMode, strings]);

  // Normalize a note to its simplest form and handle enharmonic equivalents
  const normalizeNote = (note) => {
    try {
      if (!note) return '';
      
      // First get the pitch class (letter + accidental, no octave)
      const pitchClass = Tonal.Note.pitchClass(note);
      
      // Use the midi number for comparison instead of string-based comparison
      // This ensures all enharmonic equivalents match regardless of notation
      const midiNumber = Tonal.Note.midi(pitchClass + '4');
      if (midiNumber !== null) {
        // Default to sharp notation which is used by allNotes array
        const allNotesByMidi = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        // Convert to 0-11 range C=0, C#=1, etc.
        return allNotesByMidi[midiNumber % 12];
      }
      
      // Fallback if midi number can't be determined
      const standardized = Tonal.Note.standardize(pitchClass);
      const simplified = Tonal.Note.simplify(standardized);
      return simplified || standardized || pitchClass || note;
    } catch (e) {
      console.error('Error normalizing note:', note, e);
      return note; // Return original if there's an error
    }
  };
  
  // Helper for MIDI-based note matching (most reliable way to match enharmonics)
  const getMidiValue = (note) => {
    try {
      if (!note) return null;
      
      // Extract just the pitch class (letter + accidental) to handle notes with or without octave
      const pitchClass = Tonal.Note.pitchClass(note);
      if (!pitchClass) return null;
      
      // Add octave 4 for consistent comparison
      const noteWithOctave = pitchClass + '4';
      const midi = Tonal.Note.midi(noteWithOctave);
      
      // For debugging
      // console.log(`Converting note ${note} (pitch class: ${pitchClass}) to MIDI: ${midi}`);
      
      return midi;
    } catch (e) {
      console.error('Error getting MIDI value:', note, e);
      return null;
    }
  };
  
  // Find interval for a note, handling enharmonic equivalents via MIDI comparison
  const findIntervalForNote = (note) => {
    if (!note || !highlightedNotes.length) return null;
    
    // Get MIDI value for this note
    const noteMidi = getMidiValue(note);
    if (noteMidi === null) return null;
    
    // Strategy 1: Direct lookup in intervalMap
    if (intervalMap[note]) {
      return intervalMap[note];
    }
    
    // Strategy 2: Find match by MIDI value % 12 (enharmonic equivalent)
    const noteMod12 = noteMidi % 12;
    for (const highlightedNote of highlightedNotes) {
      const highlightedMidi = getMidiValue(highlightedNote);
      if (highlightedMidi !== null && (highlightedMidi % 12) === noteMod12) {
        // Found a match - return its interval
        return intervalMap[highlightedNote];
      }
    }
    
    // Strategy 3: Look directly in intervalMap for any note with same MIDI mod 12
    for (const [mapNote, interval] of Object.entries(intervalMap)) {
      const mapNoteMidi = getMidiValue(mapNote);
      if (mapNoteMidi !== null && (mapNoteMidi % 12) === noteMod12) {
        return interval;
      }
    }
    
    return null;
  };
  
  // Check if a note should be highlighted using MIDI values for reliable comparison
  const isNoteHighlighted = (note) => {
    if (!note) return false;
    
    // Get MIDI value for the note we're checking
    const noteMidi = getMidiValue(note);
    if (noteMidi === null) return false;
    
    // Create a lookup table of MIDI % 12 values for faster comparison
    // This avoids recalculating MIDI values for each comparison
    const midiModLookup = {};
    highlightedNotes.forEach(hn => {
      const hMidi = getMidiValue(hn);
      if (hMidi !== null) {
        midiModLookup[hMidi % 12] = true;
      }
    });
    
    // For debugging only
    // const notePC = Tonal.Note.pitchClass(note);
    // if (notePC === 'Bb' || notePC === 'A#') {
    //   console.log(`Checking flat/sharp note: ${note} (PC: ${notePC}, MIDI: ${noteMidi}, mod12: ${noteMidi % 12})`);
    //   console.log(`Highlighted notes mod12 values:`, Object.keys(midiModLookup));
    //   console.log(`Will this note match?`, midiModLookup[noteMidi % 12] === true);
    // }
    
    // Fast lookup using the MIDI % 12 value
    return midiModLookup[noteMidi % 12] === true;
  };

  // Check if a note is selected using MIDI values
  const isNoteSelected = (note) => {
    if (!note) return false;
    
    // Get MIDI value for the note we're checking
    const noteMidi = getMidiValue(note);
    if (noteMidi === null) return false;
    
    // Compare MIDI values instead of string representations
    return selectedNotes.some(selectedNote => {
      const selectedMidi = getMidiValue(selectedNote);
      return selectedMidi === noteMidi;
    });
  };

  // Handle note cell click
  const handleNoteClick = (note, stringIndex, fret) => {
    if (onNoteClick) {
      onNoteClick(note, stringIndex, fret);
    }
  };

  // Calculate dynamic cell size based on container height
  const [containerRef, containerSize] = useContainerSize();
  const [cellSize, setCellSize] = useState(40); // Default size
  const tableRef = useRef(null);

  // Update cell size when container size changes
  useEffect(() => {
    if (!containerSize.height || !tableRef.current) return;
    
    const table = tableRef.current;
    const headerHeight = table.querySelector('thead')?.offsetHeight || 48;
    const availableHeight = containerSize.height - headerHeight - 48; // Account for padding
    const numRows = strings.length;
    
    // Calculate max cell size that fits all rows
    const maxCellSize = Math.min(60, Math.max(32, Math.floor(availableHeight / numRows) - 4));
    setCellSize(maxCellSize);
  }, [containerSize, strings.length]);

  // Calculate responsive fret width based on cell size and container width
  const containerRef2 = useRef(null);
  const fretboardRef = useRef(null);
  const { width: containerWidth } = useContainerSize(containerRef2);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [startX, setStartX] = useState(0);

  const calculateResponsiveFretWidth = () => {
    // Calculate available width after accounting for string label column
    const availableWidth = containerWidth - 60; // 60px for the first column
    
    // Default fret width based on available width and number of frets
    const defaultFretWidth = availableWidth / (displayFrets.length || 12);
    
    // Min/max constraints for fret width
    const minFretWidth = 50;
    const maxFretWidth = 120;
    return Math.max(minFretWidth, Math.min(maxFretWidth, defaultFretWidth));
  };

  // Calculate fret width
  const fretWidth = useMemo(() => calculateResponsiveFretWidth(), [containerWidth, displayFrets.length]);
  
  // Calculate the table width based on the number of frets and container size
  const calculateTableWidth = () => {
    // 60px for first column (string names)
    const firstColumnWidth = 60;
    const totalFretsWidth = displayFrets.length * fretWidth;
    return firstColumnWidth + totalFretsWidth;
  };
  
  const tableWidth = useMemo(() => calculateTableWidth(), [fretWidth, displayFrets.length]);
  
  // Mouse event handlers for drag scrolling
  const handleMouseDown = (e) => {
    if (!fretboardRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - fretboardRef.current.offsetLeft);
    setScrollLeft(fretboardRef.current.scrollLeft);
    // Change cursor style
    document.body.style.cursor = 'grabbing';
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset cursor style
    document.body.style.cursor = 'default';
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging || !fretboardRef.current) return;
    e.preventDefault();
    const x = e.pageX - fretboardRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Speed multiplier
    fretboardRef.current.scrollLeft = scrollLeft - walk;
  };
  
  // Clean up event listeners when component unmounts
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
      document.body.style.cursor = 'default'; // Reset cursor just in case
    };
  }, [isDragging, startX, scrollLeft]);

  // Calculate responsive fret width based on cell size and container width
  const stringHeight = cellSize;
  const noteSize = Math.min(cellSize * 0.8, 48);

  return (
    <div className="relative" ref={containerRef2}>
      {/* Add an instruction overlay that fades out */}
      {/* <div className="absolute top-0 left-0 right-0 py-1 bg-blue-900/80 text-center text-xs text-blue-300 rounded-t-lg opacity-70 z-10 pointer-events-none">
        Click and drag to scroll horizontally
      </div> */}
      <div 
        className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col h-full overflow-hidden relative"
        style={{
          '--cell-size': `${cellSize}px`,
          '--fret-width': `${fretWidth}px`,
          '--string-height': `${stringHeight}px`,
          '--note-size': `${noteSize}px`,
          minHeight: '400px',
          height: '100%',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Nut element positioned between string labels and first fret */}
        <div 
          className="absolute top-0 bottom-0 w-1.5 bg-gradient-to-b from-gray-300 to-gray-400 z-10"
          style={{
            boxShadow: '1px 0 3px rgba(0,0,0,0.3)',
            left: `${cellSize * 1.75}px`, // Position after string label column (1.5x cellSize for padding)
            transform: 'translateX(125%)', // Center the nut on the boundary
          }}
        />
        <div 
          className="flex-1 overflow-hidden p-4"
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',  // Hide scrollbar in IE and Edge
            scrollbarWidth: 'none',    // Hide scrollbar in Firefox
          }}
        >
          <div style={{ minWidth: '100%', width: 'max-content' }}>
            <div 
              className="w-full rounded-lg bg-blue-900/20 border border-blue-700/20 overflow-hidden" 
              ref={fretboardRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
            >
              <table className="w-full border-collapse" style={{ minWidth: tableWidth }} cellPadding="0" cellSpacing="0">
                <colgroup>
                  {/* String labels column */}
                  <col style={{ width: '60px', minWidth: '60px' }} />
                  {/* Set width for each fret */}
                  {displayFrets.map((fret) => (
                    <col 
                      key={fret} 
                      style={{ 
                        width: `${fretWidth}px`, 
                        minWidth: `${fretWidth}px` 
                      }} 
                    />
                  ))}
                </colgroup>
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-3 py-2 text-center w-12 relative">
                      <span className="sr-only">String</span>
                    </th>
                    {displayFrets.map((fret) => (
                      <th key={fret} className="px-3 py-2 text-center w-12 relative">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-800/40 text-indigo-300 border border-indigo-700/50">
                          {fret}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {strings.map((openNote, stringIndex) => (
                    <tr key={stringIndex} className="border-t border-white/5 hover:bg-white/5 transition-colors duration-200">
                      {/* String label cell with note names (E, A, D, G, B, E) - using NoteCell for consistent color styling */}
                      <td className="px-3 py-3 text-center relative">
                        <div className="flex items-center justify-center">
                          <NoteCell
                            note={openNote.replace(/\d+$/, '') /* Remove octave number */}
                            interval={intervalMap[openNote.replace(/\d+$/, '')] || ''}
                            isHighlighted={isNoteHighlighted(openNote)}
                            isSelected={isNoteSelected(openNote)}
                            isInVoicing={singleVoicingMode ? isNoteInVoicing(openNote) : true}
                            isRelevant={!showOnlyRelevantNotes || isNoteHighlighted(openNote) || isNoteSelected(openNote) || (singleVoicingMode && isNoteInVoicing(openNote))}
                            fret={-1} /* Use -1 to avoid the vertical line styling for fret 0 */
                            stringIndex={stringIndex}
                            cellSize={cellSize}
                            className="mx-auto"
                            onClick={() => handleNoteClick(openNote, stringIndex, 0)}
                          />
                        </div>
                      </td>
                      {displayFrets.map((fret) => {
                        const note = getFretNote(openNote, fret);
                        const isHighlighted = isNoteHighlighted(note);
                        const isSelected = isNoteSelected(note);
                        const isInVoicing = singleVoicingMode ? isNoteInVoicing(note) : true;
                        const interval = isNoteHighlighted(note) ? findIntervalForNote(note) : null;
                        
                        return (
                          <NoteCell
                            key={`note-${stringIndex}-${fret}`}
                            note={note}
                            fret={fret}
                            stringIndex={stringIndex}
                            isSelected={isSelected}
                            isHighlighted={isHighlighted}
                            isRelevant={!showOnlyRelevantNotes || isHighlighted || isSelected || isInVoicing}
                            interval={interval}
                            onClick={() => handleNoteClick(note, stringIndex, fret)}
                            cellSize={cellSize}
                            className="px-3 py-3 text-center"
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

FretboardGrid.propTypes = {
  /** Array of string notes (e.g., ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']) */
  strings: PropTypes.arrayOf(PropTypes.string).isRequired,
  /** Array of fret numbers to display (e.g., [0, 1, 2, 3, ..., 12]) */
  frets: PropTypes.arrayOf(PropTypes.number).isRequired,
  /** Array of notes that should be highlighted (e.g., scale or chord notes) */
  highlightedNotes: PropTypes.arrayOf(PropTypes.string),
  /** Map of notes to their intervals for color coding */
  intervalMap: PropTypes.object,
  /** Array of currently selected notes */
  selectedNotes: PropTypes.arrayOf(PropTypes.string),
  /** Callback when a note is clicked (note, stringIndex, fret) */
  onNoteClick: PropTypes.func,
  /** Whether to only show notes that are part of the current scale/chord */
  showOnlyRelevantNotes: PropTypes.bool,
  /** Whether to show only the current voicing */
  singleVoicingMode: PropTypes.bool,
  /** Current voicing to highlight */
  currentVoicing: PropTypes.object,
  /** Additional CSS classes */
  className: PropTypes.string,
};

FretboardGrid.defaultProps = {
  highlightedNotes: [],
  intervalMap: {},
  selectedNotes: [],
  showOnlyRelevantNotes: true,
  singleVoicingMode: false,
};

export default React.memo(FretboardGrid);
