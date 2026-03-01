// vueApp-main-new/src/utils/auth/awsCognitoHandler.js

import {
  createCognitoUser,
  createAuthenticationDetails,
  createCognitoAttributes,
  getCognitoUserSession,
  updateCognitoUserAttributes,
  signOutCognitoUser,
  getCurrentCognitoUser,
  getCognitoUserPool
} from './awsCognitoUtilities';
import {
  CognitoIdentityProviderClient,
  UpdateUserAttributesCommand,
  InitiateAuthCommand,
  AdminSetUserPasswordCommand,
  GetUserCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { log } from '../common/logHandler';
import { registerUser } from '../backend/scyllaDbClient';
/**
 * @file awsCognitoHandler.js
 * @description High-level AWS Cognito authentication operations
 * @purpose Provides login, signup, password reset, and profile management using AWS Cognito
 */

// Performance tracker available globally as window.performanceTracker

// Temporary storage for tokens to log after navigation
let pendingTokens = null;

function deriveCognitoRegion() {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const derivedRegion =
    typeof userPoolId === "string" && userPoolId.includes("_")
      ? userPoolId.split("_")[0]
      : null;
  return (
    derivedRegion ||
    import.meta.env.VITE_COGNITO_REGION ||
    import.meta.env.VITE_AWS_REGION ||
    null
  );
}

function getCognitoIdpClient() {
  const region = deriveCognitoRegion();
  if (!region) {
    throw new Error(
      "Missing Cognito region. Set VITE_COGNITO_USER_POOL_ID (preferred) or VITE_COGNITO_REGION / VITE_AWS_REGION."
    );
  }
  return new CognitoIdentityProviderClient({ region });
}

/**
 * @function authenticateUser
 * @description Authenticate user with email and password via AWS Cognito
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} Tokens object { idToken, accessToken, refreshToken }
 */
export async function authenticateUser(email, password) {
  log('awsCognitoHandler.js', 'authenticateUser', 'start', 'Begin user authentication', { email });
  window.performanceTracker.step({
    step: 'authenticateUser_start',
    file: 'awsCognitoHandler.js',
    method: 'authenticateUser',
    flag: 'start',
    purpose: 'Authenticate user with Cognito'
  });

  try {
    const cognitoUser = createCognitoUser(email);
    const authDetails = createAuthenticationDetails(email, password);

    log('awsCognitoHandler.js', 'authenticateUser', 'auth-attempt', 'Attempting Cognito authentication', { email });

    const tokens = await new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (result) => {
          const idToken = result.getIdToken().getJwtToken();
          const accessToken = result.getAccessToken().getJwtToken();
          const refreshToken = result.getRefreshToken().getToken();

          log('awsCognitoHandler.js', 'authenticateUser', 'auth-success', 'Authentication successful', {
            email,
            idTokenLength: idToken.length,
            accessTokenLength: accessToken.length
          });

          // Store tokens for retrieval after navigation
          pendingTokens = { idToken, accessToken, refreshToken };

          // Update lastlogin timestamp and joinedWithSocial flag
          const formattedDate = Math.floor(new Date().getTime() / 1000).toString();
          const attributes = createCognitoAttributes({
            'custom:lastlogin': formattedDate,
            'custom:joinedWithSocial': 'false'
          });

          updateCognitoUserAttributes(cognitoUser, attributes)
            .then(() => {
              log('awsCognitoHandler.js', 'authenticateUser', 'lastlogin-updated', 'Last login timestamp updated', { email });
              resolve({ idToken, accessToken, refreshToken });
            })
            .catch((updateError) => {
              log('awsCognitoHandler.js', 'authenticateUser', 'lastlogin-error', 'Failed to update lastlogin, continuing', {
                email,
                error: updateError.message
              });
              // Continue with login despite lastlogin update failure
              resolve({ idToken, accessToken, refreshToken });
            });
        },
        onFailure: (error) => {
          log('awsCognitoHandler.js', 'authenticateUser', 'auth-failure', 'Authentication failed', {
            email,
            error: error.message
          });
          reject(error);
        }
      });
    });

    log('awsCognitoHandler.js', 'authenticateUser', 'success', 'User authenticated successfully', { email });
    window.performanceTracker.step({
      step: 'authenticateUser_complete',
      file: 'awsCognitoHandler.js',
      method: 'authenticateUser',
      flag: 'success',
      purpose: 'Authentication complete'
    });

    return tokens;
  } catch (error) {
    log('awsCognitoHandler.js', 'authenticateUser', 'error', 'Authentication error', {
      email,
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'authenticateUser_error',
      file: 'awsCognitoHandler.js',
      method: 'authenticateUser',
      flag: 'error',
      purpose: 'Authentication failed'
    });
    throw error;
  }
}

