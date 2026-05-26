import { describe, it, expect, beforeEach } from 'vitest';
import {
  inheritConfigurationFromParentRoute,
} from '../../src/utils/route/routeResolver.js';
import { resolveEffectiveRouteConfig } from '../../src/utils/section/sectionPreloadOrchestrator.js';
import { guardCheckAuthentication } from '../../src/utils/route/routeGuards.js';

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

    expect(result.allow).toBe(false);
    expect(result.redirectTo).toBe('/log-in');
    expect(result.reason).toBe('Authentication required');
  });

  it('returns route unchanged when inheritConfigFromParent is false', () => {
    const route = {
      slug: '/log-in',
      requiresAuth: false,
      inheritConfigFromParent: false,
    };

    expect(inheritConfigurationFromParentRoute(route)).toEqual(route);
  });
});
