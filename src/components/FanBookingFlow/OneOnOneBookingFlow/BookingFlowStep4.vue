<script setup>
import { computed } from 'vue';

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

// --- COMPUTED PROPERTIES FOR DISPLAY ---
const formattedDate = computed(() => bookingData.value.headerDateDisplay || 'Tomorrow April 27, 2025');
const timeRange = computed(() => bookingData.value.formattedTimeRange || '4:00pm-4:15pm');
const duration = computed(() => bookingData.value.selectedDuration?.value || '15');

const emit = defineEmits(['close-popup']);
</script>

<template>
<div class="flex-1 w-96 h-[556px] max-h-full rounded-[10px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ">

    <div class="bg-[linear-gradient(180deg,rgba(12,17,29,0)_25%,#0C111D_100%),url('/images/background.png')] bg-center bg-cover bg-no-repeat backdrop-blur-[1rem]">

        <div class="p-6 bg-[#00000080] backdrop-blur-[10px] flex flex-col justify-center items-center gap-6">
          <div class="flex flex-col justify-center items-center gap-6">
            <img class="w-36 h-36" src="/images/pending.svg" />
            <div class="flex flex-col justify-start items-start gap-2">
              <div class="text-center justify-center text-white text-2xl font-semibold leading-8">Booking request sent to Princess Carrot Pop !</div>
              <div class="text-center justify-center text-white text-base font-normal leading-6">Sit tight - your request is pending approval from @Jennyhunny.</div>
            </div>
          </div>
        </div>
    
        <div class="w-full p-4 bg-cyan-400/20 rounded-bl-[10px] rounded-br-[10px] backdrop-blur-[5px] flex flex-col justify-between items-start">
          <div class="flex flex-col justify-start items-center gap-2 w-full">
            <div class="flex flex-col justify-start items-center gap-4">
              <div class="flex flex-col justify-start items-center gap-2 w-full">
                <div class="inline-flex justify-center items-center gap-2">
                  <img class="w-8 h-8" src="/images/ex-profile.png" />
                  <div class="flex justify-start items-center gap-1">
                    <div class="justify-start text-white text-sm font-medium leading-5 line-clamp-1">Princess Carrot Pop</div>
                    <div data-size="sm" class="w-3 h-3 relative overflow-hidden">
                      <img src="/images/verified-blue-white.svg" alt="">
                    </div>
                  </div>
                </div>
                <div class="w-full flex flex-col gap-5">
                  <div class="text-center w-full text-gray-100 text-2xl font-semibold leading-9">High School Life Simulator</div>
                  <div class="flex flex-col justify-center items-center">
                    <div class="justify-center text-white text-2xl font-medium leading-8">
                      {{ formattedDate }}
                    </div>
                    <div class="inline-flex justify-start items-start gap-2">
                      <div class="justify-center text-white text-2xl font-medium leading-8">
                        {{ timeRange }}
                      </div>
                      <div class="justify-end text-gray-400 text-lg font-normal leading-7">
                        {{ duration }} min.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="w-full flex flex-col justify-start items-center gap-2 mt-[50px]">
            <div class="self-stretch h-10 min-w-24 pl-2 pr-6 py-2 bg-gray-900 inline-flex justify-center items-center gap-2 cursor-pointer">
              <div class="w-6 h-6 relative overflow-hidden">
                <img src="/images/message-green.svg" alt="message-icon" />        
              </div>
              <div class="text-center justify-start text-green-500 text-base font-medium leading-6">Message Princess Carrot Pop</div>
            </div>
          </div>
        </div>
    </div>


    <div 
      @click="emit('close-popup')" 
      class="absolute -top-4 -right-3 z-99 p-[8px] flex justify-center items-center bg-black/30 rounded-[50px] backdrop-blur-[10px] cursor-pointer"
    >
      <img src="/images/cross-white.svg" alt="cross-white" class="w-4 h-4" />
    </div>

  </div>
</template>