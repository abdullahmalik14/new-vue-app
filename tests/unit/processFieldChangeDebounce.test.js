import { afterEach, describe, expect, it, vi } from 'vitest';

import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

afterEach(() => {
  vi.useRealTimers();
  Object.keys(interactionsEngine.scopes).forEach((key) => delete interactionsEngine.scopes[key]);
});

describe('interactionsEngine processFieldChange debounce', () => {
  it('debounces validation when debounceMs is provided', async () => {
    vi.useFakeTimers();
    interactionsEngine.scopes.demo = {
      fields: {
        name: {
          value: '',
          isValid: true,
          failedRules: [],
          validationConfig: { rules: [{ type: 'minLength', param: 3 }] },
          meta: {},
          element: null,
        },
      },
    };

    const cfg = { scope: 'demo', id: 'name', debounceMs: 100, events: { input: {} } };
    interactionsEngine.processFieldChange(cfg, 'a');
    interactionsEngine.processFieldChange(cfg, 'ab');
    interactionsEngine.processFieldChange(cfg, 'abc');

    expect(interactionsEngine.scopes.demo.fields.name.value).toBe('abc');
    // Not validated yet before timer fires
    expect(interactionsEngine.scopes.demo.fields.name.isValid).toBe(true);

    await vi.advanceTimersByTimeAsync(100);
    expect(interactionsEngine.scopes.demo.fields.name.isValid).toBe(true);
  });
});
