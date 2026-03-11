<template>
  <div 
    class="inline-flex justify-center items-center" 
    :class="[wrapperClass]"
  >
    <!-- Use img if src provided -->
    <img 
      v-if="src" 
      :src="src" 
      class="animate-spin"
      :class="[sizeClass, customClass]" 
      :style="[dynamicStyle, { filter: imgFilter }]"
      alt="Loading..."
    />
    
    <!-- Otherwise use inline SVG -->
    <svg 
      v-else 
      class="animate-spin"
      :class="[sizeClass, customClass, color]" 
      :style="dynamicStyle"
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <!-- Background Track -->
      <circle 
        v-if="showTrack"
        class="opacity-25" 
        cx="12" 
        cy="12" 
        :r="radius" 
        stroke="currentColor" 
        :stroke-width="strokeWidth"
        :class="trackColor"
      ></circle>
      <!-- Spinning Segment -->
      <circle 
        class="opacity-75"
        cx="12"
        cy="12"
        :r="radius"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="dasharray"
      ></circle>
    </svg>
    <span v-if="text" :class="['ml-2', textClass]">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Size preset ('xs', 'sm', 'md', 'lg', 'xl', '2xl') or arbitrary classes if empty string
  size: { type: String, default: 'md' },
  // Color of the spinning part (e.g., 'text-blue-500', 'text-white', etc)
  color: { type: String, default: 'text-indigo-600' },
  // Color of the background circle track (e.g., 'text-gray-200'). 
  // We use currentColor on stroke, so text- color utilities work.
  trackColor: { type: String, default: 'text-gray-200' },
  // Whether to show the background circle track
  showTrack: { type: Boolean, default: true },
  // Animation speed preset ('slow', 'normal', 'fast')
  speed: { type: String, default: 'normal' },
  // Thickness of the circle (e.g., '2', 4, '6')
  thickness: { type: [String, Number], default: '4' },
  // Source if they want to use an external img instead of SVG inline
  src: { type: String, default: '' },
  // CSS filter string for img (e.g., 'hue-rotate(90deg)', 'invert(1)')
  imgFilter: { type: String, default: '' },
  // Optional Text next to spinner
  text: { type: String, default: '' },
  // Optional text styling
  textClass: { type: String, default: 'text-sm font-medium text-gray-500' },
  // Generic custom override for the SVG/IMG
  customClass: { type: String, default: '' },
  // Wrapper class for the flex container
  wrapperClass: { type: String, default: '' }
});

const sizeClass = computed(() => {
  const map = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
    '2xl': 'w-20 h-20'
  };
  return map[props.size] || '';
});

const strokeWidth = computed(() => {
  return String(props.thickness);
});

const radius = computed(() => {
  // Prevent clipping by ensuring the outer edge stays within the 24x24 viewBox
  // Max radius is 12, minus half the stroke width
  return Math.max(1, 12 - (Number(strokeWidth.value) / 2));
});

const dasharray = computed(() => {
  // Preserve the roughly 70% filled / 30% empty dash ratio (45/65) from standard size
  const c = 2 * Math.PI * radius.value;
  return `${c * 0.7} ${c * 0.3}`;
});

// Since tailwind animate-spin duration defaults to 1s, we can apply dynamic style if speed is slow/fast
const dynamicStyle = computed(() => {
  const styles = {};
  if (props.speed === 'slow') styles.animationDuration = '1.5s';
  if (props.speed === 'fast') styles.animationDuration = '0.5s';
  if (props.speed === 'very-fast') styles.animationDuration = '0.3s';
  return styles;
});
</script>
