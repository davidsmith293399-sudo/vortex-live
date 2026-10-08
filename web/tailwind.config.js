/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06080F',
          900: '#0B0F19',
          850: '#0F1524',
          800: '#141D30',
          700: '#1C2842',
          600: '#2A3B5F',
        },
        brand: {
          cyan: '#00F2FE',
          electric: '#4FACFE',
          purple: '#8A2BE2',
          neon: '#A855F7',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 242, 254, 0.35)',
        'glow-purple': '0 0 20px -3px rgba(138, 43, 226, 0.45)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.4)',
        'glow-rose': '0 0 20px -3px rgba(244, 63, 94, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
