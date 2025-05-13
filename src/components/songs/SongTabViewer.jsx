'use client';

import { useState, useEffect } from 'react';
import { FiMusic, FiExternalLink, FiLoader, FiAlertTriangle, FiRefreshCw, FiCode, FiLayers } from 'react-icons/fi';
import { getBestSongsterrTabUrl } from '@/lib/services/songsterrApi';
import { getTabForSong } from '@/lib/services/tabFetcherService';
import TabRenderer from '@/components/tabs/TabRenderer';

/**
 * SongTabViewer component that displays guitar tabs using VexFlow and provides Songsterr link
 * @param {string} songId - The Songsterr ID (not the internal app song ID)
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 */
const SongTabViewer = ({ songId, artist, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [browserUrl, setBrowserUrl] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [tabData, setTabData] = useState(null);
  const [activeTab, setActiveTab] = useState('internal'); // 'internal' or 'external'
  
  // Clean text for URL usage
  const cleanTextForUrl = (text) => {
    if (!text) return '';
    return text.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Fetch both internal tab data and Songsterr URL
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    console.log('[SongTabViewer] Props received:', { songId, artist, title });
    
    // Validate that songId isn't an internal app ID
    if (songId && String(songId).startsWith('song-')) {
      console.error('[SongTabViewer] ERROR: Received internal app ID instead of Songsterr ID:', songId);
      setError('Invalid Songsterr ID format');
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        const artistName = typeof artist === 'string' 
          ? artist 
          : artist?.name || 'Unknown Artist';
          
        // Parallel fetch both internal tabs and Songsterr URL
        const [tabDataResult, songsterrUrlResult] = await Promise.all([
          // 1. Fetch tab data for our internal renderer
          getTabForSong(artistName, title),
          
          // 2. Get Songsterr URL (for the external button)
          (async () => {
            if (songId && !isNaN(Number(songId))) {
              // If we have a Songsterr ID, generate URL directly
              return `https://www.songsterr.com/a/wsa/${cleanTextForUrl(artistName)}-${cleanTextForUrl(title)}-tab-s${songId}`;
            } else {
              // Otherwise search for the best match
              return await getBestSongsterrTabUrl(artistName, title);
            }
          })()
        ]);
        
        if (isMounted) {
          // Set both tab data and browser URL
          setTabData(tabDataResult);
          setBrowserUrl(songsterrUrlResult);
          setLoading(false);
        }
      } catch (error) {
        console.error('[SongTabViewer] Error loading tab data:', error);
        if (isMounted) {
          setError('Error finding tab: ' + (error.message || 'Unknown error'));
          setLoading(false);
        }
      }
    };
    
    if (artist && title) {
      fetchData();
    } else {
      console.warn('[SongTabViewer] Missing artist or title, cannot fetch tab');
      setError('Missing song information');
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [songId, artist, title, refreshKey]);
  
  // Force a refresh of the tab information
  const refreshTabData = () => {
    setRefreshKey(prev => prev + 1);
    setLoading(true);
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64 p-6">
          <FiLoader className="animate-spin text-primary mr-2" size={24} />
          <span className="text-text-secondary">Loading tab data...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
          <FiAlertTriangle className="text-warning mb-4" size={32} />
          <h3 className="text-lg font-medium mb-2">Unable to find tab</h3>
          <p className="text-text-secondary">
            {error || 'We encountered a problem finding the tab for this song.'}
          </p>
        </div>
      );
    }
    
    if (activeTab === 'internal' && tabData) {
      return (
        <div className="p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{tabData.title}</h3>
                <p className="text-sm text-text-secondary">
                  {tabData.artist} • Tuning: {tabData.tuning || 'Standard'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card-hover rounded-lg p-2">
            <TabRenderer notes={tabData.notes} options={{ height: 300 }} />
          </div>
          <div className="mt-4 text-center text-xs text-text-secondary">
            <p>This is a simplified preview. For more detailed tabs, use Songsterr.</p>
          </div>
        </div>
      );
    }
    
    if (activeTab === 'external' && browserUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-64 p-6">
          <div className="bg-card-hover w-full max-w-md p-6 rounded-lg text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <FiMusic size={28} />
            </div>
            <h3 className="text-xl font-medium mb-2">Full Tab on Songsterr</h3>
            <p className="text-text-secondary mb-6">
              View the complete tab with playback features on Songsterr.
            </p>
            <a 
              href={browserUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary px-6 py-3 rounded-md inline-flex items-center"
            >
              <span className="mr-2">Open in Songsterr</span>
              <FiExternalLink />
            </a>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex justify-center items-center h-64 p-6">
        <p className="text-text-secondary">No tab data available</p>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <div className="p-3 border-b border-border flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <FiMusic className="mr-2 text-primary" /> Guitar Tab
        </h3>
        <div className="flex items-center space-x-3">
          <button 
            onClick={refreshTabData}
            className="text-primary text-sm flex items-center hover:underline"
          >
            <FiRefreshCw className="mr-1" size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-border">
        <div className="flex">
          <button
            className={`py-2 px-4 text-sm font-medium flex items-center ${
              activeTab === 'internal' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('internal')}
          >
            <FiCode className="mr-2" size={14} />
            <span>Basic Tab</span>
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium flex items-center ${
              activeTab === 'external' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('external')}
          >
            <FiLayers className="mr-2" size={14} />
            <span>Full Songsterr Tab</span>
          </button>
        </div>
      </div>
      
      {/* Tab content area */}
      <div className="w-full">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SongTabViewer; 