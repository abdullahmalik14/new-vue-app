/**
 * Main Application Entry Point
 *
 * Initializes:
 * - Performance tracker
 * - Pinia store with persistence
 * - Vue I18n for translations
 * - Vue Router
 * - Auth session restoration
 * - Section preloading
 * - Global error handling
 */

import { createApp, watch } from "vue";
import { createPinia, storeToRefs } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { useDashboardAnalytics } from "./stores/DashboardAnalytics";
import flowRefreshManager from "@/services/flow-system/flowRefreshManager";
import { createI18n } from "vue-i18n";
import "./assets/styles/rtl-foundation.css";
import App from "./App.vue";
import router from "./router/index.js";
import { log } from "./utils/common/logHandler.js";
import PerfTracker from "./utils/common/performanceTracker.js";
import {
  resolveActiveLocale,
  normalizeLocalizedPath,
  applyDocumentLocaleAttributes,
  clearTemporaryPageLocaleOnReload,
  applyProfileLocaleToStoreIfAuthenticated,
  registerLocaleRouter,
  syncCurrentActiveLocaleFromStore,
} from "./utils/translation/localeManager.js";

clearTemporaryPageLocaleOnReload();
import {
  I18N_DATETIME_FORMATS,
  I18N_NUMBER_FORMATS,
} from "./utils/translation/localeFormatConfig.js";
import { loadTranslationsForSection, loadBaseTranslations } from "./utils/translation/translationLoader.js";
import { useAuthStore } from "./stores/useAuthStore.js";
import { useLocaleStore } from "./stores/useLocaleStore.js";
import {
  getRoutePreloadPlan,
  preloadDefaultAuthSection,
  resolveCurrentRouteSectionName,
  shouldPreloadDefaultAuthSection,
  startBackgroundSectionPreloads,
} from "./utils/section/sectionPreloadOrchestrator.js";
import buildConfig from "../build/buildConfig.js";
import {
  validateOnStartup,
  printEnvSummary,
} from "./utils/build/envValidator.js";
import { resolveRouteFromPath } from "./utils/route/routeResolver.js";
import { registerI18nInstance } from "./utils/translation/i18nInstance.js";
import breakpoints from "./utils/breakpoints.js";
import InteractionsPlugin from "./interactions/index.js";

// Import base styles
import "./assets/main.css";
import "./assets/route-transitions.css";

// Initialize mock API and utilities
import { initUtilities } from "@/lib/mock-api-demo/utilities/index.js";
import "@/lib/mock-api-demo/apiWrapper.js";
import { initMockCartApi } from "@/services/cart/mockCartBackend.js";
import FlowHandler from "./services/flow-system/FlowHandler";
import { useCartStore } from "./stores/useCartStore";
import { useChatStore } from "./stores/useChatStore";
import { usePreloadStore } from "./stores/usePreloadStore.js";
import { syncPreloadStoreBuildHash } from "./utils/build/appBuildHash.js";

// Initialize the mock cart backend interceptor
initMockCartApi();

// =================================================================
// GLOBAL PERFORMANCE TRACKER - INITIALIZE FIRST
// =================================================================
// Create global performance tracker instance (initialized once as first global)
// This MUST be the first thing initialized before any other imports or logic
if (typeof window !== "undefined") {
  try {
    const tracker = new PerfTracker("VueApp-SectionBased", {
      enabled: import.meta.env.VITE_ENABLE_PERFORMANCE_TRACKING === "true",
    });
    tracker.start();
    window.performanceTracker = tracker;
  } catch (e) {
    // Fall back to a no-op tracker to keep calls safe
    window.performanceTracker = {
      step() {},
      start() {},
      table() {
        return [];
      },
    };
  }

  // Also expose as global variable for convenience
  // This allows both window.performanceTracker and performanceTracker references
  globalThis.performanceTracker = window.performanceTracker;
}

// Initialize performance tracker
log("main.js", "init", "start", "Initializing application", {});

// Validate environment variables before proceeding
// This ensures all required env vars are present and valid
try {
  const envValidation = validateOnStartup();

  // Print summary in development mode
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_LOGGER === "true") {
    printEnvSummary(import.meta.env.MODE || "development");
  }

  // Log validation results
  console.log("✅ Environment validation passed:", {
    environment: envValidation.environment,
    valid: envValidation.valid,
    errorCount: envValidation.errors.length,
    warningCount: envValidation.warnings.length,
  });
} catch (error) {
  console.error("❌ Environment validation failed:", error.message);
  console.error(
    "Please check your .env file and ensure all required variables are set.",
  );
  console.error("See .env.example for reference.");
  // Don't throw - allow app to continue with warnings in dev mode
  if (!import.meta.env.DEV) {
    throw error; // But do throw in production
  }
}

