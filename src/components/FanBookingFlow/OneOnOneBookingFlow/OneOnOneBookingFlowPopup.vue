<script setup>
import { computed, onMounted, watch } from 'vue'; // watch add kiya hai
import PopupHandler from '@/components/ui/popup/PopupHandler.vue';
import { createStepStateEngine } from '@/utils/stateEngine';

// Import the step components
import BookingFlowStep1 from './BookingFlowStep1.vue';
import BookingFlowStep2 from './BookingFlowStep2.vue';
import BookingFlowStep3 from './BookingFlowStep3.vue';
import BookingFlowStep4 from './BookingFlowStep4.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

// --- State Engine Initialization ---
const engine = createStepStateEngine({
  flowId: 'one-on-one-booking-flow',
  initialStep: 1,
  urlSync: 'none',
  initialState: {
    bookingDetails: {
      selectedDate: null,
      selectedTime: { label: '4:00pm', value: '16:00' },
      selectedDuration: { value: 15, price: 500 },
      addons: [],
      otherRequest: "Can you buy this cake in this cake shop...",
      totalPrice: 500,
      walletBalance: 1000,
      formattedTimeRange: "-",
      headerDateDisplay: "",
    }
  }
});

// --- CONSOLE DEBUGGER (Safe Version) ---
watch(
  () => [engine.state, engine.step, engine.substep],
  ([newState, newStep, newSubstep]) => {
    // Check if state and bookingDetails exist before parsing
    if (!newState || !newState.bookingDetails) return;

    try {
      console.group('%c 1-on-1 Booking Flow Debug ', 'background: #22CCEE; color: #000; font-weight: bold; padding: 2px 4px; border-radius: 4px;');
      console.log('%c Current Step: ', 'color: #22CCEE; font-weight: bold;', newStep);
      console.log('%c Substep: ', 'color: #07F468; font-weight: bold;', newSubstep || 'None');
      
      // Safe logging using structuredClone or simple spread
      console.log('%c Booking Data: ', 'color: #FFED29; font-weight: bold;', { ...newState.bookingDetails });
      
      console.groupEnd();
    } catch (err) {
      console.error("Debug Error:", err);
    }
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  engine.initialize();
  console.log('%c Booking Engine Initialized ', 'color: #07F468; font-weight: bold; border: 1px solid #07F468; padding: 2px;');
});

const currentStepComponent = computed(() => {
  switch (engine.step) {
    case 1: return BookingFlowStep1;
    case 2: return BookingFlowStep2;
    case 3: return BookingFlowStep3;
    case 4: return BookingFlowStep4;
    default: return BookingFlowStep1;
  }
});

// ... (config remains same) ...
const oneOnOneBookingFlowPopupConfig = {
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
  height: { default: "auto" },
  scrollable: true,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

</script>

<template>
  <PopupHandler
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="oneOnOneBookingFlowPopupConfig"
  >
    <component 
      :is="currentStepComponent" 
      :engine="engine"
      @close-popup="emit('update:modelValue', false)"
    />
  </PopupHandler>
</template>