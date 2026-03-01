// vueApp-main-new/src/utils/auth/authHandler.js

import { awsCognitoHandler } from './awsCognitoHandler';
import { authHandlerDev } from './authHandlerDev';
import { log } from '../common/logHandler';
/**
 * @file authHandler.js
 * @description Authentication handler factory with runtime toggle
 * @purpose Supports switching between development and Cognito auth handlers
 *
 * Environment: VITE_AUTH_DEV_SHIM ('dev' | 'cognito')
 * Runtime: useAuthHandler('dev') or useAuthHandler('cognito')
 * Console: window.APP.useAuthHandler('dev')
 */

// Performance tracker available globally as window.performanceTracker

// Determine initial handler based on environment
const authMode = import.meta.env.VITE_AUTH_DEV_SHIM;
const isDevelopment = import.meta.env.DEV ||
  import.meta.env.MODE === 'development' ||
  import.meta.env.NODE_ENV === 'development';

const shouldUseDev = authMode === 'dev' || (authMode !== 'cognito' && isDevelopment);

// Default to appropriate handler based on environment
let currentHandler = shouldUseDev ? authHandlerDev : awsCognitoHandler;

// Log initial handler selection
log('authHandler.js', 'initialization', 'init', 'Initializing auth handler', {
  authMode,
  isDevelopment,
  shouldUseDev,
  selectedHandler: shouldUseDev ? 'dev' : 'cognito'
});

if (window.performanceTracker) {
  window.performanceTracker.step({
    step: 'authHandler_init',
    file: 'authHandler.js',
    method: 'initialization',
    flag: 'init',
    purpose: 'Initialize auth handler based on environment'
  });
}

if (shouldUseDev) {
  if (authMode === 'dev') {
    log('authHandler.js', 'initialization', 'dev-forced', 'Using development handler (forced by VITE_AUTH_DEV_SHIM=dev)', {});
  } else {
    log('authHandler.js', 'initialization', 'dev-auto', 'Using development handler (auto-detected development mode)', {});
  }
} else {
  if (authMode === 'cognito') {
    log('authHandler.js', 'initialization', 'cognito-forced', 'Using Cognito handler (forced by VITE_AUTH_DEV_SHIM=cognito)', {});
  } else {
    log('authHandler.js', 'initialization', 'cognito-auto', 'Using Cognito handler (auto-detected production mode)', {});
  }
}

/**
 * @function getAuthHandler
 * @description Get current active auth handler
 * @returns {object} Current auth handler
 */
export function getAuthHandler() {
  log('authHandler.js', 'getAuthHandler', 'get', 'Getting current auth handler', {
    handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
  });
  window.performanceTracker.step({
    step: 'getAuthHandler',
    file: 'authHandler.js',
    method: 'getAuthHandler',
    flag: 'get',
    purpose: 'Retrieve current handler'
  });

  return currentHandler;
}

/**
 * @function useAuthHandler
 * @description Switch auth handler at runtime
 * @param {string} type - Handler type ('dev' | 'cognito')
 * @returns {object} New auth handler
 */
export function useAuthHandler(type) {
  log('authHandler.js', 'useAuthHandler', 'start', 'Switching auth handler', {
    requestedType: type,
    currentType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
  });
  window.performanceTracker.step({
    step: 'useAuthHandler_start',
    file: 'authHandler.js',
    method: 'useAuthHandler',
    flag: 'start',
    purpose: 'Switch authentication handler'
  });

  const previousHandler = currentHandler === authHandlerDev ? 'dev' : 'cognito';

  if (type === 'dev') {
    currentHandler = authHandlerDev;
    log('authHandler.js', 'useAuthHandler', 'switch', 'Switched to development handler (bypassing Cognito)', {
      previousHandler
    });
  } else if (type === 'cognito') {
    currentHandler = awsCognitoHandler;
    log('authHandler.js', 'useAuthHandler', 'switch', 'Switched to production Cognito handler', {
      previousHandler
    });
  } else {
    log('authHandler.js', 'useAuthHandler', 'invalid', 'Invalid handler type requested', {
      requestedType: type,
      validTypes: ['dev', 'cognito']
    });
    window.performanceTracker.step({
      step: 'useAuthHandler_invalid',
      file: 'authHandler.js',
      method: 'useAuthHandler',
      flag: 'error',
      purpose: 'Invalid handler type'
    });
    return currentHandler;
  }

  if (previousHandler !== type) {
    log('authHandler.js', 'useAuthHandler', 'changed', 'Handler changed successfully', {
      from: previousHandler,
      to: type
    });
    window.performanceTracker.step({
      step: 'useAuthHandler_changed',
      file: 'authHandler.js',
      method: 'useAuthHandler',
      flag: 'success',
      purpose: 'Handler switch complete'
    });
  } else {
    log('authHandler.js', 'useAuthHandler', 'unchanged', 'Handler already set to requested type', { type });
    window.performanceTracker.step({
      step: 'useAuthHandler_unchanged',
      file: 'authHandler.js',
      method: 'useAuthHandler',
      flag: 'unchanged',
      purpose: 'No handler change needed'
    });
  }

  return currentHandler;
}

/**
 * @function getCurrentAuthMode
 * @description Get current auth mode ('dev' or 'cognito')
 * @returns {string} Current auth mode
 */
export function getCurrentAuthMode() {
  const mode = currentHandler === authHandlerDev ? 'dev' : 'cognito';

  log('authHandler.js', 'getCurrentAuthMode', 'get', 'Getting current auth mode', { mode });
  window.performanceTracker.step({
    step: 'getCurrentAuthMode',
    file: 'authHandler.js',
    method: 'getCurrentAuthMode',
    flag: 'get',
    purpose: 'Retrieve current auth mode'
  });

  return mode;
}

