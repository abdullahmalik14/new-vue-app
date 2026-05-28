import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const preloadSection = vi.fn();
const resetSectionPreloadState = vi.fn();

vi.mock('../../src/utils/section/sectionPreloader.js', () => ({
  preloadSection,
  resetSectionPreloadState
}));

vi.mock('../../src/utils/translation/translationLoader.js', () => ({
  loadTranslationsForSection: vi.fn().mockResolvedValue(undefined),
  areTranslationsLoadedForSection: vi.fn(() => false),
}));

beforeEach(async () => {
  setActivePinia(createPinia());
  vi.resetModules();
  preloadSection.mockReset();
  preloadSection.mockResolvedValue(true);
  resetSectionPreloadState.mockReset();

  const { areTranslationsLoadedForSection, loadTranslationsForSection } = await import(
    '../../src/utils/translation/translationLoader.js'
  );
  areTranslationsLoadedForSection.mockReturnValue(false);
  loadTranslationsForSection.mockClear();
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

  it('skips background translation preload when section/locale already loaded (P-02)', async () => {
    const { areTranslationsLoadedForSection, loadTranslationsForSection } = await import(
      '../../src/utils/translation/translationLoader.js'
    );
    areTranslationsLoadedForSection.mockReturnValue(true);

    const { startBackgroundSectionPreloads } = await import(
      '../../src/utils/section/sectionPreloadOrchestrator.js'
    );

    await startBackgroundSectionPreloads({
      sections: ['shop'],
      locale: 'vi',
      preloadTranslations: true,
      logContext: { file: 'test', method: 'test' },
    });

    expect(areTranslationsLoadedForSection).toHaveBeenCalledWith('shop', 'vi');
    expect(loadTranslationsForSection).not.toHaveBeenCalled();
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
