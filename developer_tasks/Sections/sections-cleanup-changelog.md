# Sections cleanup — change log

**Purpose:** Record what was changed during [docs/SECTION_PLAN.md](./docs/SECTION_PLAN.md) execution. Audits stay as proposals; this file is the **done work** log.

**Branch:** `refactor/sections-cleanup`

---

## Phase 0 — Prep (2026-06-19)

**Master plan:** Phase 0 — Read docs + baseline vitest  
**Scope:** Orientation and baseline only. No production or test code changes.

### What was verified

1. Branch `refactor/sections-cleanup` checked out.
2. Audits read; noted file drift vs docs:
   - Section router hooks live in `src/systems/routing/createAppRouter.js` (not inline in `src/router/index.js`).
   - Nav section loads live in `src/systems/routing/routeNavigationResourceLoader.js` (successor to audit name `routeNavigationData.js`).
3. Stale import grep before Phase 1:
   ```bash
   rg "utils/section" tests/ src/
   ```
   **Result:** zero hits in `tests/` and `src/` (Route track Phase 1 already fixed test paths).

### Baseline vitest (section-focused)

Command:

```bash
npm run test:unit -- --run \
  tests/unit/sectionResolver.test.js \
  tests/unit/sectionPreloader.test.js \
  tests/unit/sectionCssLoader.test.js \
  tests/unit/sectionPreloadOrchestrator.test.js \
  tests/unit/sectionBarrel.test.js \
  tests/unit/routeNavigationData.test.js \
  tests/routeTest/sectionResolver.route.test.js \
  tests/routeTest/sectionPreloadOrchestrator.route.test.js \
  tests/routeTest/routeNavigationData.test.js
```

**Result:** 9 test files passed, 67 tests passed.

### Known pre-existing gaps (not Phase 0 scope)

| Item | Status |
|------|--------|
| `sectionManifestHelpers.js` | Missing — Phase 2 |
| Nav loads in routing layer | `routeNavigationResourceLoader.js` — Phase 2 |
| Router section blocks in `createAppRouter.js` | Phase 2 |
| `sectionPreloader.js` stale same-folder import | Fixed in Phase 1 |
| Naming audit (45 items) | Phase 3 |

### Phase 0 exit

Branch ready; baseline recorded; audit file-name drift documented.

---

## Phase 1 — Fix test imports and stale production import (2026-06-19)

**Master plan:** Phase 1 — Unblock tests and CI  
**Audit reference:** [loose-section-code-scan.md](./loose-section-code-scan.md) Issue 1, [sections-code-audit.md](./sections-code-audit.md) Issue 2 & 12  
**Scope:** Import path fixes only. No module renames, no file moves.

### Issue 1 — Tests pointed at deleted `utils/section/` folder

**What was broken:** Audits listed ~11+ test files importing `../../src/utils/section/...`. That folder was removed when section code migrated to `systems/sections/`. Vitest would fail module resolution if any stragglers remained.

**Why it happened:** Route track Phase 1 (2026-06-16) already bulk-updated section test paths as part of the routing import sweep. By the time Sections Phase 1 started, production and tests were mostly aligned.

**How it was fixed:** Re-verified with `rg "utils/section" tests/ src/` — zero hits. No test file edits required in this phase.

### Issue 2 — Stale same-folder import in `sectionPreloader.js`

**What was broken:** `sectionPreloader.js` imported CSS helpers via `../sections/sectionCssLoader.js`. That path made sense under the old `utils/section/` tree but both files now live in the **same** folder (`systems/sections/`). The import still worked (resolved to the same file) but was misleading and fragile.

**Why it happened:** Leftover from the folder migration; not updated when files moved.

**How it was fixed:**

| File | Change |
|------|--------|
| `src/systems/sections/sectionPreloader.js` | `../sections/sectionCssLoader.js` → `./sectionCssLoader.js` |

### How it was tested

```bash
npm run test:unit -- --run \
  tests/unit/sectionResolver.test.js \
  tests/unit/sectionPreloader.test.js \
  tests/unit/sectionCssLoader.test.js \
  tests/unit/sectionPreloadOrchestrator.test.js \
  tests/unit/sectionBarrel.test.js \
  tests/unit/routeNavigationData.test.js \
  tests/routeTest/sectionResolver.route.test.js \
  tests/routeTest/sectionPreloadOrchestrator.route.test.js \
  tests/routeTest/routeNavigationData.test.js

rg "utils/section" tests/ src/
```

**Result:** 9 test files passed, 67 tests passed; zero stale `utils/section` imports.

### Phase 1 exit

Section unit/route tests import correct paths; production same-folder import fixed; ready for Phase 2 structure work.

---

## Phase 2 — Structure cleanup (2026-06-19)

**Master plan:** Phase 2 — Manifest helper, barrel, nav moves, router hooks  
**Audit reference:** [sections-code-audit.md](./sections-code-audit.md) Issues 1–6, [loose-section-code-scan.md](./loose-section-code-scan.md) Issues 2–6  
**Scope:** File moves and import updates only. No preload behaviour changes.

