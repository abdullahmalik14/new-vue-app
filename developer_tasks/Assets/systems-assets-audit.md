# Systems folder audit — assets

**Scope:** All asset-related code in `new-vue-app-main/src/` vs `notes.md`  
**Full report:** [folder-structure-audit-assets.md](./folder-structure-audit-assets.md)  
**Code index:** [asset-code-index.md](./asset-code-index.md)  
**Naming audit:** [batch 1](./asset-naming-audit-batch-1.md) ✅ · [batch 2](./asset-naming-audit-batch-2.md) ✅ · Batches 3–4 pending  
**Master plan:** [asset-master-plan.md](./asset-master-plan.md) → [docs/ASSET_PLAN.md](./docs/ASSET_PLAN.md)  
**Docs hub:** [docs/README.md](./docs/README.md)  
**Audit type:** File location and structure only

**Implementation status (2026-06-20):** Phases 0–8 complete — see [assets-cleanup-changelog.md](./assets-cleanup-changelog.md). Issues **1–8, 14–17, 22–23** resolved in code. Still open: **13** (optional handler extraction), **19** (empty static asset subfolders), naming batches **3–4**.

The issue entries below remain as historical audit detail unless marked resolved.

---

## Issue 1

**Location:** `systems/routing/routeAssetPrefetch.js`

**Why it is an issue:** `notes.md` lists `routeAssetPrefetch.js` under `systems/assets/`, not routing. It is exported from `systems/routing/index.js` instead of `systems/assets/index.js`.

**Suggested fix:** Move to `systems/assets/routeAssetPrefetch.js`. Export from `systems/assets/index.js`. Update imports in routing, composables, and tests.

---

## Issue 2

**Location:** Missing `systems/assets/assetPolicy.js`

**Why it is an issue:** `notes.md` defines `assetPolicy.js` as the policy entry point. Policy logic is split across `assertAllowedPreloadUrl.js` and `validateRouteAssetPreloadFlags.js` with no single policy file.

**Suggested fix:** Create `assetPolicy.js` and consolidate URL allow-list and preload entry validation into it. Update imports in `assetPreloader.js` and `assetLibrary.js`.

---

## Issue 3

**Location:** `systems/routing/resolveRouteAssetPreloads.js`

**Why it is an issue:** This file resolves `assetPreloadRef` into `assetPreload` arrays. That is asset config resolution, not routing.

**Suggested fix:** Move to `systems/assets/resolveRouteAssetPreloads.js`. Update imports in `routeConfigLoader.js` and `jsonConfigValidator.js`.

---

## Issue 4

**Location:** `systems/assets/assetHandlerFactory.js`

**Why it is an issue:** Not listed in `notes.md`. Not exported from `index.js`.

**Suggested fix:** Add to `notes.md` if it stays, or merge with `assetHandler.js` after renaming `assetsHandlerNew.js`.

---

## Issue 5

**Location:** `systems/assets/assetsHandlerNew.js`

**Why it is an issue:** Not in `notes.md`. Filename uses plural `assets`, `Handler`, and `New` — inconsistent with `assetLibrary.js`, `assetPreloader.js`, etc.

**Suggested fix:** Rename to `assetHandler.js`. Update imports in `assetHandlerFactory.js`, `scriptAvailabilityChecker.js`, and template consumers.

---

## Issue 6

**Location:** `systems/assets/getAssetPreloadEntriesForSection.js`

**Why it is an issue:** Not listed in `notes.md`. Used by `assetPreloader.js`, `assetLibrary.js`, and `assetScanner.js` for section-level preload rollups.

**Suggested fix:** Add to `notes.md` as a documented module, or fold into `assetPreloader.js`.

---

## Issue 7

**Location:** `systems/assets/resetAssetLibrary.js`

**Why it is an issue:** Not listed in `notes.md`. Provides test/dev cache reset helpers.

**Suggested fix:** Add to `notes.md`, or merge reset helpers into `assetLibrary.js`.

---

## Issue 8

**Location:** `systems/assets/resolveSharedComponentAssets.js`

**Why it is an issue:** Not listed in `notes.md`. Resolves shared dashboard chrome assets from catalog flags.

**Suggested fix:** Add to `notes.md`, or document as internal-only if not part of the public API.

---

## Issue 9

**Location:** `systems/assets/sectionAssetMapSource.js`

**Why it is an issue:** Not listed in `notes.md`. Loads section-scoped `assetMap.*.json` files. Not exported from `index.js`.

**Suggested fix:** Add to `notes.md` alongside `assetMapSource.js`, or merge into `assetMapSource.js`.

---

## Issue 10

**Location:** `systems/assets/validateRouteAssetPreloadFlags.js`

**Why it is an issue:** Not listed in `notes.md`. Overlaps the intended `assetPolicy.js` role. Used by routing and build validators.

**Suggested fix:** Move validation entry points into `assetPolicy.js`, or add this file to `notes.md` if kept separate.

---

## Issue 11

**Location:** `systems/assets/validateSharedComponentAssetMappings.js`

