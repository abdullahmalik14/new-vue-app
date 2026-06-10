// vueApp-main-new/src/utils/auth/index.js

/**
 * @file index.js
 * @description Exports all authentication utilities and handlers
 * @purpose Central export point for auth module
 */

// Export main auth handler (factory)
export { authHandler, getAuthHandler, useAuthHandler, getCurrentAuthMode } from './authHandler';

// Export specific handlers
export { awsCognitoHandler } from './awsCognitoHandler';
export { authHandlerDev } from './authHandlerDev';

// Export auth utilities
export {
  isLoggedIn,
  getUserRole,
  getUserProfile,
  hasUserPassedKyc,
  hasUserPassedOnboarding,
  getUserEmail,
  isUserRole,
  getUserAttribute
} from './authUtilities';

// Export Cognito utilities (for advanced use cases)
export {
  initializeCognitoUserPool,
  getCognitoUserPool,
  createCognitoUser,
  getCurrentCognitoUser,
  createAuthenticationDetails,
  createCognitoAttributes,
  getCognitoUserSession,
  updateCognitoUserAttributes,
  signOutCognitoUser
} from './awsCognitoUtilities';

