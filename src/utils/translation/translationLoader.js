/**
 * TranslationLoader - Lazy load translations per section with caching
 * 
 * Loads translation files dynamically based on section and locale.
 * Always loads English first as fallback, then user's preferred locale.
 * All operations tracked with global window.performanceTracker.
 */

import { log } from '../common/logHandler.js';
import { logError } from '../common/errorHandler.js';
import { getValueFromCache, setValueWithExpiration, removeCacheKeysByPrefix } from '../common/cacheHandler.js';
import { deepMergePreferChild } from '../common/objectSafety.js';
import { resolveActiveLocale } from './localeManager.js';
import { getI18nInstance } from './i18nInstance.js';

// Cache configuration for translations
const TRANSLATION_CACHE_KEY_PREFIX = 'translation_';
const TRANSLATION_CACHE_TTL = 3600000; // 1 hour

const SECTION_NAME_PATTERN = /^[a-z0-9-]+$/i;

/** In-memory hot cache — scoped per active locale (P-06) */
const MAX_LOADED_TRANSLATIONS_ENTRIES = 32;

/**
 * Allowlist section names before they are embedded in fetch URLs.
 *
 * @param {string} name
 * @returns {string}
 */
function sanitizeSectionName(name) {
  if (typeof name !== 'string' || !SECTION_NAME_PATTERN.test(name)) {
    throw new Error(`Invalid section name: ${name}`);
  }

  return name;
}

// Shared in-flight load promises per section/locale (P-04)
const inFlightPromises = new Map();

// Track loaded translations; `null` value means load failed (see finishTranslationLoad)
const loadedTranslations = new Map();

/**
 * Parse `${section}_${locale}` loading keys. Section names use hyphens only (no underscores).
 *
 * @param {string} loadingKey
 * @returns {{ sectionName: string, localeCode: string }}
 */
function parseLoadingKey(loadingKey) {
  const separatorIndex = loadingKey.lastIndexOf('_');
  if (separatorIndex <= 0) {
    return { sectionName: loadingKey, localeCode: '' };
  }

  return {
    sectionName: loadingKey.slice(0, separatorIndex),
    localeCode: loadingKey.slice(separatorIndex + 1),
  };
}

/**
 * Store an in-memory translation entry and evict stale locale/overflow entries.
 *
 * @param {string} loadingKey
 * @param {object|null} result
 */
function rememberLoadedTranslation(loadingKey, result) {
  const { localeCode: activeLocale } = parseLoadingKey(loadingKey);

  if (activeLocale) {
    for (const key of loadedTranslations.keys()) {
      const { localeCode } = parseLoadingKey(key);
      if (localeCode && localeCode !== activeLocale) {
        loadedTranslations.delete(key);
      }
    }
  }

  loadedTranslations.set(loadingKey, result);

  while (loadedTranslations.size > MAX_LOADED_TRANSLATIONS_ENTRIES) {
    const oldestKey = loadedTranslations.keys().next().value;
    if (!oldestKey || oldestKey === loadingKey) {
      break;
    }
    loadedTranslations.delete(oldestKey);
  }
}

/**
 * Mark a section/locale load complete.
 *
 * @param {string} loadingKey
 * @param {object|null} result - Translation object, or null if the load failed
 */
function finishTranslationLoad(loadingKey, result) {
  rememberLoadedTranslation(loadingKey, result);
}

/**
 * Build the URL for a translation JSON file in the public directory.
 * Translation files are served as static assets from /i18n/section-{name}/{locale}.json
 * 
 * @param {string} sectionName - Section name
 * @param {string} localeCode - Locale code
 * @returns {string} - URL to the translation file
 */
function getTranslationUrl(sectionName, localeCode) {
  const safeSectionName = sanitizeSectionName(sectionName);
  return `/i18n/section-${safeSectionName}/${localeCode}.json`;
}

/**
 * Merge translations into the global i18n instance (if available).
 *
 * @param {string} localeCode - Locale being updated
 * @param {object} messages - Translation messages
 * @returns {void}
 */
function applyTranslationsToI18n(localeCode, messages) {
  if (!messages || Object.keys(messages).length === 0) {
    return;
  }

  const i18nInstance = getI18nInstance();
  if (!i18nInstance) {
    return;
  }

  try {
    const { global } = i18nInstance;

    if (typeof global.mergeLocaleMessage === 'function') {
      global.mergeLocaleMessage(localeCode, messages);
    } else if (typeof global.setLocaleMessage === 'function') {
      const existing = global.getLocaleMessage(localeCode) || {};
      global.setLocaleMessage(localeCode, {
        ...existing,
        ...messages
      });
    }
  } catch (error) {
    logError('translationLoader.js', 'applyTranslationsToI18n', 'Failed to merge translations into i18n', error, {
      localeCode,
      messageCount: Object.keys(messages).length
    });
  }
}

