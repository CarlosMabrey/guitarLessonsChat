'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

const FRETS = 5; // Number of frets to display
const STRINGS = 6; // Number of strings on the guitar

const CHORD_LIBRARY = {
  // Major chords
  'A': { positions: [[-1, 0, 2, 2, 2, 0]], frets: [0, 2], fingers: [[-1, 0, 1, 2, 3, 0]] },
  'Am': { positions: [[-1, 0, 2, 2, 1, 0]], frets: [0, 2], fingers: [[-1, 0, 2, 3, 1, 0]] },
  'B': { positions: [[-1, 2, 4, 4, 4, 2]], frets: [2, 4], fingers: [[-1, 1, 2, 3, 4, 1]] },
  'Bm': { positions: [[-1, 2, 4, 4, 3, 2]], frets: [2, 4], fingers: [[-1, 1, 3, 4, 2, 1]] },
  'C': { positions: [[-1, 3, 2, 0, 1, 0]], frets: [0, 3], fingers: [[-1, 3, 2, 0, 1, 0]] },
  'Cm': { positions: [[-1, 3, 5, 5, 4, 3]], frets: [3, 5], fingers: [[-1, 1, 3, 4, 2, 1]] },
  'D': { positions: [[-1, -1, 0, 2, 3, 2]], frets: [0, 3], fingers: [[-1, -1, 0, 1, 3, 2]] },
  'Dm': { positions: [[-1, -1, 0, 2, 3, 1]], frets: [0, 3], fingers: [[-1, -1, 0, 2, 3, 1]] },
  'E': { positions: [[0, 2, 2, 1, 0, 0]], frets: [0, 2], fingers: [[0, 2, 3, 1, 0, 0]] },
  'Em': { positions: [[0, 2, 2, 0, 0, 0]], frets: [0, 2], fingers: [[0, 2, 3, 0, 0, 0]] },
  'F': { positions: [[1, 3, 3, 2, 1, 1]], frets: [1, 3], fingers: [[1, 3, 4, 2, 1, 1]] },
  'Fm': { positions: [[1, 3, 3, 1, 1, 1]], frets: [1, 3], fingers: [[1, 3, 4, 1, 1, 1]] },
  'G': { positions: [[3, 2, 0, 0, 0, 3]], frets: [0, 3], fingers: [[2, 1, 0, 0, 0, 3]] },
  'Gm': { positions: [[3, 5, 5, 3, 3, 3]], frets: [3, 5], fingers: [[1, 3, 4, 1, 1, 1]] },
  
  // Seventh chords
  'A7': { positions: [[-1, 0, 2, 0, 2, 0]], frets: [0, 2], fingers: [[-1, 0, 2, 0, 3, 0]] },
  'B7': { positions: [[-1, 2, 1, 2, 0, 2]], frets: [0, 2], fingers: [[-1, 2, 1, 3, 0, 4]] },
  'C7': { positions: [[-1, 3, 2, 3, 1, 0]], frets: [0, 3], fingers: [[-1, 3, 2, 4, 1, 0]] },
  'D7': { positions: [[-1, -1, 0, 2, 1, 2]], frets: [0, 2], fingers: [[-1, -1, 0, 3, 1, 2]] },
  'E7': { positions: [[0, 2, 0, 1, 0, 0]], frets: [0, 2], fingers: [[0, 2, 0, 1, 0, 0]] },
  'F7': { positions: [[1, 3, 1, 2, 1, 1]], frets: [1, 3], fingers: [[1, 3, 1, 2, 1, 1]] },
  'G7': { positions: [[3, 2, 0, 0, 0, 1]], frets: [0, 3], fingers: [[3, 2, 0, 0, 0, 1]] },

  // Add more chord definitions as needed
};

