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

---

### L4 — `inheritConfigFromParent` on social callback routes with no parent
**File**: `routeConfig.json` lines ~837–883

All four routes `/auth/callback/social/facebook`, `/auth/callback/social/google`, `/auth/callback/social/twitter`, `/auth/callback/social/telegram` use `"inheritConfigFromParent": true`. Their parent slug would be `/auth/callback/social` or `/auth/callback` — neither of which exists in `routeConfig.json`. These routes inherit nothing and silently skip parent config merging, losing any auth or role defaults that were expected to be inherited.

**Fix**: Explicitly set `requiresAuth`, `redirectIfNotAuth`, and `enabled` on each callback route instead of relying on a non-existent parent.

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

---

### L7 — Empty string `redirectIfLoggedIn` and `redirectIfNotAuth` fields are dead config
**File**: `routeConfig.json`

Multiple routes set these fields to `""` (empty string): `/dashboard` sets `"redirectIfLoggedIn": ""`, `/lost-password`, `/reset-password`, `/sign-up` set both. Since JavaScript treats empty string as falsy, the guard checks `if (route.redirectIfLoggedIn && ...)` will never fire. These are misleading and waste JSON space.

**Fix**: Remove these fields entirely (they default to null/undefined) rather than setting them to `""`.

---

### L8 — `/dashboard/social-linking` uses a demo component in production
**File**: `routeConfig.json` line ~276

A live, auth-protected route points to `@/templates/dashboard/page/demo/SocialLinkingDemo.vue`. Authenticated users with any role (`"supportedRoles": ["all"]`) can reach this demo. If the demo component has placeholder data or doesn't enforce any permissions internally, this is unintended.

**Fix**: Replace with the real component, or disable the route until the real component exists.

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

---

### L10 — `afterEach` double-loads translations already loaded in `beforeEach`
**File**: `index.js` lines ~504 and ~680

`beforeEach` awaits `loadTranslationsForSection(resolvedSection, activeLocale)` before allowing navigation. Then `afterEach` calls `loadTranslationsForSection(resolvedSection, activeLocale)` again for the same route/section. Both calls are for the current section, not preloaded sections. Even if the translation loader deduplicates internally, the second call is unnecessary overhead.

**Fix**: Remove the translation load from `afterEach` for the current section — it's already guaranteed complete by `beforeEach`.

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

---

### L12 — Dev/demo routes lack `section` field, breaking section system
**File**: `routeConfig.json` lines ~1122–1214

The following routes are missing the `section` field entirely: `/dev/datepicker-showcase`, `/dev/bookingform`, `/settings`, `/plan`, `/payout`, `/analytics`, `/chats`, `/demo-dropdowns` (missing in some entries). The section system, CSS loader, and preloader all key off `to.meta?.section`. These routes will silently produce `undefined` sections, skip CSS loading, and generate warnings in the section resolver.

**Fix**: Add appropriate `section` values (e.g., `"dev"`, `"misc"`) to all skeleton routes.

---

### L13 — `/dashboard` has both `onboardingRequired` at root and role-specific `onboardingPassed` checks
**File**: `routeConfig.json` line ~144

The dashboard route has `"onboardingRequired": { "required": true, "fallbackSlug": "/sign-up/onboarding" }` at the top of `dependencies`, AND then per-role `onboardingPassed` checks under `roles.creator`, `roles.vendor`, `roles.agent`. The top-level `onboardingRequired` runs for all roles regardless. For creators, this means onboarding is checked twice — once by the global check and once by the role-specific check. The first check wins, making the role-specific check for creator onboarding redundant.

---

### L14 — Locale redirect in `beforeEach` can trigger infinite redirects
**File**: `index.js` line ~360–390

When no valid locale is in the URL and the resolved locale is non-default, the guard redirects to `/${resolvedLocale}${to.path}`. The redirect uses `replace: true`. But the redirected navigation itself re-enters `beforeEach`. If `resolveActiveLocale()` returns a non-default locale consistently, and the locale param isn't recognized (e.g., `applyLocaleTemporarily` fails silently), the next navigation could enter the `else` branch again and redirect again. The `replace: true` prevents a growing history stack but the guard could still loop.

