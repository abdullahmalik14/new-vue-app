/**
 * LocaleManager - Locale resolution and management
 *
 * Handles locale selection with priority chain:
 * 1. URL (path or query parameter)
 * 2. User manual selection (cached)
 * 3. Browser default
 * 4. Fallback to English
 *
 * All operations tracked with global window.performanceTracker.
 */

import { log } from "../common/logHandler.js";
import { logError } from "../common/errorHandler.js";
import { useLocaleStore } from "../../stores/useLocaleStore.js";
import { useAuthStore } from "../../stores/useAuthStore.js";
import {
  resolveSectionIdentifier,
  resolveRoleSectionVariant,
} from "../section/sectionResolver.js";
import { getI18nInstance } from "./i18nInstance.js";

// Supported locales - exported as the single source of truth
export const SUPPORTED_LOCALES = [ "af", "sq", "am", "ar", "hy", "az", "bn", "bs", "bg", "ca", "zh", "zh-tw", "hr", "cs", "da", "fa-af", "nl", "en", "et", "fa", "tl", "fi", "fr", "fr-ca", "ka", "de", "el", "gu", "ht", "ha", "he", "hi", "hu", "is", "id", "ga", "it", "ja", "kn", "kk", "ko", "lv", "lt", "mk", "ms", "ml", "mt", "mr", "mn", "no", "ps", "pl", "pt", "pt-pt", "pa", "ro", "ru", "sr", "si", "sk", "sl", "so", "es", "es-mx", "sw", "sv", "ta", "te", "th", "tr", "uk", "ur", "uz", "vi", "cy" ];
const DEFAULT_LOCALE = "en";

// Current active locale
let currentActiveLocale = null;

/**
 * Resolve the active locale using priority chain
 *
 * Priority order:
 * 1. URL parameter (?locale=vi or /vi/path)
 * 2. Cached user selection
 * 3. Browser language
 * 4. Default fallback (en)
 *
 * @returns {string} - Resolved locale code
 */
export function resolveActiveLocale() {
  log(
    "localeManager.js",
    "resolveActiveLocale",
    "start",
    "Resolving active locale",
    {}
  );

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: "resolveLocale",
      file: "localeManager.js",
      method: "resolveActiveLocale",
      flag: "locale-resolve",
      purpose: "Resolve active locale from priority chain",
    });
  }

  try {
    // 1. Check URL for locale
    const urlLocale = getLocaleFromUrl();
    if (urlLocale) {
      log(
        "localeManager.js",
        "resolveActiveLocale",
        "info",
        "Locale resolved from URL",
        { locale: urlLocale }
      );

      if (window.performanceTracker) {
        window.performanceTracker.step({
          step: "localeResolvedFromUrl",
          file: "localeManager.js",
          method: "resolveActiveLocale",
          flag: "url-source",
          purpose: `Locale from URL: ${urlLocale}`,
        });
      }

      currentActiveLocale = urlLocale;
      log(
        "localeManager.js",
        "resolveActiveLocale",
        "return",
        "Returning URL locale",
        { locale: urlLocale }
      );
      return urlLocale;
    }

    // 2. Check persisted user selection (from Pinia store)
    try {
      const localeStore = useLocaleStore();
      const persistedLocale = localeStore.locale;

      if (persistedLocale && SUPPORTED_LOCALES.includes(persistedLocale)) {
        log(
          "localeManager.js",
          "resolveActiveLocale",
          "info",
          "Locale resolved from persisted store",
          { locale: persistedLocale }
        );

        if (window.performanceTracker) {
          window.performanceTracker.step({
            step: "localeResolvedFromStore",
            file: "localeManager.js",
            method: "resolveActiveLocale",
            flag: "store-source",
            purpose: `Locale from persisted store: ${persistedLocale}`,
          });
        }

        currentActiveLocale = persistedLocale;
        log(
          "localeManager.js",
          "resolveActiveLocale",
          "return",
          "Returning persisted locale",
          { locale: persistedLocale }
        );
        return persistedLocale;
      }
    } catch (error) {
      // Store might not be initialized yet, continue to next priority
      log(
        "localeManager.js",
        "resolveActiveLocale",
        "info",
        "Store not available, continuing to browser locale",
        { error: error?.message }
      );
    }

    // 3. Check browser language
    const browserLocale = getBrowserLocale();
    if (browserLocale) {
      log(
        "localeManager.js",
        "resolveActiveLocale",
        "info",
        "Locale resolved from browser",
        { locale: browserLocale }
      );

      if (window.performanceTracker) {
        window.performanceTracker.step({
          step: "localeResolvedFromBrowser",
          file: "localeManager.js",
          method: "resolveActiveLocale",
          flag: "browser-source",
          purpose: `Locale from browser: ${browserLocale}`,
        });
      }

      currentActiveLocale = browserLocale;
      log(
        "localeManager.js",
        "resolveActiveLocale",
        "return",
        "Returning browser locale",
        { locale: browserLocale }
      );
      return browserLocale;
    }

    // 4. Use default fallback
    log(
      "localeManager.js",
      "resolveActiveLocale",
      "info",
      "Using default locale",
      { locale: DEFAULT_LOCALE }
    );

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: "localeResolvedToDefault",
        file: "localeManager.js",
        method: "resolveActiveLocale",
        flag: "default-source",
        purpose: `Using default locale: ${DEFAULT_LOCALE}`,
      });
    }

    currentActiveLocale = DEFAULT_LOCALE;
    log(
      "localeManager.js",
      "resolveActiveLocale",
      "return",
      "Returning default locale",
      { locale: DEFAULT_LOCALE }
    );
    return DEFAULT_LOCALE;
  } catch (error) {
    logError(
      "localeManager.js",
      "resolveActiveLocale",
      "Error resolving locale",
      error
    );
    currentActiveLocale = DEFAULT_LOCALE;
    log(
      "localeManager.js",
      "resolveActiveLocale",
      "return",
      "Returning default locale due to error",
      { locale: DEFAULT_LOCALE }
    );
    return DEFAULT_LOCALE;
  }
}

