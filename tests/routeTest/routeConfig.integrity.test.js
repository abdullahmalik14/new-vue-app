/**
 * Production routeConfig.json integrity — Phase A (route test plan §0).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { findComponentLoader } from '../../src/systems/routing/routeComponentLoader.js';
import {
  findDuplicateRoutePathClaims,
  normalizeAliasList,
  normalizeRedirectFromList,
} from '../../src/systems/routing/routeAliasResolver.js';
import { normalizeLocalizedPath } from '../../src/systems/i18n/localeManager.js';
import { resolveRouteFromPath } from '../../src/systems/routing/routeResolver.js';
import { isValidRouteEnvAccess } from '../../src/systems/routing/routeEnvAccess.js';
import { validateRouteComponentPathsOnDisk } from '../../src/systems/routing/routeComponentPathDiskValidator.node.js';
import { resolveRouteAssetPreloads } from '../../src/systems/assets/resolveRouteAssetPreloads.js';
import {
  getProjectRoot,
  loadProductionRouteConfig,
  loadRouteDefaults,
  loadSharedAssetPreloads,
  getNavigableRoutes,
  isRedirectOrCatchAllRoute,
} from '../helpers/routeFixtures.js';

const VALIDATOR_PATH = '../../src/systems/build/jsonConfigValidator.js';

const KNOWN_ROLES = new Set(['all', 'creator', 'fan', 'agent', 'vendor', 'guest']);

/** Update when routes are intentionally added or removed from production config. */
const PRODUCTION_ROUTE_COUNT_BASELINE = 42;

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  window.performanceTracker = { step: vi.fn() };
});

