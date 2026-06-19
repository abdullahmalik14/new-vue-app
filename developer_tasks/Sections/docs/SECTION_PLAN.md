# Section system — master plan

**Last updated:** 2026-06-19  
**Status:** Phases 0–4 complete (imports, structure, naming, docs). Section test expansion is a separate track per [section-test-plan.md](../section-test-plan.md).

---

# Developer section

## Goal

One clear section layer under `src/systems/sections/`, with manifest helpers extracted, nav resource loads owned by sections, and up-to-date docs and tests.

## Current state

| Area | Status |
|------|--------|
| Core modules in `systems/sections/` | ✅ Migrated from `utils/section/` |
| Docs hub `Developer Tasks/Sections/docs/` | ✅ This folder |
| Structure audit | ✅ 5 issues documented |
| Code audit | ✅ 12 issues documented |
| Loose code scan | ✅ Wrong-layer code mapped |
| Naming audit (45 items) | ✅ Phase 3 applied (batch 1 + interconnected batch 2 symbols) |
| Tests import paths | ✅ Fixed (Route Phase 1 + Sections Phase 1 verified) |
| `sectionPreloader.js` stale import | ✅ Fixed (`./sectionCssLoader.js`) |
| `sectionManifestHelpers.js` | ✅ Created; runtime manifest logic moved from `build/manifestLoader.js` |
| Nav resource loads | ✅ `sectionNavigationResources.js`; routing re-export kept |
| Router section hooks | ✅ Extracted to `sectionNavigationResources.js` + `sectionNavigationHooks.js` |
| `resolveEffectiveRouteConfig` | ✅ Moved to `systems/routing/routeResolver.js` |
| `systems/sections/index.js` barrel | ✅ Full public API exported |
| Developer docs (`Sections/docs/`) | ✅ Synced with code (Phase 4) |
| `src/systems/sections/README.md` | ✅ Deprecation banner only |
| Legacy `docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md` | ✅ Stale-path banner added |

## Priority work (developer order)

Phases 0–4 are **complete**. Next work (separate branch/PRs):

### P4 — section test coverage (after cleanup)

Follow [section-test-plan.md](../section-test-plan.md) phases A→G on branch `test/section-coverage`.

### Historical priorities (done)

#### P0 — breaks clarity / imports ✅

1. Update test imports: `src/utils/section/*` → `src/systems/sections/*`
2. Fix `sectionPreloader.js` stale import `../sections/sectionCssLoader.js` → `./sectionCssLoader.js` ✅

### P1 — structure cleanup ✅

3. Create `sectionManifestHelpers.js`; slim `manifestLoader.js`
4. Complete `systems/sections/index.js` barrel
5. Move `startCurrentSectionResourceLoads` from `routeNavigationData.js` into sections
6. Extract router section blocks to a sections hook module ✅

### P2 — naming alignment ✅

7. Batch 1: filenames/methods in `systems/sections/` per naming audit
8. Batch 2: interconnected files (manifest, assets, nav resources)
9. `resolveRolePreLoadSections` → `resolveRolePreloadSections`; store/helper disambiguation ✅

### P3 — documentation ✅

10. Keep `Developer Tasks/Sections/docs/` current after each phase ✅
11. Deprecation banner on `src/systems/sections/README.md` ✅
12. Flag or update `docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md` stale paths ✅

## Rename before or after other fixes?

**After structure and import fixes.**

| Order | Work | Rename? |
|-------|------|---------|
| 1 | Fix test imports `utils/section` → `systems/sections` | Path only |
| 2 | Create `sectionManifestHelpers.js`; slim `manifestLoader` | Move logic |
| 3 | Move `routeNavigationData` section loads into sections | Move + optional rename |
| 4 | Extract section hooks from `router/index.js` | New modules |
| 5 | Filename renames per naming audit | `git mv` |
| 6 | Method / variable renames | Per-module PRs |
| 7 | Update `Developer Tasks/Sections/docs/` | Docs |

## Developer checklists

### Adding a new section

- [ ] Add `section` / `preLoadSections` in `routeConfig.json`
- [ ] Verify `section-manifest.json` entry after build
- [ ] Add i18n folder if section-scoped translations
- [ ] Smoke test cold load + navigate back

### Moving logic into `systems/sections/`

- [ ] Update all imports (app + tests)
- [ ] Update `systems/sections/index.js` if public API
- [ ] No behaviour change unless task says otherwise

### Before PR

- [ ] No new imports from `@/utils/section`
- [ ] Section preload still runs at startup and `afterEach`
- [ ] Auth and dashboard section flows manually smoke-tested

## Developer docs map

| Doc | Use when |
|-----|----------|
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Learning the system, daily tasks |
| [AI_GUIDE.md](./AI_GUIDE.md) | Agent constraints |
| [../README.md](../README.md) | Audit issues and naming batches |

## Audit reports (full detail)

| Report | Issues |
|--------|--------|
| [folder-structure-audit-systems-sections.md](../folder-structure-audit-systems-sections.md) | Structure 1–5 |
| [sections-code-audit.md](../sections-code-audit.md) | Code 1–12 |
| [loose-section-code-scan.md](../loose-section-code-scan.md) | Wrong-layer code |
| [sections-naming-audit.md](../sections-naming-audit.md) | 45 rename suggestions |

---

# AI section

## Agent mission

Align section code with `notes.md` and `Expanded Vue App Naming Convention.txt` without changing runtime behaviour unless the task explicitly requests it.

## Read first (in order)

1. [AI_GUIDE.md](./AI_GUIDE.md)
2. [notes.md](../../../notes.md) — `systems/sections/` target list
3. [section-code-index.md](../section-code-index.md) — what exists today
4. [sections-code-audit.md](../sections-code-audit.md) — open structure issues

## Phased execution

| Phase | Work | Est. |
|-------|------|------|
| 0 | Read docs + baseline vitest | ½ day |
| 1 | Test import fixes | 1 day |
| 2 | Structure (manifest helper, barrel, nav moves) | 2–3 days |
| 3 | Naming batches 1–2 | 2 days |
| 4 | Docs refresh | ½ day |

Proceed one phase at a time when user says **proceed**.

## AI task templates

### Test path fix

```
Replace src/utils/section/ with src/systems/sections/ in tests/unit/section*.
Run vitest for touched files. No renames.
```

### Structure-only move

```
Create sectionManifestHelpers.js; move getSectionBundlePaths helpers from manifestLoader.
Update imports only. Do not change preload logic.
```

### Naming-only rename

```
Rename per sections-naming-audit batch N.
Update imports. No logic changes.
```

## Do not

- Reintroduce `src/utils/section/`
- Put section orchestration permanently in `router/index.js`
- Rename route modules in section-only PRs
- Skip updating `Developer Tasks/Sections/docs/` after public API changes

## Suggested agent prompts

| User intent | Prompt seed |
|-------------|-------------|
| Fix imports | "Update all `utils/section` test imports to `systems/sections` per SECTION_PLAN P0" |
| Manifest helper | "Create sectionManifestHelpers.js per SECTION_PLAN P1" |
| Nav move | "Move section resource loads from routeNavigationData into systems/sections" |
| Naming batch 1 | "Run sections naming audit batch 1 per SECTION_PLAN P2" |

## Out of scope (route track)

- `systems/routing/*` except `routeNavigationData.js` section loads
- `router/index.js` locale/guards (see Route plan)
- `hreflangTags`, pure routing prefetch files

---

*End of master plan.*