/**
 * Get locale from URL path
 * Checks first path segment only (e.g., /vi/dashboard → 'vi')
 *
 * @returns {string|null} - Locale code or null if not found
 */
function getLocaleFromUrl() {
  log(
    "localeManager.js",
    "getLocaleFromUrl",
    "start",
    "Getting locale from URL",
    {}
  );

  try {
    // Check path: /vi/dashboard
    const pathParts = window.location.pathname
      .split("/")
      .filter((part) => part.length > 0);
    const firstPathPart = pathParts[0];

    if (firstPathPart && SUPPORTED_LOCALES.includes(firstPathPart)) {
      log(
        "localeManager.js",
        "getLocaleFromUrl",
        "info",
        "Found locale in path",
        { locale: firstPathPart }
      );
      log(
        "localeManager.js",
        "getLocaleFromUrl",
        "return",
        "Returning path locale",
        { locale: firstPathPart }
      );
      return firstPathPart;
    }

    log(
      "localeManager.js",
      "getLocaleFromUrl",
      "return",
      "No locale found in URL",
      {}
    );
    return null;
  } catch (error) {
    logError(
      "localeManager.js",
      "getLocaleFromUrl",
      "Error getting locale from URL",
      error
    );
    log(
      "localeManager.js",
      "getLocaleFromUrl",
      "return",
      "Returning null due to error",
      {}
    );
    return null;
  }
}

/**
 * Get browser's preferred locale
 *
 * @returns {string|null} - Locale code or null if not supported
 */
