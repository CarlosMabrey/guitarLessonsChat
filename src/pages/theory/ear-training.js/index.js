import React from 'react';
import Layout from '../../../components/ui/Layout';
import Head from 'next/head';
import EarTrainingTool from '../../../components/theory/EarTrainingTool';

export default function EarTrainingPage() {
  return (
    <Layout title="Ear Training">
      <Head>
        <title>Ear Training | Music Theory Tools</title>
        <meta name="description" content="Train your ear by identifying musical intervals, chords, and scales." />
      </Head>
      <EarTrainingTool />
    </Layout>
  );
}

