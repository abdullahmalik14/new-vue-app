import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const VALIDATOR_PATH = '../../src/utils/build/jsonConfigValidator.js';

const baseRoutes = [
  {
    slug: '/log-in',
    section: 'auth',
    componentPath: '@/templates/auth/page/role/AuthLogIn.vue',
    preLoadSections: ['dashboard', 'shop']
  },
  {
    slug: '/dashboard',
    section: 'dashboard-global',
    componentPath: '@/templates/dashboard/page/DashboardPage.vue',
    preLoadSections: []
  },
  {
    slug: '/shop',
    section: 'shop',
    componentPath: '@/templates/shop/page/ShopPage.vue',
    preLoadSections: []
  }
];

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  window.performanceTracker = { step: vi.fn() };
});

describe('jsonConfigValidator preLoadSections (M-08)', () => {
  it('collectKnownSectionNames includes string and role-based section values', async () => {
    const { collectKnownSectionNames } = await import(VALIDATOR_PATH);

    const known = collectKnownSectionNames([
      { slug: '/a', section: 'auth' },
      { slug: '/b', section: { creator: 'dashboard-creator', guest: 'dashboard-global' } }
    ]);

    expect(known.has('auth')).toBe(true);
    expect(known.has('dashboard-creator')).toBe(true);
    expect(known.has('dashboard-global')).toBe(true);
  });

  it('resolvePreloadSectionIdentifier accepts direct section names and slug aliases', async () => {
    const { resolvePreloadSectionIdentifier } = await import(VALIDATOR_PATH);

    expect(resolvePreloadSectionIdentifier('shop', baseRoutes)).toBe('shop');
    expect(resolvePreloadSectionIdentifier('dashboard', baseRoutes)).toBe('dashboard-global');
    expect(resolvePreloadSectionIdentifier('/dashboard', baseRoutes)).toBe('dashboard-global');
  });

  it('resolvePreloadSectionIdentifier rejects unknown identifiers', async () => {
    const { resolvePreloadSectionIdentifier } = await import(VALIDATOR_PATH);

    expect(resolvePreloadSectionIdentifier('dashbord', baseRoutes)).toBeNull();
    expect(resolvePreloadSectionIdentifier('   ', baseRoutes)).toBeNull();
  });

  it('validateRouteConfig passes when preLoadSections resolve to known sections', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig(baseRoutes);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validateRouteConfig fails build on unknown preLoadSections entries', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const routes = [
      {
        ...baseRoutes[0],
        preLoadSections: ['dashbord']
      },
      ...baseRoutes.slice(1)
    ];

    const result = validateRouteConfig(routes);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.type === 'UNKNOWN_PRELOAD_SECTION')).toBe(true);
    expect(result.errors[0].message).toContain('dashbord');
  });

  it('validateRouteConfig fails on empty and non-string preLoadSections entries', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const routes = [
      {
        ...baseRoutes[0],
        preLoadSections: ['', 123]
      },
      ...baseRoutes.slice(1)
    ];

    const result = validateRouteConfig(routes);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.type === 'INVALID_PRELOAD_SECTION')).toBe(true);
    expect(result.errors.some((error) => error.type === 'INVALID_FIELD_TYPE')).toBe(true);
  });

  it('validateRouteConfig validates role-keyed preLoadSections entries', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const routes = [
      {
        slug: '/dashboard',
        section: {
          creator: 'dashboard-creator',
          fan: 'dashboard-fan'
        },
        componentPath: '@/templates/dashboard/page/DashboardPage.vue',
        preLoadSections: {
          creator: ['shop'],
          fan: ['unknown-section']
        }
      },
      {
        slug: '/shop',
        section: 'shop',
        componentPath: '@/templates/shop/page/ShopPage.vue',
        preLoadSections: []
      }
    ];

    const result = validateRouteConfig(routes);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) =>
      error.type === 'UNKNOWN_PRELOAD_SECTION' && error.identifier === 'unknown-section'
    )).toBe(true);
  });

  it('validates production routeConfig preLoadSections without unknown identifiers', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);
    const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
    const routes = JSON.parse(
      readFileSync(join(projectRoot, 'src/router/routeConfig.json'), 'utf8')
    );

    const result = validateRouteConfig(routes);
    const unknownPreloadErrors = result.errors.filter(
      (error) => error.type === 'UNKNOWN_PRELOAD_SECTION'
    );

    expect(unknownPreloadErrors).toHaveLength(0);
  });
});
