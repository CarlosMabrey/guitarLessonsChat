import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiPlay, FiSquare, FiPlus, FiMinus, FiRepeat, FiInfo } from 'react-icons/fi';
import Layout from '../../../components/ui/Layout'; // Adjust path as needed
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import * as Tone from 'tone';
import * as Tonal from 'tonal';
import Head from 'next/head';
import styles from './TonnetzPage.module.css'; // Adjust path as needed

// --- Core Note Utility Functions (Based on input_file_0.js) ---

// Improved note normalization function
const normalizePC = (note) => {
  if (!note) return null;
  
  try {
    // First get the basic pitch class from the note
    const pc = Tonal.Note.pitchClass(note);
    
    // Handle double sharps and double flats by converting to MIDI and back
    if (pc.includes('##') || pc.includes('bb') || pc.length > 2) {
      // Add an arbitrary octave for MIDI conversion
      const midiValue = Tonal.Note.midi(pc + '4');
      if (midiValue !== null) {
        // Convert back to a note name and get its pitch class
        return Tonal.Note.pitchClass(Tonal.Note.fromMidi(midiValue));
      }
    }
    
    // For normal sharps/flats, standardize to sharps
    // First try the enharmonic function
    const standardized = Tonal.Note.enharmonic(pc, pc);
    
    // If the result contains flats, further normalize to sharps
    if (standardized.includes('b')) {
      // Get the equivalent sharp note
      const flatToSharpMap = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
        'Cb': 'B',  'Fb': 'E'
      };
      return flatToSharpMap[standardized] || standardized;
    }
    
    return standardized;
  } catch (e) {
    console.error('Error in normalizePC with note:', note, e);
    return note; // Return the original if processing fails
  }
};

// Gets the display label for a sharp pitch class based on the chosen style.
function getLabel(sharpPc, style = 'both') {
  if (!sharpPc) return '';
  if (sharpPc.includes('#')) {
    const flatEnharmonic = Tonal.Note.enharmonic(sharpPc); // e.g., Tonal.Note.enharmonic("C#") -> "Db"
    if (style === 'sharps') return sharpPc;
    if (style === 'flats') return flatEnharmonic !== sharpPc ? flatEnharmonic : sharpPc; // Avoid Db/Db display
    return flatEnharmonic !== sharpPc ? `${sharpPc}/${flatEnharmonic}` : sharpPc;
  }
  return sharpPc; // Naturals
}

// Determines the state of a node for styling.
function getNodeState(gridCellSharpPC, { 
    activeNoteSharpPC, 
    manualSelectedSharpPCs, 
    structureSelectedSharpPCs, 
    currentRootSharpPC, 
    isStructureActive 
}) {
  const isRoot = gridCellSharpPC === currentRootSharpPC;

  if (activeNoteSharpPC && gridCellSharpPC === activeNoteSharpPC) return 'active';

  // If it's the root and part of any selection (manual or structure)
  if (isRoot && (manualSelectedSharpPCs.includes(gridCellSharpPC) || (isStructureActive && structureSelectedSharpPCs.includes(gridCellSharpPC)))) {
    return 'root';
  }
  
  if (manualSelectedSharpPCs.includes(gridCellSharpPC)) return 'manual';
  if (isStructureActive && structureSelectedSharpPCs.includes(gridCellSharpPC)) return 'structure';
  
  return 'default';
}

