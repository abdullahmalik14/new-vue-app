# Router Audit Report

**Scope**: `src/router/` — `index.js`, `routeConfig.json`, `routeDefaults.json`, `routeConfig.schema.md`, and the directly-consumed utilities in `src/utils/route/routeGuards.js` and `src/utils/route/routeConfigLoader.js`

**Date**: 2026-05-22

---

## Summary

| Category | Count |
|---|---|
| Logical Errors | 17 |
| Security Issues | 6 |
| Performance Issues | 10 |
| Best Practice Violations | 9 |
| Missing Features | 11 |
| **Total** | **53** |

---

## 1. Logical Errors

### L1 — Duplicate slug `/dashboard/edit-profile`
**File**: `routeConfig.json` lines ~357 and ~1192

Two completely different route entries share the same slug. The first is a role-specific, auth-inherited route using `customComponentPath` per role. The second is an open route (`requiresAuth: false`, `supportedRoles: ["all"]`) pointing to `@/templates/editProfile/EditProfilePage.vue`. Vue Router will register two routes with `/:locale?/dashboard/edit-profile` — whichever is registered second wins, silently discarding the other.

```json
// Entry 1 (line ~357) - role-specific, auth-protected via parent
{ "slug": "/dashboard/edit-profile", "inheritConfigFromParent": true, "supportedRoles": ["creator","fan","agent","vendor"], "customComponentPath": { ... } }

// Entry 2 (line ~1192) - fully open, wrong component
{ "slug": "/dashboard/edit-profile", "componentPath": "@/templates/editProfile/EditProfilePage.vue", "requiresAuth": false, "supportedRoles": ["all"] }
```

**Fix**: Remove the duplicate. The entry at line ~1192 is a dev leftover and should be deleted.

#### Resolution ✅

**Status:** Resolved (no further code change required — fixed by **SECTION_PRELOAD_AUDIT.md** follow-up validation during section-preload refactor).

**What was broken:** Two route entries shared `slug: "/dashboard/edit-profile"`. Vue Router registered two `/:locale?/dashboard/edit-profile` routes; the second silently overwrote the first. Stricter `jsonConfigValidator` duplicate-slug checks also caused `sectionBundler` section discovery to fall back to an empty set during Vite startup.

**Why it happened:** A dev/standalone `EditProfilePage.vue` route was added with the same slug as the role-based dashboard edit-profile route.

**What changed:** The standalone edit-profile route was moved to `/edit-profile`, leaving the role-based dashboard route as the only `/dashboard/edit-profile` entry. Differs slightly from the original audit fix (delete entry 2): the preload fix **relocated** the dev page so it remains reachable at a unique slug. Under S1, `/edit-profile` also received `envAccess: "development"` so it is dev-only.

- **Kept** (line ~361): role-specific `/dashboard/edit-profile` with `customComponentPath` per role.
- **Moved** (line ~1214): standalone `EditProfilePage.vue` at `/edit-profile`.

**How it was tested:** `routeConfig.json` has exactly one `/dashboard/edit-profile`; standalone page is at `/edit-profile` only. `menuItems.js` still links dashboard users to `/dashboard/edit-profile` (unchanged).

**How to test in the browser:**
1. Run `npm run dev` and open `/dashboard/edit-profile` while logged in as a supported role — expect the role-specific dashboard edit-profile page.
2. Open `/edit-profile` in dev — expect the standalone `EditProfilePage.vue` demo.
3. Confirm there is no second route competing for `/dashboard/edit-profile` (no wrong component or silent overwrite).

---

### L2 — `requiresAuth: false` contradicts `redirectIfNotAuth` on onboarding routes
**File**: `routeConfig.json`

Routes `/sign-up/onboarding`, `/sign-up/onboarding/kyc`, `/sign-up/onboarding/kyc/callback`, and `/sign-up/onboarding/kyc/status` all have `requiresAuth: false` paired with `redirectIfNotAuth: "/log-in"`.

In `guardCheckAuthentication`, the `redirectIfNotAuth` field is **only evaluated when `requiresAuth === true`**. With `requiresAuth: false`, unauthenticated users are never redirected — the field is dead code. The intent is clearly to require authentication, but the config is wrong.

```json
// Current (broken)
{ "requiresAuth": false, "redirectIfNotAuth": "/log-in" }

// Fix
{ "requiresAuth": true, "redirectIfNotAuth": "/log-in" }
```

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Four onboarding routes set `redirectIfNotAuth: "/log-in"` while `requiresAuth` was `false`. `guardCheckAuthentication` only reads `redirectIfNotAuth` when `requiresAuth === true`, so unauthenticated visitors were never sent to login — the redirect field was dead config.

**Why it happened:** Copy-paste or mistaken public-route defaults on flows that clearly require a logged-in user.

**What changed:** Set `requiresAuth: true` on all four routes in `routeConfig.json` (kept `redirectIfNotAuth: "/log-in"`):

- `/sign-up/onboarding`
- `/sign-up/onboarding/kyc`
- `/sign-up/onboarding/kyc/callback`
- `/sign-up/onboarding/kyc/status`

No preload-refactor overlap; guard behavior unchanged, only config aligned with intent.

**How it was tested:** Confirmed `guardCheckAuthentication` only applies `redirectIfNotAuth` when `requiresAuth === true` (`routeGuards.js`). Ran `npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js` (8 passed; production `routeConfig.json` validates).

---

### L3 — `/dashboard/overview` has empty `supportedRoles` but role-specific section and component
**File**: `routeConfig.json` line ~455

The route sets `"supportedRoles": []` which the role guard treats as "no restriction, everyone allowed." However the `section` is `{ "creator": "dashboard-creator" }` and the component at `componentPath` is a creator-only overview. Any non-creator user who visits this route will trigger a component path resolution failure (no matching role path) and fall back to the 404 component.

```json
// Current
{ "slug": "/dashboard/overview", "supportedRoles": [], "inheritConfigFromParent": true, "section": { "creator": "dashboard-creator" } }

// Fix
{ "supportedRoles": ["creator"] }
```

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `/dashboard/overview` had `supportedRoles: []`, so `guardCheckUserRole` treated the route as open to every role. The route only defines a creator `section` and `DashboardOverviewCreator.vue` — non-creators passed the role guard but failed component resolution and fell through to 404.

**Why it happened:** Empty `supportedRoles` was used as “inherit from parent / unrestricted” while the route content is creator-only.

**What changed:** Set `supportedRoles: ["creator"]` on `/dashboard/overview` in `routeConfig.json` (line ~460). No preload-refactor overlap.

**How it was tested:** Confirmed `guardCheckUserRole` allows access when `supportedRoles.length === 0` (`routeGuards.js` ~537). Ran `npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js` (8 passed).

---

### L4 — `inheritConfigFromParent` on social callback routes with no parent
**File**: `routeConfig.json` lines ~837–883

All four routes `/auth/callback/social/facebook`, `/auth/callback/social/google`, `/auth/callback/social/twitter`, `/auth/callback/social/telegram` use `"inheritConfigFromParent": true`. Their parent slug would be `/auth/callback/social` or `/auth/callback` — neither of which exists in `routeConfig.json`. These routes inherit nothing and silently skip parent config merging, losing any auth or role defaults that were expected to be inherited.

**Fix**: Explicitly set `requiresAuth`, `redirectIfNotAuth`, and `enabled` on each callback route instead of relying on a non-existent parent.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Four OAuth callback routes set `inheritConfigFromParent: true` but no parent route exists (`/auth/callback/social` or `/auth/callback`). `inheritConfigurationFromParentRoute` returned the child unchanged — `requiresAuth`, `redirectIfNotAuth`, and `enabled` were never defined on these routes.

**Why it happened:** Slug hierarchy implied a parent auth route that was never added to `routeConfig.json`.

**What changed:** Removed `inheritConfigFromParent` and set explicit public-auth fields on all four routes (aligned with `/log-in` — OAuth callbacks must stay reachable before login):

- `requiresAuth: false`
- `redirectIfNotAuth: ""` (explicit no-op; guard only uses this when `requiresAuth === true`)
- `enabled: true`

Routes: `/auth/callback/social/facebook`, `google`, `twitter`, `telegram`. No preload-refactor overlap.

**How it was tested:** Confirmed no parent slug in `routeConfig.json`; `inheritConfigurationFromParentRoute` no-ops when parent missing (`routeResolver.js` ~263). Ran `npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js` (8 passed).

---

### L5 — Loop detection is reset after every successful navigation (making it ineffective)
**File**: `src/utils/route/routeGuards.js` line 24 / `index.js` line 592

`clearNavigationHistory()` is called in `afterEach` unconditionally on every completed navigation. The loop guard accumulates history only between consecutive same-to-same redirects. Since `afterEach` always clears it, a loop that completes one navigation step before repeating would never be caught.

```javascript
// afterEach (index.js line 591)
const { clearNavigationHistory } = await import('../utils/route/routeGuards.js');
clearNavigationHistory(); // Wipes all history after every nav, loop guard never fires
```

**Fix**: Only clear history after a full user-initiated navigation — not on redirects. Consider tracking loop state differently (e.g. count resets per user interaction, not per navigation event).

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `afterEach` called `clearNavigationHistory()` on every completed navigation. The loop guard only records same-slug redirect attempts (`to.slug === from.slug`) in `navigationHistory`; clearing after each success meant history never survived to the next guard run, so repeated same-path redirect loops were never detected.

**Why it happened:** History was cleared to avoid false positives on legitimate revisits, but the clear was too aggressive.

**What changed:** In `src/router/index.js` `afterEach`, clear loop history only when `from.path` is set and `to.path !== from.path` (user settled on a different route). Same-path completions keep history so `guardPreventNavigationLoop` can reach the 3-attempt threshold. No preload-refactor overlap.

**How it was tested:** Code review of `guardPreventNavigationLoop` (`routeGuards.js` ~229–304) and `afterEach` clear condition. No dedicated route-guard unit tests in repo.

---

### L6 — Role guard bypass via `dependencies` allows unauthorized access
**File**: `src/utils/route/routeGuards.js` line 637

If a user's role is not in `supportedRoles`, but that role happens to appear in `route.dependencies.roles`, the role guard returns `allow: true` to "let the dependency guard handle it." This means a role that explicitly should not access a route (not listed in `supportedRoles`) can bypass the role guard entirely if a dependency entry for their role exists in config.

```javascript
// routeGuards.js line 637
if (route.dependencies?.roles?.[userRole]) {
  return { allow: true, reason: 'Allowing through to dependency check' };
}
```

**Fix**: This bypass should only apply when the route explicitly allows that role in some way. At minimum, the dependency guard should enforce a final block if the role is not in `supportedRoles`.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `guardCheckUserRole` returned `allow: true` for roles not in `supportedRoles` when `dependencies.roles[userRole]` existed, so `guardCheckDependencies` could still return `allow: true` if no `required` / `redirectIfComplete` rule fired (e.g. vendor on creator-only `/sign-up/onboarding/kyc` with incomplete onboarding).

**Why it happened:** Bypass was added so non-creators could be redirected via dependency rules (e.g. to `/dashboard`), but there was no final deny when those rules did not apply.

**What changed:** After role-specific dependency checks, `guardCheckDependencies` now blocks with 404 when the route has real `supportedRoles` restrictions and `userRole` is not listed (`routeGuards.js`). Role-guard bypass kept so `redirectIfComplete` redirects still run first. No preload-refactor overlap.

**How it was tested:** `tests/unit/routeGuards.test.js` — non-creator bypass + dependency block, `redirectIfComplete` redirect, creator allowed.

---

### L7 — Empty string `redirectIfLoggedIn` and `redirectIfNotAuth` fields are dead config
**File**: `routeConfig.json`

Multiple routes set these fields to `""` (empty string): `/dashboard` sets `"redirectIfLoggedIn": ""`, `/lost-password`, `/reset-password`, `/sign-up` set both. Since JavaScript treats empty string as falsy, the guard checks `if (route.redirectIfLoggedIn && ...)` will never fire. These are misleading and waste JSON space.

**Fix**: Remove these fields entirely (they default to null/undefined) rather than setting them to `""`.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Nine `redirectIfLoggedIn` / `redirectIfNotAuth` entries were set to `""`. Guards use truthy checks (`if (route.redirectIfLoggedIn && …)`), so empty strings never ran — dead, misleading config.

**Why it happened:** Placeholder values meant “no redirect” instead of omitting the field.

**What changed:** Removed all empty-string redirect fields from `routeConfig.json`:

- `redirectIfLoggedIn`: `/dashboard`, `/lost-password`, `/reset-password`, `/sign-up`
- `redirectIfNotAuth`: `/auth/callback/social/facebook`, `google`, `twitter`, `telegram` (also dropped L4’s explicit `""`; `requiresAuth` / `enabled` remain), `/shop`

(Audit noted “both” on auth routes; only `redirectIfLoggedIn` was present there.) Behavior unchanged — omitted fields are falsy like `""`. No preload-refactor overlap.

**How it was tested:** Grep confirms no `""` redirect fields remain. Ran `npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js tests/unit/routeGuards.test.js` (pass).

---

### L8 — `/dashboard/social-linking` uses a demo component in production
**File**: `routeConfig.json` line ~276

A live, auth-protected route points to `@/templates/dashboard/page/demo/SocialLinkingDemo.vue`. Authenticated users with any role (`"supportedRoles": ["all"]`) can reach this demo. If the demo component has placeholder data or doesn't enforce any permissions internally, this is unintended.

**Fix**: Replace with the real component, or disable the route until the real component exists.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `/dashboard/social-linking` was a live, auth-protected route (`supportedRoles: ["all"]`) pointing at `SocialLinkingDemo.vue` under `page/demo/`. No production replacement exists in the codebase.

**Why it happened:** Demo UI was wired into the main dashboard route table before a real feature path existed.

**What changed:** Set `enabled: false` on `/dashboard/social-linking` in `routeConfig.json`. `guardCheckRouteEnabled` now redirects navigations to `/404`. Demo component file kept for future promotion; re-enable and update `componentPath` when a non-demo implementation ships. No preload-refactor overlap.

**How it was tested:** Grep confirms only `SocialLinkingDemo.vue` exists (no prod component). Ran `npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js` (pass). Manual: visit `/dashboard/social-linking` while logged in → expect `/404`.

---

### L9 — `resetRouteConfigurationCache` logs success before async clear completes
**File**: `src/utils/route/routeConfigLoader.js` line 195

The cache-clear call is a fire-and-forget dynamic import. The function returns and logs success synchronously, while the actual `clearConfigCache('route_config')` executes asynchronously afterward. Any caller that relies on the cache being cleared immediately after this call returns will be working with stale data.

