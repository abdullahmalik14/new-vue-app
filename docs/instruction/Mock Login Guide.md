# Mock Login Guide — How to Log In as a User Without Cognito

This guide explains how to **mock login** in local/dev so you can work on
authenticated pages without hitting AWS Cognito, and how to **set up users and
roles** for testing.

> TL;DR: In dev the app uses a **dev auth shim** that bypasses Cognito. Go to
> `/log-in`, enter **any email + any password**, and you're in. To test a
> specific role, call `window.APP.setMockUserState({ role: 'creator', onboardingPassed: true, kycPassed: true })`
> in the browser console **before** logging in.

---

## 1. How it works (the big picture)

Authentication is split into two interchangeable handlers behind a single proxy:

| Handler | File | What it does |
|---------|------|--------------|
| **Dev shim** (mock) | `src/dev/utils/auth/authHandlerDev.js` | Bypasses Cognito. Accepts any credentials, mints a **fake JWT** locally, stores it in `localStorage.idToken`. |
| **Real Cognito** | `src/dev/utils/auth/awsCognitoHandler.js` | Talks to AWS Cognito via `amazon-cognito-identity-js`. |
| **Selector / proxy** | `src/dev/utils/auth/authHandler.js` | Picks the active handler and exposes a stable `authHandler` API + console helpers. |

The UI and store **never** import the handlers directly for the decision — they
import the `authHandler` proxy, which forwards to whichever handler is active.

Login is **not** routed through the `mock-api-demo` REST layer. The REST mock
(`src/lib/mock-api-demo/`) is for API endpoints (profiles, cart, flows), not for
auth. Auth goes: **UI → `authHandler.login()` → `useAuthStore.setTokenAndDecode()`**.

### Which handler is active?

Decided in `authHandler.js`:

```js
const authMode = import.meta.env.VITE_AUTH_DEV_SHIM;          // 'dev' | 'cognito'
const isDevelopment = import.meta.env.DEV /* ... */;
const shouldUseDev = authMode === 'dev' || (authMode !== 'cognito' && isDevelopment);
```

- `VITE_AUTH_DEV_SHIM=dev` → **always** dev shim (Cognito bypassed).
- `VITE_AUTH_DEV_SHIM=cognito` → **always** real Cognito.
- Not set + running `vite dev` → dev shim is auto-selected.

Current repo defaults: `.env` and `.env.development` ship with
`VITE_AUTH_DEV_SHIM=dev`. `.env.example` ships with `cognito` (for production
templates).

Check at runtime in the console:

```js
window.APP.getCurrentAuthMode();   // "dev" or "cognito"
```

---

## 2. The fastest way to mock login

1. Make sure `VITE_AUTH_DEV_SHIM=dev` (it already is in `.env.development`).
2. Run the app (`npm run dev`).
3. Navigate to `/log-in`.
4. Enter **any email** and **any password** and submit.

The dev shim (`authenticateDevUser`) does not validate the password. It seeds an
in-memory user record for that email, mints a fake JWT, stores it in
`localStorage.idToken`, and the store decodes it.

> Note: a freshly-seeded user has `role: null` and `onboardingPassed: false`, so
> route guards will send you to `/sign-up/onboarding` first. To land directly on
> a role dashboard, pre-seed the user state (next section).

---

## 3. Mock login as a specific user + role

Roles in this app: **`creator`**, **`fan`**, **`agent`**, **`vendor`**, plus
**`guest`** (authenticated but no role yet) and **`all`** (public routes).

### Option A — Set the user BEFORE logging in (recommended)

In the browser console, before you submit the login form:

```js
window.APP.setMockUserState({
  email: 'creator@test.com',
  role: 'creator',          // creator | fan | agent | vendor
  onboardingPassed: true,   // skip the onboarding redirect
  kycPassed: true,          // skip the KYC redirect (creator needs this)
  name: 'Test Creator'
});
```

