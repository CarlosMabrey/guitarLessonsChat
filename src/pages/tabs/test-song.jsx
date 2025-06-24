'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TabFretboardVisualizer from '@/components/tabs/TabFretboardVisualizer';
import { FiArrowLeft } from 'react-icons/fi';
import Layout from '@/components/ui/Layout';
import Link from 'next/link';

// Test tab data for "Smoke on the Water" in MIDI-like format with absolute timing
const testTabData = {
  title: 'Smoke on the Water',
  artist: 'Deep Purple',
  tuning: 'Standard',
  capo: 0,
  tempo: 112, // BPM
  timeSignature: '4/4',
  // All notes with absolute timing in milliseconds
  // Each note has: time (ms from start), duration (ms), string, fret, and velocity
  notes: [
    // First note starts at 0ms (downbeat of measure 1)
    { time: 0, duration: 134, string: 5, fret: 0, velocity: 100 },
    { time: 134, duration: 134, string: 5, fret: 3, velocity: 100 },
    { time: 268, duration: 268, string: 5, fret: 5, velocity: 100 },
    { time: 536, duration: 134, string: 5, fret: 0, velocity: 100 },
    { time: 670, duration: 134, string: 5, fret: 3, velocity: 100 },
    { time: 804, duration: 134, string: 6, fret: 3, velocity: 100 },
    { time: 938, duration: 134, string: 5, fret: 5, velocity: 100 },
    
    // Measure 2
    { time: 1072, duration: 134, string: 5, fret: 0, velocity: 100 },
    { time: 1206, duration: 134, string: 5, fret: 3, velocity: 100 },
    { time: 1340, duration: 536, string: 5, fret: 5, velocity: 100 },
    
    // Measure 3 (same as measure 1)
    { time: 2144, duration: 134, string: 5, fret: 0, velocity: 100 },
    { time: 2278, duration: 134, string: 5, fret: 3, velocity: 100 },
    { time: 2412, duration: 268, string: 5, fret: 5, velocity: 100 },
    { time: 2680, duration: 134, string: 5, fret: 0, velocity: 100 },
    { time: 2814, duration: 134, string: 5, fret: 3, velocity: 100 },
    { time: 2948, duration: 134, string: 6, fret: 3, velocity: 100 },
    { time: 3082, duration: 134, string: 5, fret: 5, velocity: 100 },
    
    // Measure 4 (variation)
    { time: 3216, duration: 134, string: 5, fret: 0, velocity: 100 },
    { time: 3350, duration: 134, string: 5, fret: 3, velocity: 100 },
    { time: 3484, duration: 268, string: 5, fret: 5, velocity: 100 },
    { time: 3752, duration: 134, string: 5, fret: 3, velocity: 100 },
    { time: 3886, duration: 134, string: 5, fret: 0, velocity: 100 }
  ],
  
  // For visualization, we'll keep the measure structure
  measures: [
    // First measure (0-1072ms)
    [
      { time: 0, duration: 134, string: 5, fret: 0 },
      { time: 134, duration: 134, string: 5, fret: 3 },
      { time: 268, duration: 268, string: 5, fret: 5 },
      { time: 536, duration: 134, string: 5, fret: 0 },
      { time: 670, duration: 134, string: 5, fret: 3 },
      { time: 804, duration: 134, string: 6, fret: 3 },
      { time: 938, duration: 134, string: 5, fret: 5 }
    ],
    // Second measure (1072-2144ms)
    [
      { time: 1072, duration: 134, string: 5, fret: 0 },
      { time: 1206, duration: 134, string: 5, fret: 3 },
      { time: 1340, duration: 804, string: 5, fret: 5 } // Note held across measures
    ],
    // Third measure (2144-3216ms)
    [
      { time: 2144, duration: 134, string: 5, fret: 0 },
      { time: 2278, duration: 134, string: 5, fret: 3 },
      { time: 2412, duration: 268, string: 5, fret: 5 },
      { time: 2680, duration: 134, string: 5, fret: 0 },
      { time: 2814, duration: 134, string: 5, fret: 3 },
      { time: 2948, duration: 134, string: 6, fret: 3 },
      { time: 3082, duration: 134, string: 5, fret: 5 }
    ],
    // Fourth measure (3216-4290ms)
    [
      { time: 3216, duration: 134, string: 5, fret: 0 },
      { time: 3350, duration: 134, string: 5, fret: 3 },
      { time: 3484, duration: 268, string: 5, fret: 5 },
      { time: 3752, duration: 134, string: 5, fret: 3 },
      { time: 3886, duration: 134, string: 5, fret: 0 }
    ]
  ]
};

export default function TestSongPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabData, setTabData] = useState(null);
  const router = useRouter();

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setTabData(testTabData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout title={`${testTabData.title} by ${testTabData.artist} - Test Tab`}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/tabs" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Tab Library
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{testTabData.title}</h1>
          <h2 className="text-xl text-gray-600 mb-6">{testTabData.artist}</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Fretboard Visualization</h3>
              <p className="text-sm text-gray-600 mb-4">
                This is a test page for the fretboard visualizer. The tab plays automatically through each measure.
              </p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <TabFretboardVisualizer tabData={tabData} />
              </div>
            )}
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Tab Notation</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap">
{`e|-------------------|-------------------|-------------------|-------------------|
B|-------------------|-------------------|-------------------|-------------------|
G|-------------------|-------------------|-------------------|-------------------|
D|-------------------|-------------------|-------------------|-------------------|
A|-----3-5---3-6-5---|-----3-5---5-3-----|-----3-5---3-6-5---|-----3-5---3-0-----|
E|-3-6-------6-------|-3-6-------6-3-0---|-3-6-------6-------|-3-6-------6-0-----|`}
                </pre>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2">Test Controls</h4>
              <p className="text-sm text-blue-700 mb-3">
                This is a test page for the fretboard visualizer. Try these features:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>Play/Pause button to control the playback</li>
                <li>Previous/Next buttons to navigate between measures</li>
                <li>Playback speed control to adjust the tempo</li>
                <li>Note highlighting on the fretboard as it plays</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
