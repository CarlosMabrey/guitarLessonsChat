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
  
  // Process tab data when notes prop changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    // If notes are provided, render them
    if (notes?.length > 0) {
      console.log('[TabRenderer] Rendering provided notes:', notes.length);
      renderTab(notes);
      return;
    }
    
    // Fall back to example tab if no notes provided
    console.log('[TabRenderer] No notes provided, loading example tab');
    setLoading(true);
    fetch('/example-tab.json')
      .then(response => response.json())
      .then(data => {
        if (data && data.notes) {
          console.log('[TabRenderer] Loaded example tab with', data.notes.length, 'notes');
          renderTab(data.notes);
        } else {
          setError('Invalid example tab data format');
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error loading example tab:', err);
        setError('Failed to load example tab data');
        setLoading(false);
      });
  }, [notes, renderOptions]);

  // Convert various note formats to VexFlow format
  const convertToVexFlowFormat = (notesArray) => {
    console.log('[TabRenderer] Converting notes to VexFlow format, sample:', notesArray.slice(0, 3));
    
    // Helper function to convert numeric durations to VexFlow format
    const convertDuration = (duration) => {
      // If already a string in VexFlow format like 'q', 'h', 'w', etc.
      if (typeof duration === 'string' && ['w', 'h', 'q', '8', '16', '32'].includes(duration)) {
        return duration;
      }
      
      // Convert numeric durations to VexFlow format
      // 1 = quarter note, 2 = half note, 4 = whole note, 0.5 = eighth note
      if (typeof duration === 'number') {
        switch (duration) {
          case 0.25: return '16'; // Sixteenth note
          case 0.5: return '8';  // Eighth note
          case 1: return 'q';    // Quarter note
          case 2: return 'h';    // Half note
          case 4: return 'w';    // Whole note
          default: return 'q';   // Default to quarter note
        }
      }
      
      // Default is quarter note
      return 'q';
    };
    
    return notesArray.map(note => {
      // If note already has positions array, it's already in VexFlow format
      if (note.positions && Array.isArray(note.positions)) {
        // Still ensure duration is correctly formatted
        return {
          ...note,
          duration: convertDuration(note.duration)
        };
      }
      
      // Format 1: TabFetcherService-style with string/fret as direct properties
      if (typeof note.string === 'number' && (typeof note.fret === 'number' || typeof note.fret === 'string')) {
        return {
          positions: [
            {
              str: note.string, // String number (1-6, high to low)
              fret: note.fret.toString() // Fret number as string
            }
          ],
          // Convert duration to VexFlow format
          duration: convertDuration(note.duration)
        };
      } 
      
      // Format 2: Multiple notes at once (chord format)
      // If this is an array of notes that should be played together
      if (Array.isArray(note)) {
        return {
          positions: note.map(n => ({
            str: n.string || n.str,
            fret: (n.fret !== undefined) ? n.fret.toString() : '0'
          })),
          duration: convertDuration(note[0]?.duration)
        };
      }
      
      // Default fallback
      console.warn('[TabRenderer] Unknown note format:', note);
      return {
        positions: [{str: 1, fret: '0'}], // Default to high E open string
        duration: 'q'
      };
    });
  };

  // Group notes by measure for better rendering
  const groupNotesByMeasure = (notes) => {
    // If notes don't have measure information, treat all as one measure
    if (!notes.some(note => note.measure !== undefined)) {
      return [notes];
    }

    // Group by measure number
    const measureMap = {};
    notes.forEach(note => {
      const measureNum = note.measure !== undefined ? note.measure : 0;
      if (!measureMap[measureNum]) {
        measureMap[measureNum] = [];
      }
      measureMap[measureNum].push(note);
    });

    // Convert map to array of arrays, sorted by measure number
    return Object.keys(measureMap)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(measureNum => measureMap[measureNum]);
  };

  // Render the tab using VexFlow
  const renderTab = (notesArray) => {
    try {
      setLoading(true);
      setError(null);
      
      // Log stats about the notes being rendered
      console.log(`[TabRenderer] Rendering ${notesArray?.length || 0} notes`);
      if (notesArray?.[0]) {
        console.log('[TabRenderer] First note sample:', notesArray[0]);
      }

      // Early return if no notes
      if (!notesArray || notesArray.length === 0) {
        console.warn('[TabRenderer] No notes to render');
        setLoading(false);
        setError('No notes available to render');
        return;
      }
      
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      // Create a renderer and context
      const renderer = new Factory({
        renderer: { elementId: containerRef.current, width: renderOptions.width, height: renderOptions.height }
      });
      const context = renderer.getContext();
      
      // Scale the context for better visibility
      context.scale(renderOptions.scale, renderOptions.scale);

      // Convert to VexFlow format if needed
      const vexFlowNotes = Array.isArray(notesArray) && notesArray.length > 0 && notesArray[0].positions
        ? notesArray // Already in VexFlow format
        : convertToVexFlowFormat(notesArray); // Convert string/fret format

      console.log(`[TabRenderer] Converted ${vexFlowNotes.length} notes to VexFlow format`);
      
      // Group notes by measure for better rendering
      const measuresNotes = groupNotesByMeasure(vexFlowNotes);
      console.log(`[TabRenderer] Grouped into ${measuresNotes.length} measures`);

      // Calculate the height needed for all measures
      const totalMeasures = measuresNotes.length;
      const measuresPerLine = 2; // Display 2 measures per line
      const totalLines = Math.ceil(totalMeasures / measuresPerLine);
      const staveHeight = 120; // Height per stave

      // Container might need to grow to accommodate all measures
      if (totalLines > 2) {
        containerRef.current.style.height = `${totalLines * staveHeight}px`;
      }

      // The effective width of each measure stave
      const measureWidth = (renderOptions.width / renderOptions.scale - 40) / measuresPerLine;
      
      // Loop through measures and create staves
      measuresNotes.forEach((measureNotes, measureIndex) => {
        const lineNumber = Math.floor(measureIndex / measuresPerLine);
        const positionInLine = measureIndex % measuresPerLine;
        
        // Calculate stave position
        const xPosition = 10 + (positionInLine * measureWidth);
        const yPosition = 40 + (lineNumber * staveHeight);
        
        // Create a tab stave for this measure
        const tabStave = new TabStave(xPosition, yPosition, measureWidth);
        
        // Only add clef and time signature for first measure or first in line
        if (measureIndex === 0 || positionInLine === 0) {
          tabStave.addClef(renderOptions.clef)
                 .addTimeSignature(renderOptions.timeSignature);
        }
        
        // Configure and draw the stave
        tabStave.setNumLines(renderOptions.stringCount)
                .setContext(context)
                .draw();
        
        // Create TabNote instances for this measure
        if (measureNotes && measureNotes.length > 0) {
          const tabNotes = measureNotes.map(noteData => {
            try {
              return new TabNote({
                positions: noteData.positions,
                duration: noteData.duration || 'q' // quarter note by default
              });
            } catch (err) {
              console.error('[TabRenderer] Error creating TabNote:', err, noteData);
              return null;
            }
          }).filter(Boolean); // Remove any null entries
        
          // Format and draw the notes for this measure
          if (tabNotes.length > 0) {
            try {
              Formatter.FormatAndDraw(context, tabStave, tabNotes);
            } catch (err) {
              console.error(`[TabRenderer] Error formatting measure ${measureIndex}:`, err);
            }
          }
        }
      });
      
      setLoading(false);
    } catch (err) {
      console.error('[TabRenderer] Error rendering tab:', err);
      setError('Failed to render tablature: ' + err.message);
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