```javascript
// Current
import('../common/jsonConfigLoader.js').then(({ clearConfigCache }) => {
  clearConfigCache('route_config');
});
log('...', 'Cache reset complete'); // Logs before cache is actually cleared
```

**Fix**: Make the function async and `await` the import + cache clear before logging success.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `resetRouteConfigurationCache()` fired `import(...).then(clearConfigCache)` and logged success immediately, so callers could read stale cached config before the clear ran.

**Why it happened:** Redundant dynamic import despite `routeConfigLoader.js` already using `jsonConfigLoader.js` statically elsewhere.

**What changed:** Import `clearConfigCache` at module top and call it synchronously before success logs (`routeConfigLoader.js`). Same outcome as audit’s async/await fix without changing the public API. No callers in app code required updates. No preload-refactor overlap.

**How it was tested:** Code review — `clearConfigCache` is synchronous. Grep shows no production callers depend on fire-and-forget timing.

---

### L10 — `afterEach` double-loads translations already loaded in `beforeEach`
**File**: `index.js` lines ~504 and ~680

`beforeEach` awaits `loadTranslationsForSection(resolvedSection, activeLocale)` before allowing navigation. Then `afterEach` calls `loadTranslationsForSection(resolvedSection, activeLocale)` again for the same route/section. Both calls are for the current section, not preloaded sections. Even if the translation loader deduplicates internally, the second call is unnecessary overhead.

**Fix**: Remove the translation load from `afterEach` for the current section — it's already guaranteed complete by `beforeEach`.

#### Resolution ✅

**Status:** Resolved (no further code change — superseded by **Preloading.md Task 3** and **Task 4**).

**What was broken (at audit time):** `beforeEach` awaited `loadTranslationsForSection` before `next()`, then `afterEach` loaded the same section/locale again — duplicate work.

**What changed (preload refactor):** Task 3 **removed** translation loading from `beforeEach` (non-blocking navigation). Task 4 loads current-section translations **only** in `afterEach` (fire-and-forget). Grep of `router/index.js` confirms a single `loadTranslationsForSection` call, in `afterEach` only (~622).

**Do not apply the original audit fix** — removing the `afterEach` translation load would regress the intended preload architecture.

**How it was tested:** Code review of `router/index.js` `beforeEach` / `afterEach`; cross-check `SECTION_PRELOAD_AUDIT.md` P-06 resolution.

---

### L11 — `findComponentLoader` filename-only fallback may load the wrong component
**File**: `index.js` line 176

The last resort in `findComponentLoader` iterates all glob keys and returns the first one whose path ends with the component's filename:

```javascript
const fileName = componentPath.split('/').pop(); // e.g. "Overview.vue"
for (const [key, loader] of Object.entries(componentModules)) {
  if (key.endsWith(fileName)) {
    return loader; // Returns first match — could be wrong file
  }
}
```

If two components share a filename (e.g., multiple `Overview.vue` in different role directories), this returns whichever is first in the object iteration order — unpredictable behavior.

**Fix**: Remove the filename-only fallback entirely and fail loudly in development. Rely on the path resolution variants above it.

#### Resolution ✅

**Status:** Resolved (no further code change required — fixed by **SECTION_PRELOAD_AUDIT.md B-06** / `.cursorrules` router rule).

**What was broken:** `findComponentLoader()` scanned all glob keys for `key.endsWith(fileName)`, returning the first filename match when full paths failed — wrong component could render silently.

**What changed:** Filename-only loop removed from `router/index.js`. `findComponentLoader()` tries path variants (`@/…`, `/src/…`, `./src/…`, `../…`) then returns `null`. `loadViaGlob()` throws `Component not found in pre-loaded modules: …` (with DEV debug logging of sample glob keys). Preloading Task 2 did not reintroduce the fallback.

**How it was tested:** Code review of `findComponentLoader` (~154–179) and `loadViaGlob` (~269–278); cross-check `SECTION_PRELOAD_AUDIT.md` B-06.

---

### L12 — Dev/demo routes lack `section` field, breaking section system
**File**: `routeConfig.json` lines ~1122–1214

The following routes are missing the `section` field entirely: `/dev/datepicker-showcase`, `/dev/bookingform`, `/settings`, `/plan`, `/payout`, `/analytics`, `/chats`, `/demo-dropdowns` (missing in some entries). The section system, CSS loader, and preloader all key off `to.meta?.section`. These routes will silently produce `undefined` sections, skip CSS loading, and generate warnings in the section resolver.

**Fix**: Add appropriate `section` values (e.g., `"dev"`, `"misc"`) to all skeleton routes.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Multiple skeleton/dev routes had no `section`, so `to.meta.section` was undefined — section CSS, translations, and preload skipped or warned.

**What changed:** Added `section` in `routeConfig.json`:

| Section | Routes |
|---------|--------|
| `dev` | `/dev/datepicker-showcase`, `/dev/bookingform`, `/chats` |
| `demo` | `/demo/audit/*` (7 audit demo routes) |
| `misc` | `/settings`, `/plan`, `/payout`, `/analytics`, `/MediaUploader` |
| `profile` | `/edit-profile` (standalone; not in original audit list but same issue) |

`/demo-dropdowns` already had `section: "demo"`. Minor JSON indentation fix on `/chats`. No preload-refactor overlap.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js` — production `routeConfig.json` validates without missing-section warnings for these routes.

---

### L13 — `/dashboard` has both `onboardingRequired` at root and role-specific `onboardingPassed` checks
**File**: `routeConfig.json` line ~144

The dashboard route has `"onboardingRequired": { "required": true, "fallbackSlug": "/sign-up/onboarding" }` at the top of `dependencies`, AND then per-role `onboardingPassed` checks under `roles.creator`, `roles.vendor`, `roles.agent`. The top-level `onboardingRequired` runs for all roles regardless. For creators, this means onboarding is checked twice — once by the global check and once by the role-specific check. The first check wins, making the role-specific check for creator onboarding redundant.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `/dashboard` had root `dependencies.onboardingRequired` plus per-role `onboardingPassed` for creator/vendor/agent. `guardCheckDependencies` evaluates role-specific deps first, then the global check — duplicate logic for those roles. Fan/guest had no role entries and relied only on the global check.

**Why it happened:** Global onboarding gate added before role-specific dependency blocks were fully defined.

**What changed:** Removed `dependencies.onboardingRequired` from `/dashboard`. Onboarding is enforced only via `dependencies.roles.*.onboardingPassed`. Added `fan` and `guest` entries (same redirect as vendor/agent) so roles that only used the global check still require onboarding. Creator keeps `kycPassed` after `onboardingPassed`. No guard code change. No preload-refactor overlap.

**How it was tested:** Code review of `guardCheckDependencies` order (role deps → general `onboardingRequired`). Ran `npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js tests/unit/routeGuards.test.js` (pass).

**Follow-up fix (login redirect loop):** When `onboardingPassed: false` but `kycPassed: true`, `/sign-up/onboarding` incorrectly hit `kycPassed.redirectIfComplete` → `/dashboard`, while `/dashboard` required onboarding → `/sign-up/onboarding` (infinite loop after login). Fixed in `guardCheckDependencies`: evaluate deps in order (`onboardingPassed` before `kycPassed`) and skip `redirectIfComplete` when earlier prerequisites are incomplete. Reordered creator deps in `routeConfig.json` for clarity. Tests in `routeGuards.test.js` → `onboarding redirect loop (L13 follow-up)`.

---

### L14 — Locale redirect in `beforeEach` can trigger infinite redirects
**File**: `index.js` line ~360–390

When no valid locale is in the URL and the resolved locale is non-default, the guard redirects to `/${resolvedLocale}${to.path}`. The redirect uses `replace: true`. But the redirected navigation itself re-enters `beforeEach`. If `resolveActiveLocale()` returns a non-default locale consistently, and the locale param isn't recognized (e.g., `applyLocaleTemporarily` fails silently), the next navigation could enter the `else` branch again and redirect again. The `replace: true` prevents a growing history stack but the guard could still loop.

#### Resolution ✅xxxxx

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Locale injection used only `to.params.locale`. When the path already had a locale prefix (e.g. `/vi/dashboard`) but the param was unset, the guard could prepend again (`/vi/vi/dashboard`) and re-enter `beforeEach` indefinitely. No guard against redirecting to the same path as `from.path`.

**Why it happened:** Injection built `/${locale}${to.path}` from the raw path without normalizing an existing locale segment.

**What changed:** In `router/index.js` `beforeEach` (L14):

1. `getLeadingLocaleFromPath` — treat supported locale in the first path segment like a param locale (apply temporarily, no redirect).
2. `stripLeadingLocaleFromPath` — build redirect targets from the base path without duplicating the prefix.
3. ~~Loop guard on `from.path === pathWithLocale`~~ **removed** — it incorrectly skipped redirects when navigating from `/vi/dashboard` to `/dashboard` (target equals `from.path` but current `to.path` lacks the prefix). Double-prefix prevention relies on (1) and (2) only.

No preload-refactor overlap.

**How it was tested:** Code review of locale branches. Manual: non-`en` store locale + visit `/dashboard` → should redirect to `/vi/dashboard` (etc.). `en` stays unprefixed by design.

---

### L15 — `loadRouteComponent` uses `useAuthStore()` before potential Pinia initialization
**File**: `index.js` line 211

`useAuthStore()` is called inside the `loadRouteComponent` function that runs as the Vue Router `component` factory. If the router is instantiated before Pinia is set up (e.g., during SSR or in a test environment), this throws `"getActivePinia() was called with no active Pinia"`. The standard guard pattern gets the store in `beforeEach` where the app is already mounted — but component factories can run before that.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `loadRouteComponent()` called `useAuthStore()` and `usePreloadStore()` without an active Pinia instance (e.g. router module imported in `main.js` before `app.use(pinia)`, or unit tests importing the router alone). That throws `getActivePinia() was called with no active Pinia`.

**Why it happened:** Preloading Task 2 added auth/preload store reads inside the async component factory; `useAuthStore()` assumes Pinia is already installed.

**What changed:** Added `resolveUserRoleForComponentLoad()` using `getActivePinia()` + `useAuthStore(pinia)`. If Pinia is missing, log a warning and use role `'guest'`. `usePreloadStore(pinia)` uses the same guard; without Pinia, preload cache check is skipped (slow path / `loadViaGlob` only). Normal browser flow unchanged when Pinia is active. Aligns with Preloading Task 2 behavior; only hardens edge cases.

**How it was tested:** Code review. In production, `main.js` runs `app.use(pinia)` before `app.use(router)` and navigation — Pinia is always active when components load.

---

### L16 — `/:pathMatch(.*)*` catch-all won't preserve locale on 404
**File**: `routeConfig.json` last entry

The catch-all route redirects to `/404`. But since all routes are `/:locale?/slug`, a URL like `/vi/nonexistent-page` would match with `locale=vi`. The redirect to `/404` loses the locale, causing the locale system to fall back to default on the 404 page. Users browsing in a non-English locale get the 404 in English.

**Fix**: Change the redirect to use a locale-preserving function (similar to the locale-aware redirect in `generateRoutesFromConfig`).

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Catch-all `/:pathMatch(.*)*` → `/404` used a redirect callback that only read `to.params.locale`. For some unknown URLs (e.g. `/vi/nonexistent-page`), the locale was in the path but not in params, so redirect went to `/404` instead of `/vi/404` and the 404 page fell back to English.

**What changed:** In `router/index.js`:

- `resolveLocaleFromRouteLocation()` — params locale, else leading path segment (same idea as L14).
- `buildLocaleAwareRedirectPath()` — prefix non-default locales only (`vi` → `/vi/404`; `en` stays `/404`).
- All config `redirect` routes (including catch-all) use these helpers.

`routeConfig.json` unchanged (`redirect: "/404"`). No preload-refactor overlap.

**How it was tested:** Code review. Manual: set locale `vi`, open `http://localhost:5173/vi/this-page-does-not-exist` → expect `/vi/404` and Vietnamese 404 copy if translations exist.

---

### L17 — `ROUTE_CONFIG_CACHE_TTL` is meaningless for static build imports
**File**: `src/utils/route/routeConfigLoader.js` line 18

The cache TTL is set to 1 hour (`3600000ms`). However `routeConfigData` is imported as `import routeConfigData from '../../router/routeConfig.json'` — a static Vite build-time import. The JSON is bundled at compile time and never changes at runtime. The TTL-based cache adds complexity with zero benefit; the data can never expire in a meaningful way within a single page session.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `ROUTE_CONFIG_CACHE_TTL` (1 hour) implied `routeConfig.json` could expire and reload at runtime, but the file is a static `import` bundled at build time — TTL added complexity with no real benefit.

**What changed:** Removed `ROUTE_CONFIG_CACHE_TTL`. `loadJsonConfigFromImport` for `route_config` now uses `cacheTTL: 0` (no expiration in `cacheHandler` — session-long cache until `clearConfigCache('route_config')` / page reload). `resetRouteConfigurationCache()` unchanged for dev tooling. No preload-refactor overlap.

**How it was tested:** Code review of `cacheHandler.setValueWithExpiration` (`ttl > 0` only sets expiry). Ran `npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js` (pass).

---

## 2. Security Issues

### S1 — Dev and demo routes are publicly accessible in production
**File**: `routeConfig.json`

Routes in the `/dev/` namespace and demo routes (`/dashboard/demo-page`, `/dev/country-state-demo`, `/dev/datepicker-showcase`, `/dev/bookingform`, `/dashboard/social-linking`) are all `enabled: true` with `requiresAuth: false`. There is no mechanism to strip these from the production build. Any user can navigate to these pages directly.

**Fix**: Add an `envAccess` or `productionDisabled` field, or use `enabled: false` for dev routes. Alternatively, gate them with environment variable checks in the component or guard layer.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass). No conflict with preload refactor — preloading architecture unchanged; dev/demo routes are simply excluded outside local dev.

**What was broken:** Dev and demo routes stayed registered in production builds. Anyone could navigate to showcase pages, component audits, and internal demos directly by URL. `/dashboard/social-linking` was already `enabled: false` but had no environment gate if re-enabled.

**Why it happened:** Routes were distinguished only by URL prefix convention (`/dev/`, `/demo/`). There was no schema field or guard/build filter tied to deployment environment.

