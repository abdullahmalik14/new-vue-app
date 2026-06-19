# Route cleanup — change log

**Purpose:** Record what was changed during the [route-work-master-plan.md](./route-work-master-plan.md) execution. Audits stay as proposals; this file is the **done work** log.

**Branch:** `refactor/route-cleanup`

---

## Phase 1 — Fix test imports (2026-06-16)

**Master plan:** Phase 1 — Unblock tests and CI  
**Audit reference:** [loose-route-code-scan.md](./loose-route-code-scan.md) Issue 9  
**Scope:** Test import paths only. No module renames, no `src/` moves.

### Issue

After route logic moved from `src/utils/route/` to `src/systems/routing/`, unit tests still imported the old paths (`@/utils/route/...`, `../../src/utils/route/...`). Those directories no longer exist on disk and there is no Vite alias redirecting `utils/route` → `systems/routing`. Vitest failed at module resolution before tests could run.

The same drift existed for section and i18n tests still pointing at `utils/section/` and `utils/translation/` instead of `systems/sections/` and `systems/i18n/`. A few route-related tests also mocked or imported moved infrastructure/assets paths.

### What changed

Path-only find-replace in `tests/`:

| Old import prefix | New import prefix |
|-------------------|-------------------|
| `../../src/utils/route/` | `../../src/systems/routing/` |
| `@/utils/route/` | `@/systems/routing/` |
| `../../src/utils/section/` | `../../src/systems/sections/` |
| `@/utils/section/` | `@/systems/sections/` |
| `../../src/utils/translation/` | `../../src/systems/i18n/` |
| `@/utils/translation/` | `@/systems/i18n/` |
| `src/utils/translation/` (filesystem paths in tests) | `src/systems/i18n/` |
| `src/utils/section/` (filesystem paths in tests) | `src/systems/sections/` |

Additional route-test fixes (modules moved outside `utils/route`):

| Old path | New path | Files |
|----------|----------|-------|
| `../../src/utils/common/errorHandler.js` | `../../src/infrastructure/errors/errorHandler.js` | `routeGuardsS6.test.js` |
| `../../src/utils/assets/assetPreloader.js` | `../../src/systems/assets/assetPreloader.js` | `routeAssetPrefetch.test.js`, `routeNavigationData.test.js` |
| `../../src/utils/assets/validateRouteAssetPreloadFlags.js` | `../../src/systems/assets/validateRouteAssetPreloadFlags.js` | `validateRouteAssetPreloadFlags.test.js` |
| `../../src/utils/common/performanceTrackerAccess.js` | `../../src/infrastructure/logging/performanceTrackerAccess.js` | `performanceTrackerGuards.test.js` |

### Files touched (54)

**Route / router tests**

- `tests/unit/applyLocaleTemporarily.test.js`
- `tests/unit/assetMapBuildValidation.test.js`
- `tests/unit/clearNavigationHistoryNaming.test.js`
- `tests/unit/getAssetPreloadEntriesForSection.test.js`
- `tests/unit/guardLoopHistoryClear.test.js`
- `tests/unit/navigationErrorHandler.test.js`
- `tests/unit/navigationProgress.test.js`
- `tests/unit/performanceTrackerGuards.test.js`
- `tests/unit/resolveRouteAssetPreloads.test.js`
- `tests/unit/routeAdminAccess.test.js`
- `tests/unit/routeAliases.test.js`
- `tests/unit/routeAssetPrefetch.test.js`
- `tests/unit/routeChain.test.js`
- `tests/unit/routeComponentPathValidator.test.js`
- `tests/unit/routeComponentPrefetch.test.js`
- `tests/unit/routeEnvAccess.test.js`
- `tests/unit/routeErrorBoundary.test.js`
- `tests/unit/routeGuards.test.js`
- `tests/unit/routeGuardsS6.test.js`
- `tests/unit/routeInheritance.test.js`
- `tests/unit/routeNavigation.test.js`
- `tests/unit/routeNavigationData.test.js`
- `tests/unit/routeTransition.test.js`
- `tests/unit/routerExports.test.js`
- `tests/unit/routerLocaleInject.test.js`
- `tests/unit/scrollBehavior.test.js`
- `tests/unit/shopAssetPreloadConfig.test.js`
- `tests/unit/startupRouteResolution.test.js`
- `tests/unit/updateUrlWithLocale.test.js`
- `tests/unit/useRoutePrefetch.test.js`
- `tests/unit/validateRouteAssetPreloadFlags.test.js`

**Locale / section / i18n tests** (same Phase 1 import sweep)

- `tests/unit/cognitoLocaleProfile.test.js`
- `tests/unit/extractLocaleSelection.test.js`
- `tests/unit/getBrowserLocale.test.js`
- `tests/unit/getDisplayedLocale.test.js`
- `tests/unit/hreflangTags.test.js`
- `tests/unit/localeConstantsCycle.test.js`
- `tests/unit/localeFormatting.test.js`
- `tests/unit/localeManagerWindowApi.test.js`
- `tests/unit/localePathUtils.test.js`
- `tests/unit/localeStoreSync.test.js`
- `tests/unit/localeSwitcherOptions.test.js`
- `tests/unit/resolveActiveLocaleForNavigation.test.js`
- `tests/unit/resolveActiveLocaleProfile.test.js`
- `tests/unit/sectionBarrel.test.js`
- `tests/unit/sectionCssLoader.test.js`
- `tests/unit/sectionPreloadOrchestrator.test.js`
- `tests/unit/sectionPreloader.test.js`
- `tests/unit/sectionResolver.test.js`
- `tests/unit/temporaryPageLocale.test.js`
- `tests/unit/translationLoader.test.js`
- `tests/unit/translationSecurityAudit.test.js`
- `tests/unit/userLocaleProfile.test.js`
- `tests/unit/validateI18n.test.js`

### How tested

1. **Import grep (exit criterion)**

   ```bash
   rg "utils/(route|section|translation)" tests/
   ```

   Result: zero hits.

