/**
 * Translation Utilities - Central export file
 * 
 * Exports all translation-related utilities:
 * - Translation loading with section-based lazy loading
 * - Locale management and resolution
 */

// Export translation loader functions
export {
  loadTranslationsForSection,
  loadBaseTranslations,
  preloadTranslationsForSections,
  areTranslationsLoadedForSection,
  clearTranslationCaches,
  getTranslationStatistics
} from './translationLoader.js';

// Export locale manager functions and constants
export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  resolveActiveLocale,
  setActiveLocale,
  getActiveLocale,
  getSupportedLocales,
  isLocaleSupported,
  getDefaultLocale,
  getLocaleDisplayName,
  getLocaleSwitcherOptions,
  switchToLocale,
  resetLocaleToDefault,
  getLocalePreferenceOrder
} from './localeManager.js';

export {
  formatLocaleNumber,
  formatLocaleCurrency,
  formatLocaleDate,
} from './localeFormatting.js';

export {
  I18N_NUMBER_FORMATS,
  I18N_DATETIME_FORMATS,
} from './localeFormatConfig.js';

export {
  buildLocalePrefixedPath,
  buildHreflangAlternateUrls,
  syncHreflangTagsForPath,
  clearHreflangTags,
} from './hreflangTags.js';

