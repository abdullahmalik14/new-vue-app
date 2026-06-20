# Asset system — AI guide

**Audience:** Cursor agents, codegen, audit bots.  
**Last updated:** 2026-06-10  
**Primary naming reference:** `docs/tasks/Expanded Vue App Naming Convention.txt`

Read this before editing any asset-related file.

---

## Hard rules

1. **Do not change runtime behaviour** during structure/naming refactors unless explicitly asked.
2. **New asset system code** goes in `src/systems/assets/` — never `src/utils/assets/`.
3. **Static files** (CSS, images, fonts) go in `src/assets/` — not JS modules.
4. **Config JSON** goes in `src/config/` — not `src/assets/data/` for new work.
5. **Do not** put asset preload policy in `components/`, `services/`, or `router/` (except route JSON config).
6. **Use `@/systems/assets/...` imports** in app code; update tests when touching them.
7. **Barrel** (`systems/assets/index.js`) — only export stable public API; no blind `export *`.
8. **No shorthand variables** in new code: use `error` not `err`, `environment` not `env`, `element` not `el`.

---

## Target structure (`notes.md`)

```
systems/assets/
  index.js
  assetLibrary.js
  assetPreloader.js
  assetScanner.js
  assetPolicy.js          ← missing; consolidate from assertAllowedPreloadUrl.js
  assetMapSource.js
  routeAssetPrefetch.js   ← currently in systems/routing/
```

---

## Where to put new code

| Task | File(s) |
|------|---------|
| New flag / URL resolution | `assetLibrary.js`, `config/assetMap.json` |
| New preload type / URL guard | `assetPolicy.js` (future), `assetPreloader.js` |
| Route preload ref expansion | `resolveRouteAssetPreloads.js` → `systems/assets/` |
| Hover prefetch | `routeAssetPrefetch.js` → `systems/assets/` |
| Component flag scan | `assetScanner.js` |
| Shared dashboard chrome assets | `resolveSharedComponentAssets.js` |
| Auth script injection | `assetHandler.js` + `assetHandlerFactory.js` |
| Preload cache state | `stores/usePreloadStore.js` |
| Reactive flag in Vue | `composables/useAssetUrl.js` or `useAssetPrefetch.js` |

---

## Approved naming (Expanded convention)

**Files:** `camelCase.js` — `assetLibrary.js`, `assetPreloader.js`, `routeAssetPrefetch.js`  
**Class:** `AssetHandler` in `assetHandler.js` (not `assetsHandlerNew.js`)  
**Methods:** verb-first camelCase — `getAssetUrl`, `preloadSectionAssets`, `assertAllowedAssetUrl`  
**Store actions:** `addPreloadedAsset`, `addPreloadedSection`, `clearPreloadState`  
**Composables:** `useAssetUrl`, `useAssetPrefetch`, `useRoutePrefetch`  
**Constants:** `UPPER_SNAKE_CASE`

---

## Known issues — do not worsen

| Issue | Detail |
|-------|--------|
| Name collision | `createRoutePrefetchIntentHandler` in both `routeComponentPrefetch.js` (component only) and `useRoutePrefetch.js` (combined) |
| Missing file | `assetPolicy.js`, `composables/useAssetPrefetch.js` |
| Wrong location | `routeAssetPrefetch.js`, `resolveRouteAssetPreloads.js`, `useRoutePrefetch.js`, `sharedAssetPreloads.json` |
| Legacy utils | `src/utils/preload.js` (`preloadIcons`) — use `assetPreloader.preloadImage` |
| Stale tests | `tests/**` imports `src/utils/assets/*` |
| Duplicate auth config | Six auth views each define `assetsConfig` inline |

---

## Audit artifacts (read before large refactors)

| Report | Content |
|--------|---------|
| [folder-structure-audit-assets.md](../folder-structure-audit-assets.md) | 24 structure issues |
| [asset-code-index.md](../asset-code-index.md) | All files and methods |
| [asset-naming-audit-batch-1.md](../asset-naming-audit-batch-1.md) | `systems/assets/` naming |
| [asset-naming-audit-batch-2.md](../asset-naming-audit-batch-2.md) | Loose modules naming |
| [../README.md](../README.md) | Hub — all asset tasks |

---

## Safe edit checklist

- [ ] Import path uses `@/systems/assets/` not `@/utils/assets/`
- [ ] New flags added to `production` in `assetMap.json`
- [ ] `validateAssetMap()` / relevant unit tests considered
- [ ] No new asset logic in `utils/`, `router/*.js` (JSON config OK), or `interactions/` unless thin wrapper
- [ ] Method names follow verb-first convention
- [ ] Behaviour unchanged if task is structure-only

---

## When asked to "add asset preload policy"

Per architecture guidelines §37.3:

```
systems/assets/assetPolicy.js   → assertAllowedAssetUrl(), validateAssetPreloadEntry()
systems/assets/assetPreloader.js → preloadAsset()
config/assetMap.json
```

Do **not** create `utils/assets.js`, `components/AssetPreloader.vue`, or `services/assets/`.

---

## Related AI context

- Workspace: [notes.md](../../../notes.md) — layer responsibilities
- Sections coupling: `sectionPreloader.js` → `preloadSectionAssets`
- Routing coupling: `routeConfigLoader.js` → `resolveRouteAssetPreloads`, validators
