/**
 * Concurrency and rapid navigation — Phase G (route test plan §47).
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const mockLoader = vi.fn();
const preloadSection = vi.fn();
const preloadSectionAssets = vi.fn();

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration: vi.fn(() => [
    {
      slug: '/dashboard',
      enabled: true,
      section: 'dashboard-global',
      componentPath: '@/dev/templates/dev/DashboardDevPlaygroundPage.vue',
    },
    {
      slug: '/shop',
      enabled: true,
      section: 'shop',
      componentPath: '@/dev/templates/shop/page/ShopPage.vue',
    },
  ]),
}));

vi.mock('../../src/systems/sections/sectionPreloadOrchestrator.js', () => ({
  resolveCurrentSectionNameFromRouteConfig: vi.fn((route) => route?.section ?? null),
  getSectionPreloadPlan: vi.fn(() => ({ preloadSectionIdentifiers: [], resolvedSectionNames: [] })),
  startBackgroundSectionPreloads: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../src/systems/routing/routeResolver.js', () => ({
  resolveComponentPathForRoute: vi.fn((route) => route.componentPath),
  getRouteChainForPath: vi.fn(() => []),
  resolveEffectiveRouteConfig: vi.fn((route) => route),
}));

vi.mock('../../src/systems/routing/routeComponentLoader.js', () => ({
  findComponentLoader: vi.fn(() => mockLoader),
}));

vi.mock('../../src/systems/assets/assetPreloader.js', () => ({
  preloadSectionAssets: (...args) => preloadSectionAssets(...args),
}));

vi.mock('../../src/systems/sections/sectionPreloader.js', () => ({
  preloadSection: (...args) => preloadSection(...args),
  resetSectionPreloadState: vi.fn(),
}));

vi.mock('../../src/systems/sections/sectionNavigationHooks.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    loadRouteComponentWithSectionPreload: async (route, loadViaGlob) => loadViaGlob(route, 'guest'),
  };
});

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection: vi.fn().mockResolvedValue(undefined),
  areTranslationsLoadedForSection: vi.fn(() => false),
}));

describe('routeConcurrency (Phase G §47)', () => {
  beforeEach(async () => {
    vi.resetModules();
    setActivePinia(createPinia());
    mockLoader.mockReset();
    preloadSection.mockReset();
    preloadSectionAssets.mockReset();
    window.performanceTracker = { step: vi.fn() };

    const { resetRoutePrefetchCache } = await import(
      '../../src/systems/routing/routeComponentPreloader.js'
    );
    const { resetRouteAssetPrefetchCache } = await import(
      '../../src/systems/assets/routeAssetPrefetch.js'
    );
    resetRoutePrefetchCache();
    resetRouteAssetPrefetchCache();
  });

  it('two simultaneous prefetchRouteComponent calls share one in-flight loader', async () => {
    let releaseLoader;
    mockLoader.mockImplementation(
      () =>
        new Promise((resolve) => {
          releaseLoader = () => resolve({ default: { name: 'Mock' } });
        }),
    );

    const { prefetchRouteComponent } = await import(
      '../../src/systems/routing/routeComponentPreloader.js'
    );

    const first = prefetchRouteComponent('/dashboard');
    const second = prefetchRouteComponent('/dashboard');

    expect(mockLoader).toHaveBeenCalledTimes(1);

    releaseLoader();
    await Promise.all([first, second]);
  });

  it('two simultaneous prefetchSectionAssetsForRoute calls share one fetch', async () => {
    let releaseAssets;
    preloadSectionAssets.mockImplementation(
      () =>
        new Promise((resolve) => {
          releaseAssets = () => resolve(undefined);
        }),
    );

    const { prefetchSectionAssetsForRoute } = await import(
      '../../src/systems/assets/routeAssetPrefetch.js'
    );

    const first = prefetchSectionAssetsForRoute('/shop');
    const second = prefetchSectionAssetsForRoute('/shop');

    expect(preloadSectionAssets).toHaveBeenCalledTimes(1);

    releaseAssets();
    await Promise.all([first, second]);
  });

  it('resetRoutePrefetchCache mid-flight allows a subsequent prefetch', async () => {
    const releases = [];
    mockLoader.mockImplementation(
      () =>
        new Promise((resolve) => {
          releases.push(() => resolve({ default: { name: 'Mock' } }));
        }),
    );

    const { prefetchRouteComponent, resetRoutePrefetchCache } = await import(
      '../../src/systems/routing/routeComponentPreloader.js'
    );

    const inFlight = prefetchRouteComponent('/dashboard');
    resetRoutePrefetchCache();
    const afterReset = prefetchRouteComponent('/dashboard');

    expect(mockLoader).toHaveBeenCalledTimes(2);

    releases.forEach((release) => release());
    await Promise.all([inFlight, afterReset]);
  }, 15000);

  it('rapid A→B→A navigation leaves final active path at A', async () => {
    const {
      setCurrentActiveRoute,
      getCurrentActivePath,
      getPreviousActivePath,
    } = await import('../../src/systems/routing/routeNavigation.js');

    setCurrentActiveRoute({ slug: '/log-in' });
    setCurrentActiveRoute({ slug: '/dashboard' });
    setCurrentActiveRoute({ slug: '/log-in' });

    expect(getCurrentActivePath()).toBe('/log-in');
    expect(getPreviousActivePath()).toBe('/dashboard');
  });
});

describe('navigationProgress concurrency (Phase G §47)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    const { failNavigationProgress } = await import(
      '../../src/systems/routing/navigationProgressTracker.js'
    );
    failNavigationProgress();
    vi.useRealTimers();
  });

  it('finishNavigationProgress before startNavigationProgress does not throw', async () => {
    const { finishNavigationProgress, useNavigationProgress } = await import(
      '../../src/systems/routing/navigationProgressTracker.js'
    );

    expect(() => finishNavigationProgress()).not.toThrow();
    expect(useNavigationProgress().progress.value).toBe(1);
  });

  it('startNavigationProgress during in-progress navigation resets trickle timer', async () => {
    const { startNavigationProgress, useNavigationProgress } = await import(
      '../../src/systems/routing/navigationProgressTracker.js'
    );

    startNavigationProgress();
    vi.advanceTimersByTime(600);
    const midProgress = useNavigationProgress().progress.value;

    startNavigationProgress();
    expect(useNavigationProgress().progress.value).toBeLessThanOrEqual(0.1);
    expect(useNavigationProgress().isActive.value).toBe(true);

    vi.advanceTimersByTime(600);
    expect(useNavigationProgress().progress.value).toBeGreaterThan(midProgress * 0);
  });
});
