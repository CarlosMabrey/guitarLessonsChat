import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Dropdown component for display settings
 */
const DisplaySettings = ({
  reverseStringOrder,
  showOnlyRelevantNotes,
  showVoicingOverScale,
  singleVoicingMode,
  voicingStringSet,
  voicingFretRange,
  onReverseStringOrderChange,
  onShowOnlyRelevantNotesChange,
  onShowVoicingOverScaleChange,
  onSingleVoicingModeChange,
  onVoicingStringSetChange,
  onVoicingFretRangeChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Handle string set change
  const handleStringSetChange = (e) => {
    onVoicingStringSetChange(e.target.value);
  };

  // Handle fret range change
  const handleFretRangeChange = (min, max) => {
    onVoicingFretRangeChange([min, max]);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-expanded="true"
        aria-haspopup="true"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-72 rounded-xl shadow-lg bg-gray-800/95 backdrop-blur-md ring-1 ring-black/5 z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-medium text-white">Display Settings</h3>
            </div>
            
            {/* String Order */}
            <div className="px-4 py-3 border-b border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="reverse-strings" className="text-sm font-medium text-white/90">
                  Reverse String Order
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    id="reverse-strings"
                    checked={reverseStringOrder}
                    onChange={(e) => onReverseStringOrderChange(e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label 
                    htmlFor="reverse-strings" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${reverseStringOrder ? 'bg-blue-500' : 'bg-gray-600'}`}
                  ></label>
                </div>
              </div>
              <p className="mt-1 text-xs text-white/60">
                {reverseStringOrder ? 'Low E on top' : 'High E on top'}
              </p>
            </div>
            
            {/* Show Only Relevant Notes */}
            <div className="px-4 py-3 border-b border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="relevant-notes" className="text-sm font-medium text-white/90">
                  Show Only Scale/Chord Notes
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    id="relevant-notes"
                    checked={showOnlyRelevantNotes}
                    onChange={(e) => onShowOnlyRelevantNotesChange(e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label 
                    htmlFor="relevant-notes" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${showOnlyRelevantNotes ? 'bg-blue-500' : 'bg-gray-600'}`}
                  ></label>
                </div>
              </div>
              <p className="mt-1 text-xs text-white/60">
                {showOnlyRelevantNotes ? 'Showing only relevant notes' : 'Showing all notes'}
              </p>
            </div>
            
            {/* Single Voicing Mode */}
            <div className="px-4 py-3 border-b border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="single-voicing" className="text-sm font-medium text-white/90">
                  Single Voicing Mode
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    id="single-voicing"
                    checked={singleVoicingMode}
                    onChange={(e) => onSingleVoicingModeChange(e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label 
                    htmlFor="single-voicing" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${singleVoicingMode ? 'bg-blue-500' : 'bg-gray-600'}`}
                  ></label>
                </div>
              </div>
              <p className="mt-1 text-xs text-white/60">
                {singleVoicingMode ? 'Showing one voicing at a time' : 'Showing all voicings'}
              </p>
            </div>
            
            {/* Show Voicing Over Scale */}
            <div className="px-4 py-3 border-b border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="voicing-over-scale" className="text-sm font-medium text-white/90">
                  Show Voicing Over Scale
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    id="voicing-over-scale"
                    checked={showVoicingOverScale}
                    onChange={(e) => onShowVoicingOverScaleChange(e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label 
                    htmlFor="voicing-over-scale" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${showVoicingOverScale ? 'bg-blue-500' : 'bg-gray-600'}`}
                  ></label>
                </div>
              </div>
              <p className="mt-1 text-xs text-white/60">
                {showVoicingOverScale ? 'Voicing overlaid on scale' : 'Voicing only'}
              </p>
            </div>
            
            {/* String Set Filter */}
            <div className="px-4 py-3 border-b border-white/5">
              <label htmlFor="string-set" className="block text-sm font-medium text-white/90 mb-1">
                String Set
              </label>
              <select
                id="string-set"
                value={voicingStringSet}
                onChange={handleStringSetChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-700 text-white"
              >
                <option value="all">All Strings</option>
                <option value="1-3">Top 3 Strings (High E, B, G)</option>
                <option value="2-4">Middle 3 Strings (B, G, D)</option>
                <option value="4-6">Bottom 3 Strings (D, A, Low E)</option>
              </select>
              <p className="mt-1 text-xs text-white/60">
                Filter voicings by string set
              </p>
            </div>
            
            {/* Fret Range Slider */}
            <div className="px-4 py-3">
              <div className="flex justify-between mb-1">
                <label htmlFor="fret-range" className="block text-sm font-medium text-white/90">
                  Fret Range
                </label>
                <span className="text-xs text-white/60">
                  {voicingFretRange[0]} - {voicingFretRange[1]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  id="fret-range-min"
                  min="0"
                  max="12"
                  step="1"
                  value={voicingFretRange[0]}
                  onChange={(e) => handleFretRangeChange(parseInt(e.target.value), voicingFretRange[1])}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-white/60">to</span>
                <input
                  type="range"
                  id="fret-range-max"
                  min="0"
                  max="12"
                  step="1"
                  value={voicingFretRange[1]}
                  onChange={(e) => handleFretRangeChange(voicingFretRange[0], parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <p className="mt-1 text-xs text-white/60">
                Filter voicings by fret range
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DisplaySettings.propTypes = {
  /** Whether to reverse the string order */
  reverseStringOrder: PropTypes.bool,
  /** Whether to show only notes in the current scale/chord */
  showOnlyRelevantNotes: PropTypes.bool,
  /** Whether to show voicing over scale */
  showVoicingOverScale: PropTypes.bool,
  /** Whether to show only one voicing at a time */
  singleVoicingMode: PropTypes.bool,
  /** Current string set filter */
  voicingStringSet: PropTypes.string,
  /** Current fret range filter */
  voicingFretRange: PropTypes.arrayOf(PropTypes.number),
  /** Callback when string order changes */
  onReverseStringOrderChange: PropTypes.func,
  /** Callback when show only relevant notes changes */
  onShowOnlyRelevantNotesChange: PropTypes.func,
  /** Callback when show voicing over scale changes */
  onShowVoicingOverScaleChange: PropTypes.func,
  /** Callback when single voicing mode changes */
  onSingleVoicingModeChange: PropTypes.func,
  /** Callback when string set filter changes */
  onVoicingStringSetChange: PropTypes.func,
  /** Callback when fret range filter changes */
  onVoicingFretRangeChange: PropTypes.func,
  /** Additional CSS classes */
  className: PropTypes.string,
};

DisplaySettings.defaultProps = {
  reverseStringOrder: false,
  showOnlyRelevantNotes: true,
  showVoicingOverScale: true,
  singleVoicingMode: false,
  voicingStringSet: 'all',
  voicingFretRange: [0, 12],
};

export default React.memo(DisplaySettings);
