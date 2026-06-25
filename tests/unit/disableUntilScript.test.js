import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { setupDisableUntilScript, isScriptGateReady } from '@/interactions/utils/disableUntilScript.js';
import { vInteractions } from '@/interactions/directives/vInteractions.js';

const GLOBAL_NAME = '__DISABLE_UNTIL_SCRIPT_TEST__';

describe('disableUntilScript', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    delete window[GLOBAL_NAME];
  });

  afterEach(() => {
    vi.useRealTimers();
    delete window[GLOBAL_NAME];
    document.body.innerHTML = '';
  });

  it('isScriptGateReady reflects global presence', () => {
    const cfg = { global: GLOBAL_NAME };
    expect(isScriptGateReady(cfg)).toBe(false);
    window[GLOBAL_NAME] = {};
    expect(isScriptGateReady(cfg)).toBe(true);
  });

  it('isScriptGateReady is a no-op (ready) when nothing is configured', () => {
    expect(isScriptGateReady({})).toBe(true);
    expect(isScriptGateReady(null)).toBe(true);
  });

  it('disables the element and blocks clicks until the global appears', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);

    let clicked = 0;
    btn.addEventListener('click', () => { clicked += 1; });

    const cleanup = setupDisableUntilScript(btn, { global: GLOBAL_NAME, pollInterval: 50 });

    expect(btn.hasAttribute('disabled')).toBe(true);
    expect(btn.getAttribute('aria-disabled')).toBe('true');

    btn.dispatchEvent(new Event('click', { bubbles: true }));
    expect(clicked).toBe(0); // blocked while pending

    window[GLOBAL_NAME] = {};
    vi.advanceTimersByTime(50);

    expect(btn.hasAttribute('disabled')).toBe(false);
    expect(btn.hasAttribute('aria-disabled')).toBe(false);

    btn.dispatchEvent(new Event('click', { bubbles: true }));
    expect(clicked).toBe(1); // allowed once ready

    cleanup();
  });

  it('does not disable an element when the script is already ready', () => {
    window[GLOBAL_NAME] = {};
    const btn = document.createElement('button');
    const cleanup = setupDisableUntilScript(btn, { global: GLOBAL_NAME });
    expect(btn.hasAttribute('disabled')).toBe(false);
    cleanup();
  });

  it('stays disabled and emits script-timeout when the script never arrives', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);

    const onTimeout = vi.fn();
    btn.addEventListener('interactions:script-timeout', onTimeout);

    const cleanup = setupDisableUntilScript(btn, { global: GLOBAL_NAME, timeout: 1000, pollInterval: 100 });
    expect(btn.hasAttribute('disabled')).toBe(true);

    vi.advanceTimersByTime(1000);

    expect(onTimeout).toHaveBeenCalledTimes(1);
    expect(btn.hasAttribute('disabled')).toBe(true); // stays disabled

    cleanup();
  });

  it('cleanup stops polling so a late script does not re-enable a dead element', () => {
    const btn = document.createElement('button');
    const cleanup = setupDisableUntilScript(btn, { global: GLOBAL_NAME, pollInterval: 50 });
    expect(btn.hasAttribute('disabled')).toBe(true);

    cleanup();
    window[GLOBAL_NAME] = {};
    vi.advanceTimersByTime(500);

    // cleanup removed the click-guard, but the disabled attr is left as-is (element is gone/unmounted)
    expect(btn.getAttribute('aria-disabled')).toBe('true');
  });

  it('works declaratively through the v-interactions directive', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);

    const config = Object.freeze([
      { disableUntilScript: { global: GLOBAL_NAME, pollInterval: 50 } },
    ]);

    vInteractions.mounted(btn, { value: config, oldValue: undefined });
    expect(btn.hasAttribute('disabled')).toBe(true);

    window[GLOBAL_NAME] = {};
    vi.advanceTimersByTime(50);
    expect(btn.hasAttribute('disabled')).toBe(false);

    vInteractions.beforeUnmount(btn);
  });
});
