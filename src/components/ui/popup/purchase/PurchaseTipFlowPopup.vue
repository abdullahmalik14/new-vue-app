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
import OrderSummary from "../ReuseableComponents/OrderSummary.vue";
import PaymentMethodNotLoggedIn from "../ReuseableComponents/PaymentMethodNotLoggedIn.vue";
import PaymentMethodLoggedIn from "../ReuseableComponents/PaymentMethodLoggedIn.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

// --- 1. STATE ENGINE SETUP (Added Payment Fields & Notes) ---
const checkout = createStepStateEngine({
  flowId: "checkoutFlow",
  initialStep: 1,
  defaults: {
    // Step 1: Shipping/Billing
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    city: "",
    selectedCountry: "hong-kong",
    selectedState: "",
    saveAddress: false,
    sameAddress: false,
    termsAgreed: false,

    // Global: Notes
    orderNotes: "",

    // Step 2: Payment Details
    paymentCardNumber: "",
    paymentExpiry: "",
    paymentCardHolder: "",
    paymentCvv: "",
    paymentSaveCard: false,
  },
});

attachEngineLogging(checkout);

// --- Config Variables ---
const purchaseTipPopupConfig = {
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
const shiipingStep2Open = ref(true);
const paymentOpen = ref(true);
const orderSummaryOpen = ref(true);

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

// Mock Data
const cartItems = [
  {
    name: "Orange (Philippines)",
    image: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
    creatorName: "Princess Carrot Pop",
    creatorAvatar: "https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp",
    isVerified: true,
    price: "$5.99/mo",
    oldPrice: "$123.45",
  },
  {
    name: "Orange (Philippines)",
    image: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
    creatorName: "Princess Carrot Pop",
    creatorAvatar: "https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp",
    isVerified: true,
    price: "$5.99/mo",
    oldPrice: "$123.45",
  },
  {
    name: "Orange (Philippines)",
    image: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
    creatorName: "Princess Carrot Pop",
    creatorAvatar: "https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp",
    isVerified: true,
    price: "$5.99/mo",
    oldPrice: "$123.45",
  },
  {
    name: "Orange (Philippines)",
    image: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
    creatorName: "Princess Carrot Pop",
    creatorAvatar: "https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp",
    isVerified: true,
    price: "$5.99/mo",
    oldPrice: "$123.45",
  },
  {
    name: "Orange (Philippines)",
    image: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
    creatorName: "Princess Carrot Pop",
    creatorAvatar: "https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp",
    isVerified: true,
    price: "$5.99/mo",
    oldPrice: "$123.45",
  },
];

// --- 2. LOGIC FOR DYNAMIC ADDRESS CARD ---
const dynamicShippingAddress = computed(() => {
  const s = checkout.state;
  const parts = [
    `${s.firstName} ${s.lastName}`.trim(),
    s.addressLine1,
    s.addressLine2,
    s.postalCode,
    s.city,
    s.selectedCountry,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(", ")
    : "Please fill shipping address first";
});

// --- 3. VALIDATION & BUTTON LOGIC ---
// Validation Logic Update
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
    // Check karein ke fields empty na hon
    const hasCardNum = s.paymentCardNumber?.trim().length > 0;
    const hasExpiry = s.paymentExpiry?.trim().length > 0;
    const hasCvv = s.paymentCvv?.trim().length > 0;
    const hasHolder = s.paymentCardHolder?.trim().length > 0;

    // Button tab enable hoga jab saari details filled hongi
    // (Bhale checkbox tick ho ya na ho, details honi chahiye)
    return !!(hasCardNum && hasExpiry && hasCvv && hasHolder);
  }

  return false;
});

const buttonText = computed(() => {
  if (checkout.step === 1) return "Next";
  if (checkout.step === 2) return "Proceed Payment";
  return "Next";
});

// Computed for Right Icon Class
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
  if (checkout.step > 1) {
    checkout.goToStep(checkout.step - 1);
  } else {
    emit("update:modelValue", false);
  }
};

// --- 4. LAYOUT & SCROLL ---
const LG_BREAKPOINT = 1010;
const isLargeScreen = ref(false);
const rightColumnRef = ref(null);
const isMounted = ref(false);
const isAtBottom = ref(false);

