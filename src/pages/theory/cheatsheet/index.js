// pages/theory/cheatsheet/index.js
import React from 'react';
import Layout from '../../../components/ui/Layout';
import Head from 'next/head';

const MusicTheoryCheatsheetPage = () => {
  return (
    <Layout title="Music Theory Cheatsheet">
      <Head>
        <title>Cheatsheet | Music Theory Tools</title>
        <meta name="description" content="Quick reference for chords, scales, intervals, modes, and progressions." />
      </Head>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ color: '#fbbf24', fontSize: '2rem' }}>📚 Music Theory Cheatsheet</h1>
        <p style={{ color: '#e2e8f0' }}>This quick-reference page will provide essential music theory charts and tables. Users will be able to:</p>
        <ul style={{ color: '#cbd5e0', paddingLeft: '1.2rem', marginTop: '1rem' }}>
          <li>Review intervals, scale formulas, and chord construction rules.</li>
          <li>Understand modal relationships and function labels (I, IV, V, etc.).</li>
          <li>See commonly used progressions and voice leading tips.</li>
          <li>Access Roman numeral analysis and chord spelling.</li>
        </ul>
        <p style={{ marginTop: '1rem', color: '#a0aec0' }}>More diagrams and interactive visuals coming soon...</p>
      </div>
    </Layout>
  );
};

export default MusicTheoryCheatsheetPage;
