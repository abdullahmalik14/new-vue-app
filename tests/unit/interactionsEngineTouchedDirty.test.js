import { afterEach, describe, expect, it } from 'vitest';

import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

afterEach(() => {
  Object.keys(interactionsEngine.scopes).forEach((key) => delete interactionsEngine.scopes[key]);
});

describe('interactionsEngine touched/dirty/showError', () => {
  it('keeps showError false until blur when field is invalid', () => {
    interactionsEngine.register(
      {
        scope: 'signupForm',
        id: 'email',
        validation: {
          rules: [{ type: 'isEmail', message: 'Invalid email' }]
        }
      },
      'not-an-email',
      null
    );

    interactionsEngine.processFieldChange(
      {
        scope: 'signupForm',
        id: 'email',
        validation: {
          rules: [{ type: 'isEmail', message: 'Invalid email' }]
        }
      },
      'not-an-email'
    );

    const state = interactionsEngine.getFieldState({ scope: 'signupForm', id: 'email' });
    expect(state.isValid).toBe(false);
    expect(state.touched).toBe(false);
    expect(state.showError).toBe(false);

    interactionsEngine.processFieldBlur({ scope: 'signupForm', id: 'email' });

    expect(state.touched).toBe(true);
    expect(state.showError).toBe(true);
  });

  it('marks dirty when value changes and showError after scope submit', () => {
    interactionsEngine.register(
      {
        scope: 'form',
        id: 'name',
        validation: {
          required: true,
          requiredMessage: 'Required'
        }
      },
      '',
      null
    );

    const state = interactionsEngine.getFieldState({ scope: 'form', id: 'name' });
    expect(state.dirty).toBe(false);

    interactionsEngine.processFieldChange(
      {
        scope: 'form',
        id: 'name',
        validation: {
          required: true,
          requiredMessage: 'Required'
        }
      },
      'Ada'
    );

    expect(state.dirty).toBe(true);
    expect(state.showError).toBe(false);

    interactionsEngine.markScopeSubmitted('form');
    expect(state.showError).toBe(false);

    interactionsEngine.processFieldChange(
      {
        scope: 'form',
        id: 'name',
        validation: {
          required: true,
          requiredMessage: 'Required'
        }
      },
      ''
    );

    expect(state.isValid).toBe(false);
    expect(state.showError).toBe(true);
  });
});
