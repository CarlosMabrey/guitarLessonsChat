'use client';

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// Default theme that will be used for both server and client initially
const DEFAULT_THEME = "glassmorphism";

export function ThemeProvider({ children }) {
  // Use a simpler state initialization to avoid hydration mismatch
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [isClient, setIsClient] = useState(false);

  // After hydration, we can safely use localStorage
  useEffect(() => {
    setIsClient(true);
    const storedTheme = localStorage.getItem("theme") || DEFAULT_THEME;
    setTheme(storedTheme);
  }, []);

  // Only update DOM after client-side rendering is established
  useEffect(() => {
    if (isClient) {
      document.documentElement.classList.remove(
        "theme-glassmorphism", 
        "theme-light-minimal", 
        "theme-retrowave",
        "theme-glassmorphism-ultramodern"
      );
      document.documentElement.classList.add(`theme-${theme}`);
      localStorage.setItem("theme", theme);
    }
  }, [theme, isClient]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isClient }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
