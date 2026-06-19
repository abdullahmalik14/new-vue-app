# Route work — master plan

**Date:** 2026-06-10  
**Project:** `new-vue-app-main/`

This plan ties together every route-related report in `Developer Tasks/` and gives a safe order of work. **Renames come after structure moves and import fixes**, not before.

---

## Reports index


| Report                       | What it covers                                       | File                                                                   |
| ---------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Code index                   | Every file/method where route code lives             | [route-code-index.md](./route-code-index.md)                           |
| Router folder audit          | `src/router/` structure vs `notes.md`                | [folder-structure-audit-router.md](./folder-structure-audit-router.md) |
| Systems routing audit        | `systems/routing/` + bleed into i18n/sections/assets | [systems-routing-audit.md](./systems-routing-audit.md)                 |
| Loose route code scan        | Code in wrong layer; test/doc debt                   | [loose-route-code-scan.md](./loose-route-code-scan.md)                 |
| Naming audit (merged)        | 194 suggested renames — filename / method / name     | [route-naming-audit.md](./route-naming-audit.md)                       |
| **Test plan** | Vitest coverage ideas + phases A→G | [route-test-plan.md](../route-test-plan.md) |
| **Change log** | Done work during master plan + tests | [route-cleanup-changelog.md](./route-cleanup-changelog.md) |


**Naming audit batches (archived — use merged file):**  
`route-naming-audit-batch-1.md` … `batch-4.md`

**Removed (do not recreate):** `src/router/README.md`, `src/systems/routing/README.md`, `docs/instruction/RoutingExplained.md` — superseded by [RoutingExplained.md](./RoutingExplained.md) in this folder.

**Related (outside Developer Tasks):** `reports/folder-structure-audit.md`, `reports/folder-structure-audit-router.md`, `notes.md`, `Expanded Vue App Naming Convention.txt`

---

## Rename before or after other fixes?

**After structure and import fixes. Before cosmetic-only cleanup.**

Renaming early makes moves harder: every `git mv` breaks paths you just fixed, and `routeConfig.json` `componentPath` values must stay in sync with template filenames.


| Order | Work type                                                             | Rename?                                                    |
| ----- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1     | Fix broken test imports (`utils/route` → `systems/routing`)           | No — path fix only                                         |
| 2     | Move misplaced **files** (assets, composables, JSON config)           | Move first; **rename during move** if target name is known |
| 3     | Extract slim `router/index.js` → `systems/routing/createAppRouter.js` | New files; old path becomes re-export                      |
| 4     | **Module filename renames** in stable locations                       | `git mv` + update imports                                  |
| 5     | **Method / parameter / variable renames** inside files                | Per-module PRs after filenames settle                      |
| 6     | **Vue `*Page.vue` renames** + `routeConfig.json` `componentPath`      | Last — highest blast radius                                |
| 7     | Docs + `notes.md`                                                     | After code matches reality                                 |


**Rule:** For a file that both **moves** and **renames**, do one step: `git mv` old path → final path (e.g. `systems/routing/routeAssetPrefetch.js` → `systems/assets/routeAssetPreloader.js`).

**Rule:** Do not rename `AuthLogIn.vue` → `LogInPage.vue` until you are ready to update every `componentPath` and import in one PR.

---

## Phased execution

### Phase 0 — Prep (½ day)

1. Read [RoutingExplained.md](./RoutingExplained.md) — developer section for humans, AI section for agents.
2. Read [route-code-index.md](./route-code-index.md) once — know where everything lives.
3. Create branch `refactor/route-cleanup`.
4. Run unit tests; record baseline failures (expect `utils/route` import failures).
5. Agree PR strategy: **one phase per PR** (recommended), not one giant PR.

**Exit:** Branch ready; baseline known; team knows routing docs live in `Developer Tasks/RoutingExplained.md`.

---

### Phase 1 — Unblock tests and CI (1 day)

**Reports:** [loose-route-code-scan.md](./loose-route-code-scan.md) Issue 9

1. Replace all test imports `@/utils/route/` and `../../src/utils/route/` with `@/systems/routing/` (see index Issue 9 list).
2. Fix any remaining `utils/section/` or `utils/translation/` paths in tests if present.
3. Run `npm test` / vitest for `tests/unit/*route`*.
4. Do **not** rename modules yet.

**Exit:** Route unit tests import correct paths.

---

### Phase 2 — File moves (structure, not naming) (2–3 days)

**Reports:** [folder-structure-audit-router.md](./folder-structure-audit-router.md), [systems-routing-audit.md](./systems-routing-audit.md) Issues 1–5, [loose-route-code-scan.md](./loose-route-code-scan.md) Issues 2–5