**What changed:**
- Added `src/utils/route/routeEnvAccess.js` with `envAccess` support (`"all"` | `"development"`).
- `router/index.js` skips `envAccess: "development"` routes when `import.meta.env.DEV` is false (production/staging builds).
- `guardCheckRouteEnabled` redirects blocked env routes to `/404` (defense in depth).
- `build/vite/sectionBundler.js` omits dev-only routes from section discovery during production builds.
- Tagged 16 routes in `routeConfig.json` with `"envAccess": "development"`: all `/dev/*`, all `/demo/audit/*`, `/demo-dropdowns`, `/dashboard/demo-page`, `/chats`, `/edit-profile`, `/dashboard/social-linking`.
- Documented `envAccess` in `routeConfig.schema.md`; validated in `jsonConfigValidator.js`.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/routeEnvAccess.test.js tests/unit/jsonConfigValidator.test.js tests/unit/routeGuards.test.js` (18 passed).

**How to test in the browser:**

*Local dev — routes should work:*
1. Run `npm run dev`.
2. Open dev/demo URLs directly, for example:
   - `http://localhost:5173/dashboard/demo-page`
   - `http://localhost:5173/dev/country-state-demo`
   - `http://localhost:5173/demo/audit/base-input`
3. Each should load its demo/showcase page (not 404).

*Production build — routes should be blocked:*
1. Run `npm run build` then `npm run preview`.
2. Open the same URLs on the preview origin (e.g. `http://localhost:4173/dashboard/demo-page`).
3. Expect redirect to `/404` (or catch-all 404) — the demo page must not render.
4. Optional: open DevTools → Network, confirm no navigation to the demo component chunk for that route (route was never registered).

*Compare:* Repeat step 2 on `npm run dev` vs `npm run preview` for the same slug — dev loads, preview 404s. That confirms `envAccess: "development"` is enforced.

---

### S2 — External CDN script preloaded without Subresource Integrity (SRI)
**File**: `routeConfig.json` line ~190

The login route preloads Amazon Cognito JS directly from jsdelivr.net:
```json
{ "src": "https://cdn.jsdelivr.net/npm/amazon-cognito-identity-js@6.3.15/...", "type": "script", "priority": "high" }
```

No `integrity` hash is specified. If the CDN is compromised or the URL is hijacked, the script runs with full page access — able to steal credentials entered on the login form.

**Fix**: Self-host the script.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass). No conflict with preload refactor — route `assetPreload` still resolves via `script.cognito` flag; only the URL origin changed from CDN to same-origin vendor path.

**What was broken:** The login route and auth asset map loaded `amazon-cognito-identity-js` from `cdn.jsdelivr.net` without SRI. A compromised CDN or hijacked URL could run arbitrary JS on the login page.

**Why it happened:** The UMD bundle was referenced directly as an external preload URL instead of being served from the app origin.

**What changed:**
- Copied `amazon-cognito-identity-js@6.3.15` UMD build to `public/vendor/amazon-cognito-identity-6.3.15.min.js` (from `node_modules`).
- Updated `script.cognito` in `src/config/assetMap.json` and `public/config/assetMap.json` to `/vendor/amazon-cognito-identity-6.3.15.min.js` (development + production).
- Changed `/log-in` `assetPreload` in `routeConfig.json` to use `{ "flag": "script.cognito", ... }` instead of a hardcoded CDN `src`.
- Updated `scriptAvailabilityChecker.js` default Cognito asset URL to the same local path.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/cognitoScriptSelfHost.test.js`.

**How to test in the browser:**

*Verify same-origin script loads:*
1. Run `npm run dev` and open `http://localhost:5173/log-in`.
2. Open DevTools → **Network** → filter by **JS**.
3. Confirm a request to `/vendor/amazon-cognito-identity-6.3.15.min.js` (same origin) — **not** `cdn.jsdelivr.net`.
4. In the **Console**, run `typeof window.AmazonCognitoIdentity` — expect `"object"` or `"function"` after the auth page finishes loading assets.

*Verify login still works:*
5. Submit a test login (dev shim or Cognito, depending on env). Auth should behave as before; no CDN script failures in Network tab.

*Production preview:*
6. Run `npm run build` then `npm run preview`, open `/log-in`, repeat steps 2–4 — vendor script should still load from `/vendor/...` on the preview origin.

---

### S3 — n/a
---

### S4 — `inheritConfigFromParent: true` child routes don't inherit `requiresAuth`
**File**: `routeConfig.json` + `index.js`

Dozens of child dashboard routes use `"inheritConfigFromParent": true` but do not explicitly set `requiresAuth: true`. The guard checks `route.requiresAuth === true` on the child's own config. If config inheritance is not explicitly merged in `getRouteConfiguration()` or the guard layer, a user can navigate directly to `/dashboard/payout` (for example) without being authenticated — the guard sees `requiresAuth: undefined` which is treated as `false`.

**Verify**: Check `resolveComponentPathForRoute` and the `inheritConfigFromParent` implementation to confirm whether auth is actually inherited. If it is not, this is a critical access-control bypass. Ensure this is logged.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass). Partial guard wiring was already done by **SECTION_PRELOAD_AUDIT.md** L-11 (`router/index.js` runs guards on `resolveEffectiveRouteConfig()`); this pass fixed **recursive** parent merging so nested dashboard children inherit auth from `/dashboard`.

**What was broken:** Guards checked `requiresAuth` on the effective route config, but `inheritConfigurationFromParentRoute` only merged **one** parent level. A child like `/dashboard/settings/privacy-security` inherited from `/dashboard/settings` (which also lacks explicit `requiresAuth`), so `requiresAuth` never reached `/dashboard` and unauthenticated users could pass the auth guard.

**Why it happened:** Single-level `deepMergePreferChild(parentRoute, childRoute)` without resolving the parent chain when intermediate parents also use `inheritConfigFromParent: true`.

**What changed:**
- **`routeResolver.js`** — when merging, recursively resolve the parent via `inheritConfigurationFromParentRoute` if the parent also has `inheritConfigFromParent: true`, then merge. Success log now includes `requiresAuth`, `redirectIfNotAuth`, and `inheritedRequiresAuth` for audit visibility.
- L-11 behavior unchanged: `router/index.js` `beforeEach` still passes the effective config into `runAllRouteGuards`.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/routeInheritance.test.js`.

**How to test in the browser:**

*Unauthenticated user blocked on nested dashboard route:*
1. Log out (or use a private window).
2. Open a nested dashboard URL directly, e.g. `http://localhost:5173/dashboard/settings/privacy-security` or `/dashboard/payout`.
3. Expect redirect to `/log-in` (not the protected page).

*Authenticated user can access:*
4. Log in with a supported role.
5. Open the same URL — expect the dashboard page to load.

*DevTools check (optional):*
6. On step 2, watch Network — you should not see the protected dashboard component render before redirect.

---

---

### S6 — Guard exception silently redirects to 404 instead of alerting on errors
**File**: `src/utils/route/routeGuards.js` line 187

When the entire guard chain throws an exception, the catch block silently redirects to 404:
```javascript
return { allow: false, redirectTo: getDefaultNotFoundSlug(), reason: 'Guard execution failed' };
```

A crash in the guard system (e.g., due to a corrupted auth store) causes all protected routes to become inaccessible — but the user sees only a 404 with no error. This makes debugging in production very difficult and could mask a DoS-style bug.

**Fix**: Log to an error reporting service (Sentry, etc.) before redirecting. Consider a dedicated error route rather than 404.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass). No preload-refactor overlap.

**What was broken:** When `runAllRouteGuards` threw, the catch block used `log()` only (easy to miss in production) and redirected to `/404` with no structured error code or external reporting hook. Operators could not distinguish guard crashes from genuine missing pages.

**Why it happened:** Guard failures were treated like a normal navigation block without production-grade error reporting.

