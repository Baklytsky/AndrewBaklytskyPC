import path from "path";

/** @type {import('tailwindcss').Config} */
export default {
  content: [path.resolve(__dirname, "**/*.{js,vue,liquid,scss}")],
  theme: {
    extend: {},
  },
  plugins: [],
}

