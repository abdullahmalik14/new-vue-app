# Asset system — developer guide

**Audience:** Developers working on flags, preloads, templates, or config.  
**Last updated:** 2026-06-20  
**Done work log:** [assets-cleanup-changelog.md](../assets-cleanup-changelog.md)

---

## What this system does

1. **Flag → URL resolution** — Components use stable flags (`icon.cart`, `auth.background`) resolved via `assetMap.json`.
2. **Section asset preloading** — Route/section config drives background warming of images, fonts, scripts.
3. **Intent prefetch** — Hover/focus on nav links can prefetch route components and section assets before navigation.
4. **DOM script loading** — `AssetHandler` + factory load critical scripts (e.g. Cognito) in auth flows.
5. **Validation** — Build and runtime checks on `assetMap.json` and route `assetPreload` entries.

---

## Folder map (current)

| Path | Responsibility |
|------|----------------|
| `systems/assets/assetLibrary.js` | `getAssetUrl`, section metadata, `initAssetLibrary`, `validateAssetMap` |
| `systems/assets/assetPreloader.js` | `preloadImage`, `preloadSectionAssets`, `preloadJSON`, cache |
| `systems/assets/assetPolicy.js` | URL allow-list (`assertAllowedAssetUrl`) + preload validation re-exports |
| `systems/assets/assetScanner.js` | Scan components for asset references |
| `systems/assets/assetMapSource.js` | Bundled global map, runtime fetch policy |
| `systems/assets/sectionAssetMapSource.js` | Per-section `assetMap.<section>.json` |
| `systems/assets/routeSectionAssetPreloadEntries.js` | Roll up route `assetPreload` per section |
| `systems/assets/routeAssetPrefetch.js` | Intent prefetch for section assets on nav hover |
| `systems/assets/resolveRouteAssetPreloads.js` | Expand `assetPreloadRef` in route config |
| `systems/assets/assetHandler.js` | `AssetHandler` class (DOM script/CSS loading) |
| `systems/assets/assetHandlerFactory.js` | `createAssetHandler()` for templates |
| `systems/assets/authAssetConfig.js` | Shared auth/onboarding asset config for templates |
| `systems/assets/assertAllowedPreloadUrl.js` | Deprecated shim → import from `assetPolicy.js` |
| `stores/usePreloadStore.js` | Preload state (`addPreloadedAsset`, `clearPreloadState`, …) |
| `composables/useAssetUrl.js` | Reactive `getAssetUrl` in components |
| `composables/useRoutePrefetch.js` | Combined component + section asset intent prefetch |
| `composables/useAssetPrefetch.js` | Section asset intent prefetch only |
| `config/assetMap.json` | Global flag → URL map |
| `config/sharedAssetPreloads.json` | Shared dashboard preload catalog |
| `config/settingConfig.js` | Settings nav data + `resolveSettingConfigWithAssets()` |
| `config/dashboardSidebarMenuItems.js` | Sidebar menu flags + resolver |

Static files only: `src/assets/` (CSS, images) — not JS config modules.

---

## Common tasks

### Resolve a flag in a component

```javascript
import { getAssetUrl } from '@/systems/assets/assetLibrary.js';

const url = await getAssetUrl('icon.cart');
const authUrl = await getAssetUrl('auth.background', { section: 'auth' });
```

Or use the composable:

```javascript
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { url, loading, error } = useAssetUrl('icon.cart');
```

### Preload images / JSON / section assets

```javascript
import { preloadImage, preloadJSON, preloadSectionAssets } from '@/systems/assets/assetPreloader.js';

preloadImage('/images/logo.svg', { priority: 'high' });
const countries = await preloadJSON('/src/config/countries.json');
await preloadSectionAssets('shop');
```

### Add a new flag

1. Add **`production`** URL first in `src/config/assetMap.json`.
2. Override in `development` / `staging` only if needed.
3. Run `npm run sync:asset-map` (or restart dev).
4. Run `tests/unit/assetMap*.test.js` or `validateAssetMap()` in console.

See [src/config/assetMap.README.md](../../../src/config/assetMap.README.md) for environment rules.

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

Catalog lives in `src/config/sharedAssetPreloads.json`.

### Auth script loading

```javascript
import { createAssetHandler } from '@/systems/assets/assetHandlerFactory.js';
import { getAuthAssetConfig, getAuthAssetNames } from '@/systems/assets/authAssetConfig.js';

const assetsConfig = getAuthAssetConfig();
const handler = await createAssetHandler(assetsConfig, { name: 'AuthLogIn', debug: true });
await handler.ensureAssetDependencies(getAuthAssetNames(assetsConfig), { strict: true });
handler.dispose();
```

### Intent prefetch on nav links

```javascript
import { createCombinedRoutePrefetchIntentHandler } from '@/composables/useRoutePrefetch.js';

const onHover = createCombinedRoutePrefetchIntentHandler('/shop');
// @mouseenter="onHover"
```

Asset-only prefetch (no route component):

```javascript
import { useAssetPrefetch } from '@/composables/useAssetPrefetch.js';

const { prefetchAssetsOnIntent } = useAssetPrefetch();
```

`createRoutePrefetchIntentHandler` remains as a deprecated alias for the combined handler.

### Settings nav with flags

```javascript
import { resolveSettingConfigWithAssets } from '@/config/settingConfig.js';

const groups = await resolveSettingConfigWithAssets(undefined, userRole);
// each item has resolved `icon` URL from `iconFlag`
```

---

## Imports — use these paths

| ✅ Current | ❌ Retired |
|-----------|-----------|
| `@/systems/assets/assetLibrary.js` | `@/utils/assets` |
| `@/systems/assets/assetPolicy.js` | `src/utils/preload.js` |
| `@/systems/assets/assetHandler.js` | `assetsHandlerNew.js` |
| `@/config/settingConfig.js` | `@/assets/data/settingConfig.js` |

Tests: import `@/systems/assets/...` or `../../src/systems/assets/...`.

---

## Testing

```bash
npm run test:unit -- --run tests/unit/assetMapBuildValidation.test.js
npm run test:unit -- --run tests/handler/
npm run test:unit -- --run tests/unit/useRoutePrefetch.test.js
npm run test:unit -- --run tests/unit/usePreloadStore.test.js
```

Browser smoke:

```javascript
await import('/src/systems/assets/assetLibrary.js').then(m => m.validateAssetMap());
```

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Flag not found | `production` entry in `assetMap.json`; `initAssetLibrary()` ran in `main.js` |
| Preload blocked | `assertAllowedAssetUrl` in `assetPolicy.js`; allow-list / same-origin |
| Stale URLs after deploy | `usePreloadStore` build hash via `syncPreloadStoreBuildHash` |
| Section assets not warming | Route `section` + `assetPreload` in `routeConfig.json` |
| Wrong import error | Use `systems/assets/` paths — see [assets-cleanup-changelog.md](../assets-cleanup-changelog.md) |

---

## Further reading

- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- [ASSET_PLAN.md](./ASSET_PLAN.md)
- [assets-cleanup-changelog.md](../assets-cleanup-changelog.md)
- [../README.md](../README.md)
