/**
 * Global Performance Tracker Access Utility
 * 
 * Provides safe access to the global performanceTracker instance
 * that is initialized once in main.js and attached to window.performanceTracker.
 * 
 * This utility ensures that all calls to the tracker are guarded,
 * preventing errors if the tracker is not initialized or disabled.
 */

/**
 * Get the global performance tracker instance safely
 * @returns {object} The global performance tracker or a no-op mock
 */
export function getPerformanceTracker() {
  if (typeof window !== 'undefined' && window.performanceTracker) {
    return window.performanceTracker;
  }
  
  // Return a no-op tracker for cases where it's not initialized
  // (e.g., SSR, tests, or before main.js runs)
  return {
    start: () => {},
    step: () => {},
    table: () => [],
    reset: () => {},
    enabled: false
  };
}

/**
 * Safely execute a performance tracking step
 * Guards against missing tracker or disabled tracking
 * 
 * @param {object} stepData - Step data object
 * @param {string} stepData.step - Step name
 * @param {string} stepData.file - Source file
 * @param {string} stepData.method - Method name
 * @param {string} stepData.flag - Flag/category
 * @param {string} stepData.purpose - Purpose description
 * @returns {void}
 */
export function trackStep(stepData) {
  const tracker = getPerformanceTracker();
  
  if (tracker && tracker.enabled && typeof tracker.step === 'function') {
    try {
      tracker.step(stepData);
    } catch (error) {
      // Silent fail - performance tracking should never break app flow
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[performanceTrackerAccess] Failed to track step:', error.message);
      }
    }
  }
}

/**
 * Check if performance tracking is enabled
 * @returns {boolean} True if enabled
 */
export function isTrackingEnabled() {
  const tracker = getPerformanceTracker();
  return tracker && tracker.enabled === true;
}

/**
 * Get performance table data safely
 * @returns {Array} Performance table or empty array
 */
export function getPerformanceTable() {
  const tracker = getPerformanceTracker();
  
  if (tracker && typeof tracker.table === 'function') {
    try {
      return tracker.table();
    } catch (error) {
      return [];
    }
  }
  
  return [];
}

/**
 * Reset performance tracker safely
 * @returns {void}
 */
export function resetPerformanceTracker() {
  const tracker = getPerformanceTracker();
  
  if (tracker && typeof tracker.reset === 'function') {
    try {
      tracker.reset();
    } catch (error) {
      // Silent fail
    }
  }
}

