import { describe, expect, it } from 'vitest';

import { rules } from '@/utils/validation/rules.js';

describe('isSelect placeholder handling', () => {
  it('uses param placeholder value instead of hardcoded list', () => {
    const out = {
      emptyRejectedWhenParamEmpty: rules.isSelect('', '') === false,
      customPlaceholderRejected: rules.isSelect('placeholder', 'placeholder') === false,
      customValueAccepted: rules.isSelect('creator', 'placeholder') === true,
      noHardcodedZeroRejection: rules.isSelect('0', '') === true,
    };
    expect(Object.values(out).every(Boolean)).toBe(true);
  });
});
