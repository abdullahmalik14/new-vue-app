/**
 * Section CSS Loader
 *
 * Dynamically loads and injects CSS for sections at runtime.
 * Handles section CSS swapping when navigating between sections.
 * Supports lazy loading and preloading of section CSS.
 */

import { log } from "../../infrastructure/logging/logHandler.js";
import { logError } from "../../infrastructure/errors/errorHandler.js";
import { getSectionBundlePaths } from "../build/manifestLoader.js";
import {
  isTrustedBundlePath,
  escapeSelectorAttributeValue,
} from "../build/bundlePathValidation.js";

/**
 * Track loaded CSS files
 * Prevents duplicate loading and manages cleanup
 */
const loadedSectionCss = new Set();
const activeSectionCss = new Map(); // section -> link element
const preloadHintLinks = new Map(); // section -> preload hint link element
const preloadHintPromises = new Map(); // section -> Promise that resolves on link.onload

export function clearSectionCssPreloadHint(sectionName) {
  return removeSectionCssPreloadHint(sectionName);
}

function removeSectionCssPreloadHint(sectionName) {
  const hintLink = preloadHintLinks.get(sectionName);
  preloadHintPromises.delete(sectionName);

  if (hintLink && hintLink.parentNode) {
    hintLink.parentNode.removeChild(hintLink);
    preloadHintLinks.delete(sectionName);
    return true;
  }

  preloadHintLinks.delete(sectionName);
  return false;
}

function applyBundleLinkIntegrity(linkElement, integrity) {
  if (typeof integrity === "string" && integrity.length > 0) {
    linkElement.integrity = integrity;
  }
}

