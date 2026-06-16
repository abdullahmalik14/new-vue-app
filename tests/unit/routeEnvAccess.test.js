import { describe, it, expect, beforeEach } from 'vitest';
import {
  isDevelopmentEnvironment,
  isRouteAccessibleInCurrentEnvironment,
  isValidRouteEnvAccess,
  ROUTE_ENV_ACCESS,
} from '../../src/systems/routing/routeEnvAccess.js';
import { guardCheckRouteEnvironmentAccess } from '../../src/systems/routing/routeGuards.js';

describe('routeEnvAccess S1 — development-only routes', () => {
  it('accepts valid envAccess values', () => {
    expect(isValidRouteEnvAccess(undefined)).toBe(true);
    expect(isValidRouteEnvAccess(ROUTE_ENV_ACCESS.ALL)).toBe(true);
    expect(isValidRouteEnvAccess(ROUTE_ENV_ACCESS.DEVELOPMENT)).toBe(true);
    expect(isValidRouteEnvAccess('production')).toBe(false);
  });

  it('allows development-only routes in development', () => {
    const route = { slug: '/dev/demo', envAccess: 'development' };

    expect(
      isRouteAccessibleInCurrentEnvironment(route, { isDevelopment: true }),
    ).toBe(true);
  });

  it('blocks development-only routes outside development', () => {
    const route = { slug: '/dev/demo', envAccess: 'development' };

    expect(
      isRouteAccessibleInCurrentEnvironment(route, { isDevelopment: false }),
    ).toBe(false);
  });

  it('allows routes without envAccess everywhere', () => {
    const route = { slug: '/log-in' };

    expect(
      isRouteAccessibleInCurrentEnvironment(route, { isDevelopment: false }),
    ).toBe(true);
    expect(
      isRouteAccessibleInCurrentEnvironment(route, { isDevelopment: true }),
    ).toBe(true);
  });

  it('isDevelopmentEnvironment respects explicit override', () => {
    expect(isDevelopmentEnvironment({ isDevelopment: true })).toBe(true);
    expect(isDevelopmentEnvironment({ isDevelopment: false })).toBe(false);
  });
});

describe('routeGuards S1 — guardCheckRouteEnvironmentAccess envAccess', () => {
  beforeEach(() => {
    delete window.performanceTracker;
  });

  it('blocks development-only routes when not in development', () => {
    const route = { slug: '/dashboard/demo-page', envAccess: 'development' };

    const result = guardCheckRouteEnvironmentAccess(route);

    if (import.meta.env.DEV) {
      expect(result.isNavigationAllowed).toBe(true);
    } else {
      expect(result.isNavigationAllowed).toBe(false);
      expect(result.redirectTargetPath).toBe('/404');
      expect(result.blockReason).toContain('environment');
    }
  });
});

describe('routeGuards B3 — enabled: false excluded at route generation', () => {
  beforeEach(() => {
    delete window.performanceTracker;
  });

  it('does not block enabled: false in guard (route is omitted from router)', () => {
    const route = { slug: '/about', enabled: false };

    const result = guardCheckRouteEnvironmentAccess(route);

    expect(result.isNavigationAllowed).toBe(true);
    expect(result.blockReason).toContain('environment');
  });
});
