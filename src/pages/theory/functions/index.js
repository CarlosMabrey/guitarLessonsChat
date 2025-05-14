// pages/theory/functions/index.js
import React from 'react';
import Layout from '../../../components/ui/Layout';
import Head from 'next/head';

const ChordFunctionGraphPage = () => {
  return (
    <Layout title="Chord Function Graph">
      <Head>
        <title>Chord Function Graph | Music Theory Tools</title>
        <meta name="description" content="Visualize harmonic functions (tonic, dominant, subdominant) within a key using interactive graphs." />
      </Head>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ color: '#fbbf24', fontSize: '2rem' }}>🔗 Chord Function Graph</h1>
        <p style={{ color: '#e2e8f0' }}>This tool will let you explore harmonic relationships and functions in a visual way. Users will be able to:</p>
        <ul style={{ color: '#cbd5e0', paddingLeft: '1.2rem', marginTop: '1rem' }}>
          <li>See how chords in a key relate to tonic, dominant, and subdominant functions.</li>
          <li>Highlight functional motion through progressions.</li>
          <li>Click on chords to hear them and see how they resolve.</li>
          <li>Toggle between major and minor key graphs.</li>
        </ul>
        <p style={{ marginTop: '1rem', color: '#a0aec0' }}>Graph interactivity coming soon...</p>
      </div>
    </Layout>
  );
};

export default ChordFunctionGraphPage;
