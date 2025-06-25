import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiHome, FiMusic, FiActivity, FiBookOpen, FiUser, FiEdit } from 'react-icons/fi';
import { useUser } from '@/contexts/UserContext';
import Layout from '@/components/ui/Layout';

export default function DashboardPage() {
  const { userProfile, isLoading: profileLoading } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex flex-col justify-center items-center min-h-[60vh] p-6">
          <p className="text-lg mb-4">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="container py-10 max-w-6xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-white mb-2">Welcome back, {userProfile?.name || 'Guitarist'}.</h1>
          <p className="text-lg text-text-secondary/80">Ready to practice?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* My Profile */}
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                <FiUser className="text-green-400" size={20} />
              </div>
              <h2 className="text-white font-medium text-lg">My Profile</h2>
            </div>
            <p className="text-white/90 text-sm mb-1">{userProfile?.name || 'Guitar Student'}</p>
            <p className="text-text-secondary/80 text-sm mb-1">Level: {userProfile?.skillLevel || 'Beginner'}</p>
            <p className="text-text-secondary/80 text-sm mb-4">🎸 {userProfile?.guitarType || 'Acoustic'}</p>
            <Link href="/profile" className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium">
              <FiEdit className="inline mr-1 -mt-0.5" /> Edit Profile
            </Link>
          </div>

          {/* Practice Progress */}
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mr-3">
                <FiActivity className="text-cyan-400" size={20} />
              </div>
              <h2 className="text-white font-medium text-lg">Practice Progress</h2>
            </div>
            <div className="relative w-16 h-16 mb-4">
              <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 36 36">
                <path className="text-gray-700" fill="none" strokeWidth="4" d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831" />
                <path className="text-blue-500" fill="none" strokeWidth="4" strokeDasharray="32, 100" d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm">32%</span>
              </div>
            </div>
            <p className="text-text-secondary/80 text-sm mb-4">Track your daily practice sessions</p>
            <Link href="/progress" className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium">
              View Progress
            </Link>
          </div>

          {/* Songs Library */}
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                <FiMusic className="text-indigo-400" size={20} />
              </div>
              <h2 className="text-white font-medium text-lg">Songs Library</h2>
            </div>
            <p className="text-text-secondary/80 text-sm mb-4">Pick a song to learn or grow your collection</p>
            <Link href="/songs" className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium">
              View Songs
            </Link>
          </div>

          {/* Fretboard */}
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                <FiBookOpen className="text-blue-400" size={20} />
              </div>
              <h2 className="text-white font-medium text-lg">Fretboard</h2>
            </div>
            <p className="text-text-secondary/80 text-sm mb-4">Explore fretboard and learn new chords and scales</p>
            <Link href="/theory/fretboard" className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium">
              View Fretboard
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
