import React, { useState } from 'react';
import Layout from '../../../components/ui/Layout';
import Head from 'next/head';
import * as Tone from 'tone';

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

export default function EarTrainingPage() {
  const [mode, setMode] = useState('interval');
  const [currentInterval, setCurrentInterval] = useState(null);
  const [feedback, setFeedback] = useState('');

  const playInterval = async () => {
    await Tone.start();
    const synth = new Tone.Synth().toDestination();
    const baseNote = 'C4';
    const interval = intervalOptions[Math.floor(Math.random() * intervalOptions.length)];
    setCurrentInterval(interval.label);

    synth.triggerAttackRelease(baseNote, '8n');
    setTimeout(() => {
      const noteIndex = Tone.Frequency(baseNote).toMidi() + interval.semitones;
      const secondNote = Tone.Frequency(noteIndex, 'midi').toNote();
      synth.triggerAttackRelease(secondNote, '8n');
    }, 800);
  };

  const handleGuess = (guess) => {
    if (!currentInterval) return;
    setFeedback(guess === currentInterval ? '✅ Correct!' : `❌ Oops! It was ${currentInterval}`);
  };

  return (
    <Layout title="Ear Training">
      <Head>
        <title>Ear Training | Music Theory Tools</title>
        <meta name="description" content="Train your ear by identifying musical intervals, chords, and scales." />
      </Head>

      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4">👂 Ear Training</h1>

        <div className="mb-4">
          <label className="text-sm text-gray-300 mr-2">Mode:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white px-2 py-1 rounded text-sm"
          >
            <option value="interval">Interval Recognition</option>
            <option value="chord" disabled>Chord Recognition (Coming Soon)</option>
            <option value="scale" disabled>Scale Recognition (Coming Soon)</option>
          </select>
        </div>

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
                onClick={() => handleGuess(int.label)}
                className="bg-gray-700 hover:bg-gray-600 text-sm px-3 py-1 rounded text-white"
              >
                {int.label}
              </button>
            ))}
          </div>
        </div>

        {feedback && (
          <div className="mt-4 text-lg font-bold">
            {feedback}
          </div>
        )}
      </div>
    </Layout>
  );
}