function getBrowserLocale() {
  log(
    "localeManager.js",
    "getBrowserLocale",
    "start",
    "Getting browser locale",
    {}
  );

  try {
    // Get browser language
    const browserLanguage = navigator.language || navigator.userLanguage;

    if (!browserLanguage) {
      log(
        "localeManager.js",
        "getBrowserLocale",
        "return",
        "No browser language available",
        {}
      );
      return null;
    }

    // Extract base language code (e.g., 'en' from 'en-US')
    const baseLanguage = browserLanguage.split("-")[0].toLowerCase();

    // Check if supported
    if (SUPPORTED_LOCALES.includes(baseLanguage)) {
      log(
        "localeManager.js",
        "getBrowserLocale",
        "info",
        "Browser locale is supported",
        { locale: baseLanguage }
      );
      log(
        "localeManager.js",
        "getBrowserLocale",
        "return",
        "Returning browser locale",
        { locale: baseLanguage }
      );
      return baseLanguage;
    }

    log(
      "localeManager.js",
      "getBrowserLocale",
      "info",
      "Browser locale not supported",
      {
        browserLanguage,
        supportedLocales: SUPPORTED_LOCALES,
      }
    );
    log(
      "localeManager.js",
      "getBrowserLocale",
      "return",
      "Returning null - locale not supported",
      {}
    );
    return null;
  } catch (error) {
    logError(
      "localeManager.js",
      "getBrowserLocale",
      "Error getting browser locale",
      error
    );
    log(
      "localeManager.js",
      "getBrowserLocale",
      "return",
      "Returning null due to error",
      {}
    );
    return null;
  }
}

/**
 * Set the active locale
 * Updates URL and cache
 *
 * @param {string} localeCode - Locale code to set
 * @param {object} options - Options { updateUrl: boolean }
 * @returns {Promise<boolean>} - True if locale was set successfully
 */
