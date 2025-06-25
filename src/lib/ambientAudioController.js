// Central controller for ambient audio (singleton pattern)
let audioInstance = null;

export function getAmbientAudio() {
  if (!audioInstance) {
    audioInstance = new window.Audio();
    audioInstance.loop = true;
    audioInstance.preload = 'auto';
    audioInstance.autoplay = false;
  }
  return audioInstance;
}

export function playAmbient(src, volume = 0.33) {
  const audio = getAmbientAudio();
  if (audio.src !== src) {
    audio.src = src;
    audio.load();
  }
  audio.volume = volume;
  audio.play().catch(() => {});
}

export function pauseAmbient() {
  const audio = getAmbientAudio();
  audio.pause();
}

export function setAmbientVolume(volume) {
  const audio = getAmbientAudio();
  audio.volume = volume;
}

export function setAmbientSrc(src) {
  const audio = getAmbientAudio();
  if (audio.src !== src) {
    audio.src = src;
    audio.load();
  }
}

export function isAmbientPlaying() {
  const audio = getAmbientAudio();
  return !audio.paused;
}
