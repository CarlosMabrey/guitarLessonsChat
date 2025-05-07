'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/ui/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import LineChart from '@/components/charts/LineChart';
import { FiCalendar, FiClock, FiAward, FiTrendingUp, FiMusic } from 'react-icons/fi';

// Import database functions and chart data
import { getSongs, getProgressStats } from '@/lib/db';
import { practiceData } from '@/data/mockData'; // Keep using mock chart data for now

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState('monthly');
  const [songs, setSongs] = useState([]);
  const [progressStats, setProgressStats] = useState({
    streakDays: 0,
    longestStreak: 0, 
    totalHoursPracticed: 0,
    averageSessionLength: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Load data
  useEffect(() => {
    const loadData = () => {
      try {
        const allSongs = getSongs();
        const stats = getProgressStats();
        
        setSongs(allSongs);
        setProgressStats(stats);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Get appropriate chart data based on selected time range
  const chartData = practiceData[timeRange === 'daily' ? 'daily' : timeRange === 'weekly' ? 'weekly' : 'monthly'];
  
  // Calculate song completion stats
  const totalSongs = songs.length;
  const completedSongs = songs.filter(song => song.status === 'Comfortable').length;
  const inProgressSongs = songs.filter(song => song.status === 'Learning').length;
  const notStartedSongs = songs.filter(song => song.status === 'Not Started').length;
  
  // Calculate completion percentage
  const completionPercentage = Math.round((completedSongs / totalSongs) * 100) || 0;
  
  if (isLoading) {
    return (
      <Layout title="Progress Tracking" version={null}>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Progress Tracking" version={null}>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Current Streak" 
          value={`${progressStats.streakDays} days`} 
          icon={<FiCalendar />} 
          description={`Longest: ${progressStats.longestStreak} days`}
        />
        <StatCard 
          title="Total Practice" 
          value={`${progressStats.totalHoursPracticed} hours`} 
          icon={<FiClock />} 
          description={`Avg. session: ${progressStats.averageSessionLength} min`}
        />
        <StatCard 
          title="Songs Mastered" 
          value={`${completedSongs}/${totalSongs}`} 
          icon={<FiAward />} 
          description={`${completionPercentage}% of library complete`}
        />
        <StatCard 
          title="Songs In Progress" 
          value={inProgressSongs} 
          icon={<FiMusic />} 
          description={`${notStartedSongs} songs not started`}
        />
      </div>
      
      {/* Practice time chart */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <CardTitle>Practice Time</CardTitle>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md ${timeRange === 'daily' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                onClick={() => setTimeRange('daily')}
              >
                DAILY
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md ${timeRange === 'weekly' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                onClick={() => setTimeRange('weekly')}
              >
                WEEKLY
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md ${timeRange === 'monthly' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                onClick={() => setTimeRange('monthly')}
              >
                MONTHLY
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <LineChart data={chartData} height={300} />
          </div>
        </CardContent>
      </Card>
      
      {/* Songs progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Song Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-text-secondary">Overall Progress</span>
                  <span className="text-sm font-medium text-text-secondary">{completionPercentage}%</span>
                </div>
                <div className="h-2 bg-border rounded-full">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              
              {songs.length > 0 ? (
                <div className="space-y-4">
                  {songs.map(song => {
                    // Calculate song completion percentage
                    const songProgress = song.progress || 0;
                    const songPercentage = Math.round((songProgress / song.duration) * 100);
                    
                    return (
                      <div key={song.id}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium truncate max-w-[70%]">{song.title}</span>
                          <span className="text-sm font-medium text-text-secondary">{songPercentage}%</span>
                        </div>
                        <div className="h-2 bg-border rounded-full">
                          <div 
                            className={`h-full rounded-full ${
                              song.status === 'Comfortable' 
                                ? 'bg-success' 
                                : song.status === 'Learning' 
                                  ? 'bg-info' 
                                  : 'bg-border'
                            }`} 
                            style={{ width: `${songPercentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-text-secondary">
                  No songs added yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Achievement 
                title="Practice Streak" 
                description="Practice for 7 consecutive days" 
                progress={Math.min(progressStats.streakDays / 7, 1)}
                value={`${progressStats.streakDays}/7 days`}
                isCompleted={progressStats.streakDays >= 7}
              />
              
              <Achievement 
                title="Song Master" 
                description="Master 5 songs completely" 
                progress={Math.min(completedSongs / 5, 1)}
                value={`${completedSongs}/5 songs`}
                isCompleted={completedSongs >= 5}
              />
              
              <Achievement 
                title="Practice Makes Perfect" 
                description="Complete 50 hours of practice" 
                progress={Math.min(progressStats.totalHoursPracticed / 50, 1)}
                value={`${progressStats.totalHoursPracticed}/50 hours`}
                isCompleted={progressStats.totalHoursPracticed >= 50}
              />
              
              <Achievement 
                title="Chord Explorer" 
                description="Learn songs using at least 20 different chords" 
                progress={0.65}
                value="13/20 chords"
                isCompleted={false}
              />
              
              <Achievement 
                title="Genre Diversity" 
                description="Learn songs from 5 different genres" 
                progress={0.4}
                value="2/5 genres"
                isCompleted={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, description }) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
          <h4 className="text-2xl font-bold">{value}</h4>
          {description && (
            <p className="text-xs text-text-muted mt-1">{description}</p>
          )}
        </div>
        <div className="p-2 bg-background-light rounded-lg text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Achievement Component
function Achievement({ title, description, progress, value, isCompleted }) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium flex items-center">
            {title}
            {isCompleted && (
              <span className="ml-2 text-success">
                <FiAward size={16} />
              </span>
            )}
          </h4>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
        <div className="text-sm font-medium text-text-secondary">
          {value}
        </div>
      </div>
      <div className="h-2 bg-border rounded-full mt-2">
        <div 
          className={`h-full rounded-full ${isCompleted ? 'bg-success' : 'bg-primary'}`} 
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
} 