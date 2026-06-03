import { afterEach, describe, expect, it, vi } from 'vitest';

import '@/interactions/index.js';
import { allowedScriptsRegistry } from '@/interactions/utils/allowedScriptsRegistry.js';
import { execActions } from '@/interactions/utils/engine.js';

describe('engine.js script action', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('does not execute inline action.code', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const el = document.createElement('button');
    const scope = document.createElement('form');

    execActions({ actionType: 'script', code: 'window.__evil = 1' }, el, scope);

    expect(window.__evil).toBeUndefined();
    expect(spy).toHaveBeenCalled();
  });

  it('runs allowlisted functionName with el and scope', () => {
    const trace = [];
    allowedScriptsRegistry.__testTrace = (el, scope) => {
      trace.push({ tag: el?.tagName, scopeTag: scope?.tagName });
    };

    const scope = document.createElement('form');
    const el = document.createElement('button');
    scope.appendChild(el);

    execActions({ actionType: 'script', functionName: '__testTrace' }, el, scope);

    expect(trace).toEqual([{ tag: 'BUTTON', scopeTag: 'FORM' }]);
    delete allowedScriptsRegistry.__testTrace;
  });
});
