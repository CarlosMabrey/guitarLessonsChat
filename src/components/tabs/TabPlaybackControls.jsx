'use client';

import { FiPlay, FiPause, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { formatTime } from './utils/tabUtils';

/**
 * TabPlaybackControls - Component for playback controls of the tab visualizer
 */
const TabPlaybackControls = ({ 
  isPlaying, 
  togglePlayPause,
  currentMeasure,
  totalMeasures,
  currentTime,
  totalDuration,
  onPrevMeasure,
  onNextMeasure,
  playbackSpeed,
  setPlaybackSpeed
}) => {
  // Calculate progress percentage for the progress bar
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
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
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">
          Measure {currentMeasure + 1} of {totalMeasures}
        </span>
        <span className="font-mono text-text-secondary">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>
      </div>
      
      <div className="w-full bg-background-hover rounded-full h-2 overflow-hidden">
        <div 
          className="bg-primary h-full rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex items-center justify-center space-x-4 pt-2">
        <button
          onClick={onPrevMeasure}
          disabled={currentMeasure === 0}
          className="p-2 rounded-full hover:bg-background-hover text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous measure"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={togglePlayPause}
          className="p-3 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <FiPause className="w-5 h-5" />
          ) : (
            <FiPlay className="w-5 h-5" />
          )}
        </button>
        
        <button
          onClick={onNextMeasure}
          disabled={currentMeasure === totalMeasures - 1}
          className="p-2 rounded-full hover:bg-background-hover text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next measure"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TabPlaybackControls;
