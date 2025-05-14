// pages/theory/fretboard/index.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Layout from '../../../components/ui/Layout';
import * as Tonal from 'tonal';
import NoteCell from '../../../components/fretboard/NoteCell';
import LegendBox from '../../../components/fretboard/LegendBox';
import VoicingDisplay from '../../../components/fretboard/VoicingDisplay';
import ChordPositions from '../../../components/fretboard/ChordPositions';
import ScalePatterns from '../../../components/fretboard/ScalePatterns';
import ChordProgressions from '../../../components/fretboard/ChordProgressions';
import GuitarAudio from '../../../components/fretboard/GuitarAudio';
import { useTheme } from '../../../components/ui/ThemeContext';

// Common guitar tunings
const tunings = {
Standard: ['E', 'B', 'G', 'D', 'A', 'E'],
DropD: ['E', 'B', 'G', 'D', 'A', 'D'],
DADGAD: ['D', 'A', 'G', 'D', 'A', 'D'],
  OpenG: ['D', 'B', 'G', 'D', 'G', 'D'],
  OpenD: ['D', 'A', 'F#', 'D', 'A', 'D'],
};

// Chord types with labels and Tonal.js format
const chordTypes = [
{ label: 'Major', type: 'M' },
{ label: 'Minor', type: 'm' },
{ label: 'Dominant 7th', type: '7' },
{ label: 'Major 7th', type: 'maj7' },
{ label: 'Minor 7th', type: 'm7' },
{ label: 'Diminished', type: 'dim' },
{ label: 'Augmented', type: 'aug' },
  { label: 'Sus2', type: 'sus2' },
  { label: 'Sus4', type: 'sus4' },
  { label: 'Add9', type: 'add9' },
  { label: '6th', type: '6' },
  { label: 'm6', type: 'm6' },
  { label: '9th', type: '9' },
];

// Scale types with labels and Tonal.js format
const scaleTypes = [
{ label: 'Major Scale', type: 'major' },
  { label: 'Natural Minor', type: 'minor' },
  { label: 'Harmonic Minor', type: 'harmonic minor' },
  { label: 'Melodic Minor', type: 'melodic minor' },
{ label: 'Minor Pentatonic', type: 'minor pentatonic' },
{ label: 'Major Pentatonic', type: 'major pentatonic' },
{ label: 'Blues Scale', type: 'blues' },
  { label: 'Dorian', type: 'dorian' },
  { label: 'Phrygian', type: 'phrygian' },
  { label: 'Lydian', type: 'lydian' },
  { label: 'Mixolydian', type: 'mixolydian' },
  { label: 'Locrian', type: 'locrian' },
];

