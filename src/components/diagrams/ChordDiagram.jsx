'use client';

import { useState, useEffect } from 'react';
import * as Tonal from 'tonal';
import VoicingDisplay from '@/components/fretboard/VoicingDisplay';
import { chordVoicings, normalizeChordName } from '@/lib/musicTheory';
import { adaptVoicingsToTuning } from '@/lib/tuningUtils';

/**
 * A reusable chord diagram component that displays guitar chord diagrams.
 * 
 * @param {Object} props - Component props
 * @param {string} props.chordName - The name of the chord (e.g., 'C', 'Am7', 'G7')
 * @param {number} [props.voicingIndex=0] - Index of the voicing to display (if multiple exist)
 * @param {Object} [props.voicingObject] - Direct voicing object to display (overrides chordName)
 * @param {boolean} [props.showName=true] - Whether to show the chord name
 * @param {string} [props.size='md'] - Size of the diagram ('sm', 'md', 'lg')
 * @param {boolean} [props.interactive=true] - Whether to allow user interaction
 * @param {string} [props.tuning='Standard'] - Name of the tuning to use
 * @param {Function} [props.onVoicingChange] - Callback when voicing changes (receives voicing object and index)
 * @param {boolean} [props.showFretNumbers=true] - Whether to show fret numbers
 * @param {boolean} [props.showFingering=true] - Whether to show finger numbers
 * @param {string} [props.className] - Additional CSS classes
 */
const ChordDiagram = ({
  chordName = '',
  voicingIndex = 0,
  voicingObject,
  showName = true,
  size = 'md',
  interactive = true,
  tuning = 'Standard',
  onVoicingChange,
  showFretNumbers = true,
  showFingering = true,
  className = '',
  ...props
}) => {
  const [currentVoicingIndex, setCurrentVoicingIndex] = useState(voicingIndex);
  const [selectedVoicings, setSelectedVoicings] = useState([]);
  const [normalizedChordName, setNormalizedChordName] = useState('');

  // Parse the chord name and get voicings when chordName changes
  useEffect(() => {
    if (voicingObject) {
      // If a voicing object is provided directly, use it
      setSelectedVoicings([voicingObject]);
      setCurrentVoicingIndex(0);
      return;
    }

    if (!chordName) {
      setSelectedVoicings([]);
      return;
    }

    try {
      // Normalize the chord name for lookup
      const normalized = normalizeChordName(chordName);
      setNormalizedChordName(normalized);
      
      // Get voicings for this chord
      let voicings = [];
      
      if (chordVoicings[normalized]) {
        voicings = [...chordVoicings[normalized]];
        
        // Adapt voicings to the specified tuning if needed
        if (tuning !== 'Standard') {
          voicings = adaptVoicingsToTuning(voicings, 'Standard', tuning);
        }
      }
      
      setSelectedVoicings(voicings);
      
      // Reset to first voicing if current index is out of bounds
      const newIndex = voicings.length > 0 ? Math.min(voicingIndex, voicings.length - 1) : 0;
      setCurrentVoicingIndex(newIndex);
      
      // Notify parent of the voicing change
      if (onVoicingChange && voicings.length > 0) {
        onVoicingChange(voicings[newIndex], newIndex);
      }
    } catch (error) {
      console.error('Error getting voicings for chord:', error);
      setSelectedVoicings([]);
    }
  }, [chordName, voicingIndex, voicingObject, tuning, onVoicingChange]);

  // Handle changing to the next voicing
  const handleNextVoicing = () => {
    if (selectedVoicings.length <= 1) return;
    
    const newIndex = (currentVoicingIndex + 1) % selectedVoicings.length;
    setCurrentVoicingIndex(newIndex);
    
    if (onVoicingChange) {
      onVoicingChange(selectedVoicings[newIndex], newIndex);
    }
  };

  // Handle changing to the previous voicing
  const handlePreviousVoicing = () => {
    if (selectedVoicings.length <= 1) return;
    
    const newIndex = (currentVoicingIndex - 1 + selectedVoicings.length) % selectedVoicings.length;
    setCurrentVoicingIndex(newIndex);
    
    if (onVoicingChange) {
      onVoicingChange(selectedVoicings[newIndex], newIndex);
    }
  };

  // If we have a direct voicing object, use that, otherwise use the selected voicing
  const voicingToDisplay = voicingObject || 
    (selectedVoicings.length > 0 ? selectedVoicings[currentVoicingIndex] : null);

  // If no voicing is available, render nothing or a placeholder
  if (!voicingToDisplay && !chordName) {
    return <div className={`chord-diagram empty ${className}`} />;
  }

  // Display name to show (either the provided chordName or the normalized one)
  const displayName = chordName || normalizedChordName;

  return (
    <div 
      className={`chord-diagram-container flex flex-col items-center ${className}`}
      style={{
        '--chord-diagram-width': size === 'sm' ? '100px' : size === 'lg' ? '180px' : '140px',
      }}
      {...props}
    >
      {showName && displayName && (
        <div className="chord-name text-center font-bold mb-2">
          {displayName}
        </div>
      )}
      
      <div className="chord-diagram-wrapper relative w-full">
        {interactive && selectedVoicings.length > 1 && (
          <>
            <button 
              onClick={handlePreviousVoicing}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 p-1 rounded-full bg-black/20 hover:bg-black/30 text-white"
              aria-label="Previous voicing"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={handleNextVoicing}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 p-1 rounded-full bg-black/20 hover:bg-black/30 text-white"
              aria-label="Next voicing"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        )}
        
        <div className="chord-diagram w-full">
          {voicingToDisplay ? (
            <VoicingDisplay
              voicingObject={voicingToDisplay}
              chordName={displayName}
              size={size}
              showName={false}
              showFretNumbers={showFretNumbers}
              showFingering={showFingering}
              onNext={interactive ? handleNextVoicing : undefined}
              onPrevious={interactive ? handlePreviousVoicing : undefined}
            />
          ) : (
            <div className="text-center text-sm text-gray-500 p-4">
              No diagram available for {displayName}
            </div>
          )}
        </div>
      </div>
      
      {interactive && selectedVoicings.length > 1 && (
        <div className="voicing-indicator text-xs text-gray-500 mt-1">
          {currentVoicingIndex + 1} of {selectedVoicings.length}
        </div>
      )}
    </div>
  );
};

export default ChordDiagram;
