'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiMusic, 
  FiLoader, 
  FiMic, 
  FiPlus, 
  FiCheck, 
  FiX, 
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink
} from 'react-icons/fi';
import { discoverSong, getSongLearningResources } from '@/lib/musicDiscoveryApi';
import { addSong } from '@/lib/db';

/**
 * One-click song discovery and addition component
 */
export default function QuickAddSong({ onSongAdded, onCancel }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle'); // idle, listening, searching, preview, success, error
  const [songData, setSongData] = useState(null);
  const [learningResources, setLearningResources] = useState(null);
  const [error, setError] = useState(null);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [suggestedSongs, setSuggestedSongs] = useState([
    "Wonderwall - Oasis",
    "Hotel California - Eagles",
    "Sweet Child O' Mine - Guns N' Roses",
    "Stairway to Heaven - Led Zeppelin",
    "Smoke on the Water - Deep Purple"
  ]);
  const [recognition, setRecognition] = useState(null);
  const inputRef = useRef(null);

  // Set up speech recognition on component mount
  useEffect(() => {
    // Check if the browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 1;
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setStatus('idle');
        
        // Auto-search after voice recognition
        handleDiscover(transcript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setStatus('error');
        setError('Voice recognition failed. Please try again or type your search.');
      };
      
      recognitionInstance.onend = () => {
        // Only reset to idle if we were listening
        if (status === 'listening') {
          setStatus('idle');
        }
      };
      
      setRecognition(recognitionInstance);
    }
    
    // Focus the input field on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    return () => {
      // Clean up speech recognition
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (status === 'error') {
      setStatus('idle');
      setError(null);
    }
  };

  // Handle voice search
  const handleVoiceSearch = () => {
    if (recognition) {
      setStatus('listening');
      recognition.start();
    } else {
      setError('Voice recognition is not supported in your browser.');
      setStatus('error');
    }
  };

  // Handle song discovery
  const handleDiscover = async (searchQuery = null) => {
    const searchTerm = searchQuery || query;
    
    if (!searchTerm.trim()) {
      setError('Please enter a song name');
      setStatus('error');
      return;
    }
    
    try {
      setStatus('searching');
      setError(null);
      
      // Discover song with all available intelligence
      const data = await discoverSong(searchTerm);
      
      if (!data) {
        throw new Error('No results found. Try a different search term.');
      }
      
      setSongData(data);
      
      // Get learning resources
      const resources = await getSongLearningResources(data.artist, data.title);
      setLearningResources(resources);
      
      setStatus('preview');
    } catch (err) {
      console.error('Discovery error:', err);
      setError(err.message || 'An error occurred during discovery');
      setStatus('error');
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleDiscover(suggestion);
  };

  // Handle immediate add
  const handleImmediateAdd = async () => {
    if (!songData) return;
    
    try {
      // Create song object
      const newSong = {
        id: `song-${Date.now()}`,
        title: songData.title,
        artist: songData.artist,
        album: songData.album || 'Unknown Album',
        coverUrl: 'https://placehold.co/400x400/333/white?text=Cover',
        dateAdded: new Date().toISOString(),
        status: 'Not Started',
        difficulty: songData.difficulty || 3,
        genre: songData.genre || 'Rock',
        keySignature: songData.keySignature || 'C',
        tempo: songData.tempo || 120,
        timeSignature: '4/4',
        duration: 180, // Default
        progress: 0,
        songsterrId: songData.songsterrId,
        chords: songData.chords || [],
        learningResources: learningResources,
        relatedLinks: songData.relatedLinks
      };
      
      // Add to database
      await addSong(newSong);
      
      // Success
      setStatus('success');
      
      // Call callback
      if (onSongAdded) {
        onSongAdded(newSong);
      }
      
      // Reset after a short delay
      setTimeout(() => {
        handleReset();
      }, 1500);
      
    } catch (err) {
      console.error('Add song error:', err);
      setError(err.message || 'Failed to add song');
      setStatus('error');
    }
  };

  // Handle reset
  const handleReset = () => {
    setQuery('');
    setStatus('idle');
    setError(null);
    setSongData(null);
    setLearningResources(null);
    setShowFullDetails(false);
    
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Render chord bubbles
  const renderChords = () => {
    if (!songData?.chords || songData.chords.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {songData.chords.slice(0, 5).map((chord, index) => (
          <div key={index} className="px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">
            {chord}
          </div>
        ))}
        {songData.chords.length > 5 && (
          <div className="px-3 py-1 bg-primary/5 rounded-full text-text-secondary text-sm">
            +{songData.chords.length - 5} more
          </div>
        )}
      </div>
    );
  };

  // Render confidence indicator
  const renderConfidenceIndicator = () => {
    if (!songData?.confidence) return null;
    
    let confidenceClass = 'bg-success';
    let confidenceText = 'High';
    
    if (songData.confidence < 70) {
      confidenceClass = 'bg-warning';
      confidenceText = 'Medium';
    }
    
    if (songData.confidence < 50) {
      confidenceClass = 'bg-danger';
      confidenceText = 'Low';
    }
    
    return (
      <div className="flex items-center mt-3 text-xs">
        <div className="text-text-secondary mr-2">Match confidence:</div>
        <div className={`w-14 h-1.5 rounded-full ${confidenceClass} mr-2`}></div>
        <div className="text-text-secondary">{confidenceText}</div>
      </div>
    );
  };

  // Render learning resources
  const renderLearningResources = () => {
    if (!learningResources) return null;
    
    // Flatten all resources into a single array
    const allResources = [
      ...(learningResources.tutorials || []),
      ...(learningResources.chordSheets || []),
      ...(learningResources.tabs || []),
      ...(learningResources.videoLessons || [])
    ];
    
    if (allResources.length === 0) return null;
    
    // Show only 3 resources initially
    const displayResources = showFullDetails 
      ? allResources 
      : allResources.slice(0, 3);
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Learning Resources</h4>
        <div className="space-y-2">
          {displayResources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded border border-border hover:bg-card-hover"
            >
              <div>
                <div className="text-sm font-medium">{resource.title}</div>
                <div className="text-xs text-text-secondary">{resource.source}</div>
              </div>
              <FiExternalLink className="text-text-secondary" />
            </a>
          ))}
        </div>
        
        {allResources.length > 3 && (
          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="text-sm flex items-center justify-center w-full mt-2 text-text-secondary hover:text-text-primary"
          >
            <span>
              {showFullDetails 
                ? 'Show fewer resources' 
                : `Show ${allResources.length - 3} more resources`}
            </span>
            {showFullDetails ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        {/* Title section */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">Find & Add Songs</h2>
          <p className="text-text-secondary">
            Just start typing or say a song name to instantly find it
          </p>
        </div>
        
        {/* Input Section - Always visible */}
        <div className={`relative ${status === 'preview' || status === 'success' ? 'opacity-50' : ''}`}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Enter song name or Artist - Song"
              className="input w-full pl-10 pr-10 h-12 text-base"
              disabled={status === 'listening' || status === 'searching' || status === 'preview' || status === 'success'}
              onKeyDown={(e) => e.key === 'Enter' && handleDiscover()}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMusic className="text-text-secondary" />
            </div>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-1 rounded-full ${status === 'listening' ? 'bg-primary text-white' : 'text-text-secondary hover:text-primary'}`}
                disabled={status === 'searching' || status === 'preview' || status === 'success'}
                title="Voice search"
              >
                <FiMic />
              </button>
            </div>
          </div>
          
          {/* Error message */}
          {error && status === 'error' && (
            <div className="mt-2 p-2 rounded-md bg-danger/10 text-danger text-sm flex items-center">
              <FiAlertCircle className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        {/* Status indicator */}
        <AnimatePresence>
          {status === 'listening' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-0 bg-card bg-opacity-90 flex flex-col items-center justify-center rounded-2xl"
            >
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <div className="absolute inset-0 flex items-center justify-center bg-primary rounded-full">
                  <FiMic className="text-white text-2xl" />
                </div>
              </div>
              <p className="text-lg font-medium">Listening...</p>
              <p className="text-text-secondary mt-2">Say the name of a song or artist</p>
              <button
                onClick={() => {
                  if (recognition) {
                    recognition.abort();
                  }
                  setStatus('idle');
                }}
                className="mt-4 btn btn-secondary"
              >
                Cancel
              </button>
            </motion.div>
          )}
          
          {status === 'searching' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 flex flex-col items-center"
            >
              <FiLoader className="animate-spin text-2xl text-primary mb-2" />
              <p className="text-text-secondary">Finding your song...</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Song Preview */}
        <AnimatePresence>
          {status === 'preview' && songData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 border border-border rounded-xl p-4 bg-card-hover"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{songData.title}</h3>
                  <p className="text-text-secondary">{songData.artist}</p>
                  
                  {renderChords()}
                  {renderConfidenceIndicator()}
                </div>
                <button
                  onClick={handleReset}
                  className="text-text-secondary hover:text-text-primary p-1"
                  title="Start over"
                >
                  <FiX />
                </button>
              </div>
              
              {showFullDetails && (
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {songData.keySignature && (
                    <div>
                      <span className="text-text-secondary">Key:</span>{' '}
                      <span className="font-medium">{songData.keySignature}</span>
                    </div>
                  )}
                  
                  {songData.tempo && (
                    <div>
                      <span className="text-text-secondary">BPM:</span>{' '}
                      <span className="font-medium">{songData.tempo}</span>
                    </div>
                  )}
                  
                  {songData.genre && (
                    <div>
                      <span className="text-text-secondary">Genre:</span>{' '}
                      <span className="font-medium">{songData.genre}</span>
                    </div>
                  )}
                  
                  {songData.difficulty && (
                    <div>
                      <span className="text-text-secondary">Difficulty:</span>{' '}
                      <span className="font-medium">{songData.difficulty}/5</span>
                    </div>
                  )}
                </div>
              )}
              
              {renderLearningResources()}
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleImmediateAdd}
                  className="btn btn-primary flex-1 flex items-center justify-center"
                >
                  <FiPlus className="mr-2" />
                  <span>Add to My Songs</span>
                </button>
                
                <button
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className="btn btn-secondary flex items-center justify-center"
                >
                  {showFullDetails ? (
                    <>
                      <FiChevronUp className="mr-2" />
                      <span>Less Details</span>
                    </>
                  ) : (
                    <>
                      <FiChevronDown className="mr-2" />
                      <span>More Details</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Success indicator */}
        <AnimatePresence>
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 bg-card bg-opacity-90 flex flex-col items-center justify-center rounded-2xl"
            >
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
                <FiCheck className="text-success text-2xl" />
              </div>
              <p className="text-lg font-medium">Song Added!</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Suggested songs section */}
        {status === 'idle' && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Suggested Songs</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedSongs.map((song, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(song)}
                  className="px-3 py-1.5 rounded-full border border-border text-sm hover:bg-card-hover transition-colors"
                >
                  {song}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Action buttons - visible in idle and error states */}
        {(status === 'idle' || status === 'error') && (
          <div className="mt-6 flex justify-between">
            <button
              onClick={onCancel}
              className="btn btn-outline"
            >
              Cancel
            </button>
            
            <button
              onClick={() => handleDiscover()}
              disabled={!query.trim()}
              className="btn btn-primary flex items-center"
            >
              <FiSearch className="mr-2" />
              Find Song
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 