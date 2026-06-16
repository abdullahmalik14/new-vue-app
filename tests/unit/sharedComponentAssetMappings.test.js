import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateSharedComponentAssetMappings } from '../../src/utils/assets/validateSharedComponentAssetMappings.js';
import {
  getSharedComponentAssetMapping,
  groupComponentSlotsByPreloadTier,
} from '../../src/utils/assets/resolveSharedComponentAssets.js';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(projectRoot, relativePath), 'utf8'));
}

describe('shared component asset mappings (C-06)', () => {
  it('dashboard component slot mappings reference dashboardMenuIcons flags', () => {
    const sharedCatalog = readJson('src/config/sharedAssetPreloads.json');
    const errors = validateSharedComponentAssetMappings(sharedCatalog);

    expect(errors, errors.join('\n')).toEqual([]);
  });

  it('dashboardHeaderChrome includes hamburger from central catalog', () => {
    const mapping = getSharedComponentAssetMapping('dashboardHeaderChrome');

    expect(mapping.hamburger).toBe('dashboard.hamburger');
  });

  it('groupComponentSlotsByPreloadTier uses catalog priorities', () => {
    const groups = groupComponentSlotsByPreloadTier(
      'dashboardHeaderChrome',
      'dashboardMenuIcons',
    );

    expect(groups.high.map((entry) => entry.slot)).toEqual(
      expect.arrayContaining(['logo', 'avatar', 'notification']),
    );
    expect(groups.normal.map((entry) => entry.slot)).toEqual(
      expect.arrayContaining(['language', 'hamburger']),
    );
  });
});
