import React, { useState } from 'react';
import * as Tonal from 'tonal';
import { useTheme } from '@/components/ui/ThemeContext';

// Common guitar scale patterns by position
const scalePatterns = {
  'major': [
    { name: 'Pattern 1 (E Shape)', startFret: 0, pattern: [
      [0, 2, 3, 5], // E string
      [0, 2, 3, 5], // B string
      [0, 2, 4], // G string
      [0, 2, 4, 5], // D string
      [0, 2, 3, 5], // A string
      [0, 2, 3, 5], // Low E string
    ], rootString: 5, rootFret: 0 },
    { name: 'Pattern 2 (D Shape)', startFret: 2, pattern: [
      [0, 2, 3], // E string
      [0, 2, 3, 5], // B string
      [0, 2, 4, 5], // G string
      [0, 2, 4], // D string
      [0, 2, 3, 5], // A string
      [0, 2, 3], // Low E string
    ], rootString: 3, rootFret: 0 },
    { name: 'Pattern 3 (C Shape)', startFret: 5, pattern: [
      [0, 2, 3, 5], // E string
      [0, 2, 3], // B string
      [0, 2, 4, 5], // G string
      [0, 2, 4, 5], // D string
      [0, 2, 4], // A string
      [0, 2, 3, 5], // Low E string
    ], rootString: 4, rootFret: 3 },
    { name: 'Pattern 4 (A Shape)', startFret: 7, pattern: [
      [0, 2, 3], // E string
      [0, 3, 5], // B string
      [0, 2, 4], // G string
      [0, 2, 3, 5], // D string
      [0, 2, 3, 5], // A string
      [0, 2, 3], // Low E string
    ], rootString: 4, rootFret: 0 },
    { name: 'Pattern 5 (G Shape)', startFret: 10, pattern: [
      [0, 2, 3, 5], // E string
      [0, 3], // B string
      [0, 2, 4, 5], // G string
      [0, 2, 4], // D string
      [0, 2, 3, 5], // A string
      [0, 2, 3, 5], // Low E string
    ], rootString: 5, rootFret: 3 },
  ],
  'minor': [
    { name: 'Pattern 1 (Em Shape)', startFret: 0, pattern: [
      [0, 2, 3, 5], // E string
      [0, 2, 3, 5], // B string
      [0, 2, 4], // G string
      [0, 2, 4, 5], // D string
      [0, 2, 3, 5], // A string
      [0, 2, 3, 5], // Low E string
    ], rootString: 5, rootFret: 0 },
    { name: 'Pattern 2 (Dm Shape)', startFret: 2, pattern: [
      [0, 1, 3], // E string
      [0, 2, 3, 5], // B string
      [0, 2, 3, 5], // G string
      [0, 2, 3], // D string
      [0, 2, 3, 5], // A string
      [0, 1, 3], // Low E string
    ], rootString: 3, rootFret: 0 },
    { name: 'Pattern 3 (Cm Shape)', startFret: 5, pattern: [
      [0, 1, 3, 5], // E string
      [0, 1, 3], // B string
      [0, 2, 3, 5], // G string
      [0, 2, 3, 5], // D string
      [0, 2, 3], // A string
      [0, 1, 3, 5], // Low E string
    ], rootString: 4, rootFret: 3 },
    { name: 'Pattern 4 (Am Shape)', startFret: 7, pattern: [
      [0, 1, 3], // E string
      [0, 2, 5], // B string
      [0, 2, 3], // G string
      [0, 2, 3, 5], // D string
      [0, 1, 3, 5], // A string
      [0, 1, 3], // Low E string
    ], rootString: 4, rootFret: 0 },
    { name: 'Pattern 5 (Gm Shape)', startFret: 10, pattern: [
      [0, 1, 3, 5], // E string
      [0, 2], // B string
      [0, 2, 3, 5], // G string
      [0, 2, 3], // D string
      [0, 1, 3, 5], // A string
      [0, 1, 3, 5], // Low E string
    ], rootString: 5, rootFret: 3 },
  ],
  'minor pentatonic': [
    { name: 'Box 1', startFret: 0, pattern: [
      [0, 3], // E string
      [0, 3], // B string
      [0, 2], // G string
      [0, 2], // D string
      [0, 3], // A string
      [0, 3], // Low E string
    ], rootString: 5, rootFret: 0 },
    { name: 'Box 2', startFret: 3, pattern: [
      [0, 2], // E string
      [0, 3], // B string
      [0, 2], // G string
      [0, 2], // D string
      [0, 2], // A string
      [0, 2], // Low E string
    ], rootString: 3, rootFret: 0 },
    { name: 'Box 3', startFret: 5, pattern: [
      [0, 3], // E string
      [0, 2], // B string
      [0, 2], // G string
      [0, 3], // D string
      [0, 3], // A string
      [0, 3], // Low E string
    ], rootString: 4, rootFret: 3 },
    { name: 'Box 4', startFret: 7, pattern: [
      [0, 2], // E string
      [0, 3], // B string
      [0, 3], // G string
      [0, 2], // D string
      [0, 2], // A string
      [0, 2], // Low E string
    ], rootString: 4, rootFret: 0 },
    { name: 'Box 5', startFret: 10, pattern: [
      [0, 3], // E string
      [0, 3], // B string
      [0, 2], // G string
      [0, 2], // D string
      [0, 3], // A string
      [0, 3], // Low E string
    ], rootString: 0, rootFret: 0 },
  ],
};

// Maps major-based patterns to other scale types
const scalePatternMappings = {
  'major': 'major',
  'minor': 'minor',
  'minor pentatonic': 'minor pentatonic',
  'major pentatonic': 'minor pentatonic', // Uses same patterns as minor pentatonic
  'dorian': 'minor',
  'phrygian': 'minor',
  'lydian': 'major',
  'mixolydian': 'major',
  'locrian': 'minor',
  'harmonic minor': 'minor',
  'melodic minor': 'minor',
  'blues': 'minor pentatonic',
};

