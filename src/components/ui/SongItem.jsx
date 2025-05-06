'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiPlay, FiPause, FiMoreVertical, FiCheck, FiEdit, FiTrash2, FiClock, FiMusic, FiBook, FiAward } from 'react-icons/fi';
import { removeSong, updateSong } from '@/lib/db';

export default function SongItem({ 
  song, 
  isPlaying = false, 
  onPlay, 
  onPause, 
  showArtist = false,
  showOptions = false,
  className = '' 
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsConfirmingDelete(false);
  };
  
  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay(song.id);
  };
  
  const handlePause = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onPause();
  };
  
  const handleStatusChange = (status) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const updatedSong = { ...song, status };
    updateSong(updatedSong);
    
    // Force refresh - in a real app you would use context or state management
    window.location.reload();
    
    closeMenu();
  };
  
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isConfirmingDelete) {
      removeSong(song.id);
      
      // Force refresh - in a real app you would use context or state management
      window.location.reload();
    } else {
      setIsConfirmingDelete(true);
    }
  };
  
  const getStatusInfo = (status) => {
    switch (status) {
      case 'Comfortable':
        return {
          icon: <FiAward size={16} />,
          color: 'text-success',
          bgColor: 'bg-success/10'
        };
      case 'Learning':
        return {
          icon: <FiBook size={16} />,
          color: 'text-info',
          bgColor: 'bg-info/10'
        };
      default:
        return {
          icon: <FiClock size={16} />,
          color: 'text-text-secondary',
          bgColor: 'bg-card-hover'
        };
    }
  };
  
  const statusInfo = getStatusInfo(song.status);
  
  // Ensure we're handling potentially complex object properties
  const artistName = typeof song.artist === 'string' ? song.artist : 
                     (song.artist?.name || 'Unknown Artist');
  
  return (
    <Link href={`/songs/${song.id}`} className="block">
      <div className={`relative flex items-center p-3 rounded-lg hover:bg-card-hover ${className}`}>
        <div className="w-12 h-12 rounded overflow-hidden bg-background-light mr-3 flex-shrink-0">
          {song.coverUrl ? (
            <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-card-hover">
              <FiMusic size={20} />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            {/* Status icon */}
            <div className={`flex-shrink-0 mr-2 p-1.5 rounded-full ${statusInfo.bgColor}`}>
              <div className={statusInfo.color}>
                {statusInfo.icon}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium truncate flex items-center">
                {song.title}
              </h4>
              {showArtist && (
                <p className="text-sm text-text-secondary truncate">{artistName}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-auto">
              <div className="flex items-center text-xs text-text-secondary">
                <FiClock className="mr-1" size={12} />
                {song.tempo}
              </div>
              
              <div className="text-xs py-0.5 px-2 rounded-full bg-card-hover text-text-secondary">
                {song.difficulty}
              </div>
            </div>
          </div>
        </div>
        
        <div className="ml-3 flex-shrink-0 flex items-center space-x-2">
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="p-2 rounded-full bg-primary text-white"
          >
            {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
          </button>
          
          {showOptions && (
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-full hover:bg-card-hover text-text-secondary"
              >
                <FiMoreVertical size={16} />
              </button>
              
              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={closeMenu}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-card rounded-md shadow-lg z-20 overflow-hidden">
                    <div className="py-1">
                      <div className="px-3 py-2 text-xs text-text-secondary">Status</div>
                      <button
                        onClick={handleStatusChange('Not Started')}
                        className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-card-hover"
                      >
                        <span className="mr-2 w-4">{song.status === 'Not Started' && <FiCheck size={16} />}</span>
                        Not Started
                      </button>
                      <button
                        onClick={handleStatusChange('Learning')}
                        className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-card-hover"
                      >
                        <span className="mr-2 w-4">{song.status === 'Learning' && <FiCheck size={16} />}</span>
                        Learning
                      </button>
                      <button
                        onClick={handleStatusChange('Comfortable')}
                        className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-card-hover"
                      >
                        <span className="mr-2 w-4">{song.status === 'Comfortable' && <FiCheck size={16} />}</span>
                        Comfortable
                      </button>
                      
                      <div className="border-t border-border my-1"></div>
                      
                      <button
                        onClick={handleDeleteClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-left text-danger hover:bg-danger/10"
                      >
                        <FiTrash2 size={16} className="mr-2" />
                        {isConfirmingDelete ? 'Confirm Delete' : 'Delete Song'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 