'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiPlay, FiPause, FiStopCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import SongsterrTab from '@/components/SongsterrTab';
import { getSongById, addPracticeSession, updateSong } from '@/lib/db';

export default function PracticePage({ params }) {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [practiceFocus, setPracticeFocus] = useState('');
  const [notes, setNotes] = useState('');
  const [showTabSection, setShowTabSection] = useState(false);
  
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    if (id) {
      const songData = getSongById(id);
      if (songData) {
        setSong(songData);
        setSelectedStatus(songData.status || 'Not Started');
      }
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleEndSession = () => {
    setIsTimerRunning(false);
    
    // Save practice session
    const session = {
      songId: id,
      duration: timer,
      focus: practiceFocus || 'General Practice',
      notes: notes,
      date: new Date().toISOString()
    };
    
    addPracticeSession(session);
    
    // Update song status if changed
    if (selectedStatus !== song.status) {
      updateSong({
        ...song,
        status: selectedStatus,
        lastPracticed: new Date().toISOString()
      });
    }
    
    router.push(`/songs/${id}`);
  };

  const toggleTabSection = () => {
    setShowTabSection(!showTabSection);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-card-hover rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-card-hover rounded w-3/4 mb-2"></div>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Song Not Found</h2>
          <p className="text-text-secondary mb-6">We couldn't find this song. It may have been deleted or you have the wrong link.</p>
          <Link href="/songs" className="btn btn-primary">
            Back to Songs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link 
          href={`/songs/${id}`} 
          className="flex items-center text-text-secondary hover:text-text-primary transition mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Song
        </Link>
        
        <h1 className="main-heading">Practice: {song.title}</h1>
        <p className="text-text-secondary">{song.artist}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{song.title}</h2>
                <p className="text-text-secondary">{song.artist}</p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="text-3xl font-mono">{formatTime(timer)}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-text-secondary text-sm">Key</p>
                <p className="text-lg">{song.key || song.keySignature || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">BPM</p>
                <p className="text-lg">{song.tempo || song.bpm || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {!isTimerRunning ? (
                <button 
                  onClick={handleStartTimer}
                  className="btn btn-success"
                >
                  <FiPlay size={16} className="mr-2" /> Start Practice
                </button>
              ) : (
                <button 
                  onClick={handlePauseTimer}
                  className="btn btn-warning"
                >
                  <FiPause size={16} className="mr-2" /> Pause
                </button>
              )}
              
              <button 
                onClick={handleEndSession}
                className="btn btn-danger"
              >
                <FiStopCircle size={16} className="mr-2" /> End Session
              </button>
              
              <button 
                onClick={toggleTabSection}
                className={`btn ${showTabSection ? 'btn-secondary' : 'btn-primary'}`}
              >
                {showTabSection ? (
                  <>
                    <FiChevronUp size={16} className="mr-2" /> Hide Tab
                  </>
                ) : (
                  <>
                    <FiChevronDown size={16} className="mr-2" /> Show Tab
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Tab Section */}
          {showTabSection && (
            song.songsterrId ? (
              <SongsterrTab song={song} />
            ) : (
              <div className="card p-6 text-center">
                <p className="text-text-secondary">
                  No tab available for this song. 
                  <Link 
                    href={`/songs/${id}`}
                    className="ml-2 text-primary hover:text-primary/80"
                  >
                    Edit song details
                  </Link> 
                  to add a Songsterr ID.
                </p>
              </div>
            )
          )}
        </div>
        
        <div className="card h-fit">
          <h3 className="sub-heading mb-4">Practice Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Progress Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field"
              >
                <option value="Not Started">Not Started</option>
                <option value="Learning">Learning</option>
                <option value="Comfortable">Comfortable</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Practice Focus</label>
              <select
                value={practiceFocus}
                onChange={(e) => setPracticeFocus(e.target.value)}
                className="input-field"
              >
                <option value="">General Practice</option>
                <option value="Full Song">Full Song</option>
                <option value="Intro">Intro</option>
                <option value="Verse">Verse</option>
                <option value="Chorus">Chorus</option>
                <option value="Bridge">Bridge</option>
                <option value="Solo">Solo</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="4"
                className="input-field"
                placeholder="Add your practice notes here..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 