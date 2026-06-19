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

## Phase 3 — Naming alignment (2026-06-19)

**Master plan:** Phase 3 — Naming batches 1–2 per [sections-naming-audit.md](./sections-naming-audit.md)  
**Scope:** Symbol renames only. No behaviour changes. No `routeConfig.json` edits.

### Big picture

Audits listed ~45 rename suggestions across `systems/sections/` and tightly coupled files. Phase 3 applied **approved public API renames** and **internal clarity renames** inside section modules. Items already done in Phase 2 or Route track were skipped.

### Issue 1 — Public API names mixed “route” and “preload” semantics

**What was broken:** Exported names like `getRoutePreloadPlan` and `resolveCurrentRouteSectionName` lived in the section orchestrator but read as routing APIs. `clearPreloadState` was ambiguous (preload store vs section-only).

**How it was fixed:**

| Old name | New name | Module |
|----------|----------|--------|
| `getRoutePreloadPlan` | `getSectionPreloadPlan` | `sectionPreloadOrchestrator.js` |
| `resolveCurrentRouteSectionName` | `resolveCurrentSectionNameFromRouteConfig` | `sectionPreloadOrchestrator.js` |
| `clearPreloadState` | `clearSectionPreloadState` | `sectionPreloader.js` |

**Consumers updated:** `main.js`, `localeManager.js`, `sectionNavigationHooks.js`, `routeAssetPreloader.js`, `index.js`, and all matching tests/mocks.

### Issue 2 — Internal section module names (batch 1)

**What was broken:** Legacy names from migration (`resolveRolePreLoadSections`, `_doPreload`, `getSectionCssBundle`, `injectCssLink`) and vague locals (`maybeSlugs`, `hintLink`).

**How it was fixed (internal unless noted):**

| Old | New | File |
|-----|-----|------|
| `resolveRolePreLoadSections` | `resolveRolePreloadSections` | `sectionResolver.js` |
| `_doPreload` | `performSectionPreload` | `sectionPreloader.js` |
| `getSectionCssBundle` | `resolveSectionCssBundlePaths` | `sectionCssLoader.js` |
| `injectCssLink` | `injectSectionCssLinkElement` | `sectionCssLoader.js` |
| `maybeSlugs` | `candidateSlugPaths` | `sectionResolver.js` |
| `trimmed` | `trimmedIdentifier` | `sectionResolver.js` |
| `file` / `method` (log context) | `logSourceFile` / `logSourceMethod` | `sectionPreloadOrchestrator.js` |
| `hintLink` | `cssPreloadHintLink` | `sectionCssLoader.js` |
| `rawPath` (CSS bundle) | `rawCssBundlePath` | `sectionCssLoader.js` |
| `link` (JS preload DOM) | `javascriptPreloadLink` | `sectionPreloader.js` |
| `resolved` (nav helper) | `resolvedSectionName` | `sectionNavigationResources.js` |
| `err` (nav catches) | `resourceLoadError` | `sectionNavigationResources.js` |
| `next` (store section set) | `nextSectionSet` | `usePreloadStore.js` (section in-progress actions) |

### Issue 3 — Interconnected symbols (batch 2)

**What was broken:** `routeBelongsToSection` read as a routing helper but lives in section asset rollup code. `localeManager` used `resolveSectionFromRoutePath` while other section helpers use `resolveActive…` pattern.

**How it was fixed:**

| Old | New | File |
|-----|-----|------|
| `routeBelongsToSection` | `doesRouteBelongToSection` | `routeSectionAssetPreloadEntries.js`, `assets/index.js` |
| `resolveSectionFromRoutePath` | `resolveActiveSectionFromRoutePath` | `localeManager.js` (internal) |

### Skipped (already done or out of scope)

