<template>
  <PopupHandler
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="cartcheckoutNotLoginConfig"
  >
    <div
      class="bg-[#272727] font-sans p-0 m-0 box-border overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] [&.dark]:bg-[#202324]"
    >
      <!-- popup-wrapper -->
      <div
        class="flex flex-col h-screen bg-white/10 backdrop-blur-[100px] drop-shadow-[0_4px_6px_-2px_#10182808,0_12px_16px_-4px_#10182814] md:flex-row overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:overflow-y-[unset]"
      >
        <!-- image-container -->
        <CheckoutMediaPreview
          @update:modelValue="emit('update:modelValue', false)"
          image="https://i.ibb.co.com/SwFy98RJ/checkoutHeader.webp"
          creatorName="Princess Carrot Pop"
          creatorHandle="@sammisjelly187"
          :isVerified="true"
          volumeImg=""
        />

        <!-- form-container -->
        <div
          class="flex flex-col gap-6 px-2 pt-4 pb-6 md:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-4 sm:py-6 md:w-1/2 md:h-screen md:bg-black/50 dark:bg-background-dark-app"
        >
          <!-- form-section -->
          <div class="flex flex-col gap-6">
            <!-- email-account-section -->
            <div class="flex flex-col gap-2">
              <!-- title-container -->
              <SectionHeader
                title="ACCOUNT EMAIL"
                icon="https://i.ibb.co.com/LX2mCL2d/Communication.webp"
                :showClose="true"
                @close="emit('update:modelValue', false)"
              />

              <!-- email-container -->
              <div class="flex flex-col gap-4">
                <p class="text-sm font-medium text-white">
                  Already have an account?
                  <span
                    class="text-sm font-medium text-[#07F468] cursor-pointer"
                    >Log in</span
                  >
                </p>

                <!-- input-wrapper -->
                <BaseInput
                  type="text"
                  v-model="titleModel"
                  placeholder="Email"
                  inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                />
              </div>
            </div>

            <!-- order-summary-section -->
            <SectionToggleHeader
              title="ORDER SUMMARY"
              icon="https://i.ibb.co.com/xSK3W1w6/General.webp"
              v-model="orderSummaryOpen"
            >
              <OrderSummary :items="cartItems" />
            </SectionToggleHeader>

            <div class="flex flex-col gap-6">
              <!-- shipping-address-section -->
              
                <SectionToggleHeader
                  title="SHIPPING ADDRESS"
                  icon="https://i.ibb.co.com/5gv74YLd/Maps-travel.webp"
                  v-model="shippingOpen"
                >
                  <!-- form-container -->
                  <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-3">
                      <!-- input-group -->
                      <div class="flex items-center gap-2 w-full">
                        <!-- input-wrapper -->
                        <div class="w-full">
                          <BaseInput
                            type="text"
                            inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                            v-model="lastName"
                            label="Last Name"
                            labelFor="last-name"
                            labelClass="text-sm font-medium text-[#F9FAFB]"
                            placeholder="Last Name"
                          />
                        </div>

                        <!-- input-wrapper -->
                        <div class="w-full">
                          <BaseInput
                            type="text"
                            inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                            v-model="firstName"
                            label="First Name"
                            labelFor="first-name"
                            labelClass="text-sm font-medium text-[#F9FAFB]"
                            placeholder="First Name"
                          />
                        </div>
                      </div>

                      <!-- input-wrapper -->
                      <BaseInput
                        type="text"
                        inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                        v-model="addressLine1"
                        label="Address Line 1"
                        labelFor="Address-Line-1"
                        labelClass="text-sm font-medium text-[#F9FAFB]"
                        placeholder="Address Line 1"
                      />

                      <!-- input-wrapper -->
                      <BaseInput
                        type="text"
                        inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                        v-model="addressLine2"
                        label="Address Line 2"
                        labelFor="Address-Line-2"
                        labelClass="text-sm font-medium text-[#F9FAFB]"
                        placeholder="Address Line 2"
                      />

                      <!-- input-group -->
                      <div class="flex items-center gap-2">
                        <!-- input-wrapper -->
                        <div class="w-full">
                          <BaseInput
                            type="text"
                            inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                            v-model="postalCode"
                            label="Postal Code"
                            labelFor="postal-code"
                            labelClass="text-sm font-medium text-[#F9FAFB]"
                            placeholder="Postal Code"
                          />
                        </div>

                        <!-- input-wrapper -->
                        <div class="w-full">
                          <BaseInput
                            type="text"
                            inputClass="bg-white/10 text-base text-[#F9FAFB] placeholder:text-base placeholder:text-[#F9FAFB]/50 w-full px-3 py-2 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
                            v-model="City"
                            label="City"
                            labelFor="City"
                            labelClass="text-sm font-medium text-[#F9FAFB]"
                            placeholder="City"
                          />
                        </div>
                      </div>

                      <!-- dropdown-group -->
                      <div class="flex items-center gap-2">
                        <!-- dropdown-wrapper -->
                        <BaseSelect
                          label="Country"
                          :options="countryOptions"
                          v-model="selectedCountry"
                        />

                        <!-- dropdown-wrapper -->
                        <BaseSelect
                          label="State"
                          :options="stateOptions"
                          v-model="selectedState"
                          placeholder=""
                        />
                      </div>
                    </div>

                    <!-- checkbox-container -->
                    <CheckboxGroup
                      label="Save this address for future use."
                      v-model="profilePageModel"
                      checkboxClass="appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
                      labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                      wrapperClass="flex items-center"
                    />
                  </div>
                </SectionToggleHeader>
            

              <!-- payment-method-section -->
              <div class="flex flex-col gap-4">
                <!-- title-container -->
                <div
                  class="flex justify-between items-center border-b border-transparent"
                >
                  <!-- section-title -->
                  <div class="flex items-center gap-2">
                    <div class="flex justify-center items-center w-5 h-5">
                      <img
                        src="https://i.ibb.co.com/m5nstLw2/svgviewer-png-output-30.png"
                        alt="credit-card"
                        class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(98%)_sepia(1%)_saturate(934%)_hue-rotate(29deg)_brightness(120%)_contrast(100%)]"
                      />
                    </div>
                    <h3
                      class="text-base font-semibold text-[#F9FAFB] align-middle"
                    >
                      PAYMENT METHOD
                    </h3>
                  </div>
                </div>

                <!-- card-wrapper -->
                <PaymentMethodNotLoggedIn />
              </div>

              <!-- notes-section -->
              <CheckoutNotes :showAvatars="true" />
            </div>
          </div>

          <!-- total-section -->
          <div class="flex gap-6">
            <div class="flex flex-col gap-4 w-full">
              <TotalAmountRow amount="USD$6.99" />

              <!-- checkbox-container -->
              <CheckboxGroup
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

              <!-- button -->
              <ButtonComponent
                text="Next"
                variant="disableBtn"
                :rightIcon="'https://i.ibb.co.com/8LKPbgm1/arrow-right.webp'"
                :rightIconClass="`w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(6%)_saturate(678%)_hue-rotate(146deg)_brightness(115%)_contrast(100%)]`"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </PopupHandler>
