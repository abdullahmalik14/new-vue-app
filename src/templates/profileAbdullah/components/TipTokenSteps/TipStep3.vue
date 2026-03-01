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

// State & Options
const paymentOpen = ref(true);
const billingOpen = ref(true);
const billingMailOpen = ref(true);
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
// const discount = computed(() => props.engine.state.discount || 0); // Not used in display but good to have

const isCashMode = computed(() => props.engine.state.paymentMode === 'cash');
const cashTipAmount = computed(() => props.engine.state.cashAmount || 0);
const serviceCharge = computed(() => cashTipAmount.value * 0.10);
const finalCashPayment = computed(() => cashTipAmount.value + serviceCharge.value);

// Methods
const handleBack = () => {
    if (props.engine && props.engine.goToStep) {
        props.engine.goToStep(2);
    }
};

const handleLogout = () => {
    props.engine.state.isLoggedIn = false;
    // Reset payment/billing if needed?
};

const handleLogin = () => {
    // Mock login
    console.log('Logging in with', props.engine.state.email, props.engine.state.password);
    props.engine.state.isLoggedIn = true;
    props.engine.state.email = 'mongoes4eva@example.com'; // Mock
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
        amount: finalPrice.value || finalCashPayment.value
    });
    // alert(`Processing Payment of $${finalPrice.value.toFixed(2)} for ${topUpAmount.value} tokens.`);
    // Navigate to success or close?
    // emit('close');
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

</script>

