import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

const STORE_PATH = '../../src/stores/useLocaleStore.js';

beforeEach(() => {
  setActivePinia(createPinia());
  window.performanceTracker = { step: vi.fn() };
});

describe('useLocaleStore (L-04)', () => {
  it('does not expose initializeFromBrowser (browser locale is localeManager only)', async () => {
    const { useLocaleStore } = await import(STORE_PATH);
    const store = useLocaleStore();

    expect(store.initializeFromBrowser).toBeUndefined();
    expect(typeof store.setLocale).toBe('function');
    expect(typeof store.resetToDefault).toBe('function');
  });
});
