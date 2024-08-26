// tailwind.config.js

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,css}",
  ],
  theme: {
    extend: {
      scale: {
        '120': '0.9',  // Changed from 0.9 to 1.2 for the hover effect
      },
      transitionDuration: {
        '600': '600ms',
      },
      rotate: {
        'y-180': '180deg',
      },
    },
  },
  variants: {
    extend: {
      backfaceVisibility: ['responsive'],
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },
        '.rotate-y-180': {
          transform: 'rotateY(20deg)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}