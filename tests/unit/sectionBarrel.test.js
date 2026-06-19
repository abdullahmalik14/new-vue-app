import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/systems/assets/assetPreloader.js', () => ({
  preloadSectionCriticalImages: vi.fn(),
}));

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection: vi.fn(() => Promise.resolve()),
  areTranslationsLoadedForSection: vi.fn(() => false),
}));

describe('section barrel exports (B-08 / Task 9)', () => {
  it('exports preloadSection from the barrel, not the removed preloadSectionBundle name', async () => {
    const barrel = await import('../../src/systems/sections/index.js');

    expect(barrel.preloadSection).toBeTypeOf('function');
    expect(barrel.preloadSectionBundle).toBeUndefined();
    expect(barrel.preloadMultipleSections).toBeTypeOf('function');
    expect(barrel.isSectionPreloaded).toBeTypeOf('function');
    expect(barrel.clearSectionPreloadState).toBeTypeOf('function');
    expect(barrel.getPreloadStatistics).toBeTypeOf('function');
  }, 15000);

  it('exports resolver, CSS loader, orchestrator, manifest, and navigation modules', async () => {
    const barrel = await import('../../src/systems/sections/index.js');

    expect(barrel.resolveSectionIdentifier).toBeTypeOf('function');
    expect(barrel.resetSectionPreloadState).toBeTypeOf('function');
    expect(barrel.loadSectionCss).toBeTypeOf('function');
    expect(barrel.getSectionPreloadPlan).toBeTypeOf('function');
    expect(barrel.resolveCurrentSectionNameFromRouteConfig).toBeTypeOf('function');
    expect(barrel.startBackgroundSectionPreloads).toBeTypeOf('function');
    expect(barrel.getSectionBundlePaths).toBeTypeOf('function');
    expect(barrel.loadCurrentSectionResources).toBeTypeOf('function');
    expect(barrel.loadRouteComponentWithSectionPreload).toBeTypeOf('function');
  });
});
