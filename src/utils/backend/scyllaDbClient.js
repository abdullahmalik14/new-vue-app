/**
 * @file scyllaDbClient.js
 * @description Client for interacting with the ScyllaDB backend API using APIHandler
 */

import { APIHandler } from '../../lib/mock-api-demo/apiHandler';
import { log } from '../common/logHandler';

const BASE_URL = import.meta.env.VITE_SCYLLADB_API_URL || 'http://localhost:8080/api';

// Initialize the handler with the BASE_URL from env
// Note: APIHandler might expect apiBaseUrl in individual requests or defaults. 
// We will pass it in individual requests to be safe and explicit.
const apiHandler = new APIHandler();

/**
 * Generic helper for making API requests using APIHandler
 * @param {string} endpoint - API endpoint (e.g., '/register')
 * @param {string} method - HTTP method
 * @param {object} body - Request body
 * @returns {Promise<any>} Response data
 */
async function request(endpoint, method = 'GET', body = null) {
  // Construct full URL because APIHandler's internal "constructUrl" logic
  // appends query params but expects a base URL.
  const fullUrl = `${BASE_URL}${endpoint}`;

  const apiParams = {
    apiBaseUrl: fullUrl,
    httpMethod: method,
    requestData: body,
    // We don't specify targetContainer or popupIdToOpen for these background calls
  };

  try {
    const responseData = await apiHandler.handleRequest(apiParams);
    return responseData;
  } catch (error) {
    // Log error but don't crash app (unless caller awaits and catches)
    log('scyllaDbClient.js', 'request', 'error', `Failed request to ${endpoint}`, { error: error.message });
    throw error;
  }
}

/**
 * Register a new user in ScyllaDB
 * @param {string} email - User email
 * @param {object} extraData - Optional extra data (e.g. twitter_id, telegram_id)
 * @returns {Promise<object>} Created user object
 */
export async function registerUser(email, extraData = {}) {
  log('scyllaDbClient.js', 'registerUser', 'start', 'Registering user in ScyllaDB', { email, ...extraData });

  const payload = {
    email,
    ...extraData
  };

  return request('/register', 'POST', payload);
}

/**
 * Link a social account to an existing user
 * @param {string} userId - User's UUID (Cognito Sub)
 * @param {string} provider - 'twitter' or 'telegram'
 * @param {string} socialId - The social ID to link
 * @returns {Promise<object>} Updated user object
 */
export async function linkSocialAccount(userId, provider, socialId) {
  log('scyllaDbClient.js', 'linkSocialAccount', 'start', 'Linking social account in ScyllaDB', { userId, provider, socialId });

  const payload = {
    userId,
    provider,
    socialId
  };

  return request('/link', 'POST', payload);
}

/**
 * Unlink a social account
 * @param {string} userId - User's UUID (Cognito Sub)
 * @param {string} provider - 'twitter' or 'telegram'
 * @returns {Promise<object>} Updated user object
 */
export async function unlinkSocialAccount(userId, provider) {
  log('scyllaDbClient.js', 'unlinkSocialAccount', 'start', 'Unlinking social account in ScyllaDB', { userId, provider });

  const payload = {
    userId,
    provider
  };

  return request('/unlink', 'POST', payload);
}

/**
 * Check if a user exists
 * @param {string} type - 'email', 'twitter', 'telegram'
 * @param {string} identifier - The value to search for
 * @returns {Promise<object|null>} User object or null
 */
export async function checkUserExists(type, identifier) {
  try {
    const payload = { type, identifier };
    // The /login endpoint in API_DOCUMENTATION.md is used for identity check
    const response = await request('/login', 'POST', payload);

    // APIHandler might return the response directly or throwing error on 404.
    // Assuming backend returns { user: ... } on success.
    if (response && response.user) {
      return response.user;
    }
    return null;

  } catch (error) {
    if (error.message && (error.message.includes('404') || error.message.includes('User not found'))) {
      return null;
    }
    throw error;
  }
}

