import React from 'react';

export default function LegendBox({ theme }) {
  return (
    <div className="my-8 w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-5">Legend</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-red-600/80 to-rose-500/80 border border-red-400/30"></div>
          <span className="text-white/80">Root Note</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-600/80 to-emerald-500/80 border border-green-400/30"></div>
          <span className="text-white/80">Third (3rd)</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600/80 to-cyan-500/80 border border-blue-400/30"></div>
          <span className="text-white/80">Fifth (5th)</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600/80 to-violet-500/80 border border-indigo-400/30"></div>
          <span className="text-white/80">Other Intervals</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-300/50 shadow-md"></div>
          <span className="text-white/80">Selected Note</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600/80 border-2 border-purple-300/40 shadow-md"></div>
          <span className="text-white/80">Voicing Position</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/50 border border-amber-400/30"></div>
          <span className="text-white/80">Scale Pattern</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800/30 border border-gray-700/30"></div>
          <span className="text-white/80">Unselected Note</span>
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