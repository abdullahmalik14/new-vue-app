/**
 * LocaleManager - Locale resolution and management
 *
 * Handles locale selection with priority chain:
 * 1. URL (path or query parameter)
 * 2. Authenticated user profile (Cognito custom:preferred_locale)
 * 3. User manual selection (cached in Pinia / localStorage)
 * 4. Browser default
 * 5. Fallback to English
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
import {
  DEFAULT_LOCALE,
  LOCALE_DISPLAY_METADATA,
  RTL_LOCALES,
  SUPPORTED_LOCALES,
  getDocumentDirection,
} from "./localeConstants.js";

export {
  DEFAULT_LOCALE,
  LOCALE_DISPLAY_METADATA,
  RTL_LOCALES,
  SUPPORTED_LOCALES,
  getDocumentDirection,
} from "./localeConstants.js";

/**
 * Sync `<html lang>` and `<html dir>` for accessibility, SEO, and RTL layout.
 * @param {string} localeCode
 */
export function applyDocumentLocaleAttributes(localeCode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("lang", localeCode);
  document.documentElement.setAttribute("dir", getDocumentDirection(localeCode));
}

/**
 * First path segment if it is a supported locale (e.g. /vi/dashboard → vi).
 * L-14: Case-insensitive matching (e.g., /VI/dashboard, /En/dashboard → vi, en)
 *
 * @param {string} path
 * @param {string[]} [supportedLocales=SUPPORTED_LOCALES]
 * @returns {string|null}
 */
export function getLeadingLocaleFromPath(path, supportedLocales = SUPPORTED_LOCALES) {
  const segments = String(path || "").split("/").filter(Boolean);
  if (segments.length > 0) {
    const firstSegmentLower = segments[0].toLowerCase();
    if (supportedLocales.includes(firstSegmentLower)) {
      return firstSegmentLower;
    }
  }
  return null;
}

/**
 * Remove a leading locale segment from a path (L14 — avoid /vi/vi/... double prefix).
 * L-14: Case-insensitive matching for locale detection.
 *
 * @param {string} path
 * @param {string[]} [supportedLocales=SUPPORTED_LOCALES]
 * @returns {string}
 */
export function stripLeadingLocaleFromPath(path, supportedLocales = SUPPORTED_LOCALES) {
  const segments = String(path || "").split("/").filter(Boolean);
  if (segments.length > 0) {
    const firstSegmentLower = segments[0].toLowerCase();
    if (supportedLocales.includes(firstSegmentLower)) {
      const rest = segments.slice(1);
      return rest.length ? `/${rest.join("/")}` : "/";
    }
  }
  return path || "/";
}

/**
 * Strip a supported locale prefix before route-config slug lookup (L-11).
 * Alias for {@link stripLeadingLocaleFromPath} — use before `resolveRouteFromPath`.
 *
 * @param {string} path
 * @param {string[]} [supportedLocales=SUPPORTED_LOCALES]
 * @returns {string}
 */
export function normalizeLocalizedPath(path, supportedLocales = SUPPORTED_LOCALES) {
  return stripLeadingLocaleFromPath(path, supportedLocales);
}

// Current active locale
let currentActiveLocale = null;

/** @type {import('vue-router').Router | null} */
let localeRouter = null;

const COGNITO_PREFERRED_LOCALE_ATTR = "custom:preferred_locale";

/**
 * Register the Vue Router instance for locale URL updates (L-10).
 * Called once from main.js after app.use(router).
 *
 * @param {import('vue-router').Router} router
 * @returns {void}
 */
export function registerLocaleRouter(router) {
  localeRouter = router;
}

/**
 * Keep localeManager's in-memory locale aligned with Pinia (L-12).
 * Wired from main.js whenever `localeStore.locale` changes.
 *
 * @param {string|null|undefined} localeCode
 * @returns {void}
 */