2. **Core route unit tests (all pass — 30 tests)**

   ```bash
   npm run test:unit -- --run tests/unit/routeGuards.test.js tests/unit/routeGuardsS6.test.js tests/unit/routeAliases.test.js tests/unit/routeEnvAccess.test.js tests/unit/scrollBehavior.test.js tests/unit/navigationErrorHandler.test.js
   ```

3. **Broader route filter** (`tests/unit/route` — 16 files)

   - 9 files pass, 7 still fail for **non-import** reasons (see below).

### Not fixed in Phase 1 (pre-existing / out of scope)

These route tests load modules successfully but fail on logic, environment, or unrelated infrastructure:

| Test file | Failure | Notes |
|-----------|---------|-------|
| `routeComponentPrefetch.test.js` | `performanceTracker.js` UMD `module.exports` conflict | Triggered via `apiWrapper` import chain |
| `routeAssetPrefetch.test.js` | Same | Same |
| `routerExports.test.js` | Same | Imports full `router/index.js` |
| `routeInheritance.test.js` | Same | Pulls section orchestrator → api chain |
| `routeChain.test.js` | Assertion: chain length ≥ 2, got 1 | Route config / resolver behaviour |
| `routeNavigation.test.js` | Same | Same |
| `routerLocaleInject.test.js` | 5s timeout | Full router + locale store integration |

No production `src/` files were modified in Phase 1.

### Phase 1 exit

- [x] Route unit tests import `@/systems/routing/...` (and aligned `systems/` paths)
- [x] No module renames
- [x] Audits left unchanged (findings only); this changelog records the fix

---

## Phase 2a — Move sharedAssetPreloads.json (2026-06-16)

**Master plan:** Phase 2, step 2a  
**Audit reference:** [folder-structure-audit-router.md](./folder-structure-audit-router.md) Issue 1, [systems-routing-audit.md](./systems-routing-audit.md) Issue 5, [loose-route-code-scan.md](./loose-route-code-scan.md) Issue 2

### Issue

`sharedAssetPreloads.json` is an asset preload catalog, not route config. It lived under `src/router/` alongside `routeConfig.json`, but `notes.md` limits `router/` to entry + route JSON only.

### What changed

- `git mv` `src/router/sharedAssetPreloads.json` → `src/config/sharedAssetPreloads.json`
- Updated JSON import paths in production code and tests (path-only; file content unchanged)

### Files touched

| File | Change |
|------|--------|
| `src/config/sharedAssetPreloads.json` | Moved from `src/router/` |
| `src/systems/routing/routeConfigLoader.js` | Import → `../../config/sharedAssetPreloads.json` |
| `src/systems/assets/resolveSharedComponentAssets.js` | Import → `../../config/sharedAssetPreloads.json` |
| `src/systems/build/jsonConfigValidator.js` | Import → `../../config/sharedAssetPreloads.json` |
| `tests/unit/resolveRouteAssetPreloads.test.js` | Import path updated |
| `tests/unit/sharedComponentAssetMappings.test.js` | `readJson` path updated |
| `tests/unit/assetMapBuildValidation.test.js` | `readJson` paths updated |

### How tested

```bash
rg "router/sharedAssetPreloads" src/ tests/
# zero hits

npm run test:unit -- --run tests/unit/resolveRouteAssetPreloads.test.js
# import resolves; "throws for unknown assetPreloadRef keys" passes
```

Some related tests still fail for pre-existing reasons (stale `utils/assets` / `utils/build` test imports, outdated entry-count assertions in `resolveRouteAssetPreloads`) — not caused by this move.

### Step 2a exit

- [x] Asset catalog no longer under `src/router/`
- [x] Production imports point at `src/config/sharedAssetPreloads.json`
- [x] No filename rename

---

## Phase 2b — Move routeAssetPrefetch.js (2026-06-16)

**Master plan:** Phase 2, step 2b  
**Audit reference:** [systems-routing-audit.md](./systems-routing-audit.md) Issue 1, [loose-route-code-scan.md](./loose-route-code-scan.md) Issue 5

### Issue

Route section asset prefetch is asset-layer logic but lived in `systems/routing/`.

### What changed

- `git mv` `src/systems/routing/routeAssetPrefetch.js` → `src/systems/assets/routeAssetPrefetch.js`
- Fixed relative imports inside moved file (`assetPreloader`, `routeComponentPrefetch`)
- Re-export from `systems/routing/index.js` and `systems/assets/index.js` for backward compatibility
- Updated `useRoutePrefetch.js` import and test mocks/paths

### Files touched

`src/systems/assets/routeAssetPrefetch.js`, `src/systems/assets/index.js`, `src/systems/routing/index.js`, `src/systems/routing/useRoutePrefetch.js`, `tests/unit/routeAssetPrefetch.test.js`, `tests/unit/useRoutePrefetch.test.js`

### How tested

```bash
rg "routing/routeAssetPrefetch" src/ tests/   # zero hits
npm run test:unit -- --run tests/unit/useRoutePrefetch.test.js   # 2 passed
```

`routeAssetPrefetch.test.js` still fails on pre-existing `performanceTracker` UMD issue when loading full module chain.

---

## Phase 2c — Move resolveRouteAssetPreloads.js (2026-06-16)

**Master plan:** Phase 2, step 2c  
**Audit reference:** [systems-routing-audit.md](./systems-routing-audit.md) Issue 2

### Issue

`assetPreloadRef` expansion is asset config resolution, not routing logic.

### What changed

- `git mv` `src/systems/routing/resolveRouteAssetPreloads.js` → `src/systems/assets/resolveRouteAssetPreloads.js`
- Updated imports in `routeConfigLoader.js`, `jsonConfigValidator.js`, tests
- Exported from `systems/assets/index.js`

### Files touched

`src/systems/assets/resolveRouteAssetPreloads.js`, `src/systems/assets/index.js`, `src/systems/routing/routeConfigLoader.js`, `src/systems/build/jsonConfigValidator.js`, `tests/unit/resolveRouteAssetPreloads.test.js`, `tests/unit/assetMapBuildValidation.test.js`

### How tested

