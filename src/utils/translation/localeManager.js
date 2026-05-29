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
  resolveRoleSectionVariant,
} from "../section/sectionResolver.js";
import {
  getRoutePreloadPlan,
  refreshSectionPreloadsOnLocaleChange,
} from "../section/sectionPreloadOrchestrator.js";
import { getI18nInstance } from "./i18nInstance.js";
import { LOCALE_DISPLAY_METADATA } from "./localeDisplayMetadata.js";

// Supported locales - exported as the single source of truth
export const SUPPORTED_LOCALES = [ "af", "sq", "am", "ar", "hy", "az", "bn", "bs", "bg", "ca", "zh", "zh-tw", "hr", "cs", "da", "fa-af", "nl", "en", "et", "fa", "tl", "fi", "fr", "fr-ca", "ka", "de", "el", "gu", "ht", "ha", "he", "hi", "hu", "is", "id", "ga", "it", "ja", "kn", "kk", "ko", "lv", "lt", "mk", "ms", "ml", "mt", "mr", "mn", "no", "ps", "pl", "pt", "pt-pt", "pa", "ro", "ru", "sr", "si", "sk", "sl", "so", "es", "es-mx", "sw", "sv", "ta", "te", "th", "tr", "uk", "ur", "uz", "vi", "cy" ];
export const DEFAULT_LOCALE = "en";

/**
 * First path segment if it is a supported locale (e.g. /vi/dashboard → vi).
 *
 * @param {string} path
 * @param {string[]} [supportedLocales=SUPPORTED_LOCALES]
 * @returns {string|null}
 */
export function getLeadingLocaleFromPath(path, supportedLocales = SUPPORTED_LOCALES) {
  const segments = String(path || "").split("/").filter(Boolean);
  if (segments.length > 0 && supportedLocales.includes(segments[0])) {
    return segments[0];
  }
  return null;
}

/**
 * Remove a leading locale segment from a path (L14 — avoid /vi/vi/... double prefix).
 *
 * @param {string} path
 * @param {string[]} [supportedLocales=SUPPORTED_LOCALES]
 * @returns {string}
 */
