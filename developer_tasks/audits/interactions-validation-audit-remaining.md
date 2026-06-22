# Interactions & Validation Audit — Remaining Fixes

**Verified:** 2026-06-11 against `new-vue-app-main/src/`  
**Source audit:** [INTERACTIONS_VALIDATION_AUDIT.md](./INTERACTIONS_VALIDATION_AUDIT.md)  
**Code locations:** `src/interactions/`, `src/utils/validation/`, `src/utils/stateEngine.js`, flow validators under `src/services/*/validators/`

---

## Summary

| Category | Count |
|----------|------:|
| Audit items verified fixed in code | **68** |
| Cross-system integration gaps (no Resolution in audit) | **3** |
| Marked resolved but residual risk / partial | **2** |
| Doc / path drift only (fix verified under new paths) | **4** |

**Bottom line:** Rule unification, security hardening, engine lifecycle, async validation, auth form validation, booking step gates, and flow-validator integer checks are implemented. Remaining work is **cross-system integration** (UI ↔ step engine ↔ `FlowHandler.run`) plus two small residual risks called out below.

Flow-registry, cache, retry, middleware, and `flowDataPipeline` items stay in [`FLOW_SYSTEM_AUDIT.md`](./FLOW_SYSTEM_AUDIT.md).

---

## 1. INT-01 — Three validation pipelines are disconnected

**Audit status:** Open — §9 has no Resolution section.

**Code reality:** Three independent pipelines still exist with no shared registry or bridge:

| Pipeline | Location | Used by |
|----------|----------|---------|
| Interactions | `interactionsEngine.processFieldChange` / `validateScope` | Auth templates, some form UI |
| Step engine | `stateEngine.runValidators` / `engine.validate(step)` | Multi-step booking, onboarding |
| Flow data | `flowDataPipeline.validatePayload/Response` | `FlowHandler.run` |

Auth views call `interactionsEngine.validateScope(SCOPE_ID)` before submit. Booking step 1 uses `props.engine.validate(1)`. Chat/analytics/dashboard templates call `FlowHandler.run(...)` with **no** shared pre-flight hook tying UI scope validation to flow payload validators.

**Fix:** Add `validateBeforeFlow(flowName, payload, { validateUiScope })` (or register UI validators into flow registry entries) so domain validators are reused across pipelines.

**Files:** New helper (e.g. `src/utils/validation/validateBeforeFlow.js`); callers in templates that invoke `FlowHandler.run`.

---

## 2. INT-02 — Interactions pipeline lacks structured stages / error surfacing

**Audit status:** Open — §9 has no Resolution section.

**Code reality:** `interactionsEngine.runInteractions()` iterates actions with no per-action `try/catch`, no `{ isValid, actionErrors }` result, and no stage timing metadata (unlike `flowDataPipeline`).

```1306:1323:new-vue-app-main/src/utils/validation/interactionsEngine.js
  runInteractions(actions, fieldConfig) {
    if (!actions || !actions.length) return;
    // ...
    for (const action of actions) {
      // ...
      handler.call(this, action, state, fieldConfig);
    }
  },
```

A thrown action handler can break the change pipeline without a structured error returned to the UI.

**Fix:** Wrap each handler in `try/catch`, accumulate `actionErrors`, optionally log DEV stage timings aligned with flow pipeline conventions.

**Files:** `src/utils/validation/interactionsEngine.js`

---

## 3. INT-03 — No validation gate before `FlowHandler.run` in UI call sites

**Audit status:** Open — §9 has no Resolution section.

**Code reality:** Grep shows no `validateBeforeFlow`, `submitFlow`, or `interactionsEngine` / `validationEngine` usage before `FlowHandler.run` in production templates (chat, analytics, orders). Examples:

- `CreatorDashboardChatsPage.vue`, `FanDashboardChatsPage.vue` — `FlowHandler.run('chat.sendMessage', ...)`
- `AnalyticsPage.vue` — `FlowHandler.run('analytics.fetch', ...)`

Validation is assumed to have happened elsewhere or not at all.

**Fix:** Same as INT-01 — standardize a pre-flight helper and adopt it at `FlowHandler.run` call sites.

---

## 4. S-06 (partial) — OAuth callback still posts with `targetOrigin: '*'`

**Audit status:** Resolved for **parent** handlers (`AuthLogIn.vue`, `AuthSignUp.vue` use `oauthPostMessage.js` allowlists and `postOAuthAck()`).

**Code reality:** The Twitter **callback** page still delivers messages with a wildcard origin:

```107:110:new-vue-app-main/src/templates/auth/page/role/TwitterAuthPage.vue
        // We intentionally use "*" for delivery because the callback page might be on
        // a different origin (e.g., ngrok) than the parent. The parent must validate
        // using `event.source` and the `state` value.
        window.opener.postMessage(message, '*');
```

