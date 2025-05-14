'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiHome, FiMusic, FiActivity, FiBookOpen } from 'react-icons/fi';
import Layout from '@/components/ui/Layout';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
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
      <div className="container py-8 max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {/* Welcome card with glassmorphism styling */}
        <div className="p-6 backdrop-blur-md bg-card border border-border rounded-xl mb-8 max-w-3xl">
          <p className="text-xl font-medium text-green-400">Welcome to Guitar Lessons Chat!</p>
          <p className="text-text-secondary">Your personal guitar practice assistant.</p>
        </div>
        
        {/* Main cards in a grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Practice Progress Card */}
          <div className="p-6 backdrop-blur-md bg-card border border-border rounded-xl transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mr-4">
                <FiActivity className="text-cyan-400 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Practice Progress</h2>
            </div>
            <p className="text-text-secondary mb-6">Track your daily practice sessions</p>
            
            <Link 
              href="/progress" 
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-md font-medium transition-colors inline-block"
            >
              View Progress
            </Link>
          </div>
          
          {/* Songs Library Card */}
          <div className="p-6 backdrop-blur-md bg-card border border-border rounded-xl transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mr-4">
                <FiMusic className="text-indigo-400 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Songs Library</h2>
            </div>
            <p className="text-text-secondary mb-6">Pick a song to learn or grow your collection</p>
            
            <Link 
              href="/songs" 
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-md font-medium transition-colors inline-block"
            >
              View Songs
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}