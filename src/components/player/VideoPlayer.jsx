import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX, FiRepeat } from 'react-icons/fi';
import { clsx } from 'clsx';

export default function VideoPlayer({ url, tablature, onProgress, className, ...props }) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loop, setLoop] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(1);
  const [showTablature, setShowTablature] = useState(true);
  
  const playerRef = useRef(null);
  const progressRef = useRef(null);

  const playbackRates = [0.25, 0.5, 0.75, 1];

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    
    return `${mm}:${ss}`;
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleRewind = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(Math.max(0, playerRef.current.getCurrentTime() - 5));
    }
  };

  const handleFastForward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(Math.min(duration, playerRef.current.getCurrentTime() + 5));
    }
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleToggleMute = () => {
    setMuted(!muted);
  };

  const handleProgress = (state) => {
    if (!progressRef.current) return;
    
    const { played } = state;
    setPlayed(played);
    
    if (onProgress) {
      onProgress(state);
    }
    
    // Handle looping
    if (loop && playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      if (currentTime >= loopEnd * duration) {
        playerRef.current.seekTo(loopStart);
      }
    }
  };

  const handleSeekMouseDown = () => {
    setPlaying(false);
  };

  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseUp = (e) => {
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat(e.target.value));
    }
    setPlaying(true);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handlePlaybackRateChange = () => {
    const currentIndex = playbackRates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % playbackRates.length;
    setPlaybackRate(playbackRates[nextIndex]);
  };

  const handleToggleLoop = () => {
    setLoop(!loop);
  };

  const handleToggleTablature = () => {
    setShowTablature(!showTablature);
  };

  return (
    <div className={clsx('rounded-lg overflow-hidden bg-card', className)} {...props}>
      <div className={clsx(
        'grid gap-4',
        showTablature && tablature ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
      )}>
        <div className="relative">
          <ReactPlayer
            ref={playerRef}
            url={url}
            playing={playing}
            volume={volume}
            muted={muted}
            playbackRate={playbackRate}
            onProgress={handleProgress}
            onDuration={handleDuration}
            width="100%"
            height="auto"
            style={{ aspectRatio: '16/9', backgroundColor: '#000' }}
            config={{
              youtube: {
                playerVars: { showinfo: 0, controls: 0, modestbranding: 1 }
              }
            }}
          />
          
          {/* Custom controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            {/* Progress bar */}
            <div className="relative w-full h-1 bg-border rounded-full mb-3">
              <input
                ref={progressRef}
                type="range"
                min={0}
                max={0.999999}
                step="any"
                value={played}
                onMouseDown={handleSeekMouseDown}
                onChange={handleSeekChange}
                onMouseUp={handleSeekMouseUp}
                className="absolute w-full h-1 opacity-0 z-10 cursor-pointer"
              />
              <div 
                className="absolute h-full bg-primary rounded-full" 
                style={{ width: `${played * 100}%` }}
              />
              
              {/* Loop markers */}
              {loop && (
                <>
                  <div 
                    className="absolute w-1 h-3 bg-success -top-1 -translate-x-1/2 rounded-full" 
                    style={{ left: `${loopStart * 100}%` }}
                  />
                  <div 
                    className="absolute w-1 h-3 bg-success -top-1 -translate-x-1/2 rounded-full" 
                    style={{ left: `${loopEnd * 100}%` }}
                  />
                </>
              )}
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handlePlayPause}
                  className="text-white hover:text-primary focus:outline-none"
                >
                  {playing ? <FiPause size={18} /> : <FiPlay size={18} />}
                </button>
                
                <button 
                  onClick={handleRewind}
                  className="text-white hover:text-primary focus:outline-none"
                >
                  <FiSkipBack size={18} />
                </button>
                
                <button 
                  onClick={handleFastForward}
                  className="text-white hover:text-primary focus:outline-none"
                >
                  <FiSkipForward size={18} />
                </button>
                
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={handleToggleMute}
                    className="text-white hover:text-primary focus:outline-none"
                  >
                    {muted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                  </button>
                  
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-border rounded-full accent-primary"
                  />
                </div>
                
                <button 
                  onClick={handleToggleLoop}
                  className={clsx(
                    "text-white focus:outline-none",
                    loop ? "text-success" : "hover:text-primary"
                  )}
                >
                  <FiRepeat size={18} />
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-white text-xs">
                  {formatTime(duration * played)} / {formatTime(duration)}
                </div>
                
                <button 
                  onClick={handlePlaybackRateChange}
                  className="px-2 py-1 bg-card-hover rounded text-xs text-white"
                >
                  {playbackRate}x
                </button>
                
                {tablature && (
                  <button 
                    onClick={handleToggleTablature}
                    className={clsx(
                      "px-2 py-1 rounded text-xs",
                      showTablature ? "bg-primary text-white" : "bg-card-hover text-white"
                    )}
                  >
                    Tab
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tablature panel */}
        {showTablature && tablature && (
          <div className="p-4 bg-card-hover rounded-lg overflow-auto h-[300px] md:h-auto">
            {tablature}
          </div>
        )}
      </div>
    </div>
  );
} 