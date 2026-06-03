import { afterEach, describe, expect, it, vi } from 'vitest';

import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('interactionsEngine jumpToFieldPlaceholder logging', () => {
  it('uses internal logger.debug and does not call raw console.log', () => {
    const debugSpy = vi.spyOn(interactionsEngine.logger, 'debug').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    interactionsEngine.jumpToFieldPlaceholder('scopeA', 'email');

    expect(debugSpy).toHaveBeenCalledWith('jumpToFieldPlaceholder called for', 'scopeA', 'email');
    expect(logSpy).not.toHaveBeenCalled();
  });
});
