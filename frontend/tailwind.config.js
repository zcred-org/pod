import { nextui } from '@nextui-org/react';
import plugin from 'tailwindcss/plugin';


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'wave-load': 'wave-load 1.5s ease-in-out infinite',
      },
      keyframes: {
        'wave-load': {
          '0%, 100%': { height: '10%' },
          '50%': { height: '100%' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [
    nextui(),
    plugin(({ matchUtilities, theme }) => matchUtilities(
      { 'animate-delay': (value) => ({ animationDelay: value }) },
      { values: theme('transitionDelay') },
    )),
    plugin(({ matchUtilities, theme }) => matchUtilities(
      { 'animate-duration': (value) => ({ animationDuration: value }) },
      { values: theme('transitionDuration') },
    )),
  ],
};
