import Link from 'next/link';
import { FiBarChart2, FiMusic, FiPlay, FiBookmark, FiBook, FiAward, FiUser } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Master the Guitar with Confidence</h1>
            <p className="text-xl mb-8 text-blue-100">Track your progress, learn songs, and practice effectively</p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/dashboard" 
                className="px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium"
              >
                Get Started
              </Link>
              <Link 
                href="/practice" 
                className="px-6 py-3 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors font-medium"
              >
                Try Practice Mode
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-white p-1 rounded-lg shadow-lg">
              <div className="w-full h-48 md:h-64 bg-gray-800 rounded overflow-hidden flex items-center justify-center text-gray-400">
                <span className="text-lg">Guitar Image Placeholder</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="w-full py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Your Complete Guitar Learning Solution</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white mb-4">
                <FiBarChart2 size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">Monitor your practice time, skills improvement, and song mastery with detailed analytics.</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-4">
                <FiMusic size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Song Library</h3>
              <p className="text-gray-600">Build your personal collection of songs with chord diagrams, tabs, and practice notes.</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white mb-4">
                <FiPlay size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Guided Practice</h3>
              <p className="text-gray-600">Follow structured practice sessions designed to improve your skills efficiently.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="w-full py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col items-center mb-8 md:mb-0">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white mb-4">
                <FiBookmark size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Songs</h3>
              <p className="text-gray-600 text-center max-w-xs">Build your personal library of songs you want to learn</p>
            </div>
            
            <div className="hidden md:block text-blue-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            
            <div className="flex flex-col items-center mb-8 md:mb-0">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4">
                <FiPlay size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Practice Daily</h3>
              <p className="text-gray-600 text-center max-w-xs">Follow guided practice sessions to build skills</p>
            </div>
            
            <div className="hidden md:block text-blue-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white mb-4">
                <FiAward size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Master Songs</h3>
              <p className="text-gray-600 text-center max-w-xs">Track progress and celebrate your achievements</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="w-full py-16 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start your guitar journey?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">Join thousands of guitarists who are improving their skills every day with Guitar Coach.</p>
          
          <Link 
            href="/dashboard" 
            className="px-8 py-4 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium text-lg"
          >
            Start Now
          </Link>
        </div>
      </div>
    </div>
  );
} 