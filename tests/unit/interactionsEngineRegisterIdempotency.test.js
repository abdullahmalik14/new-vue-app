import { afterEach, describe, expect, it, vi } from 'vitest';

import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

afterEach(() => {
  Object.keys(interactionsEngine.scopes).forEach((key) => delete interactionsEngine.scopes[key]);
  vi.restoreAllMocks();
});

describe('interactionsEngine register idempotency', () => {
  it('does not overwrite field state when same scope+id is registered twice', () => {
    interactionsEngine.register(
      { scope: 'idempotentScope', id: 'email', validation: {} },
      'first@email.com',
      null,
    );

    const firstState = interactionsEngine.getFieldState({ scope: 'idempotentScope', id: 'email' });
    expect(firstState?.value).toBe('first@email.com');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    interactionsEngine.register(
      { scope: 'idempotentScope', id: 'email', validation: {} },
      'second@email.com',
      null,
    );

    const secondState = interactionsEngine.getFieldState({ scope: 'idempotentScope', id: 'email' });
    expect(secondState).toBe(firstState);
    expect(secondState?.value).toBe('first@email.com');
    expect(warnSpy).toHaveBeenCalled();
  });
});
