'use client';

import { FiMessageSquare, FiCopy, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import { parseMessageContent } from '@/lib/chat/messageParser';
import clsx from 'clsx';
import { FretboardDiagram } from './FretboardDiagram';
import { ChordDiagram } from './ChordDiagram';
import { ScaleDiagram } from './ScaleDiagram';
import MessageBubble from './MessageBubble';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import TabFretboardVisualizer from './TabFretboardVisualizer';



const MarkdownContent = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, inline, className, children, ...props}) {
            return !inline ? (
              <div className="relative group">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyToClipboard(String(children))}
                    className="p-1 rounded bg-card/80 hover:bg-card-hover/50 transition-colors"
                    title="Copy code"
                  >
                    {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                  </button>
                </div>
                <code className={className} {...props}>
                  {children}
                </code>
              </div>
            ) : (
              <code className="bg-card-hover/50 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            );
          },
          a: ({node, ...props}) => (
            <a 
              {...props} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            />
          ),
          blockquote: ({node, ...props}) => (
            <blockquote 
              className="border-l-4 border-primary/30 pl-4 my-2 text-text-secondary italic"
              {...props} 
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};


const TabViewer = ({ tab }) => {
  if (!tab) return null;
  
  // State for player functionality
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [showFretboard, setShowFretboard] = useState(false);
  
  // Reference for animation frame
  const animationRef = React.useRef(null);
  const tabContainerRef = React.useRef(null);
  
  // Parse tab content into lines - handle different possible formats
  let lines = [];
  
  if (Array.isArray(tab.content)) {
    lines = tab.content;
  } else if (typeof tab.content === 'string') {
    lines = tab.content.split('\n');
  } else if (typeof tab === 'string') {
    lines = tab.split('\n');
  } else {
    console.log('Tab data format:', tab);
    return <div className="text-red-500">Error: Invalid tab format</div>;
  }
  
  // Filter out empty lines and trim whitespace
  lines = lines.map(line => line?.trim()).filter(Boolean);
  const hasMultipleLines = lines.length > 1;
  
  // Check if this is standard guitar tab (typically 4-6 strings)
  const isGuitarTab = lines.length >= 4 && lines.length <= 7; // 4-6 strings + optional caption
  
  // Get the maximum line length for position calculation
  const maxLineLength = Math.max(...lines.map(line => line.length), 0);
  
  // Clean tab line - remove any markdown artifacts
  const cleanTabLine = (line) => {
    if (!line) return '';
    return line.replace(/^```(?:tab)?\s*|```$/g, '').trim();
  };
  
  // Function to toggle play/pause
  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };
  
  // Function to toggle loop
  const toggleLoop = () => {
    setIsLooping(prev => !prev);
  };
  
  // Function to handle speed change
  const handleSpeedChange = (e) => {
    setPlaybackSpeed(parseFloat(e.target.value));
  };
  
  // Animation function for playback
  React.useEffect(() => {
    let lastTime = 0;
    const fps = 60;
    const frameDuration = 1000 / fps;
    
    // Find the notes in the tab to determine playback speed
    const noteCount = lines.reduce((count, line) => {
      const matches = line.match(/\d+/g);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    // Adjust speed based on note density
    const baseSpeed = 0.05;
    const speedMultiplier = Math.max(1, Math.min(2, noteCount / 20)); // More notes = faster playback
    const adjustedSpeed = baseSpeed * speedMultiplier;
    
    const animate = (time) => {
      if (!lastTime) lastTime = time;
      const elapsed = time - lastTime;
      
      if (elapsed > frameDuration) {
        lastTime = time;
        
        // Move position based on speed
        setCurrentPosition(prevPos => {
          const newPos = prevPos + (adjustedSpeed * playbackSpeed);
          
          // Handle looping or stopping at the end
          if (newPos >= maxLineLength) {
            if (isLooping) {
              return 0; // Loop back to start
            } else {
              setIsPlaying(false); // Stop playing
              return 0; // Reset to start
            }
          }
          
          return newPos;
        });
      }
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, isLooping, maxLineLength]);
  
  // Enhanced highlighting with different colors for techniques and current position
  const enhancedHighlighting = (line) => {
    if (!line) return line;
    
    // Create React elements for highlighting instead of HTML strings
    const parts = [];
    let lastIndex = 0;
    let key = 0;
    
    // Helper function to add text with optional styling
    const addPart = (text, className = null) => {
      if (text) {
        if (className) {
          parts.push(<span key={key++} className={className}>{text}</span>);
        } else {
          parts.push(text);
        }
      }
    };
    
    // Process fret numbers
    const fretRegex = /(\d+)/g;
    let match;
    
    // Reset regex lastIndex
    fretRegex.lastIndex = 0;
    
    while ((match = fretRegex.exec(line)) !== null) {
      // Add text before the match
      addPart(line.substring(lastIndex, match.index));
      // Add the matched fret number with styling
      addPart(match[1], "text-primary font-bold");
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    let remainingText = line.substring(lastIndex);
    
    // Process techniques in the remaining text
    const techRegex = /([hpbr\/\\^~])/g;
    lastIndex = 0;
    
    // Create a new array for the processed remaining text
    const processedRemaining = [];
    
    // Reset regex lastIndex
    techRegex.lastIndex = 0;
    
    while ((match = techRegex.exec(remainingText)) !== null) {
      // Add text before the match
      processedRemaining.push(remainingText.substring(lastIndex, match.index));
      // Add the matched technique with styling
      processedRemaining.push(<span key={key++} className="text-amber-500 font-semibold">{match[1]}</span>);
      lastIndex = match.index + match[0].length;
    }
    
    // Add any final remaining text
    processedRemaining.push(remainingText.substring(lastIndex));
    
    // Add the processed remaining text to parts
    parts.push(...processedRemaining);
    
    return <>{parts}</>;
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-card-hover/30 bg-card/50">
      {/* Tab header */}
      <div className="flex items-center justify-between bg-card-hover/20 px-4 py-2">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <span className="text-sm font-medium text-text-primary">Guitar Tab</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded hover:bg-card-hover/30 text-text-secondary hover:text-text-primary" title="Play">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button className="p-1 rounded hover:bg-card-hover/30 text-text-secondary hover:text-text-primary" title="Loop">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="p-1 rounded hover:bg-card-hover/30 text-text-secondary hover:text-text-primary" title="Settings">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      <div 
        ref={tabContainerRef}
        className={clsx(
          'p-4 font-mono text-sm whitespace-pre select-text',
          'overflow-x-auto scrollbar-thin scrollbar-thumb-card-hover/30 scrollbar-track-transparent',
          'relative', // For position indicator
          isGuitarTab ? 'leading-7' : 'leading-relaxed'
        )}
      >
        {/* Position indicator - vertical line that moves across the tab */}
        {isPlaying && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-primary/50 pointer-events-none z-10"
            style={{
              left: `calc(${Math.min(currentPosition / maxLineLength * 100, 100)}% + 1rem)`,
              transition: 'left 0.1s linear'
            }}
          />
        )}
        {/* String labels legend */}
        <div className="mb-2 flex justify-between text-xs text-text-secondary">
          <div>Standard Tuning: E A D G B e</div>
          <div className="flex space-x-2">
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-primary/20 mr-1"></span>
              Notes
            </span>
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-500/20 mr-1"></span>
              Techniques
            </span>
          </div>
        </div>
        
        {lines.map((line, i) => {
          // Clean the line first
          const cleanedLine = cleanTabLine(line);
          if (!cleanedLine) return null;
          
          // Check if this is a string line (e|, B|, G|, etc.) or any line with a pipe character
          // More permissive regex to match various tab formats
          const isTabLine = /^[A-Za-z0-9]+\|/.test(cleanedLine) || 
                          /^[eEBbGgDdAaEe][-|]/.test(cleanedLine);
          
          // Determine which string this is (e, B, G, D, A, E) for styling
          let stringColor = '';
          if (isTabLine) {
            const stringMatch = cleanedLine.match(/^([eEBbGgDdAaEe])/)?.[1]?.toLowerCase();
            switch(stringMatch) {
              case 'e': stringColor = ''; break;
              case 'b': stringColor = ''; break;
              case 'g': stringColor = ''; break;
              case 'd': stringColor = ''; break;
              case 'a': stringColor = ''; break;
              default: stringColor = '';
            }
          }
          
          // Use the enhancedHighlighting function defined earlier
          
          return (
            <div 
              key={i}
              className={clsx(
                'font-mono whitespace-pre rounded px-1',
                isGuitarTab ? 'text-xs tracking-wider' : 'text-sm',
                'text-text-primary/90',
                hasMultipleLines && i < lines.length - 1 ? 'mb-0.5' : '',
                stringColor
              )}
            >
              {isTabLine ? enhancedHighlighting(cleanedLine) : cleanedLine}
            </div>
          );
        })}
      </div>
      
      {/* Interactive controls */}
      <div className="px-4 py-3 border-t border-card-hover/20 bg-card-hover/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Play/Pause button */}
            <button 
              onClick={togglePlay}
              className={clsx(
                'p-1.5 rounded-full transition-colors',
                isPlaying 
                  ? 'bg-primary/20 hover:bg-primary/30 text-primary' 
                  : 'bg-primary/10 hover:bg-primary/20 text-primary'
              )}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            
            {/* Loop button */}
            <button 
              onClick={toggleLoop}
              className={clsx(
                'p-1.5 rounded-full transition-colors',
                isLooping 
                  ? 'bg-primary/20 hover:bg-primary/30 text-primary' 
                  : 'bg-card-hover/10 hover:bg-card-hover/20 text-text-secondary hover:text-text-primary'
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            {/* Speed control */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-text-secondary">Speed:</span>
              <select 
                value={playbackSpeed}
                onChange={handleSpeedChange}
                className="bg-card-hover/10 text-text-primary text-xs rounded px-1 py-0.5 border border-card-hover/20"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Show on fretboard button */}
            <button 
              onClick={() => setShowFretboard(prev => !prev)}
              className={clsx(
                "flex items-center space-x-1 text-xs transition-colors",
                showFretboard ? "text-primary" : "text-text-secondary hover:text-primary"
              )}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>{showFretboard ? "Hide fretboard" : "Show on fretboard"}</span>
            </button>
            
            {/* BPM display if available */}
            {tab.bpm && (
              <div className="flex items-center text-xs text-text-secondary">
                <svg className="w-3 h-3 mr-1 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{tab.bpm} BPM</span>
              </div>
            )}
            
            {/* Caption if available */}
            {tab.caption && <div className="text-xs text-text-secondary">{tab.caption}</div>}
          </div>
        </div>
      </div>
      
      {/* Fretboard visualization */}
      {showFretboard && (
        <div className="border-t border-card-hover/20">
          <div className="p-4">
            <h4 className="text-sm font-medium text-text-primary mb-2">Fretboard Visualization</h4>
            <TabFretboardVisualizer 
              tabContent={lines} 
              currentPosition={currentPosition / maxLineLength}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Component to render fretboard visualizations
const FretboardViewer = ({ fretboard }) => {
  if (!fretboard) return null;
  
  return (
    <div className="my-4 p-4 bg-card-hover/10 rounded-lg border border-card-hover/20">
      <div className="font-semibold text-primary mb-2">Fretboard</div>
      <div className="text-sm text-text-secondary mb-3">
        Frets: {fretboard.frets}, Strings: {fretboard.strings}
      </div>
      <div className="space-y-1">
        {fretboard.notes?.map((string, i) => (
          <div key={i} className="flex items-center text-sm">
            <span className="w-6 text-text-secondary">{i + 1}</span>
            <div className="flex-1 bg-card-hover/5 p-1 rounded">
              {string.frets?.join(' ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to clean and render unknown content
const renderUnknownContent = (content) => {
  try {
    // If it's a string that looks like JSON, try to parse it
    if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        // If it's a recognized structure, try to render it
        if (parsed.type === 'chord') return <ChordDiagram chord={parsed} />;
        if (parsed.type === 'scale') return <ScaleDiagram scale={parsed} />;
        if (parsed.type === 'tab') return <TabViewer tab={parsed.content} />;
        if (parsed.type === 'fretboard') return <FretboardViewer fretboard={parsed} />;
        
        // If it's a known format but not handled above, show a clean error
        return (
          <div className="my-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
            <div className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">Unhandled content format</div>
            <pre className="mt-1 text-xs text-yellow-700 dark:text-yellow-300 opacity-80 overflow-x-auto">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </div>
        );
      }
    }
    
    // If it's a regular string, render as markdown
    return <MarkdownContent content={content} />;
  } catch (e) {
    // If parsing fails, just render the original content as markdown
    return <MarkdownContent content={content} />;
  }
};

// Helper component to render parsed content blocks
const RenderedContent = ({ content }) => {
  if (!content) return null;

  // If content is a string, just render as markdown
  if (typeof content === 'string') {
    return <MarkdownContent content={content} />;
  }

  // Helper to group consecutive chord blocks
  function groupBlocks(blocks) {
    const grouped = [];
    let i = 0;
    while (i < blocks.length) {
      if (blocks[i]?.type === 'chord') {
        // Start a group of chords
        const chordGroup = [];
        while (i < blocks.length && blocks[i]?.type === 'chord') {
          chordGroup.push(blocks[i]);
          i++;
        }
        grouped.push({ type: 'chordGroup', chords: chordGroup });
      } else {
        grouped.push(blocks[i]);
        i++;
      }
    }
    return grouped;
  }

  // If content is an object with both text and blocks
  if (content.text || content.blocks) {
    const groupedBlocks = groupBlocks(content.blocks || []);
    return (
      <div className="space-y-5">
        {/* Only render text if it’s not repeated in a block */}
        {groupedBlocks.length === 0 && content.text && (
          <MarkdownContent content={content.text} />
        )}
        {groupedBlocks.map((block, index) => {
          if (block?.type === 'chordGroup') {
            return (
              <div key={index} className="flex flex-wrap gap-6 justify-start items-start overflow-x-auto pb-2 -mx-2">
                {block.chords.map((chord, idx) => (
                  <div key={idx} className="min-w-[180px] max-w-[220px] flex-shrink-0">
                    <ChordDiagram chord={chord} />
                  </div>
                ))}
              </div>
            );
          }
          switch (block?.type) {
            case 'header':
              if (block.level === 2) {
                return (
                  <h2 key={index} className="text-xl font-bold mt-6 mb-2 text-primary">
                    {block.content}
                  </h2>
                );
              }
              if (block.level === 3) {
                return (
                  <h3 key={index} className="text-lg font-semibold mt-5 mb-1 text-primary/90">
                    {block.content}
                  </h3>
                );
              }
              return (
                <div key={index} className="font-semibold mt-4 mb-1 text-primary/80">
                  {block.content}
                </div>
              );
            case 'hr':
              return <hr key={index} className="my-4 border-t border-primary/20" />;
            case 'section':
              return (
                <section key={index} className="bg-card/60 rounded-lg p-4 border border-primary/10 mb-2">
                  <div className="font-semibold text-primary mb-2">
                    {block.title}
                  </div>
                  <MarkdownContent content={block.lines.join('\n')} />
                </section>
              );
            case 'tip':
              return (
                <div key={index} className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 rounded px-3 py-2 border-l-4 border-yellow-400 mb-2">
                  <span className="text-xl select-none">{block.content[0]}</span>
                  <span className="text-sm"><MarkdownContent content={block.content.slice(2)} /></span>
                </div>
              );
            case 'chord':
              // Should not be reached, as chords are grouped
              return null;
            case 'scale':
              return <ScaleDiagram key={index} scale={block} />;
            case 'tab':
              return <TabViewer key={index} tab={block} />;
            case 'fretboard':
              return <FretboardViewer key={index} fretboard={block} />;
            case 'text':
              return block.content ? <MarkdownContent key={index} content={block.content} /> : null;
            default:
              return renderUnknownContent(block);
          }
        })}
      </div>
    );
  }

  return renderUnknownContent(content);
};

export default function MessageRenderer({ message, isTyping = false }) {
  try {
    // Special case: render image messages
    if (message.type === 'image') {
      const isUploading = message.status === 'uploading';
      const isError = message.status === 'error' || message.isError;
      // Use tempUrl as a fallback if url/previewUrl are missing
      const imageUrl = message.url || message.previewUrl || message.tempUrl;
      return (
        <div className={clsx(
          'mb-4 last:mb-0 group',
          isTyping && 'opacity-90',
          isError && 'opacity-70'
        )}>
          <div className={clsx(
            'relative flex flex-col items-start',
            isUploading && 'opacity-60 pointer-events-none',
            isError && 'border border-red-400 bg-red-50'
          )}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Uploaded preview"
                className="rounded-lg max-w-xs max-h-60 shadow"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                  e.target.style.display = 'none';
                  const fallback = e.target.nextSibling;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
            ) : null}
            {/* Show placeholder if no imageUrl or if image fails to load */}
            {(!imageUrl || isError) && (
              <div
                style={{
                  display: imageUrl ? 'none' : 'block',
                  width: '220px',
                  height: '160px',
                  background: 'repeating-linear-gradient(45deg,#eee,#eee 10px,#ddd 10px,#ddd 20px)',
                  borderRadius: '0.75rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c00',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '0.5rem',
                }}
              >
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#c00" style={{marginBottom:'0.5rem'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                </svg>
                <span>Image not available</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    const parsedContent = parseMessageContent(message.content);
    const isAi = message.sender === 'ai';
    return (
      <div className={clsx(
        'mb-4 last:mb-0 group',
        isTyping && 'opacity-90'
      )}>
        <div className={clsx(
          'flex',
          isAi ? 'justify-start' : 'justify-end'
        )}>
          {isAi && (
            <div className="flex items-center self-start mt-1 mr-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <FiMessageSquare className="text-white" size={18} />
              </div>
            </div>
          )}
          
          <div className="flex-1 max-w-[90%] md:max-w-[75%]">
            {isAi && (
              <div className="flex items-center mb-1">
                <span className="text-xs font-semibold text-text-primary">
                  Guitar Coach AI
                </span>
                <span className="text-xs text-text-tertiary ml-2">
                  {new Date(message.timestamp || new Date()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            
            <MessageBubble 
              isAi={isAi} 
              isTyping={isTyping && isAi}
              timestamp={message.timestamp}
            >
              <RenderedContent content={parsedContent} />
            </MessageBubble>
          </div>
          
          {!isAi && (
            <div className="flex items-center self-start mt-1 ml-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card-hover/70 flex items-center justify-center">
                <span className="text-sm font-medium text-text-primary">You</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (err) {
    console.error('MessageRenderer error:', err);
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <strong>MessageRenderer Error:</strong> {String(err)}
      </div>
    );
  }
}

