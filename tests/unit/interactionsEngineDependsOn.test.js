import { afterEach, describe, expect, it } from 'vitest';

import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

afterEach(() => {
  Object.keys(interactionsEngine.scopes).forEach((key) => delete interactionsEngine.scopes[key]);
  Object.keys(interactionsEngine._debounceTimers).forEach((key) => {
    clearTimeout(interactionsEngine._debounceTimers[key]);
    delete interactionsEngine._debounceTimers[key];
  });
  Object.keys(interactionsEngine._asyncDebounceTimers).forEach((key) => {
    clearTimeout(interactionsEngine._asyncDebounceTimers[key]);
    delete interactionsEngine._asyncDebounceTimers[key];
  });
});

describe('interactionsEngine dependsOn', () => {
  it('re-validates dependent fields when a source field changes', () => {
    interactionsEngine.register(
      { scope: 'signupForm', id: 'password', validation: { rules: [] } },
      'abc123',
      null
    );
    interactionsEngine.register(
      {
        scope: 'signupForm',
        id: 'confirmPassword',
        dependsOn: ['password'],
        validation: {
          rules: [{ type: 'matchValue', param: 'password', message: 'Passwords must match' }]
        }
      },
      'abc123',
      null
    );

    interactionsEngine.processFieldChange(
      { scope: 'signupForm', id: 'password', validation: { rules: [] } },
      'xyz999'
    );

    const confirmState = interactionsEngine.getFieldState({
      scope: 'signupForm',
      id: 'confirmPassword'
    });

    expect(confirmState.isValid).toBe(false);
    expect(confirmState.failedRules[0]?.type).toBe('matchValue');
  });
});
