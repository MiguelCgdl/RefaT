import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Redefine standard blue palette to match Northlub brand blue!
        blue: {
          50: 'rgba(30, 115, 190, 0.10)', // brand-transparent highlight
          100: 'rgba(30, 115, 190, 0.20)',
          200: 'rgba(30, 115, 190, 0.35)',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3498db', // Light Blue Accent / Hover
          600: '#1e73be', // Primary Blue
          700: '#185d99',
          800: '#124673',
          900: '#0e3a61',
        },
        primary: {
          50: 'rgba(30, 115, 190, 0.10)',
          100: 'rgba(30, 115, 190, 0.20)',
          500: '#1e73be',
          900: '#124673',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        display: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 12px rgba(30, 115, 190, 0.30)',
        'brand-hover': '0 6px 20px rgba(30, 115, 190, 0.45)',
      }
    },
  },
  plugins: [],
}
export default config
