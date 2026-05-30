/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lemon: '#F5F5A8',
        peach: '#FFD9B3',
        coral: '#FFBBAA',
        rose: '#FFB0B0',
        lime: '#E2FFB2',
        mint: '#B2FFD4',
        seafoam: '#A8FFEC',
        blush: '#FFBBC8',
        periwinkle: '#B2CCFF',
        lavender: '#D0AAFF',
        orchid: '#FFAAF0',
        lilac: '#F0BBFF',
        taupe: '#C0B2A0',
        sand: '#C8B08A',
        pearl: '#CCCCCC',
        slate: '#6E7488',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        brand: ['Pacifico', 'cursive'],
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
};
