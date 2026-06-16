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
});