```bash
rg "routing/resolveRouteAssetPreloads" src/ tests/   # zero hits
npm run test:unit -- --run tests/unit/resolveRouteAssetPreloads.test.js
# "throws for unknown assetPreloadRef keys" passes; count assertions pre-existing stale catalog size
```

---

## Phase 2d — Move useRoutePrefetch.js (2026-06-16)

**Master plan:** Phase 2, step 2d  
**Audit reference:** [systems-routing-audit.md](./systems-routing-audit.md) Issue 3, [loose-route-code-scan.md](./loose-route-code-scan.md) Issue 4

### Issue

Vue composable lived inside `systems/routing/` instead of `composables/`.

### What changed

- `git mv` `src/systems/routing/useRoutePrefetch.js` → `src/composables/useRoutePrefetch.js`
- Updated composable imports to `systems/routing/routeComponentPrefetch` and `systems/assets/routeAssetPrefetch`
- Temporary re-export from `systems/routing/index.js`
- Updated direct consumers: `AppFooter.vue`, `AuthLogIn.vue`, `DashboardSharedSidebar.vue`, tests

### Files touched

`src/composables/useRoutePrefetch.js`, `src/systems/routing/index.js`, `src/components/layout/AppFooter.vue`, `src/dev/templates/auth/views/AuthLogIn.vue`, `src/dev/templates/dashboard/shared/DashboardSharedSidebar.vue`, `tests/unit/useRoutePrefetch.test.js`

### How tested

```bash
rg "routing/useRoutePrefetch" src/ tests/   # zero hits (router index re-exports via composables)
npm run test:unit -- --run tests/unit/useRoutePrefetch.test.js   # 2 passed
```

---

## Phase 2e — AppFooter uses getRouteConfiguration() (2026-06-16)

**Master plan:** Phase 2, step 2e  
**Audit reference:** [loose-route-code-scan.md](./loose-route-code-scan.md) Issue 3, RoutingExplained AI rule #3

### Issue

`AppFooter.vue` imported raw `routeConfig.json` and ran its own validation path instead of the cached, validated loader used by the router.

### What changed

- Replaced direct JSON import + `loadJsonConfigFromImport` / `validateRouteConfig` with `getRouteConfiguration()` from `routeConfigLoader.js`
- Footer navigation behaviour unchanged (same filter/map logic)

### Files touched

`src/components/layout/AppFooter.vue`

### How tested

```bash
npm run build   # succeeds
```

No dedicated AppFooter unit test exists.

---

## Phase 2f — Extract createAppRouter.js (2026-06-16)

**Master plan:** Phase 2, step 2f  
**Audit reference:** [loose-route-code-scan.md](./loose-route-code-scan.md) Issue 1, [folder-structure-audit-router.md](./folder-structure-audit-router.md) Issue 2, [systems-routing-audit.md](./systems-routing-audit.md) Issue 4

### Issue

~750 lines of router orchestration (route generation, component loading, locale hooks, guards, preload, errors) lived in `src/router/index.js` instead of `systems/routing/`.

### What changed

- Moved orchestration to `src/systems/routing/createAppRouter.js` (default export: router instance)
- Slimmed `src/router/index.js` to re-export default router + prefetch helpers from routing barrel
- Log/trackStep file labels updated to `createAppRouter.js`

### Files touched

`src/systems/routing/createAppRouter.js` (new), `src/router/index.js` (12 lines)

### How tested

```bash
npm run build   # succeeds
npm run test:unit -- --run tests/unit/routeGuards.test.js tests/unit/scrollBehavior.test.js   # pass
npm run test:unit -- --run tests/unit/routerExports.test.js   # pre-existing performanceTracker UMD failure on full router import
```

### Phase 2 exit (2a–2f)

- [x] Asset catalog out of `router/`
- [x] Asset prefetch modules in `systems/assets/`
- [x] Composable in `composables/`
- [x] AppFooter uses `getRouteConfiguration()`
- [x] `router/index.js` thin re-export

---

## Phase 3a — Core routing module filename renames (2026-06-16)

**Master plan:** Phase 3, batch 1 — core routing filenames  
**Audit reference:** [route-naming-audit-batch-1.md](./route-naming-audit-batch-1.md) (`type: filename` entries)

### Issue

Five core routing modules still used legacy filenames from the pre-refactor layout. Names did not match their responsibilities (alias resolution, component preloading, navigation resource loading, progress tracking, disk path validation).

### What changed

`git mv` renames only — no symbol/method renames (Phase 4):

| Old | New |
|-----|-----|
| `routeAliases.js` | `routeAliasResolver.js` |
| `routeComponentPathValidator.node.js` | `routeComponentPathDiskValidator.node.js` |
| `routeComponentPrefetch.js` | `routeComponentPreloader.js` |
| `navigationProgress.js` | `navigationProgressTracker.js` |
| `routeNavigationData.js` | `routeNavigationResourceLoader.js` |

Updated import paths in:

- `src/systems/routing/index.js`, `createAppRouter.js`, `routeResolver.js`
- `src/systems/build/jsonConfigValidator.js`
- `src/composables/useRoutePrefetch.js`
- `src/systems/assets/routeAssetPrefetch.js`
- `src/components/layout/NavigationProgressBar.vue`
- `build/vite/sectionBundler.js`
- 7 unit test files

### Files touched

5 renamed modules + 14 import-site files (see git status)

### How tested

```bash
rg "routeAliases\.js|routeComponentPathValidator\.node|routeComponentPrefetch\.js|navigationProgress\.js|routeNavigationData\.js" src/ tests/ build/   # zero import hits
npm run test:unit -- --run tests/unit/routeAliases.test.js tests/unit/routeComponentPathValidator.test.js tests/unit/routeNavigationData.test.js tests/unit/navigationProgress.test.js tests/unit/useRoutePrefetch.test.js   # 22 passed
npm run test:unit -- --run tests/unit/routeComponentPrefetch.test.js   # pre-existing performanceTracker UMD failure (unchanged)
npm run build   # succeeds
```

### Suggested commit

```
refactor(routing): rename core routing module filenames
```

---

