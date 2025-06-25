import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultSettings = {
  customCursor: true,
  apiKey: '',
  ambient: false, // Ambient music off by default
  ambientTrack: 'lofi-chill.mp3', // Default ambient track
  ambientVolume: 0.33, // Default ambient volume
  backgroundEffect: 'none', // Background effect setting
  // Add more settings here as needed
};

const SettingsContext = createContext({
  settings: defaultSettings,
  setSetting: () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('user_settings');
    if (saved) {
      setSettings({ ...defaultSettings, ...JSON.parse(saved) });
    }
  }, []);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('user_settings', JSON.stringify(settings));
  }, [settings]);

  const setSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
