/**
 * Common Utilities - Central export file
 * 
 * Exports all common utility functions used throughout the application:
 * - Cache management
 * - Logging
 * - Object safety operations
 * - Error handling
 * - JSON configuration loading
 */

// Export all cache handler functions
export {
  setValueWithExpiration,
  getValueFromCache,
  hasValidCacheEntry,
  removeFromCache,
  clearAllCache,
  getCacheStatistics
} from './cacheHandler.js';

// Export all log handler functions
export {
  logDebugMessage,
  logInfoMessage,
  logWarningMessage,
  logErrorMessage,
  isLoggerEnabled,
  log,
  logger
} from './logHandler.js';

// Export all object safety functions
export {
  deepMergePreferChild,
  safelyGetNestedProperty,
  assertValuePresent,
  isValuePresent,
  deepCloneObject
} from './objectSafety.js';

// Export all error handler functions
export {
  handleErrorSilently,
  logError,
  isError
} from './errorHandler.js';

// Export global performance tracker (if it exists)
export {
  getGlobalPerformanceTracker
} from './performanceTrackerAccess.js';

// Export JSON configuration loader utilities (browser version)
export {
  loadJsonConfig,
  loadJsonConfigFromImport,
  clearConfigCache,
  getConfigStatistics
} from './jsonConfigLoader.js';

