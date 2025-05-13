'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiLoader, FiMusic, FiCheck, FiX, FiExternalLink, FiAlertCircle, FiYoutube } from 'react-icons/fi';
import { FaSpotify } from 'react-icons/fa';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { addSong, saveSongAnalysis } from '@/lib/db';
import { analyzeSong } from '@/lib/ai/songAnalysisService';
import { searchSongsterr } from '@/lib/songsterrApi';
import { getEnhancedSongData, getSongByArtistAndTitle } from '@/lib/multiSongApi';

export default function AddSongForm({ onSongAdded, onCancel }) {
  const [songInput, setSongInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle, searching, analyzing, success, error
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [songData, setSongData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Learning'); // Learning, Comfortable, Not Started
  const [dataConfidence, setDataConfidence] = useState(null);
  const [isSimpleMode, setIsSimpleMode] = useState(true); // New state for toggling between simple and advanced mode
  
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
      
      // Set confidence if available
      if (songData.confidence) {
        setDataConfidence(songData.confidence);
      }
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
      
      // Get enhanced song data using multiple APIs for accuracy
      const data = await getEnhancedSongData(selectedSong.id);
      
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
    
    console.log('[AddSongForm] Adding song with data:', { 
      formData,
      songData,
      songsterrId: formData.songsterrId || songData?.songsterrId
    });
    
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
      songsterrId: formData.songsterrId || songData?.songsterrId || '',
      spotifyId: songData?.spotifyId || null,
      youtubeVideos: songData?.youtubeVideos || [],
      chords: songData?.chords || analysis?.chords?.map(c => c.name) || []
    };
    
    console.log('[AddSongForm] Final song object with songsterrId:', newSong.songsterrId);
    
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
      
      // Get enhanced song data from multiple sources
      const data = await getEnhancedSongData(songInput);
      
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
  
  // New function for adding by artist and title directly
  const handleAddByArtistAndTitle = async (e) => {
    e.preventDefault();
    
    // Try to parse artist and title from input
    const parts = songInput.split('-').map(part => part.trim());
    let artist, title;
    
    if (parts.length >= 2) {
      // Input appears to be in "Artist - Title" format
      artist = parts[0];
      title = parts.slice(1).join('-'); // Join the rest in case title has hyphens
    } else {
      // Ask the user to enter in the correct format
      setError('Please enter the song in "Artist - Title" format for accurate results');
      return;
    }
    
    if (!artist || !title) {
      setError('Please enter both artist and title');
      return;
    }
    
    try {
      setStatus('analyzing');
      setError(null);
      
      // Use our direct method to get song by artist and title
      const data = await getSongByArtistAndTitle(artist, title);
      
      if (!data) {
        throw new Error('Could not find song information. Try again with a more specific title.');
      }
      
      setSongData(data);
      
      // Try to get AI analysis (optional)
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
      setError(err.message || 'Failed to find song information');
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
    setDataConfidence(null);
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
        <div className="space-y-2 max-h-60 overflow-y-auto p-1">
          {searchResults.map(song => (
            <div 
              key={song.id}
              className="bg-card-hover p-3 rounded-lg cursor-pointer hover:bg-primary/10 flex items-center justify-between"
              onClick={() => handleSelectSong(song)}
            >
              <div>
                <div className="font-medium">{song.title}</div>
                <div className="text-sm text-text-secondary">{song.artist?.name}</div>
              </div>
              <FiChevronRight className="text-text-secondary" />
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render confidence indicator
  const renderConfidenceIndicator = () => {
    if (dataConfidence === null) return null;
    
    let color = 'text-warning';
    let message = 'Low confidence';
    
    if (dataConfidence >= 80) {
      color = 'text-success';
      message = 'High confidence';
    } else if (dataConfidence >= 50) {
      color = 'text-primary';
      message = 'Medium confidence';
    }
    
    return (
      <div className="flex items-center mt-2">
        <div className={`${color} text-sm flex items-center`}>
          <FiAlertCircle className="mr-1" />
          <span>
            {message} ({dataConfidence}%) - 
            {dataConfidence < 50 && ' Please verify the information.'}
            {dataConfidence >= 50 && dataConfidence < 80 && ' Data looks good.'}
            {dataConfidence >= 80 && ' Excellent match!'}
          </span>
        </div>
      </div>
    );
  };
  
  // Render form fields for editing
  const renderFormFields = () => {
    return (
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              className="w-full bg-card-hover p-2 rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Artist</label>
            <input
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleFormChange}
              className="w-full bg-card-hover p-2 rounded-lg text-text-primary"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Album</label>
            <input
              type="text"
              name="album"
              value={formData.album}
              onChange={handleFormChange}
              className="w-full bg-card-hover p-2 rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Genre</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleFormChange}
              className="w-full bg-card-hover p-2 rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty (1-5)</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleFormChange}
              className="w-full bg-card-hover p-2 rounded-lg text-text-primary"
            >
              <option value="1">1 - Beginner</option>
              <option value="2">2 - Easy</option>
              <option value="3">3 - Intermediate</option>
              <option value="4">4 - Advanced</option>
              <option value="5">5 - Expert</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Key</label>
            <input
              type="text"
              name="keySignature"
              value={formData.keySignature}
              onChange={handleFormChange}
              className="w-full bg-card-hover p-2 rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tempo (BPM)</label>
            <input
              type="number"
              name="tempo"
              value={formData.tempo}
              onChange={handleFormChange}
              className="w-full bg-card-hover p-2 rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Songsterr ID</label>
            <input
              type="text"
              name="songsterrId"
              value={formData.songsterrId}
              onChange={handleFormChange}
              className="w-full bg-card-hover p-2 rounded-lg text-text-primary"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <div className="flex space-x-2">
            {['Not Started', 'Learning', 'Comfortable'].map(status => (
              <button
                key={status}
                type="button"
                className={`px-3 py-1 rounded-lg ${selectedStatus === status ? 'bg-primary text-white' : 'bg-card-hover text-text-secondary'}`}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render automatic resource detection section
  const renderResourceDetection = () => {
    if (!songData) return null;
    
    return (
      <div className="mt-4 space-y-4">
        <h3 className="text-lg font-medium">Automatically Detected Resources</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Songsterr Tab */}
          <div className={`p-3 rounded-lg border ${songData.songsterrId ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiMusic className={songData.songsterrId ? 'text-success' : 'text-warning'} size={18} />
                <span className="ml-2 font-medium">Songsterr Tab</span>
              </div>
              {songData.songsterrId ? (
                <span className="text-success text-sm">Found</span>
              ) : (
                <span className="text-warning text-sm">Not found</span>
              )}
            </div>
            {songData.songsterrId && (
              <div className="mt-2 text-sm text-text-secondary">
                ID: {songData.songsterrId}
              </div>
            )}
          </div>
          
          {/* Spotify Track */}
          <div className={`p-3 rounded-lg border ${songData.spotifyId ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaSpotify className={songData.spotifyId ? 'text-success' : 'text-warning'} size={18} />
                <span className="ml-2 font-medium">Spotify Track</span>
              </div>
              {songData.spotifyId ? (
                <span className="text-success text-sm">Found</span>
              ) : (
                <span className="text-warning text-sm">Not found</span>
              )}
            </div>
            {songData.spotifyId && (
              <div className="mt-2 text-sm text-text-secondary">
                ID: {songData.spotifyId}
              </div>
            )}
          </div>
        </div>
        
        {/* YouTube Videos */}
        <div className={`p-3 rounded-lg border ${songData.youtubeVideos?.length ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiYoutube className={songData.youtubeVideos?.length ? 'text-success' : 'text-warning'} size={18} />
              <span className="ml-2 font-medium">YouTube Videos</span>
            </div>
            {songData.youtubeVideos?.length ? (
              <span className="text-success text-sm">Found {songData.youtubeVideos.length} videos</span>
            ) : (
              <span className="text-warning text-sm">No videos found</span>
            )}
          </div>
          
          {songData.youtubeVideos?.length > 0 && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {songData.youtubeVideos.slice(0, 4).map((video, index) => (
                <div key={index} className="flex items-center text-sm">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    video.type === 'tutorial' ? 'bg-success' : 
                    video.type === 'cover' ? 'bg-primary' :
                    'bg-text-secondary'
                  }`}></span>
                  <span className="truncate">{video.title}</span>
                </div>
              ))}
              {songData.youtubeVideos.length > 4 && (
                <div className="text-sm text-text-secondary">
                  +{songData.youtubeVideos.length - 4} more videos
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render simple add mode
  const renderSimpleMode = () => {
    return (
      <div>
        <form onSubmit={handleAddByArtistAndTitle} className="relative">
          <input
            type="text"
            placeholder="Enter song in Artist - Title format (e.g. Led Zeppelin - Stairway to Heaven)"
            value={songInput}
            onChange={handleInputChange}
            className="w-full bg-card-hover p-3 pl-10 rounded-lg text-text-primary"
            disabled={status === 'analyzing'}
          />
          <FiMusic className="absolute left-3 top-3.5 text-text-secondary" />
          
          <div className="mt-3 flex space-x-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === 'analyzing' || !songInput.trim()}
            >
              {status === 'analyzing' ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Finding song...
                </>
              ) : (
                'Add Song'
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsSimpleMode(false)}
            >
              Advanced Options
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg text-warning flex items-start">
            <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Show the detected resources and form if we have song data */}
        {songData && (
          <>
            {renderConfidenceIndicator()}
            {renderResourceDetection()}
            {renderFormFields()}
            
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddSong}
              >
                Add to Library
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
              >
                Start Over
              </button>
              {onCancel && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };
  
  // Render advanced mode (the original implementation)
  const renderAdvancedMode = () => {
    return (
      <div>
        <div className="flex space-x-2 mb-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsSimpleMode(true)}
          >
            Simple Mode
          </button>
          <span className="text-text-secondary self-center text-sm">Switch to simple mode for quicker song addition</span>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search for a song by name or 'Artist - Song Title'"
            value={songInput}
            onChange={handleInputChange}
            className="w-full bg-card-hover p-3 pl-10 rounded-lg text-text-primary"
            disabled={status === 'analyzing'}
          />
          <FiSearch className="absolute left-3 top-3.5 text-text-secondary" />
          
          <div className="mt-3 flex space-x-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === 'analyzing' || !songInput.trim()}
            >
              {status === 'searching' ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleQuickAdd}
              disabled={status === 'analyzing' || !songInput.trim()}
            >
              {status === 'analyzing' ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                'Quick Add'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg text-warning flex items-start">
            <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {renderSearchResults()}
        
        {songData && (
          <>
            {renderConfidenceIndicator()}
            {renderResourceDetection()}
            {renderFormFields()}
            
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddSong}
              >
                Add to Library
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
              >
                Start Over
              </button>
              {onCancel && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add a Song to Your Library</CardTitle>
      </CardHeader>
      <CardContent>
        {isSimpleMode ? renderSimpleMode() : renderAdvancedMode()}
      </CardContent>
    </Card>
  );
} 