'use client';

import { useState, useEffect } from 'react';
import { FiPlay, FiMusic } from 'react-icons/fi';
import { getSongVideoResources } from '@/lib/videoResourceCache';

// Video player component 
const VideoPlayer = ({ videoId, title }) => {
  if (!videoId) {
    return (
      <div className="aspect-video bg-card-hover rounded-lg flex flex-col items-center justify-center p-6 text-center">
        <FiMusic size={40} className="mb-3 text-text-secondary" />
        <p className="text-text-secondary mb-2">No video selected</p>
        <p className="text-sm text-text-secondary mb-4">Select a video from the list below to start learning</p>
      </div>
    );
  }
  
  return (
    <div className="aspect-video relative overflow-hidden rounded-lg bg-black">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title || "Video Tutorial"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        loading="lazy"
        allowFullScreen
      ></iframe>
    </div>
  );
};

const SongVideoResources = ({ songId, artist, title }) => {
  const [videoResources, setVideoResources] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoList, setShowVideoList] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);

  useEffect(() => {
    const loadVideos = async () => {
      if (!songId || !artist || !title) return;
      
      setVideoLoading(true);
      try {
        const videos = await getSongVideoResources(songId, artist, title);
        setVideoResources(videos);
        if (videos.length > 0) {
          setSelectedVideo(videos[0]);
        }
      } catch (error) {
        console.error('Error loading video resources:', error);
      } finally {
        setVideoLoading(false);
      }
    };
    
    loadVideos();
  }, [songId, artist, title]);

  // Helper to extract YouTube video ID from URL
  const getVideoIdFromUrl = (url) => {
    if (!url) return null;
    
    // Handle YouTube URLs
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    
    return match ? match[1] : null;
  };

  // Handle refreshing videos
  const handleRefreshVideos = async () => {
    if (!songId || !artist || !title) return;
    
    setVideoLoading(true);
    try {
      // Force refresh from API by passing true as last parameter
      const videos = await getSongVideoResources(
        songId, 
        artist, 
        title,
        true // force refresh
      );
      
      setVideoResources(videos);
      if (videos.length > 0) {
        setSelectedVideo(videos[0]);
      }
    } catch (error) {
      console.error('Error refreshing video resources:', error);
    } finally {
      setVideoLoading(false);
    }
  };

  const videoId = selectedVideo ? getVideoIdFromUrl(selectedVideo.url) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center text-base font-medium">
          <FiMusic className="mr-2 text-primary" /> Learning Resources
        </h3>
        
        <div className="flex items-center space-x-3">
          {!videoLoading && (
            <button 
              onClick={handleRefreshVideos}
              className="text-sm text-text-secondary hover:text-primary flex items-center"
              title="Refresh video resources"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1">
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
              <span>Refresh</span>
            </button>
          )}
          
          <button 
            onClick={() => setShowVideoList(!showVideoList)}
            className="text-sm text-primary flex items-center hover:underline"
          >
            {showVideoList ? 'Hide List' : 'Show List'}
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        {videoLoading ? (
          <div className="aspect-video bg-card-hover rounded-lg flex flex-col items-center justify-center p-6">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3"></div>
            <p className="text-text-secondary">Loading video resources...</p>
          </div>
        ) : (
          <VideoPlayer videoId={videoId} title={selectedVideo?.title} />
        )}
        
        <div className="mt-2 text-sm">
          <p className="font-medium">{selectedVideo?.title || 'No video selected'}</p>
          <p className="text-text-secondary">{selectedVideo?.source || ''}</p>
        </div>
      </div>
      
      {showVideoList && (
        <div className="space-y-2">
          {videoResources.length === 0 && !videoLoading ? (
            <div className="text-center py-4 text-text-secondary">
              No tutorial videos found
            </div>
          ) : (
            videoResources.map((video, index) => (
              <div
                key={index}
                className={`flex items-center p-2 rounded-md cursor-pointer ${selectedVideo?.id === video.id ? 'bg-card-hover' : 'hover:bg-card-hover'}`}
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative w-20 h-12 rounded overflow-hidden flex-shrink-0 mr-3">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                    <FiPlay className="text-white" size={16} />
                  </div>
                  
                  {video.level && (
                    <div className="absolute bottom-0 right-0 bg-black/70 text-xs px-1 py-0.5 text-white">
                      {video.level}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                  <p className="text-xs text-text-secondary">
                    {video.type === 'tutorial' ? 'Tutorial' : 'Tab Playthrough'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SongVideoResources; 