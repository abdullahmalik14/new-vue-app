# Section code index

**Date:** 2026-06-10  
**Project:** `new-vue-app-main/`  
**Purpose:** Every file and method/function where section-system code was found.

**Legend**

- **Core** — `systems/sections/` per `notes.md`
- **Cross** — section logic in another system layer
- **State** — Pinia preload store (section tracking)
- **Build** — build-time section bundling / manifest
- **Entry** — app bootstrap or router hooks calling sections
- **Test** — unit/integration tests
- **Stale** — references dead `utils/section/` paths

---

## Summary

| Layer | Files | Exported symbols (approx.) |
|-------|-------|----------------------------|
| `systems/sections/` | 5 code + 1 barrel | 32 |
| Cross-system (`routing`, `i18n`, `assets`, `build`) | 12 | ~40 section-coupled |
| `stores/usePreloadStore.js` | 1 | 7 section-related |
| App + router entry | 2 | 6 local call sites |
| `build/` (tooling) | 8 | ~25 |
| Unit tests (section-related) | 20+ | — |

---

## 1. `systems/sections/` — core section system

### `index.js` (barrel)

| Symbol | Source file |
|--------|-------------|
| `getPreloadSectionsForRoute` | `sectionResolver.js` |
| `getAllRouteSectionsForRoute` | `sectionResolver.js` |
| `normalizeSectionConfiguration` | `sectionResolver.js` |
| `resolveRoleSectionVariant` | `sectionResolver.js` |
| `isSectionRoleBased` | `sectionResolver.js` |
| `getAllSectionVariants` | `sectionResolver.js` |
| `preloadSection` | `sectionPreloader.js` |
| `preloadMultipleSections` | `sectionPreloader.js` |
| `isSectionPreloaded` | `sectionPreloader.js` |
| `clearPreloadState` | `sectionPreloader.js` |
| `getPreloadStatistics` | `sectionPreloader.js` |

**Not in barrel (but exported from sibling files):** `resolveSectionIdentifier`, `resetSectionPreloadState`, all orchestrator exports, all CSS loader exports.

---

### `sectionResolver.js`

| Symbol | Kind |
|--------|------|
| `getPreloadSectionsForRoute` | export |
| `resolveSectionIdentifier` | export |
| `getAllRouteSectionsForRoute` | export |
| `normalizeSectionConfiguration` | export |
| `resolveRoleSectionVariant` | export |
| `isSectionRoleBased` | export |
| `getAllSectionVariants` | export |
| `resolveRolePreLoadSections` | internal |

**Imports:** `routeResolver.resolveRouteFromPath`, `utils/common/objectSafety.safelyGetNestedProperty`

**Called by:** `sectionPreloadOrchestrator.js`, `routeNavigationData.js`, `router/index.js`, `localeManager.js`

---

### `sectionPreloader.js`

| Symbol | Kind |
|--------|------|
| `preloadSection` | export |
| `preloadMultipleSections` | export |
| `isSectionPreloaded` | export |
| `resetSectionPreloadState` | export |
| `clearPreloadState` | export |
| `getPreloadStatistics` | export |
| `_doPreload` | internal |
| `preloadJavaScriptBundle` | internal |
| `raceLinkPreloadWithTimeout` | internal |
| `getPreloadBundleTimeoutMs` | internal |
| `clearSectionJsPreloadLink` | internal |
| `clearSectionJsPreloadLinks` | internal |

**Imports:** `build/manifestLoader.getSectionBundlePaths`, `build/bundlePathValidation`, `sectionCssLoader`, `assets/assetPreloader.preloadSectionAssets`, `usePreloadStore`

**Called by:** `sectionPreloadOrchestrator.js`, `router/index.js` (`loadRouteComponent`)

---

### `sectionCssLoader.js`

