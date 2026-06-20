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

## Phase 4 — Remove `utils/preload.js` (P1)

**Master plan:** ASSET_PLAN P1 item 7  
**Audit reference:** [folder-structure-audit-assets.md](./folder-structure-audit-assets.md) Issue 17  
**Scope:** Delete legacy util; switch two Vue consumers to `preloadImage` from the assets system. Fire-and-forget preload behaviour preserved.

### Issue 17 — Duplicate icon preloading in `utils/preload.js`

**What was broken:** `src/utils/preload.js` exposed `preloadIcons()` using raw `new Image()` with no URL policy, no preload-store tracking, and console-only logging. The same concern is handled by `systems/assets/assetPreloader.js` (`preloadImage`) with allow-list checks via `assetPolicy.js`.

**Why it happened:** Pre-dates the assets system migration; two components (`Cart.vue`, `UploadThumbnailPreview.vue`) were never updated when `assetPreloader.js` became canonical.

**How it was fixed:**

| File | Change |
|------|--------|
| [`src/components/ui/cart/Cart.vue`](../../src/components/ui/cart/Cart.vue) | `preloadIcons([...])` → `urls.forEach((url) => preloadImage(url))`; import from `@/systems/assets/assetPreloader.js` |
| [`src/dev/components/media/uploader/parts/UploadThumbnailPreview.vue`](../../src/dev/components/media/uploader/parts/UploadThumbnailPreview.vue) | Same pattern for `props.preloadImages` |
| [`src/utils/preload.js`](../../src/utils/preload.js) | **Deleted** |

**Behaviour note:** Cart/thumbnail icon URLs (ImgBB hosts) remain allowed via legacy host entry in `assetPolicy.js` (`i.ibb.co`). Preloads now go through URL policy and `usePreloadStore` deduplication instead of silent `Image()` construction.

### How it was tested

```bash
npm run test:unit -- --run tests/unit/preloadUrlGuard.test.js

rg "utils/preload|preloadIcons" src/
```

**Result:** 2 tests passed; zero stale imports under `src/`. Manual smoke: cart qty icons and upload thumbnail chrome in dev (recommended).

### Phase 4 exit

No legacy `utils/preload.js`; all component icon warmups use the assets preloader. Ready for Phase 5 (`authAssetConfig.js` extraction).

**Suggested commit:**

```
refactor(assets): remove utils/preload.js in favor of preloadImage
```

---

## Phase 5 — Extract shared auth asset config (P1)

**Master plan:** ASSET_PLAN P1 item 8  
**Audit reference:** [folder-structure-audit-assets.md](./folder-structure-audit-assets.md) Issue 22  
**Scope:** DRY duplicated `assetsConfig` arrays across auth templates. Same asset entries and load order; per-view `createAssetHandler` options unchanged.

### Issue 22 — Six auth views each defined inline `assetsConfig`

**What was broken:** Every auth template duplicated the same Cognito script + auth CSS + background image configuration (~25 lines each). Onboarding used a third variant (onboarding CSS + KYC background). Any flag or priority change required editing six files in sync.

**Why it happened:** Auth views were built independently before a shared assets config module existed under `systems/assets/`.

**How it was fixed:**

| File | Change |
|------|--------|
| [`src/systems/assets/authAssetConfig.js`](../../src/systems/assets/authAssetConfig.js) | **New** — `getAuthAssetConfig()`, `getAuthOnboardingAssetConfig()`, `getAuthAssetNames()` |
| [`AuthLogIn.vue`](../../src/dev/templates/auth/views/AuthLogIn.vue) | Import shared config |
| [`AuthSignUp.vue`](../../src/dev/templates/auth/views/AuthSignUp.vue) | Import shared config |
| [`AuthLostPassword.vue`](../../src/dev/templates/auth/views/AuthLostPassword.vue) | Import shared config |
| [`AuthConfirmEmail.vue`](../../src/dev/templates/auth/views/AuthConfirmEmail.vue) | Import shared config |
| [`AuthResetPassword.vue`](../../src/dev/templates/auth/views/AuthResetPassword.vue) | Import shared config |
| [`AuthSignUpOnboarding.vue`](../../src/dev/templates/auth/views/AuthSignUpOnboarding.vue) | Uses `getAuthOnboardingAssetConfig()` |

