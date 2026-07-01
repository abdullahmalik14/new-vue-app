<template>
  <div
    class="flex items-center gap-6 bg-black/25 rounded-md px-4 py-2 border border-[#EAECF080]"
  >
    <div class="flex justify-between items-center gap-2 py-2 w-full">
      <div class="h-12">
        <p
          class="text-base font-medium text-[#EAECF0] line-clamp-2"
        >
          {{ address }}
        </p>
      </div>

      <img
        :src="resolvedIcon"
        alt="edit"
        class="w-[1.125rem] cursor-pointer
        [filter:brightness(0)_saturate(100%)_invert(98%)_sepia(2%)_saturate(335%)_hue-rotate(184deg)_brightness(97%)_contrast(95%)]"
        @click="$emit('address-edit')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { assets } = useCheckoutDemoAssets();

const props = defineProps({
  address: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
});

const resolvedIcon = computed(() => props.icon || assets.value.addressIcon);

defineEmits(['address-edit']);
</script>
