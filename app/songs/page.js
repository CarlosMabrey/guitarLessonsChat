'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiPlus, FiMusic, FiFilter, FiPlay, FiPause, FiHeart, FiClock } from 'react-icons/fi';

// Mock data for songs
const mockSongs = [
  {
    id: 'song-1',
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    difficulty: 'Intermediate',
    genre: 'Rock',
    duration: '8:02',
    chords: ['Am', 'G', 'F', 'C'],
    favorite: true
  },
  {
    id: 'song-2',
    title: 'Wonderwall',
    artist: 'Oasis',
    difficulty: 'Beginner',
    genre: 'Pop Rock',
    duration: '4:18',
    chords: ['Em', 'G', 'D', 'A7sus4'],
    favorite: false
  },
  {
    id: 'song-3',
    title: 'Californication',
    artist: 'Red Hot Chili Peppers',
    difficulty: 'Intermediate',
    genre: 'Alternative Rock',
    duration: '5:21',
    chords: ['Am', 'F', 'C', 'G'],
    favorite: true
  },
  {
    id: 'song-4',
    title: 'Hotel California',
    artist: 'Eagles',
    difficulty: 'Advanced',
    genre: 'Rock',
    duration: '6:30',
    chords: ['Bm', 'F#', 'A', 'E'],
    favorite: false
  },
  {
    id: 'song-5',
    title: 'Sweet Home Alabama',
    artist: 'Lynyrd Skynyrd',
    difficulty: 'Intermediate',
    genre: 'Southern Rock',
    duration: '4:45',
    chords: ['D', 'C', 'G'],
    favorite: false
  },
  {
    id: 'song-6',
    title: 'Wish You Were Here',
    artist: 'Pink Floyd',
    difficulty: 'Intermediate',
    genre: 'Progressive Rock',
    duration: '5:35',
    chords: ['G', 'Em', 'A7', 'C', 'D'],
    favorite: true
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

function SongCard({ song, onTogglePlay, playingSongId }) {
  const isPlaying = playingSongId === song.id;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex">
        <div className="w-20 h-20 bg-gray-900 rounded-l flex items-center justify-center text-gray-400">
          <FiMusic size={24} />
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium text-lg">{song.title}</h3>
              <p className="text-gray-500">{song.artist}</p>
            </div>
            <div className="flex items-center">
              {song.favorite && (
                <div className="text-red-500 mr-2">
                  <FiHeart size={16} fill="currentColor" />
                </div>
              )}
              <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                song.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                song.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {song.difficulty}
              </div>
            </div>
          </div>
          
          <div className="flex items-center mt-2 text-sm">
            <div className="text-gray-500 mr-4">{song.genre}</div>
            <div className="flex items-center text-gray-400">
              <FiClock size={14} className="mr-1" />
              {song.duration}
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {song.chords.map((chord, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {chord}
                </span>
              ))}
            </div>
            
            <button
              onClick={() => onTogglePlay(song.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-full ${
                isPlaying ? 'bg-blue-100 text-blue-600' : 'bg-blue-600 text-white'
              }`}
            >
              {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} className="ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function Songs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [playingSongId, setPlayingSongId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const handleTogglePlay = (songId) => {
    setPlayingSongId(playingSongId === songId ? null : songId);
  };
  
  const filteredSongs = mockSongs.filter(song => {
    // Apply search filter
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         song.artist.toLowerCase().includes(searchTerm.toLowerCase());
                         
    // Apply category filter
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'favorites' && song.favorite) ||
                         (selectedFilter === 'beginner' && song.difficulty === 'Beginner') ||
                         (selectedFilter === 'intermediate' && song.difficulty === 'Intermediate') ||
                         (selectedFilter === 'advanced' && song.difficulty === 'Advanced');
                         
    return matchesSearch && matchesFilter;
  });
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Songs</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search songs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select
              className="appearance-none bg-white border rounded-md py-2 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">All Songs</option>
              <option value="favorites">Favorites</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
          </div>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <FiPlus className="mr-1" />
            Add Song
          </button>
        </div>
      </div>
      
      {filteredSongs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredSongs.map(song => (
            <SongCard 
              key={song.id} 
              song={song} 
              onTogglePlay={handleTogglePlay}
              playingSongId={playingSongId}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <FiMusic className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium mb-2">No songs found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Add Your First Song
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 