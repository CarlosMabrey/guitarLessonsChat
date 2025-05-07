'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSongById } from '@/lib/db';
import Layout from '@/components/ui/Layout';
import { 
  FiPlay, 
  FiArrowLeft, 
  FiMusic, 
  FiInfo, 
  FiVolume2,
  FiHeart,
  FiBookmark,
  FiShare2,
  FiActivity
} from 'react-icons/fi';
import SongTabViewer from '@/components/songs/SongTabViewer';
import SongVideoResources from '@/components/songs/SongVideoResources';

export default function SongPage() {
  const params = useParams();
  const router = useRouter();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('info');
  const [selectedChord, setSelectedChord] = useState(null);

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
  
  // Render song details card
  const renderSongDetailsCard = () => {
    if (!song) return null;
    
    return (
      <div className="bg-card rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border">
          <h3 className="text-lg font-medium flex items-center">
            <FiInfo className="mr-2 text-primary" /> Song Details
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h4 className="text-sm text-text-secondary">Artist</h4>
              <p className="font-medium">{song.artist}</p>
            </div>
            <div>
              <h4 className="text-sm text-text-secondary">Album</h4>
              <p className="font-medium">{song.album || 'Unknown'}</p>
            </div>
            <div>
              <h4 className="text-sm text-text-secondary">Genre</h4>
              <p className="font-medium">{song.genre || 'Rock'}</p>
            </div>
            <div>
              <h4 className="text-sm text-text-secondary">Year</h4>
              <p className="font-medium">{song.year || 'Unknown'}</p>
            </div>
            <div>
              <h4 className="text-sm text-text-secondary">Key</h4>
              <p className="font-medium">{song.keySignature || 'C'}</p>
            </div>
            <div>
              <h4 className="text-sm text-text-secondary">Difficulty</h4>
              <div className="flex items-center">
                <div className="flex space-x-0.5">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div 
                      key={level} 
                      className={`w-5 h-2 rounded-sm ${
                        level <= (song.difficulty || 3) 
                          ? 'bg-primary' 
                          : 'bg-card-hover'
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="text-text-secondary text-xs ml-2">
                  ({getDifficultyText(song.difficulty)})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render action buttons
  const renderActionButtons = () => {
    return (
      <div className="bg-card rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border">
          <h3 className="text-lg font-medium flex items-center">
            <FiActivity className="mr-2 text-primary" /> Actions
          </h3>
        </div>
        <div className="p-4 grid grid-cols-1 gap-3">
          <button 
            className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md transition-colors"
            onClick={() => router.push(`/practice/${song?.id}`)}
          >
            <FiPlay size={16} />
            <span>Start Practice</span>
          </button>
          <button 
            className="w-full flex items-center justify-center space-x-2 bg-card-hover hover:bg-card-hover/90 border border-border py-2 px-4 rounded-md transition-colors"
            onClick={() => console.log('Save to favorites')}
          >
            <FiBookmark size={16} />
            <span>Save to Favorites</span>
          </button>
          <button 
            className="w-full flex items-center justify-center space-x-2 bg-card-hover hover:bg-card-hover/90 border border-border py-2 px-4 rounded-md transition-colors"
            onClick={() => console.log('Share song')}
          >
            <FiShare2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
    );
  };
  
  // Render song information in the video player section
  const renderSongInfo = () => {
    return (
      <div className="mt-4 border-t border-border pt-4">
        <h4 className="font-medium mb-2">About this Song</h4>
        <p className="text-sm text-text-secondary mb-3">
          {song?.description || 
            "This song is a great practice piece for developing your guitar skills. Follow along with the tab and tutorial videos to master it."}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="bg-background px-2.5 py-1 rounded-md text-xs font-medium">Guitar Tutorial</span>
          <span className="bg-background px-2.5 py-1 rounded-md text-xs font-medium">Tab</span>
          <span className="bg-background px-2.5 py-1 rounded-md text-xs font-medium">Practice</span>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : !song ? (
          <div className="text-center">
            <p>Song not found</p>
            <button 
              onClick={() => router.push('/songs')}
              className="mt-4 bg-primary text-white px-4 py-2 rounded"
            >
              Back to Songs
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-3">
              <button
                onClick={() => router.push('/songs')}
                className="p-2 bg-card hover:bg-card-hover rounded-full"
              >
                <FiArrowLeft />
              </button>
              <h1 className="text-2xl font-bold">{song.title}</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                {/* Song information tab */}
                {renderInfoTab()}
              </div>
              <div className="md:w-1/2">
                {/* Video player section */}
                <SongVideoResources songId={song.id} artist={song.artist} title={song.title} />
              </div>
            </div>

            <div className="mt-8">
              {/* Tab viewer section */}
              <SongTabViewer songId={song?.songsterrId} artist={song?.artist} title={song?.title} />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div>
                {/* Progress section */}
                {renderProgressSection()}
              </div>
              <div>
                {/* Quick actions section */}
                {renderQuickActions()}
              </div>
            </div>

            <div className="mt-8">
              {/* Song details card */}
              {renderSongDetailsCard()}
            </div>

            <div className="mt-8">
              {/* Action buttons */}
              {renderActionButtons()}
            </div>

            <div className="mt-8">
              {/* Song information */}
              {renderSongInfo()}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}