export function syncCurrentActiveLocaleFromStore(localeCode) {
  if (typeof localeCode === "string" && SUPPORTED_LOCALES.includes(localeCode)) {
    currentActiveLocale = localeCode;
    log(
      "localeManager.js",
      "syncCurrentActiveLocaleFromStore",
      "info",
      "Synced in-memory active locale from store",
      { localeCode }
    );
  }
}

/**
 * Read preferred locale from authenticated user (Cognito JWT / store mirror).
 * @returns {string | null}
 */
function getProfilePreferredLocaleFromAuth() {
  try {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      return null;
    }

    const fromUser = authStore.currentUser?.preferredLocale;
    const fromToken = authStore.currentUser?.raw?.[COGNITO_PREFERRED_LOCALE_ATTR];
    const raw =
      typeof fromUser === "string"
        ? fromUser
        : typeof fromToken === "string"
          ? fromToken
          : "";
    const code = raw.toLowerCase().trim();

    return SUPPORTED_LOCALES.includes(code) ? code : null;
  } catch {
    return null;
  }
}

/**
 * Align Pinia persisted locale with the resolved code.
 * @param {string} localeCode
 */
function syncLocaleStoreWithCode(localeCode) {
  try {
    const localeStore = useLocaleStore();
    if (localeStore.locale !== localeCode) {
      localeStore.setLocale(localeCode);
    }
  } catch {
    // Store may be unavailable during early boot
  }
}

/**
 * After auth restore, apply Cognito profile locale to store + in-memory active locale.
 *
 * If the locale store already holds a valid persisted preference, it takes priority
 * over the Cognito JWT claim. The JWT `custom:preferred_locale` can be stale
 * (Cognito attribute is updated via `savePreferredLocaleToCognito`, but the local
 * JWT is not re-issued until the next token refresh). Overriding a fresh
 * localStorage value with a stale token claim caused L-17 (language revert on reload).
 *
 * @returns {string | null}
 */
export function applyProfileLocaleToStoreIfAuthenticated() {
  const profileLocale = getProfilePreferredLocaleFromAuth();
  if (!profileLocale) {
    return null;
  }

  try {
    const localeStore = useLocaleStore();
    if (localeStore.locale && SUPPORTED_LOCALES.includes(localeStore.locale)) {
      currentActiveLocale = localeStore.locale;
      log(
        "localeManager.js",
        "applyProfileLocaleToStoreIfAuthenticated",
        "info",
        "Persisted store locale takes priority over Cognito JWT claim (L-17)",
        { storedLocale: localeStore.locale, profileLocale }
      );
      return localeStore.locale;
    }
  } catch {
    // Store unavailable during early boot — fall through to profile locale
  }

  syncLocaleStoreWithCode(profileLocale);
  currentActiveLocale = profileLocale;
  return profileLocale;
}

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

    // 2. Authenticated profile (Cognito)
    // L-17: Only use profile locale when the local store has no explicit preference.
    // The JWT `custom:preferred_locale` can be stale until the token is refreshed,
    // so an explicitly persisted store value (from a user-initiated setLocale call)
    // takes priority over the Cognito claim.
    const profileLocale = getProfilePreferredLocaleFromAuth();
    if (profileLocale) {
      try {
        const localeStore = useLocaleStore();
        const storedLocale = localeStore.locale;
        if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale)) {
          log(
            "localeManager.js",
            "resolveActiveLocale",
            "info",
            "Persisted store locale takes priority over Cognito profile (L-17)",
            { storedLocale, profileLocale }
          );
          currentActiveLocale = storedLocale;
          return storedLocale;
        }
      } catch {
        // Store unavailable — fall through to use profile locale
      }

      syncLocaleStoreWithCode(profileLocale);

      log(
        "localeManager.js",
        "resolveActiveLocale",
        "info",
        "Locale resolved from user profile (no local preference)",
        { locale: profileLocale }
      );

      currentActiveLocale = profileLocale;
      log(
        "localeManager.js",
        "resolveActiveLocale",
        "return",
        "Returning profile locale",
        { locale: profileLocale }
      );
      return profileLocale;
    }

    // 3. Check persisted user selection (from Pinia store)
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

    // 4. Check browser language
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

    // 5. Use default fallback
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
 * Resolve locale for resource loading during a pending Vue Router navigation.
 * Uses the destination route (`to.path` / `to.params.locale`), not
 * `window.location.pathname` (still the previous URL until navigation commits).
 *
 * @param {{ path?: string, params?: { locale?: string } }} to - Destination route location
 * @returns {string}
 */
