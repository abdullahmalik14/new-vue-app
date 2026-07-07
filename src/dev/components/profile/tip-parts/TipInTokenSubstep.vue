<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    tokenAmount: {
        type: Number,
        default: 0
    },
    userBalance: {
        type: Number,
        required: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    showSuccess: {
        type: Boolean,
        default: false
    },
    needsTopUp: {
        type: Boolean,
        default: false
    },
    canTip: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:tokenAmount', 'update:isAnonymous', 'handleTip', 'handleTopUp']);

const localTokenAmount = computed({
    get: () => props.tokenAmount,
    set: (value) => emit('update:tokenAmount', value)
});

const localIsAnonymous = computed({
    get: () => props.isAnonymous,
    set: (value) => emit('update:isAnonymous', value)
});


</script>

<template>
    <!-- token-input-container -->
    <div class="px-2 pt-4 pb-6 md:px-4 md:pt-4 lg:px-6 lg:pt-6 xl:p-6"
        :class="{ 'opacity-50 pointer-events-none': isLoading }">
        <div class="flex flex-col gap-6">
            <p
                class="font-semibold text-text-primary dark:text-text-dark-muted text-base leading-6 md:text-lg md:leading-7">
                {{ showSuccess ? 'Tip again?' : 'How many tokens would you like to tip?' }}</p>
            <div
                class="flex justify-between items-end gap-2 border-b border-b-border-input dark:border-b-border-input-dark">
                <div class="flex items-center gap-2">
                    <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg" class="w-12 h-12">
                    <input type="number" v-model="localTokenAmount"
                        class="token-input w-full border-none outline-none bg-transparent text-text-primary dark:text-text-dark-primary text-[2.5rem] font-semibold leading-[3.75rem] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                </div>
                <span
                    class="text-lg font-semibold pb-[0.313rem] text-text-primary dark:text-text-dark-primary">tokens</span>
            </div>
        </div>
    </div>

    <div class="token-bottom-container px-2 flex flex-col gap-4 md:px-4 lg:px-6"
        :class="{ 'opacity-50 pointer-events-none': isLoading }">

        <!-- from-container -->
        <div>
            <!-- error-container -->
            <div v-if="needsTopUp" class="bg-[#FB5BA240] dark:bg-[#93044340] py-1 px-2 rounded">
                <div class="flex items-center gap-1 rounded-lg p-0.5">
                    <img src="https://i.ibb.co.com/YTYFMw5F/error-info.webp" alt="error-info" class="w-4 h-4">
                    <span
                        class="text-primary-pink dark:text-primary-pink-light leading-[1.125rem] text-xs font-semibold">
                        You need {{ tokenAmount - userBalance }} more token
                    </span>
                </div>
            </div>
            <div class="flex items-center gap-2 p-2 rounded bg-bg-form dark:bg-bg-dark-form">
                <span
                    class="text-xs font-semibold leading-[1.125rem] text-text-primary dark:text-text-dark-muted w-8">From</span>

                <!-- Sender Info (Dynamic) -->

                <div class="flex-1 flex items-center gap-2">

                    <template v-if="!isAnonymous">
                        <img src="https://i.ibb.co.com/3Yr4FQD2/1377790.png" alt="avatar-headshot"
                            class="w-9 h-9 rounded-full object-cover">
                        <div class="flex flex-col gap-0.5">
                            <span
                                class="text-xs font-semibold leading-[1.125rem] text-text-primary dark:text-text-dark-muted">Fun
                                Guy</span>
                        </div>
                    </template>
                    <template v-else>
                        <img src="https://i.ibb.co.com/3Yr4FQD2/1377790.png" alt="avatar-headshot"
                            class="w-9 h-9 rounded-full object-cover opacity-50 grayscale">
                        <div class="flex flex-col gap-0.5">
                            <span
                                class="text-xs font-semibold leading-[1.125rem] text-text-primary dark:text-text-dark-muted">Anonymous
                                User</span>
                            <span class="text-xs font-medium leading-[1.125rem] text-[#667085] dark:text-[#9e9589]">You
                                will tip anonymously</span>
                        </div>
                    </template>
                </div>

                <div class="flex flex-col items-end">
                    <span
                        class="text-[0.625rem] leading-[1.125rem] text-right text-text-primary dark:text-text-dark-muted">Token
                        Balance</span>
                    <div class="flex items-center justify-end gap-2">
                        <!-- Token Deduction Badge -->
                        <div v-if="tokenAmount > 0"
                            class="bg-gradient-to-r from-[#FF58B2] to-[#4C57FF] w-max dark:bg-gradient-to-r dark:from-[#970051] dark:to-[#000a9f] rounded-[0.1875rem]">
                            <div class="flex items-center gap-[0.1875rem] py-0.5 px-1">
                                <span
                                    class="text-xs text-white font-medium leading-[1.125rem] dark:text-[#e8e6e3]">-</span>
                                <div class="flex items-center gap-[0.063rem]">
                                    <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg"
                                        class="w-3.5 h-3.5">
                                    <span
                                        class="text-xs text-white font-medium leading-[1.125rem] dark:text-[#e8e6e3]">{{
                                            tokenAmount }}</span>
                                </div>
                            </div>
                        </div>

                        <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg" class="w-6 h-6">
                        <span
                            class="text-base font-semibold leading-6 text-right text-text-primary dark:text-text-dark-muted">{{
                                userBalance }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- toggle-container -->
        <div class="flex items-center gap-2">
            <!-- toggle-switch -->
            <label class="relative inline-block h-5 w-9 cursor-pointer">
                <input type="checkbox" class="peer h-0 w-0 opacity-0" id="token-switch" v-model="localIsAnonymous" />
                <span
                    class="absolute bottom-0 left-0 right-0 top-0 cursor-pointer rounded-xl bg-[#98a2b380] transition-all duration-100 ease-in-out peer-checked:bg-text-primary dark:bg-[#434c5b80] dark:peer-checked:bg-[#0a0e17]"></span>
                <span
                    class="absolute left-[2px] top-1/2 h-4 w-4 -translate-y-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] transition-all duration-100 ease-in-out peer-checked:translate-x-4 dark:bg-bg-dark-switch"></span>
            </label>
            <!-- switch-label -->
            <label for="token-switch" class="flex items-center gap-2">
                <span class="text-xs leading-[1.125rem] text-text-primary dark:text-text-dark-muted">Tip
                    Anonymously</span>
                <!-- tooltip -->
                <div class="relative inline-flex group">
                    <img src="https://i.ibb.co/DPgMH5GG/svgviewer-png-output-15.webp" alt="tooltip icon"
                        class="w-4 h-4" />
                    <div
                        class="absolute hidden md:flex left-full top-1/2 -translate-y-1/2 ml-2 w-[7.5rem] md:w-[17.5rem] text-white bg-[rgba(16,24,40,0.7)] shadow-[0_4px_8px_-2px_rgba(16,24,40,0.1),0_2px_4px_-2px_rgba(16,24,40,0.06)] text-xs font-medium leading-[1.125rem] p-2 px-3 rounded-lg backdrop-blur-[25px] opacity-0 invisible pointer-events-none transition-all duration-150 ease-in-out z-[2] dark:bg-[rgba(14,19,32,0.9)] dark:text-text-dark-primary group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto before:content-[''] before:[border-width:5px_5px_5px_0] before:-left-[5px] before:top-1/2 before:-translate-y-1/2 before:[border-right-color:rgba(16,24,40,0.7)] before:border-solid before:[border-top-color:transparent] before:[border-bottom-color:transparent] before:[border-left-color:transparent] before:absolute before:w-0 before:h-0">
                        <span class="text-white dark:text-text-dark-primary">When this toggle is on, your
                            username and identity
                            will be hidden from @princess.</span>
                    </div>
                    <div
                        class="absolute flex md:hidden bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-[12.5rem] max-w-[12.5rem] p-2 px-3 text-white bg-[rgba(16,24,40,0.7)] shadow-[0_4px_8px_-2px_rgba(16,24,40,0.1),0_2px_4px_-2px_rgba(16,24,40,0.06)] text-xs font-medium leading-[1.125rem] p-2 px-3 rounded-lg backdrop-blur-[25px] opacity-0 invisible pointer-events-none transition-all duration-150 ease-in-out z-[2] dark:bg-[rgba(14,19,32,0.9)] dark:text-text-dark-primary group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:[border-width:5px_5px_0_5px] before:border-solid before:border-transparent before:[border-top-color:rgba(16,24,40,0.7)] before:border-solid before:[border-right-color:transparent] before:[border-bottom-color:transparent] before:[border-left-color:transparent] before:absolute before:w-0 before:h-0">
                        <span class="text-white dark:text-text-dark-primary">When this toggle is on, your
                            username and identity
                            will be hidden from @princess.</span>
                    </div>
                </div>
            </label>
        </div>


        <!-- to-container -->
        <div class="flex items-center gap-2 p-2 rounded bg-bg-form dark:bg-bg-dark-form">
            <span
                class="text-xs font-semibold leading-[1.125rem] text-text-primary dark:text-text-dark-muted w-8">To</span>
            <div class="flex-1 flex items-center gap-2">
                <img src="https://i.ibb.co.com/3Yr4FQD2/1377790.png" alt="avatar-headshot"
                    class="w-9 h-9 rounded-full object-cover">
                <div class="flex flex-col gap-0.5">
                    <span
                        class="text-xs font-semibold leading-[1.125rem] text-text-primary dark:text-text-dark-muted">Princess
                        Carrot Pop</span>
                </div>
            </div>

            <!-- Token Addition Badge -->
            <div v-if="tokenAmount > 0"
                class="bg-gradient-to-r from-primary-gradient-start dark:from-primary-gradient-start-dark to-primary-gradient-end dark:to-primary-gradient-end-dark shadow-[-1px_1px_8px_0px_#35FFD340,1px_-1px_8px_0px_#1CF89940] dark:shadow-[-1px_1px_8px_0px_#00ac9040,1px_-1px_8px_0px_#06b97f40] flex items-center w-max">
                <div class="flex items-center gap-[0.1875rem] py-0.5 px-1">
                    <span class="text-base text-[#182230] font-semibold leading-6 dark:text-[#d1cdc7]">+</span>
                    <div class="flex items-center gap-[0.063rem]">
                        <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg"
                            class="w-3.5 h-3.5">
                        <span class="text-base text-[#182230] font-semibold leading-6 dark:text-[#d1cdc7]">{{
                            tokenAmount
                        }}</span>
                    </div>
                </div>
                <div class="bg-[#000000D9] p-1 flex justify-center items-center">
                    <span
                        class="text-sm font-medium leading-5 bg-clip-text text-transparent bg-gradient-to-r from-primary-gradient-start dark:from-primary-gradient-start-dark to-primary-gradient-end dark:to-primary-gradient-end-dark">Pending</span>
                </div>
            </div>

            <!-- status (fallback if no token amount?) -->
            <div v-else
                class="bg-gradient-to-r from-primary-gradient-start dark:from-primary-gradient-start-dark to-primary-gradient-end dark:to-primary-gradient-end-dark shadow-[-1px_1px_8px_0px_#35FFD340,1px_-1px_8px_0px_#1CF89940] dark:shadow-[-1px_1px_8px_0px_#00ac9040,1px_-1px_8px_0px_#06b97f40]">
                <div class="bg-[#000000D9] p-1 flex justify-center items-center">
                    <span
                        class="text-sm font-medium leading-5 bg-clip-text text-transparent bg-gradient-to-r from-primary-gradient-start dark:from-primary-gradient-start-dark to-primary-gradient-end dark:to-primary-gradient-end-dark">Pending</span>
                </div>
            </div>
        </div>

        <!-- message-container -->
        <div class="flex items-center gap-2 p-2 rounded bg-bg-form dark:bg-bg-dark-form">
            <img src="https://i.ibb.co.com/xSmHZDBS/svgviewer-png-output-23.webp" alt="messages"
                class="w-8 h-8 dark:[filter:brightness(100)]">
            <textarea
                class="token-add-message-input w-full border-none outline-none bg-transparent text-sm font-medium leading-5 text-text-primary dark:text-text-dark-primary placeholder:text-[#757575] placeholder:leading-10 focus:placeholder:opacity-0 focus:placeholder:text-transparent [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]"
                rows="2" placeholder="Add Message...(Optional)"></textarea>
        </div>
    </div>

    <!-- buttons-container -->
    <div class="flex justify-end items-end pt-4  mt-auto z-[100000]">
        <div v-if="needsTopUp" class="h-11 md:h-14 shadow-[0px_0px_16px_0px_#FFFFFF80] pointer-events-auto">
            <button @click="$emit('handleTopUp')"
                class="relative flex justify-center items-center gap-2 w-[11.75rem] h-11 md:h-14 bg-[#ff0066] hover:bg-white px-4 backdrop-blur-[100px] transition-all duration-200 group">
                <!-- Pseudo-element for the skewed background -->
                <div
                    class="absolute top-0 -left-3 w-8 h-full bg-[#FF0066] [transform:skew(163deg,0)_translateX(3px)] backdrop-blur-[100px] shadow-[-12px_0px_16px_0px_#ffffff40] group-hover:bg-white transition-colors duration-200 z-[-1]">
                </div>

                <span
                    class="text-base text-white font-medium leading-6 group-hover:text-[#FF0066] transition-all duration-200">
                    TOP UP AND TIP
                </span>
                <img src="https://i.ibb.co.com/NdmC2BjP/arrow-right.webp" alt="arrow-right"
                    class="w-6 h-6 group-hover:[filter:brightness(0)_saturate(100%)_invert(17%)_sepia(87%)_saturate(5028%)_hue-rotate(328deg)_brightness(98%)_contrast(114%)] transition-all duration-200">
            </button>
        </div>

        <div v-else-if="canTip" class="h-11 md:h-14 shadow-[0px_0px_16px_0px_#FFFFFF80] pointer-events-auto">
            <button @click="$emit('handleTip')"
                class="relative flex justify-center items-center gap-2 w-[10rem] h-11 md:h-14 bg-[#07f468] hover:bg-black px-4 backdrop-blur-[100px] transition-all duration-200 group">
                <!-- Pseudo-element for the skewed background -->
                <div
                    class="absolute top-0 -left-3 w-8 h-full bg-[#07f468] [transform:skew(163deg,0)_translateX(3px)] backdrop-blur-[100px] shadow-[-12px_0px_16px_0px_#ffffff40] group-hover:bg-black transition-colors duration-200 z-[-1]">
                </div>


                <div class="flex items-center gap-2">
                    <span
                        class="text-base text-black font-medium leading-6 group-hover:text-[#07f468] transition-all duration-200">TIP</span>
                    <div class="flex items-center">
                        <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg" class="w-6 h-6">
                        <span
                            class="text-xl text-black font-semibold leading-[1.875rem] tracking-[0.0075rem] group-hover:text-[#07f468] transition-all duration-200">{{
                                tokenAmount }}</span>
                    </div>
                </div>

                <img src="https://i.ibb.co.com/NdmC2BjP/arrow-right.webp" alt="arrow-right"
                    class="w-6 h-6 [filter:brightness(0)_saturate(100%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(64%)_sepia(93%)_saturate(877%)_hue-rotate(87deg)_brightness(101%)_contrast(97%)] transition-all duration-200">
            </button>
        </div>
    </div>
</template>
