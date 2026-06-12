<template>
  <BasePopup
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="popupConfig"
  >
    <!-- popup-inner-wrapper -->
    <div class="w-full min-h-screen relative overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] shadow-[0px_0px_10px_0px_#00000040] bg-[#F9FAFB]/90 md:w-[29.1875rem] dark:bg-[#1b1d1e]/90">
        <!-- blur-overlay -->
        <div class="absolute inset-0 w-full h-full backdrop-blur-[50px] pointer-events-none z-[-1]"></div>
        
        <!-- popup-container -->
        <div class="flex flex-col min-h-[100dvh] shadow-[0px_0px_10px_-34px_#0000001A] [background:linear-gradient(0deg,rgba(255,255,255,0.9),rgba(255,255,255,0.9)),linear-gradient(180deg,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_100%)] before:inset-0 before:content-[''] before:absolute before:bg-[url('https://i.ibb.co.com/6Rz2GJd8/payout-popup-gradient.png')] before:bg-cover before:bg-center before:bg-no-repeat before:[opacity:12.5%] before:z-[0] before:pointer-events-none">
            <WithdrawEarningsStep1 v-if="engine.step === 1" :engine="engine" @close="handleClose" />
            <WithdrawEarningsStep2 v-if="engine.step === 2" :engine="engine" @close="handleClose" />
            <WithdrawEarningsStep3 v-if="engine.step === 3" :engine="engine" @close="handleClose" />
            <WithdrawEarningsStep4 v-if="engine.step === 4" :engine="engine" @close="handleClose" />
            <WithdrawEarningsStep5 v-if="engine.step === 5" :engine="engine" @close="handleClose" />
        </div>
    </div>
  </BasePopup>
</template>

<script setup>
import BasePopup from "./BasePopup.vue";
import { createStepStateEngine } from "@/utils/stateEngine";
import { onMounted } from 'vue';
import WithdrawEarningsStep1 from "./withdraw-earnings-steps/WithdrawEarningsStep1.vue";
import WithdrawEarningsStep2 from "./withdraw-earnings-steps/WithdrawEarningsStep2.vue";
import WithdrawEarningsStep3 from "./withdraw-earnings-steps/WithdrawEarningsStep3.vue";
import WithdrawEarningsStep4 from "./withdraw-earnings-steps/WithdrawEarningsStep4.vue";
import WithdrawEarningsStep5 from "./withdraw-earnings-steps/WithdrawEarningsStep5.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(["update:modelValue"]);

const popupConfig = {
  actionType: "slidein",
  from: "right",
  showOverlay: true,
  closeOnOutside: true,
  lockScroll: true,
  width: { default: '100%', '>768': '29.1875rem' },
  height: { default: '100%' }
};

const engine = createStepStateEngine({
    flowId: 'withdraw-earnings-popup-flow',
    initialStep: 1,
    urlSync: 'none',
    defaults: {
        selectedCountry: '',
        amount: '',
        availableBalance: 30054.40
    }
});

onMounted(() => {
    engine.initialize({ fromUrl: false });
});

const handleClose = () => {
    emit('update:modelValue', false);
};
</script>