export function resolveActiveLocaleForNavigation(to) {
  const paramLocale = to?.params?.locale;
  if (
    typeof paramLocale === "string" &&
    SUPPORTED_LOCALES.includes(paramLocale)
  ) {
    log(
      "localeManager.js",
      "resolveActiveLocaleForNavigation",
      "return",
      "Returning locale from route params",
      { locale: paramLocale, path: to?.path }
    );
    return paramLocale;
  }

  const pathLocale = getLeadingLocaleFromPath(to?.path);
  if (pathLocale) {
    log(
      "localeManager.js",
      "resolveActiveLocaleForNavigation",
      "return",
      "Returning locale from destination path",
      { locale: pathLocale, path: to?.path }
    );
    return pathLocale;
  }

  const tempLocale = getTemporaryPageLocale();
  if (tempLocale) {
    log(
      "localeManager.js",
      "resolveActiveLocaleForNavigation",
      "return",
      "Returning temporary page locale",
      { locale: tempLocale, path: to?.path }
    );
    return tempLocale;
  }

  return resolveActiveLocale();
}

/**
 * Get locale from URL path or query parameter
 * Checks first: query parameter (?locale=vi)
 * Then: first path segment (e.g., /vi/dashboard → 'vi')
 * (L-13: Implemented query parameter support matching documented behavior)
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
    // L-13: Check query parameter first (?locale=vi)
    if (typeof window !== "undefined" && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      const queryLocale = searchParams.get("locale");
      if (queryLocale) {
        const normalizedQueryLocale = queryLocale.toLowerCase().trim();
        if (SUPPORTED_LOCALES.includes(normalizedQueryLocale)) {
          log(
            "localeManager.js",
            "getLocaleFromUrl",
            "info",
            "Found locale in query parameter",
            { locale: normalizedQueryLocale }
          );
          log(
            "localeManager.js",
            "getLocaleFromUrl",
            "return",
            "Returning query locale",
            { locale: normalizedQueryLocale }
          );
          return normalizedQueryLocale;
        }
        log(
          "localeManager.js",
          "getLocaleFromUrl",
          "warn",
          "Invalid locale in query parameter",
          { queryLocale, supportedLocales: SUPPORTED_LOCALES }
        );
      }
    }

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
  const { updateUrl = true, syncProfile = true } = options;

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

  // Update document language and text direction for accessibility/SEO/RTL
  applyDocumentLocaleAttributes(localeCode);

  // Update URL before translation I/O so router guards use persisted locale (L-10)
  if (updateUrl) {
    await updateUrlWithLocale(localeCode);
  }

  // Clear translation caches and reload current section for new locale
  try {
    // Dynamic import to avoid circular dependency
    const {
      clearTranslationCaches,
      loadBaseTranslations,
      loadTranslationsForSection,
    } = await import("./translationLoader.js");
    clearTranslationCaches();
    await loadBaseTranslations(localeCode);
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

  if (syncProfile) {
    try {
      const { syncPreferredLocaleToProfile } = await import("./userLocaleProfile.js");
      await syncPreferredLocaleToProfile(localeCode);
    } catch (error) {
      log(
        "localeManager.js",
        "setActiveLocale",
        "warn",
        "Failed to sync locale to user profile",
        { localeCode, error: error?.message }
      );
    }
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

  notifyLocaleUiChanged(localeCode);

  log("localeManager.js", "setActiveLocale", "return", "Returning success", {
    localeCode,
    success: true,
  });
  return true;
}

/**
 * Get the Vite base URL from import.meta.env.BASE_URL.
 * L-15: Handles subpath deployments correctly.
 * @returns {string}
 */
