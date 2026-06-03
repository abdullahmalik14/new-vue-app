import { reactive } from 'vue';
import { resolveActionType } from '@/interactions/utils/actionSchema.js';
import {
  allowedScriptsRegistry,
  registerAllowedScript,
  unregisterAllowedScript,
} from '@/interactions/utils/allowedScriptsRegistry.js';
import { validationEngine } from './validationEngine.js';
import { validationsLibrary } from './validationsLibrary.js';

function resolveEventDispatchTarget(action) {
  const raw = action?.target;

  if (action.targetElementKey) {
    return document.querySelector(`[data-element-key="${action.targetElementKey}"]`);
  }

  if (raw === 'document') return document;
  if (!raw || raw === 'window') return window;

  if (typeof raw === 'string') {
    const elementKey = raw.startsWith('element:') ? raw.slice('element:'.length) : raw;
    if (elementKey && elementKey !== 'window' && elementKey !== 'document') {
      return document.querySelector(`[data-element-key="${elementKey}"]`);
    }
  }

  if (import.meta.env?.DEV) {
    console.warn('[pushEvent] rejected target — use window, document, or a trusted element key');
  }
  return null;
}

function isUnsafeAttributeName(name) {
  return /^on/i.test(name);
}

function isUrlLikeAttribute(name) {
  return ['href', 'src', 'action', 'formaction', 'xlink:href'].includes(String(name).toLowerCase());
}

function isUnsafeUrlValue(value) {
  if (value === null || value === undefined) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized.startsWith('javascript:') || normalized.startsWith('data:text/html');
}

function canSetAttribute(name, value, trusted = false) {
  if (!name) return false;
  if (isUnsafeAttributeName(name)) return false;
  if (!trusted && isUrlLikeAttribute(name) && isUnsafeUrlValue(value)) return false;
  return true;
}

function resolveValidationSummaryHost(targetElement) {
  const tag = (targetElement.tagName ?? '').toUpperCase();
  if (tag !== 'TEXTAREA' && tag !== 'INPUT') {
    if (!targetElement.hasAttribute('role')) {
      targetElement.setAttribute('role', 'alert');
    }
    if (!targetElement.hasAttribute('aria-live')) {
      targetElement.setAttribute('aria-live', 'assertive');
    }
    return targetElement;
  }

  const summaryKey = targetElement.id
    || targetElement.getAttribute('data-element-key')
    || 'legacy-input-summary';
  const parent = targetElement.parentElement;
  let host = parent?.querySelector(`[data-validation-summary-for="${summaryKey}"]`);

  if (!host) {
    host = document.createElement('div');
    host.setAttribute('role', 'alert');
    host.setAttribute('aria-live', 'assertive');
    host.setAttribute('data-validation-summary-for', summaryKey);
    if (targetElement.id) host.id = `${targetElement.id}-summary`;
    targetElement.insertAdjacentElement('afterend', host);
  }

  return host;
}

function renderValidationErrorSummary(host, summary, scope, labelByFor) {
  host.replaceChildren();

  const list = document.createElement('ul');
  list.setAttribute('role', 'list');

  if (!summary.isValid && summary.invalidFields?.length > 0) {
    summary.invalidFields.forEach((invalidField) => {
      const fieldId = invalidField.fieldId;
      const fieldState = scope?.fields[fieldId];
      let fieldLabel = fieldId;

      if (fieldState?.element) {
        const element = fieldState.element;
        const linkedLabel = element.id ? labelByFor.get(element.id) : null;
        const formGroupLabel = element.closest('.form-group')?.querySelector('label');
        if (linkedLabel) {
          fieldLabel = linkedLabel;
        } else if (formGroupLabel) {
          fieldLabel = formGroupLabel.textContent.trim() || fieldId;
        } else if (element.placeholder) {
          fieldLabel = element.placeholder;
        }
      }

      const li = document.createElement('li');
      const messages = invalidField.failedRules?.length
        ? invalidField.failedRules.map((rule) => rule.message || `${rule.type} failed`).join(', ')
        : 'Invalid';
      li.textContent = `${fieldLabel}: ${messages}`;
      list.appendChild(li);
    });

    const total = document.createElement('li');
    total.textContent = `Total: ${summary.invalidFields.length} error(s) found.`;
    list.appendChild(total);
  } else {
    const li = document.createElement('li');
    li.textContent = 'No validation errors found.';
    list.appendChild(li);
  }

  host.appendChild(list);
}

function resolveActionEngine(ctx) {
  if (ctx && typeof ctx === 'object' && 'engine' in ctx && ctx.engine) {
    return ctx.engine;
  }
  if (ctx && typeof ctx === 'object' && 'elementVisibility' in ctx && 'logger' in ctx) {
    return ctx;
  }
  return interactionsEngine;
}

