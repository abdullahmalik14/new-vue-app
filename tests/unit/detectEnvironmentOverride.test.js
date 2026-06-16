import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

describe('detectEnvironment manual override (B-07)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('PROD', '');
  });

  it('re-reads import.meta.env on each call until setEnvironment', async () => {
    const { getEnvironment, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );

    clearAssetCaches();
    expect(getEnvironment()).toBe('development');
    expect(getEnvironment()).toBe('development');
  });

  it('honors setEnvironment override until clearAssetCaches', async () => {
    const { getEnvironment, setEnvironment, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );

    clearAssetCaches();
    setEnvironment('production');
    expect(getEnvironment()).toBe('production');

    clearAssetCaches();
    expect(getEnvironment()).toBe('development');
  });
});
