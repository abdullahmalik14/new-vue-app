# Disable-Until-Script Interaction — Delivery Note

**Requested by:** Linden — *"We need a new interaction. Disable until script in
Dom. So we disable login or sign up button until Cognito is in Dom because it
won't work otherwise."*

**Status:** ✅ Built, tested, documented — ⏸ **not yet wired into the live
auth buttons** (reason explained at the bottom).

---

## 1. What it does

A reusable, declarative interaction that keeps an element (e.g. **Log in** /
**Sign up** button) **disabled and click-blocked** until a required third-party
script is in the DOM, then **enables it automatically**.

This is the generalised version of what the auth views currently do by hand
(each view has its own `isCognitoScriptReady` ref + asset load + `:disabled`
binding). It moves that pattern into the shared `v-interactions` system so any
button can use it with one config — no per-component code.

## 2. How it works

- On mount it checks readiness. **If the script is already present, it does
  nothing** (never disables a working button).
- If not ready, it sets `disabled` + `aria-disabled="true"` (+ optional CSS
  class) and adds a **capture-phase click guard** so the action can't fire even
  on styled / component buttons.
- It then **polls** (`setInterval`) for the script.
  - **Ready** → enables the element, removes the guard, fires
    `interactions:script-ready`.
  - **Timeout** → stays disabled (the action wouldn't work anyway), fires
    `interactions:script-timeout`.
- Readiness = a `window` **global** is defined and/or a **`<script>` selector**
  matches the DOM (you can use either or both).
- On `beforeUnmount` the directive clears the timers + guard, so a late script
  can't re-enable a dead element.

No new dependency — plain `setInterval` + `window`/`document` checks, so the
directive stays lightweight.

## 3. Files added / changed

| File | Change |
|------|--------|
| `src/interactions/utils/disableUntilScript.js` | **New.** Core logic: `setupDisableUntilScript(el, cfg)` + `isScriptGateReady(cfg)`. |
| `src/interactions/directives/vInteractions.js` | Wired the `disableUntilScript` config key into the `v-interactions` directive (with cleanup). |
| `src/interactions/index.js` | Re-exports the helpers for programmatic use. |
| `tests/unit/disableUntilScript.test.js` | **New.** 7 unit tests. |
| `docs/instruction/Disable Until Script Interaction.md` | **New.** Full usage guide. |

## 4. Usage

```vue
<script setup>
const cognitoGate = Object.freeze([{
  disableUntilScript: {
    global: 'AmazonCognitoIdentity',     // window global to wait for
    selector: 'script[src*="cognito"]',  // and/or a <script> that must be in the DOM
    timeout: 30000,                      // ms before giving up (stays disabled)
    pollInterval: 100,                   // ms between checks
    disabledClass: 'is-script-pending',  // optional class while pending
  },
}]);
</script>

<template>
  <button v-interactions="cognitoGate" type="submit">Log in</button>
</template>
```

| Config key | Type | Default | Notes |
|------------|------|---------|-------|
| `global` | string | — | Ready when `window[global]` is defined. |
| `selector` | string | — | Ready when `document.querySelector(selector)` matches. |
| `timeout` | number | `30000` | Then stops polling, stays disabled. |
| `pollInterval` | number | `100` | Time between checks. |
| `disabledClass` | string | — | Optional class while pending. |

**Events (bubbling):** `interactions:script-pending`,
`interactions:script-ready`, `interactions:script-timeout`.

## 5. Verification

- `npx vitest run tests/unit/disableUntilScript.test.js` → **7/7 passed**.
- `npm run build` → **exit 0** (built clean).
- Lint → clean. No visual change anywhere (nothing existing was modified).

## 6. ⏸ Why it is NOT wired into the live auth buttons yet

The live auth views (`AuthLogin.vue`, `AuthSignUp.vue`, …) **already** gate their
buttons through their own `isCognitoScriptReady` ref, so login/sign-up work
today. Swapping that working logic for the new interaction touches the real
Cognito flow, and a green build does **not** prove that flow still behaves the
same (script-load timing, the existing `:disabled` binding, submit handler).

So per our "don't regress working auth" rule, I delivered the interaction as a
**ready, tested, opt-in tool** and left the live buttons untouched. Wiring it in
is a small follow-up that needs a **manual login + sign-up smoke test** to
confirm the buttons still enable/disable correctly with real Cognito — happy to
do that on your sign-off, or show it first on the components demo page.
