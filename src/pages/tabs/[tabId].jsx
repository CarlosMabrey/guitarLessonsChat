'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowLeft, FiLoader } from 'react-icons/fi';
import Layout from '@/components/ui/Layout';
import SongTabViewer from '@/components/songs/SongTabViewer';
import FretboardGrid from '@/pages/theory/fretboard/components/FretboardGrid';
import { getTabForSong } from '@/lib/services/tabFetcherService';
import TabFretboardVisualizer from '@/components/tabs/TabFretboardVisualizer';
import { getFirstDemoTab, getDemoTabById } from '@/lib/utils/tabDataConverter';

// Component for displaying tabs with URL parameters
export default function TabDetailPage() {
  const router = useRouter();
  const { tabId } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabData, setTabData] = useState(null);
  const [songInfo, setSongInfo] = useState(null);
  
  useEffect(() => {
    // Wait until router is ready and we have a tabId
    if (!router.isReady || !tabId) return;
    
    const loadTabData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Parse the tabId format (expecting artist-title-id)
        const [artistSlug, titleSlug, songsterrId] = tabId.split('-');
        
        // Fall back to using the whole tabId as the songsterrId if parsing fails
        const artist = artistSlug ? artistSlug.replace(/-/g, ' ') : '';
        const title = titleSlug ? titleSlug.replace(/-/g, ' ') : '';
        const id = songsterrId || tabId;
        
        // Update song info
        setSongInfo({
          artist: artist,
          title: title,
          songId: id
        });
        
        // Load tab data directly if we have artist and title
        if (artist && title) {
          const tab = await getTabForSong(artist, title);
          setTabData(tab);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading tab data:', err);
        setError('Failed to load tab: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };
    
    loadTabData();
  }, [router.isReady, tabId]);
  
  return (
    <Layout title={songInfo ? `${songInfo.title} by ${songInfo.artist} - Tabs` : 'Tab Viewer'}>
      <div className="container py-6">
        <Link href="/tabs" className="inline-flex items-center text-text-secondary hover:text-text-primary mb-4">
          <FiArrowLeft className="mr-2" />
          Back to Tab Library
        </Link>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FiLoader className="animate-spin text-primary mr-2" size={24} />
            <span className="text-text-secondary">Loading tab...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <h2 className="text-lg font-medium mb-2">Error</h2>
            <p>{error}</p>
          </div>
        ) : songInfo ? (
          <div>
            <h1 className="text-3xl font-bold mb-2">{songInfo.title}</h1>
            <h2 className="text-xl text-text-secondary mb-6">{songInfo.artist}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Tab viewer */}
              <div className="bg-card rounded-lg shadow-sm">
                <SongTabViewer {...songInfo} />
              </div>
              
              {/* Fretboard visualizer */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-bold mb-4">Fretboard Visualization</h3>
                {tabData ? (
                  <TabFretboardVisualizer tabData={tabData} />
                ) : (
                  <>
                    <div className="text-center py-2 text-text-secondary">
                      <div className="mb-2">Custom tab data not available. Using demo tab instead.</div>
                      <div className="text-sm text-text-secondary mb-4">
                        Tab fetching functionality will be restored in a future update.
                      </div>
                    </div>
                    <TabFretboardVisualizer tabData={getFirstDemoTab()} />
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
            <h2 className="text-lg font-medium mb-2">Tab Not Found</h2>
            <p>The requested tab could not be found. Please check the URL and try again.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
