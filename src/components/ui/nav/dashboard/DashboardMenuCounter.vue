<template>
  <span v-show="isVisible" class="dashboard-menu-counter inline-flex items-center justify-center bg-red-500 text-white rounded-full min-w-[1.25rem] h-5 px-1.5 text-[0.625rem] font-bold shadow-sm">
    {{ displayCount }}
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { useDashboardNavStore } from '@/stores/useDashboardNavStore';

const props = defineProps({
  badgeId: {
    type: String,
    required: true
  },
  // Optional fallback static count if store is not populated
  staticCount: {
    type: [Number, String],
    default: null
  }
});
 
const navStore = useDashboardNavStore();

const displayCount = computed(() => {
  const storeCount = navStore.getMenuBadgeCount(props.badgeId);
  return storeCount > 0 ? storeCount : props.staticCount;
});

const isVisible = computed(() => {
  // Hide when value is null, undefined, 0, or empty
  const count = displayCount.value;
  return count !== null && count !== undefined && count !== 0 && count !== '0' && count !== '';
});
</script>
