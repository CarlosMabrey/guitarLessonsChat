import { useState, useEffect } from 'react';
import { FiExternalLink, FiMusic, FiInfo, FiChevronDown, FiChevronUp, FiAlertCircle } from 'react-icons/fi';
import { getAlternativeTabSources } from '@/lib/multiSongApi';
import { getBestSongsterrTabUrl } from '@/lib/services/songsterrApi';

const SongsterrTab = ({ song }) => {
  const [tabUrl, setTabUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [tabSources, setTabSources] = useState([]);
  const [showAllSources, setShowAllSources] = useState(false);
  const [error, setError] = useState(null);
  const [showEmbeddedTab, setShowEmbeddedTab] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchTabUrl = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!song) {
          throw new Error('No song data provided');
        }
        
        const artistName = typeof song.artist === 'string'
          ? song.artist
          : song.artist?.name || 'Unknown Artist';
        
        const bestUrl = await getBestSongsterrTabUrl(artistName, song.title, song.songsterrId);

        if (isMounted) {
          setTabUrl(bestUrl);

          // Get alternative tab sources
          const sources = await getAlternativeTabSources(artistName, song.title);
          const updatedSources = sources.map(source =>
            source.name === 'Songsterr'
              ? { ...source, url: bestUrl }
              : source
          );
          setTabSources(updatedSources);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[SongsterrTab] Error loading tab sources:', error);
        if (isMounted) {
          setError(error.message || 'Failed to load tab');
          
          // Still provide Songsterr as a fallback if we have a song title
          if (song?.title) {
            setTabSources([{
              name: 'Songsterr',
              type: 'guitar-tab',
              url: `https://www.songsterr.com/a/wa/search?pattern=${encodeURIComponent(song.title + ' ' + (song.artist || ''))}`,
              preferred: true
            }]);
          }
          
          setIsLoading(false);
        }
      }
    };

    if (song) {
      fetchTabUrl();
    } else {
      setError('No song data available');
      setIsLoading(false);
    }

    return () => { 
      isMounted = false; 
    };
  }, [song]);

  const openInBrowser = () => {
    if (tabUrl) {
      window.open(tabUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Check if the song has no songsterrId and no tab available
  if (!song) {
    return (
      <div className="w-full bg-card rounded-lg p-4 text-center my-4 border border-border">
        <FiAlertCircle className="mx-auto mb-2 text-2xl text-warning" />
        <p className="text-text-secondary">No song information available.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full bg-card rounded-lg p-4 text-center my-4 border border-border">
        <div className="animate-pulse flex justify-center">
          <div className="h-4 bg-card-hover rounded w-3/4"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full bg-card rounded-lg p-4 text-center my-4 border border-border">
        <FiAlertCircle className="mx-auto mb-2 text-2xl text-warning" />
        <p className="text-text-secondary mb-3">{error}</p>
        <a 
          href={`https://www.songsterr.com/a/wa/search?pattern=${encodeURIComponent(song.title)} ${encodeURIComponent(song.artist || '')}`}
          target="_blank"
          rel="noopener noreferrer" 
          className="btn btn-primary mt-2 inline-flex items-center"
        >
          <span>Search on Songsterr</span>
          <FiExternalLink className="ml-2" />
        </a>
      </div>
    );
  }
  
  // Render tab sources
  const renderTabSources = () => {
    if (!tabSources || tabSources.length === 0) {
      if (!tabUrl) {
        return (
          <div className="text-text-secondary">No tab sources available.</div>
        );
      }
      
      return (
        <a 
          href={tabUrl}
          target="_blank"
          rel="noopener noreferrer" 
          className="btn btn-primary flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <span>View Tab</span>
          <FiExternalLink className="ml-2" />
        </a>
      );
    }
    
    // Display preferred source or first source when not showing all
    if (!showAllSources) {
      const preferredSource = tabSources.find(s => s.preferred) || tabSources[0];
      
      return (
        <div className="space-y-3">
          <a 
            href={preferredSource.url}
            target="_blank"
            rel="noopener noreferrer" 
            className="btn btn-primary flex items-center justify-center w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <span>View {preferredSource.name} Tab</span>
            <FiExternalLink className="ml-2" />
          </a>
          
          {tabSources.length > 1 && (
            <button 
              onClick={() => setShowAllSources(true)}
              className="text-sm flex items-center justify-center w-full text-text-secondary hover:text-text-primary"
            >
              <span>Show {tabSources.length - 1} other tab sources</span>
              <FiChevronDown className="ml-1" />
            </button>
          )}
        </div>
      );
    }
    
    // Display all sources
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {tabSources.map((source, index) => (
            <a 
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer" 
              className={`flex items-center justify-between p-2 rounded hover:bg-card-hover border ${source.preferred ? 'border-primary/30 bg-primary/5' : 'border-border'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="font-medium">{source.name}</div>
                <div className="text-xs text-text-secondary">{source.type}</div>
              </div>
              <FiExternalLink className="text-text-secondary" />
            </a>
          ))}
        </div>
        
        <button 
          onClick={() => setShowAllSources(false)}
          className="text-sm flex items-center justify-center w-full text-text-secondary hover:text-text-primary"
        >
          <span>Show fewer sources</span>
          <FiChevronUp className="ml-1" />
        </button>
      </div>
    );
  };

  const toggleEmbeddedTab = () => {
    setShowEmbeddedTab(!showEmbeddedTab);
  };

  return (
    <div className="w-full my-4">
      <div className="bg-card rounded-lg border border-border">
        <div className="flex justify-between items-center p-3 border-b border-border">
          <h3 className="text-lg font-medium flex items-center">
            <FiMusic className="mr-2" /> Guitar Tab
          </h3>
          <button 
            onClick={openInBrowser}
            className="text-primary text-sm flex items-center hover:underline"
          >
            <span>Open in browser</span>
            <FiExternalLink className="ml-1" size={14} />
          </button>
        </div>
        
        {showEmbeddedTab ? (
          <div className="relative w-full h-0 pb-[75%]">
            <iframe 
              src={tabUrl}
              className="absolute top-0 left-0 w-full h-full"
              allowFullScreen
              frameBorder="0"
              title={`${song?.title || 'Song'} by ${song?.artist || 'Artist'} tab`}
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        ) : (
          <div className="p-5">
            <div className="bg-card-hover rounded-lg p-4">
              <div className="flex items-center text-sm text-text-secondary mb-2">
                <FiInfo className="mr-2" />
                <span>Tabs are provided by external services</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-3 sm:mb-0">
                  <h4 className="font-medium">{song.title}</h4>
                  <p className="text-sm text-text-secondary">
                    {typeof song.artist === 'string' ? song.artist : song.artist?.name || 'Unknown Artist'}
                  </p>
                </div>
                
                <div className="w-full sm:w-auto">
                  {renderTabSources()}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="border-t border-border p-2 flex justify-center">
          <button 
            onClick={toggleEmbeddedTab}
            className="text-sm text-text-secondary hover:text-text-primary flex items-center"
          >
            {showEmbeddedTab ? (
              <>
                <span>Hide embedded tab</span>
                <FiChevronUp className="ml-1" />
              </>
            ) : (
              <>
                <span>Show embedded tab</span>
                <FiChevronDown className="ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SongsterrTab;