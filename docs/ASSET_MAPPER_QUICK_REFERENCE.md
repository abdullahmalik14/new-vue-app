# AssetMapper Quick Reference


## Quick Start

```javascript
import { getAssetUrl } from '@/utils/assets';

// Get single asset
const url = await getAssetUrl('icon.cart');

// Get multiple assets
const urls = await getAssetUrls(['icon.cart', 'icon.user']);

// Get all icons
const icons = await getAssetsByCategory('icon');
```

## Common Use Cases

### 1. Load Icon in Component

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { getAssetUrl } from '@/utils/assets';

const iconUrl = ref('');

onMounted(async () => {
  iconUrl.value = await getAssetUrl('icon.cart');
});
</script>

<template>
  <img :src="iconUrl" alt="Cart" />
</template>
```

### 2. Preload Critical Assets

```javascript
// In main.js
import { preloadAssetUrls } from '@/utils/assets';

await preloadAssetUrls(['icon.cart', 'icon.user', 'logo.main']);
```

### 3. Load Assets by Category

```javascript
import { getAssetsByCategory } from '@/utils/assets';

// Get all icons
const icons = await getAssetsByCategory('icon');
// { 'icon.cart': '...', 'icon.user': '...', ... }
```

### 4. Check Before Loading

```javascript
import { hasAssetFlag, getAssetUrl } from '@/utils/assets';

if (await hasAssetFlag('icon.cart')) {
  const url = await getAssetUrl('icon.cart');
  // Use url
} else {
  // Use fallback
}
```

### 5. Dynamic Loading

```javascript
import { getAssetUrls } from '@/utils/assets';

async function loadRouteAssets(routeName) {
  const assetMap = {
    'shop': ['icon.cart', 'icon.search'],
    'profile': ['icon.user', 'icon.settings']
  };
  
  const flags = assetMap[routeName] || [];
  return await getAssetUrls(flags);
}
```

## API Cheat Sheet

| Function | Usage | Returns |
|----------|-------|---------|
| `getAssetUrl(flag)` | Single asset | `string\|null` |
| `getAssetUrls(flags[])` | Multiple assets | `object` |
| `getAssetsByCategory(category)` | Category assets | `object` |
| `hasAssetFlag(flag)` | Check existence | `boolean` |
| `getAvailableAssetFlags()` | All flags | `string[]` |
| `preloadAssetUrls(flags[])` | Preload | `number` |
| `getAssetMapperStatistics()` | Stats | `object` |
| `validateAssetMap()` | Validate | `object` |

## Configuration Format

```json
{
  "development": {
    "icon.cart": "/assets/icons/cart-dev.svg"
  },
  "staging": {
    "icon.cart": "/assets/icons/cart-staging.svg"
  },
  "production": {
    "icon.cart": "https://cdn.example.com/assets/icons/cart.svg",
    "icon.user": "https://cdn.example.com/assets/icons/user.svg"
  }
}
```

## Naming Convention

```
icon.{name}     - Icons (cart, user, search, etc.)
logo.{name}     - Logos (main, footer, etc.)
image.{name}    - Images (hero, banner, etc.)
font.{name}     - Fonts (primary, secondary, etc.)
```

## Environment Inheritance

```
Development → Production (fallback)
Staging → Production (fallback)
Production → (base)
```

## Caching

- Asset map: 1 hour
- Asset URLs: 30 minutes
- In-memory: Instant

Clear cache: `clearAssetMapCache()`

## Testing

Browser console:
```javascript
window.runAssetMapperTests()
```

## Common Patterns

### Pattern 1: Safe Loading

```javascript
const url = await getAssetUrl('icon.cart') || '/assets/default.svg';
```

### Pattern 2: Batch Loading

```javascript
const urls = await getAssetUrls(['icon.cart', 'icon.user']);
Object.entries(urls).forEach(([flag, url]) => {
  if (url) console.log(`${flag}: ${url}`);
});
```

### Pattern 3: Category Loading

```javascript
const icons = await getAssetsByCategory('icon');
const iconList = Object.keys(icons);
```

### Pattern 4: Preload on Init

```javascript
// App initialization
const criticalAssets = ['icon.cart', 'logo.main'];
await preloadAssetUrls(criticalAssets);
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Asset not found | Check `hasAssetFlag()` first |
| Wrong environment | Use `getEnvironment()` to check |
| Cache issues | Call `clearAssetMapCache()` |
| Slow loading | Use `preloadAssetUrls()` |
| Config errors | Run `validateAssetMap()` |

## Performance Tips

1. ✅ Preload critical assets early
2. ✅ Use category loading for related assets
3. ✅ Leverage caching (automatic)
4. ✅ Batch load multiple assets
5. ✅ Check existence before loading

## Files

- Config: `src/config/assetMap.json`
- Code: `src/utils/assets/assetMapper.js`
- Tests: `tests/assetMapper.test.js`
- Docs: `src/utils/assets/README.md`
- Examples: `examples/assetMapperUsage.js`

## Links

- Full Documentation: `src/utils/assets/README.md`
- Implementation Details: `docs/ASSET_MAPPER_IMPLEMENTATION.md`
- Usage Examples: `examples/assetMapperUsage.js`
- Test Suite: `tests/assetMapper.test.js`

