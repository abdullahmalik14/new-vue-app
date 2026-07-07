<script setup>
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  showClose: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['section-close'])
</script>

<template>
  <div class="flex justify-between items-center border-b border-transparent">
    <!-- section-title -->
    <div class="flex items-center gap-2">
      <div class="flex justify-center items-center w-5 h-5">
        <img
          :src="icon"
          alt="icon"
          class="w-5 h-5"
        />
      </div>

      <h3 class="text-base font-semibold text-[#F9FAFB] align-middle">
        {{ title }}
      </h3>
    </div>

    <!-- close-button (desktop) -->
    <div
      v-if="showClose"
      @click="emit('section-close')"
      class="hidden justify-center items-center w-12 h-12 bg-white/10 backdrop-blur-[20px] rounded-full cursor-pointer z-[99] md:flex"
    >
      <img
        :src="assets.closeIcon"
        alt="close"
        class="w-8 h-8 drop-shadow-[0_0_8px_0_#00000080]"
      />
    </div>
  </div>
</template>