**What changed:**
- **`errorHandler.js`** — added `reportApplicationError()` (always `logError` + optional `window.reportAppError()` hook for Sentry or similar).
- **`routeGuards.js`** — catch block now calls `reportApplicationError()` with route/auth context and returns `{ errorCode: 'GUARD_CHAIN_FAILURE', redirectTo: getDefaultGuardErrorSlug() }`.
- **`routeDefaults.json`** — added `guardErrorSlug` (defaults to `/404`; can be pointed at a dedicated error page later without code changes).

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/routeGuardsS6.test.js`.

**How to test in the browser:**

*Simulate a guard crash in dev:*
1. Run `npm run dev`, open DevTools → **Console**.
2. Temporarily patch a guard to throw, e.g. before navigating:
   ```js
   import { guardCheckAuthentication } from '/src/utils/route/routeGuards.js';
   ```
   Or in Vue devtools / a one-line dev snippet: override `guardCheckAuthentication` to `() => { throw new Error('test guard crash'); }` then navigate to `/dashboard`.
3. Expect **Console** to show `[routeGuards.js] [runAllRouteGuards] Guard chain execution failed` with stack/context.
4. Expect redirect to `/404` (current `guardErrorSlug`).

*Optional Sentry hook:*
5. In console before navigation: `window.reportAppError = (payload) => console.log('REPORTED', payload);` — repeat step 2–3 and confirm `REPORTED` logs with `errorCode: "GUARD_CHAIN_FAILURE"`.

---

## 3. Performance Issues

### P1 — `beforeEach` dynamically imports `localeManager.js` on every navigation
**File**: `index.js` line 330

```javascript
router.beforeEach(async (to, from, next) => {
  const { resolveActiveLocale, setActiveLocale, SUPPORTED_LOCALES } =
    await import('../utils/translation/localeManager.js');
```

This dynamic import runs on **every single route navigation**. While module caching means the file isn't re-fetched after the first load, the `import()` call itself adds a microtask-based Promise resolution overhead on every navigation. Meanwhile, `SUPPORTED_LOCALES` is **already imported statically at the top of the file** (line 23) — this import is entirely redundant.

**Fix**: Move the destructured imports to the static import block at the top of the file.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `beforeEach` awaited a dynamic `import('../utils/translation/localeManager.js')` on every navigation to get `resolveActiveLocale`, `setActiveLocale`, and `SUPPORTED_LOCALES`. That added Promise/microtask overhead per nav even though the module was cached. `SUPPORTED_LOCALES` was already statically imported at the top of `index.js`; `setActiveLocale` was destructured but never used in the hook.

**Why it happened:** An older comment cited avoiding circular dependencies; in practice `SUPPORTED_LOCALES` was already imported statically from the same module, so the dynamic import did not reduce load cost.

**What changed:** Extended the top-level static import in `src/router/index.js` to include `resolveActiveLocale` and removed the redundant dynamic import from `beforeEach`. Left the separate `applyLocaleTemporarily` dynamic import in place (covered by **P2**). No preload-refactor overlap — aligns with `.cursorrules` (avoid async overhead on the critical navigation path).

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/routeGuards.test.js tests/unit/routeInheritance.test.js tests/unit/jsonConfigValidator.test.js` (all passed).

**How to test in the browser:**
1. Run `npm run dev` and open DevTools → **Network** (disable cache optional).
2. Navigate between routes (e.g. `/` → `/log-in` → `/dashboard`) — pages should load normally; locale prefix injection still works (e.g. with a non-default locale in store, URL gets `/vi/...` when appropriate).
3. Open a locale-prefixed URL directly (e.g. `/vi/log-in`) — content should render in that locale without errors.
4. Optional: DevTools → **Performance** → record while clicking several nav links; confirm no functional regression (this fix removes per-nav `import()` microtasks — behavior unchanged, nav should feel the same or slightly snappier on rapid clicks).

---

### P2 — Multiple redundant dynamic imports in `afterEach`
**File**: `index.js` lines ~591, ~649, ~672, ~677, ~700, ~754

`afterEach` performs 6+ dynamic `import()` calls on every completed navigation:
- `import('../utils/route/routeGuards.js')` — for `clearNavigationHistory` (already in the import chain via `runAllRouteGuards`)
- `import('../utils/section/sectionCssLoader.js')` — for `unloadSectionCss` (while `loadSectionCss` is already statically imported)
- `import('../utils/section/sectionResolver.js')` — called twice in two separate `if` blocks
- `import('../utils/translation/localeManager.js')` — called inside a loop for every preloaded section

All of these modules are either already in the static import graph or should be. Dynamic imports inside navigation hooks add async microtask overhead on every nav.

**Fix**: Audit all dynamic imports in hooks and move them to static imports at module level.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `afterEach` (and one remaining `beforeEach` branch) used dynamic `import()` for modules already in the static graph: `clearNavigationHistory` from `routeGuards.js`, `unloadSectionCss` from `sectionCssLoader.js`, and `resolveActiveLocale` / `applyLocaleTemporarily` from `localeManager.js`. Each completed navigation paid Promise/microtask overhead for cached modules. `loadSectionCss`, `resolveRoleSectionVariant`, and `runAllRouteGuards` were already static — the dynamic imports were redundant.

**Why it happened:** Same circular-dependency caution as P1; those modules are already loaded via existing static imports.

**What changed:** In `src/router/index.js`:
- Static import `clearGuardNavigationHistory` from `../utils/route/index.js` (guard loop history — not `routeNavigation.clearNavigationHistory`).
- Static import `unloadSectionCss` alongside `loadSectionCss`.
- Static import `applyLocaleTemporarily` alongside `resolveActiveLocale` / `SUPPORTED_LOCALES`.
- Removed all dynamic imports from `beforeEach` and `afterEach` hooks.

Preload behavior unchanged: CSS unload/load, translations, assets, and `startBackgroundSectionPreloads` still run fire-and-forget in `afterEach` (Preloading Task 4). No preload-refactor conflict.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/routeGuards.test.js tests/unit/routeGuardsS6.test.js tests/unit/sectionCssLoader.test.js tests/unit/sectionPreloadOrchestrator.test.js` (all passed).

**How to test in the browser:**
1. Run `npm run dev`.
2. Navigate between sections (e.g. `/log-in` → `/dashboard` → `/shop`) — styles and content should load; previous section CSS should unload when switching sections (no style bleed).
3. Use a locale-prefixed URL (`/vi/log-in`) — locale applies without console errors.
4. DevTools → **Network**: after landing on a dashboard route, confirm section CSS/translation/asset requests still fire (non-blocking background loads).
5. Rapidly click nav links — no errors; loop guard still works (L5: history clears only when `to.path !== from.path`).

---

### P3 — Blocking translation load in `beforeEach` with no timeout
**File**: `index.js` line 504

```javascript
await loadTranslationsForSection(resolvedSection, activeLocale);
```

Navigation is blocked until translations are fully loaded from the network. On slow connections this can freeze the UI for seconds. There is no timeout, no loading state indicator, and no fallback if the translation request hangs.

**Fix**: Show a loading top bar with line and progress (if we can get percent of download of the transaltion).

#### Resolution ✅

**Status:** Resolved for blocking navigation (no further code change — fixed by **Preloading.md Task 3** and **SECTION_PRELOAD_AUDIT.md P-06**). Loading UI remains open under **M1**.

**What was broken (at audit time):** `beforeEach` awaited `loadTranslationsForSection(resolvedSection, activeLocale)` before `next()`, blocking navigation on translation network I/O with no timeout or loading indicator.

**Why it happened:** Translations were treated as a hard gate before route render.

**What changed (preload refactor):** Task 3 removed translation loading from `beforeEach`. Current-section translations load **only** in `afterEach`, fire-and-forget with `.catch()` (~688). Grep confirms `beforeEach` has **no** `loadTranslationsForSection` call. Navigation no longer waits on translation fetches.

**Do not re-add** an awaited translation load to `beforeEach` — that would regress the non-blocking preload architecture (`.cursorrules`).

**Remaining (not P3):** Loading UI was tracked as **M1 — No loading indicator during navigation** — now resolved (see M1 resolution below).

**How it was tested:** Code review of `src/router/index.js` `beforeEach` / `afterEach`; cross-check `Preloading.md` Task 3 and `SECTION_PRELOAD_AUDIT.md` P-06 resolution.

**How to test in the browser:**
1. Run `npm run dev`, open DevTools → **Network** → throttle to **Slow 3G**.
2. Navigate to a sectioned route (e.g. `/dashboard`) — the route should **render without waiting** for translation JSON to finish (page shell appears; copy may briefly show keys/fallback until translations arrive).
3. Confirm translation requests still fire **after** navigation completes (check Network tab timing vs route change).
4. Rapidly click between nav links — UI should not freeze on translation fetches.

---

### P4 — Identical 20-item `assetPreload` arrays duplicated on `/dashboard` and `/shop`
**File**: `routeConfig.json`

Both routes contain verbatim copies of the same 20-entry `assetPreload` block (dashboard menu icons). This represents ~80 lines of duplicate JSON that must be maintained in sync. It also means if the asset preloader doesn't deduplicate by flag, these assets could be preloaded twice.

**Fix**: Extract shared asset preload definitions into a shared JSON.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `/dashboard` and `/shop` each inlined the same 20-entry `assetPreload` block (dashboard menu icons). ~80 lines of duplicate JSON had to stay in sync; section asset rollup could repeat the same flag resolution work per route.

**Why it happened:** Shared chrome assets were copy-pasted onto each route that uses the dashboard menu.

**What changed:**
- Added `src/router/sharedAssetPreloads.json` with `dashboardMenuIcons` (20 entries).
- Added `src/utils/route/resolveRouteAssetPreloads.js` to expand `assetPreloadRef` at load time.
- `routeConfigLoader.js` resolves refs after validation so runtime consumers still see a normal `assetPreload[]`.
- `/dashboard` and `/shop` now use `"assetPreloadRef": "dashboardMenuIcons"` instead of duplicating the array.

No preload-architecture change — `preloadSectionAssets` still merges by section; `hasAsset()` deduplication unchanged. Complements **ASSET_PRELOAD_AUDIT.md M-01** (merge dedup) without conflicting.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/resolveRouteAssetPreloads.test.js tests/unit/jsonConfigValidator.test.js` (all passed).

**How to test in the browser:**
1. Run `npm run dev`, log in, open `/dashboard` — menu icons should load as before.
2. Navigate to `/shop` — same dashboard chrome icons should preload/display correctly.
3. DevTools → **Network** → filter Img — confirm dashboard icon requests still fire for each section visit (no missing icons).
4. Edit one flag in `sharedAssetPreloads.json` only — both routes should pick up the change after refresh (proves single source of truth).

**M-01 follow-up (2026-05-26):** Merge-time dedup is now implemented in `getAssetPreloadEntriesForSection.js` (**ASSET_PRELOAD_AUDIT.md M-01**). P4 removed JSON duplication; M-01 ensures multiple routes in the **same section** that repeat the same flag/src only produce one rollup entry (highest priority wins). `hasAsset()` HTTP dedup unchanged.

---

### P5 — `findComponentLoader` falls back to O(n) full-map scan
**File**: `index.js` line 176

The final fallback in component resolution iterates all entries of `componentModules` (potentially hundreds of files) on every component load where the straightforward path variants fail:

```javascript
for (const [key, loader] of Object.entries(componentModules)) {
  if (key.endsWith(fileName)) { return loader; }
}
```

This runs on the hot path of every route change where a component hasn't been resolved via the faster checks.

**Fix**: Build an inverted lookup map at startup (filename → full path) so resolution is O(1).

#### Resolution ✅

**Status:** Resolved (no further code change — fixed by **SECTION_PRELOAD_AUDIT.md B-06** / audit **L11**).

**What was broken (at audit time):** When the four path-variant lookups failed, `findComponentLoader()` scanned all `componentModules` entries with `key.endsWith(fileName)` — O(n) on every miss, and could return the wrong component.

**Why it happened:** A permissive filename-only fallback was used as a last resort for path mismatches.

**What changed (preload refactor / B-06):** The O(n) loop was **removed**. `findComponentLoader()` now tries up to four O(1) lookups (`@/…`, `/src/…`, `./src/…`, `../…`) and returns `null`. `loadViaGlob()` throws with a clear error. No `Object.entries(componentModules)` scan remains (grep confirms).

**Do not apply the original P5 fix as written** — a startup `filename → path` inverted map would reintroduce the wrong-component risk that L11/B-06 deliberately removed (`.cursorrules`: remove filename-only fallback matching).

**How it was tested:** Code review of `findComponentLoader` (~221–246) and `loadViaGlob`; cross-check `SECTION_PRELOAD_AUDIT.md` B-06 and audit L11 resolution.

**How to test in the browser:**
1. Run `npm run dev` and navigate to several routes with known `componentPath` values — pages should load normally.
2. Temporarily break a route’s `componentPath` in `routeConfig.json` (invalid path) — expect console error `Component not found in pre-loaded modules: …` and NotFound fallback, **not** a silently wrong component.
3. DevTools → **Performance** — no long synchronous loops during component resolution on valid routes.

---

### P6 — n/a

### P7 — n/a

---

### P8 — `/dashboard/overview` preloads a render-blocking script
**File**: `routeConfig.json` line ~463

```json
{ "name": "dashboard-metrics-lib", "src": "/scripts/dashboard-metrics.js",
  "type": "script", "priority": "high", "defer": false, "async": false }
```

A synchronous script injected into `<head>` blocks HTML parsing and rendering until it fully loads and executes. This will noticeably delay the dashboard overview load.

**Fix**: Set `"defer": true` or `"async": true` unless the script absolutely must execute synchronously before the DOM is available.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `/dashboard/overview` declared `dashboard-metrics-lib` with `"defer": false` and `"async": false`. When `DashboardOverviewCreator.vue` loads it via `AssetHandler`, the injected `<script>` ran synchronously and blocked the main thread until `/scripts/dashboard-metrics.js` finished.

**Why it happened:** Default sync script flags on a route-level `assetPreload` entry used by `AssetHandler.ensureAssetDependencies()` on mount.

**What changed:** Set `"defer": true` (kept `"async": false`) on the `dashboard-metrics-lib` entry in `routeConfig.json`. The script only exposes `window.dashboardMetrics` after load and is consumed in `onMounted` — it does not need synchronous head execution. No preload-architecture conflict: `preloadSectionAssets` still uses non-blocking `link rel=modulepreload` for scripts; this fix affects runtime injection via `AssetHandler` metadata.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js` (production `routeConfig.json` validates).

**How to test in the browser:**
1. Run `npm run dev`, log in as a **creator**, open `/dashboard/overview`.
2. DevTools → **Elements** → after the page loads, find the injected script `[data-asset-name="dashboard-metrics-lib"]` — confirm it has the `defer` attribute.
3. DevTools → **Console** — `window.dashboardMetrics.getSummary()` should return metrics data (script executed successfully).
4. Page shell should render before the script finishes (loading state → content); no long white-screen freeze on overview.

---

### P9 — `resolveActiveLocale()` called multiple times per navigation in `afterEach`
**File**: `index.js` — `afterEach` block

`resolveActiveLocale()` is called at least twice inside `afterEach`: once at line ~678 for current section translation, and once inside the `for...of` loop at line ~754 for every preloaded section. If there are 3 sections to preload, this function runs 4 times for a single navigation event.

**Fix**: Call it once at the top of `afterEach` and store the result.

#### Resolution ✅

**Status:** Resolved (fixed in audit pass **P2** — no further code change).

**What was broken (at audit time):** `afterEach` called `resolveActiveLocale()` once for current-section translations and again inside a per-section preload loop — redundant work when multiple sections were preloaded.

**What changed (P2):** Hoisted `resolveActiveLocale` to a static import and a **single** call in `afterEach` (~663). Result stored in `activeLocale` and passed to `loadTranslationsForSection` and `startBackgroundSectionPreloads({ locale: activeLocale })`. `sectionPreloadOrchestrator` uses the passed locale — no internal `resolveActiveLocale()` calls.

**How it was tested:** Code review / grep of `router/index.js` `afterEach` — one `resolveActiveLocale()` call; cross-check P2 resolution.

**How to test in the browser:**
1. Run `npm run dev`, switch locale (or use `/vi/...` URL), navigate between sectioned routes.
2. Translations and background section preloads should use the same locale (no mixed-language preload).
3. Optional: add a temporary `console.log` in `resolveActiveLocale` — should log **once** per navigation (not once per preloaded section).

---

### P10 — No component preloading on hover/intent
**File**: `index.js` / `routeConfig.json`

There is section and asset preloading but no intent-based component preloading (e.g., preloading a route's component when the user hovers over a navigation link). The `preLoadSections` mechanism loads bundles, but the component factories themselves aren't prefetched until the user actually navigates.

**Recommendation**: Add `router-link` `@mouseenter` handlers that call the component's dynamic import function to warm the module cache before the actual click. This should be used for popups especially and added to checklists and documentation.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Section/asset preloading warmed bundles and static assets, but the route's Vue component module was only fetched after navigation — no intent-based component prefetch on nav hover/focus.

**Why it happened:** Preload architecture focused on section-level JS/CSS bundles (`preLoadSections`), not the `import.meta.glob` component factory used by the router.

**What changed:**
- **`routeComponentLoader.js`** — shared `import.meta.glob` map + `findComponentLoader()` (extracted from `router/index.js`).
- **`routeComponentPrefetch.js`** — `prefetchRouteComponent(path)` and `createRoutePrefetchIntentHandler(path)`; dedupes in-flight/ completed prefetches; strips locale prefix; non-blocking (no guards).
- **`useRoutePrefetch.js`** — composable wrapper for nav components.
- Wired intent prefetch on:
  - **`DashboardSidebar.vue`** — main menu, overflow flyout, submenu popup items
  - **`AuthLogIn.vue`** — sign-up and lost-password links (popup-aware)
  - **`AppFooter.vue`** — footer `router-link` items

Complements section preload (does not replace it). Does not block navigation (`.cursorrules`).

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/routeComponentPrefetch.test.js tests/unit/jsonConfigValidator.test.js` (all passed).

**How to test in the browser:**
1. Run `npm run dev`, open DevTools → **Network** → disable cache.
2. Log in, hover a dashboard sidebar item (e.g. Analytics) **without clicking** — expect a `.vue` chunk request for that route's component.
3. On `/log-in`, hover **Sign Up** — expect auth component chunk prefetch before click.
4. Click the link — navigation should feel instant (module already cached).
5. Hover the same link again — no duplicate chunk fetch (deduped).

**Troubleshooting (post-implementation):**
- **Analytics hover fetched `chartsData.bundle.json` instead of a `.vue` file:** Sidebar used `/dashboard/analytics` but `routeConfig.json` defines `/analytics`. Prefetch hit catch-all `/:pathMatch(.*)*` (redirect-only). Fixed: exact-only lookup, `/dashboard/…` → `/…` fallback, menu updated to `/analytics`. `chartsData.bundle.json` is from global `chartsHandler` in `index.html`, not P10 prefetch.
- **Sign-up hover loads two `.vue` files:** Expected — page template imports the auth component (`AuthSignUp.vue` → `AuthSignUp.vue`).

**Usage for new nav links:**
```vue
<RouterLink to="/shop" @mouseenter="prefetchOnIntent('/shop')" @focus="prefetchOnIntent('/shop')">
```
Or `import { useRoutePrefetch } from '@/utils/route/useRoutePrefetch.js'`.

---

## 4. Best Practice Violations

### B1 — `window.performanceTracker` accessed without SSR/environment guard
**File**: `index.js`, `routeGuards.js`, `routeConfigLoader.js` — dozens of occurrences

Every single guard, loader, and hook directly accesses `window.performanceTracker`. In a Node.js SSR context, `window` is not defined and will throw a `ReferenceError`. Even in a browser context, accessing `window` properties directly (rather than via `globalThis`) is fragile.

**Fix**: Use `typeof window !== 'undefined' && window.performanceTracker` or create a utility like `getPerformanceTracker()` that safely checks for the global.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `src/router/index.js`, `src/utils/route/routeGuards.js`, and `src/utils/route/routeConfigLoader.js` used `if (window.performanceTracker)` before tracking steps. In Node/SSR (or any environment without a global `window`), bare `window` access throws `ReferenceError` before the guard can run. Unit tests that delete `window.performanceTracker` were safe, but importing these modules in non-browser contexts was not.

**Why it happened:** Performance tracking was wired directly to the global set in `main.js`, without a shared SSR-safe accessor in the router scope files.

**What changed:** Replaced all direct `window.performanceTracker` step blocks in the three audit-scoped files with `trackStep()` from the existing `src/utils/common/performanceTrackerAccess.js` utility (which uses `typeof window !== 'undefined'` and a no-op fallback). No preload-refactor overlap — navigation, guards, and section preload behavior unchanged; only tracker access is safe.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/performanceTrackerGuards.test.js tests/unit/routeGuards.test.js tests/unit/routeGuardsS6.test.js tests/unit/routeInheritance.test.js tests/unit/jsonConfigValidator.test.js` (all passed). Added B1 cases to `performanceTrackerGuards.test.js` for `runAllRouteGuards` and `getRouteConfiguration` with `window.performanceTracker` deleted.

**How to test in the browser:**
1. Run `npm run dev`.
2. Optional: set `VITE_ENABLE_PERFORMANCE_TRACKING=true` in `.env` (or `.env.local`) and restart dev server so tracker steps are recorded.
3. Open DevTools → **Console** and navigate between routes (e.g. `/` → `/log-in` → `/dashboard` while authenticated).
4. With tracking enabled, expect `[PerfTracker]` step logs for guard/navigation events (`guardChainStart`, `navigationStart`, `navigationComplete`, etc.) — same as before the fix.
5. With tracking disabled (default), navigation and guards should behave identically with no console errors related to `performanceTracker`.
6. Confirm no regressions: auth redirects, role blocks, and section preload still work on dashboard routes.

**Note:** Related finding **A4** (`routeNavigation.js` direct `window.performanceTracker` access) was resolved in the Additional Router Issues pass using the same `trackStep()` utility. `routeResolver.js` was already guarded in **SECTION_PRELOAD_AUDIT.md** S-05.

---

### B2 — n/a

---

### B3 — `enabled: false` routes are excluded from route generation but can still be accessed via direct URL if server serves the SPA
**File**: `index.js` lines 57–65 / `routeConfig.json` `/about` route

The `generateRoutesFromConfig` skips disabled routes. This means no Vue Router entry exists for `/about`. However if a user navigates directly to `/about`, the catch-all `/:pathMatch(.*)*` will match and redirect to `/404` — correct behavior. But the guard `guardCheckRouteEnabled` also exists, which would only trigger if the route somehow exists in the router. This double-layer approach is confusing.

**Fix**: Document clearly that disabled routes rely entirely on the route-not-existing mechanism, not on the guard. Remove the redundant `guardCheckRouteEnabled` logic.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Two overlapping mechanisms handled disabled routes: `generateRoutesFromConfig` skipped `enabled: false` entries (no Vue Router match → catch-all `/404`), and `guardCheckRouteEnabled` also blocked `enabled: false` if a route config ever reached the guard chain. That double layer was confusing and the guard path was dead code for normal navigation.

**Why it happened:** The enabled guard predated explicit route-generation skips; S1 later added env checks to the same function, mixing two concerns under one name.

**What changed:**
- Removed `enabled === false` handling from the guard chain.
- Renamed the guard to `guardCheckRouteEnvironmentAccess` (envAccess / S1 defense in depth only).
- Kept `guardCheckRouteEnabled` as a deprecated alias that delegates to the env guard.
- Documented `enabled: false` behavior in `routeConfig.schema.md`, `src/utils/route/README.md`, and comments in `src/router/index.js` + `routeGuards.js`.

No preload-refactor overlap. S1 env blocking unchanged — still enforced at route generation and via `guardCheckRouteEnvironmentAccess`.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/routeEnvAccess.test.js tests/unit/routeGuards.test.js tests/unit/performanceTrackerGuards.test.js tests/unit/jsonConfigValidator.test.js` (all passed). Added B3 tests confirming `enabled: false` routes pass the env guard (omission is handled at generation).

**How to test in the browser:**

*Disabled route (`/about`, `enabled: false`):*
1. Run `npm run dev`.
2. Open `http://localhost:5173/about` directly.
3. Expect redirect to `/404` (catch-all — route was never registered).
4. Confirm `/contact` (enabled) still loads normally.

*Disabled + dev-only route (`/dashboard/social-linking`):*
5. While logged in, open `/dashboard/social-linking` — expect `/404` (skipped at generation for `enabled: false`, not guard).

*Dev-only route still blocked in production (S1 unchanged):*
6. Run `npm run build` && `npm run preview`, open `/dashboard/demo-page` — expect `/404`.

**Cross-check vs earlier audit / preload work (no conflict):**
- **L8** (`/dashboard/social-linking`, `enabled: false`) — still `/404` via route generation skip; L8 resolution text mentioning `guardCheckRouteEnabled` is historical (same user outcome, guard no longer checks `enabled`).
- **S1** (`envAccess`) — unchanged; `guardCheckRouteEnvironmentAccess` still blocks dev-only routes in production (defense in depth).
- **Preloading.md / SECTION_PRELOAD_AUDIT.md** — no conflicting `enabled: false` guard rules; preload orchestration untouched.
- **ASSET_PRELOAD_AUDIT C-01** (pre-existing) — disabled routes may still contribute `assetPreload` to section merges via `getRouteConfiguration()`; not introduced by B3; separate follow-up if desired.

---

### B4 — `supportedRoles` inconsistency: `"all"`, `"any"`, and `[]` mean "open to everyone" but are used interchangeably
**File**: `routeConfig.json`

The codebase uses all three conventions: `"supportedRoles": ["all"]`, `"supportedRoles": ["any"]`, `"supportedRoles": []`, and omitting the field entirely — all to mean "any user can access this." The guard handles `all` and `any` (line 554) and empty arrays (line 537) explicitly, but this is unnecessarily complex and error-prone.

**Fix**: Pick one convention (recommend `["all"]`) and enforce it. Remove `"any"` from the codebase and document the convention in `routeConfig.schema.md`.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Open routes used four equivalent patterns: `["all"]`, `["any"]`, `[]`, and omitting `supportedRoles`. Guards treated all as unrestricted, which was easy to misread and error-prone (see L3 — empty `[]` looked “open” but differed from explicit role lists in intent).

**Why it happened:** Patterns accumulated over time without schema enforcement.

**What changed:**
- **`routeConfig.json`** — normalized 9 empty `[]` → `["all"]`, `/profile` `"any"` → `"all"`, added `["all"]` on 6 routes missing the field (redirect-only catch-all exempt).
- **`jsonConfigValidator.js`** — rejects empty `supportedRoles`, deprecated `"any"`, and missing `supportedRoles` on component routes.
- **`routeGuards.js`** — removed `"any"` handling; open access via missing/empty/`["all"]` at runtime (config must use `["all"]`).
- **`routeConfig.schema.md`** — documented B4 convention.

No preload-refactor overlap. Role restrictions and L6 dependency guard behavior unchanged for explicit role lists.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js tests/unit/routeGuards.test.js tests/unit/routeInheritance.test.js` (all passed). Added B4 validator tests.

**How to test in the browser:**
1. Run `npm run dev`.
2. Open public routes that were `[]` before (`/log-in`, `/sign-up`, `/contact`) — should load for guests as before.
3. Open `/profile` — should still load (was `["any"]`, now `["all"]`).
4. Log in as a non-creator and open `/dashboard/overview` — expect block/404 (role list unchanged).
5. Optional: run `npm run build` — config validation should pass at build time if wired through `jsonConfigValidator`.

---

### B5 — Dynamic imports mixed with static imports inconsistently across the same file
**File**: `index.js`

Some modules are imported statically at the top (`loadSectionCss`, `preloadSectionCss`, `loadTranslationsForSection`) while semantically equivalent counterparts are imported dynamically inside hooks (`unloadSectionCss`, `resolveRoleSectionVariant`). This creates an inconsistent mental model of the dependency graph and makes tree-shaking analysis harder.

**Fix**: Default to static imports. Only use dynamic imports for genuine code-splitting boundaries (i.e., things that should not be in the initial bundle).

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass). Completes **P2** cleanup — two dynamic imports remained in `loadRouteComponent` after P2 fixed `beforeEach`/`afterEach`.

**What was broken:** `loadRouteComponent` still used dynamic `import()` for `resolveRoleSectionVariant` (already statically imported at module top) and `sectionPreloader.js` (already in the graph via `sectionPreloadOrchestrator`). That added unnecessary Promise/microtask overhead on cache-miss component loads and made the dependency graph harder to follow.

**Why it happened:** P2 removed hook-level dynamic imports but missed the slow-path block inside `loadRouteComponent`.

**What changed:** In `src/router/index.js`:
- Use top-level static `resolveRoleSectionVariant` inside `loadRouteComponent` (removed redundant dynamic import).
- Static import `preloadSection` from `sectionPreloader.js` and call it fire-and-forget on cache miss (same non-blocking behavior as before).

No remaining runtime `import()` calls in `router/index.js` except TypeScript JSDoc `@param {import('vue-router')...}`. Preload slow-path behavior unchanged per `.cursorrules`.

**How it was tested:** Grep confirms no dynamic `import(` in router hooks/loaders. Ran `npm run test:unit -- --run tests/unit/sectionPreloadOrchestrator.test.js tests/unit/routeGuards.test.js tests/unit/jsonConfigValidator.test.js` (all passed).

**How to test in the browser:**
1. Run `npm run dev`, open DevTools → **Network** (disable cache).
2. Hard-refresh on `/log-in`, then navigate to a sectioned route (e.g. `/dashboard`) — component should load; section preload requests should still appear in background after first visit.
3. Navigate to a route you have **not** preloaded yet (cache miss) — page renders without blocking; Network shows section bundle/CSS preload after component load.
4. Rapid navigation between sections — no console errors; styles/translations still apply (P2 behavior intact).

---

### B6 — `router.onError` handler only logs — no recovery or user notification
**File**: `index.js` line 796

Navigation errors (including chunk load failures from network issues or cache-busting deployment) are logged but otherwise ignored. Users get a blank page or stay on the old route with no feedback.

**Fix**: At minimum, detect chunk load errors (error message contains "Loading chunk" or `error.name === 'ChunkLoadError'`) and redirect to an user-facing error page.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `router.onError` only logged navigation failures. Lazy-route chunk errors (deploy cache bust, network drop, stale CDN) left users on a blank or stale page with no recovery path.

**Why it happened:** Error handler was instrumentation-only (`log` + `trackStep`) with no user-facing follow-up.

**What changed:**
- **`navigationErrorHandler.js`** — `isChunkLoadNavigationError()`, `recoverFromChunkLoadError()`, `isOnNavigationErrorRoute()` (Webpack `ChunkLoadError`, Vite dynamic import messages, Safari import failures).
- **`routeDefaults.json`** — added `navigationErrorSlug` (defaults to `/404`; can point at a dedicated error page later).
- **`routeDefaults.js`** — `getDefaultNavigationErrorSlug()`.
- **`router/index.js`** — `onError` calls `reportApplicationError()` with `CHUNK_LOAD_FAILURE` / `NAVIGATION_FAILURE` and redirects to `navigationErrorSlug` on chunk failures (skips redirect if already on error route).

No preload-refactor overlap. Non-chunk navigation errors are still reported but not auto-redirected.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/navigationErrorHandler.test.js tests/unit/routeGuardsS6.test.js` (all passed).

**How to test in the browser:**  ********
1. Run `npm run build` && `npm run preview` (or dev with throttling).
2. Open the app and navigate to a lazy route (e.g. `/dashboard`).
3. Simulate stale chunks: DevTools → **Network** → enable offline (or block a `.js` chunk), click a nav link to another lazy page.
4. Expect redirect to `/404` (current `navigationErrorSlug`) instead of a silent blank view.
5. Console should show `[router/index.js] [onError] Route chunk load failed` with `errorCode: "CHUNK_LOAD_FAILURE"`.
6. Optional: `window.reportAppError = (p) => console.log('REPORTED', p)` before step 3 — confirm reporting hook fires.

---

### B7 — `runAllRouteGuards` is exported from `index.js` but is an implementation detail
**File**: `index.js` line 818

```javascript
export { runAllRouteGuards };
```

The `runAllRouteGuards` function is exported from the router `index.js` as a named export. The router module should only export the router instance. Guard utilities should be accessed directly from `src/utils/route/routeGuards.js`.

**Fix**: Remove the re-export. Any consumer that needs `runAllRouteGuards` should import it from `routeGuards.js` directly.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `src/router/index.js` re-exported `runAllRouteGuards` alongside the default router instance. That blurred module boundaries — the router file should configure navigation, not be a public entry point for guard utilities.

**Why it happened:** Early refactor exported guard helpers from the router for convenience; canonical exports already exist on `src/utils/route/routeGuards.js` and `src/utils/route/index.js`.

**What changed:** Removed `export { runAllRouteGuards }` from `src/router/index.js`. Internal `beforeEach` still imports guards via `../utils/route/index.js` (unchanged). No production consumers imported the re-export (grep confirmed).

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/routerExports.test.js tests/unit/routeGuards.test.js tests/unit/routeGuardsS6.test.js` (all passed). Added `routerExports.test.js` asserting the re-export is gone and `routeGuards.js` still exports the function.

**How to test in the browser:**
1. Run `npm run dev` — app should boot normally (`main.js` only imports default router).
2. Navigate between public and protected routes — guards still run (auth redirect, role blocks unchanged).
3. No code changes needed unless you previously imported `runAllRouteGuards` from `@/router/index.js`; use `@/utils/route/routeGuards.js` or `@/utils/route/index.js` instead.

---

### B8 — `scrollBehavior` doesn't handle hash anchors
**File**: `index.js` lines 310–316

```javascript
scrollBehavior(to, from, savedPosition) {
  if (savedPosition) { return savedPosition; }
  return { top: 0 };
}
```

Navigating to a URL with a hash (e.g., `/about#features`) scrolls to top instead of the anchor. This breaks standard browser behavior for in-page links and document sections.

**Fix**:
```javascript
scrollBehavior(to, from, savedPosition) {
  if (savedPosition) return savedPosition;
  if (to.hash) return { el: to.hash, behavior: 'smooth' };
  return { top: 0 };
}
```

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `scrollBehavior` only handled browser back/forward (`savedPosition`) or `{ top: 0 }`. URLs with a hash (e.g. `/contact#form`) always jumped to the top, breaking in-page anchor links.

**Why it happened:** Default minimal scroll behavior without hash handling.

**What changed:**
- **`scrollBehavior.js`** — `resolveRouterScrollPosition()` implements saved position → hash anchor → top fallback.
- **`router/index.js`** — `scrollBehavior` delegates to that helper.

No preload-refactor overlap.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/scrollBehavior.test.js` (4 passed).

**How to test in the browser:**
1. Run `npm run dev`.
2. Open a page with a known element `id` (e.g. add `id="features"` to a section on `/contact` temporarily, or use an existing id in any template).
3. Navigate to `/contact#features` (or your slug + hash) — page should smooth-scroll to that element, not stay at top.
4. Use browser **Back** after scrolling — should restore previous scroll position (`savedPosition`).
5. Navigate to a route without a hash — should still scroll to top.

---

# Additional Router Issues

These findings are **additional** to the existing `src/router/AUDIT.md` and focus on issues not already documented there.

---

## A1 — Cache reset path is broken (`removeFromCache` is undefined)

**Category**: Logical / Reliability  
**Files**: `src/utils/common/jsonConfigLoader.js`, `src/utils/route/routeConfigLoader.js`

`clearConfigCache()` calls `removeFromCache(cacheKey)` but `removeFromCache` is never imported in `jsonConfigLoader.js`.

This creates a runtime `ReferenceError` when cache clear is attempted (including via route cache reset flow).

Impact:
- `resetRouteConfigurationCache()` can fail silently/asynchronously
- route config can remain stale after attempted reset

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `clearConfigCache()` in `jsonConfigLoader.js` called `removeFromCache(cacheKey)` to drop entries from `cacheHandler`, but `removeFromCache` was never imported. Any cache clear — including `resetRouteConfigurationCache()` → `clearConfigCache('route_config')` — threw `ReferenceError: removeFromCache is not defined` when a cached entry existed.

**Why it happened:** L9 refactored `resetRouteConfigurationCache()` to call `clearConfigCache` synchronously (good), and `clearConfigCache` was updated to actually remove cache entries via `removeFromCache`, but the import from `cacheHandler.js` was never extended to include `removeFromCache`.

**What changed:** Added `removeFromCache` to the `cacheHandler.js` import in `jsonConfigLoader.js`. Added unit test `clearConfigCache removes cached config entries without throwing` in `tests/unit/jsonConfigLoader.test.js`. No preload-refactor overlap; complements L9’s synchronous reset path.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/jsonConfigLoader.test.js` (7 passed, including new `clearConfigCache` test).

**How to test in the browser:**
1. Run `npm run dev` and open the app (route config loads and caches on first access).
2. Open DevTools → Console.
3. Run:
   ```js
   const { resetRouteConfigurationCache, getRouteConfiguration } = await import('/src/utils/route/routeConfigLoader.js');
   resetRouteConfigurationCache();
   getRouteConfiguration();
   ```
4. Confirm **no** `ReferenceError: removeFromCache is not defined` appears.
5. Optional: edit `routeConfig.json` (e.g. change a route `title`), run `resetRouteConfigurationCache()` again, then navigate — dev should pick up the updated config after reload/navigation without a full page refresh (depending on how your dev tooling calls reset).

---

## A2 — `inheritConfigFromParent` is effectively not applied at route generation time

**Category**: Logical / Missing Feature  
**Files**: `src/utils/route/routeResolver.js`, `src/router/index.js`

`inheritConfigurationFromParentRoute()` exists, but no caller uses it in router generation/guard pipeline.

Confirmed by code search: the function is only defined and exported, never invoked in runtime route creation.

Impact:
- route entries with `"inheritConfigFromParent": true` rely on inheritance that may never happen
- parent-only fields (`requiresAuth`, redirects, dependencies) may not be merged as intended

#### Resolution ✅

**Status:** Resolved (no further code change required — fixed by **SECTION_PRELOAD_AUDIT.md** L-11 and **AUDIT.md** S4 during the section-preload / security pass).

**What was broken:** When this audit was written, `inheritConfigurationFromParentRoute()` existed but was never called from the router pipeline. Child routes with `inheritConfigFromParent: true` did not inherit parent `requiresAuth`, redirects, `preLoadSections`, or `preloadExclude` during guards or preload orchestration.

**Why it happened:** `generateRoutesFromConfig()` stores the raw JSON entry on `meta.routeConfig`; inheritance was implemented in `routeResolver.js` but not wired into navigation.

**What changed (already in codebase):**

1. **`sectionPreloadOrchestrator.js`** — `resolveEffectiveRouteConfig()` wraps `inheritConfigurationFromParentRoute()` for preload planning and section resolution.
2. **`router/index.js`** — `beforeEach` resolves effective config before `runAllRouteGuards()` and section meta; `afterEach` uses effective config for `preloadExclude` and inherited `preLoadSections`.
3. **`routeResolver.js` (S4)** — recursive parent resolution when intermediate parents also use `inheritConfigFromParent: true` (e.g. `/dashboard/settings/privacy-security` → `/dashboard`).
4. **`routeComponentPrefetch.js`** — uses `resolveEffectiveRouteConfig()` for prefetch paths.

**Intentional design:** `meta.routeConfig` keeps the raw child entry from JSON; effective merge happens at navigation time via `resolveEffectiveRouteConfig()`. No preload-refactor conflict.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/routeInheritance.test.js` (5 passed).

**How to test in the browser:**

*Unauthenticated — inherited auth blocks access:*
1. Log out or use a private window.
2. Open a nested dashboard URL directly, e.g. `/dashboard/payout` or `/dashboard/settings/privacy-security`.
3. Expect redirect to `/log-in` (parent `/dashboard` `requiresAuth: true` is inherited).

*Authenticated — page loads:*
4. Log in with a supported role and open the same URL — expect the dashboard page.

*Inherited preload (optional DevTools):*
5. Navigate to a child route that omits its own `preLoadSections` but inherits from a parent (e.g. a dashboard child under `/log-in` preload chain).
6. In Console, confirm `afterEach` preload logs show inherited `preLoadSections` on the effective config (not empty on the raw child).

---

## A3 — Initial app preload path does not normalize locale prefix

**Category**: Logical / Performance  
**File**: `src/main.js`

On startup, `main.js` reads:
- `const currentPath = router.currentRoute.value.path;`
- `const currentRoute = resolveRouteFromPath(currentPath);`

When URL is locale-prefixed (example: `/vi/dashboard`), `resolveRouteFromPath` expects slugs from `routeConfig.json` (example: `/dashboard`), so exact match fails and catch-all resolution can be selected.

Impact:
- wrong route selected for initial preload workflow
- section preloads/translations on first load can be skipped or incorrect for localized URLs

#### Resolution ✅

**Status:** Resolved (no further code change required — fixed by **Preloading.md** Task 7a / **SECTION_PRELOAD_AUDIT.md** L-08).

**What was broken:** On startup, `main.js` passed the raw router path (e.g. `/vi/dashboard`) into `resolveRouteFromPath()`, which only matches slugs from `routeConfig.json` (e.g. `/dashboard`). Lookup failed or fell through to catch-all, so initial section preload/translations for the current page could be skipped on locale-prefixed deep links.

**Why it happened:** Locale is injected as the first URL segment (`/:locale?/slug`), but route config slugs are stored without a locale prefix. Startup did not strip the prefix before lookup.

**What changed (already in codebase):** `main.js` normalizes the path before route resolution:

```js
const rawPath = router.currentRoute.value.path;
const localePrefixMatch = rawPath.match(new RegExp(`^/(${SUPPORTED_LOCALES.join("|")})(/.*|$)`));
const currentPath = localePrefixMatch ? (localePrefixMatch[2] || "/") : rawPath;
const currentRoute = resolveRouteFromPath(currentPath);
```

Downstream startup preload (`getRoutePreloadPlan`, `resolveCurrentRouteSectionName`, background section preloads) uses the resolved route. No preload-refactor conflict; this **is** the approved Task 7a implementation.

**How it was tested:** Code review against `main.js` ~405–408 and SECTION_PRELOAD_AUDIT L-08 resolution. `resolveRouteFromPath('/dashboard')` covered by existing unit tests.

**How to test in the browser:**
1. Run `npm run dev`.
2. Open a locale-prefixed dashboard URL directly, e.g. `http://localhost:5173/vi/dashboard/payout` (hard refresh / private window).
3. Open DevTools → **Console** and filter for `main.js` / `preload`.
4. Expect a log like `Preloading sections for current route` with `routeConfigSlug: "/dashboard/payout"` (or the matching slug) — **not** `null` and not catch-all `/404`.
5. In **Network**, confirm section CSS/translation/asset requests for the dashboard section start on first load (same as non-locale URL `/dashboard/payout`).
6. Compare with step 2 using `/dashboard/payout` without locale — preload behavior should match aside from locale-specific translation files.

---

## A4 — Hard crash risk from direct `window.performanceTracker.step(...)` calls

**Category**: Best Practice / Reliability  
**Files**: `src/utils/route/routeResolver.js`, `src/utils/route/routeNavigation.js`

Unlike other modules that guard tracker access with `if (window.performanceTracker)`, these two files call `window.performanceTracker.step(...)` directly in multiple functions.

If tracker is not initialized, these calls throw immediately.

Impact:
- route resolve/navigation helper functions can crash under partially initialized app state
- test environments without tracker bootstrap are fragile

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass). `routeResolver.js` was already guarded by **SECTION_PRELOAD_AUDIT.md** S-05; this pass completed `routeNavigation.js`.

**What was broken:** `routeNavigation.js` called `window.performanceTracker.step(...)` directly in `setCurrentActiveRoute()` and `clearNavigationHistory()`. When `window.performanceTracker` was undefined (unit tests, early boot), those calls threw and broke navigation history updates after each route change. `routeResolver.js` had the same class of bug but was already fixed with optional chaining (`window.performanceTracker?.step`) in S-05.

**Why it happened:** B1 hardened `router/index.js`, `routeGuards.js`, and `routeConfigLoader.js` with `trackStep()`, but `routeNavigation.js` was left out of that pass (noted in B1 resolution).

**What changed:**
- **`routeNavigation.js`** — replaced two direct `window.performanceTracker.step(...)` calls with `trackStep()` from `performanceTrackerAccess.js` (SSR-safe, no-op when tracker missing/disabled).
- **`routeResolver.js`** — no change (already uses `window.performanceTracker?.step` per S-05).
- **`tests/unit/performanceTrackerGuards.test.js`** — added A4 case for `setCurrentActiveRoute` / `clearNavigationHistory` without tracker.

No preload-refactor overlap.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/performanceTrackerGuards.test.js` (5 passed, including new A4 test).

**How to test in the browser:**
1. Run `npm run dev` and navigate between routes (e.g. `/` → `/log-in` → `/dashboard`).
2. Confirm navigation works with no console errors about `performanceTracker` or `.step`.
3. Optional: in DevTools Console before navigating, run `delete window.performanceTracker`, then navigate again — page should still route; history helpers must not throw (tracker is optional in dev).

---

## A5 — Route utilities README has incorrect async guard examples

**Category**: Best Practice / Documentation correctness  
**File**: `src/utils/route/README.md`

`runAllRouteGuards` is async, but examples call it synchronously without `await`.

Example shown:
- `let result = runAllRouteGuards(publicRoute, {}, guestContext);`
- `console.assert(result.allow === true);`

This is incorrect (`result` is a Promise), and can mislead future contributors/tests.

Impact:
- copy-pasted tests will be wrong
- maintainers can assume synchronous guard behavior incorrectly

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass — documentation only).

**What was broken:** `src/utils/route/README.md` showed synchronous `runAllRouteGuards(...)` calls and `console.assert(result.allow === true)` on the return value. `runAllRouteGuards` is `async` and returns a `Promise`, so copy-pasted examples would always fail assertions. The Performance section also claimed guards “execute synchronously”.

**Why it happened:** README was written before the guard chain was made async (or before docs were updated when `export async function runAllRouteGuards` was introduced).

**What changed:**
- **`src/utils/route/README.md`** — guard testing example wrapped in `async function testRouteGuards()` with `await runAllRouteGuards(...)`.
- Key Methods note clarifies `runAllRouteGuards` returns `Promise<GuardResult>`.
- Performance section distinguishes async chain vs sync individual guard helpers.
- Example routes include `enabled` / `supportedRoles` fields used by the real guard chain.

No preload-refactor overlap; no runtime code changes.

**How it was tested:** Code review — example matches `router/index.js` `beforeEach` (`await runAllRouteGuards(...)`). Existing unit tests already use `await` (`tests/unit/routeGuards.test.js`, `tests/unit/performanceTrackerGuards.test.js`, `tests/unit/routeInheritance.test.js`).

**How to test in the browser:**
1. No runtime change — verify docs only.
2. Optional: open `src/router/index.js` and confirm `beforeEach` uses `const guardResult = await runAllRouteGuards(...)` (line ~457) — README now documents the same contract.

---

## A6 — Schema/docs say `section` is required, validator treats missing `section` as warning only

**Category**: Logical / Best Practice  
**Files**: `src/router/README.md`, `src/router/routeConfig.schema.md`, `src/utils/build/jsonConfigValidator.js`

Docs define `section` as required, but validator logic only emits a warning when it is missing (except redirect/catch-all).

Impact:
- config quality drifts without failing validation
- missing-section routes continue shipping despite violating documented contract

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass). Complements **AUDIT.md** L12 (added missing `section` values to production routes).

**What was broken:** `routeConfig.schema.md` and `router/README.md` listed `section` as required, but `validateRouteConfig()` only pushed `MISSING_RECOMMENDED_FIELD` **warnings** when `section` was absent. Build validation stayed `valid: true`, so new routes could ship without section CSS/translations/preload wiring.

**Why it happened:** `section` was treated as a soft recommendation during early config migration; L12 fixed existing routes but left the validator at warning severity.

**What changed:**
- **`jsonConfigValidator.js`** — missing `section` on navigable routes (not `redirect`, not catch-all `pathMatch`) is now `MISSING_REQUIRED_FIELD` **error** (same severity as missing `slug` / `componentPath`). Redirect-only catch-all remains exempt.
- **`routeConfig.schema.md`** / **`router/README.md`** — clarified required vs redirect-only exemptions.
- **`tests/unit/jsonConfigValidator.test.js`** — A6 tests for fail-on-missing, redirect exempt, production config clean.

No preload-refactor overlap; aligns validator with documented contract and L12 data fixes.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js` (11 passed).

**How to test in the browser:**
1. No direct UI change — validation runs at build/dev config load.
2. Temporarily remove `section` from a dev route in `routeConfig.json` and run `npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js` — expect failure with `MISSING_REQUIRED_FIELD` / `section`.
3. Restore `section`, restart dev — route should load section CSS/translations as before (e.g. dev routes with `section: "dev"`).

---

## A7 — Route chain helper is dead code in runtime app path

**Category**: Best Practice / Maintainability  
**File**: `src/utils/route/routeResolver.js`

`getRouteChainForPath()` is exported but currently unused in runtime sources.

Impact:
- maintenance overhead without runtime value
- indicates planned parent-chain behavior not wired into active router flow

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass — clarified scope + test coverage; no router pipeline change).

**What was broken:** `getRouteChainForPath()` was exported and documented as a route-chain helper, but nothing in the runtime app called it. That looked like unfinished parent-chain wiring, even though **A2 / L-11** already handle config inheritance via `inheritConfigurationFromParentRoute()` → `resolveEffectiveRouteConfig()` in `beforeEach` / preload orchestration.

**Why it happened:** The helper was added for breadcrumbs/nested layouts (`RoutingExplained.md`) before inheritance was implemented through single-parent recursive merge. Two overlapping concepts (`getRouteChainForPath` vs `findParentRouteBySlug`) were never consolidated.

**What changed:**
- **`routeResolver.js`** — JSDoc clarifies `getRouteChainForPath` is an optional consumer utility (breadcrumbs/path introspection), **not** part of guard/preload/inheritance pipeline. Chain lookup now uses `resolveExactRouteFromPath()` (exact slug matches only) so catch-all `/:pathMatch(.*)*` does not pollute breadcrumb chains.
- **`src/utils/route/README.md`** — same distinction under Key Methods.
- **`tests/unit/routeChain.test.js`** — unit tests for chain resolution on nested dashboard paths, top-level routes, and unknown paths.

No preload-refactor overlap; did **not** wire into router pipeline (would duplicate `resolveEffectiveRouteConfig` without adding behavior).

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/routeChain.test.js`.

**How to test in the browser:**
1. Run `npm run dev`, open DevTools → **Console**.
2. Run:
   ```js
   const { getRouteChainForPath } = await import('/src/utils/route/routeResolver.js');
   getRouteChainForPath('/dashboard/settings/privacy-security').map(r => r.slug);
   ```
3. Expect an array like `['/dashboard', '/dashboard/settings', '/dashboard/settings/privacy-security']` (only slugs that exist in `routeConfig.json`).
4. Confirm normal navigation/guards/preload still work — inheritance is unchanged (test unauthenticated redirect on `/dashboard/payout` per A2).

---

## A8 — Navigation history stores mutable route object references

**Category**: Logical / Data integrity  
**File**: `src/utils/route/routeNavigation.js`

`setCurrentActiveRoute()` pushes `{ route: route, ... }` directly into history.
Because this stores object references, later mutations to the same route object can retroactively alter historical entries.

Impact:
- history is not immutable/snapshot-safe
- debugging/tracing may show inaccurate historical state

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `setCurrentActiveRoute()` stored the same object reference as `to.meta.routeConfig` in `currentActiveRoute`, `previousActiveRoute`, and `fullNavigationHistory`. Any later in-place mutation of that config object retroactively changed stored navigation history and “where am I” debugging state.

**Why it happened:** Router passes `to.meta.routeConfig` (raw JSON-derived object) directly; navigation tracking reused the reference instead of snapshotting.

**What changed:**
- **`routeNavigation.js`** — added `snapshotRouteConfig()` using existing `deepClone()` from `objectSafety.js`. `setCurrentActiveRoute()` now stores cloned snapshots for current, previous, and history entries.
- **`tests/unit/routeNavigation.test.js`** — A8 tests verify mutations after `setCurrentActiveRoute` do not alter stored current/previous/history routes.

No preload-refactor overlap; `router/index.js` `afterEach` call site unchanged (`setCurrentActiveRoute(to.meta.routeConfig)`).

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/routeNavigation.test.js tests/unit/performanceTrackerGuards.test.js`.

**How to test in the browser:**
1. Run `npm run dev`, navigate `/log-in` → `/dashboard` (logged in).
2. Open DevTools → **Console**:
   ```js
   const nav = await import('/src/utils/route/routeNavigation.js');
   const history = nav.getNavigationHistory();
   history.map((entry) => entry.route?.slug);
   ```
3. Mutate live meta in console (simulated): if you had a handle to the active route object and changed a field, re-run step 2 — historical entries should still show the slug/fields from when navigation occurred.
4. Optional: use `nav.getNavigationStatistics()` after several navigations — `uniqueRoutes` / paths should remain stable when revisiting routes.

---

### A15 — Two different functions named `clearNavigationHistory`

**Files**: `src/utils/route/routeGuards.js`, `src/utils/route/routeNavigation.js`, `src/utils/route/index.js`

- `routeGuards.js`: clears loop-detection buffer  
- `routeNavigation.js`: clears full navigation state  

Barrel export aliases guard version as `clearGuardNavigationHistory` only.

**Impact**: Easy to clear the wrong history during maintenance (`index.js` afterEach clears the guard buffer).

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass). Partial wiring was already done by **AUDIT.md** P2 / L5 (`router/index.js` imports `clearGuardNavigationHistory` for guard loop buffer only).