export const interactionsEngine = {
  scopes: reactive({}),
  elementVisibility: reactive({}),
  originalValues: reactive({}), // For sync-with-restore: stores original values before sync
  allowedScripts: allowedScriptsRegistry,
  _allowedActionHandlers: Object.create(null),
  _debounceTimers: Object.create(null),
  _asyncDebounceTimers: Object.create(null),

  logger: {
    debug: (...args) => console.debug('[InteractionsEngine]', ...args),
    error: (...args) => console.error('[InteractionsEngine]', ...args)
  },

  actionHandlers: {
    showElement(action) {
      const interactionsEngine = resolveActionEngine(this);
      const key = action.elementKey;
      if (!key) return;
      interactionsEngine.elementVisibility[key] = true;
      interactionsEngine.logger.debug('showElement', key);
    },

    hideElement(action) {
      const interactionsEngine = resolveActionEngine(this);
      const key = action.elementKey;
      if (!key) return;
      interactionsEngine.elementVisibility[key] = false;
      interactionsEngine.logger.debug('hideElement', key);
    },

    toggleElementVisibility(action) {
      const interactionsEngine = resolveActionEngine(this);
      const key = action.elementKey;
      if (!key) return;
      const current = !!interactionsEngine.elementVisibility[key];
      interactionsEngine.elementVisibility[key] = !current;
      interactionsEngine.logger.debug(
        'toggleElementVisibility',
        key,
        '->',
        interactionsEngine.elementVisibility[key]
      );
    },

    toggleFieldMeta(action, fieldState, fieldConfig) {
      const interactionsEngine = resolveActionEngine(this);
      if (!fieldState) return;
      const key = action.metaKey;
      if (!key) return;

      const current = !!fieldState.meta[key];
      fieldState.meta[key] = !current;

      interactionsEngine.logger.debug(
        'toggleFieldMeta',
        `${fieldConfig.scope}.${fieldConfig.id}.${key}`,
        '->',
        fieldState.meta[key]
      );
    },

    showBrowserError(action, fieldState, fieldConfig) {
      const interactionsEngine = resolveActionEngine(this);
      const element = fieldState?.element || action.element;
      if (!element || !element.setCustomValidity || !element.reportValidity) return;

      // Get the custom message from the action
      const message = action.message || 'Please fix this field';

      // Store original attributes to restore later
      const originalType = element.type;
      const hadRequired = element.hasAttribute('required');
      const hadDataRequired = element.hasAttribute('data-required');

      try {
        // Remove HTML required attribute to prevent browser's native required validation
        element.removeAttribute('required');

        // Temporarily change type from "email" to "text" to prevent browser's native email validation
        // This ensures our custom message is shown instead of browser's default email validation message
        if (originalType === 'email') {
          element.type = 'text';
        }

        // Clear any existing validation state first
        element.setCustomValidity('');

        // Set our custom message - this will override browser's native validation messages
        // Setting a non-empty custom validity message makes the element invalid
        element.setCustomValidity(message);

        // Trigger browser validation popup with our custom message
        // This will show the custom message we set via setCustomValidity
        element.reportValidity();
      } finally {
        // Restore original input type even if reportValidity throws
        if (originalType === 'email') {
          element.type = originalType;
        }

        // Restore required attribute if it was there (but keep data-required for our validation)
        if (hadRequired) {
          element.setAttribute('required', '');
        }
      }

      interactionsEngine.logger.debug('showBrowserError', { message, originalType, hadRequired });
    },

    setType(action, fieldState, fieldConfig) {
      const interactionsEngine = resolveActionEngine(this);
      const element = fieldState?.element || action.element;
      if (!element || !action.inputType) return;

      element.type = action.inputType;
      interactionsEngine.logger.debug('setType', action.inputType);
    },

    attribute(action, fieldState, fieldConfig) {
      const interactionsEngine = resolveActionEngine(this);
      const element = fieldState?.element || action.element;
      if (!element || !action.attributeName) return;

      const name = action.attributeName;
      const value = action.attributeValue;

      if (action.operation === 'remove') {
        element.removeAttribute(name);
        interactionsEngine.logger.debug('attribute remove', name);
      } else if (action.operation === 'toggle') {
        const hasAttr = element.hasAttribute(name);
        if (hasAttr) {
          element.removeAttribute(name);
        } else {
          if (!canSetAttribute(name, value || '', action.trusted === true)) {
            interactionsEngine.logger.error('attribute toggle rejected: unsafe attribute', name);
            return;
          }
          element.setAttribute(name, value || '');
        }
        interactionsEngine.logger.debug('attribute toggle', name, !hasAttr);
      } else {
        if (!canSetAttribute(name, value || '', action.trusted === true)) {
          interactionsEngine.logger.error('attribute set rejected: unsafe attribute', name);
          return;
        }
        element.setAttribute(name, value || '');
        interactionsEngine.logger.debug('attribute set', name, value);
      }
    },

    pushEvent(action) {
      const interactionsEngine = resolveActionEngine(this);
      if (!action.eventName) return;

      const event = new CustomEvent(action.eventName, {
        detail: action.eventData,
        bubbles: action.bubbles !== false,
        cancelable: action.cancelable !== false
      });

      const target = resolveEventDispatchTarget(action);
      if (!target?.dispatchEvent) {
        interactionsEngine.logger.error('pushEvent: invalid or unresolved target', action.target);
        return;
      }

      target.dispatchEvent(event);
      interactionsEngine.logger.debug('pushEvent', action.eventName, action.eventData);
    },

    script(action) {
      const interactionsEngine = resolveActionEngine(this);
      if (!action?.code && !action?.functionName) return;

      try {
        if (action.code) {
          interactionsEngine.logger.error('script action rejected: inline code execution is disabled');
          return;
        }

        const allowedFn = allowedScriptsRegistry[action.functionName];
        if (typeof allowedFn !== 'function') {
          interactionsEngine.logger.error('script action rejected: function is not allowlisted', action.functionName);
          return;
        }
        allowedFn(...(action.args || []));
        interactionsEngine.logger.debug('script executed', action.functionName);
      } catch (error) {
        interactionsEngine.logger.error('script error', error);
      }
    },

    setHTML(action, fieldState, fieldConfig) {
      const interactionsEngine = resolveActionEngine(this);
      let targetElement = null;

      // Determine target element
      if (action.targetElementKey) {
        targetElement = document.querySelector(`[data-element-key="${action.targetElementKey}"]`);
      } else if (action.targetSelector) {
        targetElement = document.querySelector(action.targetSelector);
      } else if (action.targetFieldId && fieldConfig?.scope) {
        const targetState = interactionsEngine.getFieldState({ scope: fieldConfig.scope, id: action.targetFieldId });
        targetElement = targetState?.element;
      } else {
        // Default to field's own element
        targetElement = fieldState?.element || action.element;
      }

      if (!targetElement) {
        interactionsEngine.logger.error('setHTML: target element not found', action);
        return;
      }

      // Get HTML value - use field value if html not provided but useFieldValue is true
      let htmlValue = action.html;
      if (htmlValue === undefined && action.useFieldValue && fieldState) {
        htmlValue = fieldState.value !== undefined ? String(fieldState.value) : '';
      }

      if (htmlValue === undefined) {
        interactionsEngine.logger.error('setHTML: html value not provided', action);
        return;
      }

      // Apply formatting if provided
      if (action.format && typeof action.format === 'function') {
        htmlValue = action.format(htmlValue);
      } else if (action.format && typeof action.format === 'string') {
        // Simple string formatting (e.g., "{value}" template)
        htmlValue = action.format.replace(/\{value\}/g, htmlValue);
      }

      if (action.trustedHTML === true) targetElement.innerHTML = htmlValue;
      else targetElement.textContent = String(htmlValue);
      interactionsEngine.logger.debug('setHTML', htmlValue?.substring(0, 50));
    },

    sync(action, fieldState, fieldConfig) {
      const interactionsEngine = resolveActionEngine(this);
      if (!fieldState) return;

      const sourceElement = fieldState.element || action.element;
      const sourceValue = fieldState.value !== undefined ? fieldState.value : (sourceElement ? interactionsEngine._getElementValue(sourceElement, '') : '');

      if (sourceValue === undefined || sourceValue === null) return;

      // Get target element
      let targetElement = null;
      let targetState = null;

      if (action.targetElementKey) {
        // Target by element key (for visibility-based elements)
        targetElement = document.querySelector(`[data-element-key="${action.targetElementKey}"]`);
      } else if (action.targetFieldId && fieldConfig?.scope) {
        // Target by field ID (within same scope) - try field state first
        targetState = interactionsEngine.getFieldState({ scope: fieldConfig.scope, id: action.targetFieldId });
        targetElement = targetState?.element;

        // Fallback: if field state not found or element missing, try to find by ID attribute
        // Try common ID patterns: camelCase -> kebab-case, or exact match
        if (!targetElement && action.targetFieldId) {
          const fieldId = action.targetFieldId;
          // Convert camelCase to kebab-case (e.g., shippingStreet -> shipping-street)
          const kebabCase = fieldId.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

          targetElement = document.getElementById(fieldId) ||
            document.getElementById(kebabCase) ||
            document.querySelector(`[data-field-id="${fieldId}"]`) ||
            document.querySelector(`input[id="${fieldId}"], textarea[id="${fieldId}"], select[id="${fieldId}"]`) ||
            document.querySelector(`input[id="${kebabCase}"], textarea[id="${kebabCase}"], select[id="${kebabCase}"]`);
        }
      } else if (action.targetSelector) {
        // Target by CSS selector
        targetElement = document.querySelector(action.targetSelector);
      }

      if (!targetElement) {
        interactionsEngine.logger.error('sync: target element not found', action);
        return;
      }

      const mode = action.mode || 'keep-synced';

      // Handle sync-with-restore: save original value if not already saved
      if (mode === 'sync-with-restore') {
        const restoreKey = action.restoreKey || `${fieldConfig?.scope || 'default'}_${action.targetFieldId || action.targetElementKey || 'unknown'}`;
        // Use a more specific key that includes the target identifier
        const specificKey = `${restoreKey}_${action.targetFieldId || action.targetElementKey || 'unknown'}`;
        if (!interactionsEngine.originalValues[specificKey]) {
          const originalValue = targetState?.value !== undefined
            ? targetState.value
            : interactionsEngine._getElementValue(targetElement, '');

          interactionsEngine.originalValues[specificKey] = originalValue;
          interactionsEngine.logger.debug('sync: saved original value', specificKey, originalValue);
        }
      }

      // Handle sync-once: check if already synced
      if (mode === 'sync-once') {
        const syncKey = `${fieldConfig?.scope || 'default'}_${fieldConfig?.id || 'unknown'}_${action.targetFieldId || action.targetElementKey || 'unknown'}`;
        if (fieldState.meta && fieldState.meta[`synced_${syncKey}`]) {
          return; // Already synced, skip
        }
        if (!fieldState.meta) fieldState.meta = {};
        fieldState.meta[`synced_${syncKey}`] = true;
      }

      // Sync the value
      interactionsEngine._setElementValue(targetElement, sourceValue);

      // Update target field state if it exists
      if (targetState) {
        targetState.value = sourceValue;
        // Trigger validation if target field validates on input
        if (targetState.element && targetState.element.dispatchEvent) {
          targetState.element.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } else if (action.targetFieldId && fieldConfig?.scope) {
        // Get target state if we didn't get it earlier
        const targetFieldState = interactionsEngine.getFieldState({ scope: fieldConfig.scope, id: action.targetFieldId });
        if (targetFieldState) {
          targetFieldState.value = sourceValue;
          if (targetElement && targetElement.dispatchEvent) {
            targetElement.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }

      interactionsEngine.logger.debug('sync', mode, sourceValue);
    },

    restore(action, fieldState, fieldConfig) {
      const interactionsEngine = resolveActionEngine(this);
      // Get target element
      let targetElement = null;
      let targetState = null;

      if (action.targetElementKey) {
        targetElement = document.querySelector(`[data-element-key="${action.targetElementKey}"]`);
      } else if (action.targetFieldId && fieldConfig?.scope) {
        targetState = interactionsEngine.getFieldState({ scope: fieldConfig.scope, id: action.targetFieldId });
        targetElement = targetState?.element;
      } else if (action.targetSelector) {
        targetElement = document.querySelector(action.targetSelector);
      } else if (action.targetFieldId) {
        // Try to find target in same scope as current field
        if (fieldConfig?.scope) {
          targetState = interactionsEngine.getFieldState({ scope: fieldConfig.scope, id: action.targetFieldId });
          targetElement = targetState?.element;
        }
      }

      if (!targetElement) {
        interactionsEngine.logger.error('restore: target element not found', action);
        return;
      }

      // Get restore key - use same logic as sync
      const restoreKey = action.restoreKey || `${fieldConfig?.scope || 'default'}_${action.targetFieldId || action.targetElementKey || 'unknown'}`;
      const specificKey = `${restoreKey}_${action.targetFieldId || action.targetElementKey || 'unknown'}`;
      const originalValue = interactionsEngine.originalValues[specificKey];

      if (originalValue === undefined) {
        interactionsEngine.logger.error('restore: original value not found', specificKey);
        return;
      }

      // Restore original value
      interactionsEngine._setElementValue(targetElement, originalValue);

      // Update target field state if it exists
      if (targetState) {
        targetState.value = originalValue;
        // Trigger validation if target field validates on input
        if (targetElement && targetElement.dispatchEvent) {
          targetElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }

      // Clear the original value after restore so next sync can save new original
      delete interactionsEngine.originalValues[specificKey];

      interactionsEngine.logger.debug('restore', specificKey, originalValue);
    },

    commit(action, fieldState, fieldConfig) {
      const interactionsEngine = resolveActionEngine(this);
      // Get target element
      let targetElement = null;

      if (action.targetElementKey) {
        targetElement = document.querySelector(`[data-element-key="${action.targetElementKey}"]`);
      } else if (action.targetFieldId && fieldConfig?.scope) {
        const targetState = interactionsEngine.getFieldState({ scope: fieldConfig.scope, id: action.targetFieldId });
        targetElement = targetState?.element;
      } else if (action.targetSelector) {
        targetElement = document.querySelector(action.targetSelector);
      }

      if (!targetElement) {
        interactionsEngine.logger.error('commit: target element not found', action);
        return;
      }

      // Get restore key and clear original value (commit is complete)
      // Use same logic as sync/restore to find the specific key
      const restoreKey = action.restoreKey || `${fieldConfig?.scope || 'default'}_${action.targetFieldId || action.targetElementKey || 'unknown'}`;
      const specificKey = `${restoreKey}_${action.targetFieldId || action.targetElementKey || 'unknown'}`;
      delete interactionsEngine.originalValues[specificKey];

      interactionsEngine.logger.debug('commit', specificKey);
    },

    showValidationErrors(action, fieldState, fieldConfig) {
      const interactionsEngine = resolveActionEngine(this);
      // Collect validation errors and render them in an accessible summary region
      if (!action.scopeId) {
        interactionsEngine.logger.error('showValidationErrors: scopeId is required', action);
        return;
      }

      // If fieldIds filter is provided, only validate those fields
      // Otherwise, validate entire scope
      let summary;
      if (action.fieldIds && Array.isArray(action.fieldIds) && action.fieldIds.length > 0) {
        // Validate only specific fields
        const scope = interactionsEngine.scopes[action.scopeId];
        if (!scope) {
          summary = {
            scopeId: action.scopeId,
            isValid: true,
            invalidFields: [],
            firstInvalidField: null
          };
        } else {
          const invalidFields = [];

          for (const fieldId of action.fieldIds) {
            const fieldState = scope.fields[fieldId];
            if (!fieldState) continue;

            const result = validationEngine.validateField(
              fieldState.value,
              fieldState.validationConfig,
              {
                scope: action.scopeId,
                fieldId: fieldId,
                element: fieldState.element,
                getFieldValue: (scope, fieldId) => {
                  const fieldState = interactionsEngine.getFieldState({ scope, id: fieldId });
                  return fieldState ? fieldState.value : null;
                }
              }
            );

            fieldState.isValid = result.isValid;
            fieldState.failedRules = result.failedRules;

            if (!result.isValid) {
              invalidFields.push({
                fieldId,
                failedRules: result.failedRules
              });
            }
          }

          const firstInvalidField = invalidFields.length ? invalidFields[0] : null;
          const isValid = invalidFields.length === 0;

          summary = {
            scopeId: action.scopeId,
            isValid,
            invalidFields,
            firstInvalidField
          };
        }
      } else {
        // Validate entire scope
        summary = interactionsEngine.validateScope(action.scopeId);
      }

      let targetElement = null;

      if (action.targetElementKey) {
        targetElement = document.querySelector(`[data-element-key="${action.targetElementKey}"]`);
      } else if (action.targetSelector) {
        targetElement = document.querySelector(action.targetSelector);
      } else if (action.targetFieldId && fieldConfig?.scope) {
        const targetState = interactionsEngine.getFieldState({ scope: fieldConfig.scope, id: action.targetFieldId });
        targetElement = targetState?.element;
      } else {
        targetElement = document.querySelector('[data-error-display]') ||
          document.querySelector('#validation-errors') ||
          document.querySelector('.validation-errors');
      }

      if (!targetElement) {
        interactionsEngine.logger.error('showValidationErrors: target summary element not found', action);
        return;
      }

      const scope = interactionsEngine.scopes[action.scopeId];
      const labelByFor = new Map(
        Array.from(document.querySelectorAll('label[for]')).map((label) => [
          label.getAttribute('for'),
          (label.textContent || '').trim(),
        ]),
      );

      const summaryHost = resolveValidationSummaryHost(targetElement);
      renderValidationErrorSummary(summaryHost, summary, scope, labelByFor);

      if (action.scroll !== false) {
        summaryHost.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        if (summaryHost.focus) {
          if (!summaryHost.hasAttribute('tabindex')) {
            summaryHost.setAttribute('tabindex', '-1');
          }
          setTimeout(() => {
            summaryHost.focus({ preventScroll: true });
          }, 300);
        }
      }

      interactionsEngine.logger.debug('showValidationErrors', {
        scopeId: action.scopeId,
        errorCount: summary.invalidFields?.length || 0,
        scroll: action.scroll !== false
      });
    }
  },

  registerActionHandler(type, handlerFn) {
    if (!type || typeof handlerFn !== 'function') {
      this.logger.error('registerActionHandler: invalid args', { type, fnType: typeof handlerFn });
      return false;
    }
    this._allowedActionHandlers[type] = handlerFn;
    this.actionHandlers[type] = handlerFn;
    this.logger.debug('registerActionHandler', type);
    return true;
  },

  extendAction(type, handlerFn) {
    if (!this._allowedActionHandlers[type]) {
      this.logger.error(
        'extendAction rejected: register with registerActionHandler during app bootstrap',
        type,
      );
      return false;
    }
    if (typeof handlerFn !== 'function') {
      this.logger.error('extendAction: invalid handler', type);
      return false;
    }
    this._allowedActionHandlers[type] = handlerFn;
    this.actionHandlers[type] = handlerFn;
    this.logger.debug('extendAction', type);
    return true;
  },

  registerScriptFunction(name, handlerFn) {
    if (!registerAllowedScript(name, handlerFn)) {
      this.logger.error('registerScriptFunction: invalid args', { name, type: typeof handlerFn });
      return;
    }
    this.logger.debug('registerScriptFunction', name);
  },

  unregisterScriptFunction(name) {
    unregisterAllowedScript(name);
    this.logger.debug('unregisterScriptFunction', name);
  },

  unregister(fieldConfig) {
    if (!fieldConfig || !fieldConfig.scope || !fieldConfig.id) {
      this.logger.error('unregister: invalid fieldConfig', fieldConfig);
      return;
    }

    const scopeId = fieldConfig.scope;
    const fieldId = fieldConfig.id;
    const scope = this.scopes[scopeId];
    if (!scope || !scope.fields || !scope.fields[fieldId]) return;

    delete scope.fields[fieldId];

    const timerKey = `${scopeId}:${fieldId}`;
    const existingTimer = this._debounceTimers[timerKey];
    if (existingTimer) {
      clearTimeout(existingTimer);
      delete this._debounceTimers[timerKey];
    }
    this._cancelAsyncValidation(scopeId, fieldId);

    this.logger.debug('unregister', scopeId, fieldId);

    if (Object.keys(scope.fields).length === 0) {
      this.clearScope(scopeId);
    }
  },

  clearScope(scopeId) {
    if (!scopeId) return;

    if (this.scopes[scopeId]) {
      delete this.scopes[scopeId];
    }

    const scopePrefix = `${scopeId}:`;
    Object.keys(this._debounceTimers).forEach((timerKey) => {
      if (!timerKey.startsWith(scopePrefix)) return;
      clearTimeout(this._debounceTimers[timerKey]);
      delete this._debounceTimers[timerKey];
    });

    Object.keys(this._asyncDebounceTimers).forEach((timerKey) => {
      if (!timerKey.startsWith(scopePrefix)) return;
      clearTimeout(this._asyncDebounceTimers[timerKey]);
      delete this._asyncDebounceTimers[timerKey];
    });

    const keyPrefixes = [`${scopeId}_`, `${scopeId}:`, `${scopeId}.`];
    Object.keys(this.originalValues).forEach((key) => {
      if (keyPrefixes.some(prefix => key.startsWith(prefix))) {
        delete this.originalValues[key];
      }
    });

    Object.keys(this.elementVisibility).forEach((key) => {
      if (keyPrefixes.some(prefix => key.startsWith(prefix))) {
        delete this.elementVisibility[key];
      }
    });

    this.logger.debug('clearScope', scopeId);
  },

  _assertKnownRuleTypes(validationConfig) {
    const rules = validationConfig?.rules;
    if (!Array.isArray(rules)) return;

    for (const rule of rules) {
      if (!rule?.type || validationsLibrary[rule.type]) continue;
      const message = `[InteractionsEngine] Unknown rule type at register: ${rule.type}`;
      if (import.meta.env?.DEV) {
        throw new Error(message);
      }
      this.logger.error(message);
    }
  },

  register(fieldConfig, initialValue, element) {
    if (!fieldConfig || !fieldConfig.scope || !fieldConfig.id) {
      this.logger.error('register: invalid fieldConfig', fieldConfig);
      return;
    }

    this._assertKnownRuleTypes(fieldConfig.validation);

    const scopeId = fieldConfig.scope;
    const fieldId = fieldConfig.id;

    if (!this.scopes[scopeId]) {
      this.scopes[scopeId] = { fields: {}, submitted: false };
    }

    if (this.scopes[scopeId]?.fields[fieldId]) {
      if (import.meta.env?.DEV) {
        console.warn(`[InteractionsEngine] Field already registered: ${scopeId}.${fieldId}. Call unregister first.`);
      }
      return;
    }

    this.scopes[scopeId].fields[fieldId] = reactive({
      value: initialValue,
      initialValue,
      isValid: true,
      failedRules: [],
      pending: false,
      touched: false,
      dirty: false,
      showError: false,
      dependsOn: this._normalizeDependsOn(fieldConfig.dependsOn),
      validationConfig: fieldConfig.validation || {},
      meta: {},
      element: element || null,
      _validationGeneration: 0
    });

    this._updateFieldUxState(this.scopes[scopeId].fields[fieldId], this.scopes[scopeId]);

    this.logger.debug('register', scopeId, fieldId, {
      initialValue,
      validation: fieldConfig.validation,
      hasElement: !!element
    });

    if (fieldConfig.validateOnMount) {
      this.validateField(fieldConfig);
    }
  },

  getFieldState(fieldConfig) {
    if (!fieldConfig || !fieldConfig.scope || !fieldConfig.id) return null;
    const scope = this.scopes[fieldConfig.scope];
    if (!scope) return null;
    return scope.fields[fieldConfig.id] || null;
  },

  _normalizeDependsOn(dependsOn) {
    if (!dependsOn) return [];
    if (Array.isArray(dependsOn)) return dependsOn.filter(Boolean);
    if (typeof dependsOn === 'string') return [dependsOn];
    return [];
  },

  _buildValidationContext(fieldConfig, state) {
    return {
      scope: fieldConfig.scope,
      fieldId: fieldConfig.id,
      element: state.element,
      getFieldValue: (scope, fieldId) => {
        const fieldState = this.getFieldState({ scope, id: fieldId });
        return fieldState ? fieldState.value : null;
      }
    };
  },

  _cancelAsyncValidation(scopeId, fieldId) {
    const timerKey = `${scopeId}:${fieldId}:async`;
    const existingTimer = this._asyncDebounceTimers[timerKey];
    if (existingTimer) {
      clearTimeout(existingTimer);
      delete this._asyncDebounceTimers[timerKey];
    }

    const state = this.getFieldState({ scope: scopeId, id: fieldId });
    if (state) {
      state.pending = false;
      state._validationGeneration += 1;
    }
  },

  _scheduleAsyncValidation(fieldConfig, state, syncResult) {
    const cfg = state.validationConfig || {};
    const hasAsyncRules = (cfg.rules || []).some((rule) => validationEngine.isAsyncRule(rule));
    if (!hasAsyncRules) {
      this._cancelAsyncValidation(fieldConfig.scope, fieldConfig.id);
      return;
    }

    if (!syncResult.isValid) {
      this._cancelAsyncValidation(fieldConfig.scope, fieldConfig.id);
      return;
    }

    const scopeId = fieldConfig.scope;
    const fieldId = fieldConfig.id;
    const timerKey = `${scopeId}:${fieldId}:async`;
    const debounceMs = Number(fieldConfig.asyncDebounceMs ?? fieldConfig.debounceMs ?? 300);

    if (this._asyncDebounceTimers[timerKey]) {
      clearTimeout(this._asyncDebounceTimers[timerKey]);
    }

    const runAsync = () => {
      delete this._asyncDebounceTimers[timerKey];
      const generation = state._validationGeneration + 1;
      state._validationGeneration = generation;
      state.pending = true;

      const promise = validationEngine.validateAsyncRules(
        state.value,
        state.validationConfig,
        this._buildValidationContext(fieldConfig, state)
      );

      state._asyncValidationPromise = promise;

      promise.then((asyncResult) => {
        if (state._validationGeneration !== generation) return;

        state.pending = false;
        const mergedFailed = [
          ...(syncResult.failedRules || []),
          ...(asyncResult.failedRules || [])
        ];
        state.failedRules = mergedFailed;
        state.isValid = mergedFailed.length === 0;
        this._updateFieldUxState(state, this.scopes[fieldConfig.scope]);

        this.logger.debug('async validation', fieldConfig.scope, fieldConfig.id, {
          isValid: state.isValid,
          failedRules: state.failedRules
        });
      }).catch((err) => {
        if (state._validationGeneration !== generation) return;
        state.pending = false;
        this.logger.error('async validation failed', fieldConfig.scope, fieldConfig.id, err);
      });
    };

    if (Number.isFinite(debounceMs) && debounceMs > 0) {
      this._asyncDebounceTimers[timerKey] = setTimeout(runAsync, debounceMs);
      return;
    }

    runAsync();
  },

  async flushAsyncValidation(fieldConfig) {
    const state = this.getFieldState(fieldConfig);
    if (!state) return;

    const scopeId = fieldConfig.scope;
    const fieldId = fieldConfig.id;
    const timerKey = `${scopeId}:${fieldId}:async`;
    const pendingTimer = this._asyncDebounceTimers[timerKey];

    if (pendingTimer) {
      clearTimeout(pendingTimer);
      delete this._asyncDebounceTimers[timerKey];
      const syncResult = validationEngine.validateField(
        state.value,
        state.validationConfig,
        this._buildValidationContext(fieldConfig, state)
      );
      state.isValid = syncResult.isValid;
      state.failedRules = syncResult.failedRules;
      await new Promise((resolve) => {
        const generation = state._validationGeneration + 1;
        state._validationGeneration = generation;
        state.pending = true;
        validationEngine.validateAsyncRules(
          state.value,
          state.validationConfig,
          this._buildValidationContext(fieldConfig, state)
        ).then((asyncResult) => {
          if (state._validationGeneration !== generation) {
            resolve();
            return;
          }
          state.pending = false;
          const mergedFailed = [
            ...(syncResult.failedRules || []),
            ...(asyncResult.failedRules || [])
          ];
          state.failedRules = mergedFailed;
          state.isValid = mergedFailed.length === 0;
          this._updateFieldUxState(state, this.scopes[fieldConfig.scope]);
          resolve();
        }).catch(() => {
          if (state._validationGeneration === generation) {
            state.pending = false;
          }
          resolve();
        });
      });
      return;
    }

    if (state._asyncValidationPromise) {
      await state._asyncValidationPromise;
    }
  },

  _updateFieldUxState(state, scope) {
    if (!state) return;
    state.dirty = state.value !== state.initialValue;
    const scopeSubmitted = scope?.submitted === true;
    state.showError = (state.touched || scopeSubmitted) && !state.isValid;
  },

  processFieldBlur(fieldConfig) {
    const state = this.getFieldState(fieldConfig);
    if (!state) {
      this.logger.error('processFieldBlur: missing state', fieldConfig?.scope, fieldConfig?.id);
      return;
    }

    state.touched = true;
    const scope = this.scopes[fieldConfig.scope];
    this._updateFieldUxState(state, scope);
  },

  markScopeSubmitted(scopeId) {
    const scope = this.scopes[scopeId];
    if (!scope) return;

    scope.submitted = true;
    for (const fieldId of Object.keys(scope.fields)) {
      this._updateFieldUxState(scope.fields[fieldId], scope);
    }
  },

  _revalidateDependents(fieldConfig) {
    const scopeId = fieldConfig.scope;
    const sourceId = fieldConfig.id;
    const scope = this.scopes[scopeId];
    if (!scope) return;

    for (const fieldId of Object.keys(scope.fields)) {
      if (fieldId === sourceId) continue;
      const depState = scope.fields[fieldId];
      const deps = this._normalizeDependsOn(depState.dependsOn);
      if (!deps.includes(sourceId)) continue;
      this.validateField({ scope: scopeId, id: fieldId });
    }
  },

  _applyValidationResult(state, result, fieldConfig) {
    state.isValid = result.isValid;
    state.failedRules = result.failedRules;
    this._scheduleAsyncValidation(fieldConfig, state, result);
    this._revalidateDependents(fieldConfig);
    this._updateFieldUxState(state, this.scopes[fieldConfig.scope]);
  },

  validateField(fieldConfig) {
    const state = this.getFieldState(fieldConfig);
    if (!state) {
      this.logger.error('validateField: missing state for', fieldConfig.scope, fieldConfig.id);
      return null;
    }

    this._cancelAsyncValidation(fieldConfig.scope, fieldConfig.id);

    const result = validationEngine.validateField(
      state.value,
      state.validationConfig,
      this._buildValidationContext(fieldConfig, state)
    );

    this._applyValidationResult(state, result, fieldConfig);

    this.logger.debug('validateField', fieldConfig.scope, fieldConfig.id, {
      value: state.value,
      isValid: state.isValid,
      failedRules: state.failedRules
    });

    return result;
  },

  validateScope(scopeId) {
    const scope = this.scopes[scopeId];
    if (!scope) {
      if (import.meta.env?.DEV) {
        console.error('[interactionsEngine] validateScope: scope not registered:', scopeId);
      }
      return {
        scopeId,
        isValid: false,
        invalidFields: [],
        firstInvalidField: null,
        scopeError: 'SCOPE_NOT_REGISTERED',
      };
    }

    const invalidFields = [];

    for (const fieldId of Object.keys(scope.fields)) {
      const fieldState = scope.fields[fieldId];
      const result = validationEngine.validateField(
        fieldState.value,
        fieldState.validationConfig,
        {
          scope: scopeId,
          fieldId: fieldId,
          element: fieldState.element,
          getFieldValue: (scope, fieldId) => {
            const fieldState = this.getFieldState({ scope, id: fieldId });
            return fieldState ? fieldState.value : null;
          }
        }
      );

      fieldState.isValid = result.isValid;
      fieldState.failedRules = result.failedRules;
      this._updateFieldUxState(fieldState, scope);

      if (!result.isValid) {
        invalidFields.push({
          fieldId,
          failedRules: result.failedRules
        });
      }
    }

    const firstInvalidField = invalidFields.length ? invalidFields[0] : null;
    const isValid = invalidFields.length === 0;

    return {
      scopeId,
      isValid,
      invalidFields,
      firstInvalidField
    };
  },

  scopeHasNoBlockingInvalids(scopeId) {
    // Scope-wide guard rule
    // Checks if there are any "blocking" invalid fields in the scope
    // Blocking = invalid AND (required OR has user data)
    // Use for: ensuring optional empty fields don't block flow
    const scope = this.scopes[scopeId];
    if (!scope) {
      return {
        hasNoBlockingInvalids: true,
        blockingFields: [],
        scopeId
      };
    }

    const blockingFields = [];

    for (const fieldId of Object.keys(scope.fields)) {
      const fieldState = scope.fields[fieldId];

      if (fieldState.dirty) {
        const result = validationEngine.validateField(
          fieldState.value,
          fieldState.validationConfig,
          {
            scope: scopeId,
            fieldId,
            element: fieldState.element,
            getFieldValue: (scope, id) => {
              const depState = this.getFieldState({ scope, id });
              return depState ? depState.value : null;
            },
          },
        );
        fieldState.isValid = result.isValid;
        fieldState.failedRules = result.failedRules;
      }

      if (!fieldState.isValid) {
        const hasHTMLRequired = fieldState.element && fieldState.element.hasAttribute &&
          fieldState.element.hasAttribute('required');
        const hasPseudoRequired = fieldState.element && fieldState.element.hasAttribute &&
          fieldState.element.hasAttribute('data-required') &&
          fieldState.element.getAttribute('data-required') === 'true';
        const isRequired = fieldState.validationConfig.required || hasHTMLRequired || hasPseudoRequired;

        const hasUserData = this._fieldHasUserData(fieldState.value);

        // Field is blocking if it's invalid AND (required OR has user data)
        if (isRequired || hasUserData) {
          blockingFields.push({
            fieldId,
            failedRules: fieldState.failedRules,
            reason: isRequired ? 'required' : 'has-user-data'
          });
        }
      }
    }

    return {
      hasNoBlockingInvalids: blockingFields.length === 0,
      blockingFields,
      scopeId
    };
  },

  _fieldHasUserData(value) {
    // Helper to determine if a field has user data
    // Empty/untouched fields should return false
    if (value === null || value === undefined) return false;
    if (value === '') return false;
    if (value === false) return false; // Unchecked checkbox
    if (Array.isArray(value) && value.length === 0) return false;

    // If we got here, the field has some data
    return true;
  },

  _getElementValue(element, fallbackValue) {
    // Helper to get value from element (for sync functionality)
    if (!element) return fallbackValue;

    const tagName = element.tagName ? element.tagName.toLowerCase() : '';
    const type = element.type ? element.type.toLowerCase() : '';

    // For checkbox or radio - use checked property
    if (type === 'checkbox' || type === 'radio') {
      return element.checked;
    }

    // For input, textarea, select elements
    if (element.value !== undefined) {
      return element.value;
    }

    // For div, span, p and other content elements
    if (element.textContent !== undefined) {
      return element.textContent;
    }

    // Fallback to provided value
    return fallbackValue;
  },

  _setElementValue(element, value) {
    // Helper to set value on element (for sync functionality)
    if (!element) return;

    const tagName = element.tagName ? element.tagName.toLowerCase() : '';
    const type = element.type ? element.type.toLowerCase() : '';

    // For checkbox or radio - set checked property
    if (type === 'checkbox' || type === 'radio') {
      element.checked = !!value;
      // Trigger change event for Vue reactivity
      if (element.dispatchEvent) {
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }

    // For input, textarea, select elements
    if (element.value !== undefined) {
      element.value = value;
      // Trigger input event for Vue reactivity
      if (element.dispatchEvent) {
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return;
    }

    // For div, span, p and other content elements - set textContent or innerHTML
    if (element.textContent !== undefined) {
      element.textContent = value;
      return;
    }
  },

  jumpToFieldPlaceholder(scopeId, fieldId) {
    // TODO: implement real DOM scrolling/focus.
    // For now: this is a stub so another layer can hook into it.
    this.logger.debug('jumpToFieldPlaceholder called for', scopeId, fieldId);
  },

  getInputType(fieldConfig, baseType) {
    if (!fieldConfig || !fieldConfig.ui || fieldConfig.ui.dynamicType !== 'password') {
      return baseType;
    }

    const state = this.getFieldState(fieldConfig);
    if (!state) return baseType;

    const metaKey = fieldConfig.ui.visibilityMetaKey || 'passwordVisible';
    const visible = !!state.meta[metaKey];

    return visible ? 'text' : baseType;
  },

  runInteractions(actions, fieldConfig) {
    if (!actions || !actions.length) return;

    const state = fieldConfig ? this.getFieldState(fieldConfig) : null;

    for (const action of actions) {
      const type = resolveActionType(action);
      if (!type) {
        this.logger.error('runInteractions: missing action type', action);
        continue;
      }
      const handler = this.actionHandlers[type];
      if (!handler) {
        this.logger.error('runInteractions: unknown action type', type, action);
        continue;
      }
      handler.call(this, action, state, fieldConfig);
    }
  },

  processFieldChange(fieldConfig, newValue) {
    const state = this.getFieldState(fieldConfig);
    if (!state) {
      this.logger.error('processFieldChange: missing state', fieldConfig.scope, fieldConfig.id);
      return;
    }

    state.value = newValue;
    this._updateFieldUxState(state, this.scopes[fieldConfig.scope]);

    const runPipeline = () => {
      const validateOnInput = fieldConfig.validateOnInput !== false;
      const inputEvents = (fieldConfig.events && fieldConfig.events.input) || {};

      if (inputEvents.onChange) {
        this.runInteractions(inputEvents.onChange, fieldConfig);
      }

      if (validateOnInput) {
        this._cancelAsyncValidation(fieldConfig.scope, fieldConfig.id);

        const result = validationEngine.validateField(
          state.value,
          state.validationConfig,
          this._buildValidationContext(fieldConfig, state)
        );

        this._applyValidationResult(state, result, fieldConfig);

        this.logger.debug('processFieldChange validation', fieldConfig.scope, fieldConfig.id, {
          value: state.value,
          isValid: state.isValid,
          failedRules: state.failedRules
        });

        if (state.isValid && inputEvents.onValid) {
          this.runInteractions(inputEvents.onValid, fieldConfig);
        }

        if (!state.isValid && inputEvents.onInvalid) {
          this.runInteractions(inputEvents.onInvalid, fieldConfig);
        }
      }
    };

    const debounceMs = Number(fieldConfig?.debounceMs);
    if (Number.isFinite(debounceMs) && debounceMs > 0) {
      const timerKey = `${fieldConfig.scope}:${fieldConfig.id}`;
      const existingTimer = this._debounceTimers[timerKey];
      if (existingTimer) clearTimeout(existingTimer);
      this._debounceTimers[timerKey] = setTimeout(() => {
        delete this._debounceTimers[timerKey];
        runPipeline();
      }, debounceMs);
      return;
    }

    runPipeline();
  }
};

// Structural sanity

// Exported as a singleton object – consistent with how you want to import/use it.

// Uses reactive({}) for scopes and elementVisibility, so you can directly bind things like:
// v-if="interactionsEngine.elementVisibility['myBox']"
// read interactionsEngine.scopes[scope].fields[fieldId].isValid in debug UIs.
// No composables, no lifecycle, no watchers: matches what you asked.

// Action handlers
// showElement / hideElement / toggleElementVisibility use elementKey and update elementVisibility. Naming and behaviour are clear.
// toggleFieldMeta uses (action, fieldState, fieldConfig) and is called from runInteractions as handler(action, state, fieldConfig) – parameter order is correct.

// Validation + change pipeline
// register() sets up a reactive field state and optionally runs validateField if validateOnMount is true.
// processFieldChange() is the only thing you need to call from @input / @change for any field type:
// It updates value.

// Validates.

// Applies events.input.onChange, onValid, onInvalid in that order.

// This is exactly the “engine doesn’t care what DOM type it is” design.

// Any actual problems?

// No syntax or Vue-reactivity problems. The only things to be aware of / consider:

// No unregister yet

// If you mount/unmount dynamic fields a lot, scopes will keep entries unless you add a unregister(fieldConfig) or clearScope(scopeId).

// For your use (large forms that don’t constantly re-add fields), this is probably fine for now.

// You must manually call register

// Somewhere (typically when you build your form config) you must call:

// interactionsEngine.register(fieldConfig, initialValue);


// If you forget, processFieldChange will log missing state errors.

// Components still decide the value

// For checkbox/radio/select/textarea you need to compute newValue correctly in the component:

// checkbox → event.target.checked

// radio → event.target.value

// select[multiple] → Array.from(event.target.selectedOptions).map(o => o.value)

// textarea → event.target.value

// Then pass that value into processFieldChange(fieldConfig, newValue).

// UI binding and error display

// Error messages are available at:

// interactionsEngine.scopes[scopeId].fields[fieldId].failedRules


// You can show them in your templates like:

// <ul v-if="fieldState && !fieldState.isValid">
//   <li v-for="rule in fieldState.failedRules" :key="rule.type">
//     {{ rule.message }}
//   </li>
// </ul>


// Password eye / generic click interactions

// You’ve removed any special “right icon” function, which is fine.

// In your component you’d do something like:

// @click="interactionsEngine.runInteractions(
//   [{ type: 'toggleFieldMeta', metaKey: 'passwordVisible' }],
//   fieldConfig
// )"


// And the type of the input comes from:

// :type="interactionsEngine.getInputType(fieldConfig, type)"

// Summary

// All three files are syntactically and structurally sound.

// The separation of concerns is clean:

// validationsLibrary → raw rule functions

// validationEngine → applies rules, returns { isValid, failedRules }

// interactionsEngine → field state, events, and declarative interactions

// The engine is generic enough for text, password, checkbox, radio, select, textarea as long as:

// you register each field once

// you call processFieldChange(fieldConfig, newValue) with the correct newValue per DOM type

// you drive show/hide via elementVisibility keys in templates.

// If you want next, I can show exact wiring for:

// one password field with an eye icon (using toggleFieldMeta)

// one checkbox that’s required

// one select that shows/hides a container via showElement / hideElement in events.input.
