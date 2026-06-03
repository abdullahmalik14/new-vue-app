import { describe, expect, it } from 'vitest';

import { stampValidation } from '@/interactions/utils/engine.js';

describe('stampValidation aria-describedby support', () => {
  it('links invalid fields to error element by id convention', () => {
    const errorEl = document.createElement('p');
    errorEl.id = 'email-error';
    errorEl.textContent = 'Invalid email';
    document.body.appendChild(errorEl);

    const input = document.createElement('input');
    input.id = 'email';
    document.body.appendChild(input);

    stampValidation(input, { isValid: false, failedRules: [{ rule: 'isEmail', error: 'Invalid email' }] });

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('email-error');

    stampValidation(input, { isValid: true, failedRules: [] });
    expect(input.getAttribute('aria-describedby')).toBeNull();

    document.body.removeChild(errorEl);
    document.body.removeChild(input);
  });

  it('supports data-validation-error-for lookup', () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.id = 'coupon';
    const errorEl = document.createElement('span');
    errorEl.id = 'coupon-error-msg';
    errorEl.setAttribute('data-validation-error-for', 'coupon');
    errorEl.textContent = 'Invalid coupon';
    form.append(input, errorEl);
    document.body.appendChild(form);

    stampValidation(input, { isValid: false, failedRules: [{ rule: 'custom', error: 'Invalid coupon' }] });
    expect(input.getAttribute('aria-describedby')).toBe('coupon-error-msg');

    document.body.removeChild(form);
  });
});
