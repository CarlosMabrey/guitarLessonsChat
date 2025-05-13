'use client';

import { useEffect, useRef, useState } from 'react';
import { Factory, TabStave, TabNote, Formatter } from 'vexflow';
import { FiLoader } from 'react-icons/fi';

/**
 * TabRenderer component that uses VexFlow to render guitar tablature
 * @param {Array} notes - Array of note objects to render
 * @param {Object} options - Rendering options like width, height, etc.
 */
const TabRenderer = ({ notes = [], options = {} }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default options
  const defaultOptions = {
    width: 800,
    height: 300,
    scale: 0.8,
    clef: 'treble',
    timeSignature: '4/4',
    stringCount: 6,
    measures: 4,
  };
  
  // Merge default options with provided options
  const renderOptions = { ...defaultOptions, ...options };
  
  useEffect(() => {
    if (!containerRef.current || notes.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      // Create a renderer and context
      const renderer = new Factory({
        renderer: { elementId: containerRef.current, width: renderOptions.width, height: renderOptions.height }
      });
      const context = renderer.getContext();
      
      // Scale the context for better visibility
      context.scale(renderOptions.scale, renderOptions.scale);
      
      // Create a tab stave
      const tabStave = new TabStave(10, 40, renderOptions.width / renderOptions.scale - 20);
      
      // Add clef, time signature, and strings
      tabStave.addClef(renderOptions.clef)
          .addTimeSignature(renderOptions.timeSignature)
          .setNumLines(renderOptions.stringCount)
          .setContext(context)
          .draw();
      
      // Create tab notes from the provided notes array
      const tabNotes = notes.map(noteData => {
        // Convert note data to VexFlow format
        return new TabNote({
          positions: noteData.positions,
          duration: noteData.duration || 'q' // quarter note by default
        });
      });
      
      // Format and draw the notes
      Formatter.FormatAndDraw(context, tabStave, tabNotes);
      
      setLoading(false);
    } catch (err) {
      console.error('Error rendering tab:', err);
      setError('Failed to render tablature');
      setLoading(false);
    }
  }, [notes, renderOptions]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <FiLoader className="animate-spin text-primary mr-2" />
        <span>Rendering tab...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-6 text-text-secondary">
        {error}
      </div>
    );
  }
  
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center p-6 text-text-secondary">
        No tab data available to render
      </div>
    );
  }
  
  return (
    <div className="tab-renderer overflow-auto">
      <div ref={containerRef} className="tab-container"></div>
    </div>
  );
};

export default TabRenderer; 