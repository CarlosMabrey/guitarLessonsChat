'use client';

import React from 'react';

/**
 * RawTabRenderer - Displays raw tab content in pre-formatted text
 * This is used when we have tab content but can't convert it to VexFlow notes
 */
const RawTabRenderer = ({ 
  content, 
  maxHeight = '400px', 
  className = '' 
}) => {
  if (!content) {
    return (
      <div className="text-center p-4 text-gray-500">
        No tab content available
      </div>
    );
  }
  
  // Format tab content
  const formattedContent = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
  
  return (
    <div className={`raw-tab-container font-mono bg-card-hover rounded-md relative overflow-hidden ${className}`}>
      <pre 
        className="text-sm p-4 whitespace-pre-wrap overflow-auto" 
        style={{ maxHeight }}
      >
        {formattedContent}
      </pre>
    </div>
  );
};

export default RawTabRenderer; 