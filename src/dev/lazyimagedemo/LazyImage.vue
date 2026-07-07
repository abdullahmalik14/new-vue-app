<template>
  <div
    v-if="resolvedSrc"
    ref="containerRef"
    class="relative overflow-hidden"
    :class="rootClass"
  >
    <div
      v-if="!isLoaded"
      class="absolute inset-0 z-[1] animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200"
      aria-hidden="true"
    />
    <img
      ref="imageRef"
      class="relative z-[2] block h-full w-full object-cover transition-opacity duration-300"
      :class="isLoaded ? 'opacity-100' : 'opacity-0'"
      :alt="alt"
      src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    />
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
  alt: {
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
