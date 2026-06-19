/**
 * routeEnvAccess.js — Phase B (route test plan §21).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isDevelopmentEnvironment,
  isRouteAccessibleInCurrentEnvironment,
  isValidRouteEnvAccess,
  ROUTE_ENV_ACCESS,
} from '../../src/systems/routing/routeEnvAccess.js';

describe('routeEnvAccess (Phase B §21)', () => {
  it('accepts valid envAccess values', () => {
    expect(isValidRouteEnvAccess(undefined)).toBe(true);
    expect(isValidRouteEnvAccess(ROUTE_ENV_ACCESS.ALL)).toBe(true);
    expect(isValidRouteEnvAccess(ROUTE_ENV_ACCESS.DEVELOPMENT)).toBe(true);
    expect(isValidRouteEnvAccess('production')).toBe(false);
  });

  it('allows development-only routes in development', () => {
    const route = { slug: '/dev/demo', envAccess: 'development' };

    expect(isRouteAccessibleInCurrentEnvironment(route, { isDevelopment: true })).toBe(true);
  });

  it('blocks development-only routes outside development', () => {
    const route = { slug: '/dev/demo', envAccess: 'development' };

    expect(isRouteAccessibleInCurrentEnvironment(route, { isDevelopment: false })).toBe(false);
  });

  it('allows routes without envAccess everywhere', () => {
    const route = { slug: '/log-in' };

    expect(isRouteAccessibleInCurrentEnvironment(route, { isDevelopment: false })).toBe(true);
    expect(isRouteAccessibleInCurrentEnvironment(route, { isDevelopment: true })).toBe(true);
  });

  it('isDevelopmentEnvironment respects explicit override', () => {
    expect(isDevelopmentEnvironment({ isDevelopment: true })).toBe(true);
    expect(isDevelopmentEnvironment({ isDevelopment: false })).toBe(false);
  });

  it('isRouteAccessibleInCurrentEnvironment returns false for null route', () => {
    expect(isRouteAccessibleInCurrentEnvironment(null, { isDevelopment: true })).toBe(false);
  });
});

describe('routeEnvAccess MODE stubs (Phase B §21)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('isDevelopmentEnvironment follows import.meta.env.DEV when no override', () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('DEV', false);

    expect(isDevelopmentEnvironment()).toBe(false);
  });
});
