/**
 * usePreloadStore.js — section preload state (section test plan §31, §102–104).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
  normalizeStringSet,
  usePreloadStore,
} from '../../src/stores/usePreloadStore.js';

beforeEach(() => {
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  setActivePinia(createPinia());
});

describe('usePreloadStore section getters (Phase D §31)', () => {
  it('hasSection returns false on fresh store and true after addSection', () => {
    const store = usePreloadStore();

    expect(store.hasSection('auth')).toBe(false);
    store.addSection('auth');
    expect(store.hasSection('auth')).toBe(true);
  });

  it('hasSection rejects empty and whitespace-only keys', () => {
    const store = usePreloadStore();
    store.addSection('');
    store.addSection('   ');

    expect(store.hasSection('')).toBe(false);
    expect(store.hasSection('   ')).toBe(false);
  });

  it('isSectionInProgress tracks mark and unmark lifecycle', () => {
    const store = usePreloadStore();

    expect(store.isSectionInProgress('auth')).toBe(false);
    store.markSectionInProgress('auth');
    expect(store.isSectionInProgress('auth')).toBe(true);
    store.unmarkSectionInProgress('auth');
    expect(store.isSectionInProgress('auth')).toBe(false);
  });
});

describe('usePreloadStore section actions (Phase D §31)', () => {
  it('addSection is idempotent for duplicate keys', () => {
    const store = usePreloadStore();

    store.addSection('auth');
    store.addSection('auth');

    expect(store.preloadedSections.size).toBe(1);
  });

  it('removeSection removes existing section and no-ops when absent', () => {
    const store = usePreloadStore();

    store.addSection('auth');
    store.removeSection('auth');
    expect(store.hasSection('auth')).toBe(false);

    store.removeSection('auth');
    expect(store.hasSection('auth')).toBe(false);
  });

  it('clearPreloadState empties preloadedSections and sectionsInProgress', () => {
    const store = usePreloadStore();

    store.addSection('auth');
    store.markSectionInProgress('shop');
    store.clearPreloadState();

    expect(store.preloadedSections.size).toBe(0);
    expect(store.sectionsInProgress.size).toBe(0);
  });

  it('clearPreloadState with resetBuildHash nulls buildHash', () => {
    const store = usePreloadStore();
    store.buildHash = 'build-v1';

    store.clearPreloadState({ resetBuildHash: true });

    expect(store.buildHash).toBeNull();
  });

  it('setManifestLoadFailed toggles manifestLoadFailed flag', () => {
    const store = usePreloadStore();

    store.setManifestLoadFailed(true);
    expect(store.manifestLoadFailed).toBe(true);
    store.setManifestLoadFailed(false);
    expect(store.manifestLoadFailed).toBe(false);
  });
});

describe('normalizeStringSet (Phase D §102)', () => {
  it('filters invalid entries and preserves valid strings', () => {
    expect(normalizeStringSet(['auth', '', '  ', 1, null, 'shop'])).toEqual(new Set(['auth', 'shop']));
  });

  it('returns empty Set for null, undefined, and plain objects', () => {
    expect(normalizeStringSet(null)).toEqual(new Set());
    expect(normalizeStringSet(undefined)).toEqual(new Set());
    expect(normalizeStringSet({})).toEqual(new Set());
  });

  it('returns the same Set instance when input is already a Set', () => {
    const input = new Set(['auth']);
    const output = normalizeStringSet(input);
    expect(output).toEqual(input);
    expect(output).toBe(input);
  });
});
