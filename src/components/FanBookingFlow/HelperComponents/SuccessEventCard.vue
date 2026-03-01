<script setup>
defineProps({
  // --- Header Content ---
  successIcon: { type: String, default: '/images/success.svg' },
  headingText: { type: String, default: "You’re in !" },
  subHeadingText: { type: String, default: "Get ready for your session!" },

  // --- Event Info Props ---
  eventTitle: { type: String, default: "J&B’s Cooking show" },
  eventDate: { type: String, default: "Wednesday, August 24, 2025" },
  eventTime: { type: String, default: "9:30pm-10:30pm" },

  // --- Action Buttons Configuration ---
  buttons: {
    type: Array,
    default: () => []
  },

  // --- Crowd Funding Logic ---
  isCrowdFunding: {
    type: Boolean,
    default: false
  },
  currentTokens: { type: String, default: '1,200' },
  totalTokens: { type: String, default: '8,000' },
  progressPercent: { type: Number, default: 15 } // e.g. 15 for 15%
});

const emit = defineEmits(['close']);
</script>

<template>
  <div class="relative w-96 h-full">
    
    <div class="w-full h-full min-h-0 rounded-[10px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div class="bg-[linear-gradient(180deg,rgba(12,17,29,0)_25%,#0C111D_100%),url('/images/ai-art.png')] bg-center bg-cover bg-no-repeat backdrop-blur-[1rem] min-h-full flex flex-col">

        <div class="p-6 bg-[#00000080] backdrop-blur-[10px] flex flex-col justify-center items-center gap-6">
          <div class="flex flex-col justify-center items-center gap-6">
            <img class="w-36 h-36" :src="successIcon" alt="status-icon" />
            <div class="flex flex-col justify-center items-start gap-2">
              <div class="text-center w-full justify-center text-white text-2xl font-semibold leading-8">
                {{ headingText }}
              </div>
              <div class="text-center w-full justify-center text-white text-base font-normal leading-6">
                {{ subHeadingText }}
              </div>
            </div>
          </div>
        </div>
    
        <div class="w-full p-4 bg-[#FF006633] rounded-bl-[10px] rounded-br-[10px] backdrop-blur-[5px] flex flex-col justify-center flex-1">
          
          <div class="gap-4 flex flex-col justify-center w-full">
              <h3 class="font-semibold text-center text-[#F2F4F7] text-lg sm:text-xl lg:text-2xl leading-8">
                {{ eventTitle }}
              </h3>
              
              <div class="flex flex-col justify-center gap-[4px]">
                <div class="flex gap-[6px] justify-center text-white">
                  <div class="w-6 h-6">
                    <img class="w-full h-full rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%]" src="/images/ex-profile.png" alt="" />
                  </div>
                  <div class="flex md:gap-[6px] gap-1 items-center font-normal">
                    <p class="text-white text-xs lg:text-base leading-6">Princess Carrot Pop</p>
                    <p class="px-[6px] bg-[#FF0066] font-medium text-xs lg:text-sm rounded-[50px]">Host</p>
                    <img src="/images/verified-blue-white.svg" alt="" />
                    <p>,</p>
                  </div>
                </div>
                
                <div class="flex flex-row justify-center gap-2 lg:gap-[6px] text-white">
                  <div class="w-6 h-6"><img class="w-full h-full rounded-[50%]" src="/images/ex-profile.png" alt="" /></div>
                  <div class="flex gap-[6px] items-center font-normal">
                    <p class="text-white text-xs lg:text-base leading-6">De La Queen</p>
                    <img src="/images/verified-blue-white.svg" alt="" />
                    <p>,</p>
                    <div class="w-6 h-6"><img class="w-full h-full rounded-[50%]" src="/images/ex-profile.png" alt="" /></div>
                    <div class="flex gap-[6px] items-center font-normal">
                      <p class="text-white text-xs lg:text-base leading-6">Buff Bunny</p>
                      <img src="/images/verified-blue-white.svg" alt="" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col w-full gap-1 justify-center">
                <div class="lg:text-xl text-sm text-center font-semibold lg:font-medium text-white">{{ eventDate }}</div>
                <div class="lg:text-xl text-sm text-center font-medium text-white">{{ eventTime }}</div>
              </div>
          </div>

          <div v-if="isCrowdFunding" class="flex flex-col justify-center items-start gap-1.5 w-full mt-4">
            <div class="flex flex-col gap-1.5 w-full">
              <div class="w-full h-2 rounded-[5px] bg-white/20">
                <div 
                  class="h-full rounded-[5px] bg-[#FFED29]" 
                  :style="{ width: progressPercent + '%' }"
                ></div>
              </div>
            </div>
            <div class="inline-flex w-full justify-between items-start">
              <div class="text-right justify-center text-yellow-300 text-xs font-medium font-['Poppins'] leading-4">
                {{ currentTokens }}/{{ totalTokens }} Tokens
              </div>
              <div class="text-right justify-center text-white text-xs font-medium font-['Poppins'] leading-4">
                {{ progressPercent }}% event goal reached
              </div>
            </div>
          </div>

          <div 
            class="w-full flex flex-col justify-start items-center gap-2"
            :class="isCrowdFunding ? 'mt-[20px]' : 'mt-[80px]'"
          >
            
            <div 
              v-for="(btn, index) in buttons" 
              :key="index"
              @click="btn.action && btn.action()"
              class="w-full flex justify-center items-center gap-2 p-2 cursor-pointer transition-colors"
              :class="btn.bgColor || 'bg-gray-900'"
            >
                <div class="w-6 h-6 flex justify-center items-center relative overflow-hidden">
                  <img :src="btn.icon" alt="icon" />
                </div>
                <p 
                  class="text-base leading-6 font-medium"
                  :class="btn.textColor || 'text-white'"
                >
                  {{ btn.text }}
                </p>
            </div>

          </div>
        </div>
      </div>
    </div>

    <div 
      @click="emit('close')" 
      class="absolute top-4 right-4 z-50 p-[8px] flex justify-center items-center bg-black/30 rounded-[50px] backdrop-blur-[10px] cursor-pointer hover:bg-black/50 transition-all"
    >
      <img src="/images/cross-white.svg" alt="cross-white" class="w-4 h-4" />
    </div>

  </div>
</template>