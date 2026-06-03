import { describe, expect, it } from 'vitest';

import { validationsLibrary } from '@/utils/validation/validationsLibrary.js';

function fieldCtx(getFieldValue) {
  return { scope: 'auth', getFieldValue };
}

describe('matchValueField (empty value no longer bypasses)', () => {
  it('returns false when confirm value is empty but password is set', () => {
    expect(
      validationsLibrary.matchValueField(
        '',
        'password',
        fieldCtx(() => 'secret'),
      ),
    ).toBe(false);
  });

  it('returns false when value does not match the other field', () => {
    expect(
      validationsLibrary.matchValueField(
        'abc',
        'password',
        fieldCtx(() => 'xyz'),
      ),
    ).toBe(false);
  });

  it('returns false when the other field is missing (null)', () => {
    expect(
      validationsLibrary.matchValueField(
        'abc',
        'password',
        fieldCtx(() => null),
      ),
    ).toBe(false);
  });

  it('returns true when values match', () => {
    expect(
      validationsLibrary.matchValueField(
        'same',
        'password',
        fieldCtx(() => 'same'),
      ),
    ).toBe(true);
  });

  it('returns true when both fields are empty strings', () => {
    expect(
      validationsLibrary.matchValueField(
        '',
        'password',
        fieldCtx(() => ''),
      ),
    ).toBe(true);
  });

  it('returns false without a valid context', () => {
    expect(validationsLibrary.matchValueField('x', 'password', null)).toBe(false);
    expect(validationsLibrary.matchValueField('x', 'password', { scope: 'auth' })).toBe(false);
  });
});