---

### L15 — `loadRouteComponent` uses `useAuthStore()` before potential Pinia initialization
**File**: `index.js` line 211

`useAuthStore()` is called inside the `loadRouteComponent` function that runs as the Vue Router `component` factory. If the router is instantiated before Pinia is set up (e.g., during SSR or in a test environment), this throws `"getActivePinia() was called with no active Pinia"`. The standard guard pattern gets the store in `beforeEach` where the app is already mounted — but component factories can run before that.

---

### L16 — `/:pathMatch(.*)*` catch-all won't preserve locale on 404
**File**: `routeConfig.json` last entry

The catch-all route redirects to `/404`. But since all routes are `/:locale?/slug`, a URL like `/vi/nonexistent-page` would match with `locale=vi`. The redirect to `/404` loses the locale, causing the locale system to fall back to default on the 404 page. Users browsing in a non-English locale get the 404 in English.

**Fix**: Change the redirect to use a locale-preserving function (similar to the locale-aware redirect in `generateRoutesFromConfig`).

---

### L17 — `ROUTE_CONFIG_CACHE_TTL` is meaningless for static build imports
**File**: `src/utils/route/routeConfigLoader.js` line 18

The cache TTL is set to 1 hour (`3600000ms`). However `routeConfigData` is imported as `import routeConfigData from '../../router/routeConfig.json'` — a static Vite build-time import. The JSON is bundled at compile time and never changes at runtime. The TTL-based cache adds complexity with zero benefit; the data can never expire in a meaningful way within a single page session.

---

## 2. Security Issues

### S1 — Dev and demo routes are publicly accessible in production
**File**: `routeConfig.json`

Routes in the `/dev/` namespace and demo routes (`/dashboard/demo-page`, `/dev/country-state-demo`, `/dev/datepicker-showcase`, `/dev/bookingform`, `/dashboard/social-linking`) are all `enabled: true` with `requiresAuth: false`. There is no mechanism to strip these from the production build. Any user can navigate to these pages directly.

**Fix**: Add an `envAccess` or `productionDisabled` field, or use `enabled: false` for dev routes. Alternatively, gate them with environment variable checks in the component or guard layer.

---

### S2 — External CDN script preloaded without Subresource Integrity (SRI)
**File**: `routeConfig.json` line ~190

The login route preloads Amazon Cognito JS directly from jsdelivr.net:
```json
{ "src": "https://cdn.jsdelivr.net/npm/amazon-cognito-identity-js@6.3.15/...", "type": "script", "priority": "high" }
```

No `integrity` hash is specified. If the CDN is compromised or the URL is hijacked, the script runs with full page access — able to steal credentials entered on the login form.

**Fix**: Self-host the script.

---

### S3 — n/a
---

### S4 — `inheritConfigFromParent: true` child routes don't inherit `requiresAuth`
**File**: `routeConfig.json` + `index.js`

Dozens of child dashboard routes use `"inheritConfigFromParent": true` but do not explicitly set `requiresAuth: true`. The guard checks `route.requiresAuth === true` on the child's own config. If config inheritance is not explicitly merged in `getRouteConfiguration()` or the guard layer, a user can navigate directly to `/dashboard/payout` (for example) without being authenticated — the guard sees `requiresAuth: undefined` which is treated as `false`.

**Verify**: Check `resolveComponentPathForRoute` and the `inheritConfigFromParent` implementation to confirm whether auth is actually inherited. If it is not, this is a critical access-control bypass. Ensure this is logged.

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

---

### P3 — Blocking translation load in `beforeEach` with no timeout
**File**: `index.js` line 504

```javascript
await loadTranslationsForSection(resolvedSection, activeLocale);
```

Navigation is blocked until translations are fully loaded from the network. On slow connections this can freeze the UI for seconds. There is no timeout, no loading state indicator, and no fallback if the translation request hangs.

