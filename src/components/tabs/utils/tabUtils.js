/**
 * Tab Visualizer Utilities
 * Helper functions for tab visualization and processing
 */

import { Note } from '@tonaljs/tonal';
import { toMidi, midiToNoteName } from '@tonaljs/midi';

// Helper function to convert array buffer to base64
export const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Helper to convert MIDI note to string/fret
export const midiToGuitarPosition = (midiNote) => {
  // Standard tuning MIDI notes: E2=40, A2=45, D3=50, G3=55, B3=59, E4=64
  const stringNotes = [40, 45, 50, 55, 59, 64]; // Lowest note on each string (E2 to E4)
  
  for (let string = 0; string < stringNotes.length; string++) {
    const openStringNote = stringNotes[string];
    if (midiNote >= openStringNote) {
      const fret = midiNote - openStringNote;
      if (fret <= 24) { // Reasonable fret limit
        return {
          string: 6 - string, // Convert to 1-6 string numbering (1=low E, 6=high E)
          fret: fret,
          noteName: midiToNoteName(midiNote, { sharps: true })
        };
      }
    }
  }
  return null; // Note can't be played on guitar in standard tuning
};

/**
 * Converts string and fret to a note name
 */
export const getNoteFromStringFret = (stringNote, fret) => {
  try {
    return Note.transpose(stringNote, Note.fromFret(fret));
  } catch (error) {
    console.error('Error getting note from string/fret:', { stringNote, fret, error });
    return null;
  }
};

// Get note name from MIDI note number
export const getNoteName = (midiNote) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteName = notes[midiNote % 12];
  const octave = Math.floor(midiNote / 12) - 1;
  return `${noteName}${octave}`;
};

// Format time for display (mm:ss:ms)
export const formatTime = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};

// Calculate total duration of the tab in milliseconds
export const calculateTotalDuration = (notes) => {
  if (!notes || !Array.isArray(notes) || notes.length === 0) {
    return 0;
  }
  
  // Find the note that ends last
  const lastNote = notes.reduce((latest, note) => {
    const noteEnd = note.time + note.duration;
    return noteEnd > latest ? noteEnd : latest;
  }, 0);
  
  return lastNote + 1000; // Add 1 second buffer at the end
};

// Get current measure based on current time
export const getCurrentMeasure = (currentTime, measures) => {
  if (!measures || !Array.isArray(measures) || measures.length === 0) {
    return 0;
  }
  
  // Find the measure where currentTime falls
  for (let i = 0; i < measures.length; i++) {
    const measure = measures[i];
    if (!measure || measure.length === 0) continue;
    
    const measureStart = measure[0].time;
    const nextMeasure = measures[i + 1];
    const measureEnd = nextMeasure && nextMeasure[0] ? 
      nextMeasure[0].time : measure[measure.length - 1].time + measure[measure.length - 1].duration;
    
    if (currentTime >= measureStart && currentTime < measureEnd) {
      return i;
    }
  }
  
  return 0;
};
