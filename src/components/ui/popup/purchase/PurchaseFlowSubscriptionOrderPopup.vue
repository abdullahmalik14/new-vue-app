<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import {
  createStepStateEngine,
  attachEngineLogging,
} from "@/utils/stateEngine";

// Components
import PopupHandler from "@/components/ui/popup/PopupHandler.vue";
import BaseSelect from "../ReuseableComponents/BaseSelect.vue";
import CheckboxGroup from "@/components/checkbox/CheckboxGroup.vue";
import BaseInput from "@/components/input/BaseInput.vue";
import AddressCard from "../ReuseableComponents/AddressCard.vue";
import SectionToggleHeader from "../ReuseableComponents/SectionToggleHeader.vue";
import CheckoutNotes from "../ReuseableComponents/CheckoutNotes.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import TotalAmountRow from "../ReuseableComponents/TotalAmountRow.vue";
import PaymentMethodNotLoggedIn from "../ReuseableComponents/PaymentMethodNotLoggedIn.vue";
import PaymentMethodLoggedIn from "../ReuseableComponents/PaymentMethodLoggedIn.vue";
import SubscriptionPlanCard from "../ReuseableComponents/SubscriptionPlanCard.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // ✅ NEW PROP: Controls flow ('new' or 'upgrade')
  mode: { type: String, default: "upgrade" },
  currentSubscription: { type: Object, default: null },
  newSubscription: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue"]);

// Generate unique ID for Teleport target to avoid conflicts
const uid = `subscription-total-target-${Math.random().toString(36).substring(2, 9)}`;

// --- 1. STATE ENGINE SETUP ---
const checkout = createStepStateEngine({
  flowId: "checkoutFlow",
  // ✅ LOGIC: Agar upgrade hai to direct Step 2, warna Step 1
  initialStep: props.mode === "upgrade" ? 2 : 1,
  defaults: {
    // Step 1 Fields
    firstName: props.mode === "upgrade" ? "John" : "", // (dummy data for upgrade)
    lastName: props.mode === "upgrade" ? "Carley" : "",
    addressLine1: props.mode === "upgrade" ? "c1 1st floor" : "",
    addressLine2: props.mode === "upgrade" ? "London" : "",
    postalCode: props.mode === "upgrade" ? "55552" : "",
    city: props.mode === "upgrade" ? "New York" : "",
    selectedCountry: props.mode === "upgrade" ? "new-york" : "",
    selectedState: props.mode === "upgrade" ? "florida" : "",
    saveAddress: props.mode === "upgrade" ? true : false,
    sameAddress: true,
    termsAgreed: false,

    // Step 2 Fields
    paymentCardNumber: props.mode === "upgrade" ? "4242424242423507" : "",
    paymentExpiry: props.mode === "upgrade" ? "02/30" : "",
    paymentCardHolder: props.mode === "upgrade" ? "John Carter" : "",
    paymentCvv: "", // CVV
    // ✅ LOGIC: by default in upgrade popup payment will be saved
    paymentSaveCard: props.mode === "upgrade",

    orderNotes: "",
  },
});

attachEngineLogging(checkout);

