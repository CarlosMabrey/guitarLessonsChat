import React from 'react';
import { clsx } from 'clsx';

const FRETS = 5; // Number of frets to display
const STRINGS = 6; // Number of strings on the guitar

export default function ChordDiagram({ 
  name, 
  positions,
  fingerings,
  baseFret = 1,
  barres = [],
  className,
  showFingerNumbers = true,
  ...props 
}) {
  // Strings are numbered from right to left (6th string to 1st string)
  // Frets are numbered from top to bottom (1st fret to 5th fret)
  
  return (
    <div className={clsx('flex flex-col items-center', className)} {...props}>
      <div className="text-sm font-medium mb-2">{name}</div>
      
      <div className="relative w-20 h-28">
        {/* Nut or fret number indicator */}
        {baseFret === 1 ? (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-text-primary rounded-sm" />
        ) : (
          <div className="absolute -top-6 -left-6 text-xs text-text-secondary">
            {baseFret}fr
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
        {positions.map((position, stringIndex) => {
          // Skip if position is -1 (muted) or 0 (open)
          if (position < 1) {
            // X for muted string
            if (position === -1) {
              return (
                <div 
                  key={`mute-${stringIndex}`}
                  className="absolute top-[-10px] w-3 h-3 flex items-center justify-center"
                  style={{ left: `${(STRINGS - stringIndex - 1) * 20}%` }}
                >
                  <span className="text-xs text-danger">✕</span>
                </div>
              );
            }
            // Circle for open string
            if (position === 0) {
              return (
                <div 
                  key={`open-${stringIndex}`}
                  className="absolute top-[-10px] w-3 h-3 flex items-center justify-center"
                  style={{ left: `${(STRINGS - stringIndex - 1) * 20}%` }}
                >
                  <div className="w-2 h-2 rounded-full border border-text-primary"></div>
                </div>
              );
            }
          }
          
          // Offset by baseFret
          const fretPosition = position - baseFret + 1;
          
          // Only show positions that are within the displayed fret range
          if (fretPosition >= 1 && fretPosition <= FRETS) {
            return (
              <div 
                key={`pos-${stringIndex}`}
                className="absolute w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                style={{
                  left: `calc(${(STRINGS - stringIndex - 1) * 20}% - 7px)`,
                  top: `calc(${(fretPosition - 0.5) * 20}% - 7px)`
                }}
              >
                {showFingerNumbers && fingerings && fingerings[stringIndex] > 0 && (
                  <span className="text-[10px] text-white font-medium">
                    {fingerings[stringIndex]}
                  </span>
                )}
              </div>
            );
          }
          
          return null;
        })}
        
        {/* Barres (if any) */}
        {barres.map((barre, i) => {
          // Offset by baseFret
          const fretPosition = barre.fret - baseFret + 1;
          
          // Only show barres that are within the displayed fret range
          if (fretPosition >= 1 && fretPosition <= FRETS) {
            const fromString = STRINGS - barre.toString;
            const toString = STRINGS - barre.fromString;
            const width = (toString - fromString) * 20 + '%';
            
            return (
              <div 
                key={`barre-${i}`}
                className="absolute h-3 rounded-full bg-primary opacity-90"
                style={{
                  left: `${fromString * 20}%`,
                  top: `calc(${(fretPosition - 0.5) * 20}% - 6px)`,
                  width: width
                }}
              />
            );
          }
          
          return null;
        })}
      </div>
    </div>
  );
} 