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

*Add a new section above this line for each completed phase.*
