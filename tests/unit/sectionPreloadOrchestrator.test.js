import { describe, it, expect, beforeEach, vi } from 'vitest';

const preloadSection = vi.fn();
const resetSectionPreloadState = vi.fn();

vi.mock('../../src/utils/section/sectionPreloader.js', () => ({
  preloadSection,
  resetSectionPreloadState
}));

vi.mock('../../src/utils/translation/translationLoader.js', () => ({
  loadTranslationsForSection: vi.fn().mockResolvedValue(undefined)
}));

beforeEach(() => {
  vi.resetModules();
  preloadSection.mockReset();
  preloadSection.mockResolvedValue(true);
  resetSectionPreloadState.mockReset();
});

describe('startBackgroundSectionPreloads (P-07 / Task 4b)', () => {
  it('calls preloadSection only for each background section', async () => {
    const { startBackgroundSectionPreloads } = await import('../../src/utils/section/sectionPreloadOrchestrator.js');

    await startBackgroundSectionPreloads({
      sections: ['auth', 'shop'],
      skipSection: 'auth',
      logContext: { file: 'test', method: 'test' }
    });

    expect(preloadSection).toHaveBeenCalledTimes(1);
    expect(preloadSection).toHaveBeenCalledWith('shop');
  });

  it('does not import or call preloadSectionCss directly', async () => {
    const cssLoader = await import('../../src/utils/section/sectionCssLoader.js');
    const preloadSectionCssSpy = vi.spyOn(cssLoader, 'preloadSectionCss');

    const { startBackgroundSectionPreloads } = await import('../../src/utils/section/sectionPreloadOrchestrator.js');

    await startBackgroundSectionPreloads({
      sections: ['auth'],
      logContext: { file: 'test', method: 'test' }
    });

    expect(preloadSectionCssSpy).not.toHaveBeenCalled();

    preloadSectionCssSpy.mockRestore();
  });
});

describe('refreshSectionPreloadsOnLocaleChange (M-07)', () => {
  it('resets preload state then re-runs bundles and translations', async () => {
    const { loadTranslationsForSection } = await import('../../src/utils/translation/translationLoader.js');
    const { refreshSectionPreloadsOnLocaleChange } = await import('../../src/utils/section/sectionPreloadOrchestrator.js');

    await refreshSectionPreloadsOnLocaleChange({
      sections: ['auth', 'shop', 'auth'],
      locale: 'vi',
      skipSection: 'auth',
      logContext: { file: 'test', method: 'test' }
    });

    expect(resetSectionPreloadState).toHaveBeenCalledTimes(1);
    expect(resetSectionPreloadState).toHaveBeenCalledWith('shop');
    expect(preloadSection).toHaveBeenCalledTimes(1);
    expect(preloadSection).toHaveBeenCalledWith('shop');
    expect(loadTranslationsForSection).toHaveBeenCalledWith('shop', 'vi');
  });
});
