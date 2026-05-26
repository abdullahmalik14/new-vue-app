<template>
  <div
    v-show="isActive"
    class="fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="progressPercent"
    aria-label="Page loading"
  >
    <div
      class="h-full w-full bg-blue-600 origin-left transition-transform duration-200 ease-out"
      :style="{ transform: `scaleX(${progress})` }"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useNavigationProgress } from '@/utils/route/navigationProgress.js';

const { isActive, progress } = useNavigationProgress();

const progressPercent = computed(() => Math.round(progress.value * 100));
</script>
