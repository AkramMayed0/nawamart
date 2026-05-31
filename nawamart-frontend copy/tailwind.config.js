/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — dark blue
        primary: {
          DEFAULT: '#0D1B2A',
          50:  '#F0F2F5',
          100: '#E0E4EB',
          200: '#B8C1D0',
          300: '#8D9CB3',
          400: '#627492',
          500: '#3D5270',
          600: '#2A3D57',
          700: '#1B2A40',
          800: '#0D1B2A',
          900: '#070E17',
        },
        // Accent — red
        accent: {
          DEFAULT: '#DC2626',
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        // Neutral
        bg: {
          DEFAULT: '#F8F9FA',
          soft: '#EEF0F3',
        },
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#1A1A2E',
          muted: '#5A6072',
          subtle: '#8A90A2',
        },
        border: {
          DEFAULT: '#E4E7EC',
          strong: '#CFD3DB',
        },
        // Semantic
        success: {
          DEFAULT: '#27AE60',
          100: '#DFF5E7',
          dark: '#1E8C4D',
        },
        danger: {
          DEFAULT: '#E74C3C',
          100: '#FCE4E1',
        },
        warning: {
          DEFAULT: '#F39C12',
          100: '#FDEBCB',
        },
        info: {
          DEFAULT: '#2D7BE0',
          100: '#DCE9FA',
        },
      },
      fontFamily: {
        cairo: ['"Cairo"', '"Segoe UI Arabic"', 'Tahoma', 'sans-serif'],
        inter: ['"Inter"', '"Cairo"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Cairo"', '"Segoe UI Arabic"', 'Tahoma', 'sans-serif'],
      },
      fontSize: {
        'display': ['64px', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'h1':      ['40px', { lineHeight: '1.2' }],
        'h2':      ['28px', { lineHeight: '1.3' }],
        'h3':      ['20px', { lineHeight: '1.4' }],
        'body':    ['16px', { lineHeight: '1.55' }],
        'small':   ['13px', { lineHeight: '1.5' }],
      },
      borderRadius: {
        'sm':   '4px',
        DEFAULT: '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
        'pill': '999px',
      },
      boxShadow: {
        'none':  'none',
        'sm':    '0 1px 2px rgba(16,24,40,0.04), 0 1px 1px rgba(16,24,40,0.03)',
        DEFAULT: '0 2px 6px rgba(16,24,40,0.06)',
        'lg':    '0 20px 50px -20px rgba(16,24,40,0.18)',
        'focus': '0 0 0 3px rgba(220,38,38,0.18)',
        'card':  '0 4px 16px rgba(16,24,40,0.08)',
      },
      transitionDuration: {
        'fast': '120ms',
        DEFAULT: '180ms',
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
      keyframes: {
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to:   { transform: 'translateX(0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 220ms cubic-bezier(.4,0,.2,1)',
      },
    },
  },
  plugins: [
    // font-cairo / font-inter utility classes
    function({ addUtilities }) {
      addUtilities({
        '.font-cairo': { fontFamily: '"Cairo", "Segoe UI Arabic", Tahoma, sans-serif' },
        '.font-inter': { fontFamily: '"Inter", "Cairo", system-ui, sans-serif' },
        '.rounded-pill': { borderRadius: '999px' },
        '.duration-default': { transitionDuration: '180ms' },
        '.dk-num': { fontFamily: '"Inter"', fontFeatureSettings: '"tnum" 1, "lnum" 1' },
      })
    }
  ],
}
