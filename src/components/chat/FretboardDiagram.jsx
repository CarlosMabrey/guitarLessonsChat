import React from 'react';
import clsx from 'clsx';

export const FretboardDiagram = ({ fretboard }) => {
  if (!fretboard) return null;
  
  // Default values
  const strings = fretboard.strings || 6;
  const frets = fretboard.frets || 12;
  const notes = fretboard.notes || [];
  const tuning = fretboard.tuning || ['E', 'A', 'D', 'G', 'B', 'e'];
  
  // Create fretboard grid
  const renderFretboard = () => {
    const grid = [];
    
    // Create a dedicated column for string labels
    const stringLabels = (
      <div className="flex flex-col items-center mr-2">
        <div className="h-8"></div> {/* Spacer for fret numbers */}
        {Array.from({ length: strings }).map((_, i) => (
          <div key={i} className="h-8 flex items-center justify-center">
            <span className="text-xs font-medium text-slate-400">
              {tuning[i] || `String ${strings - i}`}
            </span>
          </div>
        ))}
      </div>
    );
    
    grid.push(stringLabels);
    
    // Create frets
    const fretCount = 5;
for (let fret = 0; fret <= fretCount; fret++) {
      const fretColumn = [];
      
      // Fret number
      fretColumn.push(
        <div key="fretNum" className="h-8 flex items-center justify-center">
          {fret > 0 ? (
            <span className="text-xs font-medium text-text-primary">{fret}</span>
          ) : (
            <span className="text-xs font-medium text-text-tertiary">0</span>
          )}
        </div>
      );
      
      // String positions
      for (let string = 0; string < strings; string++) {
        const noteData = notes[string]?.frets?.[fret];
        const hasNote = Boolean(noteData);
        const isHighlighted = hasNote && (noteData.highlight || noteData.color || noteData.label);
        fretColumn.push(
          <div 
            key={`s${string}f${fret}`} 
            className={clsx(
              "h-8 w-8 border-b border-[#1a2b45] relative",
              fret === 0 ? "border-r-2 border-r-[#1a2b45]" : "border-r border-r-[#1a2b45]",
              string === 0 ? "border-t border-t-[#1a2b45]" : ""
            )}
          >
            {hasNote && (
              <div className={clsx(
                "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs",
                isHighlighted ? "bg-blue-500 text-white shadow-md" : "bg-[#0e1a2b] border border-slate-700 text-slate-300"
              )} style={noteData.color ? { backgroundColor: noteData.color, color: '#fff' } : {}}>
                {noteData.label || noteData.note || ''}
              </div>
            )}
          </div>
        );
      }
      
      grid.push(
        <div key={`fret-${fret}`} className="flex flex-col">
          {fretColumn}
        </div>
      );
    }
    
    return (
      <div className="flex overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-card-hover/30 scrollbar-track-transparent">
        {grid}
      </div>
    );
  };
  
  return (
    <div className="my-4 p-6 bg-[#0e1a2b] rounded-xl border border-[#1a2b45] shadow-lg w-fit">
      <div className="font-semibold text-primary mb-2">
        {fretboard.name || 'Fretboard Diagram'}
      </div>
      
      {fretboard.description && (
        <div className="text-sm text-text-secondary mb-3">
          {fretboard.description}
        </div>
      )}
      
      {/* Nut marker between 0 and 1 if min fret is 1 */}
      {(() => {
        const minFret = 1; // Always show nut for open fretboard (can be improved if needed)
        if (minFret === 1) {
          return (
            <div className="relative w-full h-2 mb-1">
              <div className="absolute top-0 left-8 w-[calc(100%-2rem)] h-1 bg-white rounded-sm" style={{left: 40, right: 0}}></div>
            </div>
          );
        }
        return null;
      })()}
      {renderFretboard()}
      
      {fretboard.notes && fretboard.notes.some(n => n.label) && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {fretboard.notes.filter(n => n.label).map((note, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-blue-900 text-blue-200 text-xs"
              >
                {note.label}: {note.note}
              </span>
            ))}
          </div>
        </div>
      )}
          {/* Tuning labels below the grid */}
      <div className="flex space-x-2 mt-3 justify-center">
        {tuning.map((note, idx) => (
          <div
            key={idx}
            className="text-xs text-slate-400 font-medium w-8 text-center"
          >
            {note.replace(/\d+$/, '')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FretboardDiagram;
