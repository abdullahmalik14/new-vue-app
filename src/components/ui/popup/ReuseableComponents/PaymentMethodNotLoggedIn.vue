<script setup>
import CheckboxGroup from "@/components/checkbox/CheckboxGroup.vue";

// ✅ UPDATE: Props defined for all inputs
const props = defineProps({
  wrapperClass: { type: String, default: "" },
  cardNumber: { type: String, default: "" },
  expiry: { type: String, default: "" },
  cardHolder: { type: String, default: "" },
  cvv: { type: String, default: "" },
  saveCard: { type: Boolean, default: false },
});

// ✅ UPDATE: Emits for v-model binding
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
      class="flex w-full min-h-[12.5rem] aspect-[1.715/1] bg-[#1D1D1D] [background-image:url('https://i.ibb.co.com/jvrYTGkd/card-bg.webp')] bg-cover bg-center border border border-[#EAECF0]/50 dark:border-[#353a3c]/50 rounded-xl"
    >
      <div class="px-4 py-5 flex flex-col justify-between w-full sm:p-6 rounded-xl">
        <div class="flex justify-between items-center gap-[0.625rem]">
          <CheckboxGroup
            label="Save this card for faster checkout."
            :modelValue="saveCard"
            @update:modelValue="(val) => emit('update:saveCard', val)"
            checkboxClass="appearance-none bg-white border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 mr-1 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-black checked:after:border-w-0 checked:after:border-b-2 checked:after:border-r-2 checked:after:rotate-45 checked:after:box-border cursor-pointer"
            labelClass="text-xs sm:text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer mt-1"
            wrapperClass="flex items-center"
          />
          <img src="https://i.ibb.co.com/pr2VM4zR/svgviewer-png-output-32.png" alt="visa" class="h-[1.0625rem]" />
        </div>

        <div class="flex gap-2">
          <div class="flex flex-col w-full gap-2">
            
            <div class="flex w-full gap-4">
              <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem]">
                <label class="text-xs leading-normal sm:text-sm font-medium text-[#f9fafb]">Card Number</label>
                <div class="flex items-center gap-2 border-b border-[#D0D5DD] bg-white/10 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] h-9 sm:h-10 rounded-sm">
                  <input
                    type="text"
                    :value="cardNumber"
                    @input="$emit('update:cardNumber', $event.target.value)"
                    class="w-full max-w-full box-border text-base text-[#f9fafb] rounded-[0.625rem] border-none bg-transparent outline-none py-2 px-3 placeholder:text-base placeholder:text-[#F9FAFB]/50 placeholder:font-sans"
                    placeholder="Card Number"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-[0.125rem] w-full flex-grow sm:gap-[0.375rem] max-w-[10.75rem]">
                <label class="text-xs leading-normal sm:text-sm font-medium text-[#f9fafb]">Expiration Date</label>
                <div class="flex items-center gap-2 border-b border-[#D0D5DD] bg-white/10 px-3 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] h-9 sm:h-10 rounded-sm">
                  <input
                    type="text"
                    :value="expiry"
                    @input="$emit('update:expiry', $event.target.value)"
                    class="w-full max-w-full box-border text-base text-[#f9fafb] rounded-[0.625rem] border-none bg-transparent outline-none py-2 placeholder:text-base placeholder:text-[#F9FAFB]/50 placeholder:font-sans"
                    placeholder="MM/YY"
                  />
                  <img src="https://i.ibb.co.com/BH7tfYPX/calendar.webp" alt="calendar" class="w-4 h-4 cursor-pointer hidden sm:block" />
                </div>
              </div>
            </div>

            <div class="flex w-full gap-4">
              <div class="flex flex-col gap-[0.125rem] w-full flex-1 sm:gap-[0.375rem]">
                <label class="text-xs leading-normal sm:text-sm font-medium text-[#f9fafb]">Cardholder Name</label>
                <div class="flex items-center gap-2 border-b border-[#D0D5DD] bg-white/10 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] h-9 sm:h-10 rounded-sm">
                  <input
                    type="text"
                    :value="cardHolder"
                    @input="$emit('update:cardHolder', $event.target.value)"
                    class="w-full max-w-full box-border text-base text-[#f9fafb] rounded-[0.625rem] border-none bg-transparent outline-none py-2 px-3 placeholder:text-base placeholder:text-[#F9FAFB]/50 placeholder:font-sans"
                    placeholder="Cardholder Name"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-[0.125rem] w-full flex-1 sm:gap-[0.375rem] max-w-[10.75rem]">
                <label class="text-xs leading-normal sm:text-sm font-medium text-[#f9fafb]">CVV</label>
                <div class="flex items-center gap-2 border-b border-[#D0D5DD] bg-white/10 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)] h-9 sm:h-10 rounded-sm">
                  <input
                    type="text"
                    :value="cvv"
                    @input="$emit('update:cvv', $event.target.value)"
                    class="w-full max-w-full box-border text-base text-[#f9fafb] rounded-[0.625rem] border-none bg-transparent outline-none py-2 px-3 placeholder:text-base placeholder:text-[#F9FAFB]/50 placeholder:font-sans"
                    placeholder="CVV"
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