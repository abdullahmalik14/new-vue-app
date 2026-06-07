<template>
  <BasePopupShell
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="popupConfig"
  >
    <!-- popup-inner-wrapper -->
    <div class="w-full min-h-screen relative overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] shadow-[0px_0px_10px_0px_#00000040] bg-[#F9FAFB]/90 md:w-[29.1875rem] lg:w-[45rem] dark:bg-[#1b1d1e]/90">
        <!-- blur-overlay -->
        <div class="absolute inset-0 w-full h-full backdrop-blur-[50px] pointer-events-none z-[-1]"></div>
        
        <PayoutSettingsStep1 v-if="engine.step === 1" :engine="engine" @close="handleClose" />
        <PayoutSettingsStep2 v-if="engine.step === 2" :engine="engine" @close="handleClose" />
        <PayoutSettingsStep3 v-if="engine.step === 3" :engine="engine" @close="handleClose" />
    </div>
  </BasePopupShell>
</template>

<script setup>
import BasePopupShell from "./BasePopupShell.vue";
import { createStepStateEngine } from "@/utils/stateEngine";
import { onMounted } from 'vue';
import PayoutSettingsStep1 from "./payout-settings-steps/PayoutSettingsStep1.vue";
import PayoutSettingsStep2 from "./payout-settings-steps/PayoutSettingsStep2.vue";
import PayoutSettingsStep3 from "./payout-settings-steps/PayoutSettingsStep3.vue";

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
  width: { default: '100%', '>768': '29.1875rem', '>1024': '45rem' },
  height: { default: '100%' }
};

const engine = createStepStateEngine({
    flowId: 'payout-settings-popup-flow',
    initialStep: 1,
    urlSync: 'none',
    defaults: {
        currentMode: 'auto-withdraw',
        autoWithdrawMethod: 'every-month',
        targetAmount: '',
        selectedPayoutMethodValue: '',
        selectedCountryValue: null,
        selectedPayoutCountryOption: null,
        isSaved: false,
        savedPayoutMethods: [],
        cardDesign: {
            mode: 'premium',
            premiumBg: 'https://i.ibb.co.com/f6bTQ59/premium-design-1.webp',
            color: '#F72485'
        }
    }
});

onMounted(() => {
    engine.initialize({ fromUrl: false });
});

const handleClose = () => {
    emit('update:modelValue', false);
};
</script>
