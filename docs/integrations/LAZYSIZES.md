# Lazysizes Integration Guide

**Project:** VueApp — Section-Based Architecture  
**Version:** lazysizes `^5.3.2` (npm)  
**Demo route:** `/demo/lazy-sizes`  
**Production demo:** https://newvueapp.vercel.app/demo/lazy-sizes  
**Last updated:** March 2026

---

## 1. What is lazysizes?

[lazysizes](https://github.com/aFarkas/lazysizes) is a lightweight, dependency-free JavaScript library for **lazy loading images** (and other media). It uses `IntersectionObserver` (with fallbacks) to defer network requests until elements are near or inside the viewport.

Typical markup pattern:

```html
<img class="lazyload" data-src="/path/to/image.webp" alt="Description" />
```

When the element becomes visible, lazysizes swaps `data-src` → `src` and loads the image.

---

## 2. Why we are using it

### The problem

This app uses **section-based preloading**: when a user navigates from one dashboard route to another, section JS/CSS/assets may already be warmed in cache.

**Direct-access pages do not get that benefit:**

- Homepage (first visit)
- Landing pages
- Shop pages
- Profile pages (external link / bookmark)

On those pages, every `<img src="...">` and CSS background loads immediately, hurting **First Contentful Paint** and **Largest Contentful Paint** — especially for below-the-fold content.

### The solution

Use lazysizes for **below-the-fold** images so they load only when the user scrolls them into view. Above-the-fold hero/critical images should remain eager (normal `src` or preload).

| Page type | Preload benefit | Lazysizes recommendation |
|-----------|-----------------|---------------------------|
| In-app navigation (dashboard) | High | Optional for deep below-fold only |
| Direct access (home, landing, shop, profile) | Low / none | **Recommended** for below-fold images |

---

## 3. How it is integrated in this Vue project

### 3.1 Script source — **not a third-party CDN**

**Important for hosting review:**

| Question | Answer |
|----------|--------|
| Is lazysizes loaded from jsDelivr / unpkg / cdnjs? | **No** |
| Where does the script come from? | **npm package** `lazysizes@^5.3.2` in `node_modules` |
| How does it reach the browser? | **Vite bundles it** into the app JavaScript output at build time |
| Loaded from `index.html`? | **No** — loaded via ES module import in `main.js` |

**Load order in `src/app/main.js`:**

```js
import '@/dev/lazyimagedemo/lazySizesConfig.js';  // MUST run before lazysizes
import 'lazysizes';
```

**Global config (`src/dev/lazyimagedemo/lazySizesConfig.js`):**

```js
window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.expFactor = 0;   // no extra viewport margin
window.lazySizesConfig.hFac = 0;
window.lazySizesConfig.loadMode = 1;      // visible elements only
```

### 3.2 Architecture diagram

```
npm: lazysizes@5.3.2
        │
        ▼
lazySizesConfig.js  ──►  window.lazySizesConfig (before init)
        │
        ▼
main.js import 'lazysizes'  ──►  Vite bundle (app JS chunk)
        │
        ▼
LazyImage.vue / LazyBackground.vue
        │
        ▼
useLazySizesOnVisible.js  ──►  IntersectionObserver (rootMargin: 0)
        │                         then lazysizes.loader.unveil(img)
        ▼
Network request (single fetch per URL)
```

### 3.3 Vue wrapper components

Located in `src/dev/lazyimagedemo/` (demo phase; move to `src/components/media/lazy/` before full rollout).

| Component | Use case |
|-----------|----------|
| `LazyImage.vue` | Content images — semantic `<img>` with `alt` |
| `LazyBackground.vue` | Decorative background layer with foreground slot (hero cards, tier banners) |

**Composable:** `useLazySizesOnVisible.js`

- Observes container with `IntersectionObserver` (`rootMargin: '0px'`, `threshold: 0`)
- Only when visible: adds `class="lazyload"`, `data-src`, calls `lazySizes.loader.unveil()` once
- Deduplicates by URL (module-level `Set`) to prevent double network requests
- Shows skeleton pulse until `lazyloaded` event

### 3.4 Assets

Demo uses **local** assetMap entries (not external imgbb URLs):

| Flag | Path |
|------|------|
| `lazyImageDemo.poster` | `/images/featured-media-bg.webp` |
| `lazyImageDemo.sampleBg` | `/images/sample-bg-image.png` |

Resolved via `useAssetUrl('lazyImageDemo.poster')` etc.

### 3.5 Route

```json
{
  "slug": "/demo/lazy-sizes",
  "section": "dashboard-global",
  "componentPath": "@/dev/lazyimagedemo/LazySizesDemoPage.vue",
  "requiresAuth": false,
  "supportedRoles": ["all"]
}
```

**Note:** Do not set `"envAccess": "development"` on this route if it must work on production (Vercel).

---

## 4. Demo examples

### Live demo

- **Local:** `http://localhost:5173/demo/lazy-sizes`
- **Production:** https://newvueapp.vercel.app/demo/lazy-sizes

### What the demo shows

1. **LazyImage** — content `<img>` with skeleton; label explains it is the UI element itself  
2. **LazyBackground** — image behind gradient scrim + badge, title, text, CTA button (foreground over background)

### How to verify in DevTools

1. Open demo URL  
2. DevTools → **Network** → filter **Img**  
3. Enable **Disable cache**  
4. **Hard reload** at top of page  
5. **Expected:** No large image requests yet (only tiny placeholder gif optional)  
6. **Scroll down** to each section  
7. **Expected:** One request per image when section enters viewport — no duplicates

### Code example — LazyImage

```vue
<script setup>
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import LazyImage from '@/dev/lazyimagedemo/LazyImage.vue';

const { url: posterUrl } = useAssetUrl('lazyImageDemo.poster');
</script>

<template>
  <LazyImage
    v-if="posterUrl"
    :src="posterUrl"
    alt="Poster"
    root-class="h-64 w-full rounded-xl"
  />
</template>
```

### Code example — LazyBackground with slot

```vue
<LazyBackground :src="sampleBgUrl" root-class="h-72 rounded-xl">
  <h3>Premium tier hero card</h3>
  <p>Foreground text — image loads lazily behind this content.</p>
</LazyBackground>
```

---

## 5. Recommended usage across the project

### When to use lazysizes

| Scenario | Use lazysizes? |
|----------|----------------|
| Below-fold product/media grid | **Yes** |
| Hero image above the fold | **No** (eager load or `<link rel="preload">`) |
| Avatar in sticky header | **No** |
| Tier card background below fold | **Yes** (`LazyBackground`) |
| Icons from assetMap (small) | Usually **No** (low impact) |
| Direct-access homepage sections | **Yes** for non-critical images |

### Implementation checklist for a new page

1. Identify above-fold vs below-fold images  
2. Keep above-fold as normal `<img :src="url">` or preload  
3. Replace below-fold with `LazyImage` or `LazyBackground`  
4. Resolve URLs via `useAssetUrl('flag')` — no hardcoded URLs  
5. Test Network tab (reload at top, scroll, confirm deferred load)  
6. Add section note in `docs/sections/` when migrated  

### Background images — pattern choice

We use **`LazyBackground`** (cover-positioned `<img>` + overlay slot) instead of lazysizes `data-bg` + unveilhooks because `data-bg` caused **duplicate network requests** (preload via hidden `Image()` + CSS `background-image`). The cover-`<img>` pattern is one request and works reliably with Vue.

---

## 6. CDN self-hosting — best practices

**Current state:** lazysizes is **bundled via npm + Vite**, not loaded from an external CDN.

**Client recommendation:** Host lazysizes on **your own CDN** instead of relying on third-party CDNs (jsDelivr, etc.). Our current npm bundle already satisfies “no third-party CDN,” but for explicit CDN control:

### Option A — Self-host static file (recommended for client CDN)

1. Copy from npm after install:
   ```
   node_modules/lazysizes/lazysizes.min.js
   ```
2. Publish to your CDN, e.g.:
   ```
   https://cdn.yourdomain.com/vendor/lazysizes/5.3.2/lazysizes.min.js
   ```
3. Load in `index.html` **before** app bundle:
   ```html
   <script src="https://cdn.yourdomain.com/vendor/lazysizes/5.3.2/lazysizes.min.js"></script>
   ```
4. Set config inline **before** that script:
   ```html
   <script>
     window.lazySizesConfig = { expFactor: 0, hFac: 0, loadMode: 1 };
   </script>
   ```
5. **Remove** `import 'lazysizes'` from `main.js` to avoid loading twice  
6. Keep `lazySizesConfig` values in sync  

### Option B — Keep npm bundle (current)

- Pros: Single Vite bundle, version locked in `package.json`, no extra HTTP request  
- Cons: lazysizes JS ships inside app chunk (small ~7KB gzipped)  
- **No third-party CDN dependency**

### CDN checklist

| Item | Recommendation |
|------|----------------|
| Version pinning | Use exact version in CDN path (`/5.3.2/`) |
| Integrity | Optional `integrity` + `crossorigin` on `<script>` |
| Cache headers | Long cache + fingerprinted path on upgrades |
| Config | Always set `lazySizesConfig` before script |
| Avoid | Loading from both npm import **and** CDN script (double init) |

---

## 7. How to maintain or update

### Update lazysizes version

1. `npm install lazysizes@<new-version>`  
2. Run demo verification (`/demo/lazy-sizes`)  
3. If using client CDN: upload new `lazysizes.min.js` to CDN path  
4. Update this doc + audit doc version line  
5. `npm run build` — confirm no regressions  

### Regression test (required after any change)

- [ ] Reload demo at top — no large images in Network  
- [ ] Scroll to LazyImage — one `featured-media-bg.webp` request  
- [ ] Scroll to LazyBackground — one `sample-bg-image.png` request  
- [ ] No duplicate requests for same URL  
- [ ] Skeleton visible until image loads  
- [ ] Production route `/demo/lazy-sizes` returns 200 (not 404)  

### Rollout status

| Area | Status |
|------|--------|
| Demo route + components | ✅ Done |
| Documentation | ✅ This file |
| Homepage / landing / shop / profile | ⏳ Pending approval — pilot after sign-off |
| Move components to `src/components/media/lazy/` | ⏳ Before production rollout |

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| 404 on `/demo/lazy-sizes` in production | `envAccess: "development"` on route | Remove flag from `routeConfig.json` |
| Images load before scroll | Default `expFactor` or missing IO wrapper | Use `useLazySizesOnVisible`; config `loadMode: 1` |
| Duplicate network requests | Double `unveil()` or `data-bg` unveilhooks | Use single unveil; prefer cover-`<img>` for backgrounds |
| Blank box long time | Large external URLs | Use local `/images/` or CDN; optimize file size |
| `lazySizes is undefined` | Config import order wrong | Import `lazySizesConfig.js` before `lazysizes` |

---

## 9. File reference

| File | Purpose |
|------|---------|
| `package.json` | `lazysizes` dependency |
| `src/app/main.js` | Global import |
| `src/dev/lazyimagedemo/lazySizesConfig.js` | Pre-init config |
| `src/dev/lazyimagedemo/useLazySizesOnVisible.js` | Viewport-gated unveil |
| `src/dev/lazyimagedemo/LazyImage.vue` | Content image wrapper |
| `src/dev/lazyimagedemo/LazyBackground.vue` | Background + slot wrapper |
| `src/dev/lazyimagedemo/LazySizesDemoPage.vue` | Demo page |
| `src/config/assetMap.json` | `lazyImageDemo.*` URLs |
| `src/router/routeConfig.json` | `/demo/lazy-sizes` route |

---

## 10. Approval

See [LAZYSIZES_INTEGRATION_AUDIT.md](./LAZYSIZES_INTEGRATION_AUDIT.md) for the formal audit checklist and sign-off section.
