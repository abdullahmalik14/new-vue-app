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

*Add a new section above this line for each completed phase.*
