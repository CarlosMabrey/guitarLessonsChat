'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiActivity, FiClock, FiTrendingUp } from 'react-icons/fi';
import Layout from '@/components/ui/Layout';

export default function ProgressPage() {
  // Mock data for practice sessions
  const practiceData = [
    { day: 'Mon', minutes: 15 },
    { day: 'Tue', minutes: 30 },
    { day: 'Wed', minutes: 20 },
    { day: 'Thu', minutes: 45 },
    { day: 'Fri', minutes: 25 },
    { day: 'Sat', minutes: 60 },
    { day: 'Sun', minutes: 10 }
  ];

  // Mock data for practice log
  const practiceLog = [
    { date: '2023-10-15', duration: 45, songs: ['Wonderwall', 'Hey There Delilah'] },
    { date: '2023-10-13', duration: 30, songs: ['Smoke on the Water'] },
    { date: '2023-10-10', duration: 60, songs: ['Wonderwall', 'Dust in the Wind', 'Hotel California'] }
  ];

  // Get total practice time for the week
  const totalWeeklyPractice = practiceData.reduce((total, day) => total + day.minutes, 0);
  
  // Calculate max value for chart scaling
  const maxMinutes = Math.max(...practiceData.map(d => d.minutes));

  return (
    <Layout title="Progress">
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Your Progress</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-bold flex items-center">
                <FiActivity className="mr-2 text-primary" /> Weekly Practice
              </h2>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-end h-40 mb-4">
                {practiceData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-primary rounded-t-md" 
                      style={{ 
                        height: `${(day.minutes / maxMinutes) * 100}%`,
                        minHeight: '4px'
                      }}
                    ></div>
                    <div className="text-sm mt-2">{day.day}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div className="flex items-center">
                  <FiClock className="mr-2 text-text-secondary" />
                  <span>Total: {totalWeeklyPractice} minutes</span>
                </div>
                <div className="text-text-secondary text-sm">
                  This Week
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-bold flex items-center">
                <FiTrendingUp className="mr-2 text-primary" /> Stats
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card-hover rounded-lg">
                  <div className="text-sm text-text-secondary mb-1">Total Practice Time</div>
                  <div className="text-2xl font-bold">8.5 hours</div>
                </div>
                <div className="p-4 bg-card-hover rounded-lg">
                  <div className="text-sm text-text-secondary mb-1">Songs Practiced</div>
                  <div className="text-2xl font-bold">12</div>
                </div>
                <div className="p-4 bg-card-hover rounded-lg">
                  <div className="text-sm text-text-secondary mb-1">Daily Average</div>
                  <div className="text-2xl font-bold">25 min</div>
                </div>
                <div className="p-4 bg-card-hover rounded-lg">
                  <div className="text-sm text-text-secondary mb-1">Streak</div>
                  <div className="text-2xl font-bold">3 days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border overflow-hidden mb-6">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold">Recent Practice Sessions</h2>
          </div>
          <div className="divide-y divide-border">
            {practiceLog.map((session, index) => (
              <div key={index} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {new Date(session.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      {session.duration} minutes
                    </div>
                  </div>
                  <div className="text-text-secondary">
                    {session.songs.length} {session.songs.length === 1 ? 'song' : 'songs'}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {session.songs.map((song, songIndex) => (
                    <span 
                      key={songIndex} 
                      className="text-xs px-2 py-1 bg-accent rounded-full"
                    >
                      {song}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
} 