**What was broken:** Two unrelated functions were both named `clearNavigationHistory` — one in `routeGuards.js` (redirect-loop buffer) and one in `routeNavigation.js` (full navigation state). The barrel re-exported the guard version as `clearGuardNavigationHistory`, but the source function kept the ambiguous name, so direct imports from `routeGuards.js` or log grep could still target the wrong helper.

**Why it happened:** Loop-guard history predated navigation tracking; both used the same generic name before L5 split router usage.

**What changed:**
- **`routeGuards.js`** — renamed `clearNavigationHistory` → `clearGuardNavigationHistory` (JSDoc clarifies scope).
- **`src/utils/route/index.js`** — exports `clearGuardNavigationHistory` directly (removed `as` alias).
- **`src/utils/route/README.md`** — documents both helpers and warns against mixing them up.
- **`tests/unit/clearNavigationHistoryNaming.test.js`** — verifies distinct exports on guard vs navigation modules.

`router/index.js` already called `clearGuardNavigationHistory()` in `afterEach` on route change (L5) — unchanged. No preload-refactor overlap.

**How it was tested:** Ran `npm run test:unit -- --run tests/unit/clearNavigationHistoryNaming.test.js tests/unit/routeGuards.test.js tests/unit/routeNavigation.test.js`.

**How to test in the browser:**
1. Run `npm run dev`, navigate `/log-in` → `/dashboard` → `/shop`.
2. DevTools Console:
   ```js
   const nav = await import('/src/utils/route/routeNavigation.js');
   nav.getNavigationHistory().length; // should grow with navigations
   ```
