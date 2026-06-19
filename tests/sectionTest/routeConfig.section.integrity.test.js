/**
 * Production routeConfig.json — section field integrity (section test plan §0).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { normalizeLocalizedPath } from '../../src/systems/i18n/localeManager.js';
import {
  PRODUCTION_ROUTE_COUNT_BASELINE,
  collectPreloadIdentifiers,
  getNavigableRoutes,
  getSectionTestFixtures,
  loadProductionRouteConfig,
  ROLE_KEYED_PRELOAD_FIXTURES,
  SECTION_INHERITANCE_FIXTURES,
} from '../helpers/sectionFixtures.js';

const { getRouteConfiguration } = vi.hoisted(() => ({
  getRouteConfiguration: vi.fn(),
}));

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration,
}));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  window.performanceTracker = { step: vi.fn() };
  getRouteConfiguration.mockReturnValue(loadProductionRouteConfig());
});

describe('routeConfig.json — section integrity (Phase A §0)', () => {
  let routes;

  beforeEach(() => {
    routes = loadProductionRouteConfig();
  });

  it('parses as a JSON array without syntax errors', () => {
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  it('every non-redirect route has section (string or role object)', () => {
    for (const route of getNavigableRoutes(routes)) {
      expect(route.section).toBeTruthy();
    }
  });

  it('every simple string section is non-empty after trim', () => {
    for (const route of routes) {
      if (typeof route.section !== 'string') {
        continue;
      }
      expect(route.section.trim().length).toBeGreaterThan(0);
    }
  });

  it('every role-based section object has at least one non-empty string value', () => {
    for (const route of routes) {
      if (!route.section || typeof route.section !== 'object') {
        continue;
      }
      const values = Object.values(route.section).filter(
        (value) => typeof value === 'string' && value.trim().length > 0,
      );
      expect(values.length).toBeGreaterThan(0);
    }
  });

  it('role-based section objects use default key or explicit per-role keys (resolver fallback documented)', () => {
    for (const route of routes) {
      if (!route.section || typeof route.section !== 'object') {
        continue;
      }

      const hasDefault = typeof route.section.default === 'string' && route.section.default.trim();
      const hasExplicitRoleKeys = Object.keys(route.section).some((key) => key !== 'default');

      expect(hasDefault || hasExplicitRoleKeys).toBe(true);
    }
  });

  it('no role-based section object contains non-string values', () => {
    for (const route of routes) {
      if (!route.section || typeof route.section !== 'object') {
        continue;
      }

      for (const value of Object.values(route.section)) {
        expect(typeof value).toBe('string');
      }
    }
  });

  it('preLoadSections when present is an array or role-keyed object (never bare string)', () => {
    for (const route of routes) {
      if (route.preLoadSections === undefined || route.preLoadSections === null) {
        continue;
      }

      const type = Array.isArray(route.preLoadSections) ? 'array' : typeof route.preLoadSections;
      expect(type === 'array' || type === 'object').toBe(true);
    }
  });

  it('flat preLoadSections array entries are non-empty strings', () => {
    for (const route of routes) {
      if (!Array.isArray(route.preLoadSections)) {
        continue;
      }

      for (const entry of route.preLoadSections) {
        expect(typeof entry).toBe('string');
        expect(entry.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('role-keyed preLoadSections arrays contain only non-empty strings per role (fixture subset)', async () => {
    getRouteConfiguration.mockReturnValue(getSectionTestFixtures(ROLE_KEYED_PRELOAD_FIXTURES));

    const { getPreloadSectionsForRoute } = await import(
      '../../src/systems/sections/sectionResolver.js'
    );

    const hostRoute = getSectionTestFixtures(ROLE_KEYED_PRELOAD_FIXTURES)[0];

    for (const [role, entries] of Object.entries(hostRoute.preLoadSections)) {
      expect(Array.isArray(entries)).toBe(true);
      for (const entry of entries) {
        expect(typeof entry).toBe('string');
        expect(entry.trim().length).toBeGreaterThan(0);
      }

      const resolved = getPreloadSectionsForRoute(hostRoute, role === 'default' ? 'unknown-role' : role);
      expect(resolved.length).toBeGreaterThan(0);
    }
  });

  it('role-keyed preLoadSections resolves for creator, fan, guest, and default roles (fixture subset)', async () => {
    getRouteConfiguration.mockReturnValue(getSectionTestFixtures(ROLE_KEYED_PRELOAD_FIXTURES));

    const { getPreloadSectionsForRoute } = await import(
      '../../src/systems/sections/sectionResolver.js'
    );

    const hostRoute = getSectionTestFixtures(ROLE_KEYED_PRELOAD_FIXTURES)[0];

    expect(getPreloadSectionsForRoute(hostRoute, 'creator')).toEqual(['shop-slug']);
    expect(getPreloadSectionsForRoute(hostRoute, 'fan')).toEqual(['profile-slug']);
    expect(getPreloadSectionsForRoute(hostRoute, 'guest')).toEqual(['misc']);
    expect(getPreloadSectionsForRoute(hostRoute, 'unknown-role')).toEqual(['misc']);
  });

  it('every preLoadSections entry resolves to a section name via resolveSectionIdentifier', async () => {
    const { resolveSectionIdentifier } = await import(
      '../../src/systems/sections/sectionResolver.js'
    );

    for (const route of routes) {
      for (const identifier of collectPreloadIdentifiers(route.preLoadSections)) {
        const resolved = resolveSectionIdentifier(identifier, 'guest');
        expect(resolved).toBeTruthy();
      }
    }
  });

  it('auth routes use simple string section auth', () => {
    const authSlugs = ['/log-in', '/callback', '/confirm-email', '/lost-password'];
    for (const slug of authSlugs) {
      const route = routes.find((entry) => entry.slug === slug);
      expect(route).toBeTruthy();
      expect(route.section).toBe('auth');
    }
  });

  it('at least one dashboard child route uses distinct creator and fan role-based section variants', () => {
    const roleDashboardRoute = routes.find(
      (route) =>
        route.slug?.startsWith('/dashboard') &&
        route.section &&
        typeof route.section === 'object' &&
        route.section.creator &&
        route.section.fan &&
        route.section.creator !== route.section.fan,
    );

    expect(roleDashboardRoute).toBeTruthy();
  });

  it('preLoadSections slug identifiers used in production resolve without null (shop/profile N/A in current config)', async () => {
    const { resolveSectionIdentifier } = await import(
      '../../src/systems/sections/sectionResolver.js'
    );

    const identifiers = new Set(
      routes.flatMap((route) => collectPreloadIdentifiers(route.preLoadSections)),
    );

    expect(identifiers.size).toBeGreaterThan(0);

    for (const identifier of identifiers) {
      expect(resolveSectionIdentifier(identifier, 'guest')).toBeTruthy();
    }
  });

  it('no route lists duplicate preLoadSections entries that would bypass dedup silently', async () => {
    const { getPreloadSectionsForRoute } = await import(
      '../../src/systems/sections/sectionResolver.js'
    );

    for (const route of routes) {
      if (!Array.isArray(route.preLoadSections)) {
        continue;
      }

      const uniqueCount = new Set(route.preLoadSections).size;
      expect(route.preLoadSections.length).toBe(uniqueCount);

      const resolved = getPreloadSectionsForRoute(route, 'guest');
      expect(new Set(resolved).size).toBe(resolved.length);
    }
  });

  it('getPreloadSectionsForRoute deduplicates duplicate entries when present (synthetic check)', async () => {
    const { getPreloadSectionsForRoute } = await import(
      '../../src/systems/sections/sectionResolver.js'
    );

    const syntheticRoute = {
      slug: '/synthetic',
      section: 'auth',
      preLoadSections: ['dashboard', 'dashboard', 'misc'],
    };

    expect(getPreloadSectionsForRoute(syntheticRoute, 'guest')).toEqual([
      'dashboard',
      'misc',
    ]);
  });

  it('catch-all route has no section and redirect-only behaviour is documented', () => {
    const catchAll = routes.find((route) => route.slug?.includes('pathMatch'));
    expect(catchAll).toBeTruthy();
    expect(catchAll.redirect).toBe('/404');
    expect(catchAll.section).toBeUndefined();
  });

  it('locale-prefixed navigation resolves the same route slug as locale-free paths', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');
    const sampleRoutes = routes.filter(
      (route) => !route.redirect && !route.slug.includes('pathMatch'),
    );

    for (const route of sampleRoutes) {
      for (const locale of ['en', 'vi']) {
        const localizedPath = `/${locale}${route.slug}`;
        const normalized = normalizeLocalizedPath(localizedPath);
        const localizedMatch = resolveRouteFromPath(normalized);
        const directMatch = resolveRouteFromPath(route.slug);

        expect(localizedMatch?.slug).toBe(directMatch?.slug);
      }
    }
  });

  it('locale-prefixed navigation does not change resolved section name for the same logical route', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');
    const { resolveRoleSectionVariant } = await import(
      '../../src/systems/sections/sectionResolver.js'
    );

    const dashboardRoute = routes.find((route) => route.slug === '/dashboard');
    expect(dashboardRoute).toBeTruthy();

    const directSection = resolveRoleSectionVariant(dashboardRoute.section, 'guest');
    const localizedRoute = resolveRouteFromPath(normalizeLocalizedPath('/en/dashboard'));
    expect(localizedRoute?.slug).toBe('/dashboard');
    const localizedSection = resolveRoleSectionVariant(localizedRoute.section, 'guest');

    expect(localizedSection).toBe(directSection);
  });

  it('production route count matches documented section coverage baseline', () => {
    expect(routes.length).toBe(PRODUCTION_ROUTE_COUNT_BASELINE);
  });
});

describe('routeConfig.json — section inheritance integrity (Phase A §0 / §53)', () => {
  beforeEach(() => {
    getRouteConfiguration.mockReturnValue(getSectionTestFixtures(SECTION_INHERITANCE_FIXTURES));
  });

  it('child with inheritConfigFromParent inherits parent section when child omits section', async () => {
    const { resolveEffectiveRouteConfig } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const child = getSectionTestFixtures(SECTION_INHERITANCE_FIXTURES).find(
      (route) => route.slug === '/parent-shop/child-inherit-all',
    );

    const effective = resolveEffectiveRouteConfig(child);
    expect(effective.section).toBe('dashboard-global');
  });

  it('child with inheritConfigFromParent inherits parent preLoadSections when child omits preLoadSections', async () => {
    const { resolveEffectiveRouteConfig } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const child = getSectionTestFixtures(SECTION_INHERITANCE_FIXTURES).find(
      (route) => route.slug === '/parent-shop/child-inherit-all',
    );

    const effective = resolveEffectiveRouteConfig(child);
    expect(effective.preLoadSections).toEqual(['shop-slug']);
  });

  it('child section overrides inherited parent section (production /dashboard/overview)', () => {
    const routes = loadProductionRouteConfig();
    const child = routes.find((route) => route.slug === '/dashboard/overview');
    expect(child?.inheritConfigFromParent).toBe(true);
    expect(child?.section).toEqual({ creator: 'dashboard-creator' });
  });

  it('child preLoadSections overrides inherited parent preLoadSections (override not concat)', async () => {
    const { resolveEffectiveRouteConfig } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const child = getSectionTestFixtures(SECTION_INHERITANCE_FIXTURES).find(
      (route) => route.slug === '/parent-shop/child-override-preloads',
    );

    const effective = resolveEffectiveRouteConfig(child);
    expect(effective.preLoadSections).toEqual(['profile-slug']);
    expect(effective.preLoadSections).not.toEqual(['shop-slug']);
  });

  it('nested inheritance chain resolves section correctly for resolveEffectiveRouteConfig', async () => {
    const { resolveEffectiveRouteConfig } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const grandchild = getSectionTestFixtures(SECTION_INHERITANCE_FIXTURES).find(
      (route) => route.slug === '/grandparent-auth/middle-shop/grandchild',
    );

    const effective = resolveEffectiveRouteConfig(grandchild);
    expect(effective.section).toBe('shop');
  });

  it('nested inheritance chain resolves preLoadSections correctly for getSectionPreloadPlan', async () => {
    const { getSectionPreloadPlan } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    const grandchild = getSectionTestFixtures(SECTION_INHERITANCE_FIXTURES).find(
      (route) => route.slug === '/grandparent-auth/middle-shop/grandchild',
    );

    const plan = getSectionPreloadPlan(grandchild, 'guest');
    expect(plan.preloadSectionIdentifiers).toEqual(['dashboard-slug']);
    expect(plan.resolvedSectionNames).toContain('dashboard-global');
  });

  it('creator role resolves dashboard-creator from inherited role object fixture', async () => {
    const { resolveRoleSectionVariant } = await import(
      '../../src/systems/sections/sectionResolver.js'
    );

    const roleSection = {
      creator: 'dashboard-creator',
      fan: 'dashboard-fan',
      default: 'dashboard-global',
    };

    expect(resolveRoleSectionVariant(roleSection, 'creator')).toBe('dashboard-creator');
    expect(resolveRoleSectionVariant(roleSection, 'fan')).toBe('dashboard-fan');
    expect(resolveRoleSectionVariant(roleSection, 'guest')).toBe('dashboard-global');
  });
});
