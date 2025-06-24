'use client';

import { useCallback, useRef, useState } from 'react';
import { FiUpload, FiX, FiMusic } from 'react-icons/fi';
import { Midi } from '@tonejs/midi';
import { midiToGuitarPosition } from './utils/tabUtils';

/**
 * TabFileUploader - Component for handling tab file uploads (MIDI or JSON)
 */
const TabFileUploader = ({ onFileProcessed, onError, fileName, onClearFile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Process MIDI file
  const processMidiFile = useCallback(async (file) => {
    if (!file || !file.name.match(/\.(mid|midi)$/i)) {
      onError('Please upload a valid MIDI file (.mid or .midi)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Parse MIDI file using the imported Midi class
      const midi = new Midi(arrayBuffer);
      
      if (midi.tracks.length === 0) {
        throw new Error('No tracks found in MIDI file');
      }
      
      // Convert MIDI tracks to our tab format
      const notes = [];
      const measures = [];
      let currentMeasure = [];
      let currentMeasureTime = 0;
      const ticksPerBeat = midi.header.ppq;
      const bpm = midi.header.tempos[0]?.bpm || 120;
      const msPerTick = (60000 / (bpm * ticksPerBeat));
      
      // Process all tracks
      midi.tracks.forEach(track => {
        track.notes.forEach(note => {
          const position = midiToGuitarPosition(note.midi);
          if (position) {
            const time = note.ticks * msPerTick;
            const duration = note.durationTicks * msPerTick;
            
            notes.push({
              time,
              duration,
              string: position.string,
              fret: position.fret,
              noteName: position.noteName,
              velocity: note.velocity
            });
            
            // Group into measures (assuming 4/4 time signature for now)
            const measureTime = Math.floor(time / (60000 / bpm * 4));
            if (measureTime > currentMeasureTime) {
              if (currentMeasure.length > 0) {
                measures.push([...currentMeasure]);
                currentMeasure = [];
              }
              currentMeasureTime = measureTime;
            }
            currentMeasure.push({
              time,
              duration,
              string: position.string,
              fret: position.fret,
              noteName: position.noteName
            });
          }
        });
      });
      
      // Add the last measure if not empty
      if (currentMeasure.length > 0) {
        measures.push(currentMeasure);
      }
      
      // Sort notes by time
      notes.sort((a, b) => a.time - b.time);
      
      // Create tab data object
      const newTabData = {
        notes,
        measures,
        bpm,
        timeSignature: '4/4', // Default, could be parsed from MIDI
        name: file.name.replace(/\.midi?$/i, '')
      };
      
      onFileProcessed(file.name, newTabData);
    } catch (err) {
      console.error('Error processing MIDI file:', err);
      onError(`Error processing MIDI file: ${err.message}`);
    } finally {
      setIsLoading(false);
      setIsDragging(false);
    }
  }, [onFileProcessed, onError]);
  
  // Process JSON file
  const processJsonFile = useCallback(async (file) => {
    if (!file || !file.name.match(/\.json$/i)) {
      onError('Please upload a valid JSON file (.json)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Read file as text
      const text = await file.text();
      
      // Parse JSON
      const jsonData = JSON.parse(text);
      
      // Validate the JSON structure
      if (!jsonData.notes || !Array.isArray(jsonData.notes)) {
        throw new Error('Invalid JSON format: missing notes array');
      }
      
      // Check if notes have the required properties
      const validNotes = jsonData.notes.every(note => 
        typeof note.time === 'number' && 
        typeof note.duration === 'number' && 
        typeof note.string === 'number' && 
        typeof note.fret === 'number'
      );
      
      if (!validNotes) {
        throw new Error('Invalid JSON format: notes must have time, duration, string, and fret properties');
      }
      
      // Group notes into measures if not already done
      if (!jsonData.measures || !Array.isArray(jsonData.measures) || jsonData.measures.length === 0) {
        // Simple measure grouping based on time
        const measureDuration = 2000; // Default 2 seconds per measure
        const measures = [];
        
        // Sort notes by time
        const sortedNotes = [...jsonData.notes].sort((a, b) => a.time - b.time);
        
        // Group notes into measures
        let currentMeasure = [];
        let currentMeasureTime = 0;
        
        sortedNotes.forEach(note => {
          const measureIndex = Math.floor(note.time / measureDuration);
          
          if (measureIndex > currentMeasureTime) {
            if (currentMeasure.length > 0) {
              measures.push([...currentMeasure]);
              currentMeasure = [];
            }
            currentMeasureTime = measureIndex;
          }
          
          currentMeasure.push(note);
        });
        
        // Add the last measure
        if (currentMeasure.length > 0) {
          measures.push(currentMeasure);
        }
        
        jsonData.measures = measures;
      }
      
      // Update tab data
      onFileProcessed(file.name, {
        ...jsonData,
        name: file.name.replace(/\.json$/i, '')
      });
    } catch (err) {
      console.error('Error processing JSON file:', err);
      onError(`Error processing JSON file: ${err.message}`);
    } finally {
      setIsLoading(false);
      setIsDragging(false);
    }
  }, [onFileProcessed, onError]);
  
  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Process based on file extension
    if (file.name.match(/\.json$/i)) {
      processJsonFile(file);
    } else if (file.name.match(/\.(mid|midi)$/i)) {
      processMidiFile(file);
    } else {
      onError('Unsupported file format. Please upload a MIDI (.mid/.midi) or JSON (.json) file.');
    }
  }, [processMidiFile, processJsonFile, onError]);
  
  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);
  
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if not dragging over a child element
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      // Process based on file extension
      if (file.name.match(/\.json$/i)) {
        processJsonFile(file);
      } else if (file.name.match(/\.(mid|midi)$/i)) {
        processMidiFile(file);
      } else {
        onError('Unsupported file format. Please upload a MIDI (.mid/.midi) or JSON (.json) file.');
      }
    }
  }, [processMidiFile, processJsonFile, onError]);
  
  // Handle file input click
  const handleFileClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  // Clear file
  const handleClearFile = useCallback((e) => {
    e.stopPropagation();
    onClearFile();
  }, [onClearFile]);
  
  return (
    <div 
      onClick={handleFileClick}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        isDragging 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:bg-card-hover'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".mid,.midi,.json"
        className="hidden"
      />
      
      <div className="flex flex-col items-center text-center">
        <div className={`p-3 rounded-full mb-3 ${
          isDragging ? 'bg-primary/20' : 'bg-primary/10'
        }`}>
          {isDragging ? (
            <FiMusic className="w-6 h-6 text-primary" />
          ) : (
            <FiUpload className="w-6 h-6 text-primary" />
          )}
        </div>
        
        {fileName ? (
          <>
            <p className="text-sm font-medium text-text-primary">
              {fileName}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Click to change or drag a new file here
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-text-primary">
              {isDragging ? 'Drop the MIDI file here' : 'Upload MIDI File'}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {isDragging 
                ? 'Release to upload' 
                : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="text-xs text-text-secondary/70 mt-1">
              Supports .mid, .midi, and .json files
            </p>
            <a 
              href="/example-tab.json" 
              download="example-tab.json"
              className="text-xs text-primary-500 hover:text-primary-600 underline mt-1 block"
              onClick={(e) => e.stopPropagation()}
            >
              Download example JSON tab template
            </a>
          </>
        )}
      </div>
      
      {fileName && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleClearFile(e);
          }}
          className="mt-3 px-3 py-1 text-xs rounded-full bg-background hover:bg-background-hover text-text-secondary hover:text-text-primary transition-colors flex items-center space-x-1"
          aria-label="Clear file"
        >
          <FiX className="w-3 h-3" />
          <span>Clear file</span>
        </button>
      )}
      
      {isLoading && (
        <div className="mt-3 text-sm text-text-secondary">
          Processing file...
        </div>
      )}
    </div>
  );
};

export default TabFileUploader;