| Symbol | Kind |
|--------|------|
| `clearSectionCssPreloadHint` | export |
| `loadSectionCss` | export |
| `preloadSectionCss` | export |
| `unloadSectionCss` | export |
| `getLoadedSections` | export |
| `clearAllSectionCss` | export |
| `getSectionCssBundle` | internal |
| `injectCssLink` | internal |
| `removeSectionCssPreloadHint` | internal |
| `applyBundleLinkIntegrity` | internal |
| `normalizeCssBundlePath` | internal |

**Imports:** `build/manifestLoader.getSectionBundlePaths`, `build/bundlePathValidation`

**Called by:** `sectionPreloader.js`, `routeNavigationData.js`

---

### `sectionPreloadOrchestrator.js`

| Symbol | Kind |
|--------|------|
| `resolveEffectiveRouteConfig` | export |
| `getRoutePreloadPlan` | export |
| `resolveCurrentRouteSectionName` | export |
| `shouldPreloadDefaultAuthSection` | export |
| `preloadDefaultAuthSection` | export |
| `startBackgroundSectionPreloads` | export |
| `refreshSectionPreloadsOnLocaleChange` | export |
| `buildSectionPreloadStatusSnapshot` | internal |

**Imports:** `sectionResolver`, `sectionPreloader`, `routing/routeResolver.inheritConfigurationFromParentRoute`, `i18n/translationLoader`, `usePreloadStore`

**Called by:** `main.js`, `router/index.js`, `localeManager.js`, `routeTransition.js`, `routeComponentPrefetch.js`, `routeAssetPrefetch.js`

---

### `README.md`

Documentation only. References removed API `preloadSectionBundle` — **stale**.

---

### Missing per `notes.md`

| File | Status |
|------|--------|
| `sectionManifestHelpers.js` | ❌ Not created — logic in `systems/build/manifestLoader.js` |

---

## 2. Cross-system — section code outside `systems/sections/`

### `systems/routing/routeNavigationData.js` **Cross**

| Symbol | Kind | Section methods used |
|--------|------|----------------------|
| `resolveCurrentSectionForNavigation` | export | calls `resolveRoleSectionVariant` |
| `startCurrentSectionResourceLoads` | export | `unloadSectionCss`, `loadSectionCss`, `resolveRoleSectionVariant`, `preloadSectionAssets`, `loadTranslationsForSection`, `areTranslationsLoadedForSection` |

**Called by:** `router/index.js` (`beforeResolve`)

---

### `systems/routing/routeTransition.js` **Cross**

| Symbol | Section import |
|--------|----------------|
| `resolveRouteTransition` | `resolveEffectiveRouteConfig` from orchestrator |

---

### `systems/routing/routeComponentPrefetch.js` **Cross**

| Symbol | Section import |
|--------|----------------|
| `prefetchRouteComponent` | `resolveEffectiveRouteConfig` from orchestrator |

---

### `systems/routing/routeAssetPrefetch.js` **Cross**

| Symbol | Section import |
|--------|----------------|
| `prefetchSectionAssetsForRoute` | `resolveCurrentRouteSectionName` from orchestrator |
| `createSectionAssetPrefetchIntentHandler` | (uses above) |

---

### `systems/routing/routeResolver.js` **Cross**

| Symbol | Notes |
|--------|-------|
| `inheritConfigurationFromParentRoute` | Used by orchestrator `resolveEffectiveRouteConfig` |
| Comment reference | Documents `resolveEffectiveRouteConfig` alias |

---

### `systems/i18n/localeManager.js` **Cross**

| Function | Section methods used |
|----------|----------------------|
| `setActiveLocale` | `resolveRoleSectionVariant`, `getRoutePreloadPlan`, `refreshSectionPreloadsOnLocaleChange`, `loadTranslationsForSection` |
| `resolveSectionFromRoutePath` (internal) | `resolveRoleSectionVariant` |
| `translateCurrentPageTemporarily` (and related) | `resolveRoleSectionVariant`, `loadTranslationsForSection` |

**Imports from sections:** `resolveRoleSectionVariant` (`sectionResolver`), `getRoutePreloadPlan`, `refreshSectionPreloadsOnLocaleChange` (`sectionPreloadOrchestrator`)

---

