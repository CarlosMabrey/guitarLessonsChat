import React from 'react';

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
  
  // Determine styling based on status
  let cellClass = "relative px-3 py-3 text-center";
  let noteClass = "flex items-center justify-center w-10 h-10 mx-auto rounded-full transition-all duration-200";
  
  // Apply appropriate styling based on the note's status
  if (voicingPosition) {
    noteClass += " bg-purple-600/80 text-white border-2 border-purple-300/40 shadow-lg scale-110 z-10";
  } else if (isSelected) {
    noteClass += " bg-blue-500 text-white border-2 border-blue-300/50 shadow-lg scale-110 z-10";
  } else if (isHighlighted && interval === '1P') {
    noteClass += " bg-gradient-to-br from-red-600/80 to-rose-500/80 text-white border border-red-400/30 shadow-md";
  } else if (isHighlighted && (interval === '3M' || interval === '3m')) {
    noteClass += " bg-gradient-to-br from-green-600/80 to-emerald-500/80 text-white border border-green-400/30 shadow-md";
  } else if (isHighlighted && interval === '5P') {
    noteClass += " bg-gradient-to-br from-blue-600/80 to-cyan-500/80 text-white border border-blue-400/30 shadow-md";
  } else if (isHighlighted) {
    noteClass += " bg-gradient-to-br from-indigo-600/80 to-violet-500/80 text-white border border-indigo-400/30 shadow-md";
  } else if (isScalePatternNote) {
    noteClass += " bg-amber-500/50 text-white border border-amber-400/30 shadow-md";
  } else {
    noteClass += " bg-gray-800/30 text-gray-300/70 border border-gray-700/30 hover:bg-gray-700/50 hover:text-white hover:scale-105";
  }
  
  // For notes that should be hidden based on relevance filter
  if (!isRelevant) {
    noteClass += " opacity-20 scale-75 hover:opacity-100 hover:scale-90";
  }
  
  return (
    <td className={cellClass}>
      {/* String Line */}
      <div className="absolute inset-0 flex items-center pointer-events-none">
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
        onClick={() => onClick(note)}
        aria-label={`${note} on string ${stringIndex + 1}, fret ${fret}`}
      >
        {content}
      </button>
    </td>
  );
} 