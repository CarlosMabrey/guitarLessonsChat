import React, { useState } from 'react';
import * as Tonal from 'tonal';
import { useTheme } from '@/components/ui/ThemeContext';

// Position types with labels and visual indicators - simplified with clearer icons
const positionTypes = [
  { label: 'Open', description: 'Open strings, first few frets', color: 'bg-green-600', icon: 'O' },
  { label: 'Barre', description: 'Uses barre technique', color: 'bg-blue-600', icon: 'B' },
  { label: 'Root 5', description: 'Root on A string', color: 'bg-purple-600', icon: '5' },
  { label: 'Root 6', description: 'Root on low E string', color: 'bg-indigo-600', icon: '6' },
  { label: 'Movable', description: 'Movable shape', color: 'bg-orange-600', icon: 'M' },
];

const ChordPositions = ({ 
  chordRoot, 
  chordType, 
  onSelectPosition,
  currentVoicingIndex,
  selectedVoicings,
}) => {
  const [activeTab, setActiveTab] = useState('positions'); // 'positions' or 'theory'
  const { theme } = useTheme();
  
  const isGlassmorphism = theme.includes('glassmorphism');
  const darkMode = theme !== 'light-minimal';
  
  // No chord selected
  if (!chordRoot || !chordType) {
    return null;
  }
  
  // Chord formula and notes
  const chord = Tonal.Chord.getChord(chordType, chordRoot);
  const intervals = chord.intervals;
  const notes = chord.notes;
  
  // Handle click on a position type
  const handlePositionClick = (positionIndex) => {
    if (selectedVoicings && selectedVoicings.length > 0) {
      // Find the position in the voicings that matches the type
      const matchingIndex = selectedVoicings.findIndex(v => 
        v.name.toLowerCase().includes(positionTypes[positionIndex].label.toLowerCase())
      );
      
      if (matchingIndex >= 0) {
        onSelectPosition(matchingIndex);
      } else {
        // If no exact match, try to select something similar or just the first one
        onSelectPosition(0);
      }
    }
  };

  // Separate available positions for cleaner UI
  const availablePositions = positionTypes.filter((_, index) => 
    selectedVoicings?.some(v => v.name.toLowerCase().includes(positionTypes[index].label.toLowerCase()))
  );

  return (
    <div className={`mt-4 ${isGlassmorphism 
      ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-glow-sm' 
      : 'bg-gray-800/90 border border-gray-700'} rounded-lg overflow-hidden shadow-lg transition-all duration-300`}>
      {/* Tabs - simplified to icons with tooltips */}
      <div className={`flex justify-between items-center px-4 py-2 border-b ${isGlassmorphism ? 'border-gray-700/40' : 'border-gray-700'}`}>
        <h3 className={`text-md font-semibold ${isGlassmorphism ? 'text-primary' : 'text-yellow-300'}`}>
          {chordRoot}{chordType} <span className="text-sm text-gray-400 font-normal">positions</span>
        </h3>
        
        <div className="flex space-x-2">
          <button 
            className={`p-1.5 rounded transition-colors duration-200 ${activeTab === 'positions' 
              ? `${isGlassmorphism 
                  ? 'bg-gray-700/70 text-white shadow-glow-xs' 
                  : 'bg-gray-700 text-white'}` 
              : `${isGlassmorphism 
                  ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}`}
            onClick={() => setActiveTab('positions')}
            title="Chord Positions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </button>
          <button 
            className={`p-1.5 rounded transition-colors duration-200 ${activeTab === 'theory' 
              ? `${isGlassmorphism 
                  ? 'bg-gray-700/70 text-white shadow-glow-xs' 
                  : 'bg-gray-700 text-white'}` 
              : `${isGlassmorphism 
                  ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}`}
            onClick={() => setActiveTab('theory')}
            title="Chord Theory"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Card Content */}
      {activeTab === 'positions' ? (
        <div className="p-3">
          {/* Current position display */}
          {selectedVoicings && selectedVoicings.length > 0 && (
            <div className="mb-2 text-xs text-gray-400 flex justify-between items-center">
              <span>
                Current: <span className={`${isGlassmorphism ? 'text-gray-200' : 'text-white'}`}>{selectedVoicings[currentVoicingIndex]?.name || 'Standard'}</span>
              </span>
              <span className={`text-xs ${isGlassmorphism ? 'text-gray-400' : 'text-gray-500'}`}>
                {currentVoicingIndex + 1}/{selectedVoicings.length}
              </span>
            </div>
          )}
          
          {/* Position Type Pills */}
          {availablePositions.length > 0 ? (
            <div className="flex flex-wrap gap-2">              {availablePositions.map((position, index) => {
                const originalIndex = positionTypes.findIndex(p => p.label === position.label);
                const colorWithOpacity = isGlassmorphism ? position.color.replace('bg-', 'bg-') + '/80' : position.color;
                return (
                  <button 
                    key={position.label}
                    onClick={() => handlePositionClick(originalIndex)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                      ${colorWithOpacity} text-white text-sm font-medium
                      ${isGlassmorphism ? 'backdrop-blur-sm shadow-glow-xs border border-white/10' : ''}
                      hover:opacity-90 transition-all duration-200
                    `}
                    title={position.description}
                  >
                    <span className="text-xs font-bold">{position.icon}</span>
                    <span>{position.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className={`text-sm ${isGlassmorphism ? 'text-gray-300' : 'text-gray-400'}`}>No alternate positions available for this chord.</p>
          )}
        </div>
      ) : (
        <div className="p-3">
          <div className="flex flex-col gap-3">
            {/* Notes visualized as pills */}
            <div className="flex gap-2 items-center">
              <span className={`text-xs ${isGlassmorphism ? 'text-gray-300' : 'text-gray-400'} w-16`}>Notes:</span>
              <div className="flex flex-wrap gap-1.5">
                {notes.map((note, i) => {
                  const bgColor = i === 0 
                    ? (isGlassmorphism ? 'bg-red-500/80 shadow-red-500/30' : 'bg-red-500')
                    : (i === 2 
                      ? (isGlassmorphism ? 'bg-green-500/80 shadow-green-500/30' : 'bg-green-500')
                      : (isGlassmorphism ? 'bg-blue-400/80 shadow-blue-400/30' : 'bg-blue-400'));
                  return (
                    <div key={note} 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium
                        ${bgColor} ${isGlassmorphism ? 'shadow-glow-xs' : ''} transition-all duration-200`}
                      title={i === 0 ? 'Root' : (i === 2 ? '5th' : '3rd')}
                    >
                      {note}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Formula as a simple tag */}
            <div className="flex gap-2 items-center">
              <span className={`text-xs ${isGlassmorphism ? 'text-gray-300' : 'text-gray-400'} w-16`}>Formula:</span>
              <div className={`${isGlassmorphism 
                ? 'bg-gray-900/50 backdrop-blur-xs border border-gray-700/40 shadow-glow-xs shadow-green-400/10' 
                : 'bg-gray-900/60'} px-2 py-1 rounded text-xs text-green-400 font-mono transition-all duration-200`}>
                {intervals.join(' - ')}
              </div>
            </div>
            
            {/* Common progressions as compact pills */}
            <div className="flex gap-2 items-start">
              <span className={`text-xs ${isGlassmorphism ? 'text-gray-300' : 'text-gray-400'} w-16`}>Progressions:</span>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap gap-1">
                  {[chordRoot, Tonal.Note.transpose(chordRoot, '4P'), Tonal.Note.transpose(chordRoot, '5P')].map((note, i) => (
                    <span key={i} className={`${isGlassmorphism 
                      ? 'bg-gray-700/60 backdrop-blur-xs border border-gray-600/30' 
                      : 'bg-gray-700'} px-1.5 py-0.5 rounded text-xs text-white transition-colors duration-200`}>
                      {note}{i === 0 ? '' : (i === 1 ? '4' : '5')}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    `${chordRoot}`, 
                    `${Tonal.Note.transpose(chordRoot, '6M')}m`, 
                    `${Tonal.Note.transpose(chordRoot, '4P')}`, 
                    `${Tonal.Note.transpose(chordRoot, '5P')}`
                  ].map((chord, i) => (                    <span key={i} className={`${isGlassmorphism 
                      ? 'bg-gray-700/60 backdrop-blur-xs border border-gray-600/30' 
                      : 'bg-gray-700'} px-1.5 py-0.5 rounded text-xs text-white transition-colors duration-200`}>
                      {chord}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChordPositions; 