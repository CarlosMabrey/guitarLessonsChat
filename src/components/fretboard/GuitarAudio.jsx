import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';

// Cache for loaded samples
const sampleCache = {};

// Guitar frequencies by note and string
const STRING_FREQUENCIES = {
  E4: 329.63, // 1st string
  B3: 246.94, // 2nd string
  G3: 196.00, // 3rd string
  D3: 146.83, // 4th string
  A2: 110.00, // 5th string
  E2: 82.41,  // 6th string
};

// Sample URLs (assuming these are in your public directory)
// These would need to be actual sample files on your server
const SAMPLE_URLS = {
  'E4': '/audio/guitar/E4.mp3',
  'B3': '/audio/guitar/B3.mp3',
  'G3': '/audio/guitar/G3.mp3',
  'D3': '/audio/guitar/D3.mp3',
  'A2': '/audio/guitar/A2.mp3',
  'E2': '/audio/guitar/E2.mp3',
};

// If no samples available, we'll create a guitar synth approximation 
const createGuitarSynth = () => {
  // Create a polyphonic synth for multiple notes
  const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  
  // Configure the synth to sound more guitar-like
  synth.set({
    oscillator: {
      type: 'fmsine', // Use a frequency modulation sine wave
    },
    envelope: {
      attack: 0.001,  // Fast attack
      decay: 1.2,     // Longer decay
      sustain: 0.3,   // Medium sustain
      release: 1.8,   // Long release
    },
    volume: -10,      // Lower volume
  });
  
  // Add effects
  const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination();
  const reverb = new Tone.Reverb(1.5).toDestination();
  synth.connect(chorus);
  synth.connect(reverb);
  
  return synth;
};

// Ensure note is in proper Tone.js format
const formatNote = (note) => {
  // Convert notes like "C/4" to "C4"
  if (note.includes('/')) {
    return note.replace('/', '');
  }
  
  // If note has no octave, add default octave 4
  if (!note.match(/[0-9]$/)) {
    return `${note}4`;
  }
  
  return note;
};

const GuitarAudio = () => {
  const synthRef = useRef(null);
  const samplerRef = useRef(null);
  const isInitializedRef = useRef(false);
  
  // Check if synth is valid and recreate if needed
  const ensureSynth = () => {
    // If synth doesn't exist or was disposed, create a new one
    if (!synthRef.current || synthRef.current.disposed) {
      synthRef.current = createGuitarSynth();
    }
    return synthRef.current;
  };
  
  // Initialize Tone.js and create instruments on component mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    // Initialize guitar synth as a fallback
    synthRef.current = createGuitarSynth();
    
    // Try to load samples for better sound quality
    try {
      // Check if we already have the samples cached
      if (!Object.keys(sampleCache).length) {
        samplerRef.current = new Tone.Sampler(SAMPLE_URLS).toDestination();
        
        // Add some guitar-like effects
        const chorus = new Tone.Chorus(2.5, 0.5, 0.5).toDestination();
        samplerRef.current.connect(chorus);
        
        // Cache the sampler
        Object.assign(sampleCache, { sampler: samplerRef.current });
      } else {
        // Use cached sampler
        samplerRef.current = sampleCache.sampler;
      }
      
      samplerRef.current.onload = () => {
        console.log('Guitar samples loaded');
      };
    } catch (e) {
      console.warn('Failed to load guitar samples:', e);
    }
    
    isInitializedRef.current = true;
    
    // Cleanup on unmount
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
      // Don't dispose sampler since it's cached
    };
  }, []);
  
  // Helper function to play a note with octave
  const playNote = (note, duration = 1.5) => {
    // Make sure the audio context is running
    if (Tone.context.state !== 'running') {
      Tone.context.resume();
    }
    
    // Format the note properly for Tone.js
    const formattedNote = formatNote(note);

    // Try to use the sampler first
    if (samplerRef.current && samplerRef.current.loaded) {
      try {
        // Find the closest string to the note for more realistic sound
        let closestString = 'E4';
        let minDistance = Infinity;
        const noteFreq = Tone.Frequency(formattedNote).toFrequency();
        
        Object.entries(STRING_FREQUENCIES).forEach(([string, freq]) => {
          const distance = Math.abs(noteFreq - freq);
          if (distance < minDistance) {
            minDistance = distance;
            closestString = string;
          }
        });
        
        // Calculate pitch shift based on closest string
        const basePitch = Tone.Frequency(closestString).toMidi();
        const targetPitch = Tone.Frequency(formattedNote).toMidi();
        const pitchShift = targetPitch - basePitch;
        
        // Apply some randomness to velocity for more natural sound
        const velocity = 0.5 + Math.random() * 0.5;
        
        // Trigger attack-release with the appropriate string sample
        samplerRef.current.triggerAttackRelease(
          formattedNote, 
          duration, 
          Tone.now(), 
          velocity
        );
      } catch (e) {
        console.warn('Error playing note with sampler:', e);
        // Fallback to synth if sampler fails
        const synth = ensureSynth();
        synth.triggerAttackRelease(formattedNote, duration);
      }
    } 
    // Fallback to synth
    else {
      try {
        const synth = ensureSynth();
        synth.triggerAttackRelease(formattedNote, duration);
      } catch (e) {
        console.error('Failed to play note:', e);
      }
    }
  };
  
  // Play a chord with slightly staggered timing for realism
  const playChord = (notes, strum = true, duration = 2) => {
    // Make sure the audio context is running
    if (Tone.context.state !== 'running') {
      Tone.context.resume();
    }
    
    // If there are no notes to play, return
    if (!notes || notes.length === 0) {
      return;
    }
    
    // If no strum effect requested, play all at once
    if (!strum) {
      if (samplerRef.current && samplerRef.current.loaded) {
        try {
          notes.forEach(note => {
            const formattedNote = formatNote(note);
            samplerRef.current.triggerAttackRelease(formattedNote, duration, Tone.now(), 0.7);
          });
        } catch (e) {
          console.warn('Error playing chord with sampler:', e);
          // Fallback to synth
          try {
            const synth = ensureSynth();
            const formattedNotes = notes.map(formatNote);
            synth.triggerAttackRelease(formattedNotes, duration);
          } catch (e) {
            console.error('Failed to play chord:', e);
          }
        }
      } else {
        try {
          const synth = ensureSynth();
          const formattedNotes = notes.map(formatNote);
          synth.triggerAttackRelease(formattedNotes, duration);
        } catch (e) {
          console.error('Failed to play chord:', e);
        }
      }
      return;
    }
    
    // Add strum effect with slightly staggered timing
    const strumDuration = 0.08; // 80ms between notes
    
    notes.forEach((note, index) => {
      const formattedNote = formatNote(note);
      const delay = index * strumDuration;
      
      if (samplerRef.current && samplerRef.current.loaded) {
        try {
          // Random velocity between 0.5 and 1.0 for more natural sound
          const velocity = 0.5 + Math.random() * 0.5;
          samplerRef.current.triggerAttackRelease(
            formattedNote, 
            duration, 
            Tone.now() + delay, 
            velocity
          );
        } catch (e) {
          console.warn(`Error playing strummed note ${formattedNote} with sampler:`, e);
        }
      } else {
        try {
          const synth = ensureSynth();
          synth.triggerAttackRelease(
            formattedNote, 
            duration, 
            Tone.now() + delay
          );
        } catch (e) {
          console.error(`Failed to play strummed note ${formattedNote}:`, e);
        }
      }
    });
  };
  
  return { playNote, playChord };
};

export default GuitarAudio; 