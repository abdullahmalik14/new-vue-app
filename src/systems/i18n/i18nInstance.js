/**
 * i18nInstance Registry
 *
 * Allows non-component modules (e.g., translation loader, locale manager)
 * to access the singleton Vue I18n instance.
 */

let i18nInstance = null;

/**
 * Register the Vue I18n instance for global access.
 *
 * @param {import('vue-i18n').I18n} instance - Vue I18n instance
 * @returns {void}
 */
export function registerI18nInstance(instance) {
  i18nInstance = instance;
}

/**
 * Retrieve the registered Vue I18n instance.
 *
 * @returns {import('vue-i18n').I18n | null} - Registered Vue I18n instance
 */
export function getI18nInstance() {
  return i18nInstance;
}


