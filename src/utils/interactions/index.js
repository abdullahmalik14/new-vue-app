// src/utils/interactions/index.js

/**
 * @file index.js
 * @description Exports for interactions utilities
 * @purpose Centralized exports for script availability and asset handler utilities
 */

// Script availability checker (includes AssetHandler management)
export {
  isScriptInDOM,
  isScriptReady,
  loadScript,
  waitForScriptAvailability,
  waitForCognitoScript,
  getScriptLoadingState,
  addAssetToHandler,
  updateAssetUrlFromAssetMap
} from './scriptAvailabilityChecker.js';