/**
 * @function registerNewUser
 * @description Register new user with AWS Cognito
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} attributes - Additional user attributes
 * @returns {Promise<object>} Registration result
 */
export async function registerNewUser(email, password, attributes = {}) {
  log('awsCognitoHandler.js', 'registerNewUser', 'start', 'Begin user registration', { email, attributeKeys: Object.keys(attributes) });
  window.performanceTracker.step({
    step: 'registerNewUser_start',
    file: 'awsCognitoHandler.js',
    method: 'registerNewUser',
    flag: 'start',
    purpose: 'Register new user in Cognito'
  });

  try {
    const userPool = getCognitoUserPool();
    const attributesWithFlag = { ...attributes };
    if (!('custom:joinedWithSocial' in attributesWithFlag)) {
      // Detect if this is a social signup by checking for social provider attributes or social.local username
      const isSocialSignup =
        'custom:twitter_id' in attributesWithFlag ||
        'custom:telegram_id' in attributesWithFlag ||
        (typeof email === 'string' && email.endsWith('@social.local'));
      attributesWithFlag['custom:joinedWithSocial'] = isSocialSignup ? 'true' : 'false';
    }
    const attributeList = createCognitoAttributes(attributesWithFlag);

    log('awsCognitoHandler.js', 'registerNewUser', 'signup-attempt', 'Attempting Cognito signup', { email });

    const result = await new Promise((resolve, reject) => {
      userPool.signUp(email, password, attributeList, null, (error, result) => {
        if (error) {
          log('awsCognitoHandler.js', 'registerNewUser', 'signup-failure', 'Signup failed', {
            email,
            error: error.message
          });
          return reject(error);
        }

        log('awsCognitoHandler.js', 'registerNewUser', 'signup-success', 'Signup successful', {
          email,
          userSub: result.userSub
        });
        resolve(result);
      });
    });

    log('awsCognitoHandler.js', 'registerNewUser', 'success', 'User registered successfully', { email, userSub: result.userSub });

    // Sync to ScyllaDB (non-blocking)
    registerUser(email, { user_id: result.userSub })
      .then(() => log('awsCognitoHandler.js', 'registerNewUser', 'scylla-sync-success', 'Synced new user to ScyllaDB', { email }))
      .catch(err => log('awsCognitoHandler.js', 'registerNewUser', 'scylla-sync-error', 'Failed to sync to ScyllaDB', { error: err.message }));

    window.performanceTracker.step({
      step: 'registerNewUser_complete',
      file: 'awsCognitoHandler.js',
      method: 'registerNewUser',
      flag: 'success',
      purpose: 'Registration complete'
    });

    return result;
  } catch (error) {
    log('awsCognitoHandler.js', 'registerNewUser', 'error', 'Registration error', {
      email,
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'registerNewUser_error',
      file: 'awsCognitoHandler.js',
      method: 'registerNewUser',
      flag: 'error',
      purpose: 'Registration failed'
    });
    throw error;
  }
}

/**
 * @function confirmUserSignup
 * @description Confirm user signup with verification code
 * @param {string} email - User email
 * @param {string} code - Verification code
 * @returns {Promise<string>} Confirmation result
 */