## Phase 3b — Asset preload module filename renames (2026-06-16)

**Master plan:** Phase 3, batch 2 — asset filenames  
**Audit reference:** [route-naming-audit-batch-1.md](./route-naming-audit-batch-1.md) (`routeAssetPrefetch`, `resolveRouteAssetPreloads`)

### What changed

| Old | New |
|-----|-----|
| `routeAssetPrefetch.js` | `routeAssetPreloader.js` |
| `resolveRouteAssetPreloads.js` | `routeAssetPreloadResolver.js` |

Updated imports in `systems/assets/index.js`, `systems/routing/index.js`, `routeConfigLoader.js`, `jsonConfigValidator.js`, `useRoutePrefetch.js`, and 4 test files.

### How tested

```bash
rg "routeAssetPrefetch\.js|resolveRouteAssetPreloads\.js" src/ tests/ build/   # zero import hits (log strings only)
npm run test:unit -- --run tests/unit/useRoutePrefetch.test.js   # 2 passed
npm run test:unit -- --run tests/unit/resolveRouteAssetPreloads.test.js   # pre-existing stale entry-count assertions
```

---

## Phase 3c — Cross-system filename renames (2026-06-16)

**Master plan:** Phase 3, batch 3 — cross-system filenames  
**Audit reference:** [route-naming-audit-batch-2.md](./route-naming-audit-batch-2.md)

### What changed

| Old | New |
|-----|-----|
| `systems/i18n/hreflangTags.js` | `routeHreflangTags.js` |
| `systems/assets/getAssetPreloadEntriesForSection.js` | `routeSectionAssetPreloadEntries.js` |

Updated imports in routing, i18n, assets modules and 6 test files. Fixed stale `utils/assets/getAssetPreloadEntriesForSection` test paths to `systems/assets/routeSectionAssetPreloadEntries`.

### How tested

```bash
rg "hreflangTags\.js|getAssetPreloadEntriesForSection\.js" src/ tests/ build/   # zero import hits
npm run test:unit -- --run tests/unit/getAssetPreloadEntriesForSection.test.js   # 7 passed
npm run test:unit -- --run tests/unit/hreflangTags.test.js   # pre-existing performanceTracker UMD failure
```

---

## Phase 3d — Dev UI component filename renames (2026-06-16)

**Master plan:** Phase 3, batch 4 — dev/nav UI filenames  
**Audit reference:** [route-naming-audit-batch-3.md](./route-naming-audit-batch-3.md), [route-naming-audit-batch-4.md](./route-naming-audit-batch-4.md)

### What changed

| Old | New |
|-----|-----|
| `components/layout/dev/DevNavBar.vue` | `DevNavigationBar.vue` |
| `components/ui/nav/dashboard/NavDropdown.vue` | `NavigationDropdown.vue` |

Updated import and template usage in `DashboardSharedHeader.vue`. `DevNavigationBar.vue` has no current import sites (orphan scaffold).

### How tested

```bash
rg "DevNavBar|NavDropdown" src/ tests/ build/   # zero import hits (log string in NavigationDropdown.vue only)
npm run build   # succeeds
```

### Phase 3 exit (3a–3d)

All 11 non-auth `type: filename` renames from the naming audit are applied. Auth `*Page.vue` renames deferred to Phase 5.

---

## Phase 4.0 — Test unblock (2026-06-16)

**Master plan:** Phase 4 prep — restore reliable test signal before symbol renames

### 4.0a — `performanceTracker` ESM/UMD conflict

**Issue:** Vitest loads modules as ESM. `performanceTracker.js` assigned to read-only `module.exports`, throwing `Cannot set property default of [object Module] which has only a getter`. Any test importing routing/prefetch code through `apiWrapper.js` failed before assertions ran.

**Fix:** Skip UMD `module.exports` assignment when `import.meta.url` is present (ESM); keep legacy script-tag / AMD paths unchanged.

**Commit:** `fix(tests): guard performanceTracker UMD export in ESM`

### 4.0b — Stale `utils/assets` and `utils/build` test imports

**Issue:** 47 unit tests still imported deleted `src/utils/assets/` and `src/utils/build/` paths.

**Fix:** Bulk path update to `src/systems/assets/` and `src/systems/build/` in `tests/unit/`.

**Commit:** `fix(tests): align stale asset and build test import paths`

### 4.0c — `resolveRouteAssetPreloads` stale counts

**Issue:** Tests hard-coded 20/21 entry counts; `sharedAssetPreloads.json` catalog grew to 44 entries.

**Fix:** Assert lengths from `sharedAssetPreloads.dashboardMenuIcons.length` instead of magic numbers.

**Commit:** `fix(tests): use catalog-driven asset preload resolver expectations`

### 4.0d — Route chain path drift

**Issue:** Tests used `/dashboard/settings/privacy-security`, which no longer exists in `routeConfig.json` (chain length 1).

**Fix:** Use `/dashboard/analytics` (parent `/dashboard` + child route still in config).

**Commit:** `fix(tests): update route chain assertions for current routeConfig`

### How tested

```bash
npm run test:unit -- --run tests/unit/routeComponentPrefetch.test.js tests/unit/hreflangTags.test.js tests/unit/routerExports.test.js tests/unit/routeAssetPrefetch.test.js   # 24 passed
npm run test:unit -- --run tests/unit/resolveRouteAssetPreloads.test.js tests/unit/routeChain.test.js tests/unit/routeNavigation.test.js   # 9 passed
npm run test:unit -- --run tests/unit/assetMapBuildValidation.test.js tests/unit/performanceTrackerGuards.test.js   # pass
```

### Known remaining failures (not 4.0 scope)

- `jsonConfigValidator.test.js` — 3 production-config tests fail because `/home` route (index 40) lacks `section` and `supportedRoles` in `routeConfig.json` (Phase 6 config fix)

---

## Phase 4.1 — Routing core symbol renames (2026-06-16)

**Master plan:** Phase 4, batch 1 — routing core methods and guard result shape  
**Audit reference:** [route-naming-audit-batch-1.md](./route-naming-audit-batch-1.md)

### What changed