**Why it is an issue:** Not listed in `notes.md`. Validates shared catalog mappings at build time.

**Suggested fix:** Fold into `assetPolicy.js`, or add to `notes.md` if kept standalone.

---

## Issue 12

**Location:** `systems/assets/index.js`

**Why it is an issue:** Barrel omits `assetMapSource.js`, `sectionAssetMapSource.js`, `assetHandlerFactory.js`, and `assertAllowedPreloadUrl.js`. After Issue 1 is fixed, `routeAssetPrefetch.js` will also be missing from the barrel.

**Suggested fix:** Export the stable public API from `index.js`. Document which helpers stay as direct imports only.

---

## Issue 13

**Location:** `systems/interactions/scriptAvailabilityChecker.js`

**Why it is an issue:** Owns an `AssetHandler` singleton, default Cognito script config, DOM script loading, and `window.assetHandler`. That is asset loading orchestration, not interaction logic.

**Suggested fix:** Move handler singleton and script-load helpers into `systems/assets/`. Keep `scriptAvailabilityChecker.js` as a thin caller of the assets system.

---

## Issue 14

**Location:** `systems/routing/useRoutePrefetch.js`

**Why it is an issue:** `notes.md` lists `useRoutePrefetch.js` under `composables/`, not routing. It couples route component prefetch with section asset prefetch.

**Suggested fix:** Move to `composables/useRoutePrefetch.js`. Import asset prefetch from `systems/assets/routeAssetPrefetch.js` after Issue 1.

---

## Issue 15

**Location:** Missing `composables/useAssetPrefetch.js`

**Why it is an issue:** `notes.md` lists `useAssetPrefetch.js` under `composables/`. The file does not exist. Asset prefetch is only reachable via routing's `useRoutePrefetch`.

**Suggested fix:** Create `composables/useAssetPrefetch.js` wrapping `routeAssetPrefetch.js` exports, or document that `useRoutePrefetch` covers both and update `notes.md`.

---

## Issue 16

**Location:** `router/sharedAssetPreloads.json`

**Why it is an issue:** Shared asset preload catalog — asset config, not route config. `notes.md` limits `router/` to Vue Router entry and route config only.

**Suggested fix:** Move to `config/sharedAssetPreloads.json`. Update imports in `routeConfigLoader.js`, `jsonConfigValidator.js`, and `resolveSharedComponentAssets.js`.

---

## Issue 17

**Location:** `utils/preload.js`

**Why it is an issue:** Standalone `preloadIcons()` duplicates `systems/assets/assetPreloader.js`. Still in `utils/` after migration.

**Suggested fix:** Delete and use `preloadImage` from `systems/assets/assetPreloader.js`. Update `Cart.vue` and `UploadThumbnailPreview.vue`.

---

## Issue 18

**Location:** `assets/data/menuItems.js`, `assets/data/settingConfig.js`

**Why it is an issue:** `notes.md` defines `src/assets/` as CSS, images, icons, and fonts only. `menuItems.js` uses asset flags (correct pattern, wrong folder). `settingConfig.js` uses hardcoded ImgBB URLs instead of `assetMap.json` flags.

**Suggested fix:** Move to `config/`. Replace hardcoded icon URLs in `settingConfig.js` with asset flags.

---

## Issue 19

**Location:** `assets/` — missing `images/`, `icons/`, `fonts/`

**Why it is an issue:** `notes.md` expects those subfolders. Only CSS and `data/` exist.

**Suggested fix:** Create folders when static files are added, or update `notes.md` if all images are CDN-only via `assetMap.json`.

---

## Issue 20

**Location:** `config/assetMap.auth.json`

**Why it is an issue:** `notes.md` lists only `assetMap.json` and `countries.json`. Section-scoped maps are undocumented in the target structure.

**Suggested fix:** Add `assetMap.*.json` to `notes.md` as intentional.

---

## Issue 21

**Location:** `templates/dashboard/creator/CreatorDashboardOverviewPage.vue`

**Why it is an issue:** Manually builds and instantiates `AssetHandler` instead of using `createAssetHandler` from the assets system.

**Suggested fix:** Use `createAssetHandler`, or extract helper into `systems/assets/`.

---

## Issue 22

**Location:** Six auth views with inline `assetsConfig` + `createAssetHandler`

**Why it is an issue:** Duplicated asset-loading setup across auth templates.

**Suggested fix:** Extract shared config to `systems/assets/authAssetConfig.js`.

---

## Issue 23

**Location:** `tests/` (~47 files)

**Why it is an issue:** Tests still import `src/utils/assets/*` and `src/utils/route/*` paths that no longer exist.

**Suggested fix:** Bulk-update imports to `src/systems/assets/*` and correct routing paths.

---

## Issue 24

**Location:** `composables/useAssetUrl.js`

**Why it is an issue:** Exists and correctly wraps `getAssetUrl`, but is not listed in `notes.md` composables.

**Suggested fix:** Add to `notes.md`, or merge into `useAssetPrefetch` if same concern.