export async function setActiveLocale(localeCode, options = {}) {
  log("localeManager.js", "setActiveLocale", "start", "Setting active locale", {
    localeCode,
    options,
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: "setLocale",
      file: "localeManager.js",
      method: "setActiveLocale",
      flag: "locale-set",
      purpose: `Set active locale to: ${localeCode}`,
    });
  }

  // Validate locale
  if (!SUPPORTED_LOCALES.includes(localeCode)) {
    log(
      "localeManager.js",
      "setActiveLocale",
      "warn",
      "Unsupported locale provided",
      {
        localeCode,
        supportedLocales: SUPPORTED_LOCALES,
      }
    );
    log(
      "localeManager.js",
      "setActiveLocale",
      "return",
      "Returning false - unsupported locale",
      { localeCode }
    );
    return false;
  }

  // Default options
  const { updateUrl = true } = options;

  // Resolve user role for section resolution
  let userRole = "guest";
  try {
    const authStore = useAuthStore();
    userRole = authStore.currentUser?.role || "guest";
  } catch (error) {
    log(
      "localeManager.js",
      "setActiveLocale",
      "info",
      "Auth store not available while resolving user role",
      {
        error: error?.message,
      }
    );
  }

  // Set as current active locale
  currentActiveLocale = localeCode;

  // Persist the locale preference in Pinia store (auto-persisted to localStorage for 90 days)
  try {
    const localeStore = useLocaleStore();
    localeStore.setLocale(localeCode);

    log(
      "localeManager.js",
      "setActiveLocale",
      "success",
      "Active locale set and persisted",
      {
        localeCode,
        updateUrl,
      }
    );
  } catch (error) {
    log(
      "localeManager.js",
      "setActiveLocale",
      "warn",
      "Failed to persist locale to store",
      {
        localeCode,
        error: error?.message,
      }
    );
  }

  // Update Vue I18n instance if available
  const i18nInstance = getI18nInstance();
  if (i18nInstance) {
    try {
      if (
        i18nInstance.global?.locale &&
        i18nInstance.global.locale.value !== localeCode
      ) {
        i18nInstance.global.locale.value = localeCode;
      }
    } catch (error) {
      log(
        "localeManager.js",
        "setActiveLocale",
        "warn",
        "Failed to synchronize i18n locale",
        {
          localeCode,
          error: error?.message,
        }
      );
    }
  }

  // Update document language attribute for accessibility/SEO
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", localeCode);
  }

  // Clear translation caches and reload current section for new locale
  try {
    // Dynamic import to avoid circular dependency
    const {
      clearTranslationCaches,
      loadTranslationsForSection,
      preloadTranslationsForSections,
    } = await import("./translationLoader.js");
    clearTranslationCaches();
    log(
      "localeManager.js",
      "setActiveLocale",
      "info",
      "Translation caches cleared for locale switch",
      { localeCode }
    );

    // Try to reload current section translations if we can determine the active section
    if (typeof window !== "undefined" && window.location) {
      try {
        const { resolveRouteFromPath } = await import(
          "../route/routeResolver.js"
        );
        const rawPath = window.location.pathname || "/";
        const pathSegments = rawPath
          .split("/")
          .filter((segment) => segment.length > 0);
        const firstSegment = pathSegments[0];

        // Strip locale prefix from path for route resolution
        let routePath = rawPath;
        if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment)) {
          const remainingSegments = pathSegments.slice(1);
          routePath = "/" + remainingSegments.join("/");
          if (remainingSegments.length === 0) {
            routePath = "/";
          }
        }

        const currentRoute = resolveRouteFromPath(routePath);
        if (currentRoute?.section) {
          try {
            // Resolve section to string (handles both string and object sections)
            const resolvedSection = resolveRoleSectionVariant(
              currentRoute.section,
              userRole
            );
            if (resolvedSection && typeof resolvedSection === "string") {
              await loadTranslationsForSection(resolvedSection, localeCode);
              log(
                "localeManager.js",
                "setActiveLocale",
                "info",
                "Reloaded current section translations for new locale",
                {
                  originalSection: currentRoute.section,
                  resolvedSection,
                  localeCode,
                }
              );
            } else {
              log(
                "localeManager.js",
                "setActiveLocale",
                "warn",
                "Could not resolve section to string, skipping translation reload",
                {
                  section: currentRoute.section,
                  resolvedSection,
                  userRole,
                  localeCode,
                }
              );
            }
          } catch (error) {
            log(
              "localeManager.js",
              "setActiveLocale",
              "warn",
              "Failed to reload current section translations",
              {
                section: currentRoute.section,
                localeCode,
                error: error?.message,
              }
            );
          }

          // Reload translations for preloaded sections (if any)
          const preloadedSections = Array.isArray(currentRoute.preLoadSections)
            ? currentRoute.preLoadSections.filter(
                (sectionName) =>
                  typeof sectionName === "string" && sectionName.length > 0
              )
            : [];

          const resolvedPreloadedSections = preloadedSections
            .map((identifier) => resolveSectionIdentifier(identifier, userRole))
            .filter(
              (sectionName) =>
                typeof sectionName === "string" && sectionName.length > 0
            );

          const uniquePreloadedSections = [
            ...new Set(resolvedPreloadedSections),
          ];

          if (uniquePreloadedSections.length > 0) {
            log(
              "localeManager.js",
              "setActiveLocale",
              "info",
              "Reloading translations for preloaded sections",
              {
                localeCode,
                originalIdentifiers: preloadedSections,
                resolvedSections: uniquePreloadedSections,
              }
            );

            try {
              await preloadTranslationsForSections(
                uniquePreloadedSections,
                localeCode
              );
              log(
                "localeManager.js",
                "setActiveLocale",
                "info",
                "Reloaded translations for all preloaded sections",
                {
                  localeCode,
                  resolvedSections: uniquePreloadedSections,
                }
              );
            } catch (error) {
              log(
                "localeManager.js",
                "setActiveLocale",
                "warn",
                "Failed to reload translations for preloaded sections",
                {
                  localeCode,
                  resolvedSections: uniquePreloadedSections,
                  originalIdentifiers: preloadedSections,
                  error: error?.message,
                }
              );
            }
          }
        }
      } catch (error) {
        // Route resolution failed, not critical
        log(
          "localeManager.js",
          "setActiveLocale",
          "info",
          "Could not determine current section for reload",
          {
            error: error?.message,
          }
        );
      }
    }
  } catch (error) {
    log(
      "localeManager.js",
      "setActiveLocale",
      "warn",
      "Failed to clear translation caches",
      {
        localeCode,
        error: error?.message,
      }
    );
  }

  // Update URL if requested
  if (updateUrl) {
    updateUrlWithLocale(localeCode);
  }

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: "localeSet",
      file: "localeManager.js",
      method: "setActiveLocale",
      flag: "locale-updated",
      purpose: `Locale updated to: ${localeCode}`,
    });
  }

  log("localeManager.js", "setActiveLocale", "return", "Returning success", {
    localeCode,
    success: true,
  });
  return true;
}