export default function ChordDiagram({ 
  chord,
  size = 'md',
  showName = true,
  onClick,
  className,
  ...props 
}) {
  const [chordData, setChordData] = useState(null);
  const [positionIndex, setPositionIndex] = useState(0);
  
  useEffect(() => {
    // Look up the chord in our library
    const data = CHORD_LIBRARY[chord];
    
    if (data) {
      setChordData(data);
    } else {
      // For chords not in our library, create a blank diagram
      setChordData({
        positions: [[-1, -1, -1, -1, -1, -1]],
        frets: [0, 3],
        fingers: [[-1, -1, -1, -1, -1, -1]]
      });
    }
  }, [chord]);
  
  if (!chordData) return null;

  // Determine dimensions based on size
  let width, height, fontSize, dotSize, textY;
  switch (size) {
    case 'sm':
      width = 60;
      height = 70;
      fontSize = 10;
      dotSize = 6;
      textY = 65;
      break;
    case 'lg':
      width = 120;
      height = 140;
      fontSize = 16;
      dotSize = 14;
      textY = 135;
      break;
    case 'md':
    default:
      width = 80;
      height = 100;
      fontSize = 12;
      dotSize = 10;
      textY = 95;
  }

  // Calculate positions
  const stringSpacing = width / (STRINGS - 1);
  const fretSpacing = (height - 20) / FRETS;
  const startFret = chordData.frets[0];
  const endFret = chordData.frets[1];
  const fretRange = endFret - startFret + 1;
  
  // Get the current chord position
  const currentPosition = chordData.positions[positionIndex] || chordData.positions[0];
  const currentFingers = chordData.fingers ? chordData.fingers[positionIndex] || chordData.fingers[0] : null;

  return (
    <div 
      className={clsx('flex flex-col items-center', className)}
      onClick={onClick}
    >
      <div className="text-sm font-medium mb-2">{chord}</div>
      
      <div className="relative w-20 h-28">
        {/* Nut or fret number indicator */}
        {startFret === 1 ? (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-text-primary rounded-sm" />
        ) : (
          <div className="absolute -top-6 -left-6 text-xs text-text-secondary">
            {startFret}fr
          </div>
        )}
        
        {/* Strings */}
        <div className="absolute top-0 left-0 w-full h-full flex justify-between">
          {Array.from({ length: STRINGS }).map((_, i) => (
            <div 
              key={`string-${i}`} 
              className="w-0.5 h-full bg-text-secondary"
            />
          ))}
        </div>
        
        {/* Frets */}
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between">
          {Array.from({ length: FRETS }).map((_, i) => (
            <div 
              key={`fret-${i}`} 
              className="w-full h-0.5 bg-text-secondary"
            />
          ))}
        </div>
        
        {/* String positions indicators */}
        {currentPosition.map((pos, i) => {
          // Skip strings that aren't played (value = -1)
          if (pos === -1) {
            return (
              <div 
                key={`string-${i}-notplayed`}
                className="absolute top-[-10px] w-3 h-3 flex items-center justify-center"
                style={{ left: `${(STRINGS - i - 1) * stringSpacing}%` }}
              >
                <span className="text-xs text-danger">✕</span>
              </div>
            );
          }
          
          // For open strings (value = 0)
          if (pos === 0) {
            return (
              <div 
                key={`string-${i}-open`}
                className="absolute top-[-10px] w-3 h-3 flex items-center justify-center"
                style={{ left: `${(STRINGS - i - 1) * stringSpacing}%` }}
              >
                <div className="w-2 h-2 rounded-full border border-text-primary"></div>
              </div>
            );
          }
          
          // For fretted positions
          // Adjust for the visible fret range
          if (pos >= startFret && pos <= endFret) {
            const adjustedPos = pos - startFret;
            
            return (
              <div 
                key={`string-${i}-pos-${pos}`}
                className="absolute w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                style={{
                  left: `calc(${(STRINGS - i - 1) * stringSpacing}% - 7px)`,
                  top: `calc(${(adjustedPos - 0.5) * fretSpacing}% - 7px)`
                }}
              >
                {currentFingers && currentFingers[i] > 0 && (
                  <span className="text-[10px] text-white font-medium">
                    {currentFingers[i]}
                  </span>
                )}
              </div>
            );
          }
          
          return null;
        })}
      </div>
    </div>
  );
} 