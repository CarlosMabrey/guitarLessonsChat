/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--bg)',
          light: 'var(--sidebar)',
        },
        active: {
          DEFAULT: 'var(--active)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
        },
        primary: {
          DEFAULT: '#3e63dd',
          hover: '#5a75e6',
        },
        secondary: {
          DEFAULT: '#7c3dd2',
          hover: '#8f52db',
        },
        success: {
          DEFAULT: '#4ade80',
          hover: '#22c55e',
        },
        danger: {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
        },
        warning: {
          DEFAULT: '#f59e0b',
          hover: '#d97706',
        },
        info: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        card: {
          DEFAULT: 'var(--card-bg)',
          border: 'var(--card-border)',
          hover: '#23232f',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: '#9ca3af',
          muted: 'var(--text-muted)',
        },
        border: {
          DEFAULT: '#2e2e3a',
          light: '#3e3e4a',
        },
        retrowave: {
          purple: '#8e2de2',
          pink: '#ff6ec4',
          orange: '#fca311',
          green: '#00ffcc',
        },
        glass: {
          overlay: 'rgba(255, 255, 255, 0.1)',
          highlight: 'rgba(255, 255, 255, 0.05)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--card-shadow)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        glow: '0 0 10px rgba(255, 110, 199, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 110, 199, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 110, 199, 0.8)' },
        }
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(8px)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.backdrop-blur-xs': {
          'backdrop-filter': 'blur(2px)',
          '-webkit-backdrop-filter': 'blur(2px)',
        },
        '.backdrop-blur-sm': {
          'backdrop-filter': 'blur(4px)',
          '-webkit-backdrop-filter': 'blur(4px)',
        },
        '.backdrop-blur-md': {
          'backdrop-filter': 'blur(8px)',
          '-webkit-backdrop-filter': 'blur(8px)',
        },
        '.backdrop-blur-lg': {
          'backdrop-filter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} 