import React from 'react';
import PropTypes from 'prop-types';

/**
 * Header section for the Fretboard page
 * Displays the title and action buttons
 */
const HeaderSection = ({ 
  onPlay, 
  onReset, 
  isPlayDisabled,
  title = "Guitar Fretboard Visualizer"
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
      <h1 className="text-3xl font-bold text-white tracking-tight mb-4 md:mb-0">
        {title}
      </h1>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={onPlay}
          disabled={isPlayDisabled}
          className={`flex items-center px-5 py-2 rounded-full ${
            isPlayDisabled 
              ? 'bg-gray-600/50 cursor-not-allowed' 
              : 'bg-blue-600/80 hover:bg-blue-600/90'
          } backdrop-blur-sm text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/20`}
        >
          <span className="mr-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                clipRule="evenodd" 
              />
            </svg>
          </span>
          <span>Play</span>
        </button>
        
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm transition-colors duration-200 backdrop-blur-lg"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

HeaderSection.propTypes = {
  /** Callback when play button is clicked */
  onPlay: PropTypes.func.isRequired,
  /** Callback when reset button is clicked */
  onReset: PropTypes.func.isRequired,
  /** Whether the play button should be disabled */
  isPlayDisabled: PropTypes.bool,
  /** Optional title override */
  title: PropTypes.string,
};

export default React.memo(HeaderSection);