Then log in with that same email (any password). The minted JWT carries
`custom:role`, `custom:onboardingPassed`, and `custom:kyc`, so guards let you
straight into the role dashboard.

`setMockUserState(state)` accepts any subset of:
`{ role, onboardingPassed, kycPassed, name, email }`.

### Option B — Quick role only

```js
window.APP.setMockRole('fan');   // alias of mockUserRole(role)
```

Sets just the role on the mock user. Combine with login.

### Option C — Change role AFTER you're logged in

```js
// Re-mints the token with the new attributes and updates localStorage
await authHandler.updateProfileAttributes({
  'custom:role': 'creator',
  'custom:kyc': 'true',
  'custom:onboardingPassed': 'true'
});

// Re-decode the refreshed token into the store
import { useAuthStore } from '@/stores/useAuthStore';
const auth = useAuthStore();
const { idToken } = await authHandler.restoreSession();
auth.setTokenAndDecode(idToken);
```

This is exactly what the onboarding screen (`AuthSignUpOnboarding.vue`) does when
a user picks their role.

### Inspect the current mock user

```js
window.APP.mockUser;              // live mock user object
window.APP.getRegisteredUsers(); // all seeded dev users this session
```

---

## 4. "Setting up users and roles from a config"

There are two layers that act as configuration today:

### a) Environment config — which auth mode

`VITE_AUTH_DEV_SHIM` in your `.env` files chooses dev-shim vs Cognito. This is the
single switch that "bypasses Cognito or mocks the Cognito return".

### b) Role config — where roles are defined and enforced

Roles and their gating live in **`src/router/routeConfig.json`**:

- `supportedRoles` per route (e.g. `["creator","fan","agent","vendor"]` or `["all"]`).
- Per-role `dependencies` (onboarding / KYC) with `fallbackSlug`, e.g.:

```json
"dependencies": {
  "roles": {
    "creator": {
      "onboardingPassed": { "required": true, "fallbackSlug": "/sign-up/onboarding" },
      "kycPassed":        { "required": true, "fallbackSlug": "/sign-up/onboarding/kyc" }
    },
    "fan": { "onboardingPassed": { "required": true, "fallbackSlug": "/sign-up/onboarding" } }
  }
}
```

Menu-level role gating lives in `src/config/dashboard-sidebar-menu-items.js`
(e.g. Payout has `roles: ['creator']`).

### c) The mock **user** values (current state)

The mock *user* identity itself is currently seeded **in code**, not from a
standalone file:

- Default dev user: the `mockUser` object in `authHandlerDev.js`
  (`dev@test.com`, `role: null`).
- Per-email records: the in-memory `registeredUsers` Map, seeded on first login.
- Live overrides: `window.APP.setMockUserState(...)` / `setMockRole(...)`.

> Heads-up (gap): there is **no** declarative `mockUsers.json` file yet. If you
> want a config like `{ "creator@test.com": { role: "creator", kycPassed: true }, ... }`
> that seeds multiple test users at startup, that has to be added — see
> "Recommended next step" below. Today the equivalent is `setMockUserState()`
> (per session) plus the role rules in `routeConfig.json`.

---

## 5. Switching to real Cognito (when you need it)

- Persistent: set `VITE_AUTH_DEV_SHIM=cognito` in your env and provide
  `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, `VITE_COGNITO_REGION`
  (see `docs/ENV_SETUP_GUIDE.md`).
- Runtime toggle (console): `window.APP.useAuthHandler('cognito')` /
  `window.APP.useAuthHandler('dev')`.
- In Cognito mode the login page also needs the Cognito SDK present in the DOM
  (`window.AmazonCognitoIdentity`); the dev shim does not.

---

## 6. Session persistence & logout

- The minted token is stored in `localStorage.idToken`; the Pinia `auth` store is
  persisted, and `main.js` calls `authStore.refreshFromStorage()` on startup — so
  a mock session **survives page reloads**.
- Log out via the UI (sidebar logout) or:

```js
import { useAuthStore } from '@/stores/useAuthStore';
useAuthStore().logout();   // clears tokens, resets store, reloads
```

The dev shim's `logout` calls `localStorage.clear()`.

---

## 7. Programmatic mock login (scripts / tests / quick console)

```js
import { authHandler } from '@/dev/utils/auth/authHandler';
import { useAuthStore } from '@/stores/useAuthStore';

