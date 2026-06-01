export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        accent: { DEFAULT: '#e63000', hover: '#ff3d00' },
        surface: {
          bg:     '#0d0d0d',
          nav:    '#111111',
          card:   '#1a1a1a',
          raised: '#1f1f1f',
          input:  '#1a1a1a',
          border: '#2a2a2a',
        },
        ink: {
          white: '#ffffff',
          mid:   '#6b6b6b',
          dim:   '#3a3a3a',
        }
      },
      borderRadius: { none: '0', DEFAULT: '0', sm: '0', md: '0', lg: '0', xl: '0', '2xl': '0', full: '9999px' },
      boxShadow: {
        card: '0 0 0 1px #2a2a2a',
        accent: '0 4px 16px rgba(230,48,0,0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      }
    }
  },
  plugins: []
}
