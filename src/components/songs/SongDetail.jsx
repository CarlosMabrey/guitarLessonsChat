'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMusic, FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';
import YouTubeTabPlayer from '@/components/player/YouTubeTabPlayer';

export default function SongDetail({ song, onClose }) {
  const [showResources, setShowResources] = useState(false);

  if (!song) return null;

  return (
    <div className="bg-background rounded-xl overflow-hidden shadow-lg border border-border">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{song.title}</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Song info */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Song Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-text-secondary">Artist:</span>{' '}
                  <span className="font-medium">{song.artist}</span>
                </div>
                {song.album && (
                  <div>
                    <span className="text-text-secondary">Album:</span>{' '}
                    <span className="font-medium">{song.album}</span>
                  </div>
                )}
                {song.genre && (
                  <div>
                    <span className="text-text-secondary">Genre:</span>{' '}
                    <span className="font-medium">{song.genre}</span>
                  </div>
                )}
                {song.keySignature && (
                  <div>
                    <span className="text-text-secondary">Key:</span>{' '}
                    <span className="font-medium">{song.keySignature}</span>
                  </div>
                )}
                {song.tempo && (
                  <div>
                    <span className="text-text-secondary">Tempo:</span>{' '}
                    <span className="font-medium">{song.tempo} BPM</span>
                  </div>
                )}
                {song.difficulty && (
                  <div>
                    <span className="text-text-secondary">Difficulty:</span>{' '}
                    <span className="font-medium">{song.difficulty}/5</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chords section */}
            {song.chords && song.chords.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Chords</h3>
                <div className="flex flex-wrap gap-2">
                  {song.chords.map((chord, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium"
                    >
                      {chord}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress section */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Learning Progress</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-text-secondary">Status:</span>{' '}
                  <span className="font-medium">{song.status || 'Not Started'}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Progress:</span>{' '}
                  <div className="w-full h-2 bg-card-hover rounded-full mt-1">
                    <div
                      className="h-2 bg-primary rounded-full"
                      style={{ width: `${song.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Tab and resources */}
          <div className="md:col-span-2">
            {/* YouTube Tab Player */}
            <YouTubeTabPlayer song={song} className="mb-6" />

            {/* Learning Resources */}
            {song.learningResources && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Learning Resources</h3>
                  <button
                    onClick={() => setShowResources(!showResources)}
                    className="text-text-secondary hover:text-text-primary flex items-center"
                  >
                    <span className="mr-1">{showResources ? 'Hide' : 'Show'}</span>
                    {showResources ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>

                {showResources && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    {Object.entries(song.learningResources).map(([type, resources]) => {
                      if (!resources || resources.length === 0) return null;
                      
                      return (
                        <div key={type} className="mb-4">
                          <h4 className="text-sm font-medium mb-2 capitalize">
                            {type.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <div className="space-y-2">
                            {resources.map((resource, index) => (
                              <a
                                key={index}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2 rounded border border-border hover:bg-card-hover"
                              >
                                <div>
                                  <div className="text-sm">{resource.title}</div>
                                  <div className="text-xs text-text-secondary">
                                    {resource.source}
                                  </div>
                                </div>
                                <FiExternalLink className="text-text-secondary" />
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 