// (optional) pre-seed identity & role
window.APP.setMockUserState({ email: 'agent@test.com', role: 'agent', onboardingPassed: true });

const { idToken } = await authHandler.login('agent@test.com', 'anything');
const auth = useAuthStore();
auth.setTokenAndDecode(idToken);
auth.startTokenRefreshLoop();
// now navigate, e.g. router.push('/dashboard')
```

---

## 8. Gotchas

- **Guards read `currentUser.role`, not the `simulate` fallback.** The store's
  `userRole` getter falls back to `state.simulate.role`, but the router guard
  context uses `authStore.currentUser?.role || 'guest'`. So to influence guards,
  set the role on the **token** (`setMockUserState` before login, or
  `updateProfileAttributes` after) — `simulateRole()` alone only affects the
  getter, not routing.
- **New users start role-less.** Without pre-seeding, a fresh mock login has
  `role: null` → you'll be routed to onboarding. That is expected behavior.
- **`creator` needs KYC.** Per `routeConfig.json`, the creator dashboard requires
  `kycPassed: true`; set it when mocking a creator.
- **Mock login ≠ mock REST API.** Auth is the dev shim; API data is the
  `mock-api-demo` layer (`apiConfig.mode`). They are independent.

---

## 9. Recommended next step (optional, if you want true config-driven seeding)

To get a single source of truth for dev users (what Linden described as
"from a config we can set up users and roles"), add a small config consumed by
the dev shim at startup, e.g.:

```js
// src/config/mock-users.js  (proposed)
export const MOCK_USERS = {
  'creator@test.com': { role: 'creator', kycPassed: true,  onboardingPassed: true,  name: 'Demo Creator' },
  'fan@test.com':     { role: 'fan',     kycPassed: false, onboardingPassed: true,  name: 'Demo Fan' },
  'agent@test.com':   { role: 'agent',   kycPassed: true,  onboardingPassed: true,  name: 'Demo Agent' },
  'vendor@test.com':  { role: 'vendor',  kycPassed: true,  onboardingPassed: true,  name: 'Demo Vendor' }
};
```

`authHandlerDev.js` would seed `registeredUsers` from `MOCK_USERS` on load, so
logging in with any of those emails instantly gives the right role — no console
commands needed. This is **not implemented yet**; say the word and it can be added.

---

## Key files

| Purpose | Path |
|---------|------|
| Auth proxy / mode selector | `src/dev/utils/auth/authHandler.js` |
| Dev shim (mock auth) | `src/dev/utils/auth/authHandlerDev.js` |
| Real Cognito handler | `src/dev/utils/auth/awsCognitoHandler.js` |
| Auth store | `src/stores/useAuthStore.js` |
| Login screen | `src/dev/templates/auth/views/AuthLogIn.vue` |
| Onboarding (sets role) | `src/dev/templates/auth/views/AuthSignUpOnboarding.vue` |
| Route + role config | `src/router/routeConfig.json` |
| Route guards | `src/systems/routing/routeGuards.js` |
| Env setup | `docs/ENV_SETUP_GUIDE.md`, `.env.development`, `.env.example` |

## Console cheat-sheet

```js
window.APP.getCurrentAuthMode();                 // 'dev' | 'cognito'
window.APP.setMockUserState({ role:'creator', onboardingPassed:true, kycPassed:true, email:'creator@test.com' });
window.APP.setMockRole('fan');                   // role only
window.APP.mockUser;                             // current mock user
window.APP.getRegisteredUsers();                 // seeded dev users
window.APP.useAuthHandler('cognito');            // switch to real Cognito
window.APP.useAuthHandler('dev');                // switch back to mock
```
