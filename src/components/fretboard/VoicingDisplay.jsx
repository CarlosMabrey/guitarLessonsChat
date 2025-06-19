import React, { useMemo } from 'react';
import * as Tonal from 'tonal';
import { useTheme } from '@/components/ui/ThemeContext';

// Utility: Calculate dynamic fret range for a voicing
function getFretRange(frets) {
  const used = frets
    .map(f => (f !== 'x' && f !== 0 && f !== '0') ? parseInt(f, 10) : null)
    .filter(f => f !== null);
  if (used.length === 0) return { start: 1, end: 5 };
  const min = Math.min(...used);
  const max = Math.max(...used);
  // Always show at least 4 frets
  const start = min > 1 ? min : 1;
  const end = Math.max(max, start + 3);
  return { start, end };
}

const VoicingDisplay = ({ 
  selectedVoicings, 
  currentVoicingIndex, 
  chordRoot, 
  chordType, 
  chordName,
  voicingObject,
  onNext, 
  onPrevious,
  playChord,
  isFullView = false,
  size = 'md',
  showName = true,
  ...props
}) => {
  const { theme } = useTheme();
  
  const isGlassmorphism = theme.includes('glassmorphism');
  const darkMode = theme !== 'light-minimal';
  
  // No voicings to display
  if (!selectedVoicings || selectedVoicings.length === 0) {
    return null;
  }

  // Determine voicing to display
  let voicing;
  if (voicingObject) {
    voicing = voicingObject;
  } else if (selectedVoicings && selectedVoicings.length > 0) {
    voicing = selectedVoicings[currentVoicingIndex] || selectedVoicings[0];
  } else {
    voicing = null;
  }
  if (!voicing) return null;

  // Dynamic fret range
  const { start: startFret, end: endFret } = getFretRange(voicing.frets);
  const fretCount = endFret - startFret + 1;
  const stringCount = voicing.frets.length;

  // Sizing
  const stringSpacing = 180 / (stringCount - 1);
  const fretSpacing = (200 - 40) / fretCount;

  // Get notes from the voicing
  const getVoicingNotes = () => {
    const result = [];
    
    // Guitar strings in standard tuning from low E (6th string) to high E (1st string)
    const openStringNotes = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
    
    // Process each string (from low to high as they appear in the UI)
    voicing.frets.forEach((fret, stringIdx) => {
      // Skip if string not played
      if (fret === 'x') return;
      
      // Get open string note based on string index (from low E to high E)
      const openNote = openStringNotes[stringIdx];
      
      // If open string
      if (fret === 0) {
        result.push(openNote);
      } 
      // Fretted note
      else {
        // Transpose from open string note
        const semitones = parseInt(fret, 10);
        const note = Tonal.Note.transpose(openNote, `${semitones}m`);
        result.push(note);
      }
    });
    
    return result;
  };

  // Handle playing the current voicing
  const handlePlayVoicing = () => {
    if (!playChord) return;
    
    const notes = getVoicingNotes();
    if (notes.length > 0) {
      playChord(notes, true, 2);
    }
  };

  // Larger sizing for the full view mode
  const diagramSize = isFullView ? 'w-52 h-52' : 'w-28 h-28';
  const containerClass = isFullView 
    ? `${isGlassmorphism 
        ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-glow-sm' 
        : `${darkMode ? 'bg-gray-800/95' : 'bg-gray-100'} border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`
      } rounded-lg overflow-hidden shadow-lg transition-all duration-300`
    : `mt-3 ${isGlassmorphism 
        ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-glow-sm' 
        : `${darkMode ? 'bg-gray-800/90' : 'bg-gray-100'} border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`
      } rounded-lg overflow-hidden shadow-lg transition-all duration-300`;

  return (
    <div className={`${containerClass} p-3 w-fit mx-auto flex flex-col items-center`}>
      <div className="flex items-center justify-between w-full mb-2">
        <div className="text-white font-semibold text-xl">
          {chordRoot}{chordType} {voicing.name && <span className="text-gray-300 font-normal">- {voicing.name}</span>}
        </div>
        <div className="flex items-center space-x-2">
          {selectedVoicings && selectedVoicings.length > 1 && (
            <button
              onClick={onPrevious}
              className="p-1.5 rounded-full bg-blue-600/80 hover:bg-blue-600/90 text-white transition-colors duration-200"
              aria-label="Previous voicing"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </button>
          )}
          <button 
            onClick={handlePlayVoicing}
            className="px-3 py-1.5 rounded-full bg-blue-600/80 hover:bg-blue-600/90 text-white font-medium transition-all duration-200 shadow-lg flex items-center space-x-1"
          >
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </span>
            <span>Play</span>
          </button>
          {selectedVoicings && selectedVoicings.length > 1 && (
            <button
              onClick={onNext}
              className="p-1.5 rounded-full bg-blue-600/80 hover:bg-blue-600/90 text-white transition-colors duration-200"
              aria-label="Next voicing"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {/* Chord diagram grid */}
      <div className="relative mt-4" style={{ width: 180, height: 200 }}>
        {/* Nut or fret number */}
        {startFret === 1 ? (
          <div className="absolute left-0 right-0 top-0 h-2 bg-gray-200 rounded-sm" style={{ zIndex: 2 }} />
        ) : (
          <div className="absolute right-[-28px] top-6 text-xs text-gray-400">{startFret}fr</div>
        )}
        {/* Grid lines */}
        {/* Strings */}
        {Array.from({ length: stringCount }).map((_, i) => (
          <div
            key={`string-${i}`}
            className="absolute top-2"
            style={{
              left: `${i * stringSpacing}px`,
              width: '2px',
              height: 180,
              background: '#3b4252',
              borderRadius: '1px',
              zIndex: 1,
            }}
          />
        ))}
        {/* Frets */}
        {Array.from({ length: fretCount + 1 }).map((_, i) => (
          <div
            key={`fret-${i}`}
            className="absolute left-0 right-0"
            style={{
              top: `${i * fretSpacing + 2}px`,
              height: '2px',
              background: '#3b4252',
              borderRadius: '1px',
              zIndex: 1,
            }}
          />
        ))}
        {/* Muted and finger dots */}
        {voicing.frets.map((fret, i) => {
          // Muted string
          if (fret === 'x') {
            return (
              <div
                key={`mute-${i}`}
                className="absolute"
                style={{
                  left: `${i * stringSpacing - 10}px`,
                  top: '-18px',
                  zIndex: 3,
                }}
              >
                <span className="text-red-500 text-lg font-bold">x</span>
              </div>
            );
          }
          // Only show finger dots for fretted notes
          if (typeof fret === 'number' && fret > 0) {
            const fretNum = parseInt(fret, 10);
            // Only show if in visible range
            if (fretNum >= startFret && fretNum < startFret + fretCount) {
              const y = (fretNum - startFret + 0.5) * fretSpacing + 2;
              return (
                <div
                  key={`dot-${i}`}
                  className="absolute flex items-center justify-center animate-pulse"
                  style={{
                    left: `${i * stringSpacing - 18}px`,
                    top: `${y - 18}px`,
                    width: 36,
                    height: 36,
                    zIndex: 4,
                  }}
                >
                  <div className="bg-purple-500 rounded-full w-9 h-9 flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">
                      {voicing.fingers && voicing.fingers[i] && voicing.fingers[i] !== 'x' ? voicing.fingers[i] : ''}
                    </span>
                  </div>
                </div>
              );
            }
          }
          // Open string dot (fret 0)
          if (fret === 0 || fret === '0') {
            const y = (0 - startFret + 0.5) * fretSpacing + 2;
            return (
              <div
                key={`open-${i}`}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${i * stringSpacing - 18}px`,
                  top: '-18px',
                  width: 36,
                  height: 36,
                  zIndex: 3,
                }}
              >
                <div className="bg-purple-500 rounded-full w-9 h-9 flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">O</span>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
      {showName && selectedVoicings && selectedVoicings.length > 0 && (
        <div className="text-gray-400 text-sm mt-2">
          {currentVoicingIndex + 1} of {selectedVoicings.length} voicings
        </div>
      )}
    </div>
  );
};

export default VoicingDisplay; 