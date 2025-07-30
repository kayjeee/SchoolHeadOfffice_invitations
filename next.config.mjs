// next.config.mjs
export default {
  reactStrictMode: true,
  postcss: [
    import('tailwindcss'),
    import('autoprefixer'),
  ],

};