### `systems/i18n/translationLoader.js` **Cross**

| Symbol | Section coupling |
|--------|------------------|
| `loadTranslationsForSection` | Per-section translation fetch |
| `preloadTranslationsForSections` | Batch section translations |
| `areTranslationsLoadedForSection` | Section translation cache check |
| `isAllowlistedSectionName` | internal — validates section names |
| `getKnownTranslationSections` | internal — from `collectKnownSectionNames` |

**Called by:** `sectionPreloadOrchestrator.js`, `routeNavigationData.js`, `localeManager.js`, `main.js`

---

### `systems/i18n/validateI18n.js` **Cross**

| Symbol | Section coupling |
|--------|------------------|
| `collectKnownSectionNames` | Extract section names from route config |
| `buildComponentSectionMap` | Maps components → sections |
| `validateI18n` | Validates `public/i18n/section-*` folders vs routes |

---

### `systems/build/manifestLoader.js` **Cross**

| Symbol | Section coupling |
|--------|------------------|
| `loadSectionManifest` | Loads full section manifest |
| `getSectionBundlePaths` | **Runtime** — used by preloader + CSS loader |
| `clearManifestCache` | Manifest cache reset |

**Also uses:** `usePreloadStore.setManifestLoadFailed`

---

### `systems/build/bundlePathValidation.js` **Cross**

| Symbol | Used by sections |
|--------|------------------|
| `isTrustedBundlePath` | `sectionPreloader.js`, `sectionCssLoader.js` |
| `escapeSelectorAttributeValue` | `sectionPreloader.js`, `sectionCssLoader.js` |

---

### `systems/build/jsonConfigValidator.js` **Cross**

| Symbol | Section coupling |
|--------|------------------|
| `collectKnownSectionNames` | Shared with translation loader |

---

### `systems/assets/assetPreloader.js` **Cross**

| Symbol | Section coupling |
|--------|------------------|
| `preloadSectionAssets` | Called from `sectionPreloader._doPreload` |
| `preloadSectionCriticalImages` | Called from `router/index.js` `loadRouteComponent` |

---

### `systems/assets/assetLibrary.js` **Cross**

| Symbol | Section coupling |
|--------|------------------|
| `loadAssetsForSection` | Per-section asset load |
| `preloadAssetsForSections` | Batch section assets |
| `unloadUnusedSections` | Evict unused section asset caches |
| `getAssetsForSection` | Section asset lookup |
| `areAssetsLoadedForSection` | Section asset cache check |

---

### `systems/assets/getAssetPreloadEntriesForSection.js` **Cross**

| Symbol | Section coupling |
|--------|------------------|
| `getAssetPreloadEntriesForSection` | Roll up route asset preloads by section |
| `routeBelongsToSection` | Route → section membership |
| `isRouteEnabledForAssetPreload` | Route preload gate |
| `dedupeAssetPreloadEntries` | Entry dedup |
| `clearAssetPreloadSectionCache` | Section cache clear |

---

### `systems/assets/sectionAssetMapSource.js` **Cross**

| Symbol | Section coupling |
|--------|------------------|
| `parseSectionNameFromAssetMapPath` | Parse section from map path |
| `isValidSectionAssetMapName` | Section name validation |
| `getBundledSectionAssetMap` | Bundled section map |
| `getKnownBundledSectionNames` | Known section names |
| `getSectionAssetMapFetchCandidates` | Fetch URLs for section map |
| `fetchSectionAssetMapFromNetwork` | Network fetch |

---

## 3. State — `stores/usePreloadStore.js`

| Symbol | Kind | Purpose |
|--------|------|---------|
| `hasSection` | getter | Section bundle preloaded? |
| `isSectionInProgress` | getter | Section preload in flight? |
| `addSection` | action | Mark section preloaded |
| `removeSection` | action | Clear section from cache |
| `markSectionInProgress` | action | Mark preload started |
| `unmarkSectionInProgress` | action | Mark preload finished |
| `setManifestLoadFailed` | action | Section manifest fetch failed |
| `clearState` | action | Reset all preload state |

