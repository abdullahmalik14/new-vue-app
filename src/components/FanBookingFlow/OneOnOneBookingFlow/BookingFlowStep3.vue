<script setup>
import OneOnOneBookingFlowHeader from '../HelperComponents/OneOnOneBookingFlowHeader.vue'; 
import { computed, ref, onMounted } from 'vue';
import TopUpForm from '../HelperComponents/TopUpForm.vue';

const props = defineProps({
  engine: {
    type: Object,
    required: true
  }
});

// --- RETRIEVE DATA FROM ENGINE ---
const bookingData = computed(() => {
  return props.engine.getState('bookingDetails') || {};
});

// --- SUBSTEP LOGIC (Managed by Engine) ---
const currentSubstep = computed(() => props.engine.substep);
const isTopUpView = computed(() => currentSubstep.value === 'top-up');

// --- WALLET BALANCE (Sync with Engine if exists, else default) ---
const walletBalance = ref(bookingData.value.walletBalance || 1000); 

// --- COMPUTED VALUES (Derived from Engine State) ---
const sessionDuration = computed(() => bookingData.value.selectedDuration?.value || 0);
const sessionCost = computed(() => bookingData.value.selectedDuration?.price || 0);
const selectedAddons = computed(() => bookingData.value.addons || []);
const totalPrice = computed(() => bookingData.value.totalPrice || 0);

const formattedTime = computed(() => bookingData.value.formattedTimeRange || '-');
const headerDateDisplay = computed(() => bookingData.value.headerDateDisplay || '-');
const selectedDateDisplay = computed(() => bookingData.value.selectedDateDisplay || '-');

// --- TOP UP LOGIC ---
const isTopUpNeeded = computed(() => {
  return totalPrice.value > walletBalance.value;
});

const topUpAmount = computed(() => {
  return isTopUpNeeded.value ? (totalPrice.value - walletBalance.value) : 0;
});

const remainingBalance = computed(() => {
  return walletBalance.value - totalPrice.value;
});

// --- SHARED FUNCTION TO SAVE DATA & GO TO STEP 4 ---
const finalizeBooking = () => {
  const currentData = props.engine.getState('bookingDetails') || {};
  
  const finalBookingData = {
    ...currentData,
    formattedTimeRange: formattedTime.value,
    selectedDateDisplay: selectedDateDisplay.value,
    headerDateDisplay: headerDateDisplay.value,
    finalTotalPrice: totalPrice.value,
    walletBalance: walletBalance.value, // Persistent balance
    isTopUpDone: isTopUpNeeded.value 
  };

  // Save Final State
  props.engine.setState('bookingDetails', finalBookingData);

  // Navigate to Step 4
  props.engine.goToStep(4);
};

// --- BUTTON HANDLERS ---
const handleButtonClick = () => {
  if (isTopUpNeeded.value) {
    props.engine.goToSubstep('top-up');
  } else {
    finalizeBooking();
  }
};

const goBackToSummary = () => {
  props.engine.goToSubstep(null);
};

// Calculated Prop needed for component
const finalBalanceAfterBooking = computed(() => {
  return walletBalance.value + topUpAmount.value - totalPrice.value;
});

</script>

