// src/utils/interactions/scriptAvailabilityChecker.js

/**
 * @file scriptAvailabilityChecker.js
 * @description Utility to check and wait for script availability using AssetHandler
 * @purpose Ensures scripts are loaded and available before dependent operations
 */

import AssetHandler from '@/utils/assets/assetsHandlerNew.js';
import { log } from '@/utils/common/logHandler.js';
import { getAssetUrl } from '@/utils/assets/assetLibrary.js';

// Singleton AssetHandler instance
let assetHandlerInstance = null;

// Default asset configuration for critical scripts
const DEFAULT_ASSET_CONFIG = [
  {
    name: 'cognito',
    url: 'https://cdn.jsdelivr.net/npm/amazon-cognito-identity-js@6.3.15/dist/amazon-cognito-identity.min.js',
    type: 'script',
    flags: ['auth', 'cognito', 'critical'],
    priority: 'critical',
    location: 'head-last',
    timeout: 30000,
    retry: 2
  }
];

/**
 * @function getAssetHandler
 * @description Get or initialize the singleton AssetHandler instance
 * @param {Array<Object>} additionalAssets - Additional assets to add to config
 * @param {Object} options - AssetHandler options
 * @returns {AssetHandler} The AssetHandler instance
 */
function getAssetHandler(additionalAssets = [], options = {}) {
  if (assetHandlerInstance) {
    return assetHandlerInstance;
  }

  try {
    // Merge default config with additional assets
    const config = [...DEFAULT_ASSET_CONFIG, ...additionalAssets];

    // Create instance with debug mode based on environment
    const handlerOptions = {
      debug: import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGER === 'true',
      maxConcurrent: 3,
      checkOnline: true,
      ...options
    };

    assetHandlerInstance = new AssetHandler(config, handlerOptions);

    // Expose globally for debugging and cross-module access
    if (typeof window !== 'undefined') {
      window.assetHandler = assetHandlerInstance;
    }

    log('scriptAvailabilityChecker.js', 'getAssetHandler', 'initialized', 'AssetHandler singleton initialized', {
      totalAssets: config.length,
      assetNames: config.map(a => a.name)
    });

    return assetHandlerInstance;
  } catch (error) {
    log('scriptAvailabilityChecker.js', 'getAssetHandler', 'error', 'Failed to initialize AssetHandler', {
      error: error.message
    });
    throw error;
  }
}

/**
 * @function isScriptInDOM
 * @description Check if a script asset is loaded in the DOM using AssetHandler
 * @param {string} assetName - The asset name registered in AssetHandler
 * @returns {boolean} True if script is in DOM
 */
export function isScriptInDOM(assetName) {
  log('scriptAvailabilityChecker.js', 'isScriptInDOM', 'start', 'Checking if script is in DOM', { assetName });

  const handler = getAssetHandler();

  // Use AssetHandler's isAssetAlreadyInDOM method
  const isInDOM = handler.isAssetAlreadyInDOM(assetName, 'script');

  if (isInDOM) {
    log('scriptAvailabilityChecker.js', 'isScriptInDOM', 'found', 'Script found in DOM via AssetHandler', { assetName });
    return true;
  }

  // Also check if AssetHandler has tracked it as loaded
  if (handler.loadedAssets.has(assetName)) {
    log('scriptAvailabilityChecker.js', 'isScriptInDOM', 'tracked', 'Script tracked as loaded by AssetHandler', { assetName });
    return true;
  }

  log('scriptAvailabilityChecker.js', 'isScriptInDOM', 'not-found', 'Script not found in DOM', { assetName });
  return false;
}

/**
 * @function isScriptReady
 * @description Check if a script is fully loaded and optionally has exposed a global
 * @param {string} assetName - The asset name registered in AssetHandler
 * @param {string|null} globalName - Optional global variable name to check (e.g., 'AmazonCognitoIdentity')
 * @returns {boolean} True if script is ready
 */
export function isScriptReady(assetName, globalName = null) {
  log('scriptAvailabilityChecker.js', 'isScriptReady', 'start', 'Checking if script is ready', {
    assetName,
    globalName
  });

  // First check if script is in DOM
  if (!isScriptInDOM(assetName)) {
    return false;
  }

  // If global check required, verify it exists
  if (globalName) {
    const globalExists = typeof window !== 'undefined' && typeof window[globalName] !== 'undefined';

    log('scriptAvailabilityChecker.js', 'isScriptReady', globalExists ? 'ready' : 'no-global',
      globalExists ? 'Script and global are ready' : 'Script in DOM but global not available',
      { assetName, globalName, globalExists }
    );

    return globalExists;
  }

  log('scriptAvailabilityChecker.js', 'isScriptReady', 'ready', 'Script is ready (no global check)', { assetName });
  return true;
}

/**
 * @function loadScript
 * @description Load a script using AssetHandler
 * @param {string} assetName - The asset name registered in AssetHandler
 * @returns {Promise<Object>} Load result
 */
