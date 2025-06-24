'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { FiMusic } from 'react-icons/fi';
import PageContainer from '@/components/layout/PageContainer';

// Dynamically import the MIDIViewer component with no SSR
const MIDIViewer = dynamic(
  () => import('@/components/tabs/MIDIViewer'),
  { ssr: false }
);

const MIDIViewerPage = () => {
  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <FiMusic className="w-8 h-8 mr-3 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">MIDI Viewer</h1>
        </div>
        <p className="text-gray-300 mb-8">
          Upload a MIDI file to visualize and play back the notes. The visualizer will show which notes
          are currently playing and their duration.
        </p>
        
        <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
          <MIDIViewer />
        </div>
        
        <div className="mt-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">How to use</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• Click the upload area to select a MIDI file (.mid or .midi)</li>
            <li>• Use the playback controls to play, pause, or stop the MIDI</li>
            <li>• Adjust the volume using the slider on the right</li>
            <li>• Click and drag the progress bar to seek through the MIDI file</li>
            <li>• Active notes will be highlighted in blue during playback</li>
          </ul>
          
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="font-medium text-blue-300 mb-2">Note about browser support:</h3>
            <p className="text-sm text-gray-300">
              For the best experience, please use a modern browser like Chrome, Firefox, or Edge.
              MIDI playback requires Web Audio API support.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default MIDIViewerPage;
