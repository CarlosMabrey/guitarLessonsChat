import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiMusic, FiActivity, FiBookOpen, FiUser, FiEdit, FiPlayCircle, FiClock, FiAward } from 'react-icons/fi';
import { useUser } from '@/contexts/UserContext';
import Layout from '@/components/ui/Layout';

// Dynamic background component with soothing animation
const DynamicBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 to-cyan-800/80">
      <div className="absolute inset-0 bg-[url('/images/guitar-texture.png')] opacity-10 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-cyan-800/30"></div>
    </div>
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(10)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-white/5"
          style={{
            width: `${Math.random() * 300 + 100}px`,
            height: `${Math.random() * 300 + 100}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `translate(-50%, -50%)`,
            filter: 'blur(40px)',
            animation: `pulse ${Math.random() * 30 + 20}s infinite alternate`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1.5); }
        }
      `}</style>
    </div>
  </div>
);

// Stat card component
const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300">
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg bg-${color}-500/10`}>
        <Icon className={`text-${color}-400`} size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  </div>
);

// Feature card component
const FeatureCard = ({ icon: Icon, title, description, color, href }) => (
  <Link href={href} className="group">
    <div className="h-full bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
      <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center mb-4 group-hover:bg-${color}-500/20 transition-colors`}>
        <Icon className={`text-${color}-400 group-hover:text-${color}-300 transition-colors`} size={24} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  </Link>
);

export default function DashboardPage() {
  const { userProfile } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');

    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-48"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <DynamicBackground />
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Good {timeOfDay}, {userProfile?.name?.split(' ')[0] || 'Guitarist'}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Let's make some music. What would you like to practice today?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/songs" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all flex items-center justify-center space-x-2">
                <FiPlayCircle size={20} />
                <span>Start Practicing</span>
              </Link>
              <Link href="/practice" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all">
                View Practice Plans
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 max-w-6xl mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FiClock} value="12h 45m" label="This Week" color="indigo" />
          <StatCard icon={FiAward} value={userProfile?.streak || 0} label="Day Streak" color="green" />
          <StatCard icon={FiMusic} value={userProfile?.songsLearned || 0} label="Songs Learned" color="blue" />
          <StatCard icon={FiActivity} value={`${userProfile?.progress || 0}%`} label="Overall Progress" color="purple" />
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 max-w-6xl mb-24">
        <h2 className="text-2xl font-bold text-white mb-8">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={FiMusic} 
            title="Songs Library" 
            description="Explore and learn new songs at your own pace"
            color="indigo"
            href="/songs"
          />
          <FeatureCard 
            icon={FiBookOpen} 
            title="Fretboard Trainer" 
            description="Master the fretboard with interactive exercises"
            color="blue"
            href="/theory/fretboard"
          />
          <FeatureCard 
            icon={FiActivity} 
            title="Progress Tracker" 
            description="Monitor your improvement over time"
            color="green"
            href="/progress"
          />
        </div>
      </div>
    </Layout>
  );
}
