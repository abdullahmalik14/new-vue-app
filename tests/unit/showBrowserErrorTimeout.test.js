import { afterEach, describe, expect, it, vi } from 'vitest';

import { execActions } from '@/interactions/utils/engine.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('showBrowserError timeout deduplication', () => {
  it('does not clear validity when an older browser error timeout expires', async () => {
    vi.useFakeTimers();

    const input = document.createElement('input');
    input.checkValidity = () => true;
    document.body.appendChild(input);

    execActions({ actionType: 'showBrowserError', message: 'First error' }, input, document);
    await vi.advanceTimersByTimeAsync(100);
    execActions({ actionType: 'showBrowserError', message: 'Second error' }, input, document);

    expect(input.validationMessage).toBe('Second error');

    await vi.advanceTimersByTimeAsync(750);
    expect(input.validationMessage).toBe('Second error');

    await vi.advanceTimersByTimeAsync(150);
    expect(input.validationMessage).toBe('');

    input.remove();
  });

  it('clears validity after the latest error timeout when no newer error is shown', async () => {
    vi.useFakeTimers();

    const input = document.createElement('input');
    input.checkValidity = () => true;
    document.body.appendChild(input);

    execActions({ actionType: 'showBrowserError', message: 'Only error' }, input, document);
    await vi.advanceTimersByTimeAsync(800);

    expect(input.validationMessage).toBe('');

    input.remove();
  });
});
