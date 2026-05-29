/**
 * Inject `<link rel="alternate" hreflang="…">` tags for SEO (B-08).
 */

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  stripLeadingLocaleFromPath,
  toIntlLocaleTag,
} from './localeManager.js';

const HREFLANG_LINK_MARKER = 'data-app-hreflang';

/**
 * Build a locale-prefixed pathname (en stays unprefixed).
 *
 * @param {string} pathname
 * @param {string} localeCode
 * @param {string} [defaultLocale=DEFAULT_LOCALE]
 * @returns {string}
 */
export function buildLocalePrefixedPath(
  pathname,
  localeCode,
  defaultLocale = DEFAULT_LOCALE
) {
  const basePath = stripLeadingLocaleFromPath(pathname || '/') || '/';

  if (!localeCode || localeCode === defaultLocale) {
    return basePath;
  }

  if (basePath === '/') {
    return `/${localeCode}`;
  }

  return `/${localeCode}${basePath}`;
}

/**
 * Build alternate URLs for all supported locales plus x-default.
 *
 * @param {string} pathname
 * @param {object} [options]
 * @param {string} [options.origin]
 * @param {string[]} [options.supportedLocales]
 * @param {string} [options.defaultLocale]
 * @returns {Array<{ hreflang: string, href: string }>}
 */
export function buildHreflangAlternateUrls(pathname, options = {}) {
  const {
    origin = typeof window !== 'undefined' ? window.location.origin : '',
    supportedLocales = SUPPORTED_LOCALES,
    defaultLocale = DEFAULT_LOCALE,
  } = options;

  const alternates = supportedLocales.map((localeCode) => ({
    hreflang: toIntlLocaleTag(localeCode),
    href: `${origin}${buildLocalePrefixedPath(pathname, localeCode, defaultLocale)}`,
  }));

  alternates.push({
    hreflang: 'x-default',
    href: `${origin}${buildLocalePrefixedPath(pathname, defaultLocale, defaultLocale)}`,
  });

  return alternates;
}

/**
 * Remove hreflang link tags previously injected by this module.
 *
 * @returns {void}
 */
export function clearHreflangTags() {
  if (typeof document === 'undefined') {
    return;
  }

  document
    .querySelectorAll(`link[rel="alternate"][${HREFLANG_LINK_MARKER}]`)
    .forEach((node) => node.remove());
}

/**
 * Sync hreflang `<link>` tags for a route pathname.
 *
 * @param {string} pathname
 * @param {object} [options]
 * @param {boolean} [options.enabled=true] - When false, clears tags only
 * @param {string} [options.origin]
 * @returns {void}
 */
export function syncHreflangTagsForPath(pathname, options = {}) {
  if (typeof document === 'undefined') {
    return;
  }

  clearHreflangTags();

  const { enabled = true, origin } = options;
  if (!enabled || typeof pathname !== 'string' || pathname.length === 0) {
    return;
  }

  const alternates = buildHreflangAlternateUrls(pathname, { origin });
  const head = document.head;
  if (!head) {
    return;
  }

  for (const alternate of alternates) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', alternate.hreflang);
    link.setAttribute('href', alternate.href);
    link.setAttribute(HREFLANG_LINK_MARKER, 'true');
    head.appendChild(link);
  }
}
