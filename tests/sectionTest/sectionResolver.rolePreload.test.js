/**
 * sectionResolver.js — getPreloadSectionsForRoute (section test plan §1, §59, §83).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const RESOLVER_PATH = '../../src/systems/sections/sectionResolver.js';

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  window.performanceTracker = { step: vi.fn() };
});

describe('getPreloadSectionsForRoute (Phase B §1)', () => {
  async function loadResolver() {
    return import(RESOLVER_PATH);
  }

  it('returns empty array when route is null', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();
    expect(getPreloadSectionsForRoute(null, 'guest')).toEqual([]);
  });

  it('returns empty array when route is undefined', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();
    expect(getPreloadSectionsForRoute(undefined, 'guest')).toEqual([]);
  });

  it('returns empty array when preLoadSections is missing', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();
    expect(getPreloadSectionsForRoute({ slug: '/log-in', section: 'auth' }, 'guest')).toEqual([]);
  });

  it('returns empty array when preLoadSections is null or undefined', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();

    expect(getPreloadSectionsForRoute({ slug: '/a', preLoadSections: null }, 'guest')).toEqual([]);
    expect(getPreloadSectionsForRoute({ slug: '/b', preLoadSections: undefined }, 'guest')).toEqual([]);
  });

  it('returns copy semantics equivalent for flat preLoadSections arrays', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();
    const route = { slug: '/log-in', preLoadSections: ['dashboard', 'shop'] };

    expect(getPreloadSectionsForRoute(route, 'creator')).toEqual(['dashboard', 'shop']);
  });

  it('deduplicates duplicate entries and preserves first-occurrence order', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();
    const route = { slug: '/log-in', preLoadSections: ['dashboard', 'dashboard', 'shop', 'dashboard'] };

    expect(getPreloadSectionsForRoute(route, 'guest')).toEqual(['dashboard', 'shop']);
  });

  it('returns role-specific preload list for matching userRole', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();
    const route = {
      slug: '/dashboard',
      preLoadSections: {
        creator: ['dashboard-creator', 'analytics'],
        fan: ['dashboard-fan', 'shop'],
      },
    };

    expect(getPreloadSectionsForRoute(route, 'creator')).toEqual(['dashboard-creator', 'analytics']);
    expect(getPreloadSectionsForRoute(route, 'fan')).toEqual(['dashboard-fan', 'shop']);
  });

  it('falls back to default then guest for role-keyed preLoadSections', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();

    expect(
      getPreloadSectionsForRoute(
        { slug: '/a', preLoadSections: { default: ['dashboard-global'], creator: ['dashboard-creator'] } },
        'vendor',
      ),
    ).toEqual(['dashboard-global']);

    expect(
      getPreloadSectionsForRoute(
        { slug: '/b', preLoadSections: { guest: ['auth'], creator: ['dashboard-creator'] } },
        'vendor',
      ),
    ).toEqual(['auth']);
  });

  it('returns empty array when role-keyed preLoadSections cannot be resolved', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();

    expect(
      getPreloadSectionsForRoute(
        { slug: '/dashboard', preLoadSections: { creator: ['dashboard-creator'] } },
        'fan',
      ),
    ).toEqual([]);
  });

  it('returns empty array for invalid preLoadSections types', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();

    expect(getPreloadSectionsForRoute({ slug: '/a', preLoadSections: 42 }, 'guest')).toEqual([]);
    expect(getPreloadSectionsForRoute({ slug: '/b', preLoadSections: true }, 'guest')).toEqual([]);
    expect(getPreloadSectionsForRoute({ slug: '/c', preLoadSections: { creator: 'not-an-array' } }, 'guest')).toEqual(
      [],
    );
  });

  it('returns empty array when role list is an empty array (no cross-role fallback)', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();

    expect(
      getPreloadSectionsForRoute(
        { slug: '/dashboard', preLoadSections: { creator: [], default: ['misc'] } },
        'creator',
      ),
    ).toEqual([]);
  });

  it('handles undefined, empty, and unknown userRole via fallback chain', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();
    const route = { slug: '/x', preLoadSections: { default: ['misc'], guest: ['auth'] } };

    expect(getPreloadSectionsForRoute(route, undefined)).toEqual(['misc']);
    expect(getPreloadSectionsForRoute(route, '')).toEqual(['misc']);
    expect(getPreloadSectionsForRoute(route, 'unknown-role')).toEqual(['misc']);
  });

  it('returns empty array for preLoadSections: []', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();
    expect(getPreloadSectionsForRoute({ slug: '/empty', preLoadSections: [] }, 'guest')).toEqual([]);
  });

  it('does not throw when route.slug is missing', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();
    expect(getPreloadSectionsForRoute({ preLoadSections: ['auth'] }, 'guest')).toEqual(['auth']);
  });

  it('records performance tracker steps when tracker is present', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();
    getPreloadSectionsForRoute({ slug: '/log-in', preLoadSections: ['shop'] }, 'guest');

    expect(window.performanceTracker.step).toHaveBeenCalled();
  });

  it('returns empty array when resolveRolePreloadSections throws (catch path)', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();
    const route = { slug: '/throw', preLoadSections: ['auth'] };

    Object.defineProperty(route, 'preLoadSections', {
      get() {
        throw new Error('preload read failed');
      },
    });

    expect(getPreloadSectionsForRoute(route, 'guest')).toEqual([]);
  });
});

describe('getPreloadSectionsForRoute — role matrix (Phase B §59)', () => {
  async function loadResolver() {
    return import(RESOLVER_PATH);
  }

  it('creator gets creator list not fan list when both are defined', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();
    const route = {
      slug: '/host',
      preLoadSections: { creator: ['shop'], fan: ['profile'] },
    };

    expect(getPreloadSectionsForRoute(route, 'creator')).toEqual(['shop']);
    expect(getPreloadSectionsForRoute(route, 'fan')).toEqual(['profile']);
  });

  it('flat list is identical for all roles', async () => {
    const { getPreloadSectionsForRoute } = await loadResolver();
    const route = { slug: '/host', preLoadSections: ['auth', 'shop'] };

    expect(getPreloadSectionsForRoute(route, 'creator')).toEqual(['auth', 'shop']);
    expect(getPreloadSectionsForRoute(route, 'fan')).toEqual(['auth', 'shop']);
  });
});
