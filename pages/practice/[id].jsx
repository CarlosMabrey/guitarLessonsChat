import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import SongsterrTab from '../../components/SongsterrTab';
import { getSongById, updateSongProgress } from '../../utils/songService';

export default function PracticePage() {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState('');
  const [practiceFocus, setPracticeFocus] = useState('');
  const [showTabSection, setShowTabSection] = useState(false);
  
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      const songData = getSongById(id);
      setSong(songData);
      setSelectedProgress(songData?.progress || 'Not Started');
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

  const handleStartPractice = () => {
    setIsTimerRunning(true);
  };

  const handlePausePractice = () => {
    setIsTimerRunning(false);
  };

  const handleEndPractice = () => {
    setIsTimerRunning(false);
    
    // Here you would typically save the practice session data
    // For now, we'll just update the song progress
    if (selectedProgress !== song.progress) {
      updateSongProgress(id, selectedProgress);
    }
    
    router.push(`/songs/${id}`);
  };

  const toggleTabSection = () => {
    setShowTabSection(!showTabSection);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Sidebar />
        <div className="ml-64 p-8">
          <Header title="Loading Practice Session..." />
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Sidebar />
        <div className="ml-64 p-8">
          <Header title="Song Not Found" />
          <p>We couldn't find this song. It may have been deleted or you have the wrong link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="ml-64 p-8">
        <Header title={`Practice: ${song.title}`} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{song.title}</h2>
                  <p className="text-gray-400">{song.artist}</p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <div className="text-3xl font-mono">{formatTime(timer)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-400">Key</p>
                  <p className="text-xl">{song.key}</p>
                </div>
                <div>
                  <p className="text-gray-400">BPM</p>
                  <p className="text-xl">{song.bpm}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {!isTimerRunning ? (
                  <button 
                    onClick={handleStartPractice}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    Start Practice
                  </button>
                ) : (
                  <button 
                    onClick={handlePausePractice}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
                  >
                    Pause
                  </button>
                )}
                
                <button 
                  onClick={handleEndPractice}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  End Session
                </button>
                
                <button 
                  onClick={toggleTabSection}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  {showTabSection ? 'Hide Tab' : 'Show Tab'}
                </button>
              </div>
            </div>
            
            {/* Tab Section */}
            {showTabSection && song.songsterrId && (
              <SongsterrTab song={song} />
            )}
            
            {showTabSection && !song.songsterrId && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <p className="text-center text-gray-400">
                  No tab available for this song. 
                  <button 
                    onClick={() => router.push(`/songs/${id}`)}
                    className="ml-2 text-indigo-400 hover:text-indigo-300"
                  >
                    Edit song details
                  </button> 
                  to add a Songsterr ID.
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-fit">
            <h3 className="text-xl font-bold mb-4">Practice Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Progress Status</label>
                <select
                  value={selectedProgress}
                  onChange={(e) => setSelectedProgress(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="Learning">Learning</option>
                  <option value="Comfortable">Comfortable</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Practice Focus</label>
                <select
                  value={practiceFocus}
                  onChange={(e) => setPracticeFocus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a focus...</option>
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
                <label className="block text-gray-400 mb-2">Notes</label>
                <textarea
                  rows="4"
                  className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add your practice notes here..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 