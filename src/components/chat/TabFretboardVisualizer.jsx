import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

/**
 * TabFretboardVisualizer component
 * Visualizes tab content on a fretboard diagram
 */
const TabFretboardVisualizer = ({ tabContent, currentPosition = 0 }) => {
  const [fretboardNotes, setFretboardNotes] = useState([]);
  const [startFret, setStartFret] = useState(0);
  const [endFret, setEndFret] = useState(12);
  
  // Standard tuning strings (from bottom to top)
  const strings = ['E', 'A', 'D', 'G', 'B', 'e'];
  
  // Parse tab content to extract notes
  useEffect(() => {
    if (!tabContent || !Array.isArray(tabContent)) return;
    
    // Parse tab lines to extract notes and their positions
    const parsedNotes = [];
    
    // Clean and standardize tab lines
    const cleanedLines = tabContent.map(line => {
      if (typeof line !== 'string') return '';
      // Remove any non-tab content
      return line.replace(/^[^|]*\|/, '|').replace(/\|[^|]*$/, '|');
    }).filter(Boolean);
    
    // Only proceed if we have enough lines for a guitar tab (usually 6 strings)
    if (cleanedLines.length < 4 || cleanedLines.length > 6) return;
    
    // Extract notes from each string
    cleanedLines.forEach((line, stringIndex) => {
      // Match all fret numbers in the line
      const fretMatches = [...line.matchAll(/(\d+)/g)];
      
      fretMatches.forEach(match => {
        const fretNumber = parseInt(match[0], 10);
        const position = match.index;
        
        // Calculate approximate position in the tab
        const relativePosition = position / line.length;
        
        parsedNotes.push({
          string: stringIndex,
          fret: fretNumber,
          position: relativePosition,
          isActive: false // Will be set based on currentPosition
        });
      });
    });
    
    // Find the range of frets used in the tab
    if (parsedNotes.length > 0) {
      const frets = parsedNotes.map(note => note.fret);
      const minFret = Math.max(0, Math.min(...frets) - 1);
      const maxFret = Math.min(24, Math.max(...frets) + 1);
      
      setStartFret(minFret);
      setEndFret(maxFret);
    }
    
    setFretboardNotes(parsedNotes);
  }, [tabContent]);
  
  // Update active notes based on current position
  useEffect(() => {
    if (fretboardNotes.length === 0) return;
    
    const updatedNotes = fretboardNotes.map(note => {
      // Mark notes as active if they're close to the current position
      // This is an approximation since we don't have exact timing information
      const isActive = Math.abs(note.position - currentPosition) < 0.05;
      return { ...note, isActive };
    });
    
    setFretboardNotes(updatedNotes);
  }, [currentPosition, fretboardNotes.length]);
  
  // Calculate fretboard dimensions
  const fretCount = endFret - startFret + 1;
  
  // Generate fret markers (dots at frets 3, 5, 7, 9, 12, etc.)
  const getFretMarkers = () => {
    const markers = [];
    const standardMarkers = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
    
    for (let i = startFret; i <= endFret; i++) {
      if (standardMarkers.includes(i)) {
        markers.push(i);
      }
    }
    
    return markers;
  };
  
  const fretMarkers = getFretMarkers();
  
  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="fretboard-container min-w-full" style={{ minWidth: `${fretCount * 40}px` }}>
        {/* Fret numbers */}
        <div className="flex mb-2">
          <div className="w-8 text-center"></div>
          {Array.from({ length: fretCount }).map((_, index) => (
            <div key={`fret-num-${index}`} className="w-10 text-center text-xs text-text-secondary">
              {startFret + index}
            </div>
          ))}
        </div>
        
        {/* Strings and frets */}
        <div className="relative">
          {/* Fret markers (dots) */}
          <div className="absolute w-full h-full pointer-events-none">
            {fretMarkers.map(fret => (
              <div 
                key={`marker-${fret}`} 
                className={clsx(
                  "absolute top-1/2 transform -translate-y-1/2",
                  "w-4 h-4 rounded-full bg-card-hover/20",
                  fret === 12 || fret === 24 ? "before:content-[''] before:absolute before:top-[-20px] before:left-0 before:w-4 before:h-4 before:rounded-full before:bg-card-hover/20" : ""
                )}
                style={{ 
                  left: `${((fret - startFret) * 40) + 24}px`,
                }}
              />
            ))}
          </div>
          
          {/* Strings */}
          {strings.map((string, stringIndex) => (
            <div key={`string-${stringIndex}`} className="flex items-center mb-4">
              {/* String name */}
              <div className="w-8 text-center text-sm font-medium text-text-secondary">
                {string}
              </div>
              
              {/* Frets */}
              <div className="flex flex-1">
                {Array.from({ length: fretCount }).map((_, fretIndex) => {
                  const currentFret = startFret + fretIndex;
                  
                  // Find any notes on this string and fret
                  const notesHere = fretboardNotes.filter(
                    note => note.string === stringIndex && note.fret === currentFret
                  );
                  
                  const hasActiveNote = notesHere.some(note => note.isActive);
                  
                  return (
                    <div 
                      key={`fret-${stringIndex}-${fretIndex}`} 
                      className={clsx(
                        "w-10 h-6 border-r border-card-hover/50 relative",
                        fretIndex === 0 && "border-l"
                      )}
                    >
                      {/* String line */}
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-text-tertiary/50" />
                      
                      {/* Note marker */}
                      {notesHere.length > 0 && (
                        <div 
                          className={clsx(
                            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                            "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                            hasActiveNote 
                              ? "bg-primary text-white shadow-md shadow-primary/30" 
                              : "bg-primary/20 text-primary"
                          )}
                        >
                          {currentFret}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabFretboardVisualizer;