// Export dynamic handler that always points to current one
export const authHandler = {
  login: (...args) => {
    log('authHandler.js', 'authHandler.login', 'proxy', 'Proxying login to current handler', {
      handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
    });
    return currentHandler.login(...args);
  },

  signup: (...args) => {
    log('authHandler.js', 'authHandler.signup', 'proxy', 'Proxying signup to current handler', {
      handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
    });
    return currentHandler.signup(...args);
  },

  register: (...args) => {
    log('authHandler.js', 'authHandler.register', 'proxy', 'Proxying register to current handler', {
      handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
    });
    return currentHandler.register ? currentHandler.register(...args) : currentHandler.signup(...args);
  },

  logout: (...args) => {
    log('authHandler.js', 'authHandler.logout', 'proxy', 'Proxying logout to current handler', {
      handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
    });
    return currentHandler.logout(...args);
  },

  restoreSession: (...args) => {
    log('authHandler.js', 'authHandler.restoreSession', 'proxy', 'Proxying restoreSession to current handler', {
      handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
    });
    return currentHandler.restoreSession(...args);
  },

  handleCallback: (...args) => {
    log('authHandler.js', 'authHandler.handleCallback', 'proxy', 'Proxying handleCallback to current handler', {
      handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
    });
    return currentHandler.handleCallback(...args);
  },

  updateProfileAttributes: (...args) => {
    log('authHandler.js', 'authHandler.updateProfileAttributes', 'proxy', 'Proxying updateProfileAttributes to current handler', {
      handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
    });
    return currentHandler.updateProfileAttributes(...args);
  },

  changePassword: (...args) => {
    log('authHandler.js', 'authHandler.changePassword', 'proxy', 'Proxying changePassword to current handler', {
      handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
    });
    return currentHandler.changePassword ? currentHandler.changePassword(...args) : Promise.reject('Not supported');
  },

  forgotPassword: (...args) => {
    log('authHandler.js', 'authHandler.forgotPassword', 'proxy', 'Proxying forgotPassword to current handler', {
      handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
    });
    return currentHandler.forgotPassword ? currentHandler.forgotPassword(...args) : Promise.reject('Not supported');
  },

  confirmPassword: (...args) => {
    log('authHandler.js', 'authHandler.confirmPassword', 'proxy', 'Proxying confirmPassword to current handler', {
      handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
    });
    return currentHandler.confirmPassword ? currentHandler.confirmPassword(...args) : Promise.reject('Not supported');
  },

  getPendingTokens: (...args) => {
    log('authHandler.js', 'authHandler.getPendingTokens', 'proxy', 'Proxying getPendingTokens to current handler', {
      handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
    });
    return currentHandler.getPendingTokens ? currentHandler.getPendingTokens(...args) : null;
  },
  // Add confirmSignUp proxy for email verification in Cognito/dev shim
  confirmSignUp: (...args) => {
    log('authHandler.js', 'authHandler.confirmSignUp', 'proxy', 'Proxying confirmSignUp to current handler', {
      handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
    });
    if (currentHandler && typeof currentHandler?.confirmSignUp === 'function') {
      return currentHandler.confirmSignUp(...args);
    }
    return Promise.reject('Not supported');
  },

  // Add resendConfirmationCode proxy for email verification
  resendConfirmationCode: (...args) => {
    log('authHandler.js', 'authHandler.resendConfirmationCode', 'proxy', 'Proxying resendConfirmationCode to current handler', {
      handlerType: currentHandler === authHandlerDev ? 'dev' : 'cognito'
    });
    if (currentHandler && typeof currentHandler?.resendConfirmationCode === 'function') {
      return currentHandler.resendConfirmationCode(...args);
    }
    return Promise.reject('Not supported');
  }
};

// Expose toggle in console for testing
if (typeof window !== 'undefined') {
  window.APP = window.APP || {};
  window.APP.useAuthHandler = useAuthHandler;
  window.APP.getAuthHandler = getAuthHandler;
  window.APP.getCurrentAuthMode = getCurrentAuthMode;

  // Add test function to verify toggle works
  window.APP.testAuthToggle = async () => {
    log('authHandler.js', 'testAuthToggle', 'start', 'Testing auth handler toggle', {});
    window.performanceTracker.step({
      step: 'testAuthToggle_start',
      file: 'authHandler.js',
      method: 'testAuthToggle',
      flag: 'start',
      purpose: 'Test handler toggle functionality'
    });

    // Test dev mode
    window.APP.useAuthHandler('dev');
    log('authHandler.js', 'testAuthToggle', 'dev-test', 'Dev mode test', {
      getCurrentUser: typeof authHandler.getCurrentUser,
      mockUserRole: typeof authHandlerDev.mockUserRole
    });

    // Test cognito mode  
    window.APP.useAuthHandler('cognito');
    log('authHandler.js', 'testAuthToggle', 'cognito-test', 'Cognito mode test', {
      getCurrentUser: typeof authHandler.getCurrentUser,
      mockUserRole: typeof authHandlerDev.mockUserRole
    });

    log('authHandler.js', 'testAuthToggle', 'complete', 'Toggle test complete', {});
    window.performanceTracker.step({
      step: 'testAuthToggle_complete',
      file: 'authHandler.js',
      method: 'testAuthToggle',
      flag: 'success',
      purpose: 'Toggle test complete'
    });
  };

  log('authHandler.js', 'window-api', 'expose', 'Console commands exposed', {
    commands: [
      'window.APP.useAuthHandler("dev")',
      'window.APP.useAuthHandler("cognito")',
      'window.APP.getCurrentAuthMode()',
      'window.APP.testAuthToggle()'
    ]
  });
}

// Re-export for explicit imports if needed
export { authHandlerDev, awsCognitoHandler };

