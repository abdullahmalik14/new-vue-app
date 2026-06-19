/**
 * Shared route test fixtures — use for unit tests that need minimal route config
 * or guard context without loading production routeConfig.json.
 *
 * @see developer_tasks/route-test-plan.md
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HELPERS_DIR = dirname(fileURLToPath(import.meta.url));

/** Repository root (parent of tests/) */
export function getProjectRoot() {
  return join(HELPERS_DIR, '../..');
}

/** Load production routeConfig.json as a plain array (no assetPreloadRef expansion). */
export function loadProductionRouteConfig() {
  const configPath = join(getProjectRoot(), 'src/router/routeConfig.json');
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

/** Load routeDefaults.json */
export function loadRouteDefaults() {
  const defaultsPath = join(getProjectRoot(), 'src/router/routeDefaults.json');
  return JSON.parse(readFileSync(defaultsPath, 'utf8'));
}

/** Load shared asset preload catalog */
export function loadSharedAssetPreloads() {
  const catalogPath = join(getProjectRoot(), 'src/config/sharedAssetPreloads.json');
  return JSON.parse(readFileSync(catalogPath, 'utf8'));
}

const DEFAULT_ROUTE = {
  slug: '/example',
  section: 'misc',
  componentPath: '@/dev/templates/misc/PlanPage.vue',
  supportedRoles: ['all'],
};

/**
 * Minimal route object for unit tests.
 * @param {object} [overrides]
 * @returns {object}
 */
export function makeRoute(overrides = {}) {
  return { ...DEFAULT_ROUTE, ...overrides };
}

/**
 * Guard / navigation context passed to routeGuards helpers.
 * @param {object} [overrides]
 * @returns {object}
 */
export function makeGuardContext(overrides = {}) {
  return {
    userRole: 'guest',
    userProfile: null,
    isAuthenticated: false,
    isAdminUser: false,
    ...overrides,
  };
}

/** Alias for makeGuardContext (matches route-test-plan naming). */
export const makeContext = makeGuardContext;

/**
 * Authenticated guard context with role and profile defaults.
 * @param {string} [role]
 * @param {object} [profile]
 * @returns {object}
 */
export function makeAuthenticatedContext(role = 'creator', profile = {}) {
  return makeGuardContext({
    userRole: role,
    isAuthenticated: true,
    userProfile: { role, ...profile },
  });
}

/** Small route set for validator / resolver tests (paths match post-refactor layout). */
export const MINIMAL_ROUTE_FIXTURES = [
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
    componentPath: '@/dev/templates/dashboard/DashboardPage.vue',
    supportedRoles: ['creator', 'fan', 'agent', 'vendor'],
    preLoadSections: [],
  },
  {
    slug: '/shop',
    section: 'shop',
    componentPath: '@/dev/templates/shop/page/ShopPage.vue',
    supportedRoles: ['all'],
    preLoadSections: [],
  },
];

/**
 * Build a slug → route map from a route array.
 * @param {Array<object>} routes
 * @returns {Map<string, object>}
 */
export function indexRoutesBySlug(routes) {
  return new Map(routes.map((route) => [route.slug, route]));
}

/**
 * True when route is redirect-only or catch-all (no component/section requirements).
 * @param {object} route
 * @returns {boolean}
 */
export function isRedirectOrCatchAllRoute(route) {
  if (!route) {
    return false;
  }
  if (route.redirect) {
    return true;
  }
  return typeof route.slug === 'string' && route.slug.includes('pathMatch');
}

/**
 * Navigable routes that should have componentPath/customComponentPath and section.
 * @param {Array<object>} routes
 * @returns {Array<object>}
 */
export function getNavigableRoutes(routes) {
  return routes.filter((route) => !isRedirectOrCatchAllRoute(route));
}
