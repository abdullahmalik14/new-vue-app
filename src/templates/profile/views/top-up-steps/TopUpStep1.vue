<script setup>
import { computed, ref } from 'vue';
const props = defineProps({
    engine: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close']);

// State
const topUpAmount = ref(100);
// Read userBalance from engine state, default to 0 if not found
const userBalance = ref(props.engine?.state?.userBalance || 0);
const discount = 0.30; // 30%
const pricePerToken = 0.05; // $0.05 per token (Assumption)
const maxLimit = 14000;

// Computed
const totalTokens = computed(() => userBalance.value + topUpAmount.value);

const originalPrice = computed(() => {
    return topUpAmount.value * pricePerToken;
});

const finalPrice = computed(() => {
    return originalPrice.value * (1 - discount);
});

const showMaxLimitAlert = computed(() => {
    return topUpAmount.value > maxLimit;
});

const sliderPercentage = computed(() => {
    const min = 100;
    const max = maxLimit;
    let val = topUpAmount.value;

    // Clamp for visual display
    if (val < min) val = min;
    if (val > max) val = max;

    return ((val - min) * 100) / (max - min);
});

// Calculate left position for the tooltip to follow the thumb
const tooltipStyle = computed(() => {
    return {
        left: `${sliderPercentage.value}%`,
        transform: `translateX(-50%)`
    };
});

// Methods
const handleBack = () => {
    emit('close');
};

const handlePayment = () => {
    if (showMaxLimitAlert.value) return; // Prevent payment if over limit

    // Save state to engine
    if (props.engine && props.engine.state) {
        props.engine.state.topUpAmount = topUpAmount.value;
        props.engine.state.totalTokens = totalTokens.value;
        props.engine.state.finalPrice = finalPrice.value;
        props.engine.state.originalPrice = originalPrice.value;
        props.engine.state.discount = discount;
    }

    // Navigate to Step 2
    if (props.engine && props.engine.goToStep) {
        props.engine.goToStep(2);
    }
};

const setToMax = () => {
    topUpAmount.value = maxLimit;
};

// Formatting currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

</script>

<template>
    <div class="flex flex-col w-full relative justify-between h-full">
        <!-- top-up input section -->
        <div class="flex flex-col gap-[62px] px-2 pt-4 pb-6 md:px-4 md:pt-4 lg:px-6 lg:pt-6 xl:p-6 flex-1">
            <!-- top-up input section top -->
            <div class="flex flex-col gap-6">
                <!-- back-button -->
                <!-- <div @click="handleBack" class="hidden md:flex items-center gap-0.5 w-max h-[1.125rem] cursor-pointer">
                    <img src="https://i.ibb.co.com/8njxTqWK/chevron-left.webp" alt="chevron-left" class="w-4 h-4">
                    <span class="text-xs font-medium text-[#475467] dark:text-[#b1aaa0]">Back</span>
                </div> -->

                <div class="flex flex-col gap-[32px]">
                    <p
                        class="font-semibold text-text-primary dark:text-text-dark-muted text-base leading-6 md:text-lg md:leading-7">
                        Enter Top Up Amount</p>

                    <div
                        class="flex justify-between items-end gap-2 border-b border-b-border-input dark:border-b-border-input-dark">
                        <div class="flex items-center gap-2">
                            <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg"
                                class="w-12 h-12">
                            <input type="number" v-model.number="topUpAmount"
                                class="token-input w-full border-none bg-transparent outline-none text-text-primary dark:text-text-dark-primary text-[2.5rem] font-semibold leading-[3.75rem] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                :class="{ 'text-primary-pink dark:text-primary-pink-light': showMaxLimitAlert }">
                        </div>
                        <span
                            class="text-lg font-semibold pb-[0.313rem] text-text-primary dark:text-text-dark-primary">tokens</span>
                    </div>
                </div>
            </div>

            <!-- top-up input section bottom -->
            <div class="flex flex-col gap-4 pt-7 pb-4">
                <div class="w-full relative">
                    <div data-slider-track-base
                        class="absolute top-0 left-0 h-[13px] w-full bg-[#34405480] rounded-full z-[1]">
                    </div>
                    <div data-tip-range-slider-track-fill
                        class="absolute top-0 left-0 h-[13px] bg-[linear-gradient(90deg,#9198FF_0%,#FF8DDF_122.28%,#FF0066_244.56%)] rounded-full z-[2]"
                        :style="{ width: sliderPercentage + '%' }"></div>
                    <input data-tip-range-slider type="range" min="100" max="14000" v-model.number="topUpAmount"
                        step="1" class="appearance-none w-full h-[13px] rounded-full bg-transparent relative outline-none border-none z-[2]
                                            [&::-webkit-slider-thumb]:appearance-none 
                                            [&::-webkit-slider-thumb]:w-[2.75rem] 
                                            [&::-webkit-slider-thumb]:h-[2.75rem] 
                                            [&::-webkit-slider-thumb]:bg-[url('https://i.ibb.co.com/2Y7SmcW6/slider-icon.webp')] 
                                            [&::-webkit-slider-thumb]:bg-[length:120%] 
                                            [&::-webkit-slider-thumb]:bg-[position:center] 
                                            [&::-webkit-slider-thumb]:cursor-pointer 
                                            [&::-webkit-slider-thumb]:border-none 
                                            [&::-webkit-slider-thumb]:mt-[-4px] 
                                            [&::-webkit-slider-thumb]:relative 
                                            [&::-webkit-slider-thumb]:z-[3] 
                                            [&::-webkit-slider-thumb]:overflow-visible

                                            [&::-moz-range-thumb]:appearance-none 
                                            [&::-moz-range-thumb]:w-[2.75rem] 
                                            [&::-moz-range-thumb]:h-[2.75rem] 
                                            [&::-moz-range-thumb]:bg-[url('https://i.ibb.co.com/2Y7SmcW6/slider-icon.webp')] 
                                            [&::-moz-range-thumb]:bg-[length:120%] 
                                            [&::-moz-range-thumb]:bg-[position:center] 
                                            [&::-moz-range-thumb]:cursor-pointer 
                                            [&::-moz-range-thumb]:border-none 
                                            [&::-moz-range-thumb]:relative 
                                            [&::-moz-range-thumb]:z-[3] 
                                            [&::-moz-range-thumb]:overflow-visible
                                        ">

                    <!-- Floating Tooltip -->
                    <div class="absolute top-[-64px] pointer-events-none flex flex-col items-center w-max z-[10]"
                        :style="tooltipStyle">
                        <div
                            class="bg-gradient-to-r from-primary-gradient-start dark:from-primary-gradient-start-dark to-primary-gradient-end dark:to-primary-gradient-end-dark shadow-[-1px_1px_8px_0px_#35FFD340,1px_-1px_8px_0px_#1CF89940] dark:shadow-[-1px_1px_8px_0px_#00ac9040,1px_-1px_8px_0px_#06b97f40] flex justify-center items-center w-max z-[1]">
                            <div class="flex justify-center items-center gap-[0.1875rem] pt-0.5 px-1">
                                <span
                                    class="text-[0.625rem] text-[#182230] font-semibold leading-normal dark:text-[#d1cdc7]">{{
                                        discount * 100 }}%
                                    OFF</span>
                            </div>
                        </div>
                        <div
                            class="tip-range-slider-amount bg-black shadow-[0px_0px_8px_0px_#FFFFFF8C,0px_4px_12px_0px_#FC2C9C80] flex justify-center items-center py-1 px-2.5 w-max -mt-1">
                            <span class="text-lg leading-7 font-semibold font-poppins text-[#07F468]">{{ topUpAmount
                                }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between items-center">
                    <span class="text-[14px] leading-[20px] font-poppins text-white">100</span>
                    <span class="text-[14px] leading-[20px] font-poppins text-white">300</span>
                    <span class="text-[14px] leading-[20px] font-poppins text-white">600</span>
                    <span class="text-[14px] leading-[20px] font-poppins text-white">1,500</span>
                    <span class="text-[14px] leading-[20px] font-poppins text-white">4,500</span>
                    <span class="text-[14px] leading-[20px] font-poppins text-white">14,000</span>
                </div>
            </div>

        </div>


        <div class="flex flex-col bg-white/50 dark:bg-[#181a1b80]
         ">
            <!-- top-up amount table section -->
            <div class="flex flex-col gap-3 py-2 px-2 mt-auto md:px-4 md:mt-[unset] lg:px-6 pb-0 sm:pb-2">
                <!-- row -->
                <div class="flex justify-between items-center pt-2 border-t border-transparent">
                    <span class="text-xs leading-normal text-text-primary dark:text-text-dark-primary">Your
                        Balance</span>
                    <div class="flex items-center gap-1">
                        <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg" class="w-6 h-6">
                        <span class="text-sm leading-[1.25rem] text-text-primary dark:text-text-dark-primary">{{
                            userBalance }}</span>
                    </div>
                </div>

                <!-- row -->
                <div class="flex justify-between items-center border-t border-transparent">
                    <span class="text-xs leading-normal text-text-primary dark:text-text-dark-primary">Top Up
                        Amount</span>
                    <div class="flex items-center gap-1">
                        <span class="text-sm leading-[1.25rem] text-text-primary dark:text-text-dark-primary">+</span>
                        <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg" class="w-6 h-6">
                        <span class="text-sm leading-[1.25rem] text-text-primary dark:text-text-dark-primary">{{
                            topUpAmount }}</span>
                    </div>
                </div>

                <!-- row (total) -->
                <div class="flex justify-between items-center pt-2 border-t border-[#fcfcfd]">
                    <span
                        class="text-xs leading-normal font-semibold text-text-primary dark:text-text-dark-primary">Total
                        After Top Up</span>
                    <div class="flex items-center gap-1">
                        <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg" class="w-6 h-6">
                        <span class="text-lg font-semibold text-text-primary dark:text-text-dark-primary">{{ totalTokens
                        }}</span>
                    </div>
                </div>

                <!-- row (final) -->
                <div class="flex justify-between items-center pt-2 border-t border-[#fcfcfd]">
                    <span
                        class="text-xs leading-normal font-semibold text-text-primary dark:text-text-dark-primary">Final
                        Payment</span>
                    <div class="flex flex-col items-end gap-1">
                        <div class="flex items-center gap-1">
                            <div
                                class="bg-gradient-to-r from-primary-gradient-start dark:from-primary-gradient-start-dark to-primary-gradient-end dark:to-primary-gradient-end-dark shadow-[-1px_1px_8px_0px_#35FFD340,1px_-1px_8px_0px_#1CF89940] dark:shadow-[-1px_1px_8px_0px_#00ac9040,1px_-1px_8px_0px_#06b97f40] flex justify-center items-center w-max">
                                <div class="flex justify-center items-center gap-[0.1875rem] pt-0.5 px-1">
                                    <span
                                        class="text-[0.625rem] text-[#182230] font-semibold leading-normal dark:text-[#d1cdc7]">30%
                                        OFF</span>
                                </div>
                            </div>
                            <span class="text-base font-semibold text-text-primary dark:text-text-dark-primary">{{
                                formatCurrency(finalPrice) }}</span>
                        </div>

                        <span
                            class="text-[0.625rem] leading-[1.125rem] text-text-primary dark:text-text-dark-primary line-through">{{
                                formatCurrency(originalPrice) }}</span>
                    </div>
                </div>
            </div>

            <!-- button -->
            <div class="flex justify-end items-end">
                <div class="h-11 md:h-14 shadow-[0px_0px_16px_0px_#FFFFFF80]">
                    <button @click="handlePayment"
                        class="relative flex justify-center items-center gap-2 w-[11.75rem] h-11 md:h-14 hover:bg-white px-4 backdrop-blur-[100px] transition-all duration-200 group"
                        :class="showMaxLimitAlert ? 'bg-[#98a2b3] pointer-events-none' : 'bg-[#ff0066]'"
                        :disabled="showMaxLimitAlert">
                        <!-- Pseudo-element for the skewed background -->
                        <div class="absolute top-0 -left-3 w-8 h-full [transform:skew(163deg,0)_translateX(3px)] backdrop-blur-[100px] shadow-[-12px_0px_16px_0px_#ffffff40] group-hover:bg-white transition-colors duration-200 z-[-1]"
                            :class="showMaxLimitAlert ? 'bg-[#98a2b3]' : 'bg-[#FF0066]'">
                        </div>

                        <span
                            class="text-base text-white font-medium leading-6 group-hover:text-[#FF0066] whitespace-nowrap transition-all duration-200">
                            Pay USD$ {{ formatCurrency(finalPrice) }}
                        </span>
                        <img src="https://i.ibb.co.com/NdmC2BjP/arrow-right.webp" alt="arrow-right"
                            class="w-6 h-6 group-hover:[filter:brightness(0)_saturate(100%)_invert(17%)_sepia(87%)_saturate(5028%)_hue-rotate(328deg)_brightness(98%)_contrast(114%)] transition-all duration-200">
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>