**Config variants preserved:**

| Function | Assets |
|----------|--------|
| `getAuthAssetConfig()` | `cognito-sdk`, `auth-styles`, `auth-bg` |
| `getAuthOnboardingAssetConfig()` | `cognito-sdk`, `onboarding-styles`, `kyc-bg` |

Each view still passes its own handler name to `createAssetHandler(..., { name: 'AuthLogin', debug: true })`.

### How it was tested

```bash
npm run test:unit -- --run \
  tests/handler/AssetHandler.critical.test.js \
  tests/handler/AssetHandler.validation.test.js

rg "Define assets configuration|cognito-sdk" src/dev/templates/auth/views/
```

**Result:** 74 handler tests passed; zero inline `assetsConfig` arrays remain in auth views. Manual smoke: login, signup, lost/reset password, confirm email, onboarding (recommended).

### Phase 5 exit

Auth asset loading config centralized in `systems/assets/`; templates import one source. Ready for Phase 6 (store/composable symbol renames).

**Suggested commit:**

```
refactor(assets): extract shared authAssetConfig for auth views
```

---

## Phase 6 — Store and composable symbol renames (P2)

**Master plan:** ASSET_PLAN P2 items 9–12  
**Audit reference:** [asset-naming-audit-batch-2.md](./asset-naming-audit-batch-2.md) · [folder-structure-audit-assets.md](./folder-structure-audit-assets.md) Issue 15  
**Scope:** Rename preload store actions and disambiguate combined route prefetch handler; add `useAssetPrefetch` composable. Deprecated aliases retained for one release.

### Issue — Store action names were ambiguous

**What was broken:** `usePreloadStore` used generic names (`addAsset`, `clearState`) that did not signal preload-specific intent. `clearState` in particular was easy to confuse with unrelated store resets.

**Why it happened:** Early preload store predated the expanded naming convention.

**How it was fixed:**

| File | Change |
|------|--------|
| [`src/stores/usePreloadStore.js`](../../src/stores/usePreloadStore.js) | `addAsset` → `addPreloadedAsset`; `clearState` → `clearPreloadState`; deprecated aliases kept |
| [`src/systems/assets/assetPreloader.js`](../../src/systems/assets/assetPreloader.js) | Calls `addPreloadedAsset` |
| [`src/systems/sections/sectionPreloader.js`](../../src/systems/sections/sectionPreloader.js) | Calls `clearPreloadState` |
| [`src/systems/build/appBuildHash.js`](../../src/systems/build/appBuildHash.js) | Calls `clearPreloadState` |
| 8 test files | Updated to canonical store action names |

### Issue — `createRoutePrefetchIntentHandler` name collision

**What was broken:** The same symbol name was used for component-only prefetch (routing) and combined component+asset prefetch (composable). Nav UI imports the combined handler but the name did not reflect that.

**Why it happened:** Handler evolved from component-only to combined without renaming.

**How it was fixed:**

| File | Change |
|------|--------|
| [`src/composables/useRoutePrefetch.js`](../../src/composables/useRoutePrefetch.js) | Canonical export `createCombinedRoutePrefetchIntentHandler`; `createRoutePrefetchIntentHandler` deprecated alias |
| [`AuthLogIn.vue`](../../src/dev/templates/auth/views/AuthLogIn.vue), [`AppFooter.vue`](../../src/components/layout/AppFooter.vue), [`DashboardSharedSidebar.vue`](../../src/dev/templates/dashboard/shared/DashboardSharedSidebar.vue) | Import combined handler |
| [`src/systems/routing/index.js`](../../src/systems/routing/index.js), [`src/router/index.js`](../../src/router/index.js) | Export both names (canonical + alias) |

### Issue 15 — Missing `useAssetPrefetch` composable

**What was broken:** Asset-only intent prefetch was only reachable through `useRoutePrefetch` (combined API). Naming docs list a dedicated `useAssetPrefetch.js`.

**How it was fixed:**

| File | Change |
|------|--------|
| [`src/composables/useAssetPrefetch.js`](../../src/composables/useAssetPrefetch.js) | **New** — wraps `prefetchSectionAssetsForRoute`, `createSectionAssetPrefetchIntentHandler`, `resetRouteAssetPrefetchCache` |

