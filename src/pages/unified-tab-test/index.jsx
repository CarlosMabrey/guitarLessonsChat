'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import Layout from '@/components/ui/Layout';
import SongTabViewer from '@/components/songs/SongTabViewer';

export default function UnifiedTabTestPage() {
  // Example props for SongTabViewer
  const exampleSong = {
    songId: '12345',
    artist: 'Oasis',
    title: 'Wonderwall',
  };

  return (
    <Layout title="Unified Tab Test">
      <div className="container py-6">
        <Link href="/dashboard" className="inline-flex items-center text-text-secondary hover:text-text-primary mb-4">
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-6">Unified Tab Viewer Test</h1>
        <div className="p-4 bg-blue-100 text-blue-700 rounded-md mb-6">
          <p className="font-bold">Testing Environment</p>
          <p>This page allows you to test the unified tab viewer component with sample data.</p>
        </div>
        <SongTabViewer {...exampleSong} />
      </div>
    </Layout>
  );
} 