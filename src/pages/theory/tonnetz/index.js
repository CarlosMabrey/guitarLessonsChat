import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiVolume2 } from 'react-icons/fi';
import Layout from '../../../components/ui/Layout';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import * as Tone from 'tone';
import * as Tonal from 'tonal';

export default function TonnetzPage() {
  const canvasRef = useRef(null);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [currentChord, setCurrentChord] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isToneStarted, setIsToneStarted] = useState(false);
  const [mode, setMode] = useState('3d'); // '2d' or '3d'
  const [cols, setCols] = useState(8);
  const [rows, setRows] = useState(6);

  // Three.js scene setup
  useEffect(() => {
    if (!isReady || !isToneStarted || mode !== '3d') return;

    let scene, camera, renderer, controls;
    let nodes = [];
    let selectedNodeIndices = [];
    let synth = null;
    let animationId;

    const createSynth = () => {
      if (!synth) {
        synth = new Tone.PolySynth(Tone.Synth).toDestination();
      }
      return synth;
    };

    // Scene setup
    scene = new THREE.Scene();
    // Use a dark background matching your theme
    scene.background = new THREE.Color('#0a0920');

    // Responsive camera setup
    const aspect = (canvasRef.current?.clientWidth || window.innerWidth) / (canvasRef.current?.clientHeight || window.innerHeight);
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, 0, 13);

    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setClearColor('#0a0920');
    renderer.setSize(canvasRef.current?.clientWidth || window.innerWidth, canvasRef.current?.clientHeight || window.innerHeight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(4.5, 2, 0); // Center the grid
    controls.update();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Tonnetz grid
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6, // Tailwind blue-500
      metalness: 0.3,
      roughness: 0.4,
    });
    const selectedMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e42, // Tailwind orange-400
      emissive: 0xff6600,
      metalness: 0.3,
      roughness: 0.4,
    });
    const nodeGeometry = new THREE.SphereGeometry(0.32, 32, 32);

    // Center grid horizontally and vertically
    const gridOffsetX = 4.5; // (3*3)/2
    const gridOffsetY = 2;   // (2*2)/2
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        const noteIndex = (7 * i + 4 * j) % 12;
        const note = notes[noteIndex];
        const x = i * 3 - gridOffsetX;
        const y = j * 2 - gridOffsetY;
        const z = (i % 2) * 0.5;
        const sphere = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
        sphere.position.set(x, y, z);
        sphere.userData = { note, noteIndex };
        scene.add(sphere);
        nodes.push(sphere);
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
        label.position.set(x, y + 0.7, z);
        scene.add(label);
      }
    }
    // Connect nodes
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x64748b }); // Tailwind slate-400
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const index1 = i * 3 + j;
        const index2 = (i + 1) * 3 + j;
        const points = [
          nodes[index1].position.clone(),
          nodes[index2].position.clone(),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
      }
    }
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 2; j++) {
        const index1 = i * 3 + j;
        const index2 = i * 3 + j + 1;
        const points = [
          nodes[index1].position.clone(),
          nodes[index2].position.clone(),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
      }
    }

    // Responsive resize
    const onWindowResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.parentElement.offsetWidth;
      const height = canvasRef.current.parentElement.offsetHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onWindowResize);
    onWindowResize();

    // Mouse click handler (use canvas bounding rect)
    const onMouseClick = (event) => {
      if (!isToneStarted || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
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
        const index = selectedNodeIndices.indexOf(noteIndex);
        if (index === -1) {
          selectedNodeIndices.push(noteIndex);
          node.material = selectedMaterial.clone();
          createSynth().triggerAttackRelease(note + '4', '8n');
        } else {
          selectedNodeIndices.splice(index, 1);
          node.material = nodeMaterial.clone();
        }
        const newSelectedNotes = nodes
          .filter((_, i) => selectedNodeIndices.includes(i))
          .map((node) => node.userData.note);
        setSelectedNotes(newSelectedNotes);
        if (newSelectedNotes.length >= 2) {
          try {
            const chord = Tonal.Chord.detect(newSelectedNotes);
            setCurrentChord(chord.length > 0 ? chord[0] : null);
          } catch (e) {
            setCurrentChord(null);
          }
        } else {
          setCurrentChord(null);
        }
      }
    };
    if (canvasRef.current) {
      canvasRef.current.addEventListener('click', onMouseClick);
    }

    // Animation loop
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (canvasRef.current) canvasRef.current.removeEventListener('click', onMouseClick);
      if (renderer) renderer.dispose();
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isReady, isToneStarted, mode]);

  // Only start Tone.js after user gesture
  const handleUserStart = async () => {
    if (!isToneStarted) {
      await Tone.start();
      setIsToneStarted(true);
    }
    setIsReady(true);
  };

  const playSelectedChord = async () => {
    if (!isToneStarted || selectedNotes.length === 0) return;
    await Tone.start();
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.triggerAttackRelease(selectedNotes.map((n) => n + '4'), '2n');
  };

  const clearSelection = () => {
    setSelectedNotes([]);
    setCurrentChord(null);
    window.location.reload();
  };

  // Shared selection logic
  const handleSelectNote = useCallback((note) => {
    setSelectedNotes((prev) => {
      const idx = prev.indexOf(note);
      if (idx === -1) return [...prev, note];
      return prev.filter((n) => n !== note);
    });
  }, []);

  return (
    <Layout title="Tonnetz Chord Visualizer">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link
            href="/theory"
            className="flex items-center text-text-secondary hover:text-text-primary transition mb-4"
          >
            <FiArrowLeft className="mr-2" /> Back to Theory
          </Link>
          <h1 className="main-heading">Tonnetz Chord Visualizer</h1>
          <p className="text-text-secondary">
            Click on notes in the 3D or 2D Tonnetz to build and visualize chords
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="cols" className="text-sm text-text-secondary">Columns</label>
            <input
              id="cols"
              type="range"
              min={4}
              max={12}
              value={cols}
              onChange={e => setCols(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm w-6 inline-block text-center">{cols}</span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="rows" className="text-sm text-text-secondary">Rows</label>
            <input
              id="rows"
              type="range"
              min={4}
              max={12}
              value={rows}
              onChange={e => setRows(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm w-6 inline-block text-center">{rows}</span>
          </div>
          <div className="flex justify-end flex-1">
            <button
              className={`btn ${mode === '2d' ? 'btn-primary' : 'btn-secondary'} mr-2`}
              onClick={() => setMode('2d')}
            >2D</button>
            <button
              className={`btn ${mode === '3d' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('3d')}
            >3D</button>
          </div>
        </div>
        {!isReady || !isToneStarted ? (
          <div className="flex flex-col items-center justify-center h-96">
            <button
              onClick={handleUserStart}
              className="btn btn-primary px-6 py-3 text-lg"
            >
              Start Visualization
            </button>
            <p className="mt-4 text-text-secondary text-center">
              Click the button to enable audio and load the Tonnetz.
            </p>
          </div>
        ) : (
          <>
            <div className="card mb-6 p-4 rounded-xl shadow-lg bg-card">
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
            {mode === '2d' ? (
              <Tonnetz2D
                selectedNotes={selectedNotes}
                onSelectNote={handleSelectNote}
                theme="dark"
                cols={cols}
                rows={rows}
              />
            ) : (
              <div
                key={mode}
                className="card p-0 text-center rounded-xl shadow-lg bg-card relative min-h-[500px] h-[60vh] max-h-[70vh] flex items-center justify-center"
              >
                <div className="absolute inset-0">
                  <canvas
                    key={mode}
                    ref={canvasRef}
                    className="w-full h-full block rounded-xl"
                  />
                </div>
                <div className="absolute top-2 left-2 text-xs text-text-secondary z-10">
                  Drag to rotate | Scroll to zoom | Click on nodes to select notes
                </div>
              </div>
            )}
            <div className="card mt-6 p-4 rounded-xl shadow-lg bg-card">
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
          </>
        )}
      </div>
    </Layout>
  );
}

function Tonnetz2D({ selectedNotes, onSelectNote, theme = 'dark', cols = 8, rows = 6 }) {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [synth, setSynth] = useState(null);
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  useEffect(() => {
    // Initialize Tone.js synth for 2D mode
    if (!synth) {
      setSynth(new Tone.PolySynth(Tone.Synth).toDestination());
    }
  }, []);

  function getNoteAt(col, row) {
    return notes[(7 * col + 4 * row) % 12];
  }

  // Helper: get all triangles in the grid
  function getTriangles() {
    const tris = [];
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        // Down-right triangle
        if (col < cols - 1 && row < rows - 1) {
          const n1 = getNoteAt(col, row);
          const n2 = getNoteAt(col + 1, row);
          const n3 = getNoteAt(col, row + 1);
          tris.push({
            nodes: [n1, n2, n3],
            points: [
              [col, row],
              [col + 1, row],
              [col, row + 1],
            ],
          });
        }
        // Down-left triangle
        if (col > 0 && row < rows - 1) {
          const n1 = getNoteAt(col, row);
          const n2 = getNoteAt(col - 1, row + 1);
          const n3 = getNoteAt(col, row + 1);
          tris.push({
            nodes: [n1, n2, n3],
            points: [
              [col, row],
              [col - 1, row + 1],
              [col, row + 1],
            ],
          });
        }
      }
    }
    return tris;
  }

  // Draw a hexagon at (cx, cy) with radius r
  function drawHex(ctx, cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i - Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  // Redraw on resize
  useEffect(() => {
    function handleResize() {
      setHovered(null); // force redraw
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.offsetWidth;
    const height = canvas.height = canvas.parentElement.offsetHeight;
    ctx.clearRect(0, 0, width, height);
    // Colors
    const bg = theme === 'dark' ? '#0a0920' : '#fff';
    const nodeColor = theme === 'dark' ? '#3b82f6' : '#2563eb';
    const nodeSelected = theme === 'dark' ? '#f59e42' : '#f59e42';
    const nodeHover = theme === 'dark' ? '#60a5fa' : '#2563eb';
    const lineColor = theme === 'dark' ? '#64748b' : '#94a3b8';
    const labelColor = theme === 'dark' ? '#fff' : '#222';
    const triadFill = theme === 'dark' ? 'rgba(59,130,246,0.18)' : 'rgba(37,99,235,0.12)';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    // Hex grid layout
    const gridWidthUnits = (cols - 1) * 0.75 + 1;
    const gridHeightUnits = (rows - 1) * Math.sqrt(3) / 2 + 1;
    const hexRadiusX = width / (gridWidthUnits + 2);
    const hexRadiusY = height / (gridHeightUnits + 2);
    const hexRadius = Math.min(hexRadiusX, hexRadiusY);
    const actualGridWidth = gridWidthUnits * hexRadius + 2 * hexRadius;
    const actualGridHeight = gridHeightUnits * hexRadius + 2 * hexRadius;
    const x0 = (width - actualGridWidth) / 2 + hexRadius;
    const y0 = (height - actualGridHeight) / 2 + hexRadius;
    // Triad highlighting
    if (selectedNotes.length === 3) {
      const triangles = getTriangles();
      for (const tri of triangles) {
        if (selectedNotes.every(n => tri.nodes.includes(n))) {
          ctx.beginPath();
          for (let i = 0; i < 3; i++) {
            const [col, row] = tri.points[i];
            const x = x0 + col * hexRadius * 0.75;
            const y = y0 + row * hexRadius * Math.sqrt(3) / 2 + (col % 2) * hexRadius * Math.sqrt(3) / 4;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fillStyle = triadFill;
          ctx.fill();
        }
      }
    }
    // Draw grid lines
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const x = x0 + col * hexRadius * 0.75;
        const y = y0 + row * hexRadius * Math.sqrt(3) / 2 + (col % 2) * hexRadius * Math.sqrt(3) / 4;
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        // Right neighbor
        if (col < cols - 1) {
          const nx = x0 + (col + 1) * hexRadius * 0.75;
          const ny = y0 + row * hexRadius * Math.sqrt(3) / 2 + ((col + 1) % 2) * hexRadius * Math.sqrt(3) / 4;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }
        // Down-right neighbor
        if (row < rows - 1) {
          const nx = x0 + (col + 1) * hexRadius * 0.75;
          const ny = y0 + (row + 1) * hexRadius * Math.sqrt(3) / 2 + ((col + 1) % 2) * hexRadius * Math.sqrt(3) / 4;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }
        // Down neighbor
        if (row < rows - 1) {
          const nx = x;
          const ny = y0 + (row + 1) * hexRadius * Math.sqrt(3) / 2 + (col % 2) * hexRadius * Math.sqrt(3) / 4;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }
      }
    }
    // Draw hex nodes
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const note = getNoteAt(col, row);
        const x = x0 + col * hexRadius * 0.75;
        const y = y0 + row * hexRadius * Math.sqrt(3) / 2 + (col % 2) * hexRadius * Math.sqrt(3) / 4;
        ctx.save();
        // Hover/selection effect
        let scale = 1;
        if (hovered && hovered.col === col && hovered.row === row) scale = 1.15;
        if (selectedNotes.includes(note)) scale = 1.18;
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        drawHex(ctx, 0, 0, hexRadius * 0.38);
        ctx.fillStyle = selectedNotes.includes(note)
          ? nodeSelected
          : (hovered && hovered.col === col && hovered.row === row ? nodeHover : nodeColor);
        ctx.shadowColor = selectedNotes.includes(note) ? nodeSelected : nodeColor;
        ctx.shadowBlur = selectedNotes.includes(note) ? 12 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Label
        ctx.fillStyle = labelColor;
        ctx.font = `bold ${Math.round(hexRadius * 0.5)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(note, 0, 0);
        ctx.restore();
      }
    }
  }, [selectedNotes, theme, cols, rows, hovered]);

  // Play note and select on tap
  function handleClick(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = canvas.width;
    const height = canvas.height;
    const gridWidthUnits = (cols - 1) * 0.75 + 1;
    const gridHeightUnits = (rows - 1) * Math.sqrt(3) / 2 + 1;
    const hexRadiusX = width / (gridWidthUnits + 2);
    const hexRadiusY = height / (gridHeightUnits + 2);
    const hexRadius = Math.min(hexRadiusX, hexRadiusY);
    const actualGridWidth = gridWidthUnits * hexRadius + 2 * hexRadius;
    const actualGridHeight = gridHeightUnits * hexRadius + 2 * hexRadius;
    const x0 = (width - actualGridWidth) / 2 + hexRadius;
    const y0 = (height - actualGridHeight) / 2 + hexRadius;
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const cx = x0 + col * hexRadius * 0.75;
        const cy = y0 + row * hexRadius * Math.sqrt(3) / 2 + (col % 2) * hexRadius * Math.sqrt(3) / 4;
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy < (hexRadius * 0.38 * 1.2) ** 2) {
          onSelectNote(getNoteAt(col, row));
          // Play note sound
          if (synth) {
            const noteName = getNoteAt(col, row) + '4';
            synth.triggerAttackRelease(noteName, '8n');
          }
          return;
        }
      }
    }
  }

  // Handle hover
  function handleMouseMove(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = canvas.width;
    const height = canvas.height;
    const gridWidthUnits = (cols - 1) * 0.75 + 1;
    const gridHeightUnits = (rows - 1) * Math.sqrt(3) / 2 + 1;
    const hexRadiusX = width / (gridWidthUnits + 2);
    const hexRadiusY = height / (gridHeightUnits + 2);
    const hexRadius = Math.min(hexRadiusX, hexRadiusY);
    const actualGridWidth = gridWidthUnits * hexRadius + 2 * hexRadius;
    const actualGridHeight = gridHeightUnits * hexRadius + 2 * hexRadius;
    const x0 = (width - actualGridWidth) / 2 + hexRadius;
    const y0 = (height - actualGridHeight) / 2 + hexRadius;
    let found = null;
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const cx = x0 + col * hexRadius * 0.75;
        const cy = y0 + row * hexRadius * Math.sqrt(3) / 2 + (col % 2) * hexRadius * Math.sqrt(3) / 4;
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy < (hexRadius * 0.38 * 1.2) ** 2) {
          found = { col, row };
        }
      }
    }
    setHovered(found);
  }
  function handleMouseLeave() {
    setHovered(null);
  }

  return (
    <div className="card p-0 text-center rounded-xl shadow-lg bg-card relative min-h-[300px] h-[60vh] max-h-[70vh] flex items-center justify-center w-full md:min-h-[500px] md:h-[60vh] md:max-h-[70vh]">
      <canvas
        ref={canvasRef}
        className="w-full h-full block rounded-xl cursor-pointer touch-manipulation"
        style={{ touchAction: 'manipulation', maxWidth: '100vw', maxHeight: '70vh', minHeight: '200px' }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      <div className="absolute top-2 left-2 text-xs text-text-secondary z-10 bg-background/80 px-2 py-1 rounded-md">
        Tap on hexes to select notes
      </div>
    </div>
  );
} 