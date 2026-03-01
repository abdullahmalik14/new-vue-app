#!/usr/bin/env node

/**
 * CLI Script to Generate Individual Component CSS
 * 
 * Scans the codebase for components marked with tailwind-ignore
 * and generates individual CSS files for each one.
 * 
 * Usage:
 *   node build/tailwind/generateIndividualCss.js
 *   node build/tailwind/generateIndividualCss.js --clean  # Clean up first
 */

import { generateAllIndividualComponentCss, logGenerationReport, createComponentCssManifest, cleanupGeneratedCss } from './individualCssGenerator.js';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const shouldClean = args.includes('--clean');

async function main() {
  console.log('🎨 Individual Component CSS Generator\n');

  const baseDirectory = join(__dirname, '../../src');

  try {
    // Clean up existing CSS files if requested
    if (shouldClean) {
      console.log('🧹 Cleaning up existing generated CSS files...');
      const deletedCount = cleanupGeneratedCss(baseDirectory);
      console.log(`✅ Deleted ${deletedCount} generated CSS files\n`);
    }

    // Generate CSS for all ignored components
    console.log('🔍 Scanning for components with tailwind-ignore markers...');
    const results = await generateAllIndividualComponentCss(baseDirectory);

    // Log results
    logGenerationReport(results);

    // Create manifest
    const manifest = createComponentCssManifest(results);
    const manifestPath = join(__dirname, '../../dist/component-css-manifest.json');
    
    // Write manifest (create dist directory if needed)
    try {
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
      console.log(`📋 Manifest written to: ${manifestPath}\n`);
    } catch (error) {
      console.warn(`⚠️  Could not write manifest (dist folder may not exist yet): ${error.message}\n`);
    }

    // Exit with appropriate code
    const hasFailures = results.some(r => !r.success);
    process.exit(hasFailures ? 1 : 0);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