/**
 * Get user data by userId
 * @param {string} userId - User's UUID (Cognito Sub)
 * @returns {Promise<object>} User data object
 * @throws {Error} If user not found or request fails
 */
export async function getUserData(userId) {
  log('scyllaDbClient.js', 'getUserData', 'start', 'Fetching user data from ScyllaDB', { userId });

  try {
    const response = await request(`/user/${userId}`, 'GET');
    log('scyllaDbClient.js', 'getUserData', 'success', 'User data fetched successfully', { userId });
    return response;
  } catch (error) {
    log('scyllaDbClient.js', 'getUserData', 'error', 'Failed to fetch user data', { userId, error: error.message });
    throw error;
  }
}

/**
 * Save Telegram bot token for a user
 * @param {string} userId - User's UUID (Cognito Sub)
 * @param {string} botToken - Telegram bot token from BotFather
 * @returns {Promise<object>} Success response
 */
export async function saveTelegramToken(userId, botToken) {
  log('scyllaDbClient.js', 'saveTelegramToken', 'start', 'Saving Telegram bot token', { userId });

  const payload = {
    user_id: userId,
    bot_token: botToken
  };

  try {
    const response = await request('/tokens/telegram', 'POST', payload);
    log('scyllaDbClient.js', 'saveTelegramToken', 'success', 'Telegram bot token saved successfully', { userId });
    return response;
  } catch (error) {
    log('scyllaDbClient.js', 'saveTelegramToken', 'error', 'Failed to save Telegram bot token', { userId, error: error.message });
    throw error;
  }
}

/**
 * Post a message to Telegram via the backend
 * Supports both text-only messages and file uploads with FormData
 * @param {string} userId - User's UUID (Cognito Sub)
 * @param {string} chatId - Telegram chat ID (e.g., @channel or numeric ID)
 * @param {string} text - Message text content (caption if file is provided)
 * @param {File|null} file - Optional file to upload (image or video)
 * @returns {Promise<object>} Response with { ok, message_id } on success
 * @throws {Error} Throws error with status info (e.g., 401 for invalid token)
 */
