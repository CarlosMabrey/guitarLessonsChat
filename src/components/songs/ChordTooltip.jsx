'use client';

import { useState, useMemo, useEffect } from 'react';
import * as Tonal from 'tonal';
import VoicingDisplay from '@/components/fretboard/VoicingDisplay';
import { chordVoicings } from '@/lib/musicTheory';
import { adaptVoicingsToTuning } from '@/lib/tuningUtils';

const parseChordName = (chordName) => {
  try {
    // Try to parse the chord to get root and type
    const parsed = Tonal.Chord.tokenize(chordName);
    if (!parsed || !parsed[0]) return null;
    
    return {
      root: parsed[0],
      type: parsed[1] || 'M', // Default to major if no type specified
      bass: parsed[2]
    };
  } catch (e) {
    console.error('Error parsing chord name:', e);
    return null;
  }
};

const getVoicingsForChord = (chordName) => {
  const parsed = parseChordName(chordName);
  if (!parsed) return [];

  // Look up voicings for this chord
  const voicingKey = `${parsed.root}-${parsed.type}`;
  const standardVoicings = chordVoicings[voicingKey] || [];
  
  // Adapt voicings to standard tuning
  return adaptVoicingsToTuning(standardVoicings, 'Standard', 'Standard');
};

const ChordTooltip = ({ chord, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [voicings, setVoicings] = useState([]);
  const [currentVoicingIndex, setCurrentVoicingIndex] = useState(0);
  
  // Load voicings when chord changes
  useEffect(() => {
    const chordVoicings = getVoicingsForChord(chord);
    setVoicings(chordVoicings);
    setCurrentVoicingIndex(0);
  }, [chord]);
  
  // Handle cycling through voicings
  const nextVoicing = () => {
    setCurrentVoicingIndex((prev) => (prev + 1) % voicings.length);
  };
  
  const prevVoicing = () => {
    setCurrentVoicingIndex((prev) => (prev - 1 + voicings.length) % voicings.length);
  };

  return (
    <div className="relative inline-block">
      <div 
        className="inline-block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </div>
      
      {isHovered && voicings.length > 0 && (
        <div 
          className="absolute z-50 mt-2 w-72 p-4 bg-card border border-border rounded-lg shadow-xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center">
            <div className="text-lg font-bold mb-2 text-center">{chord}</div>
            <div className="w-full relative">
              {/* Navigation arrows if multiple voicings */}
              {voicings.length > 1 && (
                <>
                  <button 
                    onClick={prevVoicing}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white"
                    aria-label="Previous voicing"
                  >
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button 
                    onClick={nextVoicing}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white"
                    aria-label="Next voicing"
                  >
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </>
              )}
              
              <VoicingDisplay 
                chordName={chord}
                chordRoot={chord}
                chordType=""
                selectedVoicings={voicings}
                currentVoicingIndex={currentVoicingIndex}
                size="lg"
                className="w-full"
                isFullView={false}
                showName={false}
              />
              
              {voicings.length > 1 && (
                <div className="text-xs text-center text-gray-400 mt-1">
                  {voicings[currentVoicingIndex]?.name || `Voicing ${currentVoicingIndex + 1} of ${voicings.length}`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChordTooltip;
