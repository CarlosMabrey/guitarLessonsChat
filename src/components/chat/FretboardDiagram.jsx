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
            <span className="text-xs font-medium text-text-secondary">
              {tuning[i] || `String ${strings - i}`}
            </span>
          </div>
        ))}
      </div>
    );
    
    grid.push(stringLabels);
    
    // Create frets
    for (let fret = 0; fret <= frets; fret++) {
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
        
        fretColumn.push(
          <div 
            key={`s${string}f${fret}`} 
            className={clsx(
              "h-8 w-8 border-b border-card-hover/30 relative",
              fret === 0 ? "border-r-2 border-r-card-hover/70" : "border-r border-r-card-hover/30",
              string === 0 ? "border-t border-t-card-hover/30" : ""
            )}
          >
            {hasNote && (
              <div className={clsx(
                "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                "w-6 h-6 rounded-full flex items-center justify-center",
                "bg-primary/80 text-white text-xs font-medium"
              )}>
                {typeof noteData === 'string' ? noteData : (noteData.note || '')}
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
    <div className="my-4 p-4 bg-card-hover/10 rounded-lg border border-card-hover/20">
      <div className="font-semibold text-primary mb-2">
        {fretboard.name || 'Fretboard Diagram'}
      </div>
      
      {fretboard.description && (
        <div className="text-sm text-text-secondary mb-3">
          {fretboard.description}
        </div>
      )}
      
      {renderFretboard()}
      
      {fretboard.notes && fretboard.notes.some(n => n.label) && (
        <div className="mt-3 text-xs text-text-secondary">
          <div className="font-medium mb-1">Legend:</div>
          <div className="flex flex-wrap gap-2">
            {fretboard.notes.filter(n => n.label).map((note, i) => (
              <div key={i} className="flex items-center">
                <span 
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: note.color || 'var(--color-primary)' }}
                ></span>
                <span>{note.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FretboardDiagram;
