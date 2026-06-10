/**
 * ErrorHandler - Application Error Management System
 * 
 * Responsible for handling, reporting, and logging application errors.
 * Use reportApplicationError for critical issues that need tracking,
 * and logError for internal error visibility.
 */

import { log } from '../logging/logHandler.js';

class ErrorHandler {
  /**
   * Main error reporting method as per architecture guidelines.
   * Logs locally and forwards to external reporters (e.g. Sentry).
   */
  reportApplicationError(fileName, methodName, description, error, additionalData = {}) {
    this.logError(fileName, methodName, description, error, additionalData);

    if (typeof window !== 'undefined' && typeof window.reportAppError === 'function') {
      try {
        window.reportAppError({
          fileName,
          methodName,
          description,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          ...additionalData,
        });
      } catch (reportingError) {
        this.logError(
          'errorHandler.js',
          'reportApplicationError',
          'External error reporter failed',
          reportingError,
          { originalDescription: description },
        );
      }
    }
  }

  /**
   * Log an error locally with context
   */
  logError(fileName, methodName, description, error, additionalData = {}) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const errorData = {
      ...additionalData,
      error: errorMessage,
      ...(errorStack && { stack: errorStack })
    };

    log(fileName, methodName, 'error', description, errorData);
    console.error(`[${fileName}] [${methodName}] ${description}`, errorData);
  }

  isError(value) {
    return value instanceof Error;
  }

  handleErrorSilently(error, operationContext, additionalData = null) {
    this.logError('errorHandler.js', 'handleErrorSilently', `Error in ${operationContext}`, error, additionalData);
  }
}

export const errorHandler = new ErrorHandler();

// Legacy exports for backward compatibility across the codebase
export const logError = errorHandler.logError.bind(errorHandler);
export const reportApplicationError = errorHandler.reportApplicationError.bind(errorHandler);
export const isError = errorHandler.isError.bind(errorHandler);
export const handleErrorSilently = errorHandler.handleErrorSilently.bind(errorHandler);