**`routeGuards.js`**
- `guardCheckUserRole` → `guardCheckRouteUserRole`
- Guard result shape: `allow` → `isNavigationAllowed`, `redirectTo` → `redirectTargetPath`, `reason` → `blockReason`
- Removed deprecated `guardCheckRouteEnabled` alias (use `guardCheckRouteEnvironmentAccess`)

**`routeAliasResolver.js`**
- `routeConfigMatchesPath` → `doesRouteConfigMatchPath`
- Internal `register` → `registerPathClaim` in path-claim collectors

**`routeResolver.js`**
- `matchWildcardRoute` → `isPathMatchingWildcardRoute` (module-private)

**`routeNavigation.js`**
- `snapshotRouteConfig` → `createRouteConfigSnapshot` (module-private)

Updated consumers: `createAppRouter.js`, `index.js`, 10 unit test files.

### How tested

```bash
rg "guardCheckUserRole|guardCheckRouteEnabled|routeConfigMatchesPath|matchWildcardRoute|snapshotRouteConfig" src/ tests/   # zero hits
npm run test:unit -- --run tests/unit/routeGuards.test.js tests/unit/routeAliases.test.js tests/unit/routeChain.test.js tests/unit/routeNavigation.test.js   # 52 passed (10 files)
npm run build   # succeeds
```

### Suggested commit

```
refactor(routing): rename routing core guard and resolver symbols
```

---

## Phase 4.2 — Router orchestration and prefetch symbol renames (2026-06-16)

**Master plan:** Phase 4, batch 2 — createAppRouter, preloader, resource loader, composable  
**Audit reference:** [route-naming-audit-batch-1.md](./route-naming-audit-batch-1.md)

### What changed

**`createAppRouter.js`**
- `generateRoutesFromConfig` → `buildVueRouterRecordsFromConfiguration`
- `loadViaGlob` → `loadRouteComponentViaGlob`

**`routeNavigationResourceLoader.js`**
- `startCurrentSectionResourceLoads` → `loadCurrentSectionResources`
- Default log labels updated to match renamed file

**`routeComponentPreloader.js`**
- Removed duplicate `createRoutePrefetchIntentHandler` export (canonical handler lives in `useRoutePrefetch.js`)
- Log file labels: `routeComponentPrefetch.js` → `routeComponentPreloader.js`

**`composables/useRoutePrefetch.js`**
- Composable API: `prefetchRoute` → `prefetchRouteComponent`, `prefetchOnIntent` → `prefetchRouteOnIntent`
- Component-only intent handler inlined as private `createComponentPrefetchOnIntentHandler`

Updated: `routeGuards.js` comments, `index.js` exports, `routeNavigationData.test.js`, `useRoutePrefetch.test.js`, `routeComponentPrefetch.test.js`.

Hook extraction (`registerRouteBeforeEachGuard`, etc.) deferred — not required for filename/symbol alignment.

### How tested

```bash
rg "generateRoutesFromConfig|loadViaGlob|startCurrentSectionResourceLoads|prefetchOnIntent" src/ tests/   # zero hits
npm run test:unit -- --run tests/unit/useRoutePrefetch.test.js tests/unit/routeComponentPrefetch.test.js tests/unit/routeNavigationData.test.js tests/unit/routerExports.test.js   # 22 passed
npm run build   # succeeds
```

### Suggested commit

```
refactor(routing): rename router orchestration and prefetch symbols
```

---

## Phase 4.3 — Cross-system symbol renames (2026-06-16)

**Master plan:** Phase 4, batch 3 — assets, sections, i18n  
**Audit reference:** [route-naming-audit-batch-1.md](./route-naming-audit-batch-1.md), [route-naming-audit-batch-2.md](./route-naming-audit-batch-2.md)

### What changed

**`routeAssetPreloadResolver.js`**
- Local names: `ref` → `assetPreloadReference`, `refKeys` → `assetPreloadReferenceKeys`, `fromRefs` → `preloadsFromReferences`, `inline` → `inlineAssetPreloads`, `rest` → `routeWithoutPreloadReference`, `key` → `referenceKey`, `entries` → `catalogEntries`

**`routeSectionAssetPreloadEntries.js`**
- Internal names: `byKey` → `entriesByDedupeKey`, `cached` → `cachedSectionRollup`, `entry` → `sectionAssetRollup`, `key` → `dedupeKey`
- Log file labels updated to `routeSectionAssetPreloadEntries.js`
- Exported `getAssetPreloadEntriesForSection` kept (high blast radius — filename already renamed in Phase 3c)

**`sectionPreloadOrchestrator.js`**
- `getRoutePreloadPlan` return shape: `identifiers`/`resolved` → `preloadSectionIdentifiers`/`resolvedSectionNames`
- Local names: `params` → `authPreloadCheckParams`, `err` → `preloadError`, `entry` → `sectionStatusEntry`, `promises` → `preloadPromises`

**`localeManager.js`**
- Module state: `localeRouter` → `registeredLocaleRouter`
- Locals: `tempLocale` → `temporaryPageLocale`

**Consumers updated:** `createAppRouter.js`, `main.js`, `updateUrlWithLocale.test.js`

**`DashboardSharedSidebar.vue`** — no changes; audit targets (`isMenuItemRouteActive`, `updateVisibleMenuItems`, full height variable names) already aligned.

### How tested

```bash
npm run test:unit -- --run tests/unit/resolveRouteAssetPreloads.test.js tests/unit/getAssetPreloadEntriesForSection.test.js tests/unit/sectionPreloadOrchestrator.test.js tests/unit/updateUrlWithLocale.test.js   # 17 passed
npm run build   # succeeds
```

### Suggested commit

```
refactor(routing): rename cross-system preload and locale symbols
```

---

## Phase 4.4 — Auth popup inject key rename (2026-06-16)

**Master plan:** Phase 4, item 6 — auth popup inject keys  
**Audit reference:** [route-naming-audit-batch-4.md](./route-naming-audit-batch-4.md)

### What was broken

Auth views used the inject key `popupNavHandler`, which was too generic and did not match the route-navigation intent described in the naming audit.

