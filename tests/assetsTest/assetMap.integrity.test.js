import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sha256HexFromText } from '../../build/vite/manifestIntegrityNode.js';
import { resolveRouteAssetPreloads } from '../../src/systems/assets/resolveRouteAssetPreloads.js';
import { collectAssetMapFlags } from '../../src/systems/assets/validateRouteAssetPreloadFlags.js';
import {
  collectAllAssetMapFlags,
  getProjectRoot,
  loadSectionAssetMaps,
  readProductionAssetMap,
  readProductionJson,
  readProductionSharedPreloads,
} from '../helpers/assetFixtures.js';

const projectRoot = getProjectRoot();

function readAssetMapText() {
  return readFileSync(join(projectRoot, 'src/config/assetMap.json'), 'utf8');
}

function entriesForEnv(assetMap, envKey) {
  const entries = assetMap?.[envKey];
  return entries && typeof entries === 'object' && !Array.isArray(entries) ? entries : {};
}

function collectRouteCriticalImageFlags(routes) {
  const flags = new Set();

  for (const route of routes) {
    const preloads = Array.isArray(route.assetPreload) ? route.assetPreload : [];

    for (const entry of preloads) {
      if (entry?.priority !== 'critical' || entry?.type !== 'image') {
        continue;
      }

      if (typeof entry.flag === 'string' && entry.flag.trim()) {
        flags.add(entry.flag.trim());
      }
    }
  }

  return flags;
}

function collectSharedCatalogFlagsByType(sharedCatalog, type) {
  const flags = new Set();

  for (const value of Object.values(sharedCatalog || {})) {
    if (!Array.isArray(value)) {
      continue;
    }

    for (const entry of value) {
      if (entry?.type === type && typeof entry.flag === 'string' && entry.flag.trim()) {
        flags.add(entry.flag.trim());
      }
    }
  }

  return flags;
}

describe('assetMap.json production config integrity (§0)', () => {
  const assetMap = readProductionAssetMap();
  const sharedCatalog = readProductionSharedPreloads();
  const routes = resolveRouteAssetPreloads(
    readProductionJson('src/router/routeConfig.json'),
    sharedCatalog,
  );
  const productionFlags = collectAssetMapFlags(assetMap);

  it('parses as valid JSON without throw', () => {
    expect(() => JSON.parse(readAssetMapText())).not.toThrow();
  });

  it('root has production environment key', () => {
    expect(assetMap).toHaveProperty('production');
    expect(typeof assetMap.production).toBe('object');
  });

  it('every flag value is a string URL path', () => {
    for (const envKey of ['production', 'staging', 'development']) {
      for (const [flag, url] of Object.entries(entriesForEnv(assetMap, envKey))) {
        expect(typeof url, `${envKey}.${flag}`).toBe('string');
      }
    }
  });

  it('no duplicate flag keys after normalization', () => {
    for (const envKey of ['production', 'staging', 'development']) {
      const keys = Object.keys(entriesForEnv(assetMap, envKey));
      const normalized = keys.map((key) => key.trim().toLowerCase());
      expect(new Set(normalized).size, envKey).toBe(keys.length);
    }
  });

  it('no empty string URLs', () => {
    for (const envKey of ['production', 'staging', 'development']) {
      for (const [flag, url] of Object.entries(entriesForEnv(assetMap, envKey))) {
        expect(url.trim(), `${envKey}.${flag}`).not.toBe('');
      }
    }
  });

  it('no null or undefined URL values', () => {
    for (const envKey of ['production', 'staging', 'development']) {
      for (const [flag, url] of Object.entries(entriesForEnv(assetMap, envKey))) {
        expect(url, `${envKey}.${flag}`).not.toBeNull();
        expect(url, `${envKey}.${flag}`).not.toBeUndefined();
      }
    }
  });

  it('staging keys follow sparse override contract (only overrides where present)', () => {
    const staging = entriesForEnv(assetMap, 'staging');
    expect(Object.keys(staging).length).toBeGreaterThan(0);

    for (const [flag, url] of Object.entries(staging)) {
      expect(flag).toMatch(/^[a-z0-9]+(\.[a-z0-9]+)*$/i);
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    }
  });

  it('development keys follow sparse override contract when present', () => {
    const development = entriesForEnv(assetMap, 'development');
    expect(Object.keys(development).length).toBeGreaterThan(0);

    for (const [flag, url] of Object.entries(development)) {
      expect(flag).toMatch(/^[a-z0-9]+(\.[a-z0-9]+)*$/i);
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    }
  });

  it('every flag name uses dot-notation (no spaces)', () => {
    for (const flag of collectAllAssetMapFlags(assetMap)) {
      expect(flag).toMatch(/^[a-z0-9]+(\.[a-z0-9_-]+)*$/i);
      expect(flag).not.toMatch(/\s/);
    }
  });

  it('critical image flags referenced in routes exist in map', () => {
    const criticalFlags = collectRouteCriticalImageFlags(routes);

    for (const flag of criticalFlags) {
      expect(productionFlags.has(flag), `missing critical image flag: ${flag}`).toBe(true);
    }
  });

  it('font flags in shared preloads exist in map', () => {
    const fontFlags = collectSharedCatalogFlagsByType(sharedCatalog, 'font');

    for (const flag of fontFlags) {
      expect(productionFlags.has(flag), `missing font flag: ${flag}`).toBe(true);
    }
  });

  it('script flags in shared preloads exist in map', () => {
    const scriptFlags = collectSharedCatalogFlagsByType(sharedCatalog, 'script');

    for (const flag of scriptFlags) {
      expect(productionFlags.has(flag), `missing script flag: ${flag}`).toBe(true);
    }
  });

  it('JSON flags in shared preloads exist in map', () => {
    const jsonFlags = collectSharedCatalogFlagsByType(sharedCatalog, 'json');

    for (const flag of jsonFlags) {
      expect(productionFlags.has(flag), `missing json flag: ${flag}`).toBe(true);
    }
  });

  it('media flags in shared preloads exist in map', () => {
    const mediaTypes = ['video', 'audio'];
    const mediaFlags = new Set();

    for (const type of mediaTypes) {
      for (const flag of collectSharedCatalogFlagsByType(sharedCatalog, type)) {
        mediaFlags.add(flag);
      }
    }

    for (const flag of mediaFlags) {
      expect(productionFlags.has(flag), `missing media flag: ${flag}`).toBe(true);
    }
  });

  it('section asset maps only override flags that exist in global or add section-specific flags', () => {
    const globalFlags = collectAllAssetMapFlags(assetMap);
    const sectionMaps = loadSectionAssetMaps();

    for (const [sectionName, sectionMap] of Object.entries(sectionMaps)) {
      const sectionFlags = collectAllAssetMapFlags(sectionMap);

      for (const flag of sectionFlags) {
        const isGlobal = globalFlags.has(flag);
        const isSectionSpecific = flag.includes(sectionName) || flag.startsWith(`${sectionName}.`);

        expect(
          isGlobal || isSectionSpecific || sectionName === 'auth',
          `section "${sectionName}" flag "${flag}" is not global or section-specific`,
        ).toBe(true);
      }
    }
  });

  it('snapshot hash stable unless intentional asset change', () => {
    const hash = sha256HexFromText(readAssetMapText());
    expect(hash).toMatchInlineSnapshot(`"458c3d901c043401eaf68a526dfd6bd42b77e780a675d9eaed98741d3c179c7d"`);
  });
});
