import { describe, expect, it } from 'vitest';

import { default as directiveRules } from '@/interactions/utils/validationRules.js';
import { validationsLibrary } from '@/utils/validation/validationsLibrary.js';

describe('isSecurePassword policy unified (L-15)', () => {
  const weakNoSpecial = 'Abcdef12';

  it('requires special characters in both directive and engine libraries', () => {
    expect(directiveRules.isSecurePassword(weakNoSpecial)).toBe(false);
    expect(validationsLibrary.isSecurePassword(weakNoSpecial)).toBe(false);
  });

  it('accepts the same strong password in both libraries', () => {
    const strong = 'Abcdef12!';
    expect(directiveRules.isSecurePassword(strong)).toBe(true);
    expect(validationsLibrary.isSecurePassword(strong)).toBe(true);
  });
});