const ScalePatterns = ({ scaleRoot, scaleType, fretboardWidth, onSelectPattern }) => {
  const { theme } = useTheme();
  const [activePattern, setActivePattern] = useState(0);
  
  const isGlassmorphism = theme.includes('glassmorphism');
  const darkMode = theme !== 'light-minimal';
  
  if (!scaleRoot || !scaleType) return null;
  
  // Find the base pattern type for the selected scale
  const basePatternType = scalePatternMappings[scaleType] || 'major';
  const patterns = scalePatterns[basePatternType] || [];
  
  // Calculate adjustment to move pattern to the selected root
  const targetRootOffset = Tonal.Note.chroma(scaleRoot);
  const patternRootOffset = basePatternType === 'minor' ? 9 : 0; // E for major, A for minor
  const fretShift = (targetRootOffset - patternRootOffset + 12) % 12;
  
  const selectPattern = (index) => {
    setActivePattern(index);
    onSelectPattern(patterns[index], fretShift);
  };
  return (
    <div className={`mt-4 ${isGlassmorphism 
      ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-glow-sm' 
      : 'bg-gray-800/90 border border-gray-700'} rounded-lg overflow-hidden shadow-lg transition-all duration-300`}>
      <div className={`flex justify-between items-center px-4 py-2 border-b ${isGlassmorphism ? 'border-gray-700/40' : 'border-gray-700'}`}>
        <h3 className={`text-md font-semibold ${isGlassmorphism ? 'text-primary' : 'text-yellow-300'}`}>
          {scaleRoot} {scaleType} <span className="text-sm text-gray-400 font-normal">patterns</span>
        </h3>
      </div>
      
      <div className="p-3">
        {/* Pattern selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {patterns.map((pattern, index) => {
            const bgColor = index === activePattern 
              ? (isGlassmorphism ? 'bg-green-600/80 shadow-green-500/30' : 'bg-green-600')
              : (isGlassmorphism ? 'bg-gray-700/70' : 'bg-gray-700');
            return (
              <button 
                key={index}
                onClick={() => selectPattern(index)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                  ${bgColor} text-white text-sm font-medium
                  ${isGlassmorphism ? 'backdrop-blur-xs border border-white/10' : ''}
                  ${index === activePattern && isGlassmorphism ? 'shadow-glow-xs' : ''}
                  hover:opacity-90 transition-all duration-200
                `}
                title={`${pattern.name} - Starting at fret ${fretShift + pattern.startFret}`}
              >
                {pattern.name}
              </button>
            );
          })}
        </div>
        
        {/* Pattern visualization */}
        {patterns.length > 0 && (
          <div className={`${isGlassmorphism 
            ? 'bg-gray-900/60 backdrop-blur-sm border border-gray-700/40 shadow-glow-xs' 
            : 'bg-gray-900/70'} p-3 rounded-md transition-all duration-300`}>
            <div className={`flex items-center justify-center text-sm ${isGlassmorphism ? 'text-gray-300' : 'text-gray-400'} mb-2`}>
              <span>Position starts at fret {fretShift + patterns[activePattern].startFret}</span>
            </div>
            
            <div className="flex justify-center">
              <div className="relative max-w-md w-full h-48">                {/* Strings */}
                <div className="flex justify-between h-full">
                  {[0, 1, 2, 3, 4, 5].map((stringIdx) => (
                    <div key={stringIdx} className={`w-0.5 ${isGlassmorphism ? 'bg-gray-500/80' : 'bg-gray-500'} h-full`}></div>
                  ))}
                </div>
                
                {/* Frets */}
                {[0, 1, 2, 3, 4].map((fretIdx) => (
                  <div 
                    key={fretIdx} 
                    className={`absolute left-0 right-0 h-0.5 ${isGlassmorphism ? 'bg-gray-500/80' : 'bg-gray-500'}`}
                    style={{ top: `${fretIdx * 25}%` }}
                  >
                    {/* Fret markers */}
                    <div className={`absolute -right-5 top-1/2 transform -translate-y-1/2 text-xs ${isGlassmorphism ? 'text-gray-300' : 'text-gray-400'}`}>
                      {fretShift + patterns[activePattern].startFret + fretIdx}
                    </div>
                  </div>
                ))}
                
                {/* Note positions */}
                {patterns[activePattern].pattern.map((stringPattern, stringIdx) => 
                  stringPattern.map((fretOffset, idx) => {
                    const displayFretOffset = Math.min(fretOffset, 4);
                    const isRoot = stringIdx === patterns[activePattern].rootString && 
                                  fretOffset === patterns[activePattern].rootFret;
                    
                    return (
                      <div 
                        key={`${stringIdx}-${fretOffset}`}
                        className={`absolute w-5 h-5 rounded-full flex items-center justify-center text-xs text-white
                          ${isRoot 
                            ? `${isGlassmorphism ? 'bg-red-500/80 shadow-glow-xs shadow-red-500/30' : 'bg-red-500'}` 
                            : `${isGlassmorphism ? 'bg-green-600/80 shadow-glow-xs shadow-green-500/30' : 'bg-green-600'}`} 
                          transition-all duration-300`}
                        style={{ 
                          left: `${stringIdx * 20}%`, 
                          top: `${displayFretOffset * 25}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {idx + 1}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            <div className="text-center mt-4 text-xs text-gray-400">
              <p>Numbers indicate suggested finger positions</p>
              <p className="mt-1">Root notes are highlighted in red</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScalePatterns; 