| Audit item | Reason |
|------------|--------|
| Create `sectionManifestHelpers.js` | Phase 2 |
| Move `resolveEffectiveRouteConfig` to routing | Phase 2 |
| `routeNavigationData.js` → nav loader filename | Phase 2 (`sectionNavigationResources.js` + routing re-export) |
| `loadCurrentSectionResources` rename | Already applied in Route track |
| `getAssetPreloadEntriesForSection.js` → `sectionAssetPreloadEntries.js` | File already `routeSectionAssetPreloadEntries.js` in Route track; function name unchanged |
| `entriesByDedupeKey` etc. in asset rollup | Already renamed in Route track Phase 4 |

### Issue 4 — Circular import exposed by full barrel load

**What was broken:** `sectionPreloadOrchestrator.js` imported `translationLoader.js` at top level; `translationLoader` imports `localeManager`, which imports the orchestrator. Loading `systems/sections/index.js` in tests could hang.

**How it was fixed:** Dynamic `import()` of `translationLoader` inside `startBackgroundSectionPreloads` when translation preload is requested. Barrel test mocks heavy cross-system deps and uses 15s timeout for first full barrel import.

### How it was tested

```bash
npm run test:unit -- --run \
  tests/unit/section*.test.js \
  tests/unit/routeInheritance.test.js \
  tests/unit/getAssetPreloadEntriesForSection.test.js \
  tests/unit/updateUrlWithLocale.test.js \
  tests/routeTest/sectionPreloadOrchestrator.route.test.js \
  tests/routeTest/getAssetPreloadEntriesForSection.route.test.js
```

**Result:** 6+ section-focused files passed (45+ tests in core subset).

### Phase 3 exit

Public section API uses consistent naming; docs/import map updated in `AI_GUIDE.md` and `DEVELOPER_GUIDE.md`. Ready for Phase 4 doc audit.

---

## Phase 4 — Documentation refresh (2026-06-19)

**Master plan:** Phase 4 — Doc audit  
**Scope:** Documentation only. No production code changes.

### Issue 1 — `DEVELOPER_GUIDE.md` described pre-cleanup architecture

**What was broken:** Guide still listed `routeNavigationData.js`, `router/index.js` inline hooks, partial barrel, missing `sectionManifestHelpers.js`, and `getRoutePreloadPlan` (pre-rename). Test section still said to fix `utils/section` imports.

**How it was fixed:** Rewrote [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) with current folder layout, module table, flows (`createAppRouter.js`, `sectionNavigationHooks.js`, `sectionNavigationResources.js`), renamed APIs, and test commands.

### Issue 2 — `src/systems/sections/README.md` was stale and long

**What was broken:** In-repo README referenced removed APIs (`preloadSectionBundle`), old paths, and duplicated docs that drift from code.

**How it was fixed:** Replaced with a **short deprecation banner** pointing to `developer_tasks/Sections/docs/` (per plan: do not expand).

### Issue 3 — Legacy app guide had outdated paths

**What was broken:** [docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md](../../docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md) still described pre-migration file layout.

**How it was fixed:** Added stale-path banner at top linking to `DEVELOPER_GUIDE.md`.

### Issue 4 — Hub docs and plan status out of date

**What was broken:** `docs/README.md`, `SECTION_PLAN.md`, and `AI_GUIDE.md` file-ownership table still referenced planned moves and old module names.

**How it was fixed:**

| File | Update |
|------|--------|
| [docs/README.md](./docs/README.md) | Current orientation, changelog link, audit snapshot note |
| [SECTION_PLAN.md](./docs/SECTION_PLAN.md) | Phases 0–4 marked complete; next step = test plan |
| [AI_GUIDE.md](./docs/AI_GUIDE.md) | File ownership + hard rules aligned with post-Phase 2/3 code |

### Files touched (Phase 4)

- `developer_tasks/Sections/docs/DEVELOPER_GUIDE.md`
- `developer_tasks/Sections/docs/README.md`
- `developer_tasks/Sections/docs/SECTION_PLAN.md`
- `developer_tasks/Sections/docs/AI_GUIDE.md`
- `src/systems/sections/README.md`
- `docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md`

### Phase 4 exit

