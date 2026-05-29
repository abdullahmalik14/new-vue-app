// vueApp-main-new/src/stores/useLocaleStore.js

import { defineStore } from 'pinia';
import { log } from '../utils/common/logHandler';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../utils/translation/localeManager.js';

/** @type {number} Locale preference TTL in localStorage (90 days). */
export const LOCALE_PREFERENCE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Wrap persisted locale state with an expiry timestamp for pinia-plugin-persistedstate.
 * @param {{ locale: string | null }} value
 * @returns {string}
 */
export function serializeLocalePersistedState(value) {
  return JSON.stringify({
    data: value,
    expiresAt: Date.now() + LOCALE_PREFERENCE_TTL_MS,
  });
}

/**
 * Restore locale state from localStorage; expired or invalid entries reset to null.
 * Accepts legacy plain `{ locale }` blobs written before TTL support.
 * @param {string} raw
 * @returns {{ locale: string | null }}
 */
export function deserializeLocalePersistedState(raw) {
  try {
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed.expiresAt === 'number') {
      if (Date.now() > parsed.expiresAt) {
        return { locale: null };
      }
      return parsed.data ?? { locale: null };
    }

    if (parsed && typeof parsed === 'object' && 'locale' in parsed) {
      return parsed;
    }

    return { locale: null };
  } catch {
    return { locale: null };
  }
}

/**
 * @file useLocaleStore.js
 * @description Pinia store for locale/language preference management
 * @purpose Manages user locale preference with persistence across browser sessions
 */

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    locale: null, // Current locale, null means not yet initialized
  }),

  getters: {
    /**
     * @getter currentLocale
     * @description Get the current locale or default if not set
     * @returns {string} Current locale code
     */
    currentLocale(state) {
      const locale = state.locale || DEFAULT_LOCALE;

      log('useLocaleStore.js', 'currentLocale', 'get', 'Getting current locale', { locale });

      if (window.performanceTracker) {
        window.performanceTracker.step({
          step: 'currentLocale_getter',
          file: 'useLocaleStore.js',
          method: 'currentLocale',
          flag: 'get',
          purpose: 'Get current locale from store'
        });
      }

      return locale;
    },

    /**
     * @getter isDefaultLocale
     * @description Check if current locale is the default
     * @returns {boolean} True if using default locale
     */
    isDefaultLocale(state) {
      const isDefault = !state.locale || state.locale === DEFAULT_LOCALE;

      log('useLocaleStore.js', 'isDefaultLocale', 'get', 'Checking if default locale', { isDefault });

      return isDefault;
    },

    /**
     * @getter supportedLocales
     * @description Get list of supported locales
     * @returns {Array<string>} Array of supported locale codes
     */
    supportedLocales() {
      return [...SUPPORTED_LOCALES];
    }
  },

  actions: {
    /**
     * @action setLocale
     * @description Set the active locale
     * @param {string} localeCode - Locale code to set
     * @returns {boolean} True if locale was set successfully
     */
    setLocale(localeCode) {
      log('useLocaleStore.js', 'setLocale', 'start', 'Setting locale', { localeCode });

      if (window.performanceTracker) {
        window.performanceTracker.step({
          step: 'setLocale',
          file: 'useLocaleStore.js',
          method: 'setLocale',
          flag: 'locale-set',
          purpose: `Set locale to: ${localeCode}`
        });
      }

      // Validate locale
      if (!SUPPORTED_LOCALES.includes(localeCode)) {
        log('useLocaleStore.js', 'setLocale', 'warn', 'Unsupported locale provided', {
          localeCode,
          supportedLocales: SUPPORTED_LOCALES
        });
        log('useLocaleStore.js', 'setLocale', 'return', 'Returning false - unsupported locale', { localeCode });
        return false;
      }

      // Set locale in state (persisted automatically)
      this.locale = localeCode;

      log('useLocaleStore.js', 'setLocale', 'success', 'Locale set successfully', { localeCode });
      log('useLocaleStore.js', 'setLocale', 'return', 'Returning success', { localeCode });

      return true;
    },

    /**
     * @action resetToDefault
     * @description Reset locale to default
     * @returns {boolean} True if reset was successful
     */
    resetToDefault() {
      log('useLocaleStore.js', 'resetToDefault', 'start', 'Resetting to default locale', {});

      this.locale = DEFAULT_LOCALE;

      log('useLocaleStore.js', 'resetToDefault', 'success', 'Reset to default locale', { locale: DEFAULT_LOCALE });
      log('useLocaleStore.js', 'resetToDefault', 'return', 'Returning success', {});

      return true;
    }
  },

  persist: {
    key: 'locale_preference',
    storage: localStorage,
    paths: ['locale'],
    serializer: {
      serialize: serializeLocalePersistedState,
      deserialize: deserializeLocalePersistedState,
    },
  }
});