if (window.performanceTracker) {
  window.performanceTracker.step({
    step: "appInit_start",
    file: "main.js",
    method: "main",
    flag: "init",
    purpose: "Initialize Vue application",
  });
}

// Create Vue app instance
const app = createApp(App);

// Create and configure Pinia store
if (window.performanceTracker) {
  window.performanceTracker.step({
    step: "initPinia_start",
    file: "main.js",
    method: "main",
    flag: "store",
    purpose: "Initialize Pinia store",
  });
}

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// Register Pinia stores with FlowHandler so piniaAction destinations work
FlowHandler.configure({
  piniaStores: {
    chat: useChatStore(pinia),
    cart: useCartStore(pinia),
    dashboard: useDashboardAnalytics(pinia),
  },
});

// Initialize Dashboard Analytics
const dashboardStore = useDashboardAnalytics(pinia);
window.dashboardStore = dashboardStore;
const { earnings } = storeToRefs(dashboardStore);

// Load analytics data immediately using the new data pipeline
try {
  flowRefreshManager.startFromRegistry("analytics.fetch", { source: "full" });
  console.log("Dashboard Analytics pipeline started in main.js");
} catch (error) {
  console.error("Failed to start analytics pipeline in main.js:", error);
}

log("main.js", "init", "pinia", "Pinia initialized with persistence", {});

// If the build hash has changed since last session, clear all preloaded section state
// so stale chunk names from the previous deploy don't cause ghost cache hits
const preloadStore = usePreloadStore();
const buildHashSync = syncPreloadStoreBuildHash(preloadStore);
if (buildHashSync.invalidated) {
  log("main.js", "init", "build-hash", "New deploy detected — preload state cleared", {
    previousHash: buildHashSync.previousHash,
    currentHash: buildHashSync.currentBuildHash,
  });
}

// Initialize utilities (requires Pinia to be active)
try {
  initUtilities();
  log("main.js", "init", "utilities", "App utilities initialized", {});
} catch (error) {
  log("main.js", "init", "utilities-error", "Failed to initialize utilities", {
    error: error.message,
  });
  console.error("Failed to initialize app utilities:", error);
}

if (window.performanceTracker) {
  window.performanceTracker.step({
    step: "initPinia_complete",
    file: "main.js",
    method: "main",
    flag: "store",
    purpose: "Pinia store ready",
  });
}

// Create and configure Vue I18n
if (window.performanceTracker) {
  window.performanceTracker.step({
    step: "initI18n_start",
    file: "main.js",
    method: "main",
    flag: "i18n",
    purpose: "Initialize Vue I18n",
  });
}

// Resolve active locale
const activeLocale = resolveActiveLocale();

log("main.js", "init", "locale", "Locale resolved", { locale: activeLocale });

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: activeLocale,
  fallbackLocale: "en",
  numberFormats: I18N_NUMBER_FORMATS,
  datetimeFormats: I18N_DATETIME_FORMATS,
  messages: {
    // Messages will be loaded lazily per section
    en: {},
    vi: {},
  },
});

// Register i18n instance for global utilities
registerI18nInstance(i18n);

// Sync locale store with i18n instance and document language
const localeStore = useLocaleStore(pinia);
const initialLocale = localeStore.locale || activeLocale;

if (!localeStore.locale) {
  localeStore.setLocale(initialLocale);
}

syncCurrentActiveLocaleFromStore(localeStore.locale || initialLocale);

if (i18n.global.locale.value !== initialLocale) {
  i18n.global.locale.value = initialLocale;
}

if (typeof document !== "undefined") {
  applyDocumentLocaleAttributes(initialLocale);
}

watch(
  () => localeStore.locale,
  (newLocale) => {
    if (!newLocale) {
      return;
    }

    syncCurrentActiveLocaleFromStore(newLocale);

    if (i18n.global.locale.value !== newLocale) {
      i18n.global.locale.value = newLocale;
    }

    if (typeof document !== "undefined") {
      applyDocumentLocaleAttributes(newLocale);
    }
  },
  { immediate: false },
);

app.use(i18n);

