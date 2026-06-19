/**
 * sectionResolver.js — core helpers (section test plan §3–7, §84–85).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const RESOLVER_PATH = '../../src/systems/sections/sectionResolver.js';

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  window.performanceTracker = { step: vi.fn() };
});

describe('normalizeSectionConfiguration (Phase B §4)', () => {
  async function loadResolver() {
    return import(RESOLVER_PATH);
  }

  it('normalizes string section as simple type', async () => {
    const { normalizeSectionConfiguration } = await loadResolver();
    expect(normalizeSectionConfiguration('auth')).toEqual({
      type: 'simple',
      value: 'auth',
      roleBased: false,
    });
  });

  it('normalizes role object as role-based type with role keys', async () => {
    const { normalizeSectionConfiguration } = await loadResolver();
    const config = { creator: 'dashboard-creator', fan: 'dashboard-fan' };

    expect(normalizeSectionConfiguration(config)).toEqual({
      type: 'role-based',
      value: config,
      roleBased: true,
      roles: ['creator', 'fan'],
    });
  });

  it('marks null, undefined, number, and boolean as invalid', async () => {
    const { normalizeSectionConfiguration } = await loadResolver();
    const invalid = { type: 'invalid', value: null, roleBased: false };

    expect(normalizeSectionConfiguration(null)).toEqual(invalid);
    expect(normalizeSectionConfiguration(undefined)).toEqual(invalid);
    expect(normalizeSectionConfiguration(42)).toEqual(invalid);
    expect(normalizeSectionConfiguration(true)).toEqual(invalid);
  });

  it('treats arrays as role-based objects (implementation uses Object.keys)', async () => {
    const { normalizeSectionConfiguration } = await loadResolver();
    const config = ['auth', 'shop'];
    expect(normalizeSectionConfiguration(config)).toEqual({
      type: 'role-based',
      value: config,
      roleBased: true,
      roles: ['0', '1'],
    });
  });

  it('treats empty object as role-based with empty roles array', async () => {
    const { normalizeSectionConfiguration } = await loadResolver();
    expect(normalizeSectionConfiguration({})).toEqual({
      type: 'role-based',
      value: {},
      roleBased: true,
      roles: [],
    });
  });

  it('preserves empty string in simple type without trimming', async () => {
    const { normalizeSectionConfiguration } = await loadResolver();
    expect(normalizeSectionConfiguration('')).toEqual({
      type: 'simple',
      value: '',
      roleBased: false,
    });
  });
});

describe('resolveRoleSectionVariant (Phase B §5)', () => {
  async function loadResolver() {
    return import(RESOLVER_PATH);
  }

  it('returns simple string section unchanged for any role', async () => {
    const { resolveRoleSectionVariant } = await loadResolver();
    expect(resolveRoleSectionVariant('auth', 'creator')).toBe('auth');
    expect(resolveRoleSectionVariant('auth', 'fan')).toBe('auth');
  });

  it('returns role-specific value when key matches', async () => {
    const { resolveRoleSectionVariant } = await loadResolver();
    const config = { creator: 'dashboard-creator', fan: 'dashboard-fan' };
    expect(resolveRoleSectionVariant(config, 'creator')).toBe('dashboard-creator');
  });

  it('uses default fallback key when role is missing', async () => {
    const { resolveRoleSectionVariant } = await loadResolver();
    const config = { default: 'dashboard-global', creator: 'dashboard-creator' };
    expect(resolveRoleSectionVariant(config, 'vendor')).toBe('dashboard-global');
  });

  it('uses custom third-argument fallback when default key is renamed', async () => {
    const { resolveRoleSectionVariant } = await loadResolver();
    const config = { global: 'dashboard-global', creator: 'dashboard-creator' };
    expect(resolveRoleSectionVariant(config, 'vendor', 'global')).toBe('dashboard-global');
  });

  it('returns null when role and fallback keys are absent', async () => {
    const { resolveRoleSectionVariant } = await loadResolver();
    const config = { creator: 'dashboard-creator', fan: 'dashboard-fan' };
    expect(resolveRoleSectionVariant(config, 'vendor')).toBeNull();
  });

  it('returns null for empty string role values', async () => {
    const { resolveRoleSectionVariant } = await loadResolver();
    expect(resolveRoleSectionVariant({ creator: '' }, 'creator')).toBeNull();
  });

  it('returns null for null and undefined sectionConfig', async () => {
    const { resolveRoleSectionVariant } = await loadResolver();
    expect(resolveRoleSectionVariant(null, 'guest')).toBeNull();
    expect(resolveRoleSectionVariant(undefined, 'guest')).toBeNull();
  });

  it('returns null for number sectionConfig', async () => {
    const { resolveRoleSectionVariant } = await loadResolver();
    expect(resolveRoleSectionVariant(123, 'guest')).toBeNull();
  });

  it('uses fallback path when userRole is undefined', async () => {
    const { resolveRoleSectionVariant } = await loadResolver();
    const config = { default: 'dashboard-global' };
    expect(resolveRoleSectionVariant(config, undefined)).toBe('dashboard-global');
  });

  it('creator role is case-sensitive (Creator does not match)', async () => {
    const { resolveRoleSectionVariant } = await loadResolver();
    const config = { creator: 'dashboard-creator', default: 'dashboard-global' };
    expect(resolveRoleSectionVariant(config, 'Creator')).toBe('dashboard-global');
  });
});

describe('isSectionRoleBased (Phase B §6)', () => {
  async function loadResolver() {
    return import(RESOLVER_PATH);
  }

  it('returns false for string sections and invalid types', async () => {
    const { isSectionRoleBased } = await loadResolver();
    expect(isSectionRoleBased('auth')).toBe(false);
    expect(isSectionRoleBased(null)).toBe(false);
    expect(isSectionRoleBased(42)).toBe(false);
  });

  it('returns true for role object sections', async () => {
    const { isSectionRoleBased } = await loadResolver();
    expect(isSectionRoleBased({ creator: 'dashboard-creator' })).toBe(true);
  });
});

describe('getAllSectionVariants (Phase B §7)', () => {
  async function loadResolver() {
    return import(RESOLVER_PATH);
  }

  it('returns single-element array for string section', async () => {
    const { getAllSectionVariants } = await loadResolver();
    expect(getAllSectionVariants('auth')).toEqual(['auth']);
  });

  it('returns unique values from role object', async () => {
    const { getAllSectionVariants } = await loadResolver();
    expect(
      getAllSectionVariants({
        creator: 'dashboard-creator',
        fan: 'dashboard-fan',
        default: 'dashboard-global',
      }),
    ).toEqual(['dashboard-creator', 'dashboard-fan', 'dashboard-global']);
  });

  it('deduplicates when roles share the same section string', async () => {
    const { getAllSectionVariants } = await loadResolver();
    expect(
      getAllSectionVariants({ creator: 'dashboard-creator', fan: 'dashboard-creator' }),
    ).toEqual(['dashboard-creator']);
  });

  it('returns empty array for null, undefined, number, and empty object', async () => {
    const { getAllSectionVariants } = await loadResolver();
    expect(getAllSectionVariants(null)).toEqual([]);
    expect(getAllSectionVariants(undefined)).toEqual([]);
    expect(getAllSectionVariants(42)).toEqual([]);
    expect(getAllSectionVariants({})).toEqual([]);
  });
});

describe('getAllRouteSectionsForRoute (Phase B §3, §84)', () => {
  async function loadResolver() {
    return import(RESOLVER_PATH);
  }

  it('returns only route section when preLoadSections is empty', async () => {
    const { getAllRouteSectionsForRoute } = await loadResolver();
    expect(
      getAllRouteSectionsForRoute({ slug: '/log-in', section: 'auth', preLoadSections: [] }, 'guest'),
    ).toEqual(['auth']);
  });

  it('includes route section plus preload sections without duplicates', async () => {
    const { getAllRouteSectionsForRoute } = await loadResolver();
    const route = { slug: '/log-in', section: 'auth', preLoadSections: ['auth', 'shop'] };
    expect(getAllRouteSectionsForRoute(route, 'guest')).toEqual(['auth', 'shop']);
  });

  it('places route section first then preloads in stable order', async () => {
    const { getAllRouteSectionsForRoute } = await loadResolver();
    const route = { slug: '/host', section: 'auth', preLoadSections: ['shop', 'profile'] };
    expect(getAllRouteSectionsForRoute(route, 'guest')).toEqual(['auth', 'shop', 'profile']);
  });

  it('returns preload sections only when route has no section field', async () => {
    const { getAllRouteSectionsForRoute } = await loadResolver();
    expect(getAllRouteSectionsForRoute({ slug: '/x', preLoadSections: ['shop'] }, 'guest')).toEqual(['shop']);
  });

  it('resolves role-based route section before merging preloads', async () => {
    const { getAllRouteSectionsForRoute } = await loadResolver();
    const route = {
      slug: '/dashboard',
      section: { creator: 'dashboard-creator', default: 'dashboard-global' },
      preLoadSections: ['shop'],
    };

    expect(getAllRouteSectionsForRoute(route, 'creator')).toEqual(['dashboard-creator', 'shop']);
  });

  it('returns empty array for null route', async () => {
    const { getAllRouteSectionsForRoute } = await loadResolver();
    expect(getAllRouteSectionsForRoute(null, 'guest')).toEqual([]);
  });

  it('returns preload sections only when route section is unresolvable', async () => {
    const { getAllRouteSectionsForRoute } = await loadResolver();
    const route = {
      slug: '/bad',
      section: { creator: 'dashboard-creator' },
      preLoadSections: ['shop'],
    };

    expect(getAllRouteSectionsForRoute(route, 'fan')).toEqual(['shop']);
  });

  it('deduplicates three identical preload entries to one', async () => {
    const { getAllRouteSectionsForRoute } = await loadResolver();
    const route = { slug: '/x', section: 'auth', preLoadSections: ['shop', 'shop', 'shop'] };
    expect(getAllRouteSectionsForRoute(route, 'guest')).toEqual(['auth', 'shop']);
  });

  it('returns empty array on internal error (catch path)', async () => {
    const { getAllRouteSectionsForRoute } = await loadResolver();
    const route = { slug: '/throw', section: 'auth', preLoadSections: [] };

    Object.defineProperty(route, 'section', {
      get() {
        throw new Error('section read failed');
      },
    });

    expect(getAllRouteSectionsForRoute(route, 'guest')).toEqual([]);
  });
});
