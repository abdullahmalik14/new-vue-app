# Asset system — quick reference

**Last updated:** 2026-06-10  
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

## Intent prefetch (nav hover)

```javascript
import { createRoutePrefetchIntentHandler } from '@/systems/routing/useRoutePrefetch.js';

const prefetchShop = createRoutePrefetchIntentHandler('/shop');
```

---

## Auth script loading

```javascript
import { createAssetHandler } from '@/systems/assets/assetHandlerFactory.js';

const handler = await createAssetHandler(assetsConfig, { name: 'AuthLogIn', section: 'auth' });
await handler.ensureAssetDependencies(['cognito'], { strict: true });
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
| `router/sharedAssetPreloads.json` | Shared preload catalog (move to config planned) |

Operator detail: [src/config/assetMap.README.md](../../src/config/assetMap.README.md)

---

## Store

```javascript
import { usePreloadStore } from '@/stores/usePreloadStore.js';

const store = usePreloadStore();
store.hasAsset(resolvedUrl);
store.hasSection('shop');
```

---

## Files (code)

| Module | Path |
|--------|------|
| Library | `src/systems/assets/assetLibrary.js` |
| Preloader | `src/systems/assets/assetPreloader.js` |
| Scanner | `src/systems/assets/assetScanner.js` |
| Barrel | `src/systems/assets/index.js` |
| Tests | `tests/unit/assetMap*.test.js`, `tests/assetLibrary.test.js` |

---

## Links

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- [ASSET_PLAN.md](./ASSET_PLAN.md)
- [AI_GUIDE.md](./AI_GUIDE.md)
