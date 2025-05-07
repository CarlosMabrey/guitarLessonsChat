'use client';

import { useState } from 'react';
import { FiInfo, FiPlay } from 'react-icons/fi';

// Mapping of chord names to finger positions
// Format: [string, fret] - strings are from thickest (6) to thinnest (1)
// fret 0 = open, -1 = don't play
const chordPositions = {
  'A': [[-1, 0, 2, 2, 2, 0]],
  'Am': [[-1, 0, 2, 2, 1, 0]],
  'B': [[-1, 2, 4, 4, 4, 2]],
  'Bm': [[-1, 2, 4, 4, 3, 2]],
  'C': [[-1, 3, 2, 0, 1, 0]],
  'D': [[-1, -1, 0, 2, 3, 2]],
  'Dm': [[-1, -1, 0, 2, 3, 1]],
  'E': [[0, 2, 2, 1, 0, 0]],
  'Em': [[0, 2, 2, 0, 0, 0]],
  'F': [[1, 3, 3, 2, 1, 1]],
  'G': [[3, 2, 0, 0, 0, 3]],
  'A7': [[-1, 0, 2, 0, 2, 0]],
  'D7': [[-1, -1, 0, 2, 1, 2]],
  'E7': [[0, 2, 0, 1, 0, 0]],
  'G7': [[3, 2, 0, 0, 0, 1]],
  'F#': [[2, 4, 4, 3, 2, 2]],
};

const fingerColors = {
  1: 'bg-blue-500',
  2: 'bg-green-500',
  3: 'bg-yellow-500',
  4: 'bg-purple-500',
};

export default function ChordDiagram({ chordName, size = "medium" }) {
  const [variationIndex, setVariationIndex] = useState(0);
  
  // Find chord data or show placeholder
  const positions = chordPositions[chordName] || [[-1, -1, -1, -1, -1, -1]];
  const currentPosition = positions[variationIndex] || positions[0];
  
  // Define dimensions based on size
  let cellSize, fontSize, dotSize;
  switch (size) {
    case "small":
      cellSize = 6;
      fontSize = "text-xs";
      dotSize = "w-4 h-4";
      break;
    case "large":
      cellSize = 14;
      fontSize = "text-lg";
      dotSize = "w-8 h-8";
      break;
    case "medium":
    default:
      cellSize = 10;
      fontSize = "text-sm";
      dotSize = "w-6 h-6";
  }
  
  // Create a simple fingering visualization
  const getFingerNumber = (stringIndex, fret) => {
    if (fret <= 0) return null;
    
    // Simple algorithm to determine finger number
    // This is a simplified approach - real fingering would be more complex
    const lowestFret = currentPosition.filter(f => f > 0).sort((a, b) => a - b)[0] || 1;
    
    if (fret === lowestFret) return 1;
    if (fret === lowestFret + 1) return 2;
    if (fret === lowestFret + 2) return 3;
    return 4;
  };
  
  const handlePlayChord = () => {
    // In a real app, this would play the chord sound
    console.log(`Playing ${chordName} chord`);
  };
  
  return (
    <div className="inline-flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-1">
        <span className={`font-bold ${fontSize === 'text-xs' ? 'text-sm' : fontSize}`}>
          {chordName}
        </span>
        {positions.length > 1 && (
          <button 
            onClick={() => setVariationIndex((variationIndex + 1) % positions.length)} 
            className="text-blue-500 hover:text-blue-700"
          >
            <FiInfo size={size === "small" ? 14 : 16} />
          </button>
        )}
      </div>
      
      <div className="bg-white border rounded shadow-sm">
        {/* Chord Diagram */}
        <div className="relative" style={{ 
          width: `${cellSize * 5 + 20}px`, 
          height: `${cellSize * 5 + 20}px` 
        }}>
          {/* Strings */}
          {[0, 1, 2, 3, 4, 5].map((stringIndex) => (
            <div 
              key={`string-${stringIndex}`} 
              className="absolute bg-gray-400" 
              style={{
                left: `${10 + stringIndex * cellSize}px`,
                top: '10px',
                width: '1px',
                height: `${cellSize * 5}px`,
              }}
            />
          ))}
          
          {/* Frets */}
          {[0, 1, 2, 3, 4, 5].map((fretIndex) => (
            <div 
              key={`fret-${fretIndex}`} 
              className={`absolute left-[10px] right-[10px] h-[1px] ${fretIndex === 0 ? 'bg-gray-800 h-[2px]' : 'bg-gray-400'}`} 
              style={{
                top: `${10 + fretIndex * cellSize}px`,
              }}
            />
          ))}
          
          {/* Finger positions */}
          {currentPosition.map((fret, stringIndex) => {
            // Skip if not played
            if (fret === -1) {
              return (
                <div 
                  key={`marker-${stringIndex}`} 
                  className="absolute flex items-center justify-center text-red-500"
                  style={{
                    left: `${10 + stringIndex * cellSize - 2}px`,
                    top: '0px',
                    width: '5px',
                    height: '8px',
                  }}
                >
                  ×
                </div>
              );
            }
            
            // Open string
            if (fret === 0) {
              return (
                <div 
                  key={`marker-${stringIndex}`} 
                  className="absolute flex items-center justify-center" 
                  style={{
                    left: `${10 + stringIndex * cellSize - 4}px`,
                    top: '0px',
                    width: '8px',
                    height: '8px',
                  }}
                >
                  <div className="rounded-full border border-gray-800 w-3 h-3" />
                </div>
              );
            }
            
            // Fingered note
            const fingerNumber = getFingerNumber(stringIndex, fret);
            const colorClass = fingerNumber ? fingerColors[fingerNumber] || 'bg-blue-500' : 'bg-blue-500';
            
            return (
              <div 
                key={`marker-${stringIndex}`} 
                className={`absolute flex items-center justify-center ${dotSize} ${colorClass} text-white rounded-full`}
                style={{
                  left: `${10 + stringIndex * cellSize - (size === "small" ? 5 : 9)}px`,
                  top: `${10 + (fret - 0.5) * cellSize - (size === "small" ? 5 : 9)}px`,
                }}
              >
                {fingerNumber && size !== "small" ? fingerNumber : ''}
              </div>
            );
          })}
        </div>
      </div>
      
      <button 
        onClick={handlePlayChord}
        className="mt-2 flex items-center justify-center text-xs text-blue-600 hover:text-blue-800"
      >
        <FiPlay className="mr-1" size={14} />
        <span>Play</span>
      </button>
    </div>
  );
} 