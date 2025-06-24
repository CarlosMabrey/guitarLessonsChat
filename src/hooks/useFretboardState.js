import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Tonal from 'tonal';
import { allNotes, tunings, chordTypes, scaleTypes, chordVoicings } from '@/lib/musicTheory';
import { adaptVoicingsToTuning } from '@/lib/tuningUtils';

// Fretboard display constants
export const fretMarkers = [3, 5, 7, 9, 12];

// Helper to get the note at a specific fret
export const getFretNote = (openNote, fret) => {
  try {
    // Convert the open note to a standard MIDI note (add octave 4 for consistent comparison)
    const openNoteWithOctave = Tonal.Note.pitchClass(openNote) + '4';
    const midiValue = Tonal.Note.midi(openNoteWithOctave);
    
    if (midiValue === null) return ''; // Invalid note
    
    // Calculate the new MIDI value after adding frets
    const newMidiValue = (midiValue + fret) % 12;
    
    // Convert back to note name using allNotes array for consistent sharp notation
    return allNotes[newMidiValue];
  } catch (e) {
    console.error('Error in getFretNote:', e);
    return '';
  }
};

export const useFretboardState = () => {
  // Core state
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
  const [reverseStringOrder, setReverseStringOrder] = useState(true);
  const [showScalePatterns, setShowScalePatterns] = useState(false);
  const [showChordProgressions, setShowChordProgressions] = useState(false);
  const [currentScalePattern, setCurrentScalePattern] = useState(null);
  const [patternFretShift, setPatternFretShift] = useState(0);
  const [strumDirection, setStrumDirection] = useState('down');
  const [currentTab, setCurrentTab] = useState('fretboard');
  const [singleVoicingMode, setSingleVoicingMode] = useState(false);
  const [voicingStringSet, setVoicingStringSet] = useState('all');
  const [voicingFretRange, setVoicingFretRange] = useState([0, 12]);
  const [displayDropdownOpen, setDisplayDropdownOpen] = useState(false);

  // Get strings array based on tuning and display orientation
  const getTuningStrings = useCallback(() => {
    const tuningArray = [...tunings[currentTuning]];
    return reverseStringOrder ? tuningArray : tuningArray.reverse();
  }, [currentTuning, reverseStringOrder]);

  const strings = useMemo(() => getTuningStrings(), [getTuningStrings]);
  const frets = useMemo(() => Array.from({ length: 13 }, (_, i) => i), []);

  // Helper function to normalize notes to consistent sharp notation using MIDI numbers
  const normalizeToSharp = (note) => {
    if (!note) return '';
    
    // Add octave for valid MIDI conversion and convert to MIDI number
    const midiValue = Tonal.Note.midi(Tonal.Note.pitchClass(note) + '4');
    
    if (midiValue === null) return note; // Return original if conversion failed
    
    // Use consistent array for sharp notation - same as in allNotes
    return allNotes[midiValue % 12];
  };

  // Compute highlighted notes based on chord or scale selection
  const highlightedNotes = useMemo(() => {
    if (chordType) {
      // Get chord notes and normalize to consistent sharp notation
      return Tonal.Chord.getChord(chordType, chordRoot).notes
        .map(note => normalizeToSharp(note));
    } else if (scaleType) {
      // Get scale notes and normalize to consistent sharp notation
      return Tonal.Scale.get(`${chordRoot} ${scaleType}`).notes
        .map(note => normalizeToSharp(note));
    }
    return [];
  }, [chordRoot, chordType, scaleType]);

  // Create interval mapping for color coding
  const intervalMap = useMemo(() => {
    if (chordType) {
      return Tonal.Chord.get(chordType, chordRoot).intervals.reduce((acc, intv) => {
        // Get the note for this interval and normalize it to sharp notation
        const rawNote = Tonal.Note.pitchClass(Tonal.Note.transpose(chordRoot, intv));
        const normalizedNote = normalizeToSharp(rawNote);
        
        // Store the interval using the normalized (sharp) note name as the key
        acc[normalizedNote] = intv;
        
        return acc;
      }, {});
    } else if (scaleType) {
      return Tonal.Scale.get(`${chordRoot} ${scaleType}`).intervals.reduce((acc, intv) => {
        // Get the note for this interval and normalize it to sharp notation
        const rawNote = Tonal.Note.pitchClass(Tonal.Note.transpose(chordRoot, intv));
        const normalizedNote = normalizeToSharp(rawNote);
        
        // Store the interval using the normalized (sharp) note name as the key
        acc[normalizedNote] = intv;
        
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
      } else {
        setShowVoicings(false);
      }
    } else {
      setSelectedVoicings([]);
      setShowVoicings(false);
    }
  }, [chordRoot, chordType, currentTuning]);

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

  // Navigate through voicings
  const nextVoicing = useCallback(() => {
    if (selectedVoicings.length > 1) {
      setCurrentVoicingIndex((prev) => (prev + 1) % selectedVoicings.length);
    }
  }, [selectedVoicings.length]);
  
  const previousVoicing = useCallback(() => {
    if (selectedVoicings.length > 1) {
      setCurrentVoicingIndex((prev) => (prev === 0 ? selectedVoicings.length - 1 : prev - 1));
    }
  }, [selectedVoicings.length]);
  
  // Select a specific voicing by index
  const selectVoicing = useCallback((index) => {
    if (selectedVoicings.length > index) {
      setCurrentVoicingIndex(index);
      setShowVoicings(true);
    }
  }, [selectedVoicings.length]);

  // Reset all selections
  const resetSelections = useCallback(() => {
    setSelectedNotes([]);
    setChordType('');
    setScaleType('');
    setShowVoicings(false);
  }, []);

  // Toggle strum direction
  const toggleStrumDirection = useCallback(() => {
    setStrumDirection(prev => {
      if (prev === 'down') return 'up';
      if (prev === 'up') return 'none';
      return 'down';
    });
  }, []);

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
    if (currentVoicingIndex >= filteredVoicings.length && filteredVoicings.length > 0) {
      setCurrentVoicingIndex(0);
    }
  }, [filteredVoicings, currentVoicingIndex]);

  // Export all state and handlers
  return {
    // State
    selectedNotes,
    currentTuning,
    chordRoot,
    chordType,
    scaleType,
    showVoicings,
    selectedVoicings: filteredVoicings,
    currentVoicingIndex,
    detectedChord,
    suggestedScales,
    showOnlyRelevantNotes,
    qualityMode,
    showVoicingOverScale,
    reverseStringOrder,
    showScalePatterns,
    showChordProgressions,
    currentScalePattern,
    patternFretShift,
    strumDirection,
    currentTab,
    singleVoicingMode,
    voicingStringSet,
    voicingFretRange,
    displayDropdownOpen,
    strings,
    frets,
    highlightedNotes,
    intervalMap,
    
    // Setters
    setSelectedNotes,
    setCurrentTuning,
    setChordRoot,
    setChordType,
    setScaleType,
    setShowVoicings,
    setSelectedVoicings,
    setCurrentVoicingIndex,
    setDetectedChord,
    setSuggestedScales,
    setQualityMode,
    setShowVoicingOverScale,
    setReverseStringOrder,
    setShowScalePatterns,
    setShowChordProgressions,
    setCurrentScalePattern,
    setPatternFretShift,
    setStrumDirection,
    setCurrentTab,
    setSingleVoicingMode,
    setVoicingStringSet,
    setVoicingFretRange,
    setDisplayDropdownOpen,
    
    // Handlers
    toggleNote,
    nextVoicing,
    previousVoicing,
    selectVoicing,
    resetSelections,
    toggleStrumDirection
  };
};

export default useFretboardState;