export async function confirmUserSignup(email, code) {
  log('awsCognitoHandler.js', 'confirmUserSignup', 'start', 'Begin signup confirmation', { email, hasCode: !!code });
  window.performanceTracker.step({
    step: 'confirmUserSignup_start',
    file: 'awsCognitoHandler.js',
    method: 'confirmUserSignup',
    flag: 'start',
    purpose: 'Confirm user signup with code'
  });

  try {
    const cognitoUser = createCognitoUser(email);

    log('awsCognitoHandler.js', 'confirmUserSignup', 'confirm-attempt', 'Attempting confirmation', { email });

    const result = await new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, (error, result) => {
        if (error) {
          log('awsCognitoHandler.js', 'confirmUserSignup', 'confirm-failure', 'Confirmation failed', {
            email,
            error: error.message
          });
          return reject(error);
        }

        log('awsCognitoHandler.js', 'confirmUserSignup', 'confirm-success', 'Confirmation successful', { email, result });
        resolve(result);
      });
    });

    log('awsCognitoHandler.js', 'confirmUserSignup', 'success', 'Signup confirmed successfully', { email });
    window.performanceTracker.step({
      step: 'confirmUserSignup_complete',
      file: 'awsCognitoHandler.js',
      method: 'confirmUserSignup',
      flag: 'success',
      purpose: 'Confirmation complete'
    });

    return result;
  } catch (error) {
    log('awsCognitoHandler.js', 'confirmUserSignup', 'error', 'Confirmation error', {
      email,
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'confirmUserSignup_error',
      file: 'awsCognitoHandler.js',
      method: 'confirmUserSignup',
      flag: 'error',
      purpose: 'Confirmation failed'
    });
    throw error;
  }
}

/**
 * @function resendConfirmationCode
 * @description Resend confirmation code for email verification
 * @param {string} email - User email
 * @returns {Promise<object>} Resend result
 */
export async function resendConfirmationCode(email) {
  log('awsCognitoHandler.js', 'resendConfirmationCode', 'start', 'Begin resending confirmation code', { email });
  window.performanceTracker.step({
    step: 'resendConfirmationCode_start',
    file: 'awsCognitoHandler.js',
    method: 'resendConfirmationCode',
    flag: 'start',
    purpose: 'Resend confirmation code'
  });

  try {
    const cognitoUser = createCognitoUser(email);

    log('awsCognitoHandler.js', 'resendConfirmationCode', 'resend-attempt', 'Attempting to resend code', { email });

    const result = await new Promise((resolve, reject) => {
      cognitoUser.resendConfirmationCode((error, result) => {
        if (error) {
          log('awsCognitoHandler.js', 'resendConfirmationCode', 'resend-failure', 'Resend failed', {
            email,
            error: error.message
          });
          return reject(error);
        }

        log('awsCognitoHandler.js', 'resendConfirmationCode', 'resend-success', 'Code resent successfully', { email, result });
        resolve(result);
      });
    });

    log('awsCognitoHandler.js', 'resendConfirmationCode', 'success', 'Confirmation code resent successfully', { email });
    window.performanceTracker.step({
      step: 'resendConfirmationCode_complete',
      file: 'awsCognitoHandler.js',
      method: 'resendConfirmationCode',
      flag: 'success',
      purpose: 'Resend complete'
    });

    return result;
  } catch (error) {
    log('awsCognitoHandler.js', 'resendConfirmationCode', 'error', 'Resend error', {
      email,
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'resendConfirmationCode_error',
      file: 'awsCognitoHandler.js',
      method: 'resendConfirmationCode',
      flag: 'error',
      purpose: 'Resend failed'
    });
    throw error;
  }
}

/**
 * @function changeUserPassword
 * @description Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<string>} Success message
 */
