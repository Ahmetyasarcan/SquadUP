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
        primary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#22D3EE', // Neon cyan
          500: '#0EA5E9', // Main cyan
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        secondary: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#A78BFA',
          500: '#8B5CF6', // Main purple
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        dark: {
          bg: '#0F172A',      // Slate-900
          card: '#1E293B',    // Slate-800
          hover: '#334155',   // Slate-700
          border: '#475569',  // Slate-600
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #22D3EE 0%, #8B5CF6 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(34,211,238,0.05) 0%, rgba(139,92,246,0.05) 100%)',
        'gradient-hero': 'radial-gradient(ellipse at top, rgba(34,211,238,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(139,92,246,0.15) 0%, transparent 50%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(34,211,238,0.5)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.5)',
        'glow-cyan-lg': '0 0 40px rgba(34,211,238,0.6)',
        'neon': '0 0 5px rgba(34,211,238,0.5), 0 0 20px rgba(139,92,246,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(34,211,238,0.5), 0 0 10px rgba(139,92,246,0.3)' },
          '100%': { boxShadow: '0 0 10px rgba(34,211,238,0.8), 0 0 20px rgba(139,92,246,0.5)' },
        },
      },
    },
  },
  plugins: [],
}
