# Systems folder audit — route code

**Scope:** Route-related code in `src/systems/` vs `notes.md`  
**Reference target:**

```
systems/routing/     → guards, resolvers, navigation, aliases, scroll, errors
systems/assets/      → routeAssetPrefetch.js
composables/         → useRoutePrefetch.js
```

**Audit type:** File location and structure only

---

## `systems/routing/` — proposed vs actual

**Proposed in `notes.md` (8 files):**

```
index.js
routeGuards.js
routeResolver.js
routeAliases.js
routeNavigation.js
routeErrorBoundary.js
navigationErrorHandler.js
scrollBehavior.js
```

**Actual (23 code files + README):** all 8 above exist, plus 15 extra files.

---

## Issue 1

**Location:** `systems/routing/routeAssetPrefetch.js`

**Why it is an issue:** `notes.md` places `routeAssetPrefetch.js` under `systems/assets/`, not `systems/routing/`. It is also not exported from `systems/assets/index.js`.

**Suggested fix:** Move to `systems/assets/routeAssetPrefetch.js`. Export from `systems/assets/index.js`. Update imports in `routing/index.js`, `useRoutePrefetch.js`, and tests.

---

## Issue 2

**Location:** `systems/routing/resolveRouteAssetPreloads.js`

**Why it is an issue:** Expands `assetPreloadRef` on route config at load time. This is asset config resolution, not routing logic. Sits next to route loader because `routeConfigLoader.js` calls it.

**Suggested fix:** Move to `systems/assets/resolveRouteAssetPreloads.js` together with Issue 1. Keep `routeConfigLoader` importing from assets.

---

## Issue 3

**Location:** `systems/routing/useRoutePrefetch.js`

**Why it is an issue:** `notes.md` lists `useRoutePrefetch.js` under `composables/`, not inside the routing system. It is a Vue composable.

**Suggested fix:** Move to `composables/useRoutePrefetch.js`. Re-export from `systems/routing/index.js` only if needed for backward compatibility.

---

## Issue 4

**Location:** `router/index.js` — route hook orchestration not yet in `systems/routing/`

**Why it is an issue:** `createRouter`, `generateRoutesFromConfig`, `beforeEach` / `beforeResolve` / `afterEach`, and `loadRouteComponent` still live in `router/index.js`. Per `notes.md`, that orchestration belongs in the routing system, not the router folder.

**Suggested fix:** Add `systems/routing/createAppRouter.js` (and helpers). Slim `router/index.js` to a re-export. This completes the systems/routing layer.

---

## Issue 5

**Location:** `systems/routing/routeConfigLoader.js` imports `router/sharedAssetPreloads.json`

**Why it is an issue:** Route loader pulls in asset preload JSON from `router/`. Mixes route config loading with asset catalog data. `sharedAssetPreloads.json` should not live in `router/` at all.

**Suggested fix:** After moving `sharedAssetPreloads.json` to `config/` or `systems/assets/`, import from the new path. Keep `routeConfig.json` as the only import from `router/`.

---

## Issue 6

**Location:** 15 extra files in `systems/routing/` not listed in `notes.md`

**Why it is an issue:** `notes.md` shows a minimal 8-file routing module. The repo has grown to 23 implementation files. Not all are wrong, but they are undocumented in the target structure.

**Extra files:**

| File | Role |
|------|------|
| `routeConfigLoader.js` | Load/validate `routeConfig.json` |
| `routeDefaults.js` | Read `routeDefaults.json` |
| `routeComponentLoader.js` | `import.meta.glob` map |
| `routeComponentPrefetch.js` | Hover/focus component prefetch |
| `routeComponentPathValidator.js` | Path validation (dev) |
| `routeComponentPathValidator.node.js` | Path validation (build) |
| `routeEnvAccess.js` | Dev-only route gating |
| `routeAdminAccess.js` | Admin route access |
| `routeNavigationData.js` | CSS/translation load on navigate |
| `routeTransition.js` | Route transition names |
| `navigationProgress.js` | Top progress bar state |
| `notFoundComponentLoader.js` | 404 component load |
| `README.md` | Docs |

