import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { Note, Chord } from '@tonaljs/tonal';

// Import the VoicingDisplay component with SSR disabled
const VoicingDisplay = dynamic(
  () => import('@/components/fretboard/VoicingDisplay'),
  { 
    ssr: false, 
    loading: () => <div className="p-4 bg-gray-100 rounded">Loading chord...</div> 
  }
);

/**
 * Wrapper component to display chord diagrams in chat
 */
const ChatChord = ({ 
  chord,           // e.g., 'C', 'Am7'
  notes = [],     // Optional specific notes
  voicing,        // Optional specific voicing
  showInfo = true,
  interactive = false,
  size = 'medium', // 'small' | 'medium' | 'large'
  ...props 
}) => {
  // Parse chord name into root and type if not already provided
  const [root, type] = useMemo(() => {
    if (!chord) return ['C', ''];
    
    // If we have a full chord name like 'Cmaj7'
    if (typeof chord === 'string') {
      // Simple parsing - in a real app, use a proper chord parser
      const match = chord.match(/^([A-Ga-g][#b]?)(.*)/);
      return match ? [match[1].toUpperCase(), match[2] || ''] : ['C', ''];
    }
    
    return [chord.root || 'C', chord.type || ''];
  }, [chord]);
  
  // Generate chord notes if not provided
  const chordNotes = useMemo(() => {
    if (notes && notes.length > 0) return notes;
    
    try {
      const chordObj = Chord.get(type ? `${root}${type}` : root);
      return chordObj.notes || [];
    } catch (e) {
      console.error('Error getting chord notes:', e);
      return [];
    }
  }, [root, type, notes]);
  
  // Convert voicing to the format expected by VoicingDisplay
  const chordVoicing = useMemo(() => {
    if (!voicing) return null;
    
    return {
      name: 'Custom Voicing',
      frets: Array(6).fill('x').map((_, i) => {
        const stringVoicing = voicing.find(v => v.string === (i + 1));
        return stringVoicing ? stringVoicing.fret.toString() : 'x';
      }),
      notes: voicing.map(v => v.note)
    };
  }, [voicing]);
  
  // Size classes
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className={`my-3 ${sizeClasses[size]}`}>
      {showInfo && (
        <div className="font-semibold text-gray-800 mb-1">
          {root}{type} {chordNotes.length > 0 && `(${chordNotes.join(' ')})`}
        </div>
      )}
      
      <div className="relative bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xs">
            <VoicingDisplay
              selectedVoicings={chordVoicing ? [chordVoicing] : []}
              currentVoicingIndex={0}
              chordRoot={root}
              chordType={type}
              chordName={`${root}${type}`}
              isFullView={false}
              size={size}
              showName={false}
              onNextVoicing={() => {}}
              onPreviousVoicing={() => {}}
              playChord={() => {}}
            />
          </div>
          
          {chordNotes.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Notes: {chordNotes.join(', ')}
            </div>
          )}
          
          {voicing && (
            <div className="mt-2 text-xs text-gray-500">
              {voicing.map((v, i) => (
                <div key={i} className="flex items-center">
                  <span className="w-6 text-right mr-2">{['E','A','D','G','B','E'][v.string - 1]}:</span>
                  <span className="px-1">{'-'.repeat(v.fret - 1)}</span>
                  <span className="font-bold">{v.fret}</span>
                  <span className="text-gray-300 ml-1">{v.note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ChatChord.propTypes = {
  chord: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
    root: PropTypes.string,
    type: PropTypes.string,
    notes: PropTypes.arrayOf(PropTypes.string)
  })]),
  notes: PropTypes.arrayOf(PropTypes.string),
  voicing: PropTypes.arrayOf(PropTypes.shape({
    string: PropTypes.number.isRequired,
    fret: PropTypes.number.isRequired,
    note: PropTypes.string
  })),
  showInfo: PropTypes.bool,
  interactive: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

ChatChord.defaultProps = {
  showInfo: true,
  interactive: false,
  size: 'medium'
};

export default ChatChord;
