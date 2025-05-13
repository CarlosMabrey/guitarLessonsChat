'use client';

import { useState } from 'react';
import { FiLink, FiSearch, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { fetchTabByUrl } from '@/lib/services/tabFetcherService';

/**
 * Component that allows users to import tabs by providing a direct URL
 * @param {Function} onImportSuccess - Callback when tab is successfully imported
 * @param {Function} onImportError - Callback when tab import fails
 */
export default function TabUrlImporter({ onImportSuccess, onImportError }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const [importStage, setImportStage] = useState(null); // Track import stage for better feedback
  
  // Validates whether the URL is potentially a valid tab URL
  const validateUrl = (urlToCheck) => {
    if (!urlToCheck) return false;
    
    // Basic URL validation
    try {
      new URL(urlToCheck);
    } catch (e) {
      return false;
    }
    
    // Check for supported domains
    const supportedDomains = [
      'ultimate-guitar.com',
      'tabs.ultimate-guitar.com',
      'm.ultimate-guitar.com',
      'songsterr.com'
    ];
    
    return supportedDomains.some(domain => urlToCheck.includes(domain));
  };
  
  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a tab URL');
      return;
    }
    
    // Validate URL format
    if (!validateUrl(url)) {
      setError('Please enter a valid tab URL from Ultimate Guitar or Songsterr');
      return;
    }
    
    // Reset states
    setLoading(true);
    setError(null);
    setDiagnosticInfo(null);
    setImportStage('Initializing import...');
    
    console.log('🎸 Importing tab from URL:', url);
    
    try {
      setImportStage('Fetching tab data...');
      
      // Use the tab fetcher service to import the tab
      const tabData = await fetchTabByUrl(url);
      
      console.log('🎸 Tab data received:', {
        title: tabData?.title,
        artist: tabData?.artist,
        noteCount: tabData?.notes?.length || 0,
        source: tabData?.source?.type,
        rawContentLength: tabData?.source?.rawContent?.length || 0,
      });
      
      if (tabData) {
        // Check if the tab has actual content
        if (!tabData.notes || tabData.notes.length === 0) {
          console.error('❌ Tab data has no notes!');
          setDiagnosticInfo('Tab was found but contains no playable notes. Generic fallback notes will be used.');
        } else if (tabData.source?.type === 'fallback') {
          console.warn('⚠️ Using fallback tab data:', tabData.source);
          setDiagnosticInfo(`Using fallback tab: ${tabData.source?.description || 'Unable to scrape from URL'}`);
        } else if (tabData.source?.type === 'error') {
          console.warn('⚠️ Tab fetch returned error data:', tabData.source);
          setDiagnosticInfo(`Tab import partially successful: ${tabData.source?.description || 'Unknown issue'}`);
        } else if (tabData.source?.type === 'scraped' && (!tabData.source?.rawContent || tabData.source?.rawContent.length < 500)) {
          setDiagnosticInfo('Tab content was limited. The displayed tab may be simplified.');
        }
        
        // Call the success callback even with potential warnings
        // The parent component can decide how to handle edge cases
        if (typeof onImportSuccess === 'function') {
          setImportStage('Processing imported tab...');
          onImportSuccess(tabData);
          setUrl('');
          setImportStage('Import complete!');
        } else {
          console.error('❌ onImportSuccess is not a function!', onImportSuccess);
          setError('Application error: Import handler not properly configured.');
        }
      } else {
        setError('Failed to import tab from the URL - no data received');
        if (typeof onImportError === 'function') {
          onImportError('No tab data received from server');
        }
      }
    } catch (err) {
      console.error('❌ Tab import error:', err);
      
      // Provide more specific error messages based on the error
      let errorMessage = 'Failed to import tab. Please check the URL and try again.';
      
      if (err.message && err.message.includes('Ultimate Guitar parser failed')) {
        errorMessage = 'The tab content could not be extracted from this URL. Try searching by artist and song name instead.';
      } else if (err.message && err.message.includes('network')) {
        errorMessage = 'Network error while importing tab. Please check your connection and try again.';
      } else if (err.message && err.message.includes('timeout')) {
        errorMessage = 'The request timed out. The tab site might be slow or unavailable.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      if (typeof onImportError === 'function') {
        onImportError(errorMessage);
      }
    } finally {
      setLoading(false);
      setImportStage(null);
    }
  };
  
  return (
    <div className="bg-card p-4 rounded-lg">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <FiLink className="mr-2" /> Import Tab by URL
      </h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 flex items-start text-sm">
          <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}
      
      {diagnosticInfo && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-md mb-4 flex items-start text-sm">
          <FiInfo className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>{diagnosticInfo}</div>
        </div>
      )}
      
      <form onSubmit={handleImport} className="space-y-4">
        <div>
          <label htmlFor="tab-url" className="block text-sm font-medium mb-1">
            URL from Ultimate Guitar or Songsterr
          </label>
          <input
            id="tab-url"
            type="url"
            placeholder="https://tabs.ultimate-guitar.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
              validateUrl(url) || !url ? 'border-border' : 'border-red-300'
            }`}
            disabled={loading}
          />
          <p className="mt-1 text-xs text-text-secondary">
            Enter a URL from a supported tab website like Ultimate Guitar or Songsterr
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading || !url}
          className={`w-full flex justify-center items-center py-2 px-4 rounded-md ${
            loading || !url ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
          } text-white transition-colors`}
        >
          {loading ? (
            <>
              <FiSearch className="animate-spin mr-2" />
              {importStage || 'Importing...'}
            </>
          ) : (
            <>
              <FiSearch className="mr-2" />
              Import Tab
            </>
          )}
        </button>
      </form>
      
      <div className="mt-4 p-2 border border-border rounded-md bg-card-hover">
        <div className="text-sm font-medium mb-1 flex items-center">
          <FiInfo className="mr-1 text-primary" /> Example URLs
        </div>
        <ul className="text-xs space-y-1 text-text-secondary">
          <li>https://tabs.ultimate-guitar.com/tab/guns-n-roses/sweet-child-o-mine-tabs-12657</li>
          <li>https://www.songsterr.com/a/wsa/metallica-nothing-else-matters-tab-s439t1</li>
        </ul>
      </div>
    </div>
  );
} 