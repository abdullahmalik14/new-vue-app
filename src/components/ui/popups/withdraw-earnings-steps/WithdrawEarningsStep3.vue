<template>
      <!-- progress-bar -->
      <div class="overflow-hidden w-full h-2 bg-[#EAECF0] dark:bg-[#222526] z-[1]">
        <div class="w-[74.656%] h-full bg-[#0c111d] dark:bg-[#0a0e17] transition-all duration-300"></div>
      </div>

      <!-- alert-container -->
      <div v-if="showAlert" class="w-full border-b-[0.5px] border-[#EAECF0] relative dark:border-[#222526]">
          <div class="w-[3px] block bg-[#FF4405] dark:bg-[#c93300]"></div>
          <div class="flex gap-4 px-4 py-3.5 flex-1 min-w-0 min-h-0 shadow-[0px_0px_8px_0px_#FF44051A] [background:linear-gradient(0deg,rgba(255,255,255,0.9),rgba(255,255,255))] before:absolute before:content-[''] before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-[rgba(255,68,5,0.1)] before:to-[rgba(255,255,255,0.9)] relative">
              <div class="relative w-full flex items-center gap-2.5">
                  <img src="https://i.ibb.co.com/chj0VK84/alert-orange-full.webp" alt="alert orange full" class="w-6 min-w-[1.5rem] shrink-0 [filter:brightness(0)_saturate(100%)_invert(41%)_sepia(57%)_saturate(6607%)_hue-rotate(358deg)_brightness(101%)_contrast(100%)]">

                  <div class="flex flex-col w-full flex-1">
                      <div class="flex justify-between items-start gap-1">
                          <div class="flex flex-col gap-2">
                              <h3 class="text-sm font-semibold text-[#FF4405] dark:text-[#ff571e]">Something isn’t right with the information you provided, please double check.</h3>
                          </div>

                          <!-- close-button -->
                          <button @click="closeAlert" class="flex justify-center items-center w-6 h-6 hover:opacity-80">
                              <img src="https://i.ibb.co.com/DfT6Sg5g/x-close.webp" alt="x close" class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(92%)_sepia(8%)_saturate(217%)_hue-rotate(178deg)_brightness(97%)_contrast(82%)]">
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>

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
          <button @click="goBack" class="flex justify-center items-center gap-1 w-max cursor-pointer hover:opacity-80 transition-opacity">
            <img src="https://i.ibb.co.com/tPzh072N/chevron-left.webp" alt="chevron left" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(46%)_sepia(8%)_saturate(955%)_hue-rotate(183deg)_brightness(91%)_contrast(88%)]">
            <span class="text-xs leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]">Back</span>
          </button>

          <h3 class="text-lg font-medium text-[#0C111D] dark:text-[#dbd8d3]">Payout Details</h3>

          <!-- form-container -->
          <div class="flex flex-col gap-6">
              <!-- input-section -->
              <div class="flex flex-col gap-4">
                  <h3 class="xl:hidden text-base text-[#0C111D] dark:text-[#dbd8d3]">Enter the necessary information for this transaction:</h3>
                  <h3 class="hidden xl:inline text-base text-[#0C111D] dark:text-[#dbd8d3]">Please provide the following information for your transaction:</h3>

                  <!-- input-wrapper -->
                  <div class="flex flex-col gap-4">
                      <div :class="['flex flex-col gap-1.5 group/input-container', { 'input-error': swiftError }]">
                          <label for="" class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Bank Swift/BIC Code</label>
                      
                          <!-- input-field -->
                          <div class="flex items-center gap-2 px-3 py-2 shadow-[0px_1px_2px_0px_#1018280D] rounded-t-sm border-b border-[#D0D5DD] bg-white/50 dark:bg-[#181a1b]/50 dark:border-[#3b4043]">
                              <div class="flex items-center gap-2 w-full">
                                  <input type="text" v-model="swiftCode" @input="clearErrors" placeholder="Enter BIC/SWIFT code" class="text-base placeholder:text-[#667085] text-[#101828] bg-transparent focus:outline-none flex-grow dark:placeholder:text-[#9e9589] dark:text-[#d6d3cd]">
                              
                                  <div class="relative inline-flex overflow-hidden w-4 h-4 cursor-pointer group hover:overflow-visible">
                                      <!-- Icon -->
                                      <img src="https://i.ibb.co.com/Hp1tznKk/help-circle.webp" alt="help circle" class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(65%)_sepia(19%)_saturate(239%)_hue-rotate(179deg)_brightness(96%)_contrast(90%)]">
                                      <!-- Tooltip -->
                                      <div class="absolute z-[2] flex flex-col items-start text-center min-w-[18.75rem] md:w-max
                                          opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto
                                          text-xs leading-normal font-medium text-white py-2 px-3 rounded-lg
                                          bg-[#101828] dark:bg-[rgba(14,19,32,1)] dark:text-[#e8e6e3] [box-shadow:0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] [backdrop-filter:blur(25px)]
                                          -right-2 bottom-full -translate-y-2
                                          before:content-[''] before:absolute before:w-0 before:h-0 before:right-2.5 before:bottom-[-5px] before:border-[6px] before:border-b-0 before:border-l-transparent before:border-r-transparent before:border-t-[rgba(16,24,40)]"
                                      >
                                          <p class="text-xs leading-normal font-semibold text-white dark:text-[#e8e6e3]">Enter Bank Swift/BIC Code</p>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <!-- error-text -->
                          <span class="hidden group-[.input-error]/input-container:inline text-sm text-[#FF4405] dark:text-[#ff571e]">Invalid Format</span>
                      </div>
                  </div>

                  <!-- input-wrapper -->
                  <div class="flex flex-col gap-4">
                      <div :class="['flex flex-col gap-1.5 group/input-container', { 'input-error': accountError }]">
                          <label for="" class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">Bank Account Number or IBAN</label>
                      
                          <!-- input-field -->
                          <div class="flex items-center gap-2 px-3 py-2 shadow-[0px_1px_2px_0px_#1018280D] rounded-t-sm border-b border-[#D0D5DD] bg-white/50 dark:bg-[#181a1b]/50 dark:border-[#3b4043]">
                              <div class="flex items-center gap-2 w-full">
                                  <input type="text" v-model="accountNumber" @input="clearErrors" placeholder="Enter Bank Account Number or IBAN" class="text-base placeholder:text-[#667085] text-[#101828] bg-transparent focus:outline-none flex-grow dark:placeholder:text-[#9e9589] dark:text-[#d6d3cd]">
                              </div>
                          </div>

                          <span class="xl:hidden group-[.input-error]/input-container:!hidden text-sm text-[#475467] dark:text-[#b1aaa0]">If you're unsure whether an intermediary bank is required for your international transfer, please contact your bank for further information.</span>
                          <span class="hidden xl:inline group-[.input-error]/input-container:!hidden text-sm text-[#475467] dark:text-[#b1aaa0]">If you are not sure if you need an intermediary Bank for international transfer, please contact your bank for future information.</span>
                          
                          <!-- error-text -->
                          <span class="hidden group-[.input-error]/input-container:inline text-sm text-[#FF4405] dark:text-[#ff571e]">Invalid Format</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- total-section -->
      <div class="flex flex-col flex-none mt-auto z-[1] min-h-[7.5rem] shadow-[0px_0px_8px_0px_#00000026] relative before:inset-0 before:content-[''] before:absolute before:bg-[url('https://i.ibb.co.com/6Rz2GJd8/payout-popup-gradient.png')] before:bg-cover before:bg-center before:bg-no-repeat before:z-[-1] before:pointer-events-none group/total-section"
           :class="{'proceed-next': canProceed}">
        <div class="flex justify-between items-end flex-grow w-full h-full bg-white/50 dark:bg-[#181a1b]/80">
          
          <div class="flex items-start h-full px-2 py-4 md:pl-6">
            <!-- payout-summary -->
            <div class="flex flex-col gap-1 md:gap-2">
              <h3 class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">YOUR FINAL PAYOUT <span class="hidden xl:inline">INCLUSIVE</span></h3>
              <span class="text-3xl leading-[2.375rem] font-semibold text-[#0C111D] md:text-4xl md:leading-[2.75rem] md:tracking-[-0.045rem] dark:text-[#dbd8d3]">EUR€114.48</span>
              <span class="xl:hidden text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">Service Charge USD$3.45</span>
              <span class="hidden xl:inline text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">USD$38 Transfer Fee</span>
            </div>
          </div>

          <button v-if="canProceed" @click="proceedNext" class="flex items-center gap-2 pl-[2.125rem] pr-4 h-11 shadow-[0px_0px_16px_0px_#FFFFFF80] [clip-path:polygon(100%_0%,100%_100%,0%_100%,1.125rem_0%)] bg-black group/button hover:bg-[#07F468] md:pl-[3.64125rem] md:pr-6 md:h-[5.25rem] md:[clip-path:polygon(100%_0%,100%_100%,0%_100%,2.14125rem_0%)] dark:bg-[#181a1b] dark:hover:bg-[#06c454] transition-colors duration-200">
            <span class="text-lg font-semibold text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3]">NEXT</span>
            <img src="https://i.ibb.co.com/pjKMT4nR/arrow-right.webp" alt="arrow right" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(53%)_sepia(97%)_saturate(459%)_hue-rotate(93deg)_brightness(114%)_contrast(94%)] group-hover/button:[filter:brightness(0)_saturate(100%)]">
          </button>
        </div>
      </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { ref, computed } from 'vue';

