import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        flood: {
          50: '#eff8ff',
          100: '#dbeeff',
          600: '#1264b3',
          700: '#0d4f8f',
          900: '#092f52',
        },
      },
      boxShadow: {
        soft: '0 12px 30px rgba(15, 61, 96, .10)',
      },
    },
  },
  plugins: [],
}

export default config
