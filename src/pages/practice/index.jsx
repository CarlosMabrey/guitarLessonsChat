'use client';

import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/ui/Layout';
import { FiMusic, FiCheck, FiList } from 'react-icons/fi';

export default function PracticePage() {
  const [chords, setChords] = useState(['G', 'C', 'D', 'Em']);
  const [currentChord, setCurrentChord] = useState(0);

  const handleNextChord = () => {
    setCurrentChord((prev) => (prev + 1) % chords.length);
  };

  const practiceSessions = [
    { id: 'session-1', title: 'G Major Chord Practice', description: 'Basic open G major chord with variations' },
    { id: 'session-2', title: 'C Major Chord Practice', description: 'Open C major chord with finger exercises' },
    { id: 'session-3', title: 'D Major Chord Practice', description: 'D major transitions and strumming patterns' },
    { id: 'song-1', title: 'Wonderwall - Oasis', description: 'Beginner friendly song with basic chords' },
    { id: 'song-2', title: 'Hey There Delilah - Plain White T\'s', description: 'Simple fingerpicking pattern' }
  ];

  return (
    <Layout title="Practice">
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Practice</h1>
        
        <div className="p-6 bg-success/10 text-success rounded-md mb-6 max-w-2xl w-full">
          <p className="font-bold">Practice Hub</p>
          <p>Start your guitar practice sessions here.</p>
        </div>
        
        <div className="p-6 bg-card-hover text-primary rounded-md mb-6 max-w-2xl w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Chord Practice</h2>
          <div className="text-6xl font-bold mb-6 p-8 bg-card rounded-lg shadow-card">
            {chords[currentChord]}
          </div>
          <button 
            onClick={handleNextChord}
            className="btn btn-primary px-6 py-3 rounded-lg"
          >
            Next Chord
          </button>
        </div>
        
        <div className="p-6 bg-card rounded-lg shadow-card max-w-2xl w-full mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiList className="mr-2" /> Practice Sessions
          </h2>
          <div className="space-y-3">
            {practiceSessions.map(session => (
              <Link 
                key={session.id} 
                href={`/practice/${session.id}`}
                className="block p-4 border border-border rounded-lg hover:border-primary hover:bg-card-hover transition-colors"
              >
                <h3 className="font-bold text-lg mb-1 text-primary">{session.title}</h3>
                <p className="text-secondary">{session.description}</p>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="p-6 bg-card-hover rounded-lg shadow-card max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-3 text-primary">Practice Tips</h2>
          <ul className="space-y-2 list-disc pl-5 text-secondary">
            <li>Focus on clean transitions between chords</li>
            <li>Start slow and gradually increase the tempo</li>
            <li>Try to minimize finger movement between chord changes</li>
            <li>Use a metronome to develop consistent rhythm</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
} 