/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#5B4FE9', light: '#7C6FF0' },
        teal: { DEFAULT: '#22C1A0', dark: '#0FA37E' },
        amber: { DEFAULT: '#F59E0B', dark: '#D6790B' },
        danger: { DEFAULT: '#EF4444', dark: '#DC2626' },
        navy: '#201F52',
        body: '#3A3F52',
        muted: '#7A7F94',
        muted2: '#8A8FA3',
        cardbg: '#FAFAFC',
        cardborder: '#ECEBF5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(32, 31, 82, 0.08)',
      },
    },
  },
  plugins: [],
};
