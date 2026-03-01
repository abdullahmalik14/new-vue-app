// vueApp-main-new/src/utils/auth/authUtilities.js

import { log } from '../common/logHandler';
/**
 * @file authUtilities.js
 * @description Authentication helper utilities for route guards and app logic
 * @purpose Provides helpers for checking auth state, user roles, and dependencies
 */

// Performance tracker available globally as window.performanceTracker

/**
 * @function isLoggedIn
 * @description Check if user is currently authenticated
 * @returns {Promise<boolean>} Authentication status
 */
export async function isLoggedIn() {
  log('authUtilities.js', 'isLoggedIn', 'start', 'Checking if user is logged in', {});
  window.performanceTracker.step({
    step: 'isLoggedIn_start',
    file: 'authUtilities.js',
    method: 'isLoggedIn',
    flag: 'start',
    purpose: 'Check authentication status'
  });

  try {
    // Dynamic import to avoid circular dependency
    const { useAuthStore } = await import('../../stores/useAuthStore');
    const authStore = useAuthStore();

    const isAuthenticated = !!(authStore.currentUser && authStore.idToken);

    log('authUtilities.js', 'isLoggedIn', 'result', 'Authentication check complete', { isAuthenticated });
    window.performanceTracker.step({
      step: 'isLoggedIn_complete',
      file: 'authUtilities.js',
      method: 'isLoggedIn',
      flag: 'success',
      purpose: 'Authentication check complete'
    });

    return isAuthenticated;
  } catch (error) {
    log('authUtilities.js', 'isLoggedIn', 'error', 'Error checking authentication', { 
      error: error.message, 
      stack: error.stack 
    });
    window.performanceTracker.step({
      step: 'isLoggedIn_error',
      file: 'authUtilities.js',
      method: 'isLoggedIn',
      flag: 'error',
      purpose: 'Authentication check failed'
    });
    return false;
  }
}

/**
 * @function getUserRole
 * @description Get current user's role
 * @returns {string|null} User role or null
 */
export function getUserRole() {
  log('authUtilities.js', 'getUserRole', 'start', 'Getting user role', {});
  window.performanceTracker.step({
    step: 'getUserRole_start',
    file: 'authUtilities.js',
    method: 'getUserRole',
    flag: 'start',
    purpose: 'Retrieve user role'
  });

  try {
    // Get from Pinia store (synchronous)
    const authStoreModule = import.meta.glob('../../stores/useAuthStore.js', { eager: true });
    const authModule = Object.values(authStoreModule)[0];
    
    if (!authModule || !authModule.useAuthStore) {
      log('authUtilities.js', 'getUserRole', 'no-store', 'Auth store not available', {});
      window.performanceTracker.step({
        step: 'getUserRole_no_store',
        file: 'authUtilities.js',
        method: 'getUserRole',
        flag: 'no-store',
        purpose: 'Store not available'
      });
      return null;
    }

    const authStore = authModule.useAuthStore();
    const role = authStore.currentUser?.role || authStore.simulate?.role || null;

    log('authUtilities.js', 'getUserRole', 'result', 'User role retrieved', { role });
    window.performanceTracker.step({
      step: 'getUserRole_complete',
      file: 'authUtilities.js',
      method: 'getUserRole',
      flag: 'success',
      purpose: 'User role returned'
    });

    return role;
  } catch (error) {
    log('authUtilities.js', 'getUserRole', 'error', 'Error getting user role', { 
      error: error.message, 
      stack: error.stack 
    });
    window.performanceTracker.step({
      step: 'getUserRole_error',
      file: 'authUtilities.js',
      method: 'getUserRole',
      flag: 'error',
      purpose: 'Failed to get user role'
    });
    return null;
  }
}

/**
 * @function getUserProfile
 * @description Get current user's full profile
 * @returns {object|null} User profile or null
 */
