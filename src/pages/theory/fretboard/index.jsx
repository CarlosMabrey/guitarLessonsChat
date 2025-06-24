// pages/theory/fretboard/index.jsx
import React, { useRef, useEffect, useState } from 'react';
import Head from 'next/head';
import * as Tonal from 'tonal';
import Layout from '@/components/ui/Layout';
import { useTheme } from '@/components/ui/ThemeContext';

// Music theory constants
import { scaleTypes, chordTypes, tunings } from '@/lib/musicTheory';

// Custom hooks
import useFretboardState from '@/hooks/useFretboardState';
import useFretboardAudio from '@/hooks/useFretboardAudio';
import useChordVoicings from '@/hooks/useChordVoicings';

// Components
import HeaderSection from './components/HeaderSection';
import ScaleTuningPanel from './components/ScaleTuningPanel';
import ChordBuilderPanel from './components/ChordBuilderPanel';
import FretboardGrid from './components/FretboardGrid';
import VoicingNavigator from './components/VoicingNavigator';
import DisplaySettings from './components/DisplaySettings';
import ChordPositions from '@/components/fretboard/ChordPositions';
import ScalePatterns from '@/components/fretboard/ScalePatterns';
import ChordProgressions from '@/components/fretboard/ChordProgressions';

function FretboardPage() {
  // Use custom hooks for state and logic
  const {
    // State
    selectedNotes,
    currentTuning,
    chordRoot,
    chordType,
    scaleType,
    showVoicings,
    selectedVoicings,
    currentVoicingIndex,
    detectedChord,
    suggestedScales,
    showOnlyRelevantNotes,
    qualityMode,
    showVoicingOverScale,
    reverseStringOrder,
    showScalePatterns,
    showChordProgressions,
    currentScalePattern,
    patternFretShift,
    strumDirection,
    currentTab,
    singleVoicingMode,
    voicingStringSet,
    voicingFretRange,
    displayDropdownOpen,
    strings,
    frets,
    highlightedNotes,
    intervalMap,
    
    // Setters
    setCurrentTuning,
    setChordRoot,
    setChordType,
    setScaleType,
    setShowVoicings,
    setCurrentVoicingIndex,
    setQualityMode,
    setShowVoicingOverScale,
    setReverseStringOrder,
    setShowScalePatterns,
    setShowChordProgressions,
    setCurrentScalePattern,
    setPatternFretShift,
    setStrumDirection,
    setCurrentTab,
    setSingleVoicingMode,
    setVoicingStringSet,
    setVoicingFretRange,
    setDisplayDropdownOpen,
    
    // Handlers
    toggleNote,
    nextVoicing,
    previousVoicing,
    selectVoicing,
    resetSelections,
    toggleStrumDirection,
  } = useFretboardState();

  // Initialize audio
  const { playNote, playChord } = useFretboardAudio();

  // Get chord voicings
  const { filteredVoicings, getNotesForVoicing } = useChordVoicings(
    chordRoot,
    chordType,
    currentTuning,
    voicingFretRange,
    voicingStringSet
  );

  // Handle play button click
  const handlePlay = () => {
    if (chordType && highlightedNotes.length > 0) {
      playChord(highlightedNotes, strumDirection !== 'none', 2);
    }
  };

  // Handle note click on the fretboard
  const handleNoteClick = (note, stringIndex, fret) => {
    playNote(note);
    toggleNote(note);
  };

  // Update document title based on current selection
  useEffect(() => {
    let title = 'Fretboard';
    if (chordType) {
      title = `${chordRoot}${chordType} - ${title}`;
    } else if (scaleType) {
      // Find the scale name from scaleTypes
      const scaleInfo = scaleTypes.find(s => s.type === scaleType);
      const scaleName = scaleInfo ? scaleInfo.label : scaleType;
      title = `${chordRoot} ${scaleName} - ${title}`;
    }
    document.title = `${title} | Music Theory Tools`;
  }, [chordRoot, chordType, scaleType]);

  // Get the current voicing if in single voicing mode
  const currentVoicing = singleVoicingMode && selectedVoicings.length > currentVoicingIndex 
    ? selectedVoicings[currentVoicingIndex] 
    : null;

  // State to manage sidebar visibility on small screens
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  // Check window width and auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };
    
    // Initial check
    handleResize();
    
    // Listen for window resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-indigo-950 text-white flex flex-col">
      <Layout>
        <div className="flex-1 flex flex-col container mx-auto px-4 py-6">
          <HeaderSection 
            onPlay={handlePlay}
            onReset={resetSelections}
            isPlayDisabled={!chordType && !scaleType}
            className="mb-6"
          />

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6 relative">
            {/* Sidebar Toggle Button - Only visible on mobile/small screens */}
            <div className="md:hidden absolute top-0 right-0 z-10">
              <button 
                onClick={toggleSidebar}
                className="bg-blue-700/50 hover:bg-blue-700/70 text-white rounded-full p-2 flex items-center justify-center"
                aria-label={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
              >
                {sidebarVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Sidebar - Controls */}
            <div className={`lg:col-span-1 transition-all duration-300 ${sidebarVisible ? 'block' : 'hidden md:block'}`}>
              <ScaleTuningPanel
                currentTuning={currentTuning}
                chordRoot={chordRoot}
                scaleType={scaleType}
                onTuningChange={setCurrentTuning}
                onRootChange={setChordRoot}
                onScaleChange={(type) => {
                  setScaleType(type);
                  setChordType('');
                }}
                className="mb-6"
              />

              <ChordBuilderPanel
                chordRoot={chordRoot}
                chordType={chordType}
                selectedVoicings={filteredVoicings}
                currentVoicingIndex={currentVoicingIndex}
                intervalMap={intervalMap}
                onRootChange={setChordRoot}
                onChordTypeChange={(type) => {
                  setChordType(type);
                  setScaleType('');
                }}
                onNextVoicing={nextVoicing}
                onPreviousVoicing={previousVoicing}
                onPlayChord={playChord}
                selectVoicing={selectVoicing}
                className="mb-6"
              />
            </div>

            {/* Main Content - Fretboard */}
            <div className={`lg:col-span-4 flex flex-col h-full overflow-hidden ${!sidebarVisible ? 'col-span-full' : ''}`}>
              {/* Voicing Navigator */}
              {chordType && singleVoicingMode && filteredVoicings.length > 0 && (
                <div className="mb-4">
                  <VoicingNavigator
                    currentIndex={currentVoicingIndex}
                    totalVoicings={filteredVoicings.length}
                    onNext={nextVoicing}
                    onPrevious={previousVoicing}
                    onSelectVoicing={selectVoicing}
                    currentVoicing={filteredVoicings[currentVoicingIndex]}
                    reverseStringOrder={reverseStringOrder}
                  />
                </div>
              )}

              {/* Fretboard Grid */}
              <div className="flex-1 flex flex-col min-h-0 w-full overflow-x-auto">
                <div className="min-w-max w-full">
                  <FretboardGrid
                    strings={strings}
                    frets={frets}
                    highlightedNotes={highlightedNotes}
                    intervalMap={intervalMap}
                    selectedNotes={selectedNotes}
                    onNoteClick={handleNoteClick}
                    showOnlyRelevantNotes={showOnlyRelevantNotes}
                    singleVoicingMode={singleVoicingMode}
                    currentVoicing={currentVoicing}
                    displayMode={scaleType && !chordType ? 'scale' : 'chord'}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Display Settings */}
              <div className="flex justify-end">
                <DisplaySettings
                  reverseStringOrder={reverseStringOrder}
                  showOnlyRelevantNotes={showOnlyRelevantNotes}
                  showVoicingOverScale={showVoicingOverScale}
                  singleVoicingMode={singleVoicingMode}
                  voicingStringSet={voicingStringSet}
                  voicingFretRange={voicingFretRange}
                  onReverseStringOrderChange={setReverseStringOrder}
                  onShowOnlyRelevantNotesChange={setShowVoicings}
                  onShowVoicingOverScaleChange={setShowVoicingOverScale}
                  onSingleVoicingModeChange={setSingleVoicingMode}
                  onVoicingStringSetChange={setVoicingStringSet}
                  onVoicingFretRangeChange={setVoicingFretRange}
                />
              </div>
            </div>
          </div>

          {/* Additional Panels */}
          {chordType && showChordProgressions && (
            <div className="mt-8">
              <ChordProgressions 
                chord={`${chordRoot}${chordType}`} 
                onChordSelect={(chord) => {
                  // Parse chord and update state
                  const parsed = Tonal.Chord.tokenize(chord);
                  if (parsed) {
                    setChordRoot(parsed[0]);
                    setChordType(parsed[1]);
                  }
                }}
              />
            </div>
          )}

          {scaleType && showScalePatterns && (
            <div className="mt-8">
              <ScalePatterns 
                scale={`${chordRoot} ${scaleType}`}
                onPatternSelect={(pattern) => {
                  setCurrentScalePattern(pattern);
                  setPatternFretShift(0);
                }}
              />
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
}

export default FretboardPage;
