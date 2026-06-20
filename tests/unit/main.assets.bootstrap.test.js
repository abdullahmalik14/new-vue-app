import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  getProjectRoot,
  loadProductionAssetLibrary,
  setupAssetTestEnv,
} from '../helpers/assetFixtures.js';
import { syncPreloadStoreBuildHash } from '../../src/systems/build/appBuildHash.js';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';

describe('main.assets.bootstrap (§92)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    setActivePinia(createPinia());
    vi.unstubAllEnvs();
    window.performanceTracker = { step: vi.fn() };
  });

  it('initAssetLibrary awaited before mount', () => {
    const mainSource = readFileSync(join(getProjectRoot(), 'src/app/main.js'), 'utf8');
    const mountIndex = mainSource.indexOf('app.mount');
    const initIndex = mainSource.indexOf('await initAssetLibrary');

    expect(initIndex).toBeGreaterThan(-1);
    expect(mountIndex).toBeGreaterThan(initIndex);
  });

  it('validateAssetMap on boot', () => {
    const mainSource = readFileSync(join(getProjectRoot(), 'src/app/main.js'), 'utf8');

    expect(mainSource).toContain('validateAssetMap');
    expect(mainSource).toContain('await initAssetLibrary');
  });

  it('boot continues when validate warns vs throws per contract', async () => {
    const lib = await loadProductionAssetLibrary();
    await expect(lib.initAssetLibrary()).resolves.toBeTruthy();

    const validation = await lib.validateAssetMap();
    expect(validation).toHaveProperty('valid');
    expect(validation).toHaveProperty('errors');
    expect(Array.isArray(validation.errors)).toBe(true);
  });

  it('syncPreloadStoreBuildHash after init', () => {
    const mainSource = readFileSync(join(getProjectRoot(), 'src/app/main.js'), 'utf8');
    const piniaIndex = mainSource.indexOf('createPinia');
    const hashIndex = mainSource.indexOf('syncPreloadStoreBuildHash');

    expect(piniaIndex).toBeGreaterThan(-1);
    expect(hashIndex).toBeGreaterThan(piniaIndex);

    vi.stubEnv('VITE_BUILD_HASH', 'build-bootstrap');
    const store = usePreloadStore();
    store.addSection('auth');

    const result = syncPreloadStoreBuildHash(store);
    expect(result.currentBuildHash).toBe('build-bootstrap');
  });
});
