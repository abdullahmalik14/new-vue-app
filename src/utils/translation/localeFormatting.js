/**
 * Locale-aware number, currency, and date formatting (B-07).
 * Prefer vue-i18n n()/d(); fall back to Intl for unconfigured locales.
 */

import { getI18nInstance } from './i18nInstance.js';
import { getActiveLocale, toIntlLocaleTag } from './localeManager.js';

/**
 * @param {unknown} value
 * @returns {number}
 */
function coerceNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

/**
 * @param {unknown} value
 * @returns {Date}
 */
function coerceDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * @param {string} [localeCode]
 * @returns {string}
 */
function resolveFormatLocale(localeCode) {
  if (typeof localeCode === 'string' && localeCode.length > 0) {
    return localeCode;
  }

  return getActiveLocale() || 'en';
}

/**
 * Format a number for the active (or given) locale.
 *
 * @param {number|string} value
 * @param {object} [options]
 * @param {string} [options.localeCode]
 * @param {'decimal'|'currency'|'percent'} [options.format='decimal']
 * @param {string} [options.currency='USD']
 * @returns {string}
 */
export function formatLocaleNumber(value, options = {}) {
  const {
    localeCode,
    format = 'decimal',
    currency = 'USD',
  } = options;
  const locale = resolveFormatLocale(localeCode);
  const numeric = coerceNumber(value);
  const i18n = getI18nInstance();

  if (i18n?.global?.n) {
    try {
      if (format === 'currency') {
        return i18n.global.n(numeric, { key: 'currency', currency }, locale);
      }
      return i18n.global.n(numeric, format, locale);
    } catch {
      // Fall through to Intl
    }
  }

  const intlTag = toIntlLocaleTag(locale);
  const intlOptions =
    format === 'currency'
      ? { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }
      : format === 'percent'
        ? { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 }
        : { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 };

  return new Intl.NumberFormat(intlTag, intlOptions).format(numeric);
}

/**
 * Format currency using locale conventions.
 *
 * @param {number|string} value
 * @param {object} [options]
 * @param {string} [options.localeCode]
 * @param {string} [options.currency='USD']
 * @returns {string}
 */
export function formatLocaleCurrency(value, options = {}) {
  const { localeCode, currency = 'USD' } = options;
  return formatLocaleNumber(value, { localeCode, format: 'currency', currency });
}

/**
 * Format a date/time for the active (or given) locale.
 *
 * @param {Date|string|number} value
 * @param {object} [options]
 * @param {string} [options.localeCode]
 * @param {'short'|'long'} [options.format='short']
 * @returns {string}
 */
export function formatLocaleDate(value, options = {}) {
  const { localeCode, format = 'short' } = options;
  const locale = resolveFormatLocale(localeCode);
  const date = coerceDate(value);
  const i18n = getI18nInstance();

  if (i18n?.global?.d) {
    try {
      return i18n.global.d(date, format, locale);
    } catch {
      // Fall through to Intl
    }
  }

  const intlTag = toIntlLocaleTag(locale);
  const intlOptions =
    format === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }
      : { year: 'numeric', month: 'short', day: 'numeric' };

  return new Intl.DateTimeFormat(intlTag, intlOptions).format(date);
}
