'use client';

import { useState } from 'react';

// Basic chord diagram component
export default function ChordDiagram({ chord, size = 'md', className = '', onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine the size class
  const sizeClass = size === 'sm' 
    ? 'w-16 h-16 text-xs' 
    : size === 'lg' 
      ? 'w-28 h-28 text-base' 
      : 'w-20 h-20 text-sm';
  
  // Generate a simplified chord diagram visualization
  const renderChordDiagram = () => {
    // This is a placeholder - in a real app, you'd use a library
    // or more complex logic to render actual chord diagrams
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="font-bold mb-1">{chord}</div>
        <div className="grid grid-cols-4 gap-0.5">
          {Array(8).fill(null).map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full ${
                Math.random() > 0.7 ? 'bg-primary' : 'bg-card-hover'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`relative border border-border rounded-md bg-card ${sizeClass} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {renderChordDiagram()}
      
      {/* Optional hover effect */}
      {isHovered && onClick && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-md">
          <span className="text-xs font-medium">View</span>
        </div>
      )}
    </div>
  );
} 