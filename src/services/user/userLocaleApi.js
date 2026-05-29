import apiWrapper from '@/lib/mock-api-demo/apiWrapper.js';
import { log } from '@/utils/common/logHandler.js';
import { SUPPORTED_LOCALES } from '@/utils/translation/localeManager.js';

const PROFILE_ENDPOINT = '/users/me';
const MOCK_PROFILE_STORAGE_KEY = 'mock_users_me_profile';

/**
 * @returns {{ preferredLocale: string | null, email?: string | null }}
 */
function readMockProfileFromStorage() {
  if (typeof localStorage === 'undefined') {
    return { preferredLocale: null };
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(MOCK_PROFILE_STORAGE_KEY) || '{}');
    const raw = parsed?.preferredLocale ?? parsed?.preferred_language ?? null;
    const preferredLocale =
      typeof raw === 'string' ? raw.toLowerCase().trim() : null;
    return {
      preferredLocale:
        preferredLocale && SUPPORTED_LOCALES.includes(preferredLocale)
          ? preferredLocale
          : null,
      email: parsed?.email ?? null,
    };
  } catch {
    return { preferredLocale: null };
  }
}

/**
 * @param {{ preferredLocale?: string | null, email?: string | null }} profile
 */
function writeMockProfileToStorage(profile) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const current = readMockProfileFromStorage();
  localStorage.setItem(
    MOCK_PROFILE_STORAGE_KEY,
    JSON.stringify({ ...current, ...profile })
  );
}

/**
 * @param {unknown} data
 * @returns {{ preferredLocale: string | null, email?: string | null } | null}
 */
function normalizeProfileResponse(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const raw =
    data.preferredLocale ?? data.preferred_language ?? data.preferredLanguage ?? null;
  const preferredLocale =
    typeof raw === 'string' ? raw.toLowerCase().trim() : null;

  return {
    preferredLocale:
      preferredLocale && SUPPORTED_LOCALES.includes(preferredLocale)
        ? preferredLocale
        : null,
    email: typeof data.email === 'string' ? data.email : null,
  };
}

/**
 * Fetch the authenticated user's profile (includes preferredLocale when set).
 * @returns {Promise<{ preferredLocale: string | null, email?: string | null } | null>}
 */
export async function fetchUserProfile() {
  try {
    const data = await apiWrapper.get(PROFILE_ENDPOINT);
    const normalized = normalizeProfileResponse(data);
    const stored = readMockProfileFromStorage();

    if (!normalized) {
      return stored.preferredLocale ? stored : null;
    }

    if (normalized.preferredLocale) {
      writeMockProfileToStorage({ preferredLocale: normalized.preferredLocale });
      return normalized;
    }

    return stored.preferredLocale ? { ...normalized, ...stored } : normalized;
  } catch (error) {
    log('userLocaleApi.js', 'fetchUserProfile', 'warn', 'Profile fetch failed', {
      error: error?.message,
    });
    const stored = readMockProfileFromStorage();
    return stored.preferredLocale ? stored : null;
  }
}

/**
 * Persist preferred locale on the user profile (PATCH /users/me).
 * @param {string} preferredLocale
 * @returns {Promise<boolean>}
 */
export async function updateUserPreferredLocale(preferredLocale) {
  const locale = String(preferredLocale || '').toLowerCase().trim();
  if (!SUPPORTED_LOCALES.includes(locale)) {
    return false;
  }

  try {
    await apiWrapper.patch(PROFILE_ENDPOINT, { preferredLocale: locale });
    writeMockProfileToStorage({ preferredLocale: locale });
    log('userLocaleApi.js', 'updateUserPreferredLocale', 'success', 'Profile locale saved', {
      preferredLocale: locale,
    });
    return true;
  } catch (error) {
    log('userLocaleApi.js', 'updateUserPreferredLocale', 'warn', 'Profile locale save failed', {
      preferredLocale: locale,
      error: error?.message,
    });
    return false;
  }
}