export async function changeUserPassword(currentPassword, newPassword) {
  log('awsCognitoHandler.js', 'changeUserPassword', 'start', 'Begin password change', { hasCurrentPassword: !!currentPassword, hasNewPassword: !!newPassword });
  window.performanceTracker.step({
    step: 'changeUserPassword_start',
    file: 'awsCognitoHandler.js',
    method: 'changeUserPassword',
    flag: 'start',
    purpose: 'Change user password'
  });

  try {
    const currentUser = getCurrentCognitoUser();

    if (!currentUser) {
      log('awsCognitoHandler.js', 'changeUserPassword', 'no-user', 'No authenticated user found', {});
      window.performanceTracker.step({
        step: 'changeUserPassword_no_user',
        file: 'awsCognitoHandler.js',
        method: 'changeUserPassword',
        flag: 'no-user',
        purpose: 'No user to change password for'
      });
      throw new Error('Not authenticated');
    }

    log('awsCognitoHandler.js', 'changeUserPassword', 'change-attempt', 'Attempting password change', { username: currentUser.getUsername() });

    const result = await new Promise((resolve, reject) => {
      currentUser.getSession((sessionError) => {
        if (sessionError) {
          log('awsCognitoHandler.js', 'changeUserPassword', 'session-error', 'Failed to get session', { error: sessionError.message });
          return reject(sessionError);
        }

        currentUser.changePassword(currentPassword, newPassword, (error, result) => {
          if (error) {
            log('awsCognitoHandler.js', 'changeUserPassword', 'change-failure', 'Password change failed', { error: error.message });
            return reject(error);
          }

          log('awsCognitoHandler.js', 'changeUserPassword', 'change-success', 'Password changed successfully', { result });
          resolve(result);
        });
      });
    });

    log('awsCognitoHandler.js', 'changeUserPassword', 'success', 'Password change complete', {});
    window.performanceTracker.step({
      step: 'changeUserPassword_complete',
      file: 'awsCognitoHandler.js',
      method: 'changeUserPassword',
      flag: 'success',
      purpose: 'Password change complete'
    });

    return result;
  } catch (error) {
    log('awsCognitoHandler.js', 'changeUserPassword', 'error', 'Password change error', {
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'changeUserPassword_error',
      file: 'awsCognitoHandler.js',
      method: 'changeUserPassword',
      flag: 'error',
      purpose: 'Password change failed'
    });
    throw error;
  }
  throw error;
}


/**
 * @function getUserAttributes
 * @description Get current user attributes
 * @returns {Promise<object>} User attributes
 */
export async function getUserAttributes() {
  const currentUser = getCurrentCognitoUser();

  if (currentUser) {
    return new Promise((resolve, reject) => {
      currentUser.getSession((err, session) => {
        if (err) return reject(err);
        currentUser.getUserAttributes((err, attributes) => {
          if (err) return reject(err);
          const attrs = {};
          attributes.forEach(attr => {
            attrs[attr.getName()] = attr.getValue();
          });
          resolve(attrs);
        });
      });
    });
  }

  // Fallback for social users (token-only session)
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return {};

  try {
    const client = getCognitoIdpClient();
    const command = new GetUserCommand({ AccessToken: accessToken });
    const response = await client.send(command);

    const attrs = {};
    (response.UserAttributes || []).forEach(attr => {
      attrs[attr.Name] = attr.Value;
    });
    return attrs;
  } catch (error) {
    log('awsCognitoHandler.js', 'getUserAttributes', 'fallback-error', 'Failed to get attributes via token', { error: error.message });
    return {};
  }
}

/**
 * @function adminSetUserPassword
 * @description Set user password via Admin API (proxy)
 * @param {string} newPassword - New password
 * @returns {Promise<object>} Result
 */
export async function adminSetUserPassword(newPassword) {
  log('awsCognitoHandler.js', 'adminSetUserPassword', 'start', 'Setting user password via admin (Client-side implementation)', {});

  // DANGER: requires AWS Creds in frontend logic. As requested by user.
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing AWS Credentials (VITE_AWS_ACCESS_KEY_ID / VITE_AWS_SECRET_ACCESS_KEY) for Admin Action');
  }

  try {
    let username = null;
    const currentUser = getCurrentCognitoUser();

    if (currentUser) {
      username = currentUser.getUsername();
    } else {
      // Fallback for social user who might not have a full cognito user session object
      // but has tokens. We need the username (Sub or Username). 
      // We can parse the ID Token or just assume the user is logged in.
      // Actually for this call we specifically need the Username.
      // If we only have tokens, we might need to parse the ID Token for 'sub' or 'cognito:username'.
      const idToken = localStorage.getItem('idToken');
      if (idToken) {
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        username = payload['cognito:username'] || payload.sub;
      }
    }

    if (!username) {
      throw new Error('Cannot determine username for password reset');
    }

    log('awsCognitoHandler.js', 'adminSetUserPassword', 'sdk-attempt', 'Sending AdminSetUserPassword command', { username });

    const client = new CognitoIdentityProviderClient({
      region: deriveCognitoRegion(),
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    const command = new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: username,
      Password: newPassword,
      Permanent: true // Set as permanent so they don't have to change it again immediately
    });

    await client.send(command);

    log('awsCognitoHandler.js', 'adminSetUserPassword', 'sdk-success', 'AdminSetUserPassword successful', {});

    // Update the attribute to indicate they now have a user-set password
    await updateUserProfile({ 'custom:password_source': 'user' });

    // Note: AdminSetUserPassword does NOT revoke tokens by default, so current session should remain valid.

    return { success: true };
  } catch (error) {
    log('awsCognitoHandler.js', 'adminSetUserPassword', 'error', 'Failed to admin set password', { error: error.message });
    throw error;
  }
}

