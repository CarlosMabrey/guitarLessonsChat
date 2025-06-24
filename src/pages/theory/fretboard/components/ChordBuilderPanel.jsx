import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import * as Tonal from 'tonal';
import { allNotes, chordTypes } from '@/lib/musicTheory';
import { getChordNoteColorClass, getIntervalColors } from '@/lib/intervalColors';
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
  selectVoicing,
  intervalMap = {},
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
    if (!selectVoicing) return;
    const newIndex = parseInt(e.target.value, 10);
    if (!isNaN(newIndex) && newIndex >= 0 && newIndex < selectedVoicings.length) {
      selectVoicing(newIndex);
    }
  };

  // Check if we have voicings to display
  const hasVoicings = selectedVoicings && selectedVoicings.length > 0;
  const voicingName = currentVoicing?.name || 'Default';
  const voicingPosition = hasVoicings ? `${currentVoicingIndex + 1} of ${selectedVoicings.length}` : '';

  // Common select styles
  const selectStyles = {
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1rem',
    backgroundClip: 'padding-box',
    paddingRight: '1.75rem',
    paddingLeft: '0.75rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    width: '100%',
    maxWidth: '100%',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: 'white',
    appearance: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&:hover': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
      backgroundColor: 'rgba(0, 0, 0, 0.25)'
    },
    '&:focus': {
      outline: 'none',
      ring: '2px',
      ringColor: 'rgba(96, 165, 250, 0.5)',
      borderColor: 'rgba(96, 165, 250, 0.5)'
    }
  };
  
  // Style for dropdown options
  const optionStyles = {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '0.5rem 0.75rem',
    '&:hover': {
      backgroundColor: '#374151'
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/5 shadow-sm ${className}`}>
      <div className="space-y-4">
        {/* Root Note Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-white/70 whitespace-nowrap w-24">Root Note</span>
          <div className="relative flex-1 min-w-0">
            <select
              value={chordRoot}
              onChange={(e) => onRootChange(e.target.value)}
              className="w-full text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 transition-colors"
              style={selectStyles}
            >
              {allNotes.map((note) => (
                <option key={note} value={note} style={optionStyles}>
                  {note}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Chord Type Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-white/70 whitespace-nowrap w-24">Chord Type</span>
          <div className="relative flex-1 min-w-0">
            <select
              value={chordType}
              onChange={(e) => onChordTypeChange(e.target.value)}
              className="w-full text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 transition-colors"
              style={selectStyles}
            >
              <option value="" style={optionStyles}>Select Chord</option>
              {chordTypes.map((c) => (
                <option key={c.label} value={c.type} style={optionStyles}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Voicing Selector - Only show when we have voicings */}
        {hasVoicings && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/70">Voicing</span>
              <span className="text-xs text-white/50">{voicingPosition}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onPreviousVoicing}
                disabled={currentVoicingIndex <= 0}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous voicing"
              >
                <ChevronLeftIcon className="w-4 h-4 text-white" />
              </button>
              
              <div className="relative flex-1 min-w-0">
                <select
                  value={currentVoicingIndex}
                  onChange={handleVoicingChange}
                  className="w-full text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 transition-colors"
                  style={selectStyles}
                >
                  {selectedVoicings.map((voicing, idx) => (
                    <option key={idx} value={idx} style={optionStyles}>
                      {voicing.name || `Voicing ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={onNextVoicing}
                disabled={currentVoicingIndex >= selectedVoicings.length - 1}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next voicing"
              >
                <ChevronRightIcon className="w-4 h-4 text-white" />
              </button>
              
              <button
                onClick={() => onPlayChord(chordNotes)}
                className="p-1.5 rounded-lg bg-blue-500/90 hover:bg-blue-500 text-white transition-colors flex-shrink-0"
                aria-label="Play chord"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Chord Notes Display */}
      {chordType && chordNotes.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-white/80 mb-2">Chord Notes</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {chordNotes.map((note, i) => {
              // First try to get the interval from intervalMap for consistent coloring with fretboard
              const pitchClass = Tonal.Note.pitchClass(note);
              const interval = intervalMap[pitchClass];
              
              let colorClass = "";
              if (interval) {
                // Use the same coloring approach as NoteCell
                const colors = getIntervalColors(interval);
                colorClass = `bg-gradient-to-br ${colors.bg} ${colors.text} border ${colors.border}`;
              } else {
                // Fallback to index-based coloring using getChordNoteColorClass
                colorClass = getChordNoteColorClass(note, i, chordRoot, chordType);
              }
              
              return (
                <div 
                  key={note + i}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm ${colorClass}`}
                >
                  {note}
                </div>
              );
            })}
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
  /** Interval mapping for consistent coloring */
  intervalMap: PropTypes.object,
  /** Callback when root note changes */
  onRootChange: PropTypes.func.isRequired,
  /** Callback when chord type changes */
  onChordTypeChange: PropTypes.func.isRequired,
  /** Callback to go to next voicing */
  onNextVoicing: PropTypes.func.isRequired,
  /** Callback to go to previous voicing */
  onPreviousVoicing: PropTypes.func.isRequired,
  /** Callback to play a chord */
  onPlayChord: PropTypes.func,
  /** Callback to select a specific voicing */
  selectVoicing: PropTypes.func.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
};

ChordBuilderPanel.defaultProps = {
  selectedVoicings: [],
  currentVoicingIndex: 0,
  chordType: '',
};

export default React.memo(ChordBuilderPanel);
