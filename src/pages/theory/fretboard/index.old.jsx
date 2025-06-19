// pages/theory/fretboard/index.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Layout from '../../../components/ui/Layout';
import * as Tonal from 'tonal';
import NoteCell from '../../../components/fretboard/NoteCell';
import LegendBox from '../../../components/fretboard/LegendBox';
import VoicingDisplay from '../../../components/fretboard/VoicingDisplay';
import ChordPositions from '../../../components/fretboard/ChordPositions';
import ScalePatterns from '../../../components/fretboard/ScalePatterns';
import ChordProgressions from '../../../components/fretboard/ChordProgressions';
import GuitarAudio from '../../../components/fretboard/GuitarAudio';
import { useTheme } from '../../../components/ui/ThemeContext';
import {
  allNotes,
  tunings,
  chordTypes,
  scaleTypes,
  chordVoicings,
  adaptVoicingsToTuning,
  normalizeChordName,
  normalizeScaleName
} from '@/lib/musicTheory';

// Fretboard display constants
const fretMarkers = [3, 5, 7, 9, 12];

// Helper to get the note at a specific fret
const getFretNote = (openNote, fret) => {
const index = allNotes.indexOf(Tonal.Note.simplify(openNote));
return allNotes[(index + fret) % 12];
};

function FretboardPage() {
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [currentTuning, setCurrentTuning] = useState('Standard');
  const [chordRoot, setChordRoot] = useState('C');
  const [chordType, setChordType] = useState('');
  const [scaleType, setScaleType] = useState('');
  const [showVoicings, setShowVoicings] = useState(false);
  const [selectedVoicings, setSelectedVoicings] = useState([]);
  const [currentVoicingIndex, setCurrentVoicingIndex] = useState(0);
  const [detectedChord, setDetectedChord] = useState('');
  const [suggestedScales, setSuggestedScales] = useState([]);
  const [showOnlyRelevantNotes] = useState(true);
  const [qualityMode, setQualityMode] = useState(false);
  const [showVoicingOverScale, setShowVoicingOverScale] = useState(true);
  const [reverseStringOrder, setReverseStringOrder] = useState(false);
  const [showScalePatterns, setShowScalePatterns] = useState(false);
  const [showChordProgressions, setShowChordProgressions] = useState(false);
  const [currentScalePattern, setCurrentScalePattern] = useState(null);
  const [patternFretShift, setPatternFretShift] = useState(0);
  const [strumDirection, setStrumDirection] = useState('down');
  const [currentTab, setCurrentTab] = useState('fretboard'); // 'fretboard', 'voicings', 'analysis', 'patterns', 'progressions'
  const [singleVoicingMode, setSingleVoicingMode] = useState(false);
  const [voicingStringSet, setVoicingStringSet] = useState('all');
  const [voicingFretRange, setVoicingFretRange] = useState([0, 12]);
  const [displayDropdownOpen, setDisplayDropdownOpen] = useState(false);
  const displayDropdownRef = React.useRef(null);
  
  // Initialize GuitarAudio - ensure this is wrapped in useCallback to maintain reference stability
  const audioTools = GuitarAudio();
  // Create stable references to the audio methods to prevent unnecessary re-renders
  const playNote = useCallback((note) => {
    if (audioTools.playNote) {
      audioTools.playNote(note);
    }
  }, [audioTools]);
  
  const playChord = useCallback((notes, strum = true, duration = 2) => {
    if (audioTools.playChord) {
      audioTools.playChord(notes, strum, duration);
    }
  }, [audioTools]);
  
  // Get strings array based on tuning and display orientation
  const getTuningStrings = useCallback(() => {
    const tuningArray = [...tunings[currentTuning]];
    // Reverse the array if we want low E at the top (standard guitar tab format)
    // Otherwise keep it with high E at the top (standard notation format)
    return reverseStringOrder ? tuningArray : tuningArray.reverse();
  }, [currentTuning, reverseStringOrder]);
  
  const strings = getTuningStrings();
const frets = Array.from({ length: 13 }, (_, i) => i);

  // Compute highlighted notes based on chord or scale selection
const highlightedNotes = React.useMemo(() => {
if (chordType) {
return Tonal.Chord.getChord(chordType, chordRoot).notes.map(Tonal.Note.pitchClass);
} else if (scaleType) {
return Tonal.Scale.get(`${chordRoot} ${scaleType}`).notes.map(Tonal.Note.pitchClass);
}
return [];
}, [chordRoot, chordType, scaleType]);

  // Create interval mapping for color coding
const intervalMap = React.useMemo(() => {
if (chordType) {
return Tonal.Chord.getChord(chordType, chordRoot).intervals.reduce((acc, intv, i) => {
const note = Tonal.Note.pitchClass(Tonal.Note.transpose(chordRoot, intv));
acc[note] = intv;
return acc;
}, {});
} else if (scaleType) {
return Tonal.Scale.get(`${chordRoot} ${scaleType}`).intervals.reduce((acc, intv, i) => {
const note = Tonal.Note.pitchClass(Tonal.Note.transpose(chordRoot, intv));
acc[note] = intv;
return acc;
}, {});
}
return {};
}, [chordRoot, chordType, scaleType]);

  // Load chord voicings when a chord is selected
  useEffect(() => {
    if (chordType) {
      const voicingKey = `${chordRoot}-${chordType}`;
      const standardVoicings = chordVoicings[voicingKey] || [];
      
      // Adapt voicings to current tuning if needed
      const adaptedVoicings = adaptVoicingsToTuning(standardVoicings, 'Standard', currentTuning);
      
      setSelectedVoicings(adaptedVoicings);
      setCurrentVoicingIndex(0);
      
      // Automatically show voicings when a chord is selected
      if (adaptedVoicings.length > 0) {
        setShowVoicings(true);
        // If we're on the voicings tab, automatically open that tab
        if (currentTab === 'fretboard') {
          // Show voicings in the fretboard tab as well
          setShowVoicings(true);
        }
      } else {
        setShowVoicings(false);
      }
    } else {
      setSelectedVoicings([]);
      setShowVoicings(false);
    }
  }, [chordRoot, chordType, currentTuning, adaptVoicingsToTuning]);

  // Detect chord and suggested scales from selected notes
  useEffect(() => {
    if (selectedNotes.length >= 2) {
      // Convert to pitch classes for chord detection
      const pitchClasses = selectedNotes.map(note => Tonal.Note.pitchClass(note));
      
      // Detect chords based on selected notes
      const detectedChords = Tonal.Chord.detect(pitchClasses);
      setDetectedChord(detectedChords.length > 0 ? detectedChords[0] : '');
      
      // Find scales that contain all the selected notes
      const pcSet = new Set(pitchClasses);
      const compatibleScales = [];
      
      // Check through common scales
      scaleTypes.forEach(scaleType => {
        // Try each note as potential root
        allNotes.forEach(root => {
          const scale = Tonal.Scale.get(`${root} ${scaleType.type}`);
          const scaleNotes = scale.notes.map(Tonal.Note.pitchClass);
          
          // Check if all selected notes are in this scale
          const containsAllNotes = [...pcSet].every(note => scaleNotes.includes(note));
          
          if (containsAllNotes) {
            compatibleScales.push(`${root} ${scale.name}`);
          }
        });
      });
      
      // Limit to most relevant scales (up to 3)
      setSuggestedScales(compatibleScales.slice(0, 3));
    } else {
      setDetectedChord('');
      setSuggestedScales([]);
    }
  }, [selectedNotes]);

  // Toggle note selection
  const toggleNote = useCallback((note) => {
    setSelectedNotes(prev =>
      prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]
);
  }, []);

  // Handle note click with sound and note highlighting
  const handleNoteClick = useCallback((note) => {
    // Play the note sound
    playNote(note);
    
    // Toggle the note selection
    toggleNote(note);
    
    // Optional: temporarily highlight all occurrences of this note across the fretboard
    // This could be implemented with a brief state update that automatically resets
    
  }, [toggleNote, playNote]);

  // Play all highlighted notes as a chord
  const handlePlayChord = useCallback(() => {
    // Play chord using GuitarAudio with strum effect
    if (highlightedNotes && highlightedNotes.length > 0) {
      playChord(highlightedNotes, strumDirection !== 'none', 2);
    }
  }, [highlightedNotes, playChord, strumDirection]);

  // Select a specific scale pattern
  const handleSelectPattern = useCallback((pattern, fretShift) => {
    setCurrentScalePattern(pattern);
    setPatternFretShift(fretShift);
  }, []);

  // Toggle strum direction
  const toggleStrumDirection = useCallback(() => {
    setStrumDirection(prev => {
      if (prev === 'down') return 'up';
      if (prev === 'up') return 'none';
      return 'down';
    });
  }, []);

  // Navigate through voicings
  const nextVoicing = () => {
    if (selectedVoicings.length > 1) {
      setCurrentVoicingIndex((prev) => (prev + 1) % selectedVoicings.length);
    }
  };
  
  const previousVoicing = () => {
    if (selectedVoicings.length > 1) {
      setCurrentVoicingIndex((prev) => (prev === 0 ? selectedVoicings.length - 1 : prev - 1));
    }
  };
  
  // Select a specific voicing by index
  const selectVoicing = (index) => {
    if (selectedVoicings.length > index) {
      setCurrentVoicingIndex(index);
      setShowVoicings(true);
    }
  };

  // Reset all selections
  const resetSelections = () => {
    setSelectedNotes([]);
    setChordType('');
    setScaleType('');
    setShowVoicings(false);
};

