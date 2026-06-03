const toStringValue = (value) => String(value ?? '');

function getContextElement(ctx) {
  if (!ctx || typeof ctx !== 'object') return null;
  if (ctx instanceof Element) return ctx;
  return ctx.element ?? null;
}

function getScopedRoot(ctx) {
  const element = getContextElement(ctx);
  if (!element) return document;
  return element.closest('[interaction-container]') ?? element.closest('form') ?? document;
}

function toIntegerParam(param, fallback = 0) {
  const parsed = Number.parseInt(param, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hasUntouchedRequiredField(scopeEl) {
  const fields = scopeEl.querySelectorAll('[interaction-config]');
  return Array.from(fields).some((field) => {
    const hasValidatedStamp = field.hasAttribute('validated');
    if (hasValidatedStamp) return false;

    const tag = (field.tagName ?? '').toLowerCase();
    const type = (field.type ?? '').toLowerCase();
    const required = field.hasAttribute('required')
      || field.getAttribute('data-required') === 'true';
    if (!required) return false;

    if (type === 'checkbox' || type === 'radio') return !field.checked;
    if (type === 'file') return !field.files?.length;

    if (tag === 'select') return field.value === '' || field.value === null || field.value === undefined;

    if ('value' in field) return String(field.value ?? '').trim().length === 0;
    return String(field.textContent ?? '').trim().length === 0;
  });
}

export const rules = {
  bypassValidation: () => true,

  custom(value, param, ctx) {
    if (typeof param !== 'function') return false;
    const result = param(value, ctx);
    if (result != null && typeof result.then === 'function') {
      return result;
    }
    return !!result;
  },

  hasContent(value) {
    if (value === null || value === undefined) return false;
    return toStringValue(value).trim().length > 0;
  },

  required(value, _param, ctx) {
    const element = getContextElement(ctx);
    if (!element) return value !== null && value !== undefined && value !== '';
    const type = (element.type ?? '').toLowerCase();
    if (type === 'checkbox' || type === 'radio') return !!element.checked;
    if (type === 'file') return !!element.files?.length;
    return toStringValue(value).trim().length > 0;
  },

  minChar(value, param) {
    if (typeof value !== 'string') return false;
    return value.length >= toIntegerParam(param, 0);
  },
  minLength(value, param) {
    if (typeof value !== 'string') return false;
    return value.length >= toIntegerParam(param, 0);
  },
  maxChar(value, param) {
    if (typeof value !== 'string') return false;
    return value.length <= toIntegerParam(param, Number.POSITIVE_INFINITY);
  },
  maxLength(value, param) {
    if (typeof value !== 'string') return false;
    return value.length <= toIntegerParam(param, Number.POSITIVE_INFINITY);
  },

  isNumeric(value) {
    if (typeof value !== 'string' && typeof value !== 'number') return false;
    const str = String(value).trim();
    if (str === '') return false;
    return /^-?\d+(\.\d+)?$/.test(str);
  },
  nonNegative(value) {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0;
  },
  minNum(value, param) {
    const num = Number(value);
    const min = Number(param);
    return Number.isFinite(num) && Number.isFinite(min) && num >= min;
  },
  maxNum(value, param) {
    const num = Number(value);
    const max = Number(param);
    return Number.isFinite(num) && Number.isFinite(max) && num <= max;
  },

  isEmail(value) {
    if (typeof value !== 'string' || /\s/.test(value) || value.length > 254) return false;
    const parts = value.split('@');
    if (parts.length !== 2) return false;
    const [local, domain] = parts;
    if (!local || !domain || local.length > 64) return false;
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
    if (!/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local)) return false;
    if (domain.length > 255 || domain.includes('..')) return false;
    const labels = domain.split('.');
    if (labels.length < 2) return false;
    return labels.every((label) => /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$/.test(label));
  },

  isUrl(value) {
    if (typeof value !== 'string') return false;
    if (!/^https?:\/\//.test(value)) return false;
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) return false;
      return !!url.hostname && url.hostname.includes('.') && url.hostname.length >= 3;
    } catch {
      return false;
    }
  },

  isSecurePassword(value) {
    if (typeof value !== 'string') return false;
    return /[A-Z]/.test(value)
      && /[a-z]/.test(value)
      && /\d/.test(value)
      && /[^A-Za-z0-9]/.test(value)
      && value.length >= 8;
  },
  isSecurePasswordComplexityCheck(value) {
    if (typeof value !== 'string') return false;
    return /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
  },
  hasUpper: (value) => typeof value === 'string' && /[A-Z]/.test(value),
  hasLower: (value) => typeof value === 'string' && /[a-z]/.test(value),
  hasNumber: (value) => typeof value === 'string' && /\d/.test(value),
  hasSpecial: (value) => typeof value === 'string' && /[^A-Za-z0-9]/.test(value),

  matchValueSelector(value, selector, ctx) {
    if (typeof selector !== 'string' || !selector.trim()) return false;
    const root = getScopedRoot(ctx);
    const other = root.querySelector(selector);
    if (!other) return false;
    return toStringValue(value).trim() === toStringValue(other.value).trim();
  },
  matchValueField(value, fieldId, ctx) {
    if (!ctx || typeof ctx.getFieldValue !== 'function' || !ctx.scope || !fieldId) return false;
    const otherValue = ctx.getFieldValue(ctx.scope, fieldId);
    return value === otherValue;
  },
  matchValue(value, param, ctx) {
    if (typeof param !== 'string') return false;
    const contextElement = getContextElement(ctx);
    if (contextElement && (param.startsWith('#') || param.startsWith('.') || param.startsWith('['))) {
      return rules.matchValueSelector(value, param, ctx);
    }
    if (ctx && typeof ctx.getFieldValue === 'function') {
      return rules.matchValueField(value, param, ctx);
    }
    if (contextElement) return rules.matchValueSelector(value, param, ctx);
    return false;
  },

  /**
   * Valid when value differs from the placeholder param (default '').
   * Migrate legacy configs: pass param for old sentinel values ("0", "-1", "placeholder").
   */
  isSelect(value, param) {
    return value !== (param ?? '');
  },
  isCheck(_value, _param, ctx) {
    const element = getContextElement(ctx);
    if (element) return !!element.checked;
    return _value === true;
  },
  isRadioCheck(_value, param, ctx) {
    if (!param) return false;
    const root = getScopedRoot(ctx);
    const name = String(param);
    return Array.from(root.querySelectorAll('input[type="radio"]')).some(
      (el) => el.name === name && el.checked,
    );
  },
  isMultiCheck(_value, param, ctx) {
    const root = getScopedRoot(ctx);
    const checkedCount = Array.from(root.querySelectorAll('input[type="checkbox"]')).filter((cb) => cb.checked).length;
    return checkedCount >= toIntegerParam(param, 1);
  },
  isMultiCheckExact(_value, param, ctx) {
    const root = getScopedRoot(ctx);
    const checkedCount = root.querySelectorAll('input[type="checkbox"]:checked').length;
    return checkedCount === toIntegerParam(param, 1);
  },
  isMultiSelectExact(_value, param, ctx) {
    const element = getContextElement(ctx);
    if (!element || element.tagName !== 'SELECT' || !element.multiple) return false;
    return element.selectedOptions.length === toIntegerParam(param, 1);
  },
  isMultiSelectBoxesExact(_value, param, ctx) {
    const root = getScopedRoot(ctx);
    const selects = root.querySelectorAll('select');
    const filled = Array.from(selects).filter((select) => {
      const selectedValue = select.value;
      return !['', '0', '-1', 'placeholder'].includes(selectedValue);
    }).length;
    return filled === toIntegerParam(param, 1);
  },

  scopeHasNoBlockingInvalids(_value, selector, ctx) {
    const root = getScopedRoot(ctx);
    const scopeEl = typeof selector === 'string'
      ? (selector.trim() ? root.querySelector(selector) : root)
      : (selector ?? root);
    if (!scopeEl) return false;
    const invalids = scopeEl.querySelectorAll('[interaction-config][validated="false"]');
    if (invalids.length > 0) return false;
    return !hasUntouchedRequiredField(scopeEl);
  },

  jsObjectExists(_value, path) {
    if (typeof path !== 'string' || !path.trim()) return false;
    const normalizedPath = path.trim();
    if (!normalizedPath.startsWith('AppGlobals')) return false;
    try {
      let current = window;
      for (const key of normalizedPath.split('.')) {
        if (!(key in current)) return false;
        current = current[key];
      }
      return current !== null && current !== undefined && current !== '' && current !== 0 && current !== '0';
    } catch {
      return false;
    }
  },
};

export const registerRule = (name, fn) => {
  rules[name] = fn;
};

export const getRules = () => rules;

export const runRule = (name, value, param, ctx) => {
  const fn = rules[name];
  if (!fn) {
    if (import.meta.env?.DEV) console.warn(`[validation] Unknown rule: "${name}"`);
    return false;
  }
  return !!fn(value, param, ctx);
};
