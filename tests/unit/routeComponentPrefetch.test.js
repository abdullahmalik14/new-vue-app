import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockLoader = vi.fn(async () => ({ default: { name: 'MockComponent' } }));

const routeCatalog = [
  {
    slug: '/dashboard',
    enabled: true,
    componentPath: '@/templates/dashboard/page/role/Dashboard.vue'
  },
  {
    slug: '/analytics',
    enabled: true,
    componentPath: '@/templates/analytics/AnalyticsPage.vue'
  },
  {
    slug: '/sign-up',
    enabled: true,
    componentPath: '@/templates/auth/page/role/AuthSignUp.vue'
  },
  {
    slug: '/:pathMatch(.*)*',
    redirect: '/404'
  }
];

vi.mock('../../src/utils/route/routeConfigLoader.js', () => ({
  getRouteConfiguration: vi.fn(() => routeCatalog)
}));

vi.mock('../../src/utils/section/sectionPreloadOrchestrator.js', () => ({
  resolveEffectiveRouteConfig: vi.fn((route) => route)
}));

vi.mock('../../src/utils/route/routeResolver.js', () => ({
  resolveComponentPathForRoute: vi.fn((route) => route.componentPath)
}));

vi.mock('../../src/utils/route/routeComponentLoader.js', () => ({
  findComponentLoader: vi.fn(() => mockLoader)
}));

describe('routeComponentPrefetch (P10)', () => {
  beforeEach(async () => {
    vi.resetModules();
    mockLoader.mockClear();
    window.performanceTracker = { step: vi.fn() };
    const { resetRoutePrefetchCache } = await import('../../src/utils/route/routeComponentPrefetch.js');
    resetRoutePrefetchCache();
  });

  it('prefetches the component module for a known route path', async () => {
    const { prefetchRouteComponent } = await import('../../src/utils/route/routeComponentPrefetch.js');

    await prefetchRouteComponent('/dashboard');
    await prefetchRouteComponent('/dashboard');

    expect(mockLoader).toHaveBeenCalledTimes(1);
  });

  it('resolves /dashboard/analytics menu path to /analytics route', async () => {
    const { prefetchRouteComponent } = await import('../../src/utils/route/routeComponentPrefetch.js');
    const { resolveComponentPathForRoute } = await import('../../src/utils/route/routeResolver.js');

    await prefetchRouteComponent('/dashboard/analytics');

    expect(resolveComponentPathForRoute).toHaveBeenCalledWith(
      expect.objectContaining({ slug: '/analytics' }),
      expect.any(String)
    );
    expect(mockLoader).toHaveBeenCalledTimes(1);
  });

  it('does not match catch-all wildcard routes', async () => {
    const { prefetchRouteComponent } = await import('../../src/utils/route/routeComponentPrefetch.js');

    await prefetchRouteComponent('/totally-unknown-path');

    expect(mockLoader).not.toHaveBeenCalled();
  });

  it('strips locale prefix before resolving route', async () => {
    const { prefetchRouteComponent } = await import('../../src/utils/route/routeComponentPrefetch.js');
    const { resolveComponentPathForRoute } = await import('../../src/utils/route/routeResolver.js');

    await prefetchRouteComponent('/vi/sign-up');

    expect(resolveComponentPathForRoute).toHaveBeenCalledWith(
      expect.objectContaining({ slug: '/sign-up' }),
      expect.any(String)
    );
  });

  it('createRoutePrefetchIntentHandler triggers prefetch', async () => {
    const { createRoutePrefetchIntentHandler } = await import('../../src/utils/route/routeComponentPrefetch.js');

    const onIntent = createRoutePrefetchIntentHandler('/sign-up');
    onIntent();
    await Promise.resolve();

    expect(mockLoader).toHaveBeenCalledTimes(1);
  });
});
