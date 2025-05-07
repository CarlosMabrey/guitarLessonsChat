'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiInfo, FiPlus, FiArrowRight, FiClock, FiBook, FiPause, FiPlay, FiMoreVertical } from 'react-icons/fi';

// Import mock data directly for now 
const progressStats = {
  songsAdded: 15,
  songsInProgress: 8,
  songsMastered: 3,
  totalHoursPracticed: 24,
  streakDays: 5
};

const recentSongs = [
  {
    id: 'song-1',
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    tempo: 82,
    chords: ['Am', 'G', 'F', 'C']
  },
  {
    id: 'song-2',
    title: 'Thunderstruck',
    artist: 'AC/DC',
    tempo: 134,
    chords: ['B', 'A', 'E']
  },
  {
    id: 'song-3',
    title: 'Wish You Were Here',
    artist: 'Pink Floyd',
    tempo: 66,
    chords: ['G', 'Em', 'A7', 'D']
  }
];

const chartData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Practice Minutes',
      data: [240, 300, 180, 420],
      borderColor: '#3e63dd',
      backgroundColor: 'rgba(62, 99, 221, 0.2)',
      fill: true,
    }
  ]
};

// Simple chart component
function LineChart({ data, height }) {
  return (
    <div style={{ height: height || 250 }} className="w-full bg-gray-100 rounded-lg">
      <div className="p-4 text-center text-gray-500">Chart Placeholder</div>
    </div>
  );
}

// Simple stats card
function StatsCard({ title, value, color = "blue" }) {
  return (
    <div className={`p-6 rounded-lg bg-${color}-50 border border-${color}-200`}>
      <div className="text-lg font-medium text-gray-600">{title}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}

// Simple card components
function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-lg shadow-sm border ${className}`}>{children}</div>;
}

function CardHeader({ children }) {
  return <div className="px-6 py-4 border-b">{children}</div>;
}

function CardTitle({ children }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

function CardContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

function CardFooter({ children }) {
  return <div className="px-6 py-4 border-t">{children}</div>;
}

export default function DashboardPage() {
  const [chartPeriod, setChartPeriod] = useState('week');
  const [playingSongId, setPlayingSongId] = useState(null);
  
  const handlePlaySong = (songId) => {
    setPlayingSongId(songId);
  };
  
  const handlePauseSong = () => {
    setPlayingSongId(null);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard 
          title="Songs Added" 
          value={progressStats.songsAdded} 
          color="blue"
        />
        <StatsCard 
          title="In Progress" 
          value={progressStats.songsInProgress} 
          color="green"
        />
        <StatsCard 
          title="Mastered" 
          value={progressStats.songsMastered} 
          color="purple"
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
                className={`px-3 py-1 text-sm font-medium rounded-md ${chartPeriod === 'day' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-blue-500'}`}
                onClick={() => setChartPeriod('day')}
              >
                DAY
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md ${chartPeriod === 'week' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-blue-500'}`}
                onClick={() => setChartPeriod('week')}
              >
                WEEK
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md ${chartPeriod === 'month' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-blue-500'}`}
                onClick={() => setChartPeriod('month')}
              >
                MONTH
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md ${chartPeriod === 'year' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-blue-500'}`}
                onClick={() => setChartPeriod('year')}
              >
                YEAR
              </button>
            </div>
            
            <CardContent>
              <div className="relative">
                <LineChart data={chartData} height={250} />
                
                <div className="absolute bottom-5 right-5 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-600 text-xs font-medium">
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
          <CardContent className="p-0">
            {recentSongs.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentSongs.map((song) => (
                  <div key={song.id} className="px-4 py-3 flex items-center">
                    <div className="w-12 h-12 bg-gray-900 rounded overflow-hidden flex items-center justify-center text-xs text-white mr-3">
                      Cover
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-blue-500">
                        <FiBook size={16} />
                      </div>
                      <div className="font-medium">{song.title}</div>
                    </div>
                    <div className="ml-4 text-xs text-blue-400 bg-blue-100 px-2 py-0.5 rounded-full">
                      {song.chords && song.chords.length > 0 ? `${song.chords.length} chords` : '4 chords'}
                    </div>
                    <div className="ml-auto text-xs text-gray-400 flex items-center">
                      {song.tempo || '120'}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        playingSongId === song.id ? handlePauseSong() : handlePlaySong(song.id);
                      }}
                      className={`ml-4 w-8 h-8 flex items-center justify-center rounded-full ${playingSongId === song.id ? 'bg-blue-100 text-blue-600' : 'bg-blue-600 text-white'}`}
                    >
                      {playingSongId === song.id ? <FiPause size={14} /> : <FiPlay size={14} className="ml-0.5" />}
                    </button>
                    <button className="ml-1 w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 text-white">
                      <FiMoreVertical size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No songs added yet
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link 
              href="/songs" 
              className="text-gray-400 text-sm hover:text-blue-500 flex items-center mx-auto"
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
            <p className="text-gray-500 mb-4">
              Your current streak is {progressStats.streakDays} days. Keep it up to reach your goal!
            </p>
            
            <Link href="/practice" className="px-4 py-2 rounded-md bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 transition-colors">
              Start Practice Session
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 