import { afterEach, describe, expect, it, vi } from 'vitest';

import '@/interactions/index.js';
import {
  allowedScriptsRegistry,
  registerAllowedScript,
  runAllowedScriptAction,
  unregisterAllowedScript,
} from '@/interactions/utils/allowedScriptsRegistry.js';
import { INTERACTION_CONFIG_ATTR } from '@/interactions/utils/engine.js';

describe('allowedScriptsRegistry (directive + engine script allowlist)', () => {
  afterEach(() => {
    unregisterAllowedScript('trace');
    unregisterAllowedScript('noop');
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('rejects inline action.code', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const called = vi.fn();
    registerAllowedScript('noop', called);

    runAllowedScriptAction({ code: 'called()' }, null, null);
    expect(called).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });

  it('invokes allowlisted function with el, scope, and args', () => {
    const trace = [];
    registerAllowedScript('trace', (el, scope, arg) => {
      trace.push({ hasEl: !!el, hasScope: !!scope, arg });
    });

    const scope = document.createElement('form');
    const el = document.createElement('input');
    scope.appendChild(el);

    runAllowedScriptAction({ functionName: 'trace', args: ['ok'] }, el, scope);
    expect(trace).toEqual([{ hasEl: true, hasScope: true, arg: 'ok' }]);
  });

  it('built-in dispatchScopeInteractionInputs dispatches input on stamped fields', () => {
    const scope = document.createElement('form');
    scope.setAttribute('interaction-container', '');
    const field = document.createElement('input');
    field.setAttribute(INTERACTION_CONFIG_ATTR, '[]');
    let inputCount = 0;
    field.addEventListener('input', () => { inputCount += 1; });
    scope.appendChild(field);
    document.body.appendChild(scope);

    runAllowedScriptAction(
      { functionName: 'dispatchScopeInteractionInputs' },
      field,
      scope,
    );

    expect(inputCount).toBe(1);
    expect(typeof allowedScriptsRegistry.dispatchScopeInteractionInputs).toBe('function');
  });
});
