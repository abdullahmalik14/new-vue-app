<script setup>
import PopupHandler from '@/components/ui/popup/PopupHandler.vue';

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
    lockScroll: false,
    escToClose: true,
    width: { default: "100%", "<768": "100%" },
    height: { default: "100%", "<768": "100%" },
    scrollable: false,
    closeSpeed: "250ms",
    closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};
</script>

<template>
    <PopupHandler :modelValue="modelValue" @update:modelValue="(val) => emit('update:modelValue', val)"
        :config="profileCallPopupConfig">
        <div
            class="relative h-full backdrop-blur-md overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] flex flex-col justify-between">

            <!-- cross-icon -->
            <div @click="emit('update:modelValue', false)"
                class="p-3 right-5 top-5 absolute cursor-pointer bg-black/50 rounded-[50px] backdrop-blur-[10px] inline-flex justify-center items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 1L1 17M1 1L17 17" stroke="white" stroke-width="1.5" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <!-- call-section -->
            <div class="w-full relative inline-flex flex-col  items-center gap-4 mt-[50px] flex-1">
                <div class="flex flex-col justify-center items-center">
                    <img class="w-24 h-24" src="/images/ovalProfile.png" />
                    <div
                        class="h-5 px-2 py-1 bg-black/30 rounded-[50px] outline outline-[0.50px] outline-offset-[-0.50px] outline-[#07F468]/50 backdrop-blur-[5px] inline-flex justify-center items-center gap-2">
                        <div class="w-2 h-2 bg-[#07F468] rounded-full shadow-[0px_0px_10px_0px_rgba(20,224,77,1.00)]" />
                        <div
                            class="justify-center text-white text-[10px] font-medium font-['Poppins'] uppercase tracking-wide">
                            online NOW!</div>
                    </div>
                </div>

                <div class=" mx-[74px] bg-black/5 flex flex-col  items-center gap-10">
                    <div class="p-4 flex flex-col justify-center items-center gap-2">
                        <div class="inline-flex justify-center items-start gap-3 flex-wrap content-start">
                            <div
                                class=" text-[#07F468] text-5xl font-bold font-['Poppins'] leading-[64px] line-clamp-1">
                                Connect Instantly. Call Now.</div>
                        </div>
                        <div
                            class="h-8 text-center justify-center text-white text-base font-normal font-['Poppins'] leading-6">
                            "My kitchen is super wet now! call me to see how wet it gets"</div>
                    </div>
                    <div class="px-[74px] w-full flex flex-col justify-center items-center gap-12">
                        <div class="w-full lg:flex justify-center items-start gap-4">
                            <div class="w-full flex-1 relative flex  items-center">
                                <div class="flex flex-col  items-start gap-2.5">
                                    <img class="w-28 h-28 absolute top-3 -left-[60px] z-[9]"
                                        src="/images/camera-img.png" />
                                </div>
                                <div class="w-96 inline-flex flex-col justify-center items-start gap-2">
                                    <div class="pl-10 flex flex-col  items-start gap-2.5">
                                        <div
                                            class="px-1.5 py-0.5 bg-white/5 rounded-sm inline-flex justify-center items-center gap-2.5">
                                            <div
                                                class="justify-center text-[#07F468] text-xs font-medium font-['Poppins'] leading-4">
                                                AVAILABLE NOW!</div>
                                        </div>
                                    </div>
                                    <div
                                        class="relative min-h-16 rounded-2xl inline-flex  items-center overflow-hidden">
                                        <div
                                            class="w-72 pl-14 pr-6 py-3 bg-gradient-to-b from-white/10 to-white/40 inline-flex flex-col justify-center items-center gap-2">
                                            <div class="flex flex-col  items-start gap-1">
                                                <div class="flex flex-col  items-start gap-3">
                                                    <div class="inline-flex justify-center items-center gap-2">
                                                        <div
                                                            class="text-center justify-center text-white text-2xl font-semibold font-['Poppins'] leading-8">
                                                            Video Call</div>
                                                    </div>
                                                </div>
                                                <div class="inline-flex  items-center gap-1">
                                                    <div class="flex  items-center gap-0.5">
                                                        <div class="w-6 h-6 relative">
                                                            <img src="/images/token.webp" alt="">
                                                        </div>
                                                        <div
                                                            class="justify-center text-white text-lg font-semibold font-['Poppins'] leading-7">
                                                            5,000</div>
                                                    </div>
                                                    <div
                                                        class="justify-end text-white text-xs font-medium font-['Poppins'] leading-4 line-clamp-1">
                                                        every 30 sec.</div>
                                                </div>
                                                <div class="w-52 inline-flex  items-center gap-2.5">
                                                    <div class="justify-end"><span
                                                            class="text-white text-[8px] font-medium font-['Poppins'] leading-3 line-clamp-1">Minimum
                                                            Call Time: </span><span
                                                            class="text-[#07F468] text-[8px] font-medium font-['Poppins'] leading-3 line-clamp-1">5
                                                            mins</span></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-full flex  items-center overflow-hidden">
                                            <img src="/images/green-union.png" class="absolute right-[129px] w-10" />
                                            <div
                                                class="px-6 py-2 h-[116px] bg-[#07F468] flex justify-center items-center gap-0.5">
                                                <div
                                                    class="justify-center text-gray-900 text-xl font-bold font-['Poppins'] leading-8">
                                                    CALL</div>
                                                <div class="w-8 h-8 relative">
                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                                        xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M9.3335 22.6666L22.6668 9.33331M22.6668 9.33331H9.3335M22.6668 9.33331V22.6666"
                                                            stroke="#000" stroke-width="2.5" stroke-linecap="round"
                                                            stroke-linejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="w-full flex-1  relative flex  items-center">
                                <div class="w-28 inline-flex flex-col  items-start gap-2.5">
                                    <img class="w-28 h-28 absolute top-3 left-12 z-[9]" src="/images/mob-img.png" />
                                </div>
                                <div class="inline-flex flex-col justify-center items-start gap-2">
                                    <div class="pl-10 flex flex-col  items-start gap-2.5">
                                        <div
                                            class="px-1.5 py-0.5 bg-white/5 rounded-sm inline-flex justify-center items-center gap-2.5">
                                            <div
                                                class="justify-center text-[#07F468] text-xs font-medium font-['Poppins'] leading-4">
                                                AVAILABLE NOW!</div>
                                        </div>
                                    </div>
                                    <div
                                        class="relative min-h-16 rounded-2xl inline-flex  items-center overflow-hidden">
                                        <div
                                            class="w-72 pl-14 pr-6 py-3 bg-gradient-to-b from-white/10 to-white/40 inline-flex flex-col justify-center items-center gap-2">
                                            <div class="flex flex-col  items-start gap-1">
                                                <div class="flex flex-col  items-start gap-3">
                                                    <div class="inline-flex justify-center items-center gap-2">
                                                        <div
                                                            class="text-center justify-center text-white text-2xl font-semibold font-['Poppins'] leading-8">
                                                            Audio Call</div>
                                                    </div>
                                                </div>
                                                <div class="inline-flex  items-center gap-1">
                                                    <div class="flex  items-center gap-0.5">
                                                        <div class="w-6 h-6 relative">
                                                            <img src="/images/token.webp" alt="">
                                                        </div>
                                                        <div
                                                            class="justify-center text-white text-lg font-semibold font-['Poppins'] leading-7">
                                                            5,000</div>
                                                    </div>
                                                    <div
                                                        class="justify-end text-white text-xs font-medium font-['Poppins'] leading-4 line-clamp-1">
                                                        every 30 sec.</div>
                                                </div>
                                                <div class="w-52 inline-flex  items-center gap-2.5">
                                                    <div class="justify-end"><span
                                                            class="text-white text-[8px] font-medium font-['Poppins'] leading-3 line-clamp-1">Minimum
                                                            Call Time: </span><span
                                                            class="text-[#07F468] text-[8px] font-medium font-['Poppins'] leading-3 line-clamp-1">5
                                                            mins</span></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-full flex  items-center overflow-hidden">
                                            <img src="/images/green-union.png" class="absolute right-[129px] w-10" />
                                            <div
                                                class="px-6 py-2 h-[116px] bg-[#07F468] flex justify-center items-center gap-0.5">
                                                <div
                                                    class="justify-center text-gray-900 text-xl font-bold font-['Poppins'] leading-8">
                                                    CALL</div>
                                                <div class="w-8 h-8 relative">
                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                                        xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M9.3335 22.6666L22.6668 9.33331M22.6668 9.33331H9.3335M22.6668 9.33331V22.6666"
                                                            stroke="#000" stroke-width="2.5" stroke-linecap="round"
                                                            stroke-linejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom buttons section -->
            <div class="w-full inline-flex items-center mt-[100px]">
                <div
                    class="flex-1 px-2 pt-2 pb-6 bg-gradient-to-b from-[#FF0066]/0 to-[#FF0066]/30 inline-flex flex-col justify-center items-center gap-4">
                    <img class="w-28 h-28" src="/images/cal-camera.png" />
                    <div class="justify-center text-white text-xl font-semibold font-['Poppins'] leading-8">In a hurry?
                        Book a session for later</div>
                    <div class="rounded-[50px] relative inline-flex  items-center overflow-hidden">
                        <div class="w-40 px-4 py-2 bg-[#FF0066] inline-flex flex-col justify-center items-center">
                            <div
                                class="self-stretch justify-center text-white text-base font-bold font-['Poppins'] leading-6">
                                SEE OPTIONS</div>
                        </div>
                        <div class="self-stretch flex  items-center overflow-hidden">
                            <img src="/images/blueUnion.png" class="w-3.5 scale-x-[-1] absolute right-11" />
                            <div class="w-full pl-2 pr-3 py-2 bg-[#0C111D] flex  items-center gap-0.5">
                                <div class="w-6 h-6 relative overflow-hidden flex justify-center items-center">
                                    <img src="/images/pinkdropdown-img.png" alt="">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="flex-1 px-2 pt-2 pb-6 bg-gradient-to-b from-white/0 to-white/30 inline-flex flex-col justify-center items-center gap-4">
                    <img class="w-28 h-28" src="/images/cal-camera.png" />
                    <div class="justify-center text-white text-xl font-semibold font-['Poppins'] leading-8">See all
                        scheduled live events</div>
                    <div class="rounded-[50px] relative inline-flex  items-center overflow-hidden">
                        <div class="w-40 px-4 py-2 bg-[#FF0066] inline-flex flex-col justify-center items-center">
                            <div
                                class="self-stretch justify-center text-white text-base font-bold font-['Poppins'] leading-6">
                                VIEW EVENTS</div>
                        </div>
                        <div class="self-stretch flex  items-center overflow-hidden">
                            <img src="/images/blueUnion.png" class="w-3.5 scale-x-[-1] absolute right-11" />
                            <div class="self-stretch pl-2 pr-3 py-2 bg-[#0C111D] flex  items-center gap-0.5">
                                <div class="w-6 h-6 relative overflow-hidden flex justify-center items-center">
                                    <img src="/images/pinkdropdown-img.png" alt="">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>





        </div>
    </PopupHandler>
</template>