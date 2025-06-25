import { useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import {
  playAmbient,
  pauseAmbient,
  setAmbientVolume,
  setAmbientSrc
} from '@/lib/ambientAudioController';

export default function AmbientAudio() {
  const { settings } = useSettings();
  const track = settings.ambientTrack || 'lofi-chill.mp3';
  const src = `/ambient/${track}`;
  const volume = typeof settings.ambientVolume === 'number' ? settings.ambientVolume : 0.33;

  useEffect(() => {
    if (settings.ambient) {
      playAmbient(src, volume);
    } else {
      pauseAmbient();
    }
    // Always update volume and track on change
    setAmbientVolume(volume);
    setAmbientSrc(src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.ambient, src, volume]);

  return null; // No audio element in the DOM
}