export async function loadScript(assetName) {
  log('scriptAvailabilityChecker.js', 'loadScript', 'start', 'Loading script via AssetHandler', { assetName });

  const handler = getAssetHandler();

  // Get asset configuration
  const asset = handler.getAssetByName(assetName);

  if (!asset) {
    const error = new Error(`Asset "${assetName}" not registered in AssetHandler`);
    log('scriptAvailabilityChecker.js', 'loadScript', 'error', 'Asset not registered', { assetName });
    throw error;
  }

  if (asset.type !== 'script') {
    const error = new Error(`Asset "${assetName}" is not a script type (type: ${asset.type})`);
    log('scriptAvailabilityChecker.js', 'loadScript', 'error', 'Asset is not a script', {
      assetName,
      type: asset.type
    });
    throw error;
  }

  // Check if already loaded
  if (isScriptInDOM(assetName)) {
    log('scriptAvailabilityChecker.js', 'loadScript', 'already-loaded', 'Script already in DOM', { assetName });
    return { name: assetName, type: 'script', url: asset.url, skipped: true };
  }

  // Load the script via AssetHandler
  try {
    const result = await handler.loadAsset(asset);
    log('scriptAvailabilityChecker.js', 'loadScript', 'success', 'Script loaded successfully', {
      assetName,
      result
    });
    return result;
  } catch (error) {
    log('scriptAvailabilityChecker.js', 'loadScript', 'error', 'Failed to load script', {
      assetName,
      error: error.message
    });
    throw error;
  }
}

/**
 * @function waitForScriptAvailability
 * @description Wait for a script to be available in the DOM with polling
 * @param {string} assetName - The asset name registered in AssetHandler
 * @param {Object} options - Configuration options
 * @param {number} options.pollInterval - Milliseconds between checks (default: 100)
 * @param {number} options.maxWaitTime - Maximum wait time in milliseconds (default: 30000)
 * @param {string|null} options.checkGlobal - Optional global name to verify (e.g., 'AmazonCognitoIdentity')
 * @param {boolean} options.autoLoad - Whether to attempt loading if not found (default: true)
 * @returns {Promise<boolean>} Resolves true when script is available, rejects on timeout
 */
export async function waitForScriptAvailability(assetName, options = {}) {
  const {
    pollInterval = 100,
    maxWaitTime = 30000,
    checkGlobal = null,
    autoLoad = true
  } = options;

  log('scriptAvailabilityChecker.js', 'waitForScriptAvailability', 'start', 'Waiting for script availability', {
    assetName,
    pollInterval,
    maxWaitTime,
    checkGlobal,
    autoLoad
  });

  // Track performance
  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'waitForScript_start',
      file: 'scriptAvailabilityChecker.js',
      method: 'waitForScriptAvailability',
      flag: 'start',
      purpose: `Wait for script: ${assetName}`
    });
  }

  // Ensure AssetHandler is ready
  const handler = getAssetHandler();
  await handler.whenReady();

  // Check if already ready
  if (isScriptReady(assetName, checkGlobal)) {
    log('scriptAvailabilityChecker.js', 'waitForScriptAvailability', 'immediate', 'Script already available', {
      assetName
    });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'waitForScript_immediate',
        file: 'scriptAvailabilityChecker.js',
        method: 'waitForScriptAvailability',
        flag: 'immediate',
        purpose: `Script ${assetName} was already available`
      });
    }

    return true;
  }

  // If autoLoad enabled, try to load the script
  if (autoLoad) {
    log('scriptAvailabilityChecker.js', 'waitForScriptAvailability', 'auto-load', 'Attempting to load script', {
      assetName
    });

    try {
      await loadScript(assetName);

      // If no global check needed, return immediately
      if (!checkGlobal) {
        log('scriptAvailabilityChecker.js', 'waitForScriptAvailability', 'loaded', 'Script loaded successfully', {
          assetName
        });

        if (window.performanceTracker) {
          window.performanceTracker.step({
            step: 'waitForScript_loaded',
            file: 'scriptAvailabilityChecker.js',
            method: 'waitForScriptAvailability',
            flag: 'loaded',
            purpose: `Script ${assetName} loaded`
          });
        }

        return true;
      }
    } catch (loadError) {
      log('scriptAvailabilityChecker.js', 'waitForScriptAvailability', 'load-failed', 'Auto-load failed, will poll', {
        assetName,
        error: loadError.message
      });
      // Continue to polling
    }
  }

  // Poll until script is ready or timeout
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;

      // Check timeout
      if (elapsed >= maxWaitTime) {
        clearInterval(intervalId);

        log('scriptAvailabilityChecker.js', 'waitForScriptAvailability', 'timeout', 'Script availability timeout', {
          assetName,
          elapsed,
          maxWaitTime
        });

        if (window.performanceTracker) {
          window.performanceTracker.step({
            step: 'waitForScript_timeout',
            file: 'scriptAvailabilityChecker.js',
            method: 'waitForScriptAvailability',
            flag: 'timeout',
            purpose: `Script ${assetName} timeout after ${maxWaitTime}ms`
          });
        }

        reject(new Error(`Script "${assetName}" not available after ${maxWaitTime}ms`));
        return;
      }

      // Check if script is ready
      if (isScriptReady(assetName, checkGlobal)) {
        clearInterval(intervalId);

        log('scriptAvailabilityChecker.js', 'waitForScriptAvailability', 'ready', 'Script is now available', {
          assetName,
          elapsed,
          checkGlobal
        });

        if (window.performanceTracker) {
          window.performanceTracker.step({
            step: 'waitForScript_ready',
            file: 'scriptAvailabilityChecker.js',
            method: 'waitForScriptAvailability',
            flag: 'ready',
            purpose: `Script ${assetName} ready after ${elapsed}ms`
          });
        }

        resolve(true);
        return;
      }

      // Log periodic status (every 1 second)
      if (elapsed % 1000 < pollInterval) {
        log('scriptAvailabilityChecker.js', 'waitForScriptAvailability', 'polling', 'Still waiting for script', {
          assetName,
          elapsed,
          remainingTime: maxWaitTime - elapsed
        });
      }
    }, pollInterval);
  });
}