log("main.js", "init", "i18n", "Vue I18n initialized", {
  locale: activeLocale,
});

if (window.performanceTracker) {
  window.performanceTracker.step({
    step: "initI18n_complete",
    file: "main.js",
    method: "main",
    flag: "i18n",
    purpose: "I18n ready",
  });
}

// Configure router
if (window.performanceTracker) {
  window.performanceTracker.step({
    step: "initRouter_start",
    file: "main.js",
    method: "main",
    flag: "router",
    purpose: "Initialize Vue Router",
  });
}

app.use(router);
registerLocaleRouter(router);
app.use(InteractionsPlugin);

// Register global breakpoints utility
app.config.globalProperties.$breakpoints = breakpoints.state;

log("main.js", "init", "router", "Vue Router initialized", {});

if (window.performanceTracker) {
  window.performanceTracker.step({
    step: "initRouter_complete",
    file: "main.js",
    method: "main",
    flag: "router",
    purpose: "Router ready",
  });
}

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  log("main.js", "errorHandler", "error", "Global error caught", {
    error: err.message,
    info,
    stack: err.stack,
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: "globalError",
      file: "main.js",
      method: "errorHandler",
      flag: "error",
      purpose: `Error: ${err.message}`,
    });
  }

  // Always log to console (even in production for debug purposes)
  console.error("[Vue Error]", err);
};

// Global warning handler
app.config.warnHandler = (msg, instance, trace) => {
  log("main.js", "warnHandler", "warn", "Vue warning", { message: msg, trace });

  if (import.meta.env.DEV) {
    console.warn("[Vue Warning]", msg);
  }
};

// Restore auth session before mount
if (window.performanceTracker) {
  window.performanceTracker.step({
    step: "restoreSession_start",
    file: "main.js",
    method: "main",
    flag: "auth",
    purpose: "Restore user session",
  });
}

log("main.js", "init", "auth", "Restoring user session", {});

// Get auth store and restore from persisted storage
const authStore = useAuthStore();
authStore.refreshFromStorage();

if (authStore.isAuthenticated) {
  const profileLocale = applyProfileLocaleToStoreIfAuthenticated();
  if (profileLocale) {
    if (i18n.global.locale.value !== profileLocale) {
      i18n.global.locale.value = profileLocale;
    }
    applyDocumentLocaleAttributes(profileLocale);
    log("main.js", "init", "locale-profile", "Applied Cognito profile locale after auth restore", {
      locale: profileLocale,
    });
  }

  log("main.js", "init", "auth-success", "Session restored successfully", {
    email: authStore.currentUser?.email,
    role: authStore.currentUser?.role,
  });
  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: "restoreSession_success",
      file: "main.js",
      method: "main",
      flag: "auth",
      purpose: "User session restored",
    });
  }
} else {
  log("main.js", "init", "auth-none", "No session to restore", {});
  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: "restoreSession_none",
      file: "main.js",
      method: "main",
      flag: "auth",
      purpose: "No existing session",
    });
  }
}

// Preload sections based on current route (non-blocking)
if (window.performanceTracker) {
  window.performanceTracker.step({
    step: "preloadSections_start",
    file: "main.js",
    method: "main",
    flag: "preload",
    purpose: "Preload sections for current route",
  });
}

