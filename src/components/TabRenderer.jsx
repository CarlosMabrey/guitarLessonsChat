'use client';

import React from 'react';

// Re-export components from their individual files
export { default as TabRenderer } from './tabs/TabRenderer';
export { default as SimpleTabRenderer } from './tabs/SimpleTabRenderer';

/**
 * Inline Tab Renderer Component
 * This component renders guitar tab notation
 */
export function InlineTabRenderer({ tabData }) {
  // Adding diagnostic info in development mode
  const showDiagnostics = process.env.NODE_ENV === 'development';
  
  // Handle case where no notes are available
  if (!tabData || !tabData.notes || tabData.notes.length === 0) {
    return (
      <div className="text-red-500 p-4 text-center">
        <p>No tab data to render</p>
        {showDiagnostics && tabData && (
          <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 text-left text-xs font-mono">
            <p>Tab data object:</p>
            <pre>{JSON.stringify(tabData, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }
  
  // For Guitar Pro tabs, just show a message
  if (tabData.source?.type === 'ultimate-guitar-gp') {
    return (
      <div className="text-center p-4">
        <p className="text-lg font-bold">Guitar Pro Tab</p>
        <p className="text-sm mb-4">This is a Guitar Pro tab that cannot be rendered directly in the browser.</p>
        <div className="grid grid-cols-6 gap-1 text-sm">
          {/* Just render a placeholder fretboard */}
          {['e','B','G','D','A','E'].map((string, i) => (
            <div key={i} className="flex">
              <div className="w-8 text-right pr-2">{string}</div>
              <div className="flex-1 border-b border-gray-400">
                {[...Array(12)].map((_, j) => (
                  <span key={j} className="inline-block w-6 text-center">
                    {j === 0 || j === 3 || j === 5 || j === 7 || j === 9 ? j : '-'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Render the raw tab content if available - this is more reliable for tabs with complex formatting
  if (tabData.source?.rawContent) {
    // Check if it looks like a properly formatted tab with string indicators
    const hasStringIndicators = tabData.source.rawContent.match(/[eEBGDAa][\s\-]*[|:]/);
    
    if (hasStringIndicators) {
      return (
        <div>
          <pre className="font-mono text-sm overflow-x-auto whitespace-pre">
            {tabData.source.rawContent}
          </pre>
          {showDiagnostics && (
            <div className="mt-4 text-xs text-gray-500">
              <p>Tab has {tabData.notes.length} parsed notes</p>
            </div>
          )}
        </div>
      );
    }
  }
  
  // If we don't have raw content with string indicators, render using our parsed notes
  // Create a simple 6-string grid representation of the tab
  const gridData = createTabGrid(tabData.notes);
  
  return (
    <div>
      <div className="font-mono text-sm overflow-x-auto">
        {Object.entries(gridData).map(([stringNum, positions]) => (
          <div key={stringNum} className="flex whitespace-nowrap">
            <div className="w-4 text-right pr-1 text-gray-600">
              {stringNumToLabel(parseInt(stringNum))}
            </div>
            <div className="border-b border-gray-400">
              |{positions.map((fret, i) => renderPosition(fret))}|
            </div>
          </div>
        ))}
      </div>
      {showDiagnostics && (
        <div className="mt-4 text-xs text-gray-500">
          <p>Using grid renderer with {tabData.notes.length} notes</p>
          <details>
            <summary>View parsed note data</summary>
            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
              {JSON.stringify(tabData.notes.slice(0, 10), null, 2)}
              {tabData.notes.length > 10 ? '...' : ''}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

/**
 * Map string numbers to string labels
 */
function stringNumToLabel(stringNum) {
  const stringLabels = ['e', 'B', 'G', 'D', 'A', 'E'];
  return stringLabels[stringNum - 1] || stringNum;
}

/**
 * Create a grid representation of tab notation from parsed notes
 */
function createTabGrid(notes) {
  const grid = {
    1: [], // e (high)
    2: [], // B
    3: [], // G
    4: [], // D
    5: [], // A
    6: [], // E (low)
  };
  
  // Initialize with dashes for spacing
  const width = Math.min(80, notes.length * 3); // Limit width for display
  for (let string = 1; string <= 6; string++) {
    grid[string] = Array(width).fill('-');
  }
  
  // Place notes on the grid
  let position = 0;
  for (const note of notes) {
    if (!note.positions || position >= width) continue;
    
    for (const pos of note.positions) {
      const { str, fret } = pos;
      if (str >= 1 && str <= 6 && position < width) {
        // Convert fret number to string (or use special symbols for techniques)
        const fretStr = fret.toString();
        
        // Place each digit in the fret number
        for (let i = 0; i < fretStr.length; i++) {
          if (position + i < width) {
            grid[str][position + i] = fretStr[i];
          }
        }
      }
    }
    
    // Move position based on note duration (simplified)
    position += 3; // Fixed spacing between notes for simplified display
  }
  
  return grid;
}

/**
 * Render a position in the tab
 */
function renderPosition(fret) {
  if (fret === '-') return '-';
  return fret;
} 