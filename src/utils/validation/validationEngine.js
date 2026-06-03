import { validationsLibrary } from './validationsLibrary.js';

function failUnknownRule(ruleType) {
  const message = `[validationEngine] Unknown rule type: ${ruleType}`;
  if (import.meta.env?.DEV) {
    console.error(message);
    throw new Error(message);
  }
  console.error(message);
}

export const validationEngine = {
  _hasRequiredAttr(element) {
    // Check if element has HTML required attribute
    if (!element) return false;
    return element.hasAttribute && element.hasAttribute('required');
  },

  _isPseudoRequired(element) {
    // Check if element has data-required attribute (pseudo-required)
    if (!element) return false;
    return element.hasAttribute && element.hasAttribute('data-required') &&
      element.getAttribute('data-required') === 'true';
  },

  _getElementValue(element, fallbackValue) {
    // Get value from element - handles both inputs and divs
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

  _validateWithRequiredFlag(element, value, validationConfig) {
    // Handle HTML required attribute and pseudo-required (data-required="true") validation
    const hasRequired = this._hasRequiredAttr(element);
    const hasPseudoRequired = this._isPseudoRequired(element);

    // Check both HTML required and pseudo-required
    if (!hasRequired && !hasPseudoRequired) return null; // No required attribute, continue with normal validation

    // Get the actual value from element (handles divs too)
    const actualValue = this._getElementValue(element, value);

    // Check if element is "empty" based on type
    const isEmpty = this._isElementEmpty(element, actualValue);

    if (isEmpty) {
      return {
        isValid: false,
        failedRules: [
          {
            type: 'required',
            message: validationConfig.requiredMessage || 'This field is required.'
          }
        ]
      };
    }

    return null; // Not empty, continue with normal validation
  },

  _isElementEmpty(element, value) {
    // Determine if element is empty based on its type
    if (value === null || value === undefined || value === '' || value === false) return true;

    if (!element) {
      // No element reference, just check value
      return false;
    }

    const tagName = element.tagName ? element.tagName.toLowerCase() : '';
    const type = element.type ? element.type.toLowerCase() : '';

    // Checkbox or radio
    if (type === 'checkbox' || type === 'radio') {
      return !element.checked;
    }

    // File input
    if (type === 'file') {
      return !element.files || element.files.length === 0;
    }

    // Select
    if (tagName === 'select') {
      return value === '' || value === null || value === undefined;
    }

    // Textarea or text input
    if (tagName === 'textarea' || tagName === 'input') {
      return typeof value === 'string' && value.trim() === '';
    }

    // Div or other content elements
    if (tagName === 'div' || tagName === 'span' || tagName === 'p') {
      return typeof value === 'string' && value.trim() === '';
    }

    // Default: check if value is empty
    return typeof value === 'string' ? value.trim() === '' : !value;
  },

  isAsyncRule(rule) {
    return !!(rule && rule.async);
  },

  _resolveRuleResult(result) {
    if (result != null && typeof result.then === 'function') {
      return result.then((value) => !!value);
    }
    return Promise.resolve(!!result);
  },

  _runRuleList(actualValue, rules, ctx, { asyncOnly = false, syncOnly = false } = {}) {
    const failedRules = [];

    for (const rule of rules) {
      const isAsync = this.isAsyncRule(rule);
      if (syncOnly && isAsync) continue;
      if (asyncOnly && !isAsync) continue;

      const fn = validationsLibrary[rule.type];
      if (!fn) {
        failUnknownRule(rule.type);
        failedRules.push({
          type: rule.type,
          message: rule.message || `Unknown rule: ${rule.type}`
        });
        continue;
      }

      const ok = fn(actualValue, rule.param, ctx);
      if (!ok) {
        failedRules.push({
          type: rule.type,
          param: rule.param,
          message: rule.message || `${rule.type} failed`
        });
      }
    }

    return failedRules;
  },

  async _runAsyncRuleList(actualValue, rules, ctx) {
    const failedRules = [];

    for (const rule of rules) {
      if (!this.isAsyncRule(rule)) continue;

      const fn = validationsLibrary[rule.type];
      if (!fn) {
        failUnknownRule(rule.type);
        failedRules.push({
          type: rule.type,
          message: rule.message || `Unknown rule: ${rule.type}`
        });
        continue;
      }

      const result = fn(actualValue, rule.param, ctx);
      const ok = await this._resolveRuleResult(result);
      if (!ok) {
        failedRules.push({
          type: rule.type,
          param: rule.param,
          message: rule.message || `${rule.type} failed`
        });
      }
    }

    return failedRules;
  },

  _validateRequired(value, validationConfig, context) {
    const cfg = validationConfig || {};
    const required = !!cfg.required;
    const ctx = context || {};
    const element = ctx.element || null;

    const requiredResult = this._validateWithRequiredFlag(element, value, cfg);
    if (requiredResult) {
      return requiredResult;
    }

    const isCheckbox = element && element.type && element.type.toLowerCase() === 'checkbox';
    const isEmpty = value === '' || value === null || value === undefined || (isCheckbox && value === false);

    if (required && isEmpty) {
      return {
        isValid: false,
        failedRules: [
          {
            type: 'required',
            message: cfg.requiredMessage || 'This field is required.'
          }
        ]
      };
    }

    return null;
  },

  validateField(value, validationConfig, context) {
    const cfg = validationConfig || {};
    const rules = cfg.rules || [];
    const ctx = context || {};
    const element = ctx.element || null;

    const requiredFailure = this._validateRequired(value, cfg, ctx);
    if (requiredFailure) {
      return requiredFailure;
    }

    const actualValue = element ? this._getElementValue(element, value) : value;
    const failedRules = this._runRuleList(actualValue, rules, ctx, { syncOnly: true });

    return {
      isValid: failedRules.length === 0,
      failedRules
    };
  },

  async validateAsyncRules(value, validationConfig, context) {
    const cfg = validationConfig || {};
    const rules = cfg.rules || [];
    const ctx = context || {};
    const element = ctx.element || null;

    const requiredFailure = this._validateRequired(value, cfg, ctx);
    if (requiredFailure) {
      return requiredFailure;
    }

    const actualValue = element ? this._getElementValue(element, value) : value;
    const failedRules = await this._runAsyncRuleList(actualValue, rules, ctx);

    return {
      isValid: failedRules.length === 0,
      failedRules
    };
  }
};

// Also fine. Observations:

// ctx is passed to rule functions; you're not using it yet, but that's good for future (e.g. cross-field validations).

// Required check is simple and centralised.

// failedRules shape is consistent with what we'll surface in the UI.

// No runtime issues here.