// vueApp-main-new/src/utils/auth/awsCognitoUtilities.js

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
  UpdateUserAttributesCommand,
  GetUserCommand,
  ListUsersCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { log } from '../common/logHandler';
/**
 * @file awsCognitoUtilities.js
 * @description Low-level AWS Cognito SDK utilities
 * @purpose Wraps amazon-cognito-identity-js with logging and error handling
 */

// Performance tracker available globally as window.performanceTracker

let userPoolInstance = null;

/**
 * @function initializeCognitoUserPool
 * @description Initialize AWS Cognito User Pool with environment config
 * @param {object} config - Pool configuration { UserPoolId, ClientId }
 * @returns {CognitoUserPool} Configured user pool instance
 */
export function initializeCognitoUserPool(config) {
  log('awsCognitoUtilities.js', 'initializeCognitoUserPool', 'start', 'Begin Cognito user pool initialization', {});
  window.performanceTracker.step({
    step: 'initializeCognitoUserPool_start',
    file: 'awsCognitoUtilities.js',
    method: 'initializeCognitoUserPool',
    flag: 'start',
    purpose: 'Initialize AWS Cognito User Pool'
  });

  try {
    const poolConfig = {
      UserPoolId: config.UserPoolId || import.meta.env.VITE_COGNITO_USER_POOL_ID,
      ClientId: config.ClientId || import.meta.env.VITE_COGNITO_CLIENT_ID
    };

    if (!poolConfig.UserPoolId || !poolConfig.ClientId) {
      const errorData = {
        hasUserPoolId: !!poolConfig.UserPoolId,
        hasClientId: !!poolConfig.ClientId
      };
      log('awsCognitoUtilities.js', 'initializeCognitoUserPool', 'error', 'Missing required Cognito configuration', errorData);
      window.performanceTracker.step({
        step: 'initializeCognitoUserPool_error',
        file: 'awsCognitoUtilities.js',
        method: 'initializeCognitoUserPool',
        flag: 'error',
        purpose: 'Configuration validation failed'
      });
      throw new Error('Missing Cognito UserPoolId or ClientId');
    }

    log('awsCognitoUtilities.js', 'initializeCognitoUserPool', 'init', 'Initializing Cognito User Pool', {
      poolIdPrefix: poolConfig.UserPoolId.substring(0, 20),
      clientIdPrefix: poolConfig.ClientId.substring(0, 10)
    });

    userPoolInstance = new CognitoUserPool(poolConfig);

    log('awsCognitoUtilities.js', 'initializeCognitoUserPool', 'success', 'User pool initialized successfully', {
      poolId: poolConfig.UserPoolId
    });
    window.performanceTracker.step({
      step: 'initializeCognitoUserPool_complete',
      file: 'awsCognitoUtilities.js',
      method: 'initializeCognitoUserPool',
      flag: 'success',
      purpose: 'User pool initialization complete'
    });

    return userPoolInstance;
  } catch (error) {
    log('awsCognitoUtilities.js', 'initializeCognitoUserPool', 'error', 'Failed to initialize user pool', {
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'initializeCognitoUserPool_error',
      file: 'awsCognitoUtilities.js',
      method: 'initializeCognitoUserPool',
      flag: 'error',
      purpose: 'Initialization failed with exception'
    });
    throw error;
  }
}

/**
 * @function getCognitoUserPool
 * @description Get current Cognito User Pool instance
 * @returns {CognitoUserPool} Current user pool instance
 */
export function getCognitoUserPool() {
  log('awsCognitoUtilities.js', 'getCognitoUserPool', 'start', 'Getting user pool instance', {});
  window.performanceTracker.step({
    step: 'getCognitoUserPool_start',
    file: 'awsCognitoUtilities.js',
    method: 'getCognitoUserPool',
    flag: 'start',
    purpose: 'Get or initialize user pool'
  });

  if (!userPoolInstance) {
    log('awsCognitoUtilities.js', 'getCognitoUserPool', 'init', 'No user pool found, initializing now', {});
    initializeCognitoUserPool({});
  }

  log('awsCognitoUtilities.js', 'getCognitoUserPool', 'success', 'Returning user pool instance', { hasInstance: !!userPoolInstance });
  window.performanceTracker.step({
    step: 'getCognitoUserPool_complete',
    file: 'awsCognitoUtilities.js',
    method: 'getCognitoUserPool',
    flag: 'success',
    purpose: 'User pool instance returned'
  });

  return userPoolInstance;
}

