/**
 * translationLoader.js — section-scoped APIs (section test plan §40–41, §114).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const LOADER_PATH = '../../src/systems/i18n/translationLoader.js';

vi.mock('../../src/utils/common/cacheHandler.js', () => ({
  getValueFromCache: vi.fn(() => null),
  setValueWithExpiration: vi.fn(),
  removeCacheKeysByPrefix: vi.fn(() => 0),
}));

vi.mock('../../src/systems/i18n/localeManager.js', () => ({
  resolveActiveLocale: vi.fn(() => 'en'),
}));

vi.mock('../../src/systems/i18n/i18nInstance.js', () => ({
  getI18nInstance: vi.fn(() => null),
}));

function mockTranslationFetch(translations = { title: 'Auth' }) {
  fetch.mockImplementation(async (url) => {
    if (typeof url === 'string' && url.startsWith('/i18n/section-')) {
      return {
        ok: true,
        headers: {
          get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
        },
        json: async () => translations,
      };
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn());
  window.performanceTracker = { step: vi.fn() };
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('loadTranslationsForSection (Phase F §40)', () => {
  it('loads allowlisted section translations from section i18n path', async () => {
    mockTranslationFetch({ title: 'Login' });
    const { loadTranslationsForSection } = await import(LOADER_PATH);

    await expect(loadTranslationsForSection('auth', 'en')).resolves.toEqual({ title: 'Login' });
    expect(fetch).toHaveBeenCalledWith('/i18n/section-auth/en.json');
  });

  it('rejects traversal-like section names without fetching', async () => {
    const { loadTranslationsForSection } = await import(LOADER_PATH);

    await expect(loadTranslationsForSection('../../api/admin', 'en')).resolves.toEqual({});
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('areTranslationsLoadedForSection (Phase F §41)', () => {
  it('returns true after successful section load', async () => {
    mockTranslationFetch({ title: 'Login' });
    const { loadTranslationsForSection, areTranslationsLoadedForSection } = await import(LOADER_PATH);

    await loadTranslationsForSection('auth', 'vi');

    expect(areTranslationsLoadedForSection('auth', 'vi')).toBe(true);
    expect(areTranslationsLoadedForSection('auth', 'en')).toBe(false);
  });
});

describe('preloadTranslationsForSections (Phase F §114)', () => {
  it('loads multiple sections in parallel and returns a map', async () => {
    fetch.mockImplementation(async (url) => {
      if (url === '/i18n/section-auth/en.json') {
        return {
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => ({ title: 'Auth' }),
        };
      }
      if (url === '/i18n/section-dashboard-global/en.json') {
        return {
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => ({ title: 'Dashboard' }),
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const { preloadTranslationsForSections } = await import(LOADER_PATH);
    const result = await preloadTranslationsForSections(['auth', 'dashboard-global'], 'en');

    expect(result.auth).toEqual({ title: 'Auth' });
    expect(result['dashboard-global']).toEqual({ title: 'Dashboard' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('returns empty map entries when individual section loads fail', async () => {
    fetch.mockRejectedValue(new Error('network down'));
    const { preloadTranslationsForSections } = await import(LOADER_PATH);

    const result = await preloadTranslationsForSections(['auth'], 'en');

    expect(result.auth).toEqual({});
  });
});
