// vueApp-main-new/src/systems/assets/assetPreloader.js

import { log } from '@/infrastructure/logging/logHandler';
import { logError } from '@/infrastructure/errors/errorHandler.js';
import { trackStep } from '@/infrastructure/logging/performanceTrackerAccess.js';
import { getAssetUrl, getAssetUrls } from './assetLibrary';
import { assertAllowedPreloadUrl } from './assetPolicy.js';
import { getAssetPreloadEntriesForSection } from './routeSectionAssetPreloadEntries.js';
import { usePreloadStore } from '../../stores/usePreloadStore.js';

/**
 * @file assetPreloader.js
 * @description Asset preloading utilities for images, fonts, media, and scripts
 * @purpose Preload assets per section to optimize performance
 */

// Performance steps use trackStep() from performanceTrackerAccess.js (B-02)

// Track in-progress preloads to avoid duplicate requests
const preloadInProgress = new Map();

/** @type {number} Max parallel asset preloads within one priority tier (M-07) */
export const ASSET_PRELOAD_MAX_CONCURRENCY = 6;

/** @type {number} Retries after the first failed link/fetch attempt (M-06) */
const LINK_PRELOAD_MAX_RETRIES = 2;

/** @type {number} Base backoff ms for preload retries (M-06) */
const LINK_PRELOAD_RETRY_BASE_MS = 400;

/** @type {Record<string, number>} Higher value = scheduled earlier in preloadAssets */
const ASSET_PRELOAD_PRIORITY_MAP = { critical: 4, high: 3, medium: 2, low: 1, normal: 1 };

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async preload operation with exponential backoff (M-06).
 *
 * @template T
 * @param {(attempt: number) => Promise<T>} operation
 * @param {object} [options]
 * @returns {Promise<T>}
 */
export async function withPreloadRetry(operation, options = {}) {
  const maxRetries = options.maxRetries ?? LINK_PRELOAD_MAX_RETRIES;
  const baseDelayMs = options.baseDelayMs ?? LINK_PRELOAD_RETRY_BASE_MS;
  let attempt = 0;
  let lastError;

  while (attempt <= maxRetries) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (attempt >= maxRetries) {
        throw lastError;
      }
      await delay(baseDelayMs * (2 ** attempt));
      attempt += 1;
    }
  }

  throw lastError;
}

/**
 * @param {HTMLLinkElement} link
 * @returns {Promise<void>}
 */
function waitForLinkLoad(link) {
  return new Promise((resolve, reject) => {
    link.onload = () => {
      link.onload = null;
      link.onerror = null;
      resolve();
    };

    link.onerror = () => {
      link.onload = null;
      link.onerror = null;
      link.remove();
      reject(new Error(`Failed to load resource hint: ${link.href}`));
    };
  });
}

/**
 * Run preload work in bounded parallel chunks (M-07).
 *
 * @template T
 * @param {T[]} items
 * @param {(item: T) => Promise<unknown>} worker
 * @param {number} [maxConcurrency]
 */
export async function runInConcurrencyChunks(items, worker, maxConcurrency = ASSET_PRELOAD_MAX_CONCURRENCY) {
  for (let index = 0; index < items.length; index += maxConcurrency) {
    const chunk = items.slice(index, index + maxConcurrency);
    await Promise.allSettled(chunk.map((item) => worker(item)));
  }
}

function getAssetPreloadPriorityValue(priority) {
  return ASSET_PRELOAD_PRIORITY_MAP[priority] || 1;
}

/** @typedef {'high' | 'low' | 'auto'} FetchPriorityHint */

/**
 * Map route-config priority to the Fetch Priority API (M-02).
 *
 * @param {object} [options]
 * @returns {FetchPriorityHint | null}
 */
export function resolveFetchPriority(options = {}) {
  if (
    options.fetchPriority === 'high' ||
    options.fetchPriority === 'low' ||
    options.fetchPriority === 'auto'
  ) {
    return options.fetchPriority;
  }

  switch (options.priority) {
    case 'critical':
    case 'high':
      return 'high';
    case 'low':
      return 'low';
    case 'medium':
    case 'normal':
      return 'auto';
    default:
      return null;
  }
}

/**
 * @param {HTMLLinkElement} link
 * @param {object} [options]
 */
function applyFetchPriorityToLink(link, options = {}) {
  const fetchPriority = resolveFetchPriority(options);

  if (fetchPriority) {
    link.setAttribute('fetchpriority', fetchPriority);
  }
}

/**
 * Low-priority assets should use idle-time prefetch instead of navigation preload (M-03).
 *
 * @param {object} [options]
 * @returns {boolean}
 */
function shouldUsePrefetchHint(options = {}) {
  return options.priority === 'low' || options.priority === 'normal';
}

/**
 * @param {HTMLLinkElement} link
 * @param {object} options
 * @param {string} [asValue]
 */
function applyResourceHintRel(link, options, asValue) {
  if (shouldUsePrefetchHint(options)) {
    link.rel = 'prefetch';
  } else {
    link.rel = 'preload';
  }

  if (asValue) {
    link.as = asValue;
  }
}

/**
 * @param {string} src
 * @returns {HTMLLinkElement | null}
 */
function findExistingResourceHintLink(src) {
  return document.querySelector(
    `link[rel="prefetch"][href="${src}"], link[rel="preload"][href="${src}"], link[rel="modulepreload"][href="${src}"]`,
  );
}

