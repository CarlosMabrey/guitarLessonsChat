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
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="p-6 bg-success/10 text-success rounded-md mb-6 max-w-2xl w-full">
          <p className="font-bold">Welcome to Guitar Lessons Chat!</p>
          <p>Your personal guitar practice assistant.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full mb-6">
          <div className="p-6 bg-card rounded-lg shadow-card">
            <FiActivity className="text-primary text-2xl mb-2" />
            <h2 className="text-xl font-bold mb-2 text-primary">Practice Progress</h2>
            <p className="text-secondary mb-4">Track your daily practice sessions</p>
            <div className="h-2 bg-card-hover rounded-full">
              <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="mt-4">
              <Link 
                href="/progress" 
                className="btn btn-primary inline-block"
              >
                View Progress
              </Link>
            </div>
          </div>
          
          <div className="p-6 bg-card rounded-lg shadow-card">
            <FiMusic className="text-primary text-2xl mb-2" />
            <h2 className="text-xl font-bold mb-2 text-primary">Songs Library</h2>
            <p className="text-secondary mb-4">You have 12 songs in your collection</p>
            <Link 
              href="/songs" 
              className="btn btn-primary inline-block"
            >
              View Songs
            </Link>
          </div>
        </div>
        
        <div className="p-6 bg-card-hover rounded-lg shadow-card max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-3 text-primary">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/songs" className="text-primary hover:underline flex items-center">
                <FiMusic className="mr-2" /> Songs
              </Link>
            </li>
            <li>
              <Link href="/practice" className="text-primary hover:underline flex items-center">
                <FiBookOpen className="mr-2" /> Practice
              </Link>
            </li>
            <li>
              <Link href="/progress" className="text-primary hover:underline flex items-center">
                <FiActivity className="mr-2" /> Progress
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
} 