function getBaseUrl() {
  try {
    return import.meta.env.BASE_URL || "/";
  } catch {
    return "/";
  }
}

/**
 * Strip base URL from path if present.
 * L-15: Helper to handle subpath deployments.
 * @param {string} path
 * @returns {string}
 */
function stripBaseUrlFromPath(path) {
  const baseUrl = getBaseUrl();
  if (baseUrl && baseUrl !== "/" && path.startsWith(baseUrl)) {
    return path.slice(baseUrl.length - 1) || "/"; // Keep leading slash
  }
  return path;
}

/**
 * Build a pathname with the locale prefix applied or removed.
 * L-15: Uses Vue Router resolution when available to respect BASE_URL in subpath deployments.
 *
 * @param {string} currentPath
 * @param {string} localeCode
 * @returns {string}
 */
function buildPathWithLocalePrefix(currentPath, localeCode) {
  // L-15: Strip base URL before processing to avoid double-prefixing in subpath deployments
  const baseUrl = getBaseUrl();
  const pathWithoutBase = stripBaseUrlFromPath(currentPath);
  const pathParts = pathWithoutBase.split("/").filter((part) => part.length > 0);
  const hasLocaleInPath = Boolean(getLeadingLocaleFromPath(pathWithoutBase));

  let resultPath;
  if (localeCode === DEFAULT_LOCALE) {
    resultPath = hasLocaleInPath
      ? stripLeadingLocaleFromPath(pathWithoutBase)
      : pathWithoutBase;
  } else if (hasLocaleInPath) {
    pathParts[0] = localeCode;
    resultPath = "/" + pathParts.join("/");
  } else {
    resultPath = "/" + localeCode + pathWithoutBase;
  }

  // L-15: Prepend base URL back for non-router fallback cases
  // When using router.replace(), router handles base URL automatically
  // For window.history.pushState fallback, we need to include base URL
  if (baseUrl && baseUrl !== "/" && !localeRouter) {
    return baseUrl.replace(/\/$/, "") + resultPath;
  }

  return resultPath;
}

/**
 * Path used for locale URL rewrites. Vue Router optional `/:locale?` routes often expose
 * `route.path` as the slug only (`/log-in`) while `params.locale` holds the prefix (`vi`)
 * and the browser URL is `/vi/log-in`. Using `route.path` alone skips `router.replace`
 * when switching back to the default locale (L-10 follow-up).
 * L-15: Handles base URL correctly for subpath deployments.
 *
 * @param {{ path?: string, params?: { locale?: string }, fullPath?: string } | undefined} route
 * @returns {string}
 */
function resolveLocalizedPathFromRoute(route) {
  const locationPath =
    typeof window !== "undefined" ? window.location.pathname : "";

  // L-15: Strip base URL to get the actual route path for locale detection
  const locationPathWithoutBase = stripBaseUrlFromPath(locationPath);

  // Visible browser URL wins — route.path may be slug-only while URL still has /vi/…
  if (getLeadingLocaleFromPath(locationPathWithoutBase)) {
    return locationPathWithoutBase;
  }

  if (!route) {
    return locationPathWithoutBase || "/";
  }

  // L-14: Case-insensitive locale param matching
  const localeParam = route.params?.locale;
  const basePath = stripLeadingLocaleFromPath(route.path || "/") || "/";

  if (typeof localeParam === "string") {
    const normalizedLocale = localeParam.toLowerCase();
    if (SUPPORTED_LOCALES.includes(normalizedLocale)) {
      if (normalizedLocale === DEFAULT_LOCALE) {
        return basePath;
      }
      return basePath === "/" ? `/${normalizedLocale}` : `/${normalizedLocale}${basePath}`;
    }
  }

  if (getLeadingLocaleFromPath(route.path)) {
    return route.path;
  }

  const fullPath = route.fullPath?.split("?")[0]?.split("#")[0];
  if (fullPath && getLeadingLocaleFromPath(fullPath)) {
    return fullPath;
  }

  return route.path || locationPathWithoutBase || "/";
}

