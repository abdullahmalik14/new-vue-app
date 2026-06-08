import { getAuthHandler } from '@/utils/auth/authHandler.js';
import { awsCognitoHandler, updateUserProfile } from '@/utils/auth/awsCognitoHandler.js';
import { SUPPORTED_LOCALES } from './localeManager.js';
import { log } from '@/infrastructure/logging/logHandler.js';

/** Cognito custom attribute for saved UI locale (must exist on the user pool). */
export const COGNITO_PREFERRED_LOCALE_ATTRIBUTE = 'custom:preferred_locale';

/**
 * Production Cognito path is active when the real Cognito auth handler is selected.
 * @returns {boolean}
 */
export function isCognitoLocaleProfileEnabled() {
  return getAuthHandler() === awsCognitoHandler;
}

/**
 * @param {string | null | undefined} raw
 * @returns {string | null}
 */
export function normalizePreferredLocaleCode(raw) {
  const locale = typeof raw === 'string' ? raw.toLowerCase().trim() : '';
  return locale && SUPPORTED_LOCALES.includes(locale) ? locale : null;
}

/**
 * Read preferred locale from JWT / Cognito claims.
 * @param {Record<string, unknown> | null | undefined} claims
 * @returns {string | null}
 */
export function getPreferredLocaleFromTokenClaims(claims) {
  if (!claims || typeof claims !== 'object') {
    return null;
  }

  const raw =
    claims[COGNITO_PREFERRED_LOCALE_ATTRIBUTE] ??
    claims.preferred_locale ??
    claims.preferredLocale ??
    claims.preferred_language;

  return normalizePreferredLocaleCode(
    typeof raw === 'string' ? raw : null
  );
}

/**
 * Persist preferred locale on the Cognito user profile.
 * @param {string} localeCode
 * @returns {Promise<boolean>}
 */
export async function savePreferredLocaleToCognito(localeCode) {
  const locale = normalizePreferredLocaleCode(localeCode);
  if (!locale) {
    return false;
  }

  try {
    await updateUserProfile({
      [COGNITO_PREFERRED_LOCALE_ATTRIBUTE]: locale,
    });
    log(
      'cognitoLocaleProfile.js',
      'savePreferredLocaleToCognito',
      'success',
      'Cognito preferred locale saved',
      { locale }
    );
    return true;
  } catch (error) {
    log(
      'cognitoLocaleProfile.js',
      'savePreferredLocaleToCognito',
      'warn',
      'Cognito preferred locale save failed',
      { locale, error: error?.message }
    );
    return false;
  }
}
