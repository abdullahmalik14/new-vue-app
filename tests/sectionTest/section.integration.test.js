/**
 * Section integration journeys — Phase G (section test plan §52, §126–130).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import { resolveEffectiveRouteConfig } from '../../src/systems/routing/routeResolver.js';
import {
  RESOLVER_ROUTE_FIXTURES,
  SECTION_INHERITANCE_FIXTURES,
  getSectionTestFixtures,
} from '../helpers/sectionFixtures.js';
import {
  autoResolveLinkPreloads,
  configureDefaultPreloaderMocks,
} from '../helpers/sectionPreloaderTestSetup.js';

const preloadSection = vi.fn().mockResolvedValue(true);
const loadSectionCss = vi.fn().mockResolvedValue(true);
const unloadSectionCss = vi.fn();
const getSectionBundlePaths = vi.fn();
const preloadSectionCss = vi.fn().mockResolvedValue(undefined);
const preloadSectionAssets = vi.fn().mockResolvedValue(undefined);

const INTEGRATION_ROUTE_FIXTURES = getSectionTestFixtures([
  ...RESOLVER_ROUTE_FIXTURES,
  ...SECTION_INHERITANCE_FIXTURES,
  {
    slug: '/404',
    supportedRoles: ['all'],
    componentPath: '@/dev/templates/misc/NotFoundPage.vue',
  },
]);

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration: vi.fn(() => INTEGRATION_ROUTE_FIXTURES),
}));

vi.mock('../../src/systems/sections/sectionManifestHelpers.js', () => ({
  getSectionBundlePaths,
  clearManifestCache: vi.fn(),
}));

vi.mock('../../src/systems/sections/sectionCssLoader.js', () => ({
  preloadSectionCss,
  loadSectionCss,
  unloadSectionCss,
  clearAllSectionCss: vi.fn(),
  clearSectionCssPreloadHint: vi.fn(),
  getLoadedSections: vi.fn(() => []),
}));

vi.mock('../../src/systems/assets/assetPreloader.js', () => ({
  preloadSectionAssets: vi.fn().mockResolvedValue(undefined),
  preloadSectionCriticalImages: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection: vi.fn().mockResolvedValue(undefined),
  areTranslationsLoadedForSection: vi.fn(() => false),
  preloadTranslationsForSections: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/systems/sections/sectionPreloader.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    preloadSection,
  };
});

function routeConfigBySlug(slug) {
  return INTEGRATION_ROUTE_FIXTURES.find((route) => route.slug === slug);
}

function createSectionIntegrationRouter(initialRole = 'guest') {
  let userRole = initialRole;

  const routes = [
    {
      path: '/log-in',
      name: '/log-in',
      component: { template: '<div>Login</div>' },
      meta: { routeConfig: routeConfigBySlug('/log-in') },
    },
    {
      path: '/dashboard',
      name: '/dashboard',
      component: { template: '<div>Dashboard</div>' },
      meta: { routeConfig: routeConfigBySlug('/dashboard') },
    },
    {
      path: '/shop',
      name: '/shop',
      component: { template: '<div>Shop</div>' },
      meta: { routeConfig: routeConfigBySlug('/shop') },
    },
    {
      path: '/parent-shop/child-inherit-all',
      name: '/parent-shop/child-inherit-all',
      component: { template: '<div>Inherited</div>' },
      meta: { routeConfig: routeConfigBySlug('/parent-shop/child-inherit-all') },
    },
    {
      path: '/404',
      name: '/404',
      component: { template: '<div>Not found</div>' },
      meta: { routeConfig: routeConfigBySlug('/404') },
    },
  ];

  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  });

  router.beforeEach(async (to, _from, next) => {
    const {
      assignResolvedSectionToRouteMeta,
    } = await import('../../src/systems/sections/sectionNavigationHooks.js');
    const effectiveRouteConfig = resolveEffectiveRouteConfig(to.meta?.routeConfig);

    assignResolvedSectionToRouteMeta(to, effectiveRouteConfig, userRole);
    next();
  });

  router.beforeResolve(async (to, from) => {
    const { startCurrentSectionResourceLoads } = await import(
      '../../src/systems/sections/sectionNavigationHooks.js'
    );

    startCurrentSectionResourceLoads({
      to,
      from,
      userRole,
      activeLocale: 'en',
      logContext: { file: 'section.integration.test.js', method: 'beforeResolve' },
    });
  });

  router.afterEach(async (to, from) => {
    const { startPostNavigationSectionPreloads } = await import(
      '../../src/systems/sections/sectionNavigationHooks.js'
    );
    const routeConfig = to.meta?.routeConfig;
    const effectiveRouteConfig = resolveEffectiveRouteConfig(routeConfig);

    startPostNavigationSectionPreloads({
      to,
      from,
      routeConfig,
      effectiveRouteConfig,
      userRole,
      activeLocale: 'en',
    });
  });

  return {
    router,
    setUserRole(nextRole) {
      userRole = nextRole;
    },
  };
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  setActivePinia(createPinia());
  document.head.innerHTML = '';
  window.performanceTracker = { step: vi.fn() };
  vi.stubEnv('VITE_ENABLE_LOGGER', '');

  preloadSection.mockResolvedValue(true);
  configureDefaultPreloaderMocks({ getSectionBundlePaths, preloadSectionCss, preloadSectionAssets });
  autoResolveLinkPreloads();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('section.integration — navigation journeys (Phase G §52, §126)', () => {
  it('guest login route resolves auth meta.section and skips auth in background preloads', async () => {
    const loginRoute = routeConfigBySlug('/log-in');
    loginRoute.preLoadSections = ['shop'];

    const { router } = createSectionIntegrationRouter('guest');

    await router.push('/log-in');

    expect(router.currentRoute.value.meta.section).toBe('auth');

    await vi.waitFor(() => {
      expect(preloadSection).toHaveBeenCalled();
    });

    const preloadedSections = preloadSection.mock.calls.map(([sectionName]) => sectionName);
    expect(preloadedSections).toContain('shop');
    expect(preloadedSections).not.toContain('auth');
  });

  it('creator dashboard navigation resolves dashboard-creator meta.section', async () => {
    const { router } = createSectionIntegrationRouter('creator');

    await router.push('/dashboard');

    expect(router.currentRoute.value.meta.section).toBe('dashboard-creator');
    expect(loadSectionCss).toHaveBeenCalledWith('dashboard-creator');
  });

  it('fan dashboard navigation resolves dashboard-fan meta.section', async () => {
    const { router, setUserRole } = createSectionIntegrationRouter('fan');

    await router.push('/dashboard');
    expect(router.currentRoute.value.meta.section).toBe('dashboard-fan');

    setUserRole('creator');
    await router.push('/log-in');
    await router.push('/dashboard');

    expect(router.currentRoute.value.meta.section).toBe('dashboard-creator');
  });

  it('login → dashboard journey unloads auth CSS and loads dashboard section CSS', async () => {
    const { router, setUserRole } = createSectionIntegrationRouter('guest');

    await router.push('/log-in');
    expect(router.currentRoute.value.meta.section).toBe('auth');

    setUserRole('creator');
    await router.push('/dashboard');

    expect(unloadSectionCss).toHaveBeenCalledWith('auth');
    expect(loadSectionCss).toHaveBeenCalledWith('dashboard-creator');
  });

  it('inherited child route includes parent preLoadSections in background preload plan', async () => {
    const { router } = createSectionIntegrationRouter('guest');

    await router.push('/parent-shop/child-inherit-all');

    await vi.waitFor(() => {
      expect(preloadSection).toHaveBeenCalledWith('shop');
    });
  });

  it('404 route without section completes navigation without preload errors', async () => {
    const { router } = createSectionIntegrationRouter('guest');

    await expect(router.push('/404')).resolves.toBeUndefined();
    expect(router.currentRoute.value.path).toBe('/404');
    expect(router.currentRoute.value.meta.section).toBeUndefined();
    expect(preloadSection).not.toHaveBeenCalled();
    expect(loadSectionCss).not.toHaveBeenCalled();
  });

  it('return navigation restores previous section meta and unloads destination CSS', async () => {
    const { router, setUserRole } = createSectionIntegrationRouter('guest');

    await router.push('/log-in');
    setUserRole('creator');
    await router.push('/dashboard');

    unloadSectionCss.mockClear();
    loadSectionCss.mockClear();

    setUserRole('guest');
    await router.push('/log-in');

    expect(router.currentRoute.value.path).toBe('/log-in');
    expect(router.currentRoute.value.meta.section).toBe('auth');
    expect(unloadSectionCss).toHaveBeenCalledWith('dashboard-creator');
    expect(loadSectionCss).toHaveBeenCalledWith('auth');
  });
});
