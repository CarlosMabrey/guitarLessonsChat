import React, { useMemo, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import NoteCell from '@/components/fretboard/NoteCell';
import { getFretNote, fretMarkers } from '@/hooks/useFretboardState';
import { useContainerSize } from '@/hooks/useContainerSize';
import * as Tonal from '@tonaljs/tonal';

/**
 * Main fretboard grid component that displays strings and frets
 */
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
  // Check if a note should be highlighted based on the current voicing in single voicing mode
  const isNoteInVoicing = useMemo(() => {
    if (!singleVoicingMode || !currentVoicing) return () => false;
    
    const voicingNotes = {};
    currentVoicing.frets.forEach((fret, stringIndex) => {
      if (fret === 'x' || stringIndex >= strings.length) return;
      
      const note = getFretNote(strings[stringIndex], parseInt(fret, 10));
      voicingNotes[note] = true;
    });
    
    return (note) => !!voicingNotes[note];
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
      // Add octave 4 for consistent comparison
      const noteWithOctave = Tonal.Note.pitchClass(note) + '4';
      return Tonal.Note.midi(noteWithOctave);
    } catch (e) {
      console.error('Error getting MIDI value:', note, e);
      return null;
    }
  };
  
  // Check if a note should be highlighted using MIDI values for reliable comparison
  const isNoteHighlighted = (note) => {
    if (!note) return false;
    
    // Get MIDI value for the note we're checking
    const noteMidi = getMidiValue(note);
    if (noteMidi === null) return false;
    
    // For debugging purposes - uncomment to see what's happening
    // console.log(`Checking note: ${note} (MIDI: ${noteMidi}) against highlights:`, 
    //   highlightedNotes.map(hn => `${hn} (MIDI: ${getMidiValue(hn)})`));
    
    // Compare MIDI values instead of string representations
    return highlightedNotes.some(highlightedNote => {
      const highlightedMidi = getMidiValue(highlightedNote);
      return highlightedMidi === noteMidi;
    });
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
  const calculateResponsiveFretWidth = () => {
    if (!containerSize.width) return Math.max(60, cellSize * 1.5);
    
    // Reserve space for the string label column (48px)
    const availableWidth = containerSize.width - 48 - 32; // 32px for padding
    
    // Calculate the ideal fret width to fit all frets
    const idealFretWidth = Math.floor(availableWidth / frets.length);
    
    // On small screens (< 768px), use a minimum width to ensure readability
    // On larger screens, try to fit all frets
    const minWidth = containerSize.width < 768 ? 60 : 48;
    
    // Use the ideal width if it's reasonable, otherwise use the default
    return Math.max(Math.min(idealFretWidth, 100), minWidth);
  };
  
  const fretWidth = calculateResponsiveFretWidth();
  const stringHeight = cellSize;
  const noteSize = Math.min(cellSize * 0.8, 48);

  // Calculate the table width based on the number of frets and container size
  const calculateTableWidth = () => {
    if (!containerSize.width) return '100%';
    
    const totalFretWidth = frets.length * fretWidth;
    const stringLabelWidth = 48; // Width of the string label column
    const totalWidth = totalFretWidth + stringLabelWidth;
    
    // Return the calculated width to ensure all frets are visible
    return `${totalWidth}px`;
  };
  
  // Get the calculated table width
  const tableWidth = calculateTableWidth();

  return (
    <div 
      ref={containerRef}
      className={`rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col h-full ${className}`}
      style={{
        '--cell-size': `${cellSize}px`,
        '--fret-width': `${fretWidth}px`,
        '--string-height': `${stringHeight}px`,
        '--note-size': `${noteSize}px`,
        minHeight: '400px',
        height: '100%',
        width: '100%',
      }}
    >
      <div 
        className="flex-1 overflow-auto p-4"
        style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{ minWidth: '100%', width: 'max-content' }}>
          <table 
            ref={tableRef} 
            className="border-separate border-spacing-0"
            style={{
              '--fret-width': `${fretWidth}px`,
              '--string-height': `${stringHeight}px`,
              width: tableWidth,
              tableLayout: 'fixed',
              minWidth: '100%'
            }}
          >
            <colgroup>
              <col style={{ width: '48px', minWidth: '48px' }} /> {/* String label column */}
              {frets.map((_, index) => (
                <col 
                  key={index} 
                  style={{ 
                    width: `${fretWidth}px`,
                    minWidth: `${fretWidth}px`,
                    maxWidth: `${fretWidth * 1.2}px`,
                  }} 
                />
              ))}
            </colgroup>
            <thead>
              <tr className="text-sm text-blue-300 font-medium">
                <th className="px-3 py-2 text-left w-12">String</th>
                {frets.map((fret) => (
                  <th key={fret} className="px-3 py-2 text-center w-12">
                    {fret === 0 || fretMarkers.includes(fret) ? (
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500/20 text-blue-300">
                        {fret}
                      </span>
                    ) : (
                      <span>{fret}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {strings.map((openNote, stringIndex) => (
                <tr key={stringIndex} className="border-t border-white/5 hover:bg-white/5 transition-colors duration-200">
                  <td className="p-1 text-center">
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-900/30 border border-indigo-400/20 text-sm font-bold text-indigo-300">
                        {openNote}
                      </div>
                    </div>
                  </td>
                  {frets.map((fret) => {
                    const note = getFretNote(openNote, fret);
                    const isHighlighted = isNoteHighlighted(note);
                    const isSelected = isNoteSelected(note);
                    const isInVoicing = singleVoicingMode ? isNoteInVoicing(note) : true;
                    const interval = intervalMap[note] || '';
                    
                    return (
                      <NoteCell
                        key={fret}
                        note={note}
                        interval={interval}
                        isHighlighted={isHighlighted}
                        isSelected={isSelected}
                        isInVoicing={isInVoicing}
                        isRelevant={!showOnlyRelevantNotes || isHighlighted || isSelected || isInVoicing}
                        onClick={() => handleNoteClick(note, stringIndex, fret)}
                        fret={fret}
                        stringIndex={stringIndex}
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