function normalizeCssBundlePath(rawPath) {
  const trimmed = rawPath.trim();

  if (trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `/${trimmed.replace(/^\/+/, "")}`;
}

/**
 * Get CSS bundle info for a section
 *
 * @param {string} sectionName - Section name
 * @returns {Promise<{ cssPath: string, integrity: string|null }|null>}
 */
async function getSectionCssBundle(sectionName) {
  log(
    "sectionCssLoader.js",
    "getSectionCssBundle",
    "start",
    "Getting CSS bundle for section",
    { sectionName },
  );

  try {
    const bundlePaths = await getSectionBundlePaths(sectionName);
    const rawPath = bundlePaths?.css;

    if (rawPath) {
      const normalized = normalizeCssBundlePath(rawPath);
      const integrity = bundlePaths.integrity?.css || null;

      if (!isTrustedBundlePath(normalized)) {
        logError(
          "sectionCssLoader.js",
          "getSectionCssBundle",
          "Untrusted CSS bundle path rejected",
          new Error("Untrusted path"),
          {
            sectionName,
            cssPath: normalized,
          },
        );
        return null;
      }

      log(
        "sectionCssLoader.js",
        "getSectionCssBundle",
        "success",
        "CSS bundle found",
        {
          sectionName,
          cssPath: normalized,
          hasIntegrity: !!integrity,
        },
      );

      return { cssPath: normalized, integrity };
    }

    log(
      "sectionCssLoader.js",
      "getSectionCssBundle",
      "not-found",
      "No CSS bundle for section",
      {
        sectionName,
      },
    );

    return null;
  } catch (error) {
    logError(
      "sectionCssLoader.js",
      "getSectionCssBundle",
      "Error getting CSS bundle",
      error,
      {
        sectionName,
      },
    );
    return null;
  }
}

/**
 * Get CSS path for a section
 *
 * @param {string} sectionName - Section name
 * @returns {Promise<string|null>} CSS file path or null
 */
async function getSectionCssPath(sectionName) {
  const bundle = await getSectionCssBundle(sectionName);
  return bundle?.cssPath ?? null;
}

/**
 * Inject CSS link element into document head
 *
 * @param {string} cssPath - Path to CSS file
 * @param {string} sectionName - Section name
 * @returns {Promise<HTMLLinkElement>} Link element
 */
async function injectCssLink(cssPath, sectionName, integrity = null) {
  log("sectionCssLoader.js", "injectCssLink", "start", "Injecting CSS link", {
    cssPath,
    sectionName,
  });

  if (!isTrustedBundlePath(cssPath)) {
    return Promise.reject(
      new Error(`Untrusted CSS bundle path for section: ${sectionName}`),
    );
  }

  return new Promise((resolve, reject) => {
    // Check if CSS is already loaded
    const existingLink = document.querySelector(
      `link[data-section="${escapeSelectorAttributeValue(sectionName)}"]`,
    );
    if (existingLink) {
      log(
        "sectionCssLoader.js",
        "injectCssLink",
        "exists",
        "CSS already loaded",
        { sectionName },
      );
      resolve(existingLink);
      return;
    }

    // Create link element
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = cssPath;
    applyBundleLinkIntegrity(linkElement, integrity);
    linkElement.setAttribute("data-section", sectionName);
    linkElement.setAttribute("data-section-css", "true");

    // Handle load success
    linkElement.onload = () => {
      log("sectionCssLoader.js", "injectCssLink", "success", "CSS loaded", {
        cssPath,
        sectionName,
      });

      if (window.performanceTracker) {
        window.performanceTracker.step({
          step: "sectionCss_loaded",
          file: "sectionCssLoader.js",
          method: "injectCssLink",
          flag: "success",
          purpose: `Section CSS loaded: ${sectionName}`,
        });
      }

      resolve(linkElement);
    };

    // Handle load error
    linkElement.onerror = (error) => {
      logError(
        "sectionCssLoader.js",
        "injectCssLink",
        "CSS load failed",
        error,
        {
          cssPath,
          sectionName,
        },
      );

      if (window.performanceTracker) {
        window.performanceTracker.step({
          step: "sectionCss_error",
          file: "sectionCssLoader.js",
          method: "injectCssLink",
          flag: "error",
          purpose: `Section CSS failed: ${sectionName}`,
        });
      }

      reject(new Error(`Failed to load CSS for section: ${sectionName}`));
    };

    // Append to head
    document.head.appendChild(linkElement);

    log(
      "sectionCssLoader.js",
      "injectCssLink",
      "appended",
      "CSS link appended to head",
      {
        cssPath,
        sectionName,
      },
    );
  });
}

/**
 * Load CSS for a section
 * Main entry point for loading section-specific CSS
 *
 * @param {string} sectionName - Section name
 * @returns {Promise<boolean>} True if loaded successfully
 */
export async function loadSectionCss(sectionName) {
  log(
    "sectionCssLoader.js",
    "loadSectionCss",
    "start",
    "Loading CSS for section",
    { sectionName },
  );

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: "loadSectionCss_start",
      file: "sectionCssLoader.js",
      method: "loadSectionCss",
      flag: "start",
      purpose: `Load CSS for section: ${sectionName}`,
    });
  }

  try {
    // Check if already loaded
    if (loadedSectionCss.has(sectionName)) {
      log(
        "sectionCssLoader.js",
        "loadSectionCss",
        "cached",
        "CSS already loaded",
        { sectionName },
      );
      return true;
    }

    // Get CSS bundle info
    const cssBundle = await getSectionCssBundle(sectionName);

    if (!cssBundle) {
      log(
        "sectionCssLoader.js",
        "loadSectionCss",
        "skip",
        "No CSS file for section",
        { sectionName },
      );
      return false;
    }

    // Inject CSS
    const linkElement = await injectCssLink(
      cssBundle.cssPath,
      sectionName,
      cssBundle.integrity,
    );

    // Mark as loaded
    loadedSectionCss.add(sectionName);
    activeSectionCss.set(sectionName, linkElement);

    log(
      "sectionCssLoader.js",
      "loadSectionCss",
      "success",
      "Section CSS loaded",
      { sectionName },
    );

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: "loadSectionCss_complete",
        file: "sectionCssLoader.js",
        method: "loadSectionCss",
        flag: "complete",
        purpose: `Section CSS loaded: ${sectionName}`,
      });
    }

    return true;
  } catch (error) {
    logError(
      "sectionCssLoader.js",
      "loadSectionCss",
      "Error loading section CSS",
      error,
      {
        sectionName,
      },
    );

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: "loadSectionCss_error",
        file: "sectionCssLoader.js",
        method: "loadSectionCss",
        flag: "error",
        purpose: `Section CSS load failed: ${sectionName}`,
      });
    }

    return false;
  }
}

/**
 * Preload CSS for a section (background cache-warming).
 * Uses rel="preload" so the browser starts downloading the stylesheet ahead of time.
 *
 * IMPORTANT: this Promise only resolves to `true` after `link.onload` fires, i.e. once
 * the CSS file has actually been downloaded into the HTTP cache. Callers that need to
 * mark a section as "fully preloaded" must await this — see sectionPreloader._doPreload.
 *
 * @param {string} sectionName - Section name
 * @returns {Promise<boolean>} Resolves true after onload, false on validation failure (no bundle / untrusted path).
 *                             Rejects on preloadLink.onerror so concurrent JS+CSS preloads can fail together.
 */
