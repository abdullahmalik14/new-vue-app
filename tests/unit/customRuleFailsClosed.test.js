import { describe, expect, it } from 'vitest';

import { validationsLibrary } from '@/utils/validation/validationsLibrary.js';

describe('custom rule fails closed (L-16)', () => {
  it('returns false when param is not a function', () => {
    expect(validationsLibrary.custom('value', null, {})).toBe(false);
    expect(validationsLibrary.custom('value', 'not-a-fn', {})).toBe(false);
    expect(validationsLibrary.custom('value', undefined, {})).toBe(false);
  });

  it('invokes param function when provided', () => {
    expect(validationsLibrary.custom('ok', (v) => v === 'ok', {})).toBe(true);
    expect(validationsLibrary.custom('no', (v) => v === 'ok', {})).toBe(false);
  });
});