const checkScreenSize = () => {
  isLargeScreen.value = window.innerWidth >= LG_BREAKPOINT;
  updateAtBottomState();
};

const updateAtBottomState = () => {
  let atBottom = false;
  if (isLargeScreen.value && rightColumnRef.value) {
    const { scrollTop, clientHeight, scrollHeight } = rightColumnRef.value;
    const hasScroll = scrollHeight > clientHeight + 1;
    atBottom = !hasScroll || scrollTop + clientHeight >= scrollHeight - 1;
  } else {
    atBottom =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 1;
  }
  isAtBottom.value = atBottom;
};

onMounted(async () => {
  checkout.initialize({ fromUrl: false });
  await nextTick();
  isMounted.value = true;
  checkScreenSize();
  updateAtBottomState();
  window.addEventListener("resize", checkScreenSize, { passive: true });
  window.addEventListener("scroll", updateAtBottomState, { passive: true });
  if (rightColumnRef.value) {
    rightColumnRef.value.addEventListener("scroll", updateAtBottomState, {
      passive: true,
    });
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
  window.removeEventListener("scroll", updateAtBottomState);
  if (rightColumnRef.value) {
    rightColumnRef.value.removeEventListener("scroll", updateAtBottomState);
  }
});
</script>

<template>
  <PopupHandler
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="purchaseTipPopupConfig"
  >
    <div
      class="bg-[#333333] h-full overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] [&.dark]:bg-[#35393b]"
    >
      <div
        class="flex flex-col min-h-screen bg-white/10 shadow-[0px_4px_6px_-2px_#10182808,0px_12px_16px_-4px_#10182814] md:rounded-t-[0.625rem] lg:rounded-[0.625rem] dark:bg-[#181a1b]/10"
      >
        <div
          class="absolute inset-0 backdrop-blur-[50px] pointer-events-none z-[-1] lg:backdrop-blur-[10px]"
        ></div>

        <div 
        @click="emit('update:modelValue', false)"
        class="flex items-center gap-1 px-2 py-1 md:hidden">
          <div
            class="flex justify-center items-center w-10 h-10 cursor-pointer"
            
          >
            <img
              src="https://i.ibb.co.com/Gvkq58F5/chevron-left.webp"
              alt="chevron-left"
              class="w-6 h-6"
            />
          </div>
        </div>

        <div
          class="flex flex-col gap-6 px-2 grow md:px-4 md:pt-6 lg:flex-row lg:p-0 lg:gap-0 lg:h-screen"
        >
          <div id="mobile-summary-target" class="w-full lg:hidden"></div>

          <div
            class="flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] lg:w-1/2 lg:px-4 lg:py-6 lg:grow lg:h-screen lg:overflow-y-auto"
          >
            <template v-if="checkout.step === 1">
              <SectionToggleHeader
                title="SHIPPING ADDRESS"
                icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="shippingOpen"
              >
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2 w-full">
                      <div class="w-full">
                        <BaseInput
                          type="text"
                          inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                          v-model="checkout.state.lastName"
                          label="Last Name"
                          labelFor="last-name"
                          labelClass="text-sm font-medium text-[#F9FAFB]"
                          placeholder="Last Name"
                        />
                      </div>
                      <div class="w-full">
                        <BaseInput
                          type="text"
                          inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                          v-model="checkout.state.firstName"
                          label="First Name"
                          labelFor="first-name"
                          labelClass="text-sm font-medium text-[#F9FAFB]"
                          placeholder="First Name"
                        />
                      </div>
                    </div>
                    <BaseInput
                      type="text"
                      inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                      v-model="checkout.state.addressLine1"
                      label="Address Line 1"
                      labelFor="Address-Line-1"
                      labelClass="text-sm font-medium text-[#F9FAFB]"
                      placeholder="Address Line 1"
                    />
                    <BaseInput
                      type="text"
                      inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                      v-model="checkout.state.addressLine2"
                      label="Address Line 2"
                      labelFor="Address-Line-2"
                      labelClass="text-sm font-medium text-[#F9FAFB]"
                      placeholder="Address Line 2"
                    />
                    <div class="flex items-center gap-2">
                      <div class="w-full">
                        <BaseInput
                          type="text"
                          inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                          v-model="checkout.state.postalCode"
                          label="Postal Code"
                          labelFor="postal-code"
                          labelClass="text-sm font-medium text-[#F9FAFB]"
                          placeholder="Postal Code"
                        />
                      </div>
                      <div class="w-full">
                        <BaseInput
                          type="text"
                          inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                          v-model="checkout.state.city"
                          label="City"
                          labelFor="City"
                          labelClass="text-sm font-medium text-[#F9FAFB]"
                          placeholder="City"
                        />
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <BaseSelect
                        label="Country"
                        :options="countryOptions"
                        v-model="checkout.state.selectedCountry"
                      />
                      <BaseSelect
                        label="State"
                        :options="stateOptions"
                        v-model="checkout.state.selectedState"
                        placeholder=""
                      />
                    </div>
                  </div>
                  <CheckboxGroup
                    label="Save this address for future use."
                    v-model="checkout.state.saveAddress"
                    checkboxClass="appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
                    labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                    wrapperClass="flex items-center"
                  />
                </div>
              </SectionToggleHeader>

              <SectionToggleHeader
                title="BILLING ADDRESS"
                icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="billingOpen"
              >
                <div class="flex flex-col gap-4">
                  <CheckboxGroup
                    v-if="!checkout.state.sameAddress"
                    label="Same as Shipping Address"
                    v-model="checkout.state.sameAddress"
                    checkboxClass="appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
                    labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                    wrapperClass="flex items-center"
                  />
                  <AddressCard
                    v-if="checkout.state.sameAddress"
                    :address="dynamicShippingAddress"
                  />
                </div>
              </SectionToggleHeader>
            </template>

            <template v-else-if="checkout.step === 2">
              <SectionToggleHeader
                title="PAYMENT METHOD"
                icon="https://i.ibb.co.com/m5nstLw2/svgviewer-png-output-30.png"
                v-model="paymentOpen"
                :showChevron="false"
                :toggleable="false"
              >
                <div v-if="checkout.state.paymentSaveCard">
                  <PaymentMethodLoggedIn
                    :holderName="checkout.state.paymentCardHolder"
                    :cardNumber="checkout.state.paymentCardNumber"
                    :expiry="checkout.state.paymentExpiry"
                    @remove="checkout.state.paymentSaveCard = false"
                  />
                </div>
                <div v-else>
                  <PaymentMethodNotLoggedIn
                    wrapperClass="max-w-[29.6875rem]"
                    v-model:cardNumber="checkout.state.paymentCardNumber"
                    v-model:expiry="checkout.state.paymentExpiry"
                    v-model:cardHolder="checkout.state.paymentCardHolder"
                    v-model:cvv="checkout.state.paymentCvv"
                    v-model:saveCard="checkout.state.paymentSaveCard"
                  />
                </div>
              </SectionToggleHeader>
              <SectionToggleHeader
                title="SHIPPING ADDRESS"
                icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="shiipingStep2Open"
              >
                <div class="flex flex-col gap-4">
                  <AddressCard :address="dynamicShippingAddress" />
                </div>
              </SectionToggleHeader>
              <SectionToggleHeader
                title="BILLING ADDRESS"
                icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="billingOpen"
              >
                <div class="flex flex-col gap-4">
                  <AddressCard :address="dynamicShippingAddress" />
                </div>
              </SectionToggleHeader>
            </template>

            <!-- debug-section/ -->
            <div
              class="debugSection hidden lg:grid  grid-cols-1 md:grid-cols-2 gap-4 mt-8 p-4 bg-gray-900/80 rounded-lg border border-gray-700"
            >
              <div
                class="bg-black/40 border border-gray-600 rounded-lg p-4 shadow-md"
              >
                <h3
                  class="text-xs font-semibold text-gray-400 border-b border-blue-500 pb-2 mb-2 uppercase tracking-wider"
                >
                  Flow State
                </h3>
                <pre
                  class="max-h-48 overflow-auto text-[10px] leading-relaxed text-blue-300 font-mono"
                  >{{ JSON.stringify(checkout.state, null, 2) }}</pre
                >
              </div>
              <div
                class="bg-black/40 border border-gray-600 rounded-lg p-4 shadow-md"
              >
                <h3
                  class="text-xs font-semibold text-gray-400 border-b border-green-500 pb-2 mb-2 uppercase tracking-wider"
                >
                  Flow Logs
                </h3>
                <pre
                  class="max-h-48 overflow-auto text-[10px] leading-relaxed text-green-300 font-mono"
                  >{{ checkout.logs.slice(-20).join("\n") }}</pre
                >
              </div>
            </div>
          </div>

          <div
            ref="rightColumnRef"
            class="flex flex-col pb-48 gap-6 group/right-col [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] lg:w-1/2 lg:px-4 lg:pt-6 lg:-mb-[1px] lg:grow lg:bg-black/50 dark:lg:bg-[#181a1b]/50 lg:h-screen lg:overflow-y-auto relative"
          >
            <CheckoutNotes
              :showAvatars="true"
              v-model="checkout.state.orderNotes"
            />

            <!-- debug-section/ -->
            <div
              class="debugSection lg:hidden grid  grid-cols-1 md:grid-cols-2 gap-4 mt-8 p-4 bg-gray-900/80 rounded-lg border border-gray-700"
            >
              <div
                class="bg-black/40 border border-gray-600 rounded-lg p-4 shadow-md"
              >
                <h3
                  class="text-xs font-semibold text-gray-400 border-b border-blue-500 pb-2 mb-2 uppercase tracking-wider"
                >
                  Flow State
                </h3>
                <pre
                  class="max-h-48 overflow-auto text-[10px] leading-relaxed text-blue-300 font-mono"
                  >{{ JSON.stringify(checkout.state, null, 2) }}</pre
                >
              </div>
              <div
                class="bg-black/40 border border-gray-600 rounded-lg p-4 shadow-md"
              >
                <h3
                  class="text-xs font-semibold text-gray-400 border-b border-green-500 pb-2 mb-2 uppercase tracking-wider"
                >
                  Flow Logs
                </h3>
                <pre
                  class="max-h-48 overflow-auto text-[10px] leading-relaxed text-green-300 font-mono"
                  >{{ checkout.logs.slice(-20).join("\n") }}</pre
                >
              </div>
            </div>

            <Teleport
              to="#mobile-summary-target"
              :disabled="isLargeScreen"
              v-if="isMounted"
            >
              <SectionToggleHeader
                title="ORDER SUMMARY"
                icon="https://i.ibb.co.com/xSK3W1w6/General.webp"
                v-model="orderSummaryOpen"
              >
                <OrderSummary :items="cartItems" />
              </SectionToggleHeader>
            </Teleport>


            <div id="desktop-total-target"></div>
          </div>
        </div>

        <Teleport
          to="#desktop-total-target"
          :disabled="!isLargeScreen"
          v-if="isMounted"
        >
          <div
            data-total-section
            class="fixed bottom-0 mt-6 w-full backdrop-blur-[50px] group/wrapper shadow-[0px_4px_6px_-2px_#10182808,0px_12px_16px_-4px_#10182814] z-[10001] lg:w-1/2 lg:mt-auto lg:-ml-4 lg:rounded-br-[0.625rem]"
          >
            <div
              class="flex flex-col gap-4 px-2 pb-6 md:px-4 md:rounded-b-[0.625rem] lg:rounded-b-none"
            >
              <div class="flex flex-col gap-4 w-full">
                <TotalAmountRow amount="USD$6.99" />

                <CheckboxGroup
                  v-if="checkout.step === 1"
                  v-model="checkout.state.termsAgreed"
                  checkboxClass="appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
                  labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                  wrapperClass="flex items-center gap-2"
                >
                  I agree to Our Website's
                  <a
                    href=""
                    class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer"
                    >Terms and Condition</a
                  >
                  and
                  <a
                    href=""
                    class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer"
                    >Privacy Policy</a
                  >.
                </CheckboxGroup>

                <ButtonComponent
                  :key="isStepValid"
                  :text="buttonText"
                  :variant="
                    isStepValid ? 'checkoutProceedpayment' : 'disableBtn'
                  "
                  :disabled="!isStepValid"
                  :rightIcon="'https://i.ibb.co.com/NdmC2BjP/arrow-right.webp'"
                  :rightIconClass="arrowIconClass"
                  @click="handleNextStep"
                />
              </div>
            </div>
          </div>
        </Teleport>
      </div>
    </div>
  </PopupHandler>
</template>
