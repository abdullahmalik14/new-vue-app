/**
 * routeResolver.js — Phase B (route test plan §2).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCanonicalRouteFixtures } from '../helpers/routeFixtures.js';

const getRouteConfiguration = vi.fn(() => getCanonicalRouteFixtures());

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration,
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  getRouteConfiguration.mockReturnValue(getCanonicalRouteFixtures());
  window.performanceTracker = { step: vi.fn() };
});

describe('resolveRouteFromPath (Phase B §2)', () => {
  it('returns exact match for /dashboard', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');

    expect(resolveRouteFromPath('/dashboard')?.slug).toBe('/dashboard');
  });

  it('returns catch-all route for unknown path', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');

    expect(resolveRouteFromPath('/does-not-exist')?.slug).toBe('/:pathMatch(.*)*');
  });

  it('matches route via aliases', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');

    expect(resolveRouteFromPath('/store')?.slug).toBe('/shop');
  });

  it('matches catch-all wildcard route for unmatched deep paths', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');

    expect(resolveRouteFromPath('/totally/unknown/nested/path')?.slug).toBe('/:pathMatch(.*)*');
  });

  it('prefers exact slug match over catch-all wildcard', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');

    expect(resolveRouteFromPath('/404')?.slug).toBe('/404');
  });

  it('handles empty, null, and whitespace-only paths without throw', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');

    expect(() => resolveRouteFromPath('')).not.toThrow();
    expect(() => resolveRouteFromPath(null)).not.toThrow();
    expect(() => resolveRouteFromPath(undefined)).not.toThrow();
    expect(() => resolveRouteFromPath('   ')).not.toThrow();

    // Catch-all matches unmatched paths including empty/whitespace/null inputs.
    expect(resolveRouteFromPath('')?.slug).toBe('/:pathMatch(.*)*');
    expect(resolveRouteFromPath('   ')?.slug).toBe('/:pathMatch(.*)*');
    expect(resolveRouteFromPath(null)?.slug).toBe('/:pathMatch(.*)*');
    expect(resolveRouteFromPath(undefined)?.slug).toBe('/:pathMatch(.*)*');
  });

  it('works without performanceTracker (SSR-safe)', async () => {
    delete window.performanceTracker;
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');

    expect(() => resolveRouteFromPath('/log-in')).not.toThrow();
    expect(resolveRouteFromPath('/log-in')?.slug).toBe('/log-in');
  });
});

describe('resolveExactRouteFromPath (Phase B §2)', () => {
  it('returns match for known exact slug', async () => {
    const { resolveExactRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');

    expect(resolveExactRouteFromPath('/dashboard')?.slug).toBe('/dashboard');
  });

  it('returns null for path only matchable by catch-all wildcard', async () => {
    const { resolveExactRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');

    expect(resolveExactRouteFromPath('/unknown/deep/path')).toBeNull();
  });

  it('matches alias paths without falling through to wildcard', async () => {
    const { resolveExactRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');

    expect(resolveExactRouteFromPath('/store')?.slug).toBe('/shop');
  });
});

describe('resolveComponentPathForRoute (Phase B §2)', () => {
  it('returns default componentPath for simple route', async () => {
    const { resolveComponentPathForRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const route = getCanonicalRouteFixtures().find((entry) => entry.slug === '/dashboard');

    expect(resolveComponentPathForRoute(route, 'creator')).toBe(route.componentPath);
  });

  it('returns customComponentPath for matching role', async () => {
    const { resolveComponentPathForRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const route = getCanonicalRouteFixtures().find((entry) => entry.slug === '/dashboard/payout');

    expect(resolveComponentPathForRoute(route, 'creator')).toBe(
      '@/dev/templates/dashboard/creator/PayoutPage.vue',
    );
  });

  it('returns null when route has redirect string', async () => {
    const { resolveComponentPathForRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const route = getCanonicalRouteFixtures().find((entry) => entry.slug.includes('pathMatch'));

    expect(resolveComponentPathForRoute(route, 'creator')).toBeNull();
  });

  it('returns null when no componentPath and no matching custom path', async () => {
    const { resolveComponentPathForRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const route = {
      slug: '/empty',
      customComponentPath: {
        fan: { componentPath: '@/dev/templates/fan/Page.vue' },
      },
    };

    expect(resolveComponentPathForRoute(route, 'creator')).toBeNull();
  });

  it('falls back to default componentPath when role override missing', async () => {
    const { resolveComponentPathForRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const route = {
      slug: '/mixed',
      componentPath: '@/dev/templates/default/Page.vue',
      customComponentPath: {
        creator: { componentPath: '@/dev/templates/creator/Page.vue' },
      },
    };

    expect(resolveComponentPathForRoute(route, 'fan')).toBe('@/dev/templates/default/Page.vue');
  });
});

describe('getRouteChainForPath and resolveEffectiveAssetPreloadForRoute (Phase B §2)', () => {
  it('returns progressive chain for nested dashboard paths', async () => {
    const { getRouteChainForPath } = await import('../../src/systems/routing/routeResolver.js');

    const chain = getRouteChainForPath('/dashboard/settings/privacy');

    expect(chain.map((route) => route.slug)).toEqual([
      '/dashboard',
      '/dashboard/settings',
      '/dashboard/settings/privacy',
    ]);
  });

  it('resolveEffectiveAssetPreloadForRoute merges inherited parent assets', async () => {
    const { resolveEffectiveAssetPreloadForRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const route = getCanonicalRouteFixtures().find((entry) => entry.slug === '/dashboard/payout');
    const assets = resolveEffectiveAssetPreloadForRoute(route);

    expect(assets.some((entry) => entry.flag === 'dashboard.logo')).toBe(true);
  });

  it('resolveEffectiveAssetPreloadForRoute returns empty array for null route', async () => {
    const { resolveEffectiveAssetPreloadForRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    expect(resolveEffectiveAssetPreloadForRoute(null)).toEqual([]);
  });
});
