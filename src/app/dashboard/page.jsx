'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/ui/Layout';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import StatsCard from '@/components/charts/StatsCard';
import LineChart from '@/components/charts/LineChart';
import SongItem from '@/components/ui/SongItem';
import { FiInfo, FiPlus, FiArrowRight, FiClock } from 'react-icons/fi';
import Link from 'next/link';

// Import database functions instead of mock data directly
import { getSongs, getProgressStats, getPracticeSessions } from '@/lib/db';
import { practiceData } from '@/data/mockData'; // Still import this for chart data

export default function DashboardPage() {
  const [chartPeriod, setChartPeriod] = useState('week');
  const [playingSongId, setPlayingSongId] = useState(null);
  const [songs, setSongs] = useState([]);
  const [progressStats, setProgressStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Load data from the database
  useEffect(() => {
    const loadData = () => {
      const allSongs = getSongs();
      const stats = getProgressStats();
      
      setSongs(allSongs);
      setProgressStats(stats);
      setIsLoading(false);
    };
    
    loadData();
  }, []);
  
  // Get data for the selected period
  const chartData = practiceData[chartPeriod === 'day' ? 'daily' : chartPeriod === 'week' ? 'weekly' : 'monthly'];
  
  // Filter songs for recent activity
  const recentSongs = [...songs].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 5);
  
  const handlePlaySong = (songId) => {
    setPlayingSongId(songId);
  };
  
  const handlePauseSong = () => {
    setPlayingSongId(null);
  };
  
  if (isLoading) {
    return (
      <Layout title="Overview" version="0.2.0">
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Overview" version="0.2.0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard 
          title="Songs Added" 
          value={progressStats.songsAdded} 
          color="primary"
        />
        <StatsCard 
          title="In Progress" 
          value={progressStats.songsInProgress} 
          color="info"
        />
        <StatsCard 
          title="Mastered" 
          value={progressStats.songsMastered} 
          color="success"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <CardTitle>Practice Time</CardTitle>
                <div className="text-lg font-bold flex items-center">
                  <FiClock className="mr-2" />
                  {progressStats.totalHoursPracticed} hours total
                </div>
              </div>
            </CardHeader>
            
            <div className="flex space-x-4 px-5 mb-4">
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md ${chartPeriod === 'day' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                onClick={() => setChartPeriod('day')}
              >
                DAY
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md ${chartPeriod === 'week' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                onClick={() => setChartPeriod('week')}
              >
                WEEK
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md ${chartPeriod === 'month' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                onClick={() => setChartPeriod('month')}
              >
                MONTH
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md ${chartPeriod === 'year' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                onClick={() => setChartPeriod('year')}
              >
                YEAR
              </button>
            </div>
            
            <CardContent>
              <div className="relative">
                <LineChart data={chartData} height={250} />
                
                <div className="absolute bottom-5 right-5 px-4 py-2 rounded-full bg-card border border-border text-text-primary text-xs font-medium">
                  {progressStats.streakDays} DAY STREAK
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Songs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentSongs.length > 0 ? (
              recentSongs.map((song) => (
                <SongItem 
                  key={song.id} 
                  song={song}
                  isPlaying={playingSongId === song.id}
                  onPlay={handlePlaySong}
                  onPause={handlePauseSong}
                />
              ))
            ) : (
              <div className="text-center py-4 text-text-secondary">
                No songs added yet
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link 
              href="/songs" 
              className="text-text-secondary text-sm hover:text-primary flex items-center"
            >
              View all songs <FiArrowRight className="ml-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary mb-4">
              Your current streak is {progressStats.streakDays} days. Keep it up to reach your goal!
            </p>
            
            <Link href="/practice" className="btn btn-primary">
              START PRACTICING
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 