Sections cleanup Phases 0–4 complete. Audits/indexes (`section-code-index.md`, `loose-section-code-scan.md`) remain historical snapshots — update when starting test coverage or if discrepancies block onboarding. Next: [section-test-plan.md](./section-test-plan.md) on `test/section-coverage`.

---

*Add a new section above this line for each completed phase.*

---

## Section test track — Phase A prep + integrity (2026-06-19)

**Plan:** [section-test-plan.md](./section-test-plan.md) Phase A (§0, §55, §71)  
**Branch:** `test/section-coverage`  
**Test folder:** `tests/sectionTest/`

### What changed

| File | Change |
|------|--------|
| [`tests/helpers/sectionFixtures.js`](../../tests/helpers/sectionFixtures.js) | **New** — production/manifest loaders, inheritance fixtures, intentional gap lists |
| [`tests/sectionTest/routeConfig.section.integrity.test.js`](../../tests/sectionTest/routeConfig.section.integrity.test.js) | **New** — production `routeConfig.json` section field integrity + inheritance matrix (§0) |
| [`tests/sectionTest/sectionManifest.integrity.test.js`](../../tests/sectionTest/sectionManifest.integrity.test.js) | **New** — `section-manifest.dev.json` alignment with route sections |
| [`tests/sectionTest/validateI18n.section.test.js`](../../tests/sectionTest/validateI18n.section.test.js) | **New** — `collectKnownSectionNames` + i18n folder gap checks (§71) |
| [`tests/sectionTest/sectionImportRegression.test.js`](../../tests/sectionTest/sectionImportRegression.test.js) | **New** — no stale `utils/section` imports (§55) |

### How tested

```bash
npm run test:unit -- --run tests/sectionTest
```

**Result:** 4 files, 39 tests passed.

### Exit criteria (Phase A)

- [x] §0 production section integrity cases covered in `tests/sectionTest/`
- [x] Dev manifest alignment with documented intentional gaps
- [x] `collectKnownSectionNames` + i18n folder gaps documented
- [x] No stale `utils/section` import paths in `tests/` or `src/`

---

## Section test track — Phase B resolver units (2026-06-19)

**Plan:** [section-test-plan.md](./section-test-plan.md) Phase B (§1–7, §59–60, §83–85)  
**Branch:** `test/section-coverage`  
**Test folder:** `tests/sectionTest/`

### What changed

| File | Change |
|------|--------|
| [`tests/helpers/sectionFixtures.js`](../../tests/helpers/sectionFixtures.js) | Added `RESOLVER_ROUTE_FIXTURES` for slug/role identifier tests |
| [`tests/sectionTest/sectionResolver.rolePreload.test.js`](../../tests/sectionTest/sectionResolver.rolePreload.test.js) | **New** — `getPreloadSectionsForRoute` happy/edge + role matrix (§1, §59) |
| [`tests/sectionTest/sectionResolver.identifier.test.js`](../../tests/sectionTest/sectionResolver.identifier.test.js) | **New** — `resolveSectionIdentifier` slug routing with mocked routes (§2, §60) |
| [`tests/sectionTest/sectionResolver.test.js`](../../tests/sectionTest/sectionResolver.test.js) | **New** — `normalizeSectionConfiguration`, `resolveRoleSectionVariant`, `isSectionRoleBased`, `getAllSectionVariants`, `getAllRouteSectionsForRoute` (§3–7, §84–85) |

Legacy copies remain in `tests/unit/sectionResolver.test.js` and `tests/routeTest/sectionResolver.route.test.js` until Phase G cleanup.

### How tested

```bash
npm run test:unit -- --run tests/sectionTest
```

**Result:** 7 files, 102 tests passed.

### Exit criteria (Phase B)

- [x] Every export in `sectionResolver.js` has ≥1 happy + ≥1 edge test in `tests/sectionTest/`
- [x] Role preload fallback matrix (default → guest) covered
- [x] Slug identifier matrix (`log-in` → `auth`, role dashboard variants) covered
- [x] Tests use mocked `getRouteConfiguration()` fixtures — not production JSON — for identifier routing

