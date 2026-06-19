/**
 * Regression — no stale utils/section import paths (section test plan §55).
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { getProjectRoot } from '../helpers/sectionFixtures.js';

const STALE_IMPORT_PATTERN =
  /(?:from\s+['"][^'"]*utils\/section|import\s+[^'"]*utils\/section|@\/utils\/section)/;

const SKIPPED_DIRECTORY_NAMES = new Set([
  'node_modules',
  'dist',
  '.git',
  'coverage',
  'agent-tools',
]);

/**
 * @param {string} directory
 * @param {string[]} accumulator
 */
function collectSourceFiles(directory, accumulator = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (SKIPPED_DIRECTORY_NAMES.has(entry.name)) {
      continue;
    }

    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, accumulator);
      continue;
    }

    if (/\.(js|vue|ts|tsx)$/.test(entry.name)) {
      accumulator.push(fullPath);
    }
  }

  return accumulator;
}

describe('section import regression (Phase A §55)', () => {
  it('no file under tests/ or src/ imports from removed utils/section paths', () => {
    const projectRoot = getProjectRoot();
    const scanRoots = [join(projectRoot, 'tests'), join(projectRoot, 'src')];
    const violations = [];

    for (const scanRoot of scanRoots) {
      for (const filePath of collectSourceFiles(scanRoot)) {
        const content = readFileSync(filePath, 'utf8');
        if (STALE_IMPORT_PATTERN.test(content)) {
          violations.push(relative(projectRoot, filePath));
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('sectionTest files do not contain stale utils/section import statements', () => {
    const projectRoot = getProjectRoot();
    const sectionTestDir = join(projectRoot, 'tests/sectionTest');
    const files = collectSourceFiles(sectionTestDir);

    expect(files.length).toBeGreaterThan(0);

    for (const filePath of files) {
      const content = readFileSync(filePath, 'utf8');
      expect(STALE_IMPORT_PATTERN.test(content)).toBe(false);
    }
  });
});
