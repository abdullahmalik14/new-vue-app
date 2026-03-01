// vueApp-main-new/src/utils/auth/socialAuthHandler.js

import { generatePKCECodes } from './pkceUtils';
import { log } from '../common/logHandler';
import { authenticateOrSignUpTwitterUser } from './twitterCognitoHandler';

/**
 * @file socialAuthHandler.js
 * @description Twitter OAuth authentication handlers
 * @purpose Handles Twitter OAuth flow with PKCE using popup window
 * 
 * Best Practice: Store code_verifier in parent window memory, popup sends code back via postMessage
 */

const TWITTER_OAUTH_URL = "https://twitter.com/i/oauth2/authorize";

/**
 * IMPORTANT:
 * - Twitter API v2 endpoints are typically NOT callable directly from the browser due to CORS.
 * - For production, you should call a backend endpoint that proxies to Twitter (and keeps secrets server-side).
 *
 * Config options (recommended):
 * - VITE_TWITTER_TOKEN_URL: full URL to your backend token exchange endpoint
 * - VITE_TWITTER_PROFILE_URL: full URL to your backend "/2/users/me" proxy endpoint
 *
 * Defaults:
 * - DEV: use Vite proxy (/api/twitter/*)
 * - PROD: require env vars (fail fast with a clear error instead of making a broken direct call)
 */
const TWITTER_TOKEN_URL =
  import.meta.env.VITE_TWITTER_TOKEN_URL ||
  (import.meta.env.DEV ? "/api/twitter/token" : null);

const TWITTER_API_URL =
  import.meta.env.VITE_TWITTER_PROFILE_URL ||
  (import.meta.env.DEV ? "/api/twitter/2/users/me" : null);

// Store PKCE data in memory (per OAuth session)
// Use window object to persist across module reloads (HMR in development)
function getActiveOAuthSessions() {
  if (!window.__twitterOAuthSessions) {
    console.log('[Twitter OAuth] Creating new Map in window.__twitterOAuthSessions');
    window.__twitterOAuthSessions = new Map();
  } else {
    console.log('[Twitter OAuth] Using existing Map, size:', window.__twitterOAuthSessions.size);
  }
  return window.__twitterOAuthSessions;
}

/**
 * Generate random state for OAuth security
 * @returns {string} Random state string
 */
function generateState() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Initiate Twitter OAuth flow
 * Opens Twitter authorization in popup
 * @returns {Promise<{popup: Window, state: string}>} Popup window and state
 */