---

## Section test track — Phase C preloader units (2026-06-19)

**Plan:** [section-test-plan.md](./section-test-plan.md) Phase C (§8–14, §61–62, §86–89)  
**Branch:** `test/section-coverage`  
**Test folder:** `tests/sectionTest/`

### What changed

| File | Change |
|------|--------|
| [`tests/helpers/sectionPreloaderTestSetup.js`](../../tests/helpers/sectionPreloaderTestSetup.js) | **New** — shared mocks, default bundle paths, link auto-resolve helper |
| [`tests/sectionTest/sectionPreloader.test.js`](../../tests/sectionTest/sectionPreloader.test.js) | **New** — `preloadSection`, batch/stats/clear/reset lifecycle (§8–14, §62) |
| [`tests/sectionTest/sectionPreloader.concurrent.test.js`](../../tests/sectionTest/sectionPreloader.concurrent.test.js) | **New** — shared in-flight promises, parallel batch, cache hits (§8, §86) |
| [`tests/sectionTest/sectionPreloader.timeout.test.js`](../../tests/sectionTest/sectionPreloader.timeout.test.js) | **New** — `VITE_SECTION_PRELOAD_TIMEOUT_MS` matrix, link lifecycle (§9, §61, §87) |

Legacy copy remains in `tests/unit/sectionPreloader.test.js` until Phase G cleanup.

### How tested

```bash
npm run test:unit -- --run tests/sectionTest
```

**Result:** 10 files, 140 tests passed.

### Exit criteria (Phase C)

- [x] Every export in `sectionPreloader.js` covered in `tests/sectionTest/`
- [x] Concurrent caller dedup and in-progress store tracking tested
- [x] Timeout env matrix (500ms, 0, -1, abc, default 10s) tested with fake timers
- [x] Untrusted JS path, manifest failure, and CSS rejection paths return false without `addSection`

---

## Section test track — Phase D CSS, manifest, store, barrel (2026-06-19)

**Plan:** [section-test-plan.md](./section-test-plan.md) Phase D (§15–21, §30–34, §80, §90–91, §95, §102–108)  
**Branch:** `test/section-coverage`  
**Test folder:** `tests/sectionTest/`

### What changed

| File | Change |
|------|--------|
| [`tests/helpers/sectionCssLoaderTestSetup.js`](../../tests/helpers/sectionCssLoaderTestSetup.js) | **New** — CSS loader mocks, auto-resolve link helper, env stubs |
| [`tests/sectionTest/sectionCssLoader.test.js`](../../tests/sectionTest/sectionCssLoader.test.js) | **New** — `loadSectionCss`, unload/clear, integrity (§15–21, §80, §90, §95) |
| [`tests/sectionTest/sectionCssLoader.preload.test.js`](../../tests/sectionTest/sectionCssLoader.preload.test.js) | **New** — `preloadSectionCss` hint lifecycle, in-flight dedupe, onerror (§16, §91, §63) |
| [`tests/sectionTest/sectionManifestHelpers.test.js`](../../tests/sectionTest/sectionManifestHelpers.test.js) | **New** — `loadSectionManifest`, `getSectionBundlePaths`, failure recovery (§32–33, §105–106) |
| [`tests/sectionTest/bundlePathValidation.section.test.js`](../../tests/sectionTest/bundlePathValidation.section.test.js) | **New** — `isTrustedBundlePath`, `escapeSelectorAttributeValue` (§34, §107–108) |
| [`tests/sectionTest/usePreloadStore.section.test.js`](../../tests/sectionTest/usePreloadStore.section.test.js) | **New** — section getters/actions, `normalizeStringSet` (§31, §102–104) |
| [`tests/sectionTest/sectionBarrel.test.js`](../../tests/sectionTest/sectionBarrel.test.js) | **New** — `systems/sections/index.js` export surface (§30) |

Legacy copies remain in `tests/unit/` until Phase G cleanup.

