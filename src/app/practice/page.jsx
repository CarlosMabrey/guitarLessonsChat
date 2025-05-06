'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/ui/Layout';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import VideoPlayer from '@/components/player/VideoPlayer';
import ChordDiagram from '@/components/diagrams/ChordDiagram';
import ChatButton from '@/components/ui/ChatButton';
import { FiPlay, FiPause, FiClock, FiSave, FiCheck, FiMusic } from 'react-icons/fi';
import Link from 'next/link';

// Import database functions
import { 
  getSongs, 
  getChords, 
  getPracticeSessions, 
  addPracticeSession 
} from '@/lib/db';

export default function PracticePage() {
  const [selectedSong, setSelectedSong] = useState(null);
  const [practiceTime, setPracticeTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [practiceSections, setPracticeSections] = useState([]);
  const [notes, setNotes] = useState('');
  const [songs, setSongs] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [songChords, setSongChords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load data
  useEffect(() => {
    const loadData = () => {
      const allSongs = getSongs();
      const sessions = getPracticeSessions();
      
      setSongs(allSongs);
      setRecentSessions(sessions);
      setIsLoading(false);
    };
    
    loadData();
  }, []);
  
  // Load chords when a song is selected
  useEffect(() => {
    if (selectedSong) {
      const chords = getChords(selectedSong.id);
      setSongChords(chords);
    } else {
      setSongChords([]);
    }
  }, [selectedSong]);
  
  // Mock tablature content for demonstration
  const tablatureContent = `
e|---0-----0-----0-----0-----0-----0-----0-----0------|
B|---1-----1-----1-----1-----1-----1-----1-----1------|
G|---2-----2-----2-----2-----2-----2-----2-----2------|
D|---2-----2-----2-----2-----2-----2-----2-----2------|
A|---0-----0-----0-----0-----0-----0-----0-----0------|
E|---------------------------------------------------|
  `;
  
  // Timer for practice session
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setPracticeTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Toggle timer
  const toggleTimer = () => {
    if (!selectedSong && !isTimerRunning) {
      return; // Don't start if no song is selected
    }
    setIsTimerRunning(!isTimerRunning);
  };
  
  // Handle song selection
  const handleSongSelect = (e) => {
    const songId = e.target.value;
    if (!songId) {
      setSelectedSong(null);
      return;
    }
    
    const song = songs.find(s => s.id === songId);
    setSelectedSong(song);
    
    // Reset timer and sections when changing songs
    if (isTimerRunning) {
      setIsTimerRunning(false);
    }
    setPracticeTime(0);
    setPracticeSections([]);
    setNotes('');
  };
  
  // Toggle section selection
  const handleSectionToggle = (section) => {
    setPracticeSections(prevSections => {
      if (prevSections.includes(section)) {
        return prevSections.filter(s => s !== section);
      } else {
        return [...prevSections, section];
      }
    });
  };
  
  // Save practice session
  const savePracticeSession = () => {
    if (!selectedSong || practiceTime === 0) return;
    
    // Create the session object
    const session = {
      songId: selectedSong.id,
      duration: Math.ceil(practiceTime / 60), // Convert seconds to minutes
      sections: practiceSections,
      notes: notes
    };
    
    // Add session to database
    const newSession = addPracticeSession(session);
    
    // Update the UI
    if (newSession) {
      setRecentSessions(prev => [newSession, ...prev]);
      
      // Reset the practice session
      setIsTimerRunning(false);
      setPracticeTime(0);
      setPracticeSections([]);
      setNotes('');
      
      // Show success message
      alert('Practice session saved successfully!');
    }
  };
  
  if (isLoading) {
    return (
      <Layout title="Practice Session" version={null}>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Practice Session" version={null}>
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="w-full md:w-1/2">
          <select 
            className="input w-full"
            value={selectedSong?.id || ''}
            onChange={handleSongSelect}
          >
            <option value="">Select a song to practice</option>
            {songs.map(song => (
              <option key={song.id} value={song.id}>
                {song.title} - {song.artist} ({song.difficulty})
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-mono font-bold">
            {formatTime(practiceTime)}
          </div>
          <button 
            onClick={toggleTimer} 
            className={`btn ${isTimerRunning ? 'btn-danger' : 'btn-primary'}`}
            disabled={!selectedSong}
          >
            {isTimerRunning ? <FiPause className="mr-2" /> : <FiPlay className="mr-2" />}
            {isTimerRunning ? 'Pause' : 'Start'}
          </button>
          <button 
            onClick={savePracticeSession} 
            className="btn btn-secondary"
            disabled={!selectedSong || practiceTime === 0}
          >
            <FiSave className="mr-2" />
            Save
          </button>
        </div>
      </div>
      
      {selectedSong ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{selectedSong.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer 
                  url={selectedSong.videoUrl} 
                  tablature={<pre className="font-mono text-xs whitespace-pre overflow-x-auto">{tablatureContent}</pre>}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Practice Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['Intro', 'Verse', 'Chorus', 'Bridge', 'Solo', 'Outro'].map(section => (
                  <div key={section} className="flex items-center">
                    <label className="flex items-center space-x-2 w-full cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={practiceSections.includes(section)}
                        onChange={() => handleSectionToggle(section)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <span>{section}</span>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your practice notes here..."
                  className="input w-full h-32 resize-none"
                />
              </CardContent>
            </Card>
            
            {selectedSong && songChords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Chords</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {songChords.slice(0, 4).map((chord, index) => (
                    <ChordDiagram 
                      key={`${chord.name}-${index}`} 
                      name={chord.name}
                      positions={chord.positions}
                      fingerings={chord.fingerings}
                      baseFret={chord.baseFret}
                      barres={chord.barres}
                    />
                  ))}
                </CardContent>
                <CardFooter>
                  <Link 
                    href={`/songs/${selectedSong.id}`} 
                    className="text-text-secondary text-sm hover:text-primary"
                  >
                    View all chords and details
                  </Link>
                </CardFooter>
              </Card>
            )}
            
            {selectedSong && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <FiMusic size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Need help with this song?</h3>
                      <p className="text-sm text-text-secondary mb-4">
                        Get personalized guidance on technique, chord transitions, or difficult sections.
                      </p>
                      <ChatButton 
                        songId={selectedSong.id} 
                        title={selectedSong.title}
                        className="text-sm py-1 px-3"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FiMusic className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
            <h3 className="text-xl font-medium mb-2">Start a Practice Session</h3>
            <p className="text-text-secondary mb-6">
              Select a song from your library to begin practicing
            </p>
            <Link href="/songs" className="btn btn-primary">
              Browse Songs
            </Link>
          </CardContent>
        </Card>
      )}
      
      {/* Recent practice sessions */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Practice Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="divide-y divide-border">
                {recentSessions.map(session => {
                  const sessionSong = songs.find(s => s.id === session.songId);
                  if (!sessionSong) return null;
                  
                  return (
                    <div key={session.id} className="py-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{sessionSong.title}</h4>
                        <div className="text-sm text-text-secondary">
                          {new Date(session.date).toLocaleDateString()} - {session.sections.join(', ')}
                        </div>
                        {session.notes && (
                          <p className="text-xs text-text-muted mt-1">{session.notes}</p>
                        )}
                      </div>
                      <div className="text-text-secondary flex items-center">
                        <FiClock className="mr-1" />
                        <span>{session.duration} min</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-text-secondary">
                No practice sessions recorded yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 