### Big picture — what Phase 2 was trying to fix

Before Phase 2, section **behaviour worked** but **ownership was scattered**:

```text
systems/build/manifestLoader.js     ← runtime preload imported from "build"
systems/routing/routeNavigationResourceLoader.js  ← CSS/i18n/assets on navigate
systems/routing/createAppRouter.js  ← ~70 lines of section resolve + preload inline
systems/sections/sectionPreloadOrchestrator.js    ← owned resolveEffectiveRouteConfig (routing concern)
systems/sections/index.js           ← partial barrel (resolver + preloader only)
```

The approved architecture (`notes.md`) says: **one section layer under `systems/sections/`**, routing declares sections in config but **delegates** loading/preloading to sections. Phase 2 moved code to match that — without changing when or how preloads run (still non-blocking).

---

### Issue 1 — Runtime manifest logic lived in `build/`

**What was broken:** `sectionPreloader.js` and `sectionCssLoader.js` imported `getSectionBundlePaths` from `systems/build/manifestLoader.js`. That file also contained ~500 lines of **runtime** fetch/cache/retry logic (sessionStorage, production manifest fetch, dev stub). Runtime section loading was coupled to the build folder.

**Why it was a problem:** Build folder should be build-time tooling. Audits expected `sectionManifestHelpers.js` under `systems/sections/` per `notes.md`.

**How it was fixed:**
- Created [`src/systems/sections/sectionManifestHelpers.js`](../../src/systems/sections/sectionManifestHelpers.js) with `loadSectionManifest`, `getSectionBundlePaths`, `clearManifestCache` and all cache/session/retry helpers.
- Slimmed [`src/systems/build/manifestLoader.js`](../../src/systems/build/manifestLoader.js) to a **thin re-export** so existing `build/index.js` and legacy imports keep working.
- Updated direct consumers: `sectionPreloader.js`, `sectionCssLoader.js`, `assetLibrary.js` → import from `sectionManifestHelpers.js`.
- Updated test mocks: `sectionPreloader.test.js`, `sectionCssLoader.test.js`, `preloadAssetsForSections.test.js`, `loadAssetsForSectionDedup.test.js`.

---

### Issue 2 — Nav-time section loads owned by routing

**What was broken:** When you navigate to a page, the app must load that section's CSS, translations, and assets. That logic lived in [`routeNavigationResourceLoader.js`](../../src/systems/routing/routeNavigationResourceLoader.js) (`loadCurrentSectionResources`, `resolveCurrentSectionForNavigation`) — a **routing** file importing `sectionCssLoader`, `sectionResolver`, i18n, and assets directly.

**Why it was a problem:** That is section-system behaviour. Routing should call one sections entry point, not orchestrate CSS unload/load itself.

**How it was fixed:**
- Created [`src/systems/sections/sectionNavigationResources.js`](../../src/systems/sections/sectionNavigationResources.js) with the moved functions (same logic, same fire-and-forget contract).
- [`routeNavigationResourceLoader.js`](../../src/systems/routing/routeNavigationResourceLoader.js) now **re-exports** from sections so `createAppRouter.js` and existing tests keep their import path until Phase 3 naming.

---

### Issue 3 — `resolveEffectiveRouteConfig` owned by sections

**What was broken:** [`sectionPreloadOrchestrator.js`](../../src/systems/sections/sectionPreloadOrchestrator.js) exported `resolveEffectiveRouteConfig()` — a thin wrapper around `inheritConfigurationFromParentRoute()` from routing. Three routing files imported it **from sections**: `createAppRouter.js`, `routeTransition.js`, `routeComponentPreloader.js`.

**Why it was a problem:** Route config inheritance (parent `section` / `preLoadSections` merging) is a **routing** responsibility. Sections orchestrator should consume inherited config, not define how inheritance works. This also created awkward cross-imports (sections ↔ routing).

**How it was fixed:**
- Added `resolveEffectiveRouteConfig` to [`routeResolver.js`](../../src/systems/routing/routeResolver.js) (same implementation).
- Removed export from `sectionPreloadOrchestrator.js`; orchestrator imports it from routing internally.
- Exported from [`systems/routing/index.js`](../../src/systems/routing/index.js).
- Updated consumers and tests: `createAppRouter.js`, `routeTransition.js`, `routeComponentPreloader.js`, `routeInheritance.test.js`, `sectionPreloadOrchestrator.route.test.js`, route transition/prefetch/concurrency test mocks.

---

### Issue 4 — ~70 lines of section logic inline in `createAppRouter.js`

**What was broken:** The router factory contained inline section work in four places:
1. **`loadRouteComponent`** — resolve section for role, check preload store, background `preloadSection`, critical images
2. **`beforeEach`** — resolve `to.meta.section` for current role
3. **`beforeResolve`** — call `loadCurrentSectionResources` (already thin)
4. **`afterEach`** — `getRoutePreloadPlan` + `startBackgroundSectionPreloads` for future sections

