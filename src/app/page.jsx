'use client';

import Link from 'next/link';
import { FiPlay, FiBook, FiVideo, FiMusic } from 'react-icons/fi';
import PageContainer from '@/components/layout/PageContainer';

export default function HomePage() {
  return (
    <PageContainer title="Guitar Lessons App">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your Guitar Journey</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Learn, practice, and master the guitar with interactive tools and personalized guidance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Featured section */}
          <div className="bg-gradient-to-br from-primary/10 to-background-secondary p-6 rounded-lg border border-primary/20">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-primary rounded-full text-white mr-3">
                <FiPlay className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold">New Feature</h2>
            </div>
            
            <h3 className="text-xl font-medium mb-3">Chord Progression Practice</h3>
            <p className="text-text-secondary mb-6">
              Master chord transitions with our new interactive tool. Practice common progressions with a built-in metronome and visual guides.
            </p>
            
            <Link href="/practice" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md">
              Try it now <FiPlay className="ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-background-secondary p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-background-primary rounded-full mr-3">
                  <FiMusic className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-medium">Song Library</h3>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Browse and learn from a collection of songs with chord diagrams and tabs
              </p>
              <Link href="/songs" className="text-primary text-sm font-medium">
                Browse songs →
              </Link>
            </div>
            
            <div className="bg-background-secondary p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-background-primary rounded-full mr-3">
                  <FiBook className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-medium">Chord Library</h3>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Interactive visual guide to guitar chords with multiple positions
              </p>
              <Link href="/chords" className="text-primary text-sm font-medium">
                Explore chords →
              </Link>
            </div>
            
            <div className="bg-background-secondary p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-background-primary rounded-full mr-3">
                  <FiVideo className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-medium">Video Lessons</h3>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Watch instructional videos with synchronized tabs and chord diagrams
              </p>
              <Link href="/lessons" className="text-primary text-sm font-medium">
                Watch lessons →
              </Link>
            </div>
            
            <div className="bg-background-secondary p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-background-primary rounded-full mr-3">
                  <FiPlay className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-medium">Track Progress</h3>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Log your practice sessions and track your improvement over time
              </p>
              <Link href="/progress" className="text-primary text-sm font-medium">
                View progress →
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-background-secondary p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Getting Started</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center text-primary font-medium mr-3">
                1
              </div>
              <div>
                <h3 className="font-medium">Explore the song library</h3>
                <p className="text-text-secondary text-sm">
                  Find songs you want to learn and view their chords and tabs
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center text-primary font-medium mr-3">
                2
              </div>
              <div>
                <h3 className="font-medium">Practice chord progressions</h3>
                <p className="text-text-secondary text-sm">
                  Use our interactive tool to master chord transitions and fingerings
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center text-primary font-medium mr-3">
                3
              </div>
              <div>
                <h3 className="font-medium">Record your practice sessions</h3>
                <p className="text-text-secondary text-sm">
                  Track your progress and see your improvement over time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 