/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#18212F',
          50: '#F4F7FA',
          100: '#E7EDF3',
          200: '#CBD7E4',
          300: '#9DB0C4',
          400: '#7089A4',
          500: '#4B627E',
          600: '#344760',
          700: '#27364B',
          800: '#18212F',
          900: '#0C1119',
        },
        accent: {
          DEFAULT: '#C93F2B',
          50: '#FFF4F1',
          100: '#FFE4DD',
          200: '#FFC9BA',
          300: '#F9A58F',
          400: '#E87961',
          500: '#D9543B',
          600: '#C93F2B',
          700: '#A62F20',
          800: '#84271D',
          900: '#6F241C',
        },
        teal: {
          DEFAULT: '#0F766E',
          50: '#EFFCF9',
          100: '#DDF7F2',
          700: '#0F766E',
        },
        amber: {
          DEFAULT: '#B7791F',
          50: '#FFF8E8',
          100: '#FFF3D6',
          700: '#B7791F',
        },
        violet: {
          DEFAULT: '#6750A4',
          50: '#F5F1FF',
          100: '#ECE7F8',
          200: '#DDD5F3',
          700: '#6750A4',
          800: '#4f3d80',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        bg: {
          DEFAULT: '#F6F3EE',
          soft: '#ECE8E1',
        },
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#1D2430',
          muted: '#5F6673',
          subtle: '#9298A3',
        },
        border: {
          DEFAULT: '#E1DED8',
          strong: '#CFC8BE',
        },
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
        display: ['64px', { lineHeight: '1.1', letterSpacing: '0' }],
        h1: ['40px', { lineHeight: '1.2' }],
        h2: ['28px', { lineHeight: '1.3' }],
        h3: ['20px', { lineHeight: '1.4' }],
        body: ['16px', { lineHeight: '1.55' }],
        small: ['13px', { lineHeight: '1.5' }],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        pill: '999px',
      },
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px rgba(29,36,48,0.05)',
        DEFAULT: '0 8px 26px rgba(29,36,48,0.08)',
        lg: '0 26px 60px -26px rgba(29,36,48,0.24)',
        focus: '0 0 0 3px rgba(201,63,43,0.18)',
        card: '0 18px 42px rgba(29,36,48,0.10)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
        glow: '0 0 20px rgba(201, 63, 43, 0.4)',
      },
      transitionDuration: {
        fast: '120ms',
        DEFAULT: '180ms',
        slow: '300ms',
      },
      spacing: {
        18: '72px',
        22: '88px',
      },
      keyframes: {
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.8', transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: {
        'slide-in': 'slide-in 220ms cubic-bezier(.4,0,.2,1)',
        'fade-in-up': 'fade-in-up 400ms cubic-bezier(.4,0,.2,1) forwards',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.font-cairo': { fontFamily: '"Cairo", "Segoe UI Arabic", Tahoma, sans-serif' },
        '.font-inter': { fontFamily: '"Inter", "Cairo", system-ui, -apple-system, sans-serif' },
        '.rounded-pill': { borderRadius: '999px' },
        '.duration-default': { transitionDuration: '180ms' },
        '.dk-num': { fontFamily: '"Inter", "Cairo", system-ui, sans-serif', fontFeatureSettings: '"tnum" 1, "lnum" 1' },
      })
    },
  ],
}