/**
 * Load translations for a specific section and locale
 * Always loads English first, then the requested locale if different
 *
 * @param {string} sectionName - Section to load translations for
 * @param {string} localeCode - Locale code (e.g., 'en', 'vi')
 * @returns {Promise<object>} - Translation object or empty object on failure
 */
export async function loadTranslationsForSection(sectionName, localeCode) {
  log('translationLoader.js', 'loadTranslationsForSection', 'start', 'Loading translations for section', {
    sectionName,
    localeCode
  });

  const targetLocale = localeCode || resolveActiveLocale() || 'en';

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'loadSectionTranslations',
      file: 'translationLoader.js',
      method: 'loadTranslationsForSection',
      flag: 'translation-load',
      purpose: `Load translations for section: ${sectionName}, locale: ${targetLocale}`
    });
  }

  // Create cache key
  const cacheKey = TRANSLATION_CACHE_KEY_PREFIX + sectionName + '_' + targetLocale;

  // Check cache FIRST - avoid unnecessary network requests
  const loadingKey = `${sectionName}_${targetLocale}`;

  const cachedTranslations = getValueFromCache(cacheKey);
  if (cachedTranslations) {
    log('translationLoader.js', 'loadTranslationsForSection', 'cache-hit', 'Translations loaded from cache', {
      sectionName,
      localeCode: targetLocale
    });

    rememberLoadedTranslation(loadingKey, cachedTranslations);

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'translationCacheHit',
        file: 'translationLoader.js',
        method: 'loadTranslationsForSection',
        flag: 'cache-hit',
        purpose: `Translations found in cache for ${sectionName}/${targetLocale}`
      });
    }

    log('translationLoader.js', 'loadTranslationsForSection', 'return', 'Returning cached translations', { keyCount: Object.keys(cachedTranslations).length });
    return cachedTranslations;
  }

  // Check if already loading — await the shared in-flight promise (no polling)
  if (inFlightPromises.has(loadingKey)) {
    log('translationLoader.js', 'loadTranslationsForSection', 'in-progress', 'Translation load already in progress, awaiting shared promise', {
      sectionName,
      localeCode: targetLocale
    });

    const result = await inFlightPromises.get(loadingKey);
    log('translationLoader.js', 'loadTranslationsForSection', 'return', 'Returning translations from concurrent load', { keyCount: Object.keys(result).length });
    return result;
  }

  let resolveLoad;
  const loadPromise = new Promise((resolve) => {
    resolveLoad = resolve;
  });

  inFlightPromises.set(loadingKey, loadPromise);

  (async () => {
    let translations = {};
    try {
      const englishTranslations = await loadTranslationFile(sectionName, 'en');

      if (Object.keys(englishTranslations).length === 0) {
        log('translationLoader.js', 'loadTranslationsForSection', 'error', 'English translation file missing - cannot load translations', {
          sectionName,
          localeCode: targetLocale
        });
        log('translationLoader.js', 'loadTranslationsForSection', 'return', 'Returning empty object due to missing English file', {});

        finishTranslationLoad(loadingKey, null);
        resolveLoad({});
        return;
      }

      applyTranslationsToI18n('en', englishTranslations);

      if (targetLocale === 'en') {
        translations = englishTranslations;

        log('translationLoader.js', 'loadTranslationsForSection', 'english-only', 'Loaded English translations', {
          sectionName,
          keyCount: Object.keys(englishTranslations).length
        });
      } else {
        const localeTranslations = await loadTranslationFile(sectionName, targetLocale);

        if (Object.keys(localeTranslations).length === 0) {
          translations = englishTranslations;

          log('translationLoader.js', 'loadTranslationsForSection', 'fallback-english', 'Locale file missing, using English fallback', {
            sectionName,
            requestedLocale: targetLocale,
            englishKeys: Object.keys(englishTranslations).length
          });
        } else {
          applyTranslationsToI18n(targetLocale, localeTranslations);
          translations = deepMergePreferChild(englishTranslations, localeTranslations);

          log('translationLoader.js', 'loadTranslationsForSection', 'merged', 'Translations loaded and merged', {
            sectionName,
            localeCode: targetLocale,
            englishKeys: Object.keys(englishTranslations).length,
            localeKeys: Object.keys(localeTranslations).length
          });
        }
      }

      finishTranslationLoad(loadingKey, translations);
      setValueWithExpiration(cacheKey, translations, TRANSLATION_CACHE_TTL);

      if (window.performanceTracker) {
        window.performanceTracker.step({
          step: 'translationsLoaded',
          file: 'translationLoader.js',
          method: 'loadTranslationsForSection',
          flag: 'load-complete',
          purpose: `Translations loaded for ${sectionName}/${localeCode}`
        });
      }

      log('translationLoader.js', 'loadTranslationsForSection', 'return', 'Returning loaded translations', {
        sectionName,
        localeCode: targetLocale,
        keyCount: Object.keys(translations).length
      });
      resolveLoad(translations);
    } catch (error) {
      logError('translationLoader.js', 'loadTranslationsForSection', 'Failed to load translations', error, { sectionName, localeCode: targetLocale });
      finishTranslationLoad(loadingKey, null);
      log('translationLoader.js', 'loadTranslationsForSection', 'return', 'Returning empty object after load failure', {
        sectionName,
        localeCode: targetLocale
      });
      resolveLoad({});
    } finally {
      inFlightPromises.delete(loadingKey);
    }
  })();

  return loadPromise;
}