export async function getUserProfile() {
  log('authUtilities.js', 'getUserProfile', 'start', 'Getting user profile', {});
  window.performanceTracker.step({
    step: 'getUserProfile_start',
    file: 'authUtilities.js',
    method: 'getUserProfile',
    flag: 'start',
    purpose: 'Retrieve user profile'
  });

  try {
    const { useAuthStore } = await import('../../stores/useAuthStore');
    const authStore = useAuthStore();
    const profile = authStore.currentUser || authStore.simulate || null;

    log('authUtilities.js', 'getUserProfile', 'result', 'User profile retrieved', { 
      hasProfile: !!profile,
      email: profile?.email
    });
    window.performanceTracker.step({
      step: 'getUserProfile_complete',
      file: 'authUtilities.js',
      method: 'getUserProfile',
      flag: 'success',
      purpose: 'User profile returned'
    });

    return profile;
  } catch (error) {
    log('authUtilities.js', 'getUserProfile', 'error', 'Error getting user profile', { 
      error: error.message, 
      stack: error.stack 
    });
    window.performanceTracker.step({
      step: 'getUserProfile_error',
      file: 'authUtilities.js',
      method: 'getUserProfile',
      flag: 'error',
      purpose: 'Failed to get user profile'
    });
    return null;
  }
}

/**
 * @function hasUserPassedKyc
 * @description Check if user has completed KYC verification
 * @returns {Promise<boolean>} KYC status
 */
export async function hasUserPassedKyc() {
  log('authUtilities.js', 'hasUserPassedKyc', 'start', 'Checking KYC status', {});
  window.performanceTracker.step({
    step: 'hasUserPassedKyc_start',
    file: 'authUtilities.js',
    method: 'hasUserPassedKyc',
    flag: 'start',
    purpose: 'Check KYC completion'
  });

  try {
    const profile = await getUserProfile();
    const kycPassed = profile?.kycPassed === true;

    log('authUtilities.js', 'hasUserPassedKyc', 'result', 'KYC check complete', { kycPassed });
    window.performanceTracker.step({
      step: 'hasUserPassedKyc_complete',
      file: 'authUtilities.js',
      method: 'hasUserPassedKyc',
      flag: 'success',
      purpose: 'KYC check complete'
    });

    return kycPassed;
  } catch (error) {
    log('authUtilities.js', 'hasUserPassedKyc', 'error', 'Error checking KYC status', { 
      error: error.message, 
      stack: error.stack 
    });
    window.performanceTracker.step({
      step: 'hasUserPassedKyc_error',
      file: 'authUtilities.js',
      method: 'hasUserPassedKyc',
      flag: 'error',
      purpose: 'KYC check failed'
    });
    return false;
  }
}

/**
 * @function hasUserPassedOnboarding
 * @description Check if user has completed onboarding
 * @returns {Promise<boolean>} Onboarding status
 */
export async function hasUserPassedOnboarding() {
  log('authUtilities.js', 'hasUserPassedOnboarding', 'start', 'Checking onboarding status', {});
  window.performanceTracker.step({
    step: 'hasUserPassedOnboarding_start',
    file: 'authUtilities.js',
    method: 'hasUserPassedOnboarding',
    flag: 'start',
    purpose: 'Check onboarding completion'
  });

  try {
    const profile = await getUserProfile();
    const onboardingPassed = profile?.onboardingPassed === true;

    log('authUtilities.js', 'hasUserPassedOnboarding', 'result', 'Onboarding check complete', { onboardingPassed });
    window.performanceTracker.step({
      step: 'hasUserPassedOnboarding_complete',
      file: 'authUtilities.js',
      method: 'hasUserPassedOnboarding',
      flag: 'success',
      purpose: 'Onboarding check complete'
    });

    return onboardingPassed;
  } catch (error) {
    log('authUtilities.js', 'hasUserPassedOnboarding', 'error', 'Error checking onboarding status', { 
      error: error.message, 
      stack: error.stack 
    });
    window.performanceTracker.step({
      step: 'hasUserPassedOnboarding_error',
      file: 'authUtilities.js',
      method: 'hasUserPassedOnboarding',
      flag: 'error',
      purpose: 'Onboarding check failed'
    });
    return false;
  }
}

/**
 * @function getUserEmail
 * @description Get current user's email
 * @returns {Promise<string|null>} User email or null
 */
