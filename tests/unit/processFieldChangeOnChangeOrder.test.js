import { afterEach, describe, expect, it } from 'vitest';

import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

describe('processFieldChange onChange before validation (L-18)', () => {
  afterEach(() => {
    delete interactionsEngine._allowedActionHandlers.__testClearValue;
    delete interactionsEngine.actionHandlers.__testClearValue;
    Object.keys(interactionsEngine.scopes).forEach((key) => delete interactionsEngine.scopes[key]);
    Object.keys(interactionsEngine.elementVisibility).forEach((key) => {
      delete interactionsEngine.elementVisibility[key];
    });
  });

  it('runs onValid/onInvalid from post-onChange validation, not pre-onChange', () => {
    interactionsEngine.registerActionHandler('__testClearValue', (_action, fieldState) => {
      if (fieldState) fieldState.value = '';
    });

    interactionsEngine.register(
      {
        scope: 'l18',
        id: 'title',
        validation: { required: true, requiredMessage: 'Required' },
        events: {
          input: {
            onChange: [{ type: '__testClearValue' }],
            onValid: [{ type: 'showElement', elementKey: 'okBox' }],
            onInvalid: [{ type: 'showElement', elementKey: 'badBox' }],
          },
        },
      },
      'has-text',
      null,
    );

    interactionsEngine.elementVisibility.okBox = false;
    interactionsEngine.elementVisibility.badBox = false;

    const fieldConfig = {
      scope: 'l18',
      id: 'title',
      validation: { required: true, requiredMessage: 'Required' },
      events: {
        input: {
          onChange: [{ type: '__testClearValue' }],
          onValid: [{ type: 'showElement', elementKey: 'okBox' }],
          onInvalid: [{ type: 'showElement', elementKey: 'badBox' }],
        },
      },
    };

    interactionsEngine.processFieldChange(fieldConfig, 'has-text');

    expect(interactionsEngine.elementVisibility.okBox).not.toBe(true);
    expect(interactionsEngine.elementVisibility.badBox).toBe(true);
  });
});
