import { useState, useEffect } from 'react';
import { FiExternalLink, FiMusic, FiInfo, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { getAlternativeTabSources } from '@/lib/multiSongApi';

const SongsterrTab = ({ song }) => {
  const [tabUrl, setTabUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [tabSources, setTabSources] = useState([]);
  const [showAllSources, setShowAllSources] = useState(false);
  
  useEffect(() => {
    if (song?.songsterrId) {
      // Format the artist and title for URL
      const safeArtist = typeof song.artist === 'string' 
        ? song.artist.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        : (song.artist?.name || 'unknown').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      const safeTitle = song.title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      // Create the Songsterr URL - use direct tab link to avoid iframe issues
      const songsterrUrl = `https://www.songsterr.com/a/wsa/${safeArtist}-${safeTitle}-tab-s${song.songsterrId}`;
      setTabUrl(songsterrUrl);
      
      // Get alternative tab sources
      const loadTabSources = async () => {
        try {
          const sources = await getAlternativeTabSources(
            typeof song.artist === 'string' ? song.artist : song.artist?.name,
            song.title
          );
          
          // Update Songsterr URL in the sources
          const updatedSources = sources.map(source => 
            source.name === 'Songsterr' 
              ? { ...source, url: songsterrUrl } 
              : source
          );
          
          setTabSources(updatedSources);
        } catch (error) {
          console.error('Error loading tab sources:', error);
          // Default to just Songsterr
          setTabSources([{
            name: 'Songsterr',
            type: 'guitar-tab',
            url: songsterrUrl,
            preferred: true
          }]);
        }
      };
      
      loadTabSources();
      setIsLoading(false);
    }
  }, [song]);

  if (!song?.songsterrId) {
    return (
      <div className="w-full bg-card rounded-lg p-4 text-center my-4">
        <p className="text-text-secondary">No tab information available for this song.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full bg-card rounded-lg p-4 text-center my-4">
        <div className="animate-pulse flex justify-center">
          <div className="h-4 bg-card-hover rounded w-3/4"></div>
        </div>
      </div>
    );
  }
  
  // Render tab sources
  const renderTabSources = () => {
    if (!tabSources || tabSources.length === 0) {
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

  return (
    <div className="w-full my-4">
      <div className="bg-card rounded-lg p-5 border border-border">
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <FiMusic className="mr-2" /> Guitar Tab
          </h3>
          
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
          
          <div className="text-center text-sm text-text-secondary">
            <p>You can always return to this page after viewing the tab</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongsterrTab; 