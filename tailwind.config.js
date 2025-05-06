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
          DEFAULT: '#13131d',
          light: '#1e1e2d',
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
          DEFAULT: '#1c1c2b',
          hover: '#23232f',
        },
        text: {
          primary: '#f3f4f6',
          secondary: '#9ca3af',
          muted: '#6b7280',
        },
        border: {
          DEFAULT: '#2e2e3a',
          light: '#3e3e4a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} 