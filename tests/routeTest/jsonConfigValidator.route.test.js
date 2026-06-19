/**
 * Route-focused jsonConfigValidator coverage — Phase A (route test plan §30).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadProductionRouteConfig } from '../helpers/routeFixtures.js';

const VALIDATOR_PATH = '../../src/systems/build/jsonConfigValidator.js';

const baseRoutes = [
  {
    slug: '/log-in',
    section: 'auth',
    componentPath: '@/dev/templates/auth/page/role/LoginPage.vue',
    supportedRoles: ['all'],
    preLoadSections: ['dashboard', 'shop'],
  },
  {
    slug: '/dashboard',
    section: 'dashboard-global',
    componentPath: '@/templates/dashboard/DashboardPage.vue',
    supportedRoles: ['creator', 'fan', 'agent', 'vendor'],
    preLoadSections: [],
  },
  {
    slug: '/shop',
    section: 'shop',
    componentPath: '@/templates/shop/page/ShopPage.vue',
    supportedRoles: ['all'],
    preLoadSections: [],
  },
];

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  window.performanceTracker = { step: vi.fn() };
});

describe('jsonConfigValidator route helpers (Phase A §30)', () => {
  it('collectKnownSectionNames collects string sections', async () => {
    const { collectKnownSectionNames } = await import(VALIDATOR_PATH);

    const known = collectKnownSectionNames([{ slug: '/a', section: 'auth' }]);

    expect(known.has('auth')).toBe(true);
    expect(known.size).toBe(1);
  });

  it('collectKnownSectionNames collects all values from role-based section object', async () => {
    const { collectKnownSectionNames } = await import(VALIDATOR_PATH);

    const known = collectKnownSectionNames([
      { slug: '/b', section: { creator: 'dashboard-creator', guest: 'dashboard-global' } },
    ]);

    expect(known.has('dashboard-creator')).toBe(true);
    expect(known.has('dashboard-global')).toBe(true);
  });

  it('collectKnownSectionNames ignores empty strings', async () => {
    const { collectKnownSectionNames } = await import(VALIDATOR_PATH);

    const known = collectKnownSectionNames([
      { slug: '/c', section: { creator: '  ', fan: 'dashboard-fan' } },
    ]);

    expect(known.has('dashboard-fan')).toBe(true);
    expect(known.has('  ')).toBe(false);
    expect(known.size).toBe(1);
  });

  it('collectKnownSectionNames returns empty set for empty routes', async () => {
    const { collectKnownSectionNames } = await import(VALIDATOR_PATH);

    expect(collectKnownSectionNames([])).toEqual(new Set());
  });

  it('buildRouteSlugIndex maps slug with and without leading slash', async () => {
    const { buildRouteSlugIndex } = await import(VALIDATOR_PATH);

    const index = buildRouteSlugIndex(baseRoutes);

    expect(index.get('/shop')).toEqual(baseRoutes[2]);
    expect(index.get('shop')).toEqual(baseRoutes[2]);
  });

  it('buildRouteSlugIndex skips routes without slug', async () => {
    const { buildRouteSlugIndex } = await import(VALIDATOR_PATH);

    const index = buildRouteSlugIndex([{ section: 'misc' }, ...baseRoutes]);

    expect(index.size).toBe(baseRoutes.length * 2);
  });

  it('resolvePreloadSectionIdentifier accepts direct section names and slug aliases', async () => {
    const { resolvePreloadSectionIdentifier } = await import(VALIDATOR_PATH);

    expect(resolvePreloadSectionIdentifier('shop', baseRoutes)).toBe('shop');
    expect(resolvePreloadSectionIdentifier('dashboard', baseRoutes)).toBe('dashboard-global');
    expect(resolvePreloadSectionIdentifier('/dashboard', baseRoutes)).toBe('dashboard-global');
  });

  it('resolvePreloadSectionIdentifier returns null for unknown identifier', async () => {
    const { resolvePreloadSectionIdentifier } = await import(VALIDATOR_PATH);

    expect(resolvePreloadSectionIdentifier('dashbord', baseRoutes)).toBeNull();
    expect(resolvePreloadSectionIdentifier('   ', baseRoutes)).toBeNull();
  });

  it('collectPreloadSectionIdentifiers flattens array preLoadSections', async () => {
    const { collectPreloadSectionIdentifiers } = await import(VALIDATOR_PATH);

    expect(collectPreloadSectionIdentifiers(['dashboard', 'shop'])).toEqual([
      'dashboard',
      'shop',
    ]);
  });

  it('collectPreloadSectionIdentifiers flattens role-keyed object values', async () => {
    const { collectPreloadSectionIdentifiers } = await import(VALIDATOR_PATH);

    expect(
      collectPreloadSectionIdentifiers({
        creator: ['shop'],
        fan: ['dashboard'],
      }),
    ).toEqual(['shop', 'dashboard']);
  });

  it('collectPreloadSectionIdentifiers returns empty array when field missing', async () => {
    const { collectPreloadSectionIdentifiers } = await import(VALIDATOR_PATH);

    expect(collectPreloadSectionIdentifiers(undefined)).toEqual([]);
    expect(collectPreloadSectionIdentifiers(null)).toEqual([]);
  });
});

describe('validateRouteConfig route schema (Phase A §30)', () => {
  it('fails when routes is not an array', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig({});

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.type === 'INVALID_TYPE')).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it('errors missing slug', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig([
      {
        section: 'misc',
        componentPath: '@/templates/misc/Open.vue',
        supportedRoles: ['all'],
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.field === 'slug')).toBe(true);
  });

  it('warns or errors duplicate slugs', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig([
      {
        slug: '/duplicate',
        section: 'misc',
        componentPath: '@/templates/misc/A.vue',
        supportedRoles: ['all'],
      },
      {
        slug: '/duplicate',
        section: 'misc',
        componentPath: '@/templates/misc/B.vue',
        supportedRoles: ['all'],
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.type === 'DUPLICATE_SLUGS')).toBe(true);
  });

  it('returns valid, errors, and warnings shape', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig(baseRoutes);

    expect(result).toMatchObject({
      valid: true,
      errors: [],
    });
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('passes when preLoadSections resolve to known sections', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig(baseRoutes);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails build on unknown preLoadSections entries', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const routes = [
      {
        ...baseRoutes[0],
        preLoadSections: ['dashbord'],
      },
      ...baseRoutes.slice(1),
    ];

    const result = validateRouteConfig(routes);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.type === 'UNKNOWN_PRELOAD_SECTION')).toBe(true);
    expect(result.errors[0].message).toContain('dashbord');
  });

  it('fails on empty and non-string preLoadSections entries', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const routes = [
      {
        ...baseRoutes[0],
        preLoadSections: ['', 123],
      },
      ...baseRoutes.slice(1),
    ];

    const result = validateRouteConfig(routes);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.type === 'INVALID_PRELOAD_SECTION')).toBe(true);
    expect(result.errors.some((error) => error.type === 'INVALID_FIELD_TYPE')).toBe(true);
  });

  it('validates role-keyed preLoadSections entries', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const routes = [
      {
        slug: '/dashboard',
        section: {
          creator: 'dashboard-creator',
          fan: 'dashboard-fan',
        },
        componentPath: '@/templates/dashboard/DashboardPage.vue',
        supportedRoles: ['creator', 'fan'],
        preLoadSections: {
          creator: ['shop'],
          fan: ['unknown-section'],
        },
      },
      {
        slug: '/shop',
        section: 'shop',
        componentPath: '@/templates/shop/page/ShopPage.vue',
        supportedRoles: ['all'],
        preLoadSections: [],
      },
    ];

    const result = validateRouteConfig(routes);

    expect(result.valid).toBe(false);
    expect(
      result.errors.some(
        (error) =>
          error.type === 'UNKNOWN_PRELOAD_SECTION' && error.identifier === 'unknown-section',
      ),
    ).toBe(true);
  });

  it('rejects empty supportedRoles', async () => {
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

  it('rejects deprecated "any" wildcard in supportedRoles', async () => {
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
    expect(
      result.errors.some(
        (error) => error.field === 'supportedRoles' && error.message.includes('"any"'),
      ),
    ).toBe(true);
  });

  it('allows redirect-only routes without supportedRoles or section', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig([
      {
        slug: '/:pathMatch(.*)*',
        redirect: '/404',
      },
    ]);

    expect(result.valid).toBe(true);
  });

  it('fails when navigable route is missing section', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig([
      {
        slug: '/missing-section',
        componentPath: '@/templates/misc/MissingSection.vue',
        supportedRoles: ['all'],
      },
    ]);

    expect(result.valid).toBe(false);
    expect(
      result.errors.some(
        (error) => error.type === 'MISSING_REQUIRED_FIELD' && error.field === 'section',
      ),
    ).toBe(true);
  });

  it('rejects invalid assetPreload entry shape', async () => {
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

  it('fails when assetPreload flags are missing from assetMap', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);

    const result = validateRouteConfig([
      {
        slug: '/dashboard',
        section: 'dashboard-global',
        componentPath: '@/dev/templates/dev/DashboardDevPlaygroundPage.vue',
        supportedRoles: ['all'],
        assetPreload: [{ flag: 'dashboard.typo.flag', type: 'image' }],
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.type === 'INVALID_ASSET_PRELOAD_FLAG')).toBe(
      true,
    );
  });

  it('production routeConfig passes validateRouteConfig with zero errors', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);
    const routes = loadProductionRouteConfig();

    const result = validateRouteConfig(routes);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
});
