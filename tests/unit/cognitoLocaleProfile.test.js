import { describe, it, expect } from 'vitest';
import {
  COGNITO_PREFERRED_LOCALE_ATTRIBUTE,
  getPreferredLocaleFromTokenClaims,
  normalizePreferredLocaleCode,
} from '@/systems/i18n/cognitoLocaleProfile.js';

describe('cognitoLocaleProfile (F-02 Cognito)', () => {
  it('reads custom:preferred_locale from token claims', () => {
    expect(
      getPreferredLocaleFromTokenClaims({
        [COGNITO_PREFERRED_LOCALE_ATTRIBUTE]: 'vi',
      })
    ).toBe('vi');
  });

  it('normalizes and rejects unsupported locales', () => {
    expect(normalizePreferredLocaleCode('VI')).toBe('vi');
    expect(normalizePreferredLocaleCode('xx')).toBeNull();
  });
});