/**
 * Update URL with locale in path
 * Injects or updates locale as first path segment (e.g., /dashboard → /vi/dashboard)
 * For default locale (en), removes locale prefix from URL
 *
 * @param {string} localeCode - Locale code
 * @returns {Promise<void>}
 */
async function updateUrlWithLocale(localeCode) {
  log(
    "localeManager.js",
    "updateUrlWithLocale",
    "start",
    "Updating URL with locale",
    { localeCode }
  );

  try {
    const currentRoute = localeRouter?.currentRoute?.value;
    const currentPath = resolveLocalizedPathFromRoute(currentRoute);
    const newPath = buildPathWithLocalePrefix(currentPath, localeCode);
    const browserPath =
      typeof window !== "undefined" ? window.location.pathname : currentPath;
    const browserPathWithoutBase = stripBaseUrlFromPath(browserPath);

    if (localeRouter && currentRoute) {
      if (browserPathWithoutBase !== newPath || currentPath !== newPath) {
        await localeRouter.replace({
          path: newPath,
          query: currentRoute.query,
          hash: currentRoute.hash,
        });
      }

      log(
        "localeManager.js",
        "updateUrlWithLocale",
        "success",
        "URL updated via Vue Router replace",
        {
          localeCode,
          oldPath: currentPath,
          newPath,
          isDefaultLocale: localeCode === DEFAULT_LOCALE,
        }
      );
    } else {
      const search = window.location.search;
      const hash = window.location.hash;
      // L-15: newPath already includes base URL when localeRouter is not available
      const newUrl = newPath + search + hash;

      window.history.pushState({}, "", newUrl);

      import("./hreflangTags.js")
        .then(({ syncHreflangTagsForPath }) => {
          syncHreflangTagsForPath(newPath, { enabled: true });
        })
        .catch(() => {});

      log(
        "localeManager.js",
        "updateUrlWithLocale",
        "success",
        "URL updated with locale in path (pushState fallback)",
        {
          localeCode,
          oldPath: currentPath,
          newPath: newUrl,
          isDefaultLocale: localeCode === DEFAULT_LOCALE,
        }
      );
    }

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
    const { loadBaseTranslations, loadTranslationsForSection } = await import(
      "./translationLoader.js"
    );
    const basePromise = loadBaseTranslations(localeCode);

    const resolvedSection =
      sectionName || (await resolveSectionFromRoutePath(routePath));

    if (!resolvedSection) {
      if (awaitTranslations) {
        await basePromise;
      }
      log(
        "localeManager.js",
        "loadTranslationsForTemporaryLocale",
        "info",
        "No section resolved for temporary locale translation load",
        { localeCode, routePath }
      );
      return;
    }

    const loadPromise = basePromise.then(() =>
      loadTranslationsForSection(resolvedSection, localeCode)
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

  // Update document language and text direction for accessibility/SEO/RTL
  applyDocumentLocaleAttributes(localeCode);

  if (loadTranslations) {
    await loadTranslationsForTemporaryLocale(localeCode, {
      sectionName,
      routePath,
      awaitTranslations,
    });
  }

  notifyLocaleUiChanged(localeCode, { temporary: true });

  log(
    "localeManager.js",
    "applyLocaleTemporarily",
    "return",
    "Locale applied temporarily (not persisted)",
    { localeCode, loadTranslations, awaitTranslations }
  );
}

/** sessionStorage key for one-time page translation (F-03). */
export const TEMP_LOCALE_SESSION_KEY = "app_temp_locale";

/** sessionStorage key for locale to restore after temporary translation ends. */
export const TEMP_LOCALE_BASE_KEY = "app_temp_locale_base";

/**
 * Clear temporary translation keys after a full page reload (new tab starts empty).
 */
export function clearTemporaryPageLocaleOnReload() {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
    return;
  }

  const nav = performance.getEntriesByType?.("navigation")?.[0];
  if (nav?.type === "reload") {
    sessionStorage.removeItem(TEMP_LOCALE_SESSION_KEY);
    sessionStorage.removeItem(TEMP_LOCALE_BASE_KEY);
  }
}

/**
 * @returns {string|null}
 */
export function getTemporaryPageLocale() {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  const locale = sessionStorage.getItem(TEMP_LOCALE_SESSION_KEY);
  return locale && SUPPORTED_LOCALES.includes(locale) ? locale : null;
}

/**
 * @returns {string|null}
 */
export function getTemporaryPageLocaleBase() {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  const locale = sessionStorage.getItem(TEMP_LOCALE_BASE_KEY);
  return locale && SUPPORTED_LOCALES.includes(locale) ? locale : null;
}

/**
 * Whether the user is viewing a temporary page translation (not persisted preference).
 * @returns {boolean}
 */
export function isTemporaryPageLocaleActive() {
  return Boolean(getTemporaryPageLocale());
}

/**
 * Persisted locale preference (store/profile), without URL or temporary overrides.
 * @returns {string}
 */
export function getPersistedLocalePreference() {
  try {
    const localeStore = useLocaleStore();
    if (localeStore.locale && SUPPORTED_LOCALES.includes(localeStore.locale)) {
      return localeStore.locale;
    }
  } catch {
    // Store may be unavailable during early boot
  }

  const profileLocale = getProfilePreferredLocaleFromAuth();
  if (profileLocale) {
    return profileLocale;
  }

  return DEFAULT_LOCALE;
}

/**
 * Keep session temporary locale in sync when the URL carries a locale prefix.
 * URL locale that differs from persisted preference is treated as temporary (F-03).
 * @param {string} urlLocale
 */
export function syncTemporaryPageLocaleFromUrl(urlLocale) {
  if (!SUPPORTED_LOCALES.includes(urlLocale)) {
    return;
  }

  if (typeof sessionStorage === "undefined") {
    return;
  }

  const persistedLocale = getPersistedLocalePreference();

  if (urlLocale !== persistedLocale) {
    sessionStorage.setItem(TEMP_LOCALE_BASE_KEY, persistedLocale);
    sessionStorage.setItem(TEMP_LOCALE_SESSION_KEY, urlLocale);
  } else {
    sessionStorage.removeItem(TEMP_LOCALE_SESSION_KEY);
    sessionStorage.removeItem(TEMP_LOCALE_BASE_KEY);
  }
}

/**
 * Locale for router URL injection when the destination has no locale prefix.
 * Temporary page locale overrides persisted preference (F-03).
 * @returns {string}
 */
export function resolveLocaleForUrlInjection() {
  const tempLocale = getTemporaryPageLocale();
  if (tempLocale) {
    return tempLocale;
  }
  return getActiveLocale();
}

/**
 * Translate the current page once without changing persisted locale preference.
 * @param {string} localeCode
 * @param {{ sectionName?: string, routePath?: string }} [options]
 * @returns {Promise<void>}
 */
export async function translateCurrentPageTemporarily(
  localeCode,
  { sectionName, routePath } = {}
) {
  if (!SUPPORTED_LOCALES.includes(localeCode)) {
    return;
  }

  const baseLocale = getActiveLocale() || resolveActiveLocale();
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(TEMP_LOCALE_BASE_KEY, baseLocale);
    sessionStorage.setItem(TEMP_LOCALE_SESSION_KEY, localeCode);
  }

  await applyLocaleTemporarily(localeCode, {
    sectionName,
    routePath,
    loadTranslations: true,
    awaitTranslations: true,
  });
}

