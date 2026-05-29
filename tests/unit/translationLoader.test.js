import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const LOADER_PATH = '../../src/utils/translation/translationLoader.js';

vi.mock('../../src/utils/common/cacheHandler.js', () => ({
  getValueFromCache: vi.fn(() => null),
  setValueWithExpiration: vi.fn(),
  removeCacheKeysByPrefix: vi.fn(() => 0),
}));

vi.mock('../../src/utils/translation/localeManager.js', () => ({
  resolveActiveLocale: vi.fn(() => 'en')
}));

vi.mock('../../src/utils/translation/i18nInstance.js', () => ({
  getI18nInstance: vi.fn(() => null)
}));

function mockTranslationFetch(translations = { hello: 'Hello' }) {
  fetch.mockImplementation(async (url) => {
    if (typeof url === 'string' && url.startsWith('/i18n/section-')) {
      return {
        ok: true,
        headers: {
          get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null)
        },
        json: async () => translations
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

describe('translationLoader section name validation (S-04)', () => {
  it('loads translations for allowlisted section names', async () => {
    mockTranslationFetch({ title: 'Auth' });

    const { loadTranslationsForSection } = await import(LOADER_PATH);

    const result = await loadTranslationsForSection('dashboard-global', 'en');

    expect(result).toEqual({ title: 'Auth' });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/i18n/section-dashboard-global/en.json');
  });

  it('rejects traversal-like section names without fetching', async () => {
    const { loadTranslationsForSection } = await import(LOADER_PATH);

    const result = await loadTranslationsForSection('../../api/admin', 'en');

    expect(result).toEqual({});
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects section names with path separators or spaces', async () => {
    const { loadTranslationsForSection } = await import(LOADER_PATH);

    await expect(loadTranslationsForSection('auth/extra', 'en')).resolves.toEqual({});
    await expect(loadTranslationsForSection('auth extra', 'en')).resolves.toEqual({});

    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('translationLoader locale merge (L-02)', () => {
  it('deep-merges nested English keys into cached return value for non-English locales', async () => {
    const english = {
      auth: {
        login: {
          title: 'Login',
          subtitle: 'Welcome back',
          button: 'Sign in'
        }
      }
    };
    const vietnamese = {
      auth: {
        login: {
          title: 'Đăng nhập'
        }
      }
    };

    fetch.mockImplementation(async (url) => {
      if (url === '/i18n/section-auth/en.json') {
        return {
          ok: true,
          headers: {
            get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null)
          },
          json: async () => english
        };
      }
      if (url === '/i18n/section-auth/vi.json') {
        return {
          ok: true,
          headers: {
            get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null)
          },
          json: async () => vietnamese
        };
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    const { loadTranslationsForSection } = await import(LOADER_PATH);
    const result = await loadTranslationsForSection('auth', 'vi');

    expect(result.auth.login.title).toBe('Đăng nhập');
    expect(result.auth.login.subtitle).toBe('Welcome back');
    expect(result.auth.login.button).toBe('Sign in');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe('translationLoader loaded-state (L-03 browser test helper)', () => {
  it('areTranslationsLoadedForSection is true after a successful load', async () => {
    mockTranslationFetch({ title: 'Đăng nhập' });

    const { loadTranslationsForSection, areTranslationsLoadedForSection } =
      await import(LOADER_PATH);

    await loadTranslationsForSection('auth', 'vi');

    expect(areTranslationsLoadedForSection('auth', 'vi')).toBe(true);
  });
});

describe('translationLoader concurrent wait (L-07)', () => {
  it('waiter receives empty object when lead load fails (null sentinel)', async () => {
    fetch.mockImplementation(async (url) => {
      if (url === '/i18n/section-auth/en.json') {
        return {
          ok: false,
          headers: { get: () => null }
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const { loadTranslationsForSection } = await import(LOADER_PATH);

    const [first, second] = await Promise.all([
      loadTranslationsForSection('auth', 'vi'),
      loadTranslationsForSection('auth', 'vi')
    ]);

    expect(first).toEqual({});
    expect(second).toEqual({});
  });
});

describe('translationLoader single GET per file (P-01)', () => {
  it('issues one GET per locale file on cold load (no HEAD)', async () => {
    mockTranslationFetch({ title: 'Auth' });

    const { loadTranslationsForSection } = await import(LOADER_PATH);

    await loadTranslationsForSection('auth', 'vi');

    const calls = fetch.mock.calls.map(([url, options]) => ({
      url,
      method: options?.method || 'GET'
    }));

    expect(calls).toEqual([
      { url: '/i18n/section-auth/en.json', method: 'GET' },
      { url: '/i18n/section-auth/vi.json', method: 'GET' }
    ]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('returns empty object when GET response is not JSON (SPA fallback)', async () => {
    fetch.mockImplementation(async (url) => {
      if (url === '/i18n/section-auth/en.json') {
        return {
          ok: true,
          headers: { get: () => 'text/html' },
          json: async () => ({ should: 'not parse html as json' })
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const { loadTranslationsForSection } = await import(LOADER_PATH);
    const result = await loadTranslationsForSection('auth', 'en');

    expect(result).toEqual({});
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('translationLoader in-flight promise (P-04)', () => {
  it('concurrent waiters share one in-flight promise without polling', async () => {
    let releaseFetch;
    const fetchGate = new Promise((resolve) => {
      releaseFetch = resolve;
    });
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

    fetch.mockImplementation(async (url) => {
      if (url === '/i18n/section-auth/en.json') {
        await fetchGate;
        return {
          ok: true,
          headers: {
            get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null)
          },
          json: async () => ({ title: 'Auth' })
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const { loadTranslationsForSection } = await import(LOADER_PATH);

    const first = loadTranslationsForSection('auth', 'en');
    const second = loadTranslationsForSection('auth', 'en');

    const pollCalls = setTimeoutSpy.mock.calls.filter(([, delay]) => delay === 100);
    expect(pollCalls).toHaveLength(0);
    expect(fetch).toHaveBeenCalledTimes(1);

    releaseFetch();

    await expect(Promise.all([first, second])).resolves.toEqual([
      { title: 'Auth' },
      { title: 'Auth' }
    ]);

    setTimeoutSpy.mockRestore();
  });
});

describe('translationLoader cache clear (P-03)', () => {
  it('clearTranslationCaches removes only translation_ prefixed cache keys', async () => {
    const { removeCacheKeysByPrefix } = await import('../../src/utils/common/cacheHandler.js');
    const { clearTranslationCaches } = await import(LOADER_PATH);

    clearTranslationCaches();

    expect(removeCacheKeysByPrefix).toHaveBeenCalledTimes(1);
    expect(removeCacheKeysByPrefix).toHaveBeenCalledWith('translation_');
  });
});

describe('translationLoader in-memory scope (P-06)', () => {
  it('evicts other locales from loadedTranslations when a new locale is stored', async () => {
    mockTranslationFetch({ title: 'Auth' });

    const { loadTranslationsForSection, getTranslationStatistics } =
      await import(LOADER_PATH);

    await loadTranslationsForSection('auth', 'vi');
    expect(getTranslationStatistics().loadedSections).toContain('auth_vi');

    await loadTranslationsForSection('auth', 'fr');
    const stats = getTranslationStatistics();

    expect(stats.loadedSections).toContain('auth_fr');
    expect(stats.loadedSections).not.toContain('auth_vi');
  });

  it('keeps multiple sections for the same active locale', async () => {
    fetch.mockImplementation(async (url) => {
      if (typeof url === 'string' && url.startsWith('/i18n/section-')) {
        return {
          ok: true,
          headers: {
            get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null)
          },
          json: async () => ({ title: String(url) })
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const { loadTranslationsForSection, getTranslationStatistics } =
      await import(LOADER_PATH);

    await loadTranslationsForSection('auth', 'vi');
    await loadTranslationsForSection('shop', 'vi');

    const sections = getTranslationStatistics().loadedSections;
    expect(sections).toContain('auth_vi');
    expect(sections).toContain('shop_vi');
  });
});

describe('translationLoader base bundle (B-05)', () => {
  it('loads /i18n/base/en.json and merges locale override for non-English', async () => {
    fetch.mockImplementation(async (url) => {
      if (url === '/i18n/base/en.json') {
        return {
          ok: true,
          headers: {
            get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null)
          },
          json: async () => ({
            ui: { languageSelector: 'Language selector', language: 'Language' }
          })
        };
      }
      if (url === '/i18n/base/vi.json') {
        return {
          ok: true,
          headers: {
            get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null)
          },
          json: async () => ({
            ui: { languageSelector: 'Bộ chọn ngôn ngữ', language: 'Ngôn ngữ' }
          })
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const { loadBaseTranslations } = await import(LOADER_PATH);
    const merged = await loadBaseTranslations('vi');

    expect(fetch).toHaveBeenCalledWith('/i18n/base/en.json');
    expect(fetch).toHaveBeenCalledWith('/i18n/base/vi.json');
    expect(merged.ui.languageSelector).toBe('Bộ chọn ngôn ngữ');
    expect(merged.ui.language).toBe('Ngôn ngữ');
  });
});

describe('applyTranslationsToI18n setLocaleMessage fallback (B-06)', () => {
  it('deep-merges nested keys when mergeLocaleMessage is unavailable', async () => {
    const localeMessages = {
      en: {
        auth: {
          login: {
            title: 'Login',
            subtitle: 'Welcome',
            button: 'Go',
          },
        },
      },
    };
    const setLocaleMessage = vi.fn((code, messages) => {
      localeMessages[code] = messages;
    });

    const { getI18nInstance } = await import('../../src/utils/translation/i18nInstance.js');
    getI18nInstance.mockReturnValue({
      global: {
        getLocaleMessage: (code) => localeMessages[code] || {},
        setLocaleMessage,
      },
    });

    fetch.mockImplementation(async (url) => {
      if (url === '/i18n/section-auth/en.json') {
        return {
          ok: true,
          headers: {
            get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
          },
          json: async () => ({
            auth: {
              login: {
                title: 'Welcome Back',
              },
            },
          }),
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const { loadTranslationsForSection } = await import(LOADER_PATH);
    await loadTranslationsForSection('auth', 'en');

    expect(setLocaleMessage).toHaveBeenCalled();
    const merged = setLocaleMessage.mock.calls.at(-1)[1];
    expect(merged.auth.login.title).toBe('Welcome Back');
    expect(merged.auth.login.subtitle).toBe('Welcome');
    expect(merged.auth.login.button).toBe('Go');
  });
});
