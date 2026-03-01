// vueApp-main-new/src/utils/auth/telegramCognitoHandler.js

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { registerNewUser, linkSocialAccount } from "./awsCognitoHandler";
import { getCognitoClient, lookupCognitoUserByAttribute } from "./awsCognitoUtilities";
import { log } from "../common/logHandler";
import { registerUser, checkUserExists } from '../backend/scyllaDbClient';
/**
 * @file telegramCognitoHandler.js
 * @description Telegram Login integration with AWS Cognito CUSTOM_AUTH
 * @purpose Handles Telegram user authentication via Cognito CUSTOM_AUTH flow (no backend app server)
 */

/**
 * Generate strong random password for SignUp
 * Cognito requires a password even if the user won't use it (CUSTOM_AUTH bypasses password)
 * @returns {string}
 */
function generateStrongRandomPassword() {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  const allChars = uppercase + lowercase + numbers + special;

  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  const remainingLength = 12;
  const array = new Uint8Array(remainingLength);
  crypto.getRandomValues(array);
  for (let i = 0; i < remainingLength; i++) {
    password += allChars[array[i] % allChars.length];
  }

  return password.split("").sort(() => Math.random() - 0.5).join("");
}

/**
 * Determine a Cognito username for a Telegram user.
 * Telegram Login does not provide email, so we always synthesize a stable username.
 * @param {string|number} telegramUserId
 * @returns {string}
 */
function determineUsername(telegramUserId) {
  return `telegram_${telegramUserId}@social.local`;
}



/**
 * Authenticate user with Cognito CUSTOM_AUTH
 * @param {string} username
 * @returns {Promise<{idToken: string, accessToken: string, refreshToken: string}>}
 */
async function authenticateWithCustomAuth(username) {
  log(
    "telegramCognitoHandler.js",
    "authenticateWithCustomAuth",
    "start",
    "Begin CUSTOM_AUTH authentication",
    { username }
  );

  try {
    const client = getCognitoClient();
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

    if (!clientId) {
      throw new Error("Missing VITE_COGNITO_CLIENT_ID environment variable");
    }

    const response = await client.send(
      new InitiateAuthCommand({
        ClientId: clientId,
        AuthFlow: "CUSTOM_AUTH",
        AuthParameters: {
          USERNAME: username
        },
        ClientMetadata: {
          _trusted_backend: "true",
          social_provider: "telegram"
        }
      })
    );

    if (response.AuthenticationResult) {
      return {
        idToken: response.AuthenticationResult.IdToken,
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken
      };
    }

    if (response.ChallengeName && response.Session) {
      const challengeResponse = await client.send(
        new RespondToAuthChallengeCommand({
          ClientId: clientId,
          ChallengeName: response.ChallengeName,
          Session: response.Session,
          ChallengeResponses: {
            USERNAME: username,
            ANSWER: "auto-approved"
          }
        })
      );

      if (challengeResponse.AuthenticationResult) {
        return {
          idToken: challengeResponse.AuthenticationResult.IdToken,
          accessToken: challengeResponse.AuthenticationResult.AccessToken,
          refreshToken: challengeResponse.AuthenticationResult.RefreshToken
        };
      }
    }

    throw new Error("Unexpected response from Cognito CUSTOM_AUTH");
  } catch (error) {
    log(
      "telegramCognitoHandler.js",
      "authenticateWithCustomAuth",
      "error",
      "CUSTOM_AUTH failed",
      {
        username,
        error: error.message,
        errorName: error.name,
        stack: error.stack
      }
    );
    throw error;
  }
}

/**
 * Create new user in Cognito for Telegram signup
 * @param {string} username
 * @param {object} telegramUser
 * @returns {Promise<object>}
 */
