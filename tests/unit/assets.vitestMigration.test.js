import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { getProjectRoot } from '../helpers/assetFixtures.js';

const STALE_IMPORT_PATTERN = /(?:from|import)\s*\(?['"][^'"]*utils\/assets/;
const SELF_TEST_FILE = 'tests/unit/assets.vitestMigration.test.js';
const SCANNED_ROOTS = ['src', 'tests'];
const SCANNED_EXTENSIONS = new Set(['.js', '.vue', '.ts', '.mjs', '.cjs']);
const ASSET_TEST_IMPORT_EXCLUSIONS = new Set([
  'tests/unit/assetMapReadme.test.js',
  'tests/unit/assets.vitestMigration.test.js',
  'tests/unit/syncAssetMapToPublic.test.js',
  'tests/unit/assetMap.integrity.test.js',
  'tests/unit/sharedAssetPreloads.integrity.test.js',
  'tests/unit/assetMap.auth.integrity.test.js',
  'tests/unit/settingsMenuItemHost.test.js',
  'tests/unit/settingConfig.test.js',
  'tests/unit/iconGlobeUrl.test.js',
  'tests/unit/cognitoScriptSelfHost.test.js',
  'tests/unit/shopAssetPreloadConfig.test.js',
]);

function listSourceFiles(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    const absolutePath = join(directory, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.git') {
        continue;
      }

      listSourceFiles(absolutePath, files);
      continue;
    }

    const extension = entry.slice(entry.lastIndexOf('.'));

    if (SCANNED_EXTENSIONS.has(extension)) {
      files.push(absolutePath);
    }
  }

  return files;
}

function findStaleImports(rootDir) {
  const projectRoot = getProjectRoot();
  const hits = [];

  for (const absolutePath of listSourceFiles(join(projectRoot, rootDir))) {
    const relativePath = relative(projectRoot, absolutePath).replace(/\\/g, '/');

    if (relativePath === SELF_TEST_FILE) {
      continue;
    }

    const content = readFileSync(absolutePath, 'utf8');

    if (!STALE_IMPORT_PATTERN.test(content)) {
      continue;
    }

    const lines = content.split('\n');

    for (let index = 0; index < lines.length; index += 1) {
      if (STALE_IMPORT_PATTERN.test(lines[index])) {
        hits.push({
          file: relativePath,
          line: index + 1,
          text: lines[index].trim(),
        });
      }
    }
  }

  return hits;
}

describe('assets.vitestMigration — stale utils/assets import guard', () => {
  it('src/ contains no utils/assets import paths', () => {
    const hits = findStaleImports('src');
    expect(hits, formatHits(hits)).toEqual([]);
  });

  it('tests/ contains no utils/assets import paths', () => {
    const hits = findStaleImports('tests');
    expect(hits, formatHits(hits)).toEqual([]);
  });

  it('asset module unit tests import from systems/assets paths', () => {
    const projectRoot = getProjectRoot();
    const assetTests = listSourceFiles(join(projectRoot, 'tests/unit')).filter((filePath) =>
      filePath.includes('asset') && filePath.endsWith('.test.js'),
    );

    expect(assetTests.length).toBeGreaterThan(0);

    for (const absolutePath of assetTests) {
      const relativePath = relative(projectRoot, absolutePath).replace(/\\/g, '/');

      if (ASSET_TEST_IMPORT_EXCLUSIONS.has(relativePath)) {
        continue;
      }

      const content = readFileSync(absolutePath, 'utf8');
      const importsSystemsAssets = /systems\/assets/.test(content);

      expect(
        importsSystemsAssets || /assetFixtures/.test(content),
        `${relativePath} should reference systems/assets or assetFixtures`,
      ).toBe(true);
    }
  });
});

/**
 * @param {Array<{ file: string, line: number, text: string }>} hits
 * @returns {string}
 */
function formatHits(hits) {
  return hits.map((hit) => `${hit.file}:${hit.line} ${hit.text}`).join('\n');
}
