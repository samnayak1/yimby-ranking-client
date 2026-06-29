export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        yimby: {
          50:  '#f0faf4',
          100: '#d8f3e3',
          200: '#b3e6c9',
          300: '#7dd3a8',
          400: '#4aba84',
          500: '#2da066',
          600: '#1f8051',
          700: '#1a6641',
          800: '#175235',
          900: '#14432c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};