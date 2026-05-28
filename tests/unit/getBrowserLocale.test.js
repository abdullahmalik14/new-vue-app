import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const LOCALE_MANAGER_PATH = '../../src/utils/translation/localeManager.js';

vi.mock('../../src/stores/useLocaleStore.js', () => ({
  useLocaleStore: vi.fn(() => ({ locale: null })),
}));

function mockBrowserLanguage(language) {
  vi.stubGlobal('navigator', { language, userLanguage: language });
}

function mockPathname(pathname) {
  vi.stubGlobal('location', { ...window.location, pathname });
}

let resolveActiveLocale;

beforeAll(async () => {
  ({ resolveActiveLocale } = await import(LOCALE_MANAGER_PATH));
}, 20000);

beforeEach(() => {
  vi.clearAllMocks();
  window.performanceTracker = { step: vi.fn() };
  mockPathname('/');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getBrowserLocale regional variants (L-05)', () => {
  it('prefers full regional code when supported (zh-TW → zh-tw)', () => {
    mockBrowserLanguage('zh-TW');
    expect(resolveActiveLocale()).toBe('zh-tw');
  });

  it('prefers full regional code when supported (pt-PT → pt-pt)', () => {
    mockBrowserLanguage('pt-PT');
    expect(resolveActiveLocale()).toBe('pt-pt');
  });

  it('normalizes underscore separators (fr_CA → fr-ca)', () => {
    mockBrowserLanguage('fr_CA');
    expect(resolveActiveLocale()).toBe('fr-ca');
  });

  it('falls back to base code when regional variant is unsupported', () => {
    mockBrowserLanguage('en-US');
    expect(resolveActiveLocale()).toBe('en');
  });
});
