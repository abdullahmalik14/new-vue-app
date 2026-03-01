/**
 * PostCSS Configuration
 * 
 * Configures PostCSS plugins for CSS processing.
 * Tailwind CSS is processed via PostCSS.
 */

export default {
  plugins: {
    tailwindcss: {}, // Add Tailwind CSS
    autoprefixer: {} // Autoprefixer adds vendor prefixes for browser compatibility
  }
};