**Fix**: Show a loading top bar with line and progress (if we can get percent of download of the transaltion).

---

### P4 — Identical 20-item `assetPreload` arrays duplicated on `/dashboard` and `/shop`
**File**: `routeConfig.json`

Both routes contain verbatim copies of the same 20-entry `assetPreload` block (dashboard menu icons). This represents ~80 lines of duplicate JSON that must be maintained in sync. It also means if the asset preloader doesn't deduplicate by flag, these assets could be preloaded twice.

**Fix**: Extract shared asset preload definitions into a shared JSON.
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

---

### P6 — n/a

### P7 — n/a

---

### P8 — adulllah to do....
`/dashboard/overview` preloads a render-blocking script
**File**: `routeConfig.json` line ~463

```json
{ "name": "dashboard-metrics-lib", "src": "/scripts/dashboard-metrics.js",
  "type": "script", "priority": "high", "defer": false, "async": false }
```

A synchronous script injected into `<head>` blocks HTML parsing and rendering until it fully loads and executes. This will noticeably delay the dashboard overview load.

**Fix**: Set `"defer": true` or `"async": true` unless the script absolutely must execute synchronously before the DOM is available.

---

### P9 — `resolveActiveLocale()` called multiple times per navigation in `afterEach`
**File**: `index.js` — `afterEach` block

`resolveActiveLocale()` is called at least twice inside `afterEach`: once at line ~678 for current section translation, and once inside the `for...of` loop at line ~754 for every preloaded section. If there are 3 sections to preload, this function runs 4 times for a single navigation event.

**Fix**: Call it once at the top of `afterEach` and store the result.

---

### P10 — No component preloading on hover/intent
**File**: `index.js` / `routeConfig.json`

