import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveActionType } from '@/interactions/utils/actionSchema.js';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';
import { validationEngine } from '@/utils/validation/validationEngine.js';

describe('interactionsEngine audit batch S-07/S-08/S-09/P-08/BP-12', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    delete interactionsEngine.scopes.__p08__;
    delete interactionsEngine._allowedActionHandlers.__auditAction__;
    delete interactionsEngine.actionHandlers.__auditAction__;
    interactionsEngine.allowedScripts = Object.create(null);
  });

  it('S-07: rejects window global functionName in script action', () => {
    window.__auditGlobalScript = () => {};
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    interactionsEngine.actionHandlers.script({ functionName: '__auditGlobalScript' });

    expect(errorSpy).toHaveBeenCalled();
    delete window.__auditGlobalScript;
    errorSpy.mockRestore();
  });

  it('S-08: extendAction requires registerActionHandler first', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(interactionsEngine.extendAction('__auditAction__', () => {})).toBe(false);
    expect(interactionsEngine.registerActionHandler('__auditAction__', () => true)).toBe(true);
    expect(interactionsEngine.extendAction('__auditAction__', () => false)).toBe(true);

    errorSpy.mockRestore();
  });

  it('S-09: pushEvent rejects raw DOM nodes and resolves element keys', () => {
    const el = document.createElement('div');
    el.setAttribute('data-element-key', 'auditTarget');
    document.body.appendChild(el);

    let received = null;
    el.addEventListener('auditEvent', (event) => {
      received = event.detail;
    });

    interactionsEngine.actionHandlers.pushEvent({
      eventName: 'auditEvent',
      eventData: { ok: true },
      targetElementKey: 'auditTarget',
    });
    expect(received).toEqual({ ok: true });

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    interactionsEngine.actionHandlers.pushEvent({
      eventName: 'audit:event',
      target: el,
    });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('P-08: scopeHasNoBlockingInvalids reuses cache when fields are not dirty', () => {
    const validateSpy = vi.spyOn(validationEngine, 'validateField');

    interactionsEngine.scopes.__p08__ = {
      fields: {
        title: {
          value: 'ok',
          dirty: false,
          touched: true,
          validationConfig: { required: true },
          element: null,
          isValid: true,
          failedRules: [],
        },
      },
    };

    const summary = interactionsEngine.scopeHasNoBlockingInvalids('__p08__');
    expect(summary.hasNoBlockingInvalids).toBe(true);
    expect(validateSpy).not.toHaveBeenCalled();

    validateSpy.mockRestore();
  });

  it('BP-12: resolveActionType accepts type or actionType', () => {
    expect(resolveActionType({ type: 'showElement' })).toBe('showElement');
    expect(resolveActionType({ actionType: 'hideElement' })).toBe('hideElement');
    expect(resolveActionType({ type: 'show', actionType: 'hide' })).toBe('show');
  });
});
