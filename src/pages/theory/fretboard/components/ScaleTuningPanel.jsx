import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import * as Tonal from 'tonal';
import { allNotes, tunings, scaleTypes } from '@/lib/musicTheory';

/**
 * Panel for selecting scale and tuning options
 */
const ScaleTuningPanel = ({
  currentTuning,
  chordRoot,
  scaleType,
  onTuningChange,
  onRootChange,
  onScaleChange,
  className = ''
}) => {
  // Get the scale notes to display when a scale is selected
  const scaleNotes = useMemo(() => {
    if (!scaleType) return [];
    try {
      return Tonal.Scale.get(`${chordRoot} ${scaleType}`).notes;
    } catch (e) {
      console.error('Error getting scale notes:', e);
      return [];
    }
  }, [chordRoot, scaleType]);

  // Common select styles
  const selectStyles = {
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1rem',
    backgroundClip: 'padding-box',
    paddingRight: '2rem',
    paddingLeft: '0.75rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    minWidth: '10rem',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: 'white',
    appearance: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
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

  return (
    <div className={`bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/5 shadow-sm ${className}`}>
      <div className="space-y-4">
        {/* Tuning Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-white/70 whitespace-nowrap">Tuning</span>
          <select
            value={currentTuning}
            onChange={(e) => onTuningChange(e.target.value)}
            className="flex-1 min-w-0 text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 transition-colors"
            style={selectStyles}
          >
            {Object.keys(tunings).map((key) => (
              <option key={key} value={key} className="bg-gray-800 text-white">
                {key}
              </option>
            ))}
          </select>
        </div>
        
        {/* Root Note Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-white/70 whitespace-nowrap">Root Note</span>
          <select
            value={chordRoot}
            onChange={(e) => onRootChange(e.target.value)}
            className="flex-1 min-w-0 text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 transition-colors"
            style={selectStyles}
          >
            {allNotes.map((note) => (
              <option key={note} value={note} className="bg-gray-800 text-white">
                {note}
              </option>
            ))}
          </select>
        </div>
        
        {/* Scale Type Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-white/70 whitespace-nowrap">Scale Type</span>
          <select
            value={scaleType}
            onChange={(e) => onScaleChange(e.target.value)}
            className="flex-1 min-w-0 text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 transition-colors"
            style={selectStyles}
          >
            <option value="" className="bg-gray-800 text-white">Select Scale</option>
            {scaleTypes.map((s) => (
              <option key={s.label} value={s.type} className="bg-gray-800 text-white">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Scale Notes Display */}
      {scaleType && scaleNotes.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-white/80 mb-2">Scale Notes</h4>
          <div className="flex flex-wrap gap-2">
            {scaleNotes.map((note, i) => (
              <div 
                key={i} 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  i === 0 ? 'bg-red-600/80' : 
                  note.includes('#') ? 'bg-purple-600/80' : 
                  'bg-blue-600/80'
                }`}
              >
                {note}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ScaleTuningPanel.propTypes = {
  /** Current tuning (e.g., 'Standard') */
  currentTuning: PropTypes.string.isRequired,
  /** Current root note */
  chordRoot: PropTypes.string.isRequired,
  /** Current scale type */
  scaleType: PropTypes.string,
  /** Callback when tuning changes */
  onTuningChange: PropTypes.func.isRequired,
  /** Callback when root note changes */
  onRootChange: PropTypes.func.isRequired,
  /** Callback when scale type changes */
  onScaleChange: PropTypes.func.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default React.memo(ScaleTuningPanel);
