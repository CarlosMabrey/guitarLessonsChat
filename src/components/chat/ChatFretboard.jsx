import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { Note } from '@tonaljs/tonal';

// Import the FretboardGrid component
const FretboardGrid = dynamic(
  () => import('@/pages/theory/fretboard/components/FretboardGrid'),
  { ssr: false, loading: () => <div className="p-4 bg-gray-100 rounded">Loading fretboard...</div> }
);

/**
 * Wrapper component to display fretboard visualizations in chat
 */
const ChatFretboard = ({ 
  tuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  notes = [],
  showFretNumbers = true,
  showNoteNames = true,
  width = '100%',
  maxWidth = 400,
  interactive = true,
  ...props 
}) => {
  // Calculate fret range based on notes
  const fretRange = useMemo(() => {
    if (!notes.length) return { minFret: 1, maxFret: 5 };
    
    const frets = notes
      .map(note => note.fret)
      .filter(fret => fret !== undefined && fret !== null && fret > 0);
      
    if (!frets.length) return { minFret: 1, maxFret: 5 };
    
    const minFret = Math.max(1, Math.min(...frets) - 1);
    const maxFret = Math.max(5, Math.max(...frets) + 1);
    
    return { minFret, maxFret };
  }, [notes]);
  
  // Convert notes to highlighted notes format for FretboardGrid
  const highlightedNotes = useMemo(() => {
    return notes.map(note => ({
      note: note.note || '',
      string: note.string - 1, // Convert to 0-based index
      fret: note.fret,
      color: note.color || '#3b82f6',
      label: note.label || '',
      highlight: true
    }));
  }, [notes]);
  
  // Calculate frets to display
  const frets = useMemo(() => {
    const { minFret, maxFret } = fretRange;
    return Array.from({ length: maxFret - minFret + 1 }, (_, i) => i + minFret);
  }, [fretRange]);

  return (
    <div style={{ width, maxWidth }} className="my-4 p-6 bg-[#0e1a2b] rounded-xl border border-[#1a2b45] shadow-lg w-fit">
  {/* Nut marker if minFret is 1 */}
  {fretRange.minFret === 1 && (
    <div className="relative w-full h-2 mb-1">
      <div className="absolute top-0 left-0 w-full h-1 bg-white rounded-sm"></div>
    </div>
  )}
  <div className="flex justify-center">
    <div className="flex flex-col items-center">
      {/* Fretboard grid */}
      <FretboardGrid 
        strings={tuning}
        frets={frets}
        highlightedNotes={highlightedNotes}
        showFretNumbers={showFretNumbers}
        showNoteNames={showNoteNames}
        displayMode="chord"
        singleVoicingMode={true}
        currentVoicing={{
          frets: notes.map(note => note.fret?.toString() || 'x')
        }}
        className="w-full"
      />
      {/* Tuning labels */}
      <div className="flex space-x-2 mt-3">
        {tuning.map((note, idx) => (
          <div key={idx} className="text-xs text-slate-300 w-8 text-center">{note.replace(/\d+$/, '')}</div>
        ))}
      </div>
      {/* Optional note legend */}
      {notes.some(n => n.label) && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {notes.filter(n => n.label).map((note, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-blue-900 text-blue-200 text-xs"
              >
                {note.label}: {note.note}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
</div>
  );
};

ChatFretboard.propTypes = {
  tuning: PropTypes.arrayOf(PropTypes.string),
  notes: PropTypes.arrayOf(PropTypes.shape({
    string: PropTypes.number.isRequired,
    fret: PropTypes.number.isRequired,
    note: PropTypes.string.isRequired,
    duration: PropTypes.string,
    highlight: PropTypes.bool,
    color: PropTypes.string,
    label: PropTypes.string
  })),
  showFretNumbers: PropTypes.bool,
  showNoteNames: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  interactive: PropTypes.bool
};

export default ChatFretboard;
