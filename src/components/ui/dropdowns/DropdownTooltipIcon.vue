<template>
  <div class="relative inline-flex items-center min-w-0" :class="wrapperClass">
    <div
      ref="anchorEl"
      class="cursor-pointer"
      tabindex="0"
      :aria-label="text"
    >
      <img v-if="iconSrc" :src="iconSrc" alt="" :class="iconClass" />
      <slot v-else />
    </div>
    <DropdownMenu :anchor="anchorEl" :config="menuConfig" @repositioned="onRepositioned">
      <div class="relative p-1">
        <div
          v-if="actualPlacement === 'top'"
          class="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#101828B2]"
        />
        <div
          v-if="actualPlacement === 'bottom'"
          class="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#101828B2]"
        />
        <p class="text-xs leading-normal font-semibold text-white">
          {{ text }}
        </p>
      </div>
    </DropdownMenu>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import DropdownMenu from '@/components/ui/dropdowns/DropdownMenu.vue';

const props = defineProps({
  text: { type: String, required: true },
  iconSrc: { type: String, default: '' },
  iconClass: { type: String, default: 'w-4 h-4' },
  wrapperClass: { type: String, default: '' },
  width: { type: Number, default: 280 },
});

const anchorEl = ref(null);
const actualPlacement = ref('bottom');

const menuConfig = computed(() => ({
  trigger: 'hover',
  hoverIntentMs: 80,
  layer: 'tooltip',
  theme: 'tooltip-dark',
  width: props.width,
  offset: 12,
  positionMode: 'below',
  align: 'center',
  flipOnOverflow: true,
  ariaRole: 'tooltip',
  scrollEnabled: false,
  closeOnScroll: false,
  animation: 'fade',
}));

function onRepositioned(event) {
  actualPlacement.value = event?.placement === 'top' ? 'top' : 'bottom';
}
</script>
