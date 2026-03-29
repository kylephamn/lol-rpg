/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cinzel Decorative"', 'serif'],
        heading: ['"Cinzel"', 'serif'],
        body: ['"Crimson Pro"', 'serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        gold: {
          300: '#F0D060',
          400: '#D4AF37',
          500: '#B8960C',
          600: '#9A7A00',
        },
        void: '#0A0A1A',
        deep: '#0D0D1F',
        surface: '#141428',
        panel: '#1A1A35',
        border: '#2A2A4A',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px var(--region-color, #D4AF37), 0 0 10px var(--region-color, #D4AF37)' },
          '100%': { boxShadow: '0 0 20px var(--region-color, #D4AF37), 0 0 40px var(--region-color, #D4AF37)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
