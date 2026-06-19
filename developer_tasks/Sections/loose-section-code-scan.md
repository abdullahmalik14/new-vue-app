# Loose section code scan

**Date:** 2026-06-10  
**Target structure (from `notes.md`):**

```
src/systems/sections/   → section resolver, preloader, CSS loader, orchestrator, manifest helpers
```

**Note:** `src/utils/section/` has been removed from `src/`. Runtime section code now lives under `systems/sections/`. Build-time section bundling lives under `build/` (expected).

---

## Summary

| Area | Status |
|------|--------|
| `utils/section/` in `src/` | ✅ Gone — migrated to `systems/sections/` |
| `systems/sections/` core modules | ✅ Present (5 `.js` files) |
| `sectionManifestHelpers.js` | ❌ Missing — manifest logic in `systems/build/manifestLoader.js` |
| Section logic in `router/index.js` | ❌ Inline preload + section resolve (~80 lines) |
| Section logic in `systems/routing/` | ⚠️ 4 files import from sections or duplicate route inheritance |
| Section refresh in `systems/i18n/` | ⚠️ `localeManager.js` calls section orchestrator |
| Tests | ❌ 12 unit tests still import dead `utils/section/` paths |
| Docs | ❌ Many guides still reference `src/utils/section/` |

---

## Issue 1

**Location:** `tests/unit/sectionResolver.test.js`, `sectionPreloader.test.js`, `sectionCssLoader.test.js`, `sectionPreloadOrchestrator.test.js`, `sectionBarrel.test.js`, `routeInheritance.test.js`, `routeNavigationData.test.js`, `routeTransition.test.js`, `routeComponentPrefetch.test.js`, `updateUrlWithLocale.test.js`, `applyLocaleTemporarily.test.js`

**Why it is an issue:** All import or mock `../../src/utils/section/...`. That folder no longer exists. Tests may pass only if Vitest resolves aliases, or they may be testing dead paths.

**Suggested fix:** Update every path to `../../src/systems/sections/...`.

---

## Issue 2

**Location:** Missing `systems/sections/sectionManifestHelpers.js` — logic currently in `systems/build/manifestLoader.js` (`getSectionBundlePaths`, manifest fetch/cache)

**Why it is an issue:** `notes.md` places manifest helpers in sections. `sectionPreloader.js` and `sectionCssLoader.js` import from `../build/manifestLoader.js`, coupling runtime section loading to the build system folder.

**Suggested fix:** Create `sectionManifestHelpers.js` in `systems/sections/`. Move `getSectionBundlePaths` and runtime manifest loading there. Keep `manifestLoader.js` for build-only use or re-export.

---

## Issue 3

**Location:** `router/index.js` — `loadRouteComponent()`, `beforeEach` section resolve, `afterEach` section preload block

**Why it is an issue:** Router entry file contains inline section resolution (`resolveRoleSectionVariant`), cache-hit preload checks (`usePreloadStore`), and `startBackgroundSectionPreloads` orchestration. Per `notes.md`, section preload orchestration belongs in `systems/sections/`, not `router/`.

**Suggested fix:** Extract to `systems/sections/` (e.g. extend `sectionPreloadOrchestrator.js` or add `registerSectionNavigationHooks.js`). Router should call one sections entry point from hooks.

---

## Issue 4

**Location:** `systems/routing/routeNavigationData.js`

**Why it is an issue:** Owns current-section CSS load/unload and section resolution on navigation (`loadSectionCss`, `unloadSectionCss`, `resolveRoleSectionVariant`). This is section-system behaviour living in routing.

**Suggested fix:** Move to `systems/sections/` (e.g. `sectionNavigationResources.js`) or fold into `sectionPreloadOrchestrator.js`. Routing should call a sections helper, not import `sectionCssLoader` directly.

---

## Issue 5

**Location:** `systems/sections/sectionPreloadOrchestrator.js` — `resolveEffectiveRouteConfig()`

**Why it is an issue:** Route config inheritance duplicates `inheritConfigurationFromParentRoute()` in `systems/routing/routeResolver.js`. Three routing files import this from sections: `routeTransition.js`, `routeComponentPrefetch.js`, and `router/index.js`.

**Suggested fix:** Move `resolveEffectiveRouteConfig()` to `systems/routing/`. Sections orchestrator should import it from routing, not own it.

---

## Issue 6

**Location:** `systems/routing/routeTransition.js`, `routeComponentPrefetch.js`, `routeAssetPrefetch.js`

**Why it is an issue:** Each imports section orchestrator/resolver functions (`resolveEffectiveRouteConfig`, `resolveCurrentRouteSectionName`). Routing depends on sections for route-meta resolution that is arguably routing concern.

**Suggested fix:** After Issue 5, keep only true section-preload imports in routing. Route-meta resolution helpers should live in `systems/routing/` and be imported by sections where needed.

---

## Issue 7

**Location:** `systems/i18n/localeManager.js` — calls `getRoutePreloadPlan()` and `refreshSectionPreloadsOnLocaleChange()`

**Why it is an issue:** i18n locale switching triggers section preload refresh. Cross-system coupling: i18n owns section preload side-effects on locale change.

**Suggested fix:** i18n should emit a locale-changed event or call a single `systems/sections/` entry (e.g. `onLocaleChangeRefreshSections()`). Avoid i18n importing orchestrator internals directly long term.

---

## Issue 8

**Location:** Docs — `docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md`, `docs/DEV_GUIDE_COMPLETE.md`, `docs/TESTING_CHECKLISTS.md`, `docs/tasks/SECTION_PRELOAD_AUDIT.md`, `build/tailwind/README.md`, and archived docs under `docs/archived/`

**Why it is an issue:** Still reference `src/utils/section/` paths. Misleads developers and future audits.

**Suggested fix:** Bulk-replace `utils/section` → `systems/sections` in active docs. Archive or add a header to stale archived docs.

---

## What is correctly placed

| File / area | Verdict |
|-------------|---------|
| `systems/sections/sectionResolver.js` | ✅ Correct home |
| `systems/sections/sectionPreloader.js` | ✅ Correct home |
| `systems/sections/sectionCssLoader.js` | ✅ Correct home |
| `systems/sections/sectionPreloadOrchestrator.js` | ✅ Correct home (minus Issue 5) |
| `stores/usePreloadStore.js` | ✅ Pinia state for section preload tracking |
| `build/vite/sectionBundler.js` | ✅ Build pipeline — not runtime sections |
| `build/tailwind/sectionCss*.js` | ✅ Build pipeline — not runtime sections |
| `systems/assets/getAssetPreloadEntriesForSection.js` | ✅ Asset rollups per section — assets concern |
| `systems/assets/sectionAssetMapSource.js` | ✅ Section-scoped asset maps — assets concern |
| UI components named `*Section*` in `components/` | ✅ UI only — not section system code |

---

*End of scan.*
