<template>
  <div class="grid grid-cols-4 gap-2 w-full">
    <button
      v-for="(thumb, index) in visibleThumbnails"
      :key="index"
      class="relative w-full rounded overflow-hidden focus:outline-none"
      @click="$emit('update:selectedIndex', index)"
    >
      <img
        v-if="shouldLoadThumbnail(index)"
        :src="thumb"
        class="h-[3.6125rem] w-full object-cover rounded-sm border-2 transition-all duration-200"
        :class="index === selectedIndex ? 'border-primary-text opacity-100 scale-105 z-10' : 'border-transparent opacity-60'"
        loading="eager"
        fetchpriority="high"
        decoding="async"
      />
      <div v-else class="h-[3.6125rem] w-full bg-gray-200 rounded-sm"></div>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  thumbnails: Array,
  selectedIndex: Number,
});

defineEmits(['update:selectedIndex']);

const loadedCount = ref(3); 

const visibleThumbnails = computed(() => props.thumbnails);

const shouldLoadThumbnail = (index) => {
  return index < loadedCount.value;
};

onMounted(() => {
  loadedCount.value = props.thumbnails.length;
});
</script>