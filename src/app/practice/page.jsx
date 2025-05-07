'use client';

import { useState } from 'react';
import ChordProgressionPlayer from '@/components/practice/ChordProgressionPlayer';
import Layout from '@/components/ui/Layout';

const COMMON_PROGRESSIONS = [
  {
    name: 'G-C-D (I-IV-V)',
    chords: ['G', 'C', 'D'],
    description: 'The most common progression in folk and pop music',
    difficulty: 'Beginner'
  },
  {
    name: 'E-A-B (I-IV-V)',
    chords: ['E', 'A', 'B'],
    description: 'Classic rock progression in E',
    difficulty: 'Beginner'
  },
  {
    name: 'Am-F-C-G (vi-IV-I-V)',
    chords: ['Am', 'F', 'C', 'G'],
    description: 'Used in hundreds of pop songs',
    difficulty: 'Beginner'
  },
  {
    name: 'C-G-Am-F (I-V-vi-IV)',
    chords: ['C', 'G', 'Am', 'F'],
    description: 'The "four-chord" pop progression',
    difficulty: 'Beginner'
  },
  {
    name: 'G-Em-C-D (I-vi-IV-V)',
    chords: ['G', 'Em', 'C', 'D'],
    description: 'Classic progression used in many ballads',
    difficulty: 'Intermediate'
  },
  {
    name: 'D-A-Bm-G (I-V-vi-IV)',
    chords: ['D', 'A', 'Bm', 'G'],
    description: 'Pop progression in D major',
    difficulty: 'Intermediate'
  },
  {
    name: 'E-B-C#m-A (I-V-vi-IV)',
    chords: ['E', 'B', 'C#m', 'A'],
    description: 'Rock progression in E',
    difficulty: 'Intermediate'
  },
  {
    name: 'Am-G-F-E (i-VII-VI-V)',
    chords: ['Am', 'G', 'F', 'E'],
    description: 'Minor descending progression',
    difficulty: 'Advanced'
  },
];

export default function PracticePage() {
  const [selectedProgression, setSelectedProgression] = useState(COMMON_PROGRESSIONS[0]);
  const [customProgression, setCustomProgression] = useState([]);
  const [customChord, setCustomChord] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  
  function handleProgressionComplete() {
    setCompletedCount(prev => prev + 1);
  }
  
  function addToCustomProgression() {
    if (customChord && !customProgression.includes(customChord)) {
      setCustomProgression([...customProgression, customChord]);
      setCustomChord('');
    }
  }
  
  function removeFromCustomProgression(index) {
    setCustomProgression(prev => prev.filter((_, i) => i !== index));
  }
  
  return (
    <Layout title="Practice Chord Progressions" version="0.2.0">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Practice Chord Progressions</h1>
          <p className="text-muted">
            Improve your chord transitions by practicing common progressions. Select a pre-made progression
            or create your own custom sequence.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="md:w-1/3">
            <div className="theme-card p-4 rounded-lg">
              <h2 className="text-lg font-medium mb-4">Choose a Progression</h2>
              
              <div className="flex items-center gap-4 mb-4">
                <button 
                  className={`px-3 py-1 rounded ${!isCustom ? 'bg-active text-white' : 'bg-accent'}`}
                  onClick={() => setIsCustom(false)}
                >
                  Common
                </button>
                <button 
                  className={`px-3 py-1 rounded ${isCustom ? 'bg-active text-white' : 'bg-accent'}`}
                  onClick={() => setIsCustom(true)}
                >
                  Custom
                </button>
              </div>
              
              {!isCustom ? (
                <div className="space-y-2">
                  {COMMON_PROGRESSIONS.map((prog, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded cursor-pointer ${selectedProgression.name === prog.name ? 'bg-active/10 border border-active' : 'bg-accent hover:bg-accent'}`}
                      onClick={() => setSelectedProgression(prog)}
                    >
                      <div className="font-medium">{prog.name}</div>
                      <div className="text-sm text-muted">{prog.description}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${prog.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' : prog.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {prog.difficulty}
                        </span>
                        <span className="text-xs text-muted ml-2">{prog.chords.join(' - ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      value={customChord}
                      onChange={(e) => setCustomChord(e.target.value)}
                      placeholder="Add chord (e.g., Am, G7)"
                      className="flex-1 px-3 py-2 rounded bg-accent"
                    />
                    <button
                      onClick={addToCustomProgression}
                      disabled={!customChord}
                      className="px-3 py-2 rounded bg-active text-white disabled:bg-active/50"
                    >
                      Add
                    </button>
                  </div>
                  
                  {customProgression.length > 0 ? (
                    <div className="space-y-2">
                      {customProgression.map((chord, index) => (
                        <div key={index} className="flex items-center justify-between bg-accent p-2 rounded">
                          <span>{chord}</span>
                          <button
                            onClick={() => removeFromCustomProgression(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted">
                      Add chords to create your custom progression
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-4 theme-card p-4 rounded-lg">
              <h3 className="font-medium mb-2">Your Stats</h3>
              <div className="flex items-center justify-between">
                <span>Progressions completed:</span>
                <span className="font-bold">{completedCount}</span>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <ChordProgressionPlayer 
              progression={isCustom ? customProgression : selectedProgression.chords}
              onComplete={handleProgressionComplete}
              className="h-full"
            />
          </div>
        </div>
        
        <div className="theme-card p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Practice Tips</h2>
          <ul className="list-disc list-inside space-y-2 text-muted">
            <li>Focus on clean transitions between chords</li>
            <li>Start slow and gradually increase the tempo</li>
            <li>Try to minimize finger movement between chord changes</li>
            <li>Look for common fingers that can stay in place between chords</li>
            <li>Practice the most difficult transitions in isolation</li>
            <li>Use the metronome to develop a consistent rhythm</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}