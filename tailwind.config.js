/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // blue-500
        secondary: '#10B981', // emerald-500
        accent: '#8B5CF6', // violet-500
        background: {
          DEFAULT: '#F9FAFB', // gray-50
          secondary: '#F3F4F6', // gray-100
        },
        text: {
          primary: '#111827', // gray-900
          secondary: '#6B7280', // gray-500
          muted: '#9CA3AF', // gray-400
        },
        border: {
          DEFAULT: '#E5E7EB', // gray-200
          light: '#F3F4F6', // gray-100
        },
        card: {
          DEFAULT: '#FFFFFF', // white
          hover: '#F9FAFB', // gray-50
        },
      },
    },
  },
  plugins: [],
} 