3. Trigger a redirect loop scenario in dev (misconfigured guard) — loop guard should still block after repeated same-path redirects; normal navigations should not wipe nav history incorrectly (L5 clears guard buffer only when `to.path !== from.path`).

---

### A16 — Router README documents the wrong validation API

**File**: `src/router/README.md`

Docs use per-route `validateRouteConfiguration()` from `build/buildConfig.js`. Runtime loader uses `validateRouteConfig()` on the full array in `jsonConfigValidator.js`.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass — documentation only).

**What was broken:** `src/router/README.md` Testing section showed a loop calling `validateRouteConfiguration(route)` from `build/buildConfig.js` per route. That legacy helper is a minimal field check and is **not** what `routeConfigLoader.js`, Vite plugins, or CI use. Runtime/build validation goes through `loadJsonConfigFromImport(..., { validator: validateRouteConfig })` on the entire array (`jsonConfigValidator.js`), including duplicate slugs, `supportedRoles`, `preLoadSections`, and required `section` (A6).

**Why it happened:** README predated the centralized `jsonConfigValidator` and was never updated when validation moved to the shared loader.

**What changed:** **`src/router/README.md`** — Testing / Development Rules now document `validateRouteConfig(routeConfig)` and point to `tests/unit/jsonConfigValidator.test.js`. No runtime code changes. No preload-refactor overlap.

