import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
  normalizeAssetDefinition,
  shouldIgnoreComponent,
} from '../../src/utils/assets/assetScanner.js';
import { getPreloadedAssetsCount } from '../../src/utils/assets/assetPreloader.js';

describe('assetScanner — normalizeAssetDefinition (L-11)', () => {
  beforeEach(() => {
    window.performanceTracker = { step: vi.fn() };
  });
  it('applies fallbacks when src/type/priority are null on the source object', () => {
    const normalized = normalizeAssetDefinition({
      src: null,
      type: null,
      priority: null,
      flag: 'icon.test'
    });

    expect(normalized.src).toBe('');
    expect(normalized.type).toBe('unknown');
    expect(normalized.priority).toBe('low');
    expect(normalized.flag).toBe('icon.test');
  });

  it('preserves valid fields from the source object', () => {
    const normalized = normalizeAssetDefinition({
      src: '/images/foo.webp',
      type: 'image',
      priority: 'high'
    });

    expect(normalized).toMatchObject({
      src: '/images/foo.webp',
      type: 'image',
      priority: 'high'
    });
  });
});

describe('assetScanner / assetPreloader — trivial getters skip performanceTracker (P-05)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('shouldIgnoreComponent does not emit performanceTracker steps', () => {
    shouldIgnoreComponent({ IGNORE_ASSET_PRELOAD: true });
    shouldIgnoreComponent({ ignoreAssetPreload: false });

    expect(window.performanceTracker.step).not.toHaveBeenCalled();
  });

  it('normalizeAssetDefinition does not emit performanceTracker steps', () => {
    normalizeAssetDefinition({ src: '/a.png', type: 'image', priority: 'high' });

    expect(window.performanceTracker.step).not.toHaveBeenCalled();
  });

  it('getPreloadedAssetsCount does not emit performanceTracker steps', () => {
    getPreloadedAssetsCount();

    expect(window.performanceTracker.step).not.toHaveBeenCalled();
  });
});
