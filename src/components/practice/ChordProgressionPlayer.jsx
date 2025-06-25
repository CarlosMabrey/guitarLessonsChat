'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tonal from 'tonal';
import ChordDiagram from '@/components/diagrams/ChordDiagram';
import { chordVoicings, normalizeChordName } from '@/lib/musicTheory';

/**
 * Props for the ChordProgressionPlayer component
 * @typedef {Object} ChordProgressionPlayerProps
 * @property {string[]} [progression] - Array of chord names to play in sequence
 * @property {number} [beatsPerChord] - Number of beats to spend on each chord
 * @property {number} [bpm] - Beats per minute
 * @property {boolean} [autoPlay] - Whether to start playing automatically
 * @property {() => void} [onComplete] - Callback when the progression completes a full cycle
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [showChordNames] - Whether to display chord names
 * @property {boolean} [showDiagrams] - Whether to show chord diagrams
 */

/**
 * A component that plays through a chord progression with a metronome
 * @param {ChordProgressionPlayerProps} props 
 */
export default function ChordProgressionPlayer({ 
  progression = ['G', 'Em', 'C', 'D'], 
  beatsPerChord = 4,
  bpm = 70,
  autoPlay = false,
  onComplete = () => {},
  className = '',
  showChordNames = true,
  showDiagrams = true
}) {
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [countdown, setCountdown] = useState(autoPlay ? 4 : null);
  const intervalRef = useRef(null);

  // Calculate beat duration in milliseconds
  const beatDuration = 60000 / bpm;
  
  // Start/stop the metronome and chord progression
  useEffect(() => {
    if (isPlaying) {
      // If we need a countdown first
      if (countdown !== null) {
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              startProgressionTimer();
              return null;
            }
            return prev - 1;
          });
        }, beatDuration);
        
        return () => clearInterval(countdownInterval);
      } else {
        startProgressionTimer();
      }
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, countdown, bpm]);
  
  // Reset when progression changes
  useEffect(() => {
    setCurrentChordIndex(0);
    setCurrentBeat(0);
    if (isPlaying) {
      setIsPlaying(false);
      setCountdown(4);
    }
  }, [progression, beatsPerChord, bpm]);
  
  function startProgressionTimer() {
    clearInterval(intervalRef.current);
    
    // Play a click sound on each beat
    playClick();
    
    intervalRef.current = setInterval(() => {
      playClick();
      
      setCurrentBeat(prevBeat => {
        const nextBeat = (prevBeat + 1) % beatsPerChord;
        
        // If we're starting a new chord
        if (nextBeat === 0) {
          setCurrentChordIndex(prevIndex => {
            const nextIndex = (prevIndex + 1) % progression.length;
            
            // If we've completed a full cycle
            if (nextIndex === 0) {
              onComplete();
            }
            
            return nextIndex;
          });
        }
        
        return nextBeat;
      });
    }, beatDuration);
  }
  
  function playClick() {
    // Simple audio feedback
    // Could be enhanced with actual audio playback
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = currentBeat === 0 ? 880 : 440; // Higher pitch on the 1
      
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(context.currentTime + 0.05);
    } catch (error) {
      console.error('Audio context error:', error);
    }
  }
  
  function togglePlay() {
    if (!isPlaying) {
      setCountdown(4);
    }
    setIsPlaying(!isPlaying);
  }
  
  // Calculate which chord is coming next
  const nextChordIndex = (currentChordIndex + 1) % progression.length;
  
  // Get current and next chord names with validation
  const getValidChordName = useCallback((chord) => {
    try {
      if (!chord) return null;
      const normalized = normalizeChordName(chord);
      // Verify the chord exists in our library
      const parsed = Tonal.Chord.tokenize(normalized);
      const voicingKey = `${parsed[0]}-${parsed[1] || 'M'}`;
      return chordVoicings[voicingKey] ? normalized : null;
    } catch (e) {
      console.warn(`Invalid chord: ${chord}`, e);
      return null;
    }
  }, []);
  
  const currentChord = getValidChordName(progression[currentChordIndex]);
  const nextChord = getValidChordName(progression[nextChordIndex]);
  
  // Determine when to show the "Coming next" indicator
  const showNextChord = currentBeat >= beatsPerChord - 2; 
  
  // Get the current chord display name
  const getDisplayName = (chord) => {
    if (!chord) return 'N/A';
    try {
      const parsed = Tonal.Chord.tokenize(chord);
      return `${parsed[0]}${parsed[1] || ''}`.replace('M', 'maj');
    } catch (e) {
      return chord;
    }
  }; 
  const currentChordName = chordName ? getDisplayName(chordName) : null; 
  const nextChordName = nextChord ? getDisplayName(nextChord) : null; 
  
  return (
    <div className={`p-4 rounded-lg theme-card ${className}`}>
      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-10">
          <div className="text-5xl font-bold text-white">{countdown}</div>
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-medium mb-4">Chord Progression Practice</h3>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="flex gap-1 items-center">
            <span className="text-sm text-muted">BPM:</span>
            <select 
              className="bg-accent rounded px-2 py-1 text-sm"
              value={bpm}
              onChange={(e) => {
                const newBpm = parseInt(e.target.value);
                if (isPlaying) {
                  setIsPlaying(false);
                  setTimeout(() => {
                    setIsPlaying(true);
                  }, 50);
                }
              }}
            >
              {[60, 70, 80, 90, 100, 120].map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
          
          <button
            className="px-4 py-2 rounded bg-active text-white"
            onClick={togglePlay}
          >
            {isPlaying ? 'Stop' : 'Start'}
          </button>
        </div>
        
        <div className="flex flex-wrap gap-8 justify-center">
          {/* Current chord display */}
          <div className="flex flex-col items-center">
            <div className="text-sm text-muted mb-2">Current</div>
            <div className="relative">
              {showDiagrams && currentChord ? (
                <ChordDiagram 
                  chordName={currentChord}
                  size="lg"
                  showName={showChordNames}
                  interactive={false}
                />
              ) : (
                <div className="w-24 h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <span className="text-2xl font-bold">{getDisplayName(progression[currentChordIndex])}</span>
                </div>
              )}
              
              {/* Beat indicator dots */}
              <div className="flex gap-1 mt-2 justify-center">
                {Array.from({ length: beatsPerChord }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i === currentBeat ? 'bg-active' : 'bg-muted opacity-30'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Next chord preview */}
          <div className={`flex flex-col items-center transition-opacity duration-300 ${showNextChord ? 'opacity-100' : 'opacity-30'}`}>
            <div className="text-sm text-muted mb-2">Coming Next</div>
            {showDiagrams && nextChord ? (
              <ChordDiagram 
                chordName={nextChord}
                size="md"
                showName={showChordNames}
                interactive={false}
              />
            ) : (
              <div className="w-20 h-24 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="text-xl font-bold">{getDisplayName(progression[nextChordIndex])}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Full progression display */}
        <div className="mt-8 border-t pt-4 w-full">
          <h4 className="text-sm font-medium mb-2">Full Progression</h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {progression.map((chord, index) => (
              <div 
                key={index}
                className={`border ${index === currentChordIndex ? 'border-active' : 'border-card-border'} rounded p-1`}
              >
                <VoicingDisplay 
                  chord={normalizeChordName(chord)} 
                  size="sm"
                  showName={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 