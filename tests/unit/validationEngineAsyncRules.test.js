import { describe, expect, it, vi } from 'vitest';

import { validationEngine } from '@/utils/validation/validationEngine.js';

describe('validationEngine async rules', () => {
  it('skips async rules in sync validateField', () => {
    const asyncRule = vi.fn(() => Promise.resolve(false));

    const result = validationEngine.validateField(
      'value',
      {
        rules: [
          {
            type: 'custom',
            async: true,
            param: asyncRule,
            message: 'Async failed'
          }
        ]
      },
      {}
    );

    expect(result.isValid).toBe(true);
    expect(asyncRule).not.toHaveBeenCalled();
  });

  it('runs async rules in validateAsyncRules', async () => {
    const asyncRule = vi.fn(() => Promise.resolve(false));

    const result = await validationEngine.validateAsyncRules(
      'value',
      {
        rules: [
          {
            type: 'custom',
            async: true,
            param: asyncRule,
            message: 'Async failed'
          }
        ]
      },
      {}
    );

    expect(asyncRule).toHaveBeenCalled();
    expect(result.isValid).toBe(false);
    expect(result.failedRules[0]?.message).toBe('Async failed');
  });
});