### How it was tested

```bash
npm run test:unit -- --run \
  tests/unit/usePreloadStore.test.js \
  tests/sectionTest/usePreloadStore.section.test.js \
  tests/unit/useRoutePrefetch.test.js \
  tests/routeTest/useRoutePrefetch.test.js \
  tests/routeTest/routerExports.test.js \
  tests/unit/appBuildHash.test.js \
  tests/unit/preloadUrlGuard.test.js
```

**Result:** 7 test files, 37 tests passed.

### Phase 6 exit

Preload store and route prefetch APIs use approved names; asset-only prefetch composable exists; deprecated aliases preserve backward compatibility. Ready for Phase 7 (config/consumer cleanup).

**Suggested commit:**

```
refactor(assets): rename preload store actions and prefetch handlers
```

---

## Phase 7 — Config and consumer cleanup (P3)

**Master plan:** ASSET_PLAN P3 items 13–14, Issue 21  
**Audit reference:** [folder-structure-audit-assets.md](./folder-structure-audit-assets.md) Issues 18 & 21  
**Scope:** Move settings config to `config/`; replace hardcoded menu icon URLs with asset flags; use `createAssetHandler` factory on creator dashboard overview.

### Issue 18 — `settingConfig.js` in wrong layer with hardcoded ImgBB URLs

**What was broken:** Settings navigation data lived in `src/assets/data/settingConfig.js` (JS module under static assets folder). Every menu item duplicated the same ImgBB icon URL inline (~20 copies).

**Why it happened:** Predates asset flag convention used by `dashboardSidebarMenuItems.js`.

**How it was fixed:**

| File | Change |
|------|--------|
| [`src/config/settingConfig.js`](../../src/config/settingConfig.js) | Moved from `assets/data/`; items use `iconFlag: "settings.menu.item"` |
| [`src/config/settingConfig.js`](../../src/config/settingConfig.js) | Added `resolveSettingConfigWithAssets()` — batch-resolves flags via `getAssetUrls` |
| [`src/config/assetMap.json`](../../src/config/assetMap.json) | Added `settings.menu.item` production URL (preserves prior ImgBB icon) |
| [`DashProfileSettings.vue`](../../src/components/ui/nav/dashboard/DashProfileSettings.vue) | Import from `@/config/settingConfig.js`; resolve icons on mount / role change |

**Out of scope this phase:** Profile header / edit-profile images in `DashProfileSettings.vue` template still use inline ImgBB URLs (separate flags can be added later).

### Issue 21 — Creator dashboard overview bypassed factory

**What was broken:** `CreatorDashboardOverviewPage.vue` instantiated `AssetHandler` directly with `new AssetHandler(...)` instead of the shared `createAssetHandler()` factory.

**Why it happened:** Page was added as a dev prototype before factory pattern was standardised.

**How it was fixed:**

| File | Change |
|------|--------|
| [`CreatorDashboardOverviewPage.vue`](../../src/dev/templates/dashboard/creator/CreatorDashboardOverviewPage.vue) | `createAssetHandler(assetConfigs, { maxConcurrent: 2 })` replaces direct constructor |

Section metadata → handler config mapping unchanged; factory still accepts pre-resolved `url` entries.

### How it was tested

```bash
npm run test:unit -- --run \
  tests/unit/assetMapBuildValidation.test.js \
  tests/unit/getAssetUrlsBatch.test.js \
  tests/unit/initAssetLibrary.test.js

rg "assets/data/settingConfig" src/
```

**Result:** 8 tests passed; zero imports from old `assets/data/settingConfig` path under `src/`. Manual smoke: dashboard settings panel + creator overview (recommended).

### Phase 7 exit

Settings config in `config/` layer with flag-based icons; creator overview uses asset handler factory. Ready for Phase 8 (docs sync).

**Suggested commit:**

```
refactor(assets): move settingConfig to config and use asset flags
```

---

## Upcoming (not started)

| Phase | ASSET_PLAN | Summary |
|-------|------------|---------|
| 8 | P3 | Docs sync (`DEVELOPER_GUIDE.md`, `asset-code-index.md`) |

---

*End of log through Phase 7.*
