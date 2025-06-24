'use client';

import { FiMessageSquare, FiCopy, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import { parseMessageContent } from '@/lib/chat/messageParser';
import clsx from 'clsx';

const MessageBubble = ({ children, isAi, isTyping, timestamp }) => {
  // Format the timestamp if provided
  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : null;

  return (
    <div className="relative group">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={clsx(
          'inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed relative',
          isAi 
            ? 'bg-card-hover/70 text-text-primary rounded-tl-none' 
            : 'bg-primary/15 text-text-primary rounded-tr-none',
          isTyping ? 'min-w-[100px]' : 'max-w-[90%] md:max-w-[80%]',
          'shadow-sm hover:shadow transition-shadow duration-200'
        )}
      >
        {isTyping ? (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-text-secondary">Typing...</span>
          </div>
        ) : (
          <>
            {children}
            {formattedTime && (
              <div className={clsx(
                'text-[10px] mt-1 opacity-0 group-hover:opacity-70 transition-opacity duration-200',
                isAi ? 'text-left' : 'text-right'
              )}>
                {formattedTime}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

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

// Component to render chord diagrams
const ChordDiagram = ({ chord }) => {
  if (!chord) return null;

  // Default to standard tuning if not specified
  const tuning = chord.tuning || ['E', 'A', 'D', 'G', 'B', 'E'];
  const strings = tuning.length;
  const frets = chord.frets || [];
  const fingers = chord.fingers || [];
  const barres = chord.barres || [];
  const notes = chord.notes || [];

  // Calculate the number of frets to display
  const maxFret = Math.max(...frets.filter(f => f !== 0), 4) + 1;
  const minFret = Math.min(...frets.filter(f => f > 0), 1);
  const showNut = minFret === 1;

  return (
    <div className="my-4 p-4 bg-card-hover/20 rounded-xl border border-card-hover/30">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-text-primary">{chord.name || 'Chord'}</h4>
          {chord.description && (
            <p className="text-sm text-text-secondary mt-1">{chord.description}</p>
          )}
        </div>
        {chord.quality && (
          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
            {chord.quality}
          </span>
        )}
      </div>
      
      <div className="mt-3 flex items-start">
        {/* Fretboard */}
        <div className="relative">
          {/* Nut or position marker */}
          {showNut ? (
            <div className="h-1 bg-gray-300 mb-1 w-full"></div>
          ) : (
            <div className="h-6 flex items-center justify-center mb-1">
              <span className="text-xs font-mono text-text-tertiary">{minFret}fr</span>
            </div>
          )}
          
          {/* Strings */}
          <div className="flex">
            {Array.from({ length: strings }).map((_, stringIndex) => {
              const fret = frets[stringIndex] || 0;
              const finger = fingers[stringIndex] || '';
              const isOpen = fret === 0;
              const isMuted = fret === -1;
              const isBarre = barres.some(b => b.fromString <= stringIndex && b.toString >= stringIndex);
              
              return (
                <div key={stringIndex} className="flex flex-col items-center">
                  {/* String */}
                  <div className="w-8 h-6 flex items-center justify-center">
                    {isMuted ? (
                      <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                        <div className="w-3 h-0.5 bg-red-500 rotate-45"></div>
                      </div>
                    ) : isOpen ? (
                      <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">O</span>
                      </div>
                    ) : (
                      <div className={clsx(
                        'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                        isBarre ? 'bg-primary/90 text-white' : 'bg-primary/80 text-white',
                        'shadow-md'
                      )}>
                        {finger}
                      </div>
                    )}
                  </div>
                  
                  {/* Fret markers */}
                  <div className="w-8 h-6 border border-card-hover/30 flex items-center justify-center">
                    {fret > 0 && !isMuted && (
                      <span className="text-xs text-text-secondary">{fret}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Fret numbers */}
          <div className="flex justify-between mt-1">
            {Array.from({ length: strings }).map((_, i) => (
              <div key={i} className="w-8 text-center">
                <span className="text-[10px] text-text-tertiary">{tuning[i]}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Chord details */}
        <div className="ml-6 text-sm">
          {fingers.some(f => f) && (
            <div className="mb-2">
              <div className="font-medium text-text-secondary">Fingers:</div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {fingers.map((f, i) => (
                  f && (
                    <div key={i} className="flex items-center">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium mr-2">
                        {f}
                      </span>
                      <span>String {strings - i}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          
          {notes.length > 0 && (
            <div>
              <div className="font-medium text-text-secondary">Notes:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {notes.map((note, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-card-hover/30 text-xs">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {chord.diagram && (
        <div className="mt-3 p-3 bg-card-hover/10 rounded-lg text-xs font-mono whitespace-pre-wrap">
          {chord.diagram}
        </div>
      )}
    </div>
  );
};

// Component to render scale diagrams
const ScaleDiagram = ({ scale }) => {
  if (!scale) return null;

  const tuning = scale.tuning || ['E', 'A', 'D', 'G', 'B', 'E'];
  const strings = tuning.length;
  const positions = scale.positions || [];
  const notes = scale.notes || [];
  const intervals = scale.intervals || [];

  // Calculate frets to display
  const allFrets = positions.flatMap(pos => Object.values(pos.notes || {}));
  const minFret = Math.min(...allFrets.filter(f => f > 0), 1);
  const maxFret = Math.max(...allFrets, 5) + 1;
  const showNut = minFret === 1;

  return (
    <div className="my-4 p-4 bg-card-hover/10 rounded-xl border border-card-hover/30">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-text-primary">{scale.name || 'Scale'}</h4>
          {scale.description && (
            <p className="text-sm text-text-secondary mt-1">{scale.description}</p>
          )}
        </div>
        {scale.type && (
          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
            {scale.type}
          </span>
        )}
      </div>

      {/* Scale notes */}
      {notes.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center flex-wrap gap-2">
            {notes.map((note, i) => (
              <div key={i} className="relative group">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                  {note}
                </div>
                {intervals[i] && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                    {intervals[i]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fretboard visualization */}
      <div className="mt-4">
        <div className="text-xs font-medium text-text-secondary mb-2">Positions:</div>
        <div className="space-y-4">
          {positions.map((pos, posIdx) => (
            <div key={posIdx} className="bg-card/30 p-3 rounded-lg">
              <div className="font-medium text-sm text-text-secondary mb-2">
                Position {pos.position}
                {pos.fret && ` (Fret ${pos.fret})`}
              </div>
              
              <div className="flex items-start">
                {/* Fretboard */}
                <div className="relative">
                  {/* Nut or position marker */}
                  {showNut ? (
                    <div className="h-1 bg-gray-300 mb-1 w-full"></div>
                  ) : (
                    <div className="h-6 flex items-center justify-center mb-1">
                      <span className="text-xs font-mono text-text-tertiary">{minFret}fr</span>
                    </div>
                  )}
                  
                  {/* Strings */}
                  <div className="flex">
                    {Array.from({ length: strings }).map((_, stringIdx) => {
                      const fret = pos.notes?.[stringIdx] || 0;
                      const isRoot = pos.rootString === stringIdx;
                      const isMuted = fret === -1;
                      
                      return (
                        <div key={stringIdx} className="flex flex-col items-center">
                          {/* String */}
                          <div className="w-8 h-6 flex items-center justify-center">
                            {isMuted ? (
                              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                                <div className="w-3 h-0.5 bg-red-500 rotate-45"></div>
                              </div>
                            ) : fret > 0 ? (
                              <div className={clsx(
                                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                                isRoot 
                                  ? 'bg-primary text-white ring-2 ring-primary/30' 
                                  : 'bg-card-hover/80 text-text-primary',
                                'shadow-md'
                              )}>
                                {fret}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Fret numbers */}
                  <div className="flex justify-between mt-1">
                    {Array.from({ length: strings }).map((_, i) => (
                      <div key={i} className="w-8 text-center">
                        <span className="text-[10px] text-text-tertiary">{tuning[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Position notes */}
                <div className="ml-6 flex-1">
                  <div className="text-sm">
                    <div className="font-medium text-text-secondary mb-1">Notes:</div>
                    <div className="flex flex-wrap gap-1">
                      {pos.notesArray?.map((note, i) => (
                        <span 
                          key={i} 
                          className={clsx(
                            'px-2 py-0.5 rounded text-xs',
                            pos.rootNote === note 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'bg-card-hover/30 text-text-secondary'
                          )}
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Additional scale information */}
      <div className="mt-4 pt-3 border-t border-card-hover/20">
        <div className="grid grid-cols-2 gap-4">
          {scale.formula && (
            <div>
              <div className="text-xs font-medium text-text-secondary mb-1">Formula:</div>
              <div className="text-sm">{scale.formula}</div>
            </div>
          )}
          {scale.chords && scale.chords.length > 0 && (
            <div>
              <div className="text-xs font-medium text-text-secondary mb-1">Chords in this scale:</div>
              <div className="flex flex-wrap gap-1">
                {scale.chords.map((chord, i) => (
                  <span key={i} className="px-2 py-0.5 bg-card-hover/30 text-xs rounded">
                    {chord}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const TabViewer = ({ tab }) => {
  if (!tab) return null;
  
  // Parse tab content into lines
  const lines = tab.content?.split('\n') || [];
  const hasMultipleLines = lines.length > 1;
  
  // Check if this is standard guitar tab (6 strings)
  const isGuitarTab = lines.length >= 4 && lines.length <= 7; // 6 strings + optional caption
  
  // Highlight the active note/string being played
  const highlightActiveNote = (line, index) => {
    if (!isGuitarTab) return line;
    
    // Simple highlighting - in a real app, you'd track the current position
    return line.replace(/(\d+)/g, (match) => {
      return `<span class="text-primary font-bold">${match}</span>`;
    });
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
      <div className={clsx(
        'p-4 font-mono text-sm whitespace-pre select-text',
        'overflow-x-auto scrollbar-thin scrollbar-thumb-card-hover/30 scrollbar-track-transparent',
        isGuitarTab ? 'leading-7' : 'leading-relaxed'
      )}>
        {lines.map((line, i) => {
          // Only process tab lines (skip empty lines or section headers)
          if (line.trim() === '' || line.trim().startsWith('|') || line.trim().startsWith('e|') || line.trim().startsWith('B|') || line.trim().startsWith('G|') || line.trim().startsWith('D|') || line.trim().startsWith('A|') || line.trim().startsWith('E|')) {
            return (
              <div 
                key={i} 
                className={clsx(
                  'font-mono whitespace-pre',
                  isGuitarTab ? 'text-xs tracking-wider' : 'text-sm',
                  'text-text-primary/90',
                  hasMultipleLines && i < lines.length - 1 ? 'mb-0.5' : ''
                )}
                dangerouslySetInnerHTML={{ __html: line }}
              />
            );
          }
          
          // Process tab lines with note highlighting
          return (
            <div 
              key={i}
              className={clsx(
                'font-mono whitespace-pre',
                isGuitarTab ? 'text-xs tracking-wider' : 'text-sm',
                'text-text-primary/90',
                hasMultipleLines && i < lines.length - 1 ? 'mb-0.5' : ''
              )}
              dangerouslySetInnerHTML={{ __html: highlightActiveNote(line, i) }}
            />
          );
        })}
      </div>
      
      {/* Tab footer */}
      {(tab.bpm || tab.caption) && (
        <div className="px-4 py-2 text-xs text-text-secondary border-t border-card-hover/20 bg-card-hover/5">
          <div className="flex items-center justify-between">
            {tab.bpm && (
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{tab.bpm} BPM</span>
              </div>
            )}
            {tab.caption && <div className="text-right">{tab.caption}</div>}
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

  // If content is an object with both text and blocks
  if (content.text || content.blocks) {
    return (
      <div className="space-y-4">
        {/* Only render text if it’s not repeated in a block */}
        {content.blocks?.length === 0 && content.text && (
          <MarkdownContent content={content.text} />
        )}
        {content.blocks?.map((block, index) => {
          switch (block?.type) {
            case 'chord':
              return <ChordDiagram key={index} chord={block} />;
            case 'scale':
              return <ScaleDiagram key={index} scale={block} />;
            case 'tab':
              return <TabViewer key={index} tab={block.content || block} />;
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
  // Parse the message content
  const parsedContent = parseMessageContent(message.content);
  const isAi = message.sender === 'ai';
  
  return (
    <div className={clsx(
      'mb-4 last:mb-0 group',
      isAi ? 'pr-4' : 'pl-4',
      isTyping && 'opacity-90'
    )}>
      <div className={clsx(
        'flex gap-2',
        isAi ? 'flex-row' : 'flex-row-reverse'
      )}>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card-hover/30 flex items-center justify-center mt-1">
          {isAi ? (
            <FiMessageSquare className="text-primary" size={16} />
          ) : (
            <span className="text-sm font-medium text-text-primary">You</span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={clsx(
            'flex items-center mb-1',
            isAi ? 'justify-start' : 'justify-end'
          )}>
            {isAi && (
              <span className="text-xs font-medium text-text-secondary">
                Guitar Coach AI
              </span>
            )}
            <span className="text-xs text-text-tertiary ml-2">
              {new Date(message.timestamp || new Date()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <MessageBubble 
            isAi={isAi} 
            isTyping={isTyping && isAi}
            timestamp={message.timestamp}
          >
            <RenderedContent content={parsedContent} />
          </MessageBubble>
        </div>
      </div>
    </div>
  );
}