### Why it happened

The key was named early in popup auth work before the route cleanup naming convention was applied.

### What changed

Renamed inject key and local variable **`popupNavHandler` → `popupRouteNavigationHandler`** in all auth views that consume it:

- `AuthLogIn.vue`
- `AuthSignUp.vue`
- `AuthConfirmEmail.vue`
- `AuthLostPassword.vue`
- `AuthResetPassword.vue`
- `AuthSignUpOnboarding.vue`

**Note:** `ProfileLoginPopup.vue` (provider) is not present in this workspace checkout; when that file is added or synced, its `provide()` call must use `'popupRouteNavigationHandler'` to match these consumers.

### How tested

```bash
rg popupNavHandler src/   # zero hits
npm run build             # succeeds
```

### Suggested commit

```
refactor(auth): rename popup route navigation inject key
```

---

## Phase 4.5 — Batch 4 triage and remaining symbol renames (2026-06-16)

**Master plan:** Phase 4 exit — triage remaining `type: method` / `type: name` from batch 4  
**Audit reference:** [route-naming-audit-batch-4.md](./route-naming-audit-batch-4.md)

### What changed

**Adopted renames (Phase 4.5):**
- `NavigationDropdown.vue` — `handleMenuClick`/`handleSubmenuClick` → `handleNavigationMenuClick`/`handleNavigationSubmenuClick`; click params `e` → `clickEvent`
- `AuthConfirmEmail.vue` — `loginQuery` → `postConfirmLoginQuery`
- `TwitterAuthPage.vue` — `errorParam` → `oauthErrorQueryParam`
- `LanguageSwitcher.vue` — `metaPre`/`winPre` → `routeMetaPreloadSections`/`windowPreloadSections`; `onChange(ev)` → `onChange(changeEvent)`
- `SettingsLanguageField.vue` — `metaPre`/`winPre` → `routeMetaPreloadSections`/`windowPreloadSections`

**Triage outcomes (batch 4 audit updated):**
| Outcome | Count | Examples |
|---------|-------|----------|
| **done** (prior phases + 4.5) | 24 | popup inject keys, NavDropdown filename, sidebar overflow heights |
| **deferred → Phase 5** | 7 | Auth `*Page.vue` filename renames |
| **deferred** (missing file / low value) | 12 | `ProfileLoginPopup.vue` provider symbols; sidebar catch-block params |
| **dropped** | 1 | `ShopPage.preloadDashboard` (not in codebase) |

**Batches 1–3:** Remaining `type: method` / `type: name` entries deferred as low-value or build-script locals unless already covered by Phases 4.1–4.3. Full batch-4 audit file is the Phase 4 consumer-template exit record.

### How tested

```bash
rg "handleMenuClick|handleSubmenuClick|loginQuery|errorParam|metaPre|winPre" src/   # zero hits (log strings excepted)
npm run build   # succeeds
```

### Suggested commit

```
refactor(routing): triage batch 4 symbols and rename remaining adopts
```

---

## Phase 5 — Auth route page naming alignment (2026-06-16)

**Master plan:** Phase 5 — template page renames  
**Audit reference:** [route-naming-audit-batch-4.md](./route-naming-audit-batch-4.md)

### What was already in place

Auth **route entry points** under `src/dev/templates/auth/page/` were already `*Page.vue` wrappers (`LoginPage.vue`, `SignUpPage.vue`, etc.), and [routeConfig.json](../../src/router/routeConfig.json) already pointed at `@/dev/templates/auth/page/...`. No `git mv` was required for the route layer.

### Policy: `views/` unchanged

Per naming convention §4 and [UI_REFACTOR_CHANGELOG.md](../tasks/UI_REFACTOR_CHANGELOG.md), **`views/Auth*.vue` are screen compositions** (embedded by page wrappers and future popup auth), not route-level templates. They keep the `Auth*` filename in Phase 5.

### What changed

- **Tests** — updated stale `src/templates/auth/` and `@/templates/auth/` references to `src/dev/templates/auth/` and `@/dev/templates/auth/` in:
  - `componentTranslationLoads.test.js`
  - `routeComponentPathValidator.test.js` (removed silent skip when LoginPage missing)
  - `routeComponentPrefetch.test.js`
  - `jsonConfigValidator.test.js`
- **componentTranslationLoads.test.js** — replaced missing `src/assets/data/menuItems.js` with `src/config/dashboardSidebarMenuItems.js`
- **Docs** — [routeConfig.schema.md](../../src/router/routeConfig.schema.md) example now shows `@/dev/templates/auth/page/role/LoginPage.vue`
- **Audit** — batch 4 auth `type: filename` entries marked **done** at route page layer

### Deferred

- `ProfileLoginPopup.vue` not in workspace checkout — when synced, import from `views/Auth*.vue`, not `page/*Page.vue` wrappers

### How tested

```bash
rg "src/templates/auth|@/templates/auth" tests/   # zero hits
npm run test:unit -- --run tests/unit/componentTranslationLoads.test.js tests/unit/routeComponentPathValidator.test.js tests/unit/routeComponentPrefetch.test.js
npm run build
```

### Suggested commit

```
refactor(auth): align tests with dev auth page paths and close naming audit
```

---

## Phase 6 — Router config and template path fixes (2026-06-16)

**Master plan:** Phase 6 — folder structure alignment  
**Audit reference:** [folder-structure-audit-router.md](./folder-structure-audit-router.md) Issues 4–12, 15

### What changed

**`/home` route config (Issue 11)** — added `section`, `supportedRoles`, `requiresAuth`, `enabled`, and `preLoadSections` so production config validation passes.

**Dev/demo pages → `dev/templates/dev/` (Issues 6, 7, 9, 12)**
- `DashboardDevPlaygroundPage.vue` from `dashboard/role/`
- `SocialLinkingDemoPage.vue`, `DemoPage.vue` from `demo/`
- `DatePickerShowcasePage.vue` from `components/forms/date-picker/`
- `DemoDropdownsPage.vue` from `components/ui/dropdowns/demo/`