// Gets the notes (as sharp pitch classes) for a given musical structure.
const getStructureNotes = (rootNoteWithOctave, structure) => {
  if (!rootNoteWithOctave || !structure || !structure.formula || !structure.type) {
    return [];
  }
  
  // Ensure rootPC is the canonical sharp form for Tonal.js queries
  const rootPC = normalizePC(Tonal.Note.pitchClass(rootNoteWithOctave));
  const octave = Tonal.Note.octave(rootNoteWithOctave) || 4;

  try {
    let notes = [];
    
    if (structure.type === 'chord') {
      // Map chord names to valid Tonal.js chord symbols
      let chordType = '';
      
      if (structure.symbol) {
        chordType = structure.symbol;
      } else if (structure.name.toLowerCase().includes('major triad')) {
        chordType = 'M';
      } else if (structure.name.toLowerCase().includes('minor triad')) {
        chordType = 'm';
      } else if (structure.name.toLowerCase().includes('augmented')) {
        chordType = 'aug';
      } else if (structure.name.toLowerCase().includes('diminished triad')) {
        chordType = 'dim';
      } else if (structure.name.toLowerCase().includes('dominant 7th')) {
        chordType = '7';
      } else if (structure.name.toLowerCase().includes('major 7th')) {
        chordType = 'maj7';
      } else if (structure.name.toLowerCase().includes('minor 7th')) {
        chordType = 'm7';
      } else if (structure.name.toLowerCase().includes('diminished 7th')) {
        chordType = 'dim7';
      }
      
      // For augmented triads, directly calculate intervals to avoid enharmonic issues
      if (chordType === 'aug') {
        // Augmented triad is root, major third, augmented fifth (which is enharmonic to minor sixth)
        notes = [
          rootPC,
          normalizePC(Tonal.Note.transpose(rootPC, '3M')), // Major third
          normalizePC(Tonal.Note.transpose(rootPC, '6m'))  // Enharmonic to aug5
        ];
      } else {
        // Use Tonal.js to get the chord notes
        notes = Tonal.Chord.get(`${rootPC}${chordType}`).notes;
        
        // If we didn't get any notes, try another approach
        if (!notes || notes.length === 0) {
          console.log(`Trying alternative chord approach for ${rootPC}${chordType}`);
          
          // Try getting notes directly using intervals from the formula
          const intervals = structure.formula.split('-');
          notes = intervals.map(interval => {
            // Handle special cases for common intervals
            if (interval === '1') return rootPC;
            if (interval === 'b3') return normalizePC(Tonal.Note.transpose(rootPC, '3m'));
            if (interval === '3') return normalizePC(Tonal.Note.transpose(rootPC, '3M'));
            if (interval === '5') return normalizePC(Tonal.Note.transpose(rootPC, '5P'));
            if (interval === 'b5') return normalizePC(Tonal.Note.transpose(rootPC, '5d'));
            if (interval === '#5') return normalizePC(Tonal.Note.transpose(rootPC, '6m')); // Normalize aug5 to minor 6th
            if (interval === 'b7') return normalizePC(Tonal.Note.transpose(rootPC, '7m'));
            if (interval === '7') return normalizePC(Tonal.Note.transpose(rootPC, '7M'));
            if (interval === 'bb7') return normalizePC(Tonal.Note.transpose(rootPC, '7d'));
            return normalizePC(Tonal.Note.transpose(rootPC, interval));
          });
        }
      }
    } else if (structure.type === 'scale') {
      let scaleName = structure.name.toLowerCase().replace(' scale', '').trim();
      
      // Special case for whole tone scale which often has double-sharps
      if (scaleName === 'whole tone') {
        // Manually construct whole tone scale with enharmonic equivalents
        notes = [
          rootPC,
          normalizePC(Tonal.Note.transpose(rootPC, '2M')),  // Major second
          normalizePC(Tonal.Note.transpose(rootPC, '3M')),  // Major third
          normalizePC(Tonal.Note.transpose(rootPC, '4A')),  // Augmented fourth
          normalizePC(Tonal.Note.transpose(rootPC, '6m')),  // Minor sixth (enharmonic to augmented fifth)
          normalizePC(Tonal.Note.transpose(rootPC, '7m'))   // Minor seventh (enharmonic to augmented sixth)
        ];
      } else {
        // Map scale names to valid Tonal.js scale types
        if (scaleName === 'major') {
          scaleName = 'major';
        } else if (scaleName === 'natural minor') {
          scaleName = 'minor';
        } else if (scaleName === 'harmonic minor') {
          scaleName = 'harmonic minor';
        } else if (scaleName === 'melodic minor') {
          scaleName = 'melodic minor';
        } else if (scaleName === 'major pentatonic') {
          scaleName = 'pentatonic';
        } else if (scaleName === 'minor pentatonic') {
          scaleName = 'minor pentatonic';
        } else if (scaleName === 'blues') {
          scaleName = 'blues';
        } else if (scaleName === 'diminished (wh)') {
          scaleName = 'diminished';
        }
        
        // Use Tonal.js to get scale notes
        const scaleResult = Tonal.Scale.get(`${rootPC} ${scaleName}`);
        
        if (scaleResult && !scaleResult.empty) {
          notes = scaleResult.notes;
        }
        
        // If we didn't get any notes, try interval-based approach
        if (!notes || notes.length === 0) {
          console.log(`Trying alternative scale approach for ${rootPC} ${scaleName}`);
          
          // Try getting notes directly using intervals from the formula
          const intervals = structure.formula.split('-');
          notes = intervals.map(interval => {
            // Convert interval to standard form and handle enharmonics
            if (interval === '1') return rootPC;
            if (interval === '2') return normalizePC(Tonal.Note.transpose(rootPC, '2M'));
            if (interval === 'b3') return normalizePC(Tonal.Note.transpose(rootPC, '3m'));
            if (interval === '3') return normalizePC(Tonal.Note.transpose(rootPC, '3M'));
            if (interval === '4') return normalizePC(Tonal.Note.transpose(rootPC, '4P'));
            if (interval === 'b5' || interval === '#4') return normalizePC(Tonal.Note.transpose(rootPC, '4A')); // Use augmented 4th
            if (interval === '5') return normalizePC(Tonal.Note.transpose(rootPC, '5P'));
            if (interval === '#5' || interval === 'b6') return normalizePC(Tonal.Note.transpose(rootPC, '6m')); 
            if (interval === '6') return normalizePC(Tonal.Note.transpose(rootPC, '6M'));
            if (interval === 'b7') return normalizePC(Tonal.Note.transpose(rootPC, '7m'));
            if (interval === '#6') return normalizePC(Tonal.Note.transpose(rootPC, '7m')); // Use minor 7th instead of aug6
            if (interval === '7') return normalizePC(Tonal.Note.transpose(rootPC, '7M'));
            if (interval === '#7') return rootPC; // Full octave, normalize to root
            return normalizePC(Tonal.Note.transpose(rootPC, interval));
          });
        }
      }
    }
    
    // Normalize all returned notes to ensure consistency
    // This will convert any double sharps/flats to their enharmonic equivalents
    const normalizedNotes = notes.map(note => {
      // Get MIDI number and convert back to a note to normalize
      const midiNum = Tonal.Note.midi(note + '4') || 60; // Default to middle C if conversion fails
      return normalizePC(Tonal.Note.fromMidi(midiNum));
    });
    
    // Filter out duplicates
    return [...new Set(normalizedNotes)];
  } catch (error) {
    console.error(`Error in getStructureNotes for ${structure.name} with root ${rootNoteWithOctave}:`, error);
    return [];
  }
};


