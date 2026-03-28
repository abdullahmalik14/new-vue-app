/**
 * engine.js  — high-performance config-driven action engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles: show, hide, toggleDisplay, cloneValue, attribute, setType, setHTML,
 *          snapshotScope, restoreScope, showIfDirty, hideIfClean,
 *          validateScope, showBrowserError, pushEvent, script
 */

import { runRule } from './validationRules'

// ─── Module-level caches ───────────────────────────────────────────────────────

/** WeakMap: scopeEl → Map<fieldEl, FieldSnapshot>  (GC-safe) */
const _snapshots = new WeakMap()

/**
 * Parsed + frozen config cache.
 * Freezing prevents Vue reactivity from wrapping config objects in Proxy —
 * saves repeated proxy trap overhead on every keystroke.
 */
const _configCache = new WeakMap()

/** Scope cache: el → scope element (el.closest() result cached after first resolve) */
const _scopeCache = new WeakMap()

/**
 * querySelector result cache: scopeId::selector → WeakRef<Element>
 * WeakRef ensures dead elements don't block GC. Evicted lazily.
 */
const _selectorCache = new Map()
const SELECTOR_CACHE_MAX = 500
let   _idCounter = 0

const FIELD_SEL = 'input:not([type=submit]):not([type=button]):not([type=reset]):not([type=image]), select, textarea'

// ─── Config helpers ────────────────────────────────────────────────────────────

export function safeParseConfig(raw) {
  if (raw !== null && typeof raw === 'object' && _configCache.has(raw))
    return _configCache.get(raw)

  let parsed
  if (Array.isArray(raw))               parsed = raw
  else if (raw && typeof raw === 'object') parsed = [raw]
  else if (typeof raw === 'string') {
    try { const p = JSON.parse(raw); parsed = Array.isArray(p) ? p : [p] }
    catch { return null }
  }
  else return null

  const frozen = deepFreeze(parsed)
  if (raw !== null && typeof raw === 'object') _configCache.set(raw, frozen)
  return frozen
}

function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) return obj
  Object.keys(obj).forEach(k => deepFreeze(obj[k]))
  return Object.freeze(obj)
}

// ─── Scope resolution (cached) ────────────────────────────────────────────────

export function resolveScope(el) {
  if (_scopeCache.has(el)) return _scopeCache.get(el)
  const scope = el.closest('[interaction-container]') ?? el.getRootNode() ?? document
  _scopeCache.set(el, scope)
  return scope
}

export function evictScopeCache(el) {
  _scopeCache.delete(el)
}

// ─── querySelector with caching ───────────────────────────────────────────────

function resolveTarget(selector, triggerEl, scope) {
  if (!selector) return null
  if (selector === 'this') return triggerEl

  const scopeId  = scope._iid ?? (scope._iid = ++_idCounter)
  const cacheKey = `${scopeId}::${selector}`
  const cached   = _selectorCache.get(cacheKey)

  if (cached) {
    const el = cached.deref()
    if (el) return el
    _selectorCache.delete(cacheKey)
  }

  const found = (scope ?? document).querySelector(selector)
  if (found) {
    if (_selectorCache.size >= SELECTOR_CACHE_MAX)
      _selectorCache.delete(_selectorCache.keys().next().value)
    _selectorCache.set(cacheKey, new WeakRef(found))
  }
  return found ?? null
}

// ─── Value helpers ─────────────────────────────────────────────────────────────

export function getFieldValue(el) {
  if (!el) return ''
  const tag  = (el.tagName ?? '').toLowerCase()
  const type = (el.type   ?? '').toLowerCase()
  if (tag === 'input') {
    if (type === 'checkbox' || type === 'radio') return el.checked ? '1' : ''
    if (type === 'file') return el.files?.length ? '[files]' : ''
  }
  if (tag === 'select' && el.multiple)
    return Array.from(el.options).filter(o => o.selected).map(o => o.value).join(',')
  return String(el.value ?? '').trim()
}

function isEmptyField(el) {
  const type = (el.type ?? '').toLowerCase()
  if (type === 'checkbox' || type === 'radio') return !el.checked
  if (type === 'file') return !el.files?.length
  return String(el.value ?? '').trim().length === 0
}

// ─── Validation ────────────────────────────────────────────────────────────────

export function validateElement(el, rulesArr) {
  const value       = getFieldValue(el)
  const failedRules = []
  for (let i = 0; i < rulesArr.length; i++) {
    const rule = rulesArr[i]
    if (!runRule(rule.type, value, rule.param, el))
      failedRules.push({ rule: rule.type, error: rule.error ?? null })
  }
  return { isValid: failedRules.length === 0, failedRules }
}

