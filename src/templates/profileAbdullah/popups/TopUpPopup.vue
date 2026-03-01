<script setup>
import PopupHandler from '@/components/ui/popup/PopupHandler.vue';
import { createStepStateEngine } from '@/utils/stateEngine';
import TopUpStep1 from '@/templates/profileAbdullah/components/TopUpSteps/TopUpStep1.vue';
import TopUpStep2 from '@/templates/profileAbdullah/components/TopUpSteps/TopUpStep2.vue';
import { provide, onMounted } from 'vue';

const props = defineProps({
        modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const profileCallPopupConfig = {
        actionType: "slidein",
        from: "right",
        offset: "0px",
        speed: "250ms",
        effect: "ease-in-out",
        showOverlay: false,
        closeOnOutside: true,
        lockScroll: true,
        escToClose: true,
        width: { default: "auto" },
        height: { default: "100%" },
        scrollable: true,
        closeSpeed: "250ms",
        closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const engine = createStepStateEngine({
        flowId: 'top-up-flow',
        initialStep: 1,
        defaults: {
                topUpAmount: 100,
                userBalance: 1834, // Mock
                discount: 0.30,
                finalPrice: 0,
                originalPrice: 0,
        }
});

// Provide engine if needed by children
provide('topUpEngine', engine);

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


                <!-- column-container -->

                <div class="flex flex-col w-full bg-bg-card dark:bg-bg-dark-form w-full sm:w-[521px]
                [&::-webkit-scrollbar]:hidden [-ms-order-style:none] 
                [scrollbar-width:none] h-full">
                        <!-- close-icon -->

                        <div @click="handleClose"
                                class="w-full shrink-0 z-10 py-[20px] px-[24px] flex justify-end items-center cursor-pointer rounded-full bg-transparent ">
                                <svg width="10" height="10" viewBox="0 0 18 18" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17 1L1 17M1 1L17 17" stroke="#98A2B3" stroke-width="1.5"
                                                stroke-linecap="round" stroke-linejoin="round" />
                                </svg>

                        </div>
                        <div
                                class="flex-1 w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">
                                <TopUpStep1 v-if="engine.step === 1" :engine="engine" @close="handleClose" />
                                <TopUpStep2 v-if="engine.step === 2" :engine="engine" @close="handleClose" />
                        </div>
                </div>

        </PopupHandler>
</template>
