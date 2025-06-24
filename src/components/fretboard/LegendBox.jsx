import React from 'react';
import { intervalColorMap, getIntervalColors } from '@/lib/intervalColors';

export default function LegendBox({ theme }) {
  // Get exact colors from our intervalColorMap for consistency
  const rootColors = intervalColorMap['1P'];
  const thirdColors = intervalColorMap['3M']; // Using major third
  const fifthColors = intervalColorMap['5P'];
  const seventhColors = intervalColorMap['7m']; // Minor 7th (common in dominant 7th chords)
  const ninthColors = intervalColorMap['9M']; // Major 9th

  return (
    <div className="my-8 w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-5">Legend</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Root note - red */}
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${rootColors.bg} border ${rootColors.border}`}></div>
          <span className="text-white/80">Root Note</span>
        </div>
        
        {/* Third - green */}
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${thirdColors.bg} border ${thirdColors.border}`}></div>
          <span className="text-white/80">Third (3rd)</span>
        </div>
        
        {/* Fifth - blue */}
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${fifthColors.bg} border ${fifthColors.border}`}></div>
          <span className="text-white/80">Fifth (5th)</span>
        </div>
        
        {/* 7th - Yellow (using bg-yellow-500/80 instead of gradient) */}
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${seventhColors.bg} border ${seventhColors.border}`}></div>
          <span className="text-white/80">Seventh (7th)</span>
        </div>
        
        {/* 9th - Purple */}
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${ninthColors.bg} border ${ninthColors.border}`}></div>
          <span className="text-white/80">Ninth (9th)</span>
        </div>
        
        {/* Selected note - blue */}
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/95 to-sky-400/95 border-2 border-blue-300/70 shadow-md"></div>
          <span className="text-white/80">Selected Note</span>
        </div>
        
        {/* Voicing position - purple (from NoteCell.jsx) */}
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600/90 border-2 border-purple-300/60 shadow-md"></div>
          <span className="text-white/80">Voicing Position</span>
        </div>
        
        {/* Unselected note - gray */}
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800/30 border border-gray-700/30"></div>
          <span className="text-white/80">Unselected Note</span>
        </div>
        
        {/* Scale pattern - amber */}
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/50 border border-amber-400/30"></div>
          <span className="text-white/80">Scale Pattern</span>
        </div>
        
        {/* Other intervals - indigo */}
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600/80 to-violet-500/80 border border-indigo-400/30"></div>
          <span className="text-white/80">Other Intervals</span>
        </div>
      </div>
      
      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="text-center text-white/70 text-sm">
          Click on notes to select them • Use the controls to visualize chords and scales • Try the different tabs for more features
        </div>
      </div>
    </div>
  );
}