/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        v: {
          primary: '#E8A2A2',
          secondary: '#A0C2D2',
          bg: '#F7F5E8',
          surface: '#EAE0DA',
          accent: '#EAC7C7',
          info: '#D5E3E8',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#baddfd',
          300: '#7ec2fc',
          400: '#39a3f8',
          500: '#0f87e9',
          600: '#036ac7',
          700: '#0454a2',
          800: '#084985',
          900: '#0c3d6e',
          950: '#082749',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'tilt': 'tilt 10s infinite linear',
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
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        orbit: {
          'from': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          'to': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
        tilt: {
          '0%, 50%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(0.5deg)' },
          '75%': { transform: 'rotate(-0.5deg)' },
        }
      },
      boxShadow: {
        '3d': '0 20px 50px rgba(0, 0, 0, 0.15)',
        '3d-hover': '0 40px 80px rgba(0, 0, 0, 0.25)',
        'inner-glass': 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
};
