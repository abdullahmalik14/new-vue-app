<template>
  <section class="flex flex-col gap-4 px-2 py-4 bg-white/25 backdrop-blur-[25px] md:gap-6 md:p-4 dark:bg-[#181a1b40]">
    <h2 class="text-xl leading-normal font-semibold text-[#667085] md:text-2xl dark:text-[#9e9689]">
      Publish Setting
    </h2>

    <p class="text-base text-[#0C111D] dark:text-[#dbd8d3]">
      You can make this subscription tier more exclusive by limiting its availability on your profile. Schedule your time below and we will post your subscripciton tier on your profile accordingly.
    </p>

    <div class="flex flex-col gap-4">
      
      <div class="relative w-full h-10 sm:hidden">
        <div 
          class="cursor-pointer group/dropdown" 
          @click.stop="showMobileDropdown = !showMobileDropdown"
        >
          <div class="flex justify-center items-center gap-1.5 h-10 px-3.5 rounded-lg backdrop-blur-[25px] bg-[#0C111D] dark:bg-[#dbd8d3]">
            <img 
              :src="getCurrentIcon(publishFlow.substep)" 
              alt="icon" 
              class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(32%)_saturate(1007%)_hue-rotate(169deg)_brightness(109%)_contrast(100%)]"
            />
            <span class="text-sm font-semibold text-white dark:text-[#e8e6e3]">
              {{ getCurrentLabel(publishFlow.substep) }}
            </span>
            <img 
              src="https://i.ibb.co.com/pvr0N8B0/chevron-down.webp" 
              alt="chevron down" 
              class="select-arrow w-5 h-5 transition-transform duration-300 ease-in-out transform"
              :class="showMobileDropdown ? 'rotate-180' : ''"
            />
          </div>

          <div 
            v-if="showMobileDropdown" 
            class="absolute w-full transition-all duration-300 z-10 top-[calc(100%+0.5rem)] shadow-none border-none"
          >
            <div class="p-1 rounded-lg bg-white/50 backdrop-blur-[12.5px] max-h-[200px] overflow-y-auto shadow-[0px_-2px_4px_0px_#0000001A] dark:bg-[#181a1b]/50">
              
              <div 
                @click.stop="handleSubstep('publish-immediately')"
                class="dash-option flex justify-center items-center gap-2 px-2.5 h-10 rounded-md hover:bg-[#EAECF0] dark:hover:bg-[#222526]"
                :class="publishFlow.substep === 'publish-immediately' ? 'hidden bg-[#EAECF0] dark:bg-[#222526]' : ''"
              >
                <img 
                  src="https://i.ibb.co.com/YTZ7WYpZ/upload.webp" 
                  alt="upload" 
                  class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(23%)_sepia(18%)_saturate(885%)_hue-rotate(179deg)_brightness(92%)_contrast(91%)]"
                />
                <span class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">
                  Publish immediately
                </span>
              </div>

              <div 
                @click.stop="handleSubstep('schedule-publish-time')"
                class="flex justify-center items-center gap-2 px-2.5 h-10 rounded-md hover:bg-[#EAECF0] dark:hover:bg-[#222526]"
                :class="publishFlow.substep === 'schedule-publish-time' ? 'hidden bg-[#EAECF0] dark:bg-[#222526]' : ''"
              >
                <img 
                  src="https://i.ibb.co.com/VW1DtcdC/Time-1.webp" 
                  alt="Time" 
                  class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(23%)_sepia(18%)_saturate(885%)_hue-rotate(179deg)_brightness(92%)_contrast(91%)]"
                />
                <span class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">
                  Schedule a publish time
                </span>
              </div>

            </div>
          </div>
        </div>

        <select class="dash-real-select hidden" name="dash-select" :value="publishFlow.substep">
          <option value="schedule-publish-time">Schedule a publish time</option>
          <option value="publish-immediately">Publish immediately</option>
        </select>
      </div>

      <ul class="hidden sm:flex w-full h-10 whitespace-nowrap rounded-[0.3125rem] overflow-hidden border border-[#D0D5DD] bg-[#F9FAFB] dark:border-[#3b4043] dark:bg-[#1b1d1e]">
        
        <li 
          @click="handleSubstep('publish-immediately')"
          class="flex flex-1 justify-center items-center gap-2 border-r border-[#D0D5DD] cursor-pointer group/tab dark:border-[#3b4043]"
          :class="publishFlow.substep === 'publish-immediately' ? 'bg-[#0C111D] dark:bg-[#162036] active' : ''"
        >
          <div class="w-full flex justify-center items-center gap-2 px-4">
            <img 
              src="https://i.ibb.co.com/YTZ7WYpZ/upload.webp" 
              alt="upload" 
              class="w-5 h-5"
              :class="publishFlow.substep === 'publish-immediately' ? '[filter:brightness(0)_saturate(100%)_invert(100%)_sepia(32%)_saturate(1007%)_hue-rotate(169deg)_brightness(109%)_contrast(100%)]' : '[filter:brightness(0)_saturate(100%)_invert(65%)_sepia(5%)_saturate(982%)_hue-rotate(179deg)_brightness(101%)_contrast(84%)]'"
            />
            <span 
              class="text-sm font-medium whitespace-nowrap"
              :class="publishFlow.substep === 'publish-immediately' ? 'text-white font-semibold' : 'text-[#98A2B3] dark:text-[#b0a99e]'"
            >
              Publish immediately
            </span>
          </div>
        </li>

        <li 
          @click="handleSubstep('schedule-publish-time')"
          class="flex flex-1 justify-center items-center gap-2 cursor-pointer group/tab"
          :class="publishFlow.substep === 'schedule-publish-time' ? 'bg-[#0C111D] dark:bg-[#162036] active' : ''"
        >
          <div class="w-full flex justify-center items-center gap-2 px-4">
            <img 
              src="https://i.ibb.co.com/VW1DtcdC/Time-1.webp" 
              alt="Time" 
              class="w-5 h-5"
              :class="publishFlow.substep === 'schedule-publish-time' ? '[filter:brightness(0)_saturate(100%)_invert(100%)_sepia(32%)_saturate(1007%)_hue-rotate(169deg)_brightness(109%)_contrast(100%)]' : '[filter:brightness(0)_saturate(100%)_invert(65%)_sepia(5%)_saturate(982%)_hue-rotate(179deg)_brightness(101%)_contrast(84%)]'"
            />
            <span 
              class="text-sm font-medium whitespace-nowrap"
              :class="publishFlow.substep === 'schedule-publish-time' ? 'text-white font-semibold' : 'text-[#98A2B3] dark:text-[#b0a99e]'"
            >
              Schedule a publish time
            </span>
          </div>
        </li>
      </ul>

      <div v-if="publishFlow.substep === 'publish-immediately'" class="flex flex-col gap-6">
          <p class="text-base text-[#0C111D] dark:text-[#dbd8d3]">
            This Tier will be available immediately on your profile after publishing.
          </p>
      </div>
      
      <div v-else-if="publishFlow.substep === 'schedule-publish-time'" class="flex flex-col gap-6">
          <h3 class="text-base font-bold text-[#667085] dark:text-[#9e9689]">
            Please specify your publishing period here:
          </h3>

          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <h4 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">
                Publish Date
              </h4>
              <div class="h-11 flex items-center bg-white/50 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b80] dark:border-[#3b4043]">
                <div class="flex items-center gap-2 px-3 w-full min-w-0">
                  <img src="https://i.ibb.co.com/zWDYxDdt/calendar-01.webp" alt="calendar 01" class="w-5 h-5"/>
                  <input 
                    v-model="publishFlow.state.publishDate"
                    type="text" 
                    placeholder="Select date and time" 
                    class="text-base bg-transparent border-none outline-none w-full min-w-0 text-[#0C111D] placeholder:text-[#667085] dark:text-[#dbd8d3] dark:placeholder:text-[#9e9689]"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <h4 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">
                End Date <span class="text-xs  leading-normal font-normal italic text-[#344054] dark:text-[#bdb8af]">optional</span>
              </h4>
              <div class="h-11 flex items-center bg-white/50 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b80] dark:border-[#3b4043]">
                <div class="flex items-center gap-2 px-3 w-full min-w-0">
                  <img src="https://i.ibb.co.com/zWDYxDdt/calendar-01.webp" alt="calendar 01" class="w-5 h-5"/>
                  <input 
                    v-model="publishFlow.state.publishEndDate"
                    type="text" 
                    placeholder="Select date and time" 
                    class="text-base bg-transparent border-none outline-none w-full min-w-0 text-[#0C111D] placeholder:text-[#667085] dark:text-[#dbd8d3] dark:placeholder:text-[#9e9689]"
                  />
                </div>
              </div>
            </div>
          </div>
      </div>

    </div> 
  </section>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  publishFlow: {
    type: Object,
    required: true,
  },
});

const showMobileDropdown = ref(false);

// --- Methods to handle logic ---

function handleSubstep(val) {
  props.publishFlow.goToSubstep(val);
  showMobileDropdown.value = false;
  
  // Optional: Global class for styling hooks if needed (like original script did)
  if (val === 'schedule-publish-time') {
    document.body.classList.add('schedule-publish-time');
  } else {
    document.body.classList.remove('schedule-publish-time');
  }
}

// Helpers for Mobile Dropdown Display
function getCurrentLabel(substep) {
  if (substep === 'schedule-publish-time') return 'Schedule a publish time';
  return 'Publish immediately';
}

function getCurrentIcon(substep) {
  if (substep === 'schedule-publish-time') return 'https://i.ibb.co.com/VW1DtcdC/Time-1.webp';
  return 'https://i.ibb.co.com/YTZ7WYpZ/upload.webp';
}
</script>