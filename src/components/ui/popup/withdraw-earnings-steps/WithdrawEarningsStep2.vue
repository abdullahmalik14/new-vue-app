<template>
      <!-- progress-bar -->
      <div class="overflow-hidden w-full h-2 bg-[#EAECF0] dark:bg-[#222526] z-[1]">
        <div class="w-[40%] h-full bg-[#0c111d] dark:bg-[#0a0e17] transition-all duration-300"></div>
      </div>

      <!-- main-section -->
      <div class="flex flex-col gap-4 px-2 pt-2 pb-4 min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] z-[2] md:p-4 xl:px-6">
          <!-- header -->
          <div class="flex justify-between items-center">
              <h2 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">WITHDRAW EARNINGS</h2>

              <button @click="$emit('close')" class="flex justify-center items-center w-6 h-6 md:w-10 md:h-10">
                  <img src="https://i.ibb.co.com/Q3RfM295/close.webp" alt="close" class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(73%)_sepia(11%)_saturate(425%)_hue-rotate(179deg)_brightness(87%)_contrast(89%)]">
              </button>
          </div>

          <!-- back-button -->
          <button @click="goBack" class="flex justify-center items-center gap-1 w-max hover:opacity-80 transition-opacity">
            <img src="https://i.ibb.co.com/tPzh072N/chevron-left.webp" alt="chevron left" class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(46%)_sepia(8%)_saturate(955%)_hue-rotate(183deg)_brightness(91%)_contrast(88%)]">
            <span class="text-xs leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]">Back</span>
          </button>

          <h3 class="text-lg font-medium text-[#0C111D] dark:text-[#dbd8d3]">Payout options in your chosen country:</h3>

          <!-- options-container -->
          <div class="flex flex-col gap-2">
            <div v-for="option in payoutOptions" :key="option.id" 
                 @click="selectOption(option.id)"
                 :class="['flex flex-col gap-2 p-4 rounded-sm backdrop-blur-[5px] border-[1.5px] group/option cursor-pointer transition-colors', selectedOption === option.id ? 'bg-black/90 border-white dark:bg-[#181a1b]/90 dark:border-[#303436] option-selected' : 'border-[#D0D5DD] bg-white/50 dark:border-[#3b4043] dark:bg-[#181a1b]/50 hover:bg-white dark:hover:bg-[#181a1b]']">
              
              <!-- option__top -->
              <div class="flex justify-between items-center gap-2">
                <span :class="['text-lg font-medium text-[#182230] dark:text-[#d1cdc7]', selectedOption === option.id ? 'text-[#FCFCFD] dark:text-[#e6e4e1]' : 'group-hover/option:text-black dark:group-hover/option:text-white']">{{ option.title }}</span>
                <div class="flex items-center gap-1 flex-wrap px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]">
                  <div class="w-4 h-4">
                    <img :src="option.icon" :alt="option.type" class="w-full h-full [filter:_brightness(0)_saturate(100%)]"/>
                  </div>
                  <span class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">{{ option.type }}</span>
                </div>
              </div>

              <!-- option__bottom -->
              <div class="flex justify-between items-center gap-2">
                <span :class="['text-sm text-[#182230] dark:text-[#d1cdc7]', selectedOption === option.id ? 'text-[#FCFCFD] dark:text-[#e6e4e1]' : '']">Pays in <span :class="['text-sm font-medium text-[#182230] dark:text-[#d1cdc7]', selectedOption === option.id ? 'text-[#FCFCFD] dark:text-[#e6e4e1]' : '']">{{ option.currency }}</span></span>
                <span :class="['text-sm text-[#182230] dark:text-[#d1cdc7]', selectedOption === option.id ? 'text-[#FCFCFD] dark:text-[#e6e4e1]' : '']">{{ option.fee }}</span>
              </div>
            </div>
          </div>
      </div>

      <!-- total-section -->
      <div class="flex flex-col flex-none mt-auto z-[1] min-h-[7.5rem] shadow-[0px_0px_8px_0px_#00000026] relative before:inset-0 before:content-[''] before:absolute before:bg-[url('https://i.ibb.co.com/6Rz2GJd8/payout-popup-gradient.png')] before:bg-cover before:bg-center before:bg-no-repeat before:z-[-1] before:pointer-events-none group/total-section"
           :class="{'proceed-next': canProceed}">
        <div class="flex justify-between items-end flex-grow w-full h-full transition-colors duration-300"
             :class="[canProceed ? 'bg-white/50 dark:bg-[#181a1b]/50' : 'bg-black/80 dark:bg-[#181a1b]/80']">
          
          <div class="flex items-start h-full px-2 py-4 md:pl-6">
            <!-- available-balance -->
            <div v-if="!canProceed" class="flex flex-col gap-1 md:gap-2">
              <h3 class="text-base font-medium text-white dark:text-[#e8e6e3]">Available Balance</h3>
              <span class="text-3xl leading-[2.375rem] font-semibold text-white md:text-4xl md:leading-[2.75rem] md:tracking-[-0.045rem] dark:text-[#e8e6e3]">USD${{ props.engine.state.availableBalance?.toFixed(2) || '30054.40' }}</span>
            </div>

            <!-- payout-summary -->
            <div v-else class="flex flex-col gap-1 md:gap-2">
              <h3 class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">YOUR FINAL PAYOUT <span class="hidden xl:inline">INCLUSIVE</span></h3>
              <!-- Hardcoded EUR€114.48 for visual parity with design, can be dynamic later -->
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

const payoutOptions = ref([
  {
    id: 1,
    title: 'Bank Deposit',
    type: 'Bank',
    icon: 'https://i.ibb.co.com/hJStBf17/bank.webp',
    currency: 'EUR',
    fee: 'USD$3.45 fee'
  },
  {
    id: 2,
    title: 'Bank Deposit',
    type: 'Bank',
    icon: 'https://i.ibb.co.com/hJStBf17/bank.webp',
    currency: 'USD',
    fee: 'USD$3.45 fee'
  },
  {
    id: 3,
    title: 'Bank Wire',
    type: 'Bank',
    icon: 'https://i.ibb.co.com/hJStBf17/bank.webp',
    currency: 'USD',
    fee: 'USD$3.45 fee'
  },
  {
    id: 4,
    title: 'Bank Wire',
    type: 'Bank',
    icon: 'https://i.ibb.co.com/hJStBf17/bank.webp',
    currency: 'CZK',
    fee: 'USD$3.45 fee'
  },
  {
    id: 5,
    title: 'USDT - Ethereum(ERC20)',
    type: 'Crypto',
    icon: 'https://i.ibb.co.com/qFdZMDc2/crypto.webp',
    currency: 'USDT',
    fee: 'USD$3.45 fee'
  }
]);

const selectedOption = ref(props.engine.state.payoutOptionId || null);

function selectOption(id) {
  selectedOption.value = id;
  const option = payoutOptions.value.find(o => o.id === id);
  props.engine.setState('payoutOptionId', id);
  props.engine.setState('payoutOption', option);
}

const canProceed = computed(() => selectedOption.value !== null);

function goBack() {
  props.engine.goToStep(props.engine.step - 1);
}

function proceedNext() {
  if (canProceed.value) {
    console.log('Proceed to next step with option ID:', selectedOption.value);
    props.engine.goToStep(3);
  }
}
</script>