/**
 * Update URL with locale in path
 * Injects or updates locale as first path segment (e.g., /dashboard → /vi/dashboard)
 * For default locale (en), removes locale prefix from URL
 *
 * @param {string} localeCode - Locale code
 * @returns {void}
 */
function updateUrlWithLocale(localeCode) {
  log(
    "localeManager.js",
    "updateUrlWithLocale",
    "start",
    "Updating URL with locale",
    { localeCode }
  );

  try {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split("/").filter((part) => part.length > 0);

    // Check if first segment is already a locale
    const firstPart = pathParts[0];
    const hasLocaleInPath = firstPart && SUPPORTED_LOCALES.includes(firstPart);

    let newPath;

    // If switching to default locale (en), remove locale prefix
    if (localeCode === DEFAULT_LOCALE) {
      if (hasLocaleInPath) {
        // Remove locale prefix - keep rest of path
        const remainingParts = pathParts.slice(1);
        newPath =
          remainingParts.length > 0 ? "/" + remainingParts.join("/") : "/";
      } else {
        // No locale in path, keep as is
        newPath = currentPath;
      }
    } else {
      // Non-default locale - add or replace locale prefix
      if (hasLocaleInPath) {
        // Replace existing locale
        pathParts[0] = localeCode;
        newPath = "/" + pathParts.join("/");
      } else {
        // Insert locale at the beginning
        newPath = "/" + localeCode + currentPath;
      }
    }

    // Preserve query string and hash
    const search = window.location.search;
    const hash = window.location.hash;
    const newUrl = newPath + search + hash;

    // Update URL without page reload (using pushState)
    window.history.pushState({}, "", newUrl);

    log(
      "localeManager.js",
      "updateUrlWithLocale",
      "success",
      "URL updated with locale in path",
      {
        localeCode,
        oldPath: currentPath,
        newPath: newUrl,
        isDefaultLocale: localeCode === DEFAULT_LOCALE,
      }
    );
    log(
      "localeManager.js",
      "updateUrlWithLocale",
      "return",
      "URL update complete",
      {}
    );
  } catch (error) {
    logError(
      "localeManager.js",
      "updateUrlWithLocale",
      "Failed to update URL with locale",
      error,
      { localeCode }
    );
    log(
      "localeManager.js",
      "updateUrlWithLocale",
      "return",
      "Returning after error",
      {}
    );
  }
}

/**
 * Apply locale temporarily without persisting to store
 * Used when URL has a locale - it overrides display but doesn't change saved preference
 *
 * @param {string} localeCode - Locale code to apply temporarily
 * @returns {Promise<void>}
 */
export async function applyLocaleTemporarily(localeCode) {
  log(
    "localeManager.js",
    "applyLocaleTemporarily",
    "start",
    "Applying locale temporarily (not persisting)",
    { localeCode }
  );

  // Validate locale
  if (!SUPPORTED_LOCALES.includes(localeCode)) {
    log(
      "localeManager.js",
      "applyLocaleTemporarily",
      "warn",
      "Unsupported locale provided",
      {
        localeCode,
        supportedLocales: SUPPORTED_LOCALES,
      }
    );
    return;
  }

  // Set as current active locale (in memory only, not in store)
  currentActiveLocale = localeCode;

  // Update Vue I18n instance if available
  const i18nInstance = getI18nInstance();
  if (i18nInstance) {
    try {
      if (
        i18nInstance.global?.locale &&
        i18nInstance.global.locale.value !== localeCode
      ) {
        i18nInstance.global.locale.value = localeCode;
        log(
          "localeManager.js",
          "applyLocaleTemporarily",
          "success",
          "Vue I18n locale updated",
          { localeCode }
        );
      }
    } catch (error) {
      log(
        "localeManager.js",
        "applyLocaleTemporarily",
        "warn",
        "Failed to synchronize i18n locale",
        {
          localeCode,
          error: error?.message,
        }
      );
    }
  }

  // Update document language attribute for accessibility/SEO
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", localeCode);
  }

  log(
    "localeManager.js",
    "applyLocaleTemporarily",
    "return",
    "Locale applied temporarily (not persisted)",
    { localeCode }
  );
}

