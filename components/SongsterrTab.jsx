import { useState, useEffect } from 'react';
import { FiAlertCircle, FiExternalLink } from 'react-icons/fi';

const SongsterrTab = ({ song }) => {
  const [tabUrl, setTabUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    if (song?.artist && song?.title && song?.songsterrId) {
      try {
        const safeArtist = song.artist.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const safeTitle = song.title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setTabUrl(`https://www.songsterr.com/a/wsa/${safeArtist}-${safeTitle}-tab-s${song.songsterrId}t0`);
        setIsLoading(false);
      } catch (err) {
        console.error("Error generating Songsterr URL:", err);
        setError(true);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      setError(!song?.songsterrId);
    }
  }, [song]);

  const openInBrowser = () => {
    if (tabUrl) {
      window.open(tabUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (error || !song?.songsterrId) {
    return (
      <div className="w-full bg-card rounded-lg p-4 text-center my-4 border border-border">
        <FiAlertCircle className="mx-auto mb-2 text-2xl text-warning" />
        <p className="text-text-secondary mb-3">No tab information available for this song.</p>
        <a 
          href={`https://www.songsterr.com/a/wa/search?pattern=${encodeURIComponent(`${song?.artist || ''} ${song?.title || ''}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-primary hover:underline"
        >
          <span>Search on Songsterr</span>
          <FiExternalLink className="ml-1" size={14} />
        </a>
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

  return (
    <div className="w-full my-4">
      <div className="bg-card rounded-t-lg p-3 border-x border-t border-border flex justify-between items-center">
        <h3 className="text-lg font-medium">Guitar Tab</h3>
        <button 
          onClick={openInBrowser}
          className="text-primary text-sm flex items-center hover:underline"
        >
          <span>Open in browser</span>
          <FiExternalLink className="ml-1" size={14} />
        </button>
      </div>
      <div className="relative w-full h-0 pb-[75%] bg-card rounded-b-lg border-x border-b border-border">
        <iframe 
          src={tabUrl}
          className="absolute top-0 left-0 w-full h-full rounded-b-lg"
          allowFullScreen
          frameBorder="0"
          title={`${song?.title || 'Song'} by ${song?.artist || 'Artist'} tab`}
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
};

export default SongsterrTab; 