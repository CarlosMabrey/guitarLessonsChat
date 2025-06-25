'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/ui/Layout';
import { FiCheck, FiPlay } from 'react-icons/fi';
import VoicingDisplay from '@/components/fretboard/VoicingDisplay';
import { chordVoicings, normalizeChordName } from '@/lib/musicTheory';
// Routine creation form for Practice Page
import RoutineForm from '@/components/practice/RoutineForm';
// Ear Training tool for Practice Page
import EarTrainingTool from '@/components/theory/EarTrainingTool';



export default function PracticePage() {
  const [currentChord, setCurrentChord] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [chords] = useState(['G', 'C', 'D', 'Em7']);
  const [voicings, setVoicings] = useState([]);
  const [currentVoicingIndex, setCurrentVoicingIndex] = useState(0);

  // --- Practice Routines Logic State ---
  const [selectedTab, setSelectedTab] = useState('My Routines');
  const [myRoutines, setMyRoutines] = useState([
    {
      id: 'routine-1',
      title: 'Daily Warmup',
      description: 'A quick warmup for fingers and mind.',
      steps: ['Finger Stretch', 'Open Chords', 'Strumming Pattern', 'Short Song'],
    },
    {
      id: 'routine-2',
      title: 'Barre Chord Bootcamp',
      description: 'Build barre chord strength and transitions.',
      steps: ['E-shape Barre', 'A-shape Barre', 'Chord Changes', 'Song Application'],
    },
  ]);
  const [recommendedRoutines] = useState([
    {
      id: 'routine-3',
      title: 'Beginner Ear Training',
      description: 'Start developing your musical ear.',
      steps: ['Interval Recognition', 'Chord Quality ID', 'Melodic Dictation'],
    },
  ]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [stepCompletion, setStepCompletion] = useState([]);

  // Filter routines based on selected tab
  const filteredRoutines =
    selectedTab === 'My Routines'
      ? myRoutines
      : selectedTab === 'Recommended'
      ? recommendedRoutines
      : [];

  // Add a dummy routine for the Routine Generator
  const handleRoutineGenerator = () => {
    const newRoutine = {
      id: `routine-${Date.now()}`,
      title: 'Generated Routine',
      description: 'This is a new routine generated as a demo.',
      steps: ['Warmup', 'Chord Drill', 'Ear Training', 'Song Practice'],
    };
    setMyRoutines((prev) => [...prev, newRoutine]);
    setSelectedTab('My Routines');
    setSelectedRoutine(newRoutine);
    setStepCompletion(newRoutine.steps.map(() => false));
  };
  
  // Load voicings when chord changes
  useEffect(() => {
    const chord = chords[currentChord];
    const normalized = normalizeChordName(chord);
    const chordVoicingsList = chordVoicings[normalized] || [];
    setVoicings(chordVoicingsList);
    setCurrentVoicingIndex(0);
  }, [currentChord, chords]);
  
  // Handle cycling through voicings
  const nextVoicing = () => {
    if (voicings.length <= 1) return;
    setCurrentVoicingIndex((prev) => (prev + 1) % voicings.length);
  };
  
  const prevVoicing = () => {
    if (voicings.length <= 1) return;
    setCurrentVoicingIndex((prev) => (prev - 1 + voicings.length) % voicings.length);
  };

  const handleNextChord = () => {
    setCurrentChord((prev) => (prev + 1) % 4);
  };

  const practiceSessions = [
    { id: 'session-1', title: 'G Major Chord Practice', description: 'Basic open G major chord with variations' },
    { id: 'session-2', title: 'C Major Chord Practice', description: 'Open C major chord with finger exercises' },
    { id: 'session-3', title: 'D Major Chord Practice', description: 'D major transitions and strumming patterns' },
    { id: 'song-1', title: 'Wonderwall - Oasis', description: 'Beginner friendly song with basic chords' }
  ];

  return (
    <Layout title="Practice">
      <div className="container py-6 max-w-6xl mx-auto">
        {/* Today's Plan Card */}
        <div className="p-6 bg-navy-900 rounded-xl mb-6 w-full shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-bold text-white">Today's Plan</h2>
            <div className="bg-green-500 rounded-full p-1">
              <FiCheck className="text-white" />
            </div>
          </div>
          <p className="text-gray-300">Welcome back! Ready for today's practice?</p>
        </div>
        
        {/* Chord Practice Card */}
        <div className="p-6 bg-navy-900 rounded-xl mb-6 w-full text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-blue-400">Chord Practice</h2>
          
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="text-6xl font-bold mb-4 text-blue-400">
              {chords[currentChord]}
            </div>
            <div className="chord-diagram-container relative w-full max-w-xs mx-auto">
              {voicings.length > 0 && (
                <>
                  {voicings.length > 1 && (
                    <>
                      <button 
                        onClick={prevVoicing}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white"
                        aria-label="Previous voicing"
                      >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button 
                        onClick={nextVoicing}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white"
                        aria-label="Next voicing"
                      >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  <VoicingDisplay
                    selectedVoicings={voicings}
                    currentVoicingIndex={currentVoicingIndex}
                    chordRoot={chords[currentChord].charAt(0)}
                    chordType={chords[currentChord].substring(1)}
                    chordName={chords[currentChord]}
                    size="lg"
                    isFullView={true}
                    showName={true}
                  />
                  
                  <button
                    className="mt-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    <FiPlay className="text-white" />
                    Play
                  </button>
                </>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleNextChord}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Next Chord
          </button>
        </div>
        
        {/* Progress Tracking & Analytics */}
        <div className="mt-8">
          <div className="bg-navy-900 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-white">Progress Tracking & Analytics</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center justify-between bg-navy-800 rounded-lg px-4 py-3">
                  <span className="text-blue-400 font-semibold">Practice Sessions</span>
                  <span className="text-white text-xl font-bold">12</span>
                </div>
                <div className="flex items-center justify-between bg-navy-800 rounded-lg px-4 py-3">
                  <span className="text-blue-400 font-semibold">Routines Completed</span>
                  <span className="text-white text-xl font-bold">5</span>
                </div>
                <div className="flex items-center justify-between bg-navy-800 rounded-lg px-4 py-3">
                  <span className="text-blue-400 font-semibold">Current Streak</span>
                  <span className="text-green-400 text-xl font-bold">7 days</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-3 justify-center items-center">
                {/* Placeholder for future charts and badges */}
                <div className="w-full h-32 flex items-center justify-center bg-navy-800 rounded-lg text-blue-300">
                  [Charts and badges coming soon]
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Routines Section */}
        <div className="mt-8 p-6 bg-navy-900 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">Practice Routines</h2>

          {/* Tabs for Routine Selector */}
          <div className="flex gap-2 mb-6">
            {['My Routines', 'Recommended', 'Create New'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-t-lg font-semibold transition-colors focus:outline-none ${selectedTab === tab ? 'bg-blue-800 text-blue-300' : 'bg-navy-800 text-gray-400 hover:text-blue-200'}`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Routine List */}
            <div className="flex-1 bg-navy-800 rounded-lg p-4 min-h-[220px]">
              {selectedTab === 'Create New' ? (
                <RoutineForm
                  onSubmit={({ title, description, steps }) => {
                    const newRoutine = {
                      id: `routine-${Date.now()}`,
                      title,
                      description,
                      steps,
                    };
                    setMyRoutines((prev) => [...prev, newRoutine]);
                    setSelectedTab('My Routines');
                    setSelectedRoutine(newRoutine);
                    setStepCompletion(newRoutine.steps.map(() => false));
                  }}
                  onCancel={() => setSelectedTab('My Routines')}
                />
              ) : (
                <>
                  {filteredRoutines.length === 0 ? (
                    <div className="text-gray-400">No routines found.</div>
                  ) : (
                    <ul>
                      {filteredRoutines.map((routine, idx) => (
                        <li key={routine.id}>
                          <button
                            className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-colors ${selectedRoutine && selectedRoutine.id === routine.id ? 'bg-blue-900 text-blue-200' : 'bg-navy-700 text-gray-200 hover:bg-blue-800 hover:text-blue-100'}`}
                            onClick={() => {
                              setSelectedRoutine(routine);
                              setStepCompletion(routine.steps.map(() => false));
                            }}
                          >
                            <div className="font-bold">{routine.title}</div>
                            <div className="text-xs text-gray-400">{routine.description}</div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>

            {/* Routine Details & Steps */}
            <div className="flex-1 bg-navy-800 rounded-lg p-4 min-h-[220px]">
              {selectedRoutine ? (
                <>
                  <div className="font-semibold text-blue-400 mb-1">{selectedRoutine.title}</div>
                  <div className="text-gray-400 mb-3">{selectedRoutine.description}</div>
                  <div className="mb-3">
                    {selectedRoutine.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <button
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${stepCompletion[idx] ? 'bg-green-500 border-green-500' : 'bg-navy-900 border-gray-500'}`}
                          onClick={() => {
                            const updated = [...stepCompletion];
                            updated[idx] = !updated[idx];
                            setStepCompletion(updated);
                          }}
                          aria-label={stepCompletion[idx] ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {stepCompletion[idx] && <FiCheck className="text-white text-xs" />}
                        </button>
                        <span className={stepCompletion[idx] ? 'line-through text-gray-500' : 'text-white'}>{step}</span>
                      </div>
                    ))}
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-4 bg-blue-900 rounded-full">
                    <div
                      className="h-4 bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.round((stepCompletion.filter(Boolean).length / stepCompletion.length) * 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="text-gray-400 flex items-center h-full">Select a routine to view details.</div>
              )}
            </div>
          </div>

          {/* Routine Generator Button */}
          <div className="mt-4 flex justify-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium"
              onClick={handleRoutineGenerator}
            >
              Routine Generator
            </button>
          </div>
        </div>

        {/* Ear Training Tool Section */}
        {/* Ear Training Tool Section */}
<div className="mt-8 p-6 bg-navy-900 rounded-xl shadow-lg">
  <h2 className="text-2xl font-bold mb-4 text-white">Ear Training Tool</h2>
  {/* Integrated Ear Training Tool component */}
  <EarTrainingTool />
</div>

        {/* Customization & AI Coach Section */}
        <div className="mt-8 p-6 bg-navy-900 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">Customization & AI Coach</h2>
          {/* TODO: Implement theme settings, accessibility, AI Coach chat */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-navy-800 rounded-lg p-4 text-gray-400">
              [Theme & Accessibility Options Placeholder]
            </div>
            <div className="flex-1 bg-navy-800 rounded-lg p-4 text-gray-400">
              [AI Coach Chat Placeholder]
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}