/**
 * @function createCognitoUser
 * @description Create a CognitoUser instance for given username
 * @param {string} username - Username or email
 * @returns {CognitoUser} Cognito user instance
 */
export function createCognitoUser(username) {
  log('awsCognitoUtilities.js', 'createCognitoUser', 'start', 'Creating Cognito user instance', { username });
  window.performanceTracker.step({
    step: 'createCognitoUser_start',
    file: 'awsCognitoUtilities.js',
    method: 'createCognitoUser',
    flag: 'start',
    purpose: 'Create Cognito user instance'
  });

  try {
    const userPool = getCognitoUserPool();
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool
    });

    log('awsCognitoUtilities.js', 'createCognitoUser', 'success', 'User instance created', { username });
    window.performanceTracker.step({
      step: 'createCognitoUser_complete',
      file: 'awsCognitoUtilities.js',
      method: 'createCognitoUser',
      flag: 'success',
      purpose: 'User instance creation complete'
    });

    return cognitoUser;
  } catch (error) {
    log('awsCognitoUtilities.js', 'createCognitoUser', 'error', 'Failed to create user instance', { username, error: error.message, stack: error.stack });
    window.performanceTracker.step({
      step: 'createCognitoUser_error',
      file: 'awsCognitoUtilities.js',
      method: 'createCognitoUser',
      flag: 'error',
      purpose: 'User instance creation failed'
    });
    throw error;
  }
}

/**
 * @function getCurrentCognitoUser
 * @description Get current authenticated user from Cognito pool
 * @returns {CognitoUser|null} Current user or null
 */
export function getCurrentCognitoUser() {
  log('awsCognitoUtilities.js', 'getCurrentCognitoUser', 'start', 'Getting current user', {});
  window.performanceTracker.step({
    step: 'getCurrentCognitoUser_start',
    file: 'awsCognitoUtilities.js',
    method: 'getCurrentCognitoUser',
    flag: 'start',
    purpose: 'Retrieve current authenticated user'
  });

  try {
    const userPool = getCognitoUserPool();
    const currentUser = userPool.getCurrentUser();

    if (currentUser) {
      log('awsCognitoUtilities.js', 'getCurrentCognitoUser', 'success', 'Current user found', { username: currentUser.getUsername() });
      window.performanceTracker.step({
        step: 'getCurrentCognitoUser_found',
        file: 'awsCognitoUtilities.js',
        method: 'getCurrentCognitoUser',
        flag: 'success',
        purpose: 'Current user found'
      });
    } else {
      log('awsCognitoUtilities.js', 'getCurrentCognitoUser', 'no-user', 'No current user found', {});
      window.performanceTracker.step({
        step: 'getCurrentCognitoUser_not_found',
        file: 'awsCognitoUtilities.js',
        method: 'getCurrentCognitoUser',
        flag: 'no-user',
        purpose: 'No current user in pool'
      });
    }

    return currentUser;
  } catch (error) {
    log('awsCognitoUtilities.js', 'getCurrentCognitoUser', 'error', 'Error getting current user', { error: error.message, stack: error.stack });
    window.performanceTracker.step({
      step: 'getCurrentCognitoUser_error',
      file: 'awsCognitoUtilities.js',
      method: 'getCurrentCognitoUser',
      flag: 'error',
      purpose: 'Failed to get current user'
    });
    return null;
  }
}

/**
 * @function createAuthenticationDetails
 * @description Create AuthenticationDetails for login
 * @param {string} username - Username or email
 * @param {string} password - User password
 * @returns {AuthenticationDetails} Authentication details instance
 */