Do in this order (each sub-step = commit or small PR):


| Step | Action                       | From → To                                                                                        |
| ---- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| 2a   | Move shared asset catalog    | `router/sharedAssetPreloads.json` → `config/sharedAssetPreloads.json` (or `systems/assets/`)     |
| 2b   | Move asset prefetch modules  | `systems/routing/routeAssetPrefetch.js` → `systems/assets/`                                      |
| 2c   | Move asset preload resolver  | `systems/routing/resolveRouteAssetPreloads.js` → `systems/assets/`                               |
| 2d   | Move composable              | `systems/routing/useRoutePrefetch.js` → `composables/useRoutePrefetch.js`                        |
| 2e   | Fix loose consumers          | `AppFooter.vue` → use `getRouteConfiguration()` not raw JSON import                              |
| 2f   | Extract router orchestration | `router/index.js` logic → `systems/routing/createAppRouter.js` (+ helpers); leave thin re-export |
| 2g   | Optional extractions         | `main.js` startup preload → `startupNavigation.js`; locale router wiring → `localeNavigation.js` |


After each move: update imports, run tests, run dev server smoke (`/log-in`, `/dashboard`).

**Naming during move (optional, same commit):** If you already know final names from [route-naming-audit.md](./route-naming-audit.md), rename on arrival:

- `routeAssetPrefetch.js` → `routeAssetPreloader.js`
- `resolveRouteAssetPreloads.js` → `routeAssetPreloadResolver.js`

Skip other filename renames until Phase 3.

**Exit:** Folders match `notes.md`; `router/index.js` is thin; no misplaced JSON in `router/`.

---

### Phase 3 — Module filename renames (1–2 days)

**Report:** [route-naming-audit.md](./route-naming-audit.md) — all `type: filename` entries (18 total)

Use `git mv` only. Update imports/exports in:

- `systems/routing/index.js`
- `router/index.js` re-export
- `build/vite/sectionBundler.js`, `manifestGenerator.js`, etc.
- unit tests

**Suggested batch order:**

1. **Core routing** — `routeAliases.js` → `routeAliasResolver.js`, prefetch/preloader files, `routeNavigationData.js`, etc. (batch 1 filenames)
2. **Cross-system** — `hreflangTags.js` → `routeHreflangTags.js`, `getAssetPreloadEntriesForSection.js` (batch 2)
3. **App/build** — `DevNavBar.vue` → `DevNavigationBar.vue`, `NavDropdown.vue` (batch 3–4)

**Skip for now:** Auth `*Page.vue` renames (Phase 5).

**Exit:** All non-template filename suggestions applied; app builds; tests pass.

---

### Phase 4 — Method and symbol renames (3–5 days, can split by module)

**Report:** [route-naming-audit.md](./route-naming-audit.md) — all `type: method` (31) and `type: name` (145)

Work **one file at a time** (or one folder per PR):

1. `systems/routing/routeGuards.js` — guard result shape (`allow` → `isNavigationAllowed`, etc.)
2. `router/index.js` / `createAppRouter.js` — extract hook registrars if not done in Phase 2
3. `systems/routing/resolveRouteAssetPreloads.js` (or renamed path) — `ref`, `inline`, `rest`
4. `localeManager.js` / `sectionPreloadOrchestrator.js` — cross-system `name` entries
5. `DashboardSharedSidebar.vue` — layout variable shorthand
6. Auth popup inject keys — `popupNavHandler` → `popupRouteNavigationHandler` (**one PR**: `ProfileLoginPopup.vue` + all auth views that `inject` it)

**Tooling tip:** Use IDE rename symbol (F2) so references update. Grep for old string after each file.

**Exit:** No remaining `type: method` / `type: name` items you agreed to adopt (team may defer low-value renames).

---

### Phase 5 — Template page renames (1–2 days)

**Report:** [route-naming-audit.md](./route-naming-audit.md) — auth `type: filename` Page entries

1. `git mv` each `Auth*.vue` → `*Page.vue` per audit.
2. Update **every** `componentPath` in `router/routeConfig.json`.
3. Update static imports in `ProfileLoginPopup.vue`, auth layout, tests.
4. Run `validateRouteComponentPathsOnDisk` / build once.

**Exit:** Template names match `Expanded Vue App Naming Convention` §4.

---

### Phase 6 — Router config and template path fixes (1–2 days)

**Report:** [folder-structure-audit-router.md](./folder-structure-audit-router.md) Issues 4–17

Fix `routeConfig.json` paths that point at wrong template folders (`analytics`, `edit-profile`, demo routes, etc.). Separate from naming — this is **folder structure**.

**Exit:** Every `componentPath` resolves on disk; no orphan template folders.