function shouldUseModulePreload(options, src) {
  if (options?.module === true) {
    return true;
  }

  if (options?.module === false) {
    return false;
  }

  return typeof src === 'string' && src.endsWith('.mjs');
}

function findExistingScriptPreloadLink(src) {
  return (
    document.querySelector(`link[rel="prefetch"][href="${src}"]`) ||
    document.querySelector(`link[rel="preload"][as="script"][href="${src}"]`) ||
    document.querySelector(`link[rel="modulepreload"][href="${src}"]`)
  );
}

function createScriptPreloadLink(src, options) {
  const link = document.createElement('link');
  link.href = src;

  if (shouldUsePrefetchHint(options)) {
    link.rel = 'prefetch';
    link.setAttribute('as', 'script');
  } else if (shouldUseModulePreload(options, src)) {
    link.rel = 'modulepreload';
  } else {
    link.rel = 'preload';
    link.setAttribute('as', 'script');
  }

  if (options.crossOrigin) {
    link.crossOrigin = options.crossOrigin;
  }

  if (options.integrity) {
    link.integrity = options.integrity;
    if (!link.crossOrigin) {
      link.crossOrigin = 'anonymous';
    }
  }

  applyFetchPriorityToLink(link, options);

  return link;
}

/**
 * Script entries with route-config execution metadata (C-08).
 *
 * @param {object} [options]
 * @returns {boolean}
 */
export function shouldInjectExecutableScript(options = {}) {
  return Boolean(
    options.location ||
    options.defer ||
    options.async ||
    options.name ||
    (Array.isArray(options.flags) && options.flags.length > 0),
  );
}

/**
 * @param {HTMLScriptElement} script
 * @returns {Promise<void>}
 */