export async function initiateTwitterLogin() {
  log('socialAuthHandler.js', 'initiateTwitterLogin', 'start', 'Begin Twitter OAuth flow', {});
  window.performanceTracker?.step({
    step: 'initiateTwitterLogin_start',
    file: 'socialAuthHandler.js',
    method: 'initiateTwitterLogin',
    flag: 'start',
    purpose: 'Initiate Twitter OAuth flow'
  });

  try {
    // Generate PKCE codes
    const { code_verifier, code_challenge } = await generatePKCECodes();

    // Generate state for security
    const state = generateState();

    // Store in memory using window object to persist across module reloads
    const activeOAuthSessions = getActiveOAuthSessions();

    console.log('[Twitter OAuth] BEFORE storing session:', {
      state: state,
      mapSize: activeOAuthSessions.size,
      mapKeys: Array.from(activeOAuthSessions.keys()),
      windowStorage: !!window.__twitterOAuthSessions
    });

    const sessionData = {
      code_verifier,
      timestamp: Date.now()
    };

    activeOAuthSessions.set(state, sessionData);

    // Verify it was stored
    const stored = activeOAuthSessions.get(state);
    console.log('[Twitter OAuth] AFTER storing session:', {
      state: state,
      wasStored: !!stored,
      hasCodeVerifier: !!stored?.code_verifier,
      mapSize: activeOAuthSessions.size,
      mapKeys: Array.from(activeOAuthSessions.keys()),
      isSameMap: activeOAuthSessions === window.__twitterOAuthSessions
    });

    // Clean up old sessions (older than 10 minutes)
    const maxAge = 10 * 60 * 1000;
    const beforeCleanupSize = activeOAuthSessions.size;
    for (const [key, session] of activeOAuthSessions.entries()) {
      if (Date.now() - session.timestamp > maxAge) {
        console.log('[Twitter OAuth] Cleaning up old session:', key);
        activeOAuthSessions.delete(key);
      }
    }

    if (activeOAuthSessions.size !== beforeCleanupSize) {
      console.log('[Twitter OAuth] Cleanup removed sessions:', {
        before: beforeCleanupSize,
        after: activeOAuthSessions.size
      });
    }

    console.log('[Twitter OAuth] OAuth session created (final):', {
      state: state,
      hasCodeVerifier: !!code_verifier,
      activeSessions: activeOAuthSessions.size,
      storageType: 'window.__twitterOAuthSessions',
      finalMapKeys: Array.from(activeOAuthSessions.keys())
    });

    // Twitter API v2 OAuth2 scopes
    // Request users.email scope to get email address for account linking
    // tweet.write is required for posting tweets
    const scopes = [
      "tweet.read",
      "tweet.write",
      "users.read",
      "users.email",
      "offline.access"
    ].join(" "); // Join with space, URLSearchParams will encode it

    const clientId = import.meta.env.VITE_TWITTER_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_TWITTER_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new Error('Missing Twitter OAuth configuration. Please set VITE_TWITTER_CLIENT_ID and VITE_TWITTER_REDIRECT_URI');
    }

    // Build URL with properly encoded parameters
    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,  // URLSearchParams will encode it
      scope: scopes,  // Space-separated, will be encoded to %20
      state: state,
      code_challenge: code_challenge,
      code_challenge_method: 'S256'
    });

    const authUrl = `${TWITTER_OAUTH_URL}?${authParams.toString()}`;

    log('socialAuthHandler.js', 'initiateTwitterLogin', 'popup-open', 'Opening Twitter OAuth popup', {
      hasCodeVerifier: !!code_verifier,
      hasState: !!state
    });

    const w = 600, h = 600;
    const left = (screen.width / 2) - (w / 2);
    const top = (screen.height / 2) - (h / 2);

    const popupWindow = window.open(
      authUrl,
      'twitter_auth',
      `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );

    if (!popupWindow) {
      throw new Error('Failed to open popup. Please allow popups for this site.');
    }

    log('socialAuthHandler.js', 'initiateTwitterLogin', 'success', 'Twitter OAuth popup opened', {});

    window.performanceTracker?.step({
      step: 'initiateTwitterLogin_complete',
      file: 'socialAuthHandler.js',
      method: 'initiateTwitterLogin',
      flag: 'success',
      purpose: 'Twitter OAuth popup opened'
    });

    return { popup: popupWindow, state };
  } catch (error) {
    log('socialAuthHandler.js', 'initiateTwitterLogin', 'error', 'Failed to initiate Twitter login', {
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker?.step({
      step: 'initiateTwitterLogin_error',
      file: 'socialAuthHandler.js',
      method: 'initiateTwitterLogin',
      flag: 'error',
      purpose: 'Twitter OAuth initiation failed'
    });
    throw error;
  }
}

/**
 * Handle OAuth callback from popup
 * Processes the authorization code and completes the OAuth flow
 * @param {string} code - Authorization code from Twitter
 * @param {string} code - Authorization code from Twitter
 * @param {string} state - OAuth state parameter
 * @param {string} mode - 'auth' (default) or 'link'
 * @param {string} intent - 'login' or 'signup' (optional, only used when mode is 'auth')
 * @returns {Promise<{idToken: string, accessToken: string, refreshToken: string} | {id: string, email: string}>}
 */
export async function handleTwitterCallback(code, state, mode = 'auth', intent = 'login') {
  log('socialAuthHandler.js', 'handleTwitterCallback', 'start', 'Handle Twitter OAuth callback', {
    hasCode: !!code,
    hasState: !!state,
    mode,
    intent
  });

  try {
    // Get code_verifier from memory (using window object to persist across module reloads)
    const activeOAuthSessions = getActiveOAuthSessions();

    console.log('[Twitter OAuth] Looking up session for state:', state);
    console.log('[Twitter OAuth] Active sessions:', Array.from(activeOAuthSessions.keys()));
    console.log('[Twitter OAuth] Session storage:', {
      storageType: 'window.__twitterOAuthSessions',
      sessionCount: activeOAuthSessions.size,
      hasStorage: !!window.__twitterOAuthSessions
    });

    const session = activeOAuthSessions.get(state);
    if (!session) {
      const availableStates = Array.from(activeOAuthSessions.keys());
      console.error('[Twitter OAuth] Session not found for state:', {
        requestedState: state,
        availableStates: availableStates,
        sessionCount: activeOAuthSessions.size,
        storageExists: !!window.__twitterOAuthSessions,
        allWindowKeys: Object.keys(window).filter(k => k.includes('twitter') || k.includes('oauth'))
      });
      throw new Error(`Invalid or expired OAuth state. State: ${state}. Available states: ${availableStates.join(', ') || 'none'}`);
    }

    const { code_verifier } = session;

    // DON'T delete session yet - wait until after successful token exchange
    // (In case of retry, we might need it again)
    // activeOAuthSessions.delete(state);

    console.log('[Twitter OAuth] Retrieved code_verifier from memory:', {
      state: state,
      hasCodeVerifier: !!code_verifier,
      codeVerifierLength: code_verifier?.length
    });

    // Exchange code for Twitter access token
    const clientId = import.meta.env.VITE_TWITTER_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_TWITTER_CLIENT_SECRET;
    const redirectUri = import.meta.env.VITE_TWITTER_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Twitter OAuth configuration');
    }

    // Create Basic Auth header
    const credentials = btoa(`${clientId}:${clientSecret}`);

    const params = new URLSearchParams({
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: code_verifier,
      client_id: clientId
    });

    const bodyString = params.toString();

    log('socialAuthHandler.js', 'handleTwitterCallback', 'token-request', 'Requesting token from Twitter', {
      url: TWITTER_TOKEN_URL,
      hasCode: !!code,
      hasCodeVerifier: !!code_verifier,
      redirectUri: redirectUri
    });

    if (!TWITTER_TOKEN_URL) {
      throw new Error(
        "Twitter token exchange is not configured for production. Set VITE_TWITTER_TOKEN_URL to your backend endpoint."
      );
    }

    const response = await fetch(TWITTER_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: bodyString
    });

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Token exchange failed: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error_description) {
          errorMessage = `Twitter token exchange failed: ${errorJson.error_description}`;
          if (errorJson.error_description.includes('authorization code')) {
            errorMessage += '. The authorization code may have expired or been used. Please try logging in again.';
          }
        }
      } catch (e) {
        // If parsing fails, use the raw error data
      }

      log('socialAuthHandler.js', 'handleTwitterCallback', 'token-error', 'Token exchange failed', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        errorMessage
      });
      throw new Error(errorMessage);
    }

    const tokenData = await response.json();

    // Helpful diagnostics (do not log the raw token)
    console.log("[Twitter OAuth] Token exchange success:", {
      tokenType: tokenData.token_type,
      scope: tokenData.scope,
      expiresIn: tokenData.expires_in,
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token
    });

    // Log Twitter Access Token and Refresh Token
    // console.log("[Twitter OAuth] Twitter Access Token:", tokenData.access_token);
    // console.log("[Twitter OAuth] Twitter Refresh Token:", tokenData.refresh_token);
    // log('socialAuthHandler.js', 'handleTwitterCallback', 'tokens-received', 'Twitter tokens received', {
    //   hasAccessToken: !!tokenData.access_token,
    //   hasRefreshToken: !!tokenData.refresh_token,
    //   accessToken: tokenData.access_token,
    //   refreshToken: tokenData.refresh_token,
    //   expiresIn: tokenData.expires_in
    // });

    if (!tokenData.access_token) {
      throw new Error('Failed to get access token from Twitter');
    }

    // Get Twitter user profile
    log('socialAuthHandler.js', 'handleTwitterCallback', 'get-profile', 'Fetching Twitter profile', {});

    const profileResponse = await getTwitterProfile(tokenData.access_token);

    if (!profileResponse.data || !profileResponse.data.id) {
      throw new Error('Failed to get user profile from Twitter');
    }

    const twitterUserId = profileResponse.data.id;
    // Email may be in data.email or may require additional API call
    // Twitter API v2 returns email only if users.email scope is granted and email is verified
    const email = profileResponse.data.email || profileResponse.data.confirmed_email || null;

    // NOW delete session after successful completion
    activeOAuthSessions.delete(state);

    if (mode === 'link') {
      log('socialAuthHandler.js', 'handleTwitterCallback', 'linking-mode', 'Returning profile for linking', {
        twitterUserId,
        hasEmail: !!email
      });
      // Return profile data for linking instead of authenticating
      return { id: twitterUserId, email, username: profileResponse.data.username };
    }

    // Authenticate or signup with Cognito (Default Auth Mode)
    log('socialAuthHandler.js', 'handleTwitterCallback', 'cognito-auth', 'Authenticating with Cognito', {
      twitterUserId,
      hasEmail: !!email,
      intent
    });

    const tokens = await authenticateOrSignUpTwitterUser(twitterUserId, email, intent);

    log('socialAuthHandler.js', 'handleTwitterCallback', 'success', 'Twitter login successful', {
      hasTokens: !!tokens.idToken
    });

    return tokens;
  } catch (error) {
    // Keep session on error (except state validation errors) to allow retry
    // This is especially important for CORS errors which might be retried

    log('socialAuthHandler.js', 'handleTwitterCallback', 'error', 'Twitter callback failed', {
      error: error.message,
      stack: error.stack,
      sessionPreserved: true
    });
    throw error;
  }
}

/**
 * Exchange Twitter OAuth code for tokens (without Cognito authentication)
 * Used for storing tokens to enable posting functionality
 * @param {string} code - Authorization code from Twitter
 * @param {string} state - OAuth state parameter
 * @returns {Promise<{access_token: string, refresh_token: string, expires_in: number}>}
 */
export async function exchangeTwitterCodeForTokens(code, state) {
  log('socialAuthHandler.js', 'exchangeTwitterCodeForTokens', 'start', 'Exchange Twitter code for tokens', {
    hasCode: !!code,
    hasState: !!state
  });

  try {
    // Get code_verifier from memory
    const activeOAuthSessions = getActiveOAuthSessions();
    const session = activeOAuthSessions.get(state);
    
    if (!session) {
      const availableStates = Array.from(activeOAuthSessions.keys());
      throw new Error(`Invalid or expired OAuth state. State: ${state}. Available states: ${availableStates.join(', ') || 'none'}`);
    }

    const { code_verifier } = session;

    // Exchange code for Twitter access token
    const clientId = import.meta.env.VITE_TWITTER_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_TWITTER_CLIENT_SECRET;
    const redirectUri = import.meta.env.VITE_TWITTER_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Twitter OAuth configuration');
    }

    // Create Basic Auth header
    const credentials = btoa(`${clientId}:${clientSecret}`);

    const params = new URLSearchParams({
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: code_verifier,
      client_id: clientId
    });

    if (!TWITTER_TOKEN_URL) {
      throw new Error(
        "Twitter token exchange is not configured for production. Set VITE_TWITTER_TOKEN_URL to your backend endpoint."
      );
    }

    const response = await fetch(TWITTER_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Token exchange failed: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error_description) {
          errorMessage = `Twitter token exchange failed: ${errorJson.error_description}`;
        }
      } catch (e) {
        // If parsing fails, use the raw error data
      }

      throw new Error(errorMessage);
    }

    const tokenData = await response.json();

    if (!tokenData.access_token) {
      throw new Error('Failed to get access token from Twitter');
    }

    // Clean up session after successful token exchange
    activeOAuthSessions.delete(state);

    log('socialAuthHandler.js', 'exchangeTwitterCodeForTokens', 'success', 'Token exchange successful', {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    });

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in
    };
  } catch (error) {
    log('socialAuthHandler.js', 'exchangeTwitterCodeForTokens', 'error', 'Token exchange failed', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Get Twitter user profile
 * @param {string} accessToken - Twitter access token
 * @returns {Promise<{data: {id: string, name: string, username: string, email?: string}}>}
 */
export async function getTwitterProfile(accessToken) {
  log('socialAuthHandler.js', 'getTwitterProfile', 'start', 'Fetching Twitter user profile', { hasAccessToken: !!accessToken });
  window.performanceTracker?.step({
    step: 'getTwitterProfile_start',
    file: 'socialAuthHandler.js',
    method: 'getTwitterProfile',
    flag: 'start',
    purpose: 'Get Twitter user profile'
  });

  try {
    if (!TWITTER_API_URL) {
      throw new Error(
        "Twitter profile fetch is not configured for production. Set VITE_TWITTER_PROFILE_URL to a backend endpoint that calls https://api.twitter.com/2/users/me server-side."
      );
    }

    // Request email field (requires users.email scope and confirmed_email)
    const params = new URLSearchParams({
      'user.fields': 'id,name,username,profile_image_url,confirmed_email'
    });

    const url = `${TWITTER_API_URL}?${params.toString()}`;

    log('socialAuthHandler.js', 'getTwitterProfile', 'profile-request', 'Requesting profile from Twitter API', {});

    let response;
    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
    } catch (networkErr) {
      // This is the typical failure mode when attempting a direct browser call to Twitter (CORS).
      throw new Error(
        `Failed to fetch Twitter profile (network/CORS). Use a backend proxy. Details: ${networkErr?.message || networkErr}`
      );
    }

    if (!response.ok) {
      const errorData = await response.text();
      const wwwAuth = response.headers.get('www-authenticate');
      log('socialAuthHandler.js', 'getTwitterProfile', 'profile-error', 'Profile fetch failed', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        wwwAuthenticate: wwwAuth
      });
      throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
    }

    const profileData = await response.json();

    log('socialAuthHandler.js', 'getTwitterProfile', 'success', 'Profile fetched successfully', {
      userId: profileData.data?.id,
      username: profileData.data?.username,
      hasEmail: !!profileData.data?.email
    });

    window.performanceTracker?.step({
      step: 'getTwitterProfile_complete',
      file: 'socialAuthHandler.js',
      method: 'getTwitterProfile',
      flag: 'success',
      purpose: 'Profile fetch complete'
    });

    return profileData;
  } catch (error) {
    log('socialAuthHandler.js', 'getTwitterProfile', 'error', 'Failed to fetch Twitter profile', {
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker?.step({
      step: 'getTwitterProfile_error',
      file: 'socialAuthHandler.js',
      method: 'getTwitterProfile',
      flag: 'error',
      purpose: 'Profile fetch failed'
    });
    throw error;
  }
}
