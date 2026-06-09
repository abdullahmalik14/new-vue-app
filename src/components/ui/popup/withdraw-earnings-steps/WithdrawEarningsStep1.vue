<template>

      <!-- main-section -->
      <div class="flex flex-col gap-4 px-2 pt-2 pb-4 min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] z-[2] md:p-4 xl:px-6">
          <!-- header -->
          <div class="flex justify-between items-center">
              <h2 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">WITHDRAW EARNINGS</h2>

              <button @click="$emit('close')" class="flex justify-center items-center w-6 h-6 md:w-10 md:h-10 cursor-pointer hover:opacity-80">
                  <img src="https://i.ibb.co.com/Q3RfM295/close.webp" alt="close" class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(73%)_sepia(11%)_saturate(425%)_hue-rotate(179deg)_brightness(87%)_contrast(89%)]">
              </button>
          </div>

          <!-- back-button -->
          <button class="hidden justify-center items-center gap-1 w-max">
            <img src="https://i.ibb.co.com/tPzh072N/chevron-left.webp" alt="chevron left" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(46%)_sepia(8%)_saturate(955%)_hue-rotate(183deg)_brightness(91%)_contrast(88%)]">
            <span class="text-sm leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]">Back</span>
          </button>

          <!-- form-container -->
          <div class="flex flex-col gap-6 mt-4 md:mt-6">
              <!-- dropdown-section -->
              <div class="flex flex-col gap-4">
                  <h3 class="text-base font-medium text-[#344054] dark:text-[#bdb8af]">Where would you like to send money?</h3>
              
                  <!-- select-dropdown -->
                  <div class="select-dropdown relative flex w-full">
                      <BasePlanDropdown
                        v-model="country"
                        :options="countryOptions"
                        :unstyled="true"
                        widthClass="w-full"
                      >
                        <template #trigger="{ label, isOpen, selectedOption }">
                          <div class="payout-select__trigger w-full h-[3.5rem] flex justify-between items-center gap-2 p-4 border-b-[1.5px] bg-white/75 dark:bg-[#181a1b]/75 transition-colors cursor-pointer"
                               :class="isOpen ? 'border-black dark:border-white' : 'border-[#D0D5DD] dark:border-[#3b4043]'">
                            <div class="flex items-center gap-2">
                              <img src="https://i.ibb.co.com/21zPFPz7/globe.webp" alt="globe" class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(78%)_sepia(17%)_saturate(268%)_hue-rotate(179deg)_brightness(81%)_contrast(86%)]">
                              <span class="text-base flex-grow text-balance" 
                                    :class="selectedOption ? 'text-[#344054] dark:text-[#bdb8af] font-medium' : 'text-[#667085] dark:text-[#9e9589]'">
                                {{ selectedOption ? selectedOption.label : 'Select country' }}
                              </span>
                            </div>
                            <img class="select-arrow h-5 w-5 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(78%)_sepia(17%)_saturate(268%)_hue-rotate(179deg)_brightness(81%)_contrast(86%)]" 
                                 :class="{'rotate-180': isOpen}"
                                 src="https://i.ibb.co.com/jkt6FN7G/chevron-down.webp" alt="chevron down" />
                          </div>
                        </template>

                        <template #options-container="{ options, selectOption, modelValue, isOpen, isUpwards }">
                          <div class="payout-options-container max-md:!fixed max-md:!flex max-md:!flex-col max-md:!justify-end max-md:!inset-0 max-md:!bg-white/60 max-md:!backdrop-blur-[2.5px] max-md:!shadow-[0px_-2px_4px_0px_#0000001A] absolute left-auto right-0 z-[9999] w-full origin-top shadow-[0px_0px_10px_-34px_#0000001A] transition-[opacity,transform] duration-200 ease-out h-auto overflow-auto"
                               :class="[
                                 isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden',
                                 isUpwards ? 'bottom-[calc(100%+1.5px)] top-auto [transform-origin:50%_100%]' : 'top-[calc(100%+1.5px)] [transform-origin:50%_0]'
                               ]"
                               @click.stop
                          >
                            <div class="flex flex-col gap-2 max-md:gap-1 max-md:shadow-[0px_0px_12px_0px_#00000033] bg-white dark:bg-[#181a1b]">
                                <div class="flex items-center gap-2 p-4 border-b border-[#D0D5DD]/50 max-md:py-3 dark:border-[#3b4043]/50">
                                    <img src="https://i.ibb.co.com/TxLHy0g9/Search.webp" alt="Search" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(25%)_sepia(27%)_saturate(547%)_hue-rotate(179deg)_brightness(89%)_contrast(94%)]">
                                    <input type="text" v-model="searchQuery" placeholder="Search country" class="w-full text-base text-[#667085] dark:text-[#9e9589] bg-transparent focus:outline-none">
                                </div>
                                <div class="flex flex-col gap-2 max-md:gap-1 max-md:h-[10.75rem] h-[15.5rem] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">
                                    <div v-for="option in filteredOptions" :key="option.value" 
                                         @click="selectOption(option); searchQuery = ''"
                                         class="option flex items-center justify-center gap-[0.625rem] cursor-pointer group hover:bg-white dark:hover:bg-[#181a1b]"
                                         :class="{'bg-[#F2F4F7] dark:bg-[#222526]': modelValue === option.value}">
                                        <div class="option-inner-container flex items-center flex-1 gap-2 p-4 max-md:py-2">
                                            <span class="text-base font-medium text-[#0C111D] text-balance dark:text-[#dbd8d3]">{{ option.label }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                          </div>
                        </template>
                      </BasePlanDropdown>
                  </div>
              </div>

              <!-- input-section -->
              <div class="flex flex-col gap-4">
                  <h3 class="text-base font-medium text-[#344054] dark:text-[#bdb8af]">Enter the payout amount:</h3>

                  <!-- input-wrapper -->
                  <div class="flex flex-col gap-1">
                      <div class="flex items-center gap-2 p-4 border-b-[1.5px] border-[#D0D5DD] bg-white/75 dark:bg-[#181a1b]/75 dark:border-[#3b4043]">
                          <div class="flex items-center gap-2 w-full">
                              <span class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">USD$</span>
                              <DashboardTextInput
                                  type="text"
                                  placeholder="00.00"
                                  v-model="amountStr"
                                  @input="handleAmountInput"
                                  @blur="formatAmountOnBlur"
                                  wrapperClass="w-full !p-0 !border-none !shadow-none !bg-transparent"
                                  inputClass="text-base placeholder:text-[#98A2B3] text-[#0C111D] bg-transparent focus:outline-none dark:placeholder:text-[#b0a993] dark:text-[#dbd8d3] !p-0 w-full !border-none !shadow-none"
                              />
                          </div>
                      </div>

                      <span v-if="hasInsufficientBalance" class="text-xs leading-normal text-[#FF4405] dark:text-[#ff571e]">Insufficient Balance</span>
                  </div>
              </div>
          </div>
      </div>

      <!-- total-section -->
      <div class="flex flex-col flex-none mt-auto z-[1] min-h-[7.5rem] shadow-[0px_0px_8px_0px_#00000026] relative before:inset-0 before:content-[''] before:absolute before:bg-[url('https://i.ibb.co.com/6Rz2GJd8/payout-popup-gradient.png')] before:bg-cover before:bg-center before:bg-no-repeat before:z-[-1] before:pointer-events-none group/total-section"
           :class="{'proceed-next': canProceed}">
        <div class="flex justify-between items-end flex-grow w-full h-full bg-black/80 dark:bg-[#181a1b]/80">
          <div class="flex items-start h-full px-2 py-4 md:pl-6">
            <!-- available-balance -->
            <div class="flex flex-col gap-1 md:gap-2">
              <h3 class="text-base font-medium text-white dark:text-[#e8e6e3]">Available Balance</h3>
              <span class="text-3xl leading-[2.375rem] font-semibold text-white md:text-4xl md:leading-[2.75rem] md:tracking-[-0.045rem] dark:text-[#e8e6e3]">
                USD${{ formattedAvailableBalance }}
              </span>
            </div>
          </div>

          <button v-if="canProceed" @click="proceedNext" class="flex items-center gap-2 pl-[2.125rem] pr-4 h-11 shadow-[0px_0px_16px_0px_#FFFFFF80] [clip-path:polygon(100%_0%,100%_100%,0%_100%,1.125rem_0%)] bg-black group/button hover:bg-[#07F468] md:pl-[3.64125rem] md:pr-6 md:h-[5.25rem] md:[clip-path:polygon(100%_0%,100%_100%,0%_100%,2.14125rem_0%)] dark:bg-[#181a1b] dark:hover:bg-[#06c454]">
            <span class="text-lg font-semibold text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3]">NEXT</span>
            <img src="https://i.ibb.co.com/pjKMT4nR/arrow-right.webp" alt="arrow right" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(53%)_sepia(97%)_saturate(459%)_hue-rotate(93deg)_brightness(114%)_contrast(94%)] group-hover/button:[filter:brightness(0)_saturate(100%)]">
          </button>
        </div>
      </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BasePlanDropdown from '@/components/plan/parts/BasePlanDropdown.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';

