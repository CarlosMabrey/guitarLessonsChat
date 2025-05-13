'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppNav from '@/components/ui/AppNav';
import AppRouterIndicator from '@/components/ui/AppRouterIndicator';

export default function SongsPage() {
  const [songs, setSongs] = useState([]);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState('quick'); // 'quick' or 'advanced'
  const [selectedSong, setSelectedSong] = useState(null);
  
  const router = useRouter();

  useEffect(() => {
    const loadSongs = () => {
      const allSongs = getAllSongs();
      setSongs(allSongs);
      setIsLoading(false);
    };
    
    loadSongs();
  }, []);
  
  const filteredSongs = songs
    .filter(song => {
      // If no filter status is selected, show all songs
      if (filterStatus === 'all') return true;
      return song.status === filterStatus;
    })
    .filter(song => {
      const query = searchQuery.toLowerCase();
      return (
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.genre?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'artist':
          comparison = a.artist.localeCompare(b.artist);
          break;
        case 'difficulty':
          comparison = (a.difficulty || 0) - (b.difficulty || 0);
          break;
        case 'dateAdded':
        default:
          comparison = new Date(a.dateAdded) - new Date(b.dateAdded);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  
  const handlePlaySong = (songId) => {
    setPlayingSongId(songId);
  };
  
  const handlePauseSong = () => {
    setPlayingSongId(null);
  };
  
  const handleAddSongClick = (mode = 'quick') => {
    setAddMode(mode);
    setShowAddModal(true);
  };
  
  const handleSongAdded = (newSong, analysis) => {
    setSongs(getAllSongs());
    setShowAddModal(false);
  };
  
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  // New function to display chord information
  const renderChords = (song) => {
    if (!song || !song.chords || song.chords.length === 0) {
      return (
        <div className="text-text-secondary text-sm">No chord information available</div>
      );
    }
    
    return (
      <div className="mt-2">
        <div className="text-sm font-medium mb-2">Chords in this song:</div>
        <div className="flex flex-wrap gap-2">
          {song.chords.map((chord, index) => (
            <div key={index} className="flex flex-col items-center">
              <ChordDiagram 
                chord={chord} 
                size="sm" 
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <Layout title="My Songs" version={null}>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="My Songs" version={null}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-auto md:flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs..."
            className="input w-full pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-text-secondary" />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input h-10"
          >
            <option value="all">All Status</option>
            <option value="Not Started">Not Started</option>
            <option value="Learning">Learning</option>
            <option value="Comfortable">Comfortable</option>
          </select>
          
          <div className="flex items-center space-x-2 border border-border rounded-md p-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-transparent border-none focus:ring-0 h-6 pl-0"
            >
              <option value="dateAdded">Date Added</option>
              <option value="title">Title</option>
              <option value="artist">Artist</option>
              <option value="difficulty">Difficulty</option>
            </select>
            <button 
              onClick={toggleSortDirection}
              className="text-text-secondary hover:text-text-primary"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => handleAddSongClick('quick')}
              className="btn btn-primary flex items-center"
              title="Quick add with one click"
            >
              <FiZap className="mr-2" />
              Quick Add
            </button>
            
            <button
              onClick={() => handleAddSongClick('advanced')}
              className="btn btn-secondary flex items-center"
              title="Advanced song addition with manual control"
            >
              <FiPlus className="mr-2" />
              Advanced
            </button>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Song Library ({filteredSongs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSongs.length > 0 ? (
            <div className="space-y-4">
              {filteredSongs.map((song) => (
                <div key={song.id} className="border border-border rounded-lg p-3 hover:bg-card-hover">
                  <SongItem 
                    song={song}
                    isPlaying={playingSongId === song.id}
                    onPlay={handlePlaySong}
                    onPause={handlePauseSong}
                    onClick={() => setSelectedSong(selectedSong?.id === song.id ? null : song)}
                    showArtist
                    showOptions
                    className="mb-2"
                  />
                  
                  {selectedSong?.id === song.id && (
                    <div className="mt-3 pt-3 border-t border-border">
                      {renderChords(song)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiMusic className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
              {songs.length === 0 ? (
                <>
                  <h3 className="text-lg font-medium mb-2">No songs in your library</h3>
                  <p className="text-text-secondary mb-6">
                    Start adding songs to build your practice routine
                  </p>
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => handleAddSongClick('quick')}
                      className="btn btn-primary flex items-center"
                    >
                      <FiZap className="mr-2" />
                      Quick Add Song
                    </button>
                    <button 
                      onClick={() => handleAddSongClick('advanced')}
                      className="btn btn-secondary flex items-center"
                    >
                      <FiPlus className="mr-2" />
                      Advanced Add
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">No songs match your filters</h3>
                  <p className="text-text-secondary">
                    Try changing your search or filter settings
                  </p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Song Modal */}
      <Modal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="lg"
      >
        {addMode === 'quick' ? (
          <QuickAddSong 
            onSongAdded={handleSongAdded}
            onSwitchMode={() => setAddMode('advanced')}
          />
        ) : (
          <AddSongForm 
            onSongAdded={handleSongAdded} 
            onSwitchMode={() => setAddMode('quick')}
          />
        )}
      </Modal>
    </Layout>
  );
} 