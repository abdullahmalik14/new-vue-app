// vueApp-main-new/src/stores/useLocaleStore.js

import { defineStore } from 'pinia';
import { log } from '../utils/common/logHandler';
import { SUPPORTED_LOCALES } from '../utils/translation/localeManager.js';

/**
 * @file useLocaleStore.js
 * @description Pinia store for locale/language preference management
 * @purpose Manages user locale preference with persistence across browser sessions
 */

const DEFAULT_LOCALE = 'en';

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
    },

    /**
     * @action initializeFromBrowser
     * @description Initialize locale from browser language if not already set
     * @returns {string} Initialized locale
     */
    initializeFromBrowser() {
      log('useLocaleStore.js', 'initializeFromBrowser', 'start', 'Initializing locale from browser', {});

      // If already set (from persistence), don't override
      if (this.locale) {
        log('useLocaleStore.js', 'initializeFromBrowser', 'info', 'Locale already set, skipping browser init', {
          locale: this.locale
        });
        log('useLocaleStore.js', 'initializeFromBrowser', 'return', 'Returning existing locale', { locale: this.locale });
        return this.locale;
      }

      // Try to get browser language
      try {
        const browserLanguage = navigator.language || navigator.userLanguage;

        if (browserLanguage) {
          // Extract base language code (e.g., 'en' from 'en-US')
          const baseLanguage = browserLanguage.split('-')[0].toLowerCase();

          // Check if supported
          if (SUPPORTED_LOCALES.includes(baseLanguage)) {
            this.locale = baseLanguage;
            log('useLocaleStore.js', 'initializeFromBrowser', 'success', 'Initialized from browser', {
              locale: baseLanguage
            });
            log('useLocaleStore.js', 'initializeFromBrowser', 'return', 'Returning browser locale', {
              locale: baseLanguage
            });
            return baseLanguage;
          }
        }
      } catch (error) {
        log('useLocaleStore.js', 'initializeFromBrowser', 'error', 'Error getting browser locale', { error });
      }

      // Fallback to default
      this.locale = DEFAULT_LOCALE;
      log('useLocaleStore.js', 'initializeFromBrowser', 'info', 'Using default locale', { locale: DEFAULT_LOCALE });
      log('useLocaleStore.js', 'initializeFromBrowser', 'return', 'Returning default locale', {
        locale: DEFAULT_LOCALE
      });

      return DEFAULT_LOCALE;
    }
  },

  // Enable persistence
  persist: {
    key: 'locale_preference',
    storage: localStorage,
    paths: ['locale'], // Only persist the locale field
    // 90 days TTL is handled by the storage mechanism automatically
  }
});

