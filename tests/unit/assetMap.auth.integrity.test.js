import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sha256HexFromText } from '../../build/vite/manifestIntegrityNode.js';
import {
  collectAllAssetMapFlags,
  getProjectRoot,
  readProductionAssetMap,
  readProductionAuthAssetMap,
} from '../helpers/assetFixtures.js';

const projectRoot = getProjectRoot();

function readAuthMapText() {
  return readFileSync(join(projectRoot, 'src/config/assetMap.auth.json'), 'utf8');
}

function entriesForEnv(assetMap, envKey) {
  const entries = assetMap?.[envKey];
  return entries && typeof entries === 'object' && !Array.isArray(entries) ? entries : {};
}

describe('assetMap.auth.json section map integrity', () => {
  const authMap = readProductionAuthAssetMap();
  const globalMap = readProductionAssetMap();
  const globalFlags = collectAllAssetMapFlags(globalMap);

  it('parses as valid JSON without throw', () => {
    expect(() => JSON.parse(readAuthMapText())).not.toThrow();
  });

  it('root has production environment key', () => {
    expect(authMap).toHaveProperty('production');
    expect(typeof authMap.production).toBe('object');
  });

  it('staging and development keys follow sparse override contract', () => {
    for (const envKey of ['staging', 'development']) {
      const entries = entriesForEnv(authMap, envKey);

      for (const [flag, url] of Object.entries(entries)) {
        expect(flag).toMatch(/^[a-z0-9]+(\.[a-z0-9_-]+)*$/i);
        expect(typeof url).toBe('string');
        expect(url.trim()).not.toBe('');
      }
    }
  });

  it('section overrides reference global flags or auth-specific keys', () => {
    const authFlags = collectAllAssetMapFlags(authMap);

    for (const flag of authFlags) {
      const isGlobal = globalFlags.has(flag);
      const isAuthSpecific = flag.startsWith('auth.');

      expect(
        isGlobal || isAuthSpecific,
        `auth section flag "${flag}" must exist globally or be auth-specific`,
      ).toBe(true);
    }
  });

  it('every flag value is a string URL path', () => {
    for (const envKey of ['production', 'staging', 'development']) {
      for (const [flag, url] of Object.entries(entriesForEnv(authMap, envKey))) {
        expect(typeof url, `${envKey}.${flag}`).toBe('string');
        expect(url.trim(), `${envKey}.${flag}`).not.toBe('');
      }
    }
  });

  it('public copy matches src/config/assetMap.auth.json', () => {
    const srcText = readAuthMapText();
    const publicText = readFileSync(join(projectRoot, 'public/config/assetMap.auth.json'), 'utf8');
    expect(publicText).toBe(srcText);
  });

  it('snapshot hash stable unless intentional auth map change', () => {
    const hash = sha256HexFromText(readAuthMapText());
    expect(hash).toMatchInlineSnapshot(`"2046003ec20e282240ef8939bafcab3f5ed459b49fdbfc27dcae031699db86ba"`);
  });
});
