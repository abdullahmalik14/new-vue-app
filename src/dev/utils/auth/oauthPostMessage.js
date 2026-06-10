/**
 * Trusted-origin helpers for OAuth popup postMessage flows.
 */

export function originFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function parseExtraOrigins(value) {
  if (!value || typeof value !== 'string') return [];
  return value.split(',').map((part) => part.trim()).filter(Boolean);
}

export function buildOAuthAllowedOrigins(...candidates) {
  const origins = new Set();
  if (typeof window !== 'undefined' && window.location?.origin) {
    origins.add(window.location.origin);
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    const origin = candidate.includes('://') ? originFromUrl(candidate) : candidate;
    if (origin) origins.add(origin);
  }

  return origins;
}

export function getTwitterOAuthAllowedOrigins() {
  return buildOAuthAllowedOrigins(
    import.meta.env.VITE_TWITTER_REDIRECT_URI,
    ...parseExtraOrigins(import.meta.env.VITE_OAUTH_ALLOWED_ORIGINS),
  );
}

export function getTelegramOAuthAllowedOrigins() {
  return buildOAuthAllowedOrigins(
    import.meta.env.VITE_TELEGRAM_CALLBACK_ORIGIN || (typeof window !== 'undefined' ? window.location.origin : null),
    ...parseExtraOrigins(import.meta.env.VITE_OAUTH_ALLOWED_ORIGINS),
  );
}

export function isTrustedOAuthOrigin(origin, allowedOrigins) {
  if (!origin || origin === 'null') return false;
  return allowedOrigins.has(origin);
}

/**
 * Reply to OAuth popup only when origin is on the allowlist (never uses "*").
 * @returns {boolean} whether the message was sent
 */
export function postOAuthAck(source, payload, origin, allowedOrigins) {
  if (!source?.postMessage) return false;
  if (!isTrustedOAuthOrigin(origin, allowedOrigins)) {
    if (import.meta.env?.DEV) {
      console.warn('[oauth] blocked postMessage ack to untrusted origin:', origin);
    }
    return false;
  }
  source.postMessage(payload, origin);
  return true;
}
