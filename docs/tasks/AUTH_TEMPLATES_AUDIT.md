# Auth Templates & Components — Architecture / Naming / i18n Audit

**Scope:** All auth templates, page wrappers, layout, and view screens under
`src/dev/templates/auth/` (25 files) + observations on the auth handlers under
`src/dev/utils/auth/`.

**Reference docs:** `Expanded Vue App Naming Convention.txt` and
`vue-app-architecture-naming-guidelines.md` (project's own standards).

**Audit type:** Quality only. Login, sign-up, password recovery, email confirm,
onboarding and KYC all **work correctly**. This document lists naming /
architecture / i18n convention gaps. **No code was changed.** Nothing here is a
functional bug.

**Screens covered (Linden's list):** Login, Sign up, Lost password, Confirm
password (= confirm email code), Reset password, Onboarding (+ KYC).

---

## How to read this

Each finding has a **risk** tag so we can fix safely without touching behaviour:

- 🟢 **Safe** — cosmetic/local rename, add `$t()`, fix a stale string. No behaviour change.
- 🟡 **Medium** — touches public prop/emit/export names or i18n keys; needs a coordinated find-and-replace + build check (same as the sidebar naming batches).
- 🔴 **High** — moving files/folders or extracting logic into composables/services. Real regression risk. Recommend doing these last, one at a time, with the dev server stopped (same caution as the sidebar `popup/` rename and REG-3 move).

---

## Summary

| Area | Severity | Count (approx) |
|------|----------|----------------|
| Architecture — file location (`dev/` sandbox) | 🔴 High | all 25 |
| Architecture — misnamed `page/role/` folder | 🟡 Medium | 1 folder (8 files) |
| Architecture — heavy logic in views (OAuth/cognito/token/tracking inline) | 🔴 High | 6 views |
| Architecture — heavy logic in social pages | 🔴 High | 2 pages |
| Architecture — placeholder/stub pages | 🟢/🟡 | 3 pages |
| Architecture — `Auth.js` barrel name | 🟡 Medium | 1 |
| Naming — bare refs (`error`, `auth`, `message`, boolean-without-`is`) | 🟢 Safe | ~25 |
| Naming — weak handler names / event-type casing | 🟢/🟡 | ~12 |
| Naming — `AuthLogIn` vs `Login` casing | 🟡 Medium | 1 |
| i18n — hardcoded user-facing strings | 🟢 Safe | 70+ |
| i18n — inconsistent keys (`common` vs `auth.common`, capitalized `Onboarding`/`KYC`) | 🟡 Medium | ~10 patterns |

---

## A. Architecture findings

### A1. 🔴 All auth templates live under `src/dev/templates/auth/`
The naming/architecture doc places page-level templates at `src/templates/auth/`.
The whole auth domain is still in the `dev/` sandbox, and `routeConfig.json`
hard-codes `@/dev/templates/auth/...` paths.
**Same class of issue as sidebar REG-3** (we moved `DashboardSharedSidebar` from
`dev/templates` → `templates`). Fixing this means `git mv` + updating
`routeConfig.json` component paths + all imports.
**Risk:** 🔴 High — do last, isolated, with build verification.

### A2. 🟡 `page/role/` folder is misnamed
`page/role/` contains generic, all-role pages: `LoginPage`, `SignUpPage`,
`LostPasswordPage`, `ResetPasswordPage`, `ConfirmEmailPage`, all social OAuth
pages, and `SignUpOnboardingKycCallbackPage` — every one is
`supportedRoles: ["all"]`. "role" implies role-specific (like the sibling
`page/creator/`, which **is** correct). Suggested: `page/shared/` or `page/global/`
(or flatten per the doc's `templates/auth/LoginPage.vue` example).
**Risk:** 🟡 Medium — folder rename + import/route path updates.

### A3. 🔴 Heavy business logic inside view components
Views should be thin (render + emit + call a composable/service). These hold full
auth orchestration inline:

| File | Lines | Inline logic that belongs elsewhere |
|------|-------|-------------------------------------|
| `views/AuthLogIn.vue` | ~1043 | Twitter + Telegram OAuth `postMessage` handlers, popup polling, `localStorage` token writes, `/users/new-sign-up` tracking, validation DOM focus/scroll |
| `views/AuthSignUp.vue` | ~1023 | Near-duplicate OAuth blocks, `authHandler.register`, `sessionStorage` pending-email, validation UX |
| `views/AuthConfirmEmail.vue` | ~545 | `confirmSignUp` + API tracking + `sessionStorage` cleanup; validation configs with hardcoded English |
| `views/AuthSignUpOnboarding.vue` | ~570 | Debounced username-availability API check, onboarding submit (`updateProfileAttributes` + API + token refresh) |
| `views/AuthResetPassword.vue` | ~468 | `confirmPassword` flow + asset/validation setup |
| `views/AuthLostPassword.vue` | ~395 | `forgotPassword` flow + asset/validation setup |
| `views/AuthSignUpOnboardingKyc.vue` | ~103 | Full KYC flow (mock payload, cognito attr update, API, session restore) |

Repeated patterns ripe for shared composables: `useAuthAssets()` (asset + Cognito
readiness — copied into 6 screens), `useOAuthPopupCallback()` (Twitter/Telegram
popup, copied across Login/SignUp + the social pages), a form-submit/validation
helper, and per-flow composables (`useEmailLogin`, `useEmailSignUp`,
`useForgotPassword`, `useResetPassword`, `useConfirmEmail`, `useOnboardingSubmit`,
`useKycCompletion`).
**Risk:** 🔴 High — these are real refactors; behaviour must be preserved. Best
done incrementally after the safe items, each followed by a manual smoke test.

### A4. 🔴 Heavy logic in social auth pages; A5. 🟢 stub pages
- `page/role/TwitterAuthPage.vue` (~212 lines) and `page/role/TelegramAuthPage.vue`
  (~186 lines) contain the OAuth popup/postMessage/ack/timeout logic in the route
  wrapper, and **log under stale names** `'AuthTwitter.vue'` / `'AuthTelegram.vue'`.
  Twitter also imports `AuthLayout` but comments it out (dead import). 🔴 High.
- `page/role/GoogleAuthPage.vue` / `FacebookAuthPage.vue` are 11-line placeholder
  stubs (`<p>This is google auth for global</p>`) — near-duplicates. 🟢/🟡.
- `page/role/SignUpOnboardingKycCallbackPage.vue` is a placeholder
  (`<p>Callback for global</p>`) and is multi-role, so also mis-placed under
  `role/`. 🟡.

### A6. 🟡 `Auth.js` barrel naming
`src/dev/templates/auth/Auth.js` is a 2-line barrel that only re-exports
`AuthLayout`. Per the doc, JS modules are `camelCase.js` and barrels are
`index.js` (PascalCase.js is reserved for files exporting a primary class).
Rename to `index.js`. **Risk:** 🟡 Medium — every page imports
`{ AuthLayout } from '.../Auth.js'`; update those imports.

### A7. 🟢 Minor structural notes
- `views/AuthSignUpOnboardingKycStatus.vue` uses raw `<h1>/<p>` instead of the
  shared `BaseHeading`/`BaseParagraph` used by sibling views; also has redundant
  `data-translate` attrs alongside `$t()`.
- Dead imports: `getAssetUrl` (AuthResetPassword), `BaseParagraph` (AuthConfirmEmail),
  `AuthLayout` (TwitterAuthPage). 🟢 Safe to remove.

---

## B. Naming findings (🟢 mostly local & safe)

### B1. Bare / abbreviated refs (🟢 Safe — local renames)
Recurring across views:

| Current | Suggested | Files |
|---------|-----------|-------|
| `error` (string message ref) | `errorMessage` | LogIn, SignUp, LostPassword, ResetPassword, ConfirmEmail, Onboarding, Kyc |
| `message` (success string) | `successMessage` | LostPassword, ResetPassword |
| `confirmMessage` | `confirmationMessage` | LogIn |
| `resendSuccess` (string named like bool) | `resendSuccessMessage` | ConfirmEmail |
| `auth` (store instance) | `authStore` | LogIn, SignUp, Onboarding, Kyc, KycStatus |
| `xIcon` | `twitterIconUrl` | LogIn, SignUp |

### B2. Booleans missing `is/has/can` prefix (🟢 Safe)
| Current | Suggested | File |
|---------|-----------|------|
| `usernameChecking` | `isCheckingUsername` | AuthSignUpOnboarding |
| `usernameTaken` | `isUsernameTaken` | AuthSignUpOnboarding |
| param `valid` (in `handleCodeValidityChange`) | `isValid` | AuthConfirmEmail |

*(Many booleans already follow the rule well: `isLoading`, `isCognitoScriptReady`,
`hasAttemptedSubmit`, `isCodeValid`, `isResending`, etc.)*

### B3. Weak / inconsistent function names (🟢 Safe unless exported)
| Current | Suggested | File |
|---------|-----------|------|
| `getLoadingText` (inner helper, duplicated) | `resolveLoadingLabel` | LogIn, SignUp |
| `handleForgot` | `handleForgotPasswordSubmit` | LostPassword |
| `handleReset` | `handleResetPasswordSubmit` | ResetPassword |
| `toggleDropdown` | `handleToggleRoleDropdown` | Onboarding |
| `selectRole` | `handleRoleSelect` | Onboarding |
| `handleTwitterUser` / `handleTelegramUser` | `authenticateTwitterUser` / `authenticateTelegramUser` | LogIn, SignUp |
| `handleTwitterCallback` | `completeTwitterOAuthCallback` | TwitterAuthPage |

### B4. Event-type constants should be kebab-case events (🟡 Medium)
Social pages use `postMessage` types `TWITTER_OAUTH_CODE`, `TWITTER_OAUTH_ACK`,
`TWITTER_AUTH_ERROR`, `TELEGRAM_AUTH_SUCCESS`, `TELEGRAM_AUTH_ACK`,
`TELEGRAM_AUTH_ERROR`. The doc wants events in kebab-case
(`twitter-oauth-code`, …). **Risk:** 🟡 — both the popup sender and the parent
listener must change together (cross-window contract), so verify both ends.

### B5. `AuthLogIn` casing (🟡 Medium)
View is `AuthLogIn.vue` (camel-inside-Pascal) while its wrapper is `LoginPage.vue`.
Prefer `AuthLogin.vue` for consistency. **Risk:** 🟡 — file rename + import update.

### B6. Stale telemetry names (🟢 Safe)
`TwitterAuthPage.vue` / `TelegramAuthPage.vue` log with `'AuthTwitter.vue'` /
`'AuthTelegram.vue'` (old names). Update the log identifiers to match the file.

---

## C. i18n findings

### C1. 🟢 Hardcoded user-facing strings (should go through `$t()`)
70+ instances. Highest concentration:

- **Error/toast messages built in JS** (Login/SignUp/Reset/Lost/Confirm/Onboarding/Kyc):
  e.g. `"Login failed: " + err.message`, `"Twitter login failed: Invalid state"`,
  `"Failed to load required resources. Please refresh."` (repeated in 6 screens),
  `"Failed to complete KYC: ..."`, `"Failed to complete onboarding: ..."`.
- **Validation config messages hardcoded in English** — `AuthConfirmEmail.vue`
  (`'Email is required'`, `'Code must be 6 digits'`, …). Should be `computed` +
  `t()` like the other screens.
- **Social pages fully hardcoded** — `TwitterAuthPage` (~15 strings incl. debug
  labels), `TelegramAuthPage` (~9 strings).
- **Stub pages** — `"This is google auth for global"`, `"This is facebook auth for
  global"`, `"Callback for global"`.
- **Shared bits** — `Back` (7 screens), `aria-label="Close error message"`
  (Login/SignUp), `alt="globe"` / `alt="logo"` (AuthHeader).

Suggested key namespaces: `auth.login.*`, `auth.register.*`, `auth.reset.*`,
`auth.confirmEmail.*`, `auth.oauth.twitter.*`, `auth.oauth.telegram.*`,
`auth.oauth.debug.*`, `auth.header.*`, `auth.common.*`.

### C2. 🟡 Inconsistent / questionable i18n keys
- **Mixed loading key:** screens fall back between `t('common.loading')` and
  `t('auth.common.loading')` with manual key-equality checks. Pick one.
- **Capitalized mid-key segments:** `auth.register.Onboarding.*` and
  `auth.register.KYC.*` / `auth.register.KYC.status.*` — inconsistent with the rest
  of the lowercase key tree; prefer `auth.register.onboarding.*` /
  `auth.register.kyc.*`.
- **Cross-namespace keys:** login screen uses `auth.register.button`; lost/reset
  screens use `auth.register.emailLabel` etc. Decide whether these are intentional
  shared keys or should move to a shared `auth.common.*` namespace.
- **Inline English fallbacks** next to keys (`t('auth.reset.codeSent') || "Reset
  code sent..."`) — keep the key, drop the hardcoded fallback (or make it the i18n
  default).

**Risk for all C items:** 🟢 for adding `$t()` to clearly hardcoded strings; 🟡
when renaming existing keys (must update `en.json`/`vi.json` + every usage, like the
sidebar i18n key fixes).

---

## Recommended order of work (to avoid any breakage)

1. **🟢 Wave 1 — zero-risk:** local ref/boolean/function renames (B1–B3, B6),
   remove dead imports (A7), fix the `'Selectyour role'` typo. Pure cosmetics.
2. **🟢 Wave 2 — i18n strings:** wrap hardcoded user-facing strings in `$t()` and
   add keys to `en.json`/`vi.json` (C1). Verify rendered text is identical.
3. **🟡 Wave 3 — i18n key consistency + naming with external contracts:** unify
   `common.loading`, fix capitalized `Onboarding`/`KYC` keys, kebab-case OAuth
   message types (B4), `AuthLogIn`→`AuthLogin` (B5), `Auth.js`→`index.js` (A6).
   Each = coordinated find-and-replace + `npm run build`.
4. **🔴 Wave 4 — structural (optional / sign-off needed):** rename `page/role/` →
   `page/shared/` (A2), de-duplicate social pages (A4/A5), and the big one — move
   `dev/templates/auth/` → `templates/auth/` (A1) and extract composables (A3).
   These change behaviour-adjacent wiring; do one at 2b-2a time with the dev server
   stopped and a smoke test after each.

Waves 1–2 deliver most of the audit value with essentially no regression risk.

---

## Appendix: per-file verdict

| File | Verdict |
|------|---------|
| `views/AuthLogIn.vue` | 🔴 oversized; OAuth/token/tracking inline; many hardcoded errors; `LogIn` casing |
| `views/AuthSignUp.vue` | 🔴 near-duplicate of LogIn; same issues |
| `views/AuthConfirmEmail.vue` | 🔴 validation messages hardcoded English; confirm flow inline |
| `views/AuthSignUpOnboarding.vue` | 🔴 username API + onboarding submit inline; `Onboarding` key casing; typo |
| `views/AuthResetPassword.vue` | 🟡 duplicated setup; dead import; no `isLoading` |
| `views/AuthLostPassword.vue` | 🟡 duplicated setup; inline fallbacks |
| `views/AuthSignUpOnboardingKyc.vue` | 🟡 small UI but full KYC flow inline; `KYC` key casing |
| `views/AuthSignUpOnboardingKycStatus.vue` | 🟢 cleanest; minor style/key notes |
| `page/role/LoginPage.vue`…`ConfirmEmailPage.vue` | 🟢 thin wrappers (good); folder mis-named |
| `page/role/TwitterAuthPage.vue` | 🔴 heavy logic; hardcoded; stale logs; dead import |
| `page/role/TelegramAuthPage.vue` | 🔴 heavy logic; hardcoded; stale logs |
| `page/role/GoogleAuthPage.vue` / `FacebookAuthPage.vue` | 🟡 duplicate stubs; hardcoded |
| `page/role/SignUpOnboardingKycCallbackPage.vue` | 🟡 placeholder; mis-placed under `role/` |
| `page/creator/*` (3) | 🟢 thin wrappers; correctly named/placed |
| `AuthLayout.vue` | 🟢 correct |
| `AuthHeader.vue` | 🟢 OK; `alt` not translated; "translation dropdown" comment but only a static globe image |
| `AuthFooter.vue` | 🟢 empty placeholder shell |
| `Auth.js` | 🟡 rename to `index.js` |

---

## Resolution log (what was actually fixed)

Each wave was applied incrementally and verified with `npm run build` (exit 0)
after every step. i18n key parity was verified by running the project's own
`validateI18n` checker (auth-related errors went from many → **0**; remaining
errors are pre-existing and belong to other, non-auth sections).

### ✅ Wave 1 — local renames / dead code (🟢 done earlier)
- Removed dead imports: `getAssetUrl` (AuthResetPassword), `BaseParagraph`
  (AuthConfirmEmail), `AuthLayout` (TwitterAuthPage).
- Fixed `'Selectyour role'` → `'Select your role'`.
- B1/B2/B3 ref/boolean/function renames (`error`→`errorMessage`, `auth`→`authStore`,
  `message`→`successMessage`, `xIcon`→`twitterIconUrl`, `handleForgot`→
  `handleForgotPasswordSubmit`, `toggleDropdown`→`handleToggleRoleDropdown`,
  `getLoadingText`→`resolveLoadingLabel`, etc.).
- B6 stale telemetry names corrected to match the file.

### ✅ Wave 2 — i18n strings (🟢 done; C1)
- Wrapped all hardcoded user-facing strings in the 6 view screens + `AuthHeader`
  in `t()` / `$t()` (flow errors, OAuth errors, `Back`, `Required`, close-error
  aria-label, header alts, ConfirmEmail validation configs → `computed` + `t()`).
- **Social pages (this pass):** `TwitterAuthPage` (status + debug panel),
  `TelegramAuthPage` (status/widget/heading), and the Google / Facebook / KYC
  callback stubs now use new `auth.oauth.*` / `auth.social.*` keys.
- New keys added to `public/i18n/section-auth/en.json` + `vi.json`. English text
  kept byte-identical (no visual change in English); Vietnamese properly translated.
- B3 (this pass): `handleTwitterCallback` → `completeTwitterOAuthCallback`
  (function + telemetry identifiers).
- A7 (this pass): removed redundant `data-translate` attrs on KycStatus (kept the
  raw `<h1>/<p>` deliberately — swapping to `BaseHeading/BaseParagraph` would
  change typography, so it was skipped to honour "no UI change").

### ✅ Wave 3 — key consistency + external-contract naming (🟡 done this pass)
- **C2:** unified the loading label to `auth.common.loading` (output unchanged);
  renamed `auth.register.Onboarding.*` → `onboarding.*`, `auth.register.KYC.*` →
  `kyc.*`, `auth.messages.Onboarding` → `onboarding` **across all 75 runtime
  locale files** in `public/i18n/section-auth/` (so every language keeps
  resolving — no UI change in any locale). The legacy non-loaded source copy
  `src/i18n/section-auth/{en,vi}.json` was lowercased too for consistency.
  (`section-dash` keys are a separate dashboard namespace, out of this audit's
  scope, and were left untouched.)
- **B4:** OAuth `postMessage` types → kebab-case (`twitter-oauth-code`,
  `twitter-oauth-ack`, `twitter-auth-error`, `telegram-auth-success`,
  `telegram-auth-ack`, `telegram-auth-error`) changed on **both ends** across all
  7 windows that share the contract (LogIn, SignUp, Twitter/Telegram callback
  pages, the demo + dashboard listeners, and `public/telegram-login.html`).
- **A6:** `auth/Auth.js` → `auth/index.js` (folder barrel); 12 importers updated.
- **B5:** `views/AuthLogIn.vue` → `views/AuthLogin.vue`; wrapper + test path updated.

### ✅ Wave 4 — structural moves (🔴 mechanical parts done this pass)
- **A2:** `page/role/` → `page/shared/` (folder is all-role); 11 `routeConfig.json`
  component paths updated.
- **A4/A5:** Google / Facebook / KYC-callback stubs de-duplicated into a single
  `page/shared/SocialAuthPlaceholderPage.vue` (prop-driven; same rendered text).
- **A1:** moved the whole auth domain `src/dev/templates/auth/` →
  `src/templates/auth/` (out of the `dev/` sandbox). `routeConfig.json` + all
  internal imports updated. Tailwind already scans `templates/auth/**`, so no CSS
  is purged. Dev server was stopped for the move and restarted after.

### ⏸ Remaining — A3 (composable extraction) — needs sign-off + smoke test
The only outstanding item is **A3**: extracting the inline OAuth/Cognito/token/
tracking logic out of the 6 heavy views into shared composables
(`useAuthAssets`, `useOAuthPopupCallback`, per-flow composables). This is the one
change where a green build does **not** prove behaviour is preserved (popup
`postMessage` timing, watcher reactivity, `localStorage`/`sessionStorage` side
effects). Per this document's own guidance it must be done **incrementally with a
manual smoke test of live login / sign-up / Twitter / Telegram / onboarding / KYC
after each step**. Deferred pending sign-off so we don't risk regressing working
auth.
