# Asset system — master plan

**Last updated:** 2026-06-20  
**Status:** Phases 0–8 complete — see [assets-cleanup-changelog.md](../assets-cleanup-changelog.md). Naming batches 3–4 and optional handler extraction remain.

---

# Developer section

## Goal

One clear asset layer under `src/systems/assets/`, config in `src/config/`, static files in `src/assets/`, with up-to-date docs and tests.

## Current state

| Area | Status |
|------|--------|
| Core modules in `systems/assets/` | ✅ |
| Docs hub `developer_tasks/Assets/docs/` | ✅ |
| Test imports (`systems/assets`) | ✅ Phase 0 |
| Prefetch/resolver filenames | ✅ Phase 1 |
| `assetPolicy.js` | ✅ Phase 2 |
| `assetHandler.js` rename | ✅ Phase 3 |
| `utils/preload.js` removed | ✅ Phase 4 |
| `authAssetConfig.js` | ✅ Phase 5 |
| Store / composable renames | ✅ Phase 6 |
| `settingConfig` in `config/` + flags | ✅ Phase 7 |
| `useRoutePrefetch` in `composables/` | ✅ (pre-Phase 0) |
| `sharedAssetPreloads.json` in `config/` | ✅ (pre-Phase 0) |
| Docs synced to repo | ✅ Phase 8 |
| Naming audit batches 3–4 | ⏳ Pending |
| `scriptAvailabilityChecker` handler extraction | ⏳ Optional post-P3 |

## Priority work (developer order)

### P0 — breaks clarity / imports

1. Update test imports: `src/utils/assets/*` → `src/systems/assets/*`
2. Move `routeAssetPrefetch.js` + `resolveRouteAssetPreloads.js` to `systems/assets/`
3. Move `sharedAssetPreloads.json` to `config/`

### P1 — structure cleanup

4. Create `assetPolicy.js`; merge `assertAllowedPreloadUrl.js`
5. Rename `assetsHandlerNew.js` → `assetHandler.js`
6. Move `useRoutePrefetch.js` → `composables/`
7. Remove `utils/preload.js`; switch `Cart.vue` / `UploadThumbnailPreview.vue` to `preloadImage`
8. Extract shared `authAssetConfig.js` from six auth views

### P2 — naming alignment

9. Store renames: `addAsset` → `addPreloadedAsset`, `clearState` → `clearPreloadState`, etc.
10. Disambiguate `createRoutePrefetchIntentHandler` (component vs combined)
11. Rename `assertAllowedPreloadUrl` → `assertAllowedAssetUrl`
12. Create `composables/useAssetPrefetch.js` or update `notes.md` if `useRoutePrefetch` covers both

### P3 — documentation & config

13. Move `menuItems.js` / `settingConfig.js` from `src/assets/data/` → `config/`
14. Replace hardcoded ImgBB URLs in `settingConfig.js` with asset flags
15. Legacy `ASSET_MAPPER_QUICK_REFERENCE.md` archived under `docs/legacy/` — use `docs/QUICK_REFERENCE.md`

## Developer checklists

### Adding a new asset flag

- [ ] Add `production` URL in `src/config/assetMap.json`
- [ ] Optional dev/staging overrides
- [ ] `npm run sync:asset-map`
- [ ] Use flag in component via `getAssetUrl('your.flag')`
- [ ] Run `validateAssetMap()` or `tests/unit/assetMap*.test.js`

### Moving a file into `systems/assets/`

- [ ] Update all imports (app + tests)
- [ ] Update `systems/assets/index.js` if public API
- [ ] Update [asset-code-index.md](../asset-code-index.md) if maintained
- [ ] No behaviour change unless task says otherwise

### Before PR

- [ ] No new imports from `@/utils/assets`
- [ ] `initAssetLibrary` / `validateAssetMap` still run at bootstrap
- [ ] Auth and dashboard asset flows manually smoke-tested

## Developer docs map

