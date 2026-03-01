<script setup>
defineProps({
  // --- Data Props ---
  eventTitle: { type: String, default: "J&B’s Cooking show" },
  eventDate: { type: String, default: "Wednesday, August 24, 2025" },
  eventTime: { type: String, default: "9:30pm-10:30pm" },

  // --- Wallet & Calculation Props ---
  walletBalance: { type: Number, required: true },
  contributionAmount: { type: Number, required: true }, // or Price
  isTopUpNeeded: { type: Boolean, required: true },
  topUpAmount: { type: Number, default: 0 },
  remainingBalance: { type: Number, required: true },

  // --- View State ---
  isTopUpView: { type: Boolean, default: false },

  // --- Feature Flags ---
  isCrowdFunding: { type: Boolean, default: false } // Controls the extra slot in left column
});

const emit = defineEmits(['back', 'close', 'btn-click', 'finalize-topup']);
</script>

<template>
  <div
    class="w-full max-w-[1024px] min-h-0 rounded-3xl bg-[url('/images/ai-art.png')] bg-cover 
    bg-no-repeat bg-[left_50%_center] h-full overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">

    <div class="backdrop-blur-[10px] rounded-20 bg-[#0c111d33] h-full">
      <div class="rounded-20 bg-black/50 flex flex-col lg:flex-row relative h-full">

        <div
          class="flex flex-col gap-4 lg:gap-6 lg:rounded-tl-20 lg:rounded-bl-20 lg:w-[400px] pt-12 pb-4 px-4 bg-[linear-gradient(0deg,rgba(12,17,29,0.2),rgba(12,17,29,0.2)),linear-gradient(0deg,rgba(255,0,102,0.2),rgba(255,0,102,0.2))] self-stretch">

          <div class="flex h-auto lg:h-[269px] flex-col gap-2 md:gap-3">
            <div class="flex items-center justify-between">
              <div class="absolute top-0 left-0">
                <p
                  class="text-sm bg-[#FF0066] rounded-tl-20 rounded-br-4 leading-5 font-bold py-2 pr-[6px] pl-4 text-white">
                  Group event
                </p>
              </div>
              <div @click="emit('close')" class="absolute lg:hidden h-10 w-10 p-2 top-0 right-0 cursor-pointer">
                <img src="/images/cross-white.svg" alt="">
              </div>
            </div>

            <div class="container gap-4 flex flex-col">
              <h3 class="font-semibold text-[#F2F4F7] text-lg sm:text-xl lg:text-2xl leading-8">
                {{ eventTitle }}
              </h3>

              <div class="flex flex-col sm:flex-row lg:flex-col gap-[4px]">
                <div class="flex gap-[6px] text-white">
                  <div class="w-6 h-6">
                    <img class="w-full h-full rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%]" src="/images/ex-profile.png"
                      alt="" />
                  </div>
                  <div class="flex md:gap-[6px] gap-1 items-center font-normal">
                    <p class="text-white text-xs lg:text-base leading-6">Princess Carrot Pop</p>
                    <p class="px-[6px] bg-[#FF0066] font-medium text-xs lg:text-sm rounded-[50px]">Host</p>
                    <img src="/images/verified-blue-white.svg" alt="" />
                    <p>,</p>
                  </div>
                </div>
                <div class="flex flex-row gap-2 lg:gap-[6px] text-white">
                  <div class="w-6 h-6"><img class="w-full h-full rounded-[50%]" src="/images/ex-profile.png" alt="" />
                  </div>
                  <div class="flex gap-[6px] items-center font-normal">
                    <p class="text-white text-xs lg:text-base leading-6">De La Queen</p>
                    <img src="/images/verified-blue-white.svg" alt="" />
                    <p>,</p>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <div class="lg:text-xl text-sm font-semibold lg:font-medium text-white">{{ eventDate }}</div>
                <div class="lg:text-xl text-sm font-medium text-white">{{ eventTime }}</div>
              </div>

              <div v-if="isCrowdFunding" class="w-full">
                <slot name="crowd-progress"></slot>
              </div>

            </div>
          </div>

          <div class="flex flex-col w-full lg:w-[368px] gap-3">
            <div class="flex gap-2">
              <h3 class="text-sm text-[#EAECF0]">Event Policy</h3>
              <img class="lg:hidden" src="/images/double-down.svg" alt="" />
            </div>
            <ul class="list-disc pl-6 text-sm text-[#EAECF0] w-full list-outside leading-5">
              <li>Your contributions will be on hold in your balance until the call starts.</li>
              <li>If the host (Princess Carrot Pop) does not show up to the event within a buffer time of 5 minutes, the
                event will be canceled and you will be refunded fully.</li>
              <li>If less than half of the co-performer show up to the event within a buffer time of 5 minutes, the
                event will be canceled and you will be refunded fully.</li>
            </ul>
          </div>
        </div>

        <div class="flex flex-col pt-6 px-4 gap-4 lg:w-[624px] h-full relative backdrop-blur-[10px]">

          <div v-if="!isTopUpView" class="flex flex-col gap-5 md:gap-6 w-full h-full">
            <div class="flex gap-[2px] items-center cursor-pointer" @click="emit('back')">
              <img src="/images/arrow-left.svg" alt="" />
              <h3 class="text-white leading-6">Back</h3>
            </div>

            <slot name="main-form"></slot>

            <div
              class="rounded-lg bg-[#FF76DD] text-white bg-[url('/images/ex-balance.png')] bg-no-repeat bg-right bg-[length:48%_100%]">
              <div
                class="flex flex-col gap-3 p-4 rounded-lg backdrop-blur-md bg-[linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)),linear-gradient(90deg,rgba(0,0,0,0)0%,rgba(0,0,0,0.5)100%)]">
                <div class="flex justify-between items-center">
                  <p class="leading-6">Wallet Balance</p>
                  <div class="flex items-center gap-2">
                    <div v-if="isTopUpNeeded"
                      class="flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#0C111D] border border-[#1D2939]">
                      <span class="text-yellow-300 text-[10px] leading-[10px] relative top-[-2px]">...</span>
                      <p class="text-[10px] font-semibold text-yellow-300 leading-[14px] italic tracking-wider">TOP UP
                        NEEDED</p>
                    </div>
                    <img src="/images/token.svg" alt="token-icon" class="w-6 h-6" />
                    <p class="font-semibold">{{ walletBalance.toLocaleString() }}</p>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <p>Your Contribution</p>
                    <img src="/images/help-green.svg" alt="help-icon" class="w-4 h-4" />
                  </div>
                  <div class="flex items-center gap-2">
                    <p class="text-lg">-</p>
                    <img src="/images/token.svg" alt="token-icon" class="w-6 h-6" />
                    <p>{{ contributionAmount.toLocaleString() }}</p>
                  </div>
                </div>

                <hr class="opacity-30" v-if="!isTopUpNeeded" />

                <div v-if="!isTopUpNeeded" class="flex justify-between items-center">
                  <p class="text-sm lg:text-base font-semibold">Available Balance After Booking</p>
                  <div class="flex items-center gap-2">
                    <img src="/images/token.svg" alt="token-icon" class="w-6 h-6" />
                    <p class="lg:text-2xl text-xl font-semibold">{{ remainingBalance.toLocaleString() }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="w-full h-full flex flex-col mb-20">
            <slot name="topup-form"></slot>
          </div>



          <div class="flex justify-end absolute bottom-0 right-0 w-full">


            <div class=" bg-black/55 pl-4 pr-2 flex justify-center items-center gap-2.5">
              <div class="justify-center text-white text-xs font-normal leading-4">Completeing this booking means you
                agree to the event policy</div>
            </div>

            <div v-if="!isTopUpView" @click="emit('btn-click')"
              class="cursor-pointer w-4/5 lg:w-1/2 flex justify-start items-center">
              <div class="relative w-full p-[12px] rounded-br-[20px] flex justify-center items-center
                gap-2 after:content-[''] after:absolute after:right-full after:top-0 after:w-0 
                after:h-0 after:border-t-[3.3125rem] after:border-t-transparent after:border-r-[1rem]
                  after:border-b-0"
                :class="isTopUpNeeded ? 'bg-[#FFED29] after:border-r-[#FFED29]' : 'bg-[#07F468] after:border-r-[#07F468]'">
                <p class="text-lg w-max leading-[28px] text-black text-center font-medium">{{ isTopUpNeeded ? 'GO TO TOP UP' : 'COMPLETE BOOKING' }}</p>
                <div class="w-6 h-6 flex justify-center items-center">
                  <img src="/images/arrow-right.svg" alt="arrow-right-icon" />
                </div>
              </div>
            </div>

            <div v-if="isTopUpView" @click="emit('finalize-topup')"
              class="cursor-pointer w-4/5 lg:w-1/2 flex justify-start items-center ">
              <div class="relative w-full p-[12px] rounded-br-[20px] flex justify-center items-center
                gap-2 after:content-[''] after:absolute after:right-full after:top-0 after:w-0 
                after:h-0 after:border-t-[3.3125rem] after:border-t-transparent after:border-r-[1rem]
                  after:border-b-0 bg-[#07F468] after:border-r-[#07F468]">
                <p class="text-sm w-max leading-[28px] text-black text-center font-medium">TOP UP &COMPLETE BOOKING</p>
                <div class="w-6 h-6 flex justify-center items-center">
                  <img src="/images/arrow-right.svg" alt="arrow-right-icon" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>