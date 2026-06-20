import { describe, expect, it } from 'vitest';
import { resolveRouteAssetPreloads } from '../../src/systems/assets/resolveRouteAssetPreloads.js';
import {
  ALLOWED_ASSET_PRELOAD_PRIORITIES,
  ALLOWED_ASSET_PRELOAD_TYPES,
  collectAssetMapFlags,
  validateRouteAssetPreloadRefs,
  validateSharedCatalogAssetPreloadFlags,
} from '../../src/systems/assets/validateRouteAssetPreloadFlags.js';
import {
  looksLikeRawUrl,
  readProductionAssetMap,
  readProductionJson,
  readProductionSharedPreloads,
} from '../helpers/assetFixtures.js';

function catalogArrays(sharedCatalog) {
  return Object.entries(sharedCatalog).filter(([, value]) => Array.isArray(value));
}

function componentMappings(sharedCatalog) {
  return Object.entries(sharedCatalog).filter(([, value]) => value && typeof value === 'object' && !Array.isArray(value));
}

describe('sharedAssetPreloads.json production config integrity (§0b)', () => {
  const sharedCatalog = readProductionSharedPreloads();
  const assetMap = readProductionAssetMap();
  const routes = readProductionJson('src/router/routeConfig.json');

  it('parses as valid JSON', () => {
    expect(sharedCatalog).toBeTypeOf('object');
    expect(Object.keys(sharedCatalog).length).toBeGreaterThan(0);
  });

  it('every catalog array entry has string flag', () => {
    for (const [catalogKey, entries] of catalogArrays(sharedCatalog)) {
      for (const [index, entry] of entries.entries()) {
        expect(typeof entry?.flag, `${catalogKey}[${index}].flag`).toBe('string');
        expect(entry.flag.trim(), `${catalogKey}[${index}].flag`).not.toBe('');
      }
    }
  });

  it('every catalog entry priority is critical|high|normal when present', () => {
    for (const [catalogKey, entries] of catalogArrays(sharedCatalog)) {
      for (const [index, entry] of entries.entries()) {
        if (entry?.priority == null) {
          continue;
        }

        expect(
          ALLOWED_ASSET_PRELOAD_PRIORITIES.has(entry.priority),
          `${catalogKey}[${index}].priority=${entry.priority}`,
        ).toBe(true);
      }
    }
  });

  it('every catalog entry type is allowed preload type when present', () => {
    for (const [catalogKey, entries] of catalogArrays(sharedCatalog)) {
      for (const [index, entry] of entries.entries()) {
        if (entry?.type == null) {
          continue;
        }

        expect(
          ALLOWED_ASSET_PRELOAD_TYPES.has(entry.type),
          `${catalogKey}[${index}].type=${entry.type}`,
        ).toBe(true);
      }
    }
  });

  it('mapping values are asset flag strings not raw URLs', () => {
    const availableFlags = collectAssetMapFlags(assetMap);

    for (const [mappingKey, slots] of componentMappings(sharedCatalog)) {
      for (const [slotName, flag] of Object.entries(slots)) {
        expect(typeof flag, `${mappingKey}.${slotName}`).toBe('string');
        expect(looksLikeRawUrl(flag), `${mappingKey}.${slotName}`).toBe(false);
        expect(flag.trim(), `${mappingKey}.${slotName}`).not.toBe('');
        expect(
          flag.includes('.') || availableFlags.has(flag),
          `${mappingKey}.${slotName} should be dot-notation flag`,
        ).toBe(true);
      }
    }
  });

  it('no duplicate flags within same catalog array', () => {
    for (const [catalogKey, entries] of catalogArrays(sharedCatalog)) {
      const seen = new Set();

      for (const entry of entries) {
        const flag = entry?.flag;

        if (typeof flag !== 'string') {
          continue;
        }

        expect(seen.has(flag), `${catalogKey} duplicate flag ${flag}`).toBe(false);
        seen.add(flag);
      }
    }
  });

  it('component mapping keys are slot name strings', () => {
    for (const [mappingKey, slots] of componentMappings(sharedCatalog)) {
      for (const slotName of Object.keys(slots)) {
        expect(typeof slotName, `${mappingKey} slot key`).toBe('string');
        expect(slotName.trim(), `${mappingKey} slot key`).not.toBe('');
      }
    }
  });

  it('cross-reference: all mapping flags exist in assetMap.json', () => {
    const availableFlags = collectAssetMapFlags(assetMap);
    const missing = [];

    for (const [, slots] of componentMappings(sharedCatalog)) {
      for (const flag of Object.values(slots)) {
        if (typeof flag === 'string' && !availableFlags.has(flag)) {
          missing.push(flag);
        }
      }
    }

    expect(missing, missing.join('\n')).toEqual([]);
  });

  it('cross-reference: all route assetPreloadRef keys resolve in file', () => {
    const refErrors = [];

    for (const route of routes) {
      const errors = validateRouteAssetPreloadRefs(route, sharedCatalog);
      refErrors.push(...errors);
    }

    expect(refErrors, refErrors.join('\n')).toEqual([]);

    expect(() => resolveRouteAssetPreloads(routes, sharedCatalog)).not.toThrow();
  });

  it('cross-reference: all catalog flags exist in assetMap.json', () => {
    const errors = validateSharedCatalogAssetPreloadFlags(sharedCatalog, assetMap);
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