export function createAuthenticationDetails(username, password) {
  log('awsCognitoUtilities.js', 'createAuthenticationDetails', 'start', 'Creating authentication details', { username, hasPassword: !!password });
  window.performanceTracker.step({
    step: 'createAuthenticationDetails_start',
    file: 'awsCognitoUtilities.js',
    method: 'createAuthenticationDetails',
    flag: 'start',
    purpose: 'Create authentication details for login'
  });

  try {
    const authDetails = new AuthenticationDetails({
      Username: username,
      Password: password
    });

    log('awsCognitoUtilities.js', 'createAuthenticationDetails', 'success', 'Authentication details created', { username });
    window.performanceTracker.step({
      step: 'createAuthenticationDetails_complete',
      file: 'awsCognitoUtilities.js',
      method: 'createAuthenticationDetails',
      flag: 'success',
      purpose: 'Authentication details creation complete'
    });

    return authDetails;
  } catch (error) {
    log('awsCognitoUtilities.js', 'createAuthenticationDetails', 'error', 'Failed to create auth details', { username, error: error.message, stack: error.stack });
    window.performanceTracker.step({
      step: 'createAuthenticationDetails_error',
      file: 'awsCognitoUtilities.js',
      method: 'createAuthenticationDetails',
      flag: 'error',
      purpose: 'Authentication details creation failed'
    });
    throw error;
  }
}

/**
 * @function createCognitoAttributes
 * @description Convert attribute object to CognitoUserAttribute array
 * @param {object} attributes - Attributes object { key: value }
 * @returns {Array<CognitoUserAttribute>} Array of Cognito attributes
 */
export function createCognitoAttributes(attributes) {
  log('awsCognitoUtilities.js', 'createCognitoAttributes', 'start', 'Creating Cognito attributes', { attributeCount: Object.keys(attributes).length, keys: Object.keys(attributes) });
  window.performanceTracker.step({
    step: 'createCognitoAttributes_start',
    file: 'awsCognitoUtilities.js',
    method: 'createCognitoAttributes',
    flag: 'start',
    purpose: 'Convert attributes to Cognito format'
  });


  try {
    const attributeList = Object.entries(attributes).map(([key, value]) => {
      return new CognitoUserAttribute({
        Name: key,
        Value: String(value)
      });
    });

    log('awsCognitoUtilities.js', 'createCognitoAttributes', 'success', 'Attributes created', { count: attributeList.length });
    window.performanceTracker.step({
      step: 'createCognitoAttributes_complete',
      file: 'awsCognitoUtilities.js',
      method: 'createCognitoAttributes',
      flag: 'success',
      purpose: 'Attribute conversion complete'
    });

    return attributeList;
  } catch (error) {
    log('awsCognitoUtilities.js', 'createCognitoAttributes', 'error', 'Failed to create attributes', { error: error.message, stack: error.stack });
    window.performanceTracker.step({
      step: 'createCognitoAttributes_error',
      file: 'awsCognitoUtilities.js',
      method: 'createCognitoAttributes',
      flag: 'error',
      purpose: 'Attribute creation failed'
    });
    throw error;
  }
}

/**
 * @function getCognitoUserSession
 * @description Get user session with tokens
 * @param {CognitoUser} cognitoUser - Cognito user instance
 * @returns {Promise<object>} Session with tokens
 */