function waitForScriptElementLoad(script) {
  return new Promise((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script failed to load: ${script.src}`));
  });
}

/**
 * @param {HTMLScriptElement} script
 * @param {string} [location]
 */
function insertScriptElementAtLocation(script, location = 'head-last') {
  if ((location.startsWith('footer') || location === 'body') && !document.body) {
    document.head.appendChild(script);
    return;
  }

  switch (location) {
    case 'head-first':
      document.head.insertBefore(script, document.head.firstChild);
      break;
    case 'footer-first':
    case 'body-first':
      document.body.insertBefore(script, document.body.firstChild);
      break;
    case 'footer-last':
    case 'body-last':
      document.body.appendChild(script);
      break;
    case 'head-last':
    default:
      document.head.appendChild(script);
      break;
  }
}

/**
 * @param {string} src
 * @returns {HTMLScriptElement | null}
 */
function findExistingExecutableScript(src) {
  return document.querySelector(`script[src="${src}"]`);
}

/**
 * Inject and execute a script using route-config metadata (C-08).
 *
 * @param {string} src
 * @param {object} [options]
 * @returns {Promise<void>}
 */
export function injectExecutableScript(src, options = {}) {
  const preloadStore = usePreloadStore();

  const urlCheck = assertAllowedPreloadUrl(src, { assetType: 'script' });
  if (!urlCheck.ok) {
    logBlockedPreload(src, urlCheck.reason, 'injectExecutableScript');
    return Promise.resolve();
  }

  src = urlCheck.url;

  if (urlCheck.requiresIntegrity && !options.integrity) {
    logBlockedPreload(src, 'missing-integrity', 'injectExecutableScript');
    return Promise.resolve();
  }

  if (preloadStore.hasAsset(src)) {
    return Promise.resolve();
  }

  const existingScript = findExistingExecutableScript(src);
  if (existingScript) {
    preloadStore.addPreloadedAsset(src);
    return Promise.resolve();
  }

  const scriptReserved = reserveLinkPreload(src);
  if (scriptReserved.existing) {
    return scriptReserved.existing;
  }

  const { promise: scriptPromise, resolve: resolveScript, reject: rejectScript } = scriptReserved;

  withPreloadRetry(async (attempt) => {
    if (attempt > 0) {
      document.querySelectorAll(`script[src="${src}"]`).forEach((element) => element.remove());
    }

    const script = document.createElement('script');
    script.src = src;

    if (options.name) {
      script.dataset.assetName = options.name;
    }

    if (Array.isArray(options.flags) && options.flags.length > 0) {
      script.dataset.assetFlags = options.flags.join(',');
    }

    if (options.defer && options.async) {
      script.async = true;
    } else {
      if (options.defer) {
        script.defer = true;
      }
      if (options.async) {
        script.async = true;
      }
    }

    if (options.crossOrigin) {
      script.crossOrigin = options.crossOrigin;
    }

    if (options.integrity) {
      script.integrity = options.integrity;
      if (!script.crossOrigin) {
        script.crossOrigin = 'anonymous';
      }
    }

    insertScriptElementAtLocation(script, options.location);
    await waitForScriptElementLoad(script);
  })
    .then(() => {
      preloadStore.addPreloadedAsset(src);
      preloadInProgress.delete(src);
      resolveScript();
    })
    .catch((error) => {
      preloadInProgress.delete(src);
      rejectScript(error);
    });

  return scriptPromise;
}

/**
 * @param {string} src
 * @param {string} reason
 * @param {string} method
 */
function logBlockedPreload(src, reason, method) {
  log('assetPreloader.js', method, 'blocked', 'Preload blocked by URL policy', { src, reason });
  trackStep({
    step: `${method}_blocked`,
    file: 'assetPreloader.js',
    method,
    flag: 'blocked',
    purpose: 'Preload blocked by URL policy',
  });
}

/**
 * @param {string} src
 * @param {string} method
 * @param {string} assetType
 * @returns {string|null} Normalized URL or null when blocked
 */
function resolveAllowedPreloadSrc(src, method, assetType) {
  const check = assertAllowedPreloadUrl(src, { assetType });

  if (!check.ok) {
    logBlockedPreload(src, check.reason, method);
    return null;
  }

  return check.url;
}

/**
 * Reserve an in-flight preload slot before DOM/network work.
 * Double-checks the map so concurrent callers share one promise (L-03).
 * @param {string} src - Asset URL used as the in-progress key
 * @returns {{ existing: Promise<void> } | { promise: Promise<void>, resolve: Function, reject: Function }}
 */
function reserveLinkPreload(src) {
  if (preloadInProgress.has(src)) {
    return { existing: preloadInProgress.get(src) };
  }

  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  if (preloadInProgress.has(src)) {
    return { existing: preloadInProgress.get(src) };
  }

  preloadInProgress.set(src, promise);
  return { promise, resolve, reject };
}

/**
 * @function preloadImage
 * @description Preload an image asset
 * @param {string} src - Image source URL
 * @param {object} options - Preload options
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
export function preloadImage(src, options = {}) {
  const preloadStore = usePreloadStore();

  const safeSrc = resolveAllowedPreloadSrc(src, 'preloadImage', 'image');
  if (!safeSrc) {
    return Promise.resolve();
  }
  src = safeSrc;

  log('assetPreloader.js', 'preloadImage', 'start', 'Preloading image', { src, options });
  trackStep({
    step: 'preloadImage_start',
    file: 'assetPreloader.js',
    method: 'preloadImage',
    flag: 'start',
    purpose: 'Preload image asset'
  });

  if (preloadStore.hasAsset(src)) {
    log('assetPreloader.js', 'preloadImage', 'already-preloaded', 'Image already preloaded', { src });
    trackStep({
      step: 'preloadImage_cached',
      file: 'assetPreloader.js',
      method: 'preloadImage',
      flag: 'cache-hit',
      purpose: 'Image already preloaded'
    });
    return Promise.resolve();
  }

  const reserved = reserveLinkPreload(src);
  if (reserved.existing) {
    log('assetPreloader.js', 'preloadImage', 'in-progress', 'Image preload already in progress', { src });
    return reserved.existing;
  }

  const { promise, resolve, reject } = reserved;

  const existingLink = findExistingResourceHintLink(src);
  if (existingLink) {
    log('assetPreloader.js', 'preloadImage', 'already-exists', 'Image preload link already exists in DOM', { src });
    preloadStore.addPreloadedAsset(src);
    preloadInProgress.delete(src);
    trackStep({
      step: 'preloadImage_dom_exists',
      file: 'assetPreloader.js',
      method: 'preloadImage',
      flag: 'dom-exists',
      purpose: 'Image preload link already in DOM'
    });
    resolve();
    return promise;
  }

  withPreloadRetry(async (attempt) => {
    if (attempt > 0) {
      document.querySelectorAll(`link[href="${src}"]`).forEach((element) => element.remove());
      log('assetPreloader.js', 'preloadImage', 'retry', 'Retrying image preload', { src, attempt });
    }

    const link = document.createElement('link');
    link.href = src;
    applyResourceHintRel(link, options, 'image');

    if (options.crossOrigin) {
      link.crossOrigin = options.crossOrigin;
    }

    applyFetchPriorityToLink(link, options);
    document.head.appendChild(link);
    await waitForLinkLoad(link);
  })
    .then(() => {
      preloadStore.addPreloadedAsset(src);
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadImage', 'success', 'Image preloaded successfully', { src });
      trackStep({
        step: 'preloadImage_complete',
        file: 'assetPreloader.js',
        method: 'preloadImage',
        flag: 'success',
        purpose: 'Image preload complete'
      });
      resolve();
    })
    .catch((error) => {
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadImage', 'error', 'Image preload failed', {
        src,
        error: error.message || 'Load error'
      });
      trackStep({
        step: 'preloadImage_error',
        file: 'assetPreloader.js',
        method: 'preloadImage',
        flag: 'error',
        purpose: 'Image preload failed'
      });
      reject(new Error(`Failed to preload image: ${src}`));
    });

  return promise;
}

/**
 * @function preloadFont
 * @description Preload a font asset
 * @param {string} src - Font source URL
 * @param {object} options - Preload options
 * @returns {Promise<void>} Completion promise
 */
export function preloadFont(src, options = {}) {
  const preloadStore = usePreloadStore();

  const safeSrc = resolveAllowedPreloadSrc(src, 'preloadFont', 'font');
  if (!safeSrc) {
    return Promise.resolve();
  }
  src = safeSrc;

  log('assetPreloader.js', 'preloadFont', 'start', 'Preloading font', { src, options });
  trackStep({
    step: 'preloadFont_start',
    file: 'assetPreloader.js',
    method: 'preloadFont',
    flag: 'start',
    purpose: 'Preload font asset'
  });

  if (preloadStore.hasAsset(src)) {
    log('assetPreloader.js', 'preloadFont', 'already-preloaded', 'Font already preloaded', { src });
    trackStep({
      step: 'preloadFont_cached',
      file: 'assetPreloader.js',
      method: 'preloadFont',
      flag: 'cache-hit',
      purpose: 'Font already preloaded'
    });
    return Promise.resolve();
  }

  const fontReserved = reserveLinkPreload(src);
  if (fontReserved.existing) {
    log('assetPreloader.js', 'preloadFont', 'in-progress', 'Font preload already in progress', { src });
    return fontReserved.existing;
  }

  const { promise: fontPromise, resolve: resolveFont, reject: rejectFont } = fontReserved;

  const existingFontLink = findExistingResourceHintLink(src);
  if (existingFontLink) {
    log('assetPreloader.js', 'preloadFont', 'already-exists', 'Font preload link already exists in DOM', { src });
    preloadStore.addPreloadedAsset(src);
    preloadInProgress.delete(src);
    trackStep({
      step: 'preloadFont_dom_exists',
      file: 'assetPreloader.js',
      method: 'preloadFont',
      flag: 'dom-exists',
      purpose: 'Font preload link already in DOM'
    });
    resolveFont();
    return fontPromise;
  }

  withPreloadRetry(async (attempt) => {
    if (attempt > 0) {
      document.querySelectorAll(`link[href="${src}"]`).forEach((element) => element.remove());
      log('assetPreloader.js', 'preloadFont', 'retry', 'Retrying font preload', { src, attempt });
    }

    const link = document.createElement('link');
    link.href = src;
    applyResourceHintRel(link, options, 'font');
    link.type = options.type || 'font/woff2';

    if (options.crossOrigin !== false) {
      link.crossOrigin = 'anonymous';
    }

    applyFetchPriorityToLink(link, options);
    document.head.appendChild(link);
    await waitForLinkLoad(link);
  })
    .then(() => {
      preloadStore.addPreloadedAsset(src);
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadFont', 'success', 'Font preloaded successfully', { src });
      trackStep({
        step: 'preloadFont_complete',
        file: 'assetPreloader.js',
        method: 'preloadFont',
        flag: 'success',
        purpose: 'Font preload complete'
      });
      resolveFont();
    })
    .catch((error) => {
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadFont', 'error', 'Font preload failed', {
        src,
        error: error.message || 'Load error'
      });
      trackStep({
        step: 'preloadFont_error',
        file: 'assetPreloader.js',
        method: 'preloadFont',
        flag: 'error',
        purpose: 'Font preload failed'
      });
      rejectFont(new Error(`Failed to preload font: ${src}`));
    });

  return fontPromise;
}

/**
 * @function preloadMedia
 * @description Preload a media asset (video/audio)
 * @param {string} src - Media source URL
 * @param {string} type - Media type ('video' or 'audio')
 * @param {object} options - Preload options
 * @returns {Promise<void>} Completion promise
 */
export function preloadMedia(src, type = 'video', options = {}) {
  const preloadStore = usePreloadStore();

  const safeSrc = resolveAllowedPreloadSrc(src, 'preloadMedia', 'media');
  if (!safeSrc) {
    return Promise.resolve();
  }
  src = safeSrc;

  log('assetPreloader.js', 'preloadMedia', 'start', 'Preloading media', { src, type, options });
  trackStep({
    step: 'preloadMedia_start',
    file: 'assetPreloader.js',
    method: 'preloadMedia',
    flag: 'start',
    purpose: 'Preload media asset'
  });

  if (preloadStore.hasAsset(src)) {
    log('assetPreloader.js', 'preloadMedia', 'already-preloaded', 'Media already preloaded', { src });
    trackStep({
      step: 'preloadMedia_cached',
      file: 'assetPreloader.js',
      method: 'preloadMedia',
      flag: 'cache-hit',
      purpose: 'Media already preloaded'
    });
    return Promise.resolve();
  }

  const mediaReserved = reserveLinkPreload(src);
  if (mediaReserved.existing) {
    log('assetPreloader.js', 'preloadMedia', 'in-progress', 'Media preload already in progress', { src });
    return mediaReserved.existing;
  }

  const { promise: mediaPromise, resolve: resolveMedia, reject: rejectMedia } = mediaReserved;

  const existingMediaLink = findExistingResourceHintLink(src);
  if (existingMediaLink) {
    log('assetPreloader.js', 'preloadMedia', 'already-exists', 'Media preload link already exists in DOM', { src });
    preloadStore.addPreloadedAsset(src);
    preloadInProgress.delete(src);
    trackStep({
      step: 'preloadMedia_dom_exists',
      file: 'assetPreloader.js',
      method: 'preloadMedia',
      flag: 'dom-exists',
      purpose: 'Media preload link already in DOM'
    });
    resolveMedia();
    return mediaPromise;
  }

  withPreloadRetry(async (attempt) => {
    if (attempt > 0) {
      document.querySelectorAll(`link[href="${src}"]`).forEach((element) => element.remove());
      log('assetPreloader.js', 'preloadMedia', 'retry', 'Retrying media preload', { src, type, attempt });
    }

    const link = document.createElement('link');
    link.href = src;
    applyResourceHintRel(link, options, type);

    if (options.type) {
      link.type = options.type;
    }

    applyFetchPriorityToLink(link, options);
    document.head.appendChild(link);
    await waitForLinkLoad(link);
  })
    .then(() => {
      preloadStore.addPreloadedAsset(src);
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadMedia', 'success', 'Media preloaded successfully', { src, type });
      trackStep({
        step: 'preloadMedia_complete',
        file: 'assetPreloader.js',
        method: 'preloadMedia',
        flag: 'success',
        purpose: 'Media preload complete'
      });
      resolveMedia();
    })
    .catch((error) => {
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadMedia', 'error', 'Media preload failed', {
        src,
        type,
        error: error.message || 'Load error'
      });
      trackStep({
        step: 'preloadMedia_error',
        file: 'assetPreloader.js',
        method: 'preloadMedia',
        flag: 'error',
        purpose: 'Media preload failed'
      });
      rejectMedia(new Error(`Failed to preload ${type}: ${src}`));
    });

  return mediaPromise;
}

/**
 * @function preloadScript
 * @description Preload a script asset
 * @param {string} src - Script source URL
 * @param {object} options - Preload options
 * @returns {Promise<void>} Completion promise
 */
export function preloadScript(src, options = {}) {
  if (shouldInjectExecutableScript(options)) {
    return injectExecutableScript(src, options);
  }

  const preloadStore = usePreloadStore();

  const urlCheck = assertAllowedPreloadUrl(src, { assetType: 'script' });
  if (!urlCheck.ok) {
    logBlockedPreload(src, urlCheck.reason, 'preloadScript');
    return Promise.resolve();
  }

  src = urlCheck.url;

  if (urlCheck.requiresIntegrity && !options.integrity) {
    logBlockedPreload(src, 'missing-integrity', 'preloadScript');
    return Promise.resolve();
  }

  log('assetPreloader.js', 'preloadScript', 'start', 'Preloading script', { src, options });
  trackStep({
    step: 'preloadScript_start',
    file: 'assetPreloader.js',
    method: 'preloadScript',
    flag: 'start',
    purpose: 'Preload script asset'
  });

  if (preloadStore.hasAsset(src)) {
    log('assetPreloader.js', 'preloadScript', 'already-preloaded', 'Script already preloaded', { src });
    trackStep({
      step: 'preloadScript_cached',
      file: 'assetPreloader.js',
      method: 'preloadScript',
      flag: 'cache-hit',
      purpose: 'Script already preloaded'
    });
    return Promise.resolve();
  }

  const scriptReserved = reserveLinkPreload(src);
  if (scriptReserved.existing) {
    log('assetPreloader.js', 'preloadScript', 'in-progress', 'Script preload already in progress', { src });
    return scriptReserved.existing;
  }

  const { promise: scriptPromise, resolve: resolveScript, reject: rejectScript } = scriptReserved;

  const existingScriptLink = findExistingScriptPreloadLink(src);
  if (existingScriptLink) {
    log('assetPreloader.js', 'preloadScript', 'already-exists', 'Script preload link already exists in DOM', { src });
    preloadStore.addPreloadedAsset(src);
    preloadInProgress.delete(src);
    trackStep({
      step: 'preloadScript_dom_exists',
      file: 'assetPreloader.js',
      method: 'preloadScript',
      flag: 'dom-exists',
      purpose: 'Script preload link already in DOM'
    });
    resolveScript();
    return scriptPromise;
  }

  withPreloadRetry(async (attempt) => {
    if (attempt > 0) {
      document.querySelectorAll(`link[href="${src}"]`).forEach((element) => element.remove());
      log('assetPreloader.js', 'preloadScript', 'retry', 'Retrying script preload', { src, attempt });
    }

    const scriptLink = createScriptPreloadLink(src, options);
    document.head.appendChild(scriptLink);
    await waitForLinkLoad(scriptLink);
  })
    .then(() => {
      preloadStore.addPreloadedAsset(src);
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadScript', 'success', 'Script preloaded successfully', { src });
      trackStep({
        step: 'preloadScript_complete',
        file: 'assetPreloader.js',
        method: 'preloadScript',
        flag: 'success',
        purpose: 'Script preload complete'
      });
      resolveScript();
    })
    .catch((error) => {
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadScript', 'error', 'Script preload failed', {
        src,
        error: error.message || 'Load error'
      });
      trackStep({
        step: 'preloadScript_error',
        file: 'assetPreloader.js',
        method: 'preloadScript',
        flag: 'error',
        purpose: 'Script preload failed'
      });
      rejectScript(new Error(`Failed to preload script: ${src}`));
    });

  return scriptPromise;
}

// Parsed JSON content cache (not the SSOT for "URL preloaded"; use usePreloadStore.hasAsset)
const jsonDataCache = new Map();

/**
 * @function preloadJSON
 * @description Preload and cache a JSON file
 * @param {string} src - JSON file URL/path
 * @param {object} options - Preload options
 * @returns {Promise<object>} Loaded JSON data
 */
export async function preloadJSON(src, options = {}) {
  const preloadStore = usePreloadStore();

  const safeSrc = resolveAllowedPreloadSrc(src, 'preloadJSON', 'json');
  if (!safeSrc) {
    return null;
  }
  src = safeSrc;

  log('assetPreloader.js', 'preloadJSON', 'start', 'Preloading JSON', { src, options });
  trackStep({
    step: 'preloadJSON_start',
    file: 'assetPreloader.js',
    method: 'preloadJSON',
    flag: 'start',
    purpose: 'Preload JSON asset'
  });

  // SSOT: store tracks URL completion; jsonDataCache holds parsed content only
  if (preloadStore.hasAsset(src) && jsonDataCache.has(src)) {
    log('assetPreloader.js', 'preloadJSON', 'cache-hit', 'JSON already cached', { src });
    trackStep({
      step: 'preloadJSON_cached',
      file: 'assetPreloader.js',
      method: 'preloadJSON',
      flag: 'cache-hit',
      purpose: 'JSON already cached'
    });
    return jsonDataCache.get(src);
  }

  if (jsonDataCache.has(src) && !preloadStore.hasAsset(src)) {
    jsonDataCache.delete(src);
  }

  // Check if load is in progress
  if (preloadInProgress.has(src)) {
    log('assetPreloader.js', 'preloadJSON', 'in-progress', 'JSON load already in progress', { src });
    return preloadInProgress.get(src);
  }

  const loadPromise = (async () => {
    try {
      const data = await withPreloadRetry(async (attempt) => {
        if (attempt > 0) {
          log('assetPreloader.js', 'preloadJSON', 'retry', 'Retrying JSON preload', { src, attempt });
        }

        log('assetPreloader.js', 'preloadJSON', 'fetching', 'Fetching JSON file', { src });
        const response = await fetch(src);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
      });

      jsonDataCache.set(src, data);
      preloadStore.addPreloadedAsset(src);

      log('assetPreloader.js', 'preloadJSON', 'success', 'JSON loaded and cached successfully', { src });
      trackStep({
        step: 'preloadJSON_complete',
        file: 'assetPreloader.js',
        method: 'preloadJSON',
        flag: 'success',
        purpose: 'JSON preload complete'
      });

      return data;
    } catch (error) {
      log('assetPreloader.js', 'preloadJSON', 'error', 'JSON load failed', {
        src,
        error: error.message,
        stack: error.stack
      });
      trackStep({
        step: 'preloadJSON_error',
        file: 'assetPreloader.js',
        method: 'preloadJSON',
        flag: 'error',
        purpose: 'JSON preload failed'
      });
      throw new Error(`Failed to preload JSON: ${src} - ${error.message}`);
    } finally {
      preloadInProgress.delete(src);
    }
  })();

  preloadInProgress.set(src, loadPromise);
  return loadPromise;
}

/**
 * @function preloadAsset
 * @description Preload a single asset based on type
 * @param {object} asset - Asset definition { src, type, priority, ...options }
 * @returns {Promise<void>} Completion promise
 */
export async function preloadAsset(asset) {
  log('assetPreloader.js', 'preloadAsset', 'start', 'Preloading asset', { asset });
  trackStep({
    step: 'preloadAsset_start',
    file: 'assetPreloader.js',
    method: 'preloadAsset',
    flag: 'start',
    purpose: 'Preload single asset'
  });

  try {
    let { src, type, flag, ...options } = asset;

    // If src is missing but flag is provided, resolve it
    if (!src && flag) {
      src = await getAssetUrl(
        flag,
        asset.section ? { section: asset.section } : undefined,
      );
      if (!src) {
        log('assetPreloader.js', 'preloadAsset', 'warn', 'Failed to resolve asset flag', { flag });
        return;
      }
    }

    if (!src) {
      log('assetPreloader.js', 'preloadAsset', 'warn', 'Missing src and flag for asset', { asset });
      return;
    }

    switch (type) {
      case 'image':
        await preloadImage(src, options);
        break;
      case 'font':
        await preloadFont(src, options);
        break;
      case 'video':
        await preloadMedia(src, 'video', options);
        break;
      case 'audio':
        await preloadMedia(src, 'audio', options);
        break;
      case 'script':
        await preloadScript(src, options);
        break;
      case 'json':
        await preloadJSON(src, options);
        break;
      default:
        log('assetPreloader.js', 'preloadAsset', 'unknown-type', 'Unknown asset type', { src, type });
        trackStep({
          step: 'preloadAsset_unknown_type',
          file: 'assetPreloader.js',
          method: 'preloadAsset',
          flag: 'unknown',
          purpose: 'Unknown asset type'
        });
        return;
    }

    log('assetPreloader.js', 'preloadAsset', 'success', 'Asset preloaded', { src, type });
    trackStep({
      step: 'preloadAsset_complete',
      file: 'assetPreloader.js',
      method: 'preloadAsset',
      flag: 'success',
      purpose: 'Asset preload complete'
    });
  } catch (error) {
    log('assetPreloader.js', 'preloadAsset', 'error', 'Asset preload failed', {
      asset,
      error: error.message,
      stack: error.stack
    });
    trackStep({
      step: 'preloadAsset_error',
      file: 'assetPreloader.js',
      method: 'preloadAsset',
      flag: 'error',
      purpose: 'Asset preload failed'
    });
    // Don't throw - continue preloading other assets
  }
}

/**
 * @function preloadAssets
 * @description Preload multiple assets in parallel
 * @param {Array<object>} assets - Array of asset definitions
 * @returns {Promise<void>} Completion promise
 */
export async function preloadAssets(assets) {
  log('assetPreloader.js', 'preloadAssets', 'start', 'Preloading multiple assets', { count: assets.length });
  trackStep({
    step: 'preloadAssets_start',
    file: 'assetPreloader.js',
    method: 'preloadAssets',
    flag: 'start',
    purpose: 'Preload multiple assets'
  });

  // Sort by priority (high first), then preload tier-by-tier so high finishes before low starts
  const sortedAssets = [...assets].sort((a, b) => {
    return getAssetPreloadPriorityValue(b.priority) - getAssetPreloadPriorityValue(a.priority);
  });

  log('assetPreloader.js', 'preloadAssets', 'sorted', 'Assets sorted by priority', { count: sortedAssets.length });

  let tierIndex = 0;
  while (tierIndex < sortedAssets.length) {
    const tierPriority = getAssetPreloadPriorityValue(sortedAssets[tierIndex].priority);
    const tierAssets = [];

    while (
      tierIndex < sortedAssets.length &&
      getAssetPreloadPriorityValue(sortedAssets[tierIndex].priority) === tierPriority
    ) {
      tierAssets.push(sortedAssets[tierIndex]);
      tierIndex += 1;
    }

    await runInConcurrencyChunks(tierAssets, (asset) => preloadAsset(asset));
  }

  log('assetPreloader.js', 'preloadAssets', 'success', 'All assets preloaded', { count: assets.length });
  trackStep({
    step: 'preloadAssets_complete',
    file: 'assetPreloader.js',
    method: 'preloadAssets',
    flag: 'success',
    purpose: 'Multiple assets preload complete'
  });
}

/**
 * @function preloadSectionCriticalImages
 * @description Preload only high-priority images for a specific section (for blocking preload before component mount)
 * @param {string} sectionName - Section name
 * @returns {Promise<void>} Completion promise
 */
export async function preloadSectionCriticalImages(sectionName) {
  log('assetPreloader.js', 'preloadSectionCriticalImages', 'start', 'Preloading critical section images', { sectionName });
  trackStep({
    step: 'preloadSectionCriticalImages_start',
    file: 'assetPreloader.js',
    method: 'preloadSectionCriticalImages',
    flag: 'start',
    purpose: 'Preload critical images for section'
  });

  try {
    const { assets: sectionAssets, routeCount } = getAssetPreloadEntriesForSection(sectionName);

    log('assetPreloader.js', 'preloadSectionCriticalImages', 'routes-found', 'Section routes found', {
      sectionName,
      routeCount
    });

    const criticalAssets = sectionAssets.filter(asset =>
      asset.type === 'image' && (asset.priority === 'high' || asset.priority === 'critical')
    );

    log('assetPreloader.js', 'preloadSectionCriticalImages', 'assets-collected', 'Critical images collected for section', {
      sectionName,
      assetCount: criticalAssets.length
    });

    // Preload critical images (await to ensure they're loaded before components mount)
    if (criticalAssets.length > 0) {
      await preloadAssets(tagAssetsWithSection(criticalAssets, sectionName));
    }

    log('assetPreloader.js', 'preloadSectionCriticalImages', 'success', 'Critical section images preloaded', {
      sectionName,
      assetCount: criticalAssets.length
    });
    trackStep({
      step: 'preloadSectionCriticalImages_complete',
      file: 'assetPreloader.js',
      method: 'preloadSectionCriticalImages',
      flag: 'success',
      purpose: 'Critical section images preload complete'
    });
  } catch (error) {
    log('assetPreloader.js', 'preloadSectionCriticalImages', 'error', 'Error preloading critical section images', {
      sectionName,
      error: error.message,
      stack: error.stack
    });
    trackStep({
      step: 'preloadSectionCriticalImages_error',
      file: 'assetPreloader.js',
      method: 'preloadSectionCriticalImages',
      flag: 'error',
      purpose: 'Critical section images preload failed'
    });
    // Don't throw - continue navigation even if preload fails
  }
}

/**
 * Resolve a single assetPreload entry to a concrete URL (C-07).
 *
 * @param {object} asset
 * @returns {Promise<string|null>}
 */
/**
 * @param {Array<object>} assets
 * @param {string} sectionName
 * @returns {Array<object>}
 */
function tagAssetsWithSection(assets, sectionName) {
  return assets.map((asset) => ({ ...asset, section: sectionName }));
}

export async function resolveAssetPreloadUrl(asset, sectionName = null) {
  if (asset?.src) {
    return asset.src;
  }

  if (asset?.flag) {
    const section = sectionName || asset.section || null;
    return section ? getAssetUrl(asset.flag, { section }) : getAssetUrl(asset.flag);
  }

  return null;
}

/**
 * Batch-resolve preload URLs grouped by effective section (P-04 / perf).
 * Returns assets with `src` populated so downstream preload does not re-resolve flags.
 *
 * @param {Array<object>} assets
 * @param {string|null} defaultSectionName
 * @returns {Promise<{ urls: string[], assets: Array<object> }>}
 */
export async function enrichAssetsWithPreloadUrls(assets, defaultSectionName = null) {
  if (!Array.isArray(assets) || assets.length === 0) {
    return { urls: [], assets: [] };
  }

  const urlByIndex = new Map();
  /** @type {Map<string, { section: string|null, flagToIndices: Map<string, number[]> }>} */
  const flagGroups = new Map();

  assets.forEach((asset, index) => {
    if (asset?.src) {
      urlByIndex.set(index, asset.src);
      return;
    }

    if (!asset?.flag || typeof asset.flag !== 'string') {
      return;
    }

    const flag = asset.flag.trim();
    if (!flag) {
      return;
    }

    const section = asset.section || defaultSectionName || null;
    const groupKey = section || '__global__';

    if (!flagGroups.has(groupKey)) {
      flagGroups.set(groupKey, { section, flagToIndices: new Map() });
    }

    const group = flagGroups.get(groupKey);
    if (!group.flagToIndices.has(flag)) {
      group.flagToIndices.set(flag, []);
    }
    group.flagToIndices.get(flag).push(index);
  });

  await Promise.all(
    [...flagGroups.values()].map(async ({ section, flagToIndices }) => {
      const flags = [...flagToIndices.keys()];
      if (flags.length === 0) {
        return;
      }

      const urlMap = await getAssetUrls(
        flags,
        section ? { section } : undefined,
      );

      for (const [flag, indices] of flagToIndices) {
        const url = urlMap[flag] || null;
        for (const index of indices) {
          if (url) {
            urlByIndex.set(index, url);
          }
        }
      }
    }),
  );

  const urls = [];
  const enrichedAssets = assets.map((asset, index) => {
    const resolvedSrc = urlByIndex.get(index) || asset?.src || null;
    if (resolvedSrc) {
      urls.push(resolvedSrc);
    }

    if (resolvedSrc && !asset?.src) {
      return { ...asset, src: resolvedSrc };
    }

    return asset;
  });

  return { urls, assets: enrichedAssets };
}

/**
 * @param {Array<object>} assets
 * @param {string|null} defaultSectionName
 * @returns {Promise<string[]>}
 */
export async function resolveAssetPreloadUrls(assets, defaultSectionName = null) {
  const { urls } = await enrichAssetsWithPreloadUrls(assets, defaultSectionName);
  return urls;
}

/**
 * @param {string[]} urls
 * @returns {boolean}
 */
export function areSectionAssetUrlsFullyPreloaded(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    return false;
  }

  const preloadStore = usePreloadStore();
  return urls.every((url) => preloadStore.hasAsset(url));
}

/**
 * @function preloadSectionAssets
 * @description Preload all assets for a specific section
 * @param {string} sectionName - Section name
 * @returns {Promise<void>} Completion promise
 */
export async function preloadSectionAssets(sectionName) {
  log('assetPreloader.js', 'preloadSectionAssets', 'start', 'Preloading section assets', { sectionName });
  trackStep({
    step: 'preloadSectionAssets_start',
    file: 'assetPreloader.js',
    method: 'preloadSectionAssets',
    flag: 'start',
    purpose: 'Preload all assets for section'
  });

  try {
    const { assets: allAssets, routeCount } = getAssetPreloadEntriesForSection(sectionName);

    log('assetPreloader.js', 'preloadSectionAssets', 'routes-found', 'Section routes found', {
      sectionName,
      routeCount
    });

    const { urls: resolvedUrls, assets: assetsWithSrc } = await enrichAssetsWithPreloadUrls(
      allAssets,
      sectionName,
    );

    if (areSectionAssetUrlsFullyPreloaded(resolvedUrls)) {
      log('assetPreloader.js', 'preloadSectionAssets', 'cache-hit', 'All section asset URLs already preloaded — skipping', {
        sectionName,
        assetCount: allAssets.length,
        resolvedUrlCount: resolvedUrls.length,
      });
      trackStep({
        step: 'preloadSectionAssets_cache_hit',
        file: 'assetPreloader.js',
        method: 'preloadSectionAssets',
        flag: 'cache-hit',
        purpose: 'Section assets already in preload store',
      });
      return;
    }

    log('assetPreloader.js', 'preloadSectionAssets', 'assets-collected', 'Assets collected for section', {
      sectionName,
      assetCount: allAssets.length
    });

    await preloadAssets(tagAssetsWithSection(assetsWithSrc, sectionName));

    log('assetPreloader.js', 'preloadSectionAssets', 'success', 'Section assets preloaded', {
      sectionName,
      assetCount: allAssets.length
    });
    trackStep({
      step: 'preloadSectionAssets_complete',
      file: 'assetPreloader.js',
      method: 'preloadSectionAssets',
      flag: 'success',
      purpose: 'Section assets preload complete'
    });
  } catch (error) {
    log('assetPreloader.js', 'preloadSectionAssets', 'error', 'Error preloading section assets', {
      sectionName,
      error: error.message,
      stack: error.stack
    });
    trackStep({
      step: 'preloadSectionAssets_error',
      file: 'assetPreloader.js',
      method: 'preloadSectionAssets',
      flag: 'error',
      purpose: 'Section assets preload failed'
    });
  }
}

/**
 * @function clearPreloadCache
 * @description Clear resolved asset URL preload state and module-level preload caches.
 * Clears Pinia preloaded URLs (`clearAssets`), `preloadInProgress`, and `jsonDataCache`.
 * Section bundle preload state (`preloadedSections`, `buildHash`) is preserved.
 * @returns {void}
 */
export function clearPreloadCache() {
  const preloadStore = usePreloadStore();
  log('assetPreloader.js', 'clearPreloadCache', 'start', 'Clearing preload cache', { cacheSize: preloadStore.preloadedAssetCount });
  trackStep({
    step: 'clearPreloadCache',
    file: 'assetPreloader.js',
    method: 'clearPreloadCache',
    flag: 'clear',
    purpose: 'Clear preload cache'
  });

  preloadStore.clearAssets();
  preloadInProgress.clear();
  jsonDataCache.clear();

  log('assetPreloader.js', 'clearPreloadCache', 'success', 'Preload cache cleared', {});
}

/**
 * @function getPreloadedAssetsCount
 * @description Get count of preloaded assets
 * @returns {number} Count of preloaded assets
 */
export function getPreloadedAssetsCount() {
  const preloadStore = usePreloadStore();
  const count = preloadStore.preloadedAssetCount;

  log('assetPreloader.js', 'getPreloadedAssetsCount', 'get', 'Getting preloaded assets count', { count });

  return count;
}