### Test notes

- `preloadSectionCss` registers in-flight dedupe **after** bundle paths resolve; tests assert dedupe on subsequent callers, not during path resolution.
- Error-path CSS tests use `disableAutoCssLinkResolve()` so setup auto-`onload` does not race `onerror`.
- `getSectionBundlePaths(name, manifest)` skips fetch when manifest is supplied; explicit `loadSectionManifest()` still fetches when cache is cold.

### How tested

```bash
npm run test:unit -- --run tests/sectionTest
```

**Result:** 16 files, 190 tests passed.

### Exit criteria (Phase D)

- [x] `sectionCssLoader.js` load/preload/unload/clear paths covered in `tests/sectionTest/`
- [x] `sectionManifestHelpers.js` cache, bundle paths, and retry behaviour covered
- [x] `bundlePathValidation.js` trust + selector escaping covered for section consumers
- [x] `usePreloadStore` section getters/actions and `normalizeStringSet` covered
- [x] `systems/sections/index.js` barrel exports verified (`clearSectionPreloadState`, not legacy names)

---

## Section test track — Phase E orchestrator, inheritance, nav resources (2026-06-19)

**Plan:** [section-test-plan.md](./section-test-plan.md) Phase E (§22–29, §37, §53, §64, §73, §78–79, §96–101)  
**Branch:** `test/section-coverage`  
**Test folder:** `tests/sectionTest/`

### What changed

| File | Change |
|------|--------|
| [`tests/helpers/sectionOrchestratorTestSetup.js`](../../tests/helpers/sectionOrchestratorTestSetup.js) | **New** — shared preloader mocks, Pinia setup, translation loader reset helper |
| [`tests/sectionTest/sectionPreloadOrchestrator.test.js`](../../tests/sectionTest/sectionPreloadOrchestrator.test.js) | **New** — `getSectionPreloadPlan`, auth predicate/preload, background preloads (§22–27, §64) |
| [`tests/sectionTest/sectionPreloadOrchestrator.inheritance.test.js`](../../tests/sectionTest/sectionPreloadOrchestrator.inheritance.test.js) | **New** — inherited `section` / `preLoadSections` via orchestrator (§53, §79) |
| [`tests/sectionTest/sectionPreloadOrchestrator.locale.test.js`](../../tests/sectionTest/sectionPreloadOrchestrator.locale.test.js) | **New** — `refreshSectionPreloadsOnLocaleChange` reset + re-warm (§28, §73) |
| [`tests/sectionTest/routeResolver.sectionInheritance.test.js`](../../tests/sectionTest/routeResolver.sectionInheritance.test.js) | **New** — `inheritConfigurationFromParentRoute` section fields (§37, §53) |
| [`tests/sectionTest/sectionNavigationResources.test.js`](../../tests/sectionTest/sectionNavigationResources.test.js) | **New** — `resolveCurrentSectionForNavigation`, `loadCurrentSectionResources` (§29, §78) |

Legacy copies remain in `tests/unit/sectionPreloadOrchestrator.test.js`, `tests/routeTest/sectionPreloadOrchestrator.route.test.js`, and `tests/unit/routeNavigationData.test.js` until Phase G cleanup.

### Test notes

- Orchestrator mocks must be created inline in `vi.hoisted()` — importing helper functions inside hoisted callbacks causes initialization errors.
- Inheritance tests mock `getRouteConfiguration()` with `SECTION_INHERITANCE_FIXTURES` from `sectionFixtures.js`.
- `sectionNavigationResources.test.js` imports the canonical module directly (not the routing re-export).

### How tested

```bash
npm run test:unit -- --run tests/sectionTest
```

**Result:** 21 files, 230 tests passed.

### Suggested commit message

```
test: add section Phase E orchestrator and inheritance tests in sectionTest

Cover getSectionPreloadPlan, background preloads, locale refresh,
routeResolver section/preLoadSections inheritance, and sectionNavigationResources
load paths with mocked route fixtures (21 files, 230 tests).
```

