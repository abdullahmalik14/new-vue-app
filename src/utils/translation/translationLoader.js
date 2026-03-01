/**
 * TranslationLoader - Lazy load translations per section with caching
 * 
 * Loads translation files dynamically based on section and locale.
 * Always loads English first as fallback, then user's preferred locale.
 * All operations tracked with global window.performanceTracker.
 */

import { log } from '../common/logHandler.js';
import { logError } from '../common/errorHandler.js';
import { getValueFromCache, setValueWithExpiration, clearAllCache } from '../common/cacheHandler.js';
import { resolveActiveLocale } from './localeManager.js';
import { getI18nInstance } from './i18nInstance.js';

// Cache configuration for translations
const TRANSLATION_CACHE_KEY_PREFIX = 'translation_';
const TRANSLATION_CACHE_TTL = 3600000; // 1 hour

// Track which translations are currently loading to prevent duplicates
const translationsLoadingInProgress = new Set();

// Track loaded translations
const loadedTranslations = new Map();

/**
 * Build the URL for a translation JSON file in the public directory.
 * Translation files are served as static assets from /i18n/section-{name}/{locale}.json
 * 
 * @param {string} sectionName - Section name
 * @param {string} localeCode - Locale code
 * @returns {string} - URL to the translation file
 */
function getTranslationUrl(sectionName, localeCode) {
  return `/i18n/section-${sectionName}/${localeCode}.json`;
}

/**
 * Validate that a translation file exists before attempting to load it
 * This prevents runtime fetch errors for missing translation files
 *
 * @param {string} sectionName - Section name
 * @param {string} localeCode - Locale code
 * @returns {Promise<boolean>} - True if file exists, false otherwise
 */