/**
 * Load a single translation file
 * Fetches JSON files directly from the public directory as static assets
 * 
 * @param {string} sectionName - Section name
 * @param {string} localeCode - Locale code
 * @returns {Promise<object>} - Translation object
 */
async function loadTranslationFile(sectionName, localeCode) {
  log('translationLoader.js', 'loadTranslationFile', 'start', 'Loading translation file', {
    sectionName,
    localeCode
  });

  if (typeof sectionName !== 'string' || sectionName.length === 0) {
    log('translationLoader.js', 'loadTranslationFile', 'warn', 'Invalid section name provided, using fallback', {
      sectionName,
      localeCode
    });
    return {};
  }

  if (typeof localeCode !== 'string' || localeCode.length === 0) {
    log('translationLoader.js', 'loadTranslationFile', 'warn', 'Invalid locale code provided, using fallback', {
      sectionName,
      localeCode
    });
    return {};
  }

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'loadTranslationFile',
      file: 'translationLoader.js',
      method: 'loadTranslationFile',
      flag: 'file-load',
      purpose: `Load file: section-${sectionName}/${localeCode}.json`
    });
  }

  try {
    // Get the URL to the JSON file in the public directory
    const jsonUrl = getTranslationUrl(sectionName, localeCode);

    // Single GET per file — validate status and Content-Type on the response
    // SPA servers often return 200 OK with index.html for missing files
    const response = await fetch(jsonUrl);

    if (!response.ok) {
      log('translationLoader.js', 'loadTranslationFile', 'file-missing', 'Translation file not found', {
        sectionName,
        localeCode,
        status: response.status
      });
      log('translationLoader.js', 'loadTranslationFile', 'return', 'Returning empty object due to missing file', {});
      return {};
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      log('translationLoader.js', 'loadTranslationFile', 'file-missing', 'Translation response is not JSON (likely SPA fallback)', {
        sectionName,
        localeCode,
        contentType
      });
      log('translationLoader.js', 'loadTranslationFile', 'return', 'Returning empty object due to non-JSON response', {});
      return {};
    }

    const translations = await response.json();

    log('translationLoader.js', 'loadTranslationFile', 'success', 'Translation file loaded successfully', {
      sectionName,
      localeCode,
      keyCount: Object.keys(translations).length
    });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'translationFileLoaded',
        file: 'translationLoader.js',
        method: 'loadTranslationFile',
        flag: 'file-success',
        purpose: `File loaded: section-${sectionName}/${localeCode}.json`
      });
    }

    log('translationLoader.js', 'loadTranslationFile', 'return', 'Returning loaded translations', { keyCount: Object.keys(translations).length });
    return translations;
  } catch (error) {
    logError('translationLoader.js', 'loadTranslationFile', 'Failed to load translation file', error, {
      sectionName,
      localeCode
    });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'translationFileError',
        file: 'translationLoader.js',
        method: 'loadTranslationFile',
        flag: 'file-error',
        purpose: `Failed to load: section-${sectionName}/${localeCode}.json`
      });
    }

    log('translationLoader.js', 'loadTranslationFile', 'return', 'Returning empty object due to error', {});
    return {};
  }
}

