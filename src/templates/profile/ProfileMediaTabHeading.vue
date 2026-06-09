<template>
  <div class="flex justify-between items-center px-2 md:px-4 xl:px-12">
    <div class="flex gap-3.5 mb-4 xl:mb-6">
      <!-- Section Title -->
      <h2
        class="text-xl leading-normal font-medium text-[#e9e5d3] pl-4 border-l border-[#e9e5d3]"
      >
        {{ title }}
      </h2>

      <!-- "View All" with optional count -->
      <div
        class="flex items-center gap-1 cursor-pointer opacity-100"
        @click="onViewAll && onViewAll()"
      >
        <span class="text-sm font-medium text-[#07F468]">View All</span>
        <span
          v-if="count !== null && count !== undefined"
          class="text-sm leading-normal text-[#07F468] self-start"
        >
          {{ count }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  count: {
    type: [Number, String],
    default: null,
  },
  onViewAll: Function,
});
</script>
