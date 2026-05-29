import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
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

describe('useLocaleStore persistence TTL (B-01)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('serialize wraps state with expiresAt ~90 days ahead', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-29T12:00:00Z'));

    const { serializeLocalePersistedState, LOCALE_PREFERENCE_TTL_MS } = await import(STORE_PATH);
    const raw = serializeLocalePersistedState({ locale: 'vi' });
    const parsed = JSON.parse(raw);

    expect(parsed.data).toEqual({ locale: 'vi' });
    expect(parsed.expiresAt).toBe(Date.now() + LOCALE_PREFERENCE_TTL_MS);
  });

  it('deserialize returns data when not expired', async () => {
    const { deserializeLocalePersistedState } = await import(STORE_PATH);
    const raw = JSON.stringify({
      data: { locale: 'vi' },
      expiresAt: Date.now() + 60_000,
    });

    expect(deserializeLocalePersistedState(raw)).toEqual({ locale: 'vi' });
  });

  it('deserialize returns null locale when expired', async () => {
    const { deserializeLocalePersistedState } = await import(STORE_PATH);
    const raw = JSON.stringify({
      data: { locale: 'vi' },
      expiresAt: Date.now() - 1,
    });

    expect(deserializeLocalePersistedState(raw)).toEqual({ locale: null });
  });

  it('deserialize accepts legacy plain locale blobs', async () => {
    const { deserializeLocalePersistedState } = await import(STORE_PATH);

    expect(deserializeLocalePersistedState(JSON.stringify({ locale: 'vi' }))).toEqual({
      locale: 'vi',
    });
  });

  it('deserialize returns null locale on invalid JSON', async () => {
    const { deserializeLocalePersistedState } = await import(STORE_PATH);

    expect(deserializeLocalePersistedState('not-json')).toEqual({ locale: null });
  });
});
