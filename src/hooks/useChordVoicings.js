import { useMemo, useCallback } from 'react';
import * as Tonal from 'tonal';
import { allNotes, tunings, chordVoicings } from '@/lib/musicTheory';
import { adaptVoicingsToTuning } from '@/lib/tuningUtils';

/**
 * Custom hook for managing chord voicings and related calculations
 */
const useChordVoicings = (chordRoot, chordType, currentTuning, voicingFretRange, voicingStringSet) => {
  // Get all available voicings for the current chord and tuning
  const getVoicings = useMemo(() => {
    if (!chordType || !chordRoot) return [];
    
    const voicingKey = `${chordRoot}-${chordType}`;
    const standardVoicings = chordVoicings[voicingKey] || [];
    
    // Adapt voicings to current tuning if needed
    return adaptVoicingsToTuning(standardVoicings, 'Standard', currentTuning);
  }, [chordRoot, chordType, currentTuning]);
  
  // Filter voicings based on current filters (string set, fret range)
  const filteredVoicings = useMemo(() => {
    if (!getVoicings.length) return [];
    
    return getVoicings.filter(voicing => {
      // Fret range filter
      const frets = voicing.frets.map(f => (f === 'x' ? null : parseInt(f, 10)));
      const minFret = Math.min(...frets.filter(f => f !== null));
      const maxFret = Math.max(...frets.filter(f => f !== null));
      
      if (minFret < voicingFretRange[0] || maxFret > voicingFretRange[1]) {
        return false;
      }
      
      // String set filter
      if (voicingStringSet === 'all') return true;
      
      const stringCount = voicing.frets.length;
      
      if (voicingStringSet === '1-3') {
        // Only top 3 strings (high E, B, G)
        return [stringCount-3, stringCount-2, stringCount-1].every(
          i => i >= 0 && voicing.frets[i] !== 'x'
        );
      }
      
      if (voicingStringSet === '2-4') {
        // Middle 3 strings (B, G, D)
        return [stringCount-4, stringCount-3, stringCount-2].every(
          i => i >= 0 && voicing.frets[i] !== 'x'
        );
      }
      
      if (voicingStringSet === '4-6') {
        // Bottom 3 strings (D, A, low E)
        return [0, 1, 2].every(
          i => i < stringCount && voicing.frets[i] !== 'x'
        );
      }
      
      return true;
    });
  }, [getVoicings, voicingFretRange, voicingStringSet]);
  
  // Get chord notes for the current voicing
  const getVoicingNotes = useMemo(() => {
    if (!chordType || !chordRoot) return [];
    
    try {
      return Tonal.Chord.getChord(chordType, chordRoot).notes;
    } catch (e) {
      console.error('Error getting chord notes:', e);
      return [];
    }
  }, [chordRoot, chordType]);
  
  // Get interval structure of the chord
  const getIntervalStructure = useMemo(() => {
    if (!chordType || !chordRoot) return [];
    
    try {
      return Tonal.Chord.get(chordType, chordRoot).intervals;
    } catch (e) {
      console.error('Error getting chord intervals:', e);
      return [];
    }
  }, [chordRoot, chordType]);
  
  // Get the current tuning notes
  const getTuningNotes = useMemo(() => {
    return tunings[currentTuning] || [];
  }, [currentTuning]);
  
  // Generate all possible inversions of the current chord
  const getInversions = useMemo(() => {
    if (!chordType || !chordRoot) return [];
    
    try {
      const chord = Tonal.Chord.get(chordType, chordRoot);
      const inversions = [chord.tonic];
      
      // Generate all inversions
      for (let i = 1; i < chord.notes.length; i++) {
        const inversion = Tonal.Chord.getChord(chordType, chord.notes[i]).notes;
        inversions.push(inversion[0]);
      }
      
      return inversions;
    } catch (e) {
      console.error('Error generating inversions:', e);
      return [];
    }
  }, [chordRoot, chordType]);
  
  // Get the notes for a specific voicing
  const getNotesForVoicing = useCallback((voicing) => {
    if (!voicing || !voicing.frets || !voicing.strings) return [];
    
    return voicing.frets.map((fret, i) => {
      if (fret === 'x') return null;
      
      const stringNote = voicing.strings[i];
      if (!stringNote) return null;
      
      try {
        return Tonal.Note.transpose(stringNote, Tonal.Interval.fromSemitones(parseInt(fret, 10)));
      } catch (e) {
        console.error('Error calculating note for voicing:', e);
        return null;
      }
    }).filter(Boolean);
  }, []);
  
  // Check if a note is part of the current chord
  const isChordTone = useCallback((note) => {
    if (!chordType || !chordRoot) return false;
    
    try {
      const chord = Tonal.Chord.get(chordType, chordRoot);
      return chord.notes.some(chordNote => 
        Tonal.Note.pitchClass(chordNote) === Tonal.Note.pitchClass(note)
      );
    } catch (e) {
      console.error('Error checking chord tone:', e);
      return false;
    }
  }, [chordRoot, chordType]);
  
  return {
    // Data
    allVoicings: getVoicings,
    filteredVoicings,
    chordNotes: getVoicingNotes,
    intervalStructure: getIntervalStructure,
    tuningNotes: getTuningNotes,
    inversions: getInversions,
    
    // Methods
    getNotesForVoicing,
    isChordTone,
    adaptVoicingsToTuning
  };
};

export default useChordVoicings;
