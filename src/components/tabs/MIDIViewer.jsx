'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiUpload, FiPlay, FiPause, FiRotateCw, FiVolume2, FiVolumeX, FiMaximize2 } from 'react-icons/fi';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';

// Piano key colors for visualization
const isBlackKey = (note) => {
  const noteName = note.name.replace(/\d+$/, '');
  return ['C#', 'D#', 'F#', 'G#', 'A#'].includes(noteName);
};

const MIDIViewer = () => {
  const [midiFile, setMidiFile] = useState(null);
  const [midiData, setMidiData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [activeNotes, setActiveNotes] = useState({});
  const [error, setError] = useState(null);
  
  const synth = useRef(null);
  const animationFrameId = useRef(null);
  const startTime = useRef(0);
  const lastTime = useRef(0);
  const midiPlayer = useRef(null);

  // Initialize audio context and synth
  useEffect(() => {
    // Initialize Tone.js with a simpler, more reliable synth
    const initSynth = async () => {
      try {
        // Wait for audio context to be ready
        await Tone.start();
        console.log('Audio context ready');
        
        // Create a simple, reliable synth
        synth.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: 'sine',
          },
          envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 0.5,
          },
        }).toDestination();
        
        // Add a simple reverb
        const reverb = new Tone.Reverb(1.0).toDestination();
        synth.current.connect(reverb);
        
        // Set initial volume to a safe level
        synth.current.volume.value = -12;
        
        // Enable the audio context if it's suspended
        if (Tone.context.state === 'suspended') {
          await Tone.context.resume();
        }
        
        console.log('Synth initialized');
      } catch (e) {
        console.error('Error initializing audio:', e);
        setError('Failed to initialize audio. Please check your browser permissions.');
      }
    };
    
    initSynth();
    
    return () => {
      if (synth.current) {
        synth.current.dispose();
      }
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      console.log('Loading MIDI file:', file.name);
      setMidiFile(file);
      setError(null);
      
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      console.log('File loaded, parsing MIDI...');
      
      // Parse the MIDI file
      const midi = new Midi(arrayBuffer);
      console.log('MIDI parsed successfully', midi);
      
      // Process MIDI data
      const processedTracks = midi.tracks.map((track, i) => {
        console.log(`Track ${i}:`, track.name, 'with', track.notes.length, 'notes');
        return {
          name: track.name || `Track ${i + 1}`,
          notes: track.notes.map(note => ({
            midi: note.midi,
            name: note.name,
            octave: note.octave,
            time: note.time,
            duration: note.duration,
            velocity: note.velocity,
            track: track.channel
          })).sort((a, b) => a.time - b.time) // Sort notes by time
        };
      });

      // Set the state with the parsed data
      setMidiData(midi);
      setTracks(processedTracks);
      setDuration(midi.duration);
      setCurrentTime(0);
      
      console.log('MIDI data processed, duration:', midi.duration, 'seconds');
      
    } catch (err) {
      console.error('Error parsing MIDI file:', err);
      setError('Failed to parse MIDI file. Please try another file.');
    }
  }, []);

  // Playback control functions
  const play = useCallback(async () => {
    if (!midiData || !synth.current) {
      console.error('MIDI data or synth not ready');
      return;
    }

    try {
      // Ensure audio context is running
      if (Tone.context.state !== 'running') {
        console.log('Starting audio context...');
        await Tone.start();
      }

      if (Tone.context.state === 'suspended') {
        console.log('Resuming audio context...');
        await Tone.context.resume();
      }

      if (!isPlaying) {
        // Reset playback if at the end
        if (currentTime >= duration) {
          setCurrentTime(0);
        }

        console.log('Starting playback at', currentTime, 'seconds');
        
        // Schedule all notes that should play after the current time
        midiData.tracks.forEach((track, trackIndex) => {
          track.notes.forEach(note => {
            if (note.time >= currentTime) {
              const playTime = note.time - currentTime;
              
              try {
                // Schedule the note to play in the future
                synth.current.triggerAttackRelease(
                  note.name + note.octave,
                  Math.min(note.duration, 0.5), // Shorter notes for better clarity
                  `+${playTime}`,
                  note.velocity * 0.7
                );
                console.log('Scheduled note:', note.name + note.octave, 'at', playTime);
              } catch (e) {
                console.warn('Error scheduling note:', e);
              }
            }
          });
        });

        // Start the playback timer
        startTime.current = Tone.now() - currentTime;
        lastTime.current = currentTime;
        setIsPlaying(true);
        updatePlayback();
      }
    } catch (e) {
      console.error('Playback error:', e);
      setError('Error starting playback. Please try again.');
    }
  }, [midiData, isPlaying, currentTime, duration, updatePlayback]);

  const pause = useCallback(() => {
    if (isPlaying) {
      cancelAnimationFrame(animationFrameId.current);
      synth.current.releaseAll();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const stop = useCallback(() => {
    cancelAnimationFrame(animationFrameId.current);
    synth.current.releaseAll();
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Update playback position
  const updatePlayback = useCallback(() => {
    const update = () => {
      if (!isPlaying) {
        console.log('Playback stopped');
        return;
      }
      
      const now = Tone.now();
      const elapsed = now - startTime.current;
      
      // Update current time, but cap it at duration
      const newTime = Math.min(elapsed, duration);
      setCurrentTime(newTime);
      
      // Continue updating if we haven't reached the end
      if (newTime < duration) {
        animationFrameId.current = requestAnimationFrame(update);
      } else {
        // Reached the end
        console.log('Playback finished');
        setCurrentTime(duration);
        setIsPlaying(false);
      }
    };
    
    // Start the update loop
    animationFrameId.current = requestAnimationFrame(update);
    
    // Cleanup function
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, duration]);

  // Handle volume change
  useEffect(() => {
    if (synth.current) {
      synth.current.volume.value = isMuted ? -Infinity : (volume * 20 - 20);
    }
  }, [volume, isMuted]);

  // Format time as MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle seeking
  const handleSeek = (e) => {
    if (!midiData) return;
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    
    if (isPlaying) {
      pause();
      setCurrentTime(seekTime);
      startTime.current = Tone.now() - seekTime;
      play();
    }
  };

  // Visualize active notes
  useEffect(() => {
    if (!midiData) return;
    
    const active = {};
    const currentTimeSec = currentTime;
    
    midiData.tracks.forEach((track, trackIndex) => {
      track.notes.forEach(note => {
        const noteStart = note.time;
        const noteEnd = note.time + Math.min(note.duration, 0.5); // Limit note duration for visualization
        
        if (currentTimeSec >= noteStart && currentTimeSec < noteEnd) {
          active[note.midi] = {
            ...note,
            track: trackIndex,
            isBlack: isBlackKey(note)
          };
        }
      });
    });
    
    setActiveNotes(active);
  }, [currentTime, midiData]);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-6 rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">MIDI Viewer</h2>
        
        {/* File Upload */}
        <div className="mb-6">
          <label className="flex flex-col items-center px-4 py-6 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 cursor-pointer hover:bg-gray-700 transition-colors">
            <FiUpload className="w-8 h-8 mb-2" />
            <span className="text-sm">
              {midiFile ? midiFile.name : 'Click to upload MIDI file'}
            </span>
            <input 
              type="file" 
              accept=".mid,.midi" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>
          {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center mb-6 space-x-4">
          <button
            onClick={isPlaying ? pause : play}
            disabled={!midiData}
            className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>
          
          <button
            onClick={stop}
            disabled={!midiData}
            className="p-2 text-gray-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Stop"
          >
            <FiRotateCw />
          </button>
          
          <div className="flex-1 mx-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              disabled={!midiData}
            />
          </div>
          
          <div className="flex items-center">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <FiVolumeX /> : <FiVolume2 />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 ml-2 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* MIDI Visualization */}
      <div className="flex-1 overflow-auto bg-gray-900 rounded-lg p-4">
        {tracks.length > 0 ? (
          <div className="relative h-full">
            {/* Piano roll header */}
            <div className="sticky top-0 z-10 bg-gray-900 pb-2 mb-2 border-b border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-blue-300">
                  {tracks[0]?.name || 'Piano Roll'}
                </h3>
                <div className="text-sm text-gray-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-100"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Piano roll content */}
            <div className="relative" style={{ height: 'calc(100% - 50px)' }}>
              {/* Background grid */}
              <div className="absolute inset-0 grid grid-cols-12 gap-0.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-8 border-l border-gray-700" />
                ))}
              </div>
              
              {/* Notes */}
              <div className="relative z-10">
                {tracks.flatMap((track, trackIndex) =>
                  track.notes.map((note, noteIndex) => {
                    const isActive = activeNotes[note.midi]?.time === note.time && 
                                   activeNotes[note.midi]?.track === trackIndex;
                    const isBlack = isBlackKey(note);
                    const noteName = `${note.name}${note.octave}`;
                    
                    return (
                      <div 
                        key={`${trackIndex}-${noteIndex}`}
                        className={`absolute rounded transition-all duration-100 flex items-center justify-center ${
                          isActive 
                            ? isBlack 
                              ? 'bg-yellow-400 text-gray-900' 
                              : 'bg-blue-500 text-white'
                            : isBlack 
                              ? 'bg-gray-800 text-gray-400' 
                              : 'bg-gray-700 text-gray-300'
                        } ${isActive ? 'z-20 shadow-lg' : 'z-10'}`}
                        style={{
                          left: `${(note.time / (duration || 1)) * 100}%`,
                          width: `${Math.min((note.duration / (duration || 1)) * 100 * 10, 100)}%`,
                          top: `${(1 - (note.midi - 20) / 88) * 100}%`,
                          height: '2rem',
                          minWidth: '4px',
                          transform: isActive ? 'scale(1.1)' : 'scale(1)',
                        }}
                        title={`${noteName} (${note.time.toFixed(2)}s)`}
                      >
                        {isActive && (
                          <span className="text-xs font-bold px-1">
                            {noteName}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Playhead */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30"
                style={{
                  left: `${(currentTime / (duration || 1)) * 100}%`,
                }}
              >
                <div className="absolute -top-2 -left-1.5 w-4 h-4 bg-red-500 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
            <FiUpload className="w-12 h-12 mb-4 text-blue-400 opacity-50" />
            <h3 className="text-xl font-medium mb-2">No MIDI File Loaded</h3>
            <p className="text-gray-400 max-w-md">
              Upload a MIDI file to visualize and play back the notes. 
              The visualizer will show a piano roll of the MIDI data.
            </p>
            <label className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors">
              Choose MIDI File
              <input 
                type="file" 
                accept=".mid,.midi" 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default MIDIViewer;
