import { describe, it, expect, beforeEach } from 'vitest';
import {
  inheritConfigurationFromParentRoute,
} from '../../src/systems/routing/routeResolver.js';
import { resolveEffectiveRouteConfig } from '../../src/systems/routing/routeResolver.js';
import { guardCheckAuthentication } from '../../src/systems/routing/routeGuards.js';

beforeEach(() => {
  delete window.performanceTracker;
});

describe('S4 — inheritConfigFromParent requiresAuth', () => {
  it('inherits requiresAuth from /dashboard for direct child routes', () => {
    const childRoute = {
      slug: '/dashboard/payout',
      inheritConfigFromParent: true,
      supportedRoles: ['creator'],
    };

    const merged = inheritConfigurationFromParentRoute(childRoute);

    expect(merged.requiresAuth).toBe(true);
    expect(merged.redirectIfNotAuth).toBe('/log-in');
  });

  it('inherits requiresAuth through nested inheritConfigFromParent chain', () => {
    const childRoute = {
      slug: '/dashboard/settings/privacy-security',
      inheritConfigFromParent: true,
      supportedRoles: ['creator'],
    };

    const merged = inheritConfigurationFromParentRoute(childRoute);

    expect(merged.requiresAuth).toBe(true);
    expect(merged.redirectIfNotAuth).toBe('/log-in');
  });

  it('resolveEffectiveRouteConfig matches inheritConfigurationFromParentRoute', () => {
    const childRoute = {
      slug: '/dashboard/settings/privacy-security',
      inheritConfigFromParent: true,
    };

    const effective = resolveEffectiveRouteConfig(childRoute);

    expect(effective.requiresAuth).toBe(true);
  });

  it('auth guard blocks unauthenticated access on inherited requiresAuth route', () => {
    const effective = resolveEffectiveRouteConfig({
      slug: '/dashboard/payout',
      inheritConfigFromParent: true,
      supportedRoles: ['creator'],
    });

    const result = guardCheckAuthentication(effective, {
      isAuthenticated: false,
      userRole: 'guest',
      userProfile: {},
    });

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.redirectTargetPath).toBe('/log-in');
    expect(result.blockReason).toBe('Authentication required');
  });

  it('returns route unchanged when inheritConfigFromParent is false', () => {
    const route = {
      slug: '/log-in',
      requiresAuth: false,
      inheritConfigFromParent: false,
    };

    expect(inheritConfigurationFromParentRoute(route)).toEqual(route);
  });

  it('inherits assetPreload from /dashboard for direct child routes (C-02)', () => {
    const merged = inheritConfigurationFromParentRoute({
      slug: '/dashboard/payout',
      inheritConfigFromParent: true,
      supportedRoles: ['creator'],
    });

    expect(Array.isArray(merged.assetPreload)).toBe(true);
    expect(merged.assetPreload.some((entry) => entry.flag === 'dashboard.logo')).toBe(true);
  });

  it('concatenates parent and child assetPreload when child adds entries (C-02)', () => {
    const merged = inheritConfigurationFromParentRoute({
      slug: '/dashboard/overview',
      inheritConfigFromParent: true,
      supportedRoles: ['creator'],
      assetPreload: [
        {
          name: 'dashboard-metrics-lib',
          src: '/scripts/dashboard-metrics.js',
          type: 'script',
          priority: 'high',
        },
      ],
    });

    expect(merged.assetPreload.some((entry) => entry.flag === 'dashboard.logo')).toBe(true);
    expect(merged.assetPreload.some((entry) => entry.src === '/scripts/dashboard-metrics.js')).toBe(true);
  });
});
