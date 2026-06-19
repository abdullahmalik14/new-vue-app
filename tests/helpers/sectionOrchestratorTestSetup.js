/**
 * Shared utilities for sectionPreloadOrchestrator Vitest suites.
 */

import { vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

export const ORCHESTRATOR_PATH = '../../src/systems/sections/sectionPreloadOrchestrator.js';

/**
 * @param {{ preloadSection?: Function, resetSectionPreloadState?: Function }} [overrides]
 */
export function createOrchestratorMocks(overrides = {}) {
  return {
    preloadSection: overrides.preloadSection ?? vi.fn().mockResolvedValue(true),
    resetSectionPreloadState: overrides.resetSectionPreloadState ?? vi.fn(),
  };
}

/**
 * @param {{ preloadSection: Function, resetSectionPreloadState: Function }} mocks
 */
export function setupOrchestratorTestEnvironment(mocks) {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  setActivePinia(createPinia());
  window.performanceTracker = { step: vi.fn() };

  mocks.preloadSection.mockReset();
  mocks.preloadSection.mockResolvedValue(true);
  mocks.resetSectionPreloadState.mockReset();
}

export function teardownOrchestratorTestEnvironment() {
  vi.unstubAllEnvs();
}

export async function resetTranslationLoaderMocks() {
  const { areTranslationsLoadedForSection, loadTranslationsForSection } = await import(
    '../../src/systems/i18n/translationLoader.js'
  );
  areTranslationsLoadedForSection.mockReturnValue(false);
  loadTranslationsForSection.mockClear();
  return { areTranslationsLoadedForSection, loadTranslationsForSection };
}
