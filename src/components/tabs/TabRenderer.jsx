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
  
  // Load example tab data for development testing
  useEffect(() => {
    // If no notes are provided, load example tab JSON
    if (notes?.length === 0 && containerRef.current) {
      fetch('/example-tab.json')
        .then(response => response.json())
        .then(data => {
          if (data && data.notes) {
            renderTab(data.notes);
          }
        })
        .catch(err => {
          console.error('Error loading example tab:', err);
          setError('Failed to load example tab data');
          setLoading(false);
        });
    } else if (notes?.length > 0 && containerRef.current) {
      renderTab(notes);
    }
  }, [notes, renderOptions]);

  // Convert string/fret format to VexFlow positions format
  const convertToVexFlowFormat = (notesArray) => {
    return notesArray.map(note => {
      // VexFlow uses 1-based string numbering (1=high E, 6=low E)
      // and our example-tab.json uses the same convention
      return {
        positions: [
          {
            str: note.string, // String number (1-6, high to low)
            fret: note.fret.toString() // Fret number as string
          }
        ],
        duration: 'q' // Use quarter notes by default
      };
    });
  };

  // Render the tab using VexFlow
  const renderTab = (notesArray) => {
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
      
      // Convert to VexFlow format if needed and create tab notes
      const vexFlowNotes = Array.isArray(notesArray) && notesArray.length > 0 && notesArray[0].positions
        ? notesArray // Already in VexFlow format
        : convertToVexFlowFormat(notesArray); // Convert string/fret format
          
      // Create TabNote instances
      const tabNotes = vexFlowNotes.map(noteData => {
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
  };
  
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