import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import * as Tonal from 'tonal';
import { allNotes, chordTypes } from '@/lib/musicTheory';
import VoicingDisplay from '@/components/fretboard/VoicingDisplay';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
// Note: If the above import fails, try this alternative:
// import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';

/**
 * Panel for building and previewing chords
 */
const ChordBuilderPanel = ({
  chordRoot,
  chordType,
  selectedVoicings,
  currentVoicingIndex,
  onRootChange,
  onChordTypeChange,
  onNextVoicing,
  onPreviousVoicing,
  onPlayChord,
  className = ''
}) => {
  // Get chord notes to display when a chord is selected
  const chordNotes = useMemo(() => {
    if (!chordType) return [];
    try {
      return Tonal.Chord.getChord(chordType, chordRoot)?.notes || [];
    } catch (e) {
      console.error('Error getting chord notes:', e);
      return [];
    }
  }, [chordRoot, chordType]);

  // Get the current voicing if available
  const currentVoicing = useMemo(() => {
    if (!selectedVoicings.length || !selectedVoicings[currentVoicingIndex]) return null;
    return selectedVoicings[currentVoicingIndex];
  }, [selectedVoicings, currentVoicingIndex]);

  // Handle voicing selection change
  const handleVoicingChange = (e) => {
    const newIndex = parseInt(e.target.value, 10);
    if (!isNaN(newIndex) && newIndex >= 0 && newIndex < selectedVoicings.length) {
      selectVoicing(newIndex);
    }
  };

  // Check if we have voicings to display
  const hasVoicings = selectedVoicings && selectedVoicings.length > 0;
  const voicingName = currentVoicing?.name || 'Default';
  const voicingPosition = hasVoicings ? `${currentVoicingIndex + 1} of ${selectedVoicings.length}` : '';

  return (
    <div className={`bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Chord Builder</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Root Note Selector */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-white/80">Root Note</label>
          <select
            value={chordRoot}
            onChange={(e) => onRootChange(e.target.value)}
            className="w-full bg-[var(--card)] border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1rem'
            }}
          >
            {allNotes.map((note) => (
              <option key={note} value={note} className="bg-gray-800 text-white">
                {note}
              </option>
            ))}
          </select>
        </div>
        
        {/* Chord Type Selector */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-white/80">Chord Type</label>
          <select
            value={chordType}
            onChange={(e) => onChordTypeChange(e.target.value)}
            className="w-full bg-[var(--card)] border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1rem'
            }}
          >
            <option value="" className="bg-gray-800 text-white">Select Chord</option>
            {chordTypes.map((c) => (
              <option key={c.label} value={c.type} className="bg-gray-800 text-white">
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Voicing Selector - Only show when we have voicings */}
        {hasVoicings && (
          <div className="md:col-span-2 flex flex-col space-y-2">
            <label className="text-sm text-white/80">Voicing</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={onPreviousVoicing}
                disabled={currentVoicingIndex <= 0}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous voicing"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <select
                value={currentVoicingIndex}
                onChange={handleVoicingChange}
                className="flex-1 bg-[var(--card)] border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1rem',
                  paddingRight: '2.5rem',
                  textOverflow: 'ellipsis'
                }}
              >
                {selectedVoicings.map((voicing, index) => (
                  <option key={`${voicing.name}-${index}`} value={index} className="bg-gray-800 text-white">
                    {voicing.name} {voicing.position ? `(${voicing.position})` : ''}
                  </option>
                ))}
              </select>
              
              <button
                onClick={onNextVoicing}
                disabled={currentVoicingIndex >= selectedVoicings.length - 1}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next voicing"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
            {voicingPosition && (
              <div className="text-xs text-white/60 text-right">
                {voicingPosition}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Chord Notes Display */}
      {chordType && chordNotes.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-white/80 mb-2">Chord Notes</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {chordNotes.map((note, i) => (
              <div 
                key={i} 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  i === 0 ? 'bg-red-600/80' : 
                  i % 2 === 0 ? 'bg-green-600/80' : 
                  'bg-blue-600/80'
                }`}
              >
                {note}
              </div>
            ))}
          </div>
          
          {/* Chord Shape Preview */}
          {currentVoicing && (
            <div className="mt-6 w-full">
              <h4 className="text-sm font-medium text-white/80 mb-3">Chord Shape</h4>
              <div className="bg-gray-900/50 p-4 rounded-lg w-full">
                <VoicingDisplay
                  selectedVoicings={[currentVoicing]}
                  currentVoicingIndex={0}
                  chordRoot={chordRoot}
                  chordType={chordType}
                  chordName={`${chordRoot}${chordType}`}
                  onNext={onNextVoicing}
                  onPrevious={onPreviousVoicing}
                  playChord={onPlayChord}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ChordBuilderPanel.propTypes = {
  /** Current root note */
  chordRoot: PropTypes.string.isRequired,
  /** Current chord type */
  chordType: PropTypes.string,
  /** Array of available voicings */
  selectedVoicings: PropTypes.array,
  /** Index of the currently selected voicing */
  currentVoicingIndex: PropTypes.number,
  /** Callback when root note changes */
  onRootChange: PropTypes.func.isRequired,
  /** Callback when chord type changes */
  onChordTypeChange: PropTypes.func.isRequired,
  /** Callback to go to next voicing */
  onNextVoicing: PropTypes.func.isRequired,
  /** Callback to go to previous voicing */
  onPreviousVoicing: PropTypes.func.isRequired,
  /** Callback to select a specific voicing by index */
  selectVoicing: PropTypes.func.isRequired,
  /** Callback to play the current chord */
  onPlayChord: PropTypes.func.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
};

ChordBuilderPanel.defaultProps = {
  selectedVoicings: [],
  currentVoicingIndex: 0,
  chordType: '',
};

export default React.memo(ChordBuilderPanel);