// Preload sections based on current route (non-blocking — after router.isReady, before/after mount)
function startStartupPreloadForCurrentRoute() {
  const rawPath = router.currentRoute.value.path;
  const currentPath = normalizeLocalizedPath(rawPath);
  const currentRoute = resolveRouteFromPath(currentPath);
  const userRoleForPreload = authStore.currentUser?.role || "guest";

  const currentSectionName = currentRoute
    ? resolveCurrentRouteSectionName(currentRoute, userRoleForPreload)
    : null;
  const { resolved: baseSectionsToPreload } = getRoutePreloadPlan(
    currentRoute,
    userRoleForPreload,
  );
  const sectionsToPreload =
    currentSectionName && !baseSectionsToPreload.includes(currentSectionName)
      ? [...baseSectionsToPreload, currentSectionName]
      : baseSectionsToPreload;

  if (
    currentSectionName &&
    currentRoute?.section &&
    !baseSectionsToPreload.includes(currentSectionName)
  ) {
    log(
      "main.js",
      "init",
      "preload-current",
      "Added current section to preload list",
      {
        section: currentSectionName,
      },
    );
  }

  if (
    shouldPreloadDefaultAuthSection({
      isAuthenticated: authStore.isAuthenticated,
      currentPath,
      resolvedSections: sectionsToPreload,
    })
  ) {
    preloadDefaultAuthSection({ file: "main.js", method: "init" });
  }

  if (currentRoute) {
    log(
      "main.js",
      "init",
      "preload",
      "Preloading sections for current route",
      {
        path: currentPath,
        sections: sectionsToPreload,
        routeConfigSlug: currentRoute.slug,
      },
    );

    if (currentSectionName) {
      log(
        "main.js",
        "init",
        "translation-preload",
        "Loading translations for current section",
        {
          section: currentSectionName,
        },
      );

      if (window.performanceTracker) {
        window.performanceTracker.step({
          step: "initialTranslationLoad_start",
          file: "main.js",
          method: "main",
          flag: "translation-preload",
          purpose: `Load translations for ${currentSectionName}`,
        });
      }

      loadTranslationsForSection(currentSectionName)
        .then(() => {
          log(
            "main.js",
            "init",
            "translation-preloaded",
            "Translations loaded for current section",
            {
              section: currentSectionName,
            },
          );

          if (window.performanceTracker) {
            window.performanceTracker.step({
              step: "initialTranslationLoad_complete",
              file: "main.js",
              method: "main",
              flag: "translation-ready",
              purpose: `Translations ready for ${currentSectionName}`,
            });
          }
        })
        .catch((err) => {
          log(
            "main.js",
            "init",
            "translation-preload-error",
            "Translation preload failed (non-blocking)",
            {
              section: currentSectionName,
              error: err.message,
            },
          );
        });
    }

    if (sectionsToPreload.length > 0) {
      startBackgroundSectionPreloads({
        sections: sectionsToPreload,
        logContext: { file: "main.js", method: "init" },
        path: currentPath,
      }).then(() => {
        log(
          "main.js",
          "init",
          "preload-complete",
          "Route sections preloaded",
          {
            path: currentPath,
            count: sectionsToPreload.length,
          },
        );
        if (window.performanceTracker) {
          window.performanceTracker.step({
            step: "preloadSections_complete",
            file: "main.js",
            method: "main",
            flag: "preload",
            purpose: `Preloaded ${sectionsToPreload.length} sections for ${currentPath}`,
          });
        }
      });
    } else {
      log(
        "main.js",
        "init",
        "preload-skip",
        "No sections to preload for current route",
        {
          path: currentPath,
          hasPreLoadSections: !!currentRoute.preLoadSections,
          preLoadSectionsValue: currentRoute.preLoadSections,
        },
      );
    }
  } else {
    log(
      "main.js",
      "init",
      "preload-skip",
      "No route config found for current path, skipping preload",
      {
        path: currentPath,
      },
    );
  }
}

async function mountApplication() {
  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: "mountApp_start",
      file: "main.js",
      method: "main",
      flag: "mount",
      purpose: "Mount Vue application to DOM",
    });
  }

  try {
    await router.isReady();
    startStartupPreloadForCurrentRoute();
  } catch (err) {
    log("main.js", "init", "router-ready-error", "Error waiting for router ready", {
      error: err.message,
    });
  }

  try {
    await loadBaseTranslations(localeStore.locale || activeLocale);
    log("main.js", "init", "base-translations", "Base UI translations loaded", {
      locale: localeStore.locale || activeLocale,
    });
  } catch (err) {
    log("main.js", "init", "base-translations-error", "Base UI translation load failed (non-blocking)", {
      error: err.message,
    });
  }

  app.mount("#app");

  log("main.js", "init", "mount", "Application mounted successfully", {});

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: "mountApp_complete",
      file: "main.js",
      method: "main",
      flag: "mount",
      purpose: "Application mounted",
    });
  }

  // Track app ready
  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: "appReady",
      file: "main.js",
      method: "main",
      flag: "ready",
      purpose: "Application initialization complete",
    });
  }

  // Log initialization summary
  log("main.js", "init", "complete", "Application initialization complete", {
    locale: activeLocale,
    isAuthenticated: authStore.isAuthenticated,
    currentPath: router.currentRoute.value.path,
  });

  // Print performance table if logging enabled
  if (
    import.meta.env.VITE_ENABLE_LOGGER === "true" &&
    window.performanceTracker
  ) {
    console.table(window.performanceTracker.table());
  }
}

mountApplication();
