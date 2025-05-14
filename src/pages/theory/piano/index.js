// pages/theory/piano/index.js
import React from 'react';
import Layout from '../../../components/ui/Layout';
import Head from 'next/head';

const PianoVisualizerPage = () => {
  return (
    <Layout title="Piano Keyboard Visualizer">
      <Head>
        <title>Piano Visualizer | Music Theory Tools</title>
        <meta name="description" content="Explore and play piano chords and scales with visual feedback." />
      </Head>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ color: '#fbbf24', fontSize: '2rem' }}>🎹 Piano Keyboard Visualizer</h1>
        <p style={{ color: '#e2e8f0' }}>This page will include an interactive piano keyboard that highlights notes of selected chords or scales and plays back the audio in sync. Users will be able to:</p>
        <ul style={{ color: '#cbd5e0', paddingLeft: '1.2rem', marginTop: '1rem' }}>
          <li>Select a root note and chord/scale type.</li>
          <li>See the notes visually highlighted on a piano keyboard layout.</li>
          <li>Hear the audio playback of the selected structure.</li>
          <li>Optional: MIDI input support and responsive keys.</li>
        </ul>
        <p style={{ marginTop: '1rem', color: '#a0aec0' }}>Functionality coming soon...</p>
      </div>
    </Layout>
  );
};

export default PianoVisualizerPage;