/**
 * @function initiatePasswordReset
 * @description Initiate forgot password flow
 * @param {string} email - User email
 * @returns {Promise<object>} Reset initiation result
 */
export async function initiatePasswordReset(email) {
  log('awsCognitoHandler.js', 'initiatePasswordReset', 'start', 'Begin password reset', { email });
  window.performanceTracker.step({
    step: 'initiatePasswordReset_start',
    file: 'awsCognitoHandler.js',
    method: 'initiatePasswordReset',
    flag: 'start',
    purpose: 'Initiate forgot password flow'
  });

  try {
    const cognitoUser = createCognitoUser(email);

    log('awsCognitoHandler.js', 'initiatePasswordReset', 'reset-attempt', 'Sending password reset request', { email });

    const result = await new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: (data) => {
          log('awsCognitoHandler.js', 'initiatePasswordReset', 'reset-success', 'Password reset initiated', { email, data });
          resolve(data);
        },
        onFailure: (error) => {
          log('awsCognitoHandler.js', 'initiatePasswordReset', 'reset-failure', 'Password reset failed', {
            email,
            error: error.message
          });
          reject(error);
        }
      });
    });

    log('awsCognitoHandler.js', 'initiatePasswordReset', 'success', 'Password reset email sent', { email });
    window.performanceTracker.step({
      step: 'initiatePasswordReset_complete',
      file: 'awsCognitoHandler.js',
      method: 'initiatePasswordReset',
      flag: 'success',
      purpose: 'Password reset initiated'
    });

    return result;
  } catch (error) {
    log('awsCognitoHandler.js', 'initiatePasswordReset', 'error', 'Password reset error', {
      email,
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'initiatePasswordReset_error',
      file: 'awsCognitoHandler.js',
      method: 'initiatePasswordReset',
      flag: 'error',
      purpose: 'Password reset failed'
    });
    throw error;
  }
}

/**
 * @function confirmPasswordReset
 * @description Confirm password reset with code
 * @param {string} email - User email
 * @param {string} code - Verification code
 * @param {string} newPassword - New password
 * @returns {Promise<string>} Confirmation result
 */
export async function confirmPasswordReset(email, code, newPassword) {
  log('awsCognitoHandler.js', 'confirmPasswordReset', 'start', 'Begin password reset confirmation', { email, hasCode: !!code, hasNewPassword: !!newPassword });
  window.performanceTracker.step({
    step: 'confirmPasswordReset_start',
    file: 'awsCognitoHandler.js',
    method: 'confirmPasswordReset',
    flag: 'start',
    purpose: 'Confirm password reset with code'
  });

  try {
    const cognitoUser = createCognitoUser(email);

    log('awsCognitoHandler.js', 'confirmPasswordReset', 'confirm-attempt', 'Confirming password reset', { email });

    const result = await new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: (data) => {
          log('awsCognitoHandler.js', 'confirmPasswordReset', 'confirm-success', 'Password reset confirmed', { email, data });
          resolve(data);
        },
        onFailure: (error) => {
          log('awsCognitoHandler.js', 'confirmPasswordReset', 'confirm-failure', 'Password reset confirmation failed', {
            email,
            error: error.message
          });
          reject(error);
        }
      });
    });

    log('awsCognitoHandler.js', 'confirmPasswordReset', 'success', 'Password reset complete', { email });
    window.performanceTracker.step({
      step: 'confirmPasswordReset_complete',
      file: 'awsCognitoHandler.js',
      method: 'confirmPasswordReset',
      flag: 'success',
      purpose: 'Password reset confirmed'
    });

    return result;
  } catch (error) {
    log('awsCognitoHandler.js', 'confirmPasswordReset', 'error', 'Password reset confirmation error', {
      email,
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'confirmPasswordReset_error',
      file: 'awsCognitoHandler.js',
      method: 'confirmPasswordReset',
      flag: 'error',
      purpose: 'Password reset confirmation failed'
    });
    throw error;
  }
}