<template>
    <div class="flex flex-col h-full w-full relative">
        <div class="flex flex-col gap-4 px-2 pt-4 pb-6 md:px-4 md:pt-4 lg:px-6 lg:pt-6 xl:p-6">
            <!-- back-button -->
            <div @click="handleBack" class="hidden md:flex items-center gap-0.5 w-max h-[1.125rem] cursor-pointer">
                <img src="https://i.ibb.co.com/8njxTqWK/chevron-left.webp" alt="chevron-left" class="w-4 h-4">
                <span class="text-xs font-medium text-[#475467] dark:text-[#b1aaa0]">Back</span>
            </div>

            <div class="flex flex-col gap-6">
                <SectionToggleHeader title="ACCOUNT EMAIL" titleColor="text-[#344054]" iconColor="bg-[#344054]"
                    v-model="billingMailOpen" icon="https://i.ibb.co.com/XfdvLvLC/mail.webp" :showChevron="false"
                    :toggleable="false">
                    <div v-if="engine.state.isLoggedIn" class="flex justify-between items-end">
                        <div class="flex items-center gap-2 py-1">
                            <div class="flex justify-center items-center w-10 h-9">
                                <img src="https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp" alt="avatar"
                                    class="h-full object-cover" />
                            </div>
                            <div class="flex flex-col">
                                <h3 class="text-xs leading-normal font-semibold text-[#344054]">
                                    Man goes 4eva
                                </h3>
                                <span class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]">{{
                                    engine.state.email }}</span>
                            </div>
                        </div>
                        <button class="flex items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer"
                            @click="handleLogout">
                            <img src="https://i.ibb.co.com/Gfb88yFY/log-out.webp" alt="log-out"
                                class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(4%)_saturate(1168%)_hue-rotate(179deg)_brightness(98%)_contrast(82%)]" />
                            <span class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]">Log
                                out</span>
                        </button>
                    </div>

                    <div v-else-if="engine.state.authMode === 'login'" class="flex flex-col gap-4">
                        <button
                            class="flex items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer w-fit"
                            @click="engine.state.authMode = 'guest'">
                            <div class="w-4 h-4 bg-[#344054]" :style="{
                                maskImage: `url('https://i.ibb.co.com/G45DRqmz/arrow-left-01.webp')`,
                                webkitMaskImage: `url('https://i.ibb.co.com/G45DRqmz/arrow-left-01.webp')`,
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                webkitMaskSize: 'contain',
                                webkitMaskRepeat: 'no-repeat',
                                webkitMaskPosition: 'center'
                            }">
                            </div>
                            <span class="text-xs leading-normal font-medium text-[#344054]">Continue as
                                guest</span>
                        </button>
                        <div class="flex flex-col gap-1.5 w-full group/input">
                            <div
                                class="w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] dark:border-[#3b4043] bg-white/10 dark:bg-[#181a1b]/10 group-[.error]/input:border-[#FF692E] shadow-[0_1px_2px_0_#1018280D]">
                                <input type="email" placeholder="Email" v-model="engine.state.email"
                                    class="text-base text-[#344054] placeholder:text-base placeholder:text-[#667085]/50 dark:placeholder:text-[#e5e3df]/50 placeholder:font-sans w-full outline-none border-none bg-transparent" />
                                <img src="https://i.ibb.co.com/yBMzbHWz/alert-circle.webp" alt="alert-circle"
                                    class="hidden w-4 h-4 cursor-pointer group-[.error]/input:flex" />
                            </div>
                            <p class="text-sm text-[#FF692E] hidden group-[.error]/input:inline">
                                It looks like you already have an account with this email.
                            </p>
                        </div>
                        <div class="flex flex-col gap-1.5 w-full group/input">
                            <div
                                class="w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] dark:border-[#3b4043] bg-white/10 dark:bg-[#181a1b]/10 group-[.error]/input:border-[#FF692E] shadow-[0_1px_2px_0_#1018280D]">
                                <input type="password" placeholder="Password" v-model="engine.state.password"
                                    class="text-base text-[#344054] placeholder:text-base placeholder:text-[#667085]/50 dark:placeholder:text-[#e5e3df]/50 placeholder:font-sans w-full outline-none border-none bg-transparent" />
                                <img src="https://i.ibb.co.com/675rpz03/eye.webp" alt="eye"
                                    class="w-4 h-4 cursor-pointer [filter:brightness(0)_saturate(100%)_invert(72%)_sepia(11%)_saturate(403%)_hue-rotate(179deg)_brightness(89%)_contrast(86%)]" />
                            </div>
                            <span @click="engine.state.authMode = 'forgot'"
                                class="text-sm text-[#344054] w-fit cursor-pointer">Forgot
                                Password?</span>
                        </div>
                        <div class="flex flex-col items-center gap-2 sm:flex-row">
                            <button
                                class="w-full group h-10 flex justify-center items-center gap-2 px-6 bg-[#07F468] hover:bg-[#0C111D] dark:bg-[#0aff78] dark:hover:bg-[#162036]"
                                @click="handleLogin">
                                <span
                                    class="text-base font-medium tracking-[0.0218rem] text-[#0C111D] group-hover:text-[#07F468]">Log
                                    in</span>
                            </button>
                            <ButtonComponent text="Continue with X (Twitter)" variant="actionGreen"
                                leftIcon="https://i.ibb.co.com/HTj6TpFh/x.webp"
                                leftIconClass="w-6 h-6 group-hover/xbtn:[filter:brightness(0)_saturate(100%)_invert(3%)_sepia(58%)_saturate(1835%)_hue-rotate(205deg)_brightness(93%)_contrast(94%)]" />
                        </div>
                    </div>

                    <div v-else-if="engine.state.authMode === 'forgot'" class="flex flex-col gap-4">
                        <button class="flex items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer"
                            @click="engine.state.authMode = 'login'">
                            <div class="w-4 h-4 bg-[#344054]" :style="{
                                maskImage: `url('https://i.ibb.co.com/G45DRqmz/arrow-left-01.webp')`,
                                webkitMaskImage: `url('https://i.ibb.co.com/G45DRqmz/arrow-left-01.webp')`,
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                webkitMaskSize: 'contain',
                                webkitMaskRepeat: 'no-repeat',
                                webkitMaskPosition: 'center'
                            }">
                            </div>
                            <span class="text-xs leading-normal font-medium text-[#344054]">Back to Log
                                in</span>
                        </button>
                        <div class="flex flex-col gap-1.5 w-full group/input">
                            <div
                                class="w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] dark:border-[#3b4043] bg-white/10 dark:bg-[#181a1b]/10 group-[.error]/input:border-[#FF692E] shadow-[0_1px_2px_0_#1018280D]">
                                <input type="email" placeholder="Email" v-model="engine.state.email"
                                    class="text-base text-[#344054] placeholder:text-base placeholder:text-[#667085]/50 dark:placeholder:text-[#e5e3df]/50 placeholder:font-sans w-full outline-none border-none bg-transparent" />
                                <img src="https://i.ibb.co.com/yBMzbHWz/alert-circle.webp" alt="alert-circle"
                                    class="hidden w-4 h-4 cursor-pointer group-[.error]/input:flex" />
                            </div>
                            <p class="text-sm text-[#FF692E] hidden group-[.error]/input:inline">
                                It looks like you already have an account with this email.
                            </p>
                        </div>
                        <button
                            class="w-full h-10 flex justify-center items-center gap-2 px-6 bg-[#07F468] group/button hover:bg-[#0C111D] [&.disabled]:bg-white/20 [&.disabled]:cursor-not-allowed [&.disabled]:border-none dark:bg-[#0aff78] dark:hover:bg-[#162036] dark:[&.disabled]:bg-[#181a1b]/20">
                            <span
                                class="text-base font-medium tracking-[0.0218rem] text-[#0C111D] group-hover/button:text-[#07F468] group-[.disabled]/button:text-white/30 dark:text-[#dbd8d3] dark:group-hover/button:text-[#23f97b] dark:group-[.disabled]/button:text-[#e8e6e3]/30">RESET
                                PASSWORD</span>
                        </button>
                    </div>

                    <div v-else>
                        <p class="text-sm leading-normal tracking-[0.0175rem] text-[#344054]">
                            Already have an account?
                            <span @click="engine.state.authMode = 'login'"
                                class="text-sm leading-normal tracking-[0.0175rem] text-[#07F468] dark:text-[#23f97b] cursor-pointer font-bold">Log
                                in</span>
                        </p>
                        <BaseInput type="text"
                            inputClass="bg-white/10 mt-4 text-base text-[#344054] placeholder:text-base placeholder:text-[#667085] w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                            v-model="engine.state.email" label="" labelFor="email"
                            labelClass="text-sm font-medium text-[#667085]" placeholder="Email" />
                    </div>
                </SectionToggleHeader>


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
            <template v-if="!isCashMode">
                <div class="flex flex-col gap-3 py-2 px-2 mt-auto md:px-4 md:mt-[unset] lg:px-6 pb-0 sm:pb-2">
                    <!-- row -->
                    <div class="flex justify-between items-center pt-2 border-t border-transparent">
                        <span class="text-xs leading-normal text-text-primary dark:text-text-dark-primary">Your
                            Balance</span>
                        <div class="flex items-center gap-1">
                            <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg"
                                class="w-6 h-6">
                            <span class="text-sm leading-[1.25rem] text-text-primary dark:text-text-dark-primary">{{
                                userBalance }}</span>
                        </div>
                    </div>

                    <!-- row -->
                    <div class="flex justify-between items-center border-t border-transparent">
                        <span class="text-xs leading-normal text-text-primary dark:text-text-dark-primary">Top Up
                            Amount</span>
                        <div class="flex items-center gap-1">
                            <span
                                class="text-sm leading-[1.25rem] text-text-primary dark:text-text-dark-primary">+</span>
                            <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg"
                                class="w-6 h-6">
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
                            <img src="https://i.ibb.co.com/VprH7dBg/token-tip-svg.webp" alt="token-tip-svg"
                                class="w-6 h-6">
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
            </template>
            <template v-else>
                <div class="flex flex-col gap-3 py-2 px-2 mt-auto md:px-4 md:mt-[unset] lg:px-6 pb-0 sm:pb-2">
                    <!-- row -->
                    <div class="flex justify-between items-center pt-2 border-t border-transparent">
                        <span class="text-xs leading-normal text-text-primary dark:text-text-dark-primary">Tip
                            Amount</span>
                        <span class="text-sm leading-[1.25rem] text-text-primary dark:text-text-dark-primary">{{
                            formatCurrency(cashTipAmount) }}</span>
                    </div>

                    <!-- row -->
                    <div class="flex justify-between items-center border-t border-transparent">
                        <span class="text-xs leading-normal text-text-primary dark:text-text-dark-primary">Service
                            Charge (10%)</span>
                        <span class="text-sm leading-[1.25rem] text-text-primary dark:text-text-dark-primary">{{
                            formatCurrency(serviceCharge) }}</span>
                    </div>

                    <!-- row (final) -->
                    <div class="flex justify-between items-center pt-2 border-t border-[#fcfcfd]">
                        <span class="text-xs leading-normal text-text-primary dark:text-text-dark-primary">Final
                            Payment</span>
                        <span class="text-base font-semibold text-text-primary dark:text-text-dark-primary">{{
                            formatCurrency(finalCashPayment) }}</span>
                    </div>
                </div>
            </template>

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