import { describe, it, expect, beforeEach, vi } from 'vitest';

const LOCALE_MANAGER_PATH = '../../src/utils/translation/localeManager.js';

beforeEach(() => {
  window.performanceTracker = { step: vi.fn() };
});

describe('getLocaleSwitcherOptions (L-08)', () => {
  it('returns one option per SUPPORTED_LOCALES code with labels', async () => {
    const { getLocaleSwitcherOptions, SUPPORTED_LOCALES } = await import(LOCALE_MANAGER_PATH);
    const options = getLocaleSwitcherOptions();

    expect(options).toHaveLength(SUPPORTED_LOCALES.length);
    expect(options.map((o) => o.code)).toEqual(SUPPORTED_LOCALES);
    expect(options.find((o) => o.code === 'vi')?.label).toBe('Vietnamese');
    expect(options.find((o) => o.code === 'zh-tw')?.traditionalName).toContain('繁');
  });
});

describe('getLocaleDisplayName (P-05)', () => {
  it('returns curated labels for all supported locales', async () => {
    const { getLocaleDisplayName, SUPPORTED_LOCALES } = await import(LOCALE_MANAGER_PATH);

    for (const code of SUPPORTED_LOCALES) {
      const name = getLocaleDisplayName(code);
      expect(name).not.toBe(code);
      expect(name.length).toBeGreaterThan(1);
    }
  });

  it('uses Intl.DisplayNames fallback for locales outside the curated map', async () => {
    const { getLocaleDisplayName } = await import(LOCALE_MANAGER_PATH);

    const hawaiian = getLocaleDisplayName('haw');
    expect(hawaiian).toBe('Hawaiian');
  });

  it('accepts displayLocale for Intl fallback path', async () => {
    const { getLocaleDisplayName } = await import(LOCALE_MANAGER_PATH);

    const frenchInGerman = getLocaleDisplayName('haw', 'de');
    expect(frenchInGerman.toLowerCase()).toContain('hawai');
  });
});
