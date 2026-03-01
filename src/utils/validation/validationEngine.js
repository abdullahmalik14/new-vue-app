import { validationsLibrary } from './validationsLibrary.js';

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
    if (value === null || value === undefined || value === '') return true;

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

  validateField(value, validationConfig, context) {
    const cfg = validationConfig || {};
    const required = !!cfg.required;
    const rules = cfg.rules || [];
    const ctx = context || {};
    const element = ctx.element || null;

    // First, check HTML required attribute if element is provided
    const requiredResult = this._validateWithRequiredFlag(element, value, cfg);
    if (requiredResult) {
      return requiredResult;
    }

    // Then check config-based required (for backwards compatibility)
    // For checkboxes, also check if value is false
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

    // Get actual value from element if it's a div/content element
    const actualValue = element ? this._getElementValue(element, value) : value;

    const failedRules = [];

    for (const rule of rules) {
      const fn = validationsLibrary[rule.type];
      if (!fn) {
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