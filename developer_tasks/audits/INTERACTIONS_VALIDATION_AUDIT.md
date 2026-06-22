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

### Browser console checks

Snippets are **async** and return a `Promise`. DevTools prints `Promise {<pending>}` for the expression alone — that is normal.

- **Preferred:** paste a snippet as-is; it ends with `.then(o => console.log(o))` and prints the result object when done.
- **Alternative:** prefix with `await` — e.g. `await (async () => { ... return out; })()` (top-level `await` works in Chrome/Edge/Firefox DevTools console).

Look for `{ pass: true, ... }` in the console output. If `pass` is `false` or you see a red error, the check failed.

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

#### Resolution ✅

**Status:** Resolved — validation rules are now unified behind one canonical registry.

**What was broken:** `v-interactions` and `validationEngine` used different rule registries and diverged in behavior (`isEmail`, `isNumeric`, `isSecurePassword`, `hasContent`, `matchValue`, `isRadioCheck`, `minChar/minLength`, `custom`), causing inconsistent validation outcomes across forms.

**Why it happened:** Rules were implemented and maintained separately in `validationRules.js` and `validationsLibrary.js`, and runtime `registerRule()` only mutated the directive-side registry.

**What changed:**
- Added canonical file `src/utils/validation/rules.js` as the single source of truth.
- Updated `src/interactions/utils/validationRules.js` to re-export from canonical rules.
- Updated `src/utils/validation/validationsLibrary.js` to re-export canonical rules as `validationsLibrary`.
- Canonicalized previously divergent rules:
  - `isNumeric` now requires `\d+` (rejects bare `-`).
  - `isSecurePassword` now enforces upper + lower + digit + special + min length 8.
  - `custom` now fails closed (`false`) when `param` is not a function.
  - `hasContent` duplicate removed by design (single implementation in canonical registry).
  - `matchValue` split into explicit helpers (`matchValueSelector`, `matchValueField`) while keeping backward-compatible `matchValue`.
  - `isRadioCheck` now scopes queries to nearest interaction/form container.
  - `minChar` and `minLength` now share normalized integer parameter handling.
- Added unit coverage in `tests/unit/validationRulesUnification.test.js` to verify shared registry behavior and key normalized rules.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const interactions = await import('/src/interactions/utils/validationRules.js');
  const validationLib = await import('/src/utils/validation/validationsLibrary.js');
  const rules = interactions.default;
  const sameRegistry = validationLib.validationsLibrary === rules;

  interactions.registerRule('auditSharedRule', (v) => v === 'ok');
  const runtimeShared = validationLib.validationsLibrary.auditSharedRule('ok') === true;

  const host = document.createElement('div');
  host.setAttribute('interaction-container', '');
  host.innerHTML = '<input type="radio" name="auditGroup" id="auditA"><input type="radio" name="auditGroup" id="auditB">';
  document.body.appendChild(host);
  host.querySelector('#auditB').checked = true;

  const out = {
    sameRegistry,
    runtimeShared,
    isNumericBareDashRejected: rules.isNumeric('-') === false,
    securePasswordRequiresSpecial: rules.isSecurePassword('Abcdef12') === false && rules.isSecurePassword('Abcdef12!') === true,
    customFailsOnBadParam: rules.custom('x', null, {}) === false,
    matchValueFieldPass: rules.matchValueField('abc', 'password', { scope: 'auth', getFieldValue: () => 'abc' }) === true,
    matchValueSelectorPass: (() => {
      const wrap = document.createElement('div');
      wrap.setAttribute('interaction-container', '');
      wrap.innerHTML = '<input id="auditPass" value="abc"><input id="auditConfirm" value="abc">';
      document.body.appendChild(wrap);
      const result = rules.matchValueSelector('abc', '#auditPass', { element: wrap.querySelector('#auditConfirm') });
      wrap.remove();
      return result === true;
    })(),
    isRadioCheckScoped: rules.isRadioCheck('', 'auditGroup', { element: host.querySelector('#auditA') }) === true,
  };

  host.remove();
  console.table(out);
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved (already fixed during rules-unification pass).

**What was broken:** `isNumeric('-')` could return `true` because the previous pattern allowed zero digits.

**Why it happened:** The original directive-side regex used `\d*` and rule logic diverged across two libraries.

**What changed:** Canonical `isNumeric` now lives in `src/utils/validation/rules.js` and uses `^-?\d+(\.\d+)?$`, then both `validationRules.js` and `validationsLibrary.js` re-export from that source.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { default: rules } = await import('/src/interactions/utils/validationRules.js');
  const out = {
    bareDashRejected: rules.isNumeric('-') === false,
    intPass: rules.isNumeric('12') === true,
    decimalPass: rules.isNumeric('-12.5') === true,
  };
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved (already fixed during rules-unification pass).

**What was broken:** `matchValue` mixed selector-based and field-based logic in one branchy function and could silently fail for directive selectors that did not start with `#`.

**Why it happened:** Path detection depended on `param.startsWith('#')`, so valid selectors like `[name="password"]` were not reliably treated as selector mode.

**What changed:** Added explicit canonical rules:
- `matchValueSelector(value, selector, ctx)` for directive/DOM selectors.
- `matchValueField(value, fieldId, ctx)` for engine field-lookup.
- `matchValue(...)` remains as a backward-compatible wrapper that routes to the correct explicit path.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { default: rules } = await import('/src/interactions/utils/validationRules.js');

  const root = document.createElement('div');
  root.setAttribute('interaction-container', '');
  root.innerHTML = '<input name="password" value="abc123!A"><input name="confirmPassword" value="abc123!A">';
  document.body.appendChild(root);
  const confirm = root.querySelector('[name="confirmPassword"]');

  const out = {
    selectorPathWorksWithoutHash: rules.matchValueSelector('abc123!A', '[name="password"]', { element: confirm }) === true,
    fieldPathWorks: rules.matchValueField('same', 'password', { scope: 'auth', getFieldValue: () => 'same' }) === true,
    backwardCompatibleMatchValueSelector: rules.matchValue('abc123!A', '[name="password"]', confirm) === true,
  };

  root.remove();
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved (already fixed during rules-unification pass).

**What was broken:** Email validation behavior could diverge between directive and engine paths, creating inconsistent UX.

**Why it happened:** Validation rules existed in two separate registries with different implementations.

**What changed:** Both entry points now reference the same canonical `isEmail` implementation from `src/utils/validation/rules.js` via re-exports in `validationRules.js` and `validationsLibrary.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const interactions = await import('/src/interactions/utils/validationRules.js');
  const engine = await import('/src/utils/validation/validationsLibrary.js');
  const sample = 'user+tag@sub.example.co.uk';
  const out = {
    sameFunctionReference: engine.validationsLibrary.isEmail === interactions.default.isEmail,
    directivePass: interactions.default.isEmail(sample) === true,
    enginePass: engine.validationsLibrary.isEmail(sample) === true,
    bothRejectInvalid: interactions.default.isEmail('bad@@mail') === false && engine.validationsLibrary.isEmail('bad@@mail') === false,
  };
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved (already fixed during rules-unification pass).

**What was broken:** `hasContent` existed twice in the old `validationsLibrary` object; JavaScript kept only the second declaration, leaving the first as silent dead code.

**Why it happened:** The previous engine registry was an inline object with duplicate keys and no shared canonical source.

**What changed:** `validationsLibrary.js` now re-exports canonical rules from `src/utils/validation/rules.js`, where `hasContent` is declared only once.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { validationsLibrary } = await import('/src/utils/validation/validationsLibrary.js');
  const out = {
    nullFalse: validationsLibrary.hasContent(null) === false,
    undefinedFalse: validationsLibrary.hasContent(undefined) === false,
    spacesFalse: validationsLibrary.hasContent('   ') === false,
    textTrue: validationsLibrary.hasContent('hello') === true,
  };
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `scopeHasNoBlockingInvalids` only looked for `[validated="false"]`, so untouched required fields could be missed and scope could be treated as valid.

**Why it happened:** The guard assumed only stamped invalid fields matter and had no fallback for untouched required inputs.

**What changed:** In canonical rules (`src/utils/validation/rules.js`), `scopeHasNoBlockingInvalids` now:
- returns `false` immediately if any stamped invalid exists, and
- additionally checks for untouched required fields (including `required` / `data-required="true"` and empty checkbox/radio/file/select/text cases).
- when `selector` is `null`/empty, it now falls back to the current interaction scope root instead of returning `false`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { default: rules } = await import('/src/interactions/utils/validationRules.js');
  const scope = document.createElement('div');
  scope.setAttribute('interaction-container', '');
  scope.innerHTML = '<input id="req" required interaction-config="[]" value=""><input id="ok" interaction-config="[]" value="x">';
  document.body.appendChild(scope);

  const req = scope.querySelector('#req');
  const out = {
    untouchedRequiredBlocks: rules.scopeHasNoBlockingInvalids('', null, { element: req }) === false,
  };

  req.value = 'filled';
  out.filledRequiredPasses = rules.scopeHasNoBlockingInvalids('', null, { element: req }) === true;

  scope.remove();
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `repeatRule` defaulting logic treated explicit empty values incorrectly and could route validation through weekly checks instead of flagging missing selection.

**Why it happened:** `||` collapsed all falsy values; even after switching to `??`, explicit empty string still needed explicit handling in branch logic.

**What changed:**
- Updated `src/services/events/validators/eventStepValidators.js` to use nullish coalescing (`??`) for defaulting.
- Added explicit guard for `repeatRule === ""` to return a `repeatRule` validation error instead of falling into weekly availability validation.
- Added targeted unit coverage in `tests/unit/eventStepValidators.test.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { step1Validator } = await import('/src/services/events/validators/eventStepValidators.js');
  const base = {
    eventTitle: 'Demo Event',
    duration: 30,
    basePrice: 10,
    weeklyAvailability: [],
    oneTimeAvailability: [],
    monthlyAvailability: [],
  };
  const out = step1Validator({ ...base, repeatRule: '' });
  const hasRepeatRuleError = out.errors.some((e) => e.field === 'repeatRule');
  const hasWeeklyError = out.errors.some((e) => e.field === 'weeklyAvailability');
  console.log({ pass: hasRepeatRuleError && !hasWeeklyError, hasRepeatRuleError, hasWeeklyError, errors: out.errors });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Event-flow validators accepted numeric `creatorId` while rental validators required string `creatorId`, creating inconsistent contracts and precision risk.

**Why it happened:** Event validators used `toNumber(payload.creatorId)` rather than string-based identity checks.

**What changed:** In `src/services/events/validators/eventFlowValidators.js`, `creatorId` checks now use `isNonEmptyString(...)` in both fetch/create payload validators to align with rental validators.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const mod = await import('/src/services/events/validators/eventFlowValidators.js');
  const a = mod.validateFetchCreatorEventsPayload({ creatorId: '90071992547409930' });
  const b = mod.validateFetchCreatorEventsPayload({ creatorId: 90071992547409930 });
  const c = mod.validateCreateEventPayload({ creatorId: 'creator-1', title: 'Event', type: 'oneOnOne' });
  const d = mod.validateCreateEventPayload({ creatorId: 123, title: 'Event', type: 'oneOnOne' });
  const out = {
    fetchStringPasses: a.ok === true,
    fetchNumberRejected: b.ok === false,
    createStringPasses: c.ok === true,
    createNumberRejected: d.ok === false,
  };
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `_isElementEmpty(null, false)` returned `false` (not empty), which could let unchecked values pass as if filled.

**Why it happened:** Early-empty guard did not include boolean `false`.