const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

// Computed sync for engine state
const country = computed({
  get: () => props.engine.state.selectedCountry,
  set: (val) => props.engine.setState('selectedCountry', val)
});

const amountStr = computed({
  get: () => props.engine.state.amount,
  set: (val) => props.engine.setState('amount', val)
});

const availableBalance = computed(() => props.engine.state.availableBalance || 30054.40);
const formattedAvailableBalance = computed(() => {
    return availableBalance.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

const searchQuery = ref('');

const countryOptions = [
    { label: 'Australia', value: 'australia' },
    { label: 'China', value: 'china' },
    { label: 'UK', value: 'uk' },
    { label: 'USA', value: 'usa' },
    { label: 'Singapore', value: 'singapore' }
];

const filteredOptions = computed(() => {
    if (!searchQuery.value) return countryOptions;
    const lower = searchQuery.value.toLowerCase();
    return countryOptions.filter(opt => opt.label.toLowerCase().includes(lower));
});

const hasInsufficientBalance = computed(() => {
    const num = parseFloat(amountStr.value);
    return !isNaN(num) && num > availableBalance.value;
});

const canProceed = computed(() => {
    const num = parseFloat(amountStr.value);
    return country.value && !isNaN(num) && num > 0 && num <= availableBalance.value;
});

const handleAmountInput = (e) => {
    // For DashboardTextInput, the emitted value is directly the string when using v-model.
    // However if there's a custom event, we handle both Object and string.
    let value = typeof e === 'object' && e.target ? e.target.value : e;
    
    // Only allow digits and dot
    value = value.replace(/[^\d.]/g, '');
    
    // Handle multiple dots
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Max 2 decimal places
    if (value.includes('.')) {
        const splitVal = value.split('.');
        if (splitVal[1].length > 2) {
            value = splitVal[0] + '.' + splitVal[1].slice(0, 2);
        }
    }
    
    amountStr.value = value;
};

const formatAmountOnBlur = () => {
    if (amountStr.value) {
        let num = parseFloat(amountStr.value);
        if (!isNaN(num)) {
            if (num > availableBalance.value) {
                num = availableBalance.value;
            }
            amountStr.value = num.toFixed(2);
        }
    }
};

const proceedNext = () => {
    console.log("Proceed to next step with:", { country: country.value, amount: amountStr.value });
    props.engine.setState('country', country.value);
    props.engine.setState('amount', amountStr.value);
    props.engine.goToStep(2);
};
</script>
