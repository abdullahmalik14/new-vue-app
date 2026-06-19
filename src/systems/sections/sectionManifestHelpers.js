// src/systems/sections/sectionManifestHelpers.js

import { log } from "../../infrastructure/logging/logHandler.js";
import {
  fetchVerifiedManifest,
  MANIFEST_INTEGRITY_META,
} from "../build/manifestIntegrity.js";
import { isTrustedBundlePath } from "../build/bundlePathValidation.js";
/**
 * @file sectionManifestHelpers.js
 * @description Runtime section manifest fetch, cache, and bundle path resolution
 * @purpose Provides bundle paths for section preloading at runtime
 */

// Performance tracker available globally as window.performanceTracker

let cachedManifest = null;
let manifestPromise = null;

const MANIFEST_SESSION_KEY = "app-section-manifest";
const MANIFEST_MAX_RETRIES = 2;
const MANIFEST_RETRY_BASE_MS = 500;
const MANIFEST_URL = "/section-manifest.json";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getManifestFetchStatus(error) {
  const match = error?.message?.match(/Failed to fetch manifest .+: (\d{3})/);
  return match ? Number(match[1]) : null;
}

function isRetryableManifestError(error) {
  const status = getManifestFetchStatus(error);

  if (status !== null) {
    return status >= 500;
  }

  return error instanceof TypeError;
}

async function fetchProductionManifestWithRetry() {
  let lastError;

  for (let attempt = 0; attempt <= MANIFEST_MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delayMs = MANIFEST_RETRY_BASE_MS * 2 ** (attempt - 1);
        log(
          "sectionManifestHelpers.js",
          "fetchProductionManifestWithRetry",
          "retry",
          "Retrying manifest fetch",
          {
            attempt,
            delayMs,
          },
        );
        await sleep(delayMs);
      }

      // Use 'no-cache' (not 'force-cache') so the browser revalidates against
      // the server (via ETag / Last-Modified) on each load. With 'force-cache'
      // and an unhashed manifest URL, a stale cached body from a prior build
      // would mismatch the new build's <meta name="section-manifest-sri">
      // hash and trigger an SRI failure after every rebuild.
      return await fetchVerifiedManifest(
        MANIFEST_URL,
        MANIFEST_INTEGRITY_META.section,
        { cache: "no-cache" },
      );
    } catch (error) {
      lastError = error;

      if (
        !isRetryableManifestError(error) ||
        attempt === MANIFEST_MAX_RETRIES
      ) {
        throw error;
      }
    }
  }

  throw lastError;
}

async function markManifestLoadFailed(error) {
  console.error("[sectionManifestHelpers] Section manifest load failed:", error);

  try {
    const { usePreloadStore } = await import("../../stores/usePreloadStore.js");
    usePreloadStore().setManifestLoadFailed(true);
  } catch {
    // Pinia may not be ready during very early startup
  }
}

async function markManifestLoadRecovered() {
  try {
    const { usePreloadStore } = await import("../../stores/usePreloadStore.js");
    usePreloadStore().setManifestLoadFailed(false);
  } catch {
    // Pinia may not be ready during very early startup
  }
}

function resetManifestLoadState() {
  cachedManifest = null;
  manifestPromise = null;
}

function getManifestBuildHash() {
  return import.meta.env.VITE_BUILD_HASH || null;
}

function readManifestFromSession() {
  if (typeof sessionStorage === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(MANIFEST_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (parsed.buildHash !== getManifestBuildHash()) {
      return null;
    }

    if (!parsed.manifest || typeof parsed.manifest !== "object") {
      return null;
    }

    return parsed.manifest;
  } catch {
    return null;
  }
}

function persistManifestToSession(manifest) {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(
      MANIFEST_SESSION_KEY,
      JSON.stringify({
        buildHash: getManifestBuildHash(),
        manifest,
      }),
    );
  } catch {
    // Ignore quota / private-mode failures — in-memory cache still works
  }
}

/**
 * @function loadSectionManifest
 * @description Load section manifest from build output
 * @returns {Promise<object>} Section manifest with bundle paths
 */
