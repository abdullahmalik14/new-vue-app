import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockLoader = vi.fn(async () => ({ default: { name: 'MockComponent' } }));

const routeCatalog = [
  {
    slug: '/dashboard',
    enabled: true,
    componentPath: '@/dev/templates/dev/DashboardDevPlaygroundPage.vue'
  },
  {
    slug: '/dashboard/analytics',
    enabled: true,
    componentPath: '@/dev/templates/dashboard/shared/DashboardAnalyticsPage.vue'
  },
  {
    slug: '/payout',
    enabled: true,
    componentPath: '@/templates/payout/PayoutPage.vue'
  },
  {
    slug: '/dashboard/payout',
    enabled: true,
    customComponentPath: {
      creator: { componentPath: '@/templates/dashboard/creator/CreatorDashboardPayoutPage.vue' }
    }
  },
  {
    slug: '/analytics',
    redirect: '/dashboard/analytics'
  },
  {
    slug: '/sign-up',
    enabled: true,
    componentPath: '@/dev/templates/auth/page/role/SignUpPage.vue'
  },
  {
    slug: '/:pathMatch(.*)*',
    redirect: '/404'
  }
];

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration: vi.fn(() => routeCatalog)
}));

vi.mock('../../src/systems/routing/routeResolver.js', () => ({
  resolveComponentPathForRoute: vi.fn((route) => {
    if (route.customComponentPath?.creator) {
      return route.customComponentPath.creator.componentPath;
    }
    return route.componentPath;
  }),
  resolveEffectiveRouteConfig: vi.fn((route) => route),
}));

vi.mock('../../src/systems/routing/routeComponentLoader.js', () => ({
  findComponentLoader: vi.fn(() => mockLoader)
}));

describe('routeComponentPrefetch (P10)', () => {
  beforeEach(async () => {
    vi.resetModules();
    mockLoader.mockClear();
    window.performanceTracker = { step: vi.fn() };
    const { resetRoutePrefetchCache } = await import('../../src/systems/routing/routeComponentPreloader.js');
    resetRoutePrefetchCache();
  });

  it('prefetches the component module for a known route path', async () => {
    const { prefetchRouteComponent } = await import('../../src/systems/routing/routeComponentPreloader.js');

    await prefetchRouteComponent('/dashboard');
    await prefetchRouteComponent('/dashboard');

    expect(mockLoader).toHaveBeenCalledTimes(1);
  });

  it('prefetches /dashboard/analytics on exact prefixed menu path', async () => {
    const { prefetchRouteComponent } = await import('../../src/systems/routing/routeComponentPreloader.js');
    const { resolveComponentPathForRoute } = await import('../../src/systems/routing/routeResolver.js');

    await prefetchRouteComponent('/dashboard/analytics');

    expect(resolveComponentPathForRoute).toHaveBeenCalledWith(
      expect.objectContaining({ slug: '/dashboard/analytics' }),
      expect.any(String)
    );
    expect(mockLoader).toHaveBeenCalledTimes(1);
  });

  it('resolves legacy /analytics hover to /dashboard/analytics route', async () => {
    const { prefetchRouteComponent } = await import('../../src/systems/routing/routeComponentPreloader.js');
    const { resolveComponentPathForRoute } = await import('../../src/systems/routing/routeResolver.js');

    await prefetchRouteComponent('/analytics');

    expect(resolveComponentPathForRoute).toHaveBeenCalledWith(
      expect.objectContaining({ slug: '/dashboard/analytics' }),
      expect.any(String)
    );
    expect(mockLoader).toHaveBeenCalledTimes(1);
  });

  it('prefetches /payout shared page without aliasing to /dashboard/payout', async () => {
    const { prefetchRouteComponent } = await import('../../src/systems/routing/routeComponentPreloader.js');
    const { resolveComponentPathForRoute } = await import('../../src/systems/routing/routeResolver.js');

    await prefetchRouteComponent('/payout');

    expect(resolveComponentPathForRoute).toHaveBeenCalledWith(
      expect.objectContaining({ slug: '/payout' }),
      expect.any(String)
    );
    expect(mockLoader).toHaveBeenCalledTimes(1);
  });

  it('does not match catch-all wildcard routes', async () => {
    const { prefetchRouteComponent } = await import('../../src/systems/routing/routeComponentPreloader.js');

    await prefetchRouteComponent('/totally-unknown-path');

    expect(mockLoader).not.toHaveBeenCalled();
  });

  it('strips locale prefix before resolving route', async () => {
    const { prefetchRouteComponent } = await import('../../src/systems/routing/routeComponentPreloader.js');
    const { resolveComponentPathForRoute } = await import('../../src/systems/routing/routeResolver.js');

    await prefetchRouteComponent('/vi/sign-up');

    expect(resolveComponentPathForRoute).toHaveBeenCalledWith(
      expect.objectContaining({ slug: '/sign-up' }),
      expect.any(String)
    );
  });
});
