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
import OrderSummary from "../ReuseableComponents/OrderSummary.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: "new" },
});

const emit = defineEmits(["update:modelValue"]);

// --- 1. STATE ENGINE SETUP ---
const checkout = createStepStateEngine({
  flowId: "checkoutFlow",
  initialStep: 1,
  defaults: {
    email: "",
    password: "",
    authMode: "guest",
    isLoggedIn: false,

    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    city: "",
    selectedCountry: "",
    selectedState: "",
    saveAddress: false,
    sameAddress: false,
    termsAgreed: false,

    paymentCardNumber: "",
    paymentExpiry: "",
    paymentCardHolder: "",
    paymentCvv: "",
    paymentSaveCard: false,
    orderNotes: "",
  },
});

attachEngineLogging(checkout);

// --- Config Variables ---
const guestPurchaseFlowPopupConfig = {
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
const shippingOpenTwo = ref(true);
const paymentOpen = ref(true);
const billingMailOpen = ref(true);
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
    : "Please fill shipping address first";
});

const isStepValid = computed(() => {
  const s = checkout.state;
  if (s.authMode !== "guest" && !s.isLoggedIn) return false;

  if (checkout.step === 1) {
    const hasEmail = s.email?.trim().length > 0;
    const hasName = s.firstName?.trim() && s.lastName?.trim();
    const hasAddress =
      s.addressLine1?.trim() && s.city?.trim() && s.selectedCountry;
    const hasTerms = s.termsAgreed === true;
    return !!(hasEmail && hasName && hasAddress && hasTerms);
  }
  if (checkout.step === 2) {
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

// ✅ FAKE LOGIN (Uses typed email if available)
const handleLogin = () => {
  // Agar user ne email type kiya hai to wo use karein, warna dummy
  if (!checkout.state.email) {
    checkout.state.email = "existingmember@gmail.com";
  }
  checkout.state.isLoggedIn = true;
  checkout.state.authMode = "guest";
};

const handleLogout = () => {
  checkout.state.isLoggedIn = false;
  checkout.state.email = "";
  // Agar step 2 par tha to wapis step 1 par bhej do logout hone par (optional UX choice)
  if (checkout.step === 2) {
    checkout.goToStep(1);
  }
};

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
  <PopupHandler
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="guestPurchaseFlowPopupConfig"
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
          class="flex items-center gap-1 px-2 py-1 md:hidden"
        >
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
          <div
            class="flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] lg:w-1/2 lg:px-4 lg:py-6 lg:grow lg:h-screen lg:overflow-y-auto"
          >
            <template v-if="checkout.step === 1">
              <SectionToggleHeader
                title="BILLING EMAIL"
                icon="https://i.ibb.co.com/XfdvLvLC/mail.webp"
                v-model="billingMailOpen"
                :showChevron="false"
                :toggleable="false"
              >
                <div
                  v-if="checkout.state.isLoggedIn"
                  class="flex justify-between items-end"
                >
                  <div class="flex items-center gap-2 py-1">
                    <div class="flex justify-center items-center w-10 h-9">
                      <img
                        src="https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp"
                        alt="avatar"
                        class="h-full object-cover"
                      />
                    </div>
                    <div class="flex flex-col">
                      <h3
                        class="text-xs leading-normal font-semibold text-white dark:text-[#e8e6e3]"
                      >
                        Man goes 4eva
                      </h3>
                      <span
                        class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]"
                        >{{ checkout.state.email }}</span
                      >
                    </div>
                  </div>
                  <button
                    class="flex items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer"
                    @click="handleLogout"
                  >
                    <img
                      src="https://i.ibb.co.com/Gfb88yFY/log-out.webp"
                      alt="log-out"
                      class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(4%)_saturate(1168%)_hue-rotate(179deg)_brightness(98%)_contrast(82%)]"
                    />
                    <span
                      class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]"
                      >Log out</span
                    >
                  </button>
                </div>

                <div
                  v-else-if="checkout.state.authMode === 'login'"
                  class="flex flex-col gap-4"
                >
                  <button
                    class="flex items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer w-fit"
                    @click="checkout.state.authMode = 'guest'"
                  >
                    <img
                      src="https://i.ibb.co.com/G45DRqmz/arrow-left-01.webp"
                      alt="arrow left"
                      class="w-4 h-4"
                    />
                    <span
                      class="text-xs leading-normal font-medium text-white dark:text-[#e8e6e3]"
                      >Continue as guest</span
                    >
                  </button>
                  <div class="flex flex-col gap-1.5 w-full group/input">
                    <div
                      class="w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] dark:border-[#3b4043] bg-white/10 dark:bg-[#181a1b]/10 group-[.error]/input:border-[#FF692E] shadow-[0_1px_2px_0_#1018280D]"
                    >
                      <input
                        type="email"
                        placeholder="Email"
                        v-model="checkout.state.email"
                        class="text-base text-white dark:text-[#e8e6e3] placeholder:text-base placeholder:text-[#F9FAFB]/50 dark:placeholder:text-[#e5e3df]/50 placeholder:font-sans w-full outline-none border-none bg-transparent"
                      />
                      <img
                        src="https://i.ibb.co.com/yBMzbHWz/alert-circle.webp"
                        alt="alert-circle"
                        class="hidden w-4 h-4 cursor-pointer group-[.error]/input:flex"
                      />
                    </div>
                    <p
                      class="text-sm text-[#FF692E] hidden group-[.error]/input:inline"
                    >
                      It looks like you already have an account with this email.
                    </p>
                  </div>
                  <div class="flex flex-col gap-1.5 w-full group/input">
                    <div
                      class="w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] dark:border-[#3b4043] bg-white/10 dark:bg-[#181a1b]/10 group-[.error]/input:border-[#FF692E] shadow-[0_1px_2px_0_#1018280D]"
                    >
                      <input
                        type="password"
                        placeholder="Password"
                        v-model="checkout.state.password"
                        class="text-base text-white dark:text-[#e8e6e3] placeholder:text-base placeholder:text-[#F9FAFB]/50 dark:placeholder:text-[#e5e3df]/50 placeholder:font-sans w-full outline-none border-none bg-transparent"
                      />
                      <img
                        src="https://i.ibb.co.com/675rpz03/eye.webp"
                        alt="eye"
                        class="w-4 h-4 cursor-pointer [filter:brightness(0)_saturate(100%)_invert(72%)_sepia(11%)_saturate(403%)_hue-rotate(179deg)_brightness(89%)_contrast(86%)]"
                      />
                    </div>
                    <span
                      @click="checkout.state.authMode = 'forgot'"
                      class="text-sm text-white dark:text-[#e8e6e3] w-fit cursor-pointer"
                      >Forgot Password?</span
                    >
                  </div>
                  <div class="flex flex-col items-center gap-2 sm:flex-row">
                    <button
                      class="w-full group h-10 flex justify-center items-center gap-2 px-6 bg-[#07F468] hover:bg-[#0C111D] dark:bg-[#0aff78] dark:hover:bg-[#162036]"
                      @click="handleLogin"
                    >
                      <span
                        class="text-base font-medium tracking-[0.0218rem] text-[#0C111D] group-hover:text-[#07F468]"
                        >Log in</span
                      >
                    </button>
                    <ButtonComponent
                      text="Continue with X (Twitter)"
                      variant="actionGreen"
                      leftIcon="https://i.ibb.co.com/HTj6TpFh/x.webp"
                      leftIconClass="w-6 h-6 group-hover/xbtn:[filter:brightness(0)_saturate(100%)_invert(3%)_sepia(58%)_saturate(1835%)_hue-rotate(205deg)_brightness(93%)_contrast(94%)]"
                    />
                  </div>
                </div>

                <div
                  v-else-if="checkout.state.authMode === 'forgot'"
                  class="flex flex-col gap-4"
                >
                  <button
                    class="flex items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer"
                    @click="checkout.state.authMode = 'login'"
                  >
                    <img
                      src="https://i.ibb.co.com/G45DRqmz/arrow-left-01.webp"
                      alt="arrow left"
                      class="w-4 h-4"
                    />
                    <span
                      class="text-xs leading-normal font-medium text-white dark:text-[#e8e6e3]"
                      >Back to Log in</span
                    >
                  </button>
                  <div class="flex flex-col gap-1.5 w-full group/input">
                    <div
                      class="w-full h-10 flex items-center gap-2 py-2 px-3 border-b border-[#D0D5DD] dark:border-[#3b4043] bg-white/10 dark:bg-[#181a1b]/10 group-[.error]/input:border-[#FF692E] shadow-[0_1px_2px_0_#1018280D]"
                    >
                      <input
                        type="email"
                        placeholder="Email"
                        v-model="checkout.state.email"
                        class="text-base text-white dark:text-[#e8e6e3] placeholder:text-base placeholder:text-[#F9FAFB]/50 dark:placeholder:text-[#e5e3df]/50 placeholder:font-sans w-full outline-none border-none bg-transparent"
                      />
                      <img
                        src="https://i.ibb.co.com/yBMzbHWz/alert-circle.webp"
                        alt="alert-circle"
                        class="hidden w-4 h-4 cursor-pointer group-[.error]/input:flex"
                      />
                    </div>
                    <p
                      class="text-sm text-[#FF692E] hidden group-[.error]/input:inline"
                    >
                      It looks like you already have an account with this email.
                    </p>
                  </div>
                  <button
                    class="w-full h-10 flex justify-center items-center gap-2 px-6 bg-[#07F468] group/button hover:bg-[#0C111D] [&.disabled]:bg-white/20 [&.disabled]:cursor-not-allowed [&.disabled]:border-none dark:bg-[#0aff78] dark:hover:bg-[#162036] dark:[&.disabled]:bg-[#181a1b]/20"
                  >
                    <span
                      class="text-base font-medium tracking-[0.0218rem] text-[#0C111D] group-hover/button:text-[#07F468] group-[.disabled]/button:text-white/30 dark:text-[#dbd8d3] dark:group-hover/button:text-[#23f97b] dark:group-[.disabled]/button:text-[#e8e6e3]/30"
                      >RESET PASSWORD</span
                    >
                  </button>
                </div>

                <div v-else>
                  <p
                    class="text-sm leading-normal tracking-[0.0175rem] text-text"
                  >
                    Already have an account?
                    <span
                      @click="checkout.state.authMode = 'login'"
                      class="text-sm leading-normal tracking-[0.0175rem] text-[#07F468] dark:text-[#23f97b] cursor-pointer font-bold"
                      >Log in</span
                    >
                  </p>
                  <BaseInput
                    type="text"
                    inputClass="bg-white/10 mt-4 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                    v-model="checkout.state.email"
                    label=""
                    labelFor="email"
                    labelClass="text-sm font-medium text-[#F9FAFB]"
                    placeholder="Email"
                  />
                </div>
              </SectionToggleHeader>

              <div id="mobile-guest-target" class="w-full lg:hidden"></div>

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
                title="BILLING EMAIL"
                icon="https://i.ibb.co.com/XfdvLvLC/mail.webp"
                v-model="billingMailOpen"
                :showChevron="false"
                :toggleable="false"
              >
                <div class="flex justify-between items-end">
                  <div class="flex items-center gap-2 py-1">
                    <div class="flex justify-center items-center w-10 h-9">
                      <img
                        src="https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp"
                        alt="avatar"
                        class="h-full object-cover"
                      />
                    </div>
                    <div class="flex flex-col">
                      <h3
                        class="text-xs leading-normal font-semibold text-white dark:text-[#e8e6e3]"
                      >
                        Man goes 4eva
                      </h3>
                      <span
                        class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]"
                        >{{ checkout.state.email }}</span
                      >
                    </div>
                  </div>

                  <!-- log-out-button -->
                  <button
                    class="flex items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer"
                  >
                    <img
                      src="https://i.ibb.co.com/Gfb88yFY/log-out.webp"
                      alt="log-out"
                      class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(4%)_saturate(1168%)_hue-rotate(179deg)_brightness(98%)_contrast(82%)]"
                    />
                    <span
                      class="text-xs leading-normal font-medium text-[#98A2B3] dark:text-[#b0a993]"
                      >Log out</span
                    >
                  </button>
                </div>
              </SectionToggleHeader>

              <SectionToggleHeader
                title="SHIPPING ADDRESS"
                icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="shippingOpenTwo"
              >
                <div class="flex flex-col gap-4">
                  <AddressCard :address="dynamicShippingAddress" />
                </div>
              </SectionToggleHeader>

              <SectionToggleHeader
                title="PAYMENT METHOD"
                icon="https://i.ibb.co.com/m5nstLw2/svgviewer-png-output-30.png"
                v-model="paymentOpen"
                :showChevron="false"
                :toggleable="false"
              >
                <div v-if="checkout.state.paymentSaveCard">
                  <div class="hidden lg:flex">
                  <PaymentMethodLoggedIn
                    :holderName="checkout.state.paymentCardHolder"
                    :cardNumber="checkout.state.paymentCardNumber"
                    :expiry="checkout.state.paymentExpiry"
                    @remove="checkout.state.paymentSaveCard = false"
                    variant="large"
                  />
                   </div>
                   <div class="lg:hidden">
                  <PaymentMethodLoggedIn
                    :holderName="checkout.state.paymentCardHolder"
                    :cardNumber="checkout.state.paymentCardNumber"
                    :expiry="checkout.state.paymentExpiry"
                    @remove="checkout.state.paymentSaveCard = false"
                  
                  />
                   </div>
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
                title="BILLING ADDRESS"
                icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                v-model="billingOpen"
              >
                <div class="flex flex-col gap-4">
                  <AddressCard :address="dynamicShippingAddress" />
                </div>
              </SectionToggleHeader>
            </template>

            <div
              class="debugSection hidden lg:grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 p-4 bg-gray-900/80 rounded-lg border border-gray-700"
            >
              <div
                class="bg-black/40 border border-gray-600 rounded-lg p-4 shadow-md"
              >
                <pre
                  class="max-h-48 overflow-auto text-[10px] leading-relaxed text-blue-300 font-mono"
                  >{{ JSON.stringify(checkout.state, null, 2) }}</pre
                >
              </div>
              <div
                class="bg-black/40 border border-gray-600 rounded-lg p-4 shadow-md"
              >
                <pre
                  class="max-h-48 overflow-auto text-[10px] leading-relaxed text-green-300 font-mono"
                  >{{ checkout.logs.slice(-20).join("\n") }}</pre
                >
              </div>
            </div>
          </div>

          <div
            ref="rightColumnRef"
            class="flex flex-col gap-6 group/right-col [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] lg:w-1/2 lg:px-4 lg:pt-6 lg:-mb-[1px] lg:grow lg:bg-black/50 dark:lg:bg-[#181a1b]/50 lg:h-screen lg:overflow-y-auto pb-[170px] relative"
          >
            <CheckoutNotes
              :showAvatars="true"
              v-model="checkout.state.orderNotes"
            />

            <Teleport
              to="#mobile-guest-target"
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
            <div id="guest-total-target"></div>
          </div>
        </div>

        <Teleport
          to="#guest-total-target"
          :disabled="!isLargeScreen"
          v-if="isMounted"
        >
          <div
            data-total-section
            class="fixed bottom-0 mt-6 w-full bg-[linear-gradient(0deg,rgba(0,0,0,0.4),rgba(0,0,0,0.4)),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.9)_100%)] [&.at-bottom]:[background:transparent] backdrop-blur-[35px] group/wrapper shadow-[0px_0px_1px_0px_black] [&.at-bottom]:shadow-none z-[10001] [&.at-bottom]:backdrop-blur-0 lg:w-1/2 md:backdrop-blur-[2.5px] lg:mt-auto lg:-ml-4"
          >
            <div
              class="flex flex-col gap-4 px-2 pb-6 md:px-4 md:rounded-b-[0.625rem] lg:rounded-b-none"
            >
              <div class="flex flex-col gap-4 w-full">
                <div class="flex flex-col gap-0.5">
                  <TotalAmountRow amount="USD$6.99" />
                  <span
                    class="text-xs leading-normal underline text-[#F9FAFB] dark:text-[#e5e3df] inline lg:hidden"
                    >See Summary</span
                  >
                </div>
                <CheckboxGroup
                  v-if="checkout.step === 1"
                  v-model="checkout.state.termsAgreed"
                  checkboxClass="appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
                  labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                  wrapperClass="flex items-center gap-2"
                >
                  I agree to Fansocial’s
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
