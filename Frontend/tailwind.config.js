/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5a4',
          600: '#0d9488',
          700: '#0f766e',
        },
        canvas: {
          DEFAULT: '#0E3331',
          light: '#164A46',
        },
        ink: {
          DEFAULT: '#132422',
          light: '#2A403D',
          deep: '#0A1817',
        },
        amber: {
          400: '#E8B45D',
          500: '#E2A33D',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
