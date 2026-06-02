// vueApp-main-new/src/stores/useLocaleStore.js

import { defineStore } from 'pinia';
import { log } from '../utils/common/logHandler';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../utils/translation/localeConstants.js';
import {
  attachStorageQuotaMonitor,
  buildPersistKey,
  createPersistedStateSerializer,
  migrateLegacyPersistedState,
  resolvePersistStorage,
} from '../utils/common/persistUtils.js';

/** Default locale preference TTL in localStorage (90 days). */
const DEFAULT_LOCALE_PREFERENCE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Resolve TTL from `VITE_LOCALE_PREFERENCE_TTL_MS` (milliseconds) or default.
 * @returns {number}
 */
function resolveLocalePreferenceTtlMs() {
  const raw = import.meta.env.VITE_LOCALE_PREFERENCE_TTL_MS;
  if (raw === undefined || raw === '') {
    return DEFAULT_LOCALE_PREFERENCE_TTL_MS;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LOCALE_PREFERENCE_TTL_MS;
}

/** @type {number} Locale preference TTL in localStorage (configurable via env). */
export const LOCALE_PREFERENCE_TTL_MS = resolveLocalePreferenceTtlMs();
const LOCALE_PERSIST_VERSION = 1;
const LOCALE_PERSIST_KEY = buildPersistKey('locale_preference');
const localePersistSerializer = createPersistedStateSerializer({
  version: LOCALE_PERSIST_VERSION,
  ttlMs: LOCALE_PREFERENCE_TTL_MS,
  fallback: { locale: null },
  migrate: (state) => (state && typeof state === 'object' ? state : { locale: null }),
});

/**
 * Wrap persisted locale state with an expiry timestamp for pinia-plugin-persistedstate.
 * @param {{ locale: string | null }} value
 * @returns {string}
 */
export function serializeLocalePersistedState(value) {
  return localePersistSerializer.serialize(value);
}

/**
 * Restore locale state from localStorage; expired or invalid entries reset to null.
 * Accepts legacy plain `{ locale }` blobs written before TTL support.
 * @param {string} raw
 * @returns {{ locale: string | null }}
 */
export function deserializeLocalePersistedState(raw) {
  return localePersistSerializer.deserialize(raw);
}

function normalizeLocaleAfterRestore(store) {
  if (store.locale && !SUPPORTED_LOCALES.includes(store.locale)) {
    log('useLocaleStore.js', 'afterRestore', 'warn', 'Unsupported locale restored; clearing', {
      locale: store.locale,
    });
    store.locale = null;
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

      return locale;
    },

    /**
     * @getter isDefaultLocale
     * @description Check if current locale is the default
     * @returns {boolean} True if using default locale
     */
    isDefaultLocale(state) {
      const isDefault = !state.locale || state.locale === DEFAULT_LOCALE;

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
     * @description Set the active locale in Pinia (persisted). For UI/settings changes,
     * prefer `setActiveLocale` from localeManager (URL, i18n, translations, preload).
     * Direct store writes sync in-memory locale via main.js → syncCurrentActiveLocaleFromStore (L-12).
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

      // Fallback manual persistence to guarantee localStorage is updated
      try {
        const storage = resolvePersistStorage();
        if (storage) {
          storage.setItem(LOCALE_PERSIST_KEY, serializeLocalePersistedState({ locale: localeCode }));
        }
      } catch (e) {
        console.warn('Failed to manually persist locale:', e);
      }

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
    key: LOCALE_PERSIST_KEY,
    storage: () => resolvePersistStorage(),
    pick: ['locale'],
    serializer: {
      serialize: serializeLocalePersistedState,
      deserialize: deserializeLocalePersistedState,
    },
    beforeRestore({ store }) {
      migrateLegacyPersistedState({
        storage: resolvePersistStorage(),
        newKey: LOCALE_PERSIST_KEY,
        legacyKeys: ['locale_preference'],
      });
      if (store.locale === undefined) {
        store.locale = null;
      }
    },
    afterRestore({ store }) {
      normalizeLocaleAfterRestore(store);
      attachStorageQuotaMonitor(store, { key: LOCALE_PERSIST_KEY, label: 'locale' });
    },
  }
});