/**
 * Get current active locale
 *
 * @returns {string} - Current active locale code
 */
export function getActiveLocale() {
  log(
    "localeManager.js",
    "getActiveLocale",
    "start",
    "Getting active locale",
    {}
  );

  // If not set, resolve it
  if (!currentActiveLocale) {
    currentActiveLocale = resolveActiveLocale();
  }

  log(
    "localeManager.js",
    "getActiveLocale",
    "return",
    "Returning active locale",
    { locale: currentActiveLocale }
  );
  return currentActiveLocale;
}

/**
 * Get all supported locales
 *
 * @returns {Array<string>} - Array of supported locale codes
 */
export function getSupportedLocales() {
  log(
    "localeManager.js",
    "getSupportedLocales",
    "return",
    "Returning supported locales",
    { locales: SUPPORTED_LOCALES }
  );
  return [...SUPPORTED_LOCALES];
}

/**
 * Check if a locale is supported
 *
 * @param {string} localeCode - Locale code to check
 * @returns {boolean} - True if locale is supported
 */
export function isLocaleSupported(localeCode) {
  const supported = SUPPORTED_LOCALES.includes(localeCode);
  log(
    "localeManager.js",
    "isLocaleSupported",
    "return",
    "Returning locale support status",
    { localeCode, supported }
  );
  return supported;
}

/**
 * Get default locale
 *
 * @returns {string} - Default locale code
 */
export function getDefaultLocale() {
  log(
    "localeManager.js",
    "getDefaultLocale",
    "return",
    "Returning default locale",
    { locale: DEFAULT_LOCALE }
  );
  return DEFAULT_LOCALE;
}

/**
 * Get locale display name
 *
 * @param {string} localeCode - Locale code
 * @returns {string} - Human-readable locale name
 */
export function getLocaleDisplayName(localeCode) {
  const localeNames = {
    en: "English",
    vi: "Tiếng Việt",
  };

  const displayName = localeNames[localeCode] || localeCode;
  log(
    "localeManager.js",
    "getLocaleDisplayName",
    "return",
    "Returning locale display name",
    { localeCode, displayName }
  );
  return displayName;
}

/**
 * Switch to a different locale
 * Convenience method that sets locale
 *
 * @param {string} newLocaleCode - New locale code
 * @returns {Promise<boolean>} - True if switch was successful
 */
export async function switchToLocale(newLocaleCode) {
  log(
    "localeManager.js",
    "switchToLocale",
    "start",
    "Switching to new locale",
    { newLocaleCode }
  );

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: "switchLocale",
      file: "localeManager.js",
      method: "switchToLocale",
      flag: "locale-switch",
      purpose: `Switch from ${currentActiveLocale} to ${newLocaleCode}`,
    });
  }

  // Set new locale
  const success = await setActiveLocale(newLocaleCode);

  if (success) {
    log(
      "localeManager.js",
      "switchToLocale",
      "success",
      "Locale switched successfully",
      {
        oldLocale: currentActiveLocale,
        newLocale: newLocaleCode,
      }
    );

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: "localeSwitched",
        file: "localeManager.js",
        method: "switchToLocale",
        flag: "switch-complete",
        purpose: `Locale switch complete: ${newLocaleCode}`,
      });
    }
  }

  log(
    "localeManager.js",
    "switchToLocale",
    "return",
    "Returning switch result",
    { success }
  );
  return success;
}

/**
 * Reset locale to default
 *
 * @returns {Promise<boolean>} - True if reset was successful
 */
export async function resetLocaleToDefault() {
  log(
    "localeManager.js",
    "resetLocaleToDefault",
    "start",
    "Resetting locale to default",
    {}
  );
  const success = await setActiveLocale(DEFAULT_LOCALE);
  log(
    "localeManager.js",
    "resetLocaleToDefault",
    "return",
    "Returning reset result",
    { success }
  );
  return success;
}

