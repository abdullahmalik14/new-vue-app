<script setup lang="ts">
import { computed, ref } from 'vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';

const props = defineProps({
    engine: {
        type: Object,
        required: true,
    },
});

import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import TipInTokenSubstep from '@/dev/components/profile/tip-parts/TipInTokenSubstep.vue';
import TipInCashSubStep from '@/dev/components/profile/tip-parts/TipInCashSubStep.vue';

const tokenAmount = ref(0);
const cashAmount = ref(0);
const userBalance = ref(1834); // Hardcoded for now
const isAnonymous = ref(false);
const isLoading = ref(false);
const showSuccess = ref(false);

// We can access engine state directly or via computed
const currentSubstep = computed(() => props.engine.substep || 'token'); // Default to token if null

const successMessage = computed(() => {
    const isToken = currentSubstep.value === 'token';
    const amount = isToken ? tokenAmount.value : cashAmount.value;
    return `You have sent ${isToken ? `${amount} tokens` : `USD$ ${amount}`} to Jenny.`;
});

const setSubstep = (substep) => {
    props.engine.goToSubstep(substep);
};

const closePopup = () => {
    emit('close');
};

const emit = defineEmits(['close']);

const canTip = computed(() => {
    return tokenAmount.value > 0 && tokenAmount.value <= userBalance.value;
});

const needsTopUp = computed(() => {
    return tokenAmount.value > userBalance.value;
});

const handleTip = () => {
    isLoading.value = true;
    setTimeout(() => {
        isLoading.value = false;
        showSuccess.value = true;
        // Optional: Hide alert after a few seconds if needed
    }, 2000);
};

const handleCashTip = () => {
    console.log('handleCashTip called', { amount: cashAmount.value });

    // Persist state
    props.engine.state.cashAmount = cashAmount.value;
    props.engine.state.paymentMode = 'cash';

    // Navigate to Payment Step (Step 3)
    props.engine.goToStep(3);
};

const handleTopUp = () => {
    // Persist state to engine before navigating
    props.engine.state.amount = tokenAmount.value;
    props.engine.state.anonymous = isAnonymous.value;
    props.engine.state.userBalance = userBalance.value;
    props.engine.state.paymentMode = 'token'; // Reset/Set payment mode

    // Navigate to Top Up Step (Step 2)
    props.engine.goToStep(2);
};

</script>

<template>
    <!-- tabs-button-container -->
    <div class="flex w-full md:pt-4 lg:pt-6" v-if="!showSuccess">
        <!-- tab-button -->
        <div @click="setSubstep('token')"
            class="group flex w-full justify-center items-center px-4 py-2 border-b-[1.5px] border-b-border-tab dark:border-b-border-tab-dark cursor-pointer "
            :class="{ 'active border-b-primary-pink dark:border-b-primary-pink-dark': currentSubstep === 'token' }">
            <div
                class="h-8 flex justify-center items-center group-[.active]:[filter:drop-shadow(0_0_12px_rgba(255,255,255,0.5))]">
                <span
                    class="flex-1 text-text-secondary dark:text-text-dark-primary font-medium text-sm md:text-base group-hover:text-primary-pink dark:group-hover:text-primary-pink-light group-[.active]:text-primary-pink dark:group-[.active]:text-primary-pink-light group-[.active]:font-semibold">Tip
                    in Token</span>
            </div>
        </div>

        <!-- tab-button -->
        <div @click="setSubstep('cash')"
            class="group flex w-full justify-center items-center px-4 py-2 border-b-[1.5px] border-b-border-tab dark:border-b-border-tab-dark cursor-pointer "
            :class="{ 'active border-b-primary-pink dark:border-b-primary-pink-dark': currentSubstep === 'cash' }">
            <div
                class="h-8 flex justify-center items-center group-[.active]:[filter:drop-shadow(0_0_12px_rgba(255,255,255,0.5))]">
                <span
                    class="flex-1 text-text-secondary dark:text-text-dark-primary font-medium text-sm md:text-base group-hover:text-primary-pink dark:group-hover:text-primary-pink-light group-[.active]:text-primary-pink dark:group-[.active]:text-primary-pink-light group-[.active]:font-semibold">Tip
                    in Cash (USD)</span>
            </div>
        </div>
    </div>

    <!-- tabs-content-container -->
    <div class="flex flex-col flex-1 relative">
        <div v-if="showSuccess" data-dashboard-toast="notice"
            class="fixed w-[calc(100%-1rem)] top-2 left-2 md:top-0 md:left-0 md:w-full lg:relative lg:w-auto z-50">
            <NotificationCard variant="notice" :closable="false" leftBorderClass="bg-[#07F468]"
                titleClass="font-semibold text-[#107569]" :title="successMessage">
                <template #icon>
                    <div
                        class="w-10 h-10 relative rounded-full bg-[url('https://i.ibb.co.com/bjGQxr5S/sample-bg-image.webp')] bg-cover bg-center">
                        <div
                            class="absolute -bottom-2 -right-2 w-[1.375rem] h-[1.375rem] flex justify-center items-center">
                            <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg"
                                class="w-[1.375rem]">
                        </div>
                    </div>
                </template>
            </NotificationCard>
        </div>

        <div v-if="isLoading"
            class="h-40 p-2.5 left-[180px] top-[100px] absolute bg-white/30 rounded-md backdrop-blur-[10px] inline-flex justify-start items-center gap-2.5 z-50">
            <div class="p-2.5 flex justify-start items-center gap-2.5">
                <div data-position="1" class="w-28 h-28 relative">
                    <LoadingSpinner size="" wrapperClass="w-24 h-24 left-[12px] top-[12px] absolute">
                        <template #spinner>
                            <div
                                class="w-24 h-24 bg-[conic-gradient(from_180deg_at_50.00%_50.00%,_#07F468_0deg,_rgba(7,_244,_104,_0)_360deg)] rounded-full [mask-image:radial-gradient(transparent_55%,_black_66%)] [-webkit-mask-image:radial-gradient(transparent_55%,_black_66%)]" />
                        </template>
                    </LoadingSpinner>
                </div>
            </div>
        </div>
        <template v-if="currentSubstep === 'token'">
            <TipInTokenSubstep v-model:tokenAmount="tokenAmount" v-model:isAnonymous="isAnonymous"
                :userBalance="userBalance" :isLoading="isLoading" :showSuccess="showSuccess" :needsTopUp="needsTopUp"
                :canTip="canTip" @handleTip="handleTip" @handleTopUp="handleTopUp" />
        </template>
        <template v-else-if="currentSubstep === 'cash'">
            <TipInCashSubStep v-model:cashAmount="cashAmount" v-model:isAnonymous="isAnonymous" :isLoading="isLoading"
                :showSuccess="showSuccess" @handleCashTip="handleCashTip" />
        </template>
    </div>
</template>
