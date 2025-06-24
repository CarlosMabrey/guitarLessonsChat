'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiSearch, FiMusic, FiFilter, FiX, FiLoader } from 'react-icons/fi';
import Layout from '@/components/ui/Layout';
import { searchTabs } from '@/lib/services/tabSearchService';

export default function TabLibraryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    style: 'all'
  });
  
  // Load tabs on page load
  useEffect(() => {
    const loadTabs = async () => {
      try {
        setLoading(true);
        // This would normally be an API call, using the search service for now
        const results = await searchTabs('', { limit: 20 });
        setTabs(results);
        setLoading(false);
      } catch (err) {
        console.error('Error loading tabs:', err);
        setError('Failed to load tabs: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };
    
    loadTabs();
  }, []);
  
  // Handle search submissions
  const handleSearch = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const results = await searchTabs(searchTerm, { 
        ...filters, 
        limit: 20 
      });
      setTabs(results);
      setLoading(false);
    } catch (err) {
      console.error('Error searching tabs:', err);
      setError('Search failed: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };
  
  // Create URL-friendly slug for tab navigation
  const createTabSlug = (tab) => {
    const artist = tab.artist?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown';
    const title = tab.title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'untitled';
    const id = tab.songId || 'no-id';
    
    return `${artist}-${title}-${id}`;
  };
  
  // Sample tabs (normally would come from an API)
  const sampleTabs = [
    { songId: '654321', title: 'Stairway to Heaven', artist: 'Led Zeppelin', difficulty: 'Intermediate' },
    { songId: '123456', title: 'Wonderwall', artist: 'Oasis', difficulty: 'Beginner' },
    { songId: '789012', title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', difficulty: 'Advanced' },
    { songId: '345678', title: 'Hotel California', artist: 'Eagles', difficulty: 'Intermediate' },
    { songId: '901234', title: 'Nothing Else Matters', artist: 'Metallica', difficulty: 'Advanced' }
  ];
  
  // Use sample tabs if API returns empty
  const displayTabs = tabs.length > 0 ? tabs : sampleTabs;
  
  return (
    <Layout title="Guitar Tab Library">
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-2">Guitar Tab Library</h1>
        <p className="text-text-secondary mb-6">
          Browse and search through our collection of guitar tabs
        </p>
        
        {/* Search and filters */}
        <div className="bg-card rounded-lg p-4 mb-6">
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by song or artist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-9 border border-border rounded"
              />
              <FiSearch className="absolute left-3 top-3 text-text-secondary" />
            </div>
            <button 
              type="submit"
              className="btn btn-primary px-4 py-2"
            >
              Search
            </button>
          </form>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <FiFilter className="text-text-secondary" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              className="text-sm p-1.5 border border-border rounded"
            >
              <option value="all">Any Difficulty</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            
            <select
              value={filters.style}
              onChange={(e) => setFilters({...filters, style: e.target.value})}
              className="text-sm p-1.5 border border-border rounded"
            >
              <option value="all">Any Style</option>
              <option value="rock">Rock</option>
              <option value="pop">Pop</option>
              <option value="blues">Blues</option>
              <option value="metal">Metal</option>
              <option value="jazz">Jazz</option>
              <option value="folk">Folk</option>
            </select>
          </div>
        </div>
        
        {/* Tab listing */}
        <div>
          <h2 className="text-xl font-bold mb-4">Available Tabs</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FiLoader className="animate-spin text-primary mr-2" size={24} />
              <span className="text-text-secondary">Loading tabs...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              <h3 className="font-medium mb-2">Error</h3>
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayTabs.map((tab) => (
                <Link 
                  key={tab.songId} 
                  href={`/tabs/${createTabSlug(tab)}`}
                  className="bg-card hover:bg-card-hover border border-border rounded-md p-4 transition-colors"
                >
                  <div className="flex items-start">
                    <div className="bg-primary/10 rounded-full p-3 mr-3">
                      <FiMusic className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">{tab.title}</h3>
                      <p className="text-text-secondary text-sm">{tab.artist}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                          {tab.difficulty || 'Intermediate'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* Empty state */}
          {!loading && !error && displayTabs.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                <FiMusic size={32} />
              </div>
              <h3 className="text-xl font-medium mb-2">No tabs found</h3>
              <p className="text-text-secondary">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
