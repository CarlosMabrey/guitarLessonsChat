import React from 'react';
import { getIntervalColors } from '@/lib/intervalColors';

export default function NoteCell({ 
  note, 
  fret, 
  stringIndex, 
  isSelected, 
  interval, 
  isHighlighted, 
  showDot, 
  isRelevant,
  simplifiedMode, 
  voicingPosition,
  showVoicings,
  isScalePatternNote,
  cellSize = 40, // Default size if not provided
  className = '',
  displayMode = 'chord', // 'chord' or 'scale' - determines coloring strategy
  onClick 
}) {
  // Extract pitch class for simpler display
  const pc = note.replace(/\d+$/, '');
  
  // Determine cell content based on mode and state
  let content = null;
  if (voicingPosition) {
    content = <span className="text-lg font-bold">{voicingPosition}</span>;
  } else if (simplifiedMode) {
    content = isHighlighted ? <span>{interval || pc}</span> : <span>{pc}</span>;
  } else {
    content = <span>{note}</span>;
  }
  
  // Calculate dynamic sizes
  const noteSize = cellSize ? Math.max(24, Math.min(60, cellSize * 0.8)) : 40;
  const fontSize = Math.max(10, Math.min(16, noteSize * 0.4));
  
  // Base classes
  let cellClass = "relative p-1 text-center";
  let noteClass = "flex items-center justify-center mx-auto rounded-full transition-all duration-200";
  
  // Apply dynamic sizing
  const noteStyle = {
    width: `${noteSize}px`,
    height: `${noteSize}px`,
    minWidth: `${noteSize}px`,
    fontSize: `${fontSize}px`,
  };
  
  // Apply appropriate styling based on the note's status
  if (voicingPosition) {
    // Voicing position (chord diagram)
    noteClass += " bg-purple-600/90 text-white border-2 border-purple-300/60 shadow-lg scale-110 z-20";
  } else if (isSelected) {
    // Selected notes (user clicked) - make very bright and distinct
    noteClass += " bg-gradient-to-br from-blue-500/95 to-sky-400/95 text-white border-2 border-blue-300/70 shadow-lg scale-110 z-20";
  } else if (isHighlighted) {
    // Highlighted notes (chord/scale)
    if (displayMode === 'scale') {
      // For scales, only color the root with red, other notes get a default color
      if (interval === '1P') {
        // Root is always red
        const rootColors = { bg: 'from-red-600/100 to-rose-500/100', border: 'border-red-400/30', text: 'text-white' };
        noteClass += ` bg-gradient-to-br ${rootColors.bg} ${rootColors.text} border ${rootColors.border} shadow-md`;
      } else {
        // Non-root scale notes get an indigo/violet color
        noteClass += ` bg-gradient-to-br from-rose-500/50 to-grey-600/20 border border-indigo-400/30 shadow-md`;
      }
    } else {
      // Chord mode - use interval colors for all notes
      // Get interval colors from the intervalColors utility
      // The interval should be provided via findIntervalForNote from FretboardGrid
      const colors = interval ? getIntervalColors(interval) : 
        // Default to root note color (red) for notes without specific interval info
        { bg: 'from-red-600/80 to-rose-500/80', border: 'border-red-400/30', text: 'text-white' };
      
      noteClass += ` bg-gradient-to-br ${colors.bg} ${colors.text} border ${colors.border} shadow-md`;
    }
  } else if (isScalePatternNote) {
    // Scale pattern notes
    noteClass += " bg-amber-500/70 text-white border border-amber-400/50 shadow-md";
  } else {
    // Default note appearance
    noteClass += " bg-gray-800/30 text-gray-300/70 border border-gray-700/30 hover:bg-gray-700/50 hover:text-white hover:scale-105";
  }
  
  // Apply relevance styling
  if (isRelevant === false) {
    noteClass += " opacity-20 scale-75 hover:opacity-100 hover:scale-90";
  } else {
    // Add hover effect for interactive elements
    if (onClick) {
      noteClass += " cursor-pointer hover:shadow-lg hover:z-10 hover:scale-105";
    }
  }
  
  // Combine the base cell class with any additional classes passed in
  const combinedCellClass = `${cellClass} ${className}`.trim();
  
  return (
    <td className={combinedCellClass}>
      {/* String Line */}
      <div className="absolute inset-0 flex items-center pointer-events-none" style={{
        top: '50%',
        transform: 'translateY(-50%)',
      }}>
        <div className="w-full h-px bg-white/10"></div>
      </div>
      
      {/* Special styling for nut (fret 0) */}
      {fret === 0 && (
        <div className="absolute inset-0 flex justify-center pointer-events-none">
          <div className="h-full w-1 bg-white/20 rounded-full"></div>
        </div>
      )}
      
      {/* Inlay markers (dots) */}
      {showDot && fret !== 0 && !isHighlighted && !isSelected && !voicingPosition && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
        </div>
      )}
      
      {/* Note button */}
      <button
        className={noteClass}
        style={noteStyle}
        onClick={() => onClick(note)}
        aria-label={`${note} on string ${stringIndex + 1}, fret ${fret}`}
      >
        {content}
      </button>
    </td>
  );
} 