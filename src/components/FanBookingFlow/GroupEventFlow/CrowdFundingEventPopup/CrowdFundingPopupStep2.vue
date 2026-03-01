<script setup>
import { ref, computed } from 'vue';
import BookingEventLayout from '../../HelperComponents/BookingEventLayout.vue';
import TopUpForm from '../../HelperComponents/TopUpForm.vue';

const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});

// --- STATE ---
const sliderValue = ref(50);
const walletBalance = ref(2500); 
const minContribution = 500;
const maxContribution = 5500;

// --- SUBSTEP LOGIC ---
const currentSubstep = computed(() => props.engine.substep);
const isTopUpView = computed(() => currentSubstep.value === 'top-up');

// --- COMPUTED ---
const contributionAmount = computed(() => {
  const val = Math.round(minContribution + (sliderValue.value / 100) * (maxContribution - minContribution));
  return Math.ceil(val / 10) * 10;
});

const isTopUpNeeded = computed(() => contributionAmount.value > walletBalance.value);

const topUpAmount = computed(() => isTopUpNeeded.value ? (contributionAmount.value - walletBalance.value) : 0);

const remainingBalance = computed(() => walletBalance.value - contributionAmount.value);

const finalBalanceAfterBooking = computed(() => walletBalance.value + topUpAmount.value - contributionAmount.value);

const progressWidth = computed(() => `${sliderValue.value}%`);
const iconPosition = computed(() => `${sliderValue.value}%`);

// --- HANDLERS ---
const handleButtonClick = () => {
  if (isTopUpNeeded.value) {
    props.engine.goToSubstep('top-up');
  } else {
    console.log("Booking Completed");
    props.engine.goToStep(3);
  }
};

const finalizeTopUpAndBook = () => {
  console.log("Top Up & Booking Completed");
  props.engine.goToStep(3);
};

const goBackToForm = () => {
  props.engine.goToSubstep(null);
};
</script>

<template>
  
  <BookingEventLayout
    :wallet-balance="walletBalance"
    :contribution-amount="contributionAmount"
    :is-top-up-needed="isTopUpNeeded"
    :top-up-amount="topUpAmount"
    :remaining-balance="remainingBalance"
    :is-top-up-view="isTopUpView"
    :is-crowd-funding="true" 
    @back="props.engine.goToStep(1)"
    @close="props.engine.goToStep(1)"
    @btn-click="handleButtonClick"
    @finalize-topup="finalizeTopUpAndBook"
  >
    
    <template #crowd-progress>
       <div class="flex flex-col justify-center items-start gap-1.5 w-full">
            <div class="flex flex-col gap-1.5 w-full">
              <div class="w-full h-2 rounded-[5px] bg-white/20">
                <div class="h-full rounded-[5px] bg-[#FFED29] w-[35%]"></div>
              </div>
            </div>
            <div class="inline-flex w-full justify-between items-start">
              <div class="text-right justify-center text-yellow-300 text-xs font-medium font-['Poppins'] leading-4">1,200/8,000 Tokens </div>
              <div class="text-right justify-center text-white text-xs font-medium font-['Poppins'] leading-4">15% event goal reached</div>
            </div>
          </div>
    </template>

    <template #main-form>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <h4 class="text-white text-sm leading-6 lg:text-base">Your Contribution (500 Tokens Minimum)</h4>
          <div class="flex text-white items-center w-full gap-1">
            <img src="/images/token.svg" alt="token-icon" class="w-8 h-8" />
            <div class="flex justify-between items-center px-1 border-[#98A2B3] border-b w-full">
              <p class="text-3xl leading-9">{{ contributionAmount.toLocaleString() }}</p>
              <p>Tokens</p>
            </div>
          </div>
        </div>

        <div class="relative w-full h-8 flex items-center group">
          <div class="absolute w-full h-2 bg-white rounded-full"></div>
          <div 
            class="absolute h-2 rounded-full pointer-events-none transition-all duration-75"
            :style="{ width: progressWidth, background: 'linear-gradient(90deg, #37ffd7 0%, #07f468 100%)' }"
          ></div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model="sliderValue"
            class="absolute w-full h-2 appearance-none bg-transparent cursor-pointer z-20 accent-transparent outline-none custom-range"
          />
          <div 
            class="absolute z-30 pointer-events-none -translate-x-1/2 transition-all duration-75"
            :style="{ left: iconPosition }"
          >
            <img src="/images/token.svg" alt="">
          </div>
        </div>
      </div>
    </template>

    <template #topup-form>
       <TopUpForm 
         :wallet-balance="walletBalance"
         :top-up-amount="topUpAmount"
         :total-price="contributionAmount"
         :remaining-balance="finalBalanceAfterBooking"
         @back="goBackToForm"
       />
    </template>

  </BookingEventLayout>

</template>