export async function loadSectionManifest() {
  log(
    "sectionManifestHelpers.js",
    "loadSectionManifest",
    "start",
    "Loading section manifest",
    {},
  );
  window.performanceTracker?.step({
    step: "loadSectionManifest_start",
    file: "sectionManifestHelpers.js",
    method: "loadSectionManifest",
    flag: "start",
    purpose: "Load section manifest",
  });

  // Return cached manifest if available
  if (cachedManifest) {
    log(
      "sectionManifestHelpers.js",
      "loadSectionManifest",
      "cache-hit",
      "Returning cached manifest",
      {
        sectionCount: Object.keys(cachedManifest).length,
      },
    );
    window.performanceTracker?.step({
      step: "loadSectionManifest_cached",
      file: "sectionManifestHelpers.js",
      method: "loadSectionManifest",
      flag: "cache-hit",
      purpose: "Manifest served from cache",
    });
    return cachedManifest;
  }

  try {
    // In production, load from dist/section-manifest.json
    if (import.meta.env.PROD) {
      const sessionManifest = readManifestFromSession();
      if (sessionManifest) {
        cachedManifest = sessionManifest;

        log(
          "sectionManifestHelpers.js",
          "loadSectionManifest",
          "session-cache-hit",
          "Manifest loaded from sessionStorage",
          {
            sectionCount: Object.keys(cachedManifest).length,
          },
        );
        window.performanceTracker?.step({
          step: "loadSectionManifest_session_cached",
          file: "sectionManifestHelpers.js",
          method: "loadSectionManifest",
          flag: "session-cache-hit",
          purpose: "Manifest served from sessionStorage",
        });

        return cachedManifest;
      }

      if (!manifestPromise) {
        log(
          "sectionManifestHelpers.js",
          "loadSectionManifest",
          "fetch",
          "Fetching manifest from production build",
          {},
        );

        manifestPromise = (async () => {
          try {
            const manifest = await fetchProductionManifestWithRetry();
            cachedManifest = manifest;
            persistManifestToSession(manifest);
            await markManifestLoadRecovered();

            log(
              "sectionManifestHelpers.js",
              "loadSectionManifest",
              "success",
              "Manifest loaded from production",
              {
                sectionCount: Object.keys(manifest).length,
              },
            );
            window.performanceTracker?.step({
              step: "loadSectionManifest_complete",
              file: "sectionManifestHelpers.js",
              method: "loadSectionManifest",
              flag: "success",
              purpose: "Manifest loaded successfully",
            });

            return manifest;
          } catch (error) {
            log(
              "sectionManifestHelpers.js",
              "loadSectionManifest",
              "error",
              "Error loading manifest",
              {
                error: error.message,
                stack: error.stack,
              },
            );
            window.performanceTracker?.step({
              step: "loadSectionManifest_error",
              file: "sectionManifestHelpers.js",
              method: "loadSectionManifest",
              flag: "error",
              purpose: "Manifest load failed",
            });
            await markManifestLoadFailed(error);
            resetManifestLoadState();
            return {};
          } finally {
            manifestPromise = null;
          }
        })();
      }

      return manifestPromise;
    }

    // In development, load from dev stub so the full preload path can be exercised locally
    if (import.meta.env.DEV) {
      log(
        "sectionManifestHelpers.js",
        "loadSectionManifest",
        "dev",
        "Development mode, loading dev manifest stub",
        {},
      );
      window.performanceTracker?.step({
        step: "loadSectionManifest_dev",
        file: "sectionManifestHelpers.js",
        method: "loadSectionManifest",
        flag: "dev",
        purpose: "Development mode, loading stub manifest",
      });

      try {
        const r = await fetch("/section-manifest.dev.json");
        cachedManifest = r.ok ? await r.json() : {};
      } catch {
        cachedManifest = {};
      }

      return cachedManifest ?? {};
    }
  } catch (error) {
    log(
      "sectionManifestHelpers.js",
      "loadSectionManifest",
      "error",
      "Error loading manifest",
      {
        error: error.message,
        stack: error.stack,
      },
    );
    window.performanceTracker?.step({
      step: "loadSectionManifest_error",
      file: "sectionManifestHelpers.js",
      method: "loadSectionManifest",
      flag: "error",
      purpose: "Manifest load failed",
    });

    if (import.meta.env.PROD) {
      await markManifestLoadFailed(error);
    }

    // Return empty manifest on error (fail gracefully, stay retryable per Task 8)
    resetManifestLoadState();
    return {};
  }
}

/**
 * @function getSectionBundlePaths
 * @description Get bundle paths for a specific section
 * @param {string} sectionName - Section name
 * @param {object} manifest - Section manifest (optional, will load if not provided)
 * @returns {Promise<object>} Bundle paths { js, css } or null
 */