**How it was tested:** Code review against `routeConfigLoader.js` (imports `validateRouteConfig`). Existing unit tests already validate production `routeConfig.json`.

**How to test in the browser / locally:**
1. After editing `routeConfig.json`, run:
   ```bash
   npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js
   ```
2. Expect pass — or structured `errors` / `warnings` pointing at the bad route index/field.
3. Optional DevTools snippet (same API as loader):
   ```js
   import routeConfig from '/src/router/routeConfig.json';
   const { validateRouteConfig } = await import('/src/utils/build/jsonConfigValidator.js');
   validateRouteConfig(routeConfig);
   ```

---

### A17 — README path rule conflicts with real `routeConfig.json`

**File**: `src/router/README.md`

README says components must live under `src/components/`. Config mostly uses `@/templates/**`.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass — documentation only).

**What was broken:** `src/router/README.md` Development Rule #6 and examples implied all `componentPath` values must live under `src/components/`. Production `routeConfig.json` primarily uses `@/templates/**` for page-level route components (~76 paths vs ~12 under `@/components/**`), so new contributors could add paths that follow the README but mismatch project convention — or reject valid template paths.

**Why it happened:** README examples were written for an older `src/components/` layout before templates became the standard for routable pages.

**What changed:** **`src/router/README.md`** — updated structure/examples/Common Patterns to use `@/templates/**` where appropriate; Rule #6 now documents both `@/templates/**` (typical pages) and `@/components/**` (shared UI), with note that paths must resolve via router `import.meta.glob`. No runtime code changes. No preload-refactor overlap.

**How it was tested:** Code review — sample paths align with `routeConfig.json` (`/log-in`, `/dashboard`). Grep confirms templates are the dominant convention.

**How to test in the browser / locally:**
1. Add a new route pointing at an existing template file, e.g. `"componentPath": "@/templates/auth/page/role/AuthLogIn.vue"`.
2. Run `npm run dev`, navigate to the slug — page should load.
3. Use a deliberately wrong path — expect component load failure / 404 fallback and dev console error from `loadViaGlob()` (filename-only fallback removed per B-06).

---

### A18 — README route example does not match implementation

**Files**: `src/router/README.md`, `src/router/index.js`

README shows `component: () => import('...')`. Code uses `import.meta.glob` + `findComponentLoader()`.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass — documentation only).

**What was broken:** `src/router/README.md` Route Generation example showed `component: () => import('../components/dashboard/Dashboard.vue')` and `path: '/dashboard'`. Actual `index.js` generates `path: '/:locale?/dashboard'` and `component: () => loadRouteComponent(route)`, which resolves `componentPath` through `routeComponentLoader.js` (`import.meta.glob` on `@/templates/**` and `@/components/**` + `findComponentLoader()`).

**Why it happened:** README described a generic Vue Router lazy-import pattern from before the glob-based loader and locale-aware paths were implemented.

**What changed:** **`src/router/README.md`** — Route Generation section now documents `loadRouteComponent`, `findComponentLoader`, the glob map, locale-prefixed paths, and the 404 fallback when a path is not in the glob. Navigation flow step 3 updated. No runtime code changes. Complements A17 path convention note. No preload-refactor overlap.

**How it was tested:** Code review against `src/router/index.js` (`generateRoutesFromConfig`, `loadRouteComponent`) and `src/utils/route/routeComponentLoader.js`.

**How to test in the browser:**
1. Run `npm run dev`, open DevTools → **Network** → filter JS.
2. Navigate to `/dashboard` — expect a lazy chunk request for the dashboard template (not a hard-coded path from README).
3. Temporarily set a bogus `componentPath` on a dev route — expect 404 page, not a silent wrong component (B-06).
4. Navigate to `/vi/dashboard` — route should still resolve (locale prefix on generated path).

---

### A21 — No shared utility to normalize locale out of paths

**Files**: `src/router/index.js`, `src/main.js`, `src/utils/translation/localeManager.js`

Locale stripping is duplicated inline with small differences.

**Impact**: Repeated bugs when adding new route-resolution entry points.

**Resolution ✅ (A21):** Exported shared helpers from `localeManager.js`:
- `getLeadingLocaleFromPath(path, supportedLocales?)` — first segment when it is a supported locale
- `stripLeadingLocaleFromPath(path, supportedLocales?)` — locale-free slug path (L14-safe)

**Call sites updated:** `router/index.js` (removed local copies), `main.js` startup preload (replaced inline regex), `localeManager.js` (`getLocaleFromUrl`, `setActiveLocale`, `updateUrlWithLocale`), `routeComponentPrefetch.js` (hover prefetch path normalization).

**Test:** `tests/unit/localePathUtils.test.js`

**How to test in the browser:**
1. Hard-refresh on `/vi/dashboard` — page loads with correct section preload (startup uses stripped `/dashboard`).
2. Switch locale via language switcher — URL updates without double prefix (`/vi/vi/...`).
3. Hover a sidebar link while on a locale-prefixed route — prefetch still resolves the correct route component.
4. Navigate `/dashboard` ↔ `/vi/dashboard` — guards and redirects behave as before (no redirect loop).

---
## Modular structure (additional note)
 
- Utility modules under `src/utils/route/` are well split, but orchestration is not extracted into dedicated preload modules.














---

## 5. Missing Features

### M1 — No loading indicator during navigation
There is no global navigation progress bar or loading overlay. When `beforeEach` awaits translations (which can take several hundred milliseconds), the UI appears frozen. Standard Vue Router apps use NProgress or a custom loading bar triggered in `beforeEach`/`afterEach`. this should be a top bar with loading in it.

#### Resolution ✅

**Status:** Resolved. Complements **Preloading.md Task 3** / **P3** (translations no longer block `beforeEach`); this change adds visual feedback only and does **not** re-introduce blocking translation loads.

**What was broken (at audit time):** No global loading indicator during route changes. While guards, locale resolution, or (formerly) awaited translation loads ran, the UI looked frozen.

**Why it happened:** No `beforeEach`/`afterEach` hook drove a progress UI; only Suspense fallback covered async component loading after the route was confirmed.

**What changed:**
- `src/utils/route/navigationProgress.js` — reactive top-bar state with NProgress-style trickle (`start` / `finish` / `fail`).
- `src/components/layout/NavigationProgressBar.vue` — fixed 3px blue bar at the top of the viewport.
- `src/App.vue` — mounts `NavigationProgressBar` globally.
- `src/router/index.js` — `startNavigationProgress()` at the start of `beforeEach`; `finishNavigationProgress()` at the start of `afterEach`; `failNavigationProgress()` on guard `next(false)` and `router.onError`.

**Preload refactor alignment:** Progress reflects navigation/guard timing only. Section CSS, translations, and asset preloads remain non-blocking in `afterEach` (unchanged).

