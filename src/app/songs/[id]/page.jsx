'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSongById } from '@/lib/db';
import Layout from '@/components/ui/Layout';
import { motion } from 'framer-motion';
import ChordDiagram from '@/components/diagrams/ChordDiagram';
import { 
  FiPlay, 
  FiPause, 
  FiArrowLeft, 
  FiMusic, 
  FiInfo, 
  FiChevronRight, 
  FiChevronDown, 
  FiChevronUp,
  FiYoutube,
  FiExternalLink,
  FiLoader,
  FiMessageSquare,
  FiX,
  FiVolume2,
  FiHeart,
  FiBookmark,
  FiShare2,
  FiAlertCircle
} from 'react-icons/fi';
import { getSongLearningResources } from '@/lib/musicDiscoveryApi';

// New Spotify player component
const SpotifyPlayer = ({ artist, title, spotifyId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [artist, title]);

  if (loading) {
    return (
      <div className="bg-card rounded-lg p-4 flex items-center justify-center h-20">
        <FiLoader className="animate-spin text-primary" />
        <span className="ml-2 text-text-secondary">Loading music player...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg p-4 text-center">
        <div className="text-warning mb-2"><FiVolume2 size={24} /></div>
        <p className="text-text-secondary text-sm">{error}</p>
        <a 
          href={`https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-sm flex items-center justify-center mt-2 hover:underline"
        >
          <span>Search on Spotify</span>
          <FiExternalLink className="ml-1" size={14} />
        </a>
      </div>
    );
  }

  // Use the passed spotifyId or a default one if not available
  const embedId = spotifyId || '4cOdK2wGLETKBW3PvgPWqT';
  
  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <div className="p-3 border-b border-border flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <FiVolume2 className="mr-2 text-primary" /> Listen on Spotify
        </h3>
        <a 
          href={`https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-sm flex items-center hover:underline"
        >
          <span>Open in Spotify</span>
          <FiExternalLink className="ml-1" size={14} />
        </a>
      </div>
      <div className="w-full">
        <iframe
          src={`https://open.spotify.com/embed/track/${embedId}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
        ></iframe>
      </div>
    </div>
  );
};

// Video player component
const VideoPlayer = ({ videoId, title, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const handleError = () => {
    setError(true);
    if (onError) onError();
  };
  
  const handleLoad = () => {
    setLoading(false);
  };
  
  useEffect(() => {
    // Reset states when videoId changes
    setLoading(true);
    setError(false);
  }, [videoId]);
  
  if (!videoId) {
    return (
      <div className="aspect-video bg-card-hover rounded-lg flex flex-col items-center justify-center p-6 text-center">
        <FiYoutube size={40} className="mb-3 text-text-secondary" />
        <p className="text-text-secondary mb-2">No video selected</p>
        <p className="text-sm text-text-secondary mb-4">Select a video from the list below to start learning</p>
      </div>
    );
  }
  
  return (
    <div className="aspect-video relative overflow-hidden rounded-lg bg-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card-hover z-10">
          <FiLoader className="animate-spin text-primary" size={32} />
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card-hover">
          <FiYoutube size={40} className="mb-3 text-text-secondary" />
          <p className="text-text-secondary mb-2">Unable to load video</p>
          <a 
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm flex items-center mt-2"
          >
            <span>Watch on YouTube</span>
            <FiExternalLink className="ml-1" size={14} />
          </a>
        </div>
      ) : (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
          title={title || "Video Tutorial"}
          frameBorder="0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          loading="lazy"
          allowFullScreen
          onError={handleError}
          onLoad={handleLoad}
        ></iframe>
      )}
    </div>
  );
};

export default function SongPage() {
  const params = useParams();
  const router = useRouter();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('info'); // 'info', 'chords', 'ai'
  const [selectedChord, setSelectedChord] = useState(null);
  const [videoResources, setVideoResources] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoList, setShowVideoList] = useState(true);

  useEffect(() => {
    const loadSongData = async () => {
      if (params.id) {
        try {
          setLoading(true);
          const songData = getSongById(params.id);
          
          if (!songData) {
            router.push('/songs');
            return;
          }
          
          setSong(songData);
          
          // Simulate video resources
          const demoVideos = [
            {
              id: 'video1',
              title: 'Guns N\' Roses - Guitar Tab Playthrough',
              type: 'tab',
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
              source: 'YouTube'
            },
            {
              id: 'video2',
              title: 'Guns N\' Roses - Scrolling Tab Tutorial',
              type: 'tab',
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
              source: 'YouTube'
            },
            {
              id: 'video3',
              title: 'How to play Guns N\' Roses by Sweet Child O\' Mine - Beginner Tutorial',
              type: 'tutorial',
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
              source: 'YouTube',
              level: 'Beginner'
            },
            {
              id: 'video4',
              title: 'Guns N\' Roses by Sweet Child O\' Mine - Advanced Breakdown',
              type: 'tutorial',
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
              source: 'YouTube',
              level: 'Advanced'
            }
          ];
          
          setVideoResources(demoVideos);
          setSelectedVideo(demoVideos[0]);
          
        } catch (error) {
          console.error('Error loading song:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadSongData();
  }, [params.id, router]);
  
  // Helper to get text description of difficulty
  const getDifficultyText = (level) => {
    switch (level) {
      case 1: return 'very easy';
      case 2: return 'easy';
      case 3: return 'moderate';
      case 4: return 'challenging';
      case 5: return 'very difficult';
      default: return 'moderate';
    }
  };
  
  // Helper to extract YouTube video ID from URL
  const getVideoIdFromUrl = (url) => {
    if (!url) return null;
    
    // Handle YouTube URLs
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    
    return match ? match[1] : null;
  };
  
  // Render the song information tab
  const renderInfoTab = () => {
    if (!song) return null;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm text-text-secondary mb-1">Artist</h3>
            <p className="font-medium">{song.artist}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-text-secondary mb-1">Album</h3>
            <p className="font-medium">{song.album || 'Unknown Album'}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-text-secondary mb-1">Genre</h3>
            <p className="font-medium">{song.genre || 'Rock'}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-text-secondary mb-1">Key</h3>
            <p className="font-medium">{song.keySignature || 'C'}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-text-secondary mb-1">Tempo</h3>
            <p className="font-medium">{song.tempo || '120'} BPM</p>
          </div>
          
          <div>
            <h3 className="text-sm text-text-secondary mb-1">Difficulty</h3>
            <p className="font-medium">{song.difficulty || '3'}/5</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm text-text-secondary mb-1">Progress</h3>
          <div className="h-2 w-full bg-card-hover rounded-full">
            <div 
              className="h-2 bg-primary rounded-full" 
              style={{ width: `${song.progress || 0}%` }}
            ></div>
          </div>
          <div className="text-xs text-text-secondary mt-1">
            {song.progress || 0}% Complete
          </div>
        </div>
      </div>
    );
  };
  
  // Render the chords tab
  const renderChordsTab = () => {
    if (!song) return null;
    
    const hasChords = song.chords && song.chords.length > 0;
    
    return (
      <div>
        {hasChords ? (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Main Chords</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {song.chords.map((chord, index) => (
                  <div 
                    key={index}
                    onClick={() => setSelectedChord(chord)}
                    className={`bg-card border ${selectedChord === chord ? 'border-primary' : 'border-border'} rounded-md p-4 flex flex-col items-center justify-center cursor-pointer transition-colors`}
                  >
                    <ChordDiagram chord={chord} size="md" />
                  </div>
                ))}
              </div>
            </div>
            
            {selectedChord && (
              <div className="mt-8 p-6 bg-card border border-border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-medium">Chord: {selectedChord}</h3>
                  <button 
                    onClick={() => setSelectedChord(null)}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    ×
                  </button>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <ChordDiagram chord={selectedChord} size="lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">How to play:</h4>
                    <ul className="space-y-2 text-text-secondary">
                      <li className="flex items-start">
                        <span className="mr-2 text-primary">•</span>
                        <span>Place your fingers as shown in the diagram.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-primary">•</span>
                        <span>Strum all strings except those marked with an X.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-primary">•</span>
                        <span>Make sure each note rings clearly without buzzing.</span>
                      </li>
                    </ul>
                    
                    <div className="mt-4 p-3 bg-primary/10 rounded-md">
                      <p className="text-sm">
                        <strong>Tip:</strong> Practice transitioning between this chord and other chords in the song to build muscle memory.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <FiMusic className="w-10 h-10 mx-auto mb-3 text-text-secondary opacity-50" />
            <p className="text-text-secondary">No chord information available for this song.</p>
          </div>
        )}
      </div>
    );
  };
  
  // Render the AI analysis tab
  const renderAiTab = () => {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <FiMessageSquare className="w-10 h-10 mx-auto mb-3 text-text-secondary opacity-50" />
          <p className="text-text-secondary mb-3">AI analysis not available yet.</p>
          <button className="btn btn-primary">Generate Analysis</button>
        </div>
      </div>
    );
  };
  
  // Render the Spotify player
  const renderSpotifyPlayer = () => {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="flex items-center text-base font-medium">
            <FiVolume2 className="mr-2 text-primary" /> Listen on Spotify
          </h3>
          <a 
            href={`https://open.spotify.com/search/${encodeURIComponent(song?.title + ' ' + song?.artist)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm flex items-center hover:underline"
          >
            <span>Open in Spotify</span>
            <FiExternalLink className="ml-1" size={14} />
          </a>
        </div>
        <div className="rounded-lg overflow-hidden">
          <iframe
            src="https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT?utm_source=generator&theme=0"
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
          ></iframe>
        </div>
      </div>
    );
  };
  
  // Render video resources section
  const renderVideoResources = () => {
    const videoId = selectedVideo ? getVideoIdFromUrl(selectedVideo.url) : null;
    
    return (
      <div className="mt-6">
        <h3 className="flex items-center text-base font-medium mb-4">
          <FiMusic className="mr-2 text-primary" /> Learning Resources
          <span className="ml-auto text-sm text-primary cursor-pointer hover:underline" onClick={() => setShowVideoList(!showVideoList)}>
            {showVideoList ? 'Hide List' : 'Show List'}
          </span>
        </h3>
        
        <div className="mb-4">
          {videoId ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                title={selectedVideo.title}
                frameBorder="0"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                loading="lazy"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="aspect-video bg-card-hover rounded-lg flex flex-col items-center justify-center p-6 text-center">
              <FiAlertCircle size={40} className="mb-3 text-warning" />
              <p className="text-text-secondary mb-2">Video not available</p>
              <p className="text-sm text-text-secondary mb-4">Select a video from the list below to start learning</p>
            </div>
          )}
          
          <div className="mt-2 text-sm">
            <p className="font-medium">{selectedVideo?.title || 'No video selected'}</p>
            <p className="text-text-secondary">{selectedVideo?.source || ''}</p>
          </div>
        </div>
        
        {showVideoList && (
          <div className="space-y-2">
            {videoResources.map((video, index) => (
              <div
                key={index}
                className={`flex items-center p-2 rounded-md cursor-pointer ${selectedVideo?.id === video.id ? 'bg-card-hover' : 'hover:bg-card-hover'}`}
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative w-20 h-12 rounded overflow-hidden flex-shrink-0 mr-3">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                    <FiPlay className="text-white" size={16} />
                  </div>
                  
                  {video.level && (
                    <div className="absolute bottom-0 right-0 bg-black/70 text-xs px-1 py-0.5 text-white">
                      {video.level}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                  <p className="text-xs text-text-secondary">{video.source}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-center">
          <a 
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${song?.artist} ${song?.title} guitar tutorial`)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center"
          >
            Find more tutorials on YouTube
            <FiExternalLink className="ml-1" size={14} />
          </a>
        </div>
      </div>
    );
  };

  // Render the progress section
  const renderProgressSection = () => {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-medium">Learning Status</h2>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs uppercase text-text-secondary mb-1">Status</h3>
              <p className="font-medium">{song?.status || 'Not Started'}</p>
            </div>
            
            <div>
              <h3 className="text-xs uppercase text-text-secondary mb-1">Practice Time</h3>
              <p className="font-medium">{song?.practiceTime || '0'} minutes</p>
            </div>
            
            <div>
              <h3 className="text-xs uppercase text-text-secondary mb-1">Last Practiced</h3>
              <p className="font-medium">
                {song?.lastPracticed ? new Date(song.lastPracticed).toLocaleDateString() : 'Never'}
              </p>
            </div>
            
            {song?.dateAdded && (
              <div>
                <h3 className="text-xs uppercase text-text-secondary mb-1">Added On</h3>
                <p className="font-medium">
                  {new Date(song.dateAdded).toLocaleDateString()}
                </p>
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={() => router.push(`/practice/${song?.id}`)}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <FiPlay className="mr-2" /> Start Practice Session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render quick actions section
  const renderQuickActions = () => {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-medium">Quick Actions</h2>
        </div>
        
        <div className="p-4">
          <div className="space-y-2">
            <button className="w-full text-left p-2 rounded-md hover:bg-card-hover flex items-center">
              <FiHeart className="mr-3 text-text-secondary" /> Add to Favorites
            </button>
            <button className="w-full text-left p-2 rounded-md hover:bg-card-hover flex items-center">
              <FiBookmark className="mr-3 text-text-secondary" /> Save to Playlist
            </button>
            <button className="w-full text-left p-2 rounded-md hover:bg-card-hover flex items-center">
              <FiShare2 className="mr-3 text-text-secondary" /> Share Song
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout title="Loading Song..." showBackButton onBackClick={() => router.push('/songs')}>
        <div className="flex items-center justify-center h-64">
          <FiLoader className="animate-spin text-primary mr-2" />
          <span className="text-text-secondary">Loading song information...</span>
        </div>
      </Layout>
    );
  }
  
  if (!song) {
    return (
      <Layout title="Song Not Found" showBackButton onBackClick={() => router.push('/songs')}>
        <div className="flex flex-col items-center justify-center h-64">
          <FiMusic className="text-4xl text-text-secondary mb-4" />
          <div className="text-text-secondary">Song not found.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-text-secondary hover:text-text-primary mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to Songs
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{song.title}</h1>
            <div className="text-lg text-text-secondary">
              by <span className="font-medium">{song.artist}</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="btn btn-outline-primary">
              <FiBookmark className="mr-2" /> Save
            </button>
            <button className="btn btn-primary">
              <FiPlay className="mr-2" /> Practice Now
            </button>
          </div>
        </div>
      </div>
      
      {/* Spotify Player */}
      {renderSpotifyPlayer()}
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Main Content (2/3) */}
        <div className="md:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex border-b border-border">
              <button
                onClick={() => setSelectedTab('info')}
                className={`px-6 py-3 text-sm font-medium flex items-center ${selectedTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <FiInfo className="mr-2" />
                Information
              </button>
              <button
                onClick={() => setSelectedTab('chords')}
                className={`px-6 py-3 text-sm font-medium flex items-center ${selectedTab === 'chords' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <FiMusic className="mr-2" />
                Chords
              </button>
              <button
                onClick={() => setSelectedTab('ai')}
                className={`px-6 py-3 text-sm font-medium flex items-center ${selectedTab === 'ai' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <FiMessageSquare className="mr-2" />
                AI Analysis
              </button>
            </div>
            
            <div className="p-6">
              {selectedTab === 'info' && renderInfoTab()}
              {selectedTab === 'chords' && renderChordsTab()}
              {selectedTab === 'ai' && renderAiTab()}
            </div>
          </div>
          
          {/* Learning Resources Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            {renderVideoResources()}
          </div>
        </div>
        
        {/* Right Column - Sidebar (1/3) */}
        <div className="md:col-span-1 space-y-6">
          {renderProgressSection()}
          {renderQuickActions()}
        </div>
      </div>
    </Layout>
  );
} 