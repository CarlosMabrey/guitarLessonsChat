'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  FiPlay, 
  FiArrowLeft, 
  FiMusic, 
  FiInfo, 
  FiVolume2,
  FiHeart,
  FiBookmark,
  FiShare2,
  FiActivity
} from 'react-icons/fi';
import { getSongById } from '@/lib/db';
import Layout from '@/components/ui/Layout';
import SongTabViewer from '@/components/songs/SongTabViewer';
import SongVideoResources from '@/components/songs/SongVideoResources';
import ChordDiagram from '@/components/diagrams/ChordDiagram';

export default function SongDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const foundSong = getSongById(id);
    setSong(foundSong);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <Layout title="Song Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!song) {
    return (
      <Layout title="Song Not Found">
        <div className="flex flex-col items-center justify-center h-64">
          <FiInfo className="text-warning mb-4" size={32} />
          <h2 className="text-2xl font-bold mb-2">Song Not Found</h2>
          <p className="text-text-secondary mb-4">We couldn't find a song with this ID.</p>
          <Link href="/songs" className="btn btn-primary inline-flex items-center">
            <FiArrowLeft className="mr-2" /> Back to Songs
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={song.title}>
      <div className="container py-6">
        <Link href="/songs" className="inline-flex items-center text-text-secondary hover:text-text-primary mb-4">
          <FiArrowLeft className="mr-2" />
          Back to Songs
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Song Info */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2">{song.title}</h2>
              <p className="text-lg text-text-secondary mb-4">{typeof song.artist === 'string' ? song.artist : song.artist?.name || 'Unknown Artist'}</p>
              {song.album && <p className="mb-1"><span className="font-medium">Album:</span> {song.album}</p>}
              {song.genre && <p className="mb-1"><span className="font-medium">Genre:</span> {song.genre}</p>}
              {song.keySignature && <p className="mb-1"><span className="font-medium">Key:</span> {song.keySignature}</p>}
              {song.tempo && <p className="mb-1"><span className="font-medium">Tempo:</span> {song.tempo} BPM</p>}
              {song.difficulty && <p className="mb-1"><span className="font-medium">Difficulty:</span> {song.difficulty}/5</p>}
              <div className="mt-4">
                <span className="font-medium">Status:</span> {song.status || 'Not Started'}
              </div>
              <div className="mt-2">
                <span className="font-medium">Progress:</span>
                <div className="w-full h-2 bg-card-hover rounded-full mt-1">
                  <div className="h-2 bg-primary rounded-full" style={{ width: `${song.progress || 0}%` }}></div>
                </div>
              </div>
              {song.chords && song.chords.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Chords</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {song.chords.map((chord, idx) => (
                      <div key={idx} className="px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">{chord}</div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {song.chords.map((chord, idx) => (
                      <ChordDiagram key={chord + idx} chord={chord} size="sm" showName={false} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Tab and Video Resources */}
          <div className="md:col-span-2 flex flex-col gap-8">
            <div className="bg-card rounded-lg p-6">
              <SongTabViewer songId={song.songsterrId} artist={song.artist} title={song.title} />
            </div>
            <div className="bg-card rounded-lg p-6">
              <SongVideoResources songId={song.songsterrId} artist={song.artist} title={song.title} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 