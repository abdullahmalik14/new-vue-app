<template>
  <div class="w-[7.5rem] h-[7.5rem] bg-white rounded-full sm:w-[8.0475rem] sm:h-[8.0475rem] md:w-[10.6875rem] md:h-[10.6875rem] xl:w-[12.1875rem] xl:h-[12.1875rem]">
    <div 
      class="w-full h-full relative bg-cover bg-center bg-no-repeat rounded-full before:absolute before:content-[''] before:inset-0 before:bg-black/75 before:rounded-full" 
      :style="{ backgroundImage: `url('${imageSrc}')` }"
    >
      <svg width="200" height="200" viewBox="0 0 200 200" class="absolute w-full h-full z-[1] transform rotate-[330deg]">
        <circle
          class="[fill:none]"
          stroke-width="13"
          cx="100"
          cy="100"
          r="94"
        />

        <circle
          class="[fill:none] [stroke:#07F468] [transition:stroke-dashoffset_0.5s_ease]"
          stroke-width="13"
          cx="100"
          cy="100"
          r="94"
          transform="rotate(-90 100 100)"
          :style="{
            strokeDasharray: circumference,
            strokeDashoffset: dashOffset
          }"
        />
      </svg>

      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm leading-normal font-medium tracking-[-0.0625rem] text-[#07F468]">
        {{ label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// here we deifne the props so we pass the data from the parent
const props = defineProps({
  progress: {
    type: Number,
    default: 0, // 0 to 100
  },
  imageSrc: {
    type: String,
    default: 'https://i.ibb.co.com/Kx9QDc68/auth-bg-compressed.webp'
  },
  label: {
    type: String,
    default: 'Uploading...'
  }
});

const radius = 94;
const circumference = 2 * Math.PI * radius;

const dashOffset = computed(() => {
  // Formula: Circumference - (Percent / 100) * Circumference
  return circumference - (props.progress / 100) * circumference;
});
</script>