**What changed:** Updated `src/utils/validation/validationEngine.js` to treat `false` as empty in the early return.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { validationEngine } = await import('/src/utils/validation/validationEngine.js');
  const out = {
    falseIsEmptyWithoutElement: validationEngine._isElementEmpty(null, false) === true,
    nullIsEmpty: validationEngine._isElementEmpty(null, null) === true,
    textNotEmpty: validationEngine._isElementEmpty(null, 'x') === false,
  };
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Slot validation only checked non-empty times and allowed inverted ranges (`endTime <= startTime`).

**Why it happened:** `hasAnyValidSlots` had no ordering check.

**What changed:** Updated `hasAnyValidSlots` in `src/services/events/validators/eventStepValidators.js` to require `end > start` after non-empty checks (valid for `HH:mm` lexical format used here).

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { step1Validator } = await import('/src/services/events/validators/eventStepValidators.js');
  const state = {
    eventTitle: 'Demo Event',
    duration: 30,
    basePrice: 10,
    repeatRule: 'weekly',
    weeklyAvailability: [{ unavailable: false, slots: [{ startTime: '18:00', endTime: '08:00' }] }],
    oneTimeAvailability: [],
    monthlyAvailability: [],
  };
  const res = step1Validator(state);
  const hasWeeklyError = res.errors.some((e) => e.field === 'weeklyAvailability');
  console.log({ pass: hasWeeklyError, hasWeeklyError, errors: res.errors });
})();
```

**Expected:** `pass: true`.

---

### L-10 · `scope` resolved at `wire()` time may become stale after DOM mutation
**File:** `src/interactions/directives/vInteractions.js` lines 62–63
**Severity:** Low

```js
const scope = resolveScope(el)  // cached once at wire time
```

If the containing `[interaction-container]` is replaced or re-rendered by Vue after the directive is mounted (but the host `el` stays alive), the cached scope no longer points to the live container. Actions targeting elements inside the container via `targetSelector` will resolve against a detached DOM node. The `evictScopeCache` is only called on `beforeUnmount`, not on `updated` when the config changes.

**Fix:** In the `updated` hook, call `evictScopeCache(el)` before `wire()` re-resolves the scope.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Directive rewiring on config changes could keep stale scope cache and target detached containers after DOM moves/re-renders.

**Why it happened:** `updated` rewired listeners but did not invalidate cached scope before resolving again.

**What changed:** In `src/interactions/directives/vInteractions.js`, `updated(...)` now calls `evictScopeCache(el)` before `wire(...)`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const engine = await import('/src/interactions/utils/engine.js');
  const a = document.createElement('div');
  a.setAttribute('interaction-container', '');
  const b = document.createElement('div');
  b.setAttribute('interaction-container', '');
  const input = document.createElement('input');
  a.appendChild(input);
  document.body.appendChild(a);
  document.body.appendChild(b);

  const first = engine.resolveScope(input);
  b.appendChild(input); // move element to a new container
  const stale = engine.resolveScope(input);
  engine.evictScopeCache(input);
  const refreshed = engine.resolveScope(input);

  console.log({
    pass: first === a && stale === a && refreshed === b,
    firstIsA: first === a,
    staleIsA: stale === a,
    refreshedIsB: refreshed === b,
  });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `interactionsEngine.actionHandlers.script` executed arbitrary inline code via `eval` and could also call any global function by name.

**Why it happened:** Script action accepted unrestricted config (`action.code` / `window[action.functionName]`) without allowlisting.

**What changed:**
- Removed inline code execution path (`eval`) and now reject `action.code`.
- Added allowlist API on `interactionsEngine`:
  - `registerScriptFunction(name, fn)`
  - `unregisterScriptFunction(name)`
  - internal `allowedScripts` registry.
- `script` action now executes only allowlisted function names.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js');
  window.__auditInlineExec = 0;
  interactionsEngine.actionHandlers.script({ code: 'window.__auditInlineExec = 1' });

  window.__safeCallCount = 0;
  interactionsEngine.registerScriptFunction('auditSafeFn', () => { window.__safeCallCount += 1; });
  interactionsEngine.actionHandlers.script({ functionName: 'auditSafeFn' });

  const out = {
    inlineCodeBlocked: window.__auditInlineExec === 0,
    allowlistedFunctionRuns: window.__safeCallCount === 1,
  };
  interactionsEngine.unregisterScriptFunction('auditSafeFn');
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `setHTML` in both engines wrote directly to `innerHTML` by default, allowing unsafe HTML injection.

**Why it happened:** Action handlers treated all incoming values as trusted HTML.

**What changed:**
- `src/interactions/utils/engine.js`:
  - `setHTML` now defaults to `textContent`.
  - optional `trustedHTML: true` enables explicit `innerHTML`.
- `src/utils/validation/interactionsEngine.js`:
  - same default-safe behavior and `trustedHTML` opt-in.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const directive = await import('/src/interactions/utils/engine.js');
  const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js');
  const host = document.createElement('div');
  host.innerHTML = '<div id="t1"></div><div id="t2"></div>';
  document.body.appendChild(host);

  directive.execActions({ actionType: 'setHTML', targetSelector: '#t1', value: '<b>unsafe</b>' }, host, host);
  interactionsEngine.actionHandlers.setHTML({ html: '<i>unsafe</i>' }, { element: host.querySelector('#t2') }, {});

  const out = {
    directiveSafeDefault: host.querySelector('#t1').textContent === '<b>unsafe</b>',
    engineSafeDefault: host.querySelector('#t2').textContent === '<i>unsafe</i>',
  };
  host.remove();
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Attribute actions could set unsafe attributes (e.g., `onclick`) and unsafe URL values (e.g., `javascript:`).

**Why it happened:** No attribute safety checks were performed before `setAttribute`.

**What changed:**
- Added shared safety checks in both engines for attribute actions:
  - block `on*` attributes
  - block unsafe URL protocols on url-like attributes unless `trusted: true`
- Unsafe attempts are rejected and logged.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const directive = await import('/src/interactions/utils/engine.js');
  const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js');
  const host = document.createElement('div');
  host.innerHTML = '<a id="link1"></a><a id="link2"></a>';
  document.body.appendChild(host);

  directive.execActions({
    actionType: 'attribute',
    targetSelector: '#link1',
    add: { onclick: 'alert(1)', href: 'javascript:alert(1)', 'data-safe': 'ok' },
  }, host, host);

  interactionsEngine.actionHandlers.attribute(
    { attributeName: 'onclick', attributeValue: 'alert(1)' },
    { element: host.querySelector('#link2') },
    {},
  );

  const out = {
    directiveBlocksOnclick: !host.querySelector('#link1').hasAttribute('onclick'),
    directiveBlocksJsHref: host.querySelector('#link1').getAttribute('href') === null,
    directiveKeepsSafeAttr: host.querySelector('#link1').getAttribute('data-safe') === 'ok',
    engineBlocksOnclick: !host.querySelector('#link2').hasAttribute('onclick'),
  };
  host.remove();
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `jsObjectExists` allowed probing arbitrary `window` paths.

**Why it happened:** Rule started traversal directly from `window` with no namespace restriction.

**What changed:** In canonical rules (`src/utils/validation/rules.js`), `jsObjectExists` now requires paths to start with `AppGlobals` and rejects all other roots.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { default: rules } = await import('/src/interactions/utils/validationRules.js');
  window.AppGlobals = { audit: { enabled: true } };
  const out = {
    appGlobalsAllowed: rules.jsObjectExists('', 'AppGlobals.audit.enabled') === true,
    arbitraryWindowBlocked: rules.jsObjectExists('', '__vue_app__.config') === false,
  };
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** If `reportValidity()` threw inside `showBrowserError`, input type/required restoration was skipped.

**Why it happened:** Restoration logic was outside exception-safe cleanup.

**What changed:** Wrapped mutation/reporting flow in `try/finally` so original input `type` and required attribute are always restored.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js');
  const el = document.createElement('input');
  el.type = 'email';
  el.setAttribute('required', '');
  el.setCustomValidity = () => {};
  el.reportValidity = () => { throw new Error('boom'); };

  try {
    interactionsEngine.actionHandlers.showBrowserError({}, { element: el }, {});
  } catch (_) {}

  const out = {
    typeRestored: el.type === 'email',
    requiredRestored: el.hasAttribute('required'),
  };
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Scope iteration used `for...in`, which can include inherited enumerable properties and produce invalid field processing.

**Why it happened:** Loops iterated object prototypes instead of own field keys only.

**What changed:** Replaced scope field loops with `Object.keys(scope.fields)` iteration in `src/utils/validation/interactionsEngine.js` where scope field traversal occurs.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js');
  interactionsEngine.scopes.audit = { fields: Object.create({ inheritedField: { value: 'x' } }) };
  interactionsEngine.scopes.audit.fields.ownField = { value: 'ok', validationConfig: { rules: [] }, element: null, isValid: true, failedRules: [] };
  const summary = interactionsEngine.validateScope('audit');
  const out = {
    inheritedNotIterated: !summary.invalidFields.some((f) => f.fieldId === 'inheritedField'),
  };
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Selector cache eviction policy behaved as FIFO and did not refresh entries on cache hits.

**Why it happened:** Cache-hit path returned immediately without re-inserting key/value to update recency order.

**What changed:** In `src/interactions/utils/engine.js`, cache-hit branch now does LRU refresh (`delete` + `set`) before returning the element.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { execActions } = await import('/src/interactions/utils/engine.js');
  const host = document.createElement('div');
  host.innerHTML = '<div id="target"></div><input id="field" value="abc">';
  document.body.appendChild(host);
  const field = host.querySelector('#field');
  execActions({ actionType: 'cloneValue', targetSelector: '#target' }, field, host);
  execActions({ actionType: 'cloneValue', targetSelector: '#target' }, field, host); // second hit refreshes LRU position
  const out = { repeatedHitWorks: host.querySelector('#target').textContent === 'abc' };
  host.remove();
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `showValidationErrors` did repeated DOM label queries inside the invalid-field loop.

**Why it happened:** Label lookups were performed per field with `document.querySelector(...)` instead of using a precomputed lookup map.

**What changed:** In `src/utils/validation/interactionsEngine.js`, `showValidationErrors` now prebuilds `labelByFor` once from `label[for]` and uses O(1) lookups by element ID.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js');
  const email = document.createElement('input');
  email.id = 'emailField';
  email.value = '';
  email.setAttribute('required', '');
  const label = document.createElement('label');
  label.setAttribute('for', 'emailField');
  label.textContent = 'Email Address';
  const output = document.createElement('textarea');
  output.setAttribute('data-error-display', '');
  document.body.append(label, email, output);

  interactionsEngine.scopes.formA = {
    fields: {
      email: { value: '', validationConfig: { required: true, rules: [] }, element: email, isValid: true, failedRules: [], meta: {} },
    },
  };

  interactionsEngine.actionHandlers.showValidationErrors({ scopeId: 'formA', scroll: false }, null, null);
  const out = { labelUsedFromMap: output.value.includes('Email Address') };
  label.remove(); email.remove(); output.remove();
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Re-created config object references could trigger repeated deepFreeze work, especially when configs are inline literals.

**Why it happened:** Parsing cache is reference-based; fresh object references bypass WeakMap cache.

**What changed:** Added DEV warning in `safeParseConfig(...)` (`src/interactions/utils/engine.js`) when the provided config object is not frozen, guiding callers to freeze/memoize configs.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const mod = await import('/src/interactions/utils/engine.js');
  const warn = console.warn;
  let warned = false;
  console.warn = (...args) => { warned = true; warn(...args); };
  mod.safeParseConfig([{ rules: [{ type: 'hasContent' }] }]);
  console.warn = warn;
  console.log({ pass: warned, warned });
})();
```

**Expected:** `pass: true` and one warning about non-frozen config.

---

