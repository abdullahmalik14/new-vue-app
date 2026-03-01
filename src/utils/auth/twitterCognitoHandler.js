// vueApp-main-new/src/utils/auth/twitterCognitoHandler.js

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
  UpdateUserAttributesCommand,
  GetUserCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { registerNewUser, linkSocialAccount } from './awsCognitoHandler';
import { log } from '../common/logHandler';
import { lookupCognitoUserByAttribute, getCognitoClient } from './awsCognitoUtilities';
import { registerUser, checkUserExists } from '../backend/scyllaDbClient';

/**
 * @file twitterCognitoHandler.js
 * @description Twitter OAuth integration with AWS Cognito CUSTOM_AUTH
 * @purpose Handles Twitter user authentication via Cognito CUSTOM_AUTH flow
 */

/**
 * Generate strong random password for SignUp
 * Cognito requires password even though user won't use it (CUSTOM_AUTH bypasses password)
 * @returns {string} Random password meeting Cognito requirements
 */
function generateStrongRandomPassword() {
  // Cognito requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + special;

  let password = '';

  // Ensure requirements are met
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill remaining length (min 8 chars, use 16 for security)
  const remainingLength = 12;
  const array = new Uint8Array(remainingLength);
  crypto.getRandomValues(array);
  for (let i = 0; i < remainingLength; i++) {
    password += allChars[array[i] % allChars.length];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Determine username from Twitter profile
 * Uses email if available, otherwise synthetic format
 * @param {string|null} email - Email from Twitter
 * @param {string} twitterUserId - Twitter user ID
 * @returns {string} Username for Cognito
 */
function determineUsername(email, twitterUserId) {
  if (email && email.trim()) {
    return email.trim();
  }
  return `twitter_${twitterUserId}@social.local`;
}

// Local getCognitoClient removed in favor of utility import


/**
 * Authenticate user with Cognito CUSTOM_AUTH
 * @param {string} username - Username (email or synthetic)
 * @returns {Promise<{idToken: string, accessToken: string, refreshToken: string}>}
 */
async function authenticateWithCustomAuth(username) {
  log('twitterCognitoHandler.js', 'authenticateWithCustomAuth', 'start', 'Begin CUSTOM_AUTH authentication', { username });
  window.performanceTracker?.step({
    step: 'authenticateWithCustomAuth_start',
    file: 'twitterCognitoHandler.js',
    method: 'authenticateWithCustomAuth',
    flag: 'start',
    purpose: 'Authenticate with Cognito CUSTOM_AUTH'
  });

  try {
    const client = getCognitoClient();
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;

    if (!clientId) {
      throw new Error('Missing VITE_COGNITO_CLIENT_ID environment variable');
    }

    console.log("[twitterCognitoHandler] Using Cognito app client:", {
      clientIdPrefix: String(clientId).slice(0, 10),
      userPoolIdPrefix: userPoolId ? String(userPoolId).slice(0, 12) : "missing",
      authFlow: "CUSTOM_AUTH",
    });

    log('twitterCognitoHandler.js', 'authenticateWithCustomAuth', 'initiate-auth', 'Initiating CUSTOM_AUTH', { username });

    const command = new InitiateAuthCommand({
      ClientId: clientId,
      AuthFlow: 'CUSTOM_AUTH',
      AuthParameters: {
        USERNAME: username
        // NO SECRET_HASH - using app client without secret
      },
      ClientMetadata: {
        '_trusted_backend': 'true' // Signal to Lambda triggers
      }
    });

    const response = await client.send(command);

    // Check if we got tokens directly (Lambda auto-approved)
    if (response.AuthenticationResult) {
      const tokens = {
        idToken: response.AuthenticationResult.IdToken,
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken
      };

      log('twitterCognitoHandler.js', 'authenticateWithCustomAuth', 'success', 'Authentication successful (direct)', {
        username,
        hasIdToken: !!tokens.idToken,
        hasAccessToken: !!tokens.accessToken
      });

      window.performanceTracker?.step({
        step: 'authenticateWithCustomAuth_complete',
        file: 'twitterCognitoHandler.js',
        method: 'authenticateWithCustomAuth',
        flag: 'success',
        purpose: 'CUSTOM_AUTH successful'
      });

      return tokens;
    }

    // Handle challenge if Lambda returns one
    if (response.ChallengeName && response.Session) {
      log('twitterCognitoHandler.js', 'authenticateWithCustomAuth', 'challenge-received', 'Challenge received, responding', {
        challengeName: response.ChallengeName
      });

      const respondCommand = new RespondToAuthChallengeCommand({
        ClientId: clientId,
        ChallengeName: response.ChallengeName,
        Session: response.Session,
        ChallengeResponses: {
          USERNAME: username,
          ANSWER: 'auto-approved' // Value from CreateAuthChallenge Lambda
          // NO SECRET_HASH - app client without secret
        }
      });

      const challengeResponse = await client.send(respondCommand);

      if (challengeResponse.AuthenticationResult) {
        const tokens = {
          idToken: challengeResponse.AuthenticationResult.IdToken,
          accessToken: challengeResponse.AuthenticationResult.AccessToken,
          refreshToken: challengeResponse.AuthenticationResult.RefreshToken
        };

        log('twitterCognitoHandler.js', 'authenticateWithCustomAuth', 'success', 'Authentication successful (after challenge)', {
          username,
          hasIdToken: !!tokens.idToken
        });

        window.performanceTracker?.step({
          step: 'authenticateWithCustomAuth_complete',
          file: 'twitterCognitoHandler.js',
          method: 'authenticateWithCustomAuth',
          flag: 'success',
          purpose: 'CUSTOM_AUTH successful after challenge'
        });

        return tokens;
      }
    }

    throw new Error('Unexpected response from Cognito CUSTOM_AUTH');
  } catch (error) {
    log('twitterCognitoHandler.js', 'authenticateWithCustomAuth', 'error', 'CUSTOM_AUTH failed', {
      username,
      error: error.message,
      errorName: error.name,
      stack: error.stack
    });
    window.performanceTracker?.step({
      step: 'authenticateWithCustomAuth_error',
      file: 'twitterCognitoHandler.js',
      method: 'authenticateWithCustomAuth',
      flag: 'error',
      purpose: 'CUSTOM_AUTH failed'
    });
    throw error;
  }
}

/**
 * Create new user in Cognito for Twitter signup
 * @param {string} username - Username (email or synthetic)
 * @param {string|null} email - Email from Twitter (if available)
 * @param {string} twitterUserId - Twitter user ID
 * @returns {Promise<object>} SignUp result
 */
async function createTwitterUser(username, email, twitterUserId) {
  log('twitterCognitoHandler.js', 'createTwitterUser', 'start', 'Begin Twitter user creation', {
    username,
    hasEmail: !!email,
    twitterUserId
  });
  window.performanceTracker?.step({
    step: 'createTwitterUser_start',
    file: 'twitterCognitoHandler.js',
    method: 'createTwitterUser',
    flag: 'start',
    purpose: 'Create new user in Cognito for Twitter'
  });

  try {
    // Generate random password (user never needs to know/use it)
    const tempPassword = generateStrongRandomPassword();

    // Build attributes
    const userAttributes = {};

    if (email && email.trim()) {
      userAttributes.email = email.trim();
      // Note: email_verified is a read-only attribute managed by Cognito
      // Use Pre Sign-up Lambda to auto-verify if needed (event.response.autoVerifyEmail = true)
    }

    // Store Twitter user ID in custom attribute
    userAttributes['custom:twitter_id'] = twitterUserId;
    userAttributes['custom:password_source'] = 'system';

    // Use existing registerNewUser function from awsCognitoHandler
    // It uses amazon-cognito-identity-js which works fine for SignUp
    const result = await registerNewUser(username, tempPassword, userAttributes);

    log('twitterCognitoHandler.js', 'createTwitterUser', 'success', 'Twitter user created successfully', {
      username,
      userSub: result.userSub
    });

    // Sync to ScyllaDB (non-blocking)
    registerUser(username, {
      twitter_id: twitterUserId,
      user_id: result.userSub,
      email: email || `twitter_${twitterUserId}@social.local` // Ensure email field is populated
    })
      .then(() => log('twitterCognitoHandler.js', 'createTwitterUser', 'scylla-sync-success', 'Synced Twitter user to ScyllaDB', { username }))
      .catch(err => log('twitterCognitoHandler.js', 'createTwitterUser', 'scylla-sync-error', 'Failed to sync Twitter user to ScyllaDB', { error: err.message }));

    window.performanceTracker?.step({
      step: 'createTwitterUser_complete',
      file: 'twitterCognitoHandler.js',
      method: 'createTwitterUser',
      flag: 'success',
      purpose: 'Twitter user creation complete'
    });

    return result;
  } catch (error) {
    log('twitterCognitoHandler.js', 'createTwitterUser', 'error', 'Failed to create Twitter user', {
      username,
      error: error.message,
      errorName: error.name,
      stack: error.stack
    });
    window.performanceTracker?.step({
      step: 'createTwitterUser_error',
      file: 'twitterCognitoHandler.js',
      method: 'createTwitterUser',
      flag: 'error',
      purpose: 'Twitter user creation failed'
    });
    throw error;
  }
}

/**
 * Update user attributes using access token
 * @param {string} accessToken - Cognito access token
 * @param {object} attributes - Attributes to update
 * @returns {Promise<void>}
 */
async function updateUserAttributesWithToken(accessToken, attributes) {
  log('twitterCognitoHandler.js', 'updateUserAttributesWithToken', 'start', 'Updating user attributes via token', {
    attributeKeys: Object.keys(attributes)
  });

  try {
    const client = getCognitoClient();

    // Convert attributes to Cognito format
    const attributeList = Object.entries(attributes).map(([name, value]) => ({
      Name: name,
      Value: String(value)
    }));

    const command = new UpdateUserAttributesCommand({
      AccessToken: accessToken,
      UserAttributes: attributeList
    });

    await client.send(command);

    log('twitterCognitoHandler.js', 'updateUserAttributesWithToken', 'success', 'Attributes updated successfully', {
      attributeKeys: Object.keys(attributes)
    });
  } catch (error) {
    log('twitterCognitoHandler.js', 'updateUserAttributesWithToken', 'error', 'Failed to update attributes', {
      error: error.message,
      errorName: error.name
    });
    throw error;
  }
}

/**
 * Main function: Try authentication first, then signup if needed
 * @param {string} twitterUserId - Twitter user ID
 * @param {string} email - Optional email from Twitter
 * @param {string} intent - 'login' or 'signup'
 * @returns {Promise<object>} Session tokens
 */
export async function authenticateOrSignUpTwitterUser(twitterUserId, email, intent = 'login') {
  window.performanceTracker?.step({
    step: 'authenticateOrSignUpTwitterUser_start',
    file: 'twitterCognitoHandler.js',
    method: 'authenticateOrSignUpTwitterUser',
    flag: 'start',
    purpose: 'Auth/Signup logic start',
    meta: { intent }
  });

  try {
    // 1. Check ScyllaDB for existing link (Source of Truth)
    log('twitterCognitoHandler.js', 'authenticateOrSignUpTwitterUser', 'check-scylla', 'Checking ScyllaDB for existing user by Twitter ID', { twitterUserId });
    const existingUser = await checkUserExists('twitter', twitterUserId);

    if (existingUser && existingUser.user_id) {
      // Found linked user! We need the username to login. 
      // ScyllaDB stores user_id (sub). We need to fetch the username from Cognito using the sub.
      // OR we can try to login with email if available? 
      // Actually, CUSTOM_AUTH accepts USERNAME. The user_id (sub) IS a valid username in Cognito (usually).
      // Let's try authentication with the SUB.
      log('twitterCognitoHandler.js', 'authenticateOrSignUpTwitterUser', 'scylla-found', 'Found user in ScyllaDB. Logging in with Sub.', { sub: existingUser.user_id });

      try {
        return await authenticateWithCustomAuth(existingUser.user_id);
      } catch (err) {
        // If sub fail, maybe try fetching real username? 
        // For now, assume sub works or fall through.
        log('twitterCognitoHandler.js', 'authenticateOrSignUpTwitterUser', 'sub-login-failed', 'Login with Sub failed, will try other methods', { error: err.message });
      }
    }

    // 2. Check ScyllaDB for Email (Conflict Detection)
    if (email) {
      log('twitterCognitoHandler.js', 'authenticateOrSignUpTwitterUser', 'check-email', 'Checking ScyllaDB for existing email', { email });
      const emailUser = await checkUserExists('email', email);

      if (emailUser) {
        // Email exists in system. Check if linked.
        if (emailUser.twitter_id === twitterUserId) {
          // Linked! (Should have been caught in step 1, but maybe eventual consistency)
          return await authenticateWithCustomAuth(emailUser.user_id);
        } else {
          // CONFLICT! Email exists but not linked to this Twitter ID.
          // BLOCK LOGIN.
          log('twitterCognitoHandler.js', 'authenticateOrSignUpTwitterUser', 'conflict', 'Email exists but not linked', { email });
          throw new Error("Account exists with this email but is not linked to Twitter. Please log in with your email and password, then link Twitter in settings.");
        }
      }
    }

    // 3. User Not Found -> Create New User
    if (intent === 'login') {
      // If strict login mode, we could fail here. But social login usually implies "Sign up if not exists".
      // User instruction: "if not say not linked else login. if not found crate an account both place."
      // So we proceed to creation.
    }

    const syntheticUsername = `twitter_${twitterUserId}@social.local`;
    const usernameToCreate = (email && email.trim()) ? email.trim() : syntheticUsername;

    log('twitterCognitoHandler.js', 'authenticateOrSignUpTwitterUser', 'create-user', 'Creating new Twitter user', { username: usernameToCreate });

    // Double-check ScyllaDB one more time before creating (race condition safety)
    const finalCheck = await checkUserExists('twitter', twitterUserId);
    if (finalCheck) {
      log('twitterCognitoHandler.js', 'authenticateOrSignUpTwitterUser', 'race-detected', 'User was created between checks, logging in', { sub: finalCheck.user_id });
      return await authenticateWithCustomAuth(finalCheck.user_id);
    }

    await createTwitterUser(usernameToCreate, email, twitterUserId);

    return await authenticateWithCustomAuth(usernameToCreate);

  } catch (error) {
    log('twitterCognitoHandler.js', 'authenticateOrSignUpTwitterUser', 'error', 'Twitter authentication/signup failed', {
      twitterUserId,
      intent,
      error: error.message
    });
    throw error;
  }
}

// Helper to get attributes using just the token (avoids full session overhead if just verifying)
// Helper to get attributes using just the token (avoids full session overhead if just verifying)
async function getUserAttributesWithToken(accessToken) {
  // Use local getCognitoClient derived from env
  const client = getCognitoClient();
  const command = new GetUserCommand({ AccessToken: accessToken });
  const response = await client.send(command);

  const attrs = {};
  (response.UserAttributes || []).forEach(attr => {
    attrs[attr.Name] = attr.Value;
  });
  return attrs;
}

/**
 * @function linkTwitterAccount
 * @description Link a Twitter account to the current user
 * @param {string} twitterUserId - Twitter user ID
 * @returns {Promise<string>} Success message
 */
export async function linkTwitterAccount(twitterUserId) {
  return linkSocialAccount('twitter', twitterUserId);
}

