/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{html,js,ts,jsx,tsx}',
  ],
  // Ensure all classes are included in production build
  safelist: [
    // Responsive classes that might be dynamically generated
    {
      pattern: /^(sm|md|lg|xl):(px|py|gap|text|w|h|min-w|max-w)-/,
    },
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#dfe7fb',
          200: '#c4d2f5',
          300: '#9cb3ec',
          400: '#7793e1',
          500: '#5975c9',
          600: '#435db0',
          700: '#33478c',
          800: '#253368',
          900: '#1d2852',
        },
        neutral: {
          50: '#f7f7f7',
          100: '#ededed',
          200: '#dcdcdc',
          300: '#c3c3c3',
          400: '#9c9c9c',
          500: '#777777',
          600: '#555555',
          700: '#434343',
          800: '#2e2e2e',
          900: '#1f1f1f',
        },
      },
      fontFamily: {
        display: ['"Source Sans Pro"', 'ui-sans-serif', 'system-ui'],
        body: ['"Source Sans Pro"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(24, 39, 75, 0.25)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

