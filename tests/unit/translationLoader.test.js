import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const LOADER_PATH = '../../src/utils/translation/translationLoader.js';

vi.mock('../../src/utils/common/cacheHandler.js', () => ({
  getValueFromCache: vi.fn(() => null),
  setValueWithExpiration: vi.fn(),
  clearAllCache: vi.fn()
}));

vi.mock('../../src/utils/translation/localeManager.js', () => ({
  resolveActiveLocale: vi.fn(() => 'en')
}));

vi.mock('../../src/utils/translation/i18nInstance.js', () => ({
  getI18nInstance: vi.fn(() => null)
}));

function mockTranslationFetch(translations = { hello: 'Hello' }) {
  fetch.mockImplementation(async (url, options = {}) => {
    if (options.method === 'HEAD') {
      return {
        ok: true,
        headers: {
          get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null)
        }
      };
    }

    if (typeof url === 'string' && url.startsWith('/i18n/section-')) {
      return {
        ok: true,
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
    expect(fetch).toHaveBeenCalledWith('/i18n/section-dashboard-global/en.json', { method: 'HEAD' });
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

    fetch.mockImplementation(async (url, options = {}) => {
      if (options.method === 'HEAD') {
        return {
          ok: true,
          headers: {
            get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null)
          }
        };
      }

      if (url === '/i18n/section-auth/en.json') {
        return { ok: true, json: async () => english };
      }
      if (url === '/i18n/section-auth/vi.json') {
        return { ok: true, json: async () => vietnamese };
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    const { loadTranslationsForSection } = await import(LOADER_PATH);
    const result = await loadTranslationsForSection('auth', 'vi');

    expect(result.auth.login.title).toBe('Đăng nhập');
    expect(result.auth.login.subtitle).toBe('Welcome back');
    expect(result.auth.login.button).toBe('Sign in');
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
    fetch.mockImplementation(async (url, options = {}) => {
      if (options.method === 'HEAD') {
        return {
          ok: false,
          headers: { get: () => null }
        };
      }
      throw new Error(`Unexpected GET: ${url}`);
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
