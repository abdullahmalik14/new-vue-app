import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const VALIDATOR_PATH = '../../src/systems/build/jsonConfigValidator.js';

const baseRoutes = [
  {
    slug: '/log-in',
    section: 'auth',
    componentPath: '@/dev/templates/auth/page/role/LoginPage.vue',
    supportedRoles: ['all'],
    preLoadSections: ['dashboard', 'shop']
  },
  {
    slug: '/dashboard',
    section: 'dashboard-global',
    componentPath: '@/templates/dashboard/DashboardPage.vue',
    supportedRoles: ['creator', 'fan', 'agent', 'vendor'],
    preLoadSections: []
  },
  {
    slug: '/shop',
    section: 'shop',
    componentPath: '@/templates/shop/page/ShopPage.vue',
    supportedRoles: ['all'],
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
        componentPath: '@/templates/dashboard/DashboardPage.vue',
        supportedRoles: ['creator', 'fan'],
        preLoadSections: {
          creator: ['shop'],
          fan: ['unknown-section']
        }
      },
      {
        slug: '/shop',
        section: 'shop',
        componentPath: '@/templates/shop/page/ShopPage.vue',
        supportedRoles: ['all'],
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
    expect(result.valid).toBe(true);
  });
});

describe('jsonConfigValidator supportedRoles (B4)', () => {
  it('validateRouteConfig rejects empty supportedRoles', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig([
      {
        slug: '/open',
        section: 'misc',
        componentPath: '@/templates/misc/Open.vue',
        supportedRoles: [],
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.field === 'supportedRoles')).toBe(true);
  });

  it('validateRouteConfig rejects deprecated "any" wildcard', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig([
      {
        slug: '/profile',
        section: 'profile',
        componentPath: '@/templates/profile/ProfilePage.vue',
        supportedRoles: ['any'],
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) =>
      error.field === 'supportedRoles' && error.message.includes('"any"')
    )).toBe(true);
  });

  it('validateRouteConfig allows redirect-only routes without supportedRoles', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig([
      {
        slug: '/:pathMatch(.*)*',
        redirect: '/404',
      },
    ]);

    expect(result.valid).toBe(true);
  });

  it('production routeConfig uses supportedRoles convention', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);
    const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
    const routes = JSON.parse(
      readFileSync(join(projectRoot, 'src/router/routeConfig.json'), 'utf8')
    );

    const result = validateRouteConfig(routes);
    const roleErrors = result.errors.filter((error) => error.field === 'supportedRoles');

    expect(roleErrors).toHaveLength(0);
  });
});

describe('jsonConfigValidator section (A6)', () => {
  it('validateRouteConfig fails when navigable route is missing section', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig([
      {
        slug: '/missing-section',
        componentPath: '@/templates/misc/MissingSection.vue',
        supportedRoles: ['all'],
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) =>
      error.type === 'MISSING_REQUIRED_FIELD' && error.field === 'section'
    )).toBe(true);
  });

  it('validateRouteConfig allows redirect-only routes without section', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig([
      {
        slug: '/:pathMatch(.*)*',
        redirect: '/404',
      },
    ]);

    expect(result.valid).toBe(true);
  });

  it('validateRouteConfig rejects invalid assetPreload entry shape (C-09)', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig([
      {
        slug: '/dashboard/overview',
        section: 'dashboard-creator',
        componentPath: '@/templates/dashboard/creator/CreatorDashboardOverviewPage.vue',
        supportedRoles: ['creator'],
        assetPreload: [{ flag: 'dashboard.logo', type: 'sprite', priority: 'urgent' }],
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.field === 'assetPreload')).toBe(true);
  });

  it('validateRouteConfig fails when assetPreload flags are missing from assetMap (M-04 / C-09)', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig([
      {
        slug: '/dashboard',
        section: 'dashboard-global',
        componentPath: '@/templates/dashboard/role/DashboardDevPlaygroundPage.vue',
        supportedRoles: ['all'],
        assetPreload: [{ flag: 'dashboard.typo.flag', type: 'image' }],
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.type === 'INVALID_ASSET_PRELOAD_FLAG')).toBe(true);
  });

  it('production routeConfig has section on all navigable routes', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);
    const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
    const routes = JSON.parse(
      readFileSync(join(projectRoot, 'src/router/routeConfig.json'), 'utf8')
    );

    const result = validateRouteConfig(routes);
    const sectionErrors = result.errors.filter((error) => error.field === 'section');

    expect(sectionErrors).toHaveLength(0);
    expect(result.valid).toBe(true);
  });
});
