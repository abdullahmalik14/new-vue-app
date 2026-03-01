// vueApp-main-new/src/stores/useAuthStore.js

import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import { authHandler } from '../utils/auth/authHandler';
import { log } from '../utils/common/logHandler';
/**
 * @file useAuthStore.js
 * @description Pinia store for authentication state management
 * @purpose Manages user session, tokens, and auth state with persistence
 */

// Performance tracker available globally as window.performanceTracker

export const useAuthStore = defineStore('auth', {
  state: () => ({
    idToken: null,
    currentUser: null,
    simulate: {
      role: "creator",
      email: "dev@test.com",
      kycPassed: true,
      onboardingPassed: true
    },
    onboardingPassed: false,
    _refreshInterval: null
  }),

  getters: {
    /**
     * @getter isAuthenticated
     * @description Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated(state) {
      const authenticated = !!(state.currentUser && state.idToken);

      log('useAuthStore.js', 'isAuthenticated', 'get', 'Checking authentication status', { authenticated });
      window.performanceTracker.step({
        step: 'isAuthenticated_getter',
        file: 'useAuthStore.js',
        method: 'isAuthenticated',
        flag: 'get',
        purpose: 'Check if user is authenticated'
      });

      return authenticated;
    },

    /**
     * @getter userRole
     * @description Get current user's role
     * @returns {string|null} User role
     */
    userRole(state) {
      const role = state.currentUser?.role || state.simulate?.role || null;

      log('useAuthStore.js', 'userRole', 'get', 'Getting user role', { role });
      window.performanceTracker.step({
        step: 'userRole_getter',
        file: 'useAuthStore.js',
        method: 'userRole',
        flag: 'get',
        purpose: 'Retrieve user role'
      });

      return role;
    },

    /**
     * @getter userEmail
     * @description Get current user's email
     * @returns {string|null} User email
     */
    userEmail(state) {
      const email = state.currentUser?.email || null;

      log('useAuthStore.js', 'userEmail', 'get', 'Getting user email', { hasEmail: !!email });
      window.performanceTracker.step({
        step: 'userEmail_getter',
        file: 'useAuthStore.js',
        method: 'userEmail',
        flag: 'get',
        purpose: 'Retrieve user email'
      });

      return email;
    }
  },

  actions: {
    /**
     * @action setTokenAndDecode
     * @description Set idToken and decode it to populate currentUser
     * @param {string} idToken - JWT idToken from authentication
     * @returns {void}
     */
    setTokenAndDecode(idToken) {
      log('useAuthStore.js', 'setTokenAndDecode', 'start', 'Setting and decoding token', { tokenLength: idToken?.length });
      window.performanceTracker.step({
        step: 'setTokenAndDecode_start',
        file: 'useAuthStore.js',
        method: 'setTokenAndDecode',
        flag: 'start',
        purpose: 'Set and decode JWT token'
      });

      try {
        this.idToken = idToken;
        const decoded = jwtDecode(idToken);

        // Check for expiration immediately
        if (decoded.exp && (decoded.exp * 1000) < Date.now()) {
          throw new Error('Token expired');
        }

        log('useAuthStore.js', 'setTokenAndDecode', 'decoded', 'Token decoded successfully', {
          email: decoded.email,
          role: decoded['custom:role'],
          sub: decoded.sub
        });

        // Derive onboarding and kyc from token when available
        const hasRole = !!decoded['custom:role'];
        const kycPassedFromToken = decoded['custom:kyc'] === 'true';
        const hasUsername = !!decoded['custom:username'];
        const onboardingResolved = (hasRole && hasUsername) ? true : this.onboardingPassed;

        // Preserve existing role if token doesn't have it yet (Cognito propagation delay)
        // This handles the case where user completes onboarding, token is refreshed,
        // but Cognito hasn't propagated the custom:role attribute yet
        const roleFromToken = decoded['custom:role'];
        const roleResolved = roleFromToken || (this.currentUser?.role) || undefined;

        // Preserve existing kycPassed if token doesn't have it yet (Cognito propagation delay)
        // Token value takes precedence, but preserve local value if token is missing/undefined
        const kycPassedResolved = decoded['custom:kyc'] !== undefined
          ? kycPassedFromToken
          : (this.currentUser?.kycPassed ?? false);

        // Merge token data with existing currentUser to preserve locally set attributes
        // This ensures that attributes set locally (via updateUserAttributesLocally) are preserved
        // even if they're not yet in the token (Cognito propagation delay)
        this.currentUser = {
          // Preserve existing currentUser fields (like username, etc.)
          ...(this.currentUser || {}),
          // Override with token data (token is source of truth when available)
          email: decoded.email,
          role: roleResolved,
          kycPassed: kycPassedResolved,
          // treat onboarding as complete if token says so, otherwise if a role exists (Step 1 was saved in Cognito)
          onboardingPassed: onboardingResolved,
          // Always use latest token raw data
          raw: decoded
        };

        // Persist resolved onboarding flag so guards behave after reloads
        this.onboardingPassed = onboardingResolved;

        // Ensure refresh loop is running
        this.startTokenRefreshLoop();

        log('useAuthStore.js', 'setTokenAndDecode', 'success', 'User attributes extracted and merged', {
          email: this.currentUser.email,
          role: this.currentUser.role,
          kycPassed: this.currentUser.kycPassed,
          onboardingPassed: this.currentUser.onboardingPassed,
          preservedFromLocal: {
            role: !roleFromToken && !!this.currentUser.role,
            kycPassed: decoded['custom:kyc'] === undefined && this.currentUser.kycPassed !== undefined
          }
        });

        window.performanceTracker.step({
          step: 'setTokenAndDecode_complete',
          file: 'useAuthStore.js',
          method: 'setTokenAndDecode',
          flag: 'success',
          purpose: 'Token set and decoded'
        });
      } catch (error) {
        log('useAuthStore.js', 'setTokenAndDecode', 'error', 'Failed to decode token', {
          error: error.message,
          stack: error.stack
        });
        window.performanceTracker.step({
          step: 'setTokenAndDecode_error',
          file: 'useAuthStore.js',
          method: 'setTokenAndDecode',
          flag: 'error',
          purpose: 'Token decoding failed'
        });
        // Ensure we clean up if token is invalid/expired
        this.idToken = null;
        this.currentUser = null;
        localStorage.removeItem('idToken');
        throw error;
      }
    },

    /**
     * @action refreshFromStorage
     * @description Restore auth state from localStorage
     * @returns {void}
     */
    refreshFromStorage() {
      log('useAuthStore.js', 'refreshFromStorage', 'start', 'Refreshing from localStorage', {});
      window.performanceTracker.step({
        step: 'refreshFromStorage_start',
        file: 'useAuthStore.js',
        method: 'refreshFromStorage',
        flag: 'start',
        purpose: 'Restore auth state from storage'
      });

      try {
        const token = localStorage.getItem('idToken');

        if (token) {
          log('useAuthStore.js', 'refreshFromStorage', 'token-found', 'Token found in localStorage', { tokenLength: token.length });
          this.setTokenAndDecode(token);
        } else {
          log('useAuthStore.js', 'refreshFromStorage', 'no-token', 'No token found in localStorage', {});
        }

        // Restore simulate fallback
        try {
          const sim = localStorage.getItem('simulate');
          if (sim && !this.simulate) {
            this.simulate = JSON.parse(sim);
            log('useAuthStore.js', 'refreshFromStorage', 'simulate-restored', 'Simulate state restored', { simulate: this.simulate });
          }
        } catch (simError) {
          log('useAuthStore.js', 'refreshFromStorage', 'simulate-error', 'Failed to restore simulate state', { error: simError.message });
        }

        window.performanceTracker.step({
          step: 'refreshFromStorage_complete',
          file: 'useAuthStore.js',
          method: 'refreshFromStorage',
          flag: 'success',
          purpose: 'Storage refresh complete'
        });
      } catch (error) {
        log('useAuthStore.js', 'refreshFromStorage', 'error', 'Error refreshing from storage', {
          error: error.message,
          stack: error.stack
        });
        window.performanceTracker.step({
          step: 'refreshFromStorage_error',
          file: 'useAuthStore.js',
          method: 'refreshFromStorage',
          flag: 'error',
          purpose: 'Storage refresh failed'
        });
      }
    },

    /**
     * @action simulateRole
     * @description Simulate different user role for testing (dev only)
     * @param {string} role - Role to simulate
     * @param {object} overrides - Additional properties to override
     * @returns {void}
     */
    simulateRole(role, overrides = {}) {
      log('useAuthStore.js', 'simulateRole', 'start', 'Simulating user role', { role, overrides });
      window.performanceTracker.step({
        step: 'simulateRole_start',
        file: 'useAuthStore.js',
        method: 'simulateRole',
        flag: 'start',
        purpose: 'Simulate user role for testing'
      });

      try {
        this.simulate = { role, ...overrides };
        localStorage.setItem('simulate', JSON.stringify(this.simulate));

        log('useAuthStore.js', 'simulateRole', 'success', 'Role simulated and persisted', { simulate: this.simulate });
        window.performanceTracker.step({
          step: 'simulateRole_complete',
          file: 'useAuthStore.js',
          method: 'simulateRole',
          flag: 'success',
          purpose: 'Role simulation complete'
        });
      } catch (error) {
        log('useAuthStore.js', 'simulateRole', 'error', 'Failed to simulate role', {
          role,
          error: error.message,
          stack: error.stack
        });
        window.performanceTracker.step({
          step: 'simulateRole_error',
          file: 'useAuthStore.js',
          method: 'simulateRole',
          flag: 'error',
          purpose: 'Role simulation failed'
        });
      }
    },

    /**
     * @action updateUserAttributesLocally
     * @description Update user attributes in local state
     * @param {object} updates - Attributes to update
     * @returns {void}
     */
    updateUserAttributesLocally(updates) {
      log('useAuthStore.js', 'updateUserAttributesLocally', 'start', 'Updating user attributes locally', { updateKeys: Object.keys(updates) });
      window.performanceTracker.step({
        step: 'updateUserAttributesLocally_start',
        file: 'useAuthStore.js',
        method: 'updateUserAttributesLocally',
        flag: 'start',
        purpose: 'Update user attributes in local state'
      });

      try {
        if (updates.onboardingPassed !== undefined) {
          this.onboardingPassed = updates.onboardingPassed;
          log('useAuthStore.js', 'updateUserAttributesLocally', 'onboarding-updated', 'Onboarding status updated', { onboardingPassed: this.onboardingPassed });
        }

        // Merge updates with existing currentUser, preserving all existing fields
        // This ensures that when token is refreshed later, locally set values are preserved
        // until they appear in the token (handles Cognito propagation delays)
        this.currentUser = {
          ...(this.currentUser || {}),
          ...updates,
          // Preserve raw token data if it exists
          raw: this.currentUser?.raw
        };

        log('useAuthStore.js', 'updateUserAttributesLocally', 'success', 'User attributes updated and merged', {
          updates,
          currentUser: {
            role: this.currentUser?.role,
            kycPassed: this.currentUser?.kycPassed,
            onboardingPassed: this.currentUser?.onboardingPassed
          }
        });
        window.performanceTracker.step({
          step: 'updateUserAttributesLocally_complete',
          file: 'useAuthStore.js',
          method: 'updateUserAttributesLocally',
          flag: 'success',
          purpose: 'Attribute update complete'
        });
      } catch (error) {
        log('useAuthStore.js', 'updateUserAttributesLocally', 'error', 'Failed to update attributes', {
          error: error.message,
          stack: error.stack
        });
        window.performanceTracker.step({
          step: 'updateUserAttributesLocally_error',
          file: 'useAuthStore.js',
          method: 'updateUserAttributesLocally',
          flag: 'error',
          purpose: 'Attribute update failed'
        });
      }
    },

    /**
     * @action syncWithCognitoToken
     * @description Sync store with latest Cognito token after attribute updates
     * This should be called after updating Cognito attributes to get fresh token
     * @returns {Promise<void>}
     */
    async syncWithCognitoToken() {
      log('useAuthStore.js', 'syncWithCognitoToken', 'start', 'Syncing store with Cognito token', {});
      window.performanceTracker.step({
        step: 'syncWithCognitoToken_start',
        file: 'useAuthStore.js',
        method: 'syncWithCognitoToken',
        flag: 'start',
        purpose: 'Sync store with latest Cognito token'
      });

      try {
        // Restore session to get fresh token with updated attributes
        const { idToken } = await authHandler.restoreSession();

        // Decode and merge token - this will preserve locally set values
        // that aren't in token yet, while updating with token values when available
        this.setTokenAndDecode(idToken);

        log('useAuthStore.js', 'syncWithCognitoToken', 'success', 'Store synced with Cognito token', {
          role: this.currentUser?.role,
          kycPassed: this.currentUser?.kycPassed,
          onboardingPassed: this.currentUser?.onboardingPassed
        });
        window.performanceTracker.step({
          step: 'syncWithCognitoToken_complete',
          file: 'useAuthStore.js',
          method: 'syncWithCognitoToken',
          flag: 'success',
          purpose: 'Store synced with Cognito'
        });
      } catch (error) {
        log('useAuthStore.js', 'syncWithCognitoToken', 'error', 'Failed to sync with Cognito token', {
          error: error.message,
          stack: error.stack
        });
        window.performanceTracker.step({
          step: 'syncWithCognitoToken_error',
          file: 'useAuthStore.js',
          method: 'syncWithCognitoToken',
          flag: 'error',
          purpose: 'Cognito sync failed'
        });
        throw error;
      }
    },

    /**
     * @action logout
     * @description Logout user and clear auth state
     * @returns {void}
     */
    logout() {
      log('useAuthStore.js', 'logout', 'start', 'Logging out user', {});
      window.performanceTracker.step({
        step: 'logout_start',
        file: 'useAuthStore.js',
        method: 'logout',
        flag: 'start',
        purpose: 'Logout user and clear state'
      });

      try {
        authHandler.logout();

        // Remove only auth keys
        localStorage.removeItem('idToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Reset store
        this.$reset();

        log('useAuthStore.js', 'logout', 'success', 'User logged out successfully', {});
        window.performanceTracker.step({
          step: 'logout_complete',
          file: 'useAuthStore.js',
          method: 'logout',
          flag: 'success',
          purpose: 'Logout complete'
        });

        // Force reload to ensure UI updates and redirects to login
        window.location.reload();

      } catch (error) {
        log('useAuthStore.js', 'logout', 'error', 'Logout error', {
          error: error.message,
          stack: error.stack
        });
        window.performanceTracker.step({
          step: 'logout_error',
          file: 'useAuthStore.js',
          method: 'logout',
          flag: 'error',
          purpose: 'Logout failed'
        });
      }
    },

    /**
     * @action startTokenRefreshLoop
     * @description Start automatic token refresh loop
     * @returns {void}
     */
    startTokenRefreshLoop() {
      log('useAuthStore.js', 'startTokenRefreshLoop', 'start', 'Starting token refresh loop', {});
      window.performanceTracker.step({
        step: 'startTokenRefreshLoop_start',
        file: 'useAuthStore.js',
        method: 'startTokenRefreshLoop',
        flag: 'start',
        purpose: 'Start automatic token refresh'
      });

      try {
        clearInterval(this._refreshInterval);

        this._refreshInterval = setInterval(async () => {
          const exp = this.currentUser?.raw?.exp;
          if (!exp) return;

          const expiresIn = exp * 1000 - Date.now();

          if (expiresIn < 5 * 60 * 1000) { // Less than 5 minutes
            log('useAuthStore.js', 'startTokenRefreshLoop', 'refresh-needed', 'Token expiring soon, refreshing', { expiresIn });

            try {
              const { idToken } = await authHandler.restoreSession();
              this.setTokenAndDecode(idToken);
              console.log('[DEBUG-AUTH] Refresh successful (unexpected for demo)');
              log('useAuthStore.js', 'startTokenRefreshLoop', 'refresh-success', 'Token refreshed successfully', {});
            } catch (error) {
              console.log('[DEBUG-AUTH] Refresh failed as expected. Logging out.', error);
              log('useAuthStore.js', 'startTokenRefreshLoop', 'refresh-failed', 'Token refresh failed, logging out', { error: error.message });
              this.logout();
            }
          }
        }, 60 * 1000); // Check every minute

        log('useAuthStore.js', 'startTokenRefreshLoop', 'success', 'Token refresh loop started', {});
        window.performanceTracker.step({
          step: 'startTokenRefreshLoop_complete',
          file: 'useAuthStore.js',
          method: 'startTokenRefreshLoop',
          flag: 'success',
          purpose: 'Refresh loop started'
        });
      } catch (error) {
        log('useAuthStore.js', 'startTokenRefreshLoop', 'error', 'Failed to start refresh loop', {
          error: error.message,
          stack: error.stack
        });
        window.performanceTracker.step({
          step: 'startTokenRefreshLoop_error',
          file: 'useAuthStore.js',
          method: 'startTokenRefreshLoop',
          flag: 'error',
          purpose: 'Failed to start refresh loop'
        });
      }
    }
  },

  persist: true
});