**Used by:** `sectionPreloader.js`, `sectionPreloadOrchestrator.js`, `manifestLoader.js`, `router/index.js`

---

## 4. Entry points — app bootstrap and router

### `src/app/main.js` **Entry**

**Imports from sections:**

| Symbol | Source |
|--------|--------|
| `getRoutePreloadPlan` | orchestrator |
| `preloadDefaultAuthSection` | orchestrator |
| `resolveCurrentRouteSectionName` | orchestrator |
| `shouldPreloadDefaultAuthSection` | orchestrator |
| `startBackgroundSectionPreloads` | orchestrator |

**Also imports:** `loadTranslationsForSection`, `loadBaseTranslations` (i18n)

**Call sites:** startup preload block (~lines 431–572)

---

### `src/router/index.js` **Entry**

**Imports from sections:**

| Symbol | Source |
|--------|--------|
| `resolveRoleSectionVariant` | `sectionResolver.js` |
| `preloadSection` | `sectionPreloader.js` |
| `getRoutePreloadPlan` | orchestrator |
| `resolveEffectiveRouteConfig` | orchestrator |
| `startBackgroundSectionPreloads` | orchestrator |

**Imports cross-system:**

| Symbol | Source |
|--------|--------|
| `startCurrentSectionResourceLoads` | `routeNavigationData.js` |
| `resolveCurrentSectionForNavigation` | `routeNavigationData.js` |
| `preloadSectionCriticalImages` | `assets/assetPreloader.js` |

**Local functions using section code:**

| Function | Section behaviour |
|----------|-------------------|
| `loadRouteComponent` | `resolveRoleSectionVariant`, `preloadSection`, `preloadSectionCriticalImages`, `usePreloadStore.hasSection` |
| `beforeEach` | `resolveEffectiveRouteConfig`, `resolveRoleSectionVariant` → `to.meta.section` |
| `beforeResolve` | `startCurrentSectionResourceLoads` |
| `afterEach` | `resolveEffectiveRouteConfig`, `getRoutePreloadPlan`, `startBackgroundSectionPreloads` |

---

## 5. `build/` — section build tooling

### `build/vite/sectionBundler.js`

| Symbol |
|--------|
| `discoverAllSectionsFromConfig` |
| `generateManualChunksConfiguration` |
| `groupComponentsBySection` |
| `getPreloadConfiguration` |
| `getSectionDependencies` |
| `createSectionBundlerPlugin` |

### `build/vite/sectionCssPlugin.js`

| Symbol |
|--------|
| `createSectionCssBuilderPlugin` |

### `build/vite/manifestGenerator.js`

| Symbol / area | Notes |
|---------------|-------|
| `preloadSections` metadata | Builds manifest preload metadata from routes |

### `build/vite/manifestIntegrityNode.js`

| Symbol / area | Notes |
|---------------|-------|
| `section-manifest.json` read | Build integrity check |

### `build/tailwind/sectionScanner.js`

| Symbol |
|--------|
| `scanRouteConfigForSections` |
| `resolveComponentPath` |
| `generateContentPathsForSection` |
| `generateAllSectionContentPaths` |
| `getSectionForComponent` |

### `build/tailwind/sectionCssCompiler.js`

| Symbol |
|--------|
| `generateSectionTailwindConfig` |
| `compileSectionCss` |
| `compileAllSectionsCss` |
| `generateSectionCssManifest` |
| `buildAllSectionCss` |

### `build/tailwind/sectionCssBuilder.js`

| Symbol |
|--------|
| `buildSectionTailwindConfig` |
| `buildAllSectionConfigs` |
| `generateSectionCssBuildReport` |
| `logSectionBuildInfo` |
| `getSectionContentPaths` |

### `build/tailwind/buildSectionCss.js`

Entry script — calls `buildAllSectionCss`.

---

## 6. Unit tests — section-related

### Direct `systems/sections/` tests **Stale paths → `utils/section/`**