---

### Phase 7 — Documentation audit (1 day)

**Canonical doc:** [RoutingExplained.md](./RoutingExplained.md)  
**Reports:** [loose-route-code-scan.md](./loose-route-code-scan.md) Issue 10, [systems-routing-audit.md](./systems-routing-audit.md) Issue 6

Routing documentation lives **only** in `Developer Tasks/RoutingExplained.md`. No `README.md` under `src/router/` or `src/systems/routing/`.

#### 7a — Verify RoutingExplained.md matches code (after Phases 1–6)

Audit checklist — update the doc if any item is wrong:

- All module paths say `src/systems/routing/` (not `utils/route/`)
- `routeComponentLoader.js` location and glob paths are correct
- Guard order and `enabled: false` behaviour match `routeGuards.js` / `router/index.js`
- Import examples use `@/systems/routing/...` and `@/app/main.js` where applicable
- “Planned cleanup” section reflects what was actually merged in Phases 2–6
- Links to Developer Tasks audits still valid

#### 7b — Developer-friendly section review

A non-routing developer should be able to:

- Add a route using only the checklist + `routeConfig.schema.md`
- Find where guards, preload, and locale injection run
- Run the correct validation commands
- Debug with the console helpers table

#### 7c — AI agent section review

An agent should be able to:

- Follow hard rules without reading the whole codebase
- Use the canonical import map without guessing
- Know file ownership (what to edit for a new guard vs new page)
- Run the doc maintenance checklist after each refactor PR

#### 7d — Repo-wide doc grep

```bash
# From new-vue-app-main/
rg "utils/route" docs/ tests/ src/
rg "router/README|routing/README" .
rg "docs/instruction/RoutingExplained"
```

Fix every hit: point to `Developer Tasks/RoutingExplained.md` or update stale paths.

#### 7e — Other docs

1. Update `notes.md` with the **actual** approved `systems/routing/` file list.
2. Update `new-vue-app-main/README.md` API table (routing row → `Developer Tasks/RoutingExplained.md`).
3. Optional one-line banner at top of `docs/archived/`* routing mentions: “Historical — see `Developer Tasks/RoutingExplained.md`.”

**Exit:** One canonical routing doc; zero routing READMEs in `src/`; grep for `utils/route` clean in active docs/tests.

---

### Phase 8 — Route test coverage (ongoing)

**Plan:** [route-test-plan.md](../route-test-plan.md)  
**Execution log:** [route-cleanup-changelog.md](./route-cleanup-changelog.md) (Phase A prep+)  
**Helpers:** `tests/helpers/routeFixtures.js`

Start only after Phases 0–7. Implement in order **A → G** (integrity → core → guards → loaders → router → cross-system → hardening). One PR per sub-phase on branch `test/route-coverage`.

**Exit:** All route unit tests pass; production `routeConfig.json` integrity suite green; every `systems/routing/` export has happy + edge coverage per test plan.

---

## PR checklist (every phase)

- Imports updated (grep old path — zero hits)
- `routeConfig.json` `componentPath` updated if templates moved/renamed
- Unit tests for touched modules pass
- Manual: navigate 3 routes, switch locale, hover nav prefetch
- Build succeeds (`npm run build` or project equivalent)

---

## What to defer or skip


| Item                                              | Reason                                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Renaming every `type: name` entry                 | Team can triage — 145 symbols includes optional style (e.g. `headerH` → `headerHeight`) |
| Moving `hreflangTags` to routing                  | Optional architecture — Issues 7/12 in scans                                            |
| Merging `routeNavigation` + `routeNavigationData` | Document in `notes.md` instead if merge is risky                                        |
| Full `localeManager` split                        | Large; only if Phase 2g not enough                                                      |


---

## Quick reference: naming audit format

```text
type: filename | method | name
filename: <file>
method: <symbol>          # when type is method
name: <symbol>            # when type is name (param, local, inject key)
Status: suggested
suggested: <new name>
```

Full list: [route-naming-audit.md](./route-naming-audit.md) (194 entries).

---

## Estimated timeline


| Phase               | Effort                                      |
| ------------------- | ------------------------------------------- |
| 0 Prep              | ½ day                                       |
| 1 Test imports      | 1 day                                       |
| 2 File moves        | 2–3 days                                    |
| 3 Filename renames  | 1–2 days                                    |
| 4 Symbol renames    | 3–5 days                                    |
| 5 Page renames      | 1–2 days                                    |
| 6 routeConfig paths | 1–2 days                                    |
| 7 Docs              | ½ day                                       |
| **Total**           | **~10–16 days** (one developer, phased PRs) |


---

*End of master plan.*