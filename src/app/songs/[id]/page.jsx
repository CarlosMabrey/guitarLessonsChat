'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SongsterrTab from '@/components/SongsterrTab';
import { getSongById } from '@/lib/db';
import { FiArrowLeft, FiPlay, FiMusic, FiStar } from 'react-icons/fi';
import Link from 'next/link';

export default function SongDetailPage({ params }) {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    if (id) {
      const songData = getSongById(id);
      setSong(songData);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-card-hover rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-card-hover rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-card-hover rounded w-1/2 mb-2"></div>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <FiMusic size={48} className="mx-auto text-text-secondary mb-4" />
          <h2 className="text-2xl font-bold mb-2">Song Not Found</h2>
          <p className="text-text-secondary mb-6">We couldn't find this song. It may have been deleted or you have the wrong link.</p>
          <Link href="/songs" className="btn btn-primary">
            Back to Songs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link 
          href="/songs" 
          className="flex items-center text-text-secondary hover:text-text-primary transition mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Songs
        </Link>
        
        <h1 className="main-heading">{song.title}</h1>
        <p className="text-text-secondary">{song.artist}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-text-secondary text-sm">Key</p>
                <p className="text-lg">{song.key || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">BPM</p>
                <p className="text-lg">{song.tempo || song.bpm || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Difficulty</p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar 
                      key={i}
                      className={`${i < (song.difficulty || 0) ? 'text-warning fill-warning' : 'text-text-muted'} w-4 h-4`} 
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Status</p>
                <p className={`text-lg ${
                  song.status === 'Comfortable' ? 'text-success' : 
                  song.status === 'Learning' ? 'text-info' : 'text-text-secondary'
                }`}>{song.status || 'Not Started'}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link 
                href={`/practice/${song.id}`}
                className="btn btn-primary"
              >
                <FiPlay size={16} className="mr-2" /> Start Practice
              </Link>
            </div>
          </div>
          
          {/* Songsterr Tab Section */}
          <SongsterrTab song={song} />
        </div>
        
        <div className="card h-fit">
          <h3 className="sub-heading mb-4">Practice History</h3>
          <div className="space-y-3">
            {/* Practice history would go here */}
            <p className="text-text-secondary">No practice sessions recorded yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 