const { theme, isGlassmorphism } = useTheme();

// Filter voicings by string set and fret range
const filteredVoicings = useMemo(() => {
  if (!selectedVoicings.length) return [];
  return selectedVoicings.filter(voicing => {
    // Fret range filter
    const frets = voicing.frets.map(f => (f === 'x' ? null : parseInt(f, 10)));
    const minFret = Math.min(...frets.filter(f => f !== null));
    const maxFret = Math.max(...frets.filter(f => f !== null));
    if (minFret < voicingFretRange[0] || maxFret > voicingFretRange[1]) return false;
    // String set filter
    if (voicingStringSet === 'all') return true;
    if (voicingStringSet === '1-3') {
      // Only top 3 strings (high E, B, G)
      return [3,4,5].every(i => voicing.frets[i] !== 'x');
    }
    if (voicingStringSet === '2-4') {
      return [2,3,4].every(i => voicing.frets[i] !== 'x');
    }
    if (voicingStringSet === '4-6') {
      // Only bottom 3 strings (D, A, low E)
      return [0,1,2].every(i => voicing.frets[i] !== 'x');
    }
    return true;
  });
}, [selectedVoicings, voicingFretRange, voicingStringSet]);

// Adjust current voicing index if filtered list is shorter
useEffect(() => {
  if (currentVoicingIndex >= filteredVoicings.length) {
    setCurrentVoicingIndex(0);
  }
}, [filteredVoicings, currentVoicingIndex]);