// --- Sidebar Component ---
const Sidebar = ({ onSelectStructure, currentRoot, onRootPcChange: onRootPcChangeProp, onOctaveChange, onShowTooltip, onHideTooltip, labelStyle }) => {
  const chords = [ /* Same chord list as before */ 
    { name: 'Major Triad', symbol: 'M', type: 'chord', formula: '1-3-5', description: 'Bright, happy sound.' },
    { name: 'Minor Triad', symbol: 'm', type: 'chord', formula: '1-b3-5', description: 'Darker, sadder sound.' },
    { name: 'Augmented Triad', symbol: 'aug', type: 'chord', formula: '1-3-#5', description: 'Tense, suspended sound.' },
    { name: 'Diminished Triad', symbol: 'dim', type: 'chord', formula: '1-b3-b5', description: 'Dissonant, unstable.' },
    { name: 'Dominant 7th', symbol: '7', type: 'chord', formula: '1-3-5-b7', description: 'Strong tension, resolves to tonic.' },
    { name: 'Major 7th', symbol: 'maj7', type: 'chord', formula: '1-3-5-7', description: 'Jazzy, mellow, rich sound.' },
    { name: 'Minor 7th', symbol: 'm7', type: 'chord', formula: '1-b3-5-b7', description: 'Smooth, often used in jazz/soul.' },
    { name: 'Diminished 7th', symbol: 'dim7', type: 'chord', formula: '1-b3-b5-bb7', description: 'Highly dissonant, strong pull.' },
  ];
  const scales = [ /* Same scale list + more */ 
    { name: 'Major', type: 'scale', formula: '1-2-3-4-5-6-7', description: 'The standard Western diatonic scale.' },
    { name: 'Natural Minor', type: 'scale', formula: '1-2-b3-4-5-b6-b7', description: 'Aeolian mode.' },
    { name: 'Harmonic Minor', type: 'scale', formula: '1-2-b3-4-5-b6-7', description: 'Minor scale with a raised 7th.' },
    { name: 'Melodic Minor', type: 'scale', formula: '1-2-b3-4-5-6-7', description: 'Ascending form.' },
    { name: 'Major Pentatonic', type: 'scale', formula: '1-2-3-5-6', description: 'Common in folk, rock, and country.' },
    { name: 'Minor Pentatonic', type: 'scale', formula: '1-b3-4-5-b7', description: 'Common in blues, rock, and pop.' },
    { name: 'Blues', type: 'scale', formula: '1-b3-4-b5-5-b7', description: 'Minor pentatonic with an added #4/b5.' },
    { name: 'Whole Tone', type: 'scale', formula: '1-2-3-#4-#5-#6', description: 'Dreamy, ambiguous sound; all whole steps.' },
    { name: 'Diminished (WH)', type: 'scale', formula: '1-2-b3-4-b5-b6-6-7', description: 'Symmetrical: Whole step, Half step pattern.' },
  ];
  const availableSharpPCs = useMemo(() => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'], []);
  const currentDisplayOctave = Tonal.Note.octave(currentRoot) || 4;
  const currentRootSharpPC = normalizePC(currentRoot);

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <label htmlFor="root-note-selector" className={styles.sidebarLabel}>Root Note:</label>
        <div className={styles.rootControlGroup}>
            <select
                id="root-note-selector"
                value={currentRootSharpPC || 'C'} // Fallback if currentRootSharpPC is null initially
                onChange={(e) => onRootPcChangeProp(e.target.value)}
                className={styles.sidebarSelect}
            >
            {availableSharpPCs.map(pc => (
                <option key={pc} value={pc}>{getLabel(pc, labelStyle)}</option>
            ))}
            </select>
            {/* <button onClick={() => onOctaveChange(-1)} className={styles.octaveButton} aria-label="Decrease octave"><FiMinus /></button>
            <span className={styles.octaveDisplay} aria-live="polite">{currentDisplayOctave}</span>
            <button onClick={() => onOctaveChange(1)} className={styles.octaveButton} aria-label="Increase octave"><FiPlus /></button> */}
        </div>
      </div>
      {[ { title: 'Chords', items: chords }, { title: 'Scales', items: scales } ].map(section => (
        <div key={section.title} className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>{section.title}</h3>
          <ul className={styles.sidebarList}>
            {section.items.map((item) => (
              <li key={item.name} className={styles.sidebarItem}>
                <button 
                  onClick={() => onSelectStructure(item)} 
                  className={styles.sidebarButton}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    onShowTooltip(`<h3>${item.name}</h3><p><strong>Formula:</strong> ${item.formula}</p><p>${item.description || ''}</p>`, rect.right + 10, rect.top);
                  }}
                  onMouseLeave={onHideTooltip}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const InfoTooltip = ({ data }) => {
  if (!data.visible || !data.content) return null;
  return (
    <div 
      className={styles.infoPopup} 
      style={{ left: `${data.x}px`, top: `${data.y}px` }}
      dangerouslySetInnerHTML={{ __html: data.content }}
    />
  );
};

// --- Main TonnetzPage Component ---
export default function TonnetzPage() {
  const canvasRef3D = useRef(null);
  
  const [currentRoot, setCurrentRoot] = useState('C4'); 
  const [selectedNotes, setSelectedNotes] = useState([]); 
  const [selectedStructure, setSelectedStructure] = useState(null); 
  const [highlightedNotes, setHighlightedNotes] = useState([]); // Sharp PCs from structure
  
  const [currentlyAnimatingNote, setCurrentlyAnimatingNote] = useState(null); // Sharp PC
  const [currentChordFromSelection, setCurrentChordFromSelection] = useState(null); 

  const [isReady, setIsReady] = useState(false);
  const [isToneStarted, setIsToneStarted] = useState(false);
  const [mode, setMode] = useState('3d');
  const [labelStyle, setLabelStyle] = useState('both');
  
  const [playbackType, setPlaybackType] = useState('arpeggio');
  const [loopPlaybackEnabled, setLoopPlaybackEnabled] = useState(false);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false); 
  
  const activePlaybackTimeoutRef = useRef(null); 
  const arpeggioNoteTimeoutsRef = useRef([]); 

  const [cols2D, setCols2D] = useState(8);
  const [rows2D, setRows2D] = useState(6);
  
  const [tooltipData, setTooltipData] = useState({ visible: false, content: null, x: 0, y: 0 });
  const showTooltip = useCallback((content, x, y) => setTooltipData({ visible: true, content, x, y }), []);
  const hideTooltip = useCallback(() => setTooltipData({ visible: false, content: null, x: 0, y: 0 }), []);

  // Memoized derived state (all sharp PCs)
  const currentRootSharpPC = useMemo(() => normalizePC(currentRoot), [currentRoot]);
  const manualSelectedSharpPCs = useMemo(() => selectedNotes.map(note => normalizePC(Tonal.Note.pitchClass(note))), [selectedNotes]);

  const handleSelectStructure = (structure) => {
    // First clear any existing manual selections
    setSelectedNotes([]);
    setSelectedStructure(structure);
    
    // Calculate the notes for the structure with the current root
    const structureNotes = getStructureNotes(currentRoot, structure);
    console.log(`Structure ${structure.name} with root ${currentRoot} gives notes:`, structureNotes);
    
    // Set the highlighted notes
    setHighlightedNotes(structureNotes);
  };

  const handleSelectNoteFor2D = useCallback((clickedSharpPC) => {
    setSelectedStructure(null); setHighlightedNotes([]);   
    const octaveForSelection = Tonal.Note.octave(currentRoot) || 4;
    const noteWithOctave = `${clickedSharpPC}${octaveForSelection}`; 
    setSelectedNotes(prev => prev.includes(noteWithOctave) ? prev.filter(n => n !== noteWithOctave) : [...prev, noteWithOctave]);
  }, [currentRoot]);

  
  // 3D Rendering Effect
  useEffect(() => {
    if (mode !== '3d' || !isReady || !isToneStarted || !canvasRef3D.current) return;

    let scene, camera, renderer, controls, threeClickSynth;
    let localGridNodes = []; 
    let connectionLine = null; 
    let animationFrameId;

    const initScene = () => {
        scene = new THREE.Scene();
        scene.background = new THREE.Color('#0a0920'); // Darker space blue
        
        // Wider field of view for better text visibility
        camera = new THREE.PerspectiveCamera(65, canvasRef3D.current.clientWidth / canvasRef3D.current.clientHeight, 0.1, 1000);
        camera.position.set(0, -1, 6.5); // Adjusted position for better text view
        
        renderer = new THREE.WebGLRenderer({ 
            canvas: canvasRef3D.current, 
            antialias: true,
            alpha: false,
            preserveDrawingBuffer: true // Important for text quality
        });
        renderer.setClearColor(scene.background);
        renderer.setSize(canvasRef3D.current.clientWidth, canvasRef3D.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for better text
        renderer.shadowMap.enabled = true;
        
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 3;
        controls.maxDistance = 12; // Reduced max distance to prevent text scaling issues
        controls.maxPolarAngle = Math.PI / 1.5;
        controls.minPolarAngle = Math.PI / 6;
        controls.target.set(0, -1, 0);
        
        // Improved lighting for better text visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(3, 6, 4);
        dirLight.castShadow = true;
        scene.add(dirLight);
        
        // Add a soft hemisphere light for better color
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
        scene.add(hemiLight);
        
        threeClickSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    };

    const materials = {
        default: new THREE.MeshStandardMaterial({ 
            color: 0x5070a0, 
            metalness: 0.4, 
            roughness: 0.7,
            emissive: 0x203040,
            emissiveIntensity: 0.1
        }),
        manual: new THREE.MeshStandardMaterial({ 
            color: 0xe09840, 
            emissive: 0xc07020, 
            emissiveIntensity: 0.5,
            metalness: 0.4, 
            roughness: 0.5 
        }),
        structure: new THREE.MeshStandardMaterial({ 
            color: 0x30b078, 
            emissive: 0x189058, 
            emissiveIntensity: 0.5,
            metalness: 0.3, 
            roughness: 0.6 
        }),
        active: new THREE.MeshStandardMaterial({ 
            color: 0xf0e050, 
            emissive: 0xd8c030, 
            emissiveIntensity: 1.0,
            metalness: 0.3, 
            roughness: 0.4 
        }),
        root: new THREE.MeshStandardMaterial({ 
            color: 0xe04848, 
            emissive: 0xc02828, 
            emissiveIntensity: 0.8,
            metalness: 0.5, 
            roughness: 0.4 
        }),
    };
    
    // Smaller geometry for better fitting in the card
    const nodeGeometry = new THREE.SphereGeometry(0.25, 16, 10);
    const gridSharpPCsList = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const gridNodePositions = {}; 

    const buildGridAndLines = () => {
        localGridNodes.forEach(node => {
            if (node.sphere) { scene.remove(node.sphere); node.sphere.geometry.dispose(); if (node.sphere.material.dispose) node.sphere.material.dispose(); }
            if (node.labelSprite) { scene.remove(node.labelSprite); if (node.labelSprite.material.map) node.labelSprite.material.map.dispose(); node.labelSprite.material.dispose(); }
        });
        localGridNodes = [];
        if (connectionLine) { scene.remove(connectionLine); connectionLine.geometry.dispose(); connectionLine.material.dispose(); connectionLine = null; }

        // Redesigned tonnetz grid layout
        // Using a cleaner arrangement that fits better in the view
        // Position nodes in a traditional tonnetz pattern (triangular lattice)
        const positions = [
            { note: 'C', x: -2, y: 2, z: 0 },
            { note: 'G', x: 0, y: 2, z: 0 },
            { note: 'D', x: 2, y: 2, z: 0 },
            
            { note: 'E', x: -3, y: 0, z: 0 },
            { note: 'B', x: -1, y: 0, z: 0 },
            { note: 'F#', x: 1, y: 0, z: 0 },
            { note: 'C#', x: 3, y: 0, z: 0 },
            
            { note: 'G#', x: -2, y: -2, z: 0 },
            { note: 'D#', x: 0, y: -2, z: 0 },
            { note: 'A#', x: 2, y: -2, z: 0 },
            
            { note: 'F', x: -1, y: -4, z: 0 },
            { note: 'A', x: 1, y: -4, z: 0 }
        ];
        
        const currentDisplayOctave = Tonal.Note.octave(currentRoot) || 4;

        // Create nodes and map positions
        positions.forEach(pos => {
            const sharpPC = pos.note;
            gridNodePositions[sharpPC] = new THREE.Vector3(pos.x, pos.y, pos.z);
            const noteWithOctaveForClick = `${sharpPC}${currentDisplayOctave}`;
            
            const nodeStateKey = getNodeState(sharpPC, {
                activeNoteSharpPC: currentlyAnimatingNote,
                manualSelectedSharpPCs: manualSelectedSharpPCs,
                structureSelectedSharpPCs: highlightedNotes,
                currentRootSharpPC: currentRootSharpPC,
                isStructureActive: !!selectedStructure
            });
            
            // Create the sphere for this note
            const sphereMat = materials[nodeStateKey] ? materials[nodeStateKey].clone() : materials.default.clone();
            const sphere = new THREE.Mesh(nodeGeometry, sphereMat);
            sphere.position.set(pos.x, pos.y, pos.z);
            sphere.castShadow = true;
            sphere.userData = { sharpPC, noteWithOctave: noteWithOctaveForClick };
            scene.add(sphere);
            
            // Create a better label with small text
            const labelText = getLabel(sharpPC, labelStyle);
            
            // Create a canvas for the text with improved aesthetics
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 32;
            
            // Create a gradient background for more aesthetic appearance
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(20, 20, 40, 0.85)');
            gradient.addColorStop(1, 'rgba(10, 10, 20, 0.85)');
            ctx.fillStyle = gradient;
            
            // Rounded rectangle for background
            ctx.beginPath();
            const cornerRadius = 5;
            ctx.moveTo(cornerRadius, 0);
            ctx.lineTo(canvas.width - cornerRadius, 0);
            ctx.quadraticCurveTo(canvas.width, 0, canvas.width, cornerRadius);
            ctx.lineTo(canvas.width, canvas.height - cornerRadius);
            ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - cornerRadius, canvas.height);
            ctx.lineTo(cornerRadius, canvas.height);
            ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - cornerRadius);
            ctx.lineTo(0, cornerRadius);
            ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
            ctx.closePath();
            ctx.fill();
            
            // Add a glowing border
            const borderGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            borderGradient.addColorStop(0, 'rgba(100, 180, 255, 0.5)');
            borderGradient.addColorStop(1, 'rgba(70, 120, 200, 0.3)');
            ctx.strokeStyle = borderGradient;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Set text properties with shadow for depth
            const fontSize = 16;
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw text shadow for depth
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            // Draw text with a subtle gradient
            const textGradient = ctx.createLinearGradient(0, canvas.height/2 - 8, 0, canvas.height/2 + 8);
            textGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            textGradient.addColorStop(1, 'rgba(210, 230, 255, 0.95)');
            ctx.fillStyle = textGradient;
            ctx.fillText(labelText, canvas.width/2, canvas.height/2);
            
            // Reset shadow for cleaner rendering
            ctx.shadowColor = 'transparent';
            
            // Create texture and material with improved settings
            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            
            const labelMat = new THREE.SpriteMaterial({ 
                map: texture,
                transparent: true,
                depthTest: false,
                depthWrite: false
            });
            
            // Create sprite with slightly larger scale for better visibility
            const labelSprite = new THREE.Sprite(labelMat);
            labelSprite.scale.set(0.45, 0.22, 1);
            
            // Position the label near the sphere - adjusted for better placement
            labelSprite.position.set(pos.x, pos.y + 0.38, pos.z);
            
            // Add to scene
            scene.add(labelSprite);
            
            // Store for cleanup
            localGridNodes.push({ sphere, labelSprite, sharpPC });
        });

        // Connect nodes that are part of the selected structure
        if (selectedStructure && highlightedNotes.length > 1) {
            const points = [];
            // Sort by MIDI value for consistent line paths
            const sortedStructurePCs = [...highlightedNotes].sort(
                (a, b) => (Tonal.Note.midi(a + '4') || 0) - (Tonal.Note.midi(b + '4') || 0)
            );
            
            // Create a line connecting all nodes in sequence with a closed loop
            for (let i = 0; i < sortedStructurePCs.length; i++) {
                const pc1 = sortedStructurePCs[i];
                const pc2 = sortedStructurePCs[(i + 1) % sortedStructurePCs.length]; 
                
                if (gridNodePositions[pc1] && gridNodePositions[pc2]) {
                    points.push(gridNodePositions[pc1].clone());
                    points.push(gridNodePositions[pc2].clone());
                }
            }
            
            if (points.length > 0) {
                const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
                const lineMat = new THREE.LineBasicMaterial({ 
                    color: 0x28c8a0, 
                    linewidth: 1.5, 
                    transparent: true, 
                    opacity: 0.75 
                });
                connectionLine = new THREE.LineSegments(lineGeom, lineMat);
                scene.add(connectionLine);
            }
        }
    };
    
    const onWindowResize = () => {
        if (!canvasRef3D.current) return;
        
        // Get the current dimensions of the container
        const container = canvasRef3D.current.parentElement;
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Update camera aspect ratio
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        // Resize renderer
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    };
    
    const onMouseClick3D = (event) => {
        if (!isToneStarted) return;
        
        const rect = canvasRef3D.current.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(localGridNodes.map(node => node.sphere));
        
        if (intersects.length > 0) {
            const clickedSphere = intersects[0].object;
            const clickedSharpPC = clickedSphere.userData.sharpPC;
            if (clickedSharpPC) {
                threeClickSynth.triggerAttackRelease(clickedSphere.userData.noteWithOctave, '16n', Tone.now());
                handleSelectNoteFor2D(clickedSharpPC);
            }
        }
    };

    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        controls.update();
        
        // Enhanced animation effects
        const time = Date.now() * 0.001; // Seconds since start
        
        localGridNodes.forEach(node => {
            // Get current node state for appropriate animation
            const stateKey = getNodeState(node.sharpPC, { 
                activeNoteSharpPC: currentlyAnimatingNote, 
                manualSelectedSharpPCs: manualSelectedSharpPCs, 
                structureSelectedSharpPCs: highlightedNotes, 
                currentRootSharpPC: currentRootSharpPC, 
                isStructureActive: !!selectedStructure 
            });
            
            // Reset animation if state changed
            if (node.lastState !== stateKey) {
                node.lastState = stateKey;
                
                // Only animate these states
                if (stateKey === 'root' || stateKey === 'active') {
                    // Subtle scale pulsing for root notes
                    if (stateKey === 'root' && node.sphere) {
                        const scale = 1.0 + Math.sin(time * 3) * 0.1;
                        node.sphere.scale.set(scale, scale, scale);
                        
                        // Subtle emissive pulsing
                        if (node.sphere.material && node.sphere.material.emissive) {
                            node.sphere.material.emissiveIntensity = 0.6 + Math.sin(time * 3) * 0.3;
                        }
                    }
                    
                    // More pronounced effects for active (playing) notes
                    if (stateKey === 'active' && node.sphere) {
                        const scale = 1.1 + Math.sin(time * 10) * 0.15;
                        node.sphere.scale.set(scale, scale, scale);
                        
                        if (node.sphere.material && node.sphere.material.emissive) {
                            node.sphere.material.emissiveIntensity = 1.0 + Math.sin(time * 10) * 0.5;
                        }
                    }
                } else {
                    // Reset scale for other states
                    if (node.sphere) {
                        node.sphere.scale.set(1, 1, 1);
                        
                        // Reset emissive intensity to default
                        if (node.sphere.material && node.sphere.material.emissive && materials[stateKey]) {
                            node.sphere.material.emissiveIntensity = 
                                materials[stateKey].emissiveIntensity || 0;
                        }
                    }
                }
            }
        });
        
        renderer.render(scene, camera);
    };

    initScene();
    buildGridAndLines(); 
    window.addEventListener('resize', onWindowResize); 
    onWindowResize();
    canvasRef3D.current.addEventListener('click', onMouseClick3D);
    animate();

    return () => {
        window.removeEventListener('resize', onWindowResize);
        if (canvasRef3D.current) canvasRef3D.current.removeEventListener('click', onMouseClick3D);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        localGridNodes.forEach(node => {
            if(node.sphere) { scene.remove(node.sphere); node.sphere.geometry.dispose(); if(node.sphere.material.dispose) node.sphere.material.dispose(); }
            if(node.labelSprite) { scene.remove(node.labelSprite); if(node.labelSprite.material.map) node.labelSprite.material.map.dispose(); node.labelSprite.material.dispose(); }
        });
        if (connectionLine) { scene.remove(connectionLine); connectionLine.geometry.dispose(); connectionLine.material.dispose(); }
        Object.values(materials).forEach(mat => mat.dispose());
        nodeGeometry.dispose();
        if (threeClickSynth) threeClickSynth.dispose();
        if (controls) controls.dispose();
        if(scene) { while(scene.children.length > 0){ const child = scene.children[0]; scene.remove(child); if(child.dispose) child.dispose(); } }
        if (renderer) renderer.dispose();
    };
  }, [
    isReady, isToneStarted, mode, labelStyle, currentRoot, 
    selectedNotes, selectedStructure, highlightedNotes, 
    currentlyAnimatingNote, 
    manualSelectedSharpPCs, currentRootSharpPC, handleSelectNoteFor2D
  ]);

  useEffect(() => { // Chord Detection
    if (selectedNotes.length >= 1) {
      try {
        const pcsForDetection = selectedNotes.map(noteWithOctave => normalizePC(Tonal.Note.pitchClass(noteWithOctave)));
        const detected = Tonal.Chord.detect(pcsForDetection);
        // If only one note selected, show that note as "detected" for clarity
        setCurrentChordFromSelection(detected.length > 0 ? detected[0] : (pcsForDetection.length === 1 ? getLabel(pcsForDetection[0], labelStyle) : null));
      } catch (e) { setCurrentChordFromSelection(null); console.warn("Chord detection error:", e); }
    } else { setCurrentChordFromSelection(null); }
  }, [selectedNotes, labelStyle]); // Add labelStyle as dependency if getLabel is used within

  const handleUserStart = async () => {
    if (!isToneStarted) { await Tone.start(); setIsToneStarted(true); }
    setIsReady(true);
  };
  
  const handleRootPcChange = (newSharpPc) => {
    const currentOctave = Tonal.Note.octave(currentRoot) || 4;
    const newRoot = `${newSharpPc}${currentOctave}`;
    setCurrentRoot(newRoot);
    
    // If a structure is selected, update its notes with the new root
    if (selectedStructure) {
      const structureNotes = getStructureNotes(newRoot, selectedStructure);
      console.log(`Updated structure ${selectedStructure.name} for new root ${newRoot} gives notes:`, structureNotes);
      setHighlightedNotes(structureNotes);
    }
  };

  const handleOctaveChange = (delta) => {
    const pc = normalizePC(currentRoot);
    let oct = Tonal.Note.octave(currentRoot) || 4;
    oct = Math.max(2, Math.min(6, oct + delta)); // Limit octave range for better usability
    const newRoot = `${pc}${oct}`;
    setCurrentRoot(newRoot);
    
    // If a structure is selected, update its notes with the new root and octave
    if (selectedStructure) {
      const structureNotes = getStructureNotes(newRoot, selectedStructure);
      setHighlightedNotes(structureNotes);
    }
  };
  

  const stopAllPlayback = useCallback(() => {
    setIsPlaybackActive(false);
    setLoopPlaybackEnabled(false); 
    if (activePlaybackTimeoutRef.current) clearTimeout(activePlaybackTimeoutRef.current);
    arpeggioNoteTimeoutsRef.current.forEach(clearTimeout);
    arpeggioNoteTimeoutsRef.current = [];
    setCurrentlyAnimatingNote(null);
    // Consider a more targeted way to stop/dispose only playback synths if necessary
  }, []);

  const clearAllSelections = () => {
    stopAllPlayback();
    setSelectedNotes([]); setHighlightedNotes([]);
    setSelectedStructure(null); setCurrentChordFromSelection(null);
  };

  // Unified Playback Function - Fix loop functionality
  const playCurrentSelection = async (isLoopIteration = false) => {
    if (!isToneStarted) await Tone.start();
    
    // If it's not a loop iteration and something is already playing, stop it first
    if (!isLoopIteration && isPlaybackActive) {
      stopAllPlayback();
    }

    let notesToPlayPCs = []; 
    const playbackOctave = 4; // Always use octave 4 for consistent playback

    if (selectedStructure && highlightedNotes.length > 0) {
      notesToPlayPCs = highlightedNotes;
    } else if (selectedNotes.length > 0) {
      notesToPlayPCs = manualSelectedSharpPCs;
    } else {
      if (isLoopIteration) {
        stopAllPlayback();
      }
      return;
    }

    if (notesToPlayPCs.length === 0) {
      if (isLoopIteration) {
        stopAllPlayback();
      }
      return;
    }
    
    const notesWithOctavesForPlayback = notesToPlayPCs.map(pc => `${pc}${playbackOctave}`);
    
    // Set active state
    setIsPlaybackActive(true);

    const playbackSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now();

    // Clear previous timeouts and animation
    arpeggioNoteTimeoutsRef.current.forEach(clearTimeout); 
    arpeggioNoteTimeoutsRef.current = [];
    setCurrentlyAnimatingNote(null);

    let totalDurationMs = 0;

    if (playbackType === 'arpeggio') {
      const noteDurationSec = 0.22;
      const intervalSec = 0.19;
      
      notesWithOctavesForPlayback.forEach((note, index) => {
        const startTime = now + index * intervalSec;
        playbackSynth.triggerAttackRelease(note, noteDurationSec, startTime);
        
        const animTimeout = setTimeout(() => {
          setCurrentlyAnimatingNote(normalizePC(note));
        }, (startTime - now) * 1000 - 15);
        
        arpeggioNoteTimeoutsRef.current.push(animTimeout);
      });
      
      totalDurationMs = ((notesWithOctavesForPlayback.length - 1) * intervalSec + noteDurationSec) * 1000;
    } else { // Block Chord
      const chordDurationSec = 0.75;
      playbackSynth.triggerAttackRelease(notesWithOctavesForPlayback, chordDurationSec, now);
      totalDurationMs = chordDurationSec * 1000;
    }

    // Set timeout for end of playback
    activePlaybackTimeoutRef.current = setTimeout(() => {
      setCurrentlyAnimatingNote(null);
      playbackSynth.dispose();
      
      // Check if loop is still enabled and active to continue playing
      if (loopPlaybackEnabled && isPlaybackActive) {
        playCurrentSelection(true);
      } else {
        setIsPlaybackActive(false);
      }
    }, totalDurationMs + (loopPlaybackEnabled ? 250 : 50));
  };
  
  const handlePlayOnce = () => {
    // If a loop is active, the user pressing "Play Once" should probably stop the loop and play once.
    if (loopPlaybackEnabled && isPlaybackActive) {
        stopAllPlayback(); // This will set loopPlaybackEnabled false.
    }
    setLoopPlaybackEnabled(false); // Explicitly ensure loop is off.
    playCurrentSelection(false);
  };
  
  const handleToggleLoop = () => {
    if (loopPlaybackEnabled && isPlaybackActive) {
      // Currently looping, so stop it
      stopAllPlayback();
    } else {
      // Start looping
      setLoopPlaybackEnabled(true);
      playCurrentSelection(false); // Start fresh
    }
  };

  return (
    <Layout title="Interactive Tonnetz">
      <Head>
        <title>Interactive Tonnetz | Music Theory</title>
        <meta name="description" content="Explore chords and scales on an interactive Tonnetz diagram." />
      </Head>
      <InfoTooltip data={tooltipData} />
      <div className={styles.tonnetzPageContainer}>
        <Sidebar
            onSelectStructure={handleSelectStructure}
            currentRoot={currentRoot}
            onRootPcChange={handleRootPcChange}
            onOctaveChange={handleOctaveChange}
            onShowTooltip={showTooltip} 
            onHideTooltip={hideTooltip} 
            labelStyle={labelStyle}
        />
        <div className={styles.mainContent}>
          <header className={styles.pageHeader}>
            <Link href="/theory" legacyBehavior><a className={styles.backLink}><FiArrowLeft /> Back to Theory</a></Link>
            <h1>Interactive Tonnetz Diagram</h1>
            <p>Select structures, click notes, and explore music theory visually.</p>
          </header>

          {!isReady || !isToneStarted ? (
            <div className={styles.startContainer}>
              <button onClick={handleUserStart} className={styles.startButton}>Start Visualization & Audio</button>
            </div>
          ) : (
            <>
              <div className={styles.controlsBar}>
                <div className={styles.controlGroup}>
                    <button onClick={() => setMode(prev => prev === '3d' ? '2d' : '3d')} className={styles.controlButton}>
                        View: {mode === '3d' ? '3D' : '2D'}
                    </button>
                </div>
                {mode === '2d' && ( <>
                    <div className={styles.controlGroupMini}>
                        <label htmlFor="cols2d-range">Cols: {cols2D}</label>
                        <input id="cols2d-range" type="range" min={3} max={16} value={cols2D} onChange={e => setCols2D(Number(e.target.value))} />
                    </div>
                    <div className={styles.controlGroupMini}>
                        <label htmlFor="rows2d-range">Rows: {rows2D}</label>
                        <input id="rows2d-range" type="range" min={2} max={12} value={rows2D} onChange={e => setRows2D(Number(e.target.value))} />
                    </div>
                </>)}
                <div className={styles.controlGroup}>
                    <label htmlFor="playback-type-select">Playback:</label>
                    <select id="playback-type-select" value={playbackType} onChange={e => setPlaybackType(e.target.value)} className={styles.controlSelect}>
                        <option value="arpeggio">Arpeggio</option>
                        <option value="chord">Block Chord</option>
                    </select>
                </div>
                <div className={styles.controlGroup}>
                    <span className={styles.controlLabel}>Labels:</span>
                    {['sharps', 'flats', 'both'].map(style => (
                        <label key={style} className={styles.radioLabel}>
                          <input type="radio" name="labelStyle" value={style} checked={labelStyle === style} onChange={() => setLabelStyle(style)}/>
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </label>
                    ))}
                </div>
                <div className={styles.controlGroup}>
                     <button onClick={handlePlayOnce} disabled={isPlaybackActive && loopPlaybackEnabled} className={styles.controlButton} title="Play Once">
                        <FiPlay /> Play
                    </button>
                    <button onClick={handleToggleLoop} className={`${styles.controlButton} ${loopPlaybackEnabled && isPlaybackActive ? styles.activeButton : ''}`} title="Toggle Loop">
                        <FiRepeat /> {loopPlaybackEnabled && isPlaybackActive ? 'Looping' : 'Loop Off'}
                    </button>
                    <button onClick={stopAllPlayback} disabled={!isPlaybackActive} className={styles.controlButton} title="Stop Playback">
                        <FiSquare /> Stop
                    </button>
                </div>
              </div>

              <div className={styles.tonnetzVisualizationArea}>
                {mode === '3d' ? (
                  <div className={styles.canvasContainer3d}>
                    <canvas ref={canvasRef3D} />
                    <div className={styles.canvasOverlayText}>
                      Drag to rotate | Scroll to zoom | Click notes to select
                    </div>
                  </div>
                ) : (
                  <Tonnetz2D
                    selectedNotes={selectedNotes} 
                    highlightedNotes={highlightedNotes}
                    onSelectNote={handleSelectNoteFor2D}
                    cols={cols2D} rows={rows2D}
                    currentlyAnimatingNotePc={currentlyAnimatingNote}
                    labelStyle={labelStyle}
                    currentRootPc={currentRootSharpPC}
                  />
                )}
              </div>

              <div className={styles.infoAndActions}>
                <div className={styles.infoBox}>
                    <h3><FiInfo className={styles.infoIcon}/> Selection Details</h3>
                    <p><strong>Root:</strong> {getLabel(currentRootSharpPC, labelStyle)}</p>
                    {selectedStructure && <p><strong>Structure:</strong> {selectedStructure.name}</p>}
                    <p><strong>Highlighted Notes:</strong> {highlightedNotes.map(pc => getLabel(pc, labelStyle)).join(', ') || 'None'}</p>
                    <p><strong>Selected Notes:</strong> {manualSelectedSharpPCs.map(pc => getLabel(pc, labelStyle)).join(', ') || 'None'}</p>
                    {currentChordFromSelection && <p><strong>Detected Chord:</strong> {currentChordFromSelection}</p>}
                </div>
                <button onClick={clearAllSelections} className={`${styles.actionButton} ${styles.dangerButton}`}>Clear All Selections</button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

// --- Tonnetz2D Component ---
function Tonnetz2D({ 
    selectedNotes, highlightedNotes, onSelectNote, 
    cols, rows, currentlyAnimatingNotePc, labelStyle, currentRootPc,
}) {
  const canvasRef2D = useRef(null);
  const [hoveredCell, setHoveredCell] = useState(null); 
  const [toneSynth2D, setToneSynth2D] = useState(null);
  const [tooltipState, setTooltipState] = useState({ visible: false, x: 0, y: 0, text: '' });
  
  const gridSharpPCsList = useMemo(() => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'], []);

  useEffect(() => {
    if (Tone.context.state === 'running' && !toneSynth2D) {
        setToneSynth2D(new Tone.PolySynth(Tone.Synth).toDestination());
    }
    return () => { if (toneSynth2D) { toneSynth2D.releaseAll(); toneSynth2D.dispose(); } }; // Ensure releaseAll before dispose
  }, []); 

  const getNoteAtCell = useCallback((c, r) => gridSharpPCsList[(7 * c + 4 * r) % 12], [gridSharpPCsList]);

  const manualSelectedSharpPCs = useMemo(() => 
    selectedNotes.map(noteWithOctave => normalizePC(Tonal.Note.pitchClass(noteWithOctave)))
  , [selectedNotes]);

  useEffect(() => { 
    const canvas = canvasRef2D.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return; 

    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width; const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const colors = { // Consistent with 3D for better UX
      bg: '#0c0c1c', nodeDefault: '#5070a0', nodeSelectedManual: '#e09840',
      nodeHighlightedStructure: '#30b078', nodeActivelyPlaying: '#f0e050',
      nodeRoot: '#e04848', nodeHover: '#6888b8', label: '#d8e0f0', lineStructure: '#28c8a0'
    };
    ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, width, height);

    // Hexagon layout calculations (pointy top)
    const R = Math.min(width / (cols * 1.5 + 0.5), height / (rows * Math.sqrt(3) + Math.sqrt(3)/2)) * 0.9; // Hex radius (center to vertex)
    if (R <= 1) return; // Hexes too small to draw
    const r_inner = R * (Math.sqrt(3) / 2); // Inner radius (center to mid-side)
    const hexWidth = 2 * r_inner;
    const hexHeight = R * 1.5; // Vertical distance between rows for pointy top

    const totalGridWidth = cols * hexWidth + (cols > 1 ? hexWidth / 2 : 0) ; // Staggered grid width
    const totalGridHeight = rows * hexHeight + (rows > 1 ? hexHeight / 2 : 0);

    // Start drawing from top-left, ensuring grid is centered
    const x_offset = (width - totalGridWidth) / 2 + r_inner; 
    const y_offset = (height - totalGridHeight) / 2 + R;

    const nodePositions2D = {}; // For line drawing

    for (let r_idx = 0; r_idx < rows; r_idx++) {
      for (let c_idx = 0; c_idx < cols; c_idx++) {
        const gridCellSharpPC = getNoteAtCell(c_idx, r_idx);
        // For pointy top hex, x is based on col, y is based on row and col (for stagger)
        const x = x_offset + c_idx * hexWidth + (r_idx % 2 === 1 ? r_inner : 0);
        const y = y_offset + r_idx * hexHeight;
        nodePositions2D[gridCellSharpPC] = nodePositions2D[gridCellSharpPC] || []; // Store all positions for a PC
        nodePositions2D[gridCellSharpPC].push({x, y});


        const nodeStateKey = getNodeState(gridCellSharpPC, {
          activeNoteSharpPC: currentlyAnimatingNotePc,
          manualSelectedSharpPCs: manualSelectedSharpPCs,
          structureSelectedSharpPCs: highlightedNotes,
          currentRootSharpPC: currentRootPc,
          isStructureActive: highlightedNotes.length > 0 
        });
        
        let currentFill = colors.nodeDefault;
        if (nodeStateKey === 'active') currentFill = colors.nodeActivelyPlaying;
        else if (nodeStateKey === 'root') currentFill = colors.nodeRoot;
        else if (nodeStateKey === 'manual') currentFill = colors.nodeSelectedManual;
        else if (nodeStateKey === 'structure') currentFill = colors.nodeHighlightedStructure;
        
        if (hoveredCell && hoveredCell.col === c_idx && hoveredCell.row === r_idx && nodeStateKey === 'default') {
            currentFill = colors.nodeHover;
        }

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          ctx.lineTo(x + R * Math.cos(Math.PI / 3 * i), y + R * Math.sin(Math.PI / 3 * i)); // Pointy top
        }
        ctx.closePath();
        ctx.fillStyle = currentFill; ctx.fill();
        
        const labelText = getLabel(gridCellSharpPC, labelStyle);
        ctx.fillStyle = colors.label;
        ctx.font = `bold ${Math.max(7, Math.round(R * 0.45))}px Arial`; // Dynamic font size
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(labelText, x, y);
      }
    }
    // Draw lines for structure
    if (highlightedNotes.length > 1) {
        ctx.strokeStyle = colors.lineStructure;
        ctx.lineWidth = Math.max(1, R * 0.08); // Thinner lines for 2D
        ctx.globalAlpha = 0.7;
        const sortedStructurePCs = [...highlightedNotes].sort((a, b) => (Tonal.Note.midi(a + '4') || 0) - (Tonal.Note.midi(b + '4') || 0));
        
        for (let i = 0; i < sortedStructurePCs.length; i++) {
            const pc1 = sortedStructurePCs[i];
            const pc2 = sortedStructurePCs[(i + 1) % sortedStructurePCs.length]; // Connect back to start
            
            const pos1Candidates = nodePositions2D[pc1];
            const pos2Candidates = nodePositions2D[pc2];

            if (pos1Candidates && pos1Candidates.length > 0 && pos2Candidates && pos2Candidates.length > 0) {
                // Find closest pair of instances for pc1 and pc2 to draw a line
                // This is a simplification; a more robust approach might use a graph algorithm
                // or connect all instances, or pick the "Tonnetz-logical" ones.
                // For now, just pick the first instance found for simplicity.
                const p1 = pos1Candidates[0];
                let p2 = pos2Candidates[0];
                // If pc1 and pc2 are the same (e.g. octave in a structure), don't draw line to self using same instance
                if (pc1 === pc2 && pos1Candidates.length > 1) p2 = pos1Candidates[1]; 
                else if (pc1 === pc2) continue; // Skip if only one instance of the same PC

                // If multiple instances, find the pair with shortest distance
                let shortestDist = Infinity;
                let bestP1 = p1, bestP2 = p2;

                for (const candP1 of pos1Candidates) {
                    for (const candP2 of pos2Candidates) {
                        if (pc1 === pc2 && candP1.x === candP2.x && candP1.y === candP2.y) continue; // Don't connect a node to itself
                        const dist = Math.sqrt(Math.pow(candP1.x - candP2.x, 2) + Math.pow(candP1.y - candP2.y, 2));
                        if (dist < shortestDist) {
                            shortestDist = dist;
                            bestP1 = candP1;
                            bestP2 = candP2;
                        }
                    }
                }
                ctx.beginPath();
                ctx.moveTo(bestP1.x, bestP1.y);
                ctx.lineTo(bestP2.x, bestP2.y);
                ctx.stroke();
            }
        }
        ctx.globalAlpha = 1.0;
    }

  }, [
    cols, rows, labelStyle, hoveredCell, currentlyAnimatingNotePc, 
    highlightedNotes, manualSelectedSharpPCs, currentRootPc, 
    getNoteAtCell 
  ]);

  const handle2DInteraction = (event, isClick) => {
    const canvas = canvasRef2D.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const R = Math.min(rect.width / (cols * 1.5 + 0.5), rect.height / (rows * Math.sqrt(3) + Math.sqrt(3)/2)) * 0.9;
    if (R <= 1) return;
    const r_inner = R * (Math.sqrt(3) / 2);
    const hexWidth = 2 * r_inner;
    const hexHeight = R * 1.5;
    const x_offset = (rect.width - (cols * hexWidth + (cols > 1 ? hexWidth / 2 : 0)) ) / 2 + r_inner;
    const y_offset = (rect.height - (rows * hexHeight + (rows > 1 ? hexHeight / 2 : 0)) ) / 2 + R;
    
    let foundCell = null;
    for (let r_idx = 0; r_idx < rows; r_idx++) {
      for (let c_idx = 0; c_idx < cols; c_idx++) {
        const cellX = x_offset + c_idx * hexWidth + (r_idx % 2 === 1 ? r_inner : 0);
        const cellY = y_offset + r_idx * hexHeight;
        // Hexagon hit detection (distance from center)
        const dx = Math.abs(clickX - cellX);
        const dy = Math.abs(clickY - cellY);
        // A common approximation for hex hit detection:
        if (dx <= r_inner && dy <= R / 2) { // Inside bounding box of flat part
             foundCell = { col: c_idx, row: r_idx, note: getNoteAtCell(c_idx, r_idx) }; break;
        } else if (dx <= R * (Math.sqrt(3)/2) && dy <= R && ( (r_inner-dx)* (R/2) + (R-dy) * r_inner >= r_inner * (R/2) ) ){ // More precise for points
             foundCell = { col: c_idx, row: r_idx, note: getNoteAtCell(c_idx, r_idx) }; break;
        } // A simpler circular hit test:
        // const distance = Math.sqrt(Math.pow(clickX - cellX, 2) + Math.pow(clickY - cellY, 2));
        // if (distance < R) { foundCell = { col: c_idx, row: r_idx, note: getNoteAtCell(c_idx, r_idx) }; break; }
      }
      if (foundCell) break;
    }

    if (isClick) {
      if (foundCell) {
        onSelectNote(foundCell.note); 
        if (toneSynth2D) toneSynth2D.triggerAttackRelease(foundCell.note + '4', '16n', Tone.now()); 
      }
    } else { // MouseMove
      if (foundCell) {
        setHoveredCell(foundCell);
        setTooltipState({ visible: true, x: event.clientX, y: event.clientY, text: getLabel(foundCell.note, labelStyle) });
      } else {
        setHoveredCell(null);
        setTooltipState(prev => ({ ...prev, visible: false }));
      }
    }
  };
  const handle2DMouseLeave = () => {
    setHoveredCell(null);
    setTooltipState(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className={styles.canvasContainer2d}>
      <canvas
        ref={canvasRef2D}
        onClick={(e) => handle2DInteraction(e, true)}
        onMouseMove={(e) => handle2DInteraction(e, false)}
        onMouseLeave={handle2DMouseLeave}
        style={{ touchAction: 'none', width: '100%', height: '100%', cursor: 'pointer' }}
      />
      {tooltipState.visible && (
        <div className={styles.tooltip2d} style={{ 
            position: 'fixed', 
            left: `${tooltipState.x + 10}px`, 
            top: `${tooltipState.y + 10}px`,
            pointerEvents: 'none',
            // Ensure your CSS for .tooltip2d is set up for background, padding etc.
        }}>
            {tooltipState.text}
        </div>
      )}
    </div>
  );
}