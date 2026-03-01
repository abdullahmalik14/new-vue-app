<script setup>
import PopupHandler from '@/components/ui/popup/PopupHandler.vue';
import { createStepStateEngine } from '@/utils/stateEngine';
import TipStep1 from '@/templates/profileAbdullah/components/TipTokenSteps/TipStep1.vue';
import TipStep2 from '@/templates/profileAbdullah/components/TipTokenSteps/TipStep2.vue';
import TipStep3 from '@/templates/profileAbdullah/components/TipTokenSteps/TipStep3.vue';
import { provide, onMounted } from 'vue';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const profileCallPopupConfig = {
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
    width: { default: "auto", "<768": "100%", },
    height: { default: "auto", "<1010": "90%", "<768": "100%" },
    scrollable: true,
    closeSpeed: "250ms",
    closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const engine = createStepStateEngine({
    flowId: 'tip-popup-flow',
    initialStep: 1,
    defaults: {
        amount: 0,
        message: '',
        anonymous: false,
        // Step 2 & 3 Data
        topUpAmount: 100,
        userBalance: 1834, // Mock
        email: '',
        password: '',
        isLoggedIn: false, // Mock
        authMode: 'login', // login, guest, forgot
        paymentMethod: 'card',
        paymentCardNumber: '',
        paymentExpiry: '',
        paymentCardHolder: '',
        paymentCvv: '',
        paymentSaveCard: false,
        firstName: '',
        lastName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        selectedCountry: 'United States',
        selectedState: '',
        saveAddress: false,
    }
});

// Provide engine if needed by children, though we are passing as prop
provide('tipEngine', engine);

const handleClose = () => {
    emit('update:modelValue', false);
};

onMounted(() => {
    engine.initialize({ fromUrl: false });
});

</script>

<template>
    <PopupHandler :modelValue="modelValue" @update:modelValue="(val) => emit('update:modelValue', val)"
        :config="profileCallPopupConfig">
        <!-- close-icon -->
        <div @click="handleClose"
            class="absolute w-10 h-10 top-2 right-2 z-10 flex justify-center items-center cursor-pointer rounded-full bg-transparent [backdrop-filter:blur(0)] [filter:drop-shadow(0_0_20px_#FFFFFF)] md:w-12 md:h-12 md:-top-6 md:-right-6 md:bg-bg-overlay dark:md:bg-bg-dark-overlay md:[backdrop-filter:blur(20px)] md:[filter:none]">
            <img class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(90%)_sepia(9%)_saturate(72%)_hue-rotate(183deg)_brightness(105%)_contrast(91%)] md:w-[2.125rem] md:h-[2.125rem] md:[filter:none]"
                src="https://i.ibb.co.com/XrzfWZFN/svgviewer-png-output-35.webp" alt="close-icon">
        </div>
        <div
            class="flex flex-col w-full overflow-visible shadow-[0px_0px_20px_0px_rgba(0,0,0,0.25)] dark:shadow-[0px_0px_20px_0px_rgba(24,26,27,0.25)] backdrop-blur-[50px] relative md:w-max md:max-w-[31.6875rem] lg:max-w-none overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] h-full">

            <!-- column-container -->
            <div
                class="flex flex-col lg:flex-row  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">
                <!-- left-column -->
                <div
                    class="w-full h-80 flex bg-[url('https://i.ibb.co.com/bjGQxr5S/sample-bg-image.webp')] bg-cover bg-center min-h-[23.4375rem] sm:min-h-[20rem] lg:min-h-[33.625rem] lg:w-[20.1875rem] ">

                    <!-- Overlay Container -->
                    <div
                        class="h-full w-full flex items-end bg-gradient-to-b from-transparent via-transparent to-bg-gradient-overlay dark:to-bg-gradient-overlay-dark lg:to-bg-gradient-overlayLg dark:lg:to-bg-gradient-overlayLg-dark">
                        <!-- Text Container -->
                        <div class="p-2 flex flex-col gap-2.5 [filter:drop-shadow(0_0_0.5rem_rgba(0,0,0,0.5))] md:p-4">
                            <p class="text-xl leading-[1.875rem] text-white dark:text-text-dark-primary font-medium">I
                                would love to get some tip if you appreciate my content. :) **** 123</p>
                            <div class="flex flex-col">
                                <div class="flex gap-1 items-center">
                                    <span
                                        class="text-sm leading-5 text-text-secondary dark:text-text-dark-secondary font-medium">Princess
                                        Carrot Pop</span>
                                    <img src="https://i.ibb.co.com/nMhY8CpS/svgviewer-png-output-22.webp"
                                        alt="verified-tick" class="w-[0.6875rem] h-[0.625rem]">
                                </div>
                                <span
                                    class="text-xs leading-[1.125rem] text-text-tertiary dark:text-text-dark-tertiary font-medium">@sammisjelly187</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- right-column -->
                <div
                    class="w-full bg-bg-card dark:bg-bg-dark-form  flex flex-col md:max-w-[31.6875rem] lg:max-w-none lg:w-[32.5625rem]
                    lg:h-[33.625rem] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">
                    <TipStep1 v-if="engine.step === 1" :engine="engine" @close="handleClose" />
                    <TipStep2 v-if="engine.step === 2" :engine="engine" @close="handleClose" />
                    <TipStep3 v-if="engine.step === 3" :engine="engine" @close="handleClose" />
                </div>
            </div>
        </div>
    </PopupHandler>
</template>