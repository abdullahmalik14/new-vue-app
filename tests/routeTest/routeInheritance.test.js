/**
 * route inheritance — Phase B (route test plan §2 + §43).
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
  delete window.performanceTracker;
});

describe('inheritConfigurationFromParentRoute (Phase B §43)', () => {
  it('returns child unchanged when inheritConfigFromParent is false', async () => {
    const { inheritConfigurationFromParentRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const route = {
      slug: '/log-in',
      requiresAuth: false,
      inheritConfigFromParent: false,
    };

    expect(inheritConfigurationFromParentRoute(route)).toEqual(route);
  });

  it('returns child unchanged when inheritConfigFromParent is omitted', async () => {
    const { inheritConfigurationFromParentRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const route = { slug: '/log-in', requiresAuth: false };

    expect(inheritConfigurationFromParentRoute(route)).toEqual(route);
  });

  it('merges requiresAuth from parent when child omits field', async () => {
    const { inheritConfigurationFromParentRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const merged = inheritConfigurationFromParentRoute({
      slug: '/dashboard/payout',
      inheritConfigFromParent: true,
      supportedRoles: ['creator'],
    });

    expect(merged.requiresAuth).toBe(true);
    expect(merged.redirectIfNotAuth).toBe('/log-in');
  });

  it('child requiresAuth false overrides parent requiresAuth true', async () => {
    const { inheritConfigurationFromParentRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const merged = inheritConfigurationFromParentRoute({
      slug: '/dashboard/payout',
      inheritConfigFromParent: true,
      requiresAuth: false,
      supportedRoles: ['creator'],
    });

    expect(merged.requiresAuth).toBe(false);
  });

  it('child section overrides parent section', async () => {
    const { inheritConfigurationFromParentRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const merged = inheritConfigurationFromParentRoute({
      slug: '/dashboard/settings/privacy',
      inheritConfigFromParent: true,
      supportedRoles: ['creator'],
      section: 'profile-security',
    });

    expect(merged.section).toBe('profile-security');
  });

  it('three-level chain merges grandparent auth to grandchild', async () => {
    const { inheritConfigurationFromParentRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const merged = inheritConfigurationFromParentRoute({
      slug: '/dashboard/settings/privacy',
      inheritConfigFromParent: true,
      supportedRoles: ['creator'],
      section: 'profile-security',
    });

    expect(merged.requiresAuth).toBe(true);
    expect(merged.redirectIfNotAuth).toBe('/log-in');
  });

  it('concatenates parent and child assetPreload arrays', async () => {
    const { inheritConfigurationFromParentRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const merged = inheritConfigurationFromParentRoute({
      slug: '/dashboard/payout',
      inheritConfigFromParent: true,
      supportedRoles: ['creator'],
      assetPreload: [{ src: '/scripts/payout.js', type: 'script' }],
    });

    expect(merged.assetPreload.some((entry) => entry.flag === 'dashboard.logo')).toBe(true);
    expect(merged.assetPreload.some((entry) => entry.src === '/scripts/payout.js')).toBe(true);
  });

  it('inherits parent-only assetPreload when child has none', async () => {
    const { inheritConfigurationFromParentRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const merged = inheritConfigurationFromParentRoute({
      slug: '/dashboard/payout',
      inheritConfigFromParent: true,
      supportedRoles: ['creator'],
    });

    expect(merged.assetPreload.some((entry) => entry.flag === 'dashboard.logo')).toBe(true);
  });

  it('returns child only when no parent slug exists in config', async () => {
    const { inheritConfigurationFromParentRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const child = {
      slug: '/orphan/child',
      inheritConfigFromParent: true,
      supportedRoles: ['all'],
    };

    expect(inheritConfigurationFromParentRoute(child)).toEqual(child);
  });

  it('merges adminOnly from parent when child omits field', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/admin',
        section: 'dev',
        componentPath: '@/dev/templates/dev/AdminPage.vue',
        adminOnly: true,
        requiresAuth: true,
        supportedRoles: ['admin'],
      },
      {
        slug: '/admin/reports',
        inheritConfigFromParent: true,
        section: 'dev',
        componentPath: '@/dev/templates/dev/ReportsPage.vue',
        supportedRoles: ['admin'],
      },
    ]);

    const { inheritConfigurationFromParentRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const merged = inheritConfigurationFromParentRoute({
      slug: '/admin/reports',
      inheritConfigFromParent: true,
      section: 'dev',
      componentPath: '@/dev/templates/dev/ReportsPage.vue',
      supportedRoles: ['admin'],
    });

    expect(merged.adminOnly).toBe(true);
  });

  it('merges envAccess from parent when child omits field', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/dev',
        section: 'dev',
        componentPath: '@/dev/templates/dev/DevRootPage.vue',
        envAccess: 'development',
        supportedRoles: ['all'],
      },
      {
        slug: '/dev/playground',
        inheritConfigFromParent: true,
        section: 'dev',
        componentPath: '@/dev/templates/dev/PlaygroundPage.vue',
        supportedRoles: ['all'],
      },
    ]);

    const { inheritConfigurationFromParentRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );

    const merged = inheritConfigurationFromParentRoute({
      slug: '/dev/playground',
      inheritConfigFromParent: true,
      section: 'dev',
      componentPath: '@/dev/templates/dev/PlaygroundPage.vue',
      supportedRoles: ['all'],
    });

    expect(merged.envAccess).toBe('development');
  });
});
