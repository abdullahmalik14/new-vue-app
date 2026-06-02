<template>
    <!-- progress-bar -->
    <div class="overflow-hidden w-full h-2 bg-[#EAECF0] dark:bg-[#222526] z-[1]">
      <div class="w-[92%] h-full bg-[#0c111d] dark:bg-[#0a0e17] transition-all duration-300"></div>
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

        <h3 class="text-lg font-medium text-[#0C111D] dark:text-[#dbd8d3]">Summary</h3>
        
        <div class="flex flex-col gap-4">
            <h3 class="text-base text-[#0C111D] dark:text-[#dbd8d3]">Please confirm that the information below is correct:</h3>

            <!-- table-container -->
            <div class="grid grid-cols-[80px_1fr] gap-x-2 gap-y-4 sm:grid-cols-[150px_1fr] md:gap-x-4">
                <!-- row -->
                <span class="text-sm text-[#344054] dark:text-[#bdb8af]">Country</span>
                <span class="text-base font-medium text-black dark:text-[#e8e6e3]">{{ country }}</span>

                <!-- row -->
                <span class="text-sm text-[#344054] dark:text-[#bdb8af]">Payout Method</span>
                <div class="flex flex-col gap-2">
                    <span class="text-base font-medium text-black dark:text-[#e8e6e3]">{{ methodTitle }}</span>
                    <span class="text-sm text-[#182230] dark:text-[#d1cdc7]">{{ fee }}</span>
                </div>
                
                <!-- row -->
                <span class="text-sm text-[#344054] dark:text-[#bdb8af]">Payout Details</span>
                <div class="flex flex-col gap-2">
                    <span class="text-base font-medium text-black dark:text-[#e8e6e3]">Bank name bank bank bank name</span>
                    <span class="text-base font-medium text-black dark:text-[#e8e6e3]">C**** J** H** </span>
                    <span class="text-sm text-[#182230] dark:text-[#d1cdc7]">Account number ending {{ accountEnding }}</span>
                </div>

                <!-- row -->
                <span class="text-sm text-[#344054] dark:text-[#bdb8af]">Withdraw Amount</span>
                <div class="flex flex-col gap-2">
                    <span class="text-base font-medium text-black dark:text-[#e8e6e3]">USD${{ withdrawAmount }}</span>
                    <div class="flex flex-col gap-2 h-[1.125rem]"></div>
                </div>
                
                <!-- row -->
                <span class="hidden lg:inline text-sm text-[#344054] dark:text-[#bdb8af]">Latest Balance</span>
                <div class="hidden lg:flex flex-col gap-2">
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between items-center gap-2">
                            <span class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3]">Available Balance</span>
                            <span class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3]">USD${{ availableBalance.toFixed(2) }}</span>
                        </div>

                        <div class="flex justify-between items-center gap-2">
                            <span class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]">Payout Amount</span>
                            <span class="text-base text-[#0C111D] dark:text-[#dbd8d3]">-USD${{ payoutAmount.toFixed(2) }}</span>
                        </div>

                        <hr class="border-t border-black dark:border-[#363b3d]">

                        <div class="flex justify-between items-center gap-2">
                            <span class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]">Latest Balance</span>
                            <span class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3]">USD${{ latestBalance }}</span>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 h-[1.125rem]"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- total-section -->
    <div data-total-section class="flex flex-col flex-none mt-auto z-[1] min-h-[7.5rem] shadow-[0px_0px_8px_0px_#00000026] relative before:inset-0 before:content-[''] before:absolute before:bg-[url('https://i.ibb.co.com/6Rz2GJd8/payout-popup-gradient.png')] before:bg-cover before:bg-center before:bg-no-repeat before:z-[-1] before:pointer-events-none group/total-section">
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

        <button @click="submit" class="flex items-center gap-2 pl-[2.125rem] pr-4 h-11 shadow-[0px_0px_16px_0px_#FFFFFF80] [clip-path:polygon(100%_0%,100%_100%,0%_100%,1.125rem_0%)] bg-[#07F468] group/button hover:bg-black md:pl-[3.64125rem] md:pr-6 md:h-[5.25rem] md:[clip-path:polygon(100%_0%,100%_100%,0%_100%,2.14125rem_0%)] dark:bg-[#06c454] dark:hover:bg-[#181a1b] transition-colors duration-200">
          <span class="text-lg font-semibold text-black group-hover/button:text-[#07F468] dark:text-[#e8e6e3] dark:group-hover/button:text-[#23f97b]">SUBMIT</span>
          <img src="https://i.ibb.co.com/pjKMT4nR/arrow-right.webp" alt="arrow right" class="w-6 h-6 [filter:brightness(0)_saturate(100%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(53%)_sepia(97%)_saturate(459%)_hue-rotate(93deg)_brightness(114%)_contrast(94%)]">
        </button>
      </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const country = computed(() => props.engine.state.country || 'USA');
const payoutOption = computed(() => props.engine.state.payoutOption || {});
const methodTitle = computed(() => payoutOption.value.title ? `${payoutOption.value.title} - ${payoutOption.value.currency}` : 'Bank Deposit - EUR');
const fee = computed(() => payoutOption.value.fee || 'USD$3.45 fee');

const swiftCode = computed(() => props.engine.state.swiftCode || '123456789012');
const accountNumber = computed(() => props.engine.state.accountNumber || '123');
const accountEnding = computed(() => {
    const acc = accountNumber.value;
    return acc.length > 3 ? acc.slice(-3) : acc;
});
const withdrawAmount = computed(() => props.engine.state.amount || '120.00');

const availableBalance = computed(() => props.engine.state.availableBalance || 30054.40);
const payoutAmount = computed(() => parseFloat(withdrawAmount.value) || 0);
const latestBalance = computed(() => (availableBalance.value - payoutAmount.value).toFixed(2));

function goBack() {
  props.engine.goToStep(props.engine.step - 1);
}

function submit() {
  console.log('Final Submit with state:', props.engine.state);
  props.engine.goToStep(5);
}
</script>
