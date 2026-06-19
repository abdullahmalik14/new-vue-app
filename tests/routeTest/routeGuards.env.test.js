/**
 * routeGuards.js — environment access guard (Phase C §5).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { guardCheckRouteEnvironmentAccess } from '../../src/systems/routing/routeGuards.js';
import * as routeEnvAccess from '../../src/systems/routing/routeEnvAccess.js';
import { resetGuardModuleState } from '../helpers/routeFixtures.js';

beforeEach(async () => {
  delete window.performanceTracker;
  await resetGuardModuleState();
  vi.restoreAllMocks();
});

describe('guardCheckRouteEnvironmentAccess (Phase C §5)', () => {
  it('allows route with no envAccess', () => {
    const result = guardCheckRouteEnvironmentAccess({ slug: '/log-in' });

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('allows development-only route when environment check passes', () => {
    vi.spyOn(routeEnvAccess, 'isRouteAccessibleInCurrentEnvironment').mockReturnValue(true);

    const result = guardCheckRouteEnvironmentAccess({
      slug: '/dev/demo',
      envAccess: 'development',
    });

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('blocks development-only route when environment check fails', () => {
    vi.spyOn(routeEnvAccess, 'isRouteAccessibleInCurrentEnvironment').mockReturnValue(false);

    const result = guardCheckRouteEnvironmentAccess({
      slug: '/dev/demo',
      envAccess: 'development',
    });

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.redirectTargetPath).toBe('/404');
    expect(result.blockReason).toContain('environment');
  });

  it('does not block enabled: false in guard (route omitted at router generation — B3)', () => {
    const result = guardCheckRouteEnvironmentAccess({ slug: '/about', enabled: false });

    expect(result.isNavigationAllowed).toBe(true);
  });
});
