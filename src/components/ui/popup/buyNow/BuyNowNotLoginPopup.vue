<script setup>
import PopupHandler from "@/components/ui/popup/PopupHandler.vue";
import SectionHeader from "../ReuseableComponents/SectionHeader.vue";
import PaymentMethodNotLoggedIn from "../ReuseableComponents/PaymentMethodNotLoggedIn.vue";
import CheckoutNotes from "../ReuseableComponents/CheckoutNotes.vue";
import ButtonComponent from "@/components/button/ButtonComponent.vue";
import CheckboxGroup from "@/components/checkbox/CheckboxGroup.vue";
import CheckoutMediaPreview from "../ReuseableComponents/CheckoutMediaPreview.vue";
import BaseInput from "@/components/input/BaseInput.vue";
import SubscriptionPlanCard from "../ReuseableComponents/SubscriptionPlanCard.vue";
import TotalAmountRow from "../ReuseableComponents/TotalAmountRow.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const buyNowNotLoginConfig = {
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
</script>

<template>
  <PopupHandler
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :config="buyNowNotLoginConfig"
  >
    <div
      class="bg-[#272727] font-sans p-0 m-0 box-border overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]"
    >
      <!-- popup-wrapper -->
      <div
        class="flex flex-col h-screen bg-white/10 backdrop-blur-[100px] drop-shadow-[0_4px_6px_-2px_#10182808,0_12px_16px_-4px_#10182814] relative md:flex-row overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:overflow-y-[unset]"
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
          class="flex flex-col gap-6 px-2 pt-4 pb-6 md:overflow-y-auto [scrollbar-width:none] 
          [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-4 sm:py-6 md:w-1/2 md:h-screen
           md:bg-black/50 dark:bg-background-dark-app"
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

            <div class="flex flex-col gap-6">
              <!-- subscription-section -->
              <div class="flex flex-col gap-4 sm:hidden">
                <!-- title-container -->

                <!-- section-title -->
                <div class="flex items-center gap-2">
                  <div class="flex justify-center items-center w-5 h-5">
                    <img
                      src="https://i.ibb.co.com/gZsWNR4Q/our-website-full-white-logo.webp"
                      alt="logo"
                      class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(98%)_sepia(1%)_saturate(934%)_hue-rotate(29deg)_brightness(120%)_contrast(100%)]"
                    />
                  </div>
                  <h3
                    class="text-base font-semibold text-[#F9FAFB] align-middle"
                  >
                    SUBSCRIPTION
                  </h3>
                </div>

                <!-- new-subscription-wrapper -->
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-2">
                    <h4
                      class="text-xs leading-normal font-medium text-[#98A2B3]"
                    >
                      New Subscribtion
                    </h4>

                    <!-- subscription-container -->
                    <SubscriptionPlanCard
                      title="FEATURED library of LOREM IPSUM dolor sit amet."
                      price="USD$499.99"
                      backgroundImage="https://i.ibb.co.com/70sHrpv/featured-media-bg.webp"
                      accentColor="#FFCC01"
                      footerText="Your membership will update in your next billing cycle (xx-xx-xxxx)"
                    />
                  </div>
                </div>
              </div>

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
              <CheckoutNotes />
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
