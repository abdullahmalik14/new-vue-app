/**
 * ErrorHandler - Simple error logging utility
 * 
 * Provides basic error logging without complex wrappers.
 * Use standard try/catch blocks in code with this logging utility.
 */

import { log } from './logHandler.js';

/**
 * @function logError
 * @description Log an error with context (always logs, even in production)
 * @param {string} fileName - Source file name
 * @param {string} methodName - Method or function name
 * @param {string} description - Error description
 * @param {Error|string} error - Error object or message
 * @param {object} additionalData - Additional context data
 * @returns {void}
 */
export function logError(fileName, methodName, description, error, additionalData = {}) {
  // Extract error details
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Build error data
  const errorData = {
    ...additionalData,
    error: errorMessage,
    ...(errorStack && { stack: errorStack })
  };

  // Log using standard log method
  log(fileName, methodName, 'error', description, errorData);

  // ALWAYS print to console (even in production for debugging)
  console.error(`[${fileName}] [${methodName}] ${description}`, errorData);
}

/**
 * @function isError
 * @description Check if value is an Error object
 * @param {any} value - Value to check
 * @returns {boolean} - True if value is an Error
 */
export function isError(value) {
  return value instanceof Error;
}

// Export for backward compatibility (but prefer direct try/catch usage)
export function handleErrorSilently(error, operationContext, additionalData = null) {
  logError('errorHandler.js', 'handleErrorSilently', `Error in ${operationContext}`, error, additionalData);
}