/**
 * @function updateUserProfile
 * @description Update user profile attributes
 * @param {object} attributes - Attributes to update
 * @returns {Promise<string>} Update result
 */
export async function updateUserProfile(attributes) {
  log('awsCognitoHandler.js', 'updateUserProfile', 'start', 'Begin profile update', { attributeKeys: Object.keys(attributes) });
  if (window.performanceTracker && window.performanceTracker.enabled) {
    try {
      window.performanceTracker.step({
        step: 'updateUserProfile_start',
        file: 'awsCognitoHandler.js',
        method: 'updateUserProfile',
        flag: 'start',
        purpose: 'Update user profile attributes'
      });
    } catch (e) {
      // Silently fail if tracker not started - don't break app flow
    }
  }

  try {
    const currentUser = getCurrentCognitoUser();

    if (!currentUser) {
      /**
       * Social login flow in this app stores raw tokens in localStorage, but it does NOT
       * create an `amazon-cognito-identity-js` "current user" session object.
       *
       * Fallback: call Cognito UpdateUserAttributes using the AccessToken.
       */
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        log('awsCognitoHandler.js', 'updateUserProfile', 'no-user', 'No authenticated user found (no current user and no access token)', {});
        throw new Error('Not authenticated');
      }

      const client = getCognitoIdpClient();
      const userAttributes = Object.entries(attributes || {}).map(([Name, Value]) => ({
        Name,
        Value: String(Value)
      }));

      log('awsCognitoHandler.js', 'updateUserProfile', 'fallback-access-token', 'Updating attributes via UpdateUserAttributes (token-only session)', {
        attributeKeys: Object.keys(attributes),
        attributeCount: userAttributes.length
      });

      await client.send(
        new UpdateUserAttributesCommand({
          AccessToken: accessToken,
          UserAttributes: userAttributes
        })
      );

      log('awsCognitoHandler.js', 'updateUserProfile', 'success', 'Profile update complete (token-only session)', {});
      return 'OK';
    }

    log('awsCognitoHandler.js', 'updateUserProfile', 'update-attempt', 'Updating profile attributes', {
      username: currentUser.getUsername(),
      attributeKeys: Object.keys(attributes)
    });

    const result = await new Promise((resolve, reject) => {
      currentUser.getSession((sessionError, session) => {
        if (sessionError || !session.isValid()) {
          log('awsCognitoHandler.js', 'updateUserProfile', 'session-error', 'Invalid session', { error: sessionError?.message });
          return reject(sessionError || new Error('Invalid session'));
        }

        const attributeList = createCognitoAttributes(attributes);
        updateCognitoUserAttributes(currentUser, attributeList)
          .then((result) => {
            log('awsCognitoHandler.js', 'updateUserProfile', 'update-success', 'Profile updated successfully', { result });
            resolve(result);
          })
          .catch((error) => {
            log('awsCognitoHandler.js', 'updateUserProfile', 'update-failure', 'Profile update failed', { error: error.message });
            reject(error);
          });
      });
    });

    log('awsCognitoHandler.js', 'updateUserProfile', 'success', 'Profile update complete', {});
    if (window.performanceTracker && window.performanceTracker.enabled) {
      try {
        window.performanceTracker.step({
          step: 'updateUserProfile_complete',
          file: 'awsCognitoHandler.js',
          method: 'updateUserProfile',
          flag: 'success',
          purpose: 'Profile update complete'
        });
      } catch (e) {
        // Silently fail if tracker not started
      }
    }

    return result;
  } catch (error) {
    log('awsCognitoHandler.js', 'updateUserProfile', 'error', 'Profile update error', {
      error: error.message,
      stack: error.stack
    });
    if (window.performanceTracker && window.performanceTracker.enabled) {
      try {
        window.performanceTracker.step({
          step: 'updateUserProfile_error',
          file: 'awsCognitoHandler.js',
          method: 'updateUserProfile',
          flag: 'error',
          purpose: 'Profile update failed'
        });
      } catch (e) {
        // Silently fail if tracker not started
      }
    }
    throw error;
  }
}

/**
 * @function linkSocialAccount
 * @description Link a social account (Twitter/Telegram) to the current user
 * @param {string} provider - 'twitter' or 'telegram'
 * @param {string} socialId - The unique ID from the social provider
 * @returns {Promise<string>} Success message
 */
