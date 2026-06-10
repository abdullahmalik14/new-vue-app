<template>
  <div class="flex flex-wrap items-start justify-start gap-1">
    <button
      v-for="(thumb, index) in visibleThumbnails"
      :key="index"
      class="relative w-[6.2rem] rounded overflow-hidden focus:outline-none"
      @click="$emit('update:selectedIndex', index)"
    >
      <img
        v-if="shouldLoadThumbnail(index)"
        :src="thumb"
        class="h-[3.6125rem] w-[6.3rem] object-cover rounded-sm"
        :class="index === selectedIndex ? 'opacity-100' : 'opacity-50'"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="h-[3.6125rem] w-[6.3rem] bg-gray-200 rounded-sm"></div>
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
  setTimeout(() => {
    loadedCount.value = props.thumbnails.length;
  }, 500);
});
</script>