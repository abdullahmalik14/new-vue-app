# Interactions & Validation Audit

**Scope:** All interaction and validation systems in the project.
**Files audited:**
- `src/interactions/directives/vInteractions.js`
- `src/interactions/utils/engine.js`
- `src/interactions/utils/validationRules.js`
- `src/utils/validation/validationEngine.js`
- `src/utils/validation/validationsLibrary.js`
- `src/utils/validation/interactionsEngine.js`
- `src/services/events/validators/eventFlowValidators.js`
- `src/services/events/validators/eventStepValidators.js`
- `src/services/rental/validators/rentalFlowValidators.js`

**Architecture overview:**
Two parallel validation systems exist in this project:
1. **`v-interactions` directive** (`src/interactions/`) — declarative DOM-based binding; validates on DOM events; executes actions via `engine.js`.
2. **`interactionsEngine` + `validationEngine`** (`src/utils/validation/`) — Vue-reactive field registry; used by auth components and booking flows.

3. **Flow data pipeline** (`src/services/flow-system/flowDataPipeline.js`) — payload/response validation inside `FlowHandler.run`. **Flow-system-only findings** are documented in [`src/services/flow-system/FLOW_SYSTEM_AUDIT.md`](../services/flow-system/FLOW_SYSTEM_AUDIT.md) (not duplicated here).

---

