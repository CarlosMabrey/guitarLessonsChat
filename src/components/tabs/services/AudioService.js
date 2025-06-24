/**
 * AudioService.js
 * Handles audio playback for the tab visualizer
 */

import { toMidi } from '@tonaljs/midi';

class AudioService {
  constructor() {
    this.audioContext = null;
    this.activeOscillators = {};
    this.volume = 0.5;
  }

  initialize() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (err) {
        console.error('Web Audio API not supported:', err);
      }
    }
    return this;
  }

  setVolume(volume) {
    this.volume = volume;
  }

  getVolume() {
    return this.volume;
  }

  // Play a note using Web Audio API
  playNote(midiNote) {
    if (!this.audioContext || this.audioContext.state === 'closed' || this.volume === 0) return;
    
    // Resume audio context if it's suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Convert MIDI note to frequency
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    const noteId = `note-${midiNote}-${Date.now()}`;
    
    try {
      // Create oscillator
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Set oscillator type and frequency
      oscillator.type = 'triangle'; // 'sine', 'square', 'sawtooth', 'triangle'
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      // Connect oscillator to gain node and then to output
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set volume
      gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime); // Lower volume by default
      
      // Apply envelope
      gainNode.gain.exponentialRampToValueAtTime(
        0.001, this.audioContext.currentTime + 1.5
      );
      
      // Start the oscillator
      oscillator.start();
      
      // Store the oscillator to be able to stop it later
      this.activeOscillators[noteId] = oscillator;
      
      // Stop the oscillator after a short duration
      setTimeout(() => {
        if (this.activeOscillators[noteId]) {
          oscillator.stop();
          delete this.activeOscillators[noteId];
        }
      }, 1500);
    } catch (err) {
      console.error('Error playing note:', err);
    }
  }

  // Play a note given string and fret information
  playGuitarNote(stringNumber, fret, stringTuning) {
    // Standard tuning array, from low E to high E: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
    if (!stringTuning || stringNumber < 1 || stringNumber > 6) return;
    
    // Calculate MIDI note number from string and fret
    const stringIndex = 6 - stringNumber; // Convert to 0-based index (6th string = index 0)
    const baseNote = toMidi(stringTuning[stringIndex]); // Base MIDI note for open string
    const midiNote = baseNote + fret; // Add fret number to get actual MIDI note
    
    this.playNote(midiNote);
  }

  // Stop all active oscillators
  stopAllNotes() {
    Object.values(this.activeOscillators).forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.activeOscillators = {};
  }

  // Close audio context when component unmounts
  cleanup() {
    this.stopAllNotes();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch (e) {}
    }
  }
}

// Singleton instance
const audioService = new AudioService();
export default audioService;
