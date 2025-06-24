/**
 * Utility functions to convert different tab formats to the format expected by TabFretboardVisualizer
 */
import demoTabs from '@/data/tabs/demoTabs';

/**
 * Converts a demo tab from demoTabs.js to the format expected by TabFretboardVisualizer
 * @param {Object} demoTab - A tab object from the demoTabs array
 * @returns {Object} Tab data formatted for TabFretboardVisualizer 
 */
export const convertDemoTabToVisualizerFormat = (demoTab) => {
  if (!demoTab || !demoTab.data || !demoTab.data.notes) {
    return null;
  }

  // Default time settings (milliseconds)
  const noteTimeMs = 200; // Time per note position in ms
  const measures = [];
  
  // Group notes by measure
  const measureMap = {};
  
  // Process notes to add time and duration properties
  const processedNotes = demoTab.data.notes.map(note => {
    // Calculate absolute time based on position (assuming constant time per note)
    const time = note.position * noteTimeMs;
    
    // Use duration if available, otherwise default to 1 position worth of time
    const duration = note.duration ? (note.duration * noteTimeMs) : noteTimeMs;
    
    // Prepare note for measure grouping
    const processedNote = {
      ...note,
      time,
      duration
    };
    
    // Group notes by measure
    const measureIndex = note.measure;
    if (!measureMap[measureIndex]) {
      measureMap[measureIndex] = [];
    }
    measureMap[measureIndex].push(processedNote);
    
    return processedNote;
  });
  
  // Convert the measure map to array format expected by visualizer
  Object.keys(measureMap)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(measureIndex => {
      measures.push(measureMap[measureIndex]);
    });
  
  return {
    title: demoTab.title,
    artist: demoTab.artist,
    tuning: demoTab.data.tuning || 'Standard',
    notes: processedNotes,
    measures: measures,
    rawTab: demoTab.data.rawTab,
    bpm: 120, // Default BPM if not specified
    timeSignature: '4/4', // Default time signature if not specified
  };
};

/**
 * Returns the first demo tab in visualizer format
 * @returns {Object} First demo tab formatted for TabFretboardVisualizer
 */
export const getFirstDemoTab = () => {
  if (demoTabs && demoTabs.length > 0) {
    return convertDemoTabToVisualizerFormat(demoTabs[0]);
  }
  return null;
};

/**
 * Returns a specific demo tab by ID in visualizer format
 * @param {string} tabId - ID of the demo tab to retrieve
 * @returns {Object} Demo tab formatted for TabFretboardVisualizer
 */
export const getDemoTabById = (tabId) => {
  if (!tabId || !demoTabs) return null;
  
  const tab = demoTabs.find(tab => tab.id === tabId);
  if (tab) {
    return convertDemoTabToVisualizerFormat(tab);
  }
  return null;
};

/**
 * Returns all demo tabs in visualizer format
 * @returns {Array} All demo tabs formatted for TabFretboardVisualizer
 */
export const getAllDemoTabs = () => {
  if (!demoTabs) return [];
  
  return demoTabs.map(tab => convertDemoTabToVisualizerFormat(tab));
};
