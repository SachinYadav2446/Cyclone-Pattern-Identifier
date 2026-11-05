/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The 5 Signature Colors
        berry: '#B43067',
        plum: '#64104E',
        ochre: '#C3864D',
        coral: '#E04A31',
        crimson: '#CF2F4B',
        
        // Deep Dark Plum & Obsidian Surfaces
        obsidian: '#08050c',
        midnight: '#0d0714',
        charcoal: '#130a1c',
        'dark-card': '#140b1e',
        'dark-elevated': '#1c102a',
        'dark-border': 'rgba(100, 16, 78, 0.45)',
        
        // Background & Surfaces
        background: '#08050c',
        surface: '#120a1c',
        'surface-elevated': '#1a0f28',
        
        // Structural Greys & Borders
        'slate-border': 'rgba(100, 16, 78, 0.35)',
        'slate-divider': 'rgba(100, 16, 78, 0.5)',
        border: 'rgba(100, 16, 78, 0.4)',
        'border-subtle': 'rgba(180, 48, 103, 0.2)',
        
        // Typography & Muted Text
        foreground: '#f8fafc',
        'silver-white': '#f8fafc',
        'muted-foreground': '#94a3b8',
        dim: '#64748b',
        
        // Meteorological Warning & Radar Orange Palette
        cyclone: {
          50: '#fff7ed',  // Soft light orangeish background tint
          100: '#ffedd5', // Peach light accent
          200: '#fed7aa', // Light apricot border
          300: '#fdba74',
          400: '#fb923c', // Warm amber-orange
          500: '#f97316', // Primary radar orange
          600: '#ea580c', // Deep intense orange
          700: '#c2410c', // Burnt warning orange
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'radar-sweep': 'sweep 4s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'spin-slow': 'spin 30s linear infinite',
        'orange-glow': 'orangeGlow 4s ease-in-out infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        orangeGlow: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
