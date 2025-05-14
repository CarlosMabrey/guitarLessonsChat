import React, { useState } from 'react';
import Layout from '../../../components/ui/Layout';
import Head from 'next/head';
import * as Tonal from 'tonal';

const scaleTypes = [
  { label: 'Major', type: 'major' },
  { label: 'Natural Minor', type: 'natural minor' },
  { label: 'Harmonic Minor', type: 'harmonic minor' },
  { label: 'Melodic Minor', type: 'melodic minor' },
  { label: 'Major Pentatonic', type: 'major pentatonic' },
  { label: 'Minor Pentatonic', type: 'minor pentatonic' },
  { label: 'Blues', type: 'blues' },
  { label: 'Dorian', type: 'dorian' },
  { label: 'Phrygian', type: 'phrygian' },
  { label: 'Lydian', type: 'lydian' },
  { label: 'Mixolydian', type: 'mixolydian' },
  { label: 'Locrian', type: 'locrian' },
];

const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function ScaleExplorerPage() {
  const [root, setRoot] = useState('C');
  const [type, setType] = useState('major');

  const scale = Tonal.Scale.get(`${root} ${type}`);
  const notes = scale?.notes || [];
  const formula = scale?.intervals?.join('-') || '—';

  return (
    <Layout title="Scale Explorer">
      <Head>
        <title>Scales | Music Theory Tools</title>
        <meta name="description" content="Explore musical scales by root and type. Visualize them on a fretboard or keyboard." />
      </Head>

      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4">📈 Scale Explorer</h1>

        {/* Selectors */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm mr-2 text-gray-300">Root:</label>
            <select
              value={root}
              onChange={(e) => setRoot(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white text-sm px-3 py-1 rounded"
            >
              {allNotes.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm mr-2 text-gray-300">Scale:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white text-sm px-3 py-1 rounded"
            >
              {scaleTypes.map((s) => (
                <option key={s.type} value={s.type}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Info */}
        <div className="mb-6 text-gray-300">
          <p><strong className="text-green-400">Notes:</strong> {notes.join(', ') || 'N/A'}</p>
          <p><strong className="text-blue-400">Formula:</strong> {formula}</p>
        </div>

        {/* Visualizer Placeholder */}
        <div className="bg-gray-800 text-sm p-4 rounded text-gray-400">
          🎹 Keyboard and 🎸 Fretboard visualizers coming soon.
        </div>
      </div>
    </Layout>
  );
}