async function createTelegramUser(username, telegramUser) {
  log(
    "telegramCognitoHandler.js",
    "createTelegramUser",
    "start",
    "Begin Telegram user creation",
    {
      username,
      telegramUserId: telegramUser?.id
    }
  );

  const tempPassword = generateStrongRandomPassword();

  // Keep attributes minimal: ONLY write attributes that are expected to exist in the pool.
  // (You must create custom:telegram_id in the Cognito user pool attributes.)
  const userAttributes = {
    "custom:telegram_id": String(telegramUser.id),
    "custom:password_source": "system"
  };

  // Optional: if your pool has 'name' enabled, you can safely set it.
  // We avoid setting non-existent custom attributes to prevent InvalidParameterException.
  const displayName = [telegramUser.first_name, telegramUser.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (displayName) {
    userAttributes.name = displayName;
  }

  // Telegram provides username sometimes, but it's not guaranteed.
  // Only include it if you have created custom:telegram_username in your pool.
  if (telegramUser.username && import.meta.env.VITE_COGNITO_HAS_TELEGRAM_USERNAME === "true") {
    userAttributes["custom:telegram_username"] = String(telegramUser.username);
  }

  const result = await registerNewUser(username, tempPassword, userAttributes);

  // Sync to ScyllaDB (non-blocking)
  registerUser(username, {
    telegram_id: String(telegramUser.id),
    user_id: result.userSub,
    email: username // Use synthetic username as email for ScyllaDB if no email provided
  })
    .then(() => log('telegramCognitoHandler.js', 'createTelegramUser', 'scylla-sync-success', 'Synced Telegram user to ScyllaDB', { username }))
    .catch(err => log('telegramCognitoHandler.js', 'createTelegramUser', 'scylla-sync-error', 'Failed to sync Telegram user to ScyllaDB', { error: err.message }));

  return result;
}

/**
 * Main function: Try authentication first, then signup if needed
 * @param {object} telegramUser - User data from Telegram widget
 * @param {string} intent - 'login' or 'signup'
 * @returns {Promise<object>} Session tokens
 */
export async function authenticateOrSignUpTelegramUser(telegramUser, intent = 'login') {
  const telegramUserId = String(telegramUser.id);
  const syntheticUsername = `telegram_${telegramUserId}@social.local`;

  if (!telegramUserId) {
    throw new Error("Missing Telegram user id");
  }

  log('telegramCognitoHandler.js', 'authenticateOrSignUpTelegramUser', 'start', 'Auth/Signup logic start', {
    telegramUserId,
    intent
  });

  try {
    // 1. Check ScyllaDB for existing link (Source of Truth)
    log('telegramCognitoHandler.js', 'authenticateOrSignUpTelegramUser', 'check-scylla', 'Checking ScyllaDB for existing user by Telegram ID', { telegramUserId });
    const existingUser = await checkUserExists('telegram', telegramUserId);

    if (existingUser && existingUser.user_id) {
      // Found linked user! Login with their Cognito user_id (sub)
      log('telegramCognitoHandler.js', 'authenticateOrSignUpTelegramUser', 'scylla-found', 'Found user in ScyllaDB. Logging in.', { sub: existingUser.user_id });
      return await authenticateWithCustomAuth(existingUser.user_id);
    }

    // 2. User Not Found -> Create New User
    if (intent === 'login') {
      // Social login typically implies "sign up if not exists", so we proceed to creation
      log('telegramCognitoHandler.js', 'authenticateOrSignUpTelegramUser', 'not-found-creating', 'User not found, creating new account');
    }

    // Double-check ScyllaDB one more time before creating (race condition safety)
    const finalCheck = await checkUserExists('telegram', telegramUserId);
    if (finalCheck) {
      log('telegramCognitoHandler.js', 'authenticateOrSignUpTelegramUser', 'race-detected', 'User was created between checks, logging in', { sub: finalCheck.user_id });
      return await authenticateWithCustomAuth(finalCheck.user_id);
    }

    // Create user
    await createTelegramUser(syntheticUsername, telegramUser);

    try {
      return await authenticateWithCustomAuth(syntheticUsername);
    } catch (postCreateAuthError) {
      if (postCreateAuthError?.name === "UserNotConfirmedException") {
        throw new Error(
          "Cognito created the Telegram user but left it UNCONFIRMED, so CUSTOM_AUTH is blocked. Fix: add a Cognito Pre Sign-up Lambda trigger that auto-confirms users created via this social flow."
        );
      }
      throw postCreateAuthError;
    }
  } catch (error) {
    log(
      "telegramCognitoHandler.js",
      "authenticateOrSignUpTelegramUser",
      "error",
      "Telegram authentication/signup failed",
      {
        telegramUserId,
        error: error.message,
        errorName: error.name,
        stack: error.stack
      }
    );
    throw error;
  }
}

/**
 * @function linkTelegramAccount
 * @description Link a Telegram account to the current user
 * @param {object} telegramUser - Telegram user object
 * @returns {Promise<string>} Success message
 */
export async function linkTelegramAccount(telegramUser) {
  if (!telegramUser || !telegramUser.id) {
    throw new Error('Invalid Telegram user data');
  }
  return linkSocialAccount('telegram', String(telegramUser.id));
}


