import { describe, it, expect } from 'vitest';

describe('section barrel exports (B-08 / Task 9)', () => {
  it('exports preloadSection from the barrel, not the removed preloadSectionBundle name', async () => {
    const barrel = await import('../../src/systems/sections/index.js');

    expect(barrel.preloadSection).toBeTypeOf('function');
    expect(barrel.preloadSectionBundle).toBeUndefined();
    expect(barrel.preloadMultipleSections).toBeTypeOf('function');
    expect(barrel.isSectionPreloaded).toBeTypeOf('function');
    expect(barrel.clearPreloadState).toBeTypeOf('function');
    expect(barrel.getPreloadStatistics).toBeTypeOf('function');
  });

  it('exports resolver, CSS loader, orchestrator, manifest, and navigation modules', async () => {
    const barrel = await import('../../src/systems/sections/index.js');

    expect(barrel.resolveSectionIdentifier).toBeTypeOf('function');
    expect(barrel.resetSectionPreloadState).toBeTypeOf('function');
    expect(barrel.loadSectionCss).toBeTypeOf('function');
    expect(barrel.getRoutePreloadPlan).toBeTypeOf('function');
    expect(barrel.startBackgroundSectionPreloads).toBeTypeOf('function');
    expect(barrel.getSectionBundlePaths).toBeTypeOf('function');
    expect(barrel.loadCurrentSectionResources).toBeTypeOf('function');
    expect(barrel.loadRouteComponentWithSectionPreload).toBeTypeOf('function');
  });
});
