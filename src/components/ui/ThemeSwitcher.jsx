'use client';

import { useTheme } from "./ThemeContext";
import { FiDroplet, FiSun, FiZap } from "react-icons/fi";

export default function ThemeSwitcher({ compact = false }) {
  const { theme, setTheme, isClient } = useTheme();

  // Define button classes function to ensure consistency
  const getButtonClasses = (themeName) => {
    const baseClasses = "rounded-full flex items-center justify-center transition-all";
    const sizeClasses = compact ? "w-10 h-10" : "w-8 h-8";
    
    // During server rendering or before hydration, use a consistent class to avoid mismatch
    if (!isClient) {
      return `${baseClasses} ${sizeClasses} bg-accent text-text-secondary`;
    }
    
    // After hydration, use the dynamic classes
    return `${baseClasses} ${sizeClasses} ${
      theme === themeName
        ? "bg-active text-white shadow-md" 
        : "bg-accent text-text-secondary hover:bg-accent hover:text-text-primary"
    }`;
  };

  // Compact version for sidebar
  if (compact) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <button
          className={getButtonClasses("glassmorphism")}
          onClick={() => setTheme("glassmorphism")}
          title="Glassmorphism Theme"
        >
          <FiDroplet size={18} />
        </button>
        
        <button
          className={getButtonClasses("light-minimal")}
          onClick={() => setTheme("light-minimal")}
          title="Light Minimal Theme"
        >
          <FiSun size={18} />
        </button>

        <button
          className={getButtonClasses("retrowave")}
          onClick={() => setTheme("retrowave")}
          title="RetroWave Theme"
        >
          <FiZap size={18} />
        </button>
      </div>
    );
  }

  // Regular version
  return (
    <div className="flex items-center space-x-2 p-2 bg-card rounded-lg">
      <button
        className={getButtonClasses("glassmorphism")}
        onClick={() => setTheme("glassmorphism")}
        title="Glassmorphism Theme"
      >
        <FiDroplet className="text-sm" />
      </button>
      
      <button
        className={getButtonClasses("light-minimal")}
        onClick={() => setTheme("light-minimal")}
        title="Light Minimal Theme"
      >
        <FiSun className="text-sm" />
      </button>

      <button
        className={getButtonClasses("retrowave")}
        onClick={() => setTheme("retrowave")}
        title="RetroWave Theme"
      >
        <FiZap className="text-sm" />
      </button>
    </div>
  );
}