import { useState, useEffect } from 'react';
import { FiExternalLink, FiMusic, FiInfo } from 'react-icons/fi';

const SongsterrTab = ({ song }) => {
  const [tabUrl, setTabUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (song?.songsterrId) {
      // Format the artist and title for URL
      const safeArtist = typeof song.artist === 'string' 
        ? song.artist.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        : (song.artist?.name || 'unknown').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      const safeTitle = song.title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      // Create the Songsterr URL - use direct tab link to avoid iframe issues
      setTabUrl(`https://www.songsterr.com/a/wsa/${safeArtist}-${safeTitle}-tab-s${song.songsterrId}`);
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
              <span>Due to website restrictions, tabs must be viewed on Songsterr's website</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-3 sm:mb-0">
                <h4 className="font-medium">{song.title}</h4>
                <p className="text-sm text-text-secondary">
                  {typeof song.artist === 'string' ? song.artist : song.artist?.name || 'Unknown Artist'}
                </p>
              </div>
              
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