## Table of Contents
1. [Logic Errors](#1-logic-errors)
2. [Security Issues](#2-security-issues)
3. [Performance Issues](#3-performance-issues)
4. [Best Practice Violations](#4-best-practice-violations)
5. [Missing Features](#5-missing-features)
6. [Summary Table](#6-summary-table)

---


### A. RULE LIBRARY UNIFICATION — Architecture Issue

**Files:** `src/interactions/utils/validationRules.js`, `src/utils/validation/validationsLibrary.js`  
**Severity:** Critical (architecture)

There are two completely independent rule registries. Every issue found across them during this audit is a direct consequence of this split. Here is the full picture of what diverges right now:

| Rule | `validationRules.js` (directive) | `validationsLibrary.js` (engine) |
|------|----------------------------------|----------------------------------|
| `isEmail` | Full RFC-5321 (local part, domain labels, length) | Simple regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `isNumeric` | `\d*` — accepts bare `-` (**bug**) | `\d+` — correct |
| `isSecurePassword` | upper + lower + digit + length ≥ 8, **no special** | upper + lower + digit + **special** + length ≥ 8 |
| `isUrl` | `(https?://)?` — protocol optional | requires `https?://` — stricter |
| `hasContent` | Single definition, coerces via `String()` | Duplicate definition, second overwrites first (**bug**) |
| `matchValue` | Dual-path: CSS selector OR engine ctx — ambiguous (**bug**) | Single engine path only |
| `isSelect` | `v !== (def ?? '')` — caller supplies default | Hardcoded `"0"`, `"-1"`, `"placeholder"` — brittle |
| `isRadioCheck` | Scoped to `[interaction-container]` | Scans entire `document` (**bug**) |
| `minChar` | `parseInt(p, 10)` — `NaN` on bad param → always passes | `param \|\| 0` |
| `minLength` | `p \|\| 0` | `param \|\| 0` |
| `custom` | Not present | Present, silently passes on bad param (**bug**) |
| `bypassValidation` | Present | Present |

**Recommended unification plan:**

1. Create `src/utils/validation/rules.js` as the **single source of truth** — one object, one set of rule functions with consistent signatures `(value, param, ctx) => boolean`.
2. Export it from both entry points:
   ```js
   // src/interactions/utils/validationRules.js
   export { rules as default, registerRule, getRules, runRule } from '@/utils/validation/rules.js'
   ```
   ```js
   // src/utils/validation/validationsLibrary.js
   export { rules as validationsLibrary } from '@/utils/validation/rules.js'
   ```
3. Resolve each divergence in the canonical file:
   - Use the RFC-5321 `isEmail` (directive version is stronger)
   - Fix `isNumeric` to require `\d+`
   - Add `hasSpecial` to `isSecurePassword` and document the policy once
   - Remove the duplicate `hasContent`
   - Split `matchValue` into `matchValueSelector` (CSS, directive only) and `matchValueField` (engine ctx)
   - Fix `isRadioCheck` to scope to container
   - Normalise `minChar`/`minLength` param handling
   - Make `custom` return `false` on bad param

---





## 1. Logic Errors

---

### L-01 · `isNumeric` regex accepts bare `-` as a valid number
**File:** `src/interactions/utils/validationRules.js` line 47
**Severity:** High

```js
isNumeric: (v) => /^-?\d*(\.\d+)?$/.test(v) && v !== '',
```

`\d*` allows zero digits before the optional decimal, so the string `"-"` matches the regex and is not an empty string. `isNumeric('-')` returns `true`. The version in `validationsLibrary.js` (line 172) correctly uses `\d+` (one or more digits). The two rule libraries are inconsistent and the directive-side one has the bug.

**Fix:** Change `\d*` to `\d+`:
```js
isNumeric: (v) => /^-?\d+(\.\d+)?$/.test(v) && v !== '',
```

---

### L-02 · `matchValue` rule has dual-path ambiguity that silently returns `false`
**File:** `src/interactions/utils/validationRules.js` lines 83–98
**Severity:** High

The rule tries to detect at runtime whether it is being called from the directive (CSS selector path) or from `interactionsEngine` (field-ID path) by checking whether `param.startsWith('#')`:

```js
matchValue: (v, param, el) => {
  if (el && typeof param === 'string' && param.startsWith('#')) {
    // directive path — OK
  }
  const ctx = el  // assumes el is a ctx object here
  if (ctx && typeof ctx.getFieldValue === 'function' && ctx.scope) {
    // engine path — OK
  }
  return false  // ← reached when neither branch matches
},
```

If a directive user passes a selector without `#` (e.g., `[name=confirmPassword]`) or an attribute selector, the CSS path is skipped. The code then treats the DOM element as a `ctx` object, `ctx.getFieldValue` is `undefined`, and the rule silently returns `false` — making the field permanently invalid with no error or warning.

**Fix:** Separate `matchValue` into two named rules: `matchValueSelector` (for the directive) and `matchValueField` (for the engine), each with unambiguous signatures.

---

### L-03 · `isEmail` implementations diverge between the two rule libraries
**File:** `src/interactions/utils/validationRules.js` line 53 vs `src/utils/validation/validationsLibrary.js` line 34
**Severity:** Medium

| Library | Regex / Logic |
|---------|--------------|
| `validationRules.js` (directive) | Full RFC-5321 validation: checks local part, domain labels, length limits |
| `validationsLibrary.js` (engine) | Simple regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |

The same email address can pass one validator and fail the other. For example `user+tag@sub.example.co.uk` passes both, but edge cases like `"user name"@example.com` (quoted local part) are rejected by the simple regex but allowed by RFC. More importantly, once users see inconsistent error behavior between auth forms and booking forms, trust is eroded.

**Fix:** Import and reuse the single RFC-compliant validator from `validationRules.js` inside `validationsLibrary.js`.

---

### L-04 · `hasContent` is defined twice in `validationsLibrary.js`
**File:** `src/utils/validation/validationsLibrary.js` lines 7–9 and 91–99
**Severity:** High

```js
export const validationsLibrary = {
  hasContent(value) {                          // line 7 — FIRST DEFINITION
    return String(value ?? "").trim().length > 0;
  },
  // ... many rules ...
  hasContent(value) {                          // line 91 — SECOND DEFINITION, overwrites first
    if (value === null || value === undefined) return false;
    if (typeof value === "string") { return value.trim().length > 0; }
    return true;
  },
```

JavaScript silently overwrites duplicate property names in an object literal. The first definition is dead code. Any caller relying on the first version's behavior (coercing `null` to `"null"` string via `String()`) will silently get the second version. This is a latent correctness bug.

**Fix:** Remove the first `hasContent` definition (lines 7–9). The second definition is more correct.

---

### L-05 · `scopeHasNoBlockingInvalids` (directive) misses untouched fields
**File:** `src/interactions/utils/validationRules.js` lines 102–108
**Severity:** Medium

```js
scopeHasNoBlockingInvalids: (_v, param, el) => {
  const invalids = scopeEl.querySelectorAll('[interaction-config][validated="false"]')
  return invalids.length === 0
},
```

This rule only catches fields that have already been validated (i.e., they have the `validated="false"` attribute stamped by `stampValidation`). Required fields that the user has never touched carry no `validated` attribute and are treated as valid by this guard. A user can skip all required fields and still pass the scope guard.

**Fix:** Fall back to running `validateScope(scopeEl)` when no stamped fields exist, or always run `validateScope` and check `result.isValid`.

---

### L-06 · `step1Validator` uses `||` instead of `??` for `repeatRule` default
**File:** `src/services/events/validators/eventStepValidators.js` line 73
**Severity:** Medium

```js
const repeatRule = state?.repeatRule || "weekly";
```

If `state.repeatRule` is explicitly set to an empty string `""` (a real value that could mean "not selected"), the `||` operator treats it as falsy and defaults to `"weekly"`. The field passes the `weekly` branch validation even though no rule was truly selected. Should use nullish coalescing:

```js
const repeatRule = state?.repeatRule ?? "weekly";
```

---

### L-07 · `creatorId` validated inconsistently as number vs string across flow validators
**File:** `src/services/events/validators/eventFlowValidators.js` line 13 vs `src/services/rental/validators/rentalFlowValidators.js` line 17
**Severity:** Medium

```js
// eventFlowValidators.js
if (toNumber(payload.creatorId) == null) { ... }   // validates as number

// rentalFlowValidators.js
if (!isNonEmptyString(payload.creatorId)) { ... }  // validates as string
```

The same semantic field (`creatorId`) is validated as a number in one module and as a string in another. If the backend uses large integer IDs (> `Number.MAX_SAFE_INTEGER = 2^53 - 1`), converting to `Number` silently corrupts the value. Both validators should treat IDs as opaque non-empty strings.

---

### L-08 · `_isElementEmpty` returns `false` (not empty) for `null` element with `false` value
**File:** `src/utils/validation/validationEngine.js` lines 72–110
**Severity:** Low

```js
_isElementEmpty(element, value) {
  if (value === null || value === undefined || value === '') return true;
  if (!element) {
    return false;   // ← reaches here when value=false, element=null
  }
  ...
  if (type === 'checkbox' || type === 'radio') return !element.checked;
```

For an unchecked checkbox registered with no DOM element reference, `value` is `false`. `false === ''` is false, so the early return is skipped. Then `!element` is true, so the function returns `false` — "not empty". The field appears to have data when it is actually unchecked. The early return should include `value === false`:

```js
if (value === null || value === undefined || value === '' || value === false) return true;
```

---

### L-09 · `hasAnyValidSlots` does not validate that `endTime > startTime`
**File:** `src/services/events/validators/eventStepValidators.js` lines 10–17
**Severity:** Medium

```js
function hasAnyValidSlots(slots) {
  return slots.some((slot) => {
    const start = typeof slot?.startTime === "string" ? slot.startTime.trim() : "";
    const end   = typeof slot?.endTime   === "string" ? slot.endTime.trim()   : "";
    return start.length > 0 && end.length > 0;  // ← no ordering check
  });
}
```

A slot with `startTime: "18:00"` and `endTime: "08:00"` (end before start) passes this validation. Booking a session with an inverted time range would create invalid calendar data.

**Fix:** Add a time comparison after confirming format, e.g. `end > start` for ISO time strings.

---

### L-10 · `scope` resolved at `wire()` time may become stale after DOM mutation
**File:** `src/interactions/directives/vInteractions.js` lines 62–63
**Severity:** Low

```js
const scope = resolveScope(el)  // cached once at wire time
```

If the containing `[interaction-container]` is replaced or re-rendered by Vue after the directive is mounted (but the host `el` stays alive), the cached scope no longer points to the live container. Actions targeting elements inside the container via `targetSelector` will resolve against a detached DOM node. The `evictScopeCache` is only called on `beforeUnmount`, not on `updated` when the config changes.

**Fix:** In the `updated` hook, call `evictScopeCache(el)` before `wire()` re-resolves the scope.

---

## 2. Security Issues

---

### S-01 · `script` action uses `eval` — direct code execution from config
**File:** `src/utils/validation/interactionsEngine.js` line 160
**Severity:** Critical

```js
script(action) {
  if (action.code) {
    eval(action.code);   // ← unrestricted eval
  }
  ...
}
```

`eval` executes arbitrary JavaScript in the current scope with full access to closures, module state, and the DOM. If `action.code` originates from any user-controllable source (a database-backed config, a URL parameter, a server response that isn't validated), this is a trivially exploitable XSS vector. It also prevents JavaScript engine optimizations.

**Compare:** `engine.js` line 322 uses `new Function('el', 'scope', action.code)` which at least creates an isolated function scope (no closure access), but is still dangerous.

**Fix:** Remove `eval`. Provide a whitelist of named functions that actions can invoke:
```js
const ALLOWED_SCRIPTS = { myCallback: (el, scope) => { ... } };
if (action.functionName && ALLOWED_SCRIPTS[action.functionName]) {
  ALLOWED_SCRIPTS[action.functionName](el, scope);
}
```

---

### S-02 · `setHTML` action writes unsanitized HTML to the DOM
**File:** `src/interactions/utils/engine.js` line 248; `src/utils/validation/interactionsEngine.js` line 210
**Severity:** High

```js
// engine.js
case 'setHTML': { const target = t(); if (target) target.innerHTML = action.value ?? ''; break }

// interactionsEngine.js
targetElement.innerHTML = htmlValue;
```

`innerHTML` assignment allows injection of arbitrary HTML including `<script>` tags and event-handler attributes (e.g., `<img onerror="..."/>`). If `action.value` / `htmlValue` ever contains data derived from user input, API responses, or URL parameters, this is a stored or reflected XSS vulnerability.

**Fix:** Use `textContent` for plain text, or sanitize with DOMPurify before assigning `innerHTML`. Add a config flag `trustedHTML: true` to make the risk explicit.

---

### S-03 · `attribute` action allows setting arbitrary DOM attributes including event handlers
**File:** `src/interactions/utils/engine.js` lines 226–229
**Severity:** High

```js
case 'attribute': {
  if (action.add) Object.entries(action.add).forEach(([a, v]) => target.setAttribute(a, v))
```

There is no filtering of attribute names. An attacker who can control the config could inject:
- `{ add: { onclick: "stealData()" } }` — creates inline event handler
- `{ add: { href: "javascript:void(xss())" } }` — turns a link into XSS vector
- `{ add: { src: "//evil.com/img.png" } }` — exfiltration via resource load

**Fix:** Validate attribute names against an allowlist (e.g., `class`, `style`, `data-*`, `aria-*`, `disabled`, `hidden`, `placeholder`) and block `on*` and protocol-carrying attributes (`href`, `src`, `action`) unless explicitly trusted.

---

### S-04 · `jsObjectExists` probes arbitrary `window` property paths
**File:** `src/interactions/utils/validationRules.js` lines 111–117
**Severity:** Medium

```js
jsObjectExists: (_v, param) => {
  let cur = window
  for (const k of String(param).split('.')) { if (!(k in cur)) return false; cur = cur[k] }
  return cur !== null && ...
```

`param` is a dot-delimited path string from config. Any config author (or XSS attacker who can influence config) can traverse arbitrary window properties: `window.__vue_app__`, `window.__webpack_modules__`, sensitive globals. While this doesn't modify state, it leaks internal object structure.

**Fix:** Restrict traversal to a declared namespace (e.g., `window.AppGlobals.*`) rather than the entire `window` object.

---

### S-05 · `showBrowserError` in `interactionsEngine` mutates `element.type` without try/catch
**File:** `src/utils/validation/interactionsEngine.js` lines 75–93
**Severity:** Low

```js
if (originalType === 'email') {
  element.type = 'text';
}
element.setCustomValidity(message);
element.reportValidity();
if (originalType === 'email') {
  element.type = originalType;
}
```

If `reportValidity()` throws (which it can in certain detached-DOM or sandboxed-frame scenarios), `element.type` is not restored, leaving an email field permanently behaving as a text field. This can silently disable browser-native format hinting.

**Fix:** Wrap the entire block in `try/finally` to guarantee type restoration.

---

## 3. Performance Issues

---


---

### P-02 · `for...in` over scope fields includes prototype-chain properties
**File:** `src/utils/validation/interactionsEngine.js` lines 651, 705, 862
**Severity:** Medium

```js
for (const fieldId in scope.fields) {
  const fieldState = scope.fields[fieldId];
```

`for...in` iterates all enumerable own and inherited properties. If any library or polyfill adds to `Object.prototype`, those properties will be iterated, causing `scope.fields[fieldId]` to return unexpected values and `validationEngine.validateField` to be called with malformed data.

**Fix:** Replace with `for (const fieldId of Object.keys(scope.fields))` in all three locations.

---

### P-03 · `_selectorCache` eviction is FIFO, not LRU
**File:** `src/interactions/utils/engine.js` lines 30–32, 93–94
**Severity:** Low

```js
const _selectorCache = new Map()
const SELECTOR_CACHE_MAX = 500
// eviction:
_selectorCache.delete(_selectorCache.keys().next().value)  // deletes oldest inserted
```

The cache evicts the *oldest inserted* entry when full, not the *least recently used*. In a large SPA with many forms, the selectors for the very first form (which are most likely to be reused on "go back" navigation) are evicted first. A real LRU requires `delete` + `set` on every cache hit to maintain insertion order.

**Fix:** On a cache hit, delete and re-insert the entry to refresh its position:
```js
const el = cached.deref()
if (el) {
  _selectorCache.delete(cacheKey)
  _selectorCache.set(cacheKey, new WeakRef(el))  // refresh position
  return el
}
```

---

### P-04 · `showValidationErrors` performs DOM label lookups inside a loop
**File:** `src/utils/validation/interactionsEngine.js` lines 492–503
**Severity:** Low

```js
summary.invalidFields.forEach((invalidField, index) => {
  const labelElement = element.id
    ? document.querySelector(`label[for="${element.id}"]`)   // DOM query per field
    : element.closest('.form-group')?.querySelector('label') // DOM query per field
```

Each invalid field triggers one or two `document.querySelector` calls during an already O(n) loop. For a form with 20 invalid fields this is 20–40 synchronous DOM queries, each potentially forcing a full selector traversal.

**Fix:** Pre-build a `Map<elementId, labelText>` from `document.querySelectorAll('label[for]')` once before the loop.

---

### P-05 · `deepFreeze` in `engine.js` is O(n) recursive on every new config reference
**File:** `src/interactions/utils/engine.js` lines 56–60
**Severity:** Low

```js
function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) return obj
  Object.keys(obj).forEach(k => deepFreeze(obj[k]))
  return Object.freeze(obj)
}
```

Config objects passed as `binding.value` are frozen on first parse and cached by object reference (WeakMap key). If configs are re-created per render (e.g., `v-interactions="[{ rules: [...] }]"` as an inline literal), `deepFreeze` runs on every render. The comment on line 3 says "config is parsed ONCE at wire() time" but this relies on the consuming component memoizing the config object, which many do not.

**Fix:** Document that configs *must* be defined outside `<template>` or in `setup()` with `shallowRef` / `Object.freeze` applied by the caller, and add a DEV-mode warning if a non-frozen object is passed.

---

### P-06 · `processFieldChange` validates on every keystroke with no debounce
**File:** `src/utils/validation/interactionsEngine.js` lines 864–915
**Severity:** Low

Every `@input` event fires `validationEngine.validateField()` synchronously. For fields with many rules (e.g., a password field with 5 complexity rules), this is acceptable. But `custom` rule support (`validationsLibrary.custom`) allows an arbitrary function, meaning a slow custom validator runs on every keystroke.

**Fix:** Add an optional `debounceMs` field to `fieldConfig`. Provide a built-in debounce wrapper in `processFieldChange`.

--

### B-02 · `interactionsEngine` is a global singleton with no cleanup API
**File:** `src/utils/validation/interactionsEngine.js` lines 4–7
**Severity:** High

```js
export const interactionsEngine = {
  scopes: reactive({}),
  elementVisibility: reactive({}),
  originalValues: reactive({}),
```

All registered fields, visibility states, and original values accumulate globally for the lifetime of the browser session. In a SPA with navigation:
1. User visits `/login` → registers `loginForm` scope with 3 fields
2. User navigates to `/signup` → registers `signupForm` scope with 5 fields
3. User navigates back to `/login` → `loginForm` scope is re-registered, overwriting stale state (or adding duplicates if `register` is not idempotent)

There is no `unregister(fieldConfig)`, `clearScope(scopeId)`, or Vue lifecycle integration (no `onUnmounted` hook). Stale reactive objects hold DOM element references, preventing GC of detached elements.

**Fix:** Add:
```js
unregister(fieldConfig) {
  const scope = this.scopes[fieldConfig.scope];
  if (scope) delete scope.fields[fieldConfig.id];
},
clearScope(scopeId) {
  delete this.scopes[scopeId];
  // also clean elementVisibility and originalValues entries for this scope
},
```
Call `clearScope` from component `onUnmounted`.

---

### B-03 · `register` silently overwrites existing field state
**File:** `src/utils/validation/interactionsEngine.js` lines 565–596
**Severity:** Medium

```js
register(fieldConfig, initialValue, element) {
  ...
  this.scopes[scopeId].fields[fieldId] = reactive({ ... })  // always overwrites
```

If `register` is called twice for the same `scope + id` (e.g., due to component hot-reload, a dynamic form that re-renders, or a developer mistake), the previous field state — including any user-entered value and validation result — is silently discarded. No warning is emitted.

**Fix:** Add an idempotency check:
```js
if (this.scopes[scopeId]?.fields[fieldId]) {
  if (import.meta.env?.DEV)
    console.warn(`[InteractionsEngine] Field already registered: ${scopeId}.${fieldId}. Call unregister first.`);
  return;
}
```

---

### B-04 · `jumpToFieldPlaceholder` has a duplicate `console.log` alongside `logger.debug`
**File:** `src/utils/validation/interactionsEngine.js` lines 829–833
**Severity:** Low

```js
jumpToFieldPlaceholder(scopeId, fieldId) {
  this.logger.debug('jumpToFieldPlaceholder called for', scopeId, fieldId);
  console.log('[InteractionsEngine] jumpToFieldPlaceholder called for', scopeId, fieldId);  // duplicate
},
```

The method is a stub (TODO), but the raw `console.log` is unconditional and fires in production. Even stub methods should use the internal `logger`.

**Fix:** Remove the `console.log` line. The `logger.debug` call is sufficient.

---


---

### B-06 · `stampValidation` sets non-standard `validated` attribute without `aria-invalid`
**File:** `src/interactions/utils/engine.js` lines 141–147
**Severity:** Medium

```js
export function stampValidation(el, result) {
  el.setAttribute('validated', result.isValid ? 'true' : 'false')
  el.setAttribute('data-validation-reason', ...)
}
```

Custom `validated` attribute is used for CSS styling and the `validateScope` fast path. However, the standard accessibility attribute `aria-invalid` is never set. Screen readers rely on `aria-invalid="true"` to announce field errors to users with disabilities. Similarly, there is no `aria-describedby` linking the field to its error message element.

**Fix:**
```js
el.setAttribute('aria-invalid', result.isValid ? 'false' : 'true')
```

---

### B-07 · `isSelect` in `validationsLibrary.js` uses a hardcoded placeholder value list
**File:** `src/utils/validation/validationsLibrary.js` lines 175–183
**Severity:** Low

```js
isSelect(value) {
  if (value === "0" || value === "-1" || value === "placeholder") return false;
  return true;
}
```

Only three specific string values are treated as "no selection". Real-world selects commonly use `"none"`, `"choose"`, `"select"`, `"default"`, `""` (covered), or numeric strings other than `"0"` and `"-1"`. This makes the validator brittle and requires callers to know which placeholder values are detected.

**Fix:** Accept `param` as an array of disallowed placeholder values, or rely solely on the empty-string check (which is already handled by the required check upstream).

---

### B-08 · `passive: true` on all directive event listeners prevents `preventDefault`
**File:** `src/interactions/directives/vInteractions.js` line 73
**Severity:** Low

```js
el.addEventListener(eventType, handler, { passive: true })
```

`passive: true` tells the browser the handler will never call `preventDefault()`, enabling scroll optimization. This is correct for `input`, `change`, and `blur`, but if a caller adds `submit` to `triggerEvents`, the passive listener cannot prevent form submission. There is no guard against this combination.

**Fix:** Apply `{ passive: true }` only for known scroll/touch events (`wheel`, `touchstart`, `touchmove`). Use no options (or `{ passive: false }`) for `submit`, `keydown`, and `click`.

---

### B-09 · `minChar` and `minLength` are near-identical duplicates across both libraries
**File:** `src/interactions/utils/validationRules.js` lines 39 and 43; `src/utils/validation/validationsLibrary.js` lines 101–104 and 24–26
**Severity:** Low

Both rule libraries expose `minChar` and `minLength` with subtly different param handling:
- `validationRules.js minChar`: `parseInt(p, 10)` — returns `NaN` for non-numeric params, making the rule always pass
- `validationRules.js minLength`: `p || 0` — treats falsy param as 0
- `validationsLibrary.js` versions use `param || 0` and `param || 0` (same for both)

Having four near-identical implementations increases maintenance surface. Any rule fix must be applied in four places.

**Fix:** Consolidate into a single canonical rule set and alias the other.

---

### B-10 · `interactionsEngine.actionHandlers` methods reference `interactionsEngine` by closed-over name
**File:** `src/utils/validation/interactionsEngine.js` throughout `actionHandlers`
**Severity:** Low

```js
actionHandlers: {
  showElement(action) {
    interactionsEngine.elementVisibility[key] = true;  // direct reference, not `this`
  },
```

The handlers use the module-level `interactionsEngine` variable rather than `this`. This is not a bug in normal usage, but it breaks unit-testing: if you mock or replace `interactionsEngine`, action handlers in the original export still reference the original. It also makes `extendAction` overrides unable to call `this.getFieldState(...)`.

**Fix:** Replace all `interactionsEngine.xxx` references inside `actionHandlers` with a local alias via closure or pass the engine explicitly to handlers.

---

## 5. Missing Features

---

### M-01 · No async validation support
**Severity:** High

Both validation systems are entirely synchronous. There is no mechanism to:
- Check username availability against an API during sign-up
- Validate a coupon code
- Verify phone number format via a third-party service

The `custom` rule in `validationsLibrary.js` accepts a function but it must return a boolean synchronously.

**Required:** Async rule support with `Promise<boolean>` return, pending state tracking per field (for spinner display), and debounce before triggering async calls.

---

### M-02 · No `unregister` / `clearScope` on `interactionsEngine`
**Severity:** High

See [B-02](#b-02--interactionsengine-is-a-global-singleton-with-no-cleanup-api). Without cleanup, every mounted form permanently grows the global `scopes` reactive object. Long-lived SPAs will accumulate stale field state.

---

### M-03 · No cross-field re-validation when a source field changes
**Severity:** High

The `matchValue` rule checks if `confirmPassword === password`. But when the user changes the `password` field, the `confirmPassword` field is not automatically re-validated. A user could:
1. Enter `abc123` in both fields (both valid)
2. Change password to `xyz999` (password valid, confirm still shows valid stamp from step 1)
3. Submit — client-side appears valid, but passwords don't match

There is no dependency tracking: no way to declare "when field X changes, re-validate field Y".

**Required:** A `dependsOn` field in `fieldConfig` that triggers re-validation of dependents via `processFieldChange`.

---

### M-04 · No `touched` / `dirty` state per field in `interactionsEngine`
**Severity:** Medium

The engine tracks `isValid` and `failedRules` but not whether the user has interacted with a field. Without a `touched` flag:
- Error messages appear immediately on mount (via `initialPass` in the directive)
- There is no way to suppress errors for fields the user has never focused

The standard UX pattern is to show errors only after a field has been `touched` (focused then blurred) or after the form has been submitted.

**Required:** Add `touched: false` and `dirty: false` to field state. Set `touched = true` on `blur`. Expose `showError = touched && !isValid` for template binding.

---

### M-05 · `stampValidation` does not set `aria-invalid` or link error messages
**Severity:** Medium

See [B-06](#b-06--stampvalidation-sets-non-standard-validated-attribute-without-aria-invalid). This is both a best practice violation and a missing feature from an accessibility standpoint. The directive has no mechanism to automatically associate an error message element (`aria-describedby`) with the invalid field.

---

### M-06 · No maximum bound validation for event duration, title length, or price
**File:** `src/services/events/validators/eventStepValidators.js`
**Severity:** Medium

```js
// step1Validator — current checks:
if (duration == null || duration < 5) { ... }    // no maximum
if (basePrice == null || basePrice < 0) { ... }  // no maximum
if (!state?.eventTitle || ...) { ... }            // no maxLength
```

A creator could create an event with:
- Duration of `99999` minutes (~69 days)
- Price of `Number.MAX_VALUE`
- A title 100,000 characters long

All of these would pass `step1Validator` and likely cause database, UI rendering, or billing errors downstream.

**Fix:** Add upper bounds — e.g. `duration > 480` (8 hours), `basePrice > 10000`, `eventTitle.length > 200`.


---

### M-08 · No debounce mechanism in `processFieldChange`
**Severity:** Low

See [P-06](#p-06--processFieldChange-validates-on-every-keystroke-with-no-debounce). Particularly important for expensive `custom` rule functions or when validation triggers UI re-renders.

---

### M-09 · `showValidationErrors` uses a form field (`<textarea>` / `<input>`) as error display target
**File:** `src/utils/validation/interactionsEngine.js` lines 526–535
**Severity:** Low

```js
if (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') {
  targetElement.value = errorText;
```

Displaying error summaries inside a `<textarea>` is semantically incorrect and creates a poor accessibility experience. Screen readers announce `<textarea>` as an editable field, not an alert region. A user with a screen reader would have to navigate to the textarea and read its value rather than hearing it announced automatically.

**Fix:** Display validation summaries in `<div role="alert" aria-live="assertive">` or `<ul role="list">` elements.

---

### M-10 · `validateCreateEventPayload` does not validate `type` against a known enum
**File:** `src/services/events/validators/eventFlowValidators.js` lines 54–57
**Severity:** Low

```js
if (!isNonEmptyString(payload.type)) { errors.push("type is required."); }
```

Any non-empty string passes. If the API expects an enum (`"oneOnOne"`, `"group"`, `"webinar"`, etc.), invalid type strings will fail only at the server, returning an unhelpful generic error to the user.

---

### M-11 · No rate limiting or deduplication for `showBrowserError`
**File:** `src/interactions/utils/engine.js` lines 307–312
**Severity:** Low

```js
case 'showBrowserError': {
  el.setCustomValidity(msg); el.reportValidity()
  setTimeout(() => el.setCustomValidity(''), 800)
  break
}
```

If the action fires rapidly (e.g., on every keystroke while `triggerEvents` includes `input`), multiple overlapping `setTimeout` callbacks are scheduled. After 800 ms, all of them call `setCustomValidity('')`, clearing the error even if the field is still invalid.

**Fix:** Track the timeout ID per element and cancel pending timeouts before setting a new one.

--
## 7. Additional Issues (Incremental Audit)

Only **new issues** discovered in a second pass are listed below.

---

### L-11 · `validateScope` in directive engine can silently validate zero fields
**File:** `src/interactions/utils/engine.js` lines 164–185  
**Severity:** High

```js
const fields = root.querySelectorAll('[interaction-config]')
...
const configs = safeParseConfig(el.getAttribute('interaction-config')) ?? []
```

The directive-side scope validator only inspects elements with an `interaction-config` attribute. But `v-interactions` usage in components is done via bound objects/arrays and does **not** set this attribute, and project search shows almost no runtime form fields with `interaction-config`.

Result: `validateScope()` can return `isValid: true` even when the scope actually contains invalid `v-interactions` fields, because those fields are not discovered.

**Fix:** In `mounted` for `vInteractions`, stamp a normalized config attribute on the element (or register fields in a WeakMap keyed by scope), and make `validateScope` read that canonical registry.

---

### L-12 · Password visibility toggle mutates DOM type, but Vue binding can reset it on re-render
**File:** `src/components/input/InputAuthComponent.vue` lines 110 and 145  
**Severity:** Medium

```js
// interaction action
{ actionType: "toggleDisplay", targetSelector: `#${props.id}`, attribute: "type", values: ["password", "text"] }
```

```html
<input :id="id" :type="type" ... />
```

The eye-click action mutates the real DOM `type` attribute, but Vue still treats `type` as derived from the prop (`"password"`). Any subsequent render can patch the input back to `"password"`, causing inconsistent visibility behavior.

**Fix:** Track `isPasswordVisible` in component state and bind `:type="isPasswordVisible ? 'text' : type"` instead of mutating DOM attributes externally.

---

### S-06 · OAuth popup `postMessage` handlers do not enforce trusted origins
**Files:** `src/components/auth/AuthLogIn.vue`, `src/components/auth/AuthSignUp.vue`  
**Severity:** High

Both handlers primarily validate `event.source === popup` and state token, and explicitly avoid strict origin checks. They also reply using `event.origin || "*"`.

This increases risk when popup navigation is compromised/misdirected, because messages from an unexpected origin can still be processed if state is leaked.

**Fix:** Validate `event.origin` against a strict allowlist of expected OAuth callback origins and use that validated origin for acknowledgements (never `"*"` fallback).




### L-13 · Numeric coercion allows non-integer IDs and fractional limits in event flow validators
**File:** `src/services/events/validators/eventFlowValidators.js` lines 13–21 and 46–56  
**Severity:** Medium

```js
if (toNumber(payload.creatorId) == null) { ... }
...
const limit = toNumber(payload.limit);
if (limit == null || limit <= 0 || limit > 200) { ... }
```

`toNumber` accepts any finite numeric value, so values like `creatorId: 1.5` and `limit: 12.7` pass validation even if API contracts expect integer identifiers and integer pagination limits.

**Fix:** Enforce integer checks (`Number.isInteger(...)`) and apply explicit bounds for ID semantics.

--

---

## 8. Additional Issues (Third Pass — Data Pipeline + Cross-System)

Only **new issues** from this pass are listed below (including flow data pipeline integration).

---

### L-14 · `interactionsEngine.validateScope` treats missing scopes as valid

**File:** `src/utils/validation/interactionsEngine.js` — lines 638–646

```js
validateScope(scopeId) {
  const scope = this.scopes[scopeId];
  if (!scope) {
    return {
      scopeId,
      isValid: true,   // ← silent pass
      invalidFields: [],
      firstInvalidField: null
    };
  }
```

If a component calls `validateScope('wrongScope')` before fields are registered, or after `clearScope` (when implemented), validation returns success with zero fields checked.

**Impact:** Submit/navigation guards can proceed with no validation (typo-prone scope IDs, race on mount).

**Fix:** Return `isValid: false` with a synthetic error such as `SCOPE_NOT_REGISTERED`, or throw in DEV mode.

---

### L-15 · `stateEngine.addFieldRequirement` validates without field context

**File:** `src/utils/stateEngine.js` — lines 481–488

```js
addFieldRequirement(step, path, validationConfig) {
  this.addValidator(step, async (state) => {
    const value = deepGet(state, path);
    const result = validationEngine.validateField(value, validationConfig);
```

`validateField` is called with only `(value, validationConfig)` — no `context.element`, no `getFieldValue`, no scope/fieldId.

**Impact:** Rules that depend on context fail or behave incorrectly in the step engine pipeline:
- `matchValue` (confirm password vs password)
- `isMultiCheck` / `isRadioCheck` (DOM queries)
- HTML `required` / `data-required` attribute checks via element

Booking flow step validators in `UnifiedBookingForm.vue` use this path, so cross-field and DOM-aware rules cannot work there.

**Fix:** Pass a full context object (scope, fieldId, optional element ref, `getFieldValue`) into `validateField`.

---

### L-16 · `custom` validation rule fails open when `param` is not a function

**File:** `src/utils/validation/validationsLibrary.js` — lines 11–17

```js
custom(value, param, ctx) {
  if (typeof param === "function") {
    return param(value, ctx);
  }
  return true;  // ← misconfigured rule always passes
},
```

A typo or missing `param` function makes the rule always succeed.

**Impact:** Silent bypass of intended custom validation in the reactive engine pipeline.

**Fix:** Return `false` (or throw in DEV) when `param` is not a function.

---

### L-17 · `isSecurePassword` rules diverge between directive and engine libraries

**Files:** `src/interactions/utils/validationRules.js` line 69 vs `src/utils/validation/validationsLibrary.js` lines 39–49

| Library | Requirement |
|---------|-------------|
| `validationRules.js` (directive) | Upper + lower + digit, min 8 — **no special character** |
| `validationsLibrary.js` (engine) | Upper + lower + digit + **special character**, min 8 |

The same field validated via `v-interactions` vs `interactionsEngine` can pass in one path and fail in the other.

**Fix:** Unify to one canonical implementation and import it in both places.

---

### L-18 · `processFieldChange` runs `onValid`/`onInvalid` from pre-`onChange` validation

**File:** `src/utils/validation/interactionsEngine.js` — lines 864–914

Pipeline order:

1. Set `state.value`
2. Validate
3. Run `events.input.onChange` actions (may sync/mutate other fields)
4. Run `onValid` / `onInvalid` based on step 2’s result

If `onChange` fixes or breaks validity (e.g., sync clears a dependent field), UI actions still reflect the stale validation outcome.

**Fix:** Re-validate after `onChange`, or run `onChange` before validation.

---

### L-19 · `registerRule` does not update `validationsLibrary` (false “single source of truth”)

**Files:** `src/interactions/utils/validationRules.js` lines 6–12, `src/interactions/index.js`

Comments claim one rule library for both systems, but `registerRule` only mutates `validationRules.js`. `validationEngine` reads exclusively from `validationsLibrary.js`.

**Impact:** Rules registered at plugin boot via `InteractionsPlugin` work for `v-interactions` but not for auth/booking components using `interactionsEngine`.

**Fix:** Mirror registrations into `validationsLibrary`, or merge both into one exported registry.

---

### L-20 · `isRadioCheck` builds CSS selector from unescaped `name` param

**File:** `src/interactions/utils/validationRules.js` — line 31

```js
el?.querySelector(`input[type=radio][name="${name}"]:checked`)
```

If `name` contains `"` or other selector-breaking characters, the selector can break or match unintended nodes.

**Fix:** Use `CSS.escape(name)` or validate `name` against a safe pattern before querying.

---

### S-07 · `script` action can invoke arbitrary global functions via `window[functionName]`

**File:** `src/utils/validation/interactionsEngine.js` — lines 161–163

```js
} else if (action.functionName && typeof window[action.functionName] === 'function') {
  window[action.functionName](...action.args || []);
}
```

In addition to `eval` (S-01), this allows calling any global function exposed on `window` from interaction config.

**Fix:** Use an allowlisted map of callable functions, same as recommended for `eval` removal.

---

### S-08 · `extendAction` allows unreviewed runtime action handler registration

**File:** `src/utils/validation/interactionsEngine.js` — lines 560–563

```js
extendAction(type, handlerFn) {
  this.actionHandlers[type] = handlerFn;
}
```

Any module can register handlers that run during validation events with access to field state and DOM elements.

**Fix:** require registration through a reviewed allowlist.

---

### S-09 · `pushEvent` accepts raw DOM nodes as `action.target`

**File:** `src/utils/validation/interactionsEngine.js` — lines 144–148

```js
const target = action.target === 'window' || !action.target
  ? window
  : action.target === 'document'
    ? document
    : action.target;  // arbitrary node
target.dispatchEvent(event);
```

If action config is influenced by external input, events can be dispatched on unintended elements.

**Fix:** Allow only `'window'`, `'document'`, or known element keys resolved through a trusted registry.

---

### P-08 · `scopeHasNoBlockingInvalids` re-validates every field on each call

**File:** `src/utils/validation/interactionsEngine.js` — lines 705–721

The method loops all fields and calls `validationEngine.validateField` for each one, duplicating work already done by `validateScope` or `processFieldChange` in the same submit flow.

**Impact:** O(n) full validation per guard check; amplified on large forms.

**Fix:** Reuse cached `fieldState.isValid` when not dirty, or accept a precomputed `validateScope` result.

---

### P-09 · Booking step navigation runs two separate validation pipelines

**File:** `src/components/ui/form/BookingForm/OneOnOneBookinStep1.vue` — lines 94–118



### BP-12 · Incompatible action config shapes: `actionType` vs `type`

**Files:** `src/interactions/utils/engine.js` (`action.actionType`), `src/utils/validation/interactionsEngine.js` (`action.type`)

The directive engine and reactive engine use different property names for the same concept. Config snippets are not portable between `v-interactions` and `interactionsEngine.runInteractions`.

**Fix:** Normalize on ingest (accept both keys) or document/enforce one schema.

---

### BP-13 · `stateEngine` API object lists `registerValidator` twice

**File:** `src/utils/stateEngine.js` — lines 461–465

```js
registerValidator,
// validator registration
registerValidator,
```

Duplicate key in the exported API object (harmless at runtime but signals copy-paste drift).

**Fix:** Remove the duplicate entry.



## 9. Cross-System Integration (Interactions ↔ Flow System)

Flow-registry, cache, retry, middleware, and `flowDataPipeline` implementation issues are in [`FLOW_SYSTEM_AUDIT.md`](../services/flow-system/FLOW_SYSTEM_AUDIT.md) §9. This section covers **gaps between** UI/step validation and `FlowHandler.run` only.

---

### INT-01 · Three validation pipelines are disconnected (UI vs flow vs step engine)

**Systems:**

| Pipeline | Location | Used by |
|----------|----------|---------|
| Interactions | `interactionsEngine.processFieldChange` / `validateScope` | Auth, booking UI |
| Step engine | `stateEngine.runValidators` | Multi-step forms |
| Flow data | `flowDataPipeline.validatePayload/Response` | `FlowHandler.run` |

There is no shared rule registry or pre-flight hook: UI can show valid state while `FlowHandler.run('events.createEvent')` sends unvalidated payloads (see flow audit BUG-07 — create-event validators not registered).

**Fix:** Add a `validateBeforeFlow(flowName, payload)` bridge that reuses domain validators, or register UI validators into flow registry entries.

---

### INT-02 · `interactionsEngine` change pipeline has no stage timing, cancellation, or error surfacing

**File:** `src/utils/validation/interactionsEngine.js` — `processFieldChange` / `runInteractions`

Unlike `flowDataPipeline` (stages, timings, `finalizeError`, UI error maps), the interactions validation pipeline has no structured stage metadata, no abort if an action throws, and errors in `runInteractions` only log to console.

**Impact:** Harder to debug validation/action failures in production; one thrown action can break the pipeline without a structured result to the UI.

**Fix:** Wrap `runInteractions` in try/catch per action, return `{ isValid, actionErrors }`, optional DEV stage logging aligned with flow pipeline conventions.

---

### INT-03 · No validation gate before `FlowHandler.run` in UI call sites

**Scope:** Components calling `FlowHandler.run` (chat, cart, analytics, orders)

Grep shows no usage of `interactionsEngine` or `validationEngine` before flow execution in those templates. Validation is assumed to have happened elsewhere or not at all.

**Impact:** Network requests can fire with invalid client payloads despite rich UI validation existing in other modules.

**Fix:** Standardize `submitFlow(flowName, payload, { validateUiScope })` helper that runs UI + flow validators before `FlowHandler.run`.

---

### Cross-System Summary

| ID | Category | Severity | Description |
|----|----------|----------|-------------|
| INT-01 | Integration | High | UI, state engine, and flow pipelines are disconnected |
| INT-02 | Integration | Medium | Interactions pipeline lacks structured stages/errors (vs flow pipeline) |
| INT-03 | Integration | High | No shared pre-flight validation before `FlowHandler.run` |

---

## 10. Additional Issues (Fourth Pass)

Only **new issues** discovered in a third pass are listed below.

---

### L-14 · `interactionsEngine.validateScope` returns valid when scope is missing
**File:** `src/utils/validation/interactionsEngine.js` lines 638–646  
**Severity:** High

```js
validateScope(scopeId) {
  const scope = this.scopes[scopeId];
  if (!scope) {
    return { scopeId, isValid: true, invalidFields: [], firstInvalidField: null };
  }
```

If a scope ID is mistyped, fields were never registered, or registration failed (e.g. `getElementById` returned `null` at mount), callers still receive `isValid: true`. This can allow step transitions and API calls when no validation actually ran.

**Fix:** Return `isValid: false` (or throw in DEV) when the scope is missing, with an explicit error such as `scope-not-registered`.

---

### S-07 · Signup flow stores plaintext password in `sessionStorage`
**Files:** `src/components/auth/AuthSignUp.vue` lines 992–994; `src/components/auth/AuthConfirmEmail.vue` lines 433–444  
**Severity:** High

```js
sessionStorage.setItem("pendingSignupPassword", password.value);
```

The password is persisted in plaintext in session storage for auto-login after email confirmation. Any script running on the origin (XSS, compromised dependency, malicious extension) can read it. It also survives until explicitly removed and may remain after tab close depending on browser behavior.

**Fix:** Avoid storing passwords client-side. Prefer a server-side “confirm then login” token, or require the user to sign in manually after confirmation.

---

### L-15 · `isSecurePassword` rules differ on special-character requirement
**Files:** `src/interactions/utils/validationRules.js` line 69; `src/utils/validation/validationsLibrary.js` lines 39–48  
**Severity:** Medium

| Library | Rule |
|---------|------|
| `validationRules.js` | Upper + lower + digit + length ≥ 8 |
| `validationsLibrary.js` | Upper + lower + digit + **special** + length ≥ 8 |

`AuthResetPassword.vue` uses `hasSpecial` plus `minLength` via the engine library, while directive-based forms using `isSecurePassword` alone would not enforce special characters. Password policy is inconsistent across surfaces.

**Fix:** Unify password policy in one shared module and reference it from both libraries and auth field configs.

---

### L-16 · Duplicate `id="code"` in confirm-email flow breaks field registration
**File:** `src/components/auth/AuthConfirmEmail.vue` lines 32–38; `src/components/input/CodeInputAuthComponent.vue` line 288  
**Severity:** High

`AuthConfirmEmail` renders:

```html
<input type="hidden" id="code" :value="code" />
<CodeInputAuthComponent id="code" ... />
```

`CodeInputAuthComponent` also renders a hidden input with the same `id`. HTML IDs must be unique; `document.getElementById('code')` returns the first match (parent hidden field). `interactionsEngine.register(codeConfig, ..., codeElement)` may bind to the wrong element (no `v-interactions`, different update path), causing validation/state drift.

**Fix:** Use a single hidden field (either parent or child), unique IDs, and register the element that actually receives updates.

---

### B-12 · Unknown validation rule types are treated as hard failures
**File:** `src/utils/validation/validationEngine.js` lines 148–155  
**Severity:** Medium

```js
if (!fn) {
  failedRules.push({ type: rule.type, message: rule.message || `Unknown rule: ${rule.type}` });
  continue;
}
```

A typo in rule `type` (e.g. `isEMail` instead of `isEmail`) makes the field permanently invalid with a generic message, rather than surfacing a developer configuration error. This is easy to miss during refactors.

**Fix:** In DEV, throw or log loudly for unknown rules; in production, fail closed but include telemetry. Optionally validate rule names at `register()` time.

---

### L-17 · Directive `validateScope` fast path trusts stale `validated` stamps
**File:** `src/interactions/utils/engine.js` lines 173–181  
**Severity:** Medium

When `validated` is already set, scope validation reuses the stamp without re-running rules against the current value. If a field value changed programmatically (sync action, script, Vue model update) without triggering `handleInteraction`, the stamp can still read `validated="true"` for an now-invalid value.

**Fix:** Re-validate on `validateScope`, or invalidate stamps when value changes outside the directive event path.

---

### B-13 · `isRadioCheck` in engine library queries the entire document
**File:** `src/utils/validation/validationsLibrary.js` lines 214–218  
**Severity:** Medium

```js
const radios = document.querySelectorAll(`input[type="radio"][name="${param}"]`);
```

Unlike `validationRules.js` (which scopes to `[interaction-container]`), this checks **all** radios with that name in the document. Duplicate group names elsewhere can make unrelated selections satisfy validation.

**Fix:** Scope queries to `ctx.element.closest('form')` or a provided container, matching the directive implementation.

---

### M-12 · Confirm-email code errors are computed but never shown in the OTP UI
**Files:** `src/components/auth/AuthConfirmEmail.vue` lines 37–38, 197–204; `src/components/input/CodeInputAuthComponent.vue`  
**Severity:** Medium

`AuthConfirmEmail` passes `:show-errors="codeErrors.length > 0"` and `:errors="codeErrors"` to `CodeInputAuthComponent`, but that component does not declare or render these props (same class of bug as B-11). Users only see a generic form-level error after submit failure, not per-digit/code validation feedback.

**Fix:** Add error rendering to `CodeInputAuthComponent`, or render `codeErrors` in `AuthConfirmEmail` below the OTP widget.

---

### L-18 · Booking step treats `interactionsEngine.validateScope` as full-step validation
**File:** `src/components/ui/form/BookingForm/OneOnOneBookinStep1.vue` lines 94–118  
**Severity:** Medium

`goToNext()` gates navigation on `interactionsEngine.validateScope('oneOnOneBooking')`, but only `eventTitle` is registered in that scope. Other required booking fields (duration, price, availability, etc.) are not registered and are not validated by this call. The step can advance after title-only validation while other invalid data remains.

**Fix:** Register all required fields in the scope, or run `stateEngine` step validators (and/or `eventStepValidators`) before `goToStep(2)`.

---

### B-14 · Directive `getFieldValue` always trims input values
**File:** `src/interactions/utils/engine.js` line 112  
**Severity:** Low

```js
return String(el.value ?? '').trim()
```

Leading/trailing spaces are removed before rule evaluation. This can cause `matchValue`/`minLength` results to differ from raw input and from `interactionsEngine` (which does not trim in `_getElementValue`). Passwords or codes intentionally containing spaces will validate differently across systems.

**Fix:** Trim only for rules that require it, or align trimming behavior across both engines.

---

### P-08 · `initialPass` runs all interaction configs on mount (pre-interaction side effects)
**File:** `src/interactions/directives/vInteractions.js` lines 119–124  
**Severity:** Low

On mount, `initialPass` calls `handleInteraction` for every config block, executing `onValid`/`onInvalid` actions before the user interacts. This can prematurely show/hide elements (e.g. password eye icon, helper text) and dispatch `validation:pass`/`validation:fail` events with empty/default values.

**Fix:** Separate “silent validate” from “execute actions”, or run initial validation without action side effects unless `runActionsOnMount` is explicitly enabled.

---

### S-10 · `custom` validation rule silently passes when `param` is not a function
**File:** `src/utils/validation/validationsLibrary.js` lines 11–17  
**Severity:** Medium

```js
custom(value, param, ctx) {
  if (typeof param === "function") return param(value, ctx);
  return true;
}
```

Misconfigured `custom` rules (wrong param type, missing callback) always succeed, bypassing intended validation.

**Fix:** Return `false` (or throw in DEV) when `param` is not a function.

---

*Flow-system-only audit items (registry, `flowDataPipeline`, cache, retry, middleware, etc.) live in [`src/services/flow-system/FLOW_SYSTEM_AUDIT.md`](../services/flow-system/FLOW_SYSTEM_AUDIT.md) §9–10. They were removed from this file to avoid duplicating BUG-01 and related flow findings.*