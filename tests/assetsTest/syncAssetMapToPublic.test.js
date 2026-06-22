import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { syncAssetMapToPublic } from '../../build/vite/syncAssetMapPlugin.js';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('syncAssetMapToPublic (S-05 / B-01)', () => {
  it('copies all assetMap*.json files from src/config to public/config', () => {
    const { copied } = syncAssetMapToPublic(projectRoot);

    expect(copied.length).toBeGreaterThanOrEqual(2);
    expect(copied.some((entry) => entry.dest.endsWith('assetMap.json'))).toBe(true);
    expect(copied.some((entry) => entry.dest.endsWith('assetMap.auth.json'))).toBe(true);

    for (const { src, dest } of copied) {
      expect(readFileSync(src, 'utf8')).toBe(readFileSync(dest, 'utf8'));
    }
  });
});