**Why it was a problem:** Router entry should wire hooks; section preload orchestration belongs in `systems/sections/` per architecture rules and `.cursorrules` (nothing in critical nav path should grow unbounded in the router file).

**How it was fixed:**
- Created [`src/systems/sections/sectionNavigationHooks.js`](../../src/systems/sections/sectionNavigationHooks.js) with:
  - `assignResolvedSectionToRouteMeta` (beforeEach section block)
  - `loadRouteComponentWithSectionPreload` (component load + section cache check)
  - `startCurrentSectionResourceLoads` (beforeResolve wrapper)
  - `startPostNavigationSectionPreloads` (afterEach background preload block)
- [`createAppRouter.js`](../../src/systems/routing/createAppRouter.js) now **delegates** to these — hook registration stays in the router, logic lives in sections.
- **Non-blocking rule preserved:** no new `await` on preload network I/O in guards.

---

### Issue 5 — Incomplete public API barrel

**What was broken:** [`systems/sections/index.js`](../../src/systems/sections/index.js) exported only resolver + preloader helpers. CSS loader, orchestrator, `resolveSectionIdentifier`, `resetSectionPreloadState`, manifest helpers, and nav modules were deep-imported from sibling paths across `main.js`, router, i18n, and tests.

**Why it was a problem:** No stable public surface; every consumer hard-coded internal file paths.

**How it was fixed:**
- Expanded barrel to export resolver, preloader, CSS loader, orchestrator, manifest helpers, navigation resources, and navigation hooks.
- Extended [`sectionBarrel.test.js`](../../tests/unit/sectionBarrel.test.js) to assert key exports exist.

---

### Files touched (Phase 2)

**New**
- `src/systems/sections/sectionManifestHelpers.js`
- `src/systems/sections/sectionNavigationResources.js`
- `src/systems/sections/sectionNavigationHooks.js`

**Production (modified)**
- `src/systems/build/manifestLoader.js`
- `src/systems/sections/index.js`
- `src/systems/sections/sectionPreloader.js`
- `src/systems/sections/sectionCssLoader.js`
- `src/systems/sections/sectionPreloadOrchestrator.js`
- `src/systems/routing/routeNavigationResourceLoader.js`
- `src/systems/routing/routeResolver.js`
- `src/systems/routing/index.js`
- `src/systems/routing/createAppRouter.js`
- `src/systems/routing/routeTransition.js`
- `src/systems/routing/routeComponentPreloader.js`
- `src/systems/assets/assetLibrary.js`

**Tests (modified)**
- `tests/unit/sectionBarrel.test.js`
- `tests/unit/sectionPreloader.test.js`
- `tests/unit/sectionCssLoader.test.js`
- `tests/unit/preloadAssetsForSections.test.js`
- `tests/unit/loadAssetsForSectionDedup.test.js`
- `tests/unit/routeInheritance.test.js`
- `tests/unit/routeTransition.test.js`
- `tests/unit/routeComponentPrefetch.test.js`
- `tests/routeTest/sectionPreloadOrchestrator.route.test.js`
- `tests/routeTest/routeTransition.test.js`
- `tests/routeTest/routeComponentPrefetch.test.js`
- `tests/routeTest/routeConcurrency.test.js`

**Docs**
- `developer_tasks/Sections/docs/SECTION_PLAN.md` (current state table)

---

### Architecture after Phase 2

```text
routeConfig.json (section, preLoadSections)
        │
        ▼
createAppRouter.js  ──delegates──►  sectionNavigationHooks.js
        │                                    │
        │                                    ├── sectionNavigationResources.js (CSS/i18n/assets on navigate)
        │                                    ├── sectionPreloadOrchestrator.js (background preload plan)
        │                                    └── sectionPreloader.js / sectionCssLoader.js
        │
        ▼
routeResolver.js  ◄── resolveEffectiveRouteConfig (inheritance — routing owns this)
        │
sectionManifestHelpers.js  ◄── getSectionBundlePaths (runtime manifest — sections own this)
```

### What was NOT changed (intentionally)

- Preload timing and non-blocking contract (still fire-and-forget in guards).
- `routeConfig.json` section / `preLoadSections` values.
- Symbol names (Phase 3 naming audit).
- `src/systems/sections/README.md` doc refresh (Phase 4).

### How it was tested

```bash
npm run test:unit -- --run \
  tests/unit/section*.test.js \
  tests/unit/routeNavigationData.test.js \
  tests/unit/routeInheritance.test.js \
  tests/unit/routeTransition.test.js \
  tests/unit/routeComponentPrefetch.test.js \
  tests/unit/manifestLoader.test.js \
  tests/routeTest/section*.route.test.js \
  tests/routeTest/routeNavigationData.test.js \
  tests/routeTest/routeTransition.test.js \
  tests/routeTest/routeComponentPrefetch.test.js \
  tests/routeTest/routeConcurrency.test.js
```

**Result:** 16 test files passed, 110 tests passed.

### Phase 2 exit

Section structure matches target layout; routing/router delegate to sections; ready for Phase 3 naming.

---

*Add a new section above this line for each completed phase.*
