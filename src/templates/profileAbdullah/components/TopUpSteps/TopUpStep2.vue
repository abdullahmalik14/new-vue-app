<script setup>
import { computed, ref, watch } from 'vue';
import BaseInput from '@/components/input/BaseInput.vue';
import CheckboxGroup from '@/components/checkbox/CheckboxGroup.vue';
import ButtonComponent from '@/components/button/ButtonComponent.vue';
import BaseSelect from '@/components/ui/popup/ReuseableComponents/BaseSelect.vue';
import SectionToggleHeader from '@/components/ui/popup/ReuseableComponents/SectionToggleHeader.vue';
import PaymentMethodNotLoggedIn from '@/components/ui/popup/ReuseableComponents/PaymentMethodNotLoggedIn.vue';
import PaymentMethodLoggedIn from '@/components/ui/popup/ReuseableComponents/PaymentMethodLoggedIn.vue';
import AddressCard from '@/components/ui/popup/ReuseableComponents/AddressCard.vue';

const props = defineProps({
    engine: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close']);

// State & Options
const paymentOpen = ref(true);
const billingOpen = ref(true);
const isBillingSaved = ref(false);

const dynamicBillingAddress = computed(() => {
    const parts = [
        props.engine.state.addressLine1,
        props.engine.state.addressLine2,
        props.engine.state.city,
        props.engine.state.selectedState,
        props.engine.state.postalCode,
        props.engine.state.selectedCountry
    ];
    return parts.filter(part => part).join(', ');
});

watch(() => props.engine.state.saveAddress, (val) => {
    if (val) {
        setTimeout(() => {
            isBillingSaved.value = true;
        }, 300);
    }
}, { immediate: true });


const countryOptions = [
    { label: 'United States', value: 'United States' },
    { label: 'Canada', value: 'Canada' },
    { label: 'United Kingdom', value: 'United Kingdom' },
    // Add more as needed
];

const stateOptions = [
    { label: 'California', value: 'CA' },
    { label: 'New York', value: 'NY' },
    { label: 'Texas', value: 'TX' },
    // Add more as needed
];

// Computed
const userBalance = computed(() => props.engine.state.userBalance || 0);
const topUpAmount = computed(() => props.engine.state.topUpAmount || 0);
const totalTokens = computed(() => props.engine.state.totalTokens || (userBalance.value + topUpAmount.value));
const finalPrice = computed(() => props.engine.state.finalPrice || 0);
const originalPrice = computed(() => props.engine.state.originalPrice || 0);

// Methods
const handleBack = () => {
    if (props.engine && props.engine.goToStep) {
        props.engine.goToStep(1);
    }
};

const processPayment = () => {
    console.log('Processing Payment...', {
        email: props.engine.state.email,
        payment: {
            method: props.engine.state.paymentMethod,
            card: props.engine.state.paymentCardNumber
        },
        billing: {
            address1: props.engine.state.addressLine1,
            city: props.engine.state.city
        },
        amount: finalPrice.value
    });
    // emit('close');
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

</script>

<template>
    <div class="flex flex-col min-h-full w-full relative">
        <div class="flex flex-col gap-4 px-2 pt-4 pb-6 md:px-4 md:pt-4 lg:px-6 lg:pt-6 xl:p-6 h-full">
            <!-- back-button -->
            <div @click="handleBack" class="hidden md:flex items-center gap-0.5 w-max h-[1.125rem] cursor-pointer">
                <img src="https://i.ibb.co.com/8njxTqWK/chevron-left.webp" alt="chevron-left" class="w-4 h-4">
                <span class="text-xs font-medium text-[#475467] dark:text-[#b1aaa0]">Back</span>
            </div>

            <div class="flex flex-col gap-6">

                <SectionToggleHeader title="PAYMENT METHOD" titleColor="text-[#344054]" iconColor="bg-[#344054]"
                    icon="https://i.ibb.co.com/m5nstLw2/svgviewer-png-output-30.png" v-model="paymentOpen"
                    :showChevron="true" :toggleable="true">
                    <div v-if="engine.state.paymentSaveCard">
                        <PaymentMethodLoggedIn :holderName="engine.state.paymentCardHolder"
                            :cardNumber="engine.state.paymentCardNumber" :expiry="engine.state.paymentExpiry"
                            @remove="engine.state.paymentSaveCard = false" />
                    </div>
                    <div v-else>
                        <PaymentMethodNotLoggedIn wrapperClass="max-w-[29.6875rem]"
                            v-model:cardNumber="engine.state.paymentCardNumber"
                            v-model:expiry="engine.state.paymentExpiry"
                            v-model:cardHolder="engine.state.paymentCardHolder" v-model:cvv="engine.state.paymentCvv"
                            v-model:saveCard="engine.state.paymentSaveCard" />
                    </div>
                </SectionToggleHeader>

                <SectionToggleHeader title="BILLING ADDRESS" titleColor="text-[#344054]" iconColor="bg-[#344054]"
                    icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp" v-model="billingOpen">
                    <div v-if="!isBillingSaved" class="flex flex-col gap-4">
                        <div class="flex flex-col gap-3">
                            <div class="flex items-center gap-2 w-full">
                                <div class="w-full">
                                    <BaseInput type="text"
                                        inputClass="bg-white/10 text-base text-[#667085] placeholder:text-base placeholder:text-[#667085]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                                        v-model="engine.state.lastName" label="Last Name" labelFor="last-name"
                                        labelClass="text-sm font-medium text-[#667085]" placeholder="Last Name" />
                                </div>
                                <div class="w-full">
                                    <BaseInput type="text"
                                        inputClass="bg-white/10 text-base text-[#667085] placeholder:text-base placeholder:text-[#667085]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                                        v-model="engine.state.firstName" label="First Name" labelFor="first-name"
                                        labelClass="text-sm font-medium text-[#667085]" placeholder="First Name" />
                                </div>
                            </div>
                            <BaseInput type="text"
                                inputClass="bg-white/10 text-base text-[#667085] placeholder:text-base placeholder:text-[#667085]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                                v-model="engine.state.addressLine1" label="Address Line 1" labelFor="Address-Line-1"
                                labelClass="text-sm font-medium text-[#667085]" placeholder="Address Line 1" />
                            <BaseInput type="text"
                                inputClass="bg-white/10 text-base text-[#667085] placeholder:text-base placeholder:text-[#667085]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                                v-model="engine.state.addressLine2" label="Address Line 2" labelFor="Address-Line-2"
                                labelClass="text-sm font-medium text-[#667085]" placeholder="Address Line 2" />
                            <div class="flex items-center gap-2">
                                <div class="w-full">
                                    <BaseInput type="text"
                                        inputClass="bg-white/10 text-base text-[#667085] placeholder:text-base placeholder:text-[#667085]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                                        v-model="engine.state.postalCode" label="Postal Code" labelFor="postal-code"
                                        labelClass="text-sm font-medium text-[#667085]" placeholder="Postal Code" />
                                </div>
                                <div class="w-full">
                                    <BaseInput type="text"
                                        inputClass="bg-white/10 text-base text-[#667085] placeholder:text-base placeholder:text-[#667085]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                                        v-model="engine.state.city" label="City" labelFor="City"
                                        labelClass="text-sm font-medium text-[#667085]" placeholder="City" />
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <BaseSelect label="Country" :options="countryOptions"
                                    v-model="engine.state.selectedCountry"
                                    labelClass="text-sm font-medium text-[#667085]" selectedValueClass="text-[#344054]"
                                    iconColor="bg-[#344054]" />
                                <BaseSelect label="State" :options="stateOptions" v-model="engine.state.selectedState"
                                    placeholder="" labelClass="text-sm font-medium text-[#667085]"
                                    selectedValueClass="text-[#344054]" iconColor="bg-[#344054]" />
                            </div>
                        </div>
                        <CheckboxGroup label="Save this address for future use." v-model="engine.state.saveAddress"
                            checkboxClass="appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-[65%] checked:after:w-[0.25rem] checked:after:h-[0.5rem] checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
                            labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                            wrapperClass="flex items-center" />


                    </div>
                    <AddressCard v-else :address="dynamicBillingAddress"
                        @edit="isBillingSaved = false; engine.state.saveAddress = false" />
                </SectionToggleHeader>


            </div>
        </div>
        <div class="flex flex-col mt-auto bg-white/50 dark:bg-[#181a1b80] pb-[3.25rem] sm:pb-0 flex-1">
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
                        <span class="text-lg font-semibold text-text-primary dark:text-text-dark-primary">{{
                            totalTokens
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

            <div @click="processPayment"
                class="flex justify-end items-end mt-auto fixed sm:relative bottom-0 right-0 z-[100000] sm:z-auto">
                <div class="h-11 md:h-14 shadow-[0px_0px_16px_0px_#FFFFFF80]">
                    <button
                        class="relative flex justify-center items-center gap-2 h-11 md:h-14 bg-[#07f468] hover:bg-black px-4 backdrop-blur-[100px] transition-all duration-200 group">
                        <!-- Pseudo-element for the skewed background -->
                        <div
                            class="absolute top-0 -left-3 w-8 h-full bg-[#07f468] [transform:skew(163deg,0)_translateX(3px)] backdrop-blur-[100px] shadow-[-12px_0px_16px_0px_#ffffff40] group-hover:bg-black transition-colors duration-200 z-[-1]">
                        </div>

                        <span
                            class="text-base text-black font-medium leading-6 group-hover:text-[#07f468] whitespace-nowrap transition-all duration-200">
                            PROCESS PAYMENT
                        </span>
                        <img src="https://i.ibb.co.com/NdmC2BjP/arrow-right.webp" alt="arrow-right"
                            class="w-6 h-6 [filter:brightness(0)_saturate(100%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(76%)_sepia(81%)_saturate(2416%)_hue-rotate(87deg)_brightness(101%)_contrast(98%)] transition-all duration-200">
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>