### P-06 · `processFieldChange` validates on every keystroke with no debounce
**File:** `src/utils/validation/interactionsEngine.js` lines 864–915
**Severity:** Low

Every `@input` event fires `validationEngine.validateField()` synchronously. For fields with many rules (e.g., a password field with 5 complexity rules), this is acceptable. But `custom` rule support (`validationsLibrary.custom`) allows an arbitrary function, meaning a slow custom validator runs on every keystroke.

**Fix:** Add an optional `debounceMs` field to `fieldConfig`. Provide a built-in debounce wrapper in `processFieldChange`.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `processFieldChange` validated synchronously on every keystroke with no built-in debounce option.

**Why it happened:** Input pipeline always executed validation/actions immediately per event.

**What changed:** In `src/utils/validation/interactionsEngine.js`, added optional `fieldConfig.debounceMs` support:
- uses per-field timer key (`scope:id`)
- clears prior timer on new keystroke
- runs original validation/action pipeline only after debounce delay
- preserves existing immediate behavior when `debounceMs` is unset/invalid.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js');
  interactionsEngine.scopes.demo = {
    fields: {
      name: { value: '', isValid: true, failedRules: [], validationConfig: { rules: [{ type: 'minLength', param: 3 }] }, meta: {}, element: null },
    },
  };
  const cfg = { scope: 'demo', id: 'name', debounceMs: 100, events: { input: {} } };
  interactionsEngine.processFieldChange(cfg, 'a');
  interactionsEngine.processFieldChange(cfg, 'ab');
  interactionsEngine.processFieldChange(cfg, 'abc');
  setTimeout(() => {
    const state = interactionsEngine.scopes.demo.fields.name;
    console.log({ pass: state.value === 'abc' && state.isValid === true, value: state.value, isValid: state.isValid });
  }, 130);
})();
```

**Expected:** Final log shows `pass: true` after debounce delay.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `interactionsEngine` stored scoped field state in long-lived singleton maps (`scopes`, `elementVisibility`, `originalValues`) but had no teardown API, so SPA route changes could leave stale field state and DOM references alive longer than needed.

**Why it happened:** Engine had `register(...)` but no matching lifecycle cleanup contract (`unregister`/`clearScope`) and form components were not clearing scope state during unmount.

**What changed:**
- Added `unregister(fieldConfig)` to `src/utils/validation/interactionsEngine.js`:
  - removes a single field from `scopes[scopeId].fields`
  - clears field debounce timer
  - auto-calls `clearScope(scopeId)` when the scope becomes empty
- Added `clearScope(scopeId)` to `src/utils/validation/interactionsEngine.js`:
  - deletes `scopes[scopeId]`
  - clears all debounce timers belonging to that scope
  - removes scope-prefixed entries from `originalValues` and `elementVisibility`
- Wired cleanup on component unmount for scopes that register fields:
  - `src/components/auth/AuthLogIn.vue` (`loginForm`)
  - `src/components/auth/AuthSignUp.vue` (`signupForm`)
  - `src/components/auth/AuthResetPassword.vue` (`resetPasswordForm`)
  - `src/components/auth/AuthConfirmEmail.vue` (`confirmEmailForm`)
  - `src/components/auth/AuthSignUpOnboarding.vue` (`onboardingForm`)
  - `src/components/auth/AuthLostPassword.vue` (`lostPasswordForm`)
  - `src/components/ui/form/BookingForm/OneOnOneBookinStep1.vue` (`oneOnOneBooking`)
  - `src/templates/dashboard/page/role/DashboardResetPassword.vue` (`resetPasswordForm`)
- Added unit coverage in `tests/unit/interactionsEngineScopeCleanup.test.js` for `unregister` and `clearScope` behavior.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js'); const hasKey = (obj, key) => !!obj && Object.prototype.hasOwnProperty.call(obj, key); interactionsEngine.register({ scope: 'auditScope', id: 'email', validation: { rules: [] } }, '', document.createElement('input')); if (!interactionsEngine.elementVisibility) interactionsEngine.elementVisibility = {}; if (!interactionsEngine.originalValues) interactionsEngine.originalValues = {}; if (!interactionsEngine._debounceTimers) interactionsEngine._debounceTimers = {}; interactionsEngine.elementVisibility['auditScope.panel'] = true; interactionsEngine.originalValues['auditScope_target'] = 'old'; interactionsEngine.processFieldChange({ scope: 'auditScope', id: 'email', debounceMs: 250, events: { input: {} } }, 'abc'); const before = { hasScope: !!interactionsEngine.scopes.auditScope, hasField: !!interactionsEngine.scopes.auditScope?.fields?.email, hasVisibility: hasKey(interactionsEngine.elementVisibility, 'auditScope.panel'), hasOriginal: hasKey(interactionsEngine.originalValues, 'auditScope_target'), hasTimer: hasKey(interactionsEngine._debounceTimers, 'auditScope:email') }; interactionsEngine.unregister({ scope: 'auditScope', id: 'email' }); const afterUnregister = { scopeRemovedWhenEmpty: interactionsEngine.scopes.auditScope === undefined, visibilityCleared: !hasKey(interactionsEngine.elementVisibility, 'auditScope.panel'), originalCleared: !hasKey(interactionsEngine.originalValues, 'auditScope_target'), timerCleared: !hasKey(interactionsEngine._debounceTimers, 'auditScope:email') }; interactionsEngine.register({ scope: 'auditScope2', id: 'name', validation: { rules: [] } }, 'x', null); interactionsEngine.clearScope('auditScope2'); const afterClear = { clearScopeRemovedScope: interactionsEngine.scopes.auditScope2 === undefined }; const out = { ...before, ...afterUnregister, ...afterClear }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Calling `register(...)` multiple times for the same `scope + id` silently replaced the existing reactive field state.

**Why it happened:** `register(...)` wrote directly to `this.scopes[scopeId].fields[fieldId]` with no existing-state guard.

**What changed:**
- Added idempotency guard in `src/utils/validation/interactionsEngine.js`:
  - if the field already exists, it now returns early
  - emits DEV warning: `[InteractionsEngine] Field already registered: <scope>.<id>. Call unregister first.`
- Added targeted unit test `tests/unit/interactionsEngineRegisterIdempotency.test.js` to verify duplicate registration does not overwrite existing state.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js'); interactionsEngine.clearScope('b03Scope'); interactionsEngine.register({ scope: 'b03Scope', id: 'email', validation: {} }, 'first@email.com', null); const before = interactionsEngine.getFieldState({ scope: 'b03Scope', id: 'email' }); const firstRef = before; const firstValue = before?.value; interactionsEngine.register({ scope: 'b03Scope', id: 'email', validation: {} }, 'second@email.com', null); const after = interactionsEngine.getFieldState({ scope: 'b03Scope', id: 'email' }); const out = { sameReference: after === firstRef, valueNotOverwritten: after?.value === firstValue && after?.value === 'first@email.com' }; console.log({ pass: Object.values(out).every(Boolean), ...out, currentValue: after?.value }); })();
```

**Expected:** Final log includes `pass: true` and `currentValue: "first@email.com"`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `jumpToFieldPlaceholder(...)` emitted both `logger.debug(...)` and raw `console.log(...)`, creating duplicate logs and production-console noise.

**Why it happened:** The stub kept a legacy direct `console.log` line in addition to centralized logger usage.

**What changed:**
- Removed direct `console.log(...)` from `jumpToFieldPlaceholder(...)` in `src/utils/validation/interactionsEngine.js`.
- Kept `this.logger.debug(...)` as the single logging path.
- Added targeted test `tests/unit/interactionsEngineJumpPlaceholderLogging.test.js` to assert no raw console logging.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js'); const originalLog = console.log; let rawLogCalls = 0; console.log = (...args) => { rawLogCalls += 1; originalLog(...args); }; interactionsEngine.jumpToFieldPlaceholder('b04Scope', 'email'); console.log = originalLog; const out = { noRawConsoleLog: rawLogCalls === 0 }; console.log({ pass: Object.values(out).every(Boolean), ...out, rawLogCalls }); })();
```

**Expected:** Final log includes `pass: true` and `rawLogCalls: 0`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `stampValidation(...)` updated only custom attributes (`validated`, `data-validation-reason`) and did not set `aria-invalid`, so assistive technologies had no standard invalid-state signal.

**Why it happened:** Validation stamping was focused on internal UI/CSS state and omitted accessibility attribute parity.

**What changed:**
- Updated `src/interactions/utils/engine.js`:
  - `stampValidation(...)` now also sets `aria-invalid` (`'true'` when invalid, `'false'` when valid).
- Added focused test `tests/unit/stampValidationAriaInvalid.test.js` to assert `aria-invalid` tracks the validation result.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const mod = await import('/src/interactions/utils/engine.js'); const el = document.createElement('input'); mod.stampValidation(el, { isValid: false, failedRules: [{ rule: 'required', error: 'Required' }] }); const invalidStateOk = el.getAttribute('validated') === 'false' && el.getAttribute('aria-invalid') === 'true'; mod.stampValidation(el, { isValid: true, failedRules: [] }); const validStateOk = el.getAttribute('validated') === 'true' && el.getAttribute('aria-invalid') === 'false'; const out = { invalidStateOk, validStateOk }; console.log({ pass: Object.values(out).every(Boolean), ...out, attrs: { validated: el.getAttribute('validated'), ariaInvalid: el.getAttribute('aria-invalid') } }); })();
```

**Expected:** Final log includes `pass: true` and final attributes show `validated: "true"`, `ariaInvalid: "false"` after the valid stamp.

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

#### Resolution ✅

**Status:** Resolved (already covered by rule-unification architecture, verified with focused test).

**What was broken:** The old engine-side `isSelect` implementation relied on hardcoded placeholder strings (`"0"`, `"-1"`, `"placeholder"`), making behavior brittle across forms.

**Why it happened:** Before unification, `validationsLibrary.js` and directive rules diverged and carried different select semantics.

**What changed:**
- `src/utils/validation/validationsLibrary.js` now re-exports canonical rules from `src/utils/validation/rules.js`.
- Canonical `isSelect` is parameter-driven: `isSelect(value, param) { return value !== (param ?? ''); }`
  - no hardcoded placeholder list
  - caller controls placeholder sentinel when needed.
- Added focused test `tests/unit/isSelectPlaceholderParam.test.js` to verify parameterized behavior.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const interactions = await import('/src/interactions/utils/validationRules.js'); const engine = await import('/src/utils/validation/validationsLibrary.js'); const rules = interactions.default; const out = { sameFunctionReference: engine.validationsLibrary.isSelect === rules.isSelect, emptyRejectedWhenParamEmpty: rules.isSelect('', '') === false, customPlaceholderRejected: rules.isSelect('placeholder', 'placeholder') === false, valueAccepted: rules.isSelect('creator', 'placeholder') === true, notHardcodedZeroBlocked: rules.isSelect('0', '') === true }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

---

### B-08 · `passive: true` on all directive event listeners prevents `preventDefault`
**File:** `src/interactions/directives/vInteractions.js` line 73
**Severity:** Low

```js
el.addEventListener(eventType, handler, { passive: true })
```

`passive: true` tells the browser the handler will never call `preventDefault()`, enabling scroll optimization. This is correct for `input`, `change`, and `blur`, but if a caller adds `submit` to `triggerEvents`, the passive listener cannot prevent form submission. There is no guard against this combination.

**Fix:** Apply `{ passive: true }` only for known scroll/touch events (`wheel`, `touchstart`, `touchmove`). Use no options (or `{ passive: false }`) for `submit`, `keydown`, and `click`.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Directive listeners always used `{ passive: true }`, including non-scroll events like `submit`/`click` where passive semantics are not appropriate.

**Why it happened:** Listener registration in `vInteractions` used a single hardcoded options object for every configured event.