export function validateWithRequired(el, rulesArr) {
  if (el.hasAttribute('required') && isEmptyField(el))
    return { isValid: false, failedRules: [{ rule: 'required-flag', error: 'This field is required.' }] }
  return validateElement(el, rulesArr)
}

export function stampValidation(el, result) {
  el.setAttribute('validated', result.isValid ? 'true' : 'false')
  el.setAttribute('data-validation-reason', result.isValid
    ? '{"isValid":true}'
    : JSON.stringify({ isValid: false, failedRules: result.failedRules.map(r => ({ rule: r.rule, error: r.error ?? null })) })
  )
}

// ─── Scope validation ──────────────────────────────────────────────────────────

/**
 * Validate all fields in a scope container.
 * Fast path: reads `validated` stamp if field was already interacted with.
 * Slow path: re-runs rules for untouched fields.
 */
export function validateScope(scopeEl) {
  const root = scopeEl ?? document
  root.querySelectorAll('.first-invalid').forEach(n => n.classList.remove('first-invalid'))

  const result = { isValid: true, valid: [], invalid: [], invalidById: {} }
  let firstInvalidEl = null
  let idx = 0

  const fields = root.querySelectorAll('[interaction-config]')
  for (let i = 0; i < fields.length; i++) {
    const el  = fields[i]
    const tag = (el.tagName ?? '').toLowerCase()
    if (tag !== 'input' && tag !== 'select' && tag !== 'textarea') continue

    const key   = el.getAttribute('data-key') ?? el.name ?? el.id ?? `idx-${idx++}`
    const value = getFieldValue(el)

    const stamped = el.getAttribute('validated')
    let isValid, failedRules = []

    if (stamped !== null) {
      isValid = stamped === 'true'
      if (!isValid) {
        try { failedRules = JSON.parse(el.getAttribute('data-validation-reason') ?? '{}').failedRules ?? [] }
        catch { failedRules = [] }
      }
    } else {
      const configs  = safeParseConfig(el.getAttribute('interaction-config')) ?? []
      const allRules = configs.flatMap(c => Array.isArray(c.rules) ? c.rules : [])
      const res      = validateWithRequired(el, allRules)
      isValid        = res.isValid
      failedRules    = res.failedRules
    }

    if (isValid) {
      result.valid.push({ id: key, value })
    } else {
      const entry = { id: key, value, failedRules }
      result.invalid.push(entry)
      result.invalidById[key] = entry
      result.isValid = false
      if (!firstInvalidEl) { firstInvalidEl = el; el.classList.add('first-invalid') }
    }
  }

  return result
}

// ─── Action execution ──────────────────────────────────────────────────────────

export function execActions(actions, el, scope) {
  if (!actions) return
  const arr = Array.isArray(actions) ? actions : [actions]
  for (let i = 0; i < arr.length; i++) execAction(arr[i], el, scope)
}

