/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // HavenSec brand palette
        haven: {
          bg:              '#f6f3ee',
          surface:         '#fffcf8',
          border:          '#e6e0d6',
          'border-strong': '#d4cdc2',
          text:            '#1a2744',
          secondary:       '#4a5568',
          muted:           '#7a8494',
          primary:         '#3b6ea8',
          'primary-dark':  '#2d5685',
          'primary-light': '#eef4fb',
          ai:              '#7c6a4e',
          'ai-light':      '#f7f3eb',
          red:             '#c45c52',
          'red-light':     '#fbf0ee',
          success:         '#2f8f72',
          'success-light': '#eef7f3',
          warning:         '#c4922a',
          'warning-light': '#fbf6ea',
          navy:            '#1a2744',
          mint:            '#2f8f72',
          coral:           '#c45c52',
          gold:            '#c4922a',
        },
      },
      borderRadius: {
        DEFAULT: '8px',
        sm:  '6px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        panel: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        xs:    ['11px', { lineHeight: '16px' }],
        sm:    ['12px', { lineHeight: '18px' }],
        base:  ['13px', { lineHeight: '20px' }],
        md:    ['14px', { lineHeight: '22px' }],
        lg:    ['16px', { lineHeight: '24px' }],
        xl:    ['18px', { lineHeight: '28px' }],
        '2xl': ['22px', { lineHeight: '32px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },
      animation: {
        'fade-in':        'fade-in 0.25s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
        shimmer:          'shimmer 1.5s infinite',
        pulse:            'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