export async function postTelegramMessage(userId, chatId, text, file = null) {
  log('scyllaDbClient.js', 'postTelegramMessage', 'start', 'Posting message to Telegram', { 
    userId, 
    chatId, 
    hasFile: !!file,
    fileType: file?.type 
  });

  const endpoint = `${BASE_URL}/post/telegram`;

  try {
    let response;
    
    if (file) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('chat_id', chatId);
      formData.append('text', text || '');
      
      // Determine media type based on file type
      const mediaType = file.type.startsWith('image/') ? 'photo' : 'video';
      formData.append('media_type', mediaType);
      formData.append('media_file', file);
      
      log('scyllaDbClient.js', 'postTelegramMessage', 'formdata', 'Sending FormData with file', { 
        mediaType, 
        fileName: file.name 
      });
      
      // Use fetch directly for FormData (don't set Content-Type header - browser will set it with boundary)
      response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
    } else {
      // Use JSON for text-only messages
      const payload = {
        user_id: userId,
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      };
      
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    }

    // Parse response
    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.error || responseData.message || `Request failed with status ${response.status}`;
      log('scyllaDbClient.js', 'postTelegramMessage', 'error', 'Failed to post message to Telegram', { 
        userId, 
        status: response.status,
        error: errorMessage 
      });
      throw new Error(errorMessage);
    }

    log('scyllaDbClient.js', 'postTelegramMessage', 'success', 'Message posted to Telegram', { 
      userId, 
      messageId: responseData?.message_id 
    });
    return responseData;
  } catch (error) {
    log('scyllaDbClient.js', 'postTelegramMessage', 'error', 'Failed to post message to Telegram', { 
      userId, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Get Twitter tokens for a user
 * @param {string} userId - User's UUID (Cognito Sub)
 * @returns {Promise<object|null>} Token data { access_token, refresh_token, expires_at } or null if not found
 */
export async function getTwitterTokens(userId) {
  log('scyllaDbClient.js', 'getTwitterTokens', 'start', 'Fetching Twitter tokens', { userId });

  const endpoint = `${BASE_URL}/tokens/twitter/${userId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 404) {
      log('scyllaDbClient.js', 'getTwitterTokens', 'not-found', 'No Twitter tokens found for user', { userId });
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    log('scyllaDbClient.js', 'getTwitterTokens', 'success', 'Twitter tokens fetched successfully', { 
      userId, 
      hasAccessToken: !!data?.access_token,
      hasRefreshToken: !!data?.refresh_token 
    });
    return data;
  } catch (error) {
    log('scyllaDbClient.js', 'getTwitterTokens', 'error', 'Failed to fetch Twitter tokens', { userId, error: error.message });
    throw error;
  }
}

/**
 * Save Twitter OAuth tokens for a user
 * @param {string} userId - User's UUID (Cognito Sub)
 * @param {string} accessToken - Twitter OAuth access token
 * @param {string} refreshToken - Twitter OAuth refresh token
 * @param {number} expiresIn - Token expiry time in seconds (e.g., 7200)
 * @returns {Promise<object>} Success response
 */
export async function saveTwitterTokens(userId, accessToken, refreshToken, expiresIn) {
  log('scyllaDbClient.js', 'saveTwitterTokens', 'start', 'Saving Twitter tokens', { userId, expiresIn });

  const endpoint = `${BASE_URL}/tokens/twitter`;

  const payload = {
    user_id: userId,
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.error || responseData.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    log('scyllaDbClient.js', 'saveTwitterTokens', 'success', 'Twitter tokens saved successfully', { userId });
    return responseData;
  } catch (error) {
    log('scyllaDbClient.js', 'saveTwitterTokens', 'error', 'Failed to save Twitter tokens', { userId, error: error.message });
    throw error;
  }
}

/**
 * Post a tweet to Twitter via the backend
 * Supports text-only tweets and multi-image tweets (up to 4 images)
 * @param {string} userId - User's UUID (Cognito Sub)
 * @param {string} text - Tweet text content
 * @param {File[]} files - Array of image files (max 4)
 * @returns {Promise<object>} Response with tweet data on success
 * @throws {Error} Throws error with status info (e.g., 401 for invalid token)
 */
export async function postTwitterMessage(userId, text, files = []) {
  log('scyllaDbClient.js', 'postTwitterMessage', 'start', 'Posting tweet to Twitter', { 
    userId, 
    textLength: text?.length,
    fileCount: files?.length 
  });

  const endpoint = `${BASE_URL}/post/twitter`;

  try {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('text', text || '');
    
    // Append each file (up to 4 images)
    if (files && files.length > 0) {
      const maxFiles = Math.min(files.length, 4);
      for (let i = 0; i < maxFiles; i++) {
        formData.append('media_files', files[i]);
      }
      log('scyllaDbClient.js', 'postTwitterMessage', 'formdata', 'Sending FormData with files', { 
        fileCount: maxFiles,
        fileNames: files.slice(0, maxFiles).map(f => f.name)
      });
    }
    
    // Use fetch directly for FormData (don't set Content-Type header - browser will set it with boundary)
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    // Parse response
    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.error || responseData.message || `Request failed with status ${response.status}`;
      log('scyllaDbClient.js', 'postTwitterMessage', 'error', 'Failed to post tweet to Twitter', { 
        userId, 
        status: response.status,
        error: errorMessage 
      });
      throw new Error(errorMessage);
    }

    log('scyllaDbClient.js', 'postTwitterMessage', 'success', 'Tweet posted to Twitter', { 
      userId, 
      tweetId: responseData?.tweet_id || responseData?.id 
    });
    return responseData;
  } catch (error) {
    log('scyllaDbClient.js', 'postTwitterMessage', 'error', 'Failed to post tweet to Twitter', { 
      userId, 
      error: error.message 
    });
    throw error;
  }
}