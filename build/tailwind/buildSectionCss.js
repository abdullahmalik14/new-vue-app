#!/usr/bin/env node

/**
 * CLI Script to Build Section CSS
 * 
 * Compiles Tailwind CSS for each section defined in routeConfig.
 * Each section gets its own minimal CSS bundle with only the utilities it uses.
 * 
 * Usage:
 *   node build/tailwind/buildSectionCss.js
 *   npm run build:section-css
 */

import { buildAllSectionCss } from './sectionCssCompiler.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🚀 Starting Section CSS Build...\n');

  try {
    const result = await buildAllSectionCss({
      routeConfigPath: join(__dirname, '../../src/router/routeConfig.json'),
      outputDir: join(__dirname, '../../dist/assets'),
      baseDir: join(__dirname, '../../src'),
      manifestPath: join(__dirname, '../../dist/section-css-manifest.json')
    });

    if (result.success) {
      console.log('🎉 Build completed successfully!');
      process.exit(0);
    } else {
      console.error('Build failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