| File | Methods / modules under test |
|------|------------------------------|
| `sectionResolver.test.js` | `getPreloadSectionsForRoute`, `resolveRoleSectionVariant` |
| `sectionPreloader.test.js` | `preloadSection`, `clearPreloadState`, `getPreloadStatistics`, `resetSectionPreloadState` |
| `sectionCssLoader.test.js` | `preloadSectionCss`, `unloadSectionCss`, `loadSectionCss`, `clearAllSectionCss` |
| `sectionPreloadOrchestrator.test.js` | `startBackgroundSectionPreloads`, `refreshSectionPreloadsOnLocaleChange` |
| `sectionBarrel.test.js` | `index.js` exports (`preloadSection`, `isSectionPreloaded`) |

### Routing tests mocking sections **Stale**

| File | Mocked section symbols |
|------|------------------------|
| `routeInheritance.test.js` | `resolveEffectiveRouteConfig` |
| `routeNavigationData.test.js` | `loadSectionCss`, `unloadSectionCss`, `resolveRoleSectionVariant` |
| `routeTransition.test.js` | `resolveEffectiveRouteConfig` |
| `routeComponentPrefetch.test.js` | `resolveEffectiveRouteConfig` |
| `routeAssetPrefetch.test.js` | (mocks `preloadSectionAssets`) |
| `updateUrlWithLocale.test.js` | `getRoutePreloadPlan`, `refreshSectionPreloadsOnLocaleChange`, `resolveRoleSectionVariant` |
| `applyLocaleTemporarily.test.js` | `resolveRoleSectionVariant` |

### Asset / manifest section tests

| File | Methods under test |
|------|-------------------|
| `preloadSectionAssets.test.js` | `preloadSectionAssets` |
| `preloadAssetsForSections.test.js` | `preloadAssetsForSections` |
| `getAssetPreloadEntriesForSection.test.js` | `getAssetPreloadEntriesForSection`, `routeBelongsToSection` |
| `loadAssetsForSectionDedup.test.js` | `loadAssetsForSection` |
| `areAssetsLoadedForSection.test.js` | `areAssetsLoadedForSection` |
| `sectionAssetMapMerge.test.js` | `loadAssetsForSection` |
| `sectionAssetsMemoryFirst.test.js` | section asset memory |
| `unloadUnusedSections.test.js` | `unloadUnusedSections` |
| `manifestLoader.test.js` | `getSectionBundlePaths`, `loadSectionManifest` |
| `performanceTrackerGuards.test.js` | `getSectionBundlePaths` |
| `assetPerformanceTrackerGuards.test.js` | `preloadSectionAssets` |
| `sectionScanner.test.js` | `scanSectionComponents` (asset scanner) |
| `dashboardLayoutSectionRoutes.test.js` | route config section fields |

---

## 7. UI files (name only — not section system code)

| File | Notes |
|------|-------|
| `components/ui/popup/checkout/SectionHeader.vue` | UI label |
| `components/ui/popup/checkout/SectionToggleHeader.vue` | UI label |
| `components/forms/booking-form/parts/BookingSectionsWrapper.vue` | UI layout |
| `components/plan/parts/LuckyDrawSection.vue` | UI component |
| `templates/dashboard/shared/DashboardSharedSectionLayout.vue` | Template layout |
| `templates/dev/DemoSectionHeader.vue` | Dev template |

---

## 8. Import path status

| Path pattern | Status |
|--------------|--------|
| `@/systems/sections/*` | ✅ Production code |
| `../systems/sections/*` | ✅ Production code |
| `src/utils/section/*` | ❌ Dead — still in 11+ test files |
| `src/utils/build/manifestLoader.js` | ❌ Dead in some tests — live path is `systems/build/` |

---

## Related audits

- [sections-code-audit.md](./sections-code-audit.md) — Issues 1–12
- [loose-section-code-scan.md](./loose-section-code-scan.md) — scattered section logic
- [folder-structure-audit-systems-sections.md](./folder-structure-audit-systems-sections.md) — structure Issues 1–5

---

*End of index.*
