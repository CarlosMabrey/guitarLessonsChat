'use client';

import React, { useState } from 'react';
import { FiPlay, FiPause, FiVolume2, FiInfo } from 'react-icons/fi';

const TabRenderer = ({ tabData, className = '' }) => {
  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Parse JSON if it's a string
  const parsedTabData = typeof tabData === 'string' ? 
    (() => {
      try {
        return JSON.parse(tabData);
      } catch (e) {
        console.error('Failed to parse tab JSON:', e);
        return null;
      }
    })() : tabData;

  if (!parsedTabData || !parsedTabData.measures) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="text-red-400 text-sm">
          Unable to parse tab data. Please try uploading the image again.
        </div>
      </div>
    );
  }

  const { title, tempo, tuning, measures } = parsedTabData;

  // String names for display
  const stringNames = ['e', 'B', 'G', 'D', 'A', 'E'];

  // Technique display mapping
  const techniqueSymbols = {
    'h': 'h',
    'p': 'p',
    'b': 'b',
    'b1/2': 'b½',
    'bfull': 'b',
    'b1.5': 'b1½',
    'r': 'r',
    'slide_up': '/',
    'slide_down': '\\',
    'vibrato': '~',
    'mute': 'x',
    'ghost': '()',
    'palm_mute': 'PM',
    'accent': '^',
    'staccato': '.',
    'trill': 'tr'
  };

  // Convert JSON data to traditional tab format with proper horizontal timing
  const renderTraditionalTab = () => {
    if (!measures || measures.length === 0) return null;

    // Create a timeline for each measure showing notes across time
    const renderMeasureTimeline = (measure, measureIndex) => {
      const { notes = [] } = measure;
      
      // Sort notes by position to ensure proper timing
      const sortedNotes = [...notes].sort((a, b) => (a.position || 0) - (b.position || 0));
      
      // Calculate the number of positions in this measure
      const maxPosition = Math.max(...sortedNotes.map(n => n.position || 0), 3); // Minimum 4 positions
      const positions = Array.from({ length: maxPosition + 1 }, (_, i) => i);
      
      // Build tab lines for this measure
      const measureLines = {};
      stringNames.forEach(stringName => {
        measureLines[stringName] = [];
      });
      
      // Fill each position with the appropriate fret or dash
      positions.forEach(position => {
        const noteAtPosition = sortedNotes.find(n => (n.position || 0) === position);
        
        stringNames.forEach(stringName => {
          const stringData = noteAtPosition?.strings?.[stringName];
          
          if (stringData && stringData.fret !== null) {
            const fret = stringData.fret.toString();
            const techniques = stringData.techniques || [];
            
            // Add technique symbols
            let displayValue = fret;
            if (techniques.length > 0) {
              const techSymbol = techniques.map(t => techniqueSymbols[t] || t).join('');
              displayValue = fret + techSymbol;
            }
            
            measureLines[stringName].push(displayValue);
          } else {
            measureLines[stringName].push('-');
          }
        });
      });
      
      return measureLines;
    };

    // Render all measures with proper spacing
    const allMeasureLines = measures.map((measure, index) => 
      renderMeasureTimeline(measure, index)
    );

    return (
      <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
        <div className="font-mono text-sm leading-relaxed whitespace-nowrap">
          {stringNames.map((stringName, stringIndex) => (
            <div key={stringName} className="flex items-center mb-1">
              <span className="text-yellow-400 w-4 text-right mr-2 font-bold">
                {stringName}
              </span>
              <span className="text-gray-500 mr-1">|</span>
              
              {/* Render each measure horizontally */}
              <div className="flex">
                {allMeasureLines.map((measureLines, measureIndex) => (
                  <div key={measureIndex} className="flex">
                    {measureLines[stringName].map((value, positionIndex) => {
                      // Check if this is a fret number with techniques
                      const hasSpecialTechnique = value !== '-' && (value.length > 1 || 
                        ['b', 'h', 'p', '/', '\\', '~'].some(tech => value.includes(tech)));
                      
                      return (
                        <span 
                          key={`${measureIndex}-${positionIndex}`}
                          className={`mx-1 min-w-[3ch] text-center ${
                            hasSpecialTechnique ? 'text-green-400' : 
                            value === '0' ? 'text-blue-300' : 
                            value === '-' ? 'text-gray-600' : 'text-white'
                          }`}
                        >
                          {value}
                        </span>
                      );
                    })}
                    
                    {/* Add measure separator after each measure except the last */}
                    {measureIndex < allMeasureLines.length - 1 && (
                      <span className="text-gray-500 mx-2">|</span>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Final measure bar */}
              <span className="text-gray-500 ml-2">|</span>
            </div>
          ))}
        </div>
        
        {/* Measure information */}
        <div className="mt-4 pt-3 border-t border-gray-600">
          <div className="text-xs text-gray-400">
            <span className="text-blue-300">Measures:</span> {measures.length}
            {measures[0]?.timeSignature && (
              <>
                <span className="ml-4 text-blue-300">Time Signature:</span>
                <span className="ml-1">{measures[0].timeSignature}</span>
              </>
            )}
            <div className="mt-2 text-gray-500">
              Notes flow horizontally within each measure, separated by | bars
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center">
              🎸 Guitar Tab
              {title && <span className="ml-2 text-blue-400">- {title}</span>}
            </h3>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
              {tempo && <span>♩ = {tempo}</span>}
              {tuning && <span>Tuning: {tuning}</span>}
              <span>{measures.length} measure{measures.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <FiInfo size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {renderTraditionalTab()}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Technique Legend:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400">
            <div><span className="text-green-400">h</span> = hammer-on</div>
            <div><span className="text-green-400">p</span> = pull-off</div>
            <div><span className="text-green-400">b</span> = bend</div>
            <div><span className="text-green-400">r</span> = release</div>
            <div><span className="text-green-400">/</span> = slide up</div>
            <div><span className="text-green-400">\</span> = slide down</div>
            <div><span className="text-green-400">~</span> = vibrato</div>
            <div><span className="text-green-400">PM</span> = palm mute</div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Click on measures to see detailed technique information
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabRenderer;
