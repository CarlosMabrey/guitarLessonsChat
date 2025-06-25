import React, { useState } from 'react';
import * as Tone from 'tone';
import ChordDiagram from '@/components/diagrams/ChordDiagram';

const intervalOptions = [
  { label: 'Minor 2nd', semitones: 1 },
  { label: 'Major 2nd', semitones: 2 },
  { label: 'Minor 3rd', semitones: 3 },
  { label: 'Major 3rd', semitones: 4 },
  { label: 'Perfect 4th', semitones: 5 },
  { label: 'Tritone', semitones: 6 },
  { label: 'Perfect 5th', semitones: 7 },
  { label: 'Minor 6th', semitones: 8 },
  { label: 'Major 6th', semitones: 9 },
  { label: 'Minor 7th', semitones: 10 },
  { label: 'Major 7th', semitones: 11 },
  { label: 'Octave', semitones: 12 },
];

const chordOptions = [
  { label: 'C Major', notes: ['C4', 'E4', 'G4'] },
  { label: 'C Minor', notes: ['C4', 'Eb4', 'G4'] },
  { label: 'C7', notes: ['C4', 'E4', 'G4', 'Bb4'] },
  { label: 'Cmaj7', notes: ['C4', 'E4', 'G4', 'B4'] },
  { label: 'Cmin7', notes: ['C4', 'Eb4', 'G4', 'Bb4'] },
  { label: 'Cdim', notes: ['C4', 'Eb4', 'Gb4'] },
  { label: 'Caug', notes: ['C4', 'E4', 'G#4'] },
  { label: 'Csus4', notes: ['C4', 'F4', 'G4'] }
];

// Map quiz chord label to chord name expected by ChordDiagram
function mapChordLabelToName(label) {
  switch (label) {
    case 'C Major': return 'C-M';
    case 'C Minor': return 'C-m';
    case 'C7': return 'C-7';
    case 'Cmaj7': return 'C-maj7';
    case 'Cmin7': return 'C-m7';
    case 'Cdim': return 'C-dim';
    case 'Caug': return 'C-aug';
    case 'Csus4': return 'C-sus4';
    default: return label;
  }
}

export default function EarTrainingTool() {
  const [mode, setMode] = useState('interval');
  const [currentInterval, setCurrentInterval] = useState(null);
  const [currentChord, setCurrentChord] = useState(null);
  const [feedback, setFeedback] = useState('');

  // Play random interval
  const playInterval = async () => {
    await Tone.start();
    const synth = new Tone.Synth().toDestination();
    const baseNote = 'C4';
    const interval = intervalOptions[Math.floor(Math.random() * intervalOptions.length)];
    setCurrentInterval(interval.label);
    setCurrentChord(null);
    setFeedback('');
    synth.triggerAttackRelease(baseNote, '8n');
    setTimeout(() => {
      const noteIndex = Tone.Frequency(baseNote).toMidi() + interval.semitones;
      const secondNote = Tone.Frequency(noteIndex, 'midi').toNote();
      synth.triggerAttackRelease(secondNote, '8n');
    }, 800);
  };

  // Play random chord
  const playChord = async () => {
    await Tone.start();
    const poly = new Tone.PolySynth(Tone.Synth).toDestination();
    const chord = chordOptions[Math.floor(Math.random() * chordOptions.length)];
    setCurrentChord(chord.label);
    setCurrentInterval(null);
    setFeedback('');
    poly.triggerAttackRelease(chord.notes, '1n');
  };

  // Handle interval guess
  const handleGuessInterval = (guess) => {
    if (!currentInterval) return;
    setFeedback(guess === currentInterval ? '✅ Correct!' : `❌ Oops! It was ${currentInterval}`);
  };

  // Handle chord guess
  const handleGuessChord = (guess) => {
    if (!currentChord) return;
    setFeedback(guess === currentChord ? '✅ Correct!' : `❌ Oops! It was ${currentChord}`);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold text-yellow-400 mb-4">👂 Ear Training</h1>

      <div className="mb-4">
        <label className="text-sm text-gray-300 mr-2">Mode:</label>
        <select
          value={mode}
          onChange={(e) => { setMode(e.target.value); setFeedback(''); setCurrentInterval(null); setCurrentChord(null); }}
          className="bg-gray-800 border border-gray-600 text-white px-2 py-1 rounded text-sm"
        >
          <option value="interval">Interval Recognition</option>
          <option value="chord">Chord Recognition</option>
          <option value="scale" disabled>Scale Recognition (Coming Soon)</option>
        </select>
      </div>

      {mode === 'interval' && (
        <>
          <button
            onClick={playInterval}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            🔊 Play Random Interval
          </button>
          <div className="mt-6">
            <h2 className="text-md font-semibold text-gray-200 mb-2">What interval did you hear?</h2>
            <div className="flex flex-wrap gap-2">
              {intervalOptions.map((int) => (
                <button
                  key={int.label}
                  onClick={() => handleGuessInterval(int.label)}
                  className="bg-gray-700 hover:bg-gray-600 text-sm px-3 py-1 rounded text-white"
                >
                  {int.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {mode === 'chord' && (
        <>
          <button
            onClick={playChord}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            🔊 Play Random Chord
          </button>
          <div className="mt-6">
            <h2 className="text-md font-semibold text-gray-200 mb-2">What chord did you hear?</h2>
            <div className="flex flex-wrap gap-2">
              {chordOptions.map((chord) => (
                <button
                  key={chord.label}
                  onClick={() => handleGuessChord(chord.label)}
                  className="bg-gray-700 hover:bg-gray-600 text-sm px-3 py-1 rounded text-white"
                >
                  {chord.label}
                </button>
              ))}
            </div>
            {/* Show chord diagram after a guess */}
            {feedback && currentChord && (
              <div className="mt-6 flex flex-col items-center">
                <span className="mb-2 text-blue-300 font-semibold">{currentChord} chord diagram:</span>
                {/* Debug log for chordName */}
                {(() => { console.log('ChordDiagram chordName:', mapChordLabelToName(currentChord)); return null; })()}
                <ChordDiagram chordName={mapChordLabelToName(currentChord)} size="md" />
                <span className="mt-2 text-xs text-gray-400">(debug: {mapChordLabelToName(currentChord)})</span>
              </div>
            )}
          </div>
        </>
      )}

      {feedback && (
        <div className="mt-4 text-lg font-bold">
          {feedback}
        </div>
      )}
    </div>
  );
}
