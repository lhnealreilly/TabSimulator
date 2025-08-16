/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'win95': {
          'gray': '#c0c0c0',
          'darkgray': '#808080',
          'silver': '#dfdfdf',
          'white': '#ffffff',
          'black': '#000000',
          'blue': '#000080',
          'teal': '#008080',
          'navy': '#000080',
          'highlight': '#0a0a80',
          'button-face': '#c0c0c0',
          'button-shadow': '#808080',
          'button-highlight': '#ffffff',
          'button-dark-shadow': '#000000',
          'titlebar-active': '#000080',
          'titlebar-inactive': '#808080',
          'desktop': '#008080',
          'window': '#c0c0c0',
        },
        'resource': {
          'ram': '#ff0000',
          'cpu': '#ffff00',
          'productivity': '#00ff00',
          'focus': '#00ffff',
          'willpower': '#ff00ff',
          'danger': '#ff0000',
        }
      },
      fontFamily: {
        'pixel': ['"MS Sans Serif"', '"Pixelated MS Sans Serif"', 'Arial', 'sans-serif'],
        'mono': ['"Courier New"', 'Courier', 'monospace'],
      },
      boxShadow: {
        'win95-inset': 'inset -1px -1px #ffffff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px #808080',
        'win95-out': 'inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf',
        'win95-window': '1px 1px 0 0 #000000',
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      },
      backgroundImage: {
        'dots': 'radial-gradient(circle, #000000 1px, transparent 1px)',
      },
      backgroundSize: {
        'dots': '2px 2px',
      }
    },
  },
  plugins: [],
}