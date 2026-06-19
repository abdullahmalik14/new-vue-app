/**
 * sectionNavigationHooks.js — router section hooks (section test plan §35–36, §66).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';

const preloadSection = vi.fn().mockResolvedValue(true);
const startBackgroundSectionPreloads = vi.fn().mockResolvedValue(undefined);
const getSectionPreloadPlan = vi.fn();
const loadCurrentSectionResources = vi.fn();
const resolveCurrentSectionForNavigation = vi.fn();
const preloadSectionCriticalImages = vi.fn().mockResolvedValue(undefined);

vi.mock('../../src/systems/sections/sectionPreloader.js', () => ({
  preloadSection,
}));

vi.mock('../../src/systems/sections/sectionPreloadOrchestrator.js', () => ({
  getSectionPreloadPlan,
  startBackgroundSectionPreloads,
}));

vi.mock('../../src/systems/sections/sectionNavigationResources.js', () => ({
  loadCurrentSectionResources,
  resolveCurrentSectionForNavigation,
}));

vi.mock('../../src/systems/assets/assetPreloader.js', () => ({
  preloadSectionCriticalImages,
}));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  setActivePinia(createPinia());
  window.performanceTracker = { step: vi.fn() };

  preloadSection.mockClear();
  preloadSection.mockResolvedValue(true);
  startBackgroundSectionPreloads.mockClear();
  startBackgroundSectionPreloads.mockResolvedValue(undefined);
  getSectionPreloadPlan.mockReset();
  loadCurrentSectionResources.mockReset();
  resolveCurrentSectionForNavigation.mockReset();
  preloadSectionCriticalImages.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('assignResolvedSectionToRouteMeta (Phase F §35)', () => {
  async function loadHooks() {
    return import('../../src/systems/sections/sectionNavigationHooks.js');
  }

  it('writes resolved role section string onto route meta', async () => {
    const { assignResolvedSectionToRouteMeta } = await loadHooks();
    const to = { meta: {} };

    assignResolvedSectionToRouteMeta(
      to,
      {
        slug: '/dashboard',
        section: { creator: 'dashboard-creator', fan: 'dashboard-fan' },
      },
      'creator',
    );

    expect(to.meta.section).toBe('dashboard-creator');
  });

  it('no-ops when effective route config is missing', async () => {
    const { assignResolvedSectionToRouteMeta } = await loadHooks();
    const to = { meta: { section: 'auth' } };

    assignResolvedSectionToRouteMeta(to, null, 'guest');

    expect(to.meta.section).toBe('auth');
  });
});

describe('loadRouteComponentWithSectionPreload (Phase F §36)', () => {
  async function loadHooks() {
    return import('../../src/systems/sections/sectionNavigationHooks.js');
  }

  it('loads component and skips background preload when section is already cached', async () => {
    const store = usePreloadStore();
    store.addSection('auth');
    const loadComponentViaGlob = vi.fn().mockResolvedValue({ default: {} });
    const { loadRouteComponentWithSectionPreload } = await loadHooks();

    await loadRouteComponentWithSectionPreload(
      { slug: '/log-in', section: 'auth' },
      loadComponentViaGlob,
    );

    expect(loadComponentViaGlob).toHaveBeenCalledTimes(1);
    expect(preloadSectionCriticalImages).toHaveBeenCalledWith('auth');
    expect(preloadSection).not.toHaveBeenCalled();
  });

  it('fires background preloadSection when section is not cached', async () => {
    const loadComponentViaGlob = vi.fn().mockResolvedValue({ default: {} });
    const { loadRouteComponentWithSectionPreload } = await loadHooks();

    await loadRouteComponentWithSectionPreload(
      { slug: '/log-in', section: 'auth' },
      loadComponentViaGlob,
    );

    expect(preloadSection).toHaveBeenCalledWith('auth');
  });

  it('loads component without section preload when route has no section', async () => {
    const loadComponentViaGlob = vi.fn().mockResolvedValue({ default: {} });
    const { loadRouteComponentWithSectionPreload } = await loadHooks();

    await loadRouteComponentWithSectionPreload({ slug: '/callback' }, loadComponentViaGlob);

    expect(loadComponentViaGlob).toHaveBeenCalledTimes(1);
    expect(preloadSection).not.toHaveBeenCalled();
  });
});

describe('startCurrentSectionResourceLoads (Phase F §36)', () => {
  async function loadHooks() {
    return import('../../src/systems/sections/sectionNavigationHooks.js');
  }

  it('delegates to loadCurrentSectionResources with hook log context', async () => {
    const { startCurrentSectionResourceLoads } = await loadHooks();
    const to = { meta: { routeConfig: {}, section: 'auth' } };
    const from = { meta: {} };

    startCurrentSectionResourceLoads({
      to,
      from,
      userRole: 'guest',
      activeLocale: 'vi',
      logContext: { file: 'router.test.js', method: 'afterEach' },
    });

    expect(loadCurrentSectionResources).toHaveBeenCalledWith(
      expect.objectContaining({
        to,
        from,
        userRole: 'guest',
        activeLocale: 'vi',
        logContext: expect.objectContaining({
          file: 'router.test.js',
          method: 'afterEach',
        }),
      }),
    );
  });
});

describe('startPostNavigationSectionPreloads (Phase F §66)', () => {
  async function loadHooks() {
    return import('../../src/systems/sections/sectionNavigationHooks.js');
  }

  it('starts background preloads for resolved sections and skips current section', async () => {
    getSectionPreloadPlan.mockReturnValue({
      preloadSectionIdentifiers: ['shop'],
      resolvedSectionNames: ['shop', 'profile'],
    });
    resolveCurrentSectionForNavigation.mockReturnValue('auth');

    const { startPostNavigationSectionPreloads } = await loadHooks();

    startPostNavigationSectionPreloads({
      to: { path: '/log-in', meta: { section: 'auth' } },
      routeConfig: { slug: '/log-in', section: 'auth', preLoadSections: ['shop'] },
      effectiveRouteConfig: { slug: '/log-in', section: 'auth', preLoadSections: ['shop'] },
      userRole: 'guest',
      activeLocale: 'vi',
    });

    await vi.waitFor(() => {
      expect(startBackgroundSectionPreloads).toHaveBeenCalled();
    });

    expect(startBackgroundSectionPreloads).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: ['shop', 'profile'],
        skipSection: 'auth',
        locale: 'vi',
        preloadTranslations: true,
        path: '/log-in',
      }),
    );
  });

  it('skips background preloads when preloadExclude is true', async () => {
    getSectionPreloadPlan.mockReturnValue({
      preloadSectionIdentifiers: ['shop'],
      resolvedSectionNames: ['shop'],
    });

    const { startPostNavigationSectionPreloads } = await loadHooks();

    startPostNavigationSectionPreloads({
      to: { path: '/demo', meta: {} },
      routeConfig: { slug: '/demo', preloadExclude: true, preLoadSections: ['shop'] },
      effectiveRouteConfig: { slug: '/demo', preloadExclude: true, preLoadSections: ['shop'] },
      userRole: 'guest',
      activeLocale: 'en',
    });

    expect(startBackgroundSectionPreloads).not.toHaveBeenCalled();
  });

  it('returns early when effective route config is missing', async () => {
    const { startPostNavigationSectionPreloads } = await loadHooks();

    startPostNavigationSectionPreloads({
      to: { path: '/unknown', meta: {} },
      routeConfig: null,
      effectiveRouteConfig: null,
      userRole: 'guest',
      activeLocale: 'en',
    });

    expect(getSectionPreloadPlan).not.toHaveBeenCalled();
    expect(startBackgroundSectionPreloads).not.toHaveBeenCalled();
  });
});