**Suggested fix:** Update `notes.md` to include these as approved `systems/routing/` files, **or** move non-routing concerns out (Issues 1–3, 9–10).

---

## Issue 7

**Location:** `systems/routing/routeErrorBoundary.js` vs `components/layout/RouteErrorBoundary.vue`

**Why it is an issue:** `notes.md` lists `routeErrorBoundary.js` in routing (correct for JS helpers). The Vue UI shell is in `components/layout/`. Two locations for one feature.

**Suggested fix:** Keep JS in `systems/routing/routeErrorBoundary.js`. Optional: document that the Vue shell stays in `components/layout/` as the UI binding only.

---

## Issue 8

**Location:** `systems/routing/routeNavigation.js` and `systems/routing/routeNavigationData.js`

**Why it is an issue:** Navigation is split across two files. `routeNavigation.js` tracks active/history routes; `routeNavigationData.js` starts section CSS/translations on navigate. `notes.md` only names `routeNavigation.js`.

**Suggested fix:** Merge into `routeNavigation.js` with clear subsections, **or** add `routeNavigationData.js` to `notes.md` as an approved file.

---

## Issue 9

**Location:** `systems/routing/navigationProgress.js`

**Why it is an issue:** UI progress bar state for navigation. Not in `notes.md` routing list. Borderline between routing UX and a composable/UI concern.

**Suggested fix:** Keep in routing if tied to router hooks, or move to `composables/useNavigationProgress.js`. Document choice in `notes.md`.

---

## Issue 10

**Location:** `systems/routing/routeTransition.js`

**Why it is an issue:** Resolves transition name/mode from route meta. Used by `App.vue`, not listed in `notes.md` routing files.

**Suggested fix:** Add to `notes.md` as part of `systems/routing/`, or colocate with `createAppRouter.js` when that file is created.

---

# Route code in other `systems/` folders

---

## Issue 11

**Location:** `systems/i18n/localeManager.js` — `registerLocaleRouter()`, URL locale injection, imports `routeResolver.js`

**Why it is an issue:** i18n owns router instance registration and path-based route resolution. Route behaviour is split across `routing/`, `router/index.js`, and `i18n/`.

**Suggested fix:** Extract router URL/locale orchestration to `systems/routing/localeNavigation.js`. `localeManager` should call routing helpers, not own the router reference.

---

## Issue 12

**Location:** `systems/i18n/hreflangTags.js`

**Why it is an issue:** Runs on every navigation (`router.afterEach` in `router/index.js`). SEO link tags are a navigation side-effect but live in i18n.

**Suggested fix:** Move to `systems/routing/hreflangTags.js`, or invoke only from a single `registerNavigationHooks.js` in routing.

---

## Issue 13

**Location:** `systems/i18n/validateI18n.js` — hardcoded `routeConfigPath: 'src/router/routeConfig.json'`

**Why it is an issue:** i18n validation reaches into router config path directly instead of using `routeConfigLoader`.

**Suggested fix:** Import `getRouteConfiguration()` from `systems/routing/` for section validation.

---

## Issue 14

**Location:** `systems/sections/sectionPreloadOrchestrator.js` — `getRoutePreloadPlan()`, `resolveEffectiveRouteConfig()`, `resolveCurrentRouteSectionName()`

**Why it is an issue:** Route config inheritance and preload planning live in the sections system. Same `inheritConfigurationFromParentRoute` logic also exists in routing (`routeResolver.js`).

**Suggested fix:** Keep thin wrappers in sections that call `systems/routing/routeResolver.js` only. Do not duplicate route config merge logic. Export shared helpers from routing if both need them.

---

## Issue 15

