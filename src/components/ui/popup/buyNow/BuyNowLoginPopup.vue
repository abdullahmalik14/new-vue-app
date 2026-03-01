<script setup>
  import { ref } from "vue";
import PopupHandler from "@/components/ui/popup/PopupHandler.vue";
import SectionHeader from "../ReuseableComponents/SectionHeader.vue";
import PaymentMethodLoggedIn from "../ReuseableComponents/PaymentMethodLoggedIn.vue";
import CheckoutNotes from "../ReuseableComponents/CheckoutNotes.vue";
import OrderSummary from "../ReuseableComponents/OrderSummary.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import CheckboxGroup from "@/components/checkbox/CheckboxGroup.vue";
import CheckoutMediaPreview from "../ReuseableComponents/CheckoutMediaPreview.vue";
import TotalAmountRow from "../ReuseableComponents/TotalAmountRow.vue";
import SectionToggleHeader from "../ReuseableComponents/SectionToggleHeader.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);
const orderSummaryOpen = ref(true);

const buyNowLoginConfig = {
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
</script>

<template>
  <PopupHandler
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="buyNowLoginConfig"
  >
    <!-- popup-wrapper -->
    <div
      class="bg-[#272727] font-sans p-0 m-0 box-border overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]"
    >
      <div
        class="flex flex-col h-screen bg-white/10 backdrop-blur-[100px] drop-shadow-[0_4px_6px_-2px_#10182808,0_12px_16px_-4px_#10182814] md:flex-row overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:overflow-y-[unset]"
      >
        <!-- image-container -->
        <CheckoutMediaPreview
          @update:modelValue="emit('update:modelValue', false)"
          image="https://i.ibb.co.com/70sHrpv/featured-media-bg.webp"
          creatorName="Princess Carrot Pop"
          creatorHandle="@sammisjelly187"
          :isVerified="true"
          description="Complete your purchase to watch the full video instantly."
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
              <div class="flex justify-between items-end">
                <!-- model-info -->
                <div class="flex items-center gap-2 py-1">
                  <!-- avatar -->
                  <div class="flex justify-center items-center w-10 h-9">
                    <img
                      src="https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp"
                      alt="avatar"
                      class="h-full object-cover"
                    />
                  </div>

                  <!-- info -->
                  <div class="flex flex-col">
                    <h3 class="text-xs leading-normal font-semibold text-white">
                      Man goes 4eva
                    </h3>
                    <span
                      class="text-xs leading-normal font-medium text-[#98A2B3]"
                      >existingmember@gmail.com</span
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
                    class="text-xs leading-normal font-medium text-[#98A2B3]"
                    >Log out</span
                  >
                </button>
              </div>
            </div>

            <!-- order-summary-section (mobile) -->
            <div class="flex flex-col gap-6 md:hidden">
              <SectionToggleHeader
                title="ORDER SUMMARY"
                icon="https://i.ibb.co.com/xSK3W1w6/General.webp"
                v-model="orderSummaryOpen"
              >
                <OrderSummary :items="cartItems" />
              </SectionToggleHeader>
            </div>

            <div class="flex flex-col gap-6">
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

                  <!-- arrow-container -->
                  <div class="flex items-center gap-2.5">
                    <span
                      class="text-sm font-medium text-[#EAECF0] dark:text-[#dddad5]"
                      >Change Card</span
                    >
                    <div
                      class="flex justify-center items-center w-6 h-6 cursor-pointer"
                    >
                      <img
                        src="https://i.ibb.co.com/qLW7tf3T/Arrows.webp"
                        alt="chevron-down"
                      />
                    </div>
                  </div>
                </div>

                <!-- form-container -->
                <PaymentMethodLoggedIn />
              </div>

              <!-- notes-section -->
              <CheckoutNotes :showAvatars="false" />

              <!-- order-summary-section (desktop) -->
              <div class="hidden flex-col gap-4 md:flex">
                <SectionToggleHeader
                  title="ORDER SUMMARY"
                  icon="https://i.ibb.co.com/xSK3W1w6/General.webp"
                  v-model="orderSummaryOpen"
                >
                  <OrderSummary :items="cartItems" />
                </SectionToggleHeader>
              </div>
            </div>
          </div>

          <!-- total-section (mobile) -->
          <div class="flex gap-6 mt-auto">
            <div class="flex flex-col gap-4 w-full">
              <TotalAmountRow amount="USD$6.99" />

              <!-- checkbox-container -->

              <CheckboxGroup
                checkboxClass="appearance-none border border-[#D0D5DD] dark:border-[#4a5568] rounded-[4px] w-4 min-w-4 h-4 mt-0.5 checked:accent-[#07f468] checked:bg-[#07f468] dark:checked:bg-[#0aff78] checked:border-[#07f468] dark:checked:border-[#0aff78] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] dark:checked:after:border-[white] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer"
                labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer mt-1"
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
                text="Proceed Payment"
                variant="checkoutProceedpayment"
                :rightIcon="'https://i.ibb.co.com/NdmC2BjP/arrow-right.webp'"
                :rightIconClass="`w-6 h-6 [filter:brightness(0)_saturate(100%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(67%)_sepia(19%)_saturate(5664%)_hue-rotate(95deg)_brightness(112%)_contrast(94%)]`"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </PopupHandler>
</template>
