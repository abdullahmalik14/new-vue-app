import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const LOCALE_MANAGER_PATH = '../../src/utils/translation/localeManager.js';

vi.mock('../../src/stores/useLocaleStore.js', () => ({
  useLocaleStore: vi.fn(() => ({ locale: 'en', setLocale: vi.fn() })),
}));

vi.mock('../../src/stores/useAuthStore.js', () => ({
  useAuthStore: vi.fn(() => ({ currentUser: { role: 'guest' } })),
}));

vi.mock('../../src/utils/translation/i18nInstance.js', () => ({
  getI18nInstance: vi.fn(() => null),
}));

beforeEach(() => {
  vi.resetModules();
  window.performanceTracker = { step: vi.fn() };
  delete window.APP;
});

afterEach(() => {
  vi.unstubAllEnvs();
  delete window.APP;
});

describe('localeManager window.APP exposure (S-01)', () => {
  it('exposes locale console helpers when import.meta.env.DEV is true', async () => {
    vi.stubEnv('DEV', true);

    await import(LOCALE_MANAGER_PATH);

    expect(typeof window.APP?.setLocale).toBe('function');
    expect(typeof window.APP?.getLocale).toBe('function');
    expect(typeof window.APP?.testLocalePersistence).toBe('function');
  });

  it('does not expose locale mutation helpers when import.meta.env.DEV is false', async () => {
    vi.stubEnv('DEV', false);

    await import(LOCALE_MANAGER_PATH);

    expect(window.APP?.setLocale).toBeUndefined();
    expect(window.APP?.switchLocale).toBeUndefined();
    expect(window.APP?.testLocalePersistence).toBeUndefined();
  });
});