/**
 * Get locale preference order
 * Returns the order in which locales are checked
 *
 * @returns {Array<object>} - Array of preference sources with current values
 */
export function getLocalePreferenceOrder() {
  let persistedLocale = null;
  try {
    const localeStore = useLocaleStore();
    persistedLocale = localeStore.locale;
  } catch (error) {
    // Store not available
  }

  const order = [
    {
      source: "url",
      value: getLocaleFromUrl(),
      priority: 1,
    },
    {
      source: "persisted",
      value: persistedLocale,
      priority: 2,
    },
    {
      source: "browser",
      value: getBrowserLocale(),
      priority: 3,
    },
    {
      source: "default",
      value: DEFAULT_LOCALE,
      priority: 4,
    },
  ];

  log(
    "localeManager.js",
    "getLocalePreferenceOrder",
    "return",
    "Returning preference order",
    { sourceCount: order.length }
  );
  return order;
}

// =================================================================
// DEVELOPER CONSOLE API
// =================================================================
// Expose locale management functions to window for testing
if (typeof window !== "undefined") {
  window.APP = window.APP || {};
  window.APP.setLocale = setActiveLocale;
  window.APP.getLocale = getActiveLocale;
  window.APP.switchLocale = switchToLocale;
  window.APP.getSupportedLocales = getSupportedLocales;
  window.APP.getLocalePreferenceOrder = getLocalePreferenceOrder;
  window.APP.getTranslationStatistics = async () => {
    log(
      "localeManager.js",
      "console-api",
      "start",
      "Fetching translation statistics via console API",
      {}
    );

    try {
      const { getTranslationStatistics } = await import(
        "./translationLoader.js"
      );
      const stats = getTranslationStatistics();

      console.log("📊 Translation statistics:", stats);
      log(
        "localeManager.js",
        "console-api",
        "success",
        "Translation statistics fetched",
        { stats }
      );

      return stats;
    } catch (error) {
      logError(
        "localeManager.js",
        "console-api",
        "Failed to fetch translation statistics",
        error
      );
      console.error("Failed to fetch translation statistics:", error);
      return null;
    }
  };

  // Test function to verify locale persistence
  window.APP.testLocalePersistence = () => {
    log(
      "localeManager.js",
      "testLocalePersistence",
      "start",
      "Testing locale persistence",
      {}
    );

    console.log("🧪 Testing Locale Persistence");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Show current state
    const current = getActiveLocale();
    console.log("📍 Current locale:", current);

    // Show preference order
    const order = getLocalePreferenceOrder();
    console.log("📊 Preference order:");
    order.forEach((item) => {
      console.log(
        `  ${item.priority}. ${item.source}: ${item.value || "(not set)"}`
      );
    });

    // Show persisted value
    try {
      const localeStore = useLocaleStore();
      console.log("💾 Persisted in store:", localeStore.locale || "(not set)");
      console.log("📦 LocalStorage key:", "locale_preference");

      const stored = localStorage.getItem("locale_preference");
      if (stored) {
        console.log("📦 LocalStorage value:", JSON.parse(stored));
      } else {
        console.log("📦 LocalStorage value: (empty)");
      }
    } catch (error) {
      console.log("❌ Store not available:", error.message);
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💡 Try these commands:");
    console.log('   window.APP.setLocale("vi")    - Switch to Vietnamese');
    console.log('   window.APP.setLocale("en")    - Switch to English');
    console.log("   window.APP.getLocale()        - Get current locale");
    console.log("   Close and reopen browser to test persistence!");

    log(
      "localeManager.js",
      "testLocalePersistence",
      "complete",
      "Test complete",
      {}
    );
  };

  log(
    "localeManager.js",
    "window-api",
    "expose",
    "Locale console commands exposed",
    {
      commands: [
        'window.APP.setLocale("vi")',
        'window.APP.setLocale("en")',
        "window.APP.getLocale()",
        "window.APP.getSupportedLocales()",
        "window.APP.getLocalePreferenceOrder()",
        "window.APP.getTranslationStatistics()",
        "window.APP.testLocalePersistence()",
      ],
    }
  );
}