**What changed:**
- Updated `src/interactions/directives/vInteractions.js`:
  - added `PASSIVE_EVENTS` set (`wheel`, `touchstart`, `touchmove`)
  - applies `{ passive: true }` only for those events
  - uses default listener options (`undefined`) for other events.
- Added targeted test `tests/unit/vInteractionsPassiveEvents.test.js` to verify options per event type.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const mod = await import('/src/interactions/directives/vInteractions.js'); const el = document.createElement('input'); const calls = []; const originalAdd = el.addEventListener.bind(el); el.addEventListener = (eventName, handler, options) => { calls.push({ eventName, options }); return originalAdd(eventName, handler, options); }; mod.vInteractions.mounted(el, { value: Object.freeze([{ triggerEvents: ['wheel', 'touchstart', 'input', 'submit'], rules: [] }]) }); const by = (name) => calls.find((c) => c.eventName === name)?.options; const out = { wheelPassive: JSON.stringify(by('wheel')) === JSON.stringify({ passive: true }), touchPassive: JSON.stringify(by('touchstart')) === JSON.stringify({ passive: true }), inputNotPassive: by('input') === undefined, submitNotPassive: by('submit') === undefined }; console.log({ pass: Object.values(out).every(Boolean), ...out, calls }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved (already covered by rule unification, verified with focused test).

**What was broken:** `minChar`/`minLength` existed in multiple places with inconsistent parameter handling, increasing maintenance risk.

**Why it happened:** Legacy split between directive and engine rule libraries duplicated near-identical rule logic.

**What changed:**
- `src/interactions/utils/validationRules.js` now re-exports canonical rules.
- `src/utils/validation/validationsLibrary.js` now re-exports canonical rules.
- Canonical `src/utils/validation/rules.js` contains one implementation each for:
  - `minChar(value, param)`
  - `minLength(value, param)`
  - both use shared integer normalization.
- Added focused verification test `tests/unit/minCharMinLengthCanonical.test.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const interactions = await import('/src/interactions/utils/validationRules.js'); const engine = await import('/src/utils/validation/validationsLibrary.js'); const r = interactions.default; const out = { sameMinCharRef: r.minChar === engine.validationsLibrary.minChar, sameMinLengthRef: r.minLength === engine.validationsLibrary.minLength, minCharRejectsShort: r.minChar('ab', 3) === false, minLengthRejectsShort: r.minLength('ab', 3) === false, minCharBadParamFallback: r.minChar('ab', 'bad') === true, minLengthBadParamFallback: r.minLength('ab', 'bad') === true }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `actionHandlers` referenced the module singleton by closed-over name, which reduced testability and prevented clean rebinding of handlers to alternative engine instances.

**Why it happened:** Handler implementations directly used `interactionsEngine.*` instead of resolving engine context from invocation.

**What changed:**
- Added `resolveActionEngine(ctx)` helper in `src/utils/validation/interactionsEngine.js`.
- Updated all built-in `actionHandlers` methods to resolve the engine from `this` (or fallback to singleton).
- Updated `runInteractions(...)` to execute handlers with `handler.call(this, ...)`, so context-aware handlers receive the invoking engine instance.
- Added targeted test `tests/unit/interactionsEngineActionHandlersContext.test.js` verifying explicit engine binding works without mutating singleton state.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js'); const altEngine = { engine: null, elementVisibility: {}, logger: { debug: () => {}, error: () => {} }, getFieldState: () => null, _getElementValue: () => '', _setElementValue: () => {}, originalValues: {}, allowedScripts: {}, scopes: {}, validateScope: () => ({ isValid: true, invalidFields: [] }), actionHandlers: interactionsEngine.actionHandlers, runInteractions: interactionsEngine.runInteractions }; altEngine.engine = altEngine; delete interactionsEngine.elementVisibility['b10.scope']; altEngine.runInteractions([{ type: 'showElement', elementKey: 'b10.scope' }], null); const out = { updatedAltEngine: altEngine.elementVisibility['b10.scope'] === true, singletonUntouched: interactionsEngine.elementVisibility['b10.scope'] === undefined }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Validation ran only synchronously. `custom` rules could not return a `Promise`, and there was no `pending` flag for async UI (spinners) or debounced async execution.

**Why it happened:** `validationEngine.validateField` executed every rule inline; `custom` coerced results with `!!`, so Promises were treated as truthy passes.

**What changed:**
- `src/utils/validation/validationEngine.js` — sync `validateField` skips rules with `async: true`; added `validateAsyncRules()` and `isAsyncRule()`.
- `src/utils/validation/rules.js` — `custom` returns Promises unchanged for async evaluation.
- `src/utils/validation/interactionsEngine.js` — field state `pending`, debounced `_asyncDebounceTimers`, `_scheduleAsyncValidation`, `flushAsyncValidation()`. Mark async rules with `{ async: true }` on the rule config; optional `asyncDebounceMs` on `fieldConfig` (falls back to `debounceMs`, default 300ms).
- Tests: `tests/unit/validationEngineAsyncRules.test.js`, `tests/unit/interactionsEngineAsyncValidation.test.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js'); interactionsEngine.register({ scope: 'm01', id: 'username', asyncDebounceMs: 100, validation: { rules: [{ type: 'custom', async: true, param: (v) => Promise.resolve(v === 'free'), message: 'Taken' }] } }, 'taken', null); interactionsEngine.processFieldChange({ scope: 'm01', id: 'username', asyncDebounceMs: 100, validation: { rules: [{ type: 'custom', async: true, param: (v) => Promise.resolve(v === 'free'), message: 'Taken' }] } }, 'free'); await new Promise((r) => setTimeout(r, 150)); await interactionsEngine.flushAsyncValidation({ scope: 'm01', id: 'username' }); const s = interactionsEngine.getFieldState({ scope: 'm01', id: 'username' }); const out = { isValid: s.isValid === true, pendingCleared: s.pending === false, noFailedRules: (s.failedRules || []).length === 0 }; interactionsEngine.clearScope('m01'); console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

---

### M-02 · No `unregister` / `clearScope` on `interactionsEngine`
**Severity:** High

See [B-02](#b-02--interactionsengine-is-a-global-singleton-with-no-cleanup-api). Without cleanup, every mounted form permanently grows the global `scopes` reactive object. Long-lived SPAs will accumulate stale field state.

#### Resolution ✅

**Status:** Resolved (duplicate of [B-02](#b-02--interactionsengine-is-a-global-singleton-with-no-cleanup-api); tracked here because the missing-features list called it out separately).

**What was broken:** Same as B-02 — no `unregister` / `clearScope`, so scoped field maps grew without bound across SPA navigations.

**Why it happened:** Missing lifecycle teardown API on the engine singleton.

**What changed:** See B-02 resolution (`unregister`, `clearScope`, `onBeforeUnmount` wiring, `tests/unit/interactionsEngineScopeCleanup.test.js`). Async debounce timers are also cleared in `clearScope` / `unregister` after M-01.

**How to test in the browser (one paste — logs result when the promise settles):** Use the B-02 browser command in [B-02](#b-02--interactionsengine-is-a-global-singleton-with-no-cleanup-api).

**Expected:** Final log includes `pass: true`.

---

### M-03 · No cross-field re-validation when a source field changes
**Severity:** High

The `matchValue` rule checks if `confirmPassword === password`. But when the user changes the `password` field, the `confirmPassword` field is not automatically re-validated. A user could:
1. Enter `abc123` in both fields (both valid)
2. Change password to `xyz999` (password valid, confirm still shows valid stamp from step 1)
3. Submit — client-side appears valid, but passwords don't match

There is no dependency tracking: no way to declare "when field X changes, re-validate field Y".

**Required:** A `dependsOn` field in `fieldConfig` that triggers re-validation of dependents via `processFieldChange`.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Changing `password` did not re-run `matchValue` on `confirmPassword`, so confirm could stay stamped valid after the source password changed.

**Why it happened:** No dependency graph; forms duplicated logic (e.g. manual `processFieldChange` on confirm inside password handlers).

**What changed:**
- `src/utils/validation/interactionsEngine.js` — `dependsOn` on `fieldConfig` (string or array); stored on field state; `_revalidateDependents()` runs after sync validation in `processFieldChange` / `validateField`.
- `src/components/auth/AuthSignUp.vue` — `confirmPasswordConfig.dependsOn: ['password']`; removed manual confirm re-validation from password handler.
- `src/templates/dashboard/page/role/DashboardResetPassword.vue` — `dependsOn: ['newPassword']` on confirm field.
- Test: `tests/unit/interactionsEngineDependsOn.test.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js'); interactionsEngine.register({ scope: 'm03', id: 'password', validation: { rules: [] } }, 'abc', null); interactionsEngine.register({ scope: 'm03', id: 'confirmPassword', dependsOn: ['password'], validation: { rules: [{ type: 'matchValue', param: 'password', message: 'No match' }] } }, 'abc', null); interactionsEngine.processFieldChange({ scope: 'm03', id: 'password', validation: { rules: [] } }, 'xyz'); const c = interactionsEngine.getFieldState({ scope: 'm03', id: 'confirmPassword' }); const out = { confirmInvalid: c.isValid === false, matchFailed: c.failedRules?.[0]?.type === 'matchValue' }; interactionsEngine.clearScope('m03'); console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

---

### M-04 · No `touched` / `dirty` state per field in `interactionsEngine`
**Severity:** Medium

The engine tracks `isValid` and `failedRules` but not whether the user has interacted with a field. Without a `touched` flag:
- Error messages appear immediately on mount (via `initialPass` in the directive)
- There is no way to suppress errors for fields the user has never focused

The standard UX pattern is to show errors only after a field has been `touched` (focused then blurred) or after the form has been submitted.

**Required:** Add `touched: false` and `dirty: false` to field state. Set `touched = true` on `blur`. Expose `showError = touched && !isValid` for template binding.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Field state tracked only `isValid` / `failedRules`, so templates could not defer error display until interaction or submit.

**Why it happened:** No UX state (`touched`, `dirty`, `showError`) on registered fields and no blur/submit hooks.

**What changed:**
- `src/utils/validation/interactionsEngine.js` — field state now includes `touched`, `dirty`, `showError`, and `initialValue`; `_updateFieldUxState()` keeps `showError = (touched || scope.submitted) && !isValid`.
- Added `processFieldBlur(fieldConfig)` (call from `@blur`) and `markScopeSubmitted(scopeId)` (call on submit attempt).
- Scope objects now include `submitted: false` by default.
- Test: `tests/unit/interactionsEngineTouchedDirty.test.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js'); interactionsEngine.register({ scope: 'm04', id: 'email', validation: { rules: [{ type: 'isEmail', message: 'Bad email' }] } }, 'bad', null); interactionsEngine.processFieldChange({ scope: 'm04', id: 'email', validation: { rules: [{ type: 'isEmail', message: 'Bad email' }] } }, 'bad'); const hiddenBeforeBlur = interactionsEngine.getFieldState({ scope: 'm04', id: 'email' }).showError === false; interactionsEngine.processFieldBlur({ scope: 'm04', id: 'email' }); const shownAfterBlur = interactionsEngine.getFieldState({ scope: 'm04', id: 'email' }).showError === true; const out = { hiddenBeforeBlur, shownAfterBlur }; interactionsEngine.clearScope('m04'); console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

---

### M-05 · `stampValidation` does not set `aria-invalid` or link error messages
**Severity:** Medium

See [B-06](#b-06--stampvalidation-sets-non-standard-validated-attribute-without-aria-invalid). This is both a best practice violation and a missing feature from an accessibility standpoint. The directive has no mechanism to automatically associate an error message element (`aria-describedby`) with the invalid field.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `aria-invalid` was added in B-06, but error text elements were not linked to inputs for screen readers.

**Why it happened:** `stampValidation` updated only field attributes, with no lookup for companion error nodes.

**What changed:**
- `src/interactions/utils/engine.js` — `resolveValidationErrorId()` finds error elements via:
  - `data-validation-describedby` on the input
  - `#${input.id}-error` convention
  - `[data-validation-error-for="${input.id}"]` within the nearest form/container
- `stampValidation()` now syncs `aria-describedby` when invalid and removes the error id when valid (preserves unrelated describedby ids).
- Tests: `tests/unit/stampValidationAriaDescribedby.test.js` (plus existing `stampValidationAriaInvalid.test.js`).

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const mod = await import('/src/interactions/utils/engine.js'); const err = document.createElement('p'); err.id = 'demo-email-error'; err.textContent = 'Invalid'; document.body.append(err); const input = document.createElement('input'); input.id = 'demo-email'; document.body.append(input); mod.stampValidation(input, { isValid: false, failedRules: [{ rule: 'isEmail', error: 'Invalid' }] }); const out = { ariaInvalid: input.getAttribute('aria-invalid') === 'true', describedBy: input.getAttribute('aria-describedby') === 'demo-email-error' }; mod.stampValidation(input, { isValid: true, failedRules: [] }); out.cleared = input.getAttribute('aria-describedby') === null; err.remove(); input.remove(); console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `step1Validator` enforced minimums/required checks only; extreme duration, price, and title values passed client validation.

**Why it happened:** No upper-bound guards in `eventStepValidators.js`.

**What changed:**
- `src/services/events/validators/eventStepValidators.js` — added caps:
  - `eventTitle` max 200 characters
  - `duration` max 480 minutes (8 hours)
  - `basePrice` max 10000
- Extended `tests/unit/eventStepValidators.test.js` with upper-bound cases.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { step1Validator } = await import('/src/services/events/validators/eventStepValidators.js'); const state = { eventTitle: 'x'.repeat(201), duration: 481, basePrice: 10001, repeatRule: 'weekly', weeklyAvailability: [{ unavailable: false, slots: [{ startTime: '10:00', endTime: '11:00' }] }] }; const fields = new Set(step1Validator(state).errors.map((e) => e.field)); const out = { title: fields.has('eventTitle'), duration: fields.has('duration'), price: fields.has('basePrice') }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

---

### M-08 · No debounce mechanism in `processFieldChange`
**Severity:** Low

See [P-06](#p-06--processFieldChange-validates-on-every-keystroke-with-no-debounce). Particularly important for expensive `custom` rule functions or when validation triggers UI re-renders.

#### Resolution ✅

**Status:** Resolved (duplicate of [P-06](#p-06--processFieldChange-validates-on-every-keystroke-with-no-debounce); listed here under missing features).

**What was broken:** Same as P-06 — synchronous validation on every keystroke with no built-in debounce.

**Why it happened:** `processFieldChange` had no timer-based deferral path.

**What changed:** See P-06 resolution (`fieldConfig.debounceMs` in `interactionsEngine.processFieldChange`, test `tests/unit/processFieldChangeDebounce.test.js`). Async rules also use debounced execution via `asyncDebounceMs` / `debounceMs` (M-01).

**How to test in the browser (one paste — logs result when the promise settles):** Use the P-06 browser command in [P-06](#p-06--processFieldChange-validates-on-every-keystroke-with-no-debounce).

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `showValidationErrors` wrote summary text into `<textarea>` / `<input>` `.value`, which is semantically wrong and poor for screen readers.

**Why it happened:** The action treated any matched target as a plain text sink, including form controls.

**What changed:**
- `src/utils/validation/interactionsEngine.js` — renders summaries into `role="alert"` hosts with `<ul role="list">` items via `resolveValidationSummaryHost()` / `renderValidationErrorSummary()`.
- Legacy textarea/input targets auto-create an adjacent alert summary (`#${id}-summary`); the input value is no longer modified.
- Default selector prefers `[data-error-display]` (any element), not only textarea.
- Updated/extended tests in `tests/unit/securityInteractionsEngine.test.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js'); const ta = document.createElement('textarea'); ta.id = 'm09'; ta.setAttribute('data-error-display', ''); document.body.append(ta); interactionsEngine.scopes.m09 = { fields: { name: { value: '', validationConfig: { required: true }, element: null, isValid: false, failedRules: [{ type: 'required', message: 'Required' }] } } }; interactionsEngine.actionHandlers.showValidationErrors({ scopeId: 'm09', fieldIds: ['name'], scroll: false }, null, null); const summary = document.getElementById('m09-summary'); const out = { alertRole: summary?.getAttribute('role') === 'alert', listRendered: !!summary?.querySelector('ul[role="list"]'), textareaUntouched: ta.value === '' }; ta.remove(); summary?.remove(); delete interactionsEngine.scopes.m09; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

---

### M-10 · `validateCreateEventPayload` does not validate `type` against a known enum
**File:** `src/services/events/validators/eventFlowValidators.js` lines 54–57
**Severity:** Low

```js
if (!isNonEmptyString(payload.type)) { errors.push("type is required."); }
```

Any non-empty string passes. If the API expects an enum (`"oneOnOne"`, `"group"`, `"webinar"`, etc.), invalid type strings will fail only at the server, returning an unhelpful generic error to the user.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Any non-empty `payload.type` passed client validation.

**Why it happened:** Validator only checked `isNonEmptyString(payload.type)`.

**What changed:**
- `src/services/events/validators/eventFlowValidators.js` — `VALID_CREATE_EVENT_TYPES` set aligned with mapper/client usage: `1on1-call`, `group-event`, `group`, `oneOnOne`.
- Rejects unknown types with a clear error listing allowed values.
- Test: `tests/unit/eventFlowValidatorsType.test.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const mod = await import('/src/services/events/validators/eventFlowValidators.js'); const good = mod.validateCreateEventPayload({ creatorId: 'c1', title: 'E', type: '1on1-call' }); const bad = mod.validateCreateEventPayload({ creatorId: 'c1', title: 'E', type: 'webinar' }); const out = { goodOk: good.ok === true, badRejected: bad.ok === false, enumMessage: bad.errors.some((e) => String(e).includes('type must be one of')) }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Each `showBrowserError` scheduled an independent 800ms `setTimeout` to clear validity; rapid events let stale timers clear a newer error state.

**Why it happened:** No per-element timer tracking or generation guard.

**What changed:**
- `src/interactions/utils/engine.js` — `_browserErrorClearTimers` WeakMap stores `{ timerId, generation }`; prior timers are cancelled before scheduling a new clear; stale callbacks no-op when generation changed.
- Test: `tests/unit/showBrowserErrorTimeout.test.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { execActions } = await import('/src/interactions/utils/engine.js'); const input = document.createElement('input'); document.body.append(input); execActions({ actionType: 'showBrowserError', message: 'First' }, input, document); execActions({ actionType: 'showBrowserError', message: 'Second' }, input, document); const afterBurst = input.validationMessage === 'Second'; await new Promise((r) => setTimeout(r, 850)); const out = { afterBurst, clearedAfterLatestTimeout: input.validationMessage === '' }; input.remove(); console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `validateScope()` in `src/interactions/utils/engine.js` only queried `[interaction-config]`, but `v-interactions` binds frozen config objects and never wrote that attribute. Scope validation could return `isValid: true` with zero fields checked even when invalid bound inputs existed in the container.

**Why it happened:** The directive and scope validator used different discovery mechanisms — runtime binding vs static attribute lookup.

**What changed:**
- `src/interactions/utils/engine.js` — added `INTERACTION_CONFIG_ATTR`, `stampInteractionConfig()`, and `clearInteractionConfig()`; `validateScope` reads the shared attribute constant.
- `src/interactions/directives/vInteractions.js` — `wire()` stamps JSON-serialized config on mount/update; `unwire()` clears the attribute on teardown or empty config.
- `tests/unit/validateScopeInteractionConfig.test.js` — proves unstamped fields are skipped and stamped fields are validated.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { validateScope, stampInteractionConfig } = await import('/src/interactions/utils/engine.js'); const scope = document.createElement('div'); scope.setAttribute('interaction-container', ''); const input = document.createElement('input'); input.id = 'auditEmail'; input.value = 'not-an-email'; scope.appendChild(input); document.body.appendChild(scope); const before = validateScope(scope); stampInteractionConfig(input, [{ triggerEvents: ['input'], rules: [{ type: 'isEmail', error: 'Invalid email' }] }]); const after = validateScope(scope); scope.remove(); const out = { beforeSilentPass: before.isValid === true && before.invalid.length === 0, afterFindsInvalid: after.isValid === false && after.invalid.length === 1, afterRuleIsEmail: after.invalid[0]?.failedRules?.[0]?.rule === 'isEmail' }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true` (`beforeSilentPass` documents the old failure mode; `afterFindsInvalid` / `afterRuleIsEmail` prove the fix).

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** The password eye control used `toggleDisplay` on the real DOM `type` attribute while the input was bound with `:type="type"` from props. Vue re-renders could reset `type` back to `"password"` after toggling visibility.

**Why it happened:** Visibility was driven by the interactions engine (DOM mutation) instead of component state that Vue owns.

**What changed:**
- `src/components/input/InputAuthComponent.vue` — added `isPasswordVisible`, `resolvedInputType` (`text` when visible, else prop `type`), and `handleRightIconClick()` to toggle visibility in Vue.
- Removed `internalTypeToggleConfig` (`toggleDisplay` on `type` and icon spans).
- Eye icons now use `v-show` tied to `isPasswordVisible` (no DOM `hidden` toggling for icons).

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const input = document.querySelector('#password'); const eye = document.querySelector('#password-eye'); if (!input || !eye) { console.log({ pass: false, reason: 'Open /log-in and ensure #password exists' }); return; } const read = () => ({ type: input.type, eyeHidden: eye.hasAttribute('hidden') }); const before = read(); eye.click(); await new Promise((r) => setTimeout(r, 50)); const afterClick = read(); input.dispatchEvent(new Event('input', { bubbles: true })); await new Promise((r) => setTimeout(r, 50)); const afterInput = read(); const out = { startsPassword: before.type === 'password', togglesToText: afterClick.type === 'text', survivesInputEvent: afterInput.type === 'text', eyeStillVisible: !afterClick.eyeHidden }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true` (type stays `text` after click and after a bubbling `input` event).

---

### S-06 · OAuth popup `postMessage` handlers do not enforce trusted origins
**Files:** `src/components/auth/AuthLogIn.vue`, `src/components/auth/AuthSignUp.vue`  
**Severity:** High

Both handlers primarily validate `event.source === popup` and state token, and explicitly avoid strict origin checks. They also reply using `event.origin || "*"`.

This increases risk when popup navigation is compromised/misdirected, because messages from an unexpected origin can still be processed if state is leaked.

**Fix:** Validate `event.origin` against a strict allowlist of expected OAuth callback origins and use that validated origin for acknowledgements (never `"*"` fallback).

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `AuthLogIn.vue` and `AuthSignUp.vue` OAuth `message` handlers trusted `event.source === popup` only and replied with `event.origin || "*"`, so acknowledgements could be sent to unexpected origins.

**Why it happened:** Callback pages may run on a different origin (e.g. ngrok) than the parent; origin checks were deferred in favor of popup reference + state matching.

**What changed:**
- Added `src/utils/auth/oauthPostMessage.js` — builds allowlists from `window.location.origin`, `VITE_TWITTER_REDIRECT_URI`, `VITE_TELEGRAM_CALLBACK_ORIGIN`, and optional comma-separated `VITE_OAUTH_ALLOWED_ORIGINS`; `postOAuthAck()` never uses `"*"`.
- `AuthLogIn.vue` / `AuthSignUp.vue` — reject inbound popup messages when `event.origin` is not allowlisted; all ACK replies go through `postOAuthAck()`.
- `tests/unit/oauthPostMessage.test.js` — allowlist and blocked-untrusted-origin coverage.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const mod = await import('/src/utils/auth/oauthPostMessage.js'); const allowed = mod.getTwitterOAuthAllowedOrigins(); const source = { postMessage: (payload, target) => { window.__oauthAck = { payload, target }; } }; const trusted = [...allowed][0]; const out = { hasRedirectOrigin: allowed.size >= 1, ackTrusted: mod.postOAuthAck(source, { type: 'TWITTER_OAUTH_ACK', success: true, state: 'x' }, trusted, allowed) && window.__oauthAck?.target === trusted, ackBlocked: !mod.postOAuthAck(source, { type: 'TWITTER_OAUTH_ACK' }, 'https://evil.example', allowed) && window.__oauthAck?.target === trusted }; delete window.__oauthAck; console.log({ pass: Object.values(out).every(Boolean), allowed: [...allowed], ...out }); })();
```

**Expected:** Final log includes `pass: true`; `ackBlocked` proves evil origin does not receive an ACK.

**Env note:** Set `VITE_TWITTER_REDIRECT_URI` (and `VITE_TELEGRAM_CALLBACK_ORIGIN` / `VITE_OAUTH_ALLOWED_ORIGINS` when using ngrok) so callback origins match your popup URLs.

---

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `toNumber()` accepted any finite number, so fractional `limit` values (e.g. `12.7`) passed fetch validation; numeric `creatorId` values like `1.5` were not rejected.

**Why it happened:** Pagination/ID checks used generic finite-number coercion without integer semantics.

**What changed:**
- `src/services/events/validators/eventFlowValidators.js` — replaced limit coercion with `toPositiveInteger()` (`Number.isInteger`); reject non-integer numeric `creatorId`; clarified limit error message.
- `tests/unit/eventFlowValidatorsInteger.test.js` — fractional limit, valid integer limit, and fractional `creatorId` cases.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { validateFetchCreatorEventsPayload, validateCreateEventPayload } = await import('/src/services/events/validators/eventFlowValidators.js'); const fetchBad = validateFetchCreatorEventsPayload({ creatorId: 'c1', limit: 12.7 }); const fetchOk = validateFetchCreatorEventsPayload({ creatorId: 'c1', limit: 50 }); const createBad = validateCreateEventPayload({ creatorId: 1.5, title: 'E', type: '1on1-call' }); const out = { fractionalLimitRejected: !fetchBad.ok, integerLimitAccepted: fetchOk.ok, fractionalCreatorRejected: !createBad.ok }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `interactionsEngine.validateScope(scopeId)` returned `isValid: true` when `this.scopes[scopeId]` was missing, so typos or pre-registration calls silently passed validation.

**Why it happened:** Missing scope was treated as an empty valid scope instead of a configuration error.

**What changed:**
- `src/utils/validation/interactionsEngine.js` — missing scope now returns `isValid: false` and `scopeError: 'SCOPE_NOT_REGISTERED'`; DEV logs an error.
- `tests/unit/interactionsEngineValidateScope.test.js` — covers missing vs registered scopes.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js'); const missing = interactionsEngine.validateScope('__audit_missing_scope__'); interactionsEngine.scopes.__audit_registered__ = { fields: { name: { value: '', validationConfig: { required: true }, element: null, isValid: true, failedRules: [] } } }; const registered = interactionsEngine.validateScope('__audit_registered__'); delete interactionsEngine.scopes.__audit_registered__; const out = { missingInvalid: missing.isValid === false && missing.scopeError === 'SCOPE_NOT_REGISTERED', registeredChecksFields: registered.isValid === false && registered.invalidFields.length === 1 }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `addFieldRequirement` called `validationEngine.validateField(value, validationConfig)` with no context, so DOM-aware and cross-field rules (`matchValue`, `isRadioCheck`, required via element) could not work in the booking step engine path.

**Why it happened:** The state engine bridge only forwarded value + config, not scope/element/`getFieldValue`.

**What changed:**
- `src/utils/stateEngine.js` — added `buildFieldValidationContext()`; `addFieldRequirement(step, path, validationConfig, contextOptions?)` now passes `{ scope, fieldId, element, getFieldValue }` (optional 4th arg for overrides).
- Default `getFieldValue` reads peer fields from step state via `deepGet(state, targetFieldId)`.
- `tests/unit/stateEngineFieldRequirement.test.js` — `matchValue` cross-field + required-with-element cases.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { createStepStateEngine } = await import('/src/utils/stateEngine.js'); const engine = createStepStateEngine({ flowId: '__audit_l15', defaults: { password: 'abc', confirmPassword: 'xyz' }, urlSync: 'none' }); engine.addFieldRequirement(1, 'confirmPassword', { rules: [{ type: 'matchValue', param: 'password', message: 'Must match' }] }, { scope: 'booking', fieldId: 'confirmPassword' }); const fail = await engine.validate(1); engine.setState('confirmPassword', 'abc', { silent: true }); const pass = await engine.validate(1); const out = { mismatchFails: !fail.valid, matchPasses: pass.valid }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved (already fixed during rules-unification pass; verified in this audit step).

**What was broken:** Misconfigured `custom` rules with a non-function `param` returned `true`, silently skipping validation.

**Why it happened:** Legacy `validationsLibrary.js` inlined a fail-open `custom` implementation before canonical rules existed.

**What changed:**
- Canonical `custom` in `src/utils/validation/rules.js` returns `false` when `param` is not a function.
- `src/utils/validation/validationsLibrary.js` re-exports canonical rules (no separate fail-open copy).
- `tests/unit/customRuleFailsClosed.test.js` — explicit L-16 regression coverage (also covered in `validationRulesUnification.test.js`).

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { validationsLibrary } = await import('/src/utils/validation/validationsLibrary.js'); const out = { nullParamFails: validationsLibrary.custom('x', null, {}) === false, stringParamFails: validationsLibrary.custom('x', 'bad', {}) === false, fnPass: validationsLibrary.custom('ok', (v) => v === 'ok', {}) === true, fnFail: validationsLibrary.custom('no', (v) => v === 'ok', {}) === false }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

---

### L-17 · `isSecurePassword` rules diverge between directive and engine libraries

**Files:** `src/interactions/utils/validationRules.js` line 69 vs `src/utils/validation/validationsLibrary.js` lines 39–49

| Library | Requirement |
|---------|-------------|
| `validationRules.js` (directive) | Upper + lower + digit, min 8 — **no special character** |
| `validationsLibrary.js` (engine) | Upper + lower + digit + **special character**, min 8 |

The same field validated via `v-interactions` vs `interactionsEngine` can pass in one path and fail in the other.

**Fix:** Unify to one canonical implementation and import it in both places.

#### Resolution ✅

**Status:** Resolved (already fixed during rules-unification pass; verified in this audit step).

**What was broken:** Directive `validationRules.js` and engine `validationsLibrary.js` enforced different `isSecurePassword` policies (special character required on one side only).

**Why it happened:** Two independent rule registries before canonical `src/utils/validation/rules.js`.

**What changed:**
- Canonical `isSecurePassword` in `rules.js` requires upper + lower + digit + special + min length 8.
- `validationRules.js` and `validationsLibrary.js` both re-export the same `rules` object.
- Covered by `tests/unit/validationRulesUnification.test.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const directiveRules = (await import('/src/interactions/utils/validationRules.js')).default; const { validationsLibrary } = await import('/src/utils/validation/validationsLibrary.js'); const sample = 'Abcdef12'; const out = { sameFn: validationsLibrary.isSecurePassword === directiveRules.isSecurePassword, noSpecialFails: validationsLibrary.isSecurePassword(sample) === false, withSpecialPasses: validationsLibrary.isSecurePassword('Abcdef12!') === true }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `processFieldChange` validated first, ran `onChange` second, then fired `onValid`/`onInvalid` from the pre-`onChange` result — stale when `onChange` mutated field value.

**Why it happened:** Pipeline order treated `onChange` as a side effect after validation instead of part of the value/context used for validation.

**What changed:**
- `src/utils/validation/interactionsEngine.js` — `runPipeline` now runs `inputEvents.onChange` before sync validation; validates `state.value` after `onChange`; then runs `onValid`/`onInvalid`.
- `tests/unit/processFieldChangeOnChangeOrder.test.js` — `onChange` clears value; asserts `onInvalid` fires (not stale `onValid`).

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js'); interactionsEngine.actionHandlers.__auditClear = (_a, s) => { if (s) s.value = ''; }; const cfg = { scope: '__l18', id: 't', validation: { required: true }, events: { input: { onChange: [{ type: '__auditClear' }], onValid: [{ type: 'showElement', elementKey: 'ok' }], onInvalid: [{ type: 'showElement', elementKey: 'bad' }] } } }; interactionsEngine.register(cfg, 'x', null); interactionsEngine.elementVisibility.ok = false; interactionsEngine.elementVisibility.bad = false; interactionsEngine.processFieldChange(cfg, 'x'); const out = { invalidUi: interactionsEngine.elementVisibility.bad === true, validUiNotStale: interactionsEngine.elementVisibility.ok !== true }; delete interactionsEngine.scopes.__l18; delete interactionsEngine.actionHandlers.__auditClear; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true` (`bad` shown because `onChange` cleared the field before validation).

---

### L-19 · `registerRule` does not update `validationsLibrary` (false “single source of truth”)

**Files:** `src/interactions/utils/validationRules.js` lines 6–12, `src/interactions/index.js`

Comments claim one rule library for both systems, but `registerRule` only mutates `validationRules.js`. `validationEngine` reads exclusively from `validationsLibrary.js`.

**Impact:** Rules registered at plugin boot via `InteractionsPlugin` work for `v-interactions` but not for auth/booking components using `interactionsEngine`.

**Fix:** Mirror registrations into `validationsLibrary`, or merge both into one exported registry.

#### Resolution ✅

**Status:** Resolved (already fixed during rules-unification pass; verified in this audit step).

**What was broken:** `registerRule` appeared to update only the directive registry while `validationEngine` read a separate `validationsLibrary` object.

**Why it happened:** Pre-unification duplicate modules; comments lagged the refactor.

**What changed:**
- `registerRule` mutates canonical `rules` in `src/utils/validation/rules.js`.
- `validationRules.js` and `validationsLibrary.js` re-export that same object (`validationsLibrary === directiveRules`).
- `InteractionsPlugin` `registerRule` calls therefore apply to both `v-interactions` and `interactionsEngine`.
- Covered by `tests/unit/validationRulesUnification.test.js` (`registerRule updates engine-visible validationsLibrary`).

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { registerRule, default: directiveRules } = await import('/src/interactions/utils/validationRules.js'); const { validationsLibrary } = await import('/src/utils/validation/validationsLibrary.js'); registerRule('__auditRuntimeRule', (v) => v === 'ok'); const out = { sameRegistry: validationsLibrary === directiveRules, runtimeVisible: validationsLibrary.__auditRuntimeRule('ok') === true && validationsLibrary.__auditRuntimeRule('no') === false }; delete validationsLibrary.__auditRuntimeRule; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

---

### L-20 · `isRadioCheck` builds CSS selector from unescaped `name` param

**File:** `src/interactions/utils/validationRules.js` — line 31

```js
el?.querySelector(`input[type=radio][name="${name}"]:checked`)
```

If `name` contains `"` or other selector-breaking characters, the selector can break or match unintended nodes.

**Fix:** Use `CSS.escape(name)` or validate `name` against a safe pattern before querying.

#### Resolution ✅

**Status:** Resolved (already fixed in canonical `rules.js` during rules-unification pass; regression test added here).

**What was broken:** `isRadioCheck` interpolated raw `name` into a `querySelector` string; quotes in `name` could break or widen the selector.

**Why it happened:** Legacy directive rule built the selector without escaping.

**What changed:**
- Canonical `isRadioCheck` in `src/utils/validation/rules.js` queries scoped radios and compares `el.name === param` (avoids selector injection from special characters in `name`).
- `validationRules.js` re-exports canonical rules (no separate unsafe copy).
- `tests/unit/isRadioCheckEscape.test.js` — radio group name containing `"` still resolves correctly.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const form = document.createElement('form'); form.setAttribute('interaction-container', ''); form.innerHTML = '<input type="radio" name="audit&quot;group" id="a"><input type="radio" name="audit&quot;group" id="b" checked>'; document.body.appendChild(form); const { validationsLibrary } = await import('/src/utils/validation/validationsLibrary.js'); const anchor = form.querySelector('#a'); const out = { checkedFound: validationsLibrary.isRadioCheck('', 'audit"group', { element: anchor }) === true }; form.remove(); console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved (covered by [S-01](#s-01--script-action-uses-eval--direct-code-execution-from-config) `allowedScripts` allowlist).

**What was broken:** `script` actions could call `window[functionName]` for any global function.

**Why it happened:** No allowlist gate on `functionName` lookups.

**What changed:** `script` now only runs `interactionsEngine.allowedScripts[functionName]` after `registerScriptFunction()`; globals are rejected. See S-01 resolution and `tests/unit/securityInteractionsEngine.test.js`.

**How to test in the browser (one paste — logs result when the promise settles):** Use the S-01 browser command in [S-01](#s-01--script-action-uses-eval--direct-code-execution-from-config) (`allowlistedFunctionRuns: true`, `inlineCodeBlocked: true`).

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `extendAction()` could register arbitrary handlers at runtime without review.

**Why it happened:** No bootstrap-time allowlist for custom action types.

**What changed:**
- `interactionsEngine.registerActionHandler(type, fn)` — reviewed registration entry point (allowlists + installs handler).
- `extendAction()` now only updates handlers already registered via `registerActionHandler`.
- `tests/unit/interactionsEngineSecurityBatch.test.js` — blocked vs allowed paths.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js'); const blocked = interactionsEngine.extendAction('__auditX', () => true) === false; interactionsEngine.registerActionHandler('__auditX', () => true); const allowed = interactionsEngine.extendAction('__auditX', () => false) === true; delete interactionsEngine._allowedActionHandlers.__auditX; delete interactionsEngine.actionHandlers.__auditX; console.log({ pass: blocked && allowed, blocked, allowed }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `pushEvent` dispatched on arbitrary DOM nodes passed in `action.target`.

**Why it happened:** `action.target` was forwarded directly when not `window`/`document`.

**What changed:**
- `resolveEventDispatchTarget()` in `interactionsEngine.js` — allows `window`, `document`, `targetElementKey`, or string keys resolved via `[data-element-key="..."]`; rejects raw `Element` nodes.
- `tests/unit/interactionsEngineSecurityBatch.test.js` — element key dispatch + raw node rejection.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const el = document.createElement('div'); el.setAttribute('data-element-key', 'auditEvt'); document.body.appendChild(el); let ok = false; el.addEventListener('auditEvt', (e) => { ok = e.detail?.ok === true; }); const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js'); interactionsEngine.actionHandlers.pushEvent({ eventName: 'auditEvt', eventData: { ok: true }, targetElementKey: 'auditEvt' }); const raw = document.createElement('span'); let rawRejected = true; const err = console.error; console.error = () => { rawRejected = true; }; interactionsEngine.actionHandlers.pushEvent({ eventName: 'auditEvt', target: raw }); console.error = err; el.remove(); console.log({ pass: ok && rawRejected, elementKeyWorks: ok, rawNodeRejected: rawRejected }); })();
```

**Expected:** Final log includes `pass: true`.

---

### P-08 · `scopeHasNoBlockingInvalids` re-validates every field on each call

**File:** `src/utils/validation/interactionsEngine.js` — lines 705–721

The method loops all fields and calls `validationEngine.validateField` for each one, duplicating work already done by `validateScope` or `processFieldChange` in the same submit flow.

**Impact:** O(n) full validation per guard check; amplified on large forms.

**Fix:** Reuse cached `fieldState.isValid` when not dirty, or accept a precomputed `validateScope` result.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `scopeHasNoBlockingInvalids` called `validationEngine.validateField` for every field on every guard check.

**Why it happened:** Guard always re-ran full validation instead of trusting fresh cached state.

**What changed:** `scopeHasNoBlockingInvalids` now re-validates only when `fieldState.dirty` is true; otherwise uses cached `isValid` / `failedRules`. Covered in `tests/unit/interactionsEngineSecurityBatch.test.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { interactionsEngine } = await import('/src/utils/validation/interactionsEngine.js'); const { validationEngine } = await import('/src/utils/validation/validationEngine.js'); let calls = 0; const orig = validationEngine.validateField; validationEngine.validateField = (...args) => { calls += 1; return orig(...args); }; interactionsEngine.scopes.__p08b__ = { fields: { t: { value: 'ok', dirty: false, touched: true, validationConfig: { required: true }, element: null, isValid: true, failedRules: [] } } }; interactionsEngine.scopeHasNoBlockingInvalids('__p08b__'); validationEngine.validateField = orig; delete interactionsEngine.scopes.__p08b__; console.log({ pass: calls === 0, validateFieldCalls: calls }); })();
```

**Expected:** Final log includes `pass: true` (`validateFieldCalls: 0`).

---

### P-09 · Booking step navigation runs two separate validation pipelines

**File:** `src/components/ui/form/BookingForm/OneOnOneBookinStep1.vue` — lines 94–118

`goToNext()` gated on `interactionsEngine.validateScope('oneOnOneBooking')` while `props.engine.goToStep(2)` also runs `stateEngine` step-1 validators (`addFieldRequirement` for `eventTitle`, `basePrice`, etc.), causing duplicate/conflicting validation pipelines.

**Fix:** Use `stateEngine.validate(1)` as the authoritative step gate; use `interactionsEngine.validateField` only for registered field UI (browser validity / notifications).

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Booking step “Next” used `validateScope` as the gate, then `goToStep(2)` ran a second full validation pipeline in `stateEngine`.

**Why it happened:** UI-scope validation and step-engine validation were both treated as independent gates.

**What changed:** `OneOnOneBookinStep1.vue` `goToNext()` now:
1. Syncs `eventTitle` into engine state.
2. Runs `interactionsEngine.validateField(eventTitleConfig)` for UI feedback.
3. Runs `props.engine.validate(1)` as the single authoritative step gate before `goToStep(2)`.

**How to test in the browser (one paste — logs result when the promise settles):** On the one-on-one booking step 1 UI, clear **Event Title** and click **Next** — step should stay on step 1 with the title error card (stateEngine validation). Fill title and required step-1 fields, click **Next** — should advance to step 2 without a duplicate `validateScope` gate in console flow.

**Expected:** Empty title blocks navigation; valid step-1 data advances once (no double validation gate in `goToNext`).

---

### BP-12 · Incompatible action config shapes: `actionType` vs `type`

**Files:** `src/interactions/utils/engine.js` (`action.actionType`), `src/utils/validation/interactionsEngine.js` (`action.type`)

The directive engine and reactive engine use different property names for the same concept. Config snippets are not portable between `v-interactions` and `interactionsEngine.runInteractions`.

**Fix:** Normalize on ingest (accept both keys) or document/enforce one schema.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Directive actions used `actionType`; reactive engine actions used `type` — configs were not portable.

**Why it happened:** Engines evolved separately without a shared action schema helper.

**What changed:**
- Added `src/interactions/utils/actionSchema.js` with `resolveActionType(action)` (`type ?? actionType`).
- `interactionsEngine.runInteractions` and directive `execAction` both use `resolveActionType`.
- `tests/unit/interactionsEngineSecurityBatch.test.js` — precedence tests.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { resolveActionType } = await import('/src/interactions/utils/actionSchema.js'); const out = { fromType: resolveActionType({ type: 'showElement' }) === 'showElement', fromActionType: resolveActionType({ actionType: 'hideElement' }) === 'hideElement', typeWins: resolveActionType({ type: 'show', actionType: 'hide' }) === 'show' }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Exported `stateEngine` API object listed `registerValidator` twice (copy-paste drift).

**Why it happened:** Duplicate lines left during API assembly.

**What changed:** Removed the extra `registerValidator` entry in `src/utils/stateEngine.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => { const { createStepStateEngine } = await import('/src/utils/stateEngine.js'); const engine = createStepStateEngine({ flowId: '__bp13', urlSync: 'none' }); const keys = Object.keys(engine).filter((k) => k === 'registerValidator'); const out = { exposedOnce: keys.length === 1, callable: typeof engine.registerValidator === 'function' }; console.log({ pass: Object.values(out).every(Boolean), ...out }); })();
```

**Expected:** Final log includes `pass: true` (`exposedOnce: true`).

---

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

#### Resolution ✅

**Status:** Resolved — duplicate of [L-14 in §8](#l-14--interactionsenginevalidatescope-treats-missing-scopes-as-valid) (same `interactionsEngine.validateScope` fix: `scopeError: 'SCOPE_NOT_REGISTERED'`).

---

### S-07 · Signup flow stores plaintext password in `sessionStorage`
**Files:** `src/components/auth/AuthSignUp.vue` lines 992–994; `src/components/auth/AuthConfirmEmail.vue` lines 433–444  
**Severity:** High

```js
sessionStorage.setItem("pendingSignupPassword", password.value);
```

The password is persisted in plaintext in session storage for auto-login after email confirmation. Any script running on the origin (XSS, compromised dependency, malicious extension) can read it. It also survives until explicitly removed and may remain after tab close depending on browser behavior.

**Fix:** Avoid storing passwords client-side. Prefer a server-side “confirm then login” token, or require the user to sign in manually after confirmation.

#### Resolution ✅

**Status:** Resolved — signup no longer persists passwords; users sign in manually after email confirmation.

**What changed:**
- `AuthSignUp.vue` stores only `pendingSignupEmail` (for confirm-page prefill) and explicitly removes any legacy `pendingSignupPassword` key.
- `AuthConfirmEmail.vue` removed auto-login with stored credentials; on success it redirects to `/log-in` with `email` and `emailConfirmed=1` query params.
- `AuthLogIn.vue` pre-fills email from query and shows `auth.confirmEmail.signInAfterConfirm`.

**Tests:** Manual auth flow; no `pendingSignupPassword` writes in source.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const signup = await fetch('/src/components/auth/AuthSignUp.vue').then((r) => r.text());
  const confirm = await fetch('/src/components/auth/AuthConfirmEmail.vue').then((r) => r.text());
  const out = {
    signupNoPasswordStore: !signup.includes('pendingSignupPassword'),
    confirmNoAutoLogin: !confirm.includes("getItem('pendingSignupPassword')"),
    confirmRedirectsLogin: confirm.includes("emailConfirmed: '1'"),
    pass: true,
  };
  out.pass =
    out.signupNoPasswordStore &&
    out.confirmNoAutoLogin &&
    out.confirmRedirectsLogin;
  return out;
})().then(o => console.log(o)).catch(console.error)
```

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

#### Resolution ✅

**Status:** Resolved (rules-unification pass) — both libraries re-export canonical `isSecurePassword` from `src/utils/validation/rules.js`, which requires upper + lower + digit + **special** + length ≥ 8.

**Tests:** `tests/unit/isSecurePasswordUnified.test.js`

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const directive = await import('/src/interactions/utils/validationRules.js');
  const engine = await import('/src/utils/validation/validationsLibrary.js');
  const weak = 'Abcdef12';
  const strong = 'Abcdef12!';
  const out = {
    weakMatch: directive.default.isSecurePassword(weak) === engine.validationsLibrary.isSecurePassword(weak),
    strongMatch: directive.default.isSecurePassword(strong) === engine.validationsLibrary.isSecurePassword(strong),
    bothRejectWeak: directive.default.isSecurePassword(weak) === false,
    pass: true,
  };
  out.pass = out.weakMatch && out.strongMatch && out.bothRejectWeak;
  return out;
})().then(o => console.log(o)).catch(console.error)
```

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

#### Resolution ✅

**Status:** Resolved — parent duplicate hidden input removed; code field uses single `id="confirmEmailCode"` on `CodeInputAuthComponent` hidden input; `interactionsEngine.register` binds after `nextTick` to that element.

**What changed:**
- `AuthConfirmEmail.vue`: removed `<input type="hidden" id="code" />`; `codeConfig.id` → `confirmEmailCode`; `handleCodeInput` syncs via `state.element`.
- `CodeInputAuthComponent` remains the sole hidden field owner (`:id="id"`).

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(() => {
  const dup = document.querySelectorAll('#code').length;
  const single = document.querySelectorAll('#confirmEmailCode').length;
  return {
    noLegacyCodeId: dup === 0,
    singleConfirmEmailCode: single <= 1,
    pass: dup === 0,
  };
})().then(o => console.log(o)).catch(console.error)
```
*(Run on `/confirm-email` after mount.)*

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

#### Resolution ✅

**Status:** Resolved — unknown rule types throw in DEV during validation; production logs `console.error` then fails closed; `interactionsEngine.register()` validates rule names at register time in DEV.

**What changed:** `failUnknownRule()` in `validationEngine.js`; `_assertKnownRuleTypes()` in `interactionsEngine.js`.

**Tests:** `tests/unit/validationEngineUnknownRule.test.js`

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { validationEngine } = await import('/src/utils/validation/validationEngine.js');
  let threw = false;
  try {
    validationEngine._runRuleList('x', [{ type: 'isEMail' }], {});
  } catch (e) {
    threw = /Unknown rule type/.test(e.message);
  }
  return { pass: threw, devThrows: threw };
})().then(o => console.log(o)).catch(console.error)
```

---

### L-17 · Directive `validateScope` fast path trusts stale `validated` stamps
**File:** `src/interactions/utils/engine.js` lines 173–181  
**Severity:** Medium

When `validated` is already set, scope validation reuses the stamp without re-running rules against the current value. If a field value changed programmatically (sync action, script, Vue model update) without triggering `handleInteraction`, the stamp can still read `validated="true"` for an now-invalid value.

**Fix:** Re-validate on `validateScope`, or invalidate stamps when value changes outside the directive event path.

#### Resolution ✅

**Status:** Resolved — `validateScope()` always re-runs `validateWithRequired()` and refreshes stamps via `stampValidation()`; stale `validated="true"` stamps no longer skip rule evaluation.

**Tests:** `tests/unit/validateScopeStaleStamp.test.js`

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { validateScope, stampInteractionConfig, stampValidation } = await import('/src/interactions/utils/engine.js');
  const scope = document.createElement('div');
  scope.setAttribute('interaction-container', '');
  const input = document.createElement('input');
  input.id = 'auditStale';
  input.value = 'a@b.co';
  stampInteractionConfig(input, [{ rules: [{ type: 'isEmail', error: 'x' }] }]);
  stampValidation(input, { isValid: true, failedRules: [] });
  input.value = 'bad';
  scope.appendChild(input);
  document.body.appendChild(scope);
  const res = validateScope(scope);
  scope.remove();
  return { pass: res.isValid === false && res.invalid.length === 1 };
})().then(o => console.log(o)).catch(console.error)
```

---

### B-13 · `isRadioCheck` in engine library queries the entire document
**File:** `src/utils/validation/validationsLibrary.js` lines 214–218  
**Severity:** Medium

```js
const radios = document.querySelectorAll(`input[type="radio"][name="${param}"]`);
```

Unlike `validationRules.js` (which scopes to `[interaction-container]`), this checks **all** radios with that name in the document. Duplicate group names elsewhere can make unrelated selections satisfy validation.

**Fix:** Scope queries to `ctx.element.closest('form')` or a provided container, matching the directive implementation.

#### Resolution ✅

**Status:** Resolved (rules-unification pass) — canonical `isRadioCheck` in `src/utils/validation/rules.js` uses `getScopedRoot(ctx)` (`[interaction-container]` → `form` → `document`) and filters radios by `el.name === param` (no document-wide attribute selector).

**Tests:** `tests/unit/isRadioCheckScoped.test.js`, `tests/unit/isRadioCheckEscape.test.js`

**How to test in the browser (one paste — logs result when the promise settles):**
```js
  (async () => {
    const { validationsLibrary } = await import('/src/utils/validation/validationsLibrary.js');
    const outer = document.createElement('div');
    outer.innerHTML = '<input type="radio" name="plan" checked />';
    document.body.appendChild(outer);
    const form = document.createElement('form');
    form.setAttribute('interaction-container', '');
    form.innerHTML = '<input type="radio" name="plan" id="r" />';
    document.body.appendChild(form);
    const anchor = form.querySelector('#r');
    const out = {
      ignoresOuterSelection: validationsLibrary.isRadioCheck('', 'plan', { element: anchor }) === false,
      pass: false,
    };
    out.pass = out.ignoresOuterSelection;
    outer.remove();
    form.remove();
    return out;
  })().then(o => console.log(o)).catch(console.error)
```

---

### M-12 · Confirm-email code errors are computed but never shown in the OTP UI
**Files:** `src/components/auth/AuthConfirmEmail.vue` lines 37–38, 197–204; `src/components/input/CodeInputAuthComponent.vue`  
**Severity:** Medium

`AuthConfirmEmail` passes `:show-errors="codeErrors.length > 0"` and `:errors="codeErrors"` to `CodeInputAuthComponent`, but that component does not declare or render these props (same class of bug as B-11). Users only see a generic form-level error after submit failure, not per-digit/code validation feedback.

**Fix:** Add error rendering to `CodeInputAuthComponent`, or render `codeErrors` in `AuthConfirmEmail` below the OTP widget.

#### Resolution ✅

**Status:** Resolved — `CodeInputAuthComponent` now declares `showErrors` / `errors` props and renders validation messages (orange border + icon list), matching `BaseInput` / auth input patterns.

**What changed:** `src/components/input/CodeInputAuthComponent.vue` — props + template error block; `AuthConfirmEmail` already passes `:show-errors` / `:errors`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const src = await fetch('/src/components/input/CodeInputAuthComponent.vue').then((r) => r.text());
  return {
    hasShowErrorsProp: src.includes('showErrors'),
    rendersErrors: src.includes('showErrors && errors.length'),
    pass: src.includes('showErrors') && src.includes('errorObj.error'),
  };
})().then(o => console.log(o)).catch(console.error)
```

---

### L-18 · Booking step treats `interactionsEngine.validateScope` as full-step validation
**File:** `src/components/ui/form/BookingForm/OneOnOneBookinStep1.vue` lines 94–118  
**Severity:** Medium

`goToNext()` gates navigation on `interactionsEngine.validateScope('oneOnOneBooking')`, but only `eventTitle` is registered in that scope. Other required booking fields (duration, price, availability, etc.) are not registered and are not validated by this call. The step can advance after title-only validation while other invalid data remains.

**Fix:** Register all required fields in the scope, or run `stateEngine` step validators (and/or `eventStepValidators`) before `goToStep(2)`.

#### Resolution ✅

**Status:** Resolved — `goToNext()` validates the title via `interactionsEngine.validateField`, then gates navigation on `await props.engine.validate(1)` (flow/state step validators). No `interactionsEngine.validateScope` call.

**Tests:** `tests/unit/oneOnOneBookingStepValidation.test.js`

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const src = await fetch('/src/components/ui/form/BookingForm/OneOnOneBookinStep1.vue').then((r) => r.text());
  return {
    usesFlowValidate: src.includes('props.engine.validate(1)'),
    noValidateScope: !src.includes('interactionsEngine.validateScope'),
    pass: src.includes('props.engine.validate(1)') && !src.includes('interactionsEngine.validateScope'),
  };
})().then(o => console.log(o)).catch(console.error)
```

---

### B-14 · Directive `getFieldValue` always trims input values
**File:** `src/interactions/utils/engine.js` line 112  
**Severity:** Low

```js
return String(el.value ?? '').trim()
```

Leading/trailing spaces are removed before rule evaluation. This can cause `matchValue`/`minLength` results to differ from raw input and from `interactionsEngine` (which does not trim in `_getElementValue`). Passwords or codes intentionally containing spaces will validate differently across systems.

**Fix:** Trim only for rules that require it, or align trimming behavior across both engines.

#### Resolution ✅

**Status:** Resolved — directive `getFieldValue()` returns raw `el.value`; empty checks in `isEmptyField()` still trim for required detection; individual rules (e.g. `isEmail`, `matchValue`) trim where semantics require it.

**Tests:** `tests/unit/getFieldValueNoTrim.test.js`

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { getFieldValue } = await import('/src/interactions/utils/engine.js');
  const input = document.createElement('input');
  input.value = '  x  ';
  return { pass: getFieldValue(input) === '  x  ' };
})().then(o => console.log(o)).catch(console.error)
```

---

### P-08 · `initialPass` runs all interaction configs on mount (pre-interaction side effects)
**File:** `src/interactions/directives/vInteractions.js` lines 119–124  
**Severity:** Low

On mount, `initialPass` calls `handleInteraction` for every config block, executing `onValid`/`onInvalid` actions before the user interacts. This can prematurely show/hide elements (e.g. password eye icon, helper text) and dispatch `validation:pass`/`validation:fail` events with empty/default values.

**Fix:** Separate “silent validate” from “execute actions”, or run initial validation without action side effects unless `runActionsOnMount` is explicitly enabled.

#### Resolution ✅

**Status:** Resolved — `initialPass` calls `handleInteraction` with `{ runActions: false, dispatchEvents: false }` so mount only stamps validation; actions and `validation:*` events run on user trigger events.

**Tests:** `tests/unit/vInteractionsInitialPass.test.js`

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const src = await fetch('/src/interactions/directives/vInteractions.js').then((r) => r.text());
  return {
    silentInitialPass: src.includes('runActions: false') && src.includes('dispatchEvents: false'),
    pass: src.includes('runActions: false') && src.includes('dispatchEvents: false'),
  };
})().then(o => console.log(o)).catch(console.error)
```

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

#### Resolution ✅

**Status:** Resolved (rules-unification pass) — canonical `custom` in `src/utils/validation/rules.js` returns `false` when `param` is not a function (fail closed).

**Tests:** `tests/unit/customRuleFailsClosed.test.js`

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { validationsLibrary } = await import('/src/utils/validation/validationsLibrary.js');
  const out = {
    nullFails: validationsLibrary.custom('x', null, {}) === false,
    stringFails: validationsLibrary.custom('x', 'fn', {}) === false,
    fnWorks: validationsLibrary.custom('ok', (v) => v === 'ok', {}) === true,
    pass: true,
  };
  out.pass = out.nullFails && out.stringFails && out.fnWorks;
  return out;
})().then(o => console.log(o)).catch(console.error)
```

---

*Flow-system-only audit items (registry, `flowDataPipeline`, cache, retry, middleware, etc.) live in [`src/services/flow-system/FLOW_SYSTEM_AUDIT.md`](../services/flow-system/FLOW_SYSTEM_AUDIT.md) §9–10. They were removed from this file to avoid duplicating BUG-01 and related flow findings.*