/**
 * End temporary page translation and restore the persisted/saved locale.
 * @returns {Promise<boolean>}
 */
export async function clearTemporaryPageLocaleAndRestore() {
  const baseLocale =
    getTemporaryPageLocaleBase() ||
    (() => {
      try {
        const localeStore = useLocaleStore();
        return localeStore.locale || DEFAULT_LOCALE;
      } catch {
        return DEFAULT_LOCALE;
      }
    })();

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(TEMP_LOCALE_SESSION_KEY);
    sessionStorage.removeItem(TEMP_LOCALE_BASE_KEY);
  }

  return setActiveLocale(baseLocale, { updateUrl: true, syncProfile: false });
}

/**
 * Re-apply session temporary locale during in-app navigation (same tab).
 * @param {string} routePath
 * @returns {Promise<void>}
 */
export async function reapplyTemporaryPageLocaleForRoute(routePath) {
  const tempLocale = getTemporaryPageLocale();
  if (!tempLocale) {
    return;
  }

  await applyLocaleTemporarily(tempLocale, {
    routePath,
    loadTranslations: true,
    awaitTranslations: false,
  });
}

/**
 * Normalize a locale code from a select value or UnifiedSelect option object.
 * @param {unknown} raw
 * @returns {string}
 */
export function extractLocaleSelection(raw) {
  if (raw == null) {
    return "";
  }
  if (typeof raw === "string") {
    return raw.toLowerCase().trim();
  }
  if (typeof raw === "object") {
    const value = raw.value ?? raw.code ?? raw.locale;
    if (typeof value === "string") {
      return value.toLowerCase().trim();
    }
  }
  return "";
}