async function validateTranslationFileExists(sectionName, localeCode) {
  log('translationLoader.js', 'validateTranslationFileExists', 'start', 'Validating translation file existence', { sectionName, localeCode });

  try {
    const url = getTranslationUrl(sectionName, localeCode);
    const response = await fetch(url, { method: 'HEAD' });

    // Check both response status AND content-type header
    // SPA servers often return 200 OK with index.html for missing files
    // We need to ensure we're getting JSON, not HTML
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const exists = response.ok && isJson;

    if (exists) {
      log('translationLoader.js', 'validateTranslationFileExists', 'success', 'Translation file exists', {
        sectionName,
        localeCode,
        contentType
      });
    } else {
      log('translationLoader.js', 'validateTranslationFileExists', 'file-missing', 'Translation file does not exist', {
        sectionName,
        localeCode,
        status: response.status,
        contentType,
        reason: !response.ok ? 'Bad status' : 'Content-Type is not JSON'
      });
    }

    log('translationLoader.js', 'validateTranslationFileExists', 'return', 'Returning file exists status', { exists });
    return exists;
  } catch (error) {
    log('translationLoader.js', 'validateTranslationFileExists', 'error', 'Error checking translation file existence', {
      sectionName,
      localeCode,
      error: error.message
    });
    log('translationLoader.js', 'validateTranslationFileExists', 'return', 'Returning file missing status due to error', { exists: false });
    return false;
  }
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
 * Validates file existence before attempting to load
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

  // Check cache FIRST - avoid unnecessary validation requests
  const cachedTranslations = getValueFromCache(cacheKey);
  if (cachedTranslations) {
    log('translationLoader.js', 'loadTranslationsForSection', 'cache-hit', 'Translations loaded from cache', {
      sectionName,
      localeCode: targetLocale
    });

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

  // Check if already loading this translation - avoid duplicate requests
  const loadingKey = `${sectionName}_${targetLocale}`;
  if (translationsLoadingInProgress.has(loadingKey)) {
    log('translationLoader.js', 'loadTranslationsForSection', 'in-progress', 'Translation load already in progress, waiting', {
      sectionName,
      localeCode: targetLocale
    });

    // Wait for existing load to complete
    const result = await waitForTranslationLoad(loadingKey);
    log('translationLoader.js', 'loadTranslationsForSection', 'return', 'Returning translations from concurrent load', { keyCount: Object.keys(result).length });
    return result;
  }

  // Mark as loading IMMEDIATELY to prevent race conditions
  // This must happen BEFORE any async operations (validation, loading)
  translationsLoadingInProgress.add(loadingKey);

  // Load translations with proper cleanup on error
  let translations = {};
  try {
    // Validate that translation files exist before attempting to load
    const englishExists = await validateTranslationFileExists(sectionName, 'en');
    const localeExists = targetLocale === 'en' ? true : await validateTranslationFileExists(sectionName, targetLocale);

    if (!englishExists) {
      log('translationLoader.js', 'loadTranslationsForSection', 'error', 'English translation file missing - cannot load translations', {
        sectionName,
        localeCode: targetLocale
      });
      log('translationLoader.js', 'loadTranslationsForSection', 'return', 'Returning empty object due to missing English file', {});

      // Remove from loading set before returning
      translationsLoadingInProgress.delete(loadingKey);
      return {};
    }

    if (!localeExists) {
      log('translationLoader.js', 'loadTranslationsForSection', 'warn', 'Requested locale translation file missing, will use English only', {
        sectionName,
        localeCode: targetLocale
      });
    }

    // Load translations based on what exists
    // If requesting English, load only English
    if (targetLocale === 'en') {
      const englishTranslations = await loadTranslationFile(sectionName, 'en');
      applyTranslationsToI18n('en', englishTranslations);
      translations = englishTranslations;

      log('translationLoader.js', 'loadTranslationsForSection', 'english-only', 'Loaded English translations', {
        sectionName,
        keyCount: Object.keys(englishTranslations).length
      });
    } else if (localeExists) {
      // For non-English: Load English first as fallback, then locale
      const englishTranslations = await loadTranslationFile(sectionName, 'en');
      applyTranslationsToI18n('en', englishTranslations);

      const localeTranslations = await loadTranslationFile(sectionName, targetLocale);
      applyTranslationsToI18n(targetLocale, localeTranslations);

      // Merge English (base) with locale (override)
      translations = {
        ...englishTranslations,
        ...localeTranslations
      };

      log('translationLoader.js', 'loadTranslationsForSection', 'merged', 'Translations loaded and merged', {
        sectionName,
        localeCode: targetLocale,
        englishKeys: Object.keys(englishTranslations).length,
        localeKeys: Object.keys(localeTranslations).length
      });
    } else {
      // Locale file missing, fall back to English only
      const englishTranslations = await loadTranslationFile(sectionName, 'en');
      applyTranslationsToI18n('en', englishTranslations);
      translations = englishTranslations;

      log('translationLoader.js', 'loadTranslationsForSection', 'fallback-english', 'Locale file missing, using English fallback', {
        sectionName,
        requestedLocale: targetLocale,
        englishKeys: Object.keys(englishTranslations).length
      });
    }
  } catch (error) {
    logError('translationLoader.js', 'loadTranslationsForSection', 'Failed to load translations', error, { sectionName, localeCode: targetLocale });
    translations = {}; // Return empty object on error
  }

  // Remove from loading set
  translationsLoadingInProgress.delete(loadingKey);

  // Cache the loaded translations
  setValueWithExpiration(cacheKey, translations, TRANSLATION_CACHE_TTL);

  // Store in memory map
  loadedTranslations.set(loadingKey, translations);

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
  return translations;
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

    // Fetch the JSON file directly as a static asset
    const response = await fetch(jsonUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch translation: ${response.status} ${response.statusText}`);
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
 * Wait for an in-progress translation load to complete
 * 
 * @param {string} loadingKey - Key of translation being loaded
 * @returns {Promise<object>} - Loaded translations
 */
async function waitForTranslationLoad(loadingKey) {
  log('translationLoader.js', 'waitForTranslationLoad', 'start', 'Waiting for translation load', { loadingKey });

  // Poll until translation is loaded or timeout
  const maxWaitTime = 5000; // 5 seconds
  const pollInterval = 100; // 100ms
  let waitedTime = 0;

  while (waitedTime < maxWaitTime) {
    // Check if translation is now loaded
    if (loadedTranslations.has(loadingKey)) {
      const result = loadedTranslations.get(loadingKey);
      log('translationLoader.js', 'waitForTranslationLoad', 'return', 'Returning loaded translation', { loadingKey });
      return result;
    }

    // Check if loading has finished (even if failed)
    if (!translationsLoadingInProgress.has(loadingKey)) {
      log('translationLoader.js', 'waitForTranslationLoad', 'warn', 'Loading finished but not in map', { loadingKey });
      log('translationLoader.js', 'waitForTranslationLoad', 'return', 'Returning empty object', {});
      return {};
    }

    // Wait before checking again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    waitedTime += pollInterval;
  }

  // Timeout - return empty object
  log('translationLoader.js', 'waitForTranslationLoad', 'warn', 'Translation load timeout', { loadingKey, waitedTime });
  log('translationLoader.js', 'waitForTranslationLoad', 'return', 'Returning empty object due to timeout', {});
  return {};
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
  const loaded = loadedTranslations.has(loadingKey);
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

  // Also clear cacheHandler (which has TTL-based caching)
  clearAllCache();

  log('translationLoader.js', 'clearTranslationCaches', 'success', 'Translation caches cleared', {
    mapCount,
    note: 'Both loadedTranslations Map and cacheHandler cleared'
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
    loadingInProgress: Array.from(translationsLoadingInProgress)
  };

  log('translationLoader.js', 'getTranslationStatistics', 'return', 'Returning translation statistics', stats);
  return stats;
}
