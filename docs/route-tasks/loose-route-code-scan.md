# Loose route code scan

**Date:** 2026-06-10  
**Target structure (from `notes.md`):**

```
src/router/           → Vue Router entry + route JSON config only
src/systems/routing/  → guards, resolvers, navigation, loaders, hooks logic
```

**Note:** The project uses `router/`, not `routes/`. There is no `src/routes/` folder. `utils/route/` has already been removed from `src/` (good).

---

## Summary

| Area | Status |
|------|--------|
| `utils/route/` in `src/` | ✅ Gone — logic lives in `systems/routing/` |
| `systems/routing/` | ✅ Main home for route logic (24 files) |
| `router/index.js` | ❌ Still holds ~749 lines of orchestration (loose) |
| `router/sharedAssetPreloads.json` | ❌ Asset config, not route config |
| Tests + docs | ✅ Active tests/docs fixed (Phase 1 + Phase 7); archived docs may still mention `utils/route/` |
| UI/templates using `useRouter()` | ✅ Normal — consumers, not route system code |

---

## Issue 1

**Location:** `router/index.js` (749 lines)

**Why it is an issue:** This is the biggest block of loose route code. It still defines route generation, component loading, locale injection in `beforeEach`, guard orchestration, section preload in `afterEach`, and error handling. `notes.md` says `router/` is entry + config only; that logic belongs in `systems/routing/`.

**Suggested fix:** Extract to `systems/routing/createAppRouter.js` (or split: `routeGenerator.js`, `registerNavigationHooks.js`). Leave `router/index.js` as:

```js
export { default } from '@/systems/routing/createAppRouter.js';
```

---

## Issue 2

**Location:** `router/sharedAssetPreloads.json`

**Why it is an issue:** Asset preload flags, not routes. Sits in `router/` but is consumed by assets and build validation.

**Suggested fix:** Move to `config/sharedAssetPreloads.json` or `systems/assets/sharedAssetPreloads.json`.

---

## Issue 3

**Location:** `components/layout/AppFooter.vue` — direct `import routeConfig from '../../router/routeConfig.json'`

**Why it is an issue:** Reads raw JSON instead of going through `systems/routing/routeConfigLoader.js` (validation + cache). Loose coupling to `router/` from a layout component.

**Suggested fix:** Use `getRouteConfiguration()` from `@/systems/routing/`.

---

## Issue 4

**Location:** `systems/routing/useRoutePrefetch.js`

**Why it is an issue:** Vue composable living inside the routing system folder. `notes.md` puts composables in `composables/`.

**Suggested fix:** Move to `composables/useRoutePrefetch.js`. Re-export from `systems/routing/index.js` temporarily if needed.

---

## Issue 5

**Location:** `systems/routing/routeAssetPrefetch.js`

**Why it is an issue:** Asset prefetch for routes. `notes.md` places this in `systems/assets/routeAssetPrefetch.js`, not `systems/routing/`.

**Suggested fix:** Move to `systems/assets/routeAssetPrefetch.js`.

---

## Issue 6

**Location:** `systems/i18n/localeManager.js` — `registerLocaleRouter()`, URL locale rewrites, dynamic import of `routeResolver.js`

**Why it is an issue:** Locale system owns router instance registration and path-based route resolution. Route behaviour is split between `router/index.js`, `systems/routing/`, and `localeManager.js`.

**Suggested fix:** Keep locale strings in i18n; move router registration and path rewrite orchestration into `systems/routing/localeNavigation.js` (or similar). `localeManager` calls into routing, not the other way around.

---

## Issue 7

**Location:** `systems/i18n/hreflangTags.js` — called from `router/index.js` `afterEach`

**Why it is an issue:** SEO link tags on navigation are triggered from router hooks but implemented in i18n. Small but scattered route side-effect.

**Suggested fix:** Optional: move to `systems/routing/hreflangTags.js` or call via a single `systems/routing/registerNavigationHooks.js` so all `afterEach` behaviour lives in one place.

---

## Issue 8

**Location:** `app/main.js` — `startStartupPreloadForCurrentRoute()` (~80 lines)

**Why it is an issue:** Startup route resolution and section preload logic in bootstrap file. Uses `resolveRouteFromPath`, `getRoutePreloadPlan`, etc.

**Suggested fix:** Move to `systems/routing/startupNavigation.js` (or `appBootstrap.js`). `main.js` should call one function.

---

## Issue 9

**Status:** Fixed (Phase 1, 2026-06-16)

**Location:** `tests/unit/*.test.js` — previously imported `@/utils/route/...`

**Resolution:** Test imports updated to `@/systems/routing/`, `@/systems/assets/`, `@/composables/`.

---

## Issue 10

**Status:** Fixed for active docs (Phase 7, 2026-06-16)

**Location:** Routing documentation under `docs/` and `src/router/`

**Resolution:** Canonical doc is [RoutingExplained.md](./RoutingExplained.md). Removed `src/router/README.md` and `src/systems/routing/README.md`. Updated [route-code-index.md](./route-code-index.md) and root [README.md](../../README.md). Archived/historical task docs may still mention `utils/route/` — treat as historical.

---

## Issue 11

**Location:** `components/layout/RouteErrorBoundary.vue` + `systems/routing/routeErrorBoundary.js`

**Why it is an issue:** Split is mostly fine (JS helpers in routing, Vue UI in layout). Audit noted route error UI could live closer to routing. Not critical — but two homes for “route errors”.

**Suggested fix:** Optional: move `RouteErrorBoundary.vue` to `components/ui/` or keep in layout; ensure only `systems/routing/routeErrorBoundary.js` holds logic.

---

## What is NOT loose (OK to stay)

| Location | Why it's OK |
|----------|-------------|
| `router/routeConfig.json` | Route definitions — belongs in `router/` |
| `router/routeDefaults.json` | Route fallback slugs — belongs in `router/` |
| `router/routeConfig.schema.md` | Config documentation |
| `systems/routing/*` (core files) | Guards, resolver, aliases, loader, scroll, navigation — correct home |
| `app/main.js` importing `router` | App bootstrap needs router instance |
| `app/App.vue` using `useRoute` + `resolveRouteTransition` | Thin consumer |
| Templates/auth using `useRouter().push()` | Page navigation — not route system code |
| `NavigationProgressBar.vue` → `useNavigationProgress()` | UI bound to routing state — OK |
| `assets/route-transitions.css` | Styles only |
| `build/*` reading `routeConfig.json` | Build-time — OK |

---

## Target layout (when clean)

```
src/router/
  index.js                 # thin re-export only
  routeConfig.json
  routeDefaults.json
  routeConfig.schema.md

src/systems/routing/
  createAppRouter.js       # createRouter + register hooks
  routeGenerator.js
  routeConfigLoader.js
  routeResolver.js
  routeGuards.js
  routeAliases.js
  routeNavigation.js
  routeComponentLoader.js
  navigationErrorHandler.js
  scrollBehavior.js
  ... (everything else route-related)

src/composables/
  useRoutePrefetch.js      # moved from systems/routing

src/systems/assets/
  routeAssetPrefetch.js    # moved from systems/routing
```

---

*End of scan.*
