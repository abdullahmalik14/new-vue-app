/**
 * sectionPreloadOrchestrator.js — refreshSectionPreloadsOnLocaleChange (§28, §73, §101).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ORCHESTRATOR_PATH,
  resetTranslationLoaderMocks,
  setupOrchestratorTestEnvironment,
  teardownOrchestratorTestEnvironment,
} from '../helpers/sectionOrchestratorTestSetup.js';

const { preloadSection, resetSectionPreloadState } = vi.hoisted(() => ({
  preloadSection: vi.fn(),
  resetSectionPreloadState: vi.fn(),
}));

const mocks = { preloadSection, resetSectionPreloadState };

vi.mock('../../src/systems/sections/sectionPreloader.js', () => ({
  preloadSection,
  resetSectionPreloadState,
}));

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection: vi.fn().mockResolvedValue(undefined),
  areTranslationsLoadedForSection: vi.fn(() => false),
}));

beforeEach(async () => {
  setupOrchestratorTestEnvironment(mocks);
  await resetTranslationLoaderMocks();
});

afterEach(() => {
  teardownOrchestratorTestEnvironment();
});

describe('refreshSectionPreloadsOnLocaleChange (Phase E §28, §73)', () => {
  async function loadOrchestrator() {
    return import(ORCHESTRATOR_PATH);
  }

  it('resets preload state then re-runs bundles and translations', async () => {
    const { loadTranslationsForSection } = await import(
      '../../src/systems/i18n/translationLoader.js'
    );
    const { refreshSectionPreloadsOnLocaleChange } = await loadOrchestrator();

    await refreshSectionPreloadsOnLocaleChange({
      sections: ['auth', 'shop', 'auth'],
      locale: 'vi',
      skipSection: 'auth',
      logContext: { file: 'test', method: 'test' },
    });

    expect(mocks.resetSectionPreloadState).toHaveBeenCalledTimes(1);
    expect(mocks.resetSectionPreloadState).toHaveBeenCalledWith('shop');
    expect(mocks.preloadSection).toHaveBeenCalledTimes(1);
    expect(mocks.preloadSection).toHaveBeenCalledWith('shop');
    expect(loadTranslationsForSection).toHaveBeenCalledWith('shop', 'vi');
  });

  it('returns early without reset when all sections are skipped or invalid', async () => {
    const { refreshSectionPreloadsOnLocaleChange } = await loadOrchestrator();

    await refreshSectionPreloadsOnLocaleChange({
      sections: ['auth', '', null],
      locale: 'vi',
      skipSection: 'auth',
      logContext: { file: 'test', method: 'test' },
    });

    expect(mocks.resetSectionPreloadState).not.toHaveBeenCalled();
    expect(mocks.preloadSection).not.toHaveBeenCalled();
  });

  it('resets and preloads multiple distinct sections after locale change', async () => {
    const { refreshSectionPreloadsOnLocaleChange } = await loadOrchestrator();

    await refreshSectionPreloadsOnLocaleChange({
      sections: ['shop', 'profile'],
      locale: 'fr',
      logContext: { file: 'test', method: 'localeManager' },
    });

    expect(mocks.resetSectionPreloadState).toHaveBeenCalledTimes(2);
    expect(mocks.resetSectionPreloadState).toHaveBeenCalledWith('shop');
    expect(mocks.resetSectionPreloadState).toHaveBeenCalledWith('profile');
    expect(mocks.preloadSection).toHaveBeenCalledTimes(2);
  });
});