// Common guitar chord voicings by chord type
// Helper function to generate chord voicings for all root notes based on patterns
const generateChordVoicings = () => {
  const voicings = {};
  const allRoots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Base position patterns for different chord types
  const chordPatterns = {
    // Major chord patterns (relative to the root)
    'M': {
      E: [
        { name: 'Open E Shape', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
        { name: 'E Barre', frets: [0, 2, 2, 1, 0, 0], fingers: [1, 3, 4, 2, 1, 1], barrePosition: 0 },
        { name: 'E Root 6', frets: [0, 2, 2, 1, 0, 'x'], fingers: [0, 2, 3, 1, 0, 0] },
      ],
      A: [
        { name: 'Open A Shape', frets: ['x', 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
        { name: 'A Barre', frets: ['x', 0, 2, 2, 2, 0], fingers: [0, 1, 3, 3, 3, 1], barrePosition: 0 },
        { name: 'A Root 5', frets: ['x', 0, 2, 2, 2, 'x'], fingers: [0, 0, 1, 3, 2, 0] },
      ],
      D: [
        { name: 'Open D Shape', frets: ['x', 'x', 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
        { name: 'D Barre', frets: ['x', 'x', 0, 2, 3, 2], fingers: [0, 0, 1, 3, 4, 2], barrePosition: 0 },
        { name: 'D Root 4', frets: ['x', 'x', 0, 2, 3, 'x'], fingers: [0, 0, 0, 1, 3, 0] },
      ],
      C: [
        { name: 'Open C Shape', frets: ['x', 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
        { name: 'C Movable', frets: ['x', 'x', 2, 4, 5, 4], fingers: [0, 0, 1, 3, 4, 2] },
      ],
      G: [
        { name: 'Open G Shape', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
        { name: 'G Barre', frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], barrePosition: 3 },
      ]
    },
    // Minor chord patterns
    'm': {
      E: [
        { name: 'Open Em Shape', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
        { name: 'Em Barre', frets: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1], barrePosition: 0 },
        { name: 'Em Root 6', frets: [0, 2, 2, 0, 0, 'x'], fingers: [0, 2, 3, 0, 0, 0] },
      ],
      A: [
        { name: 'Open Am Shape', frets: ['x', 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
        { name: 'Am Barre', frets: ['x', 0, 2, 2, 1, 0], fingers: [0, 1, 3, 4, 2, 1], barrePosition: 0 },
        { name: 'Am Root 5', frets: ['x', 0, 2, 2, 1, 'x'], fingers: [0, 0, 2, 3, 1, 0] },
      ],
      D: [
        { name: 'Open Dm Shape', frets: ['x', 'x', 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
        { name: 'Dm Barre', frets: ['x', 'x', 0, 2, 3, 1], fingers: [0, 0, 1, 3, 4, 2], barrePosition: 0 },
        { name: 'Dm Root 4', frets: ['x', 'x', 0, 2, 3, 'x'], fingers: [0, 0, 0, 1, 3, 0] },
      ]
    },
    // Dominant 7th chord patterns
    '7': {
      E: [
        { name: 'E7 Shape', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
        { name: 'E7 Barre', frets: [0, 2, 0, 1, 0, 0], fingers: [1, 3, 1, 2, 1, 1], barrePosition: 0 },
      ],
      A: [
        { name: 'A7 Shape', frets: ['x', 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
        { name: 'A7 Barre', frets: ['x', 0, 2, 0, 2, 0], fingers: [0, 1, 3, 1, 4, 1], barrePosition: 0 },
      ],
      G: [
        { name: 'G7 Shape', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
        { name: 'G7 Barre', frets: [3, 5, 3, 4, 3, 3], fingers: [1, 3, 1, 2, 1, 1], barrePosition: 3 },
      ],
      C: [
        { name: 'C7 Shape', frets: ['x', 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
        { name: 'C7 Barre', frets: ['x', 3, 5, 3, 5, 3], fingers: [0, 1, 3, 1, 4, 1], barrePosition: 3 },
      ],
      D: [
        { name: 'D7 Shape', frets: ['x', 'x', 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
        { name: 'D7 Barre', frets: ['x', 'x', 0, 2, 1, 2], fingers: [0, 0, 0, 3, 1, 4], barrePosition: 0 },
      ]
    },
    // Major 7th chord patterns
    'maj7': {
      E: [
        { name: 'Emaj7 Shape', frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
        { name: 'Emaj7 Barre', frets: [0, 2, 1, 1, 0, 0], fingers: [1, 4, 2, 3, 1, 1], barrePosition: 0 },
      ],
      A: [
        { name: 'Amaj7 Shape', frets: ['x', 0, 2, 1, 2, 0], fingers: [0, 0, 3, 1, 4, 0] },
        { name: 'Amaj7 Barre', frets: ['x', 0, 2, 1, 2, 0], fingers: [0, 0, 3, 1, 4, 0], barrePosition: 0 },
      ],
      C: [
        { name: 'Cmaj7 Shape', frets: ['x', 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
        { name: 'Cmaj7 Barre', frets: ['x', 3, 5, 4, 5, 3], fingers: [0, 1, 3, 2, 4, 1], barrePosition: 3 },
      ],
      G: [
        { name: 'Gmaj7 Shape', frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1] },
        { name: 'Gmaj7 Barre', frets: [3, 5, 4, 4, 3, 3], fingers: [1, 4, 2, 3, 1, 1], barrePosition: 3 },
      ]
    },
    // Minor 7th chord patterns
    'm7': {
      E: [
        { name: 'Em7 Shape', frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0] },
        { name: 'Em7 Barre', frets: [0, 2, 0, 0, 0, 0], fingers: [1, 3, 1, 1, 1, 1], barrePosition: 0 },
      ],
      A: [
        { name: 'Am7 Shape', frets: ['x', 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
        { name: 'Am7 Barre', frets: ['x', 0, 2, 0, 1, 0], fingers: [0, 1, 3, 1, 2, 1], barrePosition: 0 },
      ],
      D: [
        { name: 'Dm7 Shape', frets: ['x', 'x', 0, 2, 1, 1], fingers: [0, 0, 0, 3, 1, 2] },
        { name: 'Dm7 Barre', frets: ['x', 'x', 0, 2, 1, 1], fingers: [0, 0, 0, 3, 1, 2], barrePosition: 0 },
      ]
    },
    // Diminished chord patterns
    'dim': {
      E: [
        { name: 'Edim Shape', frets: ['x', 'x', 2, 3, 2, 3], fingers: [0, 0, 1, 3, 2, 4] },
      ],
      A: [
        { name: 'Adim Shape', frets: ['x', 0, 1, 2, 1, 'x'], fingers: [0, 0, 1, 3, 2, 0] },
      ],
      B: [
        { name: 'Bdim Shape', frets: ['x', 2, 3, 4, 3, 'x'], fingers: [0, 1, 2, 4, 3, 0] },
      ]
    },
    // Augmented chord patterns
    'aug': {
      E: [
        { name: 'Eaug Shape', frets: [0, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0] },
      ],
      C: [
        { name: 'Caug Shape', frets: ['x', 3, 2, 1, 1, 'x'], fingers: [0, 4, 3, 1, 2, 0] },
      ],
      G: [
        { name: 'Gaug Shape', frets: [3, 2, 1, 0, 0, 3], fingers: [3, 2, 1, 0, 0, 4] },
      ]
    },
    // Sus2 chord patterns
    'sus2': {
      E: [
        { name: 'Esus2 Shape', frets: [0, 2, 4, 4, 0, 0], fingers: [0, 1, 3, 4, 0, 0] },
      ],
      A: [
        { name: 'Asus2 Shape', frets: ['x', 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },
      ],
      D: [
        { name: 'Dsus2 Shape', frets: ['x', 'x', 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0] },
      ]
    },
    
    // Sus4 chord patterns
    'sus4': {
      E: [
        { name: 'Esus4 Shape', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0] },
      ],
      A: [
        { name: 'Asus4 Shape', frets: ['x', 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
      ],
      D: [
        { name: 'Dsus4 Shape', frets: ['x', 'x', 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
      ]
    },
    
    // Add9 chord patterns
    'add9': {
      E: [
        { name: 'Eadd9 Shape', frets: [0, 2, 2, 1, 0, 2], fingers: [0, 2, 3, 1, 0, 4] },
      ],
      C: [
        { name: 'Cadd9 Shape', frets: ['x', 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0] },
      ],
      G: [
        { name: 'Gadd9 Shape', frets: [3, 0, 0, 0, 0, 3], fingers: [2, 0, 0, 0, 0, 3] },
      ]
    },
    
    // 6th chord patterns
    '6': {
      E: [
        { name: 'E6 Shape', frets: [0, 2, 2, 1, 2, 0], fingers: [0, 2, 3, 1, 4, 0] },
      ],
      A: [
        { name: 'A6 Shape', frets: ['x', 0, 2, 2, 2, 2], fingers: [0, 0, 1, 1, 1, 2] },
      ],
      C: [
        { name: 'C6 Shape', frets: ['x', 3, 2, 2, 1, 0], fingers: [0, 4, 2, 3, 1, 0] },
      ],
      G: [
        { name: 'G6 Shape', frets: [3, 2, 0, 0, 0, 0], fingers: [3, 2, 0, 0, 0, 0] },
      ]
    },
    
    // minor 6th chord patterns
    'm6': {
      E: [
        { name: 'Em6 Shape', frets: [0, 2, 0, 0, 2, 0], fingers: [0, 2, 0, 0, 3, 0] },
      ],
      A: [
        { name: 'Am6 Shape', frets: ['x', 0, 2, 2, 1, 2], fingers: [0, 0, 2, 3, 1, 4] },
      ],
      D: [
        { name: 'Dm6 Shape', frets: ['x', 'x', 0, 2, 0, 1], fingers: [0, 0, 0, 2, 0, 1] },
      ]
    },
    
    // 9th chord patterns
    '9': {
      E: [
        { name: 'E9 Shape', frets: [0, 2, 0, 1, 0, 2], fingers: [0, 2, 0, 1, 0, 3] },
      ],
      G: [
        { name: 'G9 Shape', frets: [3, 2, 0, 2, 0, 1], fingers: [4, 2, 0, 3, 0, 1] },
      ],
      C: [
        { name: 'C9 Shape', frets: ['x', 3, 2, 3, 3, 'x'], fingers: [0, 2, 1, 3, 4, 0] },
      ]
    },
  };
  
  // Add more chord types as needed (sus2, sus4, etc.)
  
  // E and A form templates for quick generation of common movable shapes
  const generateEFormMovable = (root, fretOffset) => {
    return [
      { name: `${root} E Form (${fretOffset}th fret)`, frets: [fretOffset, fretOffset+2, fretOffset+2, fretOffset+1, fretOffset, fretOffset], fingers: [1, 3, 4, 2, 1, 1] },
    ];
  };
  
  const generateAFormMovable = (root, fretOffset) => {
    return [
      { name: `${root} A Form (${fretOffset}th fret)`, frets: [fretOffset-5, fretOffset, fretOffset+2, fretOffset+2, fretOffset+2, fretOffset], fingers: [0, 1, 3, 3, 3, 1] },
    ];
  };
  
  // Function to shift a pattern up the fretboard
  const shiftPattern = (pattern, semitones) => {
    const newPattern = {...pattern};
    
    // Generate a new name
    newPattern.name = `${newPattern.name} (${semitones}fr)`;
    
    // Shift the frets
    newPattern.frets = pattern.frets.map(fret => {
      if (fret === 'x') return 'x';
      return fret + semitones;
    });
    
    // If there's a barre position, shift it too
    if (newPattern.barrePosition !== undefined) {
      newPattern.barrePosition += semitones;
    }
    
    return newPattern;
  };
  
  // Generate chord voicings for each root note
  allRoots.forEach(root => {
    // Calculate distances for common shapes from standard form positions
    const rootIndex = allRoots.indexOf(root);
    const eFormDistance = rootIndex; // E is at index 4
    const aFormDistance = (rootIndex - 9 + 12) % 12; // A is at index 9
    const dFormDistance = (rootIndex - 2 + 12) % 12; // D is at index 2
    const gFormDistance = (rootIndex - 7 + 12) % 12; // G is at index 7
    const cFormDistance = (rootIndex - 0 + 12) % 12; // C is at index 0
    
    // Loop through each chord type
    Object.keys(chordPatterns).forEach(type => {
      const chordKey = `${root}-${type}`;
      voicings[chordKey] = [];
      
      // Add open position if it's a standard open chord (E, A, D, G, C)
      if (root === 'E' && chordPatterns[type].E) {
        voicings[chordKey].push(...chordPatterns[type].E);
      }
      if (root === 'A' && chordPatterns[type].A) {
        voicings[chordKey].push(...chordPatterns[type].A);
      }
      if (root === 'D' && chordPatterns[type].D) {
        voicings[chordKey].push(...chordPatterns[type].D);
      }
      if (root === 'G' && chordPatterns[type].G) {
        voicings[chordKey].push(...chordPatterns[type].G);
      }
      if (root === 'C' && chordPatterns[type].C) {
        voicings[chordKey].push(...chordPatterns[type].C);
      }
      
      // Add movable E form shapes if applicable
      if (chordPatterns[type].E && root !== 'E') {
        voicings[chordKey].push(...chordPatterns[type].E.map(pattern => {
          // Skip open position pattern if it can't be moved
          if (pattern.barrePosition === undefined && pattern.name.includes('Open')) {
            return null;
          }
          return shiftPattern(pattern, eFormDistance);
        }).filter(Boolean));
      }
      
      // Add movable A form shapes if applicable
      if (chordPatterns[type].A && root !== 'A') {
        voicings[chordKey].push(...chordPatterns[type].A.map(pattern => {
          // Skip open position pattern if it can't be moved
          if (pattern.barrePosition === undefined && pattern.name.includes('Open')) {
            return null;
          }
          return shiftPattern(pattern, aFormDistance);
        }).filter(Boolean));
      }
      
      // Add other forms in similar way
      
      // Generate additional movable shapes for major and minor chords
      if (type === 'M' || type === 'm') {
        // For major/minor, add some additional common positions
        // (e.g., E form at different positions)
        if (eFormDistance + 12 <= 12) {
          voicings[chordKey].push(...generateEFormMovable(root, eFormDistance + 12));
        }
        if (aFormDistance + 12 <= 12) {
          voicings[chordKey].push(...generateAFormMovable(root, aFormDistance + 12));
        }
      }
      
      // For dominant 7th and major 7th chords
      if (type === '7' || type === 'maj7' || type === 'm7') {
        // Add some specific dominant 7th shapes if needed
        if (voicings[chordKey].length < 2) {
          if (type === '7') {
            voicings[chordKey].push(
              { name: `${root}7 E form`, frets: [rootIndex, rootIndex+2, rootIndex, rootIndex+1, rootIndex, rootIndex], fingers: [1, 3, 1, 2, 1, 1] },
              { name: `${root}7 A form`, frets: ['x', rootIndex+5, rootIndex+7, rootIndex+5, rootIndex+7, rootIndex+5], fingers: [0, 1, 3, 1, 4, 1] }
            );
          } else if (type === 'maj7') {
            voicings[chordKey].push(
              { name: `${root}maj7 E form`, frets: [rootIndex, rootIndex+2, rootIndex+1, rootIndex+1, rootIndex, rootIndex], fingers: [1, 4, 2, 3, 1, 1] },
              { name: `${root}maj7 A form`, frets: ['x', rootIndex+5, rootIndex+7, rootIndex+6, rootIndex+7, rootIndex+5], fingers: [0, 1, 3, 2, 4, 1] }
            );
          } else if (type === 'm7') {
            voicings[chordKey].push(
              { name: `${root}m7 E form`, frets: [rootIndex, rootIndex+2, rootIndex, rootIndex, rootIndex, rootIndex], fingers: [1, 2, 1, 1, 1, 1] },
              { name: `${root}m7 A form`, frets: ['x', rootIndex+5, rootIndex+7, rootIndex+5, rootIndex+6, rootIndex+5], fingers: [0, 1, 3, 1, 2, 1] }
            );
          }
        }
      }
      
      // For sus2/sus4 chords
      if (type === 'sus2' || type === 'sus4') {
        if (voicings[chordKey].length < 2) {
          if (type === 'sus2') {
            voicings[chordKey].push(
              { name: `${root}sus2 E form`, frets: [rootIndex, rootIndex+2, rootIndex+4, rootIndex+4, rootIndex, rootIndex], fingers: [1, 2, 4, 4, 1, 1] },
              { name: `${root}sus2 A form`, frets: ['x', rootIndex+5, rootIndex+7, rootIndex+7, rootIndex+5, rootIndex+5], fingers: [0, 1, 3, 3, 1, 1] }
            );
          } else if (type === 'sus4') {
            voicings[chordKey].push(
              { name: `${root}sus4 E form`, frets: [rootIndex, rootIndex+2, rootIndex+2, rootIndex+2, rootIndex, rootIndex], fingers: [1, 2, 3, 4, 1, 1] },
              { name: `${root}sus4 A form`, frets: ['x', rootIndex+5, rootIndex+7, rootIndex+7, rootIndex+8, rootIndex+5], fingers: [0, 1, 2, 2, 3, 1] }
            );
          }
        }
      }
      
      // Ensure we have at least a couple of voicings for each chord type
      if (voicings[chordKey].length === 0) {
        // Add generic movable shapes if no specific ones added
        if (type === 'M') {
          voicings[chordKey].push(
            { name: `${root} Root 6 Barre`, frets: [rootIndex, rootIndex+2, rootIndex+2, rootIndex+1, rootIndex, rootIndex], fingers: [1, 3, 4, 2, 1, 1] },
            { name: `${root} Root 5 Barre`, frets: ['x', rootIndex+5, rootIndex+7, rootIndex+7, rootIndex+7, rootIndex+5], fingers: [0, 1, 3, 3, 3, 1] }
          );
        } else if (type === 'm') {
          voicings[chordKey].push(
            { name: `${root}m Root 6`, frets: [rootIndex, rootIndex+2, rootIndex+2, rootIndex, rootIndex, rootIndex], fingers: [1, 3, 4, 1, 1, 1] },
            { name: `${root}m Root 5`, frets: ['x', rootIndex+5, rootIndex+7, rootIndex+7, rootIndex+6, rootIndex+5], fingers: [0, 1, 3, 4, 2, 1] }
          );
        } else {
          // For other chord types, generate at least one movable form
          voicings[chordKey].push(
            { name: `${root}${type} Generic Form`, frets: [rootIndex, rootIndex+2, rootIndex+2, rootIndex+1, rootIndex, rootIndex], fingers: [1, 3, 4, 2, 1, 1] }
          );
        }
      }
    });
  });
  
  return voicings;
};

// Generate the comprehensive chord voicings object
const chordVoicings = generateChordVoicings();

// Additional chord voicings can be manually added for special cases:
// Add some existing specific voicings 
Object.assign(chordVoicings, {
  // Major chords (preserve original manually defined ones)
  'C-M': [
    { name: 'Open C', frets: ['x', 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
    { name: 'C Barre (3rd fret)', frets: ['x', 3, 5, 5, 5, 3], fingers: [0, 1, 3, 3, 3, 1] },
    { name: 'C Barre (8th fret)', frets: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1] },
    { name: 'C Root 5 (3rd fret)', frets: ['x', 3, 5, 5, 5, 'x'], fingers: [0, 1, 3, 4, 2, 0] },
    { name: 'C Movable (8th fret)', frets: ['x', 'x', 10, 9, 8, 8], fingers: [0, 0, 4, 3, 1, 2] },
  ],
  'G-M': [
    { name: 'Open G', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
    { name: 'G Barre (3rd fret)', frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1] },
    { name: 'G Root 6 (3rd fret)', frets: [3, 5, 5, 4, 3, 'x'], fingers: [1, 4, 3, 2, 1, 0] },
    { name: 'G Root 5 (10th fret)', frets: ['x', 10, 12, 12, 12, 'x'], fingers: [0, 1, 3, 4, 2, 0] },
    { name: 'G Movable (7th fret)', frets: ['x', 'x', 5, 7, 8, 7], fingers: [0, 0, 1, 2, 4, 3] },
  ],
  'D-M': [
    { name: 'Open D', frets: ['x', 'x', 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
    { name: 'D Barre (5th fret)', frets: ['x', 5, 7, 7, 7, 5], fingers: [0, 1, 3, 3, 3, 1] },
    { name: 'D Root 5 (5th fret)', frets: ['x', 5, 7, 7, 7, 'x'], fingers: [0, 1, 3, 4, 2, 0] },
    { name: 'D Root 4 (7th fret)', frets: ['x', 'x', 'x', 7, 7, 5], fingers: [0, 0, 0, 3, 2, 1] },
    { name: 'D Movable (10th fret)', frets: ['x', 'x', 7, 9, 10, 9], fingers: [0, 0, 1, 3, 3, 3] },
  ],
  'A-M': [
    { name: 'Open A', frets: ['x', 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
    { name: 'A Barre (5th fret)', frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1] },
    { name: 'A Root 5 (12th fret)', frets: ['x', 12, 14, 14, 14, 'x'], fingers: [0, 1, 3, 4, 2, 0] },
    { name: 'A Root 6 (5th fret)', frets: [5, 7, 7, 6, 5, 'x'], fingers: [1, 3, 4, 2, 1, 0] },
    { name: 'A Movable (9th fret)', frets: ['x', 'x', 7, 9, 10, 9], fingers: [0, 0, 1, 3, 4, 2] },
  ],
  'E-M': [
    { name: 'Open E', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
    { name: 'E Barre (7th fret)', frets: [7, 9, 9, 8, 7, 7], fingers: [1, 3, 4, 2, 1, 1] },
    { name: 'E Root 6 (12th fret)', frets: [12, 14, 14, 13, 12, 12], fingers: [1, 3, 4, 2, 1, 1] },
    { name: 'E Root 5 (7th fret)', frets: ['x', 7, 9, 9, 9, 'x'], fingers: [0, 1, 3, 4, 2, 0] },
    { name: 'E Movable (4th fret)', frets: ['x', 'x', 2, 4, 5, 4], fingers: [0, 0, 1, 2, 4, 3] },
  ],
  // Minor chords
  'A-m': [
    { name: 'Open Am', frets: ['x', 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
    { name: 'Am Barre (5th fret)', frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1] },
    { name: 'Am Root 5 (12th fret)', frets: ['x', 12, 14, 14, 13, 'x'], fingers: [0, 1, 3, 4, 2, 0] },
    { name: 'Am Root 6 (5th fret)', frets: [5, 7, 7, 5, 5, 'x'], fingers: [1, 3, 4, 1, 2, 0] },
    { name: 'Am Movable (9th fret)', frets: ['x', 'x', 7, 9, 9, 9], fingers: [0, 0, 1, 3, 3, 3] },
  ],
  'E-m': [
    { name: 'Open Em', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    { name: 'Em Barre (7th fret)', frets: [7, 9, 9, 7, 7, 7], fingers: [1, 3, 4, 1, 1, 1] },
    { name: 'Em Root 6 (7th fret)', frets: [7, 9, 9, 7, 7, 'x'], fingers: [1, 3, 4, 1, 2, 0] },
    { name: 'Em Root 5 (7th fret)', frets: ['x', 7, 9, 9, 8, 'x'], fingers: [0, 1, 3, 4, 2, 0] },
    { name: 'Em Movable (4th fret)', frets: ['x', 'x', 2, 4, 4, 4], fingers: [0, 0, 1, 3, 3, 3] },
  ],
  'D-m': [
    { name: 'Open Dm', frets: ['x', 'x', 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
    { name: 'Dm Barre (5th fret)', frets: ['x', 5, 7, 7, 6, 5], fingers: [0, 1, 3, 4, 2, 1] },
    { name: 'Dm Root 5 (5th fret)', frets: ['x', 5, 7, 7, 6, 'x'], fingers: [0, 1, 3, 4, 2, 0] },
    { name: 'Dm Root 4 (10th fret)', frets: ['x', 'x', 'x', 10, 11, 10], fingers: [0, 0, 0, 1, 3, 2] },
    { name: 'Dm Movable (10th fret)', frets: ['x', 'x', 7, 9, 9, 9], fingers: [0, 0, 1, 3, 3, 3] },
  ],
  'B-m': [
    { name: 'Bm Barre (2nd fret)', frets: [2, 3, 4, 4, 3, 2], fingers: [1, 2, 3, 4, 2, 1] },
    { name: 'Bm Root 5 (2nd fret)', frets: ['x', 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1] },
    { name: 'Bm 7th fret shape', frets: ['x', 'x', 4, 6, 7, 6], fingers: [0, 0, 1, 2, 4, 3] },
  ],
  'F-M': [
    { name: 'F Barre (1st fret)', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1] },
    { name: 'F Root 6 (1st fret)', frets: [1, 3, 3, 2, 1, 'x'], fingers: [1, 3, 4, 2, 1, 0] },
    { name: 'F Root 5 (8th fret)', frets: ['x', 8, 10, 10, 10, 'x'], fingers: [0, 1, 3, 3, 3, 0] },
    { name: 'F Movable (5th fret)', frets: ['x', 'x', 3, 5, 6, 5], fingers: [0, 0, 1, 3, 4, 2] },
  ],
  // 7th chords
  'G-7': [
    { name: 'Open G7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
    { name: 'G7 Barre', frets: [3, 5, 3, 4, 3, 3], fingers: [1, 3, 1, 2, 1, 1] },
    { name: 'G7 Root 6', frets: [3, 5, 3, 4, 'x', 'x'], fingers: [1, 3, 1, 2, 0, 0] },
  ],
  'C-7': [
    { name: 'Open C7', frets: ['x', 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
    { name: 'C7 Barre', frets: ['x', 3, 5, 3, 5, 3], fingers: [0, 1, 3, 1, 4, 1] },
    { name: 'C7 Root 5', frets: ['x', 3, 5, 3, 5, 'x'], fingers: [0, 1, 3, 1, 4, 0] },
  ],
  'E-7': [
    { name: 'Open E7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
    { name: 'E7 Barre (7th fret)', frets: [7, 9, 7, 8, 7, 7], fingers: [1, 3, 1, 2, 1, 1] },
  ],
  'A-7': [
    { name: 'Open A7', frets: ['x', 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
    { name: 'A7 Barre (5th fret)', frets: [5, 7, 5, 6, 5, 5], fingers: [1, 3, 1, 2, 1, 1] },
  ],
  'D-7': [
    { name: 'Open D7', frets: ['x', 'x', 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
    { name: 'D7 Barre (5th fret)', frets: ['x', 5, 7, 5, 7, 5], fingers: [0, 1, 3, 1, 4, 1] },
  ],
  'B-7': [
    { name: 'B7 Barre (2nd fret)', frets: ['x', 2, 4, 2, 4, 2], fingers: [0, 1, 3, 1, 4, 1] },
    { name: 'B7 Root 5 (7th fret)', frets: ['x', 7, 9, 7, 9, 7], fingers: [0, 1, 3, 1, 4, 1] },
  ],
  'F-7': [
    { name: 'F7 Barre (1st fret)', frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1] },
    { name: 'F7 Root 5 (8th fret)', frets: ['x', 8, 10, 8, 10, 8], fingers: [0, 1, 3, 1, 4, 1] },
  ],
  // Major 7th chords
  'G-maj7': [
    { name: 'Open Gmaj7', frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1] },
    { name: 'Gmaj7 Barre', frets: [3, 5, 4, 4, 3, 3], fingers: [1, 4, 2, 3, 1, 1] },
    { name: 'Gmaj7 Root 6', frets: [3, 'x', 4, 4, 3, 'x'], fingers: [1, 0, 3, 4, 2, 0] },
  ],
  'C-maj7': [
    { name: 'Open Cmaj7', frets: ['x', 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
    { name: 'Cmaj7 Barre', frets: ['x', 3, 5, 4, 5, 3], fingers: [0, 1, 3, 2, 4, 1] },
    { name: 'Cmaj7 Root 5', frets: ['x', 3, 5, 4, 5, 'x'], fingers: [0, 1, 3, 2, 4, 0] },
  ],
  'E-maj7': [
    { name: 'Open Emaj7', frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
    { name: 'Emaj7 Barre (7th fret)', frets: [7, 9, 8, 8, 7, 7], fingers: [1, 3, 2, 2, 1, 1] },
  ],
  'A-maj7': [
    { name: 'Open Amaj7', frets: ['x', 0, 2, 1, 2, 0], fingers: [0, 0, 3, 1, 4, 0] },
    { name: 'Amaj7 Barre (5th fret)', frets: [5, 7, 6, 6, 5, 5], fingers: [1, 3, 2, 2, 1, 1] },
  ],
  'D-maj7': [
    { name: 'Open Dmaj7', frets: ['x', 'x', 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1] },
    { name: 'Dmaj7 Barre (5th fret)', frets: ['x', 5, 7, 6, 7, 5], fingers: [0, 1, 3, 2, 4, 1] },
  ],
  // Minor 7th chords
  'A-m7': [
    { name: 'Open Am7', frets: ['x', 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
    { name: 'Am7 Barre (5th fret)', frets: [5, 7, 5, 5, 5, 5], fingers: [1, 3, 1, 1, 1, 1] },
  ],
  'E-m7': [
    { name: 'Open Em7', frets: [0, 2, 0, 0, 0, 0], fingers: [0, 1, 0, 0, 0, 0] },
    { name: 'Em7 Barre (7th fret)', frets: [7, 9, 7, 7, 7, 7], fingers: [1, 3, 1, 1, 1, 1] },
  ],
  'D-m7': [
    { name: 'Open Dm7', frets: ['x', 'x', 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1] },
    { name: 'Dm7 Barre (5th fret)', frets: ['x', 5, 7, 5, 6, 5], fingers: [0, 1, 3, 1, 2, 1] },
  ],
  // Add some specific sus chord voicings
  'G-sus2': [
    { name: 'G sus2', frets: [3, 0, 0, 0, 3, 3], fingers: [2, 0, 0, 0, 3, 4] },
  ],
  'D-sus2': [
    { name: 'D sus2', frets: ['x', 'x', 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0] },
  ],
  'A-sus2': [
    { name: 'A sus2', frets: ['x', 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },
  ],
  'E-sus4': [
    { name: 'E sus4', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0] },
  ],
  'A-sus4': [
    { name: 'A sus4', frets: ['x', 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
  ],
  'D-sus4': [
    { name: 'D sus4', frets: ['x', 'x', 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
  ],
});

// Fretboard display constants
const fretMarkers = [3, 5, 7, 9, 12];
const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Helper to get the note at a specific fret
const getFretNote = (openNote, fret) => {
const index = allNotes.indexOf(Tonal.Note.simplify(openNote));
return allNotes[(index + fret) % 12];
};

export default function FretboardPage() {
const [selectedNotes, setSelectedNotes] = useState([]);
const [currentTuning, setCurrentTuning] = useState('Standard');
const [chordRoot, setChordRoot] = useState('C');
const [chordType, setChordType] = useState('');
const [scaleType, setScaleType] = useState('');
  const [showVoicings, setShowVoicings] = useState(false);
  const [selectedVoicings, setSelectedVoicings] = useState([]);
  const [currentVoicingIndex, setCurrentVoicingIndex] = useState(0);
  const [detectedChord, setDetectedChord] = useState('');
  const [suggestedScales, setSuggestedScales] = useState([]);
  const [showOnlyRelevantNotes, setShowOnlyRelevantNotes] = useState(false);
  const [simplifiedMode, setSimplifiedMode] = useState(false);
  const [showVoicingOverScale, setShowVoicingOverScale] = useState(true);
  const [reverseStringOrder, setReverseStringOrder] = useState(false);
  const [showScalePatterns, setShowScalePatterns] = useState(false);
  const [showChordProgressions, setShowChordProgressions] = useState(false);
  const [currentScalePattern, setCurrentScalePattern] = useState(null);
  const [patternFretShift, setPatternFretShift] = useState(0);
  const [strumDirection, setStrumDirection] = useState('down');
  const [currentTab, setCurrentTab] = useState('fretboard'); // 'fretboard', 'voicings', 'analysis', 'patterns', 'progressions'
  
  // Initialize GuitarAudio - ensure this is wrapped in useCallback to maintain reference stability
  const audioTools = GuitarAudio();
  // Create stable references to the audio methods to prevent unnecessary re-renders
  const playNote = useCallback((note) => {
    if (audioTools.playNote) {
      audioTools.playNote(note);
    }
  }, [audioTools]);
  
  const playChord = useCallback((notes, strum = true, duration = 2) => {
    if (audioTools.playChord) {
      audioTools.playChord(notes, strum, duration);
    }
  }, [audioTools]);
  
  // Get strings array based on tuning and display orientation
  const getTuningStrings = useCallback(() => {
    const tuningArray = [...tunings[currentTuning]];
    // Reverse the array if we want low E at the top (standard guitar tab format)
    // Otherwise keep it with high E at the top (standard notation format)
    return reverseStringOrder ? tuningArray : tuningArray.reverse();
  }, [currentTuning, reverseStringOrder]);
  
  const strings = getTuningStrings();
const frets = Array.from({ length: 13 }, (_, i) => i);

  // Compute highlighted notes based on chord or scale selection
const highlightedNotes = React.useMemo(() => {
if (chordType) {
return Tonal.Chord.getChord(chordType, chordRoot).notes.map(Tonal.Note.pitchClass);
} else if (scaleType) {
return Tonal.Scale.get(`${chordRoot} ${scaleType}`).notes.map(Tonal.Note.pitchClass);
}
return [];
}, [chordRoot, chordType, scaleType]);

  // Create interval mapping for color coding
const intervalMap = React.useMemo(() => {
if (chordType) {
return Tonal.Chord.getChord(chordType, chordRoot).intervals.reduce((acc, intv, i) => {
const note = Tonal.Note.pitchClass(Tonal.Note.transpose(chordRoot, intv));
acc[note] = intv;
return acc;
}, {});
} else if (scaleType) {
return Tonal.Scale.get(`${chordRoot} ${scaleType}`).intervals.reduce((acc, intv, i) => {
const note = Tonal.Note.pitchClass(Tonal.Note.transpose(chordRoot, intv));
acc[note] = intv;
return acc;
}, {});
}
return {};
}, [chordRoot, chordType, scaleType]);

  // Adapt chord voicings for the current tuning
  const adaptVoicingsToTuning = useCallback((voicings, origTuning, targetTuning) => {
    if (!voicings || voicings.length === 0) return [];
    
    // If no tuning change, return original voicings
    if (origTuning === targetTuning) return voicings;
    
    const origTuningArray = tunings[origTuning];
    const targetTuningArray = tunings[targetTuning];
    
    return voicings.map(voicing => {
      const newVoicing = {...voicing};
      newVoicing.name = `${newVoicing.name} (adapted)`;
      
      // Create new frets array
      const newFrets = [...voicing.frets];
      
      // For each string, adapt the fret position based on note difference
      for (let i = 0; i < 6; i++) {
        const fret = voicing.frets[i];
        // Skip if string is not played
        if (fret === 'x') continue;
        
        // Preserve open strings if possible (important for Em voicings)
        if (fret === 0 || fret === '0') {
          newFrets[i] = 0;
          continue;
        }
        
        // Calculate note in original tuning
        const origNote = getFretNote(origTuningArray[5-i], parseInt(fret, 10));
        
        // Find the same note on the new tuning
        const targetOpenNote = targetTuningArray[5-i];
        const targetNoteIndex = allNotes.indexOf(origNote);
        const targetOpenIndex = allNotes.indexOf(targetOpenNote);
        
        // Calculate fret difference
        let newFret = (targetNoteIndex - targetOpenIndex + 12) % 12;
        
        // Handle octave jumps for playability
        if (newFret > 12 && parseInt(fret, 10) <= 12) {
          newFret = newFret - 12;
        } else if (newFret === 0 && parseInt(fret, 10) > 0) {
          newFret = 12; // Use 12th fret instead of open string
        }
        
        newFrets[i] = newFret.toString();
      }
      
      return {
        ...newVoicing,
        frets: newFrets,
        // Copy fingers if available, otherwise create placeholders
        fingers: voicing.fingers ? [...voicing.fingers] : newFrets.map(_ => '')
      };
    });
  }, []);

  // Load chord voicings when a chord is selected
  useEffect(() => {
    if (chordType) {
      const voicingKey = `${chordRoot}-${chordType}`;
      const standardVoicings = chordVoicings[voicingKey] || [];
      
      // Adapt voicings to current tuning if needed
      const adaptedVoicings = adaptVoicingsToTuning(standardVoicings, 'Standard', currentTuning);
      
      setSelectedVoicings(adaptedVoicings);
      setCurrentVoicingIndex(0);
      
      // Automatically show voicings when a chord is selected
      if (adaptedVoicings.length > 0) {
        setShowVoicings(true);
        // If we're on the voicings tab, automatically open that tab
        if (currentTab === 'fretboard') {
          // Show voicings in the fretboard tab as well
          setShowVoicings(true);
        }
      } else {
        setShowVoicings(false);
      }
    } else {
      setSelectedVoicings([]);
      setShowVoicings(false);
    }
  }, [chordRoot, chordType, currentTuning, adaptVoicingsToTuning]);

  // Detect chord and suggested scales from selected notes
  useEffect(() => {
    if (selectedNotes.length >= 2) {
      // Convert to pitch classes for chord detection
      const pitchClasses = selectedNotes.map(note => Tonal.Note.pitchClass(note));
      
      // Detect chords based on selected notes
      const detectedChords = Tonal.Chord.detect(pitchClasses);
      setDetectedChord(detectedChords.length > 0 ? detectedChords[0] : '');
      
      // Find scales that contain all the selected notes
      const pcSet = new Set(pitchClasses);
      const compatibleScales = [];
      
      // Check through common scales
      scaleTypes.forEach(scaleType => {
        // Try each note as potential root
        allNotes.forEach(root => {
          const scale = Tonal.Scale.get(`${root} ${scaleType.type}`);
          const scaleNotes = scale.notes.map(Tonal.Note.pitchClass);
          
          // Check if all selected notes are in this scale
          const containsAllNotes = [...pcSet].every(note => scaleNotes.includes(note));
          
          if (containsAllNotes) {
            compatibleScales.push(`${root} ${scale.name}`);
          }
        });
      });
      
      // Limit to most relevant scales (up to 3)
      setSuggestedScales(compatibleScales.slice(0, 3));
    } else {
      setDetectedChord('');
      setSuggestedScales([]);
    }
  }, [selectedNotes]);

  // Toggle note selection
  const toggleNote = useCallback((note) => {
    setSelectedNotes(prev =>
      prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]
);
  }, []);

  // Handle note click with sound and note highlighting
  const handleNoteClick = useCallback((note) => {
    // Play the note sound
    playNote(note);
    
    // Toggle the note selection
    toggleNote(note);
    
    // Optional: temporarily highlight all occurrences of this note across the fretboard
    // This could be implemented with a brief state update that automatically resets
    
  }, [toggleNote, playNote]);

  // Play all highlighted notes as a chord
  const handlePlayChord = useCallback(() => {
    // Play chord using GuitarAudio with strum effect
    if (highlightedNotes && highlightedNotes.length > 0) {
      playChord(highlightedNotes, strumDirection !== 'none', 2);
    }
  }, [highlightedNotes, playChord, strumDirection]);

  // Select a specific scale pattern
  const handleSelectPattern = useCallback((pattern, fretShift) => {
    setCurrentScalePattern(pattern);
    setPatternFretShift(fretShift);
  }, []);

  // Toggle strum direction
  const toggleStrumDirection = useCallback(() => {
    setStrumDirection(prev => {
      if (prev === 'down') return 'up';
      if (prev === 'up') return 'none';
      return 'down';
    });
  }, []);

  // Navigate through voicings
  const nextVoicing = () => {
    if (selectedVoicings.length > 1) {
      setCurrentVoicingIndex((prev) => (prev + 1) % selectedVoicings.length);
    }
  };
  
  const previousVoicing = () => {
    if (selectedVoicings.length > 1) {
      setCurrentVoicingIndex((prev) => (prev === 0 ? selectedVoicings.length - 1 : prev - 1));
    }
  };
  
  // Select a specific voicing by index
  const selectVoicing = (index) => {
    if (selectedVoicings.length > index) {
      setCurrentVoicingIndex(index);
      setShowVoicings(true);
    }
  };

  // Reset all selections
  const resetSelections = () => {
    setSelectedNotes([]);
    setChordType('');
    setScaleType('');
    setShowVoicings(false);
};

const { theme, isGlassmorphism } = useTheme();

return (
<Layout title="Fretboard">
<Head>
<title>Fretboard | Music Theory Tools</title>
<meta name="description" content="Visualize notes and chords on an interactive guitar fretboard." />
</Head>
<div className="p-0 md:p-0 w-full min-h-screen bg-gradient-to-br from-blue-950 to-indigo-950 text-white">
  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Header Section */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
      <h1 className="text-3xl font-bold text-white tracking-tight mb-4 md:mb-0">
        Guitar Fretboard Visualizer
      </h1>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={handlePlayChord}
          className="flex items-center px-5 py-2 rounded-full bg-blue-600/80 hover:bg-blue-600/90 backdrop-blur-sm text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
          disabled={!highlightedNotes.length}
        >
          <span className="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </span>
          <span>Play</span>
        </button>
        
        <button
          onClick={resetSelections}
          className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm transition-colors duration-200 backdrop-blur-lg"
        >
          Reset
        </button>
      </div>
    </div>
    
    {/* Main Controls */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Tuning & Root Controls */}
      <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-xl">
        <h3 className="text-base font-medium text-white/80 mb-4">Tuning & Root</h3>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-white/70">Tuning</label>
            <select
              value={currentTuning}
              onChange={(e) => setCurrentTuning(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1rem'
              }}
            >
              {Object.keys(tunings).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-white/70">Root Note</label>
            <select
              value={chordRoot}
              onChange={(e) => setChordRoot(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1rem'
              }}
            >
              {allNotes.map((note) => (
                <option key={note} value={note}>{note}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Chord & Scale Controls */}
      <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-xl">
        <h3 className="text-base font-medium text-white/80 mb-4">Harmonies</h3>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-white/70">Chord Type</label>
            <select
              value={chordType}
              onChange={(e) => {
                setChordType(e.target.value);
                setScaleType('');
              }}
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1rem'
              }}
            >
              <option value="">None</option>
              {chordTypes.map((c) => (
                <option key={c.label} value={c.type}>{c.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-white/70">Scale Type</label>
            <select
              value={scaleType}
              onChange={(e) => {
                setScaleType(e.target.value);
                setChordType('');
              }}
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1rem'
              }}
            >
              <option value="">None</option>
              {scaleTypes.map((s) => (
                <option key={s.label} value={s.type}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Display Options */}
      <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-xl">
        <h3 className="text-base font-medium text-white/80 mb-4">Display Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 rounded-full p-0.5">
              <input 
                type="checkbox" 
                id="over-scale" 
                checked={showVoicingOverScale}
                onChange={(e) => setShowVoicingOverScale(e.target.checked)}
                className="sr-only peer" 
              />
              <label 
                htmlFor="over-scale" 
                className="flex w-11 h-6 bg-gray-500/40 rounded-full cursor-pointer peer-checked:bg-blue-500/50 peer-focus:ring-2 peer-focus:ring-blue-300/40 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-md after:transition-transform peer-checked:after:translate-x-5"
              ></label>
            </div>
            <label htmlFor="over-scale" className="text-sm text-white/70 select-none">Over scale</label>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 rounded-full p-0.5">
              <input 
                type="checkbox" 
                id="show-relevant" 
                checked={showOnlyRelevantNotes}
                onChange={(e) => setShowOnlyRelevantNotes(e.target.checked)}
                className="sr-only peer" 
              />
              <label 
                htmlFor="show-relevant" 
                className="flex w-11 h-6 bg-gray-500/40 rounded-full cursor-pointer peer-checked:bg-blue-500/50 peer-focus:ring-2 peer-focus:ring-blue-300/40 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-md after:transition-transform peer-checked:after:translate-x-5"
              ></label>
            </div>
            <label htmlFor="show-relevant" className="text-sm text-white/70 select-none">Relevant notes only</label>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 rounded-full p-0.5">
              <input 
                type="checkbox" 
                id="simplified-mode" 
                checked={simplifiedMode}
                onChange={(e) => setSimplifiedMode(e.target.checked)}
                className="sr-only peer" 
              />
              <label 
                htmlFor="simplified-mode" 
                className="flex w-11 h-6 bg-gray-500/40 rounded-full cursor-pointer peer-checked:bg-blue-500/50 peer-focus:ring-2 peer-focus:ring-blue-300/40 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-md after:transition-transform peer-checked:after:translate-x-5"
              ></label>
            </div>
            <label htmlFor="simplified-mode" className="text-sm text-white/70 select-none">Simplified mode</label>
          </div>
        </div>
      </div>
    </div>
    
    {/* Tabs Nav - Modern style */}
    <div className="mb-8">
      <div className="flex space-x-1 p-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-inner">
        {['fretboard', 'voicings', 'analysis', 'patterns', 'progressions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              currentTab === tab
                ? 'bg-white/15 text-white shadow-sm' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </div>

    {/* Fretboard Section - only shown when on fretboard tab */}
    {currentTab === 'fretboard' && (
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-6 mb-8 shadow-xl overflow-x-auto">
        <table className="table-auto border-collapse w-full">
          <thead>
            <tr className="text-sm text-blue-300 font-medium">
              <th className="px-3 py-2 text-left w-10">String</th>
              {frets.map((fret) => (
                <th key={fret} className="px-3 py-2 text-center w-12">
                  {fret === 0 || fretMarkers.includes(fret) ? (
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500/20 text-blue-300">{fret}</span>
                  ) : (
                    <span>{fret}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {strings.map((openNote, stringIndex) => (
              <tr key={stringIndex} className="border-t border-white/5 hover:bg-white/5 transition-colors duration-200">
                <td className="px-3 py-3 font-bold text-sm text-indigo-300">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-900/30 border border-indigo-400/20">
                    {openNote}
                  </div>
                </td>
                {frets.map((fret) => {
                  const note = getFretNote(openNote, fret);
                  const pc = Tonal.Note.pitchClass(note);
                  const isSelected = selectedNotes.includes(note);
                  const interval = intervalMap[pc];
                  const isHighlighted = highlightedNotes.includes(pc);
                  const isRelevant = !showOnlyRelevantNotes || !chordType && !scaleType || isHighlighted;
                  
                  // Add missing showDot variable
                  const showDot = fretMarkers.includes(fret);
                  
                  // Check for voicing position
                  let voicingPosition = null;
                  if (showVoicings && selectedVoicings.length > 0 && (showVoicingOverScale || !scaleType)) {
                    const currentVoicing = selectedVoicings[currentVoicingIndex];
                    const voicingStringIndex = reverseStringOrder ? stringIndex : 5 - stringIndex;
                    
                    if (currentVoicing && currentVoicing.frets[voicingStringIndex] !== 'x') {
                      const voicingFret = parseInt(currentVoicing.frets[voicingStringIndex], 10);
                      if (!isNaN(voicingFret) && voicingFret === fret) {
                        voicingPosition = currentVoicing.fingers?.[voicingStringIndex] || '';
                      }
                    }
                  }
                  
                  // Check for scale pattern note
                  let isScalePatternNote = false;
                  if (currentScalePattern && scaleType) {
                    const patternStartFret = patternFretShift + currentScalePattern.startFret;
                    const stringPatterns = currentScalePattern.pattern[reverseStringOrder ? stringIndex : 5 - stringIndex];
                    
                    if (stringPatterns) {
                      isScalePatternNote = stringPatterns.some(offset => patternStartFret + offset === fret);
                    }
                  }
                  
                  // Style classes
                  let noteClass = "flex items-center justify-center w-10 h-10 mx-auto rounded-full transition-all duration-200 ";
                  
                  if (voicingPosition) {
                    noteClass += "bg-purple-600/80 text-white border-2 border-purple-300/40 shadow-lg scale-110 z-10";
                  } else if (isSelected) {
                    noteClass += "bg-blue-500 text-white border-2 border-blue-300/50 shadow-lg scale-110 z-10";
                  } else if (isHighlighted && interval === '1P') {
                    noteClass += "bg-gradient-to-br from-red-600/80 to-rose-500/80 text-white border border-red-400/30";
                  } else if (isHighlighted && (interval === '3M' || interval === '3m')) {
                    noteClass += "bg-gradient-to-br from-green-600/80 to-emerald-500/80 text-white border border-green-400/30";
                  } else if (isHighlighted && interval === '5P') {
                    noteClass += "bg-gradient-to-br from-blue-600/80 to-cyan-500/80 text-white border border-blue-400/30";
                  } else if (isHighlighted) {
                    noteClass += "bg-gradient-to-br from-indigo-600/80 to-violet-500/80 text-white border border-indigo-400/30";
                  } else if (isScalePatternNote) {
                    noteClass += "bg-amber-500/50 text-white border border-amber-400/30";
                  } else {
                    noteClass += "bg-gray-800/30 text-gray-300/70 border border-gray-700/30 hover:bg-gray-700/50 hover:text-white hover:scale-105";
                  }
                  
                  if (showOnlyRelevantNotes && !isRelevant) {
                    noteClass += " opacity-20 scale-75 hover:opacity-100 hover:scale-90";
                  }
                  
                  return (
                    <NoteCell 
                      key={`${stringIndex}-${fret}`}
                      note={note}
                      fret={fret}
                      stringIndex={stringIndex}
                      isSelected={isSelected}
                      interval={interval}
                      isHighlighted={isHighlighted}
                      showDot={showDot}
                      isRelevant={isRelevant}
                      simplifiedMode={simplifiedMode}
                      voicingPosition={voicingPosition}
                      showVoicings={showVoicings}
                      isScalePatternNote={isScalePatternNote}
                      onClick={handleNoteClick}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* Chord/Scale Detection Section - Only shown on fretboard tab */}
    {currentTab === 'fretboard' && selectedNotes.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-white mb-4">Selected Notes</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedNotes.map((note, index) => (
              <div key={index} className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600/60 text-white font-medium border border-blue-400/30 shadow-md">
                {note}
              </div>
            ))}
          </div>
          
          {detectedChord && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-indigo-300 uppercase tracking-wider mb-2">Detected Chord</h4>
              <div className="bg-indigo-900/30 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-indigo-400/20">
                <span className="text-xl font-semibold">{detectedChord}</span>
              </div>
            </div>
          )}
          
          {suggestedScales.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-indigo-300 uppercase tracking-wider mb-2">Suggested Scales</h4>
              <div className="space-y-2">
                {suggestedScales.map((scale, index) => (
                  <div key={index} className="bg-blue-900/30 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-blue-400/20">
                    {scale}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {chordType && selectedVoicings.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">{`${chordRoot} ${chordType} Chord`}</h3>
            <div className="flex justify-center items-center">
              <div className="text-center">
                {selectedVoicings[currentVoicingIndex] && (
                  <div>
                    <p className="text-blue-300 font-medium mb-2">{selectedVoicings[currentVoicingIndex].name}</p>
                    <div className="flex justify-center gap-2 mb-4">
                      <button 
                        onClick={previousVoicing}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                        disabled={selectedVoicings.length <= 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button 
                        onClick={handlePlayChord}
                        className="px-4 py-2 rounded-full bg-blue-600/80 hover:bg-blue-600/90 text-white font-medium transition-all duration-200 shadow-lg flex items-center space-x-2"
                      >
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span>Play</span>
                      </button>
                      <button 
                        onClick={nextVoicing}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                        disabled={selectedVoicings.length <= 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="bg-gray-900/40 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-inner">
                      <div className="grid grid-cols-6 gap-2">
                        {[...Array(6)].map((_, i) => {
                          const stringIndex = reverseStringOrder ? i : 5 - i;
                          const tuning = tunings[currentTuning][stringIndex];
                          const fret = selectedVoicings[currentVoicingIndex].frets[stringIndex];
                          const finger = selectedVoicings[currentVoicingIndex].fingers?.[stringIndex] || '';
                          
                          return (
                            <div key={i} className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800/70 text-gray-300 border border-gray-700/50 mb-1">
                                {tuning}
                              </div>
                              <div className="h-32 w-1 bg-gradient-to-b from-blue-400/20 to-indigo-400/20 rounded-full relative">
                                {fret !== 'x' ? (
                                  <div 
                                    className="absolute w-8 h-8 -translate-x-1/2 translate-y-1/2 left-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg border border-white/20"
                                    style={{ bottom: `${Math.min(parseInt(fret, 10) * 20, 100)}%` }}
                                  >
                                    {finger !== '0' ? finger : ''}
                                  </div>
                                ) : (
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-red-400 text-xl font-bold">
                                    ×
                                  </div>
                                )}
                              </div>
                              <div className="mt-1 text-xs text-gray-400">
                                {fret !== 'x' ? fret : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-400">
                      {currentVoicingIndex + 1} of {selectedVoicings.length} voicings
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Scale Patterns Tab */}
    {currentTab === 'patterns' && scaleType && (
      <ScalePatterns
        scaleRoot={chordRoot}
        scaleType={scaleType}
        fretboardWidth={800}
        onSelectPattern={handleSelectPattern}
      />
    )}
    
    {/* Chord Progressions Tab */}
    {currentTab === 'progressions' && chordRoot && (
      <ChordProgressions
        chordRoot={chordRoot}
        chordType={chordType || 'M'}
      />
    )}

    {/* Chord Positions Section */}
    {chordType && selectedVoicings.length > 0 && currentTab === 'fretboard' && (
      <ChordPositions
        chordRoot={chordRoot}
        chordType={chordType}
        selectedVoicings={selectedVoicings}
        currentVoicingIndex={currentVoicingIndex}
        onSelectPosition={selectVoicing}
      />
    )}

    {/* Alternative Voicings Section */}
    {showVoicings && selectedVoicings.length > 0 && currentTab === 'fretboard' && (
      <VoicingDisplay
        selectedVoicings={selectedVoicings}
        currentVoicingIndex={currentVoicingIndex}
        chordRoot={chordRoot}
        chordType={chordType}
        currentTuning={currentTuning}
        reverseStringOrder={reverseStringOrder}
        onNext={nextVoicing}
        onPrevious={previousVoicing}
        playChord={playChord}
        theme={theme}
      />
    )}

    {/* Enhanced Legend Box */}
    <LegendBox theme={theme} />

    {/* Voicings Tab specific content */}
    {currentTab === 'voicings' && (
      <div className="mb-6">
        {/* Controls specific to the voicings tab */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <label className="text-sm mr-2 text-gray-300 w-20">Root:</label>
              <select
                value={chordRoot}
                onChange={(e) => setChordRoot(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white text-sm rounded-md px-3 py-1.5 w-full"
              >
                {allNotes.map((note) => (
                  <option key={note} value={note}>{note}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <label className="text-sm mr-2 text-gray-300 w-20">Chord:</label>
              <select
                value={chordType}
                onChange={(e) => {
                  setChordType(e.target.value);
                  setScaleType('');
                }}
                className="bg-gray-800 border border-gray-600 text-white text-sm rounded-md px-3 py-1.5 w-full"
              >
                <option value="">None</option>
                {chordTypes.map((c) => (
                  <option key={c.label} value={c.type}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <label className="text-sm mr-2 text-gray-300 w-20">Tuning:</label>
              <select
                value={currentTuning}
                onChange={(e) => setCurrentTuning(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white text-sm rounded-md px-3 py-1.5 w-full"
              >
                {Object.keys(tunings).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Prominent Chord Diagram */}
        {chordType && selectedVoicings.length > 0 ? (
          <div>
            <VoicingDisplay
              selectedVoicings={selectedVoicings}
              currentVoicingIndex={currentVoicingIndex}
              chordRoot={chordRoot}
              chordType={chordType}
              currentTuning={currentTuning}
              reverseStringOrder={reverseStringOrder}
              onNext={nextVoicing}
              onPrevious={previousVoicing}
              playChord={playChord}
              theme={theme}
              isFullView={true}
            />
            
            <div className="mt-6 mb-4">
              <h3 className={`text-md font-semibold ${isGlassmorphism ? 'text-yellow-300' : 'text-yellow-600'} mb-2`}>
                All Available Positions:
              </h3>
              <ChordPositions
                chordRoot={chordRoot}
                chordType={chordType}
                selectedVoicings={selectedVoicings}
                currentVoicingIndex={currentVoicingIndex}
                onSelectPosition={selectVoicing}
              />
            </div>
          </div>
        ) : (
          <div className={`p-8 rounded-lg border border-dashed ${isGlassmorphism ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-100'} flex flex-col items-center justify-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${isGlassmorphism ? 'text-gray-600' : 'text-gray-400'} mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p className={`text-center ${isGlassmorphism ? 'text-gray-400' : 'text-gray-500'}`}>
              Select a chord to view available voicings
            </p>
          </div>
        )}
      </div>
    )}

    {/* Analysis View Tab */}
    {currentTab === 'analysis' && (
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chord Analysis Section */}
          <div>
            <div className={`p-4 ${isGlassmorphism ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg border ${isGlassmorphism ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isGlassmorphism ? 'text-yellow-300' : 'text-yellow-600'} mb-4`}>Chord Analysis</h3>
              
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-gray-300">Root:</label>
                  <select
                    value={chordRoot}
                    onChange={(e) => setChordRoot(e.target.value)}
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-md px-3 py-1.5"
                  >
                    {allNotes.map((note) => (
                      <option key={note} value={note}>{note}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-gray-300">Chord Type:</label>
                  <select
                    value={chordType}
                    onChange={(e) => {
                      setChordType(e.target.value);
                      setScaleType('');
                    }}
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-md px-3 py-1.5"
                  >
                    <option value="">None</option>
                    {chordTypes.map((c) => (
                      <option key={c.label} value={c.type}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {chordType && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className={`text-sm font-medium ${isGlassmorphism ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Chord Notes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Tonal.Chord.getChord(chordType, chordRoot).notes.map((note, i) => (
                          <div key={note} 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium
                              ${i === 0 ? 'bg-red-500' : (i === 2 ? 'bg-green-500' : 'bg-blue-400')}`}
                            title={i === 0 ? 'Root' : (i === 2 ? '5th' : '3rd')}
                          >
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className={`text-sm font-medium ${isGlassmorphism ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Intervals:</h4>
                      <div className="bg-gray-900/60 px-3 py-2 rounded-md text-sm text-green-400 font-mono">
                        {Tonal.Chord.getChord(chordType, chordRoot).intervals.join(' - ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className={`text-sm font-medium ${isGlassmorphism ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Common Progressions:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className={`p-2 rounded-md ${isGlassmorphism ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div className="flex flex-wrap gap-2 mb-1">
                          {[chordRoot, Tonal.Note.transpose(chordRoot, '4P'), Tonal.Note.transpose(chordRoot, '5P')].map((note, i) => (
                            <span key={i} className={`px-2 py-1 rounded-md ${isGlassmorphism ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'} text-xs font-medium`}>
                              {note}{i === 0 ? '' : (i === 1 ? '4' : '5')}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">I-IV-V (Most common progression)</p>
                      </div>
                      
                      <div className={`p-2 rounded-md ${isGlassmorphism ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div className="flex flex-wrap gap-2 mb-1">
                          {[
                            `${chordRoot}`, 
                            `${Tonal.Note.transpose(chordRoot, '3M')}m`, 
                            `${Tonal.Note.transpose(chordRoot, '4P')}`, 
                            `${Tonal.Note.transpose(chordRoot, '5P')}`
                          ].map((chord, i) => (
                            <span key={i} className={`px-2 py-1 rounded-md ${isGlassmorphism ? 'bg-purple-900 text-purple-100' : 'bg-purple-100 text-purple-800'} text-xs font-medium`}>
                              {chord}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">I-iii-IV-V (Pop progression)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handlePlayChord}
                      className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm flex items-center"
                    >
                      <span className="mr-2">🔊</span>
                      <span>Play Chord</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Scale Analysis Section */}
          <div>
            <div className={`p-4 ${isGlassmorphism ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg border ${isGlassmorphism ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isGlassmorphism ? 'text-yellow-300' : 'text-yellow-600'} mb-4`}>Scale Analysis</h3>
              
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-gray-300">Root:</label>
                  <select
                    value={chordRoot}
                    onChange={(e) => setChordRoot(e.target.value)}
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-md px-3 py-1.5"
                  >
                    {allNotes.map((note) => (
                      <option key={note} value={note}>{note}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-gray-300">Scale Type:</label>
                  <select
                    value={scaleType}
                    onChange={(e) => {
                      setScaleType(e.target.value);
                      setChordType('');
                    }}
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-md px-3 py-1.5"
                  >
                    <option value="">None</option>
                    {scaleTypes.map((s) => (
                      <option key={s.label} value={s.type}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {scaleType && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h4 className={`text-sm font-medium ${isGlassmorphism ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Scale Notes:</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Tonal.Scale.get(`${chordRoot} ${scaleType}`).notes.map((note, i) => (
                          <div key={note} 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium
                              ${i === 0 ? 'bg-red-500' : (i === 4 ? 'bg-green-500' : 'bg-blue-400')}`}
                          >
                            {note}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => setCurrentTab('patterns')}
                          className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm mt-2"
                        >
                          View Scale Patterns
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className={`text-sm font-medium ${isGlassmorphism ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Key Chords:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['M', 'm', 'm', 'M', 'M', 'm', 'dim'].map((type, i) => {
                          const degree = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'][i];
                          const scaleDegree = Tonal.Scale.get(`${chordRoot} ${scaleType}`).notes[i] || '';
                          return (
                            <div key={i} className={`p-2 rounded-md ${isGlassmorphism ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-between`}>
                              <span className={`text-xs ${isGlassmorphism ? 'text-gray-300' : 'text-gray-600'}`}>{degree}</span>
                              <span className={`text-sm ${isGlassmorphism ? 'text-white' : 'text-gray-800'} font-medium`}>
                                {scaleDegree}{type === 'M' ? '' : type}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Note Selection Analysis */}
              {selectedNotes.length > 0 && (
                <div className="mt-6 border-t border-gray-700 pt-4">
                  <h4 className={`text-sm font-medium ${isGlassmorphism ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Your Selected Notes:</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedNotes.map((note, i) => (
                      <div key={i} className="px-2 py-1 rounded-md bg-gray-700 text-white text-xs">
                        {note}
                      </div>
                    ))}
                  </div>
                  
                  {detectedChord && (
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold text-green-400">Detected Chord:</h4>
                      <div className={`mt-1 px-3 py-2 rounded-md ${isGlassmorphism ? 'bg-gray-700' : 'bg-gray-200'} text-white`}>{detectedChord}</div>
                    </div>
                  )}
                  
                  {suggestedScales.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold text-blue-400">Suggested Scales:</h4>
                      <ul className="mt-1 space-y-1">
                        {suggestedScales.map((scale, i) => (
                          <li key={i} className={`px-3 py-2 rounded-md ${isGlassmorphism ? 'bg-gray-700' : 'bg-gray-200'} text-white`}>
                            {scale}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
</Layout>
);
}
