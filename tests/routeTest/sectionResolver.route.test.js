/**
 * sectionResolver.js route-coupled — Phase F (route test plan §32, §67).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const getRouteConfiguration = vi.fn(() => []);

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration,
}));

beforeEach(() => {
  vi.resetModules();
  delete window.performanceTracker;
  getRouteConfiguration.mockReturnValue([]);
});

describe('getPreloadSectionsForRoute (Phase F §32)', () => {
  it('returns flat preLoadSections arrays unchanged', async () => {
    const { getPreloadSectionsForRoute } = await import('../../src/systems/sections/sectionResolver.js');

    const route = {
      slug: '/log-in',
      preLoadSections: ['dashboard', 'shop'],
    };

    expect(getPreloadSectionsForRoute(route, 'creator')).toEqual(['dashboard', 'shop']);
  });

  it('resolves role-keyed preLoadSections using userRole', async () => {
    const { getPreloadSectionsForRoute } = await import('../../src/systems/sections/sectionResolver.js');

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
    const { getPreloadSectionsForRoute } = await import('../../src/systems/sections/sectionResolver.js');

    const routeWithDefault = {
      slug: '/dashboard',
      preLoadSections: {
        default: ['dashboard-global'],
        creator: ['dashboard-creator'],
      },
    };

    expect(getPreloadSectionsForRoute(routeWithDefault, 'vendor')).toEqual(['dashboard-global']);

    const routeWithGuest = {
      slug: '/dashboard',
      preLoadSections: {
        guest: ['auth'],
        creator: ['dashboard-creator'],
      },
    };

    expect(getPreloadSectionsForRoute(routeWithGuest, 'vendor')).toEqual(['auth']);
  });

  it('returns an empty array when role-keyed preLoadSections cannot be resolved', async () => {
    const { getPreloadSectionsForRoute } = await import('../../src/systems/sections/sectionResolver.js');

    const route = {
      slug: '/dashboard',
      preLoadSections: {
        creator: ['dashboard-creator'],
      },
    };

    expect(getPreloadSectionsForRoute(route, 'fan')).toEqual([]);
  });

  it('deduplicates resolved preload section identifiers', async () => {
    const { getPreloadSectionsForRoute } = await import('../../src/systems/sections/sectionResolver.js');

    const route = {
      slug: '/log-in',
      preLoadSections: ['dashboard', 'dashboard', 'shop'],
    };

    expect(getPreloadSectionsForRoute(route, 'guest')).toEqual(['dashboard', 'shop']);
  });
});

describe('resolveRoleSectionVariant (Phase F §32)', () => {
  it('returns the role-specific section when present', async () => {
    const { resolveRoleSectionVariant } = await import('../../src/systems/sections/sectionResolver.js');

    const sectionConfig = {
      creator: 'dashboard-creator',
      fan: 'dashboard-fan',
    };

    expect(resolveRoleSectionVariant(sectionConfig, 'creator')).toBe('dashboard-creator');
  });

  it('returns string section unchanged regardless of role', async () => {
    const { resolveRoleSectionVariant } = await import('../../src/systems/sections/sectionResolver.js');

    expect(resolveRoleSectionVariant('auth', 'creator')).toBe('auth');
    expect(resolveRoleSectionVariant('auth', 'fan')).toBe('auth');
  });

  it('falls back to the default key when role is missing', async () => {
    const { resolveRoleSectionVariant } = await import('../../src/systems/sections/sectionResolver.js');

    const sectionConfig = {
      default: 'dashboard-global',
      creator: 'dashboard-creator',
    };

    expect(resolveRoleSectionVariant(sectionConfig, 'vendor')).toBe('dashboard-global');
  });

  it('returns null when role and default are missing', async () => {
    const { resolveRoleSectionVariant } = await import('../../src/systems/sections/sectionResolver.js');

    const sectionConfig = {
      creator: 'dashboard-creator',
      fan: 'dashboard-fan',
    };

    expect(resolveRoleSectionVariant(sectionConfig, 'vendor')).toBeNull();
  });
});

describe('resolveSectionIdentifier (Phase F §67)', () => {
  it('treats unknown identifier as direct section name', async () => {
    const { resolveSectionIdentifier } = await import('../../src/systems/sections/sectionResolver.js');

    expect(resolveSectionIdentifier('shop', 'creator')).toBe('shop');
  });

  it('returns null for empty identifier', async () => {
    const { resolveSectionIdentifier } = await import('../../src/systems/sections/sectionResolver.js');

    expect(resolveSectionIdentifier('', 'guest')).toBeNull();
    expect(resolveSectionIdentifier('   ', 'guest')).toBeNull();
  });
});

describe('getAllRouteSectionsForRoute (Phase F §67)', () => {
  it('includes primary section and preload sections without duplicates', async () => {
    const { getAllRouteSectionsForRoute } = await import('../../src/systems/sections/sectionResolver.js');

    const route = {
      slug: '/log-in',
      section: 'auth',
      preLoadSections: ['auth', 'shop'],
    };

    expect(getAllRouteSectionsForRoute(route, 'guest')).toEqual(['auth', 'shop']);
  });
});

describe('section config helpers (Phase F §67)', () => {
  it('isSectionRoleBased detects object sections', async () => {
    const { isSectionRoleBased } = await import('../../src/systems/sections/sectionResolver.js');

    expect(isSectionRoleBased('auth')).toBe(false);
    expect(isSectionRoleBased({ creator: 'dashboard-creator' })).toBe(true);
    expect(isSectionRoleBased(null)).toBe(false);
  });

  it('getAllSectionVariants extracts unique variant strings', async () => {
    const { getAllSectionVariants } = await import('../../src/systems/sections/sectionResolver.js');

    expect(getAllSectionVariants('auth')).toEqual(['auth']);
    expect(getAllSectionVariants({ creator: 'dashboard-creator', fan: 'dashboard-fan' })).toEqual([
      'dashboard-creator',
      'dashboard-fan',
    ]);
  });
});