// --- Config Variables ---
const purchaseFlowSubscriptionPopupConfig = {
  actionType: "popup",
  position: "center",
  customEffect: "scale",
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  showOverlay: false,
  closeOnOutside: true,
  lockScroll: false,
  escToClose: true,
  width: { default: "90%", "<768": "100%" },
  height: { default: "90%", "<768": "100%" },
  scrollable: true,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const billingOpen = ref(true);
const shippingOpen = ref(true);
const paymentOpen = ref(true);
const subscriptionOpen = ref(true);
const shiipingStep2Open = ref(true); // Fixed typo variable

// Options (Same as before)
const countryOptions = [
  { label: "Hong Kong", value: "hong-kong" },
  { label: "Australia", value: "australia" },
  { label: "USA", value: "usa" },
];
const stateOptions = [
  { label: "Florida", value: "florida" },
  { label: "Hawaii", value: "hawaii" },
  { label: "New York", value: "new-york" },
];

// --- Logic Helpers ---
const dynamicShippingAddress = computed(() => {
  const s = checkout.state;
  const parts = [
    `${s.firstName} ${s.lastName}`.trim(),
    s.addressLine1,
    s.city,
    s.selectedCountry,
  ].filter(Boolean);
  return parts.length > 0
    ? parts.join(", ")
    : "Please fill billing address first";
});

const isStepValid = computed(() => {
  const s = checkout.state;
  if (checkout.step === 1) {
    const hasName = s.firstName?.trim() && s.lastName?.trim();
    const hasAddress =
      s.addressLine1?.trim() && s.city?.trim() && s.selectedCountry;
    const hasTerms = s.termsAgreed === true;
    return !!(hasName && hasAddress && hasTerms);
  }
  if (checkout.step === 2) {
    // Agar Saved Card view active hai, toh valid maano (assuming saved card is valid)
    if (s.paymentSaveCard) return true;

    const hasCardNum = s.paymentCardNumber?.trim().length > 0;
    const hasExpiry = s.paymentExpiry?.trim().length > 0;
    const hasCvv = s.paymentCvv?.trim().length > 0;
    const hasHolder = s.paymentCardHolder?.trim().length > 0;
    return !!(hasCardNum && hasExpiry && hasCvv && hasHolder);
  }
  return false;
});

const buttonText = computed(() => {
  if (checkout.step === 1) return "Next";
  return "Proceed Payment";
});

const arrowIconClass = computed(() => {
  if (isStepValid.value) {
    return "w-6 h-6 brightness-0 opacity-100 contrast-[200%] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(66%)_sepia(68%)_saturate(2102%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] transition-all duration-200";
  } else {
    return "w-6 h-6 brightness-0 invert opacity-30";
  }
});

const handleNextStep = () => {
  if (checkout.step === 1) {
    checkout.goToStep(2);
  } else if (checkout.step === 2) {
    console.log("Submitting Order", checkout.state);
  }
};

const handleBack = () => {
  // Agar Upgrade mode hai aur step 2 par hai, toh back popup close karega (kyunki step 1 exist nahi karta user ke liye)
  if (props.mode === "upgrade" && checkout.step === 2) {
    emit("update:modelValue", false);
    return;
  }

  if (checkout.step > 1) {
    checkout.goToStep(checkout.step - 1);
  } else {
    emit("update:modelValue", false);
  }
};

// Layout Logic (Unchanged)
const LG_BREAKPOINT = 1010;
const isLargeScreen = ref(false);
const rightColumnRef = ref(null);
const isMounted = ref(false);

const checkScreenSize = () => {
  isLargeScreen.value = window.innerWidth >= LG_BREAKPOINT;
};

onMounted(async () => {
  checkout.initialize({ fromUrl: false });
  await nextTick();
  isMounted.value = true;
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
});
</script>

<template>
  <PopupHandler :modelValue="modelValue" @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="purchaseFlowSubscriptionPopupConfig">
    <div
      class="bg-[#333333] h-full overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] [&.dark]:bg-[#35393b]">
      <div
        class="flex flex-col min-h-screen bg-white/10 shadow-[0px_4px_6px_-2px_#10182808,0px_12px_16px_-4px_#10182814] md:rounded-t-[0.625rem] lg:rounded-[0.625rem] dark:bg-[#181a1b]/10">
        <div class="absolute inset-0 backdrop-blur-[50px] pointer-events-none z-[-1] lg:backdrop-blur-[10px]"></div>

        <div @click="emit('update:modelValue', false)" class="flex items-center gap-1 px-2 py-1 md:hidden">
          <div class="flex justify-center items-center w-10 h-10 cursor-pointer">
            <img src="https://i.ibb.co.com/Gvkq58F5/chevron-left.webp" alt="chevron-left" class="w-6 h-6" />
          </div>
        </div>

        <div class="flex flex-col gap-6 px-2 grow md:px-4 md:pt-6 lg:flex-row lg:p-0 lg:gap-0 lg:h-screen">
          <div id="mobile-summary-target-subscription" class="w-full lg:hidden"></div>

          <div
            class="flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] lg:w-1/2 lg:px-4 lg:py-6 lg:grow lg:h-screen lg:overflow-y-auto">
            <template v-if="checkout.step === 1">
              <SectionToggleHeader title="BILLING ADDRESS" icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="shippingOpen">
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2 w-full">
                      <div class="w-full">
                        <BaseInput type="text"
                          inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                          v-model="checkout.state.lastName" label="Last Name" labelFor="last-name"
                          labelClass="text-sm font-medium text-[#F9FAFB]" placeholder="Last Name" />
                      </div>
                      <div class="w-full">
                        <BaseInput type="text"
                          inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                          v-model="checkout.state.firstName" label="First Name" labelFor="first-name"
                          labelClass="text-sm font-medium text-[#F9FAFB]" placeholder="First Name" />
                      </div>
                    </div>
                    <BaseInput type="text"
                      inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                      v-model="checkout.state.addressLine1" label="Address Line 1" labelFor="Address-Line-1"
                      labelClass="text-sm font-medium text-[#F9FAFB]" placeholder="Address Line 1" />
                    <BaseInput type="text"
                      inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                      v-model="checkout.state.addressLine2" label="Address Line 2" labelFor="Address-Line-2"
                      labelClass="text-sm font-medium text-[#F9FAFB]" placeholder="Address Line 2" />
                    <div class="flex items-center gap-2">
                      <div class="w-full">
                        <BaseInput type="text"
                          inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                          v-model="checkout.state.postalCode" label="Postal Code" labelFor="postal-code"
                          labelClass="text-sm font-medium text-[#F9FAFB]" placeholder="Postal Code" />
                      </div>
                      <div class="w-full">
                        <BaseInput type="text"
                          inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                          v-model="checkout.state.city" label="City" labelFor="City"
                          labelClass="text-sm font-medium text-[#F9FAFB]" placeholder="City" />
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <BaseSelect label="Country" :options="countryOptions" v-model="checkout.state.selectedCountry" />
                      <BaseSelect label="State" :options="stateOptions" v-model="checkout.state.selectedState"
                        placeholder="" />
                    </div>
                  </div>
                  <CheckboxGroup label="Save this address for future use." v-model="checkout.state.saveAddress"
                    checkboxClass="appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
                    labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                    wrapperClass="flex items-center" />
                </div>
              </SectionToggleHeader>
            </template>

            <template v-else-if="checkout.step === 2">
              <SectionToggleHeader title="PAYMENT METHOD"
                icon="https://i.ibb.co.com/m5nstLw2/svgviewer-png-output-30.png" v-model="paymentOpen"
                :showChevron="false" :toggleable="false">
                <div v-if="checkout.state.paymentSaveCard">
                  <div class="hidden lg:flex">
                    <PaymentMethodLoggedIn :holderName="checkout.state.paymentCardHolder"
                      :cardNumber="checkout.state.paymentCardNumber" :expiry="checkout.state.paymentExpiry"
                      @remove="checkout.state.paymentSaveCard = false" variant="large" />
                  </div>
                  <div class="lg:hidden">
                    <PaymentMethodLoggedIn :holderName="checkout.state.paymentCardHolder"
                      :cardNumber="checkout.state.paymentCardNumber" :expiry="checkout.state.paymentExpiry"
                      @remove="checkout.state.paymentSaveCard = false" />
                  </div>
                </div>
                <div v-else>
                  <PaymentMethodNotLoggedIn wrapperClass="max-w-[29.6875rem]"
                    v-model:cardNumber="checkout.state.paymentCardNumber" v-model:expiry="checkout.state.paymentExpiry"
                    v-model:cardHolder="checkout.state.paymentCardHolder" v-model:cvv="checkout.state.paymentCvv"
                    v-model:saveCard="checkout.state.paymentSaveCard" />
                </div>
              </SectionToggleHeader>

              <SectionToggleHeader title="BILLING ADDRESS" icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="billingOpen">
                <div class="flex flex-col gap-4">
                  <AddressCard :address="dynamicShippingAddress" />
                </div>
              </SectionToggleHeader>
            </template>

            <div
              class="debugSection hidden lg:grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 p-4 bg-gray-900/80 rounded-lg border border-gray-700">
              <div class="bg-black/40 border border-gray-600 rounded-lg p-4 shadow-md">
                <h3
                  class="text-xs font-semibold text-gray-400 border-b border-blue-500 pb-2 mb-2 uppercase tracking-wider">
                  Flow State
                </h3>
                <pre class="max-h-48 overflow-auto text-[10px] leading-relaxed text-blue-300 font-mono">{{
                  JSON.stringify(checkout.state, null, 2) }}</pre>
              </div>
              <div class="bg-black/40 border border-gray-600 rounded-lg p-4 shadow-md">
                <h3
                  class="text-xs font-semibold text-gray-400 border-b border-green-500 pb-2 mb-2 uppercase tracking-wider">
                  Flow Logs
                </h3>
                <pre class="max-h-48 overflow-auto text-[10px] leading-relaxed text-green-300 font-mono">{{
                  checkout.logs.slice(-20).join("\n") }}</pre>
              </div>
            </div>
          </div>

          <div ref="rightColumnRef"
            class="flex flex-col pb-[260px] gap-6 group/right-col [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] lg:w-1/2 lg:px-4 lg:pt-6 lg:-mb-[1px] lg:grow lg:bg-black/50 dark:lg:bg-[#181a1b]/50 lg:h-screen lg:overflow-y-auto relative">
            <Teleport to="#mobile-summary-target-subscription" :disabled="isLargeScreen" v-if="isMounted">
              <SectionToggleHeader title="SUBSCRIPTION" icon="https://i.ibb.co.com/chd372MJ/logo-bg.webp"
                v-model="subscriptionOpen" :showChevron="false" :toggleable="false">
                <div v-if="mode === 'upgrade'" class="flex flex-col gap-4">
                  <p class="text-sm text-white">
                    You are about to change your membership tier as follows:
                  </p>

                  <div class="flex flex-col gap-1">
                    <span class="text-xs text-[#98A2B3]">Current Subscription</span>
                    <SubscriptionPlanCard variant="new"
                      :title="currentSubscription?.title || 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.'"
                      :price="`USD$${currentSubscription?.price || '499.99'}`" period="/mo"
                      backgroundImage="https://i.ibb.co.com/LXPfFX03/profile-slidein-bg.webp" accentColor="#667085"
                      footerText="" logoImage="https://i.ibb.co.com/p6RVnpkx/logo-1.webp"
                      leftSectionGradient="linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5)),linear-gradient(0deg,rgba(102,112,133,0.50),rgba(102,112,133,0.50))" />
                  </div>

                  <div class="flex flex-col gap-1">
                    <span class="text-xs text-[#98A2B3]">New Subscription</span>
                    <SubscriptionPlanCard variant="new"
                      :title="newSubscription?.title || 'FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit.'"
                      :price="`USD$${newSubscription?.price || '499.99'}`" period="/mo"
                      backgroundImage="https://i.ibb.co.com/LXPfFX03/profile-slidein-bg.webp" accentColor="#ff0066"
                      footerText="Your membership will update in your next billing cycle (xx-xx-xxxx)"
                      logoImage="https://i.ibb.co.com/p6RVnpkx/logo-1.webp"
                      leftSectionGradient="linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5)),linear-gradient(0deg,rgba(255,0,102,0.50),rgba(255,0,102,0.50))" />
                  </div>
                </div>

                <div v-else>
                  <span class="text-xs leading-normal mb-4 text-[#98A2B3] dark:text-[#b0a993] block">New
                    Subscription</span>
                  <SubscriptionPlanCard variant="new"
                    title="FEATURED library of LOREM LPSUM ATIER dolor sit amet, consectetur adipiscing elit."
                    price="USD$499.99" period="/mo"
                    backgroundImage="https://i.ibb.co.com/LXPfFX03/profile-slidein-bg.webp" accentColor="#d8af0d"
                    footerText="Your subscription will begin as soon as you complete checkout. Your billing cycle will start (02-26-2025)."
                    logoImage="https://i.ibb.co.com/p6RVnpkx/logo-1.webp" />
                </div>
              </SectionToggleHeader>
            </Teleport>

            <CheckoutNotes :showAvatars="true" v-model="checkout.state.orderNotes" />

            <div :id="uid"></div>
          </div>

        </div>

        <Teleport :to="`#${uid}`" :disabled="!isLargeScreen" v-if="isMounted">
          <div data-total-section
            class="fixed bottom-0 mt-6 w-full backdrop-blur-[50px] group/wrapper shadow-[0px_4px_6px_-2px_#10182808,0px_12px_16px_-4px_#10182814] z-[10001] lg:w-1/2 lg:mt-auto lg:-ml-4 lg:rounded-br-[0.625rem]">
            <div class="flex flex-col gap-4 px-2 pb-6 md:px-4 md:rounded-b-[0.625rem] lg:rounded-b-none">
              <div class="flex flex-col gap-4 w-full">
                <p v-if="mode === 'upgrade'"
                  class="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] dark:text-[#b0a993]">
                  You will be charged
                  <span
                    class="text-sm leading-normal tracking-[0.0175rem] text-[#07F468] dark:text-[#23f97b]">$6.99</span>
                  at checkout, which is a prorated amount based on the remaining
                  days in this billing cycle. After that, the full monthly fee
                  of
                  <span
                    class="text-sm leading-normal tracking-[0.0175rem] text-[#07F468] dark:text-[#23f97b]">$50.00</span>
                  will be charged on XX-XX-XXXX and on the same date each month.
                  Your subscription auto-renews, and you can cancel anytime in
                  your account.
                </p>
                <p v-else class="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] dark:text-[#b0a993]">
                  You will be charged
                  <span class="text-sm leading-normal tracking-[0.0175rem] text-[#07F468] dark:text-[#23f97b]">${{
                    newSubscription?.price || '499.99' }}</span>today (02-26-2025) and on the same day each month. This
                  subscription renews automatically, and you can cancel anytime
                  in your account.
                </p>
                <TotalAmountRow :amount="`USD$${mode === 'upgrade' ? '6.99' : (newSubscription?.price || '499.99')}`" />

                <CheckboxGroup v-if="checkout.step === 1" v-model="checkout.state.termsAgreed"
                  checkboxClass="appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
                  labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                  wrapperClass="flex items-center gap-2">
                  I agree to Our Website's
                  <a href=""
                    class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">Terms
                    and Condition</a>
                  and
                  <a href=""
                    class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">Privacy
                    Policy</a>.
                </CheckboxGroup>

                <ButtonComponent :key="isStepValid" :text="buttonText" :variant="isStepValid ? 'checkoutProceedpayment' : 'disableBtn'
                  " :disabled="!isStepValid" :rightIcon="'https://i.ibb.co.com/NdmC2BjP/arrow-right.webp'"
                  :rightIconClass="arrowIconClass" @click="handleNextStep" />
              </div>
            </div>
          </div>
        </Teleport>
      </div>
    </div>
  </PopupHandler>
</template>
