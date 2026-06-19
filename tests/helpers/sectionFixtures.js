/**
 * Shared section test fixtures — production loaders, manifest helpers, inheritance fixtures.
 *
 * @see developer_tasks/Sections/section-test-plan.md
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  cloneRouteFixtures,
  getProjectRoot,
  loadProductionRouteConfig,
} from './routeFixtures.js';

export {
  cloneRouteFixtures,
  getNavigableRoutes,
  getProjectRoot,
  isRedirectOrCatchAllRoute,
  loadProductionRouteConfig,
  loadRouteDefaults,
  makeRoute,
} from './routeFixtures.js';

/** Update when production routes are intentionally added or removed. */
export const PRODUCTION_ROUTE_COUNT_BASELINE = 42;

/**
 * Section names in production routes but absent from public/section-manifest.dev.json.
 * Document gaps here instead of failing integrity tests.
 */
export const DEV_MANIFEST_INTENTIONAL_GAPS = new Set([
  'demo',
  'dashboard-agent',
  'dashboard-vendor',
]);

/**
 * Production section names without a public/i18n/section-* folder yet.
 */
export const I18N_FOLDER_INTENTIONAL_GAPS = new Set([
  'demo',
  'dev',
  'profile',
  'discover',
  'about',
  'contact',
  'dashboard-agent',
  'dashboard-vendor',
]);

/** Load dev stub manifest used when import.meta.env.DEV is true. */
export function loadDevSectionManifest() {
  const manifestPath = join(getProjectRoot(), 'public/section-manifest.dev.json');
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

/**
 * @param {Array<string>|Record<string, Array<string>>|undefined} preLoadSections
 * @returns {string[]}
 */
export function collectPreloadIdentifiers(preLoadSections) {
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

/**
 * Route fixtures for inheritance / role-keyed preload checks not covered by production JSON.
 * Use with mocked getRouteConfiguration() in sectionTest suites.
 */
export const SECTION_INHERITANCE_FIXTURES = [
  {
    slug: '/parent-shop',
    section: 'dashboard-global',
    preLoadSections: ['shop-slug'],
    componentPath: '@/dev/templates/dashboard/DashboardPage.vue',
    supportedRoles: ['all'],
  },
  {
    slug: '/parent-shop/child-inherit-all',
    inheritConfigFromParent: true,
    componentPath: '@/dev/templates/dashboard/settings/SettingsPage.vue',
    supportedRoles: ['all'],
  },
  {
    slug: '/parent-shop/child-override-section',
    inheritConfigFromParent: true,
    section: 'shop',
    componentPath: '@/dev/templates/shop/page/ShopPage.vue',
    supportedRoles: ['all'],
  },
  {
    slug: '/parent-shop/child-override-preloads',
    inheritConfigFromParent: true,
    preLoadSections: ['profile-slug'],
    componentPath: '@/dev/templates/settings/SettingsPage.vue',
    supportedRoles: ['all'],
  },
  {
    slug: '/shop-slug',
    section: 'shop',
    componentPath: '@/dev/templates/shop/page/ShopPage.vue',
    supportedRoles: ['all'],
  },
  {
    slug: '/profile-slug',
    section: 'profile',
    componentPath: '@/dev/templates/settings/SettingsPage.vue',
    supportedRoles: ['all'],
  },
  {
    slug: '/grandparent-auth',
    section: 'auth',
    preLoadSections: ['dashboard-slug'],
    componentPath: '@/dev/templates/auth/page/role/LoginPage.vue',
    supportedRoles: ['all'],
  },
  {
    slug: '/grandparent-auth/middle-shop',
    inheritConfigFromParent: true,
    section: 'shop',
    componentPath: '@/dev/templates/shop/page/ShopPage.vue',
    supportedRoles: ['all'],
  },
  {
    slug: '/grandparent-auth/middle-shop/grandchild',
    inheritConfigFromParent: true,
    componentPath: '@/dev/templates/misc/PlanPage.vue',
    supportedRoles: ['all'],
  },
  {
    slug: '/dashboard-slug',
    section: 'dashboard-global',
    componentPath: '@/dev/templates/dashboard/DashboardPage.vue',
    supportedRoles: ['all'],
  },
];

/** Role-keyed preLoadSections fixture subset (plan §0). */
export const ROLE_KEYED_PRELOAD_FIXTURES = [
  {
    slug: '/role-preload-host',
    section: 'auth',
    preLoadSections: {
      creator: ['shop-slug'],
      fan: ['profile-slug'],
      default: ['misc'],
      guest: ['misc'],
    },
    componentPath: '@/dev/templates/auth/page/role/LoginPage.vue',
    supportedRoles: ['all'],
  },
  {
    slug: '/shop-slug',
    section: 'shop',
    componentPath: '@/dev/templates/shop/page/ShopPage.vue',
    supportedRoles: ['all'],
  },
  {
    slug: '/profile-slug',
    section: 'profile',
    componentPath: '@/dev/templates/settings/SettingsPage.vue',
    supportedRoles: ['all'],
  },
];

/**
 * @param {Array<object>} fixtures
 * @returns {Array<object>}
 */
export function getSectionTestFixtures(fixtures) {
  return cloneRouteFixtures(fixtures);
}

/**
 * @param {string} sectionName
 * @returns {boolean}
 */
export function sectionI18nFolderExists(sectionName) {
  const folderPath = join(getProjectRoot(), 'public/i18n', `section-${sectionName}`);
  return existsSync(folderPath);
}
