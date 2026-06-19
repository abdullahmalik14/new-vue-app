# Sections code audit — `src/systems/sections/`

**Date:** 2026-06-10  
**Scope:** `new-vue-app-main/src/systems/sections/` and section-related code per `notes.md`  
**Reference:** `notes.md` — `systems/sections/` owns resolver, preloader, CSS loader, orchestrator, manifest helpers  
**Audit type:** Code location, responsibility, imports, and public API alignment

---

## Issue 1

**Location:** Missing `systems/sections/sectionManifestHelpers.js`

**Why it is an issue:** `notes.md` lists this file as part of the sections system. `sectionPreloader.js` and `sectionCssLoader.js` instead import `getSectionBundlePaths` from `systems/build/manifestLoader.js`. Runtime section loading is coupled to the build folder.

**Suggested fix:** Create `sectionManifestHelpers.js`. Move runtime manifest fetch/cache/path resolution there. Keep `manifestLoader.js` for build-time only or re-export from sections.

---

## Issue 2

**Location:** `systems/sections/sectionPreloader.js` line 12 — `import from '../sections/sectionCssLoader.js'`

**Why it is an issue:** Both files are in the same folder. The path is a leftover from `utils/section/` and does not reflect the current layout.

**Suggested fix:** Change to `./sectionCssLoader.js`.

---

## Issue 3

**Location:** `systems/sections/index.js`

**Why it is an issue:** `notes.md` recommends a barrel for stable public API. The barrel exports only resolver + preloader helpers. It omits `sectionCssLoader.js`, `sectionPreloadOrchestrator.js`, `resolveSectionIdentifier`, and `resetSectionPreloadState` — all used by `main.js`, `router/index.js`, `localeManager.js`, and routing modules.

**Suggested fix:** Export the full public API from `index.js`: orchestrator functions, CSS loader entry points, `resolveSectionIdentifier`, and `resetSectionPreloadState`. Consumers should import from `@/systems/sections` instead of deep paths.

---

## Issue 4

**Location:** `systems/sections/sectionPreloadOrchestrator.js` — `resolveEffectiveRouteConfig()`

**Why it is an issue:** This is a thin wrapper around `inheritConfigurationFromParentRoute()` from `systems/routing/routeResolver.js`. Route config inheritance is routing responsibility per `notes.md`, not sections. Three routing files import it from sections: `routeTransition.js`, `routeComponentPrefetch.js`, and `router/index.js`.

**Suggested fix:** Move `resolveEffectiveRouteConfig()` to `systems/routing/`. Update orchestrator and routing consumers to import from routing.

---

## Issue 5

**Location:** `systems/routing/routeNavigationData.js` — `loadSectionCss`, `unloadSectionCss`, `resolveRoleSectionVariant`

**Why it is an issue:** Current-section CSS swap and section resolution on navigation are sections-system behaviour. This logic lives in routing, not in `systems/sections/`.

**Suggested fix:** Add `systems/sections/sectionNavigationResources.js` (or extend orchestrator) with `startCurrentSectionResourceLoads()`. Move code from `routeNavigationData.js`. Routing calls one sections entry point.

---

## Issue 6

**Location:** `router/index.js` — `loadRouteComponent()`, `beforeEach` section resolve, `afterEach` preload block

**Why it is an issue:** Router entry file contains inline section resolution, preload-store checks, and `startBackgroundSectionPreloads` calls. `notes.md` places router as entry + config only; section preload orchestration belongs in `systems/sections/`.

**Suggested fix:** Extract to `systems/sections/sectionNavigationHooks.js` (or similar). Router registers hooks that delegate to sections.

---

## Issue 7

**Location:** `systems/sections/sectionPreloadOrchestrator.js` — imports `loadTranslationsForSection` from `systems/i18n/`

**Why it is an issue:** Sections orchestrator directly loads translations during background preloads. `notes.md` treats i18n as a separate system. Locale refresh is also triggered from `localeManager.js` back into sections.

**Suggested fix:** Keep coordination in orchestrator but expose a single `onLocaleChange()` entry in sections. i18n should call that entry, not import orchestrator internals. Consider an event/callback boundary between i18n and sections.

---

## Issue 8

**Location:** `systems/sections/sectionResolver.js` line 10 — `import from '../../utils/common/objectSafety.js'`

**Why it is an issue:** `notes.md` says `utils/` should only hold tiny pure helpers after migration. Section system depends on a remaining `utils/common` module instead of `infrastructure/` or an inline guard.

**Suggested fix:** Move `safelyGetNestedProperty` to `infrastructure/` (e.g. `objectSafety.js`) or inline the small nested-access logic in the resolver.

---

## Issue 9

**Location:** `systems/sections/sectionPreloader.js` and `sectionCssLoader.js` — `import from '../build/bundlePathValidation.js'`

**Why it is an issue:** Runtime section loaders depend on a build-system validation module (`isTrustedBundlePath`, `escapeSelectorAttributeValue`). Bundle path trust checks are runtime security concerns, not build-only.

**Suggested fix:** Move trust/escape helpers to `infrastructure/` or `sectionManifestHelpers.js`. Build and sections both import from the shared low-level module.

---

## Issue 10

**Location:** `systems/sections/sectionResolver.js` — `resolveSectionIdentifier()` imports `resolveRouteFromPath` from routing

**Why it is an issue:** Sections resolver reaches into routing to map slugs to sections. Acceptable coupling for now, but it creates a circular dependency risk (routing also imports sections).

**Suggested fix:** Document as intentional. Long term, pass resolved route config into sections from routing instead of sections calling `resolveRouteFromPath` directly.

---

## Issue 11

**Location:** `systems/sections/README.md`

**Why it is an issue:** Documents `preloadSectionBundle` and `manifestData` parameters that do not exist in current code. References `utils/common/` and old `dist/section-manifest.json` flow. Misleads anyone implementing against the README.

**Suggested fix:** Rewrite README to match current API: `preloadSection`, `getSectionBundlePaths` via manifest helpers, and `systems/sections/` import paths.

---

## Issue 12

**Location:** `tests/unit/section*.test.js`, `routeInheritance.test.js`, and related tests — import `../../src/utils/section/...`

**Why it is an issue:** `src/utils/section/` no longer exists. Tests do not exercise the real module paths under `systems/sections/`.

**Suggested fix:** Update all test imports to `../../src/systems/sections/...`.

---

## What aligns with `notes.md`

| Module | Verdict |
|--------|---------|
| `sectionResolver.js` | Correct home — route section extraction and role variants |
| `sectionPreloader.js` | Correct home — bundle preload coordination |
| `sectionCssLoader.js` | Correct home — runtime section CSS inject/swap |
| `sectionPreloadOrchestrator.js` | Correct home — startup/navigation preload orchestration (minus Issue 4) |
| `stores/usePreloadStore.js` | Correct — Pinia state only |
| `infrastructure/logging`, `infrastructure/errors` imports | Correct — low-level utilities |

---

*End of audit.*
