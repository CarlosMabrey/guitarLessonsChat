import React, { useState } from 'react';
import Layout from '../../../components/ui/Layout';
import Head from 'next/head';

const chordTypes = [
  'maj', 'm', '7', 'm7', 'maj7', 'dim', 'aug', 'sus2', 'sus4'
];

const rootNotes = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B'
];

const defaultProgression = [
  { root: 'C', type: 'maj' },
  { root: 'F', type: 'maj' },
  { root: 'G', type: '7' },
  { root: 'C', type: 'maj' }
];

export default function ProgressionsPage() {
  const [progression, setProgression] = useState(defaultProgression);
  const [key, setKey] = useState('C');

  const updateChord = (index, field, value) => {
    const updated = [...progression];
    updated[index][field] = value;
    setProgression(updated);
  };

  const addChord = () => {
    setProgression([...progression, { root: 'C', type: 'maj' }]);
  };

  const removeChord = (index) => {
    setProgression(progression.filter((_, i) => i !== index));
  };

  return (
    <Layout title="Chord Progressions Builder">
      <Head>
        <title>Chord Progressions | Music Theory Tools</title>
        <meta name="description" content="Build and play custom chord progressions with guitar and piano visualizations." />
      </Head>

      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4">🎵 Chord Progression Builder</h1>

        {/* Key Selector */}
        <div className="mb-6 flex gap-4 items-center">
          <label className="text-sm text-gray-300">Key:</label>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="bg-gray-800 text-white px-3 py-1 border border-gray-600 rounded"
          >
            {rootNotes.map(note => (
              <option key={note} value={note}>{note}</option>
            ))}
          </select>
        </div>

        {/* Progression Editor */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {progression.map((chord, i) => (
            <div key={i} className="bg-gray-700 rounded p-3 shadow-md flex flex-col items-center relative">
              <select
                value={chord.root}
                onChange={(e) => updateChord(i, 'root', e.target.value)}
                className="mb-2 bg-gray-800 text-white px-2 py-1 rounded border border-gray-600"
              >
                {rootNotes.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <select
                value={chord.type}
                onChange={(e) => updateChord(i, 'type', e.target.value)}
                className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-600"
              >
                {chordTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button
                onClick={() => removeChord(i)}
                className="absolute top-0 right-1 text-xs text-red-400 hover:text-red-600"
                title="Remove"
              >
                ✖
              </button>
            </div>
          ))}
          <button
            onClick={addChord}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            + Add Chord
          </button>
        </div>

        {/* Playback & Visualization Placeholder */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center mb-2">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">▶️ Play</button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">🔁 Loop</button>
            <span className="text-gray-400 text-sm">Coming soon: Strumming & Arpeggios</span>
          </div>

          <div className="bg-gray-800 text-sm p-4 rounded text-gray-300">
            🎸 Fretboard and 🎹 Keyboard visualizers will appear here for each chord.
          </div>
        </div>
      </div>
    </Layout>
  );
}