export async function getSectionBundlePaths(sectionName, manifest) {
  log(
    "sectionManifestHelpers.js",
    "getSectionBundlePaths",
    "start",
    "Getting bundle paths for section",
    { sectionName },
  );
  window.performanceTracker?.step({
    step: "getSectionBundlePaths_start",
    file: "sectionManifestHelpers.js",
    method: "getSectionBundlePaths",
    flag: "start",
    purpose: `Get bundle paths for section: ${sectionName}`,
  });

  try {
    // Load manifest if not provided (will be cached after first load)
    const manifestData = manifest || (await loadSectionManifest());

    // IMPORTANT: We only extract the specific section we need
    // The manifest contains all sections, but we only use the one requested
    const sectionEntry = manifestData[sectionName];

    if (!sectionEntry) {
      log(
        "sectionManifestHelpers.js",
        "getSectionBundlePaths",
        "not-found",
        "Section not found in manifest",
        {
          sectionName,
          availableSections:
            Object.keys(manifestData).length + " sections available",
        },
      );
      window.performanceTracker?.step({
        step: "getSectionBundlePaths_not_found",
        file: "sectionManifestHelpers.js",
        method: "getSectionBundlePaths",
        flag: "not-found",
        purpose: "Section not in manifest",
      });
      return null;
    }

    // Handle string path (backward compatibility)
    if (typeof sectionEntry === "string") {
      if (!isTrustedBundlePath(sectionEntry)) {
        log(
          "sectionManifestHelpers.js",
          "getSectionBundlePaths",
          "untrusted-path",
          "Untrusted JS bundle path rejected",
          {
            sectionName,
            path: sectionEntry,
          },
        );
        return null;
      }

      const paths = { js: sectionEntry, css: null, integrity: null };
      log(
        "sectionManifestHelpers.js",
        "getSectionBundlePaths",
        "success",
        "Bundle paths resolved (string format)",
        { sectionName, paths },
      );
      window.performanceTracker?.step({
        step: "getSectionBundlePaths_complete",
        file: "sectionManifestHelpers.js",
        method: "getSectionBundlePaths",
        flag: "success",
        purpose: "Paths resolved",
      });
      return paths;
    }

    // Handle object with js and css paths
    if (typeof sectionEntry === "object") {
      const paths = {
        js: sectionEntry.js || sectionEntry.path || null,
        css: sectionEntry.css || null,
        integrity: sectionEntry.integrity || null,
      };

      if (
        (paths.js && !isTrustedBundlePath(paths.js)) ||
        (paths.css && !isTrustedBundlePath(paths.css))
      ) {
        log(
          "sectionManifestHelpers.js",
          "getSectionBundlePaths",
          "untrusted-path",
          "Untrusted bundle path rejected",
          {
            sectionName,
            js: paths.js,
            css: paths.css,
          },
        );
        return null;
      }

      log(
        "sectionManifestHelpers.js",
        "getSectionBundlePaths",
        "success",
        "Bundle paths resolved (object format)",
        { sectionName, paths },
      );
      window.performanceTracker?.step({
        step: "getSectionBundlePaths_complete",
        file: "sectionManifestHelpers.js",
        method: "getSectionBundlePaths",
        flag: "success",
        purpose: "Paths resolved",
      });
      return paths;
    }

    log(
      "sectionManifestHelpers.js",
      "getSectionBundlePaths",
      "invalid",
      "Invalid section entry format",
      { sectionName, entryType: typeof sectionEntry },
    );
    return null;
  } catch (error) {
    log(
      "sectionManifestHelpers.js",
      "getSectionBundlePaths",
      "error",
      "Error getting bundle paths",
      {
        sectionName,
        error: error.message,
        stack: error.stack,
      },
    );
    window.performanceTracker?.step({
      step: "getSectionBundlePaths_error",
      file: "sectionManifestHelpers.js",
      method: "getSectionBundlePaths",
      flag: "error",
      purpose: "Failed to get paths",
    });
    return null;
  }
}

/**
 * @function clearManifestCache
 * @description Clear cached manifest (useful for testing)
 * @returns {void}
 */
export function clearManifestCache() {
  log(
    "sectionManifestHelpers.js",
    "clearManifestCache",
    "clear",
    "Clearing manifest cache",
    {},
  );
  window.performanceTracker?.step({
    step: "clearManifestCache",
    file: "sectionManifestHelpers.js",
    method: "clearManifestCache",
    flag: "clear",
    purpose: "Clear manifest cache",
  });

  cachedManifest = null;
  manifestPromise = null;

  if (typeof sessionStorage !== "undefined") {
    try {
      sessionStorage.removeItem(MANIFEST_SESSION_KEY);
    } catch {
      // Ignore sessionStorage failures in restricted environments
    }
  }

  log(
    "sectionManifestHelpers.js",
    "clearManifestCache",
    "success",
    "Manifest cache cleared",
    {},
  );
}
