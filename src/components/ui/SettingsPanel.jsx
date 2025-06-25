import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';

export default function SettingsPanel({ className = '' }) {
  const { settings, setSetting } = useSettings();
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey || '');
  const [apiKeyStatus, setApiKeyStatus] = useState('');

  // Save API key with feedback
  const handleSaveApiKey = () => {
    setSetting('apiKey', apiKeyInput);
    setApiKeyStatus('saved');
    setTimeout(() => setApiKeyStatus(''), 1500);
  };
  const handleClearApiKey = () => {
    setApiKeyInput('');
    setSetting('apiKey', '');
    setApiKeyStatus('cleared');
    setTimeout(() => setApiKeyStatus(''), 1500);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Appearance Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Appearance</h3>
        <div className="flex flex-col gap-2">
          {/* Background Effects Section */}
          <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
            <span className="font-medium text-gray-200">Background</span>
            <select
              className="bg-gray-700 text-gray-100 rounded px-2 py-1"
              value={settings.backgroundEffect || 'none'}
              onChange={e => setSetting('backgroundEffect', e.target.value)}
            >
              <option value="none">None</option>
              <option value="blur">Blur / Glassmorphism</option>
              <option value="brightness">Brightness Pulse</option>
              <option value="hue">Hue Shift</option>
              <option value="noise">Noise / Grain</option>
              <option value="vignette">Vignette</option>
              <option value="glow">Soft Glow</option>
              <option value="pattern">Animated Pattern</option>
            </select>
          </div>
          <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
            <span className="font-medium text-gray-200">Custom Cursor</span>
            <button
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${settings.customCursor ? 'bg-blue-600' : 'bg-gray-600'}`}
              onClick={() => setSetting('customCursor', !settings.customCursor)}
              aria-pressed={settings.customCursor}
              aria-label="Toggle custom cursor"
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${settings.customCursor ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
            <span className="font-medium text-gray-200">Ambient Music</span>
            <button
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${settings.ambient ? 'bg-blue-600' : 'bg-gray-600'}`}
              onClick={() => setSetting('ambient', !settings.ambient)}
              aria-pressed={settings.ambient}
              aria-label="Toggle ambient background music"
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${settings.ambient ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>

        </div>
      </div>
      <hr className="border-gray-700" />
      {/* API Key Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-4">API Key</h3>
        <label className="font-medium text-gray-200 mb-1 block" htmlFor="api-key-input">
          OpenAI API Key
        </label>
        <div className="flex gap-2 items-center mb-2">
          <input
            id="api-key-input"
            type="password"
            className="flex-1 px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            placeholder="sk-..."
            autoComplete="off"
          />
          <button
            type="button"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            onClick={handleSaveApiKey}
            disabled={apiKeyInput === settings.apiKey}
          >
            Save
          </button>
          {settings.apiKey && (
            <button
              type="button"
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              onClick={handleClearApiKey}
            >
              Clear
            </button>
          )}
        </div>
        {apiKeyStatus === 'saved' && <span className="text-xs text-green-400">API key saved!</span>}
        {apiKeyStatus === 'cleared' && <span className="text-xs text-red-400">API key cleared.</span>}
        <span className="text-xs text-gray-400 mt-1 block">Your API key is stored locally and never sent to our servers.</span>
      </div>
    </div>
  );
}
