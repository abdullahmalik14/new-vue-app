# Auth Pages — Interactions Usage Audit

**Requested by:** Linden — *"Then audit interactions usage for auth pages, be
sure it's setup correctly using the config."*

**Audit type:** Read-only. **No code was changed.** This document only reports how
the auth pages wire into the interactions/validation engine and whether it is
done "via the config" correctly. Login, sign-up, password recovery, email
confirm and onboarding all **work today** — nothing here is a functional bug.

**Files reviewed (the 6 config-driven view screens):**
- `src/templates/auth/views/AuthLogin.vue` (scope `loginForm`)
- `src/templates/auth/views/AuthSignUp.vue` (scope `signupForm`)
- `src/templates/auth/views/AuthLostPassword.vue` (scope `lostPasswordForm`)
- `src/templates/auth/views/AuthResetPassword.vue` (scope `resetPasswordForm`)
- `src/templates/auth/views/AuthConfirmEmail.vue` (scope `confirmEmailForm`)
- `src/templates/auth/views/AuthSignUpOnboarding.vue` (scope `onboardingForm`)

**Engine used:** `src/utils/validation/interactionsEngine.js` (the Vue-reactive
field registry) + `validationEngine`. The `v-interactions` **directive** system
is *not* used on auth pages (see F5).

---

## Verdict (short answer for Linden)

✅ **Yes — auth pages ARE set up correctly using the config.** Every field is
declared as a config object (`{ scope, id, validation: { required, rules… },
validateOnInput }`), registered with the engine, read back reactively via
`getFieldState`, validated on submit via `validateScope`, and cleaned up on
unmount via `clearScope`. The config shape matches what the engine expects.

⚠️ **But the *way* it's wired is heavily duplicated and inconsistent between
pages.** The configuration is correct; the surrounding plumbing is copy-pasted
6× with small differences. The findings below are all quality / consistency /
DRY items — safe to improve later, none require a UI change.

---

## How a page is wired today (the correct, shared shape)

Each view repeats this lifecycle:

1. `const SCOPE_ID = '<form>Form'`
2. `const xConfig = computed(() => ({ scope: SCOPE_ID, id, validation: {…}, validateOnInput }))`
3. `const xState = computed(() => interactionsEngine.getFieldState(xConfig.value))`
4. `xErrors = computed(...)` derived from `xState.failedRules`
5. `watch(i18nLocale, …)` → manually re-assign `state.validationConfig = xConfig.value.validation`
6. `onMounted` → `interactionsEngine.register(xConfig.value, value, el)`
7. `@input/@change` → either `processFieldChange()` **or** a bespoke handler
8. submit → `interactionsEngine.validateScope(SCOPE_ID)` + `showBrowserError`
9. `onBeforeUnmount` → `interactionsEngine.clearScope(SCOPE_ID)`

Steps 1, 2, 3, 6, 8, 9 are essentially identical across all six files.

---

## Summary table

| # | Finding | Severity | Where |
|---|---------|----------|-------|
| F1 | ~80-line validation wiring duplicated across all 6 views | 🟡 Medium (DRY) | all 6 |
| F2 | Config is `computed` but engine snapshots it at register → manual locale re-sync boilerplate | 🟡 Medium | all 6 |
| F3 | `validateOnInput` set inconsistently per field/page | 🟢 Low (UX consistency) | all 6 |
| F4 | Field-change handling mixes `processFieldChange` with bespoke handlers | 🟢 Low | SignUp, Reset, Onboarding |
| F5 | Auth uses only the reactive engine, not the `v-interactions` directive | 🟢 Info | all 6 |
| F6 | Submit/error paths call `getFieldState({scope,id})` with ad-hoc literals instead of the config objects | 🟢 Low | all 6 |
| F7 | Cognito readiness is a local `ref`, not part of the interaction config | 🟢 Info | Login, SignUp |

---

## Findings (detail)

### F1. 🟡 Validation wiring is duplicated across all 6 views
The configs themselves are clean, but the *plumbing* around them (states, error
computeds, locale watcher, register, clearScope, submit handler, first-invalid
focus + `showBrowserError`) is copy-pasted in every view with minor variations.
**Impact:** a change to validation UX must be made in 6 places; drift is likely.
**Recommendation:** extract a composable, e.g.
`useAuthFormValidation(scopeId, fieldConfigs)` returning `{ states, errors,
registerAll, clearAll, validateAll, handleChange }`. This is the same theme as
**A3** in `AUTH_TEMPLATES_AUDIT.md` and carries the same risk — do it
incrementally with a live login/sign-up smoke test.
**Risk to do:** 🔴 (touches working auth) → behind sign-off.