export function stripLeadingLocaleFromPath(path, supportedLocales = SUPPORTED_LOCALES) {
  const segments = String(path || "").split("/").filter(Boolean);
  if (segments.length > 0 && supportedLocales.includes(segments[0])) {
    const rest = segments.slice(1);
    return rest.length ? `/${rest.join("/")}` : "/";
  }
  return path || "/";
}

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
    const pathLocale = getLeadingLocaleFromPath(window.location.pathname);

    if (pathLocale) {
      log(
        "localeManager.js",
        "getLocaleFromUrl",
        "info",
        "Found locale in path",
        { locale: pathLocale }
      );
      log(
        "localeManager.js",
        "getLocaleFromUrl",
        "return",
        "Returning path locale",
        { locale: pathLocale }
      );
      return pathLocale;
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

    const normalized = browserLanguage.toLowerCase().replace("_", "-");

    if (SUPPORTED_LOCALES.includes(normalized)) {
      log(
        "localeManager.js",
        "getBrowserLocale",
        "info",
        "Browser locale is supported (full regional code)",
        { browserLanguage, locale: normalized }
      );
      log(
        "localeManager.js",
        "getBrowserLocale",
        "return",
        "Returning browser locale",
        { locale: normalized }
      );
      return normalized;
    }

    const baseLanguage = normalized.split("-")[0];

    if (SUPPORTED_LOCALES.includes(baseLanguage)) {
      log(
        "localeManager.js",
        "getBrowserLocale",
        "info",
        "Browser locale is supported (base code fallback)",
        { browserLanguage, locale: baseLanguage }
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
        normalized,
        baseLanguage,
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
        const routePath = stripLeadingLocaleFromPath(rawPath);

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

          // Refresh bundle/CSS preload and translations for background preLoadSections
          const { resolved: preloadedSectionsToRefresh } = getRoutePreloadPlan(
            currentRoute,
            userRole
          );

          if (preloadedSectionsToRefresh.length > 0) {
            log(
              "localeManager.js",
              "setActiveLocale",
              "info",
              "Refreshing section preloads for locale change",
              {
                localeCode,
                resolvedSections: preloadedSectionsToRefresh,
                skipSection: resolvedSection,
              }
            );

            try {
              await refreshSectionPreloadsOnLocaleChange({
                sections: preloadedSectionsToRefresh,
                locale: localeCode,
                skipSection: resolvedSection,
                logContext: {
                  file: "localeManager.js",
                  method: "setActiveLocale",
                },
              });
              log(
                "localeManager.js",
                "setActiveLocale",
                "info",
                "Refreshed section bundles and translations for preloaded sections",
                {
                  localeCode,
                  resolvedSections: preloadedSectionsToRefresh,
                }
              );
            } catch (error) {
              log(
                "localeManager.js",
                "setActiveLocale",
                "warn",
                "Failed to refresh section preloads for locale change",
                {
                  localeCode,
                  resolvedSections: preloadedSectionsToRefresh,
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
    const hasLocaleInPath = Boolean(getLeadingLocaleFromPath(currentPath));

    let newPath;

    // If switching to default locale (en), remove locale prefix
    if (localeCode === DEFAULT_LOCALE) {
      newPath = hasLocaleInPath
        ? stripLeadingLocaleFromPath(currentPath)
        : currentPath;
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
 * Resolve section name from a route path for temporary locale translation loads.
 *
 * @param {string} [routePath] - Full path (e.g. /vi/dashboard); falls back to window.location.pathname
 * @returns {Promise<string|null>}
 */
async function resolveSectionFromRoutePath(routePath) {
  const rawPath =
    routePath ||
    (typeof window !== "undefined" ? window.location.pathname : null);

  if (!rawPath) {
    return null;
  }

  try {
    const { resolveRouteFromPath } = await import("../route/routeResolver.js");
    const routePath = stripLeadingLocaleFromPath(rawPath);
    const currentRoute = resolveRouteFromPath(routePath);

    if (!currentRoute?.section) {
      return null;
    }

    let userRole = "guest";
    try {
      const authStore = useAuthStore();
      userRole = authStore.currentUser?.role || "guest";
    } catch {
      // Auth store may be unavailable during early boot
    }

    const resolvedSection = resolveRoleSectionVariant(
      currentRoute.section,
      userRole
    );

    return typeof resolvedSection === "string" && resolvedSection
      ? resolvedSection
      : null;
  } catch (error) {
    log(
      "localeManager.js",
      "resolveSectionFromRoutePath",
      "info",
      "Could not resolve section from route path",
      { routePath: rawPath, error: error?.message }
    );
    return null;
  }
}

/**
 * Load translations for a temporarily applied locale (non-blocking by default).
 *
 * @param {string} localeCode
 * @param {object} options
 * @param {string} [options.sectionName]
 * @param {string} [options.routePath]
 * @param {boolean} [options.awaitTranslations]
 * @returns {Promise<void>}
 */
async function loadTranslationsForTemporaryLocale(
  localeCode,
  { sectionName, routePath, awaitTranslations }
) {
  try {
    const { loadTranslationsForSection } = await import("./translationLoader.js");
    const resolvedSection =
      sectionName || (await resolveSectionFromRoutePath(routePath));

    if (!resolvedSection) {
      log(
        "localeManager.js",
        "loadTranslationsForTemporaryLocale",
        "info",
        "No section resolved for temporary locale translation load",
        { localeCode, routePath }
      );
      return;
    }

    const loadPromise = loadTranslationsForSection(
      resolvedSection,
      localeCode
    );

    if (awaitTranslations) {
      await loadPromise;
      log(
        "localeManager.js",
        "loadTranslationsForTemporaryLocale",
        "success",
        "Translations loaded for temporary locale",
        { localeCode, resolvedSection }
      );
      return;
    }

    loadPromise.catch((error) => {
      log(
        "localeManager.js",
        "loadTranslationsForTemporaryLocale",
        "warn",
        "Failed to load translations for temporary locale",
        {
          localeCode,
          resolvedSection,
          error: error?.message,
        }
      );
    });
  } catch (error) {
    log(
      "localeManager.js",
      "loadTranslationsForTemporaryLocale",
      "warn",
      "Translation loader unavailable for temporary locale",
      { localeCode, error: error?.message }
    );
  }
}

/**
 * Apply locale temporarily without persisting to store
 * Used when URL has a locale - it overrides display but doesn't change saved preference
 *
 * Also kicks off translation load for the resolved section (fire-and-forget by default)
 * so standalone callers and router URL-locale paths have strings, not just locale labels.
 *
 * @param {string} localeCode - Locale code to apply temporarily
 * @param {object} [options]
 * @param {string} [options.sectionName] - Section to load; skips path resolution when set
 * @param {string} [options.routePath] - Destination path for section resolution (e.g. router `to.path`)
 * @param {boolean} [options.loadTranslations=true] - Start translation fetch for resolved section
 * @param {boolean} [options.awaitTranslations=false] - When true, await translation load (preview UIs)
 * @returns {Promise<void>}
 */
export async function applyLocaleTemporarily(localeCode, options = {}) {
  const {
    sectionName,
    routePath,
    loadTranslations = true,
    awaitTranslations = false,
  } = options;
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

  if (loadTranslations) {
    await loadTranslationsForTemporaryLocale(localeCode, {
      sectionName,
      routePath,
      awaitTranslations,
    });
  }

  log(
    "localeManager.js",
    "applyLocaleTemporarily",
    "return",
    "Locale applied temporarily (not persisted)",
    { localeCode, loadTranslations, awaitTranslations }
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
 * Normalize app locale codes to BCP 47 tags for Intl APIs (e.g. zh-tw → zh-TW).
 *
 * @param {string} localeCode
 * @returns {string}
 */
function toIntlLocaleTag(localeCode) {
  if (typeof localeCode !== 'string' || localeCode.length === 0) {
    return localeCode;
  }

  const parts = localeCode.split('-');
  if (parts.length === 1) {
    return parts[0];
  }

  return `${parts[0]}-${parts.slice(1).join('-').toUpperCase()}`;
}

/**
 * Resolve a human-readable language name via Intl.DisplayNames.
 *
 * @param {string} localeCode
 * @param {string} [displayLocale='en']
 * @returns {string|null}
 */
function resolveIntlLocaleDisplayName(localeCode, displayLocale = 'en') {
  try {
    const intlTag = toIntlLocaleTag(localeCode);
    const name = new Intl.DisplayNames([displayLocale], { type: 'language' }).of(intlTag);
    if (typeof name === 'string' && name.length > 0 && name !== localeCode) {
      return name;
    }
  } catch {
    // Intl unavailable or locale unsupported — fall through
  }

  return null;
}

/**
 * Options for locale switcher UI (codes follow SUPPORTED_LOCALES order).
 *
 * @returns {Array<{ code: string, label: string, traditionalName: string }>}
 */
export function getLocaleSwitcherOptions() {
  return SUPPORTED_LOCALES.map((code) => {
    const meta = LOCALE_DISPLAY_METADATA[code];
    const intlLabel = resolveIntlLocaleDisplayName(code, 'en');
    return {
      code,
      label: meta?.label ?? intlLabel ?? code,
      traditionalName: meta?.traditionalName ?? intlLabel ?? code,
    };
  });
}

/**
 * Get locale display name
 *
 * @param {string} localeCode - Locale code
 * @param {string} [displayLocale='en'] - Locale used for the display name language
 * @returns {string} - Human-readable locale name
 */
export function getLocaleDisplayName(localeCode, displayLocale = 'en') {
  const meta = LOCALE_DISPLAY_METADATA[localeCode];
  const displayName =
    meta?.label ||
    resolveIntlLocaleDisplayName(localeCode, displayLocale) ||
    localeCode;
  log(
    "localeManager.js",
    "getLocaleDisplayName",
    "return",
    "Returning locale display name",
    { localeCode, displayLocale, displayName }
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
// DEVELOPER CONSOLE API (dev only — S-01)
// =================================================================
// Expose locale management functions to window for local testing
if (typeof window !== "undefined" && import.meta.env.DEV) {
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
