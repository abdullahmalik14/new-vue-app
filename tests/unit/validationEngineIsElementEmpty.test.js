import { describe, expect, it } from 'vitest';

import { validationEngine } from '@/utils/validation/validationEngine.js';

describe('validationEngine _isElementEmpty', () => {
  it('treats false as empty when element reference is missing', () => {
    expect(validationEngine._isElementEmpty(null, false)).toBe(true);
  });
});
