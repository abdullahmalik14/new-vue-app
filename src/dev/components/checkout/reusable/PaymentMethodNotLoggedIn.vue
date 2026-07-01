<script setup>
import CheckboxGroup from "@/components/forms/checkboxes/CheckboxGroup.vue";
import { CHECKOUT_SAVE_CARD_CLASS } from "@/dev/composables/checkboxGroupDemoClasses.js";
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { assets } = useCheckoutDemoAssets();

const props = defineProps({
  wrapperClass: { type: String, default: "" },
  cardNumber: { type: String, default: "" },
  expiry: { type: String, default: "" },
  cardHolder: { type: String, default: "" },
  cvv: { type: String, default: "" },
  saveCard: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:cardNumber",
  "update:expiry",
  "update:cardHolder",
  "update:cvv",
  "update:saveCard",
]);
</script>

<template>
  <div>
    <div
      :class="wrapperClass"
      class="flex w-full min-h-[12.5rem] aspect-[1.715/1] bg-[#1D1D1D] bg-cover bg-center border border border-[#EAECF0]/50 dark:border-[#353a3c]/50 rounded-xl"
      :style="{ backgroundImage: `url(${assets.cardBg})` }"
    >
      <div class="px-4 py-5 flex flex-col justify-between w-full sm:p-6 rounded-xl">
        <div class="flex justify-between items-center gap-[0.625rem]">
          <CheckboxGroup
            :label="t('demo.checkoutReusable.paymentNotLoggedIn.saveCard')"
            :modelValue="saveCard"
            @update:modelValue="(val) => emit('update:saveCard', val)"
            :checkboxClass="`${CHECKOUT_SAVE_CARD_CLASS} mr-1`"
            labelClass="text-xs sm:text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer mt-1"
            wrapperClass="flex items-center"
          />
          <img :src="assets.visaLogo" alt="visa" class="h-[1.0625rem]" />
        </div>

        <div class="flex gap-2">
          <div class="flex flex-col w-full gap-2">
            
            <div class="flex w-full gap-4">
              <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem]">
                <label class="text-xs leading-normal sm:text-sm font-medium text-[#f9fafb]">{{ t('demo.checkoutReusable.paymentNotLoggedIn.cardNumber') }}</label>
                <div class="flex items-center gap-2 border-b border-[#D0D5DD] bg-white/10 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] h-9 sm:h-10 rounded-sm">
                  <input
                    type="text"
                    :value="cardNumber"
                    @input="$emit('update:cardNumber', $event.target.value)"
                    class="w-full max-w-full box-border text-base text-[#f9fafb] rounded-[0.625rem] border-none bg-transparent outline-none py-2 px-3 placeholder:text-base placeholder:text-[#F9FAFB]/50 placeholder:font-sans"
                    :placeholder="t('demo.checkoutReusable.paymentNotLoggedIn.cardNumber')"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] max-w-[10.75rem]">
                <label class="text-xs leading-normal sm:text-sm font-medium text-[#f9fafb]">{{ t('demo.checkoutReusable.paymentNotLoggedIn.expirationDate') }}</label>
                <div class="flex items-center gap-2 border-b border-[#D0D5DD] bg-white/10 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] h-9 sm:h-10 rounded-sm">
                  <input
                    type="text"
                    :value="expiry"
                    @input="$emit('update:expiry', $event.target.value)"
                    class="w-full max-w-full box-border text-base text-[#f9fafb] rounded-[0.625rem] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#F9FAFB]/50 placeholder:font-sans"
                    :placeholder="t('demo.checkoutReusable.paymentLoggedIn.expiryPlaceholder')"
                  />
                  <img :src="assets.calendarIcon" alt="calendar" class="w-4 h-4 cursor-pointer hidden sm:block" />
                </div>
              </div>
            </div>

            <div class="flex w-full gap-4">
              <div class="flex flex-col gap-[0.125rem] w-full flex-1 sm:gap-[0.375rem]">
                <label class="text-xs leading-normal sm:text-sm font-medium text-[#f9fafb]">{{ t('demo.checkoutReusable.paymentNotLoggedIn.cardholderName') }}</label>
                <div class="flex items-center gap-2 border-b border-[#D0D5DD] bg-white/10 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] h-9 sm:h-10 rounded-sm">
                  <input
                    type="text"
                    :value="cardHolder"
                    @input="$emit('update:cardHolder', $event.target.value)"
                    class="w-full max-w-full box-border text-base text-[#f9fafb] rounded-[0.625rem] border-none bg-transparent outline-none py-2 px-3 placeholder:text-base placeholder:text-[#F9FAFB]/50 placeholder:font-sans"
                    :placeholder="t('demo.checkoutReusable.paymentNotLoggedIn.cardholderName')"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-[0.125rem] w-full flex-1 sm:gap-[0.375rem] max-w-[10.75rem]">
                <label class="text-xs leading-normal sm:text-sm font-medium text-[#f9fafb]">{{ t('demo.checkoutReusable.paymentNotLoggedIn.cvv') }}</label>
                <div class="flex items-center gap-2 border-b border-[#D0D5DD] bg-white/10 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] h-9 sm:h-10 rounded-sm">
                  <input
                    type="text"
                    :value="cvv"
                    @input="$emit('update:cvv', $event.target.value)"
                    class="w-full max-w-full box-border text-base text-[#f9fafb] rounded-[0.625rem] border-none bg-transparent outline-none py-2 px-3 placeholder:text-base placeholder:text-[#F9FAFB]/50 placeholder:font-sans"
                    :placeholder="t('demo.checkoutReusable.paymentNotLoggedIn.cvv')"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