<template>
    <div
      class="rounded-[20px] h-[556px] max-h-full lg:w-[852px] overflow-hidden"
      style="
        background-image: url('/images/background.png');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: left 50% center;
      "
    >
      <div class="backdrop-blur-[10px] h-full rounded-[20px] bg-[#0C111D96]">
        
        <div class="rounded-b-[20px] h-full rounded-t-[20px] flex flex-col bg-black/50">
          
            <OneOnOneBookingFlowHeader 
              :time-display="formattedTime"
              :date-display="headerDateDisplay"
              :subtotal="totalPrice"
              :duration="sessionDuration"
            />

          <div class="flex-1 flex w-full lg:flex-row h-full flex-col justify-between min-h-0 overflow-y-auto lg:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">

            <div class="flex-1 flex-col w-full p-4 lg:overflow-hidden">
              <div class="flex flex-col gap-3">
                <h3 class="text-sm text-[#22CCEE] leading-[20px]">BOOKING POLICY</h3>
                <ul class="text-sm text-[#EAECF0] list-disc list-outside pl-6">
                  <li>A booking fee of 100 tokens will be on hold in your balance until the call starts.</li>
                  <li>If Princess Carrot Pop does not show up to the confirm call on time, you will be refund partially.</li>
                  <li>If Princess Carrot Pop does not show up to the confirm call within a buffer time of 5 minutes, you will be refunded fully.</li>
                  <li>If you do to show up to the confirm call within a buffer time of 5 minutes, the session will be canceled and minimum charge will be deducted from your account. Cancel the session 1 day in advance to avoid panelty.</li>
                </ul>
              </div>
            </div>

              
            <div class="flex-1 flex-col p-[1.5rem_1rem] gap-2 bg-gray-950/10 lg:overflow-hidden lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">

              <div 
                v-if="!isTopUpView"
              >
                <div class="flex flex-col gap-6 w-full">
                  <h3 class="text-sm text-[#22CCEE] leading-[20px]">PAYMENT SUMMARY</h3>
                  <div class="flex flex-col gap-3">
                    
                    <div class="flex flex-col gap-2">
                      <h4 class="text-xs leading-[18px] text-[#D0D5DD]">SESSION COST</h4>
                      <div class="flex flex-row justify-between items-center text-white">
                        <p class="text-base font-normal leading-[24px]">{{ sessionDuration }} Minute x 1 session</p>
                        <div class="flex justify-center items-center gap-0.5">
                          <div class="w-4 h-4 flex justify-center items-center"><img src="/images/token.svg" alt="token-icon" /></div>
                          <p class="text-sm leading-[20px]">{{ sessionCost }}</p>
                        </div>
                      </div>
                    </div>
  
                    <div v-if="selectedAddons.length > 0" class="flex flex-col gap-2">
                      <h4 class="text-xs leading-[18px] text-[#D0D5DD]">ADD-ON SERVICE</h4>
                      <div v-for="(addon, index) in selectedAddons" :key="index" class="flex flex-row justify-between items-center text-white">
                        <p class="text-base font-normal leading-[24px]">{{ addon.name }}</p>
                        <div class="flex justify-center items-center gap-0.5">
                          <p class="text-sm leading-[20px]">+</p>
                          <div class="w-4 h-4 flex justify-center items-center"><img src="/images/token.svg" alt="token-icon" /></div>
                          <p class="text-sm leading-[20px]">{{ addon.price }}</p>
                        </div>
                      </div>
                    </div>
  
                    <hr class="border-[#D0D5DD]" />
                    
                    <div class="flex flex-row justify-between items-center text-white">
                      <p class="text-lg font-medium leading-[28px]">TOTAL</p>
                      <div class="flex justify-center items-center gap-0.5">
                        <div class="w-6 h-6 flex justify-center items-center"><img src="/images/token.svg" alt="token-icon" /></div>
                        <p class="text-2xl leading-[32px] font-semibold">{{ totalPrice }}</p>
                      </div>
                    </div>
                  </div>
                </div>
  
                <div class="rounded-[8px] text-white mt-4" style="background-image: url('/images/ex-balance.png'); background-position: right; background-repeat: no-repeat; background-size: 48% 100%; background-color: #FF76DD;">
                  <div class="flex flex-col gap-3 p-2 rounded-[8px]" style="background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%); backdrop-filter: blur(0.5rem);">
                    
                    <div class="flex justify-between items-center">
                      <div class="flex items-center gap-2"><p class="text-sm font-medium leading-[20px]">Wallet Balance</p></div>
                      <div class="flex justify-center items-center gap-0.5">
                        
                        <div v-if="isTopUpNeeded" class="flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#0C111D] border border-[#1D2939]">
                            <span class="text-yellow-300 text-[10px] leading-[10px] relative top-[-2px]">...</span>
                            <p class="text-[10px] font-semibold text-yellow-300 leading-[14px] italic tracking-wider">TOP UP NEEDED</p>                     
                            <div class="w-3 h-3 flex justify-center items-center"><img src="/images/token.svg" alt="token-icon" /></div>
                            <p class="text-[10px] font-bold text-[#FFED29] leading-[14px]">{{ topUpAmount }}</p>
                        </div>
  
                        <div class="w-4 h-4 flex justify-center items-center"><img src="/images/token.svg" alt="token-icon" /></div>
                        <p class="text-base leading-[24px] font-semibold">{{ walletBalance.toLocaleString() }}</p>
                      </div>
                    </div>
  
                    <div class="flex justify-between items-center">
                      <div class="relative flex items-center gap-2">
                        <p class="text-sm font-medium leading-[20px]">Total</p>
                        <div class="w-4 h-4 flex justify-center items-center cursor-pointer relative group">
                          <img src="/images/Help icon.svg" alt="help-icon" />
                          <div class="absolute -top-[122px] left-[20px] hidden group-hover:flex rounded-[8px] w-[242px] z-10" style="box-shadow: 0px 2px 4px -2px #1018280F; box-shadow: 0px 4px 8px -2px #1018281A; backdrop-filter: blur(50px)">
                            <div class="py-2 px-3 rounded-[8px] bg-black/70">
                              <p class="text-xs font-medium leading-[18px]"> This amount will be on hold in your wallet until event start date...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="flex justify-center items-center gap-0.5">
                        <p class="text-lg leading-[20px]">-</p>
                        <div class="w-4 h-4 flex justify-center items-center"><img src="/images/token.svg" alt="token-icon" /></div>
                        <p class="text-base leading-[24px] font-semibold">{{ totalPrice }}</p>
                      </div>
                    </div>
                    <hr class="border-white/20" />
                    <div class="flex justify-between items-center">
                      <div class="flex items-center gap-2"><p class="text-sm font-medium leading-[20px]">Available Balance after booking</p></div>
                      <div class="flex justify-center items-center gap-0.5">
                        <div class="w-4 h-4 flex justify-center items-center"><img src="/images/token.svg" alt="token-icon" /></div>
                        <p class="text-base leading-[24px] font-semibold">{{ remainingBalance.toLocaleString() }}</p>
                      </div>
                    </div>
                  </div>
                </div>
  
                <div class="mt-2">
                  <p class="text-xs text-white font-normal leading-[18px]">Completeing this booking means you agree to the event's booking policy</p>
                </div>
              </div>
  
              <div
             v-else
           >
             <TopUpForm 
               :wallet-balance="walletBalance"
               :top-up-amount="topUpAmount"
               :total-price="totalPrice"
               :remaining-balance="finalBalanceAfterBooking"
               @back="goBackToSummary"
             />
           </div>

            </div>

          </div>


          <div v-if="!isTopUpView" class="flex-none flex w-full justify-end">
            
            <div
              @click="handleButtonClick"
              class="cursor-pointer w-4/5 lg:w-1/2 flex justify-start items-center"
            >
              <div class="relative w-full p-[12px] rounded-br-[20px] flex justify-between items-center
                gap-2 after:content-[''] after:absolute after:right-full after:top-0 after:w-0 
                after:h-0 after:border-t-[3.3125rem] after:border-t-transparent after:border-r-[1rem]
                  after:border-b-0"
                :class="isTopUpNeeded ? 'bg-[#FFED29] after:border-r-[#FFED29]' : 'bg-[#07F468] after:border-r-[#07F468]'">
              <p class="text-lg w-full leading-[28px] text-black text-center font-medium">{{ isTopUpNeeded ? 'GO TO TOP UP' : 'COMPLETE BOOKING' }}</p>
              <div class="w-6 h-6 flex justify-center items-center">
                <img src="/images/arrow-right.svg" alt="arrow-right-icon" />
              </div>
            </div>
            </div>

          </div>

          <div
            v-if="isTopUpView"
            class="self-stretch bg-black/75 inline-flex lg:flex-row justify-center items-center "
          >
            <div
              class="flex-1 pl-4 pr-2 flex justify-center items-center gap-2.5"
            >
              <div
                class="flex-1 justify-center text-white text-xs font-normal  leading-4"
              >
                Completing this booking means you agree to the event’s booking
                policy
              </div>
            </div>
            
            <div
              @click="finalizeBooking"
              class="cursor-pointer shadow-[0px_0px_16px_0px_rgba(7,244,104,1.00)] flex justify-start items-center"
            >
              <div class="relative w-full p-[12px] rounded-br-[20px] flex justify-center items-center gap-2 bg-[#07F468] after:content-[''] after:absolute after:right-full after:top-0 after:w-0 after:h-0 after:border-t-[3.3125rem] after:border-t-transparent after:border-r-[1rem] after:border-r-[#07F468] after:border-b-0">
              <p class="text-lg leading-[28px] text-black text-center font-medium">TOP UP & COMPLETE BOOKING</p>
              <div class="w-6 h-6 flex justify-center items-center">
                <img src="/images/arrow-right.svg" alt="arrow-right-icon" />
              </div>
            </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  
</template>