describe('routeConfig.json — production integrity (Phase A)', () => {
  const projectRoot = getProjectRoot();
  let routes;
  let defaults;
  let sharedCatalog;

  beforeEach(() => {
    routes = loadProductionRouteConfig();
    defaults = loadRouteDefaults();
    sharedCatalog = loadSharedAssetPreloads();
  });

  it('parses as a JSON array without syntax errors', () => {
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  it('validateRouteConfig(productionRoutes) returns valid: true with zero errors', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);
    const result = validateRouteConfig(routes);

    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('every production route has a non-empty string slug', () => {
    for (const route of routes) {
      expect(typeof route.slug).toBe('string');
      expect(route.slug.trim().length).toBeGreaterThan(0);
    }
  });

  it('every non-redirect route has componentPath or customComponentPath', () => {
    for (const route of getNavigableRoutes(routes)) {
      const hasBasePath =
        typeof route.componentPath === 'string' && route.componentPath.length > 0;
      const hasCustomPath =
        route.customComponentPath &&
        typeof route.customComponentPath === 'object' &&
        Object.values(route.customComponentPath).some(
          (entry) => entry?.componentPath && String(entry.componentPath).length > 0,
        );

      expect(hasBasePath || hasCustomPath).toBe(true);
    }
  });

  it('every non-redirect non-catch-all route has section', () => {
    for (const route of getNavigableRoutes(routes)) {
      expect(route.section).toBeTruthy();
    }
  });

  it('has no duplicate slugs in production config', () => {
    const slugs = routes.map((route) => route.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it('findDuplicateRoutePathClaims returns empty for production config', () => {
    expect(findDuplicateRoutePathClaims(routes)).toEqual([]);
  });

  it('every componentPath resolves via findComponentLoader or disk validator', () => {
    const diskResult = validateRouteComponentPathsOnDisk(routes, projectRoot);
    expect(diskResult.errors).toEqual([]);

    for (const route of getNavigableRoutes(routes)) {
      if (route.componentPath) {
        expect(findComponentLoader(route.componentPath)).toBeTruthy();
      }
    }
  });

  it('validateRouteComponentPathsOnDisk passes for full production config', () => {
    const result = validateRouteComponentPathsOnDisk(routes, projectRoot);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('every preLoadSections entry resolves via resolvePreloadSectionIdentifier', async () => {
    const { resolvePreloadSectionIdentifier } = await import(VALIDATOR_PATH);

    for (const route of routes) {
      const identifiers = collectPreloadIdentifiers(route.preLoadSections);
      for (const identifier of identifiers) {
        expect(resolvePreloadSectionIdentifier(identifier, routes)).toBeTruthy();
      }
    }
  });

  it('every assetPreloadRef resolves in shared catalog', () => {
    const expanded = resolveRouteAssetPreloads(routes, sharedCatalog);
    expect(expanded.length).toBe(routes.length);

    for (const route of routes) {
      if (!route.assetPreloadRef) {
        continue;
      }
      const refs = Array.isArray(route.assetPreloadRef)
        ? route.assetPreloadRef
        : [route.assetPreloadRef];
      for (const ref of refs) {
        expect(Array.isArray(sharedCatalog[ref])).toBe(true);
      }
    }
  });

  it('every envAccess value passes isValidRouteEnvAccess', () => {
    for (const route of routes) {
      expect(isValidRouteEnvAccess(route.envAccess)).toBe(true);
    }
  });

  it('every supportedRoles entry is a known role or "all"', () => {
    for (const route of routes) {
      if (!route.supportedRoles) {
        continue;
      }
      for (const role of route.supportedRoles) {
        expect(KNOWN_ROLES.has(role)).toBe(true);
      }
    }
  });

  it('catch-all route exists and is last in config order', () => {
    const catchAllIndex = routes.findIndex((route) => route.slug?.includes('pathMatch'));
    expect(catchAllIndex).toBeGreaterThanOrEqual(0);
    expect(catchAllIndex).toBe(routes.length - 1);
  });

  it('/404 or configured not-found slug exists in routeDefaults.json', () => {
    expect(defaults.notFoundSlug).toBe('/404');
    expect(routes.some((route) => route.slug === defaults.notFoundSlug)).toBe(true);
  });

  it('login slug in defaults matches an enabled route in config', () => {
    const loginRoute = routes.find((route) => route.slug === defaults.loginSlug);
    expect(loginRoute).toBeTruthy();
    expect(loginRoute.enabled !== false).toBe(true);
  });

  it('dashboard slug in defaults matches an enabled route in config', () => {
    const dashboardRoute = routes.find((route) => route.slug === defaults.dashboardSlug);
    expect(dashboardRoute).toBeTruthy();
    expect(dashboardRoute.enabled !== false).toBe(true);
  });

  it('no route has both redirect and componentPath without explicit exemption', () => {
    const violations = routes.filter(
      (route) => route.redirect && (route.componentPath || route.customComponentPath),
    );
    expect(violations).toEqual([]);
  });

  it('disabled routes still validate structurally when passed to validateRouteConfig', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);
    const disabledOnly = routes.filter((route) => route.enabled === false);
    if (disabledOnly.length === 0) {
      return;
    }
    const result = validateRouteConfig(disabledOnly);
    expect(result.valid).toBe(true);
  });

  it('role-based section objects have at least one non-empty string value', () => {
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

  it('adminOnly routes all set requiresAuth: true', () => {
    for (const route of routes) {
      if (route.adminOnly) {
        expect(route.requiresAuth).toBe(true);
      }
    }
  });

  it('auth routes with redirectIfLoggedIn point to existing slugs', () => {
    const slugSet = new Set(routes.map((route) => route.slug));
    for (const route of routes) {
      if (route.redirectIfLoggedIn) {
        expect(slugSet.has(route.redirectIfLoggedIn)).toBe(true);
      }
    }
  });

  it('protected routes with redirectIfNotAuth point to existing slugs', () => {
    const slugSet = new Set(routes.map((route) => route.slug));
    for (const route of routes) {
      if (route.redirectIfNotAuth) {
        expect(slugSet.has(route.redirectIfNotAuth)).toBe(true);
      }
    }
  });

  it('dependency fallbackSlug values point to existing slugs', () => {
    const slugSet = new Set(routes.map((route) => route.slug));
    for (const route of routes) {
      const roleDeps = route.dependencies?.roles;
      if (!roleDeps) {
        continue;
      }
      for (const depMap of Object.values(roleDeps)) {
        for (const dep of Object.values(depMap || {})) {
          if (dep?.fallbackSlug) {
            expect(slugSet.has(dep.fallbackSlug)).toBe(true);
          }
        }
      }
    }
  });

  it('wildcard slugs are only used for 404/catch-all patterns', () => {
    for (const route of routes) {
      if (route.slug?.includes('pathMatch') || route.slug?.includes('*')) {
        expect(isRedirectOrCatchAllRoute(route)).toBe(true);
      }
    }
  });

  it('enabled: false routes are absent from production baseline (B3 skips them at router generation)', () => {
    const disabledRoutes = routes.filter((route) => route.enabled === false);
    expect(disabledRoutes).toEqual([]);
  });

  it('role-based customComponentPath entries have componentPath per role', () => {
    for (const route of routes) {
      if (!route.customComponentPath || typeof route.customComponentPath !== 'object') {
        continue;
      }

      for (const [role, entry] of Object.entries(route.customComponentPath)) {
        expect(typeof entry?.componentPath).toBe('string');
        expect(entry.componentPath.trim().length).toBeGreaterThan(0);
        expect(role.length).toBeGreaterThan(0);
      }
    }
  });

  it('inheritConfigFromParent children have resolvable parent slug in config', () => {
    const slugSet = new Set(routes.map((route) => route.slug));

    for (const route of routes) {
      if (!route.inheritConfigFromParent) {
        continue;
      }

      const parentSlug = findParentSlugForInheritance(route.slug, slugSet);
      expect(parentSlug).toBeTruthy();
      expect(slugSet.has(parentSlug)).toBe(true);
    }
  });

  it('redirectFrom paths do not collide with another route primary slug', () => {
    const slugSet = new Set(routes.map((route) => route.slug));

    for (const route of routes) {
      for (const legacyPath of normalizeRedirectFromList(route.redirectFrom)) {
        const owner = routes.find((candidate) => candidate.slug === legacyPath);
        if (owner) {
          expect(owner.slug).toBe(route.slug);
        } else {
          expect(slugSet.has(legacyPath)).toBe(false);
        }
      }
    }
  });

  it('alias paths do not collide with another route primary slug', () => {
    const slugSet = new Set(routes.map((route) => route.slug));

    for (const route of routes) {
      for (const alias of normalizeAliasList(route.aliases)) {
        const owner = routes.find((candidate) => candidate.slug === alias);
        if (owner) {
          expect(owner.slug).toBe(route.slug);
        } else {
          expect(slugSet.has(alias)).toBe(false);
        }
      }
    }
  });

  it('hideLayout routes are valid slugs present in production config', () => {
    const slugSet = new Set(routes.map((route) => route.slug));

    for (const route of routes) {
      if (route.hideLayout) {
        expect(slugSet.has(route.slug)).toBe(true);
        expect(typeof route.slug).toBe('string');
        expect(route.slug.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('no redirect chain longer than depth 1 (no A redirects to B that also redirects)', () => {
    const redirectBySlug = new Map(
      routes.filter((route) => route.redirect).map((route) => [route.slug, route.redirect]),
    );

    for (const route of routes) {
      if (!route.redirect) {
        continue;
      }

      expect(redirectBySlug.has(route.redirect)).toBe(false);
    }
  });

  it('locale-prefixed navigation targets resolve same as locale-free slug', () => {
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

  it('production route count matches documented baseline snapshot', () => {
    expect(routes.length).toBe(PRODUCTION_ROUTE_COUNT_BASELINE);
  });

  it('schema warnings for missing recommended fields are documented and acceptable', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);
    const result = validateRouteConfig(routes);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('every assetPreloadRef resolves in shared catalog and asset map via validateRouteConfig', async () => {
    const { validateRouteConfig } = await import(VALIDATOR_PATH);
    const result = validateRouteConfig(routes);

    expect(result.valid).toBe(true);
    expect(
      result.errors.filter(
        (error) =>
          error.field === 'assetPreloadRef' ||
          error.type === 'INVALID_ASSET_PRELOAD_FLAG' ||
          error.type === 'UNKNOWN_ASSET_PRELOAD_REF',
      ),
    ).toEqual([]);
  });
});

/**
 * @param {Array<string>|Record<string, Array<string>>|undefined} preLoadSections
 * @returns {string[]}
 */
/**
 * @param {string} childSlug
 * @param {Set<string>} slugSet
 * @returns {string|null}
 */
function findParentSlugForInheritance(childSlug, slugSet) {
  const segments = childSlug.split('/').filter(Boolean);

  for (let index = segments.length - 1; index >= 1; index -= 1) {
    const candidate = `/${segments.slice(0, index).join('/')}`;
    if (slugSet.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

function collectPreloadIdentifiers(preLoadSections) {
  if (!preLoadSections) {
    return [];
  }
  if (Array.isArray(preLoadSections)) {
    return preLoadSections.filter((entry) => typeof entry === 'string' && entry.trim());
  }
  if (typeof preLoadSections === 'object') {
    return Object.values(preLoadSections).flatMap((entries) =>
      Array.isArray(entries)
        ? entries.filter((entry) => typeof entry === 'string' && entry.trim())
        : [],
    );
  }
  return [];
}