// Dropdown outside click handler
useEffect(() => {
  function handleClickOutside(event) {
    if (displayDropdownRef.current && !displayDropdownRef.current.contains(event.target)) {
      setDisplayDropdownOpen(false);
    }
  }
  
  if (displayDropdownOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [displayDropdownOpen]);

  return (
    <Layout title="Fretboard" version="1.0">
      <div className="min-h-screen bg-gradient-to-br from-blue-950 to-indigo-950 text-white p-4 md:p-6">
        <Head>
          <title>Fretboard | Music Theory Tools</title>
          <meta name="description" content="Visualize notes and chords on an interactive guitar fretboard." />
        </Head>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-4 md:mb-0">
              Guitar Fretboard Visualizer
            </h1>
            
            <div className="flex items-center space-y-4">
              <button 
                onClick={handlePlayChord}
                className="flex items-center px-5 py-2 rounded-full bg-blue-600/80 hover:bg-blue-600/90 backdrop-blur-sm text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
                disabled={!highlightedNotes.length}
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Play</span>
              </button>
              
              <button
                onClick={resetSelections}
                className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm transition-colors duration-200 backdrop-blur-lg"
              >
                Reset
              </button>
            
        <h3 className="text-lg font-semibold text-white mb-4">Scale & Tuning</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tuning Selector */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-white/80">Tuning</label>
            <select
              value={currentTuning}
              onChange={(e) => setCurrentTuning(e.target.value)}
              className="w-full bg-[var(--card)] border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1rem'
              }}
            >
              {Object.keys(tunings).map((key) => (
                <option key={key} value={key} className="bg-gray-800 text-white">
                  {key}
                </option>
              ))}
            </select>
          </div>
          
          {/* Root Note Selector */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-white/80">Root Note</label>
            <select
              value={chordRoot}
              onChange={(e) => setChordRoot(e.target.value)}
              className="w-full bg-[var(--card)] border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1rem'
              }}
            >
              {allNotes.map((note) => (
                <option key={note} value={note} className="bg-gray-800 text-white">
                  {note}
                </option>
              ))}
            </select>
          </div>
          
          {/* Scale Type Selector */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-white/80">Scale Type</label>
            <select
              value={scaleType}
              onChange={(e) => {
                setScaleType(e.target.value);
                setChordType('');
              }}
              className="w-full bg-[var(--card)] border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1rem'
              }}
            >
              <option value="" className="bg-gray-800 text-white">Select Scale</option>
              {scaleTypes.map((s) => (
                <option key={s.label} value={s.type} className="bg-gray-800 text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Scale Notes Display */}
        {scaleType && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-white/80 mb-2">Scale Notes</h4>
            <div className="flex flex-wrap gap-2">
              {Tonal.Scale.get(`${chordRoot} ${scaleType}`).notes.map((note, i) => (
                <div 
                  key={i} 
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    i === 0 ? 'bg-red-600/80' : 
                    note.includes('#') ? 'bg-purple-600/80' : 
                    'bg-blue-600/80'
                  }`}
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Chord Selector */}
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Chord Builder</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Root Note Selector */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-white/80">Root Note</label>
            <select
              value={chordRoot}
              onChange={(e) => setChordRoot(e.target.value)}
              className="w-full bg-[var(--card)] border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1rem'
              }}
            >
              {allNotes.map((note) => (
                <option key={note} value={note} className="bg-gray-800 text-white">
                  {note}
                </option>
              ))}
            </select>
          </div>
          
          {/* Chord Type Selector */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-white/80">Chord Type</label>
            <select
              value={chordType}
              onChange={(e) => {
                setChordType(e.target.value);
                setScaleType('');
              }}
              className="w-full bg-[var(--card)] border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1rem'
              }}
            >
              <option value="" className="bg-gray-800 text-white">Select Chord</option>
              {chordTypes.map((c) => (
                <option key={c.label} value={c.type} className="bg-gray-800 text-white">
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Chord Notes Display */}
        {chordType && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-white/80 mb-2">Chord Notes</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {Tonal.Chord.getChord(chordType, chordRoot).notes.map((note, i) => (
                <div 
                  key={i} 
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    i === 0 ? 'bg-red-600/80' : 
                    i % 2 === 0 ? 'bg-green-600/80' : 
                    'bg-blue-600/80'
                  }`}
                >
                  {note}
                </div>
              ))}
            </div>
            
            {/* Chord Shape Preview using VoicingDisplay */}
            {selectedVoicings.length > 0 && selectedVoicings[0]?.frets && (
              <div className="mt-6 w-full">
                <h4 className="text-sm font-medium text-white/80 mb-3">Chord Shape</h4>
                <div className="bg-gray-900/50 p-4 rounded-lg w-full">
                  <VoicingDisplay
                    selectedVoicings={selectedVoicings}
                    currentVoicingIndex={0}
                    chordRoot={chordRoot}
                    chordType={chordType}
                    chordName={`${chordRoot}${chordType}`}
                    onNext={nextVoicing}
                    onPrevious={previousVoicing}
                    playChord={playChord}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Fretboard Section - only shown when on fretboard tab */}
    {currentTab === 'fretboard' && (
      <>
      {/* Single Voicing Mode Navigation and Info Overlay */}
      {singleVoicingMode && chordType && filteredVoicings.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-2">
            <button onClick={previousVoicing} disabled={filteredVoicings.length <= 1}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="text-white/80 text-sm font-medium">Voicing {currentVoicingIndex + 1} of {filteredVoicings.length}</span>
            <button onClick={nextVoicing} disabled={filteredVoicings.length <= 1}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {/* Voicing Info Overlay */}
          {filteredVoicings[currentVoicingIndex] && (
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 flex flex-col md:flex-row items-center gap-4 text-white/90">
              <span className="font-semibold">Fret Range:</span>
              <span>{(() => {
                const frets = filteredVoicings[currentVoicingIndex].frets.filter(f => f !== 'x').map(f => parseInt(f, 10));
                if (!frets.length) return '—';
                const min = Math.min(...frets), max = Math.max(...frets);
                return min === max ? `Fret ${min}` : `Frets ${min}–${max}`;
              })()}</span>
              <span className="font-semibold ml-4">Muted:</span>
              <span>{filteredVoicings[currentVoicingIndex].frets.map((f, i) => f === 'x' ? (reverseStringOrder ? 6-i : i+1) : null).filter(x => x).join(', ') || 'None'}</span>
              <span className="font-semibold ml-4">Fingering:</span>
              <span>{filteredVoicings[currentVoicingIndex].fingers ? filteredVoicings[currentVoicingIndex].fingers.join(' ') : '—'}</span>
            </div>
          )}
        </div>
      )}

      {/* Fretboard Grid */}
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-6 mb-8 shadow-xl overflow-x-auto">
        <table className="table-auto border-collapse w-full">
          <thead>
            <tr className="text-sm text-blue-300 font-medium">
              <th className="px-3 py-2 text-left w-10">String</th>
              {frets.map((fret) => (
                <th key={fret} className="px-3 py-2 text-center w-12">
                  {fret === 0 || fretMarkers.includes(fret) ? (
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500/20 text-blue-300">{fret}</span>
                  ) : (
                    <span>{fret}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {strings.map((openNote, stringIndex) => (
              <tr key={stringIndex} className="border-t border-white/5 hover:bg-white/5 transition-colors duration-200">
                <td className="px-3 py-3 font-bold text-sm text-indigo-300">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-900/30 border border-indigo-400/20">
                    {openNote}
                  </div>
                </td>
                {frets.map((fret) => {
                  // Single voicing mode: only show notes for the current voicing
                  let showCell = true;
                  let voicingPosition = null;
                  if (singleVoicingMode && chordType && filteredVoicings.length > 0) {
                    const currentVoicing = filteredVoicings[currentVoicingIndex];
                    const voicingStringIndex = reverseStringOrder ? stringIndex : 5 - stringIndex;
                    if (!currentVoicing || currentVoicing.frets[voicingStringIndex] === undefined) {
                      showCell = false;
                    } else {
                      const fretNum = currentVoicing.frets[voicingStringIndex];
                      if (fretNum === 'x' || parseInt(fretNum, 10) !== fret) {
                        showCell = false;
                      } else {
                        voicingPosition = currentVoicing.fingers?.[voicingStringIndex] || '';
                      }
                    }
                  } else {
                    // Original voicing highlight logic
                    if (showVoicings && selectedVoicings.length > 0 && (showVoicingOverScale || !scaleType)) {
                      const currentVoicing = selectedVoicings[currentVoicingIndex];
                      const voicingStringIndex = reverseStringOrder ? stringIndex : 5 - stringIndex;
                      if (currentVoicing && currentVoicing.frets[voicingStringIndex] !== 'x') {
                        const voicingFret = parseInt(currentVoicing.frets[voicingStringIndex], 10);
                        if (!isNaN(voicingFret) && voicingFret === fret) {
                          voicingPosition = currentVoicing.fingers?.[voicingStringIndex] || '';
                        }
                      }
                    }
                  }
                  if (!showCell) return <td key={`${stringIndex}-${fret}`}></td>;
                  const note = getFretNote(openNote, fret);
                  const pc = Tonal.Note.pitchClass(note);
                  const isSelected = selectedNotes.includes(note);
                  const interval = intervalMap[pc];
                  const isHighlighted = highlightedNotes.includes(pc);
                  const isRelevant = !showOnlyRelevantNotes || !chordType && !scaleType || isHighlighted;
                  const showDot = fretMarkers.includes(fret);
                  let isScalePatternNote = false;
                  if (currentScalePattern && scaleType) {
                    const patternStartFret = patternFretShift + currentScalePattern.startFret;
                    const stringPatterns = currentScalePattern.pattern[reverseStringOrder ? stringIndex : 5 - stringIndex];
                    if (stringPatterns) {
                      isScalePatternNote = stringPatterns.some(offset => patternStartFret + offset === fret);
                    }
                  }
                  let noteClass = "flex items-center justify-center w-10 h-10 mx-auto rounded-full transition-all duration-200 ";
                  if (voicingPosition) {
                    noteClass += "bg-purple-600/80 text-white border-2 border-purple-300/40 shadow-lg scale-110 z-10";
                  } else if (isSelected) {
                    noteClass += "bg-blue-500 text-white border-2 border-blue-300/50 shadow-lg scale-110 z-10";
                  } else if (isHighlighted && interval === '1P') {
                    noteClass += "bg-gradient-to-br from-red-600/80 to-rose-500/80 text-white border border-red-400/30";
                  } else if (isHighlighted && (interval === '3M' || interval === '3m')) {
                    noteClass += "bg-gradient-to-br from-green-600/80 to-emerald-500/80 text-white border border-green-400/30";
                  } else if (isHighlighted && interval === '5P') {
                    noteClass += "bg-gradient-to-br from-blue-600/80 to-cyan-500/80 text-white border border-blue-400/30";
                  } else if (isHighlighted) {
                    noteClass += "bg-gradient-to-br from-indigo-600/80 to-violet-500/80 text-white border border-indigo-400/30";
                  } else if (isScalePatternNote) {
                    noteClass += "bg-amber-500/50 text-white border border-amber-400/30";
                  } else {
                    noteClass += "bg-gray-800/30 text-gray-300/70 border border-gray-700/30 hover:bg-gray-700/50 hover:text-white hover:scale-105";
                  }
                  if (showOnlyRelevantNotes && !isRelevant) {
                    noteClass += " opacity-20 scale-75 hover:opacity-100 hover:scale-90";
                  }
                  return (
                    <NoteCell 
                      key={`${stringIndex}-${fret}`}
                      note={note}
                      fret={fret}
                      stringIndex={stringIndex}
                      isSelected={isSelected}
                      interval={interval}
                      isHighlighted={isHighlighted}
                      showDot={showDot}
                      isRelevant={isRelevant}
                      qualityMode={qualityMode}
                      voicingPosition={voicingPosition}
                      showVoicings={showVoicings || singleVoicingMode}
                      isScalePatternNote={isScalePatternNote}
                      onClick={handleNoteClick}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
    )}

    
    
    {/* Color Legend */}
    <div className="mb-8 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 overflow-x-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80 whitespace-nowrap mr-4">Note Colors:</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center whitespace-nowrap">
            <div className="w-3 h-3 rounded-full bg-red-600/80 mr-2 flex-shrink-0"></div>
            <span className="text-white/80 text-xs">Root</span>
          </div>
          <div className="flex items-center whitespace-nowrap">
            <div className="w-3 h-3 rounded-full bg-blue-600/80 mr-2 flex-shrink-0"></div>
            <span className="text-white/80 text-xs">3rd/7th</span>
          </div>
          <div className="flex items-center whitespace-nowrap">
            <div className="w-3 h-3 rounded-full bg-green-600/80 mr-2 flex-shrink-0"></div>
            <span className="text-white/80 text-xs">5th/9th</span>
          </div>
          <div className="flex items-center whitespace-nowrap">
            <div className="w-3 h-3 rounded-full bg-purple-600/80 mr-2 flex-shrink-0"></div>
            <span className="text-white/80 text-xs">Extensions</span>
          </div>
          <div className="flex items-center whitespace-nowrap">
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 mr-2 flex-shrink-0"></div>
            <span className="text-white/80 text-xs">Tensions</span>
          </div>
          <div className="flex items-center whitespace-nowrap">
            <div className="w-3 h-3 rounded-full bg-gray-600/80 mr-2 flex-shrink-0"></div>
            <span className="text-white/80 text-xs">Non-scale</span>
          </div>
        </div>
      </div>
    </div>

    </div>
    
    {/* Tabs Nav - Modern style */}
    <div className="mb-8">
      <div className="flex space-x-1 p-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-inner">
        {['fretboard', 'voicings', 'analysis', 'patterns', 'progressions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              currentTab === tab
                ? 'bg-white/15 text-white shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </div>



    {/* Chord/Scale Detection Section - Only shown on fretboard tab */}
    {currentTab === 'fretboard' && selectedNotes.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-white mb-4">Selected Notes</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedNotes.map((note, index) => (
              <div key={index} className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600/60 text-white font-medium border border-blue-400/30 shadow-md">
                {note}
              </div>
            ))}
          </div>
          
          {detectedChord && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-indigo-300 uppercase tracking-wider mb-2">Detected Chord</h4>
              <div className="bg-indigo-900/30 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-indigo-400/20">
                <span className="text-xl font-semibold">{detectedChord}</span>
              </div>
            </div>
          )}
          
          {suggestedScales.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-indigo-300 uppercase tracking-wider mb-2">Suggested Scales</h4>
              <div className="space-y-2">
                {suggestedScales.map((scale, index) => (
                  <div key={index} className="bg-blue-900/30 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-blue-400/20">
                    {scale}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {chordType && selectedVoicings.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <h3 className="text-xl font-semibold text-white">{`${chordRoot} ${chordTypes.find(c => c.type === chordType)?.label || chordType}`}</h3>
              <button
                onClick={() => setSingleVoicingMode(v => !v)}
                className={`ml-4 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${singleVoicingMode ? 'bg-purple-600/80 text-white' : 'bg-gray-700/40 text-white/70 hover:bg-gray-700/60'}`}
              >
                {singleVoicingMode ? 'Single Voicing Mode: ON' : 'Single Voicing Mode: OFF'}
              </button>
            </div>
            <div className="flex flex-col items-center w-full">
              {/* Chord diagram and navigation */}
              <div className="flex justify-center gap-2 mb-4">
                <button 
                  onClick={previousVoicing}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  disabled={selectedVoicings.length <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button 
                  onClick={handlePlayChord}
                  className="px-4 py-2 rounded-full bg-blue-600/80 hover:bg-blue-600/90 text-white font-medium transition-all duration-200 shadow-lg flex items-center space-x-2"
                >
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Play</span>
                </button>
                <button 
                  onClick={nextVoicing}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  disabled={selectedVoicings.length <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="bg-gray-900/40 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-inner mb-2">
                <div className="grid grid-cols-6 gap-2">
                  {[...Array(6)].map((_, i) => {
                    const stringIndex = reverseStringOrder ? i : 5 - i;
                    const tuning = tunings[currentTuning][stringIndex];
                    const fret = selectedVoicings[currentVoicingIndex].frets[stringIndex];
                    const finger = selectedVoicings[currentVoicingIndex].fingers?.[stringIndex] || '';
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800/70 text-gray-300 border border-gray-700/50 mb-1">
                          {tuning}
                        </div>
                        <div className="h-32 w-1 bg-gradient-to-b from-blue-400/20 to-indigo-400/20 rounded-full relative">
                          {fret !== 'x' ? (
                            <div 
                              className="absolute w-8 h-8 -translate-x-1/2 translate-y-1/2 left-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg border border-white/20"
                              style={{ bottom: `${Math.min(parseInt(fret, 10) * 20, 100)}%` }}
                            >
                              {finger !== '0' ? finger : ''}
                            </div>
                          ) : (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-red-400 text-xl font-bold">
                              ×
                            </div>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          {fret !== 'x' ? fret : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {currentVoicingIndex + 1} of {selectedVoicings.length} voicings
              </div>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Scale Patterns Tab */}
    {currentTab === 'patterns' && scaleType && (
      <ScalePatterns
        scaleRoot={chordRoot}
        scaleType={scaleType}
        fretboardWidth={800}
        onSelectPattern={handleSelectPattern}
      />
    )}
    
    {/* Chord Progressions Tab */}
    {currentTab === 'progressions' && chordRoot && (
      <ChordProgressions
        chordRoot={chordRoot}
        chordType={chordType || 'M'}
      />
    )}

    {/* Analysis View Tab */}
    {currentTab === 'analysis' && (
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chord Analysis Section */}
          <div>
            <div className="bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] rounded-2xl p-6 shadow-xl">
              <h3 className="text-[var(--warning)] text-lg font-semibold mb-4">Chord Analysis</h3>
              
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-[var(--text-secondary)]">Root:</label>
                  <select
                    value={chordRoot}
                    onChange={(e) => setChordRoot(e.target.value)}
                    className="w-full bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl px-4 py-2.5"
                  >
                    {allNotes.map((note) => (
                      <option key={note} value={note}>{note}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-[var(--text-secondary)]">Chord Type:</label>
                  <select
                    value={chordType}
                    onChange={(e) => {
                      setChordType(e.target.value);
                      setScaleType('');
                    }}
                    className="w-full bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl px-4 py-2.5"
                  >
                    <option value="">None</option>
                    {chordTypes.map((c) => (
                      <option key={c.label} value={c.type}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {chordType && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Chord Notes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Tonal.Chord.getChord(chordType, chordRoot).notes.map((note, i) => (
                          <div key={note} 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium
                              ${i === 0 ? 'bg-red-500' : (i === 2 ? 'bg-green-500' : 'bg-blue-400')}`}
                            title={i === 0 ? 'Root' : (i === 2 ? '5th' : '3rd')}
                          >
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Intervals:</h4>
                      <div className="bg-gray-900/60 px-3 py-2 rounded-md text-sm text-green-400 font-mono">
                        {Tonal.Chord.getChord(chordType, chordRoot).intervals.join(' - ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Common Progressions:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="bg-[var(--card-hover)] text-[var(--text-primary)] p-2 rounded-md">
                        <div className="flex flex-wrap gap-2 mb-1">
                          {[chordRoot, Tonal.Note.transpose(chordRoot, '4P'), Tonal.Note.transpose(chordRoot, '5P')].map((note, i) => (
                            <span key={i} className={`px-2 py-1 rounded-md ${isGlassmorphism ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'} text-xs font-medium`}>
                              {note}{i === 0 ? '' : (i === 1 ? '4' : '5')}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">I-IV-V (Most common progression)</p>
                      </div>
                      
                      <div className="bg-[var(--card-hover)] text-[var(--text-primary)] p-2 rounded-md">
                        <div className="flex flex-wrap gap-2 mb-1">
                          {[
                            `${chordRoot}`, 
                            `${Tonal.Note.transpose(chordRoot, '3M')}m`, 
                            `${Tonal.Note.transpose(chordRoot, '4P')}`, 
                            `${Tonal.Note.transpose(chordRoot, '5P')}`
                          ].map((chord, i) => (
                            <span key={i} className={`px-2 py-1 rounded-md ${isGlassmorphism ? 'bg-purple-900 text-purple-100' : 'bg-purple-100 text-purple-800'} text-xs font-medium`}>
                              {chord}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">I-iii-IV-V (Pop progression)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handlePlayChord}
                      className="bg-[var(--success)] hover:bg-[var(--success-hover)] text-white rounded-md px-4 py-2"
                    >
                      <span className="mr-2">🔊</span>
                      <span>Play Chord</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Scale Analysis Section */}
          <div>
            <div className="bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] rounded-2xl p-6 shadow-xl">
              <h3 className="text-[var(--warning)] text-lg font-semibold mb-4">Scale Analysis</h3>
              
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-[var(--text-secondary)]">Root:</label>
                  <select
                    value={chordRoot}
                    onChange={(e) => setChordRoot(e.target.value)}
                    className="w-full bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl px-4 py-2.5"
                  >
                    {allNotes.map((note) => (
                      <option key={note} value={note}>{note}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-[var(--text-secondary)]">Scale Type:</label>
                  <select
                    value={scaleType}
                    onChange={(e) => {
                      setScaleType(e.target.value);
                      setChordType('');
                    }}
                    className="w-full bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl px-4 py-2.5"
                  >
                    <option value="">None</option>
                    {scaleTypes.map((s) => (
                      <option key={s.label} value={s.type}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {scaleType && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Scale Notes:</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Tonal.Scale.get(`${chordRoot} ${scaleType}`).notes.map((note, i) => (
                          <div key={note} 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium
                              ${i === 0 ? 'bg-red-500' : (i === 4 ? 'bg-green-500' : 'bg-blue-400')}`}
                          >
                            {note}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => setCurrentTab('patterns')}
                          className="bg-[var(--success)] hover:bg-[var(--success-hover)] text-white rounded-md px-4 py-2"
                        >
                          View Scale Patterns
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Key Chords:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['M', 'm', 'm', 'M', 'M', 'm', 'dim'].map((type, i) => {
                          const degree = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'][i];
                          const scaleDegree = Tonal.Scale.get(`${chordRoot} ${scaleType}`).notes[i] || '';
                          return (
                            <div key={i} className={`p-2 rounded-md ${isGlassmorphism ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-between`}>
                              <span className={`text-xs ${isGlassmorphism ? 'text-gray-300' : 'text-gray-600'}`}>{degree}</span>
                              <span className={`text-sm ${isGlassmorphism ? 'text-white' : 'text-gray-800'} font-medium`}>
                                {scaleDegree}{type === 'M' ? '' : type}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Note Selection Analysis */}
              {selectedNotes.length > 0 && (
                <div className="mt-6 border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Your Selected Notes:</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedNotes.map((note, i) => (
                      <div key={i} className="px-2 py-1 rounded-md bg-gray-700 text-white text-xs">
                        {note}
                      </div>
                    ))}
                  </div>
                  
                  {detectedChord && (
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold text-green-400">Detected Chord:</h4>
                      <div className={`mt-1 px-3 py-2 rounded-md ${isGlassmorphism ? 'bg-gray-700' : 'bg-gray-200'} text-white`}>{detectedChord}</div>
                    </div>
                  )}
                  
                  {suggestedScales.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold text-blue-400">Suggested Scales:</h4>
                      <ul className="mt-1 space-y-1">
                        {suggestedScales.map((scale, i) => (
                          <li key={i} className={`px-3 py-2 rounded-md ${isGlassmorphism ? 'bg-gray-700' : 'bg-gray-200'} text-white`}>
                            {scale}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Fretboard Display */}
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Fretboard</h3>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setReverseStringOrder(!reverseStringOrder)}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white/80 hover:text-white"
          >
            {reverseStringOrder ? 'High E → Low E' : 'Low E → High E'}
          </button>
          <button 
            onClick={() => setShowOnlyRelevantNotes(!showOnlyRelevantNotes)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 ${
              showOnlyRelevantNotes 
                ? 'bg-blue-600/80 text-white' 
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            Show Scale Notes
          </button>
        </div>
      </div>
      

    </div>
    

    </div>
    </Layout>
  );
}

export default FretboardPage;