| Doc | Use when |
|-----|----------|
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Learning the system, daily tasks |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Snippets |
| [src/config/assetMap.README.md](../../../new-vue-app-main/src/config/assetMap.README.md) | Editing JSON maps |
| [src/systems/assets/README.md](../../../new-vue-app-main/src/systems/assets/README.md) | Module reference at code |
| [../README.md](../README.md) | Hub — audits and indexes |
| [../asset-test-plan.md](../asset-test-plan.md) | Vitest test cases (planning — implement after P0 refactor) |

## Audit reports (full detail)

| Report | Issues |
|--------|--------|
| [folder-structure-audit-assets.md](../folder-structure-audit-assets.md) | Structure 1–24 |
| [asset-code-index.md](../asset-code-index.md) | Files and methods |
| [asset-naming-audit-batch-1.md](../asset-naming-audit-batch-1.md) | Core module naming |
| [asset-naming-audit-batch-2.md](../asset-naming-audit-batch-2.md) | Loose module naming |

---

# AI section

## Agent mission

Align asset code with `notes.md` and `Expanded Vue App Naming Convention.txt` without changing runtime behaviour unless the task explicitly requests it.

## Read first (in order)

1. [AI_GUIDE.md](./AI_GUIDE.md)
2. [notes.md](../../../notes.md) — `systems/assets/` target list
3. [asset-code-index.md](../asset-code-index.md) — what exists today
4. [folder-structure-audit-assets.md](../folder-structure-audit-assets.md) — open structure issues

## Batches (naming audit)

| Batch | Scope | Status |
|-------|-------|--------|
| 1 | `systems/assets/` filenames, methods, variables | ✅ Complete |
| 2 | Routing, composables, stores, interactions, utils | ✅ Complete |
| 3 | Template/component consumers + config | ⏳ Pending |
| 4 | Test files | ⏳ Pending |

Proceed one batch at a time when user says **proceed**.

## AI task templates

### Structure-only move (e.g. Issue 1)

```
Move routeAssetPrefetch.js to systems/assets/.
Update imports only. Do not change preload logic.
Export from systems/assets/index.js.
```

### Naming-only rename (e.g. Issue 5)

```
Rename assetsHandlerNew.js → assetHandler.js.
Update imports. No logic changes.
```

### Test path fix

```
Replace src/utils/assets/ with src/systems/assets/ in tests/unit/*.
Run vitest for touched files.
```

## Do not

- Reintroduce `src/utils/assets/`
- Put asset orchestration in `scriptAvailabilityChecker.js` without extracting to assets first
- Use `preloadIcons` from `utils/preload.js` in new code
- Export internal helpers from `index.js` without review
- Skip `validateAssetMap` when editing `assetMap.json`

## Suggested agent prompts

| User intent | Prompt seed |
|-------------|-------------|
| Fix imports | "Update all `utils/assets` test imports to `systems/assets` per ASSET_PLAN P0" |
| Move prefetch | "Implement structure audit Issue 1 — move routeAssetPrefetch to systems/assets" |
| Policy file | "Create assetPolicy.js per AI_GUIDE; consolidate assertAllowedPreloadUrl" |
| Naming batch 3 | "Run asset naming audit batch 3 per ASSET_PLAN" |

## Open issues quick reference

| ID | Summary |
|----|---------|
| 1 | `routeAssetPrefetch.js` in routing → assets |
| 2 | Missing `assetPolicy.js` |
| 3 | `resolveRouteAssetPreloads.js` in routing → assets |
| 5 | `assetsHandlerNew.js` → `assetHandler.js` |
| 13 | Asset logic in `scriptAvailabilityChecker.js` |
| 14–15 | `useRoutePrefetch` / `useAssetPrefetch` composable placement |
| 16 | `sharedAssetPreloads.json` → config |
| 17 | Remove `utils/preload.js` |
| 23 | Fix test import paths |

Full list: [systems-assets-audit.md](../systems-assets-audit.md)

---

*End of master plan.*
