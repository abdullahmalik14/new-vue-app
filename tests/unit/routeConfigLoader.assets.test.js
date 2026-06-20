import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAssetTestEnv } from '../helpers/assetFixtures.js';

const loadJsonConfigFromImport = vi.fn();
const clearConfigCache = vi.fn();
const resolveRouteAssetPreloads = vi.fn();
const validateRouteComponentPathsWithResolver = vi.fn();
const findComponentLoader = vi.fn();
const validateRouteAssetPreloadFlags = vi.fn();

vi.mock('../../src/router/routeConfig.json', () => ({
  default: [
    {
      slug: '/dashboard',
      section: 'dashboard',
      supportedRoles: ['all'],
      assetPreloadRef: ['menuIcons'],
      componentPath: '@/components/Dashboard.vue',
    },
  ],
}));

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

vi.mock('../../src/utils/common/jsonConfigLoader.js', () => ({
  loadJsonConfigFromImport,
  clearConfigCache,
}));

vi.mock('../../src/systems/build/jsonConfigValidator.js', () => ({
  validateRouteConfig: vi.fn(() => ({ valid: true, errors: [], warnings: [] })),
}));

vi.mock('../../src/systems/assets/resolveRouteAssetPreloads.js', () => ({
  resolveRouteAssetPreloads,
}));

vi.mock('../../src/systems/routing/routeComponentPathValidator.js', () => ({
  validateRouteComponentPathsWithResolver,
}));

vi.mock('../../src/systems/routing/routeComponentLoader.js', () => ({
  findComponentLoader,
}));

vi.mock('../../src/systems/assets/assetPolicy.js', () => ({
  validateRouteAssetPreloadFlags,
}));

describe('routeConfigLoader.assets (§88)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    loadJsonConfigFromImport.mockReset();
    clearConfigCache.mockReset();
    resolveRouteAssetPreloads.mockReset();
    validateRouteComponentPathsWithResolver.mockReset();
    findComponentLoader.mockReset();
    validateRouteAssetPreloadFlags.mockReset();
    loadJsonConfigFromImport.mockImplementation((source, options) => ({
      success: true,
      data: source,
      error: null,
      validator: options.validator,
    }));
    resolveRouteAssetPreloads.mockImplementation((routes) => routes);
    validateRouteComponentPathsWithResolver.mockReturnValue({ valid: true, errors: [] });
    findComponentLoader.mockReturnValue(() => Promise.resolve({ default: {} }));
    validateRouteAssetPreloadFlags.mockReturnValue({ valid: true, errors: [] });
  });

  it('loadRouteConfigurationFromFile expands assetPreloadRef', async () => {
    const { loadRouteConfigurationFromFile } = await import('../../src/systems/routing/routeConfigLoader.js');

    await loadRouteConfigurationFromFile();

    expect(resolveRouteAssetPreloads).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          assetPreloadRef: ['menuIcons'],
        }),
      ]),
      expect.objectContaining({
        menuIcons: expect.any(Array),
      }),
    );
  });

  it('validates flags after load', async () => {
    const { loadRouteConfigurationFromFile } = await import('../../src/systems/routing/routeConfigLoader.js');

    await loadRouteConfigurationFromFile();

    expect(validateRouteAssetPreloadFlags).toHaveBeenCalled();
  });

  it('fails on missing flag', async () => {
    validateRouteAssetPreloadFlags.mockReturnValueOnce({
      valid: false,
      errors: ['Missing asset flag: dashboard.menu.analytics'],
    });

    const { loadRouteConfigurationFromFile } = await import('../../src/systems/routing/routeConfigLoader.js');

    const routes = await loadRouteConfigurationFromFile();

    expect(routes).toEqual([]);
  });

  it('uses sharedAssetPreloads.json', async () => {
    const { loadRouteConfigurationFromFile } = await import('../../src/systems/routing/routeConfigLoader.js');

    await loadRouteConfigurationFromFile();

    expect(resolveRouteAssetPreloads).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        menuIcons: expect.any(Array),
      }),
    );
  });

  it('resetRouteConfigurationCache clears asset-related caches', async () => {
    const { resetRouteConfigurationCache } = await import('../../src/systems/routing/routeConfigLoader.js');

    resetRouteConfigurationCache();

    expect(clearConfigCache).toHaveBeenCalledWith('route_config');
  });
});
