/**
 * Vite Plugin: Section CSS Builder
 * 
 * Integrates the Tailwind section CSS build into the Vite build pipeline.
 * Generates per-section CSS files during the build process.
 */

import { buildAllSectionCss } from '../tailwind/sectionCssCompiler.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Buffer } from 'buffer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create the section CSS builder plugin
 * 
 * @returns {object} Vite plugin
 */
export function createSectionCssBuilderPlugin() {
  let projectRoot = process.cwd();
  let compiledCssFiles = new Map(); // Map of section name -> CSS content
  let buildMode = 'development';

  return {
    name: 'vite-plugin-section-css-builder',

    // Set project root during config
    configResolved(config) {
      projectRoot = config.root || process.cwd();
      buildMode = config.mode || (config.command === 'build' ? 'production' : 'development');
      console.log('[SectionCssPlugin] Project root:', projectRoot);
      console.log('[SectionCssPlugin] Build mode:', buildMode);
    },

    // Build section CSS before Vite starts bundling (PRODUCTION ONLY)
    async buildStart() {
      // Skip section CSS build in development - Vite handles it
      if (buildMode === 'development' || process.env.NODE_ENV === 'development') {
        console.log('[SectionCssPlugin] Dev mode - skipping section CSS build (Vite handles CSS)\n');
        return;
      }

      console.log('\n[SectionCssPlugin] Starting section CSS build...\n');

      try {
        const result = await buildAllSectionCss({
          routeConfigPath: join(projectRoot, 'src/router/routeConfig.json'),
          outputDir: join(projectRoot, 'dist/assets'),
          baseDir: join(projectRoot, 'src'),
          manifestPath: join(projectRoot, 'dist/section-css-manifest.json'),
          writeManifest: false
        });

        if (result.success) {
          // Read the generated CSS files and store in memory
          const fs = await import('fs');
          for (const file of result.files) {
            const cssContent = fs.default.readFileSync(file.path, 'utf-8');
            compiledCssFiles.set(file.name, cssContent);
          }
          console.log(`[SectionCssPlugin] ✅ Generated ${result.filesGenerated} section CSS files\n`);
        } else {
          compiledCssFiles = new Map();
          console.warn(`[SectionCssPlugin] ⚠️  Section CSS build completed with errors\n`);
        }
      } catch (error) {
        compiledCssFiles = new Map();
        console.error('[SectionCssPlugin] ❌ Section CSS build failed:', error.message);
        // Don't fail the entire build, just warn
        console.warn('[SectionCssPlugin] Continuing build without section CSS...\n');
      }
    },

    // Hook to emit section CSS files as Vite assets
    generateBundle(options, bundle) {
      const generatedAt = new Date().toISOString();
      const manifest = {
        generated: generatedAt,
        version: '1.0.0',
        sections: {}
      };

      // Emit each section CSS file as a Vite asset
      for (const [sectionName, cssContent] of compiledCssFiles.entries()) {
        const referenceId = this.emitFile({
          type: 'asset',
          name: `section-${sectionName}.css`,
          source: cssContent
        });

        // Get the final filename with hash from Vite
        const fileName = this.getFileName(referenceId);
        const cssPath = fileName.startsWith('/') ? fileName : `/${fileName}`;

        manifest.sections[sectionName] = {
          css: cssPath,
          size: Buffer.byteLength(cssContent, 'utf8'),
          generated: generatedAt
        };

        console.log(`[SectionCssPlugin] ✅ Emitted ${sectionName}: ${fileName}`);
      }

      // Emit the manifest
      this.emitFile({
        type: 'asset',
        fileName: 'section-css-manifest.json',
        source: `${JSON.stringify(manifest, null, 2)}\n`
      });

      console.log(`[SectionCssPlugin] ✅ Emitted manifest with ${compiledCssFiles.size} sections`);
    }
  };
}

