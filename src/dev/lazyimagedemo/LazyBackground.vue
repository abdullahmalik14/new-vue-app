<template>
  <div
    v-if="resolvedSrc"
    ref="containerRef"
    class="relative overflow-hidden bg-slate-900"
    :class="rootClass"
  >
    <div
      v-if="!isLoaded"
      class="absolute inset-0 z-[1] animate-pulse bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700"
      aria-hidden="true"
    />

    <!-- Decorative background layer (lazy-loaded) -->
    <img
      ref="imageRef"
      class="absolute inset-0 z-[2] h-full w-full object-cover transition-opacity duration-300"
      :class="isLoaded ? 'opacity-100' : 'opacity-0'"
      alt=""
      aria-hidden="true"
      src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    />

    <!-- Scrim so foreground content stays readable over the bg -->
    <div
      class="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-black/80 via-black/35 to-black/10"
      aria-hidden="true"
    />

    <!-- Foreground content sits on top of the background -->
    <div class="relative z-[4] flex min-h-full flex-col justify-end p-6 text-white">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useLazySizesOnVisible } from '@/dev/lazyimagedemo/useLazySizesOnVisible.js';

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  rootClass: {
    type: [String, Object, Array],
    default: '',
  },
});

const containerRef = ref(null);
const imageRef = ref(null);
const resolvedSrc = computed(() => props.src || '');

const { isLoaded } = useLazySizesOnVisible(containerRef, imageRef, resolvedSrc);
</script>