export async function linkSocialAccount(provider, socialId) {
  const attributeKey = `custom:${provider}_id`;
  log('awsCognitoHandler.js', 'linkSocialAccount', 'start', 'Linking social account', { provider, socialId });

  try {
    const attributes = {};
    attributes[attributeKey] = socialId;

    // Also mark that they have joined with social if not already set (though this is mostly for signup)
    // Actually, checking if joinedWithSocial is true might be relevant, but let's just set the ID.

    await updateUserProfile(attributes);

    log('awsCognitoHandler.js', 'linkSocialAccount', 'success', 'Social account linked successfully', { provider });
    return 'OK';
  } catch (error) {
    log('awsCognitoHandler.js', 'linkSocialAccount', 'error', 'Failed to link social account', {
      provider,
      error: error.message
    });
    throw error;
  }
}

/**
 * @function unlinkSocialAccount
 * @description Unlink a social account
 * @param {string} provider - 'twitter' or 'telegram'
 * @returns {Promise<string>} Success message
 */
export async function unlinkSocialAccount(provider) {
  const attributeKey = `custom:${provider}_id`;
  log('awsCognitoHandler.js', 'unlinkSocialAccount', 'start', 'Unlinking social account', { provider });

  try {
    const attributes = {};
    attributes[attributeKey] = ''; // Setting to empty string to "remove" it (or verify if Cognito allows deletion via update)
    // Note: Cognito doesn't easily "delete" custom attributes via updateAttributes with null/empty sometimes.
    // Usually setting to empty string is the standard way to clear it in client apps unless using AdminDeleteUserAttributes.
    // Let's try empty string. If that fails to "remove" it, we might need a specific handling.
    // Actually, passing an empty value usually updates it to empty.

    await updateUserProfile(attributes);

    log('awsCognitoHandler.js', 'unlinkSocialAccount', 'success', 'Social account unlinked successfully', { provider });
    return 'OK';
  } catch (error) {
    log('awsCognitoHandler.js', 'unlinkSocialAccount', 'error', 'Failed to unlink social account', {
      provider,
      error: error.message
    });
    throw error;
  }
}

/**
 * @function restoreUserSession
 * @description Restore user session from stored tokens
 * @returns {Promise<object>} Session tokens
 */
export async function restoreUserSession() {
  log('awsCognitoHandler.js', 'restoreUserSession', 'start', 'Begin session restoration', {});
  window.performanceTracker.step({
    step: 'restoreUserSession_start',
    file: 'awsCognitoHandler.js',
    method: 'restoreUserSession',
    flag: 'start',
    purpose: 'Restore user session from tokens'
  });

  try {
    const currentUser = getCurrentCognitoUser();

    if (!currentUser) {
      /**
       * Token-only session fallback (social login):
       * If we have a refresh token, use REFRESH_TOKEN_AUTH to mint fresh tokens.
       * Otherwise, return stored tokens if present.
       */
      const refreshToken = localStorage.getItem("refreshToken");
      const idToken = localStorage.getItem("idToken");
      const accessToken = localStorage.getItem("accessToken");

      if (!refreshToken) {
        if (idToken && accessToken) {
          log('awsCognitoHandler.js', 'restoreUserSession', 'fallback-stored', 'Returning stored tokens (no current user)', {
            hasIdToken: true,
            hasAccessToken: true
          });
          return { idToken, accessToken, refreshToken: null };
        }
        log('awsCognitoHandler.js', 'restoreUserSession', 'no-user', 'No current user found and no refresh token available', {});
        throw new Error('No user');
      }

      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
      if (!clientId) {
        throw new Error('Missing VITE_COGNITO_CLIENT_ID environment variable');
      }

      const client = getCognitoIdpClient();
      const resp = await client.send(
        new InitiateAuthCommand({
          ClientId: clientId,
          AuthFlow: "REFRESH_TOKEN_AUTH",
          AuthParameters: {
            REFRESH_TOKEN: refreshToken
          }
        })
      );

      const newIdToken = resp.AuthenticationResult?.IdToken || idToken;
      const newAccessToken = resp.AuthenticationResult?.AccessToken || accessToken;

      if (!newIdToken || !newAccessToken) {
        throw new Error("Failed to refresh session tokens");
      }

      // Persist refreshed tokens
      localStorage.setItem("idToken", newIdToken);
      localStorage.setItem("accessToken", newAccessToken);

      log('awsCognitoHandler.js', 'restoreUserSession', 'fallback-refreshed', 'Session refreshed via REFRESH_TOKEN_AUTH (token-only session)', {
        hasIdToken: !!newIdToken,
        hasAccessToken: !!newAccessToken
      });

      return { idToken: newIdToken, accessToken: newAccessToken, refreshToken };
    }

    log('awsCognitoHandler.js', 'restoreUserSession', 'restore-attempt', 'Restoring session', { username: currentUser.getUsername() });

    const tokens = await getCognitoUserSession(currentUser);
    pendingTokens = tokens;

    log('awsCognitoHandler.js', 'restoreUserSession', 'success', 'Session restored successfully', {
      username: currentUser.getUsername(),
      idTokenTruncated: tokens.idToken.substring(0, 20) + '...',
      accessTokenTruncated: tokens.accessToken.substring(0, 20) + '...'
    });
    window.performanceTracker.step({
      step: 'restoreUserSession_complete',
      file: 'awsCognitoHandler.js',
      method: 'restoreUserSession',
      flag: 'success',
      purpose: 'Session restoration complete'
    });

    return tokens;
  } catch (error) {
    log('awsCognitoHandler.js', 'restoreUserSession', 'error', 'Session restoration error', {
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'restoreUserSession_error',
      file: 'awsCognitoHandler.js',
      method: 'restoreUserSession',
      flag: 'error',
      purpose: 'Session restoration failed'
    });
    throw error;
  }
}

