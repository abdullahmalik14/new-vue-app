<script setup>
import PopupHandler from '@/components/ui/popup/PopupHandler.vue';
import { createStepStateEngine } from '@/utils/stateEngine';
import CrowdFundingPopupStep1 from './CrowdFundingPopupStep1.vue';
import CrowdFundingPopupStep2 from './CrowdFundingPopupStep2.vue';
import CrowdFundingPopupStep3 from './CrowdFundingPopupStep3.vue';
import { computed } from 'vue';


const engine = createStepStateEngine({
  flowId: 'one-on-one-booking-flow',
  initialStep: 1,
  urlSync: 'none',
});

const currentStepComponent = computed(() => {
  switch (engine.step) {
    case 1: return CrowdFundingPopupStep1;
    case 2: return CrowdFundingPopupStep2;
    case 3: return CrowdFundingPopupStep3;
    default: return CrowdFundingPopupStep1;
  }
});

const ticketEventPopupConfig = {
  actionType: "popup",
  position: "center",
  customEffect: "scale",
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  showOverlay: false,
  closeOnOutside: true,
  lockScroll: false,
  escToClose: true,
  width: { default: "auto", "<500px": "90%" },
  height: { default: "90%", "<768": "90%" },
  scrollable: true,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
    <PopupHandler
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="ticketEventPopupConfig"
  >

    <component 
      :is="currentStepComponent" 
      :engine="engine"
      @close-popup="emit('update:modelValue', false)"
    />

  </PopupHandler>
</template>