# Asset system — quick reference

**Last updated:** 2026-06-20  
**Imports:** use `@/systems/assets/` (not `@/utils/assets`)

---

## Resolve flags

```javascript
import { getAssetUrl, getAssetUrls, getAssetsByCategory } from '@/systems/assets/assetLibrary.js';

const url = await getAssetUrl('icon.cart');
const urls = await getAssetUrls(['icon.cart', 'icon.user']);
const icons = await getAssetsByCategory('icon');
```

```vue
<script setup>
import { useAssetUrl } from '@/composables/useAssetUrl.js';
const { url, loading, error } = useAssetUrl('auth.background', 'auth');
</script>
```

---

## Preload

```javascript
import { preloadImage, preloadJSON, preloadSectionAssets } from '@/systems/assets/assetPreloader.js';

preloadImage('/images/logo.svg', { priority: 'high' });
const countries = await preloadJSON('/src/config/countries.json');
await preloadSectionAssets('shop');
```

```javascript
// Bootstrap (main.js pattern)
import { initAssetLibrary, validateAssetMap } from '@/systems/assets/assetLibrary.js';
await initAssetLibrary();
await validateAssetMap();
```

---

## Policy / URL guards

```javascript
import { assertAllowedAssetUrl } from '@/systems/assets/assetPolicy.js';

const check = assertAllowedAssetUrl(url, { assetType: 'script' });
```

---

## Intent prefetch (nav hover)

```javascript
import { createCombinedRoutePrefetchIntentHandler } from '@/composables/useRoutePrefetch.js';

const prefetchShop = createCombinedRoutePrefetchIntentHandler('/shop');
```

```javascript
import { useAssetPrefetch } from '@/composables/useAssetPrefetch.js';

useAssetPrefetch().prefetchAssetsOnIntent('/dashboard')();
```

---

## Auth script loading

```javascript
import { createAssetHandler } from '@/systems/assets/assetHandlerFactory.js';
import { getAuthAssetConfig, getAuthAssetNames } from '@/systems/assets/authAssetConfig.js';

const handler = await createAssetHandler(getAuthAssetConfig(), { name: 'AuthLogIn', section: 'auth' });
await handler.ensureAssetDependencies(getAuthAssetNames(getAuthAssetConfig()), { strict: true });
handler.dispose();
```

---

## Validation

```javascript
import { validateAssetMap } from '@/systems/assets/assetLibrary.js';
const result = await validateAssetMap();
```

Build-time: `systems/build/jsonConfigValidator.js` validates route `assetPreload` + `assetMap.json`.

---

## Config files

| File | Purpose |
|------|---------|
| `src/config/assetMap.json` | Global flags |
| `src/config/assetMap.auth.json` | Section overrides |
| `src/config/sharedAssetPreloads.json` | Shared preload catalog |
| `src/config/settingConfig.js` | Settings nav + flag resolver |
| `src/config/dashboardSidebarMenuItems.js` | Sidebar menu flags |

Operator detail: [src/config/assetMap.README.md](../../../src/config/assetMap.README.md)

---

## Store

```javascript
import { usePreloadStore } from '@/stores/usePreloadStore.js';

const store = usePreloadStore();
store.addPreloadedAsset(resolvedUrl);
store.hasAsset(resolvedUrl);
store.hasSection('shop');
store.clearPreloadState();
```

Deprecated aliases: `addAsset`, `clearState`.

---

## Files (code)

| Module | Path |
|--------|------|
| Library | `src/systems/assets/assetLibrary.js` |
| Preloader | `src/systems/assets/assetPreloader.js` |
| Policy | `src/systems/assets/assetPolicy.js` |
| Handler | `src/systems/assets/assetHandler.js` |
| Auth config | `src/systems/assets/authAssetConfig.js` |
| Barrel | `src/systems/assets/index.js` |

---

## Links

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- [assets-cleanup-changelog.md](../assets-cleanup-changelog.md)
- [ASSET_PLAN.md](./ASSET_PLAN.md)
- [AI_GUIDE.md](./AI_GUIDE.md)
