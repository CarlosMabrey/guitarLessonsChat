'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

// Imported components and services
import TabFileUploader from './TabFileUploader';
import TabPlaybackControls from './TabPlaybackControls';
import TabVisualizerSettings from './TabVisualizerSettings';
import audioService from './services/AudioService';
import { calculateTotalDuration, getCurrentMeasure, formatTime, getNoteFromStringFret } from './utils/tabUtils';
import FretboardGrid from '@/pages/theory/fretboard/components/FretboardGrid';

/**
 * TabFretboardVisualizer - Shows tab positions on the fretboard with MIDI-like timing
 * 
 * @param {Object} tabData - The parsed tab data object with MIDI-like timing
 */
const TabFretboardVisualizer = ({ tabData = {}, onTabDataChange }) => {
  // Local state for the current tab data
  const [currentTabData, setCurrentTabData] = useState(tabData);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showPreview, setShowPreview] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const animationFrameId = useRef(null);
  const lastTimestamp = useRef(0);
  
  // State for file upload
  const [fileName, setFileName] = useState('example-tab.json');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const stringTuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
  
  // Load example tab data for development testing
  useEffect(() => {
    // Always load example-tab.json for testing
    if (!currentTabData?.notes || currentTabData.notes.length === 0) {
      setIsLoading(true);
      fetch('/example-tab.json')
        .then(response => response.json())
        .then(exampleData => {
          setCurrentTabData(exampleData);
          setFileName('example-tab.json');
          setIsLoading(false);
          if (onTabDataChange) {
            onTabDataChange(exampleData);
          }
        })
        .catch(err => {
          console.error('Error loading example tab:', err);
          setError('Failed to load example tab data');
          setIsLoading(false);
        });
    } else {
      setCurrentTabData(tabData);
    }
  }, [tabData, onTabDataChange, currentTabData?.notes]);
  
  // Handle tab data updates
  const handleTabDataUpdate = useCallback((newTabData) => {
    setCurrentTabData(newTabData);
    if (onTabDataChange) {
      onTabDataChange(newTabData);
    }
  }, [onTabDataChange]);
  
  // Initialize Audio Service
  useEffect(() => {
    audioService.initialize();
    audioService.setVolume(volume);
    
    // Cleanup function
    return () => {
      audioService.cleanup();
    };
  }, []);
  
  // Update audio volume when volume state changes
  useEffect(() => {
    audioService.setVolume(volume);
  }, [volume]);
  
  // File processing handler - used by TabFileUploader component
  const onFileProcessed = useCallback((newFileName, newTabData) => {
    setFileName(newFileName);
    handleTabDataUpdate(newTabData);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [handleTabDataUpdate]);
  
  // Error handler - used by TabFileUploader component
  const onFileError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);
  
  // Clear file handler - used by TabFileUploader component
  const clearFile = useCallback(() => {
    setFileName(null);
    handleTabDataUpdate({ notes: [], measures: [] });
    setCurrentTime(0);
    setIsPlaying(false);
  }, [handleTabDataUpdate]);
  
  // Calculate total duration of the tab in milliseconds using the utility function
  const totalDuration = useMemo(() => {
    return calculateTotalDuration(currentTabData.notes);
  }, [currentTabData.notes]);
  
  // Get current measure based on current time using the utility function
  const [currentMeasure, totalMeasures] = useMemo(() => {
    // Use the utility function
    return getCurrentMeasure(currentTime, currentTabData.measures || []);
  }, [currentTime, currentTabData.measures]);
  
  // Animation frame handler for playback
  const animate = useCallback((timestamp) => {
    if (!lastTimestamp.current) {
      lastTimestamp.current = timestamp;
    }
    
    // Calculate elapsed time since last frame
    const elapsed = timestamp - lastTimestamp.current;
    lastTimestamp.current = timestamp;
    
    // Update current time based on playback speed
    setCurrentTime(prevTime => {
      const newTime = prevTime + (elapsed * playbackSpeed);
      
      // Loop back to the beginning if reached the end
      if (newTime >= totalDuration) {
        lastTimestamp.current = 0;
        return 0;
      }
      
      return newTime;
    });
    
    animationFrameId.current = requestAnimationFrame(animate);
  }, [playbackSpeed, totalDuration]);
  
  // Start/stop playback
  useEffect(() => {
    if (isPlaying) {
      lastTimestamp.current = 0;
      animationFrameId.current = requestAnimationFrame(animate);
    } else if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, animate]);
  
  // Calculate visible fretboard notes based on current time
  const activeNotes = useMemo(() => {
    if (!currentTabData.notes || !Array.isArray(currentTabData.notes) || !isPlaying) {
      return [];
    }
    
    return currentTabData.notes.filter(note => {
      const noteStart = note.time;
      const noteEnd = noteStart + note.duration;
      
      // Note is active if current time falls within its duration
      const isActive = currentTime >= noteStart && currentTime < noteEnd;
      
      // Play note when it first becomes active
      if (isActive && showPreview) {
        // Only play if the note just became active (within 50ms of start)
        // This prevents repeated triggering during the note's duration
        if (Math.abs(currentTime - noteStart) < 50) {
          // Use AudioService with string number, fret, and tuning information
          audioService.playGuitarNote(note.string, note.fret, stringTuning);
        }
      }
      
      return isActive;
    });
  }, [currentTime, currentTabData.notes, isPlaying, showPreview, stringTuning]);
  
  // Get highlighted note names for the FretboardGrid
  const highlightedNotes = useMemo(() => {
    const activeNoteNames = activeNotes.map(note => {
      const stringIndex = 6 - (note.string || 0);
      const openStringNote = stringTuning[stringIndex];
      return getNoteFromStringFret(openStringNote, note.fret);
    });
    
    const previewNoteNames = showPreview ? currentTabData.notes?.map(note => {
      const stringIndex = 6 - (note.string || 0); // Convert to 0-based index (6th string = index 0)
      const openStringNote = stringTuning[stringIndex];
      const noteName = getNoteFromStringFret(openStringNote, note.fret);
      
      return noteName;
    }) || [] : [];
    
    // If playing, only show active notes; otherwise show preview if enabled
    return isPlaying ? activeNoteNames : [...new Set([...activeNoteNames, ...previewNoteNames])];
  }, [activeNotes, currentTabData.notes, isPlaying, showPreview, stringTuning]);
  
  // Handle play/pause toggle
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  
  // Skip to specific measure
  const skipToMeasure = useCallback((measureIndex) => {
    if (currentTabData.measures && Array.isArray(currentTabData.measures) && 
        measureIndex >= 0 && measureIndex < currentTabData.measures.length) {
      const measure = currentTabData.measures[measureIndex];
      if (measure && measure.length > 0) {
        setCurrentTime(measure[0].time);
      }
    }
  }, [currentTabData.measures]);
  
  // If no tab data is available
  if (!currentTabData || !currentTabData.notes || currentTabData.notes.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-text-secondary">No tab data available to visualize</p>
      </div>
    );
  }
  
  return (
    <div className="fretboard-visualizer bg-card rounded-xl p-6 shadow-lg border border-border">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-text-primary">Fretboard Visualization</h3>
          <div className="flex items-center space-x-2">
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="text-sm bg-card-hover border-border rounded-lg px-3 py-1.5 text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>
        </div>
        
        {/* File Uploader Component */}
        <TabFileUploader
          onFileProcessed={onFileProcessed}
          onError={onFileError}
          onClearFile={clearFile}
          fileName={fileName}
          stringTuning={stringTuning}
        />
        
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="p-3 text-sm text-text-secondary text-center">
            Processing MIDI file...
          </div>
        ) : (
          <>
            <div className="bg-card-hover rounded-xl p-4 border border-border">
              <FretboardGrid
                highlightedNotes={highlightedNotes}
                showOnlyRelevantNotes={false}
                className="mx-auto"
              />
              
              {fileName && (
                <TabVisualizerSettings
                  showPreview={showPreview}
                  setShowPreview={setShowPreview}
                  volume={volume}
                  setVolume={setVolume}
                />
              )}
            </div>
            
            <TabPlaybackControls
              isPlaying={isPlaying}
              togglePlayPause={togglePlayPause}
              currentTime={currentTime}
              totalDuration={totalDuration}
              currentMeasure={currentMeasure}
              totalMeasures={totalMeasures}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              onPrevMeasure={() => skipToMeasure(Math.max(0, currentMeasure - 1))}
              onNextMeasure={() => skipToMeasure(Math.min(totalMeasures - 1, currentMeasure + 1))}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TabFretboardVisualizer;
