export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        dark: {
          50:  '#e8eaf2',
          100: '#c5c8d8',
          200: '#9399b2',
          300: '#6b7080',
          400: '#3d4152',
          500: '#2a2e3d',
          600: '#1e2130',
          700: '#161a23',
          800: '#0f1118',
          900: '#090b0f',
        },
        primary: { 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca' }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'gradient-media': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
        'glow':       '0 0 20px rgba(99,102,241,0.3)',
        'glow-pink':  '0 0 20px rgba(236,72,153,0.3)',
      },
      animation: {
        'fade-in':   'fadeIn 0.4s ease-out',
        'slide-up':  'slideUp 0.3s ease-out',
        'shimmer':   'shimmer 1.5s infinite',
        'pulse-slow':'pulse 3s infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        slideUp: { '0%': { opacity:'0', transform:'translateY(10px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        shimmer: { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
      }
    }
  },
  plugins: []
}
