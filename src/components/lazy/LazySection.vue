<template>
  <component :is="tag" ref="sentinelRef" class="lazy-section">
    <template v-if="isVisible">
      <component :is="asyncComponent" v-if="asyncComponent" v-bind="$attrs" />
      <slot v-else />
    </template>

    <template v-else>
      <slot name="placeholder">
        <div
          class="lazy-section__placeholder"
          :style="placeholderStyle"
          aria-hidden="true"
        ></div>
      </slot>
    </template>
  </component>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useLazySectionLoader } from '@/composables/useLazySectionLoader.js';

/**
 * LazySection
 *
 * Wrapper that defers loading/rendering of its content until the user scrolls
 * near it. Two modes:
 *
 *  1. Code-split lazy load (recommended for heavy sections):
 *     <LazySection :loader="() => import('@/dev/components/home/MainFooter.vue')" min-height="400px" />
 *     The component's JS chunk is only fetched once the section approaches the viewport.
 *
 *  2. Render-only lazy (component already imported, just delay rendering):
 *     <LazySection min-height="400px"><HeavyChart /></LazySection>
 *
 * Until visible, a min-height placeholder is rendered to reduce layout shift
 * (override it via the `placeholder` slot).
 */
const props = defineProps({
  /** `() => import('...')` dynamic import for true code-split lazy loading. */
  loader: { type: Function, default: null },
  /** Pre-load distance; positive margin loads earlier (before fully on screen). */
  rootMargin: { type: String, default: '200px 0px' },
  /** Visibility ratio(s) that trigger the load. */
  threshold: { type: [Number, Array], default: 0 },
  /** Load once then stop observing. Set false to load/unload on scroll. */
  once: { type: Boolean, default: true },
  /** Placeholder height to reserve space and avoid layout shift. */
  minHeight: { type: String, default: '1px' },
  /** Wrapper element tag. */
  tag: { type: String, default: 'div' },
});

defineOptions({ inheritAttrs: false });

const { sentinelRef, isVisible } = useLazySectionLoader({
  rootMargin: props.rootMargin,
  threshold: props.threshold,
  once: props.once,
});

const asyncComponent = props.loader ? defineAsyncComponent(props.loader) : null;

const placeholderStyle = computed(() => ({ minHeight: props.minHeight }));
</script>
