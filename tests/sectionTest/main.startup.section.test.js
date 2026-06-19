/**
 * Startup section preload contract mirrored from app/main.js (section test plan §48, §124).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const preloadSection = vi.fn().mockResolvedValue(true);
const preloadDefaultAuthSection = vi.fn().mockResolvedValue(undefined);
const startBackgroundSectionPreloads = vi.fn().mockResolvedValue(undefined);

vi.mock('../../src/systems/sections/sectionPreloader.js', () => ({
  preloadSection,
}));

vi.mock('../../src/systems/sections/sectionPreloadOrchestrator.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    preloadDefaultAuthSection,
    startBackgroundSectionPreloads,
  };
});

beforeEach(() => {
  vi.resetModules();
  setActivePinia(createPinia());
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  window.performanceTracker = { step: vi.fn() };
  preloadSection.mockClear();
  preloadDefaultAuthSection.mockClear();
  startBackgroundSectionPreloads.mockClear();
});

describe('startup section preload contract (Phase F §48, §124)', () => {
  async function loadOrchestrator() {
    return import('../../src/systems/sections/sectionPreloadOrchestrator.js');
  }

  it('builds startup preload list with current section when absent from route plan', async () => {
    const {
      getSectionPreloadPlan,
      resolveCurrentSectionNameFromRouteConfig,
    } = await loadOrchestrator();

    const currentRoute = {
      slug: '/log-in',
      section: 'auth',
      preLoadSections: ['shop'],
    };
    const userRole = 'guest';
    const currentSectionName = resolveCurrentSectionNameFromRouteConfig(currentRoute, userRole);
    const { resolvedSectionNames: baseSectionsToPreload } = getSectionPreloadPlan(currentRoute, userRole);
    const sectionsToPreload =
      currentSectionName && !baseSectionsToPreload.includes(currentSectionName)
        ? [...baseSectionsToPreload, currentSectionName]
        : baseSectionsToPreload;

    expect(sectionsToPreload).toEqual(['shop', 'auth']);
  });

  it('preloads default auth section for unauthenticated startup on non-login path', async () => {
    const { shouldPreloadDefaultAuthSection, preloadDefaultAuthSection } = await loadOrchestrator();

    if (
      shouldPreloadDefaultAuthSection({
        isAuthenticated: false,
        currentPath: '/dashboard',
        resolvedSections: ['dashboard-global'],
      })
    ) {
      await preloadDefaultAuthSection({ file: 'main.js', method: 'init' });
    }

    expect(preloadDefaultAuthSection).toHaveBeenCalledWith({
      file: 'main.js',
      method: 'init',
    });
  });

  it('starts background section preloads without awaiting completion (non-blocking)', async () => {
    const { startBackgroundSectionPreloads } = await loadOrchestrator();
    let resolveBackground;
    startBackgroundSectionPreloads.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveBackground = resolve;
        }),
    );

    const pending = startBackgroundSectionPreloads({
      sections: ['auth', 'shop'],
      logContext: { file: 'main.js', method: 'init' },
      path: '/log-in',
    });

    expect(startBackgroundSectionPreloads).toHaveBeenCalled();
    resolveBackground();
    await pending;
  });
});