### F2. 🟡 Config reactivity gap → manual locale re-sync
Field configs are `computed()` so their messages update with locale. But
`interactionsEngine.register()` stores `validationConfig` **once** at register
time, so each view has to manually patch it on locale change:
```js
watch(i18nLocale, () => { state.validationConfig = config.value.validation; /* + re-validate */ })
```
This is repeated, easy to forget, and the reason the locale watchers are so long.
**Recommendation:** add an engine helper `reconfigureField(fieldConfig)` (or
`updateValidationConfig`) and/or let the F1 composable own this in one place.
**Risk to do:** 🟡 (engine method is additive; the per-view watcher removal needs testing).

### F3. 🟢 `validateOnInput` is inconsistent
- Login: email `false`, password `false`
- SignUp: email `false`, password `true`, confirmPassword `true`
- ResetPassword: email `false`, code `false`, password `true`
- ConfirmEmail: email `false`, code `false`
- Onboarding: role `false`, username `false`

So some password fields validate live while others don't, and the two "code"
fields differ from the password fields. **Not a bug** — but the live-vs-on-submit
behaviour should be a deliberate, documented rule (e.g. "passwords validate on
input, everything else on submit"), then applied uniformly.
**Risk to do:** 🟢 low.

### F4. 🟢 Mixed field-change handling
The engine's own docs state *"`processFieldChange()` is the only thing you need
to call from `@input`/`@change`"*. Some fields follow this (SignUp password/confirm,
Reset password), but others use bespoke `@input` handlers that call
`getFieldState` + `validateField` manually (Login email/password, Onboarding
username with its async availability check). **Recommendation:** standardise on
`processFieldChange` where possible; keep bespoke logic only where an async/extra
check genuinely needs it (e.g. username availability).
**Risk to do:** 🟢 low–🟡 (Onboarding username has an async check — test it).

### F5. 🟢 Auth uses only the reactive engine (not `v-interactions`)
There are two interaction systems in the project. Auth pages use the reactive
`interactionsEngine`; the declarative `v-interactions` directive is not used here.
This is acceptable (by design), but worth flagging for two reasons:
(a) "config-driven" means the *reactive field config*, not the directive config;
(b) the new **disable-until-script** interaction is directive-based, so wiring it
onto the auth buttons would mix the two systems — better to either keep the auth
buttons on their existing `isCognitoScriptReady` ref or add an engine-level
equivalent. (See F7 + `DISABLE_UNTIL_SCRIPT_INTERACTION.md`.)

### F6. 🟢 Ad-hoc `getFieldState` literals in submit paths
On submit, error/focus code builds throwaway objects:
`interactionsEngine.getFieldState({ scope: SCOPE_ID, id: fieldId })`
instead of reusing the already-defined config objects. Works fine, but it
re-hardcodes scope/id and bypasses the single config source.
**Recommendation:** look up the existing `*Config.value` by id (a small map).
**Risk to do:** 🟢 low.

### F7. 🟢 Cognito readiness sits outside the config
Login/SignUp gate their submit button with a local `isCognitoScriptReady` ref +
an asset load, not through the interaction config. This is fine and intentional;
just noting that "interactions setup" for the button-enable behaviour is **not**
config-driven today. The new `disableUntilScript` interaction (delivered
separately) is the reusable, declarative version of this.

---

## Recommended work order (if/when we fix — all behind sign-off)

1. **F2** — add `reconfigureField()` to the engine (additive, low risk), then
2. **F6 / F3 / F4** — small per-view consistency cleanups (one page at a time,
   build + smoke test each), then
3. **F1** — extract the shared `useAuthFormValidation` composable (highest risk;
   pairs with `AUTH_TEMPLATES_AUDIT.md` A3; incremental + manual login/sign-up
   smoke test after each view).

**None of the above changes any UI or any validation rule** — they only de-dupe
and standardise the plumbing. They are deliberately **not** applied in this audit.
