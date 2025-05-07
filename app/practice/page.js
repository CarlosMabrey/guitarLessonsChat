'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiClock, FiPlay, FiPause, FiSkipForward, FiChevronLeft, FiMusic } from 'react-icons/fi';

// Mock data for practice sessions
const mockSessions = [
  {
    id: 'session1',
    name: 'Warm-up Exercises',
    duration: 10, // minutes
    description: 'Basic finger exercises to warm up before practicing',
  },
  {
    id: 'session2',
    name: 'Chord Transitions',
    duration: 15,
    description: 'Practice transitioning between common chords smoothly',
  },
  {
    id: 'session3',
    name: 'Song Practice: Stairway to Heaven',
    duration: 20,
    description: 'Focus on the intro and verse sections',
  },
  {
    id: 'session4',
    name: 'Scale Practice',
    duration: 15,
    description: 'Major and minor pentatonic scales in various positions',
  }
];

// Simple card components
function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-lg shadow-sm border ${className}`}>{children}</div>;
}

function CardHeader({ children }) {
  return <div className="px-6 py-4 border-b">{children}</div>;
}

function CardTitle({ children }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

function CardContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

function SessionCard({ session, onStart }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-lg">{session.name}</h3>
          <p className="text-gray-500 text-sm mt-1">{session.description}</p>
          <div className="flex items-center mt-2 text-sm text-gray-400">
            <FiClock className="mr-1" />
            <span>{session.duration} minutes</span>
          </div>
        </div>
        <button 
          onClick={() => onStart(session)}
          className="ml-4 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <FiPlay size={18} className="ml-0.5" />
        </button>
      </CardContent>
    </Card>
  );
}

function PracticeTimer({ session, isRunning, onTogglePause, onEnd, elapsedTime, setElapsedTime }) {
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, setElapsedTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (elapsedTime / (session.duration * 60)) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Practice: {session.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="text-5xl font-bold mb-6">{formatTime(elapsedTime)}</div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
            <div 
              className="bg-blue-600 h-4 rounded-full" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={onTogglePause}
              className="px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              {isRunning ? (
                <>
                  <FiPause className="mr-2" /> Pause
                </>
              ) : (
                <>
                  <FiPlay className="mr-2" /> Resume
                </>
              )}
            </button>
            <button 
              onClick={onEnd}
              className="px-6 py-3 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors flex items-center"
            >
              <FiSkipForward className="mr-2" /> End Session
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PracticePage() {
  const [currentSession, setCurrentSession] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const handleStartSession = (session) => {
    setCurrentSession(session);
    setIsRunning(true);
    setElapsedTime(0);
  };
  
  const handleTogglePause = () => {
    setIsRunning(!isRunning);
  };
  
  const handleEndSession = () => {
    // Here you would typically save the practice session data
    setCurrentSession(null);
    setIsRunning(false);
    setElapsedTime(0);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link 
          href="/dashboard"
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiChevronLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold">Practice</h1>
      </div>
      
      {currentSession ? (
        <PracticeTimer 
          session={currentSession}
          isRunning={isRunning}
          onTogglePause={handleTogglePause}
          onEnd={handleEndSession}
          elapsedTime={elapsedTime}
          setElapsedTime={setElapsedTime}
        />
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Practice Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Select a practice session below to get started. Track your progress and build your skills!
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-blue-500">
                  <FiMusic className="mr-2" />
                  <span className="font-medium">Available Sessions</span>
                </div>
                <button className="px-4 py-2 rounded-md bg-blue-100 text-blue-600 text-sm font-medium hover:bg-blue-200 transition-colors">
                  Create Custom Session
                </button>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockSessions.map(session => (
              <SessionCard 
                key={session.id} 
                session={session} 
                onStart={handleStartSession} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 