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

### Issue

1. **Tests:** Audits documented ~11+ files importing dead `src/utils/section/`. Route track Phase 1 (2026-06-16) already updated those paths to `src/systems/sections/`. Re-verified: zero `utils/section` hits in `tests/`.
2. **Production:** `sectionPreloader.js` still imported `./sectionCssLoader.js` via a leftover path `../sections/sectionCssLoader.js` from the old `utils/section/` layout. Both files live in the same folder under `systems/sections/`.

### What changed

| File | Change |
|------|--------|
| `src/systems/sections/sectionPreloader.js` | `../sections/sectionCssLoader.js` → `./sectionCssLoader.js` |

No test file edits required — imports already pointed at `systems/sections/` and `routeNavigationResourceLoader.js`.

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

*Add a new section above this line for each completed phase.*
