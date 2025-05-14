import React from 'react';
import * as Tonal from 'tonal';
import { useTheme } from '@/components/ui/ThemeContext';

// Common chord progressions by numeral
const commonProgressions = [
  { 
    name: 'I-IV-V (Major)', 
    numerals: ['I', 'IV', 'V'],
    description: 'The most basic and widely used chord progression in music'
  },
  { 
    name: 'I-V-vi-IV (Pop)', 
    numerals: ['I', 'V', 'vi', 'IV'],
    description: 'Used in countless pop, rock, and country songs'
  },
  { 
    name: 'ii-V-I (Jazz)', 
    numerals: ['ii', 'V', 'I'],
    description: 'The essential jazz progression, often expanded to ii7-V7-Imaj7'
  },
  { 
    name: 'I-vi-IV-V (50s)', 
    numerals: ['I', 'vi', 'IV', 'V'],
    description: 'Classic 50s doo-wop progression, heard in many oldies'
  },
  { 
    name: 'vi-IV-I-V (Epic)', 
    numerals: ['vi', 'IV', 'I', 'V'],
    description: 'Creates a dramatic, emotional feel used in many anthems'
  },
  { 
    name: 'I-V-vi-iii-IV-I-IV-V (Circle)', 
    numerals: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'],
    description: 'Circle progression that creates movement through the key'
  },
  { 
    name: 'i-bVI-bIII-bVII (Minor)', 
    numerals: ['i', 'bVI', 'bIII', 'bVII'],
    description: 'Common minor key progression with a dramatic feel'
  }
];

// Function to generate the chords for a progression in a given key
const generateProgressionChords = (key, progression, isMajor = true) => {
  // Get the scale for the key
  const scale = Tonal.Scale.get(`${key} ${isMajor ? 'major' : 'minor'}`);
  
  // Create a mapping of scale degrees to chord types
  const chordTypes = isMajor
    ? ['M', 'm', 'm', 'M', 'M', 'm', 'dim'] // Major key chord types
    : ['m', 'dim', 'M', 'm', 'm', 'M', 'M']; // Natural minor key chord types
  
  // Parse the roman numerals and generate the chord symbols
  return progression.map(numeral => {
    let degreeMatch = numeral.match(/([b#]*)([i|v|I|V]+)/);
    if (!degreeMatch) return null;
    
    const accidental = degreeMatch[1];
    const degreeNumeral = degreeMatch[2];
    
    // Convert roman numeral to scale degree (1-indexed)
    let degree;
    if (degreeNumeral.toLowerCase() === 'i') degree = 1;
    else if (degreeNumeral.toLowerCase() === 'ii') degree = 2;
    else if (degreeNumeral.toLowerCase() === 'iii') degree = 3;
    else if (degreeNumeral.toLowerCase() === 'iv') degree = 4;
    else if (degreeNumeral.toLowerCase() === 'v') degree = 5;
    else if (degreeNumeral.toLowerCase() === 'vi') degree = 6;
    else if (degreeNumeral.toLowerCase() === 'vii') degree = 7;
    else return null;
    
    // Adjust degree for accidentals
    let adjustedDegree = degree - 1; // 0-indexed for scale.notes
    
    // Get the root note of the chord
    let rootNote;
    if (accidental === 'b') {
      // Flat: get the note and transpose down
      rootNote = Tonal.Note.transpose(scale.notes[adjustedDegree % 7], '-1M');
    } else if (accidental === '#') {
      // Sharp: get the note and transpose up
      rootNote = Tonal.Note.transpose(scale.notes[adjustedDegree % 7], '1M');
    } else {
      // No accidental
      rootNote = scale.notes[adjustedDegree % 7];
    }
    
    // Get the chord type based on scale degree and adjust for numerals
    let chordType = chordTypes[adjustedDegree];
    if (degreeNumeral === degreeNumeral.toLowerCase() && chordType === 'M') {
      chordType = 'm'; // Minor numeral in major key should be minor chord
    } else if (degreeNumeral === degreeNumeral.toUpperCase() && chordType === 'm') {
      chordType = 'M'; // Major numeral in minor key should be major chord
    }
    
    return {
      numeral,
      chord: `${rootNote}${chordType === 'M' ? '' : chordType}`
    };
  });
};

const ChordProgressions = ({ chordRoot, chordType }) => {
  const { theme } = useTheme();
  const isGlassmorphism = theme.includes('glassmorphism');
  const darkMode = theme !== 'light-minimal';
  
  if (!chordRoot) return null;
  
  // Determine if we're in a major or minor context based on chord type
  const isMajor = !['m', 'dim', 'm7', 'm6', 'm9'].includes(chordType);
  
  // Set key based on chord root and type
  const key = chordRoot;
    return (
    <div className={`mt-4 ${isGlassmorphism 
      ? 'bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 shadow-lg' 
      : 'bg-gray-800/90 border border-gray-700'} rounded-lg overflow-hidden transition-all duration-300`}>
      <div className={`flex justify-between items-center px-4 py-2 border-b ${isGlassmorphism ? 'border-gray-700/40' : 'border-gray-700'}`}>
        <h3 className={`text-md font-semibold ${isGlassmorphism ? 'text-primary' : 'text-yellow-300'}`}>
          {key} {isMajor ? 'Major' : 'Minor'} Key <span className="text-sm text-gray-400 font-normal">progressions</span>
        </h3>
      </div>
      
      <div className="p-3 space-y-4">
            {commonProgressions.map((progression, index) => {
          const chords = generateProgressionChords(key, progression.numerals, isMajor);
          
          return (
            <div key={index} className={`${isGlassmorphism 
              ? 'bg-gray-900/40 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-900/50' 
              : 'bg-gray-900/60 hover:bg-gray-900/80'} rounded-md p-3 transition-all duration-200`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h4 className={`text-sm font-medium ${isGlassmorphism ? 'text-green-400/90' : 'text-green-400'}`}>{progression.name}</h4>
                <span className="text-xs text-gray-400">{progression.description}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {chords.map((chordData, idx) => (
                  <div 
                    key={idx}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className={`${isGlassmorphism 
                      ? 'bg-gray-700/70 backdrop-blur-xs border border-gray-600/30' 
                      : 'bg-gray-700'} px-2 py-1 rounded text-xs font-mono text-white transition-colors duration-200`}>
                      {chordData.numeral}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${isGlassmorphism 
                      ? 'text-yellow-300/90' 
                      : 'text-yellow-300'}`}>
                      {chordData.chord}
                    </span>
                    {idx < chords.length - 1 && (
                      <span className="text-gray-500 mx-1 hidden sm:block">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChordProgressions; 