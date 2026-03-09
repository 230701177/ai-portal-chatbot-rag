import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B3C5D',
          50: '#E8F0F5',
          100: '#D1E1EB',
          500: '#0B3C5D',
          600: '#093249',
          700: '#072836',
        },
        secondary: {
          DEFAULT: '#0F766E',
          50: '#E6F7F6',
          100: '#CCEFED',
          500: '#0F766E',
          600: '#0C5F58',
          700: '#094842',
        },
        accent: {
          DEFAULT: '#C4A000',
          50: '#FDF8E6',
          100: '#FBF1CC',
          500: '#C4A000',
          600: '#9D8000',
          700: '#766000',
        },
        background: '#F4F6F8',
        card: '#FFFFFF',
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'DEFAULT': '8px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
export default config