There is section and asset preloading but no intent-based component preloading (e.g., preloading a route's component when the user hovers over a navigation link). The `preLoadSections` mechanism loads bundles, but the component factories themselves aren't prefetched until the user actually navigates.

**Recommendation**: Add `router-link` `@mouseenter` handlers that call the component's dynamic import function to warm the module cache before the actual click. This should be used for popups especially and added to checklists and documentation.

---

## 4. Best Practice Violations

### B1 — `window.performanceTracker` accessed without SSR/environment guard
**File**: `index.js`, `routeGuards.js`, `routeConfigLoader.js` — dozens of occurrences

Every single guard, loader, and hook directly accesses `window.performanceTracker`. In a Node.js SSR context, `window` is not defined and will throw a `ReferenceError`. Even in a browser context, accessing `window` properties directly (rather than via `globalThis`) is fragile.

**Fix**: Use `typeof window !== 'undefined' && window.performanceTracker` or create a utility like `getPerformanceTracker()` that safely checks for the global.

---

### B2 — n/a

---

### B3 — `enabled: false` routes are excluded from route generation but can still be accessed via direct URL if server serves the SPA
**File**: `index.js` lines 57–65 / `routeConfig.json` `/about` route

The `generateRoutesFromConfig` skips disabled routes. This means no Vue Router entry exists for `/about`. However if a user navigates directly to `/about`, the catch-all `/:pathMatch(.*)*` will match and redirect to `/404` — correct behavior. But the guard `guardCheckRouteEnabled` also exists, which would only trigger if the route somehow exists in the router. This double-layer approach is confusing.

**Fix**: Document clearly that disabled routes rely entirely on the route-not-existing mechanism, not on the guard. Remove the redundant `guardCheckRouteEnabled` logic.

---

### B4 — `supportedRoles` inconsistency: `"all"`, `"any"`, and `[]` mean "open to everyone" but are used interchangeably
**File**: `routeConfig.json`

The codebase uses all three conventions: `"supportedRoles": ["all"]`, `"supportedRoles": ["any"]`, `"supportedRoles": []`, and omitting the field entirely — all to mean "any user can access this." The guard handles `all` and `any` (line 554) and empty arrays (line 537) explicitly, but this is unnecessarily complex and error-prone.

**Fix**: Pick one convention (recommend `["all"]`) and enforce it. Remove `"any"` from the codebase and document the convention in `routeConfig.schema.md`.

---

### B5 — Dynamic imports mixed with static imports inconsistently across the same file
**File**: `index.js`

Some modules are imported statically at the top (`loadSectionCss`, `preloadSectionCss`, `loadTranslationsForSection`) while semantically equivalent counterparts are imported dynamically inside hooks (`unloadSectionCss`, `resolveRoleSectionVariant`). This creates an inconsistent mental model of the dependency graph and makes tree-shaking analysis harder.

**Fix**: Default to static imports. Only use dynamic imports for genuine code-splitting boundaries (i.e., things that should not be in the initial bundle).

---

### B6 — `router.onError` handler only logs — no recovery or user notification
**File**: `index.js` line 796

Navigation errors (including chunk load failures from network issues or cache-busting deployment) are logged but otherwise ignored. Users get a blank page or stay on the old route with no feedback.

**Fix**: At minimum, detect chunk load errors (error message contains "Loading chunk" or `error.name === 'ChunkLoadError'`) and redirect to an user-facing error page.

---

### B7 — `runAllRouteGuards` is exported from `index.js` but is an implementation detail
**File**: `index.js` line 818

```javascript
export { runAllRouteGuards };
```

The `runAllRouteGuards` function is exported from the router `index.js` as a named export. The router module should only export the router instance. Guard utilities should be accessed directly from `src/utils/route/routeGuards.js`.

**Fix**: Remove the re-export. Any consumer that needs `runAllRouteGuards` should import it from `routeGuards.js` directly.

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

---

## A2 — `inheritConfigFromParent` is effectively not applied at route generation time

**Category**: Logical / Missing Feature  
**Files**: `src/utils/route/routeResolver.js`, `src/router/index.js`

`inheritConfigurationFromParentRoute()` exists, but no caller uses it in router generation/guard pipeline.

Confirmed by code search: the function is only defined and exported, never invoked in runtime route creation.

Impact:
- route entries with `"inheritConfigFromParent": true` rely on inheritance that may never happen
- parent-only fields (`requiresAuth`, redirects, dependencies) may not be merged as intended

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

---

## A4 — Hard crash risk from direct `window.performanceTracker.step(...)` calls

**Category**: Best Practice / Reliability  
**Files**: `src/utils/route/routeResolver.js`, `src/utils/route/routeNavigation.js`

Unlike other modules that guard tracker access with `if (window.performanceTracker)`, these two files call `window.performanceTracker.step(...)` directly in multiple functions.

If tracker is not initialized, these calls throw immediately.

Impact:
- route resolve/navigation helper functions can crash under partially initialized app state
- test environments without tracker bootstrap are fragile

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

---

## A6 — Schema/docs say `section` is required, validator treats missing `section` as warning only

**Category**: Logical / Best Practice  
**Files**: `src/router/README.md`, `src/router/routeConfig.schema.md`, `src/utils/build/jsonConfigValidator.js`

Docs define `section` as required, but validator logic only emits a warning when it is missing (except redirect/catch-all).

Impact:
- config quality drifts without failing validation
- missing-section routes continue shipping despite violating documented contract

---

## A7 — Route chain helper is dead code in runtime app path

**Category**: Best Practice / Maintainability  
**File**: `src/utils/route/routeResolver.js`

`getRouteChainForPath()` is exported but currently unused in runtime sources.

Impact:
- maintenance overhead without runtime value
- indicates planned parent-chain behavior not wired into active router flow

---

## A8 — Navigation history stores mutable route object references

**Category**: Logical / Data integrity  
**File**: `src/utils/route/routeNavigation.js`

`setCurrentActiveRoute()` pushes `{ route: route, ... }` directly into history.
Because this stores object references, later mutations to the same route object can retroactively alter historical entries.

Impact:
- history is not immutable/snapshot-safe
- debugging/tracing may show inaccurate historical state



---

### A15 — Two different functions named `clearNavigationHistory`

**Files**: `src/utils/route/routeGuards.js`, `src/utils/route/routeNavigation.js`, `src/utils/route/index.js`

- `routeGuards.js`: clears loop-detection buffer  
- `routeNavigation.js`: clears full navigation state  

Barrel export aliases guard version as `clearGuardNavigationHistory` only.

**Impact**: Easy to clear the wrong history during maintenance (`index.js` afterEach clears the guard buffer).

---

### A16 — Router README documents the wrong validation API

**File**: `src/router/README.md`

Docs use per-route `validateRouteConfiguration()` from `build/buildConfig.js`. Runtime loader uses `validateRouteConfig()` on the full array in `jsonConfigValidator.js`.

---

### A17 — README path rule conflicts with real `routeConfig.json`

**File**: `src/router/README.md`

README says components must live under `src/components/`. Config mostly uses `@/templates/**`.

---

### A18 — README route example does not match implementation

**Files**: `src/router/README.md`, `src/router/index.js`

README shows `component: () => import('...')`. Code uses `import.meta.glob` + `findComponentLoader()`.

---

### A21 — No shared utility to normalize locale out of paths

**Files**: `src/router/index.js`, `src/main.js`, `src/utils/translation/localeManager.js`

Locale stripping is duplicated inline with small differences.

**Impact**: Repeated bugs when adding new route-resolution entry points.

---
## Modular structure (additional note)
 
- Utility modules under `src/utils/route/` are well split, but orchestration is not extracted into dedicated preload modules.














---

## 5. Missing Features

### M1 — No loading indicator during navigation
There is no global navigation progress bar or loading overlay. When `beforeEach` awaits translations (which can take several hundred milliseconds), the UI appears frozen. Standard Vue Router apps use NProgress or a custom loading bar triggered in `beforeEach`/`afterEach`. this should be a top bar with loading in it.



### M3 — No route-level transition/animation system
Vue Router supports `<router-view v-slot="{ Component }"><transition><component :is="Component"/></transition></router-view>` patterns and per-route transition configuration via `meta.transition`. No transitions are configured anywhere, leading to jarring instant page changes.



### M5 — No `router.isReady()` await before app mount
**File**: `index.js` (exported router)

The Vue Router docs recommend `await router.isReady()` before `app.mount()` to ensure the initial navigation has settled before the app renders. Without this, SSR hydration mismatches and initial guard state issues can occur on first load.

---

### M6 — No per-route error boundary for component render errors
If a route's component throws during rendering (not during loading), there is no route-level catch. The only protection is the component-load fallback to 404. A runtime render error in a loaded component will bubble up to the app-level error handler (if configured) or crash the page.

**Recommendation**: Add `errorCaptured` handling in the router view layer or a per-route error boundary component.



### M8 — No route alias support
`routeConfig.json` has no `aliases` field. There is no way to have `/home` serve the same component as `/` without a separate redirect entry. Vue Router supports aliases natively. We also want to add redirectFrom so login would redirect to log-in ect.

---

### M9 — No `beforeResolve` hook usage
`router.beforeResolve` fires after all in-component guards have resolved but before navigation is confirmed. This is the correct hook for fetching route-level data before render. The current setup loads translations in `beforeEach` (too early — section may change based on role resolution) rather than `beforeResolve` (after guards have settled the final destination).

---

### M10 — No runtime validation that `componentPath` files actually exist
During development, misspelled or incorrect `componentPath` values in `routeConfig.json` only fail at runtime when the user navigates to that route. There is no build-time or startup-time check that validates all component paths in the config resolve to real files.

**Recommendation**: Add a build plugin or dev-mode startup check that validates all `componentPath` and `customComponentPath` values against the actual file system.

---

### M11 — No way to flag routes as "admin only" or environment-specific
There is no `environment` or `adminOnly` field in the schema. Dev routes are currently distinguished only by their URL prefix convention (`/dev/`). There is no enforced mechanism to exclude or lock down routes based on deployment environment or user admin status. Add suport fr dev or dmin

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