**Location:** `systems/sections/sectionResolver.js` imports `resolveRouteFromPath` from routing

**Why it is an issue:** Sections depend on routing to resolve current path. Acceptable coupling, but means sections cannot load without routing.

**Suggested fix:** No move required. Document that `sectionResolver` is a consumer of `routeResolver`, not a second route system.

---

## Issue 16

**Location:** `systems/assets/validateRouteAssetPreloadFlags.js`, `getAssetPreloadEntriesForSection.js`

**Why it is an issue:** These are route-aware but correctly named and placed under assets. `routeAssetPrefetch.js` is the mismatch (still in routing per Issue 1).

**Suggested fix:** No move. After Issue 1, all route-asset prefetch code lives under `systems/assets/`.

---

## Issue 17

**Location:** `systems/assets/resolveSharedComponentAssets.js` imports `router/sharedAssetPreloads.json`

**Why it is an issue:** Assets system reads JSON from `router/` folder. Same problem as Issue 5.

**Suggested fix:** Import from `config/sharedAssetPreloads.json` after that file is moved out of `router/`.

---

## Issue 18

**Location:** `systems/build/jsonConfigValidator.js` — `validateRouteConfig()`, imports `sharedAssetPreloads.json` and `resolveRouteAssetPreloads.js`

**Why it is an issue:** Build validator owns full route config schema validation. `notes.md` lists `jsonConfigValidator.js` under `systems/build/` — placement is OK. But it imports asset preload resolution from routing (Issue 2) and JSON from `router/` (Issue 5).

**Suggested fix:** Keep `validateRouteConfig` in build. Fix import paths after Issues 1, 2, and 5. No need to move validation into routing.

---

## Issue 19

**Location:** `systems/sections/` — missing `sectionManifestHelpers.js`

**Why it is an issue:** `notes.md` proposes `systems/sections/sectionManifestHelpers.js`. File does not exist in the repo.

**Suggested fix:** Create when needed, or remove from `notes.md` if not required.

---

## Issue 20

**Location:** `systems/routing/README.md` — may still reference old paths

**Why it is an issue:** Internal docs can drift from actual layout and from `notes.md`, causing wrong placements in future work.

**Suggested fix:** Update README to match final `notes.md` structure after Issues 1–6 are resolved.

---

# What is correctly placed

| File / area | Verdict |
|-------------|---------|
| `routeGuards.js` | ✅ Correct home |
| `routeResolver.js` | ✅ Correct home |
| `routeAliases.js` | ✅ Correct home |
| `routeNavigation.js` | ✅ Correct home |
| `navigationErrorHandler.js` | ✅ Correct home |
| `scrollBehavior.js` | ✅ Correct home |
| `routeErrorBoundary.js` (JS) | ✅ Correct home |
| `routeConfigLoader.js` | ✅ OK — loads from `router/routeConfig.json` |
| `routeDefaults.js` | ✅ OK — reads `router/routeDefaults.json` |
| `routeComponentLoader.js` | ✅ OK — glob map for route components |
| `routeEnvAccess.js` | ✅ OK — guard support |
| `routeAdminAccess.js` | ✅ OK — guard support |
| `routeComponentPathValidator.js` | ✅ OK — route path validation |
| `notFoundComponentLoader.js` | ✅ OK — fallback route component |

---

# Priority order

1. Move `routeAssetPrefetch.js` + `resolveRouteAssetPreloads.js` → `systems/assets/` (Issues 1–2)
2. Move `useRoutePrefetch.js` → `composables/` (Issue 3)
3. Extract `createAppRouter.js` from `router/index.js` (Issue 4)
4. Move `sharedAssetPreloads.json` out of `router/`; fix imports (Issues 5, 17)
5. Pull locale/hreflang navigation side-effects into routing (Issues 11–12)
6. Deduplicate route preload planning between sections and routing (Issue 14)
7. Update `notes.md` with the real routing file list (Issue 6)

---

*End of audit.*
