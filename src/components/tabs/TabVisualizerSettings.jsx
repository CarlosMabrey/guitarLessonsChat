'use client';

/**
 * TabVisualizerSettings - Component for visualization settings
 */
const TabVisualizerSettings = ({ 
  showPreview, 
  setShowPreview,
  volume,
  setVolume
}) => {
  return (
    <div className="mt-4 flex justify-between items-center">
      <div className="flex items-center">
        <label htmlFor="preview-toggle" className="text-xs mr-2 text-text-secondary">
          Show MIDI Preview
        </label>
        <input 
          id="preview-toggle"
          type="checkbox" 
          checked={showPreview}
          onChange={(e) => setShowPreview(e.target.checked)}
          className="form-checkbox h-4 w-4 text-primary rounded border-border" 
        />
      </div>
      
      <div className="flex items-center">
        <label htmlFor="volume-slider" className="text-xs mr-2 text-text-secondary">
          Volume
        </label>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-20 h-2 bg-background-hover rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default TabVisualizerSettings;
