import { afterEach, describe, expect, it, vi } from 'vitest';

import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

afterEach(() => {
  vi.useRealTimers();
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

describe('interactionsEngine async validation', () => {
  it('debounces async rules, tracks pending, and applies Promise results', async () => {
    vi.useFakeTimers();

    const asyncCheck = vi.fn((value) => Promise.resolve(value === 'available'));

    interactionsEngine.register(
      {
        scope: 'onboardingForm',
        id: 'username',
        asyncDebounceMs: 200,
        validation: {
          rules: [
            {
              type: 'custom',
              async: true,
              param: asyncCheck,
              message: 'Username is taken'
            }
          ]
        }
      },
      'taken',
      null
    );

    interactionsEngine.processFieldChange(
      {
        scope: 'onboardingForm',
        id: 'username',
        asyncDebounceMs: 200,
        validation: {
          rules: [
            {
              type: 'custom',
              async: true,
              param: asyncCheck,
              message: 'Username is taken'
            }
          ]
        }
      },
      'available'
    );

    const state = interactionsEngine.getFieldState({
      scope: 'onboardingForm',
      id: 'username'
    });

    expect(asyncCheck).not.toHaveBeenCalled();
    expect(state.pending).toBe(false);

    await vi.advanceTimersByTimeAsync(200);
    await Promise.resolve();

    expect(asyncCheck).toHaveBeenCalledWith('available', expect.any(Object));
    await Promise.resolve();
    expect(state.pending).toBe(false);
    expect(state.isValid).toBe(true);
    expect(state.failedRules).toEqual([]);
  });

  it('marks field invalid when async custom rule resolves false', async () => {
    vi.useFakeTimers();

    interactionsEngine.register(
      {
        scope: 'couponForm',
        id: 'coupon',
        asyncDebounceMs: 50,
        validation: {
          rules: [
            {
              type: 'custom',
              async: true,
              param: () => Promise.resolve(false),
              message: 'Invalid coupon'
            }
          ]
        }
      },
      'SAVE10',
      null
    );

    interactionsEngine.processFieldChange(
      {
        scope: 'couponForm',
        id: 'coupon',
        asyncDebounceMs: 50,
        validation: {
          rules: [
            {
              type: 'custom',
              async: true,
              param: () => Promise.resolve(false),
              message: 'Invalid coupon'
            }
          ]
        }
      },
      'SAVE10'
    );

    await vi.advanceTimersByTimeAsync(50);
    await Promise.resolve();
    await Promise.resolve();

    const state = interactionsEngine.getFieldState({ scope: 'couponForm', id: 'coupon' });
    expect(state.isValid).toBe(false);
    expect(state.failedRules[0]?.message).toBe('Invalid coupon');
    expect(state.pending).toBe(false);
  });
});
