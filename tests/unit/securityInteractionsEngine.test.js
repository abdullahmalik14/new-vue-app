import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

describe('interactionsEngine security hardening', () => {
  beforeEach(() => {
    interactionsEngine.allowedScripts = Object.create(null);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('rejects inline script code and only allows allowlisted functions', () => {
    const inlineSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    interactionsEngine.actionHandlers.script({ code: 'window.__x = 1' });
    expect(inlineSpy).toHaveBeenCalled();

    const called = [];
    interactionsEngine.registerScriptFunction('safeCb', (value) => called.push(value));
    interactionsEngine.actionHandlers.script({ functionName: 'safeCb', args: ['ok'] });
    expect(called).toEqual(['ok']);
  });

  it('uses try/finally in showBrowserError to restore type', () => {
    const input = document.createElement('input');
    input.type = 'email';
    input.setAttribute('required', '');
    input.setCustomValidity = vi.fn();
    input.reportValidity = vi.fn(() => {
      throw new Error('boom');
    });

    expect(() => {
      interactionsEngine.actionHandlers.showBrowserError({}, { element: input }, {});
    }).toThrow();
    expect(input.type).toBe('email');
    expect(input.hasAttribute('required')).toBe(true);
  });

  it('blocks unsafe attribute names and javascript urls', () => {
    const el = document.createElement('a');
    interactionsEngine.actionHandlers.attribute(
      { attributeName: 'onclick', attributeValue: 'alert(1)' },
      { element: el },
      {},
    );
    expect(el.hasAttribute('onclick')).toBe(false);

    interactionsEngine.actionHandlers.attribute(
      { attributeName: 'href', attributeValue: 'javascript:alert(1)' },
      { element: el },
      {},
    );
    expect(el.getAttribute('href')).toBe(null);
  });

  it('setHTML defaults to textContent unless trustedHTML is true', () => {
    const el = document.createElement('div');
    interactionsEngine.actionHandlers.setHTML({ html: '<b>x</b>' }, { element: el }, {});
    expect(el.textContent).toBe('<b>x</b>');
    expect(el.innerHTML).toBe('&lt;b&gt;x&lt;/b&gt;');

    interactionsEngine.actionHandlers.setHTML({ html: '<b>x</b>', trustedHTML: true }, { element: el }, {});
    expect(el.innerHTML).toBe('<b>x</b>');
  });

  it('iterates only own scope field keys', () => {
    interactionsEngine.scopes.audit = { fields: Object.create({ inheritedField: { value: 'x' } }) };
    interactionsEngine.scopes.audit.fields.ownField = {
      value: 'ok',
      validationConfig: { rules: [] },
      element: null,
      isValid: true,
      failedRules: [],
    };

    const summary = interactionsEngine.validateScope('audit');
    expect(summary.invalidFields.some((f) => f.fieldId === 'inheritedField')).toBe(false);
  });

  it('showValidationErrors resolves labels via prebuilt label map', () => {
    const email = document.createElement('input');
    email.id = 'emailField';
    email.value = '';
    email.setAttribute('required', '');
    const label = document.createElement('label');
    label.setAttribute('for', 'emailField');
    label.textContent = 'Email Address';
    const output = document.createElement('textarea');
    output.setAttribute('data-error-display', '');
    document.body.appendChild(label);
    document.body.appendChild(email);
    document.body.appendChild(output);

    interactionsEngine.scopes.formA = {
      fields: {
        email: {
          value: '',
          validationConfig: { required: true, rules: [] },
          element: email,
          isValid: true,
          failedRules: [],
          meta: {},
        },
      },
    };

    interactionsEngine.actionHandlers.showValidationErrors({ scopeId: 'formA', scroll: false }, null, null);
    expect(output.value.includes('Email Address')).toBe(true);
  });
});
