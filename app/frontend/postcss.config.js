// postcss.config.js  ←  frontend dizininin kökünde
module.exports = {
    plugins: [
      require('tailwindcss'),    //  ←  tekrar eski plugin
      require('autoprefixer'),
    ],
  };