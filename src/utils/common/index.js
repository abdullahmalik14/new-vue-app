/**
 * Common Utilities - Central export file
 * 
 * Exports all common utility functions used throughout the application.
 */

// Export all object safety functions
export {
  deepMergePreferChild,
  safelyGetNestedProperty,
  assertValuePresent,
  isValuePresent,
  deepCloneObject
} from './objectSafety.js';

// Export JSON configuration loader utilities (browser version)
export {
  loadJsonConfig,
  loadJsonConfigFromImport,
  clearConfigCache,
  getConfigStatistics
} from './jsonConfigLoader.js';

// Export global formatting utilities
export {
  formatDecimal,
  formatCurrency,
  formatPrice,
  formatUsdPrice,
  formatDate
} from './formatters.js';
