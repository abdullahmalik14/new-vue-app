import { describe, it, expect, beforeEach, vi } from 'vitest';

const LOADER_PATH = '../../src/systems/sections/sectionResolver.js';

beforeEach(() => {
  vi.resetModules();
  window.performanceTracker = { step: vi.fn() };
});

describe('getPreloadSectionsForRoute (L-06)', () => {
  it('returns flat preLoadSections arrays unchanged', async () => {
    const { getPreloadSectionsForRoute } = await import(LOADER_PATH);

    const route = {
      slug: '/log-in',
      preLoadSections: ['dashboard', 'shop']
    };

    expect(getPreloadSectionsForRoute(route, 'creator')).toEqual(['dashboard', 'shop']);
  });

  it('resolves role-keyed preLoadSections using userRole', async () => {
    const { getPreloadSectionsForRoute } = await import(LOADER_PATH);

    const route = {
      slug: '/dashboard',
      preLoadSections: {
        creator: ['dashboard-creator', 'analytics'],
        fan: ['dashboard-fan', 'shop']
      }
    };

    expect(getPreloadSectionsForRoute(route, 'creator')).toEqual([
      'dashboard-creator',
      'analytics'
    ]);
    expect(getPreloadSectionsForRoute(route, 'fan')).toEqual(['dashboard-fan', 'shop']);
  });

  it('falls back to default then guest for role-keyed preLoadSections', async () => {
    const { getPreloadSectionsForRoute } = await import(LOADER_PATH);

    const routeWithDefault = {
      slug: '/dashboard',
      preLoadSections: {
        default: ['dashboard-global'],
        creator: ['dashboard-creator']
      }
    };

    expect(getPreloadSectionsForRoute(routeWithDefault, 'vendor')).toEqual(['dashboard-global']);

    const routeWithGuest = {
      slug: '/dashboard',
      preLoadSections: {
        guest: ['auth'],
        creator: ['dashboard-creator']
      }
    };

    expect(getPreloadSectionsForRoute(routeWithGuest, 'vendor')).toEqual(['auth']);
  });

  it('returns an empty array when role-keyed preLoadSections cannot be resolved', async () => {
    const { getPreloadSectionsForRoute } = await import(LOADER_PATH);

    const route = {
      slug: '/dashboard',
      preLoadSections: {
        creator: ['dashboard-creator']
      }
    };

    expect(getPreloadSectionsForRoute(route, 'fan')).toEqual([]);
  });

  it('deduplicates resolved preload section identifiers', async () => {
    const { getPreloadSectionsForRoute } = await import(LOADER_PATH);

    const route = {
      slug: '/log-in',
      preLoadSections: ['dashboard', 'dashboard', 'shop']
    };

    expect(getPreloadSectionsForRoute(route, 'guest')).toEqual(['dashboard', 'shop']);
  });
});

describe('resolveRoleSectionVariant (L-07)', () => {
  it('returns the role-specific section when present', async () => {
    const { resolveRoleSectionVariant } = await import(LOADER_PATH);

    const sectionConfig = {
      creator: 'dashboard-creator',
      fan: 'dashboard-fan'
    };

    expect(resolveRoleSectionVariant(sectionConfig, 'creator')).toBe('dashboard-creator');
  });

  it('falls back to the default key when role is missing', async () => {
    const { resolveRoleSectionVariant } = await import(LOADER_PATH);

    const sectionConfig = {
      default: 'dashboard-global',
      creator: 'dashboard-creator'
    };

    expect(resolveRoleSectionVariant(sectionConfig, 'vendor')).toBe('dashboard-global');
  });

  it('returns null instead of Object.values()[0] when role and default are missing', async () => {
    const { resolveRoleSectionVariant } = await import(LOADER_PATH);

    const sectionConfig = {
      creator: 'dashboard-creator',
      fan: 'dashboard-fan'
    };

    expect(resolveRoleSectionVariant(sectionConfig, 'vendor')).toBeNull();
  });
});
