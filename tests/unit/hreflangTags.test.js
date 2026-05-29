import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
} from '../../src/utils/translation/localeManager.js';
import {
  buildLocalePrefixedPath,
  buildHreflangAlternateUrls,
  syncHreflangTagsForPath,
  clearHreflangTags,
} from '../../src/utils/translation/hreflangTags.js';

describe('hreflangTags (B-08)', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  afterEach(() => {
    clearHreflangTags();
  });

  it('buildLocalePrefixedPath keeps en unprefixed and prefixes other locales', () => {
    expect(buildLocalePrefixedPath('/log-in', 'en')).toBe('/log-in');
    expect(buildLocalePrefixedPath('/log-in', 'vi')).toBe('/vi/log-in');
    expect(buildLocalePrefixedPath('/vi/log-in', 'en')).toBe('/log-in');
    expect(buildLocalePrefixedPath('/', 'vi')).toBe('/vi');
  });

  it('buildHreflangAlternateUrls includes all locales and x-default', () => {
    const alternates = buildHreflangAlternateUrls('/dashboard', {
      origin: 'https://example.com',
      supportedLocales: ['en', 'vi'],
      defaultLocale: DEFAULT_LOCALE,
    });

    expect(alternates).toHaveLength(3);
    expect(alternates.find((a) => a.hreflang === 'vi')?.href).toBe(
      'https://example.com/vi/dashboard'
    );
    expect(alternates.find((a) => a.hreflang === 'x-default')?.href).toBe(
      'https://example.com/dashboard'
    );
  });

  it('buildHreflangAlternateUrls covers full supported locale list', () => {
    const alternates = buildHreflangAlternateUrls('/shop', {
      origin: 'https://example.com',
    });

    expect(alternates).toHaveLength(SUPPORTED_LOCALES.length + 1);
    expect(alternates.some((a) => a.hreflang === 'x-default')).toBe(true);
  });

  it('syncHreflangTagsForPath injects link tags and clearHreflangTags removes them', () => {
    syncHreflangTagsForPath('/log-in', {
      origin: 'https://example.com',
      enabled: true,
    });

    const links = document.querySelectorAll('link[rel="alternate"][data-app-hreflang]');
    expect(links.length).toBe(SUPPORTED_LOCALES.length + 1);

    const viLink = Array.from(links).find((link) => link.getAttribute('hreflang') === 'vi');
    expect(viLink?.getAttribute('href')).toBe('https://example.com/vi/log-in');

    clearHreflangTags();
    expect(document.querySelectorAll('link[rel="alternate"][data-app-hreflang]').length).toBe(0);
  });

  it('syncHreflangTagsForPath clears tags when disabled', () => {
    syncHreflangTagsForPath('/log-in', { origin: 'https://example.com', enabled: true });
    expect(document.querySelectorAll('link[rel="alternate"][data-app-hreflang]').length).toBeGreaterThan(0);

    syncHreflangTagsForPath('/log-in', { enabled: false });
    expect(document.querySelectorAll('link[rel="alternate"][data-app-hreflang]').length).toBe(0);
  });
});