**How it was tested:** `npm run test:unit -- --run tests/unit/navigationProgress.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. Click between routes (e.g. `/log-in` → `/dashboard` → `/shop`) — a thin blue bar should appear at the top during each navigation and complete when the new route is confirmed.
3. DevTools → **Network** → **Slow 3G** — bar should show during guard/locale work even though translations load in the background after navigation (no freeze).
4. Try a blocked navigation (e.g. open a protected route while logged out) — bar should disappear when navigation is cancelled (`next(false)`).
5. Optional: DevTools → **Performance** → record a click navigation — bar start aligns with `beforeEach`, finish with `afterEach`.

---

### M3 — No route-level transition/animation system
Vue Router supports `<router-view v-slot="{ Component }"><transition><component :is="Component"/></transition></router-view>` patterns and per-route transition configuration via `meta.transition`. No transitions are configured anywhere, leading to jarring instant page changes.

#### Resolution ✅

**Status:** Resolved. No conflict with preload refactor — transitions are visual only and do not block navigation or preload I/O.

**What was broken (at audit time):** Route changes swapped page content instantly with no `<Transition>` wrapper or per-route transition config.

**Why it happened:** `App.vue` rendered `<component :is="Component" />` directly inside `Suspense` with no transition layer or `routeConfig.transition` support.

**What changed:**
- `src/utils/route/routeTransition.js` — resolves transition name/mode from `routeConfig.transition` (supports inheritance via `resolveEffectiveRouteConfig`).
- `src/assets/route-transitions.css` — built-in presets: `route-fade` (default), `route-slide-fade`, plus `prefers-reduced-motion` fallback.
- `src/App.vue` — wraps routed content in `<Transition mode="out-in">` with `:key="activeRoute.fullPath"`; skips animation on initial hard load.
- `src/router/routeConfig.schema.md` — documents optional `transition` field.
- `src/utils/route/index.js` — exports `resolveRouteTransition`.

**Per-route config examples** (in `routeConfig.json`):
```json
"transition": "route-slide-fade"
```
```json
"transition": "none"
```
```json
"transition": { "name": "route-fade", "mode": "out-in" }
```

**How it was tested:** `npm run test:unit -- --run tests/unit/routeTransition.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. Navigate between pages (e.g. `/log-in` → `/dashboard`) — outgoing page should fade out before the next fades in (`out-in` mode).
3. Add `"transition": "route-slide-fade"` to a route in `routeConfig.json`, restart dev server, navigate to that route — should use a slight vertical slide.
4. Set `"transition": "none"` on a route (e.g. callback) — navigation to that route should swap instantly with no fade.
5. Enable **prefers-reduced-motion** in OS/browser settings — transitions should be near-instant.

---

### M5 — No `router.isReady()` await before app mount
**File**: `index.js` (exported router)

The Vue Router docs recommend `await router.isReady()` before `app.mount()` to ensure the initial navigation has settled before the app renders. Without this, SSR hydration mismatches and initial guard state issues can occur on first load.

#### Resolution ✅

**Status:** Resolved. No conflict with preload refactor — startup section/translation preloads remain fire-and-forget and are **not** awaited before mount.

**What was broken (at audit time):** `app.mount("#app")` ran immediately while `router.isReady()` was only attached as a non-blocking `.then()` for startup preload. The first paint could occur before initial navigation (locale injection, guards, redirects) settled.

**Why it happened:** Bootstrap treated `isReady()` as a preload hook rather than a mount gate.

**What changed (`src/main.js`):**
- Extracted startup preload into `startStartupPreloadForCurrentRoute()` (unchanged behavior).
- Added `async function mountApplication()` that **`await router.isReady()`** before `app.mount("#app")`.
- Startup preloads kick off after `isReady()` resolves but are not awaited (translations + section preload still non-blocking per `.cursorrules`).
- Removed misleading comment that implied translations block mount.

**Preload refactor alignment:** Mount waits only for router initial navigation — not translation or section preload I/O.

**How it was tested:** Code review of `mountApplication()` ordering; existing unit suite still passes.

**How to test in the browser:**
1. Run `npm run dev`.
2. Hard-refresh on a deep link (e.g. `/vi/dashboard` or a guarded route while logged out) — page should land on the **final** URL after guards/locale redirects, not flash the wrong route first.
3. Hard-refresh while logged out on `/dashboard` — should redirect to login (or configured guard target) without briefly showing dashboard chrome.
4. DevTools → **Network** — translation/section preload requests should still fire after load (non-blocking background work).
5. Console should log `Application mounted successfully` only after router ready (check log order when `VITE_ENABLE_LOGGER=true`).

---

### M6 — No per-route error boundary for component render errors
If a route's component throws during rendering (not during loading), there is no route-level catch. The only protection is the component-load fallback to 404. A runtime render error in a loaded component will bubble up to the app-level error handler (if configured) or crash the page.

**Recommendation**: Add `errorCaptured` handling in the router view layer or a per-route error boundary component.

#### Resolution ✅

**Status:** Resolved. No conflict with preload refactor — catches render-time errors only; does not affect lazy load fallbacks or non-blocking preload.

**What was broken (at audit time):** Loaded route components that threw during render had no route-scoped recovery UI. `App.vue` had `onErrorCaptured` but only logged and stopped propagation without showing a fallback (and did not isolate errors per route).

**Why it happened:** Error handling lived at the app root without a router-view wrapper; component-load failures were handled separately via NotFound fallback in `router/index.js`.

**What changed:**
- `src/components/layout/RouteErrorBoundary.vue` — wraps routed content; `onErrorCaptured` shows a recovery UI (**Try again** / **Go to dashboard**), reports via `reportApplicationError`, and stops propagation (`return false`).
- `src/utils/route/routeErrorBoundary.js` — helpers to build error state and clear on navigation.
- `src/App.vue` — wraps `RouterView` content in `RouteErrorBoundary`; removed redundant app-level `onErrorCaptured` (route errors handled here; other errors still reach `main.js` global handler).

**Behavior:**
- Render error on current route → friendly fallback instead of blank/crashed page.
- **Try again** remounts the same route component.
- **Go to dashboard** navigates to `routeDefaults.json` `dashboardSlug`.
- Navigating to another route clears the error state automatically.
- Dev mode shows the error message under the buttons.

**How it was tested:** `npm run test:unit -- --run tests/unit/routeErrorBoundary.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. Temporarily add `throw new Error('M6 test')` inside `setup()` of any routable page component (e.g. a dev route).
3. Navigate to that route — you should see **Something went wrong** with **Try again** / **Go to dashboard** (not a white screen).
4. Click **Try again** after removing the throw — page should render normally.
5. With the throw still present, navigate to another route — error UI should clear and the new route should attempt to load.
6. Remove the test throw before committing.

---

### M8 — No route alias support
`routeConfig.json` has no `aliases` field. There is no way to have `/home` serve the same component as `/` without a separate redirect entry. Vue Router supports aliases natively. We also want to add redirectFrom so login would redirect to log-in ect.

#### Resolution ✅

**Status:** Resolved. No conflict with preload refactor — aliases and legacy redirects only affect route registration and path resolution.

**What was broken (at audit time):** Every URL needed its own full `routeConfig.json` entry or a standalone `redirect` route. Legacy paths like `/login` could not map to `/log-in` without duplicating route metadata.

**Why it happened:** Route generation only emitted `/:locale?${slug}` records with no `alias` or generated legacy redirect routes.

**What changed:**
- `src/utils/route/routeAliases.js` — normalize paths, build locale-aware Vue Router aliases, generate `redirectFrom` redirect records, resolve paths for config lookup, duplicate-path validation.
- `src/router/index.js` — registers `route.aliases` on Vue routes and emits locale-aware redirect routes from `route.redirectFrom`.
- `src/utils/route/routeResolver.js` — `resolveRouteFromPath` / `resolveExactRouteFromPath` match `aliases` (startup preload, prefetch, menu resolution).
- `src/utils/build/jsonConfigValidator.js` — validates `aliases` / `redirectFrom` types and rejects duplicate path claims.
- `src/router/routeConfig.json` — `/log-in` now includes `"redirectFrom": ["/login"]`.
- `src/router/routeConfig.schema.md` — documents both fields.

**Config examples:**
```json
"aliases": ["/home"]
```
```json
"redirectFrom": ["/login"]
```

**How it was tested:** `npm run test:unit -- --run tests/unit/routeAliases.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. Open `/login` — should redirect to `/log-in` (URL updates).
3. Open `/vi/login` — should redirect to `/vi/log-in`.
4. Add `"aliases": ["/sign-in"]` to `/log-in`, restart dev, open `/sign-in` — same login page, URL stays `/sign-in`.
5. Run `npm run validate-env:dev` (or your config validation script) — duplicate alias/redirect paths should fail validation.

---

### M9 — No `beforeResolve` hook usage
`router.beforeResolve` fires after all in-component guards have resolved but before navigation is confirmed. This is the correct hook for fetching route-level data before render. The current setup loads translations in `beforeEach` (too early — section may change based on role resolution) rather than `beforeResolve` (after guards have settled the final destination).

#### Resolution ✅

**Status:** Resolved. Aligns with **Preloading.md Task 3/4** — current-section loads remain **non-blocking**; only the hook timing changed (not moved back to blocking `beforeEach`).

**What was broken (at audit time):** Route-level translation/resource loading ran in `beforeEach` before in-component guards settled the final destination. After the preload refactor, loads moved to `afterEach` (non-blocking) but still not at the ideal `beforeResolve` point before render.

**Why it happened:** No `beforeResolve` hook existed; post-guard data work lived entirely in `afterEach`.

**What changed:**
- `src/utils/route/routeNavigationData.js` — `startCurrentSectionResourceLoads()` (CSS unload/load, translations, current-section assets) and `resolveCurrentSectionForNavigation()`.
- `src/router/index.js` — `router.beforeResolve` starts current-section resource loads fire-and-forget after in-component guards.
- `src/router/index.js` `afterEach` — keeps navigation bookkeeping and **background** `preLoadSections` only (via `startBackgroundSectionPreloads`).

**Preload refactor alignment:** Does **not** await translation/preload I/O or block navigation. Replaces the Task 4 **timing** for current-section work (`afterEach` → `beforeResolve`) without reintroducing blocking `beforeEach` loads (see **P3** / **L10** — do not remove current-section translation load entirely).

**How it was tested:** `npm run test:unit -- --run tests/unit/routeNavigationData.test.js`

**How to test in the browser:**
1. Run `npm run dev`, open DevTools → **Network**.
2. Navigate to a sectioned route (e.g. `/dashboard`) — translation/CSS requests for the current section should start **before** the page finishes rendering (earlier than pure post-render `afterEach` timing).
3. Navigation must still feel instant (no freeze) — confirms loads are non-blocking.
4. Throttle to **Slow 3G**, navigate between sections — previous section CSS should unload, new section resources should load; background `preLoadSections` still fire from `afterEach`.
5. With `VITE_ENABLE_LOGGER=true`, look for `beforeResolve` / `routeNavigationDataStart` log entries on navigation.

---

### M10 — No runtime validation that `componentPath` files actually exist
During development, misspelled or incorrect `componentPath` values in `routeConfig.json` only fail at runtime when the user navigates to that route. There is no build-time or startup-time check that validates all component paths in the config resolve to real files.

**Recommendation**: Add a build plugin or dev-mode startup check that validates all `componentPath` and `customComponentPath` values against the actual file system.

#### Resolution ✅

**Status:** Resolved. No conflict with preload refactor — validation runs at config load / Vite startup only; no change to lazy load or preload behavior.

**What was broken (at audit time):** Invalid `componentPath` / `customComponentPath` values were only caught when a user navigated to the route (NotFound fallback at runtime).

**Why it happened:** `jsonConfigValidator` checked JSON shape but not whether `.vue` files exist or are included in the router `import.meta.glob` map.

**What changed:**
- `src/utils/route/routeComponentPathValidator.js` — collects paths from `componentPath` and `customComponentPath`; validates format, allowed folders, disk existence (build), and glob registration (dev).
- `build/vite/sectionBundler.js` — fails Vite dev/build startup when any configured component file is missing on disk.
- `src/utils/route/routeConfigLoader.js` — in **DEV**, validates all paths against `findComponentLoader()` when route config loads (fail fast before first navigation).
- `src/router/routeConfig.schema.md` — documents M10 validation behavior.
- `tests/unit/routeComponentPathValidator.test.js` — unit coverage.

**How it was tested:** `npm run test:unit -- --run tests/unit/routeComponentPathValidator.test.js`

**How to test in the browser / locally:**
1. Run `npm run dev` — app should start normally (all current paths valid).
2. Temporarily set a bogus path on a dev route in `routeConfig.json`, e.g. `"componentPath": "@/templates/does/not/Exist.vue"`.
3. Restart dev server — startup should fail with `Route componentPath validation failed` (dev loader) or Vite plugin error (build path).
4. Fix the path — dev server should start again.
5. Optional: run `npm run build` with the bogus path — build should fail with the same validation message.

---

### M11 — No way to flag routes as "admin only" or environment-specific
There is no `environment` or `adminOnly` field in the schema. Dev routes are currently distinguished only by their URL prefix convention (`/dev/`). There is no enforced mechanism to exclude or lock down routes based on deployment environment or user admin status. Add suport fr dev or dmin

#### Resolution ✅

**Status:** Resolved. **Environment-specific (dev) routes** were already implemented as **S1** (`envAccess: "development"`). **M11** adds **`adminOnly`** for admin-gated routes. No conflict with preload refactor.

**What was broken (at audit time):** Dev/demo routes shipped to production by URL convention only; no admin-only route flag existed.

**Why it happened:** No schema fields or guards for deployment environment or admin role beyond generic `supportedRoles`.

**What changed (already in S1 — environment):**
- `envAccess: "all" | "development"` in `routeEnvAccess.js`
- Route registration skip + `guardCheckRouteEnvironmentAccess` + section bundler omit in production
- 16 dev/demo routes tagged in `routeConfig.json`

**What changed (M11 — admin):**
- `src/utils/route/routeAdminAccess.js` — `isAdminUser()`, `isRouteAccessibleToAdmin()`
- `src/utils/route/routeGuards.js` — `guardCheckRouteAdminAccess()` in guard chain (after auth, before role)
- `jsonConfigValidator.js` — validates `adminOnly` is boolean
- `routeConfig.schema.md` — documents `adminOnly`

**Config examples:**
```json
"envAccess": "development"
```
```json
"adminOnly": true,
"requiresAuth": true
```

**How it was tested:** `npm run test:unit -- --run tests/unit/routeAdminAccess.test.js tests/unit/routeEnvAccess.test.js`

**How to test in the browser:**
1. **Dev routes (S1):** `npm run dev` → open `/dev/country-state-demo` (works). `npm run build && npm run preview` → same URL → `/404`.
2. **Admin routes (M11):** Add `"adminOnly": true` to a test route in `routeConfig.json`, restart dev.
3. Log in as non-admin (e.g. creator) → navigate to that slug → expect `/404`.
4. In dev console: `useAuthStore().simulateRole('admin')` or set `userProfile.isAdmin: true`, reload route → page should load.

---


is ready? show demo?
2. Routing & URLs
Field	What it adds
name
Stable router.push({ name: 'dashboard-overview' }) instead of slug-as-name
aliases
/login → same route as /log-in
redirectFrom
Legacy URLs without duplicating full route entries
params / dynamic slug
e.g. /profile/:username with validation rules
localeBehavior
Per-route: prefix default locale, allowed locales, preserve locale on 404 redirect (fixes locale loss on catch-all)
redirectIfDenied
Where to send user when role/permission fails (instead of always 404)
keepAlive - 
Cache route component instance (e.g. chats)