'use client';

import React from 'react';
import clsx from 'clsx';

export const ChordDiagram = ({ chord }) => {
  if (!chord) return null;

  const tuning = chord.tuning || ['E', 'A', 'D', 'G', 'B', 'E'];
  const strings = tuning.length;
  const frets = (chord.frets || []).map(f => (f === 'x' ? -1 : parseInt(f, 10)));
  const fingers = chord.fingers || [];
  const notes = chord.notes || [];

  const maxFret = Math.max(...frets.filter(f => f > 0), 1);
  const minFret = Math.min(...frets.filter(f => f > 0), 1);
  const showNut = minFret === 1;
  const fretCount = 5;

  return (
    <div className="my-4 p-6 bg-[#0e1a2b] rounded-xl border border-[#1a2b45] shadow-lg w-fit">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-white">{chord.name}</h3>
        {chord.description && <p className="text-sm text-slate-300">{chord.description}</p>}
      </div>

      <div className="flex justify-center">
        <div className="flex flex-col items-center">
          {/* Top indicators (X or O) */}
          <div className="flex space-x-2 mb-2">
            {frets.map((fret, idx) => (
              <div key={idx} className="w-8 text-center text-white text-sm">
                {fret === -1 ? '✕' : fret === 0 ? '○' : ''}
              </div>
            ))}
          </div>

          {/* Fretboard */}
          <div className="relative">
            <div className="grid grid-cols-6 grid-rows-5 gap-px">
              {Array.from({ length: 5 }).map((_, fretIdx) => (
                tuning.map((_, stringIdx) => {
                  const fretNum = frets[stringIdx];
                  const isPressed = fretNum === fretIdx + 1;
                  const finger = fingers[stringIdx];
                  return (
                    <div
                      key={`${fretIdx}-${stringIdx}`}
                      className={clsx(
                        'w-8 h-8 flex items-center justify-center rounded-full m-0.5',
                        isPressed ? 'bg-blue-500 text-white font-bold text-xs' : 'bg-[#0e1a2b] border border-slate-700'
                      )}
                    >
                      {isPressed ? finger : ''}
                    </div>
                  );
                })
              ))}
            </div>

            {/* Nut or position marker */}
            {showNut && <div className="absolute top-[-10px] left-0 w-full h-1 bg-white rounded-sm"></div>}
          </div>

          {/* Tuning labels */}
          <div className="flex space-x-2 mt-3">
            {tuning.map((note, idx) => (
              <div key={idx} className="text-xs text-slate-300 w-8 text-center">{note}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Optional note row */}
      {notes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-slate-400 mb-1">Notes:</h4>
          <div className="flex flex-wrap gap-2">
            {notes.map((note, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full bg-blue-900 text-blue-200 text-xs"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChordDiagram;