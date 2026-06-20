# Assets cleanup — change log

**Purpose:** Record what was changed during [docs/ASSET_PLAN.md](./docs/ASSET_PLAN.md) execution. Audits stay as proposals; this file is the **done work** log.

**Reference:** [folder-structure-audit-assets.md](./folder-structure-audit-assets.md) · [asset-code-index.md](./asset-code-index.md)

---

## Phase 0 — Fix stale test imports (P0)

**Master plan:** ASSET_PLAN P0 item 1  
**Audit reference:** [folder-structure-audit-assets.md](./folder-structure-audit-assets.md) Issue 23  
**Scope:** Import path fixes only. No module renames, no file moves, no runtime behaviour changes.

### Issue 23 — Tests pointed at deleted `utils/assets/` folder

**What was broken:** Seven test and browser-harness files still imported `src/utils/assets/*`. That folder was removed when asset code migrated to `src/systems/assets/`. Vitest and manual browser tests would fail module resolution on those paths.

**Why it happened:** Core modules were migrated to `systems/assets/` before all test import paths were updated. Most of the suite (~60+ files) already used the new paths; a small handler/browser subset was left behind.

**How it was fixed:**

| File | Change |
|------|--------|
| [`tests/assetMapper.test.js`](../../tests/assetMapper.test.js) | `../src/utils/assets/assetLibrary.js` → `../src/systems/assets/assetLibrary.js` (import + example comment) |
| [`tests/assetLibrary.test.js`](../../tests/assetLibrary.test.js) | Same path update (import + example comment) |
| [`tests/handler/AssetHandler.critical.test.js`](../../tests/handler/AssetHandler.critical.test.js) | `assetsHandlerNew.js` path → `systems/assets/` |
| [`tests/handler/AssetHandler.validation.test.js`](../../tests/handler/AssetHandler.validation.test.js) | Same |
| [`tests/handler/AssetHandler testing code.js`](../../tests/handler/AssetHandler%20testing%20code.js) | Same |
| [`tests/AssetHandler.browser-test.html`](../../tests/AssetHandler.browser-test.html) | Dynamic import paths + error hint |
| [`tests/handler/AssetHandler.browser-test (1).html`](../../tests/handler/AssetHandler.browser-test%20(1).html) | Static import path |

### How it was tested

```bash
npm run test:unit -- tests/handler/AssetHandler.critical.test.js tests/handler/AssetHandler.validation.test.js

rg "utils/assets" tests/
```

**Result:** 74 tests passed (2 handler vitest files); zero stale `utils/assets` imports under `tests/`.

### Phase 0 exit

Asset unit/handler tests resolve migrated modules; ready for Phase 1 filename alignment.

**Suggested commit:**

```
fix(tests): point asset tests at systems/assets after migration
```

---

## Phase 1 — Filename alignment (P1)

**Master plan:** ASSET_PLAN structure cleanup — align prefetch/resolver filenames with naming audit batch 2  
**Audit reference:** [folder-structure-audit-assets.md](./folder-structure-audit-assets.md) Issues 1 & 3 · [asset-naming-audit-batch-2.md](./asset-naming-audit-batch-2.md)  
**Scope:** `git mv` renames + import updates only. Files were already in `systems/assets/`; logic unchanged.

### Issues 1 & 3 — Module names did not match approved convention

**What was broken:** Intent prefetch and route preload ref expansion lived in the correct layer (`systems/assets/`) but under non-standard filenames: `routeAssetPreloader.js` and `routeAssetPreloadResolver.js`. Docs, audits, and `notes.md` expect `routeAssetPrefetch.js` and `resolveRouteAssetPreloads.js`.

**Why it happened:** An interim rename during an earlier routing/assets refactor used `*Preloader`/`*Resolver` suffixes before the asset naming audit finalized approved names.

**How it was fixed:**

| Before | After |
|--------|-------|
| `src/systems/assets/routeAssetPreloader.js` | `src/systems/assets/routeAssetPrefetch.js` |
| `src/systems/assets/routeAssetPreloadResolver.js` | `src/systems/assets/resolveRouteAssetPreloads.js` |

**Consumers updated:**

| File | Change |
|------|--------|
| [`src/systems/assets/index.js`](../../src/systems/assets/index.js) | Barrel export paths |
| [`src/systems/routing/index.js`](../../src/systems/routing/index.js) | Re-export import |
| [`src/systems/routing/routeConfigLoader.js`](../../src/systems/routing/routeConfigLoader.js) | Resolver import |
| [`src/systems/build/jsonConfigValidator.js`](../../src/systems/build/jsonConfigValidator.js) | Resolver import |
| [`src/composables/useRoutePrefetch.js`](../../src/composables/useRoutePrefetch.js) | Prefetch import |
| 9 test files under `tests/unit/`, `tests/routeTest/`, `tests/sectionTest/` | Import paths + mock paths + file header comments |

### How it was tested

```bash
npm run test:unit -- --run \
  tests/unit/routeAssetPrefetch.test.js \
  tests/routeTest/routeAssetPrefetch.test.js \
  tests/unit/resolveRouteAssetPreloads.test.js \
  tests/routeTest/resolveRouteAssetPreloads.test.js \
  tests/unit/useRoutePrefetch.test.js \
  tests/routeTest/useRoutePrefetch.test.js \
  tests/sectionTest/routeAssetPrefetch.section.test.js

rg "routeAssetPreloader|routeAssetPreloadResolver" src/ tests/
```

**Result:** 7 test files, 22 tests passed; zero old filename references in `src/` or `tests/`.

### Phase 1 exit

Prefetch and resolver modules use approved filenames; imports consistent across app and tests.

**Suggested commit:**

```
refactor(assets): align prefetch module filenames with naming audit
```

---

## Phase 2 — Create `assetPolicy.js` (P1)

**Master plan:** ASSET_PLAN P1 item 4  
**Audit reference:** [folder-structure-audit-assets.md](./folder-structure-audit-assets.md) Issues 2 & 10 · [docs/AI_GUIDE.md](./docs/AI_GUIDE.md)  
**Scope:** New policy entry point; move URL allow-list implementation; re-export validation helpers. No change to allow-list rules or validation logic.

### Issue 2 — Missing single asset policy entry point

**What was broken:** URL preload policy lived in `assertAllowedPreloadUrl.js` and route preload validation in `validateRouteAssetPreloadFlags.js` with no unified module. `notes.md` and AI_GUIDE define `assetPolicy.js` as the policy layer entry point (Issue 2).

**Why it happened:** Policy grew incrementally during preload security hardening (S-03/S-04) and route config validation (M-04) without a consolidation pass after the `utils/assets/` → `systems/assets/` migration.

**How it was fixed:**

| File | Change |
|------|--------|
| [`src/systems/assets/assetPolicy.js`](../../src/systems/assets/assetPolicy.js) | **New** — URL allow-list (`assertAllowedAssetUrl`); `assertAllowedPreloadUrl` alias; re-exports validation symbols from `validateRouteAssetPreloadFlags.js`; `validateAssetPreloadEntry` alias for `validateAssetPreloadEntryShape` |
| [`src/systems/assets/assertAllowedPreloadUrl.js`](../../src/systems/assets/assertAllowedPreloadUrl.js) | Reduced to deprecated shim re-exporting from `assetPolicy.js` |
| [`src/systems/assets/assetPreloader.js`](../../src/systems/assets/assetPreloader.js) | Import URL guard from `assetPolicy.js` |
| [`src/systems/assets/assetLibrary.js`](../../src/systems/assets/assetLibrary.js) | Same |
| [`src/systems/assets/index.js`](../../src/systems/assets/index.js) | Export policy symbols from `assetPolicy.js` (includes `assertAllowedAssetUrl`) |
| [`src/systems/routing/routeConfigLoader.js`](../../src/systems/routing/routeConfigLoader.js) | `validateRouteAssetPreloadFlags` from `assetPolicy.js` |
| [`src/systems/build/jsonConfigValidator.js`](../../src/systems/build/jsonConfigValidator.js) | Validation imports from `assetPolicy.js` |

**Not changed (implementation retained):**

- [`validateRouteAssetPreloadFlags.js`](../../src/systems/assets/validateRouteAssetPreloadFlags.js) — still holds validation implementation; re-exported through `assetPolicy.js`. Full merge into one file deferred to avoid a large diff with no behaviour benefit.

**Public API additions:**

- `assertAllowedAssetUrl()` — canonical URL guard name (same logic as former standalone module)
- `validateAssetPreloadEntry()` — alias for `validateAssetPreloadEntryShape()`

### How it was tested

```bash
npm run test:unit -- --run \
  tests/unit/assertAllowedPreloadUrl.test.js \
  tests/unit/preloadUrlGuard.test.js \
  tests/unit/validateRouteAssetPreloadFlags.test.js \
  tests/routeTest/validateRouteAssetPreloadFlags.test.js \
  tests/unit/assetMapBuildValidation.test.js \
  tests/unit/assetsIndexExports.test.js
```

**Result:** 6 test files, 23 tests passed. Deprecated `assertAllowedPreloadUrl.js` shim still satisfies existing test dynamic imports.

### Phase 2 exit

`assetPolicy.js` exists as the policy entry point; preloader, library, routing loader, and build validator import policy from one module; barrel exports updated. Ready for Phase 3 handler rename.

**Suggested commit:**

```
refactor(assets): add assetPolicy.js as unified preload policy entry
```

---

## Phase 3 — Rename `assetsHandlerNew.js` → `assetHandler.js` (P1)

**Master plan:** ASSET_PLAN P1 item 5  
**Audit reference:** [folder-structure-audit-assets.md](./folder-structure-audit-assets.md) Issue 5 · [asset-naming-audit-batch-1.md](./asset-naming-audit-batch-1.md)  
**Scope:** `git mv` rename + import updates only. `AssetHandler` class logic unchanged.

### Issue 5 — Handler filename used legacy `New` suffix and plural `assets`

**What was broken:** The DOM script-loading class lived in `assetsHandlerNew.js` — inconsistent with sibling modules (`assetLibrary.js`, `assetPreloader.js`, `assetHandlerFactory.js`) and the naming convention (`AssetHandler` in `assetHandler.js`).

**Why it happened:** The file kept a transitional `New` suffix from an older handler implementation during the assets system migration.

**How it was fixed:**

| Before | After |
|--------|-------|
| `src/systems/assets/assetsHandlerNew.js` | `src/systems/assets/assetHandler.js` |

**Consumers updated:**

| File | Change |
|------|--------|
| [`src/systems/assets/assetHandlerFactory.js`](../../src/systems/assets/assetHandlerFactory.js) | Default import path |
| [`src/systems/interactions/scriptAvailabilityChecker.js`](../../src/systems/interactions/scriptAvailabilityChecker.js) | Default import path |
| [`src/dev/templates/dashboard/creator/CreatorDashboardOverviewPage.vue`](../../src/dev/templates/dashboard/creator/CreatorDashboardOverviewPage.vue) | Default import path |
| [`tests/handler/AssetHandler.critical.test.js`](../../tests/handler/AssetHandler.critical.test.js) | Test import |
| [`tests/handler/AssetHandler.validation.test.js`](../../tests/handler/AssetHandler.validation.test.js) | Test import |
| [`tests/handler/AssetHandler testing code.js`](../../tests/handler/AssetHandler%20testing%20code.js) | Test import |
| [`tests/AssetHandler.browser-test.html`](../../tests/AssetHandler.browser-test.html) | Dynamic import paths + error hint |
| [`tests/handler/AssetHandler.browser-test (1).html`](../../tests/handler/AssetHandler.browser-test%20(1).html) | Static import |

### How it was tested

```bash
npm run test:unit -- --run \
  tests/handler/AssetHandler.critical.test.js \
  tests/handler/AssetHandler.validation.test.js

rg "assetsHandlerNew" src/ tests/
```

**Result:** 74 tests passed; zero stale `assetsHandlerNew` references in `src/` or `tests/`.

### Phase 3 exit

Handler class file uses approved `assetHandler.js` name; factory, script checker, dashboard template, and handler tests import the new path. Ready for Phase 4 (`utils/preload.js` removal).

**Suggested commit:**

```
refactor(assets): rename assetsHandlerNew.js to assetHandler.js
```

---

## Upcoming (not started)

| Phase | ASSET_PLAN | Summary |
|-------|------------|---------|
| 4 | P1 | Remove `utils/preload.js`; use `preloadImage` |
| 5 | P1 | Extract `authAssetConfig.js` from six auth views |
| 6 | P2 | Store/composable symbol renames |
| 7 | P3 | Config/consumer cleanup (`settingConfig.js`, ImgBB flags) |
| 8 | P3 | Docs sync (`DEVELOPER_GUIDE.md`, `asset-code-index.md`) |

---

*End of log through Phase 3.*
