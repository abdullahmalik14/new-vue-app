<script setup>
import PopupHandler from '@/components/ui/popup/PopupHandler.vue';
import { createStepStateEngine } from '@/utils/stateEngine';
import TicketPopupStep1 from './TicketPopupStep1.vue';
import TicketPopupStep2 from './TicketPopupStep2.vue';
import TicketPopupStep3 from './TicketPopupStep3.vue';
import { computed } from 'vue';


const engine = createStepStateEngine({
  flowId: 'one-on-one-booking-flow',
  initialStep: 1,
  urlSync: 'none',
});

const currentStepComponent = computed(() => {
  switch (engine.step) {
    case 1: return TicketPopupStep1;
    case 2: return TicketPopupStep2;
    case 3: return TicketPopupStep3;
    default: return TicketPopupStep1;
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