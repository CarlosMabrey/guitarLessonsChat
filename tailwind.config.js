/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        secondary: 'var(--secondary)',
        'secondary-hover': 'var(--secondary-hover)',
        background: 'var(--background)',
        'background-light': 'var(--background-light)',
        card: 'var(--card)',
        'card-hover': 'var(--card-hover)',
        border: 'var(--border)',
        'border-light': 'var(--border-light)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        accent: 'var(--accent)',
        active: 'var(--active)',
        success: 'var(--success)',
        'success-hover': 'var(--success-hover)',
        danger: 'var(--danger)',
        'danger-hover': 'var(--danger-hover)',
        warning: 'var(--warning)',
        'warning-hover': 'var(--warning-hover)',
        info: 'var(--info)',
        'info-hover': 'var(--info-hover)',
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
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
      backdropBlur: {
        md: '8px',
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