function execAction(action, el, scope) {
  const t = () => resolveTarget(action.targetSelector, el, scope)

  switch (action.actionType) {
    case 'show': {
      const target = t(); if (!target) break
      target.hidden = false; target.removeAttribute('hidden'); break
    }
    case 'hide': {
      const target = t(); if (!target) break
      target.setAttribute('hidden', ''); break
    }
    case 'attribute': {
      const target = t(); if (!target) break
      if (action.add)         Object.entries(action.add).forEach(([a, v]) => target.setAttribute(a, v))
      if (action.remove)      action.remove.forEach(a => target.removeAttribute(a))
      if (action.addClass)    target.classList.add(...[].concat(action.addClass))
      if (action.removeClass) target.classList.remove(...[].concat(action.removeClass))
      if (action.addId)       target.id = action.addId
      if (action.removeId)    target.removeAttribute('id')
      break
    }
    case 'toggleDisplay': {
      const target = t(); if (!target) break
      const [first, second] = action.values ?? []
      if (action.attribute === 'innerHTML') {
        target.innerHTML = target.innerHTML.trim() === (first ?? '').trim() ? second : first
      } else if (action.attribute) {
        const cur = target.getAttribute(action.attribute) ?? first
        target.setAttribute(action.attribute, cur === first ? second : first)
      } else {
        target.hidden = !target.hidden
      }
      break
    }
    case 'setType': { const target = t(); if (target) target.setAttribute('type', action.value); break }
    case 'setHTML': { const target = t(); if (target) target.innerHTML = action.value ?? ''; break }

    case 'cloneValue': {
      const target = t(); if (!target) break
      let val = getFieldValue(el)
      if (action.transform === 'slugify')   val = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      if (action.transform === 'lowercase') val = val.toLowerCase()
      if (action.transform === 'uppercase') val = val.toUpperCase()
      if ('value' in target) { target.value = val; target.dispatchEvent(new Event('input', { bubbles: true })) }
      else target.textContent = val
      break
    }

    case 'snapshotScope': {
      const scopeEl = resolveTarget(action.scope, el, scope)
      if (!scopeEl) { console.warn('[snapshotScope] not found:', action.scope); break }
      const map = new Map()
      scopeEl.querySelectorAll(FIELD_SEL).forEach(f => map.set(f, captureField(f)))
      _snapshots.set(scopeEl, map)
      break
    }

    case 'restoreScope': {
      const scopeEl = resolveTarget(action.scope, el, scope)
      if (!scopeEl) { console.warn('[restoreScope] not found:', action.scope); break }
      const map = _snapshots.get(scopeEl)
      if (!map) { console.warn('[restoreScope] no snapshot:', action.scope); break }
      scopeEl.querySelectorAll(FIELD_SEL).forEach(f => restoreField(f, map.get(f)))
      scopeEl.dispatchEvent(new CustomEvent('interactions:restored', { bubbles: true }))
      break
    }

    case 'showIfDirty': {
      const scopeEl = resolveTarget(action.scope, el, scope)
      const target  = t()
      if (!scopeEl || !target) break
      if (isDirty(scopeEl)) { target.hidden = false; target.removeAttribute('hidden') }
      else target.setAttribute('hidden', '')
      break
    }

    case 'hideIfClean': {
      const scopeEl = resolveTarget(action.scope, el, scope)
      const target  = t()
      if (!scopeEl || !target) break
      if (!isDirty(scopeEl)) target.setAttribute('hidden', '')
      else { target.hidden = false; target.removeAttribute('hidden') }
      break
    }

    case 'validateScope': {
      const scopeEl = resolveTarget(action.scope, el, scope)
      if (!scopeEl) { console.warn('[validateScope] not found:', action.scope); break }
      const res = validateScope(scopeEl)
      if (!res.isValid && action.options?.focusFirst)
        scopeEl.querySelector('.first-invalid')?.focus()
      break
    }

    case 'showBrowserError': {
      if (!el?.reportValidity || !el?.setCustomValidity) break
      const msg = typeof action.message === 'string' && action.message.trim() ? action.message : 'Please check this field'
      el.setCustomValidity(msg); el.reportValidity()
      setTimeout(() => el.setCustomValidity(''), 800)
      break
    }

    case 'pushEvent':
      if (action.eventName)
        el.dispatchEvent(new CustomEvent(action.eventName, { bubbles: true, detail: { source: el, scope } }))
      break

    case 'script':
      if (action.code) {
        try { (new Function('el', 'scope', action.code))(el, scope) }
        catch (e) { console.error('[interactions:script]', e) }
      }
      break

    default:
      if (import.meta.env?.DEV)
        console.warn('[interactions] Unknown actionType:', action.actionType)
  }
}

// ─── Snapshot helpers ──────────────────────────────────────────────────────────

function captureField(el) {
  const type = (el.type ?? '').toLowerCase()
  if ((el.tagName ?? '').toLowerCase() === 'input' && (type === 'checkbox' || type === 'radio'))
    return { kind: 'check', checked: !!el.checked }
  if ((el.tagName ?? '').toLowerCase() === 'select' && el.multiple)
    return { kind: 'multi', selected: Array.from(el.options).filter(o => o.selected).map(o => o.value) }
  return { kind: 'value', value: el.value ?? '' }
}

function restoreField(el, snap) {
  if (!snap) return
  if      (snap.kind === 'check') el.checked = snap.checked
  else if (snap.kind === 'multi') Array.from(el.options).forEach(o => { o.selected = snap.selected.includes(o.value) })
  else                            el.value = snap.value
}

export function isDirty(scopeEl) {
  const map = _snapshots.get(scopeEl)
  if (!map) return false
  for (const [el, snap] of map) {
    const cur = captureField(el)
    if (snap.kind === 'check' && cur.checked  !== snap.checked)  return true
    if (snap.kind === 'multi' && JSON.stringify(cur.selected) !== JSON.stringify(snap.selected)) return true
    if (snap.kind === 'value' && cur.value    !== snap.value)    return true
  }
  return false
}

export { _snapshots }
