import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

const TabFretboardVisualizer = ({ tabContent, currentPosition = 0 }) => {
  const [fretboardNotes, setFretboardNotes] = useState([]);
  const [startFret, setStartFret] = useState(0);
  const [endFret, setEndFret] = useState(12);
  const strings = ['E', 'A', 'D', 'G', 'B', 'e'];

  useEffect(() => {
    if (!tabContent || !Array.isArray(tabContent)) return;
    const parsedNotes = [];
    const cleanedLines = tabContent
      .map(line => (typeof line === 'string' ? line.replace(/^[^|]*\|/, '') : ''))
      .filter(Boolean);
    if (cleanedLines.length < 4 || cleanedLines.length > 6) return;

    cleanedLines.forEach((line, stringIndex) => {
      [...line.matchAll(/(\d+)/g)].forEach(match => {
        parsedNotes.push({
          string: stringIndex,
          fret: parseInt(match[0], 10),
          column: match.index,
          isActive: false
        });
      });
    });

    if (parsedNotes.length > 0) {
      const frets = parsedNotes.map(note => note.fret);
      setStartFret(Math.max(0, Math.min(...frets) - 1));
      setEndFret(Math.min(24, Math.max(...frets) + 1));
    }
    setFretboardNotes(parsedNotes);
  }, [tabContent]);

  useEffect(() => {
    setFretboardNotes(prev =>
      prev.map(note => ({ ...note, isActive: note.column === Math.round(currentPosition) }))
    );
  }, [currentPosition]);

  const fretCount = endFret - startFret + 1;
  const fretMarkers = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].filter(f => f >= startFret && f <= endFret);

  return (
    <div className="my-4 p-6 bg-[#0e1a2b] rounded-xl border border-[#1a2b45] shadow-lg w-fit overflow-x-auto">
      <div className="relative w-full h-2 mb-1">
        <div className="absolute top-0 left-12 w-[calc(100%-3rem)] h-1 bg-white rounded-sm"></div>
      </div>
      <div className="flex mb-2">
        <div className="w-8"></div>
        {Array.from({ length: fretCount }, (_, i) => (
          <div key={i} className="w-10 text-center text-xs text-slate-400 font-medium">
            {startFret + i}
          </div>
        ))}
      </div>
      <div className="flex">
        <div className="flex flex-col items-center mr-2">
          <div className="h-8" />
          {strings.map((s, i) => (
            <div key={i} className="h-8 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-400">{s}</span>
            </div>
          ))}
        </div>
        {Array.from({ length: fretCount }).map((_, fretIndex) => {
          const fret = startFret + fretIndex;
          return (
            <div key={fret} className="flex flex-col">
              <div className="h-8 flex items-center justify-center">
                <span className="text-xs text-slate-400">{fret}</span>
              </div>
              {strings.map((_, stringIndex) => {
                const notesHere = fretboardNotes.filter(
                  n => n.string === stringIndex && n.fret === fret
                );
                const isActive = notesHere.some(n => n.isActive);
                return (
                  <div
                    key={`${stringIndex}-${fret}`}
                    className={clsx(
                      'h-8 w-8 border border-[#1a2b45] relative',
                      stringIndex === 0 && 'border-t'
                    )}
                  >
                    {notesHere.length > 0 && (
                      <div
                        className={clsx(
                          'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
                          'w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs',
                          isActive ? 'bg-blue-500 text-white shadow-md' : 'bg-[#0e1a2b] border border-slate-700 text-slate-300'
                        )}
                      >
                        {fret}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="flex space-x-2 mt-3 justify-center">
        {strings.map((s, i) => (
          <div key={i} className="text-xs text-slate-400 font-medium w-8 text-center">
            {s.replace(/\d+$/, '')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabFretboardVisualizer;
