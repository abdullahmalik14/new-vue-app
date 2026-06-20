# Asset system — developer guide

**Audience:** Developers working on flags, preloads, templates, or config.  
**Last updated:** 2026-06-10

---

## What this system does

1. **Flag → URL resolution** — Components use stable flags (`icon.cart`, `auth.background`) resolved via `assetMap.json`.
2. **Section asset preloading** — Route/section config drives background warming of images, fonts, scripts.
3. **Intent prefetch** — Hover/focus on nav links can prefetch a route’s section assets before navigation.
4. **DOM script loading** — `AssetHandler` + factory load critical scripts (e.g. Cognito) in auth flows.
5. **Validation** — Build and runtime checks on `assetMap.json` and route `assetPreload` entries.

---

## Folder map (current)

| Path | Responsibility |
|------|----------------|
| `systems/assets/assetLibrary.js` | `getAssetUrl`, section metadata, `initAssetLibrary`, `validateAssetMap` |
| `systems/assets/assetPreloader.js` | `preloadImage`, `preloadSectionAssets`, `preloadJSON`, cache |
| `systems/assets/assetScanner.js` | Scan components for asset references |
| `systems/assets/assetMapSource.js` | Bundled global map, runtime fetch policy |
| `systems/assets/sectionAssetMapSource.js` | Per-section `assetMap.<section>.json` |
| `systems/assets/getAssetPreloadEntriesForSection.js` | Roll up route `assetPreload` per section |
| `systems/assets/routeAssetPrefetch.js` | *Should live here* — currently in `systems/routing/` |
| `systems/assets/assertAllowedPreloadUrl.js` | URL allow-list (*→ future `assetPolicy.js`*) |
| `systems/assets/assetHandlerFactory.js` | `createAssetHandler()` for auth templates |
| `systems/assets/assetsHandlerNew.js` | `AssetHandler` class (*rename → `assetHandler.js` planned*) |
| `stores/usePreloadStore.js` | Tracks preloaded section names and asset URLs |
| `composables/useAssetUrl.js` | Reactive `getAssetUrl` in components |
| `config/assetMap.json` | Global flag → URL map |
| `router/sharedAssetPreloads.json` | Shared dashboard preload catalog (*→ move to `config/` planned*) |

Static files only: `src/assets/` (CSS, images) — not the asset **system**.

---

## Common tasks

### Resolve a flag in a component

```javascript
import { getAssetUrl } from '@/systems/assets/assetLibrary.js';

const url = await getAssetUrl('icon.cart');
// Section-scoped:
const authUrl = await getAssetUrl('auth.background', { section: 'auth' });
```

Or use the composable:

```javascript
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { url, loading, error } = useAssetUrl('icon.cart');
```

### Preload JSON config

```javascript
import { preloadJSON } from '@/systems/assets/assetPreloader.js';

const data = await preloadJSON('/src/config/countries.json');
```

### Add a new flag

1. Add **`production`** URL first in `src/config/assetMap.json`.
2. Override in `development` / `staging` only if needed.
3. Run `npm run sync:asset-map` (or restart dev).
4. Call `validateAssetMap()` in console or run `tests/unit/assetMap*.test.js`.

See [src/config/assetMap.README.md](../../src/config/assetMap.README.md) for environment rules.

### Declare route asset preloads

In `router/routeConfig.json`:

```json
"assetPreload": [
  { "flag": "icon.cart", "type": "image", "priority": "high" }
]
```

Or reference shared catalog:

```json
"assetPreloadRef": "dashboardMenuIcons"
```

### Section preload (automatic)

`sectionPreloader.js` calls `preloadSectionAssets(sectionName)` after section CSS/JS. You rarely call this directly from templates.

### Intent prefetch on nav links

```javascript
import { createRoutePrefetchIntentHandler } from '@/systems/routing/useRoutePrefetch.js';

const onHover = createRoutePrefetchIntentHandler('/shop');
// @mouseenter="onHover"
```

*Planned:* move `useRoutePrefetch` to `composables/`.

---

## Imports — use these paths

| ✅ Current | ❌ Retired |
|-----------|-----------|
| `@/systems/assets/assetLibrary.js` | `@/utils/assets` |
| `@/systems/assets/assetPreloader.js` | `@/utils/assets/assetPreloader.js` |
| `@/systems/assets/index.js` | `src/utils/assets/*` |

---

## Testing

```bash
# Asset-focused unit tests (note: many still import old utils paths — fix in progress)
npx vitest run tests/unit/assetMap
npx vitest run tests/unit/assetPreload
npx vitest run tests/assetLibrary.test.js
```

Browser smoke:

```javascript
await import('/src/systems/assets/assetLibrary.js').then(m => m.validateAssetMap());
```

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Flag not found | `production` entry in `assetMap.json`; `initAssetLibrary()` ran |
| Preload blocked | `assertAllowedPreloadUrl` / allow-list; no `javascript:` URLs |
| Stale URLs after deploy | `usePreloadStore` build hash invalidation via `syncPreloadStoreBuildHash` |
| Section assets not warming | Route `section` + `assetPreload` in `routeConfig.json` |
| Wrong import error | Update path from `utils/assets` → `systems/assets` |

---

## Work in progress (see [ASSET_PLAN.md](./ASSET_PLAN.md))

- Move `routeAssetPrefetch.js` and `resolveRouteAssetPreloads.js` into `systems/assets/`
- Create `assetPolicy.js`; rename `assetsHandlerNew.js` → `assetHandler.js`
- Fix ~47 test files still pointing at `utils/assets`
- Store action renames (`addAsset` → `addPreloadedAsset`, etc.)
- Resolve duplicate `createRoutePrefetchIntentHandler` name

---

## Further reading

- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- [ASSET_PLAN.md](./ASSET_PLAN.md)
- [../README.md](../README.md)