/**
 * Preload translations for multiple sections
 * Loads translations in parallel for better performance
 * 
 * @param {Array<string>} sectionNames - Array of section names
 * @param {string} localeCode - Locale code
 * @returns {Promise<object>} - Map of section name to translations
 */
export async function preloadTranslationsForSections(sectionNames, localeCode) {
  log('translationLoader.js', 'preloadTranslationsForSections', 'start', 'Preloading translations for sections', {
    sectionCount: sectionNames.length,
    sections: sectionNames,
    localeCode
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'preloadBatchTranslations',
      file: 'translationLoader.js',
      method: 'preloadTranslationsForSections',
      flag: 'batch-preload',
      purpose: `Preload translations for ${sectionNames.length} sections`
    });
  }

  // Load all sections in parallel
  const loadPromises = sectionNames.map(sectionName =>
    loadTranslationsForSection(sectionName, localeCode)
      .then(translations => ({ sectionName, translations, success: true }))
      .catch(error => {
        logError('translationLoader.js', 'preloadTranslationsForSections', 'Section translation load failed', error, { sectionName });
        return { sectionName, translations: {}, success: false, error };
      })
  );

  // Wait for all loads to complete
  const results = await Promise.all(loadPromises);

  // Build result map
  const translationsMap = {};
  results.forEach(result => {
    translationsMap[result.sectionName] = result.translations;
  });

  // Count successes
  const successCount = results.filter(r => r.success).length;

  log('translationLoader.js', 'preloadTranslationsForSections', 'info', 'Batch translation preload completed', {
    totalSections: sectionNames.length,
    successful: successCount,
    failed: sectionNames.length - successCount
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'batchTranslationsLoaded',
      file: 'translationLoader.js',
      method: 'preloadTranslationsForSections',
      flag: 'batch-complete',
      purpose: `Loaded ${successCount}/${sectionNames.length} section translations`
    });
  }

  log('translationLoader.js', 'preloadTranslationsForSections', 'return', 'Returning translations map', { sectionCount: Object.keys(translationsMap).length });
  return translationsMap;
}

/**
 * Check if translations are loaded for a section
 * 
 * @param {string} sectionName - Section name
 * @param {string} localeCode - Locale code
 * @returns {boolean} - True if translations are loaded
 */
export function areTranslationsLoadedForSection(sectionName, localeCode) {
  const loadingKey = `${sectionName}_${localeCode}`;
  const cacheKey = TRANSLATION_CACHE_KEY_PREFIX + sectionName + '_' + localeCode;
  const inMemory = loadedTranslations.get(loadingKey);
  const loaded =
    (inMemory !== undefined && inMemory !== null) || getValueFromCache(cacheKey) != null;
  log('translationLoader.js', 'areTranslationsLoadedForSection', 'return', 'Returning loaded status', { sectionName, localeCode, loaded });
  return loaded;
}

/**
 * Clear all translation caches
 * Useful for development or language switching
 * 
 * @returns {void}
 */
export function clearTranslationCaches() {
  log('translationLoader.js', 'clearTranslationCaches', 'start', 'Clearing all translation caches', {});

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'clearTranslationCache',
      file: 'translationLoader.js',
      method: 'clearTranslationCaches',
      flag: 'cache-clear',
      purpose: 'Clear all translation caches'
    });
  }

  // Clear in-memory Map
  const mapCount = loadedTranslations.size;
  loadedTranslations.clear();
  inFlightPromises.clear();

  // Clear TTL cache entries for translations only (preserve other cacheHandler keys)
  const removedCacheCount = removeCacheKeysByPrefix(TRANSLATION_CACHE_KEY_PREFIX);

  log('translationLoader.js', 'clearTranslationCaches', 'success', 'Translation caches cleared', {
    mapCount,
    removedCacheCount,
    note: 'loadedTranslations Map cleared; cacheHandler translation_* keys removed only'
  });
  log('translationLoader.js', 'clearTranslationCaches', 'return', 'Cache clear complete', {});
}

/**
 * Get translation loading statistics
 * 
 * @returns {object} - Statistics about loaded translations
 */
export function getTranslationStatistics() {
  const stats = {
    loadedCount: loadedTranslations.size,
    loadedSections: Array.from(loadedTranslations.keys()),
    loadingInProgress: Array.from(inFlightPromises.keys())
  };

  log('translationLoader.js', 'getTranslationStatistics', 'return', 'Returning translation statistics', stats);
  return stats;
}
