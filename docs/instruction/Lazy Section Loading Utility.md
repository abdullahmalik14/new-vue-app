# Lazy Section Loading Utility

A small utility to **load sections lazily** — i.e. only load/render a section as
the user scrolls close to it (for example, load the footer only when the user
approaches it instead of on initial page load).

## Is this built into Vue?

**Partly — not the part we need on its own.**

- Vue's built-in lazy loading is `defineAsyncComponent()` + dynamic `import()`.
  That handles **code-splitting** (the component's JS chunk is fetched lazily),
  but it triggers when the component is **rendered/mounted**, *not* based on
  scroll position. On its own it can't say "load only when near the footer".
- The "trigger when the element is near the viewport" part needs the native
  **`IntersectionObserver`** (or a library like VueUse's `useIntersectionObserver`,
  which is **not** installed in this project).

So this utility combines the two: `IntersectionObserver` (for the "near the
footer" trigger) + `defineAsyncComponent` (for the lazy chunk load). No new
dependency is required — `IntersectionObserver` is a native browser API and is
already used elsewhere in the app (`systems/assets/assetsHandlerNew.js` for lazy
images).

## What was added

| File | Purpose |
|------|---------|
| `src/composables/useLazySectionLoader.js` | Core composable. Reports `isVisible` when a target element scrolls near the viewport. |
| `src/components/lazy/LazySection.vue` | Wrapper component built on the composable. Lazily loads (code-split) or lazily renders its content. |

## Usage

### 1. Code-split lazy load (recommended for heavy sections)

The component's JS chunk is fetched only when the section approaches the viewport:

```vue
<script setup>
import LazySection from '@/components/lazy/LazySection.vue';
</script>

<template>
  <!-- ...page content... -->

  <LazySection
    :loader="() => import('@/dev/components/home/MainFooter.vue')"
    min-height="400px"
  />
</template>
```

### 2. Render-only lazy (component already imported, just delay rendering)

```vue
<LazySection min-height="500px">
  <HeavyChart />
</LazySection>
```

### 3. Custom placeholder (skeleton instead of blank space)

```vue
<LazySection :loader="() => import('@/components/dashboard/ActivityFeed.vue')">
  <template #placeholder>
    <SkeletonBlock />
  </template>
</LazySection>
```

### 4. Composable directly (custom markup / your own trigger)

```vue
<script setup>
import { useLazySectionLoader } from '@/composables/useLazySectionLoader.js';
const { sentinelRef, isVisible } = useLazySectionLoader({ rootMargin: '300px 0px' });
</script>

<template>
  <div ref="sentinelRef">
    <RealContent v-if="isVisible" />
    <div v-else style="min-height: 400px"></div>
  </div>
</template>
```

## `LazySection` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loader` | `Function` | `null` | `() => import('...')` for code-split lazy loading. Omit to lazily render the default slot instead. |
| `rootMargin` | `String` | `'200px 0px'` | How early to load. Larger top/bottom values load sooner before the element is on screen. |
| `threshold` | `Number \| Array` | `0` | Visibility ratio that triggers the load. |
| `once` | `Boolean` | `true` | Load once and stop observing. Set `false` to react every time it enters/leaves. |
| `minHeight` | `String` | `'1px'` | Placeholder height to reserve space and avoid layout shift. |
| `tag` | `String` | `'div'` | Wrapper element tag. |

Attributes you put on `<LazySection>` (besides the props above) are forwarded to
the loaded component (`inheritAttrs: false`).

## Behavior notes

- **Graceful fallback:** if `IntersectionObserver` is unavailable, the content is
  shown immediately (never hidden).
- **Cleanup:** the observer disconnects automatically on unmount, and after the
  first load when `once` is `true`.
- **Layout shift:** always pass a sensible `min-height` (or a `placeholder` slot)
  for big sections so the page doesn't jump when they load.

## Relation to the existing section preloading system

This is **viewport/scroll-driven** lazy loading of a single section/component on
a page. It is different from the route-level **Section Preloading System**
(`docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md`), which warms entire route
sections in the background after navigation. The two are complementary.
