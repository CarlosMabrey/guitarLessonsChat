'use client';

import { useState } from 'react';
import ChordDiagram from '../components/ChordDiagram';
import { FiSearch, FiFilter } from 'react-icons/fi';

// Chord categories
const chordCategories = {
  'Major': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'F#'],
  'Minor': ['Am', 'Bm', 'Dm', 'Em'],
  'Seventh': ['A7', 'D7', 'E7', 'G7'],
};

export default function ChordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Combine all chords for searching
  const allChords = Object.values(chordCategories).flat();
  
  // Filter chords based on search and category
  const filteredChords = allChords.filter(chord => {
    const matchesSearch = chord.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           Object.entries(chordCategories).some(([category, chords]) => 
                             category.toLowerCase() === selectedCategory.toLowerCase() && 
                             chords.includes(chord)
                           );
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Chord Library</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search chords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <select
            className="appearance-none bg-white border rounded-md py-2 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {Object.keys(chordCategories).map(category => (
              <option key={category} value={category.toLowerCase()}>
                {category} Chords
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <FiFilter className="text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Render search results */}
      {filteredChords.length > 0 ? (
        <div>
          {selectedCategory === 'all' ? (
            // Group by category when showing all
            Object.entries(chordCategories).map(([category, chords]) => {
              const filteredCategoryChords = chords.filter(chord => 
                chord.toLowerCase().includes(searchTerm.toLowerCase())
              );
              
              if (filteredCategoryChords.length === 0) return null;
              
              return (
                <div key={category} className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">{category} Chords</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredCategoryChords.map(chord => (
                      <div key={chord} className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center">
                        <ChordDiagram chordName={chord} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // Simple grid for specific category or search results
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredChords.map(chord => (
                <div key={chord} className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center">
                  <ChordDiagram chordName={chord} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium">No chords found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filter.</p>
        </div>
      )}
      
      {/* Learning Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">Tips for Learning Chords</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Practice transitioning between chords slowly at first, then gradually increase speed</li>
          <li>Focus on clean sound - make sure no strings are accidentally muted</li>
          <li>Practice for short periods frequently rather than long sessions infrequently</li>
          <li>Use the finger numbers suggested by the chord diagrams for optimal positioning</li>
          <li>Try to play simple songs that use only 2-3 chords when starting out</li>
        </ul>
      </div>
    </div>
  );
} 