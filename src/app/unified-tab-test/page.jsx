'use client';

import React, { useState, useEffect } from 'react';
import { SimpleTabRenderer } from '@/components/TabRenderer';
import TabUrlImporter from '@/components/tabs/TabUrlImporter';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import demoTabs from '@/data/demoTabs';
import { useTheme } from '@/components/ui/ThemeContext';
import Layout from '@/components/ui/Layout';

export default function UnifiedTabTest() {
  const { theme, isClient } = useTheme();
  const [activeTab, setActiveTab] = useState('demo');
  const [selectedTab, setSelectedTab] = useState(null);
  const [tabData, setTabData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    showMeasureNumbers: true,
    width: 1000,
    height: 600,
    fontSize: 14,
    stringSpacing: 10,
    darkMode: false, // Use a safe initial value for server rendering
  });
  const [expandedSections, setExpandedSections] = useState({
    demo: true,
    library: false,
    scraper: false,
    settings: false,
  });

  // Sync darkMode with global theme after hydration
  useEffect(() => {
    if (isClient) {
      setSettings(prev => ({
        ...prev,
        darkMode: theme === 'dark'
      }));
    }
  }, [theme, isClient]);

  // Expand/collapse section handler
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Load demo tab
  const loadDemoTab = async (tabId) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedTab(tabId);
      
      // Find the selected demo tab
      const selectedDemo = demoTabs.find(tab => tab.id === tabId);
      if (!selectedDemo) {
        throw new Error('Demo tab not found');
      }
      
      // Load the tab data
      setTabData(selectedDemo.data);
    } catch (err) {
      console.error('Error loading demo tab:', err);
      setError(`Failed to load tab: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful import from URL
  const handleImportSuccess = (importedTabData) => {
    setTabData(importedTabData);
    setActiveTab('library');
    // Auto-expand the library section when a tab is imported
    setExpandedSections(prev => ({
      ...prev,
      library: true
    }));
  };

  // Handle settings change
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <Layout title="Tab Viewer" version="1.0.0">
      <div className="container mx-auto p-4 max-w-7xl">
        
        {/* Tab Viewer */}
        <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Tab Viewer</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 text-center">{error}</div>
          ) : tabData ? (
            <SimpleTabRenderer 
              tabData={tabData} 
              width={settings.width}
              height={settings.height}
              fontSize={settings.fontSize}
              stringSpacing={settings.stringSpacing}
              showMeasureNumbers={settings.showMeasureNumbers}
              darkMode={settings.darkMode}
            />
          ) : (
            <div className="text-center p-6 text-gray-500 dark:text-gray-400">
              Select a demo tab or import a tab to view
            </div>
          )}
        </div>
        
        {/* Sections */}
        <div className="grid grid-cols-1 gap-6">
          {/* Demo Tabs Section */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <button 
              onClick={() => toggleSection('demo')}
              className="flex items-center justify-between w-full text-left font-semibold text-lg mb-2"
            >
              <span>Demo Tabs</span>
              {expandedSections.demo ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            
            {expandedSections.demo && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {demoTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => loadDemoTab(tab.id)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      selectedTab === tab.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <h3 className="font-medium">{tab.title}</h3>
                    <p className="text-sm opacity-80">{tab.artist}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Tab Library Section */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <button 
              onClick={() => toggleSection('library')}
              className="flex items-center justify-between w-full text-left font-semibold text-lg mb-2"
            >
              <span>Tab Library</span>
              {expandedSections.library ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            
            {expandedSections.library && (
              <div className="mt-4">
                {tabData ? (
                  <div>
                    <h3 className="font-medium mb-2">Current Tab Information</h3>
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm">
                      <div className="font-medium">Title:</div>
                      <div>{tabData.title || 'Unknown'}</div>
                      
                      <div className="font-medium">Artist:</div>
                      <div>{tabData.artist || 'Unknown'}</div>
                      
                      <div className="font-medium">Total Notes:</div>
                      <div>{tabData.notes?.length || 0}</div>
                      
                      <div className="font-medium">Total Measures:</div>
                      <div>{tabData.measures || 'Unknown'}</div>
                      
                      <div className="font-medium">Source:</div>
                      <div>{tabData.source?.url || 'Custom'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                    No tab data loaded yet. Import a tab from URL or select a demo tab.
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* URL Scraper Section */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <button 
              onClick={() => toggleSection('scraper')}
              className="flex items-center justify-between w-full text-left font-semibold text-lg mb-2"
            >
              <span>URL Scraper</span>
              {expandedSections.scraper ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            
            {expandedSections.scraper && (
              <div className="mt-4">
                <p className="mb-4 text-sm">
                  Import tab data from Ultimate Guitar or other supported tab sites.
                </p>
                
                <TabUrlImporter 
                  onImportSuccess={handleImportSuccess}
                  onImportError={(error) => setError(error)}
                />
              </div>
            )}
          </div>
          
          {/* Settings Section */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <button 
              onClick={() => toggleSection('settings')}
              className="flex items-center justify-between w-full text-left font-semibold text-lg mb-2"
            >
              <span>Settings</span>
              {expandedSections.settings ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            
            {expandedSections.settings && (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Width */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Width: {settings.width}px
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="1500"
                      step="50"
                      value={settings.width}
                      onChange={(e) => handleSettingChange('width', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Height */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Height: {settings.height}px
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="1000"
                      step="50"
                      value={settings.height}
                      onChange={(e) => handleSettingChange('height', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Font Size: {settings.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* String Spacing */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      String Spacing: {settings.stringSpacing}px
                    </label>
                    <input
                      type="range"
                      min="6"
                      max="20"
                      value={settings.stringSpacing}
                      onChange={(e) => handleSettingChange('stringSpacing', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Show Measure Numbers */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showMeasureNumbers"
                      checked={settings.showMeasureNumbers}
                      onChange={(e) => handleSettingChange('showMeasureNumbers', e.target.checked)}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="showMeasureNumbers" className="text-sm font-medium">
                      Show Measure Numbers
                    </label>
                  </div>
                  
                  {/* Dark Mode Override */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="darkMode"
                      checked={settings.darkMode}
                      onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="darkMode" className="text-sm font-medium">
                      Dark Mode Override
                    </label>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      (Overrides theme)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 