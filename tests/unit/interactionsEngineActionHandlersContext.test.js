import { afterEach, describe, expect, it } from 'vitest';

import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

afterEach(() => {
  Object.keys(interactionsEngine.elementVisibility).forEach((key) => delete interactionsEngine.elementVisibility[key]);
});

describe('interactionsEngine action handler context', () => {
  it('supports explicit engine binding for action handlers', () => {
    const altEngine = {
      engine: null,
      elementVisibility: {},
      logger: { debug: () => {}, error: () => {} },
      getFieldState: () => null,
      _getElementValue: () => '',
      _setElementValue: () => {},
      originalValues: {},
      allowedScripts: {},
      scopes: {},
      validateScope: () => ({ isValid: true, invalidFields: [] }),
      actionHandlers: interactionsEngine.actionHandlers,
      runInteractions: interactionsEngine.runInteractions,
    };
    altEngine.engine = altEngine;

    altEngine.runInteractions([{ type: 'showElement', elementKey: 'ctx.scope' }], null);

    expect(altEngine.elementVisibility['ctx.scope']).toBe(true);
    expect(interactionsEngine.elementVisibility['ctx.scope']).toBeUndefined();
  });
});
