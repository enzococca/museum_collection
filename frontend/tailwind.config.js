/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Museum-inspired palette - warm terracotta and bronze tones
        primary: {
          50: '#fef7f0',
          100: '#fdecd8',
          200: '#fad6b0',
          300: '#f6b97e',
          400: '#f19249',
          500: '#ed7426',
          600: '#de5a1c',
          700: '#b84419',
          800: '#93371c',
          900: '#772f1a',
          950: '#40160b',
        },
        // Rich museum brown for accents
        museum: {
          50: '#faf6f3',
          100: '#f3ebe3',
          200: '#e6d5c6',
          300: '#d5b9a2',
          400: '#c1977a',
          500: '#b37d5e',
          600: '#a66a51',
          700: '#8a5544',
          800: '#71473c',
          900: '#5d3c33',
          950: '#311e19',
        },
        // Deep bronze for headers
        bronze: {
          50: '#f9f7f5',
          100: '#f1ede8',
          200: '#e2d9ce',
          300: '#cfc0ad',
          400: '#b9a189',
          500: '#a9896d',
          600: '#9c7861',
          700: '#826252',
          800: '#6a5146',
          900: '#57443b',
          950: '#2e231e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'museum-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d5b9a2' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'museum': '0 4px 20px -2px rgba(119, 47, 26, 0.15)',
        'museum-lg': '0 10px 40px -3px rgba(119, 47, 26, 0.2)',
      }
    },
  },
  plugins: [],
}
