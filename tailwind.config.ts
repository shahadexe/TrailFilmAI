import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0A0A0A',
          50: '#FAFAF7',
          100: '#F5F4EF',
          900: '#0A0A0A',
        },
        amber: {
          accent: '#E5A663',
        },
        sunset: {
          DEFAULT: '#FF6B35',
        },
        'ink-800': '#161616',
        'ink-700': '#1F1F1F',
        'ink-500': '#4A4A4A',
        'parchment-200': '#E8E6DF',
        'parchment-400': '#B5B2A8',
        'parchment-600': '#6B6862',
        'amber-bright': '#FFC881',
        'amber-deep': '#B07F40',
        error: '#D67867',
        success: '#5DBB7D',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      transitionTimingFunction: {
        trailfilm: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        '800': '800ms',
        '1200': '1200ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
