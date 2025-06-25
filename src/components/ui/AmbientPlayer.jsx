import React, { useEffect, useState } from 'react';
import {
  playAmbient,
  pauseAmbient,
  setAmbientVolume,
  setAmbientSrc
} from '@/lib/ambientAudioController';
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiRepeat, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { useSettings } from '@/context/SettingsContext';

const TRACKS = [
  { value: 'lofi-chill.mp3', label: 'Lofi Chill' },
  { value: 'lofi-background-music-314199.mp3', label: 'Lofi Background 2' },
];

export default function AmbientPlayer({ collapsed }) {
  const { settings, setSetting } = useSettings();
  const [isPlaying, setIsPlaying] = useState(!!settings.ambient);
  const [isLoop, setIsLoop] = useState(true);
  const [volume, setVolume] = useState(settings.ambientVolume ?? 0.33);
  const [trackIdx, setTrackIdx] = useState(
    TRACKS.findIndex(t => t.value === settings.ambientTrack) || 0
  );

  useEffect(() => {
    setIsPlaying(!!settings.ambient);
  }, [settings.ambient]);

  useEffect(() => {
    setVolume(settings.ambientVolume ?? 0.33);
  }, [settings.ambientVolume]);

  useEffect(() => {
    setTrackIdx(TRACKS.findIndex(t => t.value === settings.ambientTrack) || 0);
  }, [settings.ambientTrack]);

  // Control singleton audio on relevant state changes
  useEffect(() => {
    const src = `/ambient/${TRACKS[trackIdx]?.value || TRACKS[0].value}`;
    setAmbientSrc(src);
    setAmbientVolume(volume);
    if (isPlaying) {
      playAmbient(src, volume);
    } else {
      pauseAmbient();
    }
  }, [isPlaying, trackIdx, volume]);

  const handlePlayPause = () => {
    setSetting('ambient', !isPlaying);
  };

  const handleSkip = (dir) => {
    let nextIdx = (trackIdx + dir + TRACKS.length) % TRACKS.length;
    setSetting('ambientTrack', TRACKS[nextIdx].value);
    setIsPlaying(true);
    setSetting('ambient', true);
  };

  const handleLoop = () => {
    setIsLoop(l => !l);
  };

  const handleVolume = (v) => {
    setVolume(v);
    setSetting('ambientVolume', v);
  };

  const currentTrack = TRACKS[trackIdx] || TRACKS[0];

  return (
    <div className="flex flex-col items-center w-full px-2 py-1">
      <div className="flex items-center gap-1 w-full justify-center">
        <button
          onClick={() => handleSkip(-1)}
          className="p-1 text-gray-400 hover:text-blue-400 focus:outline-none"
          aria-label="Previous track"
        >
          <FiSkipBack size={16} />
        </button>
        <button
          onClick={handlePlayPause}
          className="p-1 text-gray-400 hover:text-blue-400 focus:outline-none"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
        </button>
        <button
          onClick={() => handleSkip(1)}
          className="p-1 text-gray-400 hover:text-blue-400 focus:outline-none"
          aria-label="Next track"
        >
          <FiSkipForward size={16} />
        </button>
        <button
          onClick={handleLoop}
          className={`p-1 ${isLoop ? 'text-blue-400' : 'text-gray-400'} hover:text-blue-400 focus:outline-none`}
          title="Loop"
          aria-label="Loop"
        >
          <FiRepeat size={15} />
        </button>
        <FiVolumeX className="text-gray-500 ml-2" size={14} />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={e => handleVolume(parseInt(e.target.value, 10) / 100)}
          className="w-16 accent-blue-600 bg-gray-700 rounded h-1 focus:outline-none"
          aria-label="Ambient volume"
        />
        <FiVolume2 className="text-gray-500" size={14} />
      </div>
      <div className="w-full text-center text-gray-400 text-xs truncate mt-1" style={{lineHeight:'1.2'}}>
        {currentTrack.label}
      </div>
      {/* No <audio> element, playback is global */}
    </div>
  );
}
