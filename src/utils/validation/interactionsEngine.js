import { reactive } from 'vue';
import { validationEngine } from './validationEngine.js';

export const interactionsEngine = {
  scopes: reactive({}),
  elementVisibility: reactive({}),
  originalValues: reactive({}), // For sync-with-restore: stores original values before sync

  logger: {
    debug: (...args) => console.debug('[InteractionsEngine]', ...args),
    error: (...args) => console.error('[InteractionsEngine]', ...args)
  },

  actionHandlers: {
    showElement(action) {
      const key = action.elementKey;
      if (!key) return;
      interactionsEngine.elementVisibility[key] = true;
      interactionsEngine.logger.debug('showElement', key);
    },

    hideElement(action) {
      const key = action.elementKey;
      if (!key) return;
      interactionsEngine.elementVisibility[key] = false;
      interactionsEngine.logger.debug('hideElement', key);
    },

    toggleElementVisibility(action) {
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
      const element = fieldState?.element || action.element;
      if (!element || !element.setCustomValidity || !element.reportValidity) return;

      // Get the custom message from the action
      const message = action.message || 'Please fix this field';

      // Store original attributes to restore later
      const originalType = element.type;
      const hadRequired = element.hasAttribute('required');
      const hadDataRequired = element.hasAttribute('data-required');

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

      // Restore original input type after showing the error
      if (originalType === 'email') {
        element.type = originalType;
      }

      // Restore required attribute if it was there (but keep data-required for our validation)
      if (hadRequired) {
        element.setAttribute('required', '');
      }

      interactionsEngine.logger.debug('showBrowserError', { message, originalType, hadRequired });
    },

    setType(action, fieldState, fieldConfig) {
      const element = fieldState?.element || action.element;
      if (!element || !action.inputType) return;

      element.type = action.inputType;
      interactionsEngine.logger.debug('setType', action.inputType);
    },

    attribute(action, fieldState, fieldConfig) {
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
          element.setAttribute(name, value || '');
        }
        interactionsEngine.logger.debug('attribute toggle', name, !hasAttr);
      } else {
        element.setAttribute(name, value || '');
        interactionsEngine.logger.debug('attribute set', name, value);
      }
    },

    pushEvent(action) {
      if (!action.eventName) return;

      const event = new CustomEvent(action.eventName, {
        detail: action.eventData,
        bubbles: action.bubbles !== false,
        cancelable: action.cancelable !== false
      });

      const target = action.target === 'window' || !action.target
        ? window
        : action.target === 'document'
          ? document
          : action.target;

      target.dispatchEvent(event);
      interactionsEngine.logger.debug('pushEvent', action.eventName, action.eventData);
    },

    script(action) {
      if (!action.code && !action.functionName) return;

      try {
        if (action.code) {
          // eslint-disable-next-line no-eval
          eval(action.code);
        } else if (action.functionName && typeof window[action.functionName] === 'function') {
          window[action.functionName](...action.args || []);
        }
        interactionsEngine.logger.debug('script executed', action.functionName || 'code');
      } catch (error) {
        interactionsEngine.logger.error('script error', error);
      }
    },

    setHTML(action, fieldState, fieldConfig) {
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

      targetElement.innerHTML = htmlValue;
      interactionsEngine.logger.debug('setHTML', htmlValue?.substring(0, 50));
    },

    sync(action, fieldState, fieldConfig) {
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
      // Collect all validation errors and display them in a textarea
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

      // Find target textarea element
      let targetElement = null;

      if (action.targetElementKey) {
        targetElement = document.querySelector(`[data-element-key="${action.targetElementKey}"]`);
      } else if (action.targetSelector) {
        targetElement = document.querySelector(action.targetSelector);
      } else if (action.targetFieldId && fieldConfig?.scope) {
        const targetState = interactionsEngine.getFieldState({ scope: fieldConfig.scope, id: action.targetFieldId });
        targetElement = targetState?.element;
      } else {
        // Default: try to find by common patterns
        targetElement = document.querySelector('textarea[data-error-display]') ||
          document.querySelector('#validation-errors') ||
          document.querySelector('.validation-errors');
      }

      if (!targetElement) {
        interactionsEngine.logger.error('showValidationErrors: target textarea not found', action);
        return;
      }

      // Build error messages
      let errorText = '';

      if (!summary.isValid && summary.invalidFields && summary.invalidFields.length > 0) {
        // Get field labels/names if available
        const scope = interactionsEngine.scopes[action.scopeId];

        errorText = 'Validation Errors:\n\n';

        summary.invalidFields.forEach((invalidField, index) => {
          const fieldId = invalidField.fieldId;
          const fieldState = scope?.fields[fieldId];

          // Try to get field label from element or use fieldId
          let fieldLabel = fieldId;
          if (fieldState?.element) {
            // Try to find label associated with the field
            const element = fieldState.element;
            const labelElement = element.id
              ? document.querySelector(`label[for="${element.id}"]`)
              : element.closest('.form-group')?.querySelector('label');

            if (labelElement) {
              fieldLabel = labelElement.textContent.trim() || fieldId;
            } else if (element.placeholder) {
              fieldLabel = element.placeholder;
            }
          }

          // Format: "1. Field Label: Error message"
          errorText += `${index + 1}. ${fieldLabel}: `;

          if (invalidField.failedRules && invalidField.failedRules.length > 0) {
            const errorMessages = invalidField.failedRules.map(rule => rule.message || `${rule.type} failed`).join(', ');
            errorText += errorMessages;
          } else {
            errorText += 'Invalid';
          }

          errorText += '\n';
        });

        // Add summary at the end
        errorText += `\nTotal: ${summary.invalidFields.length} error(s) found.`;
      } else {
        errorText = 'No validation errors found.';
      }

      // Set textarea value
      if (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') {
        targetElement.value = errorText;
        // Trigger input event for Vue reactivity
        if (targetElement.dispatchEvent) {
          targetElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } else {
        // For other elements, set textContent or innerHTML
        targetElement.textContent = errorText;
      }

      // Optionally scroll to the textarea
      if (action.scroll !== false) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // Also focus the textarea
        if (targetElement.focus && (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT')) {
          setTimeout(() => {
            targetElement.focus();
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

  extendAction(type, handlerFn) {
    this.actionHandlers[type] = handlerFn;
    this.logger.debug('extendAction', type);
  },

  register(fieldConfig, initialValue, element) {
    if (!fieldConfig || !fieldConfig.scope || !fieldConfig.id) {
      this.logger.error('register: invalid fieldConfig', fieldConfig);
      return;
    }

    const scopeId = fieldConfig.scope;
    const fieldId = fieldConfig.id;

    if (!this.scopes[scopeId]) {
      this.scopes[scopeId] = { fields: {} };
    }

    this.scopes[scopeId].fields[fieldId] = reactive({
      value: initialValue,
      isValid: true,
      failedRules: [],
      validationConfig: fieldConfig.validation || {},
      meta: {},
      element: element || null
    });

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

  validateField(fieldConfig) {
    const state = this.getFieldState(fieldConfig);
    if (!state) {
      this.logger.error('validateField: missing state for', fieldConfig.scope, fieldConfig.id);
      return null;
    }

    const result = validationEngine.validateField(
      state.value,
      state.validationConfig,
      {
        scope: fieldConfig.scope,
        fieldId: fieldConfig.id,
        element: state.element,
        getFieldValue: (scope, fieldId) => {
          const fieldState = this.getFieldState({ scope, id: fieldId });
          return fieldState ? fieldState.value : null;
        }
      }
    );

    state.isValid = result.isValid;
    state.failedRules = result.failedRules;

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
      return {
        scopeId,
        isValid: true,
        invalidFields: [],
        firstInvalidField: null
      };
    }

    const invalidFields = [];

    for (const fieldId in scope.fields) {
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

    for (const fieldId in scope.fields) {
      const fieldState = scope.fields[fieldId];

      // Validate the field first
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

      // Update field state
      fieldState.isValid = result.isValid;
      fieldState.failedRules = result.failedRules;

      // Check if this field is blocking
      if (!result.isValid) {
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
            failedRules: result.failedRules,
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
    console.log('[InteractionsEngine] jumpToFieldPlaceholder called for', scopeId, fieldId);
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
      const handler = this.actionHandlers[action.type];
      if (!handler) {
        this.logger.error('runInteractions: unknown action type', action.type, action);
        continue;
      }
      handler(action, state, fieldConfig);
    }
  },

  processFieldChange(fieldConfig, newValue) {
    const state = this.getFieldState(fieldConfig);
    if (!state) {
      this.logger.error('processFieldChange: missing state', fieldConfig.scope, fieldConfig.id);
      return;
    }

    state.value = newValue;

    const validateOnInput = fieldConfig.validateOnInput !== false;

    if (validateOnInput) {
      const result = validationEngine.validateField(
        newValue,
        state.validationConfig,
        {
          scope: fieldConfig.scope,
          fieldId: fieldConfig.id,
          element: state.element,
          getFieldValue: (scope, fieldId) => {
            const fieldState = this.getFieldState({ scope, id: fieldId });
            return fieldState ? fieldState.value : null;
          }
        }
      );

      state.isValid = result.isValid;
      state.failedRules = result.failedRules;

      this.logger.debug('processFieldChange validation', fieldConfig.scope, fieldConfig.id, {
        value: newValue,
        isValid: state.isValid,
        failedRules: state.failedRules
      });
    }

    const inputEvents = (fieldConfig.events && fieldConfig.events.input) || {};

    if (inputEvents.onChange) {
      this.runInteractions(inputEvents.onChange, fieldConfig);
    }

    if (validateOnInput) {
      if (state.isValid && inputEvents.onValid) {
        this.runInteractions(inputEvents.onValid, fieldConfig);
      }

      if (!state.isValid && inputEvents.onInvalid) {
        this.runInteractions(inputEvents.onInvalid, fieldConfig);
      }
    }
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
