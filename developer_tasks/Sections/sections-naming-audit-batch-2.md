# Sections naming audit — Batch 2

**Date:** 2026-06-10  
**Scope:** Section code outside `systems/sections/` that is **deeply interconnected** (navigation resource loads, manifest paths, per-section assets, locale refresh, preload store)  
**Reference:** [Expanded Vue App Naming Convention.txt](../../Expanded%20Vue%20App%20Naming%20Convention.txt)  
**Excluded:** Pure routing (`hreflangTags`, `routeGuards`, `routeAliases`, router hooks, etc.)

**Rule:** Only items needing a rename are listed.

---

type: filename
name: routeNavigationData.js
Status: suggested
suggested: sectionNavigationResourceLoader.js

type: filename
name: getAssetPreloadEntriesForSection.js
Status: suggested
suggested: sectionAssetPreloadEntries.js

type: method
name: routeNavigationData.js :: startCurrentSectionResourceLoads
Status: suggested
suggested: loadCurrentSectionResources

type: method
name: manifestLoader.js :: getSectionBundlePaths
Status: suggested
suggested: move to sectionManifestHelpers.js as getSectionBundlePaths (name approved)

type: method
name: manifestLoader.js :: loadSectionManifest
Status: suggested
suggested: move to sectionManifestHelpers.js as loadSectionManifest (name approved)

type: method
name: getAssetPreloadEntriesForSection.js :: routeBelongsToSection
Status: suggested
suggested: doesRouteBelongToSection

type: method
name: localeManager.js :: resolveSectionFromRoutePath
Status: suggested
suggested: resolveActiveSectionFromRoutePath

type: variable
name: routeNavigationData.js :: resolved
Status: suggested
suggested: resolvedSectionName

type: variable
name: routeNavigationData.js :: err
Status: suggested
suggested: resourceLoadError

type: variable
name: getAssetPreloadEntriesForSection.js :: byKey
Status: suggested
suggested: entriesByDedupeKey

type: variable
name: getAssetPreloadEntriesForSection.js :: cached
Status: suggested
suggested: cachedSectionRollup

type: variable
name: getAssetPreloadEntriesForSection.js :: entry
Status: suggested
suggested: sectionAssetRollup

type: variable
name: getAssetPreloadEntriesForSection.js :: key
Status: suggested
suggested: dedupeKey

type: variable
name: manifestLoader.js :: manifest
Status: suggested
suggested: sectionManifest

type: variable
name: usePreloadStore.js :: next
Status: suggested
suggested: nextSectionSet

type: variable
name: sectionPreloader.js :: link
Status: suggested
suggested: javascriptPreloadLink

type: variable
name: tests/unit/sectionResolver.test.js :: LOADER_PATH
Status: suggested
suggested: update path to systems/sections/ (stale utils/section import — not a symbol rename)

type: variable
name: tests/unit/sectionPreloader.test.js :: LOADER_PATH
Status: suggested
suggested: update path to systems/sections/ (stale utils/section import)

type: variable
name: tests/unit/sectionCssLoader.test.js :: LOADER_PATH
Status: suggested
suggested: update path to systems/sections/ (stale utils/section import)

type: variable
name: tests/unit/sectionPreloadOrchestrator.test.js :: imports
Status: suggested
suggested: update paths to systems/sections/ (stale utils/section mocks)

type: variable
name: tests/unit/sectionBarrel.test.js :: barrel import
Status: suggested
suggested: update path to systems/sections/index.js (stale utils/section import)
