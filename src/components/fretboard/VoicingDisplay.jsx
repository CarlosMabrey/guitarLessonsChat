import React from 'react';
import * as Tonal from 'tonal';
import { useTheme } from '@/components/ui/ThemeContext';

const VoicingDisplay = ({ 
  selectedVoicings, 
  currentVoicingIndex, 
  chordRoot, 
  chordType, 
  onNext, 
  onPrevious,
  playChord,
  isFullView = false,
}) => {
  const { theme } = useTheme();
  
  const isGlassmorphism = theme.includes('glassmorphism');
  const darkMode = theme !== 'light-minimal';
  
  // No voicings to display
  if (!selectedVoicings || selectedVoicings.length === 0) {
    return null;
  }

  const currentVoicing = selectedVoicings[currentVoicingIndex];
  
  // Get notes from the voicing
  const getVoicingNotes = () => {
    // Get the chord notes in the right order
    const chordNotes = Tonal.Chord.getChord(chordType, chordRoot).notes;
    const result = [];
    
    // For each string position
    currentVoicing.frets.forEach((fret, stringIndex) => {
      // Skip if string not played
      if (fret === 'x') return;
      
      // Get open string note based on string index (high E to low E)
      const openStringNotes = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
      const openNote = openStringNotes[stringIndex];
      
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
    <div className={containerClass}>
      <div className={`flex justify-between items-center px-4 py-2 border-b ${isGlassmorphism ? 'border-gray-700/40' : (darkMode ? 'border-gray-700' : 'border-gray-300')}`}>
        <h3 className={`text-md font-semibold ${isGlassmorphism ? 'text-primary' : (darkMode ? 'text-yellow-300' : 'text-yellow-600')}`}>
          {chordRoot}{chordType} - {currentVoicing.name}
        </h3>

        <div className="flex items-center space-x-2">
          <button
            onClick={onPrevious}
            disabled={selectedVoicings.length <= 1}
            className={`p-1.5 rounded-full transition-colors duration-200 ${
              selectedVoicings.length > 1 
                ? `${isGlassmorphism 
                    ? 'bg-blue-600/80 hover:bg-blue-700/90 shadow-glow-xs shadow-blue-500/30' 
                    : 'bg-blue-600 hover:bg-blue-700'} text-white` 
                : `${isGlassmorphism 
                    ? 'bg-gray-700/50 text-gray-500/70' 
                    : `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-400'}`} cursor-not-allowed`
            }`}
            aria-label="Previous voicing"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className={`text-xs ${isGlassmorphism ? 'text-gray-300' : (darkMode ? 'text-gray-400' : 'text-gray-500')}`}>{currentVoicingIndex + 1}/{selectedVoicings.length}</span>
          <button
            onClick={onNext}
            disabled={selectedVoicings.length <= 1}
            className={`p-1.5 rounded-full transition-colors duration-200 ${
              selectedVoicings.length > 1 
                ? `${isGlassmorphism 
                    ? 'bg-blue-600/80 hover:bg-blue-700/90 shadow-glow-xs shadow-blue-500/30' 
                    : 'bg-blue-600 hover:bg-blue-700'} text-white` 
                : `${isGlassmorphism 
                    ? 'bg-gray-700/50 text-gray-500/70' 
                    : `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-400'}`} cursor-not-allowed`
            }`}
            aria-label="Next voicing"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className={`flex ${isFullView ? 'flex-col md:flex-row' : 'items-center'} p-3`}>
        {/* Chord diagram */}
        <div className={`${isGlassmorphism 
          ? 'bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 shadow-lg' 
          : `${darkMode ? 'bg-gray-900/70' : 'bg-white'}`} 
          p-3 rounded-md ${isFullView ? 'mb-4 md:mb-0 md:mr-6' : 'mr-4'} mx-auto transition-all duration-300`}>
          <div className={`relative ${diagramSize}`}>
            {/* Strings */}
            <div className="flex justify-between h-full">
              {[0, 1, 2, 3, 4, 5].map((stringIdx) => (
                <div key={stringIdx} className={`w-0.5 ${isGlassmorphism ? 'bg-gray-500/80' : (darkMode ? 'bg-gray-500' : 'bg-gray-400')} h-full`}></div>
              ))}
            </div>
            
            {/* Frets (horizontal lines) */}
            {[0, 1, 2, 3, 4].map((fretIdx) => (
              <div 
                key={fretIdx} 
                className={`absolute left-0 right-0 h-0.5 ${isGlassmorphism ? 'bg-gray-500/80' : (darkMode ? 'bg-gray-500' : 'bg-gray-400')}`}
                style={{ top: `${fretIdx * 25}%` }}
              >
                {/* Fret markers for orientation */}
                {fretIdx > 0 && fretIdx % 3 === 0 && (
                  <div className={`absolute -right-3 top-1/2 transform -translate-y-1/2 text-xs ${isGlassmorphism ? 'text-gray-400/90' : (darkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                    {fretIdx}
                  </div>
                )}
              </div>
            ))}
            
            {/* Finger positions */}
            {currentVoicing.frets.map((fret, stringIdx) => {
              const finger = currentVoicing.fingers?.[stringIdx] || '';
              
              // Skip if string is not played (x)
              if (fret === 'x') {
                return (
                  <div 
                    key={stringIdx}
                    className="absolute text-red-500 font-bold text-sm"
                    style={{ 
                      left: `${stringIdx * 20}%`, 
                      top: '-20px',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    ×
                  </div>
                );
              }
              
              // Handle open string (0)
              if (fret === 0) {
                return (
                  <div 
                    key={stringIdx}
                    className="absolute text-green-500 font-bold text-sm"
                    style={{ 
                      left: `${stringIdx * 20}%`, 
                      top: '-20px',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    ○
                  </div>
                );
              }
              
              // Calculate position - handle higher frets by clamping to visible diagram
              const fretNum = parseInt(fret, 10);
              const displayPosition = Math.min(fretNum, 4) - 0.5;
              
              // Handle regular fretted notes
              return (
                <div 
                  key={stringIdx}
                  className={`absolute ${isFullView ? 'w-9 h-9' : 'w-5 h-5'} ${isGlassmorphism 
                    ? 'bg-purple-600/80 shadow-glow-xs shadow-purple-500/30'
                    : 'bg-purple-600'} rounded-full flex items-center justify-center ${isFullView ? 'text-sm' : 'text-xs'} text-white transition-all duration-300`}
                  style={{ 
                    left: `${stringIdx * 20}%`, 
                    top: `${displayPosition * 25}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {finger || ''}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Voicing details */}
        <div className="flex-1">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <span className={`text-xs ${isGlassmorphism ? 'text-gray-300' : (darkMode ? 'text-gray-400' : 'text-gray-500')} w-16`}>Strings:</span>
              <div className="flex gap-2">
                {currentVoicing.frets.map((fret, idx) => (
                  <span key={idx} className={`${isGlassmorphism 
                    ? 'bg-gray-700/50 backdrop-blur-xs border border-gray-600/30' 
                    : `${darkMode ? 'bg-gray-700/80' : 'bg-gray-200'}`} 
                    px-2 py-0.5 rounded text-xs ${darkMode ? 'text-white' : 'text-gray-700'} font-mono transition-colors duration-200`}
                  >
                    {fret}
                  </span>
                ))}
              </div>
            </div>
            
            {currentVoicing.fingers && (
              <div className="flex items-center">
                <span className={`text-xs ${isGlassmorphism ? 'text-gray-300' : (darkMode ? 'text-gray-400' : 'text-gray-500')} w-16`}>Fingers:</span>
                <div className="flex gap-2">
                  {currentVoicing.fingers.map((finger, idx) => (
                    <span key={idx} className={`${isGlassmorphism 
                      ? 'bg-gray-700/50 backdrop-blur-xs border border-gray-600/30' 
                      : `${darkMode ? 'bg-gray-700/80' : 'bg-gray-200'}`} 
                      px-2 py-0.5 rounded text-xs ${darkMode ? 'text-white' : 'text-gray-700'} font-mono transition-colors duration-200`}
                    >
                      {finger}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              {playChord && (
                <button
                  onClick={handlePlayVoicing}
                  className={`px-3 py-1 rounded ${isGlassmorphism 
                    ? 'bg-indigo-600/80 hover:bg-indigo-700/90 shadow-glow-sm shadow-indigo-500/30' 
                    : 'bg-indigo-600 hover:bg-indigo-700'} 
                    text-white text-sm mt-2 flex items-center transition-all duration-200`}
                >
                  <span className="mr-1">🔊</span>
                  <span>Play Voicing</span>
                </button>
              )}
            </div>
            
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} italic mt-2`}>
              Finger positions are shown on the fretboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicingDisplay; 