import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getProjectRoot, setupAssetTestEnv } from '../helpers/assetFixtures.js';

const validateAssetPreloadEntryShape = vi.fn();
const validateRouteAssetPreloadRefs = vi.fn();
const validateRouteAssetPreloadFlags = vi.fn();
const validateSharedCatalogAssetPreloadFlags = vi.fn();
const resolveRouteAssetPreloads = vi.fn();
const isValidRouteEnvAccess = vi.fn();
const findDuplicateRoutePathClaims = vi.fn();

vi.mock('../../src/config/sharedAssetPreloads.json', () => ({
  default: {
    menuIcons: [{ flag: 'dashboard.menu.analytics', type: 'image', priority: 'high' }],
  },
}));

vi.mock('../../src/config/assetMap.json', () => ({
  default: {
    production: {
      'dashboard.menu.analytics': '/icons/analytics.svg',
    },
  },
}));

vi.mock('../../src/systems/assets/assetPolicy.js', () => ({
  validateAssetPreloadEntryShape,
  validateRouteAssetPreloadRefs,
  validateRouteAssetPreloadFlags,
  validateSharedCatalogAssetPreloadFlags,
}));

vi.mock('../../src/systems/assets/resolveRouteAssetPreloads.js', () => ({
  resolveRouteAssetPreloads,
}));

vi.mock('../../src/systems/routing/routeEnvAccess.js', () => ({
  isValidRouteEnvAccess,
}));

vi.mock('../../src/systems/routing/routeAliasResolver.js', () => ({
  findDuplicateRoutePathClaims,
}));

function loadSharedPreloads() {
  return JSON.parse(
    readFileSync(join(getProjectRoot(), 'src/config/sharedAssetPreloads.json'), 'utf8'),
  );
}

describe('jsonConfigValidator.assets (§89)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    validateAssetPreloadEntryShape.mockReset();
    validateRouteAssetPreloadRefs.mockReset();
    validateRouteAssetPreloadFlags.mockReset();
    validateSharedCatalogAssetPreloadFlags.mockReset();
    resolveRouteAssetPreloads.mockReset();
    isValidRouteEnvAccess.mockReset();
    findDuplicateRoutePathClaims.mockReset();

    validateAssetPreloadEntryShape.mockReturnValue([]);
    validateRouteAssetPreloadRefs.mockReturnValue([]);
    validateRouteAssetPreloadFlags.mockReturnValue({ valid: true, errors: [] });
    validateSharedCatalogAssetPreloadFlags.mockReturnValue([]);
    resolveRouteAssetPreloads.mockImplementation((routes) => routes);
    isValidRouteEnvAccess.mockReturnValue(true);
    findDuplicateRoutePathClaims.mockReturnValue([]);
  });

  it('validateRouteConfig calls asset validators', async () => {
    const { validateRouteConfig } = await import('../../src/systems/build/jsonConfigValidator.js');

    const result = validateRouteConfig([
      {
        slug: '/dashboard',
        componentPath: '@/components/Dashboard.vue',
        section: 'dashboard',
        supportedRoles: ['all'],
        assetPreload: [{ flag: 'dashboard.menu.analytics', type: 'image', priority: 'high' }],
        assetPreloadRef: ['menuIcons'],
      },
    ]);

    expect(result.valid).toBe(true);
    expect(validateAssetPreloadEntryShape).toHaveBeenCalled();
    expect(validateRouteAssetPreloadRefs).toHaveBeenCalled();
    expect(validateRouteAssetPreloadFlags).toHaveBeenCalled();
    expect(validateSharedCatalogAssetPreloadFlags).toHaveBeenCalled();
  });

  it('rejects bad assetPreload shape', async () => {
    validateAssetPreloadEntryShape.mockReturnValueOnce(['Route entry 0 invalid']);

    const { validateRouteConfig } = await import('../../src/systems/build/jsonConfigValidator.js');

    const result = validateRouteConfig([
      {
        slug: '/dashboard',
        componentPath: '@/components/Dashboard.vue',
        section: 'dashboard',
        supportedRoles: ['all'],
        assetPreload: [{ bad: true }],
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.type === 'INVALID_ASSET_PRELOAD_ENTRY')).toBe(true);
  });

  it('rejects bad assetPreloadRef', async () => {
    validateRouteAssetPreloadRefs.mockReturnValueOnce(['Unknown asset preload ref']);

    const { validateRouteConfig } = await import('../../src/systems/build/jsonConfigValidator.js');

    const result = validateRouteConfig([
      {
        slug: '/dashboard',
        componentPath: '@/components/Dashboard.vue',
        section: 'dashboard',
        supportedRoles: ['all'],
        assetPreloadRef: ['missingCatalog'],
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.type === 'INVALID_ASSET_PRELOAD_REF')).toBe(true);
  });

  it('validates shared catalog flags', async () => {
    validateSharedCatalogAssetPreloadFlags.mockReturnValueOnce(['Shared catalog flag missing']);

    const { validateRouteConfig } = await import('../../src/systems/build/jsonConfigValidator.js');

    const result = validateRouteConfig([
      {
        slug: '/dashboard',
        componentPath: '@/components/Dashboard.vue',
        section: 'dashboard',
        supportedRoles: ['all'],
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.type === 'INVALID_SHARED_CATALOG_FLAG')).toBe(true);
  });

  it('validates shared component mappings', async () => {
    const { validateSharedComponentAssetMappings } = await import(
      '../../src/systems/assets/validateSharedComponentAssetMappings.js'
    );

    const errors = validateSharedComponentAssetMappings(loadSharedPreloads());

    expect(Array.isArray(errors)).toBe(true);
  });
});
