/**
 * vInteractions.js  —  v-interactions Vue directive
 * ─────────────────────────────────────────────────────────────────────────────
 * Performance notes:
 *
 * 1. Config is parsed ONCE at wire() time, not on every event.
 * 2. Scope is resolved ONCE at wire() time via resolveScope() and cached.
 * 3. initialPass is deferred to next microtask so sibling elements (e.g.
 *    #confirmPassword referenced in matchValue rules) are guaranteed to be
 *    in the DOM before validation runs.
 * 4. All listener references are stored for O(1) removal at unmount.
 * 5. Config is deep-frozen at parse time — Vue's Proxy never wraps it.
 *
 * Usage:
 *   <input v-interactions="myConfig" />
 *
 *   const myConfig = Object.freeze([{
 *     triggerEvents: ['input'],
 *     rules: [{ type: 'isEmail' }],
 *     onValid:   { actionType: 'show', targetSelector: '#successMsg' },
 *     onInvalid: { actionType: 'hide', targetSelector: '#successMsg' },
 *   }])
 */

import {
  safeParseConfig,
  validateWithRequired,
  stampValidation,
  execActions,
  resolveScope,
  evictScopeCache,
} from '../utils/engine'

const CLEANUP = Symbol('v-interactions:cleanup')

export const vInteractions = {
  mounted(el, binding) {
    wire(el, binding.value)
  },

  updated(el, binding) {
    // Only rewire if the config reference changed.
    // Because config objects are frozen, referential equality is a reliable check.
    if (binding.value !== binding.oldValue) {
      unwire(el)
      wire(el, binding.value)
    }
  },

  beforeUnmount(el) {
    unwire(el)
    evictScopeCache(el)
  },
}

// ─── Wire ──────────────────────────────────────────────────────────────────────

function wire(el, value) {
  const configs = safeParseConfig(value)   // parsed + frozen here, once
  if (!configs?.length) return

  // Resolve scope once — cached in WeakMap, not repeated on every event
  const scope    = resolveScope(el)
  const cleanups = []

  for (let i = 0; i < configs.length; i++) {
    const cfg    = configs[i]
    const events = Array.isArray(cfg.triggerEvents) ? cfg.triggerEvents : []

    for (let j = 0; j < events.length; j++) {
      const eventType = events[j]
      const handler = () => handleInteraction(el, cfg, scope)
      el.addEventListener(eventType, handler, { passive: true })
      cleanups.push(() => el.removeEventListener(eventType, handler))
    }
  }

  el[CLEANUP] = cleanups

  // Defer initial pass so all sibling elements are guaranteed to be in DOM.
  queueMicrotask(() => initialPass(el, configs, scope))
}

// ─── Unwire ────────────────────────────────────────────────────────────────────

function unwire(el) {
  const cleanups = el[CLEANUP]
  if (cleanups) {
    for (let i = 0; i < cleanups.length; i++) cleanups[i]()
    delete el[CLEANUP]
  }
}

// ─── Hot path: called on every event ──────────────────────────────────────────

function handleInteraction(el, cfg, scope) {
  const rules           = cfg.rules ?? _empty
  const needsValidation = rules.length > 0 || el.hasAttribute('required')

  let isValid = true
  let detail  = _passResult

  if (needsValidation) {
    detail  = validateWithRequired(el, rules)
    isValid = detail.isValid
    stampValidation(el, detail)
  }

  const actions = isValid ? cfg.onValid : cfg.onInvalid
  if (actions) execActions(actions, el, scope)

  el.dispatchEvent(new CustomEvent(isValid ? 'validation:pass' : 'validation:fail', {
    bubbles: true, detail: { source: el, ...detail }
  }))
}

// ─── Initial pass ──────────────────────────────────────────────────────────────

function initialPass(el, configs, scope) {
  const hasRules = configs.some(c => Array.isArray(c.rules) && c.rules.length > 0)
  if (!hasRules && !el.hasAttribute('required')) return
  for (let i = 0; i < configs.length; i++) {
    handleInteraction(el, configs[i], scope)
  }
}

// ─── Shared constants (avoid repeated allocation) ─────────────────────────────
const _empty      = []
const _passResult = Object.freeze({ isValid: true, failedRules: [] })
