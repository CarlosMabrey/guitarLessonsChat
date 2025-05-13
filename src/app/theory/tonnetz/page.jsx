'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiVolume2, FiMusic } from 'react-icons/fi';
import AppNav from '@/components/ui/AppNav';
import Script from 'next/script';

export default function TonnetzPage() {
  const canvasRef = useRef(null);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [currentChord, setCurrentChord] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Initialize the visualization after the libraries are loaded
  useEffect(() => {
    if (!isLoaded) return;
    
    let scene, camera, renderer, controls;
    let nodes = [];
    let selectedNodeIndices = [];
    let synth;
    
    const initToneJs = async () => {
      await Tone.start();
      synth = new Tone.PolySynth(Tone.Synth).toDestination();
    };
    
    const initThreeJs = () => {
      // Create scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);
      
      // Create camera
      camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
      );
      camera.position.z = 15;
      
      // Create renderer
      renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current,
        antialias: true 
      });
      renderer.setSize(window.innerWidth, window.innerHeight - 200);
      
      // Add orbit controls
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      
      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      
      // Create Tonnetz grid
      createTonnetzGrid();
      
      // Add event listeners
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('click', onMouseClick);
      
      // Start animation loop
      animate();
    };
    
    const createTonnetzGrid = () => {
      // Pitch classes
      const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      // Responsive grid size
      const cols = 4;
      const rows = 3;
      const padding = 0.2;
      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight - 200;
      // Calculate spacing so grid fits nicely
      const maxGridW = canvasWidth * 0.8;
      const maxGridH = canvasHeight * 0.7;
      const spacingX = maxGridW / (cols + 0.5);
      const spacingY = maxGridH / (rows + 0.5) / 0.866;
      const spacing = Math.min(spacingX, spacingY);
      const hexRadius = spacing * 0.5 - padding;
      // Center grid
      const gridW = (cols - 1) * spacing + spacing;
      const gridH = (rows - 1) * spacing * 0.866 + spacing;
      const offsetX = -gridW / 2 + spacing / 2;
      const offsetY = -gridH / 2 + spacing / 2;
      // Materials
      const nodeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3b82f6, // Tailwind blue-500
        metalness: 0.3,
        roughness: 0.4,
        transparent: true,
        opacity: 1,
      });
      const selectedMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf59e42, // Tailwind orange-400
        emissive: 0xff6600,
        metalness: 0.3,
        roughness: 0.4,
        transparent: true,
        opacity: 1,
      });
      // Hex tile geometry (extruded)
      const hexGeometry = new THREE.CylinderGeometry(hexRadius, hexRadius, 0.18, 6, 1, false);
      // Store node positions for triangle shading
      const nodePositions = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const noteIndex = (7 * col + 4 * row) % 12;
          const note = notes[noteIndex];
          let x = col * spacing;
          let y = row * spacing * 0.866;
          if (row % 2 === 1) x += spacing / 2;
          x += offsetX;
          y += offsetY;
          const hex = new THREE.Mesh(hexGeometry.clone(), nodeMaterial.clone());
          hex.position.set(x, y, 0);
          hex.userData = { note, noteIndex, col, row };
          // Add hover/selection animation state
          hex.userData.isHovered = false;
          hex.userData.isSelected = false;
          scene.add(hex);
          nodes.push(hex);
          nodePositions.push({ x, y, note, col, row });
          // Note label
          const canvas = document.createElement('canvas');
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 40px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = '#000';
          ctx.shadowBlur = 6;
          ctx.fillText(note, 32, 32);
          const texture = new THREE.CanvasTexture(canvas);
          const labelMaterial = new THREE.SpriteMaterial({ map: texture });
          const label = new THREE.Sprite(labelMaterial);
          label.scale.set(0.9, 0.9, 1);
          label.position.set(x, y, 0.13);
          scene.add(label);
        }
      }
      // Triangle shading for triads
      function drawTriadTriangles(selectedNotes) {
        // Remove previous triad meshes
        scene.triadMeshes = scene.triadMeshes || [];
        scene.triadMeshes.forEach(mesh => scene.remove(mesh));
        scene.triadMeshes = [];
        if (selectedNotes.length !== 3) return;
        // Find all triangles in the grid
        const tris = [];
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            // Down-right triangle
            if (col < cols - 1 && row < rows - 1) {
              const n1 = nodePositions.find(n => n.col === col && n.row === row);
              const n2 = nodePositions.find(n => n.col === col + 1 && n.row === row);
              const n3 = nodePositions.find(n => n.col === col && n.row === row + 1);
              tris.push([n1, n2, n3]);
            }
            // Down-left triangle
            if (col > 0 && row < rows - 1) {
              const n1 = nodePositions.find(n => n.col === col && n.row === row);
              const n2 = nodePositions.find(n => n.col === col - 1 && n.row === row + 1);
              const n3 = nodePositions.find(n => n.col === col && n.row === row + 1);
              tris.push([n1, n2, n3]);
            }
          }
        }
        for (const tri of tris) {
          if (tri.every(n => selectedNotes.includes(n.note))) {
            const shape = new THREE.Shape();
            shape.moveTo(tri[0].x, tri[0].y);
            shape.lineTo(tri[1].x, tri[1].y);
            shape.lineTo(tri[2].x, tri[2].y);
            shape.lineTo(tri[0].x, tri[0].y);
            const geometry = new THREE.ShapeGeometry(shape);
            const material = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.z = -0.09;
            scene.add(mesh);
            scene.triadMeshes.push(mesh);
          }
        }
      }
      // Mouse hover effect
      renderer.domElement.addEventListener('mousemove', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodes);
        nodes.forEach(node => {
          if (intersects.length > 0 && node === intersects[0].object) {
            if (!node.userData.isHovered) {
              node.userData.isHovered = true;
              node.scale.set(1.15, 1.15, 1.15);
              node.material.emissive.setHex(0x60a5fa); // Tailwind blue-400
            }
          } else {
            if (node.userData.isHovered) {
              node.userData.isHovered = false;
              node.scale.set(1, 1, 1);
              node.material.emissive.setHex(node.userData.isSelected ? 0xff6600 : 0x000000);
            }
          }
        });
      });
      // Selection/hover transitions handled in mouse events
      // Remove lines (no interval lines)
      // Redraw triad triangles on selection change
      drawTriadTriangles(selectedNotes);
    };
    
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight - 200);
      // Recreate grid for new size
      // Remove all nodes and labels
      nodes.forEach(node => scene.remove(node));
      nodes.length = 0;
      if (scene.triadMeshes) scene.triadMeshes.forEach(mesh => scene.remove(mesh));
      if (scene.triadMeshes) scene.triadMeshes.length = 0;
      // Recreate grid and relayout
      createTonnetzGrid();
      renderer.render(scene, camera);
    };
    
    const onMouseClick = (event) => {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodes);
      if (intersects.length > 0) {
        const node = intersects[0].object;
        const note = node.userData.note;
        const noteIndex = node.userData.noteIndex;
        // Toggle node selection
        const index = selectedNodeIndices.indexOf(noteIndex);
        if (index === -1) {
          selectedNodeIndices.push(noteIndex);
          node.material = selectedMaterial.clone();
          node.userData.isSelected = true;
          node.scale.set(1.18, 1.18, 1.18);
          node.material.emissive.setHex(0xff6600);
          synth.triggerAttackRelease(note + '4', '8n');
        } else {
          selectedNodeIndices.splice(index, 1);
          node.material = nodeMaterial.clone();
          node.userData.isSelected = false;
          node.scale.set(1, 1, 1);
          node.material.emissive.setHex(0x000000);
        }
        // Update selected notes
        const newSelectedNotes = selectedNodeIndices.map(idx => nodes.find(n => n.userData.noteIndex === idx).userData.note);
        setSelectedNotes(newSelectedNotes);
        // Redraw triad triangles
        if (typeof scene.triadMeshes !== 'undefined' && scene.triadMeshes.length >= 0) {
          scene.triadMeshes.forEach(mesh => scene.remove(mesh));
          scene.triadMeshes = [];
        }
        // Check if selected notes form a chord
        if (newSelectedNotes.length >= 2) {
          try {
            const chord = Tonal.Chord.detect(newSelectedNotes);
            if (chord.length > 0) {
              setCurrentChord(chord[0]);
            } else {
              setCurrentChord(null);
            }
          } catch (e) {
            setCurrentChord(null);
          }
        } else {
          setCurrentChord(null);
        }
        // Redraw triad triangles if 3 notes
        if (typeof drawTriadTriangles === 'function') {
          drawTriadTriangles(newSelectedNotes);
        }
      }
    };
    
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    // Initialize everything
    initToneJs();
    initThreeJs();
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('click', onMouseClick);
      renderer?.dispose();
    };
  }, [isLoaded]);
  
  const playSelectedChord = () => {
    if (selectedNotes.length === 0) return;
    
    const chordNotes = selectedNotes.map(note => note + '4');
    Tone.start().then(() => {
      const synth = new Tone.PolySynth(Tone.Synth).toDestination();
      synth.triggerAttackRelease(chordNotes, '2n');
    });
  };
  
  const clearSelection = () => {
    setSelectedNotes([]);
    setCurrentChord(null);
    // We'll need to reload the page to reset the Three.js visualization
    window.location.reload();
  };
  
  return (
    <div className="container mx-auto p-6 pt-16">
      <Script
        src="https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js"
        onLoad={() => {
          import('https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js')
            .then(() => {
              import('https://cdn.jsdelivr.net/npm/tone@14.8.39/build/Tone.min.js')
                .then(() => {
                  import('https://cdn.jsdelivr.net/npm/tonal@3.6.0/build/tonal.min.js')
                    .then(() => {
                      setIsLoaded(true);
                    });
                });
            });
        }}
      />
      
      <div className="mb-6">
        <Link 
          href="/theory" 
          className="flex items-center text-text-secondary hover:text-text-primary transition mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Theory
        </Link>
        
        <h1 className="main-heading">Tonnetz Chord Visualizer</h1>
        <p className="text-text-secondary">
          Click on notes in the 3D Tonnetz to build and visualize chords
        </p>
      </div>
      
      <div className="card mb-6 p-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-xl font-semibold">
              Selected Notes: {selectedNotes.join(', ') || 'None'}
            </h2>
            
            {currentChord && (
              <p className="text-text-primary font-medium">
                Detected Chord: {currentChord}
              </p>
            )}
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button 
              onClick={playSelectedChord}
              disabled={selectedNotes.length === 0}
              className={`btn btn-primary flex items-center ${selectedNotes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FiVolume2 size={16} className="mr-2" /> 
              Play Chord
            </button>
            
            <button 
              onClick={clearSelection}
              disabled={selectedNotes.length === 0}
              className={`btn btn-danger flex items-center ${selectedNotes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      <div className="card p-4 text-center">
        <p className="text-text-secondary mb-4">
          Drag to rotate | Scroll to zoom | Click on nodes to select notes
        </p>
        
        <div className="relative h-[calc(100vh-400px)] min-h-[500px] w-full">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
          />
          
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-xl">Loading visualization...</div>
            </div>
          )}
        </div>
      </div>
      
      <div className="card mt-6 p-4">
        <h2 className="text-xl font-semibold mb-2">About the Tonnetz</h2>
        <p className="text-text-secondary">
          The Tonnetz (tone-network) is a geometric representation of tonal space that shows relationships between pitches.
          In this visualization:
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1 text-text-secondary">
          <li>Horizontal connections represent perfect fifths</li>
          <li>Vertical connections represent major thirds</li>
          <li>Diagonal connections (implicit) represent minor thirds</li>
          <li>Triads form triangles on the Tonnetz</li>
        </ul>
      </div>
    </div>
  );
} 