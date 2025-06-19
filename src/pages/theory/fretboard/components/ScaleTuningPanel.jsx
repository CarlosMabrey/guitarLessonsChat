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

  return (
    <div className={`bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Scale & Tuning</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tuning Selector */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-white/80">Tuning</label>
          <select
            value={currentTuning}
            onChange={(e) => onTuningChange(e.target.value)}
            className="w-full bg-[var(--card)] border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1rem'
            }}
          >
            {Object.keys(tunings).map((key) => (
              <option key={key} value={key} className="bg-gray-800 text-white">
                {key}
              </option>
            ))}
          </select>
        </div>
        
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
        
        {/* Scale Type Selector */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-white/80">Scale Type</label>
          <select
            value={scaleType}
            onChange={(e) => onScaleChange(e.target.value)}
            className="w-full bg-[var(--card)] border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1rem'
            }}
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