export async function preloadSectionCss(sectionName) {
  log(
    "sectionCssLoader.js",
    "preloadSectionCss",
    "start",
    "Preloading CSS for section",
    { sectionName },
  );

  if (loadedSectionCss.has(sectionName)) {
    return true;
  }

  // Reuse the in-flight promise so concurrent callers share a single download.
  if (preloadHintPromises.has(sectionName)) {
    return preloadHintPromises.get(sectionName);
  }

  let cssBundle;
  try {
    cssBundle = await getSectionCssBundle(sectionName);
  } catch (error) {
    logError(
      "sectionCssLoader.js",
      "preloadSectionCss",
      "Error resolving CSS bundle",
      error,
      {
        sectionName,
      },
    );
    return false;
  }

  if (!cssBundle) {
    return false;
  }

  const { cssPath, integrity } = cssBundle;

  // A link with the same href is already in the DOM (e.g. injected stylesheet
  // from loadSectionCss, or a hint we lost track of). Trust that the browser
  // is already downloading; we have no reliable way to attach onload here.
  const existingPreload = document.querySelector(
    `link[rel="preload"][href="${escapeSelectorAttributeValue(cssPath)}"]`,
  );
  if (existingPreload) {
    preloadHintLinks.set(sectionName, existingPreload);
    return true;
  }

  const preloadLink = document.createElement("link");
  preloadLink.rel = "preload";
  preloadLink.as = "style";
  preloadLink.href = cssPath;
  applyBundleLinkIntegrity(preloadLink, integrity);
  preloadLink.setAttribute("data-section-preload", sectionName);

  const loadPromise = new Promise((resolve, reject) => {
    preloadLink.onload = () => {
      log(
        "sectionCssLoader.js",
        "preloadSectionCss",
        "success",
        "CSS preloaded",
        { sectionName, cssPath },
      );
      resolve(true);
    };

    preloadLink.onerror = () => {
      const error = new Error(
        `Failed to preload CSS for section: ${sectionName}`,
      );
      logError(
        "sectionCssLoader.js",
        "preloadSectionCss",
        "CSS preload onerror",
        error,
        {
          sectionName,
          cssPath,
        },
      );

      if (preloadLink.parentNode) {
        preloadLink.parentNode.removeChild(preloadLink);
      }
      preloadHintLinks.delete(sectionName);
      preloadHintPromises.delete(sectionName);

      reject(error);
    };
  });

  document.head.appendChild(preloadLink);
  preloadHintLinks.set(sectionName, preloadLink);
  preloadHintPromises.set(sectionName, loadPromise);

  return loadPromise;
}

/**
 * Unload CSS for a section (cleanup)
 * Removes CSS link from document head
 *
 * @param {string} sectionName - Section name
 * @returns {boolean} True if unloaded successfully
 */
export function unloadSectionCss(sectionName) {
  log(
    "sectionCssLoader.js",
    "unloadSectionCss",
    "start",
    "Unloading CSS for section",
    { sectionName },
  );

  try {
    const preloadRemoved = removeSectionCssPreloadHint(sectionName);
    const linkElement = activeSectionCss.get(sectionName);

    if (linkElement && linkElement.parentNode) {
      linkElement.parentNode.removeChild(linkElement);
      activeSectionCss.delete(sectionName);
      loadedSectionCss.delete(sectionName);

      log(
        "sectionCssLoader.js",
        "unloadSectionCss",
        "success",
        "CSS unloaded",
        { sectionName },
      );

      return true;
    }

    if (preloadRemoved) {
      log(
        "sectionCssLoader.js",
        "unloadSectionCss",
        "success",
        "CSS preload hint removed",
        { sectionName },
      );
      return true;
    }

    return false;
  } catch (error) {
    logError(
      "sectionCssLoader.js",
      "unloadSectionCss",
      "Error unloading CSS",
      error,
      {
        sectionName,
      },
    );
    return false;
  }
}

/**
 * Get currently loaded sections
 *
 * @returns {Array<string>} Array of loaded section names
 */
export function getLoadedSections() {
  return Array.from(loadedSectionCss);
}

/**
 * Clear all section CSS (cleanup)
 * Useful for testing or hard resets
 */
export function clearAllSectionCss() {
  log(
    "sectionCssLoader.js",
    "clearAllSectionCss",
    "start",
    "Clearing all section CSS",
    {},
  );

  try {
    // Remove injected stylesheets and CSS preload hints
    const allSectionLinks = document.querySelectorAll(
      'link[data-section-css="true"], link[data-section-preload]',
    );
    allSectionLinks.forEach((link) => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });

    // Clear tracking
    activeSectionCss.clear();
    loadedSectionCss.clear();
    preloadHintLinks.clear();
    preloadHintPromises.clear();

    log(
      "sectionCssLoader.js",
      "clearAllSectionCss",
      "success",
      "All section CSS cleared",
      {},
    );
  } catch (error) {
    logError(
      "sectionCssLoader.js",
      "clearAllSectionCss",
      "Error clearing CSS",
      error,
      {},
    );
  }
}
