import { afterEach, describe, expect, it, vi } from 'vitest';

import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

afterEach(() => {
  vi.useRealTimers();
  Object.keys(interactionsEngine.scopes).forEach((key) => delete interactionsEngine.scopes[key]);
  Object.keys(interactionsEngine.elementVisibility).forEach((key) => delete interactionsEngine.elementVisibility[key]);
  Object.keys(interactionsEngine.originalValues).forEach((key) => delete interactionsEngine.originalValues[key]);
  Object.keys(interactionsEngine._debounceTimers).forEach((key) => {
    clearTimeout(interactionsEngine._debounceTimers[key]);
    delete interactionsEngine._debounceTimers[key];
  });
  Object.keys(interactionsEngine._asyncDebounceTimers).forEach((key) => {
    clearTimeout(interactionsEngine._asyncDebounceTimers[key]);
    delete interactionsEngine._asyncDebounceTimers[key];
  });
});

describe('interactionsEngine scope cleanup', () => {
  it('unregister removes field and auto-clears empty scope', () => {
    interactionsEngine.register({ scope: 'cleanupForm', id: 'email', validation: {} }, 'a@b.com', null);
    expect(interactionsEngine.getFieldState({ scope: 'cleanupForm', id: 'email' })).not.toBeNull();

    interactionsEngine.unregister({ scope: 'cleanupForm', id: 'email' });

    expect(interactionsEngine.getFieldState({ scope: 'cleanupForm', id: 'email' })).toBeNull();
    expect(interactionsEngine.scopes.cleanupForm).toBeUndefined();
  });

  it('clearScope removes scoped visibility/original-value/timer entries only', () => {
    vi.useFakeTimers();

    interactionsEngine.register({ scope: 'alpha', id: 'name', validation: { rules: [] }, debounceMs: 100 }, '', null);
    interactionsEngine.register({ scope: 'beta', id: 'name', validation: { rules: [] }, debounceMs: 100 }, '', null);

    interactionsEngine.elementVisibility['alpha.panel'] = true;
    interactionsEngine.elementVisibility['beta.panel'] = true;
    interactionsEngine.originalValues['alpha_target'] = 'old-a';
    interactionsEngine.originalValues['beta_target'] = 'old-b';

    interactionsEngine.processFieldChange({ scope: 'alpha', id: 'name', debounceMs: 100, events: { input: {} } }, 'x');
    interactionsEngine.processFieldChange({ scope: 'beta', id: 'name', debounceMs: 100, events: { input: {} } }, 'y');
    expect(interactionsEngine._debounceTimers['alpha:name']).toBeTruthy();
    expect(interactionsEngine._debounceTimers['beta:name']).toBeTruthy();

    interactionsEngine.clearScope('alpha');

    expect(interactionsEngine.scopes.alpha).toBeUndefined();
    expect(interactionsEngine.scopes.beta).toBeDefined();

    expect(interactionsEngine.elementVisibility['alpha.panel']).toBeUndefined();
    expect(interactionsEngine.elementVisibility['beta.panel']).toBe(true);

    expect(interactionsEngine.originalValues['alpha_target']).toBeUndefined();
    expect(interactionsEngine.originalValues['beta_target']).toBe('old-b');

    expect(interactionsEngine._debounceTimers['alpha:name']).toBeUndefined();
    expect(interactionsEngine._debounceTimers['beta:name']).toBeTruthy();
  });
});
