import { describe, it, expect, beforeEach, vi } from 'vitest';

const getRouteConfiguration = vi.fn(() => [
  { slug: '/log-in', section: 'auth', componentPath: '@/pages/auth/LogIn.vue' }
]);

vi.mock('../../src/utils/route/routeConfigLoader.js', () => ({
  getRouteConfiguration
}));

describe('performanceTracker guards (S-05)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete window.performanceTracker;

    getRouteConfiguration.mockReturnValue([
      { slug: '/log-in', section: 'auth', componentPath: '@/pages/auth/LogIn.vue' }
    ]);
  });

  it('manifestLoader getSectionBundlePaths works without performanceTracker', async () => {
    const { getSectionBundlePaths } = await import('../../src/utils/build/manifestLoader.js');

    const result = await getSectionBundlePaths('auth', {
      auth: {
        js: '/assets/section-auth-abc123.js',
        integrity: { js: 'sha384-test' }
      }
    });

    expect(result).toEqual({
      js: '/assets/section-auth-abc123.js',
      css: null,
      integrity: { js: 'sha384-test' }
    });
  });

  it('routeResolver resolveRouteFromPath works without performanceTracker (A4)', async () => {
    const { resolveRouteFromPath } = await import('../../src/utils/route/routeResolver.js');

    const route = resolveRouteFromPath('/log-in');

    expect(route).toMatchObject({ slug: '/log-in', section: 'auth' });
  });

  it('trackStep and getPerformanceTracker are safe when window is undefined (SSR)', async () => {
    const savedWindow = globalThis.window;
    // @ts-expect-error simulate Node/SSR — no browser global
    delete globalThis.window;

    try {
      const { trackStep, getPerformanceTracker } = await import(
        '../../src/utils/common/performanceTrackerAccess.js'
      );

      expect(() =>
        trackStep({
          step: 'ssrSafe',
          file: 'test',
          method: 'test',
          flag: 'test',
          purpose: 'SSR guard check',
        }),
      ).not.toThrow();

      expect(getPerformanceTracker().enabled).toBe(false);
    } finally {
      globalThis.window = savedWindow;
    }
  });

  it('routeGuards runAllRouteGuards works without performanceTracker (B1)', async () => {
    const { runAllRouteGuards } = await import('../../src/utils/route/routeGuards.js');

    const result = await runAllRouteGuards(
      { slug: '/log-in', requiresAuth: false, enabled: true, supportedRoles: ['all'] },
      { slug: '/' },
      { isAuthenticated: false, userRole: 'guest' },
    );

    expect(result.allow).toBe(true);
  });

  it('routeConfigLoader getRouteConfiguration works without performanceTracker (B1)', async () => {
    const { getRouteConfiguration } = await import('../../src/utils/route/routeConfigLoader.js');

    const routes = getRouteConfiguration();

    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  it('routeNavigation setCurrentActiveRoute works without performanceTracker (A4)', async () => {
    const {
      setCurrentActiveRoute,
      getCurrentActiveRoute,
      clearNavigationHistory,
    } = await import('../../src/utils/route/routeNavigation.js');

    setCurrentActiveRoute({ slug: '/dashboard' });

    expect(getCurrentActiveRoute()).toMatchObject({ slug: '/dashboard' });

    clearNavigationHistory();

    expect(getCurrentActiveRoute()).toBeNull();
  });
});