export function getCognitoUserSession(cognitoUser) {
  log('awsCognitoUtilities.js', 'getCognitoUserSession', 'start', 'Getting user session', { username: cognitoUser.getUsername() });
  window.performanceTracker.step({
    step: 'getCognitoUserSession_start',
    file: 'awsCognitoUtilities.js',
    method: 'getCognitoUserSession',
    flag: 'start',
    purpose: 'Retrieve user session with tokens'
  });

  return new Promise((resolve, reject) => {
    cognitoUser.getSession((error, session) => {
      if (error) {
        log('awsCognitoUtilities.js', 'getCognitoUserSession', 'error', 'Failed to get session', { error: error.message, stack: error.stack });
        window.performanceTracker.step({
          step: 'getCognitoUserSession_error',
          file: 'awsCognitoUtilities.js',
          method: 'getCognitoUserSession',
          flag: 'error',
          purpose: 'Session retrieval failed'
        });
        return reject(error);
      }

      if (!session || !session.isValid()) {
        log('awsCognitoUtilities.js', 'getCognitoUserSession', 'invalid', 'Session is invalid', { hasSession: !!session });
        window.performanceTracker.step({
          step: 'getCognitoUserSession_invalid',
          file: 'awsCognitoUtilities.js',
          method: 'getCognitoUserSession',
          flag: 'invalid',
          purpose: 'Session validation failed'
        });
        return reject(new Error('Invalid session'));
      }

      const tokens = {
        idToken: session.getIdToken().getJwtToken(),
        accessToken: session.getAccessToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken()
      };

      log('awsCognitoUtilities.js', 'getCognitoUserSession', 'success', 'Session retrieved successfully', {
        idTokenLength: tokens.idToken.length,
        accessTokenLength: tokens.accessToken.length,
        hasRefreshToken: !!tokens.refreshToken
      });
      window.performanceTracker.step({
        step: 'getCognitoUserSession_complete',
        file: 'awsCognitoUtilities.js',
        method: 'getCognitoUserSession',
        flag: 'success',
        purpose: 'Session retrieval complete'
      });

      resolve(tokens);
    });
  });
}

/**
 * @function updateCognitoUserAttributes
 * @description Update user attributes in Cognito
 * @param {CognitoUser} cognitoUser - Cognito user instance
 * @param {Array<CognitoUserAttribute>} attributeList - Attributes to update
 * @returns {Promise<string>} Success message
 */
export function updateCognitoUserAttributes(cognitoUser, attributeList) {
  log('awsCognitoUtilities.js', 'updateCognitoUserAttributes', 'start', 'Updating user attributes', {
    username: cognitoUser.getUsername(),
    attributeCount: attributeList.length
  });
  window.performanceTracker.step({
    step: 'updateCognitoUserAttributes_start',
    file: 'awsCognitoUtilities.js',
    method: 'updateCognitoUserAttributes',
    flag: 'start',
    purpose: 'Update user attributes in Cognito'
  });

  return new Promise((resolve, reject) => {
    cognitoUser.updateAttributes(attributeList, (error, result) => {
      if (error) {
        log('awsCognitoUtilities.js', 'updateCognitoUserAttributes', 'error', 'Failed to update attributes', { error: error.message, stack: error.stack });
        window.performanceTracker.step({
          step: 'updateCognitoUserAttributes_error',
          file: 'awsCognitoUtilities.js',
          method: 'updateCognitoUserAttributes',
          flag: 'error',
          purpose: 'Attribute update failed'
        });
        return reject(error);
      }

      log('awsCognitoUtilities.js', 'updateCognitoUserAttributes', 'success', 'Attributes updated successfully', { result });
      window.performanceTracker.step({
        step: 'updateCognitoUserAttributes_complete',
        file: 'awsCognitoUtilities.js',
        method: 'updateCognitoUserAttributes',
        flag: 'success',
        purpose: 'Attribute update complete'
      });

      resolve(result);
    });
  });
}

/**
 * @function signOutCognitoUser
 * @description Sign out current Cognito user
 * @returns {boolean} Success status
 */
