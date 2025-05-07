'use client';

import { useEffect, useRef, useState } from 'react';
import { Flow } from 'vexflow';
import { FiAlertCircle } from 'react-icons/fi';

/**
 * SimpleTabRenderer - A performance-optimized tab renderer
 * This renderer has minimal state and options to improve performance
 */
const SimpleTabRenderer = ({ 
  notes: propNotes, 
  tabData,
  width = 1000, 
  height = 600, 
  showMeasureNumbers = true,
  fontSize = 14,
  stringSpacing = 10,
  darkMode = false 
}) => {
  // Extract notes either from direct props or from tabData
  const notes = propNotes || (tabData?.notes || []);
  
  // Extract options with defaults
  const measuresPerLine = 4; 
  const notesPerMeasure = 4;
  
  const containerRef = useRef(null);
  const [renderStatus, setRenderStatus] = useState({ 
    state: 'loading', 
    step: 'initializing', 
    message: 'Preparing to render tab...',
    startTime: null,
    error: null,
    currentNote: null,
    notesProcessed: 0,
    totalNotes: 0
  });
  
  // Toggle to show/hide debug info
  const [showDebug, setShowDebug] = useState(false);
  
  useEffect(() => {
    if (!containerRef.current) {
      setRenderStatus({
        state: 'error',
        step: 'validation',
        message: 'Missing container for rendering',
        error: 'DOM container not available',
        startTime: null,
        currentNote: null,
        notesProcessed: 0,
        totalNotes: 0
      });
      return;
    }
    
    // Clear previous content
    containerRef.current.innerHTML = '';
    
    // Start timer
    const startTime = performance.now();
    setRenderStatus({
      state: 'loading',
      step: 'starting',
      message: 'Starting tab rendering...',
      startTime,
      error: null,
      currentNote: null,
      notesProcessed: 0,
      totalNotes: notes.length
    });
    
    // Use a timeout to prevent UI blocking
    setTimeout(() => {
      // Check if tab has raw content to display as text
      if (tabData?.source?.rawContent) {
        renderRawTabContent();
      } else {
        renderVexflowTab();
      }
    }, 10);
    
    // Function to render raw tab content as preformatted text
    function renderRawTabContent() {
      try {
        const rawContent = tabData.source.rawContent;
        
        if (!rawContent || typeof rawContent !== 'string') {
          throw new Error('Invalid raw tab content');
        }
        
        // Create styled container for the tab
        const tabContainer = document.createElement('div');
        tabContainer.className = `tab-container overflow-auto p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`;
        tabContainer.style.minHeight = '200px';
        tabContainer.style.maxHeight = `${height}px`;
        tabContainer.style.width = '100%';
        tabContainer.style.fontFamily = 'monospace';
        tabContainer.style.fontSize = `${fontSize}px`;
        tabContainer.style.whiteSpace = 'pre';
        tabContainer.style.lineHeight = `${stringSpacing + 10}px`;
        
        // Clean up the raw content and add it to the container
        const tabContent = rawContent
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .trim();
          
        // Add the tab content
        tabContainer.textContent = tabContent;
        
        // Clear the container and add our rendered content
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(tabContainer);
        
        // Add the metadata section with song info
        addMetadataSection();
        
        // Update status
        const endTime = performance.now();
        const renderTime = (endTime - startTime).toFixed(2);
        
        setRenderStatus({
          state: 'success',
          step: 'complete',
          message: `Raw tab rendering complete in ${renderTime}ms`,
          startTime,
          renderTime,
          notesProcessed: notes.length,
          totalNotes: notes.length
        });
      } catch (err) {
        console.error('Error rendering raw tab content:', err);
        fallbackToVexflow();
      }
    }
    
    // Add metadata section with song info
    function addMetadataSection() {
      if (!tabData) return;
      
      const metadataContainer = document.createElement('div');
      metadataContainer.className = `metadata-container py-2 px-4 mb-2 text-sm border-b ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
      }`;
      
      // Calculate note stats
      const noteCount = notes.length;
      const measureCount = tabData.measures || Math.ceil(noteCount / 4);
      
      metadataContainer.innerHTML = `
        <div class="grid grid-cols-2 gap-x-4 gap-y-1">
          <div class="font-medium">Title:</div>
          <div>${tabData.title || 'Untitled'}</div>
          
          <div class="font-medium">Artist:</div>
          <div>${tabData.artist || 'Unknown Artist'}</div>
          
          <div class="font-medium">Tuning:</div>
          <div>${tabData.tuning || 'Standard'}</div>
          
          <div class="font-medium">Notes:</div>
          <div>${noteCount} notes in ${measureCount} measures</div>
        </div>
      `;
      
      containerRef.current.insertBefore(metadataContainer, containerRef.current.firstChild);
    }
    
    // Fallback to VexFlow rendering if raw content fails
    function fallbackToVexflow() {
      try {
        renderVexflowTab();
      } catch (err) {
        console.error('Fallback rendering failed:', err);
        renderError(err);
      }
    }
    
    // Function to render using VexFlow
    function renderVexflowTab() {
      try {
        // Ensure valid notes
        const validNotes = Array.isArray(notes) ? notes : [];
        
        if (validNotes.length === 0) {
          setRenderStatus({
            state: 'error',
            step: 'validation',
            message: 'No tab data to render',
            error: 'Missing or empty notes data',
            startTime: null,
            currentNote: null,
            notesProcessed: 0,
            totalNotes: 0
          });
          
          // Show a friendly message in the container
          containerRef.current.innerHTML = `
            <div class="flex flex-col items-center justify-center h-40 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <p>No tab data available to render</p>
            </div>
          `;
          return;
        }
        
        setRenderStatus(prev => ({
          ...prev, 
          step: 'cleared', 
          message: 'Cleared previous content, initializing VexFlow...'
        }));
        
        // Initialize VexFlow renderer
        const { Factory, TabStave, TabNote, Formatter, Beam, Voice, StaveConnector } = Flow;
        setRenderStatus(prev => ({...prev, step: 'factory', message: 'Creating VexFlow renderer...'}));
        
        // Calculate adaptive height based on number of measures
        const totalMeasures = Math.max(Math.ceil(validNotes.length / notesPerMeasure), 
                                      tabData?.measures || 0);
        const totalLines = Math.ceil(totalMeasures / measuresPerLine);
        const adaptiveHeight = Math.max(height, totalLines * 150); // 150px per line minimum
        
        // Create a renderer and context with dynamic settings
        const renderer = new Factory({
          renderer: { elementId: containerRef.current, width, height: adaptiveHeight }
        });
        
        setRenderStatus(prev => ({...prev, step: 'context', message: 'Setting up context...'}));
        const context = renderer.getContext();
        
        // Apply a fixed scale
        context.scale(0.9, 0.9);
        
        // Set background color based on theme
        context.rect(0, 0, width, adaptiveHeight, { fill: darkMode ? '#1a202c' : '#ffffff' });
        context.fill();
        
        setRenderStatus(prev => ({...prev, step: 'stave', message: 'Creating tab staves...'}));
        
        // Create batches of notes for each measure
        const measureBatches = [];
        for (let i = 0; i < validNotes.length; i += notesPerMeasure) {
          measureBatches.push(validNotes.slice(i, i + notesPerMeasure));
        }
        
        // If no measures, provide at least one empty measure
        if (measureBatches.length === 0) {
          measureBatches.push([]);
        }
        
        // Calculate the width of each measure
        const measureWidth = (width / 0.9 - 40) / measuresPerLine;
        
        // Render each line of measures
        let y = 40; // Starting y position
        const lineHeight = 120; // Height between each line of staves
        
        setRenderStatus(prev => ({...prev, step: 'layout', message: 'Laying out multiple measures...'}));
        
        // For each line of measures
        for (let lineIndex = 0; lineIndex < totalLines; lineIndex++) {
          const startMeasure = lineIndex * measuresPerLine;
          const endMeasure = Math.min(startMeasure + measuresPerLine, measureBatches.length);
          
          // For each measure in this line
          for (let m = startMeasure; m < endMeasure; m++) {
            const measureNotes = measureBatches[m];
            const x = 10 + (m - startMeasure) * measureWidth;
            
            // Create a tab stave for this measure
            const tabStave = new TabStave(x, y, measureWidth);
            
            // Add clef and time signature only on the first measure of each line
            if (m === startMeasure) {
              tabStave.addClef('tab');
              if (lineIndex === 0) {
                tabStave.addTimeSignature('4/4');
              }
            }
            
            // Add measure number if enabled
            if (showMeasureNumbers) {
              tabStave.setMeasure(m + 1);
            }
            
            // Add basic elements and draw
            tabStave.setNumLines(6)
              .setContext(context)
              .draw();
            
            // Create tab notes from positions
            const tabNotes = measureNotes.map((noteData) => {
              try {
                return new TabNote({
                  positions: noteData.positions || [{ str: 6, fret: 0 }],
                  duration: noteData.duration || 'q'
                });
              } catch (e) {
                console.error('Error creating tab note:', e, noteData);
                // Return a fallback note if there's an error
                return new TabNote({ 
                  positions: [{ str: 6, fret: 0 }], 
                  duration: 'q' 
                });
              }
            });
            
            // Add extra space if we don't have enough notes for this measure
            if (tabNotes.length < notesPerMeasure) {
              for (let i = tabNotes.length; i < notesPerMeasure; i++) {
                tabNotes.push(new TabNote({ positions: [{ str: 6, fret: 0 }], duration: 'qr' }));
              }
            }
            
            // Format and draw the notes for this measure
            Formatter.FormatAndDraw(context, tabStave, tabNotes);
            
            // Update processing status
            setRenderStatus(prev => ({
              ...prev, 
              message: `Rendered measure ${m + 1} of ${measureBatches.length}...`,
            }));
          }
          
          // Move to the next line
          y += lineHeight;
        }
        
        // Calculate render time
        const endTime = performance.now();
        const renderTime = (endTime - startTime).toFixed(2);
        
        // Add the metadata section with song info
        if (tabData) {
          addMetadataSection();
        }
        
        setRenderStatus({
          state: 'success',
          step: 'complete',
          message: `Rendering complete in ${renderTime}ms`,
          startTime,
          renderTime,
          notesProcessed: validNotes.length,
          totalNotes: validNotes.length
        });
      } catch (err) {
        console.error('Error rendering tab:', err);
        renderError(err);
      }
    }
    
    // Function to display error message
    function renderError(err) {
      setRenderStatus(prev => ({
        ...prev,
        state: 'error',
        step: 'error',
        message: `Error: ${err.message || 'Unknown rendering error'}`,
        error: err
      }));
      
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="p-4 text-red-500">
            <div class="flex items-start mb-2">
              <span class="mr-2 mt-1 flex-shrink-0">⚠️</span>
              <div>
                <p class="font-bold">Tab Rendering Error</p>
                <p>${err.message || 'Unknown error occurred while rendering the tab'}</p>
              </div>
            </div>
            <p class="text-xs mt-2 text-gray-600">Please try a different tab or contact support if this issue persists.</p>
          </div>
        `;
      }
    }
    
  }, [notes, width, height, tabData, showMeasureNumbers, fontSize, stringSpacing, darkMode]);
  
  // Determine classes based on status
  const statusClasses = {
    loading: 'border-l-4 border-blue-500 bg-blue-50 text-blue-700',
    error: 'border-l-4 border-red-500 bg-red-50 text-red-700',
    success: 'border-l-4 border-green-500 bg-green-50 text-green-700',
  }[renderStatus.state];
  
  // Calculate progress percentage
  const progressPercentage = renderStatus.totalNotes 
    ? Math.round((renderStatus.notesProcessed / renderStatus.totalNotes) * 100) 
    : 0;
  
  return (
    <div className="simple-tab-renderer w-full">
      {/* Only show status bar when debugging or on error */}
      {(showDebug || renderStatus.state === 'error') && (
        <div className={`rounded-md mb-3 p-3 ${statusClasses}`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">
                {renderStatus.state === 'loading' ? 'Rendering tab...' : 
                  renderStatus.state === 'error' ? 'Rendering error' : 'Rendering complete'}
              </div>
              <div className="text-sm opacity-80">{renderStatus.message}</div>
            </div>
            {renderStatus.renderTime && (
              <div className="text-sm">
                Rendered in <span className="font-mono">{renderStatus.renderTime}ms</span>
              </div>
            )}
          </div>
          
          {renderStatus.state === 'loading' && (
            <div className="mt-2">
              <div className="bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Tab content container */}
      <div 
        ref={containerRef} 
        className={`w-full rounded-lg overflow-auto ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}
        style={{ 
          minHeight: '200px',
          maxHeight: `${height}px`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
        }}
      ></div>
    </div>
  );
};

export default SimpleTabRenderer; 