<script setup >
import { computed, ref } from 'vue';

const props = defineProps({
    engine: {
        type: Object,
        required: true,
    },
});

import TipSpinner from '@/templates/profileAbdullah/components/TipComponents/TipSpinner.vue';
import TipSuccessAlert from '@/templates/profileAbdullah/components/TipComponents/TipSuccessAlert.vue';
import TipInTokenSubstep from '@/templates/profileAbdullah/components/TipComponents/TipInTokenSubstep.vue';
import TipInCashSubStep from '@/templates/profileAbdullah/components/TipComponents/TipInCashSubStep.vue';

const tokenAmount = ref(0);
const cashAmount = ref(0);
const userBalance = ref(1834); // Hardcoded for now
const isAnonymous = ref(false);
const isLoading = ref(false);
const showSuccess = ref(false);

// We can access engine state directly or via computed
const currentSubstep = computed(() => props.engine.substep || 'token'); // Default to token if null

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
        <TipSuccessAlert v-if="showSuccess" :amount="currentSubstep === 'token' ? tokenAmount : cashAmount"
            :currency="currentSubstep === 'token' ? 'tokens' : 'USD'" />
        <TipSpinner v-if="isLoading" />
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