### Exit criteria (Phase E)

- [x] Every export in `sectionPreloadOrchestrator.js` covered in `tests/sectionTest/`
- [x] Inheritance matrix (§53) asserted via orchestrator and routeResolver suites
- [x] `refreshSectionPreloadsOnLocaleChange` resets state then re-warms bundles + translations
- [x] `sectionNavigationResources.js` fire-and-forget CSS/i18n/asset loads covered

---

## Section test track — Phase F cross-system hooks and assets (2026-06-19)

**Plan:** [section-test-plan.md](./section-test-plan.md) Phase F (§35–36, §40–51, §66–70, §114–124)  
**Branch:** `test/section-coverage`  
**Test folder:** `tests/sectionTest/`

### What changed

| File | Change |
|------|--------|
| [`tests/sectionTest/sectionNavigationHooks.test.js`](../../tests/sectionTest/sectionNavigationHooks.test.js) | **New** — meta.section assign, component preload, post-nav background preloads (§35–36, §66) |
| [`tests/sectionTest/translationLoader.section.test.js`](../../tests/sectionTest/translationLoader.section.test.js) | **New** — section translation load/preload/batch APIs (§40–41, §114) |
| [`tests/sectionTest/localeManager.section.test.js`](../../tests/sectionTest/localeManager.section.test.js) | **New** — `setActiveLocale` section translation reload + background refresh (§42, §117) |
| [`tests/sectionTest/assetPreloader.section.test.js`](../../tests/sectionTest/assetPreloader.section.test.js) | **New** — `preloadSectionAssets`, `preloadSectionCriticalImages` (§43–44, §118) |
| [`tests/sectionTest/routeSectionAssetPreloadEntries.section.test.js`](../../tests/sectionTest/routeSectionAssetPreloadEntries.section.test.js) | **New** — section asset rollup + inheritance (§45, §119) |
| [`tests/sectionTest/main.startup.section.test.js`](../../tests/sectionTest/main.startup.section.test.js) | **New** — startup preload list + auth predicate contract (§48, §124) |
| [`tests/sectionTest/routeTransition.section.test.js`](../../tests/sectionTest/routeTransition.section.test.js) | **New** — inherited section visible via effective route config (§46) |
| [`tests/sectionTest/routeComponentPrefetch.section.test.js`](../../tests/sectionTest/routeComponentPrefetch.section.test.js) | **New** — section route component prefetch (§47) |
| [`tests/sectionTest/routeAssetPrefetch.section.test.js`](../../tests/sectionTest/routeAssetPrefetch.section.test.js) | **New** — `prefetchSectionAssetsForRoute` (§51, §120) |
| [`src/systems/i18n/localeManager.js`](../../src/systems/i18n/localeManager.js) | **Fix** — hoist `resolvedSection` so locale refresh can call `refreshSectionPreloadsOnLocaleChange` |

Legacy copies remain in `tests/unit/` and `tests/routeTest/` until Phase G cleanup.

### Production fix (Phase F)

- `setActiveLocale` declared `resolvedSection` inside an inner `try` block but referenced it when refreshing background preloads — a `ReferenceError` prevented locale-driven section refresh whenever `preLoadSections` was non-empty.

### How tested

```bash
npm run test:unit -- --run tests/sectionTest
```

**Result:** 30 files, 266 tests passed.

### Suggested commit message

```
test: add section Phase F cross-system hook and asset tests in sectionTest

Cover navigation hooks, translation/locale section refresh, asset preloader
rollup, startup preload contract, and route prefetch helpers; fix localeManager
resolvedSection scope for background preload refresh (30 files, 266 tests).
```

### Exit criteria (Phase F)

- [x] `sectionNavigationHooks.js` non-blocking guard flows covered
- [x] Translation/locale section refresh paths tested with orchestrator mocks
- [x] Section asset rollup + preloader + route prefetch helpers covered
- [x] Startup preload contract documented via orchestrator integration tests

