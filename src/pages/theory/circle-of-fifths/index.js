// pages/theory/CircleOfFifthsPage.js
import React, { useState } from 'react';
import Head from 'next/head';
import * as Tone from 'tone';
import * as Tonal from 'tonal';
import Layout from '../../../components/ui/Layout';

const circle = [
  { key: 'C', relMinor: 'Am' },
  { key: 'G', relMinor: 'Em' },
  { key: 'D', relMinor: 'Bm' },
  { key: 'A', relMinor: 'F#m' },
  { key: 'E', relMinor: 'C#m' },
  { key: 'B', relMinor: 'G#m' },
  { key: 'F#', relMinor: 'D#m' },
  { key: 'Db', relMinor: 'Bbm' },
  { key: 'Ab', relMinor: 'Fm' },
  { key: 'Eb', relMinor: 'Cm' },
  { key: 'Bb', relMinor: 'Gm' },
  { key: 'F', relMinor: 'Dm' }
];

const romanNumeralsMajor = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const romanNumeralsMinor = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

const getDiatonicChords = (key) => {
  try {
    if (key.endsWith('m')) {
      const root = key.slice(0, -1);
      return Tonal.Key.minorKey(root).natural.chords;
    } else {
      return Tonal.Key.majorKey(key).chords;
    }
  } catch (err) {
    console.warn("Invalid key for diatonic chords:", key);
    return [];
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const CircleOfFifthsPage = () => {
  const [selectedKey, setSelectedKey] = useState(null);
  const [playingChord, setPlayingChord] = useState(null);

  const playChord = (chordName, duration = '2n') => {
    const synth = new Tone.PolySynth().toDestination();
    const chord = Tonal.Chord.get(chordName);
    const notes = chord.notes.map(n => n + '4');
    setPlayingChord(chordName);
    synth.triggerAttackRelease(notes, duration);
    setTimeout(() => setPlayingChord(null), 1000);
  };

  const playProgression = async (key, progressionIndices) => {
    const chords = getDiatonicChords(key);
    const synth = new Tone.PolySynth().toDestination();
    for (let i = 0; i < progressionIndices.length; i++) {
      const idx = progressionIndices[i];
      const chord = Tonal.Chord.get(chords[idx]);
      const notes = chord.notes.map(n => n + '4');
      setPlayingChord(chords[idx]);
      synth.triggerAttackRelease(notes, '4n');
      await delay(800);
      setPlayingChord(null);
    }
  };

  const chordIsPlaying = (chordName) => playingChord && playingChord.startsWith(chordName);

  return (
    <Layout title="Circle of Fifths">
      <Head>
        <title>Circle of Fifths | Music Theory</title>
        <meta name="description" content="Explore the circle of fifths and diatonic relationships." />
      </Head>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ marginBottom: '1rem', fontSize: '2rem', color: '#f0f0f0' }}>Interactive Circle of Fifths</h1>
        <svg width="600" height="600" viewBox="0 0 600 600">
          <g transform="translate(300,300)">
            {circle.map((entry, i) => {
              const angle = (i / circle.length) * 2 * Math.PI;
              const outerX = Math.cos(angle) * 200;
              const outerY = Math.sin(angle) * 200;
              const innerX = Math.cos(angle) * 130;
              const innerY = Math.sin(angle) * 130;
              return (
                <g key={entry.key}>
                  <circle 
                    cx={outerX} cy={outerY} r={30} 
                    fill={chordIsPlaying(entry.key) ? '#fbbf24' : selectedKey === entry.key ? '#facc15' : '#60a5fa'} 
                    stroke="#fff" strokeWidth="2" 
                    onClick={() => {
                      setSelectedKey(entry.key);
                      playChord(entry.key + 'M');
                    }}
                    style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
                  />
                  <text x={outerX} y={outerY} fill="#1a202c" textAnchor="middle" dy=".3em" fontSize="16" fontWeight="bold">{entry.key}</text>

                  <circle 
                    cx={innerX} cy={innerY} r={22} 
                    fill={chordIsPlaying(entry.relMinor.slice(0, -1)) ? '#fbbf24' : selectedKey === entry.relMinor ? '#facc15' : '#a78bfa'} 
                    stroke="#fff" strokeWidth="1.5" 
                    onClick={() => {
                      const root = entry.relMinor.slice(0, -1);
                      setSelectedKey(entry.relMinor);
                      playChord(entry.relMinor);
                    }} 
                    style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
                  />
                  <text x={innerX} y={innerY} fill="#1a202c" textAnchor="middle" dy=".3em" fontSize="14">{entry.relMinor}</text>
                </g>
              );
            })}
          </g>
        </svg>

        {selectedKey && (
          <div style={{ marginTop: '2rem', color: '#e2e8f0' }}>
            <h2>{selectedKey} {selectedKey.endsWith('m') ? 'Minor' : 'Major'}</h2>
            <p><strong>Relative {selectedKey.endsWith('m') ? 'Major' : 'Minor'}:</strong> {
              selectedKey.endsWith('m')
                ? circle.find(e => e.relMinor === selectedKey)?.key || '—'
                : circle.find(e => e.key === selectedKey)?.relMinor || '—'
            }</p>
            <p><strong>Diatonic Chords:</strong></p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {getDiatonicChords(selectedKey).map((chord, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => playChord(chord)} 
                    style={{ 
                      background: '#2d3748', 
                      color: '#f0f0f0', 
                      border: '1px solid #4a5568', 
                      borderRadius: '6px', 
                      padding: '6px 10px', 
                      margin: '4px',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}>
                    {selectedKey.endsWith('m') ? romanNumeralsMinor[idx] : romanNumeralsMajor[idx]} — {chord}
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '1rem' }}>
              <button onClick={() => playChord(selectedKey + (selectedKey.endsWith('m') ? '' : 'M'))} style={{ marginRight: '1rem' }}>Play Tonic Chord</button>
              <button onClick={() => playProgression(selectedKey, [0, 3, 4])}>Play I-IV-V</button>
              <button onClick={() => playProgression(selectedKey, [0, 5, 4])} style={{ marginLeft: '1rem' }}>Play I-vi-V</button>
              <button onClick={() => playProgression(selectedKey, [0, 1, 4, 0])} style={{ marginLeft: '1rem' }}>Play I-ii-V-I</button>
              <button onClick={() => playProgression(selectedKey, [2, 5, 1, 6])} style={{ marginLeft: '1rem' }}>Play iii-vi-ii-vii°</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CircleOfFifthsPage;