export async function getUserEmail() {
  log('authUtilities.js', 'getUserEmail', 'start', 'Getting user email', {});
  window.performanceTracker.step({
    step: 'getUserEmail_start',
    file: 'authUtilities.js',
    method: 'getUserEmail',
    flag: 'start',
    purpose: 'Retrieve user email'
  });

  try {
    const profile = await getUserProfile();
    const email = profile?.email || null;

    log('authUtilities.js', 'getUserEmail', 'result', 'User email retrieved', { hasEmail: !!email });
    window.performanceTracker.step({
      step: 'getUserEmail_complete',
      file: 'authUtilities.js',
      method: 'getUserEmail',
      flag: 'success',
      purpose: 'User email returned'
    });

    return email;
  } catch (error) {
    log('authUtilities.js', 'getUserEmail', 'error', 'Error getting user email', { 
      error: error.message, 
      stack: error.stack 
    });
    window.performanceTracker.step({
      step: 'getUserEmail_error',
      file: 'authUtilities.js',
      method: 'getUserEmail',
      flag: 'error',
      purpose: 'Failed to get user email'
    });
    return null;
  }
}

/**
 * @function isUserRole
 * @description Check if user has specific role
 * @param {string} roleToCheck - Role to check for
 * @returns {boolean} True if user has role
 */
export function isUserRole(roleToCheck) {
  log('authUtilities.js', 'isUserRole', 'start', 'Checking user role', { roleToCheck });
  window.performanceTracker.step({
    step: 'isUserRole_start',
    file: 'authUtilities.js',
    method: 'isUserRole',
    flag: 'start',
    purpose: 'Check if user has specific role'
  });

  try {
    const currentRole = getUserRole();
    const hasRole = currentRole === roleToCheck;

    log('authUtilities.js', 'isUserRole', 'result', 'Role check complete', { roleToCheck, currentRole, hasRole });
    window.performanceTracker.step({
      step: 'isUserRole_complete',
      file: 'authUtilities.js',
      method: 'isUserRole',
      flag: 'success',
      purpose: 'Role check complete'
    });

    return hasRole;
  } catch (error) {
    log('authUtilities.js', 'isUserRole', 'error', 'Error checking user role', { 
      roleToCheck, 
      error: error.message, 
      stack: error.stack 
    });
    window.performanceTracker.step({
      step: 'isUserRole_error',
      file: 'authUtilities.js',
      method: 'isUserRole',
      flag: 'error',
      purpose: 'Role check failed'
    });
    return false;
  }
}

/**
 * @function getUserAttribute
 * @description Get specific user attribute
 * @param {string} attributeName - Attribute name to retrieve
 * @param {any} fallback - Fallback value if not found
 * @returns {Promise<any>} Attribute value or fallback
 */
export async function getUserAttribute(attributeName, fallback = null) {
  log('authUtilities.js', 'getUserAttribute', 'start', 'Getting user attribute', { attributeName });
  window.performanceTracker.step({
    step: 'getUserAttribute_start',
    file: 'authUtilities.js',
    method: 'getUserAttribute',
    flag: 'start',
    purpose: 'Retrieve specific user attribute'
  });

  try {
    const profile = await getUserProfile();
    const value = profile?.[attributeName] ?? fallback;

    log('authUtilities.js', 'getUserAttribute', 'result', 'Attribute retrieved', { 
      attributeName, 
      hasValue: value !== fallback 
    });
    window.performanceTracker.step({
      step: 'getUserAttribute_complete',
      file: 'authUtilities.js',
      method: 'getUserAttribute',
      flag: 'success',
      purpose: 'Attribute retrieval complete'
    });

    return value;
  } catch (error) {
    log('authUtilities.js', 'getUserAttribute', 'error', 'Error getting attribute', { 
      attributeName, 
      error: error.message, 
      stack: error.stack 
    });
    window.performanceTracker.step({
      step: 'getUserAttribute_error',
      file: 'authUtilities.js',
      method: 'getUserAttribute',
      flag: 'error',
      purpose: 'Attribute retrieval failed'
    });
    return fallback;
  }
}

