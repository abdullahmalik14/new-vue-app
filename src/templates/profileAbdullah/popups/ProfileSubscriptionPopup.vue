<script setup>
import PopupHandler from '@/components/ui/popup/PopupHandler.vue';
import ProfileSubscriptionCards from '../components/ProfileSubscriptionCards.vue';


const props = defineProps({
    modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const profileSubscriptionPopupConfig = {
    actionType: "slidein",
    from: "right",
    offset: "0px",
    speed: "250ms",
    effect: "ease-in-out",
    showOverlay: false,
    closeOnOutside: true,
    lockScroll: true,
    escToClose: true,
    width: { default: "100%" },
    height: "auto",
    scrollable: true,
    closeSpeed: "250ms",
    closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};
</script>

<template>
    <PopupHandler :modelValue="modelValue" @update:modelValue="(val) => emit('update:modelValue', val)"
        :config="profileSubscriptionPopupConfig">
        <div
            class="h-full w-full relative flex pt-[24px] pb-[24px] flex-col gap-4 bg-black/20 backdrop-blur-[200px] overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] ">
            <!-- Header -->

            <div class="w-full relative flex  flex-col justify-center items-center gap-4">
                <!-- close icon -->
                <div class="absolute top-6 cursor-pointer right-4" @click="emit('update:modelValue', false)">
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 1L1 17M1 1L17 17" stroke="#07F468" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>

                <div class="flex flex-col justify-center items-center gap-1">
                    <div>
                        <img class="w-20 h-20 " src="/images/ovalProfile.png" />
                    </div>
                    <div class=" w-full flex flex-col  items-start">
                        <div class="flex justify-center items-center gap-1">
                            <div
                                class="start text-white text-2xl font-semibold font-['Poppins'] leading-8 line-clamp-1">
                                Yumi’s always eating</div>
                        </div>
                        <div class="text-center w-full text-gray-400 text-xs font-medium font-['Poppins'] leading-4">
                            @sammisjelly187</div>
                        <div class="flex items-center justify-center w-full gap-3">
                            <div class="flex  items-center gap-1">
                                <div class="w-3.5 h-3.5 relative overflow-hidden">
                                    <img src="/images/profile.webp" alt="">
                                </div>
                                <div
                                    class="justify-center text-gray-400 text-xs font-normal font-['Poppins'] leading-4">
                                    15.2K</div>
                            </div>
                            <div class="flex  items-center gap-1">
                                <div class="w-3.5 h-3.5 relative overflow-hidden">
                                    <img src="/images/like-normal.webp" alt="">

                                </div>
                                <div
                                    class="justify-center text-gray-400 text-xs font-normal font-['Poppins'] leading-4">
                                    99K</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

                <div>
                    <ProfileSubscriptionCards  />
                </div>
      

        </div>

    </PopupHandler>

</template>