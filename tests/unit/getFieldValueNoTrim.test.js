import { describe, expect, it } from 'vitest';

import { getFieldValue } from '@/interactions/utils/engine.js';

describe('getFieldValue preserves whitespace (B-14)', () => {
  it('does not trim leading or trailing spaces', () => {
    const input = document.createElement('input');
    input.value = '  abc  ';
    expect(getFieldValue(input)).toBe('  abc  ');
  });
});
