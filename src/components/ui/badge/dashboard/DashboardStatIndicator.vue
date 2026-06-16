<template>
  <div class="flex flex-col items-end gap-1">
    <span class="flex gap-1 items-center">
      <img :src="trendIcon" :alt="trendAlt" class="h-5 w-5" />
      <span :class="trendTextColor" class="leading-5 text-sm font-medium">
        {{ formattedPercentage }}%
      </span>
    </span>
    <span v-if="periodLabel" class="text-light-text-secondary dark:text-dark-text-secondary leading-[1.125rem] text-xs">
      {{ periodLabel }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    required: true
  },
  periodLabel: {
    type: String,
    default: 'vs yesterday'
  }
})

const isPositive = computed(() => props.percentage >= 0)
const formattedPercentage = computed(() => {
  const num = Number(props.percentage)
  return isNaN(num) ? 0 : Math.abs(num)
})

const trendIcon = computed(() => 
  isPositive.value 
    ? '/dev/cdn/analytics/icons/icon-4.webp' 
    : '/dev/cdn/analytics/icons/icon-5.webp'
)

const trendAlt = computed(() => isPositive.value ? 'trend-up' : 'trend-down')

const trendTextColor = computed(() => 
  isPositive.value 
    ? 'text-light-text-trendGreen dark:text-light-text-trendGreen' 
    : 'text-light-text-trendRed dark:text-light-text-trendRed'
)
</script>