</template>

<script setup>
import BaseInput from "@/components/input/BaseInput.vue";
import CheckoutMediaPreview from "../ReuseableComponents/CheckoutMediaPreview.vue";
import SectionHeader from "../ReuseableComponents/SectionHeader.vue";
import OrderSummary from "../ReuseableComponents/OrderSummary.vue";
import CheckboxGroup from "@/components/checkbox/CheckboxGroup.vue";
import PaymentMethodNotLoggedIn from "../ReuseableComponents/PaymentMethodNotLoggedIn.vue";
import CheckoutNotes from "../ReuseableComponents/CheckoutNotes.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import PopupHandler from "@/components/ui/popup/PopupHandler.vue";
import BaseSelect from "../ReuseableComponents/BaseSelect.vue";
import { ref } from "vue";
import TotalAmountRow from "../ReuseableComponents/TotalAmountRow.vue";
import SectionToggleHeader from "../ReuseableComponents/SectionToggleHeader.vue";

const orderSummaryOpen = ref(true);
const shippingOpen = ref(true);

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
];

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const cartcheckoutNotLoginConfig = {
  actionType: "slidein",
  from: "right",
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  showOverlay: false,
  closeOnOutside: true,
  lockScroll: false,
  escToClose: true,
  width: { default: "90%", "<768": "100%" },
  height: { default: "90%", "<768": "100%" },
  scrollable: false,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

// Data Variables
const selectedCountry = ref("hong-kong");
const selectedState = ref("");

// Options Data
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
</script>
