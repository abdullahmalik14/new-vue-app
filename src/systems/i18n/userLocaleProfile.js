import { useAuthStore } from '@/stores/useAuthStore.js';
import {
  fetchUserProfile,
  updateUserPreferredLocale,
} from '@/services/user/userLocaleApi.js';
import {
  getLeadingLocaleFromPath,
  getActiveLocale,
  setActiveLocale,
  SUPPORTED_LOCALES,
} from './localeManager.js';
import {
  isCognitoLocaleProfileEnabled,
  getPreferredLocaleFromTokenClaims,
  savePreferredLocaleToCognito,
  normalizePreferredLocaleCode,
} from './cognitoLocaleProfile.js';

/**
 * Resolve preferred locale for the authenticated user (Cognito token or dev API).
 * @returns {Promise<string | null>}
 */
export async function resolvePreferredLocaleForAuth() {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    return null;
  }

  const fromUser = normalizePreferredLocaleCode(authStore.currentUser?.preferredLocale);
  if (fromUser) {
    return fromUser;
  }

  const fromToken = getPreferredLocaleFromTokenClaims(authStore.currentUser?.raw);
  if (fromToken) {
    authStore.updateUserAttributesLocally({ preferredLocale: fromToken });
    return fromToken;
  }

  if (isCognitoLocaleProfileEnabled()) {
    return null;
  }

  const profile = await fetchUserProfile();
  const fromApi = normalizePreferredLocaleCode(profile?.preferredLocale);
  if (fromApi) {
    authStore.updateUserAttributesLocally({ preferredLocale: fromApi });
  }
  return fromApi;
}

/**
 * Apply server-stored locale after login/session restore when URL has no locale prefix.
 *
 * L-17: This function is called asynchronously from `setTokenAndDecode` (fire-and-forget).
 * It races with router navigation, so `window.location.pathname` may be stale.
 * If the locale store already holds an explicit user preference, trust it over the
 * JWT claim — the JWT `custom:preferred_locale` can be stale until the token is
 * refreshed. Only apply the profile locale when no local preference exists
 * (e.g., fresh login on a new device).
 *
 * @returns {Promise<void>}
 */
export async function applyUserPreferredLocaleOnAuth() {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    return;
  }

  if (typeof window !== 'undefined') {
    const urlLocale = getLeadingLocaleFromPath(window.location.pathname);
    if (urlLocale) {
      return;
    }
  }

  const current = getActiveLocale();
  if (current && SUPPORTED_LOCALES.includes(current) && current !== 'en') {
    authStore.updateUserAttributesLocally({ preferredLocale: current });
    return;
  }

  const { useLocaleStore } = await import('@/stores/useLocaleStore.js');
  try {
    const localeStore = useLocaleStore();
    if (localeStore.locale && SUPPORTED_LOCALES.includes(localeStore.locale)) {
      authStore.updateUserAttributesLocally({ preferredLocale: localeStore.locale });
      return;
    }
  } catch {
    // Store unavailable during early boot
  }

  const preferredLocale = await resolvePreferredLocaleForAuth();
  if (!preferredLocale || !SUPPORTED_LOCALES.includes(preferredLocale)) {
    return;
  }

  const currentActive = getActiveLocale();
  if (currentActive === preferredLocale) {
    authStore.updateUserAttributesLocally({ preferredLocale });
    return;
  }

  await setActiveLocale(preferredLocale, { updateUrl: true, syncProfile: false });
  authStore.updateUserAttributesLocally({ preferredLocale });
}

/**
 * Save locale to user profile when authenticated (Cognito in production, API in dev).
 * @param {string} localeCode
 * @returns {Promise<boolean>}
 */
export async function syncPreferredLocaleToProfile(localeCode) {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    return true;
  }

  const locale = normalizePreferredLocaleCode(localeCode);
  if (!locale) {
    return false;
  }

  let ok = false;

  if (isCognitoLocaleProfileEnabled()) {
    ok = await savePreferredLocaleToCognito(locale);
  } else {
    ok = await updateUserPreferredLocale(locale);
  }

  if (ok) {
    authStore.updateUserAttributesLocally({ preferredLocale: locale });
  }

  return ok;
}
