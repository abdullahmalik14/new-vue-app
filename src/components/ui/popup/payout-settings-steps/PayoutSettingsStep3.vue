<template>
    <div class="flex flex-col min-h-[100dvh] relative md:pt-4">
        <!-- header -->
        <div class="flex justify-between items-center gap-2.5 px-4 py-2 md:py-4">
            <div class="flex items-center gap-1 md:gap-2">
                <img v-if="engine.state.currentMode === 'auto-withdraw'" src="https://i.ibb.co.com/SDXwDYLH/auto-cycle.webp" alt="auto cycle" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(24%)_sepia(17%)_saturate(891%)_hue-rotate(179deg)_brightness(92%)_contrast(92%)] md:w-6 md:h-6">
                <img v-else src="https://i.ibb.co.com/TDrJ9HVk/add-card.webp" alt="plus" class="w-4 h-4 md:w-6 md:h-6 [filter:brightness(0)_saturate(100%)_invert(24%)_sepia(17%)_saturate(891%)_hue-rotate(179deg)_brightness(92%)_contrast(92%)]">
                <h2 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">
                    {{ engine.state.currentMode === 'auto-withdraw' ? 'Auto Withdraw Setting' : 'Add new payout method' }}
                </h2>
            </div>

            <button @click="emit('close')" class="flex justify-center items-center w-6 h-6">
                <img src="https://i.ibb.co.com/DPv34WzS/close.webp" alt="close" class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(73%)_sepia(11%)_saturate(425%)_hue-rotate(179deg)_brightness(87%)_contrast(89%)]">
            </button>
        </div>

        <!-- back-button -->
        <button @click="goBack" class="max-md:hidden flex justify-center items-center gap-1 w-max px-4 pb-2">
            <img src="https://i.ibb.co.com/tPzh072N/chevron-left.webp" alt="chevron left" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(46%)_sepia(8%)_saturate(955%)_hue-rotate(183deg)_brightness(91%)_contrast(88%)]">
            <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">Back</span>
        </button>

        <!-- content -->
        <div class="flex flex-col gap-6 px-2 pt-4 pb-4 md:px-4 xl:px-6 xl:pt-2">
            <div class="flex flex-col gap-4">
                <h3 class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3]">Payout Details</h3>
                <p class="text-sm text-[#344054] dark:text-[#bdb8af]">Please provide the following information for your transaction:</p>
            </div>
        
            <!-- form-container -->
            <div class="flex flex-col gap-4 mt-4">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-1.5 group/input-container">
                        <label class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Bank Swift/BIC Code</label>
                        <DashboardTextInput
                            type="text"
                            placeholder="Enter BIC/SWIFT code"
                            v-model="swiftCode"
                            wrapperClass="rounded-t-sm !px-3 !py-2 !h-auto !shadow-[0px_1px_2px_0px_#1018280D] dark:!border-[#3b4043]"
                            inputClass="text-base text-[#101828] placeholder:text-[#667085] dark:placeholder:text-[#9e9589] dark:text-[#d6d3cd] !p-0"
                            :showTooltip="true"
                            tooltipIcon="https://i.ibb.co.com/Hp1tznKk/help-circle.webp"
                            tooltipText="Enter Bank Swift/BIC Code"
                        />
                    </div>
                </div>

                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-1.5 group/input-container">
                        <label class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Bank Account Number or IBAN</label>
                        <DashboardTextInput
                            type="text"
                            placeholder="Enter Bank Account Number or IBAN"
                            v-model="iban"
                            wrapperClass="rounded-t-sm !px-3 !py-2 !h-auto !shadow-[0px_1px_2px_0px_#1018280D] dark:!border-[#3b4043]"
                            inputClass="text-base text-[#101828] placeholder:text-[#667085] dark:placeholder:text-[#9e9589] dark:text-[#d6d3cd] !p-0"
                        />
                        <span class="text-xs leading-normal md:text-sm text-[#475467] dark:text-[#b1aaa0]">If you are not sure if you need an intermediary Bank for international transfer, please contact your bank for future information.</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="flex justify-between items-center gap-2 w-full mt-auto pt-6 z-10">
            <DashboardPrimaryButton 
                @click="saveDetails"
                class="ml-auto"
                variant="none" 
                text="SAVE" 
                customClass="flex items-center gap-2.5 pl-[1.48rem] pr-2 h-10 shadow-[0px_0px_16px_0px_#FFFFFF80] [clip-path:polygon(100%_0%,100%_100%,0%_100%,0.98rem_0%)] bg-black group/button hover:bg-[#07F468] dark:bg-[#181a1b] dark:hover:bg-[#06c454]"
                textClass="text-lg font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3]"
            >
                <template #leftIcon>
                    <img src="https://i.ibb.co.com/Fb2Xxf9S/tick-circle.webp" alt="tick circle" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(53%)_sepia(97%)_saturate(459%)_hue-rotate(93deg)_brightness(114%)_contrast(94%)] group-hover/button:[filter:brightness(0)_saturate(100%)]">
                </template>
            </DashboardPrimaryButton>
        </div>
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { ref } from 'vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';

const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const swiftCode = ref('');
const iban = ref('');

const goBack = () => {
    props.engine.goToStep(2);
};

const saveDetails = () => {
    if (props.engine.state.pendingPayoutMethod) {
        const existing = props.engine.state.savedPayoutMethods || [];
        props.engine.setState('savedPayoutMethods', [...existing, props.engine.state.pendingPayoutMethod]);
        props.engine.setState('pendingPayoutMethod', null);
    }
    props.engine.setState('isSaved', true);
    props.engine.goToStep(1);
};
</script>
