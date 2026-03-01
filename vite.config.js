/**
 * Vite Configuration
 * 
 * Section-based architecture with automatic code splitting per section.
 * Tailwind CSS compiled via PostCSS.
 */

import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import {
  createSectionBundlerPlugin,
  createManifestGeneratorPlugin,
  createSectionCssBuilderPlugin
} from './build/vite/index.js';

// Section-based bundling plugin
const sectionBundler = createSectionBundlerPlugin();

// Manifest generator plugin (runs after build)
const manifestGenerator = createManifestGeneratorPlugin();

// Section CSS builder plugin (generates per-section CSS)
const sectionCssBuilder = createSectionCssBuilderPlugin();

export default defineConfig(({ mode }) => {
  console.log(`[Vite] Building in ${mode} mode`);

  return {
    // Plugins
    plugins: [
      vue(),
      vueDevTools(),
      sectionBundler,
      sectionCssBuilder, // Build section-specific CSS files
      manifestGenerator
    ],

    // Global constants
    define: {
      global: 'globalThis',
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false
    },

    // Path resolution
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        buffer: 'buffer'
      }
    },

    // Public directory
    publicDir: 'public',

    // Test configuration
    test: {
      environment: 'jsdom',
      globals: true
    },

    // Build configuration
    build: {
      // Generate sourcemaps for debugging
      sourcemap: true,

      // Code splitting per section (not per CSS file globally)
      cssCodeSplit: true,

      // Don't inline assets - keep them separate for preloading
      assetsInlineLimit: 0,

      // Target modern browsers
      target: 'es2020',

      // Rollup options
      rollupOptions: {
        output: {
          // Naming patterns for chunks
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',

          // Manual chunks configuration is handled by sectionBundler plugin
          // It will inject the manualChunks function automatically
        }
      },

      // Minification
      minify: mode === 'production' ? 'esbuild' : false,

      // Chunk size warnings
      chunkSizeWarningLimit: 1000 // 1MB warning threshold
    },

    // Development server configuration
    server: {
      port: 5173,
      strictPort: false,
      open: false,
      cors: true,
      allowedHosts: [
        'marisha-nonprominent-ephemerally.ngrok-free.dev'
      ],

      // Proxy configuration for Twitter OAuth (bypasses CORS)
      proxy: {
        '/api/twitter/token': {
          target: 'https://api.twitter.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/twitter\/token/, '/2/oauth2/token'),
          secure: true
        },
        '/api/twitter': {
          target: 'https://api.twitter.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/twitter/, ''),
          secure: true,
          /**
           * Ensure sensitive headers (like Authorization) are forwarded.
           * Some proxy setups/plugins can drop these headers unless explicitly re-set.
           */
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const auth = req.headers?.authorization;
              if (auth) {
                proxyReq.setHeader('authorization', auth);
                proxyReq.setHeader('Authorization', auth);
              }
              // Extra hardening: ensure the Host header matches target (some APIs validate it)
              proxyReq.setHeader('host', 'api.twitter.com');

              // Debug (dev only): confirm header forwarding for /2/users/me
              if (req.url?.includes('/2/users/me')) {
                const hasAuth = !!auth;
                console.log(`[Vite Proxy] -> Twitter ${req.method} ${req.url} hasAuthorization=${hasAuth}`);
              }
            });

            proxy.on('proxyRes', (proxyRes, req) => {
              if (req.url?.includes('/2/users/me')) {
                console.log(
                  `[Vite Proxy] <- Twitter ${req.method} ${req.url} status=${proxyRes.statusCode} www-authenticate=${proxyRes.headers?.['www-authenticate'] || 'none'}`
                );
              }
            });
          }
        }
      },

      // HMR configuration
      hmr: {
        overlay: true
      }
    },

    // Preview server configuration
    preview: {
      port: 4173,
      strictPort: false,
      open: false
    },

    // Optimization
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'vue-i18n'
      ],
      exclude: [
        // Exclude section translations from optimization
        // They will be lazy loaded
      ]
    }
  };
});

