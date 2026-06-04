import { describe, it, expect, beforeEach } from 'vitest';
import { isAdminUser, isRouteAccessibleToAdmin } from '../../src/utils/route/routeAdminAccess.js';
import { guardCheckRouteAdminAccess } from '../../src/utils/route/routeGuards.js';

describe('routeAdminAccess (M11)', () => {
  it('isAdminUser detects admin role and isAdmin flag', () => {
    expect(isAdminUser({ userRole: 'admin' })).toBe(true);
    expect(isAdminUser({ userProfile: { isAdmin: true, role: 'creator' } })).toBe(true);
    expect(isAdminUser({ userRole: 'creator' })).toBe(false);
  });

  it('isRouteAccessibleToAdmin allows non-adminOnly routes for everyone', () => {
    expect(
      isRouteAccessibleToAdmin({ slug: '/dashboard', adminOnly: false }, { userRole: 'fan' }),
    ).toBe(true);
    expect(isRouteAccessibleToAdmin({ slug: '/dashboard' }, { userRole: 'fan' })).toBe(true);
  });

  it('isRouteAccessibleToAdmin blocks non-admins on adminOnly routes', () => {
    const route = { slug: '/internal/tools', adminOnly: true };

    expect(isRouteAccessibleToAdmin(route, { userRole: 'admin' })).toBe(true);
    expect(isRouteAccessibleToAdmin(route, { userRole: 'creator' })).toBe(false);
  });
});

describe('guardCheckRouteAdminAccess (M11)', () => {
  beforeEach(() => {
    delete window.performanceTracker;
  });

  it('redirects non-admin users to 404', () => {
    const result = guardCheckRouteAdminAccess(
      { slug: '/internal/tools', adminOnly: true },
      { userRole: 'creator', isAuthenticated: true },
    );

    expect(result.allow).toBe(false);
    expect(result.redirectTo).toBe('/404');
    expect(result.reason).toContain('admin');
  });

  it('allows admin users through', () => {
    const result = guardCheckRouteAdminAccess(
      { slug: '/internal/tools', adminOnly: true },
      { userRole: 'admin', isAuthenticated: true },
    );

    expect(result.allow).toBe(true);
  });
});
