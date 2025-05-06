'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiLoader, FiMusic, FiCheck, FiX, FiExternalLink } from 'react-icons/fi';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { addSong, saveSongAnalysis } from '@/lib/db';
import { analyzeSong } from '@/lib/ai/songAnalysisService';
import { getCompleteSongData, searchSongsterr } from '@/lib/songsterrApi';

export default function AddSongForm({ onSongAdded, onCancel }) {
  const [songInput, setSongInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle, searching, analyzing, success, error
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [songData, setSongData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Learning'); // Learning, Comfortable, Not Started
  
  // Form fields for manual editing if needed
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    keySignature: '',
    tempo: '',
    genre: '',
    difficulty: 3,
    songsterrId: ''
  });

  // Update form data when songData changes
  useEffect(() => {
    if (songData) {
      setFormData({
        title: songData.title || '',
        artist: songData.artist || '',
        album: songData.album || 'Unknown Album',
        keySignature: songData.keySignature || 'C',
        tempo: songData.tempo || 120,
        genre: songData.genre || 'Rock',
        difficulty: songData.difficulty || 3,
        songsterrId: songData.songsterrId || ''
      });
    }
  }, [songData]);

  // Handle input change for the search box
  const handleInputChange = (e) => {
    setSongInput(e.target.value);
    // Reset results when input changes
    if (searchResults.length > 0) {
      setSearchResults([]);
    }
  };
  
  // Handle search for songs on Songsterr
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!songInput.trim()) return;
    
    try {
      setStatus('searching');
      setError(null);
      
      // Search for songs on Songsterr
      const results = await searchSongsterr(songInput);
      
      if (!results || results.length === 0) {
        setError('No songs found. Try a different search term.');
        setStatus('error');
        return;
      }
      
      setSearchResults(results);
      setStatus('idle');
    } catch (err) {
      setError(err.message || 'An error occurred');
      setStatus('error');
    }
  };

  // Handle selecting a song from search results
  const handleSelectSong = async (selectedSong) => {
    try {
      setStatus('analyzing');
      
      // Get complete song data
      const data = await getCompleteSongData(selectedSong.id);
      
      if (!data) {
        throw new Error('Failed to get song details');
      }
      
      setSongData(data);
      
      // Get AI analysis of the song
      const result = await analyzeSong(`${data.artist} - ${data.title}`);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze song');
      }
      
      setAnalysis(result.data);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Failed to analyze song');
      setStatus('error');
    }
  };
  
  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add the song to the library
  const handleAddSong = () => {
    if (!songData && !formData.title) return;
    
    // Prepare the song object using form data
    const newSong = {
      id: `song-${Date.now()}`,
      title: formData.title,
      artist: formData.artist || 'Unknown Artist',
      album: formData.album || 'Unknown Album',
      coverUrl: 'https://placehold.co/400x400/333/white?text=Cover',
      dateAdded: new Date().toISOString(),
      status: selectedStatus,
      difficulty: Number(formData.difficulty) || 3,
      genre: formData.genre || 'Rock',
      keySignature: formData.keySignature || 'C',
      tempo: formData.tempo || 120,
      timeSignature: '4/4',
      videoUrl: analysis?.recommendedVideos?.tabPlayback || analysis?.recommendedVideos?.tutorial,
      duration: 180, // Default 3 minutes
      progress: 0,
      songsterrId: formData.songsterrId || songData?.songsterrId
    };
    
    // Save the song and analysis data to database
    if (analysis) {
      saveSongAnalysis(newSong, analysis);
    } else {
      addSong(newSong);
    }
    
    // Call the callback with the new song and analysis
    if (onSongAdded) {
      onSongAdded(newSong, analysis);
    }
  };

  // Quick add song with minimal input
  const handleQuickAdd = async () => {
    if (!songInput.trim()) return;
    
    try {
      setStatus('analyzing');
      setError(null);
      
      // Get song data from Songsterr
      const data = await getCompleteSongData(songInput);
      
      if (!data) {
        throw new Error('Song not found. Try a more specific search.');
      }
      
      setSongData(data);
      
      // Get AI analysis if available
      try {
        const result = await analyzeSong(`${data.artist} - ${data.title}`);
        if (result.success) {
          setAnalysis(result.data);
        }
      } catch (analyzeErr) {
        console.error('Analysis error:', analyzeErr);
        // Continue even if analysis fails
      }
      
      setStatus('success');
    } catch (err) {
      setError(err.message || 'An error occurred');
      setStatus('error');
    }
  };
  
  const handleReset = () => {
    setSongInput('');
    setStatus('idle');
    setError(null);
    setAnalysis(null);
    setSongData(null);
    setSearchResults([]);
    setFormData({
      title: '',
      artist: '',
      album: '',
      keySignature: '',
      tempo: '',
      genre: '',
      difficulty: 3,
      songsterrId: ''
    });
  };
  
  // Render search results
  const renderSearchResults = () => {
    if (searchResults.length === 0) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Search Results</h3>
        <div className="bg-card border border-border rounded-md divide-y divide-border">
          {searchResults.slice(0, 5).map(song => (
            <button
              key={song.id}
              onClick={() => handleSelectSong(song)}
              className="w-full text-left p-3 hover:bg-card-hover transition-colors"
            >
              <div className="font-medium">{song.title}</div>
              <div className="text-sm text-text-secondary">
                {typeof song.artist === 'string' ? song.artist : song.artist?.name || 'Unknown Artist'}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Render the form fields
  const renderFormFields = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleFormChange}
            className="input w-full"
          />
        </div>
        
        <div>
          <label htmlFor="artist" className="block text-sm font-medium mb-1">
            Artist
          </label>
          <input
            id="artist"
            name="artist"
            type="text"
            value={formData.artist}
            onChange={handleFormChange}
            className="input w-full"
          />
        </div>
        
        <div>
          <label htmlFor="album" className="block text-sm font-medium mb-1">
            Album
          </label>
          <input
            id="album"
            name="album"
            type="text"
            value={formData.album}
            onChange={handleFormChange}
            className="input w-full"
          />
        </div>
        
        <div>
          <label htmlFor="keySignature" className="block text-sm font-medium mb-1">
            Key
          </label>
          <input
            id="keySignature"
            name="keySignature"
            type="text"
            value={formData.keySignature}
            onChange={handleFormChange}
            className="input w-full"
            placeholder="e.g. Am"
          />
        </div>
        
        <div>
          <label htmlFor="tempo" className="block text-sm font-medium mb-1">
            BPM
          </label>
          <input
            id="tempo"
            name="tempo"
            type="number"
            value={formData.tempo}
            onChange={handleFormChange}
            className="input w-full"
          />
        </div>
        
        <div>
          <label htmlFor="genre" className="block text-sm font-medium mb-1">
            Genre
          </label>
          <input
            id="genre"
            name="genre"
            type="text"
            value={formData.genre}
            onChange={handleFormChange}
            className="input w-full"
            placeholder="e.g. Rock, Blues"
          />
        </div>
        
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
            Difficulty (1-5)
          </label>
          <input
            id="difficulty"
            name="difficulty"
            type="number"
            min="1"
            max="5"
            value={formData.difficulty}
            onChange={handleFormChange}
            className="input w-full"
          />
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input w-full"
          >
            <option value="Not Started">Not Started</option>
            <option value="Learning">Learning</option>
            <option value="Comfortable">Comfortable</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="songsterrId" className="block text-sm font-medium mb-1">
            Songsterr ID
          </label>
          <input
            id="songsterrId"
            name="songsterrId"
            type="text"
            value={formData.songsterrId}
            onChange={handleFormChange}
            className="input w-full"
            placeholder="For interactive tab"
          />
          <p className="text-xs text-text-secondary mt-1">
            The Songsterr ID is the number after "tab-s" in Songsterr URLs
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Add New Song</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'idle' || status === 'searching' || status === 'error' ? (
            <>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label htmlFor="songInput" className="block text-sm font-medium mb-1">
                    Song Title (or Artist - Song Title)
                  </label>
                  <div className="relative">
                    <input
                      id="songInput"
                      type="text"
                      value={songInput}
                      onChange={handleInputChange}
                      placeholder="e.g., Wonderwall or Oasis - Wonderwall"
                      className="input w-full pl-10"
                      disabled={status === 'searching' || status === 'analyzing'}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMusic className="text-text-secondary" />
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Just enter a song name and we'll find all the details for you
                  </p>
                </div>
                
                {error && (
                  <div className="p-3 rounded-md bg-danger/10 text-danger text-sm">
                    {error}
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="btn btn-primary flex items-center"
                    disabled={!songInput.trim() || status === 'searching'}
                  >
                    {status === 'searching' ? (
                      <>
                        <FiLoader className="animate-spin mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <FiSearch className="mr-2" />
                        Search Songs
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleQuickAdd}
                    className="btn btn-secondary flex items-center"
                    disabled={!songInput.trim() || status === 'searching'}
                  >
                    <FiCheck className="mr-2" />
                    Quick Add
                  </button>
                  
                  <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-outline"
                    disabled={status === 'searching'}
                  >
                    Cancel
                  </button>
                </div>
              </form>
              
              {renderSearchResults()}
            </>
          ) : status === 'analyzing' ? (
            <div className="text-center py-8">
              <FiLoader className="animate-spin mx-auto mb-4 text-2xl" />
              <p>Analyzing your song...</p>
              <p className="text-sm text-text-secondary mt-2">
                Finding chord progressions, difficulty level, and learning resources
              </p>
            </div>
          ) : status === 'success' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {formData.title} by {formData.artist}
                </h3>
                <button
                  onClick={handleReset}
                  className="text-text-secondary hover:text-text-primary"
                  title="Edit another song"
                >
                  <FiX />
                </button>
              </div>
              
              {renderFormFields()}
              
              {analysis && (
                <>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Key Chords</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {analysis.chords.slice(0, 4).map((chord, index) => (
                        <div key={index} className="p-2 border border-border rounded-md">
                          <div className="font-medium text-center mb-1">{chord.name}</div>
                          <div className="text-xs font-mono text-center">
                            {chord.positions.map(pos => pos[1]).join(' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Video Resources</h3>
                    {Object.entries(analysis.recommendedVideos).map(([type, url]) => (
                      <a
                        key={type}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center py-1 text-sm text-primary"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)} Video
                        <FiExternalLink className="ml-1" size={14} />
                      </a>
                    ))}
                  </div>
                </>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={handleAddSong}
                  className="btn btn-primary"
                >
                  Add Song
                </button>
                
                <button
                  onClick={handleReset}
                  className="btn btn-secondary"
                >
                  Start Over
                </button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
} 