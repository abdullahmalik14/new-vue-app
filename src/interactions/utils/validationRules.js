/**
 * validationRules.js  —  Rule library for v-interactions directive
 * ─────────────────────────────────────────────────────────────────────────────
 * All rules: (value, param, el) => boolean
 *
 * This is the single source of truth for ALL validation rules in the project.
 * Both v-interactions directive AND interactionsEngine (via validationsLibrary)
 * use compatible rule signatures.
 *
 * Register custom rules at runtime from anywhere:
 *   import { registerRule } from '@/interactions'
 *   registerRule('isABN', (v) => /^\d{11}$/.test(v.replace(/\s/g, '')))
 */

const rules = {
  // ─── Always passes — for pure show/hide with no validation ────────────────
  bypassValidation: () => true,

  // ─── Content / presence ───────────────────────────────────────────────────
  hasContent: (v) => String(v ?? '').trim().length > 0,

  required: (v, _p, el) => {
    const type = (el?.type ?? '').toLowerCase()
    if (type === 'checkbox' || type === 'radio') return !!el.checked
    if (type === 'file') return !!(el?.files?.length)
    return String(v ?? '').trim().length > 0
  },

  // ─── Checkbox / radio / select ────────────────────────────────────────────
  isCheck:       (_v, _p, el) => !!el?.checked,
  isRadioCheck:  (_v, name, el) => !!(el?.closest('[interaction-container]') ?? document).querySelector(`input[type=radio][name="${name}"]:checked`),
  isMultiCheck:  (_v, min, el)  => Array.from((el?.closest('[interaction-container]') ?? document).querySelectorAll('input[type=checkbox]')).filter(c => c.checked).length >= parseInt(min, 10),
  isMultiCheckExact: (_v, n, el) => (el?.closest('[interaction-container]') ?? document).querySelectorAll('input[type=checkbox]:checked').length === parseInt(n, 10),
  isSelect:      (v, def) => v !== (def ?? ''),
  isMultiSelectExact: (_v, n, el) => Array.from(el?.options ?? []).filter(o => o.selected).length === parseInt(n, 10),

  // ─── String length ────────────────────────────────────────────────────────
  any:     (v) => typeof v === 'string' && v.length > 0,
  minChar: (v, p) => String(v).length >= parseInt(p, 10),
  maxChar: (v, p) => String(v).length <= parseInt(p, 10),

  // Aliases used by interactionsEngine
  minLength: (v, p) => typeof v === 'string' && v.length >= (p || 0),
  maxLength: (v, p) => typeof v === 'string' && v.length <= (p || Infinity),

  // ─── Numbers ──────────────────────────────────────────────────────────────
  isNumeric:  (v) => /^-?\d*(\.\d+)?$/.test(v) && v !== '',
  nonNegative:(v) => parseFloat(v) >= 0,
  minNum:     (v, p) => parseFloat(v) >= parseFloat(p),
  maxNum:     (v, p) => parseFloat(v) <= parseFloat(p),

  // ─── Format ───────────────────────────────────────────────────────────────
  isEmail: (v) => {
    if (typeof v !== 'string' || /\s/.test(v) || v.length > 254) return false
    const [local, domain] = v.split('@')
    if (!local || !domain || local.length > 64) return false
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false
    if (!/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local)) return false
    if (domain.length > 255 || domain.includes('..')) return false
    const labels = domain.split('.')
    if (labels.length < 2) return false
    return labels.every(l => /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$/.test(l))
  },

  isUrl: (v) => /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\S*)?$/.test(v),

  // ─── Password ─────────────────────────────────────────────────────────────
  // Full check (single rule, single error message)
  isSecurePassword: (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v),
  // Complexity only, no length (use with minChar separately for per-rule feedback)
  isSecurePasswordComplexityCheck: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v),
  // Individual character class checks (used for per-rule strength indicators)
  hasUpper:  (v) => /[A-Z]/.test(v),
  hasLower:  (v) => /[a-z]/.test(v),
  hasNumber: (v) => /\d/.test(v),
  hasSpecial:(v) => /[^A-Za-z0-9]/.test(v),

  // ─── Cross-field ──────────────────────────────────────────────────────────
  /**
   * matchValue — for v-interactions: param is a CSS selector e.g. '#confirmPassword'
   * matchValue — for interactionsEngine: param is a field ID, ctx.getFieldValue is used
   */
  matchValue: (v, param, el) => {
    // v-interactions path: param is CSS selector, el is the DOM element
    if (el && typeof param === 'string' && param.startsWith('#')) {
      const root  = el?.closest('[interaction-container]') ?? el?.getRootNode() ?? document
      const other = root?.querySelector?.(param)
      if (!other) { console.warn(`[matchValue] selector not found: ${param}`); return false }
      return String(v ?? '').trim() === String(other.value ?? '').trim()
    }
    // interactionsEngine path: ctx is passed as 3rd arg with getFieldValue
    const ctx = el // when called from interactionsEngine, 3rd arg is ctx object
    if (ctx && typeof ctx.getFieldValue === 'function' && ctx.scope) {
      if (!v || v === '') return true // don't validate empty confirm field
      const otherValue = ctx.getFieldValue(ctx.scope, param)
      return v === otherValue
    }
    return false
  },

  // ─── Scope guard ─────────────────────────────────────────────────────────
  scopeHasNoBlockingInvalids: (_v, param, el) => {
    const root    = el?.getRootNode?.() ?? document
    const scopeEl = typeof param === 'string' ? root.querySelector(param) : param
    if (!scopeEl) return false
    const invalids = scopeEl.querySelectorAll('[interaction-config][validated="false"]')
    return invalids.length === 0
  },

  // ─── JS global check ─────────────────────────────────────────────────────
  jsObjectExists: (_v, param) => {
    try {
      let cur = window
      for (const k of String(param).split('.')) { if (!(k in cur)) return false; cur = cur[k] }
      return cur !== null && cur !== undefined && cur !== '' && cur !== 0 && cur !== '0'
    } catch { return false }
  },
}

export const registerRule = (name, fn) => { rules[name] = fn }
export const getRules     = () => rules
export const runRule      = (name, value, param, el) => {
  const fn = rules[name]
  if (!fn) { console.warn(`[interactions] Unknown rule: "${name}"`); return false }
  return fn(value, param, el)
}
export default rules