/**
 * @function waitForCognitoScript
 * @description Convenience function to wait for Cognito script availability
 * @param {Object} options - Configuration options (see waitForScriptAvailability)
 * @returns {Promise<boolean>} Resolves true when Cognito is available
 */
export async function waitForCognitoScript(options = {}) {
  return waitForScriptAvailability('cognito', {
    pollInterval: 100,
    maxWaitTime: 30000,
    checkGlobal: 'AmazonCognitoIdentity',
    autoLoad: true,
    ...options
  });
}

/**
 * @function getScriptLoadingState
 * @description Get the current loading state of a script asset
 * @param {string} assetName - The asset name registered in AssetHandler
 * @returns {Object} State object { state: string, inDOM: boolean, loaded: boolean, failed: boolean }
 */
export function getScriptLoadingState(assetName) {
  const handler = getAssetHandler();

  const inDOM = handler.isAssetAlreadyInDOM(assetName, 'script');
  const loaded = handler.loadedAssets.has(assetName);
  const failed = handler.failedAssets.has(assetName);
  const inFlight = handler.inFlightAssets.has(assetName);

  let state = 'not-loaded';
  if (inFlight) state = 'loading';
  else if (failed) state = 'failed';
  else if (loaded || inDOM) state = 'loaded';

  const result = {
    state,
    inDOM,
    loaded,
    failed,
    inFlight
  };

  log('scriptAvailabilityChecker.js', 'getScriptLoadingState', 'return', 'Script loading state', {
    assetName,
    ...result
  });

  return result;
}

/**
 * @function addAssetToHandler
 * @description Add a new asset to the handler configuration
 * @param {Object} asset - Asset configuration object
 * @returns {boolean} Success status
 */
export function addAssetToHandler(asset) {
  const handler = getAssetHandler();

  if (!asset.name || !asset.url || !asset.type) {
    log('scriptAvailabilityChecker.js', 'addAssetToHandler', 'error', 'Invalid asset configuration', { asset });
    return false;
  }

  // Check if asset already exists
  if (handler.assetMap.has(asset.name)) {
    log('scriptAvailabilityChecker.js', 'addAssetToHandler', 'exists', 'Asset already registered', { name: asset.name });
    return true;
  }

  // Add to config
  handler.config.push(asset);
  handler.assetMap.set(asset.name, asset);

  log('scriptAvailabilityChecker.js', 'addAssetToHandler', 'added', 'Asset added to handler', { name: asset.name });
  return true;
}

/**
 * @function updateAssetUrlFromAssetMap
 * @description Update asset URL from assetMap.json configuration
 * @param {string} assetName - Name of asset to update
 * @param {string} assetFlag - Asset flag in assetMap.json (e.g., 'script.cognito')
 * @returns {Promise<boolean>} Success status
 */
export async function updateAssetUrlFromAssetMap(assetName, assetFlag) {
  const handler = getAssetHandler();

  try {
    const url = await getAssetUrl(assetFlag);

    if (!url) {
      log('scriptAvailabilityChecker.js', 'updateAssetUrlFromAssetMap', 'not-found', 'Asset URL not found in assetMap', {
        assetName,
        assetFlag
      });
      return false;
    }

    const asset = handler.assetMap.get(assetName);
    if (asset) {
      asset.url = url;
      log('scriptAvailabilityChecker.js', 'updateAssetUrlFromAssetMap', 'updated', 'Asset URL updated from assetMap', {
        assetName,
        url
      });
      return true;
    }

    return false;
  } catch (error) {
    log('scriptAvailabilityChecker.js', 'updateAssetUrlFromAssetMap', 'error', 'Failed to update asset URL', {
      error: error.message,
      assetName,
      assetFlag
    });
    return false;
  }
}

export default {
  isScriptInDOM,
  isScriptReady,
  loadScript,
  waitForScriptAvailability,
  waitForCognitoScript,
  getScriptLoadingState,
  addAssetToHandler,
  updateAssetUrlFromAssetMap
};