const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const swiftCode = ref(props.engine.state.swiftCode || '');
const accountNumber = ref(props.engine.state.accountNumber || '');

const swiftError = ref(false);
const accountError = ref(false);
const showAlert = ref(false);

const swiftRegex = /^[A-Z0-9]{8,11}$/i;
const ibanRegex = /^[A-Z0-9]{10,34}$/i;

const canProceed = computed(() => {
    return swiftCode.value.trim().length > 0 && accountNumber.value.trim().length > 0;
});

function closeAlert() {
    showAlert.value = false;
}

function clearErrors() {
    swiftError.value = false;
    accountError.value = false;
    showAlert.value = false;
}

function goBack() {
  props.engine.goToStep(props.engine.step - 1);
}

function validateInputs() {
    let isValid = true;
    swiftError.value = false;
    accountError.value = false;
    showAlert.value = false;

    const swiftVal = swiftCode.value.trim();
    const accountVal = accountNumber.value.trim();

    if (!swiftRegex.test(swiftVal)) {
        swiftError.value = true;
        isValid = false;
    }

    if (!ibanRegex.test(accountVal)) {
        accountError.value = true;
        isValid = false;
    }

    if (!isValid) {
        showAlert.value = true;
    }

    return isValid;
}

function proceedNext() {
  if (validateInputs()) {
    props.engine.setState('swiftCode', swiftCode.value.trim());
    props.engine.setState('accountNumber', accountNumber.value.trim());
    console.log('Proceed to step 4');
    props.engine.goToStep(4);
  }
}
</script>