export function signOutCognitoUser() {
  log('awsCognitoUtilities.js', 'signOutCognitoUser', 'start', 'Signing out user', {});
  window.performanceTracker.step({
    step: 'signOutCognitoUser_start',
    file: 'awsCognitoUtilities.js',
    method: 'signOutCognitoUser',
    flag: 'start',
    purpose: 'Sign out current user'
  });

  try {
    const currentUser = getCurrentCognitoUser();

    if (currentUser) {
      const username = currentUser.getUsername();
      currentUser.signOut();
      log('awsCognitoUtilities.js', 'signOutCognitoUser', 'success', 'User signed out', { username });
      window.performanceTracker.step({
        step: 'signOutCognitoUser_complete',
        file: 'awsCognitoUtilities.js',
        method: 'signOutCognitoUser',
        flag: 'success',
        purpose: 'Sign out complete'
      });
      return true;
    }

    log('awsCognitoUtilities.js', 'signOutCognitoUser', 'no-user', 'No user to sign out', {});
    window.performanceTracker.step({
      step: 'signOutCognitoUser_no_user',
      file: 'awsCognitoUtilities.js',
      method: 'signOutCognitoUser',
      flag: 'no-user',
      purpose: 'No user was logged in'
    });

    return true;
  } catch (error) {
    log('awsCognitoUtilities.js', 'signOutCognitoUser', 'error', 'Error during sign out', { error: error.message, stack: error.stack });
    window.performanceTracker.step({
      step: 'signOutCognitoUser_error',
      file: 'awsCognitoUtilities.js',
      method: 'signOutCognitoUser',
      flag: 'error',
      purpose: 'Sign out failed'
    });
    return false;
  }
}

/**
 * @function deriveCognitoRegion
 * @description Helper to derive region from environment variables
 * @returns {string|null} Region string or null
 */
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

/**
 * @function getCognitoClient
 * @description Get Cognito Identity Provider Client (AWS SDK v3)
 * @returns {CognitoIdentityProviderClient}
 */
export function getCognitoClient() {
  const region = deriveCognitoRegion();
  if (!region) {
    throw new Error(
      "Missing Cognito region. Set VITE_COGNITO_USER_POOL_ID (preferred) or VITE_COGNITO_REGION / VITE_AWS_REGION."
    );
  }

  // OPTIONAL: support explicit credentials (e.g. for dev/testing `ListUsers`)
  // WARNING: Exposing keys in frontend is unsafe for production unless these are temporary/limited keys.
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

  const config = { region };

  if (accessKeyId && secretAccessKey) {
    config.credentials = {
      accessKeyId,
      secretAccessKey
    };
  }

  return new CognitoIdentityProviderClient(config);
}

/**
 * @function lookupCognitoUserByAttribute
 * @description Search for a user by a specific attribute (e.g. custom:telegram_id)
 * @param {string} attributeName - Attribute name (e.g. 'custom:telegram_id' or 'email')
 * @param {string} attributeValue - Value to match
 * @returns {Promise<object|null>} Found user object or null
 */
export async function lookupCognitoUserByAttribute(attributeName, attributeValue) {
  log('awsCognitoUtilities.js', 'lookupCognitoUserByAttribute', 'start', 'Searching for user (Admin API)', { attributeName, attributeValue });

  if (!attributeValue) {
    return null;
  }

  try {
    const client = getCognitoClient();
    const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;

    // AdminListUsers supports custom attribute filtering
    // Filter syntax: "AttributeName = \"AttributeValue\""
    const filter = `${attributeName} = "${attributeValue}"`;

    const command = new ListUsersCommand({
      UserPoolId: userPoolId,
      Filter: filter,
      Limit: 1
    });

    const response = await client.send(command);

    if (response.Users && response.Users.length > 0) {
      const user = response.Users[0];
      log('awsCognitoUtilities.js', 'lookupCognitoUserByAttribute', 'found', 'User found', { username: user.Username });
      return user;
    }

    log('awsCognitoUtilities.js', 'lookupCognitoUserByAttribute', 'not-found', 'No user found');
    return null;
  } catch (error) {
    const isCredentialError = error.message.includes('Credential is missing');
    if (isCredentialError) {
      console.warn("Skipping Admin lookup: Missing AWS credentials.");
      return null;
    }

    log('awsCognitoUtilities.js', 'lookupCognitoUserByAttribute', 'error', 'User lookup failed', { error: error.message });
    console.warn("ListUsersCommand lookup failed.", error);
    return null;
  }
}