**Dashboard feature pages → `dashboard/shared/` (Issues 4, 5)**
- `DashboardAnalyticsPage.vue` from `analytics/`
- `EditProfilePage.vue` from `edit-profile/`

**Plan route page (Issue 8)** — `plan/Plan.vue` → `misc/PlanPage.vue`

**`routeConfig.json`** — all above routes updated to new `@/dev/templates/...` paths; zero routes point at `@/components/`.

**Glob alignment (Issue 15)** — removed unused `@/templates/**/*.vue` from [routeComponentLoader.js](../../src/systems/routing/routeComponentLoader.js); routes resolve via `@/dev/**`.

**Tests** — updated fixture paths in `jsonConfigValidator.test.js`, `routeComponentPathValidator.test.js`, `routeComponentPrefetch.test.js`.

### How tested

```bash
rg "componentPath.*@/components" src/router/routeConfig.json   # zero hits
npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js tests/unit/routeComponentPathValidator.test.js tests/unit/routeComponentPrefetch.test.js   # 28 passed
npm run build   # succeeds
```

### Suggested commit

```
refactor(routing): relocate route templates to canonical dev and dashboard folders
```

---

## Phase 7 — Documentation audit (2026-06-16)

**Master plan:** Phase 7 — align routing docs with post-refactor code  
**Reports:** [loose-route-code-scan.md](./loose-route-code-scan.md) Issue 10, [systems-routing-audit.md](./systems-routing-audit.md) Issue 6

### What changed

**Canonical doc** — rewrote [RoutingExplained.md](./RoutingExplained.md):
- Current folder layout (`createAppRouter.js`, `config/sharedAssetPreloads.json`, `@/dev/templates/`, composables prefetch)
- Guard result shape `{ isNavigationAllowed, redirectTargetPath, blockReason }`
- Component glob `@/components/**` + `@/dev/**` (no `@/templates/**`)
- Navigation lifecycle symbol names after Phases 3–4
- Replaced “Planned cleanup” with Phases 1–6 completion summary
- Updated import map, file ownership, and agent maintenance checklist

**Removed** stale routing READMEs (master plan: docs live only in RoutingExplained.md):
- `src/router/README.md`
- `src/systems/routing/README.md`

**Redirect** — [docs/instruction/RoutingExplained.md](../instruction/RoutingExplained.md) now points to canonical doc.

**Updated** — [route-code-index.md](./route-code-index.md) (paths, test status, config location), [README.md](../../README.md) API table.

### How tested

```bash
rg "utils/route" docs/route-tasks/ tests/ src/router/ src/systems/routing/   # zero hits in active routing docs
rg "router/README|routing/README" src/   # zero hits
npm run build   # succeeds
```

### Suggested commit

```
docs(routing): align RoutingExplained with post-refactor architecture
```

---

## Phase A prep — Route test infrastructure (2026-06-18)

**Plan:** [route-test-plan.md](../route-test-plan.md) Phase A  
**Master plan:** Phase 8 — Route test coverage (prep)

### What changed

- Added `tests/helpers/routeFixtures.js` — shared `makeRoute()`, `makeGuardContext()`, production config loaders
- Added `tests/unit/routeConfig.integrity.test.js` — 25 production `routeConfig.json` integrity checks (plan §0)
- Updated `route-test-plan.md` header — Phases A→G, run commands, sync instructions, post-refactor module names
- Updated `route-code-index.md` and `loose-route-code-scan.md` summary — reflect post-refactor paths/symbols
- Added Phase 8 section to `route-work-master-plan.md`

### How tested

```bash
npm run test:unit -- --run tests/unit/routeConfig.integrity.test.js   # 25 passed
npm run test:unit -- --run tests/unit/route   # 93 passed, 1 pre-existing timeout (routerLocaleInject)
```

---

## Phase A — Unblock and integrity (2026-06-19)

**Plan:** [route-test-plan.md](../route-test-plan.md) Phase A (§0, §30, §46)  
**Master plan:** Phase 8 — Route test coverage

### What was broken

Phase A prep added 25 production integrity checks but did not cover all plan §0 bullets (inheritance parent slugs, alias/redirectFrom collisions, locale-prefixed resolution, route-count baseline, schema warnings). Route validator coverage lived in `jsonConfigValidator.test.js` without the plan’s `jsonConfigValidator.route.test.js` layout or explicit tests for `buildRouteSlugIndex` and `collectPreloadSectionIdentifiers`.

### Why it happened

Work stopped after the initial integrity scaffold; remaining §0 items and §30 helper coverage were deferred to the phased test plan.

### What changed

| File | Change |
|------|--------|
| [`tests/unit/routeConfig.integrity.test.js`](../../tests/unit/routeConfig.integrity.test.js) | Expanded §0 from 25 → **36** `it()` cases: enabled baseline (B3), role `customComponentPath`, `inheritConfigFromParent` parent slugs, alias/redirectFrom collision checks, `hideLayout`, redirect-chain depth, locale-prefixed resolution, route-count baseline (`42`), schema warnings, assetPreloadRef + asset map via `validateRouteConfig` |
| [`tests/unit/jsonConfigValidator.route.test.js`](../../tests/unit/jsonConfigValidator.route.test.js) | **New** — route-focused validator suite (26 tests): `collectKnownSectionNames`, `buildRouteSlugIndex`, `resolvePreloadSectionIdentifier`, `collectPreloadSectionIdentifiers`, `validateRouteConfig` error shapes + production snapshot |
| [`tests/unit/jsonConfigValidator.test.js`](../../tests/unit/jsonConfigValidator.test.js) | **Removed** — route tests moved to `jsonConfigValidator.route.test.js` (no duplicate runs) |

Stale import sweep: `rg "utils/route" tests/` — **zero hits** (Phase 1 fix still holds).

### How tested

```bash
npm run test:unit -- --run tests/unit/routeConfig.integrity.test.js tests/unit/jsonConfigValidator.route.test.js   # 62 passed
npm run test:unit -- --run tests/unit/route   # 105 passed (17 files)
```

### Exit criteria (Phase A)

