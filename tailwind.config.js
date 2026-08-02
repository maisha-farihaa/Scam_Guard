/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0f0d',
          card: '#111a16',
          input: '#0d1512',
        },
        border: {
          DEFAULT: '#1e2b25',
          strong: '#2a3a32',
        },
        text: {
          primary: '#f2f5f3',
          secondary: '#9aa89f',
          muted: '#6b7a72',
        },
        brand: {
          DEFAULT: '#22c55e',
          hover: '#16a34a',
          bg: 'rgba(34,197,94,0.1)',
        },
        danger: {
          DEFAULT: '#ef4444',
          bg: 'rgba(239,68,68,0.08)',
          border: 'rgba(239,68,68,0.35)',
        },
        warning: {
          DEFAULT: '#eab308',
          bg: 'rgba(234,179,8,0.08)',
          border: 'rgba(234,179,8,0.35)',
        },
        safe: {
          DEFAULT: '#22c55e',
          bg: 'rgba(34,197,94,0.08)',
          border: 'rgba(34,197,94,0.35)',
        },
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.35s ease-out both',
        fadeIn: 'fadeIn 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
