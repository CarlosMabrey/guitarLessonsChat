import { useCallback, useEffect, useRef } from 'react';
import * as Tone from 'tone';

// Audio context initialization
let initialized = false;

const useFretboardAudio = () => {
  // Use refs for audio nodes to maintain stable references
  const sampler = useRef(null);
  const distortion = useRef(null);
  const reverb = useRef(null);
  const delay = useRef(null);
  const filter = useRef(null);
  const compressor = useRef(null);
  const limiter = useRef(null);
  const output = useRef(null);
  
  // Initialize audio context and effects
  const initAudio = useCallback(async () => {
    if (initialized) return;
    
    await Tone.start();
    
    // Create effects chain
    distortion.current = new Tone.Distortion(0.4).toDestination();
    reverb.current = new Tone.Reverb(1.5).toDestination();
    delay.current = new Tone.FeedbackDelay({
      delayTime: 0.25,
      feedback: 0.4,
      wet: 0.3
    }).toDestination();
    
    filter.current = new Tone.Filter(8000, 'lowpass').toDestination();
    compressor.current = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.1,
      release: 0.2
    }).toDestination();
    
    limiter.current = new Tone.Limiter(-6).toDestination();
    
    // Create sampler with guitar samples
    sampler.current = new Tone.Sampler({
      urls: {
        'A0': 'A0.mp3',
        'C1': 'C1.mp3',
        'D#1': 'Ds1.mp3',
        'F#1': 'Fs1.mp3',
        'A1': 'A1.mp3',
        'C2': 'C2.mp3',
        'D#2': 'Ds2.mp3',
        'F#2': 'Fs2.mp3',
        'A2': 'A2.mp3',
        'C3': 'C3.mp3',
        'D#3': 'Ds3.mp3',
        'F#3': 'Fs3.mp3',
        'A3': 'A3.mp3',
        'C4': 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        'A4': 'A4.mp3',
        'C5': 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        'A5': 'A5.mp3',
        'C6': 'C6.mp3',
        'D#6': 'Ds6.mp3',
        'F#6': 'Fs6.mp3',
        'A6': 'A6.mp3',
        'C7': 'C7.mp3',
        'D#7': 'Ds7.mp3',
        'F#7': 'Fs7.mp3',
        'A7': 'A7.mp3',
        'C8': 'C8.mp3'
      },
      release: 1,
      baseUrl: '/samples/guitar-acoustic/'
    });
    
    // Connect the audio chain
    sampler.current.chain(
      filter.current,
      distortion.current,
      delay.current,
      reverb.current,
      compressor.current,
      limiter.current,
      Tone.Destination
    );
    
    initialized = true;
  }, []);
  
  // Play a single note
  const playNote = useCallback(async (note, duration = '8n', velocity = 0.8) => {
    if (!initialized) {
      await initAudio();
    }
    
    try {
      // Ensure note is in a playable range (A0 to C8)
      let octave = 4; // Default octave for notes without one
      let noteName = note;
      
      // Extract octave if present
      const match = note.match(/([A-Ga-g][#b]?)(\d*)/);
      if (match) {
        noteName = match[1];
        if (match[2]) {
          octave = parseInt(match[2], 10);
        }
      }
      
      // Clamp octave to valid range
      octave = Math.min(8, Math.max(0, octave));
      
      // Play the note
      sampler.current.triggerAttackRelease(`${noteName}${octave}`, duration, undefined, velocity);
    } catch (error) {
      console.error('Error playing note:', error);
    }
  }, [initAudio]);
  
  // Play a chord (array of notes)
  const playChord = useCallback(async (notes, strum = true, duration = 2) => {
    if (!initialized) {
      await initAudio();
    }
    
    if (!notes || !notes.length) return;
    
    try {
      if (strum) {
        // Strum the chord (play notes in sequence quickly)
        const now = Tone.now();
        const strumDelay = 0.05; // 50ms between notes for strumming
        
        notes.forEach((note, i) => {
          // Reverse the strum direction if needed (higher strings first)
          const strumTime = now + (i * strumDelay);
          playNote(note, duration, 0.7).catch(console.error);
        });
      } else {
        // Play all notes at once
        const now = Tone.now();
        notes.forEach(note => {
          sampler.current.triggerAttack(note, now, 0.7);
        });
        sampler.current.releaseAll(now + duration);
      }
    } catch (error) {
      console.error('Error playing chord:', error);
    }
  }, [initAudio, playNote]);
  
  // Clean up audio resources on unmount
  useEffect(() => {
    return () => {
      if (sampler.current) {
        sampler.current.releaseAll();
        sampler.current.dispose();
      }
      [distortion, reverb, delay, filter, compressor, limiter].forEach(effect => {
        if (effect.current) {
          effect.current.dispose();
        }
      });
    };
  }, []);
  
  return {
    playNote,
    playChord,
    initAudio,
    // Optional: expose effects for UI controls
    setDistortion: (amount) => {
      if (distortion.current) distortion.current.wet.value = amount;
    },
    setReverb: (amount) => {
      if (reverb.current) reverb.current.wet.value = amount;
    },
    setDelay: (amount) => {
      if (delay.current) delay.current.wet.value = amount;
    },
    setFilterFrequency: (freq) => {
      if (filter.current) filter.current.frequency.value = freq;
    }
  };
};

export default useFretboardAudio;