- [x] `validateRouteConfig(productionRoutes)` → `{ valid: true, errors: [] }`
- [x] All plan §0 integrity cases implemented (36 tests)
- [x] `jsonConfigValidator.route.test.js` covers each §30 exported route helper at least once
- [x] No test imports from dead `utils/route` paths

---

## Phase B — Core units (2026-06-19)

**Plan:** [route-test-plan.md](../route-test-plan.md) Phase B (§1–2, §12, §20–22, §43)  
**Master plan:** Phase 8 — Route test coverage  
**Test folder:** `tests/routeTest/` (new route tests live here, not `tests/unit/`)

### What was broken

Core routing modules (`routeConfigLoader`, `routeResolver`, `routeDefaults`, alias resolver, env/admin access, inheritance) had partial coverage scattered in `tests/unit/` with no mocked fixture set for isolated resolver/inheritance tests.

### Why it happened

Phase A focused on production integrity only; core unit tests were deferred to Phase B per the test plan.

### What changed

| File | Change |
|------|--------|
| [`tests/helpers/routeFixtures.js`](../../tests/helpers/routeFixtures.js) | Added `CANONICAL_ROUTE_FIXTURES`, `cloneRouteFixtures()`, `getCanonicalRouteFixtures()` for mocked unit tests |
| [`tests/routeTest/routeConfigLoader.test.js`](../../tests/routeTest/routeConfigLoader.test.js) | **New** — loader cache, load, asset preload merge (§1) |
| [`tests/routeTest/routeResolver.test.js`](../../tests/routeTest/routeResolver.test.js) | **New** — path resolve, exact resolve, component path, chain, asset preload (§2) |
| [`tests/routeTest/routeDefaults.test.js`](../../tests/routeTest/routeDefaults.test.js) | **New** — all default slug getters + `ROUTE_DEFAULTS` (§20) |
| [`tests/routeTest/routeInheritance.test.js`](../../tests/routeTest/routeInheritance.test.js) | **New** — inheritance matrix with mocked config (§43) |
| [`tests/routeTest/routeAliases.test.js`](../../tests/routeTest/routeAliases.test.js) | **New** — alias/redirectFrom helpers including `collectRoutePathClaims` (§12) |
| [`tests/routeTest/routeEnvAccess.test.js`](../../tests/routeTest/routeEnvAccess.test.js) | **New** — env access validation + MODE stub (§21) |
| [`tests/routeTest/routeAdminAccess.test.js`](../../tests/routeTest/routeAdminAccess.test.js) | **New** — admin context shapes (§22) |

Phase A files remain in `tests/routeTest/`: `routeConfig.integrity.test.js`, `jsonConfigValidator.route.test.js`.

### How tested

```bash
npm run test:unit -- --run tests/routeTest   # 9 files, 127 passed
```

### Exit criteria (Phase B)

- [x] Every export in `routeConfigLoader`, `routeResolver`, `routeDefaults`, `routeAliasResolver`, `routeEnvAccess`, `routeAdminAccess` has ≥1 happy + ≥1 edge test
- [x] Inheritance matrix covers auth merge, child override, assetPreload concat, nested chain
- [x] Tests use `getRouteConfiguration()` mock via canonical fixtures (not production JSON) for resolver/inheritance

---

## Phase C — Guards (2026-06-19)

**Plan:** [route-test-plan.md](../route-test-plan.md) Phase C (§3–10, §44, §48)  
**Master plan:** Phase 8 — Route test coverage  
**Test folder:** `tests/routeTest/`

### What was broken

Guard coverage lived in a few monolithic `tests/unit/` files (`routeGuards.test.js`, `routeGuardsS6.test.js`, `guardLoopHistoryClear.test.js`) without the plan’s split layout or explicit full-chain ordering tests.

### Why it happened

Phase B focused on resolver/loader units; guard split was deferred to Phase C.

### What changed

| File | Change |
|------|--------|
| [`tests/helpers/routeFixtures.js`](../../tests/helpers/routeFixtures.js) | Added `KYC_GUARD_ROUTE`, `ONBOARDING_GUARD_ROUTE`, `DASHBOARD_DEPS_GUARD_ROUTE`, `resetGuardModuleState()` |
| [`tests/routeTest/routeGuards.auth.test.js`](../../tests/routeTest/routeGuards.auth.test.js) | **New** — `guardCheckAuthentication` (§6) |
| [`tests/routeTest/routeGuards.role.test.js`](../../tests/routeTest/routeGuards.role.test.js) | **New** — `guardCheckRouteUserRole` (§8) |
| [`tests/routeTest/routeGuards.dependencies.test.js`](../../tests/routeTest/routeGuards.dependencies.test.js) | **New** — onboarding → KYC ordering, L6 (§9) |
| [`tests/routeTest/routeGuards.loop.test.js`](../../tests/routeTest/routeGuards.loop.test.js) | **New** — loop prevention + redirect markers (§4, §10) |
| [`tests/routeTest/routeGuards.env.test.js`](../../tests/routeTest/routeGuards.env.test.js) | **New** — `guardCheckRouteEnvironmentAccess` (§5) |
| [`tests/routeTest/routeGuards.admin.test.js`](../../tests/routeTest/routeGuards.admin.test.js) | **New** — `guardCheckRouteAdminAccess` (§7) |
| [`tests/routeTest/routeGuards.test.js`](../../tests/routeTest/routeGuards.test.js) | **New** — `runAllRouteGuards` chain order + S6 exception handling (§3) |

Legacy `tests/unit/routeGuards*.test.js` and `guardLoopHistoryClear.test.js` remain for now (duplicate coverage); migrate/remove in a later cleanup PR.

### How tested

```bash
npm run test:unit -- --run tests/routeTest   # 16 files, 182 passed
```

### Exit criteria (Phase C)

- [x] Each guard export: ≥1 allow + ≥1 block test
- [x] Full chain test proves guard order: loop → env → auth → admin → role → deps
- [x] Onboarding → KYC dependency ordering covered (creator vs non-creator paths)

---

*Add a new section above this line for each completed phase.*
