/**
 * routeAdminAccess.js — Phase B (route test plan §22).
 */

import { describe, it, expect } from 'vitest';
import { isAdminUser, isRouteAccessibleToAdmin } from '../../src/systems/routing/routeAdminAccess.js';
import { makeAuthenticatedContext, makeGuardContext } from '../helpers/routeFixtures.js';

describe('routeAdminAccess (Phase B §22)', () => {
  it('isAdminUser detects admin role', () => {
    expect(isAdminUser(makeAuthenticatedContext('admin'))).toBe(true);
    expect(isAdminUser(makeAuthenticatedContext('creator'))).toBe(false);
  });

  it('isAdminUser detects isAdmin flag on profile', () => {
    expect(
      isAdminUser(
        makeAuthenticatedContext('creator', {
          isAdmin: true,
        }),
      ),
    ).toBe(true);
  });

  it('isAdminUser defaults guest context to non-admin', () => {
    expect(isAdminUser(makeGuardContext())).toBe(false);
  });

  it('isRouteAccessibleToAdmin allows non-adminOnly routes for everyone', () => {
    const route = { slug: '/dashboard', adminOnly: false };

    expect(isRouteAccessibleToAdmin(route, makeAuthenticatedContext('fan'))).toBe(true);
    expect(isRouteAccessibleToAdmin(route, makeGuardContext())).toBe(true);
  });

  it('isRouteAccessibleToAdmin allows admins on adminOnly routes', () => {
    const route = { slug: '/internal/tools', adminOnly: true };

    expect(isRouteAccessibleToAdmin(route, makeAuthenticatedContext('admin'))).toBe(true);
  });

  it('isRouteAccessibleToAdmin blocks non-admins on adminOnly routes', () => {
    const route = { slug: '/internal/tools', adminOnly: true };

    expect(isRouteAccessibleToAdmin(route, makeAuthenticatedContext('creator'))).toBe(false);
    expect(isRouteAccessibleToAdmin(route, makeGuardContext())).toBe(false);
  });

  it('isRouteAccessibleToAdmin treats missing route as accessible', () => {
    expect(isRouteAccessibleToAdmin(null, makeGuardContext())).toBe(true);
  });
});
