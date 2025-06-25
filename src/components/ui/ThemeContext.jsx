'use client';

import { createContext, useContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

// Default theme that will be used for both server and client initially
const DEFAULT_THEME = "glassmorphism";

export function ThemeProvider({ children }) {
  // Use a simpler state initialization to avoid hydration mismatch
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [isClient, setIsClient] = useState(false);

  // After hydration, we can safely use localStorage
  useEffect(() => {
    setIsClient(true);
    // Only access localStorage when on the client side
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem("theme") || DEFAULT_THEME;
      setTheme(storedTheme);
    }
  }, []);

  // Only update DOM after client-side rendering is established
  useEffect(() => {
    if (isClient && typeof document !== 'undefined') {
      // Remove all theme classes first
      document.documentElement.classList.remove(
        "theme-glassmorphism", 
        "theme-light-minimal", 
        "theme-retrowave",
        "theme-glassmorphism-ultramodern"
      );
      // Add the current theme class
      document.documentElement.classList.add(`theme-${theme}`);
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem("theme", theme);
      }
    }
  }, [theme, isClient]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isClient }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
