import { describe, expect, it } from 'vitest';

import { stampValidation } from '@/interactions/utils/engine.js';

describe('stampValidation aria-invalid support', () => {
  it('sets aria-invalid to match validation state', () => {
    const el = document.createElement('input');

    stampValidation(el, { isValid: false, failedRules: [{ rule: 'required', error: 'Required' }] });
    expect(el.getAttribute('validated')).toBe('false');
    expect(el.getAttribute('aria-invalid')).toBe('true');

    stampValidation(el, { isValid: true, failedRules: [] });
    expect(el.getAttribute('validated')).toBe('true');
    expect(el.getAttribute('aria-invalid')).toBe('false');
  });
});
