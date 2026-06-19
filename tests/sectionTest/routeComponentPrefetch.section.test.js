/**
 * routeComponentPreloader.js — section-aware route prefetch (section test plan §47).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockLoader = vi.fn(async () => ({ default: { name: 'MockComponent' } }));

const routeCatalog = [
  {
    slug: '/shop',
    enabled: true,
    section: 'shop',
    componentPath: '@/dev/templates/shop/page/ShopPage.vue',
  },
  {
    slug: '/log-in',
    enabled: true,
    section: 'auth',
    componentPath: '@/dev/templates/auth/page/role/LoginPage.vue',
  },
  {
    slug: '/:pathMatch(.*)*',
    redirect: '/404',
  },
];

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration: vi.fn(() => routeCatalog),
}));

vi.mock('../../src/systems/routing/routeResolver.js', () => ({
  resolveComponentPathForRoute: vi.fn((route) => route.componentPath),
  resolveEffectiveRouteConfig: vi.fn((route) => route),
}));

vi.mock('../../src/systems/routing/routeComponentLoader.js', () => ({
  findComponentLoader: vi.fn(() => mockLoader),
}));

describe('routeComponentPrefetch section routes (Phase F §47)', () => {
  beforeEach(async () => {
    vi.resetModules();
    mockLoader.mockClear();
    window.performanceTracker = { step: vi.fn() };
    const { resetRoutePrefetchCache } = await import(
      '../../src/systems/routing/routeComponentPreloader.js'
    );
    resetRoutePrefetchCache();
  });

  it('prefetches component module for a route with a concrete section', async () => {
    const { prefetchRouteComponent } = await import(
      '../../src/systems/routing/routeComponentPreloader.js'
    );
    const { resolveComponentPathForRoute } = await import('../../src/systems/routing/routeResolver.js');

    await prefetchRouteComponent('/shop');

    expect(resolveComponentPathForRoute).toHaveBeenCalledWith(
      expect.objectContaining({ slug: '/shop', section: 'shop' }),
      expect.any(String),
    );
    expect(mockLoader).toHaveBeenCalledTimes(1);
  });

  it('strips locale prefix before resolving section route prefetch target', async () => {
    const { prefetchRouteComponent } = await import(
      '../../src/systems/routing/routeComponentPreloader.js'
    );
    const { resolveComponentPathForRoute } = await import('../../src/systems/routing/routeResolver.js');

    await prefetchRouteComponent('/vi/log-in');

    expect(resolveComponentPathForRoute).toHaveBeenCalledWith(
      expect.objectContaining({ slug: '/log-in', section: 'auth' }),
      expect.any(String),
    );
  });
});
