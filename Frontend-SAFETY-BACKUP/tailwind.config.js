/** @type {import('tailwindcss').Config} */
module.exports = {

  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {

    extend: {

      colors: {

        primary: "#0066ff",
        secondary: "#00c6ff",
        medical: "#0077b6"

      },

      boxShadow: {

        glass:
          "0 8px 32px rgba(0,0,0,0.12)"

      },

      backdropBlur: {

        xs:"2px"

      }

    },

  },

  plugins: [],

}