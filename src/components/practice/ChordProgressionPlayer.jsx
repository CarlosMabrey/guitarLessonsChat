'use client';

import { useState, useEffect, useRef } from 'react';
import ChordDiagram from '../diagrams/ChordDiagram';

export default function ChordProgressionPlayer({ 
  progression = ['G', 'Em', 'C', 'D'], 
  beatsPerChord = 4,
  bpm = 70,
  autoPlay = false,
  onComplete = () => {},
  className = ''
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
  
  // Determine when to show the "Coming next" indicator
  const showNextChord = currentBeat >= beatsPerChord - 2;
  
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
              <ChordDiagram 
                chord={progression[currentChordIndex]} 
                size="lg"
              />
              
              {/* Beat indicator dots */}
              <div className="flex gap-1 mt-2 justify-center">
                {Array.from({ length: beatsPerChord }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i === currentBeat ? 'bg-active' : 'text-muted opacity-30'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Next chord preview */}
          <div className={`flex flex-col items-center transition-opacity duration-300 ${showNextChord ? 'opacity-100' : 'opacity-30'}`}>
            <div className="text-sm text-muted mb-2">Coming Next</div>
            <ChordDiagram 
              chord={progression[nextChordIndex]} 
              size="md"
            />
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
                <ChordDiagram 
                  chord={chord} 
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