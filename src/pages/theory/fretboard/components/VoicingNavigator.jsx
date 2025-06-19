import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component for navigating through different chord voicings
 */
const VoicingNavigator = ({
  currentIndex,
  totalVoicings,
  onNext,
  onPrevious,
  onSelectVoicing,
  currentVoicing,
  reverseStringOrder = false,
  className = ''
}) => {
  if (totalVoicings <= 0 || !currentVoicing) return null;

  // Calculate fret range and muted strings for the current voicing
  const frets = currentVoicing.frets.map(f => (f === 'x' ? null : parseInt(f, 10)));
  const minFret = Math.min(...frets.filter(f => f !== null));
  const maxFret = Math.max(...frets.filter(f => f !== null));
  
  // Get muted strings (1-based index, high E to low E by default)
  const mutedStrings = currentVoicing.frets
    .map((f, i) => (f === 'x' ? (reverseStringOrder ? i + 1 : currentVoicing.frets.length - i) : null))
    .filter(Boolean);

  // Get fingering if available
  const fingering = currentVoicing.fingers ? currentVoicing.fingers.join(' ') : '—';

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between mb-4 gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <button 
          onClick={onPrevious} 
          disabled={totalVoicings <= 1}
          className={`w-10 h-10 rounded-full ${totalVoicings <= 1 ? 'bg-white/5 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'} flex items-center justify-center text-white transition-colors`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
        
        <span className="text-white/80 text-sm font-medium">
          Voicing {currentIndex + 1} of {totalVoicings}
        </span>
        
        <button 
          onClick={onNext} 
          disabled={totalVoicings <= 1}
          className={`w-10 h-10 rounded-full ${totalVoicings <= 1 ? 'bg-white/5 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'} flex items-center justify-center text-white transition-colors`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>
      
      {/* Voicing Info Overlay */}
      <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 flex flex-col md:flex-row items-center gap-4 text-white/90">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Fret Range:</span>
          <span>
            {minFret === maxFret ? `Fret ${minFret}` : `Frets ${minFret}–${maxFret}`}
          </span>
        </div>
        
        <div className="hidden md:block w-px h-6 bg-white/20"></div>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold">Muted:</span>
          <span>
            {mutedStrings.length > 0 ? mutedStrings.join(', ') : 'None'}
          </span>
        </div>
        
        <div className="hidden md:block w-px h-6 bg-white/20"></div>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold">Fingering:</span>
          <span>{fingering}</span>
        </div>
      </div>
      
      {/* Quick navigation dots for smaller screens */}
      {totalVoicings > 1 && (
        <div className="flex md:hidden gap-2 mt-2">
          {Array.from({ length: totalVoicings }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSelectVoicing && onSelectVoicing(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
              aria-label={`Go to voicing ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

VoicingNavigator.propTypes = {
  /** Current voicing index (0-based) */
  currentIndex: PropTypes.number.isRequired,
  /** Total number of available voicings */
  totalVoicings: PropTypes.number.isRequired,
  /** Callback for next button */
  onNext: PropTypes.func.isRequired,
  /** Callback for previous button */
  onPrevious: PropTypes.func.isRequired,
  /** Callback when selecting a specific voicing (for dots navigation) */
  onSelectVoicing: PropTypes.func,
  /** Current voicing object */
  currentVoicing: PropTypes.shape({
    frets: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    fingers: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    barres: PropTypes.array,
    position: PropTypes.number,
  }),
  /** Whether to reverse the string order (for display purposes) */
  reverseStringOrder: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default React.memo(VoicingNavigator);
