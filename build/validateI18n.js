#!/usr/bin/env node
/**
 * Validate translation assets for CI (F-10).
 *
 * Usage:
 *   npm run validate:i18n
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateI18n } from '../src/systems/i18n/validateI18n.js';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

console.log('\n=================================');
console.log('Translation Validation (F-10)');
console.log('=================================\n');

const result = validateI18n({ projectRoot });

if (result.warnings.length > 0) {
  console.log(`Warnings (${result.warnings.length}):`);
  for (const warning of result.warnings) {
    console.log(`  ⚠️  ${warning}`);
  }
  console.log('');
}

if (result.errors.length > 0) {
  console.log(`Errors (${result.errors.length}):`);
  for (const error of result.errors) {
    console.log(`  ❌ ${error}`);
  }
  console.log('\n❌ Translation validation failed.\n');
  process.exit(1);
}

console.log('✅ Translation validation passed.');
if (result.warnings.length > 0) {
  console.log(`   (${result.warnings.length} warning(s) — review above)\n`);
} else {
  console.log('');
}

process.exit(0);
