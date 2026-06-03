import { describe, expect, it, afterEach } from 'vitest';

import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

describe('interactionsEngine.validateScope (L-14)', () => {
  afterEach(() => {
    delete interactionsEngine.scopes['missing-scope-test'];
    delete interactionsEngine.scopes['registered-scope-test'];
  });

  it('returns isValid false when scope is not registered', () => {
    const result = interactionsEngine.validateScope('missing-scope-test');

    expect(result.isValid).toBe(false);
    expect(result.scopeError).toBe('SCOPE_NOT_REGISTERED');
    expect(result.invalidFields).toEqual([]);
  });

  it('validates registered scopes normally', () => {
    interactionsEngine.scopes['registered-scope-test'] = {
      fields: {
        title: {
          value: '',
          validationConfig: { required: true, requiredMessage: 'Required' },
          element: null,
          isValid: true,
          failedRules: [],
        },
      },
    };

    const result = interactionsEngine.validateScope('registered-scope-test');
    expect(result.scopeError).toBeUndefined();
    expect(result.isValid).toBe(false);
    expect(result.invalidFields).toHaveLength(1);
    expect(result.invalidFields[0].fieldId).toBe('title');
  });
});