/**
 * Locale for UI controls: URL path (browser or router), then in-memory active locale.
 * @param {string} [routePath]
 * @returns {string}
 */
export function getDisplayedLocale(routePath) {
  const browserPath =
    typeof window !== "undefined" ? window.location.pathname : "";
  const path = browserPath || routePath || "";
  const fromUrl = getLeadingLocaleFromPath(path);
  if (fromUrl) {
    return fromUrl;
  }
  return getActiveLocale();
}

/**
 * Notify locale switcher components to refresh their displayed value.
 * @param {string} localeCode
 * @param {Record<string, unknown>} [detail]
 */
export function notifyLocaleUiChanged(localeCode, detail = {}) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent("app-locale-changed", {
      detail: { locale: localeCode, ...detail },
    })
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

  try {
    const localeStore = useLocaleStore();
    if (localeStore.locale && SUPPORTED_LOCALES.includes(localeStore.locale)) {
      currentActiveLocale = localeStore.locale;
      log(
        "localeManager.js",
        "getActiveLocale",
        "return",
        "Returning locale from Pinia store",
        { locale: localeStore.locale }
      );
      return localeStore.locale;
    }
  } catch {
    // Store may be unavailable during early boot
  }

  const profileLocale = getProfilePreferredLocaleFromAuth();
  if (profileLocale) {
    syncLocaleStoreWithCode(profileLocale);
    currentActiveLocale = profileLocale;
    log(
      "localeManager.js",
      "getActiveLocale",
      "return",
      "Returning locale from user profile",
      { locale: profileLocale }
    );
    return profileLocale;
  }

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
export function toIntlLocaleTag(localeCode) {
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
      source: "profile",
      value: getProfilePreferredLocaleFromAuth(),
      priority: 2,
    },
    {
      source: "persisted",
      value: persistedLocale,
      priority: 3,
    },
    {
      source: "browser",
      value: getBrowserLocale(),
      priority: 4,
    },
    {
      source: "default",
      value: DEFAULT_LOCALE,
      priority: 5,
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
