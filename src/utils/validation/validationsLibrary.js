export const validationsLibrary = {
  custom(value, param, ctx) {
    // Custom validation function
    // param: function(value, ctx) -> boolean
    if (typeof param === 'function') {
      return param(value, ctx);
    }
    return true;
  },

  required(value) {
    return value !== null && value !== undefined && value !== '';
  },

  minLength(value, param) {
    if (typeof value !== 'string') return false;
    return value.length >= (param || 0);
  },

  maxLength(value, param) {
    if (typeof value !== 'string') return false;
    return value.length <= (param || Infinity);
  },

  isEmail(value) {
    if (typeof value !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  isSecurePassword(value) {
    // Full password rule: at least 8 chars, with upper, lower, and number
    // Use for: single rule with one error message
    if (typeof value !== 'string') return false;
    return (
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[^A-Za-z0-9]/.test(value) &&
      value.length >= 8
    );
  },

  hasUpper(value) {
    // Checks there is at least one uppercase letter
    if (typeof value !== 'string') return false;
    return /[A-Z]/.test(value);
  },

  hasLower(value) {
    // Checks there is at least one lowercase letter
    if (typeof value !== 'string') return false;
    return /[a-z]/.test(value);
  },

  hasNumber(value) {
    // Checks there is at least one digit
    if (typeof value !== 'string') return false;
    return /[0-9]/.test(value);
  },

  hasSpecial(value) {
    // Checks there is at least one special character
    if (typeof value !== 'string') return false;
    return /[^A-Za-z0-9]/.test(value);
  },

  isSecurePasswordComplexityCheck(value) {
    // Checks character mix (upper, lower, number) without enforcing length
    // Use for: when length is enforced separately via minChar/maxChar
    if (typeof value !== 'string') return false;
    return (
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value)
    );
  },

  matchValue(value, param, ctx) {
    if (!ctx || !ctx.getFieldValue || !param) return false;
    // Don't validate if confirm password field is empty
    if (!value || value === '') return true;
    const otherValue = ctx.getFieldValue(ctx.scope, param);
    return value === otherValue;
  },

  hasContent(value) {
    // For pseudo-required and div content validation
    // Works with both input values and textContent from divs
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return true;
  },

  minChar(value, param) {
    // Alias to minLength for pseudo-required scenarios
    if (typeof value !== 'string') return false;
    return value.length >= (param || 0);
  },

  maxChar(value, param) {
    // Maximum character length
    // Use for: username limits, free-text field limits, truncation rules
    if (typeof value !== 'string') return false;
    return value.length <= (param || Infinity);
  },

  nonNegative(value) {
    // Value must be a number >= 0
    // Use for: counts, prices, quantities
    const num = Number(value);
    if (isNaN(num)) return false;
    return num >= 0;
  },

  minNum(value, param) {
    // Value must be >= numeric param
    // Use for: minimum age, minimum price, minimum quantity
    const num = Number(value);
    if (isNaN(num)) return false;
    const min = Number(param);
    if (isNaN(min)) return false;
    return num >= min;
  },

  maxNum(value, param) {
    // Value must be <= numeric param
    // Use for: maximum quantity, upper bounds (e.g. discount <= 100)
    const num = Number(value);
    if (isNaN(num)) return false;
    const max = Number(param);
    if (isNaN(max)) return false;
    return num <= max;
  },

  isUrl(value) {
    // Basic URL format check
    // Use for: website links, social profiles, webhook URLs
    // Requires proper protocol format: http:// or https://
    // Requires valid hostname (must contain at least one dot for domain structure)
    if (typeof value !== 'string') return false;
    // First check: must start with http:// or https://
    if (!/^https?:\/\//.test(value)) return false;
    try {
      const url = new URL(value);
      // Check protocol
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
      // Check hostname: must have at least one dot (e.g., example.com, sub.example.com)
      // This ensures it's a proper domain structure, not just a single character
      if (!url.hostname || !url.hostname.includes('.')) return false;
      // Hostname should have at least 3 characters (e.g., "a.b") and contain valid domain structure
      if (url.hostname.length < 3) return false;
      return true;
    } catch {
      return false;
    }
  },

  isNumeric(value) {
    // String must be numeric (int/float), optional minus sign or decimals
    // Use for: age, quantity, price (numeric string without formatting)
    if (typeof value !== 'string' && typeof value !== 'number') return false;
    const str = String(value).trim();
    if (str === '') return false;
    // Allow optional minus sign, digits, and optional decimal point with digits
    return /^-?\d+(\.\d+)?$/.test(str);
  },

  isSelect(value) {
    // For select validation - ensures a selection has been made
    // Empty string, null, undefined, or placeholder values fail
    if (value === null || value === undefined || value === '') return false;
    // Common placeholder values
    if (value === '0' || value === '-1' || value === 'placeholder') return false;
    return true;
  },

  isCheck(value) {
    // Checks that a single checkbox is checked
    // Use for: "I agree to terms", mandatory single checkboxes
    return value === true;
  },

  isMultiCheck(value, param, ctx) {
    // Checks that at least N checkboxes in a group are checked
    // param: minimum number of checkboxes that must be checked
    // ctx.element should be a container with checkboxes
    if (!ctx || !ctx.element) return false;

    const container = ctx.element;
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const minRequired = param || 1;

    return checkedCount >= minRequired;
  },

  isRadioCheck(value, param, ctx) {
    // Checks that some radio in a given group is checked
    // param: radio group name
    // Use for: Gender, Contact method, Payment type
    if (!ctx || !param) return false;

    // If element is provided, search within document
    if (ctx.element) {
      const radios = document.querySelectorAll(`input[type="radio"][name="${param}"]`);
      return Array.from(radios).some(radio => radio.checked);
    }

    // Fallback: check if value is truthy (radio was selected)
    return value !== null && value !== undefined && value !== '';
  },

  isMultiCheckExact(value, param, ctx) {
    // Requires exactly N checkboxes in a scope to be checked
    // param: exact number of checkboxes that must be checked
    // Use for: "Select exactly 3 tags"
    if (!ctx || !ctx.element) return false;

    const container = ctx.element;
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const exactRequired = param || 1;

    return checkedCount === exactRequired;
  },

  isMultiSelectExact(value, param, ctx) {
    // For a single <select multiple>, requires exactly N selected options
    // param: exact number of options that must be selected
    // Use for: "Pick exactly 2 preferred languages"
    if (!ctx || !ctx.element) return false;

    const selectElement = ctx.element;
    if (selectElement.tagName !== 'SELECT' || !selectElement.multiple) return false;

    const selectedCount = Array.from(selectElement.selectedOptions).length;
    const exactRequired = param || 1;

    return selectedCount === exactRequired;
  },

  isMultiSelectBoxesExact(value, param, ctx) {
    // For multiple <select> boxes in a container, requires exactly N to have non-default values
    // param: exact number of select boxes that must have selections
    // Use for: Multi-step selection where exactly N dropdowns must be filled
    if (!ctx || !ctx.element) return false;

    const container = ctx.element;
    const selectBoxes = container.querySelectorAll('select');
    const filledCount = Array.from(selectBoxes).filter(select => {
      const val = select.value;
      // Consider filled if not empty and not common placeholder values
      return val !== '' && val !== null && val !== '0' && val !== '-1' && val !== 'placeholder';
    }).length;
    const exactRequired = param || 1;

    return filledCount === exactRequired;
  }
};

// Looks fine. Notes:

// param || 0 and param || Infinity are OK here; they effectively mean:

// minLength with no param ⇒ minimum 0.

// maxLength with no param ⇒ no effective limit.

// isSecurePassword is strict and self-contained.

// ctx support will come from validationEngine, so this library is suitable as a pure registry.

// No structural problems.