Parent-side origin checks mitigate inbound risk; outbound `'*'` remains a documented trade-off (any listener on the opener window can observe the message). Tighten when callback and parent origins can be configured to match `VITE_TWITTER_REDIRECT_URI` / `VITE_OAUTH_ALLOWED_ORIGINS`.

**Files:** `src/templates/auth/page/role/TwitterAuthPage.vue`

---

## 5. Residual — `scopeHasNoBlockingInvalids` treats missing scope as “no blockers”

**Audit status:** Not a separate audit ID (related to fixed L-14 on `validateScope`).

**Code reality:** `validateScope()` correctly returns `isValid: false` + `scopeError: 'SCOPE_NOT_REGISTERED'` when the scope is missing. **`scopeHasNoBlockingInvalids()`** still returns `hasNoBlockingInvalids: true` for an unregistered scope:

```1149:1160:new-vue-app-main/src/utils/validation/interactionsEngine.js
  scopeHasNoBlockingInvalids(scopeId) {
    const scope = this.scopes[scopeId];
    if (!scope) {
      return {
        hasNoBlockingInvalids: true,
        blockingFields: [],
        scopeId
      };
    }
```

Callers using this guard for step/flow gating could proceed when no fields were registered.

**Fix:** Mirror `validateScope` — return `hasNoBlockingInvalids: false` (and a `scopeError`) when the scope is missing; log loudly in DEV.

**Files:** `src/utils/validation/interactionsEngine.js`

---

## 6. Stale inline comment in `interactionsEngine.js`

**Audit status:** N/A (doc hygiene).

**Code reality:** File footer still says “No unregister yet” and “You must manually call register” — but `unregister()`, `clearScope()`, and debounce APIs exist (B-02 / M-02 resolved).

**Fix:** Remove or update the stale comment block (~lines 1415–1425).

**Files:** `src/utils/validation/interactionsEngine.js`

---

## Verified fixed (representative checks)

These audit items were confirmed in source (not comments-only):

| Area | IDs | Evidence |
|------|-----|----------|
| Rule unification | A, L-01–L-04, L-15–L-17, L-19, B-09 | Canonical `src/utils/validation/rules.js`; re-exports; `tests/unit/validationRulesUnification.test.js` |
| Security | S-01–S-05, S-07 (script), S-08–S-10 | `allowedScriptsRegistry.js` (no `eval`); `setHTML` uses `textContent` unless `trustedHTML`; `extendAction` requires prior `registerActionHandler`; passive only on wheel/touch |
| Engine lifecycle | B-02, M-02, M-08 | `unregister`, `clearScope`, `_debounceTimers` |
| Async validation | M-01 | `validateAsyncRules`, `rule.async`, `pending` state, `flushAsyncValidation` |
| Auth flows | S-06 (parent), S-07 (password), L-16, M-12 | `oauthPostMessage.js`; no `setItem('pendingSignupPassword')`; `confirmEmailCode` single ID; `AuthCodeInput` renders `showErrors` |
| Scope validation | L-14, L-11, L-17, B-12, B-14 | `SCOPE_NOT_REGISTERED`; re-validate on `validateScope`; `failUnknownRule`; raw `getFieldValue` |
| Booking | P-09, L-18 | `OneOnOneBookingStep1.vue` uses `validateField` + `engine.validate(1)`, not `validateScope` |
| Flow validators | L-13, M-10 | `eventFlowValidators.js` integer checks; enum validation for event `type` |
| Accessibility | B-06, M-05 | `stampValidation` sets `aria-invalid` |
| State engine | BP-13 | Single `registerValidator` in exported API |

---

## Audit doc path drift (fixes verified under new paths)

The audit references older paths; code was verified at current locations:

| Audit path | Current path |
|------------|--------------|
| `src/components/auth/AuthSignUp.vue` | `src/templates/auth/views/AuthSignUp.vue` |
| `src/components/auth/AuthConfirmEmail.vue` | `src/templates/auth/views/AuthConfirmEmail.vue` |
| `src/components/input/CodeInputAuthComponent.vue` | `src/components/forms/inputs/AuthCodeInput.vue` |
| `src/components/forms/BookingForm/OneOnOneBookinStep1.vue` | `src/components/forms/booking-form/OneOnOneBookingStep1.vue` |

---

## Tests

Unit tests referenced by the audit exist under `tests/unit/` (e.g. `validationRulesUnification.test.js`, `oauthPostMessage.test.js`, `oneOnOneBookingStepValidation.test.js`). **`npm run test:unit` was not run** in this verification pass (`vitest` not available — dependencies likely not installed).

---

## Recommended priority

1. **INT-01 + INT-03** — `validateBeforeFlow` bridge + adopt at `FlowHandler.run` call sites (highest product risk).
2. **INT-02** — structured errors in `runInteractions` (debuggability).
3. **`scopeHasNoBlockingInvalids` missing-scope behavior** — quick alignment with L-14 fix.
4. **S-06 callback** — tighten `postMessage` target when ngrok/multi-origin setup allows.
5. **Comment cleanup** — `interactionsEngine.js` footer.
