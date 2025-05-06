import { useState, useEffect } from 'react';

const SongsterrTab = ({ song }) => {
  const [tabUrl, setTabUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (song?.artist && song?.title && song?.songsterrId) {
      const safeArtist = song.artist.trim().toLowerCase().replace(/\s+/g, '-');
      const safeTitle = song.title.trim().toLowerCase().replace(/\s+/g, '-');
      setTabUrl(`https://www.songsterr.com/a/wsa/${safeArtist}-${safeTitle}-tab-s${song.songsterrId}t0`);
      setIsLoading(false);
    }
  }, [song]);

  if (!song?.songsterrId) {
    return (
      <div className="w-full bg-gray-800 rounded-lg p-4 text-center my-4">
        <p className="text-gray-300">No tab information available for this song.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full bg-gray-800 rounded-lg p-4 text-center my-4">
        <div className="animate-pulse flex justify-center">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full my-4">
      <div className="bg-gray-900 rounded-t-lg p-3 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white">Guitar Tab</h3>
      </div>
      <div className="relative w-full h-0 pb-[75%] bg-gray-900 rounded-b-lg">
        <iframe 
          src={tabUrl}
          className="absolute top-0 left-0 w-full h-full rounded-b-lg"
          allowFullScreen
          title={`${song.title} by ${song.artist} tab`}
        />
      </div>
    </div>
  );
};

export default SongsterrTab; 