/**
 * @function logoutUser
 * @description Log out current user
 * @returns {boolean} Success status
 */
export function logoutUser() {
  log('awsCognitoHandler.js', 'logoutUser', 'start', 'Begin user logout', {});
  window.performanceTracker.step({
    step: 'logoutUser_start',
    file: 'awsCognitoHandler.js',
    method: 'logoutUser',
    flag: 'start',
    purpose: 'Log out current user'
  });

  try {
    const success = signOutCognitoUser();
    localStorage.clear();
    pendingTokens = null;

    log('awsCognitoHandler.js', 'logoutUser', 'success', 'User logged out successfully', { success });
    window.performanceTracker.step({
      step: 'logoutUser_complete',
      file: 'awsCognitoHandler.js',
      method: 'logoutUser',
      flag: 'success',
      purpose: 'Logout complete'
    });

    return success;
  } catch (error) {
    log('awsCognitoHandler.js', 'logoutUser', 'error', 'Logout error', {
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'logoutUser_error',
      file: 'awsCognitoHandler.js',
      method: 'logoutUser',
      flag: 'error',
      purpose: 'Logout failed'
    });
    return false;
  }
}

/**
 * @function getPendingTokens
 * @description Get and clear pending tokens stored after login
 * @returns {object|null} Pending tokens or null
 */
export function getPendingTokens() {
  log('awsCognitoHandler.js', 'getPendingTokens', 'start', 'Getting pending tokens', { hasPendingTokens: !!pendingTokens });
  window.performanceTracker.step({
    step: 'getPendingTokens_start',
    file: 'awsCognitoHandler.js',
    method: 'getPendingTokens',
    flag: 'start',
    purpose: 'Retrieve pending tokens'
  });

  const tokens = pendingTokens;
  pendingTokens = null;

  log('awsCognitoHandler.js', 'getPendingTokens', 'success', 'Pending tokens retrieved and cleared', { hadTokens: !!tokens });
  window.performanceTracker.step({
    step: 'getPendingTokens_complete',
    file: 'awsCognitoHandler.js',
    method: 'getPendingTokens',
    flag: 'success',
    purpose: 'Pending tokens returned'
  });

  return tokens;
}

// Export handler object with all methods
export const awsCognitoHandler = {
  login: authenticateUser,
  register: registerNewUser,
  confirmSignUp: confirmUserSignup,
  resendConfirmationCode: resendConfirmationCode,
  changePassword: changeUserPassword,
  forgotPassword: initiatePasswordReset,
  confirmPassword: confirmPasswordReset,
  updateProfileAttributes: updateUserProfile,
  restoreSession: restoreUserSession,
  logout: logoutUser,
  getPendingTokens
};

