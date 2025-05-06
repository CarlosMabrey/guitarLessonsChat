'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllSongs, addSong } from '@/lib/db';
import { FiPlus, FiSearch, FiMusic, FiX } from 'react-icons/fi';
import Link from 'next/link';
import Layout from '@/components/ui/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import SongItem from '@/components/ui/SongItem';
import Modal from '@/components/ui/Modal';
import AddSongForm from '@/components/songs/AddSongForm';

export default function SongsPage() {
  const [songs, setSongs] = useState([]);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  
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
  
  const handleAddSongClick = () => {
    setShowAddModal(true);
  };
  
  const handleSongAdded = (newSong, analysis) => {
    setSongs(getAllSongs());
    setShowAddModal(false);
  };
  
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
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
          
          <button 
            onClick={handleAddSongClick}
            className="btn btn-primary flex items-center"
          >
            <FiPlus className="mr-2" />
            Add Song
          </button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Song Library ({filteredSongs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSongs.length > 0 ? (
            <div className="space-y-2">
              {filteredSongs.map((song) => (
                <SongItem 
                  key={song.id} 
                  song={song}
                  isPlaying={playingSongId === song.id}
                  onPlay={handlePlaySong}
                  onPause={handlePauseSong}
                  showArtist
                  showOptions
                />
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
                  <button 
                    onClick={handleAddSongClick}
                    className="btn btn-primary"
                  >
                    Add Your First Song
                  </button>
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
      
      <Modal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="lg"
      >
        <AddSongForm
          onSongAdded={handleSongAdded}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </Layout>
  );
} 