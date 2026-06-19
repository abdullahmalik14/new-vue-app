/**
 * routeGuards.js — admin-only guard (Phase C §7).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { guardCheckRouteAdminAccess } from '../../src/systems/routing/routeGuards.js';
import {
  makeAuthenticatedContext,
  makeGuardContext,
  resetGuardModuleState,
} from '../helpers/routeFixtures.js';

beforeEach(async () => {
  delete window.performanceTracker;
  await resetGuardModuleState();
});

describe('guardCheckRouteAdminAccess (Phase C §7)', () => {
  it('allows non-admin route for regular user', () => {
    const result = guardCheckRouteAdminAccess(
      { slug: '/dashboard', adminOnly: false },
      makeAuthenticatedContext('creator'),
    );

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('allows route without adminOnly flag for everyone', () => {
    const result = guardCheckRouteAdminAccess({ slug: '/shop' }, makeGuardContext());

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('allows admin route when user is admin', () => {
    const result = guardCheckRouteAdminAccess(
      { slug: '/internal/tools', adminOnly: true },
      makeAuthenticatedContext('admin'),
    );

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('blocks admin route for non-admin authenticated user', () => {
    const result = guardCheckRouteAdminAccess(
      { slug: '/internal/tools', adminOnly: true },
      makeAuthenticatedContext('creator'),
    );

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.redirectTargetPath).toBe('/404');
    expect(result.blockReason).toContain('admin');
  });
});
